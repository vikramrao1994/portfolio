import type { Site } from "@/lib/siteSchema";
import type { CoverLetterPromptRequest, EvidenceItem, ExtractedKeywords } from "./types";

function getLang<T extends { en?: string; de?: string }>(obj: T): string {
  return obj.en ?? obj.de ?? "";
}

function buildKeywordSection(keywords: ExtractedKeywords): string {
  const lines: string[] = [];
  if (keywords.hardSkills.length) lines.push(`Hard Skills: ${keywords.hardSkills.join(", ")}`);
  if (keywords.softSkills.length) lines.push(`Soft Skills: ${keywords.softSkills.join(", ")}`);
  if (keywords.domains.length) lines.push(`Domains: ${keywords.domains.join(", ")}`);
  if (keywords.seniority.length) lines.push(`Seniority Signals: ${keywords.seniority.join(", ")}`);
  if (keywords.workMode.length) lines.push(`Work Mode: ${keywords.workMode.join(", ")}`);
  if (keywords.languages.length) lines.push(`Language Requirements: ${keywords.languages.join(", ")}`);
  return lines.join("\n") || "No keywords extracted.";
}

function buildEmphasisSection(evidence: EvidenceItem[], keywords: ExtractedKeywords): string {
  const topKeywords = [...new Set(evidence.flatMap((e) => e.matchedKeywords))].slice(0, 10);
  const lines: string[] = [];
  if (topKeywords.length) {
    lines.push("Top matched skills to emphasize:");
    for (const kw of topKeywords) lines.push(`  - ${kw}`);
  }
  if (keywords.seniority.length) lines.push(`Seniority expectation: ${keywords.seniority.join(", ")}`);
  if (keywords.domains.length) lines.push(`Domain knowledge to highlight: ${keywords.domains.join(", ")}`);
  if (keywords.softSkills.length) lines.push(`Soft skills to weave in: ${keywords.softSkills.join(", ")}`);
  return lines.join("\n") || "No specific emphasis signals.";
}

