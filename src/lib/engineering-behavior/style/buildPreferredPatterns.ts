import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import type { EngineeringProfile } from "../profile/schema";
import { sortByFrequency } from "./aggregateTagKeys";
import {
  CATEGORY_TO_PREFERRED_PATTERNS,
  PREFERRED_PATTERNS,
  type PreferredPattern,
  TENDENCY_TO_PREFERRED_PATTERNS,
} from "./constants";

export function buildPreferredPatternKeys(
  corpus: DecisionCorpus,
  engineeringProfile: EngineeringProfile | null,
): PreferredPattern[] {
  // Primary: explicit preferred pattern tags from the decision corpus
  const fromTags = sortByFrequency(corpus.preferredPatternCounts, PREFERRED_PATTERNS);
  if (fromTags.length > 0) return fromTags;

  // Fallback: category + tendency mappings when no decisions have tags yet
  const seen = new Set<PreferredPattern>();
  const result: PreferredPattern[] = [];

  function add(pattern: PreferredPattern) {
    if (!seen.has(pattern)) {
      seen.add(pattern);
      result.push(pattern);
    }
  }

  for (const category of Object.keys(corpus.byCategory)) {
    for (const p of CATEGORY_TO_PREFERRED_PATTERNS[category] ?? []) add(p);
  }

  if (engineeringProfile) {
    for (const tendency of engineeringProfile.engineeringTendencies) {
      for (const p of TENDENCY_TO_PREFERRED_PATTERNS[tendency.tendency] ?? []) add(p);
    }
  }

  return result;
}
