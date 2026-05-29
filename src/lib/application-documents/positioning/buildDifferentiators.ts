import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import { UNIQUENESS_WEIGHTS } from "./constants";
import type { PositioningPlan } from "./types";

function getUniquenessBonus(keywords: string[]): number {
  return keywords.reduce((total, kw) => total + (UNIQUENESS_WEIGHTS[kw] ?? 0), 0);
}

export function buildDifferentiators(
  evidencePack: EvidencePackItem[],
): PositioningPlan["differentiators"] {
  return evidencePack
    .map((item) => {
      const bonus = getUniquenessBonus(item.matchedKeywords);
      const strength = item.score + bonus;
      const label = item.matchedKeywords.slice(0, 3).join(", ") || item.title;
      return { label, evidenceTitle: item.title, reason: item.reason, strength };
    })
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3);
}
