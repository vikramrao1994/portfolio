import {
  type AntiPattern,
  DECISION_STYLE_TO_ANTI_PATTERNS,
  type DecisionStylePattern,
} from "./constants";

export function buildAntiPatternKeys(styleKeys: DecisionStylePattern[]): AntiPattern[] {
  const seen = new Set<AntiPattern>();
  const result: AntiPattern[] = [];

  function add(pattern: AntiPattern) {
    if (!seen.has(pattern)) {
      seen.add(pattern);
      result.push(pattern);
    }
  }

  for (const styleKey of styleKeys) {
    const antiPatterns = DECISION_STYLE_TO_ANTI_PATTERNS[styleKey] ?? [];
    for (const p of antiPatterns) add(p);
  }

  return result;
}
