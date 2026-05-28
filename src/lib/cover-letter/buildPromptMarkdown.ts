import type { Site } from "@/lib/siteSchema";
import type { EvidencePackItem } from "./rag/types";
import { buildNarrativeGuidelines } from "./rhetoric/buildNarrativeGuidelines";
import type { RhetoricalPlan } from "./rhetoric/types";
import type { CoverLetterRequest } from "./schemas";
import type { EvidenceItem, ExtractedKeywords } from "./types";
import { getLang } from "./utils";

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}\n`;
}

function buildKeywordSummary(keywords: ExtractedKeywords): string {
  const lines: string[] = [];
  if (keywords.hardSkills.length) lines.push(`**Hard Skills:** ${keywords.hardSkills.join(", ")}`);
  if (keywords.softSkills.length) lines.push(`**Soft Skills:** ${keywords.softSkills.join(", ")}`);
  if (keywords.domains.length) lines.push(`**Domains:** ${keywords.domains.join(", ")}`);
  if (keywords.seniority.length)
    lines.push(`**Seniority Signals:** ${keywords.seniority.join(", ")}`);
  if (keywords.workMode.length) lines.push(`**Work Mode:** ${keywords.workMode.join(", ")}`);
  if (keywords.languages.length)
    lines.push(`**Language Requirements:** ${keywords.languages.join(", ")}`);
  return lines.join("\n");
}

function buildRecommendedEmphasis(evidence: EvidenceItem[], keywords: ExtractedKeywords): string {
  const topKeywords = [...new Set(evidence.flatMap((e) => e.matchedKeywords))].slice(0, 10);

  const lines: string[] = [];

  if (topKeywords.length) {
    lines.push("**Top matched skills to emphasize:**");
    for (const kw of topKeywords) {
      lines.push(`- ${kw}`);
    }
  }

  if (keywords.seniority.length) {
    lines.push(`\n**Seniority expectation:** ${keywords.seniority.join(", ")}`);
  }
  if (keywords.domains.length) {
    lines.push(`\n**Domain knowledge to highlight:** ${keywords.domains.join(", ")}`);
  }
  if (keywords.softSkills.length) {
    lines.push(`\n**Soft skills to weave in:** ${keywords.softSkills.join(", ")}`);
  }

  return lines.join("\n");
}

function buildEvidenceSection(evidence: EvidenceItem[]): string {
  if (evidence.length === 0) return "_No strong evidence matches found._";

  return evidence
    .map((item, i) => {
      return [
        `### ${i + 1}. ${item.title}`,
        `- **Type:** ${item.type}`,
        `- **Score:** ${item.score}`,
        `- **Matched Keywords:** ${item.matchedKeywords.join(", ") || "—"}`,
        `- **Reason:** ${item.reason}`,
        `\n${item.content}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function buildEvidencePackSection(pack: EvidencePackItem[]): string {
  if (pack.length === 0) return "_No retrieved evidence available._";

  return pack
    .map((item, i) => {
      const metaLine = item.metadata?.skills?.length
        ? `- **Skills:** ${item.metadata.skills.slice(0, 6).join(", ")}`
        : null;
      return [
        `### ${i + 1}. ${item.title}`,
        `- **Type:** ${item.type}`,
        `- **Score:** ${item.score}`,
        `- **Matched Keywords:** ${item.matchedKeywords.join(", ") || "—"}`,
        metaLine,
        `- **Reason:** ${item.reason}`,
        `\n${item.content}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");
}

function buildCandidateProfile(
  site: Site,
  includeFullData: boolean,
  _evidence: EvidenceItem[],
): string {
  const h = site.heading;
  const blocks: string[] = [];

  blocks.push(
    [
      `**Name:** ${h.name}`,
      `**Email:** ${h.email}`,
      `**Phone:** ${h.phone}`,
      h.website ? `**Website:** ${h.website}` : null,
      h.linkedin ? `**LinkedIn:** ${h.linkedin}` : null,
      h.github ? `**GitHub:** ${h.github}` : null,
      h.years_of_experience ? `**Years of Experience:** ${h.years_of_experience}` : null,
      getLang(h.headline) ? `**Role:** ${getLang(h.headline)}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  if (!includeFullData) {
    blocks.push("_Full candidate data excluded — see Retrieved Candidate Evidence above._");
    return blocks.join("\n\n");
  }

  const execSummary = site.executive_summary.map((b) => getLang(b)).filter(Boolean);
  if (execSummary.length) {
    blocks.push(`### Executive Summary\n\n${execSummary.map((l) => `- ${l}`).join("\n")}`);
  }

  if (site.experience.length) {
    const expLines = site.experience.map((exp) => {
      const title = getLang(exp.title);
      const type = getLang(exp.type);
      const summaryLines = exp.summary
        .map((s) => getLang(s))
        .filter(Boolean)
        .map((l) => `  - ${l}`);
      return [
        `**${title}** at **${exp.company}** (${exp.duration}) — ${type}`,
        exp.tech_stack.length ? `  Tech: ${exp.tech_stack.join(", ")}` : null,
        ...summaryLines,
      ]
        .filter((l) => l !== null)
        .join("\n");
    });
    blocks.push(`### Experience\n\n${expLines.join("\n\n")}`);
  }

  if (site.skills.length) {
    const skillLines = site.skills.map((g) => {
      const key = getLang(g.key);
      const allSkills = [...g.most_used_skills, ...g.skills];
      return `**${key}:** ${allSkills.join(", ")}`;
    });
    blocks.push(`### Skills\n\n${skillLines.join("\n")}`);
  }

  if (site.education.length) {
    const eduLines = site.education.map((e) => {
      const course = getLang(e.course);
      const location = getLang(e.location);
      return `**${e.degree}** — ${e.school} (${e.duration})${course ? `, ${course}` : ""}${location ? `, ${location}` : ""}`;
    });
    blocks.push(`### Education\n\n${eduLines.join("\n")}`);
  }

  return blocks.join("\n\n");
}

