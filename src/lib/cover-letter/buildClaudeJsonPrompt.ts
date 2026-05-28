import type { Site } from "@/lib/siteSchema";
import { COVER_LETTER_CONTENT_SCHEMA_DESCRIPTION } from "./coverLetterContentSchema";
import type { EvidencePackItem } from "./rag/types";
import { buildNarrativeGuidelines } from "./rhetoric/buildNarrativeGuidelines";
import type { RhetoricalPlan } from "./rhetoric/types";
import type { CoverLetterPromptRequest, EvidenceItem, ExtractedKeywords } from "./types";
import { getLang } from "./utils";

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Formal register. No contractions. Measured confidence.",
  direct:
    "Lead with your strongest point immediately. Skip warm-up sentences. Short, declarative paragraphs.",
  warm: "Slightly personal tone. Reference something specific about the company's work. Still concise and grounded.",
  modern: "Conversational-professional. Contractions are fine. Less stiff than traditional formal.",
};

function trimJobDescription(jd: string, maxLength = 1800): string {
  if (jd.length <= maxLength) return jd;
  return `${jd.slice(0, maxLength)}\n[truncated]`;
}

function buildEvidenceBlock(evidence: EvidenceItem[]): string {
  if (evidence.length === 0) return "No strong evidence matches available.";

  const sorted = [...evidence].sort((a, b) => {
    if (a.type === "experience" && b.type !== "experience") return -1;
    if (b.type === "experience" && a.type !== "experience") return 1;
    return 0;
  });

  return sorted
    .slice(0, 4)
    .map((item, i) => {
      const content = item.content
        .replace(/\*\*/g, "")
        .split("\n")
        .map((l) => `    ${l}`)
        .join("\n");
      return `[${i + 1}] ${item.title}\n${content}`;
    })
    .join("\n\n");
}

function buildEvidencePackBlock(pack: EvidencePackItem[]): string {
  if (pack.length === 0) return "No evidence available.";

  const sorted = [...pack].sort((a, b) => {
    if (a.type === "experience" && b.type !== "experience") return -1;
    if (b.type === "experience" && a.type !== "experience") return 1;
    return b.score - a.score;
  });

  return sorted
    .map((item, i) => {
      const content = item.content
        .replace(/\*\*/g, "")
        .split("\n")
        .map((l) => `    ${l}`)
        .join("\n");
      const keywords =
        item.matchedKeywords.length > 0 ? ` [${item.matchedKeywords.join(", ")}]` : "";
      return `[${i + 1}] ${item.title}${keywords}\n${content}`;
    })
    .join("\n\n");
}

