import type { EvidencePackItem } from "../rag/types";
import type { CompanyAlignment, RhetoricalPlan, Tone } from "./types";

function deriveRoleLabel(topEvidence: EvidencePackItem[]): string {
  const exp = topEvidence.find((e) => e.type === "experience");
  if (!exp) return "software engineer";

  const t = exp.title.toLowerCase();
  if (t.includes("frontend") || t.includes("front-end") || t.includes("ui engineer"))
    return "frontend engineer";
  if (t.includes("backend") || t.includes("back-end") || t.includes("server-side"))
    return "backend engineer";
  if (t.includes("full-stack") || t.includes("fullstack")) return "full-stack engineer";
  if (t.includes("mobile")) return "mobile engineer";
  if (t.includes("devops") || t.includes("infrastructure") || t.includes("platform"))
    return "infrastructure engineer";
  if (t.includes("lead") || t.includes("principal") || t.includes("staff"))
    return "senior engineer";
  return "software engineer";
}

function deriveLeadingAdjective(alignment: CompanyAlignment): string {
  const traits = alignment.companyTraits;
  if (traits.some((t) => t.includes("ownership"))) return "ownership-oriented";
  if (traits.some((t) => t.includes("product"))) return "product-focused";
  if (traits.some((t) => t.includes("platform"))) return "platform-minded";
  if (traits.some((t) => t.includes("scale"))) return "scale-conscious";
  if (traits.some((t) => t.includes("startup"))) return "adaptable";
  if (traits.some((t) => t.includes("performance"))) return "performance-driven";
  if (traits.some((t) => t.includes("accessibility"))) return "accessibility-conscious";
  if (traits.some((t) => t.includes("leadership"))) return "technically mature";
  if (traits.some((t) => t.includes("long-term"))) return "craft-focused";
  return "delivery-focused";
}

function deriveExperienceQualifier(
  topEvidence: EvidencePackItem[],
  alignment: CompanyAlignment,
): string {
  const expKws = topEvidence
    .filter((e) => e.type === "experience")
    .flatMap((e) => e.matchedKeywords)
    .slice(0, 3);

  if (expKws.length >= 2) return `${expKws[0]} and ${expKws[1]} delivery`;
  if (expKws.length === 1) return `${expKws[0]} delivery`;

  const priorities = alignment.inferredPriorities;
  if (priorities.some((p) => p.includes("full-stack"))) return "end-to-end delivery experience";
  if (priorities.some((p) => p.includes("frontend"))) return "frontend delivery experience";
  if (priorities.some((p) => p.includes("backend"))) return "backend delivery experience";
  return "production delivery experience";
}

function deriveStrength(item: EvidencePackItem): string {
  if (item.type === "experience") {
    // Title format: "Role @ Company" — strip company part
    const roleOnly = (item.title.split("@")[0] ?? item.title).trim();
    const coreRole = roleOnly
      .replace(/^(senior|junior|mid|lead|principal|staff)\s+/i, "")
      .replace(/\s+(engineer|developer|architect|specialist)$/i, "")
      .trim();
    const topKws = item.matchedKeywords.slice(0, 2);
    return topKws.length > 0
      ? `${coreRole.toLowerCase()} experience (${topKws.join(", ")})`
      : `${coreRole.toLowerCase()} delivery`;
  }
  if (item.type === "skill") {
    const topKws = item.matchedKeywords.slice(0, 3);
    return topKws.length > 0 ? topKws.join(", ") : item.title.replace("Skills: ", "").toLowerCase();
  }
  if (item.type === "project") {
    return `${item.title.toLowerCase()} (project ownership)`;
  }
  const topKws = item.matchedKeywords.slice(0, 2);
  return topKws.length > 0 ? topKws.join(" and ") : item.title.toLowerCase();
}

function buildAlignmentSummary(alignment: CompanyAlignment): string {
  const parts: string[] = [];
  if (alignment.companyTraits.length > 0)
    parts.push(alignment.companyTraits.slice(0, 2).join(" and "));
  if (alignment.inferredPriorities.length > 0)
    parts.push(`focused on ${alignment.inferredPriorities[0]}`);
  return parts.length > 0 ? parts.join(", ") : "engineering quality and delivery";
}

function deriveToneProfile(
  tone: Tone,
  evidenceCount: number,
  alignment: CompanyAlignment,
): RhetoricalPlan["toneProfile"] {
  const evidenceDensity: "low" | "medium" | "high" =
    evidenceCount <= 3 ? "high" : evidenceCount <= 6 ? "medium" : "low";

  const sentenceStyle: "balanced" | "concise" | "detailed" =
    tone === "direct"
      ? "concise"
      : evidenceDensity === "high" || alignment.inferredPriorities.length >= 3
        ? "detailed"
        : "balanced";

  return { style: tone, evidenceDensity, sentenceStyle };
}

