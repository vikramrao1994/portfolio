import type {
  AcceptedTradeoff,
  AntiPattern,
  DecisionStylePattern,
  PreferredEnvironment,
  PreferredPattern,
} from "../style/constants";
import type { DecisionCategory } from "./constants";
import type { StoredDecision } from "./schema";

export interface DecisionCorpus {
  totalDecisions: number;
  byCategory: Partial<Record<DecisionCategory, StoredDecision[]>>;
  relatedTraitIndex: Record<string, string[]>;
  relatedTendencyIndex: Record<string, string[]>;
  styleSignalCounts: Partial<Record<DecisionStylePattern, number>>;
  preferredPatternCounts: Partial<Record<PreferredPattern, number>>;
  acceptedTradeoffCounts: Partial<Record<AcceptedTradeoff, number>>;
  antiPatternCounts: Partial<Record<AntiPattern, number>>;
  preferredEnvironmentCounts: Partial<Record<PreferredEnvironment, number>>;
}

export function buildDecisionCorpus(decisions: StoredDecision[]): DecisionCorpus {
  const byCategory: Partial<Record<DecisionCategory, StoredDecision[]>> = {};
  const relatedTraitIndex: Record<string, string[]> = {};
  const relatedTendencyIndex: Record<string, string[]> = {};
  const styleSignalCounts: Partial<Record<DecisionStylePattern, number>> = {};
  const preferredPatternCounts: Partial<Record<PreferredPattern, number>> = {};
  const acceptedTradeoffCounts: Partial<Record<AcceptedTradeoff, number>> = {};
  const antiPatternCounts: Partial<Record<AntiPattern, number>> = {};
  const preferredEnvironmentCounts: Partial<Record<PreferredEnvironment, number>> = {};

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

    for (const sig of decision.styleSignals) {
      styleSignalCounts[sig] = (styleSignalCounts[sig] ?? 0) + 1;
    }
    for (const pat of decision.preferredPatterns) {
      preferredPatternCounts[pat] = (preferredPatternCounts[pat] ?? 0) + 1;
    }
    for (const at of decision.acceptedTradeoffs) {
      acceptedTradeoffCounts[at] = (acceptedTradeoffCounts[at] ?? 0) + 1;
    }
    for (const ap of decision.antiPatterns) {
      antiPatternCounts[ap] = (antiPatternCounts[ap] ?? 0) + 1;
    }
    for (const env of decision.preferredEnvironments) {
      preferredEnvironmentCounts[env] = (preferredEnvironmentCounts[env] ?? 0) + 1;
    }
  }

  return {
    totalDecisions: decisions.length,
    byCategory,
    relatedTraitIndex,
    relatedTendencyIndex,
    styleSignalCounts,
    preferredPatternCounts,
    acceptedTradeoffCounts,
    antiPatternCounts,
    preferredEnvironmentCounts,
  };
}