function buildCandidateSnapshot(site: Site): string {
  const h = site.heading;
  const header = [
    h.name,
    getLang(h.headline),
    h.years_of_experience ? `${h.years_of_experience} yrs experience` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const contact = [
    h.email ? `Email: ${h.email}` : null,
    h.phone ? `Phone: ${h.phone}` : null,
    h.website ? `Website: ${h.website}` : null,
    h.linkedin ? `LinkedIn: ${h.linkedin}` : null,
    h.github ? `GitHub: ${h.github}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const recentRoles = site.experience
    .slice(0, 3)
    .map((exp) => `  ${getLang(exp.title)} @ ${exp.company} (${exp.duration})`);

  return [header, contact, recentRoles.length ? `Recent roles:\n${recentRoles.join("\n")}` : null]
    .filter(Boolean)
    .join("\n");
}

function buildRhetoricalPlanBlock(plan: RhetoricalPlan): string {
  const goalLines = plan.paragraphGoals
    .map((pg) => {
      const refs = pg.evidenceIds.length > 0 ? `; draw from: ${pg.evidenceIds.join(", ")}` : "";
      return `  Para ${pg.paragraph}: ${pg.goal} (emphasis: ${pg.emphasis}${refs})`;
    })
    .join("\n");

  const lines = [
    `Core narrative: ${plan.coreNarrative}`,
    `Primary strength: ${plan.primaryStrength}`,
    plan.secondaryStrength ? `Secondary strength: ${plan.secondaryStrength}` : null,
    `Company alignment: ${plan.companyAlignment}`,
    "",
    "Paragraph guidance:",
    goalLines,
  ];

  return lines.filter((l) => l !== null).join("\n");
}

export function buildClaudeJsonPrompt(
  req: CoverLetterPromptRequest,
  site: Site,
  keywords: ExtractedKeywords,
  evidence: EvidenceItem[],
  evidencePack?: EvidencePackItem[],
  rhetoricalPlan?: RhetoricalPlan,
): string {
  const { jobDescription, language, companyName, jobTitle, recruiterName, tone } = req;
  const outputLanguage = language === "de" ? "German (Deutsch)" : "English";
  const toneNote = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.professional;

  const activeEvidence = evidencePack && evidencePack.length > 0 ? evidencePack : null;
  const allMatchedKeywords = activeEvidence
    ? new Set(activeEvidence.flatMap((e) => e.matchedKeywords))
    : new Set(evidence.flatMap((e) => e.matchedKeywords));
  const unmatchedSkills = keywords.hardSkills.filter((kw) => !allMatchedKeywords.has(kw));

  const narrativeGuidelines = rhetoricalPlan ? buildNarrativeGuidelines(rhetoricalPlan) : null;

  const sections: string[] = [
    `=== TASK ===
Write a cover letter. Output language: ${outputLanguage}
Tone guidance: ${toneNote}
Use retrieved candidate evidence as the primary factual basis for the cover letter.
Do not invent unsupported technologies, employers, responsibilities, or achievements.
Prioritize narrative clarity over exhaustive technical detail. Use only the strongest supporting evidence.
Avoid sounding keyword-optimized or AI-generated. Do not stack technologies unnaturally.`,

    `=== ROLE ===
Company: ${companyName || "(not specified)"}
Title: ${jobTitle || "(not specified)"}
Contact: ${recruiterName || "(not specified)"}`,

    `=== JOB DESCRIPTION ===
Read this to understand what the role actually needs. Do not attempt to address every bullet point.

${trimJobDescription(jobDescription)}`,

    `=== CANDIDATE ===
${buildCandidateSnapshot(site)}`,

    `=== STRONGEST FITS ===
Base the letter on these experiences. Do not reference experience not listed here.

${activeEvidence ? buildEvidencePackBlock(activeEvidence) : buildEvidenceBlock(evidence)}`,

    rhetoricalPlan
      ? `=== RHETORICAL PLAN ===
${buildRhetoricalPlanBlock(rhetoricalPlan)}`
      : "",

    narrativeGuidelines
      ? `=== WRITING GUIDELINES ===
${narrativeGuidelines.map((g) => `- ${g}`).join("\n")}`
      : "",

    unmatchedSkills.length > 0
      ? `=== SKILLS NOTE ===
The job mentions ${unmatchedSkills.slice(0, 4).join(", ")} — not explicitly in the candidate profile. Do not claim hands-on experience with these. A brief honest mention of adapting to new stacks is acceptable if natural.`
      : "",

    language === "de" || keywords.languages.includes("German")
      ? `=== LANGUAGE NOTE ===
Candidate's German is conversational/intermediate. Do not overstate fluency. Mention it briefly and honestly if relevant.`
      : "",

    `=== OUTPUT ===
Return ONLY a single valid JSON object. The entire response must be parseable by JSON.parse().
No Markdown. No code fences. No explanations. No text outside the JSON.

Schema:
${COVER_LETTER_CONTENT_SCHEMA_DESCRIPTION}

Rules:
- Language: ${outputLanguage}
- Write 3 paragraphs. Use a 4th only if a genuine additional point adds real value. Never 5.
- Each paragraph: 40–900 characters
- Evidence density: do not reference more than 2 evidence examples per paragraph
- Do not stack more than 3 technologies in a single sentence
- Narrative arc:
    1. Show you understand what this role needs — a concrete observation, not a self-introduction
    2. Your strongest relevant outcome from the Strongest Fits section — lead with what changed, not what you did
    3. Why this specific company/role in specific terms, followed by a direct availability statement
- Opening must NOT start with "I am applying", "My name is", or any enthusiasm phrase
- Closing must be specific to this role — not a generic placeholder
- Use ONLY facts from the Candidate and Strongest Fits sections
- Do NOT invent experience, employers, dates, achievements, degrees, or skills
- "recipient" is always required; omit sub-fields if unknown
- "addressLines": omit if address is not known
- "salutation" and "closing" must match the output language conventions`,
  ];

  return sections.filter(Boolean).join("\n\n");
}
