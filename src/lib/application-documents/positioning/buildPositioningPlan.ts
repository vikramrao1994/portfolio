import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import type { CompanyAlignment, RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { ExtractedKeywords } from "@/lib/cover-letter/types";
import { buildDifferentiators } from "./buildDifferentiators";
import { EMPHASIS_RULES, SUPPRESS_RULES } from "./constants";
import { scorePositioningArchetypes } from "./scorePositioningArchetypes";
import type { PositioningArchetype, PositioningPlan } from "./types";

const ARCHETYPE_ORDER: PositioningArchetype[] = [
  "frontend-specialist",
  "full-stack-builder",
  "ai-product-engineer",
  "performance-engineer",
  "startup-generalist",
];

function selectArchetype(scores: Record<PositioningArchetype, number>): PositioningArchetype {
  let best: PositioningArchetype = "frontend-specialist";
  let bestScore = -1;
  for (const archetype of ARCHETYPE_ORDER) {
    if (scores[archetype] > bestScore) {
      bestScore = scores[archetype];
      best = archetype;
    }
  }
  return best;
}

function buildPrimaryNarrative(
  archetype: PositioningArchetype,
  differentiators: PositioningPlan["differentiators"],
  companyAlignment: CompanyAlignment,
): string {
  const top = differentiators[0];
  const trait = companyAlignment.companyTraits[0] ?? "";

  switch (archetype) {
    case "frontend-specialist":
      return top
        ? `Frontend specialist with deep ${top.label} expertise delivering accessible, production-quality interfaces`
        : "Frontend specialist with strong component architecture and production delivery";
    case "full-stack-builder":
      return top
        ? `Full-stack builder with proven ${top.label} delivery — from API design to user-facing interfaces`
        : "Full-stack builder with end-to-end product delivery and architecture experience";
    case "ai-product-engineer":
      return top
        ? `AI product engineer building practical ${top.label} systems and developer workflows`
        : "AI product engineer translating LLM capabilities into real developer tooling";
    case "performance-engineer":
      return top
        ? `Performance engineer specializing in ${top.label} and real-time data rendering`
        : "Performance engineer with data visualization and large-scale rendering expertise";
    case "startup-generalist":
      return trait
        ? `Startup-oriented generalist with ${trait}, shipping across the full product stack`
        : "Startup generalist who ships fast and takes end-to-end ownership across frontend, backend, and tooling";
  }
}

function buildSecondaryNarrative(
  archetype: PositioningArchetype,
  differentiators: PositioningPlan["differentiators"],
  companyAlignment: CompanyAlignment,
): string {
  const second = differentiators[1];
  const priorities = companyAlignment.inferredPriorities;

  switch (archetype) {
    case "frontend-specialist":
      return priorities.some((p) => p.includes("full-stack"))
        ? "Full-stack awareness enabling end-to-end delivery when the product demands it"
        : second
          ? `Supporting depth in ${second.label} strengthens component and system integration`
          : "Strong TypeScript and React foundation supporting team-level consistency and quality";
    case "full-stack-builder":
      return second
        ? `Frontend depth in ${second.label} enables product-quality interfaces alongside backend work`
        : "Frontend depth enabling product-quality interfaces alongside backend architecture decisions";
    case "ai-product-engineer":
      return second
        ? `${second.label} provides the production foundation that makes AI product features shippable`
        : "React and TypeScript foundation enables rapid AI product iteration";
    case "performance-engineer":
      return second
        ? `${second.label} enables seamless integration of performance-critical layers into the product`
        : "React expertise enabling seamless integration of performance-critical visualization into product UIs";
    case "startup-generalist":
      return second
        ? `Technical breadth covering ${second.label} adapts to whatever the product needs`
        : "Technical breadth covering frontend, backend, and AI tooling as needed by the product";
  }
}

export function buildPositioningPlan({
  evidencePack,
  companyAlignment,
  rhetoricalPlan,
  extractedKeywords,
}: {
  evidencePack: EvidencePackItem[];
  companyAlignment: CompanyAlignment;
  rhetoricalPlan: RhetoricalPlan;
  extractedKeywords: ExtractedKeywords;
}): PositioningPlan {
  const scores = scorePositioningArchetypes(
    extractedKeywords,
    companyAlignment,
    rhetoricalPlan,
    evidencePack,
  );
  const archetype = selectArchetype(scores);
  const differentiators = buildDifferentiators(evidencePack);
  const primaryNarrative = buildPrimaryNarrative(archetype, differentiators, companyAlignment);
  const secondaryNarrative = buildSecondaryNarrative(archetype, differentiators, companyAlignment);

  return {
    archetype,
    primaryNarrative,
    secondaryNarrative,
    differentiators,
    suppressNarratives: SUPPRESS_RULES[archetype],
    emphasisRules: EMPHASIS_RULES[archetype],
  };
}