function buildRhetoricalPlanSection(plan: RhetoricalPlan): string {
  const guidelines = buildNarrativeGuidelines(plan);

  const goalLines = plan.paragraphGoals
    .map((pg) => {
      const refs = pg.evidenceIds.length > 0 ? ` _(draws from: ${pg.evidenceIds.join(", ")})_` : "";
      return `**Para ${pg.paragraph}:** ${pg.goal}\n  - Emphasis: ${pg.emphasis}${refs}`;
    })
    .join("\n\n");

  return [
    `**Core Narrative:** ${plan.coreNarrative}`,
    `**Primary Strength:** ${plan.primaryStrength}`,
    plan.secondaryStrength ? `**Secondary Strength:** ${plan.secondaryStrength}` : null,
    `**Company Alignment:** ${plan.companyAlignment}`,
    `**Tone Profile:** ${plan.toneProfile.style} | evidence density: ${plan.toneProfile.evidenceDensity} | sentence style: ${plan.toneProfile.sentenceStyle}`,
    "",
    "### Paragraph Goals",
    "",
    goalLines,
    "",
    "### Writing Guidelines",
    "",
    guidelines.map((g) => `- ${g}`).join("\n"),
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function buildPromptMarkdown(
  req: CoverLetterRequest,
  site: Site,
  keywords: ExtractedKeywords,
  evidence: EvidenceItem[],
  evidencePack?: EvidencePackItem[],
  rhetoricalPlan?: RhetoricalPlan,
): string {
  const {
    jobDescription,
    language,
    companyName,
    jobTitle,
    recruiterName,
    tone,
    includeFullCandidateData,
  } = req;

  const activeKeywords =
    evidencePack && evidencePack.length > 0
      ? new Set(evidencePack.flatMap((e) => e.matchedKeywords))
      : new Set(evidence.flatMap((e) => e.matchedKeywords));
  const unmatchedSkills = keywords.hardSkills.filter((kw) => !activeKeywords.has(kw));

  const parts: string[] = [
    "# Cover Letter Generation Prompt\n",

    section(
      "Task",
      "Write a tailored, compelling cover letter in the requested output language. Use only the candidate data provided. Do not invent any experience, skill, or fact.",
    ),

    section("Output Language", language === "de" ? "German (Deutsch)" : "English"),

    section(
      "Job Information",
      [
        `- **Company:** ${companyName || "_(not provided)_"}`,
        `- **Job Title:** ${jobTitle || "_(not provided)_"}`,
        `- **Recruiter/Contact:** ${recruiterName || "_(not provided)_"}`,
        `- **Requested Tone:** ${tone}`,
      ].join("\n"),
    ),

    section("Extracted Job Keywords", buildKeywordSummary(keywords)),

    section("Recommended Emphasis", buildRecommendedEmphasis(evidence, keywords)),

    evidencePack && evidencePack.length > 0
      ? section(
          "Retrieved Candidate Evidence",
          `_Use this as the primary factual basis for the cover letter. Do not reference experience not listed here._\n\n${buildEvidencePackSection(evidencePack)}`,
        )
      : section("Ranked Candidate Evidence", buildEvidenceSection(evidence)),

    rhetoricalPlan ? section("Rhetorical Plan", buildRhetoricalPlanSection(rhetoricalPlan)) : "",

    section("Candidate Profile", buildCandidateProfile(site, includeFullCandidateData, evidence)),

    section("Full Job Description", jobDescription),

    section(
      "Writing Instructions",
      [
        "- Write in the **Output Language** specified above.",
        "- Use only the candidate data provided in this prompt — do not invent experience, credentials, or facts.",
        "- Prioritize the skills and evidence with the highest scores from the Retrieved Candidate Evidence section.",
        "- Emphasize the keywords listed under Recommended Emphasis.",
        `- Match the **${tone}** tone throughout.`,
        `- Address the letter to **${recruiterName || "the hiring team"}**${companyName ? ` at **${companyName}**` : ""}.`,
        "- Keep the letter under one page (approximately 300–400 words).",
        "- Avoid generic AI phrasing (e.g. 'I am excited to apply', 'I am a passionate...').",
        "- Structure: opening hook → strongest evidence → why this company/role → closing call to action.",
        "- Evidence density: maximum 2 examples per paragraph; do not stack more than 3 technologies per sentence.",
        "- Return **only** the final cover letter text — no preamble, no explanation.",
        ...(unmatchedSkills.length > 0
          ? [
              "",
              "### Skills Gap Note",
              `- The following technologies were listed in the job posting but are not explicitly present in the candidate's profile: **${unmatchedSkills.join(", ")}**.`,
              "- Do not pretend the candidate has hands-on experience with these — but do mention, naturally and briefly, that the candidate picks up new technologies quickly and is comfortable learning them.",
              "- Frame it as a strength: a track record of adapting to new stacks fast, not as an apology for a gap.",
            ]
          : []),
        ...(language === "de" || keywords.languages.includes("German")
          ? [
              "",
              "### German Language Note",
              "- The candidate's German is at a conversational/intermediate level and is actively improving.",
              "- Be honest and direct about this — do not overstate fluency or claim native-level German.",
              "- A natural way to frame it: the candidate is continuously learning German and is committed to reaching full professional proficiency.",
              "- Do not make German language ability a centrepiece of the letter; mention it briefly and confidently, then move on.",
            ]
          : []),
      ].join("\n"),
    ),
  ];

  return parts.filter(Boolean).join("\n");
}
