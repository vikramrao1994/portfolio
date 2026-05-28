import type { Site } from "@/lib/siteSchema";
import type { Language } from "../schemas";
import { getLang } from "../utils";
import { normalizeText, slugifyChunkId, uniqueStrings } from "./textUtils";
import type { CandidateChunk } from "./types";

export function buildCandidateChunks(site: Site, language: Language): CandidateChunk[] {
  const chunks: CandidateChunk[] = [];
  const seen = new Set<string>();

  function add(chunk: CandidateChunk): void {
    if (!chunk.text.trim()) return;
    if (seen.has(chunk.id)) return;
    seen.add(chunk.id);
    chunks.push(chunk);
  }

  // Executive summary — one chunk per bullet
  for (let i = 0; i < site.executive_summary.length; i++) {
    const text = normalizeText(getLang(site.executive_summary[i]));
    if (!text) continue;
    add({
      id: `summary-${i}`,
      type: "summary",
      language,
      title: "Executive Summary",
      text,
    });
  }

  // Experience — one chunk per role
  for (const exp of site.experience) {
    const title = normalizeText(getLang(exp.title));
    if (!title) continue;

    const summaryLines = exp.summary.map((s) => normalizeText(getLang(s))).filter(Boolean);

    const lines = [
      `${title} at ${exp.company} (${exp.duration})`,
      ...summaryLines,
      exp.tech_stack.length > 0 ? `Technologies: ${exp.tech_stack.join(", ")}` : "",
    ].filter(Boolean);

    add({
      id: slugifyChunkId(`exp-${exp.company}-${title}`),
      type: "experience",
      language,
      title: `${title} @ ${exp.company}`,
      text: lines.join("\n"),
      metadata: {
        company: exp.company,
        skills: uniqueStrings(exp.tech_stack),
        dateRange: exp.duration,
      },
    });
  }

  // Skills — one chunk per group
  for (const group of site.skills) {
    const groupName = normalizeText(getLang(group.key));
    if (!groupName) continue;

    const allSkills = uniqueStrings([...group.most_used_skills, ...group.skills]);
    if (allSkills.length === 0) continue;

    add({
      id: slugifyChunkId(`skill-${groupName}`),
      type: "skill",
      language,
      title: `Skills: ${groupName}`,
      text: allSkills.join(", "),
      metadata: {
        skills: allSkills,
        tags: [groupName],
      },
    });
  }

  // Education — one chunk per entry
  for (const edu of site.education) {
    const course = normalizeText(getLang(edu.course));
    const text = [`${edu.degree} from ${edu.school} (${edu.duration})`, course || null]
      .filter(Boolean)
      .join(" — ");

    add({
      id: slugifyChunkId(`edu-${edu.school}-${edu.degree}`),
      type: "education",
      language,
      title: `${edu.degree} — ${edu.school}`,
      text,
      metadata: {
        dateRange: edu.duration,
      },
    });
  }

  return chunks;
}
