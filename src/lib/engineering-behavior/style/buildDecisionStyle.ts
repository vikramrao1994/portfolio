import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import type { EngineeringProfile } from "../profile/schema";
import {
  CATEGORY_TO_DECISION_STYLE,
  type DecisionStylePattern,
  TENDENCY_TO_DECISION_STYLE,
} from "./constants";

export function buildDecisionStyleKeys(
  corpus: DecisionCorpus,
  engineeringProfile: EngineeringProfile | null,
): DecisionStylePattern[] {
  const seen = new Set<DecisionStylePattern>();
  const result: DecisionStylePattern[] = [];

  function add(pattern: DecisionStylePattern) {
    if (!seen.has(pattern)) {
      seen.add(pattern);
      result.push(pattern);
    }
  }

  // Tendencies take priority — they represent consolidated behavior
  if (engineeringProfile) {
    for (const tendency of engineeringProfile.engineeringTendencies) {
      const patterns = TENDENCY_TO_DECISION_STYLE[tendency.tendency] ?? [];
      for (const p of patterns) add(p);
    }
  }

  // Decision categories in corpus add further signal
  for (const category of Object.keys(corpus.byCategory)) {
    const patterns = CATEGORY_TO_DECISION_STYLE[category] ?? [];
    for (const p of patterns) add(p);
  }

  return result;
}
