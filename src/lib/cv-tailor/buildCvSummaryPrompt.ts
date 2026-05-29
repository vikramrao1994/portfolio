import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import type { ExtractedKeywords } from "@/lib/cover-letter/types";
import { getLang } from "@/lib/cover-letter/utils";
import type { Site } from "@/lib/siteSchema";
import { CV_SUMMARY_SCHEMA_DESCRIPTION } from "./schema";

function trimJobDescription(jd: string, maxLength = 1800): string {
  if (jd.length <= maxLength) return jd;
  return `${jd.slice(0, maxLength)}\n[truncated]`;
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

export interface BuildCvSummaryPromptInput {
  jobDescription: string;
  language: "en" | "de";
  companyName?: string;
  jobTitle?: string;
  siteContent: Site;
  extractedKeywords: ExtractedKeywords;
  evidencePack: EvidencePackItem[];
}

export function buildCvSummaryPrompt(input: BuildCvSummaryPromptInput): string {
  const { jobDescription, language, companyName, jobTitle, siteContent, evidencePack } = input;

  const outputLanguage = language === "de" ? "German (Deutsch)" : "English";
  const h = siteContent.heading;
  const currentHeadline = getLang(h.headline);
  const currentSummary = siteContent.executive_summary
    .map((s) => getLang(s))
    .filter(Boolean)
    .join("\n");

  const sections: string[] = [
    `=== TASK ===
Tailor the CV headline and executive summary for the role below. Output language: ${outputLanguage}
Return only valid JSON matching the schema exactly.
Do not invent facts, employers, dates, skills, or achievements.
Use only the provided evidence. Do not rewrite work experience, education, or skills.
Keep the output factual and recruiter-facing.`,

    `=== ROLE ===
Company: ${companyName || "(not specified)"}
Title: ${jobTitle || "(not specified)"}`,

    `=== JOB DESCRIPTION ===
${trimJobDescription(jobDescription)}`,

    `=== CURRENT HEADLINE ===
${currentHeadline || "(none)"}`,

    `=== CURRENT EXECUTIVE SUMMARY ===
${currentSummary || "(none)"}`,

    `=== STRONGEST EVIDENCE ===
Base the tailored output on these experiences only. Do not reference experience not listed here.

${buildEvidencePackBlock(evidencePack)}`,

    `=== OUTPUT ===
Return ONLY a single valid JSON object. The entire response must be parseable by JSON.parse().
No Markdown. No code fences. No explanations. No text outside the JSON.

Schema:
${CV_SUMMARY_SCHEMA_DESCRIPTION}

Rules:
- language must be "${language}"
- headline: 20–180 characters, tailored to this specific role, factual, recruiter-facing
- executiveSummary: 120–700 characters, factual prose; use \\n to separate distinct key points if helpful
- emphasis: 1–6 key themes drawn from the role and evidence
- matchedEvidence: list up to 8 evidence items you drew from
- Use ONLY facts from the Current Headline, Current Executive Summary, and Strongest Evidence sections
- Do NOT invent experience, employers, dates, achievements, degrees, or skills`,
  ];

  return sections.filter(Boolean).join("\n\n");
}
