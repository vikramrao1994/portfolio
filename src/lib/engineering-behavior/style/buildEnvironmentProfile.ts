import type { EngineeringProfile } from "../profile/schema";
import {
  CORE_TRAIT_TO_ENVIRONMENTS,
  type PreferredEnvironment,
  TENDENCY_TO_ENVIRONMENTS,
} from "./constants";

export function buildPreferredEnvironmentKeys(
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

  if (!engineeringProfile) return result;

  // Core traits are the primary signal for environment fit
  for (const ct of engineeringProfile.coreTraits) {
    const envs = CORE_TRAIT_TO_ENVIRONMENTS[ct.trait] ?? [];
    for (const e of envs) add(e);
  }

  // Tendencies provide supplemental refinement
  for (const tendency of engineeringProfile.engineeringTendencies) {
    const envs = TENDENCY_TO_ENVIRONMENTS[tendency.tendency] ?? [];
    for (const e of envs) add(e);
  }

  return result;
}
