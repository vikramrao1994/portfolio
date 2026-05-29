import type { Site } from "@/lib/siteSchema";
import type { EvidenceItem, ExtractedKeywords } from "./types";
import { getLang } from "./utils";

const MAX_EVIDENCE = 6;

function textContains(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "gi").test(text);
}

function matchKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter((kw) => textContains(text, kw));
}

export function scoreCandidateEvidence(site: Site, keywords: ExtractedKeywords): EvidenceItem[] {
  const allKeywords = [...keywords.hardSkills, ...keywords.softSkills, ...keywords.domains];
  const items: EvidenceItem[] = [];

  // Score executive summary bullets
  for (const bullet of site.executive_summary) {
    const text = getLang(bullet);
    if (!text) continue;
    const matched = matchKeywords(text, allKeywords);
    const score = matched.length * 2;
    if (score === 0) continue;
    items.push({
      title: "Executive Summary",
      type: "executive_summary",
      score,
      matchedKeywords: matched,
      reason: `Matches ${matched.length} keyword(s) in executive summary bullet`,
      content: text,
    });
  }

  // Score experience entries
  for (const exp of site.experience) {
    let score = 0;
    const matchedKws = new Set<string>();
    const reasons: string[] = [];
    const title = getLang(exp.title);

    // Tech stack exact match: +5 each
    for (const tech of exp.tech_stack) {
      const techLower = tech.toLowerCase();
      for (const kw of keywords.hardSkills) {
        if (textContains(techLower, kw)) {
          score += 5;
          matchedKws.add(kw);
        }
      }
    }

    // Summary bullets: soft/domain +2, hard +3 each
    const summaryTexts = exp.summary.map((s) => getLang(s)).filter(Boolean);
    for (const s of summaryTexts) {
      const hardMatches = matchKeywords(s, keywords.hardSkills);
      const softMatches = matchKeywords(s, [...keywords.softSkills, ...keywords.domains]);
      for (const m of hardMatches) {
        score += 3;
        matchedKws.add(m);
      }
      for (const m of softMatches) {
        score += 2;
        matchedKws.add(m);
      }
    }

    // Recency bonus: first 2 experiences get +1
    const idx = site.experience.indexOf(exp);
    if (idx < 2 && score > 0) {
      score += 1;
      reasons.push("Recent/current experience");
    }

    if (score === 0) continue;

    if (matchedKws.size > 0) {
      reasons.unshift(`Matches ${matchedKws.size} keyword(s) in tech stack and responsibilities`);
    }

    items.push({
      title: `${title} @ ${exp.company}`,
      type: "experience",
      score,
      matchedKeywords: Array.from(matchedKws).sort(),
      reason: reasons.join("; "),
      content: [
        `${title} at ${exp.company} (${exp.duration})`,
        ...summaryTexts.slice(0, 3),
        exp.tech_stack.length > 0 ? `Stack: ${exp.tech_stack.slice(0, 4).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  // Score skills groups
  for (const group of site.skills) {
    const groupName = getLang(group.key);
    const allSkills = [...group.most_used_skills, ...group.skills];
    const matched = new Set<string>();

    for (const skill of allSkills) {
      const skillLower = skill.toLowerCase();
      for (const kw of keywords.hardSkills) {
        if (textContains(skillLower, kw)) {
          matched.add(kw);
        }
      }
    }

    if (matched.size === 0) continue;
    const score = matched.size * 5;

    items.push({
      title: `Skills: ${groupName}`,
      type: "skill",
      score,
      matchedKeywords: Array.from(matched).sort(),
      reason: `${matched.size} exact skill match(es) in "${groupName}" group`,
      content: allSkills
        .filter((s) => [...matched].some((kw) => textContains(s.toLowerCase(), kw)))
        .join(", "),
    });
  }

  // Score education
  for (const edu of site.education) {
    const course = getLang(edu.course);
    const matched = matchKeywords(course, [...allKeywords, ...keywords.domains]);
    if (matched.length === 0) continue;
    const score = matched.length * 2;

    items.push({
      title: `${edu.degree} — ${edu.school}`,
      type: "education",
      score,
      matchedKeywords: matched,
      reason: `Education matches ${matched.length} domain/keyword(s)`,
      content: `${edu.degree} from ${edu.school} (${edu.duration}) — ${course}`,
    });
  }

  // Score personal projects
  for (const project of site.personal_projects) {
    const title = getLang(project.project);
    if (!title) continue;

    let score = 0;
    const matchedKws = new Set<string>();

    // Skills exact match: +5 each (equivalent to tech_stack)
    for (const skill of project.skills) {
      const skillLower = skill.toLowerCase();
      for (const kw of keywords.hardSkills) {
        if (textContains(skillLower, kw)) {
          score += 5;
          matchedKws.add(kw);
        }
      }
    }

    // Summary bullets: hard +3, soft/domain +2
    const summaryTexts = project.summary.map((s) => getLang(s)).filter(Boolean);
    for (const s of summaryTexts) {
      const hardMatches = matchKeywords(s, keywords.hardSkills);
      const softMatches = matchKeywords(s, [...keywords.softSkills, ...keywords.domains]);
      for (const m of hardMatches) {
        score += 3;
        matchedKws.add(m);
      }
      for (const m of softMatches) {
        score += 2;
        matchedKws.add(m);
      }
    }

    if (score === 0) continue;

    items.push({
      title,
      type: "project",
      score,
      matchedKeywords: Array.from(matchedKws).sort(),
      reason: `Matches ${matchedKws.size} keyword(s) in skills and description`,
      content: [
        title,
        ...summaryTexts.slice(0, 3),
        project.skills.length > 0 ? `Technologies: ${project.skills.slice(0, 5).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, MAX_EVIDENCE);
}