function buildParagraphGoals(
  topEvidence: EvidencePackItem[],
  alignment: CompanyAlignment,
): RhetoricalPlan["paragraphGoals"] {
  const expItems = topEvidence.filter((e) => e.type === "experience").slice(0, 2);
  const depthItems = topEvidence
    .filter((e) => !expItems.includes(e) && e.type !== "summary")
    .slice(0, 2);

  const hasOwnership = alignment.companyTraits.some((t) => t.includes("ownership"));
  const hasCollaboration = alignment.companyTraits.some((t) => t.includes("collab"));

  return [
    {
      paragraph: 1,
      goal: "Establish core competency and delivery track record",
      emphasis: expItems.length > 0 ? "production impact and ownership" : "engineering approach",
      evidenceIds: expItems.map((e) => e.title),
    },
    {
      paragraph: 2,
      goal: "Demonstrate technical depth and specific skills alignment",
      emphasis:
        depthItems.length > 0
          ? "technical capabilities and architecture"
          : "engineering principles",
      evidenceIds: depthItems.map((e) => e.title),
    },
    {
      paragraph: 3,
      goal: "Show specific alignment with company engineering culture",
      emphasis: hasOwnership
        ? "ownership mindset and cultural fit"
        : hasCollaboration
          ? "collaboration and team contribution"
          : "engineering values alignment",
      evidenceIds: [],
    },
  ];
}

function buildWritingGuidelines(
  toneProfile: RhetoricalPlan["toneProfile"],
  alignment: CompanyAlignment,
): string[] {
  const guidelines: string[] = [
    "Vary sentence length naturally — mix short impactful statements with concise supporting detail.",
    "Use evidence selectively, not exhaustively — one specific example beats three vague ones.",
    "Avoid generic enthusiasm phrases such as 'I am excited to' or 'I am passionate about'.",
    "Keep paragraph transitions natural and purposeful — each paragraph should build on the last.",
    "Do not stack more than 3 technologies in a single sentence.",
    "Do not repeat the same technology or skill more than twice across the entire letter.",
    "Focus on persuasion and impact, not keyword saturation.",
    "Write in flowing prose — avoid bullet-point rhythm.",
  ];

  if (toneProfile.sentenceStyle === "concise") {
    guidelines.push(
      "Lead every paragraph with the strongest point — short, declarative sentences.",
    );
  } else if (toneProfile.sentenceStyle === "detailed") {
    guidelines.push(
      "Provide brief specifics for each claim — concrete detail beats vague generality.",
    );
  }

  if (toneProfile.evidenceDensity === "medium") {
    guidelines.push(
      "Use at most 2 primary evidence examples per paragraph — prioritize the strongest.",
    );
  } else if (toneProfile.evidenceDensity === "low") {
    guidelines.push(
      "Use at most 1 evidence example per paragraph — narrative clarity over coverage.",
    );
  }

  if (alignment.companyTraits.some((t) => t.includes("ownership"))) {
    guidelines.push(
      "Emphasize autonomous decision-making and end-to-end ownership in the narrative.",
    );
  }
  if (alignment.companyTraits.some((t) => t.includes("startup"))) {
    guidelines.push(
      "Highlight adaptability and breadth — the ability to contribute across domains.",
    );
  }
  if (alignment.companyTraits.some((t) => t.includes("accessibility"))) {
    guidelines.push("Treat accessibility as a quality criterion, not a compliance checkbox.");
  }
  if (alignment.engineeringCultureSignals.some((s) => s.includes("CI/CD"))) {
    guidelines.push(
      "Reference engineering practices (testing, deployment, code quality) where natural.",
    );
  }
  if (alignment.companyTraits.some((t) => t.includes("long-term"))) {
    guidelines.push(
      "Frame contributions in terms of lasting architectural decisions, not one-off fixes.",
    );
  }

  return guidelines;
}

export function buildRhetoricalPlan({
  evidencePack,
  companyAlignment,
  jobDescription: _jobDescription,
  tone = "professional",
}: {
  evidencePack: EvidencePackItem[];
  companyAlignment: CompanyAlignment;
  jobDescription: string;
  tone?: Tone;
}): RhetoricalPlan {
  const sorted = [...evidencePack].sort((a, b) => {
    if (a.type === "experience" && b.type !== "experience") return -1;
    if (b.type === "experience" && a.type !== "experience") return 1;
    return b.score - a.score;
  });

  const topEvidence = sorted.slice(0, 4);

  const roleLabel = deriveRoleLabel(topEvidence);
  const leadAdj = deriveLeadingAdjective(companyAlignment);
  const qualifier = deriveExperienceQualifier(topEvidence, companyAlignment);
  const coreNarrative = `${leadAdj} ${roleLabel} with ${qualifier}`;

  const primaryItem = topEvidence.find((e) => e.type === "experience") ?? topEvidence[0];
  const primaryStrength = primaryItem ? deriveStrength(primaryItem) : "strong engineering delivery";

  const secondaryItem = topEvidence.find((e) => e !== primaryItem && e.type !== "summary");
  const secondaryStrength = secondaryItem ? deriveStrength(secondaryItem) : undefined;

  const companyAlignmentStr = buildAlignmentSummary(companyAlignment);
  const toneProfile = deriveToneProfile(tone, evidencePack.length, companyAlignment);
  const paragraphGoals = buildParagraphGoals(topEvidence, companyAlignment);
  const writingGuidelines = buildWritingGuidelines(toneProfile, companyAlignment);

  return {
    coreNarrative,
    primaryStrength,
    secondaryStrength,
    companyAlignment: companyAlignmentStr,
    toneProfile,
    paragraphGoals,
    writingGuidelines,
  };
}
