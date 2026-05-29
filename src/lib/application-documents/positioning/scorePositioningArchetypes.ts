import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import type { CompanyAlignment, RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { ExtractedKeywords } from "@/lib/cover-letter/types";
import { ARCHETYPE_SIGNALS } from "./constants";
import type { PositioningArchetype } from "./types";

export function scorePositioningArchetypes(
  extractedKeywords: ExtractedKeywords,
  companyAlignment: CompanyAlignment,
  rhetoricalPlan: RhetoricalPlan,
  evidencePack: EvidencePackItem[],
): Record<PositioningArchetype, number> {
  const termPool = [
    ...extractedKeywords.hardSkills,
    ...extractedKeywords.domains,
    ...companyAlignment.inferredPriorities,
    ...companyAlignment.companyTraits,
    ...evidencePack.flatMap((e) => [...e.matchedKeywords, ...e.matchedTerms]),
    rhetoricalPlan.coreNarrative,
    rhetoricalPlan.primaryStrength,
    rhetoricalPlan.secondaryStrength ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const scores = {
    "frontend-specialist": 0,
    "full-stack-builder": 0,
    "ai-product-engineer": 0,
    "performance-engineer": 0,
    "startup-generalist": 0,
  } satisfies Record<PositioningArchetype, number>;

  for (const [archetype, signals] of Object.entries(ARCHETYPE_SIGNALS) as [
    PositioningArchetype,
    string[],
  ][]) {
    for (const signal of signals) {
      if (termPool.includes(signal.toLowerCase())) {
        scores[archetype] += 1;
      }
    }
  }

  return scores;
}
