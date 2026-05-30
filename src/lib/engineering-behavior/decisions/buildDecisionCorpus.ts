import type { DecisionCategory } from "./constants";
import type { StoredDecision } from "./schema";

export interface DecisionCorpus {
  totalDecisions: number;
  byCategory: Partial<Record<DecisionCategory, StoredDecision[]>>;
  relatedTraitIndex: Record<string, string[]>;
  relatedTendencyIndex: Record<string, string[]>;
}

export function buildDecisionCorpus(decisions: StoredDecision[]): DecisionCorpus {
  const byCategory: Partial<Record<DecisionCategory, StoredDecision[]>> = {};
  const relatedTraitIndex: Record<string, string[]> = {};
  const relatedTendencyIndex: Record<string, string[]> = {};

  for (const decision of decisions) {
    const cat = decision.category as DecisionCategory;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(decision);

    for (const trait of decision.relatedTraits) {
      if (!relatedTraitIndex[trait]) relatedTraitIndex[trait] = [];
      relatedTraitIndex[trait].push(decision.title);
    }

    for (const tendency of decision.relatedTendencies) {
      if (!relatedTendencyIndex[tendency]) relatedTendencyIndex[tendency] = [];
      relatedTendencyIndex[tendency].push(decision.title);
    }
  }

  return { totalDecisions: decisions.length, byCategory, relatedTraitIndex, relatedTendencyIndex };
}
