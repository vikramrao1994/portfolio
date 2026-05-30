import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import { sortByFrequency } from "./aggregateTagKeys";
import {
  ANTI_PATTERNS,
  type AntiPattern,
  DECISION_STYLE_TO_ANTI_PATTERNS,
  type DecisionStylePattern,
} from "./constants";

export function buildAntiPatternKeys(
  corpus: DecisionCorpus,
  styleKeys: DecisionStylePattern[],
): AntiPattern[] {
  // Primary: explicit anti-pattern tags from the decision corpus
  const fromTags = sortByFrequency(corpus.antiPatternCounts, ANTI_PATTERNS);
  if (fromTags.length > 0) return fromTags;

  // Fallback: derive from style keys when no decisions have tags yet
  const seen = new Set<AntiPattern>();
  const result: AntiPattern[] = [];

  function add(pattern: AntiPattern) {
    if (!seen.has(pattern)) {
      seen.add(pattern);
      result.push(pattern);
    }
  }

  for (const styleKey of styleKeys) {
    for (const p of DECISION_STYLE_TO_ANTI_PATTERNS[styleKey] ?? []) add(p);
  }

  return result;
}
