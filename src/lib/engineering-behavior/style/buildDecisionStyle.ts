import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import type { EngineeringProfile } from "../profile/schema";
import { sortByFrequency } from "./aggregateTagKeys";
import {
  CATEGORY_TO_DECISION_STYLE,
  DECISION_STYLE_PATTERNS,
  type DecisionStylePattern,
  TENDENCY_TO_DECISION_STYLE,
} from "./constants";

export function buildDecisionStyleKeys(
  corpus: DecisionCorpus,
  engineeringProfile: EngineeringProfile | null,
): DecisionStylePattern[] {
  // Primary: explicit style signal tags from the decision corpus
  const fromTags = sortByFrequency(corpus.styleSignalCounts, DECISION_STYLE_PATTERNS);
  if (fromTags.length > 0) return fromTags;

  // Fallback: tendency + category mappings when no decisions have tags yet
  const seen = new Set<DecisionStylePattern>();
  const result: DecisionStylePattern[] = [];

  function add(pattern: DecisionStylePattern) {
    if (!seen.has(pattern)) {
      seen.add(pattern);
      result.push(pattern);
    }
  }

  if (engineeringProfile) {
    for (const tendency of engineeringProfile.engineeringTendencies) {
      for (const p of TENDENCY_TO_DECISION_STYLE[tendency.tendency] ?? []) add(p);
    }
  }

  for (const category of Object.keys(corpus.byCategory)) {
    for (const p of CATEGORY_TO_DECISION_STYLE[category] ?? []) add(p);
  }

  return result;
}
