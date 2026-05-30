import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import type { StoredDecision } from "../decisions/schema";
import type { EngineeringProfile } from "../profile/schema";
import { buildAntiPatternKeys } from "./buildAntiPatterns";
import { buildDecisionStyleKeys } from "./buildDecisionStyle";
import { buildPreferredEnvironmentKeys } from "./buildEnvironmentProfile";
import { buildPreferredPatternKeys } from "./buildPreferredPatterns";
import {
  ACCEPTED_TRADEOFF_LABELS,
  ACCEPTED_TRADEOFF_SUMMARY_PHRASES,
  ACCEPTED_TRADEOFF_SUMMARY_PHRASES_DE,
  type AcceptedTradeoff,
  ANTI_PATTERN_LABELS,
  DECISION_STYLE_LABELS,
  DECISION_STYLE_SUMMARY_PHRASES,
  DECISION_STYLE_SUMMARY_PHRASES_DE,
  DECISION_STYLE_TO_TRADEOFFS,
  type DecisionStylePattern,
  PREFERRED_ENVIRONMENT_LABELS,
  PREFERRED_ENVIRONMENT_SUMMARY_PHRASES,
  PREFERRED_ENVIRONMENT_SUMMARY_PHRASES_DE,
  PREFERRED_PATTERN_LABELS,
  type PreferredEnvironment,
  type PreferredPattern,
} from "./constants";
import type { EngineeringStyleProfile } from "./schema";

function buildAcceptedTradeoffKeys(styleKeys: DecisionStylePattern[]): AcceptedTradeoff[] {
  const seen = new Set<AcceptedTradeoff>();
  const result: AcceptedTradeoff[] = [];

  for (const styleKey of styleKeys) {
    for (const tradeoff of DECISION_STYLE_TO_TRADEOFFS[styleKey] ?? []) {
      if (!seen.has(tradeoff)) {
        seen.add(tradeoff);
        result.push(tradeoff);
      }
    }
  }

  return result;
}

function selectRepresentativeDecisions(decisions: StoredDecision[]): string[] {
  const scored = decisions.map((d) => ({
    title: d.title,
    score: d.relatedTendencies.length * 2 + d.relatedTraits.length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((d) => d.title);
}

function joinPhrase(items: string[], conjunction: "and" | "und"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

function buildSummaryEn(
  styleKeys: DecisionStylePattern[],
  tradeoffKeys: AcceptedTradeoff[],
  patternKeys: PreferredPattern[],
  envKeys: PreferredEnvironment[],
): string {
  const parts: string[] = [];

  const stylePhrases = styleKeys.slice(0, 3).map((k) => DECISION_STYLE_SUMMARY_PHRASES[k]);
  if (stylePhrases.length > 0) {
    parts.push(`Vikram tends to favor ${joinPhrase(stylePhrases, "and")}.`);
  }

  const tradeoffPhrases = tradeoffKeys.slice(0, 2).map((k) => ACCEPTED_TRADEOFF_SUMMARY_PHRASES[k]);
  const patternPhrases = patternKeys
    .slice(0, 2)
    .map((k) => PREFERRED_PATTERN_LABELS[k].toLowerCase());
  if (tradeoffPhrases.length > 0 && patternPhrases.length > 0) {
    parts.push(
      `He consistently accepts ${joinPhrase(tradeoffPhrases, "and")} when it improves ${joinPhrase(patternPhrases, "and")}.`,
    );
  } else if (tradeoffPhrases.length > 0) {
    parts.push(
      `He consistently accepts ${joinPhrase(tradeoffPhrases, "and")} for long-term system quality.`,
    );
  }

  const envPhrases = envKeys.slice(0, 2).map((k) => PREFERRED_ENVIRONMENT_SUMMARY_PHRASES[k]);
  if (envPhrases.length > 0) {
    parts.push(`His engineering approach is best suited for ${joinPhrase(envPhrases, "and")}.`);
  }

  return parts.join(" ");
}

function buildSummaryDe(
  styleKeys: DecisionStylePattern[],
  tradeoffKeys: AcceptedTradeoff[],
  patternKeys: PreferredPattern[],
  envKeys: PreferredEnvironment[],
): string {
  const parts: string[] = [];

  const stylePhrases = styleKeys.slice(0, 3).map((k) => DECISION_STYLE_SUMMARY_PHRASES_DE[k]);
  if (stylePhrases.length > 0) {
    parts.push(`Vikram bevorzugt ${joinPhrase(stylePhrases, "und")}.`);
  }

  const tradeoffPhrases = tradeoffKeys
    .slice(0, 2)
    .map((k) => ACCEPTED_TRADEOFF_SUMMARY_PHRASES_DE[k]);
  const patternPhrases = patternKeys.slice(0, 2).map((k) => PREFERRED_PATTERN_LABELS[k]);
  if (tradeoffPhrases.length > 0 && patternPhrases.length > 0) {
    parts.push(
      `Er akzeptiert konsequent ${joinPhrase(tradeoffPhrases, "und")}, wenn es ${joinPhrase(patternPhrases, "und")} verbessert.`,
    );
  } else if (tradeoffPhrases.length > 0) {
    parts.push(
      `Er akzeptiert konsequent ${joinPhrase(tradeoffPhrases, "und")} zugunsten langfristiger Systemqualität.`,
    );
  }

  const envPhrases = envKeys.slice(0, 2).map((k) => PREFERRED_ENVIRONMENT_SUMMARY_PHRASES_DE[k]);
  if (envPhrases.length > 0) {
    parts.push(`Sein Ingenieuransatz passt am besten zu ${joinPhrase(envPhrases, "und")}.`);
  }

  return parts.join(" ");
}

export function buildEngineeringStyleProfile(
  corpus: DecisionCorpus,
  engineeringProfile: EngineeringProfile | null,
  decisions: StoredDecision[],
): EngineeringStyleProfile {
  const styleKeys = buildDecisionStyleKeys(corpus, engineeringProfile);
  const patternKeys = buildPreferredPatternKeys(corpus, engineeringProfile);
  const tradeoffKeys = buildAcceptedTradeoffKeys(styleKeys);
  const antiPatternKeys = buildAntiPatternKeys(styleKeys);
  const envKeys = buildPreferredEnvironmentKeys(engineeringProfile);
  const representativeDecisions = selectRepresentativeDecisions(decisions);

  return {
    decisionStyle: styleKeys.map((k) => DECISION_STYLE_LABELS[k]),
    preferredPatterns: patternKeys.map((k) => PREFERRED_PATTERN_LABELS[k]),
    acceptedTradeoffs: tradeoffKeys.map((k) => ACCEPTED_TRADEOFF_LABELS[k]),
    antiPatterns: antiPatternKeys.map((k) => ANTI_PATTERN_LABELS[k]),
    preferredEnvironments: envKeys.map((k) => PREFERRED_ENVIRONMENT_LABELS[k]),
    representativeDecisions,
    summary_en: buildSummaryEn(styleKeys, tradeoffKeys, patternKeys, envKeys),
    summary_de: buildSummaryDe(styleKeys, tradeoffKeys, patternKeys, envKeys),
    generatedAt: new Date().toISOString(),
  };
}