function buildEvidenceSection(evidence: EvidenceItem[]): string {
  if (evidence.length === 0) return "No strong evidence matches found.";
  return evidence
    .map((item, i) =>
      [
        `${i + 1}. ${item.title} [type: ${item.type}, score: ${item.score}]`,
        `   Matched: ${item.matchedKeywords.join(", ") || "—"}`,
        `   Reason: ${item.reason}`,
        `   Content: ${item.content}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function buildProfileSection(site: Site): string {
  const h = site.heading;
  const blocks: string[] = [];

  blocks.push(
    [
      `Name: ${h.name}`,
      `Email: ${h.email}`,
      `Phone: ${h.phone}`,
      h.website ? `Website: ${h.website}` : null,
      h.linkedin ? `LinkedIn: ${h.linkedin}` : null,
      h.github ? `GitHub: ${h.github}` : null,
      h.years_of_experience ? `Years of Experience: ${h.years_of_experience}` : null,
      getLang(h.headline) ? `Role: ${getLang(h.headline)}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const execSummary = site.executive_summary.map((b) => getLang(b)).filter(Boolean);
  if (execSummary.length) {
    blocks.push(`Executive Summary:\n${execSummary.map((l) => `  - ${l}`).join("\n")}`);
  }

  if (site.experience.length) {
    const expLines = site.experience.map((exp) => {
      const title = getLang(exp.title);
      const type = getLang(exp.type);
      const summaryLines = exp.summary
        .map((s) => getLang(s))
        .filter(Boolean)
        .map((l) => `    - ${l}`);
      return [
        `  ${title} at ${exp.company} (${exp.duration}) — ${type}`,
        exp.tech_stack.length ? `    Tech: ${exp.tech_stack.join(", ")}` : null,
        ...summaryLines,
      ]
        .filter((l) => l !== null)
        .join("\n");
    });
    blocks.push(`Experience:\n${expLines.join("\n\n")}`);
  }

  if (site.skills.length) {
    const skillLines = site.skills.map((g) => {
      const key = getLang(g.key);
      const all = [...g.most_used_skills, ...g.skills];
      return `  ${key}: ${all.join(", ")}`;
    });
    blocks.push(`Skills:\n${skillLines.join("\n")}`);
  }

  if (site.education.length) {
    const eduLines = site.education.map((e) => {
      const course = getLang(e.course);
      const location = getLang(e.location);
      return `  ${e.degree} — ${e.school} (${e.duration})${course ? `, ${course}` : ""}${location ? `, ${location}` : ""}`;
    });
    blocks.push(`Education:\n${eduLines.join("\n")}`);
  }

  return blocks.join("\n\n");
}

const JSON_SCHEMA_DESCRIPTION = `{
  "language": "<en or de>",
  "recipient": {
    "companyName": "<company name, or omit if unknown>",
    "contactName": "<recruiter/contact name, or omit if unknown>",
    "addressLines": ["<street>", "<city, postcode>"]
  },
  "subject": "<formal subject line, 5-160 characters>",
  "salutation": "<formal greeting ending with comma, 2-120 characters>",
  "paragraphs": [
    "<paragraph 1 — opening hook, 40-900 characters>",
    "<paragraph 2 — core evidence, 40-900 characters>",
    "<paragraph 3 — why this company/role, 40-900 characters>"
  ],
  "closing": "<formal sign-off ending with comma, 2-120 characters>",
  "signatureName": "<full name, 2-120 characters>"
}`;

export function buildClaudeJsonPrompt(
  req: CoverLetterPromptRequest,
  site: Site,
  keywords: ExtractedKeywords,
  evidence: EvidenceItem[],
): string {
  const { jobDescription, language, companyName, jobTitle, recruiterName, tone } = req;

  const matchedKeywords = new Set(evidence.flatMap((e) => e.matchedKeywords));
  const unmatchedSkills = keywords.hardSkills.filter((kw) => !matchedKeywords.has(kw));

  const outputLanguage = language === "de" ? "German (Deutsch)" : "English";

  const sections: string[] = [
    `=== TASK ===
Write a tailored, formal cover letter for the job described below.
Output language: ${outputLanguage}
Tone: ${tone}

=== JOB INFORMATION ===
Company: ${companyName || "(not specified)"}
Job Title: ${jobTitle || "(not specified)"}
Recruiter/Contact: ${recruiterName || "(not specified)"}

=== EXTRACTED JOB KEYWORDS ===
${buildKeywordSection(keywords)}

=== RECOMMENDED EMPHASIS ===
${buildEmphasisSection(evidence, keywords)}

=== RANKED CANDIDATE EVIDENCE (highest relevance first) ===
${buildEvidenceSection(evidence)}

=== CANDIDATE PROFILE ===
${buildProfileSection(site)}

=== FULL JOB DESCRIPTION ===
${jobDescription}`,

    unmatchedSkills.length > 0
      ? `=== SKILLS GAP NOTE ===
The following technologies appear in the job posting but not explicitly in the candidate profile: ${unmatchedSkills.join(", ")}.
Do not claim hands-on experience with these. Briefly note that the candidate adapts to new stacks quickly.`
      : "",

    language === "de" || keywords.languages.includes("German")
      ? `=== LANGUAGE NOTE ===
The candidate's German is conversational/intermediate. Do not overstate fluency. Mention it briefly and honestly.`
      : "",

    `=== REQUIRED JSON OUTPUT ===
Return ONLY a single valid JSON object. The entire response must be parseable by JSON.parse().
Do NOT include Markdown. Do NOT include code fences. Do NOT include explanations or comments.

The JSON must exactly match this structure:
${JSON_SCHEMA_DESCRIPTION}

RULES:
- Use the output language: ${outputLanguage}
- Write 3 to 5 paragraphs
- Each paragraph must be 40–900 characters and suitable for a formal cover letter
- Use ONLY the candidate facts provided in this prompt
- Do NOT invent experience, employers, dates, achievements, degrees, or skills
- Do NOT fabricate anything not present in the Candidate Profile or Evidence sections
- "recipient" object is always required; omit its sub-fields if unknown
- "addressLines" should be omitted if the company address is not known
- The "salutation" and "closing" should match the output language conventions
- Structure: opening hook → strongest evidence → why this company/role → call to action
- Avoid generic AI phrasing (e.g., "I am excited to apply", "I am a passionate")`,
  ];

  return sections.filter(Boolean).join("\n\n");
}
