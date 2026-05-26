import type { Site } from "@/lib/siteSchema";
import type { CoverLetterPromptRequest, EvidenceItem, ExtractedKeywords } from "./types";

function getLang<T extends { en?: string; de?: string }>(obj: T): string {
  return obj.en ?? obj.de ?? "";
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}\n`;
}

function buildKeywordSummary(keywords: ExtractedKeywords): string {
  const lines: string[] = [];
  if (keywords.hardSkills.length)
    lines.push(`**Hard Skills:** ${keywords.hardSkills.join(", ")}`);
  if (keywords.softSkills.length)
    lines.push(`**Soft Skills:** ${keywords.softSkills.join(", ")}`);
  if (keywords.domains.length)
    lines.push(`**Domains:** ${keywords.domains.join(", ")}`);
  if (keywords.seniority.length)
    lines.push(`**Seniority Signals:** ${keywords.seniority.join(", ")}`);
  if (keywords.workMode.length)
    lines.push(`**Work Mode:** ${keywords.workMode.join(", ")}`);
  if (keywords.languages.length)
    lines.push(`**Language Requirements:** ${keywords.languages.join(", ")}`);
  return lines.join("\n");
}

function buildRecommendedEmphasis(evidence: EvidenceItem[], keywords: ExtractedKeywords): string {
  const topKeywords = [
    ...new Set(evidence.flatMap((e) => e.matchedKeywords)),
  ].slice(0, 10);

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

function buildCandidateProfile(site: Site, includeFullData: boolean, _evidence: EvidenceItem[]): string {
  const h = site.heading;
  const blocks: string[] = [];

  // Always include heading
  blocks.push([
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
    .join("\n"));

  if (!includeFullData) {
    blocks.push("_Full candidate data excluded — see Ranked Candidate Evidence above._");
    return blocks.join("\n\n");
  }

  // Executive summary
  const execSummary = site.executive_summary.map((b) => getLang(b)).filter(Boolean);
  if (execSummary.length) {
    blocks.push(`### Executive Summary\n\n${execSummary.map((l) => `- ${l}`).join("\n")}`);
  }

  // Experience
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

  // Skills
  if (site.skills.length) {
    const skillLines = site.skills.map((g) => {
      const key = getLang(g.key);
      const allSkills = [...g.most_used_skills, ...g.skills];
      return `**${key}:** ${allSkills.join(", ")}`;
    });
    blocks.push(`### Skills\n\n${skillLines.join("\n")}`);
  }

  // Education
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

export function buildPromptMarkdown(
  req: CoverLetterPromptRequest,
  site: Site,
  keywords: ExtractedKeywords,
  evidence: EvidenceItem[],
): string {
  const { jobDescription, language, companyName, jobTitle, recruiterName, tone, includeFullCandidateData } = req;

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

    section("Ranked Candidate Evidence", buildEvidenceSection(evidence)),

    section("Candidate Profile", buildCandidateProfile(site, includeFullCandidateData, evidence)),

    section("Full Job Description", jobDescription),

    section(
      "Writing Instructions",
      [
        "- Write in the **Output Language** specified above.",
        "- Use only the candidate data provided in this prompt — do not invent experience, credentials, or facts.",
        "- Prioritize the skills and evidence with the highest scores from the Ranked Evidence section.",
        "- Emphasize the keywords listed under Recommended Emphasis.",
        `- Match the **${tone}** tone throughout.`,
        `- Address the letter to **${recruiterName || "the hiring team"}**${companyName ? ` at **${companyName}**` : ""}.`,
        "- Keep the letter under one page (approximately 300–400 words).",
        "- Avoid generic AI phrasing (e.g. 'I am excited to apply', 'I am a passionate...').",
        "- Structure: opening hook → strongest evidence → why this company/role → closing call to action.",
        "- Return **only** the final cover letter text — no preamble, no explanation.",
      ].join("\n"),
    ),
  ];

  return parts.join("\n");
}
