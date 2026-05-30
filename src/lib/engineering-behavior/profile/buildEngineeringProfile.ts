import type { EngineeringBehaviorProfile } from "../schema";
import { buildCoreTraits } from "./buildCoreTraits";
import { buildEngineeringTendencies } from "./buildEngineeringTendencies";
import type { EngineeringProfile } from "./schema";

export function buildEngineeringProfile(
  behaviorProfile: EngineeringBehaviorProfile,
): EngineeringProfile {
  const coreTraits = buildCoreTraits(behaviorProfile.traits);
  const engineeringTendencies = buildEngineeringTendencies(coreTraits);

  return {
    coreTraits,
    engineeringTendencies,
    summary_en: behaviorProfile.summary_en,
    summary_de: behaviorProfile.summary_de,
    generatedAt: new Date().toISOString(),
  };
}
