import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import type { EngineeringProfile } from "../profile/schema";
import {
  CATEGORY_TO_PREFERRED_PATTERNS,
  type PreferredPattern,
  TENDENCY_TO_PREFERRED_PATTERNS,
} from "./constants";

export function buildPreferredPatternKeys(
  corpus: DecisionCorpus,
  engineeringProfile: EngineeringProfile | null,
): PreferredPattern[] {
  const seen = new Set<PreferredPattern>();
  const result: PreferredPattern[] = [];

  function add(pattern: PreferredPattern) {
    if (!seen.has(pattern)) {
      seen.add(pattern);
      result.push(pattern);
    }
  }

  // Decision categories are the primary signal for architectural patterns
  for (const category of Object.keys(corpus.byCategory)) {
    const patterns = CATEGORY_TO_PREFERRED_PATTERNS[category] ?? [];
    for (const p of patterns) add(p);
  }

  // Tendencies add supplemental coverage
  if (engineeringProfile) {
    for (const tendency of engineeringProfile.engineeringTendencies) {
      const patterns = TENDENCY_TO_PREFERRED_PATTERNS[tendency.tendency] ?? [];
      for (const p of patterns) add(p);
    }
  }

  return result;
}
