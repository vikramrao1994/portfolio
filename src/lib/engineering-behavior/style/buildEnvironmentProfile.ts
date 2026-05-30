import type { DecisionCorpus } from "../decisions/buildDecisionCorpus";
import type { EngineeringProfile } from "../profile/schema";
import { sortByFrequency } from "./aggregateTagKeys";
import {
  CORE_TRAIT_TO_ENVIRONMENTS,
  PREFERRED_ENVIRONMENTS,
  type PreferredEnvironment,
  TENDENCY_TO_ENVIRONMENTS,
} from "./constants";

export function buildPreferredEnvironmentKeys(
  corpus: DecisionCorpus,
  engineeringProfile: EngineeringProfile | null,
): PreferredEnvironment[] {
  const seen = new Set<PreferredEnvironment>();
  const result: PreferredEnvironment[] = [];

  function add(env: PreferredEnvironment) {
    if (!seen.has(env)) {
      seen.add(env);
      result.push(env);
    }
  }

  // Primary: explicit environment tags from the decision corpus (frequency-ranked)
  for (const e of sortByFrequency(corpus.preferredEnvironmentCounts, PREFERRED_ENVIRONMENTS)) {
    add(e);
  }

  // Supplemental: core traits + tendencies always applied on top
  if (engineeringProfile) {
    for (const ct of engineeringProfile.coreTraits) {
      for (const e of CORE_TRAIT_TO_ENVIRONMENTS[ct.trait] ?? []) add(e);
    }
    for (const tendency of engineeringProfile.engineeringTendencies) {
      for (const e of TENDENCY_TO_ENVIRONMENTS[tendency.tendency] ?? []) add(e);
    }
  }

  return result;
}
