import { CORE_TRAIT_TO_TENDENCIES, ENGINEERING_TENDENCIES, type TendencyName } from "./constants";
import type { CoreTrait, EngineeringTendency } from "./schema";

type TendencyAcc = {
  confidences: number[];
  derivedFrom: string[];
};

export function buildEngineeringTendencies(coreTraits: CoreTrait[]): EngineeringTendency[] {
  const accumulators = new Map<TendencyName, TendencyAcc>();

  for (const ct of coreTraits) {
    const tendencies = CORE_TRAIT_TO_TENDENCIES[ct.trait] ?? [];
    for (const tendency of tendencies) {
      const acc = accumulators.get(tendency) ?? { confidences: [], derivedFrom: [] };
      acc.confidences.push(ct.confidence);
      acc.derivedFrom.push(ct.trait);
      accumulators.set(tendency, acc);
    }
  }

  return ENGINEERING_TENDENCIES.filter((name) => accumulators.has(name)).map((name) => {
    const acc = accumulators.get(name) as TendencyAcc;
    const avg = acc.confidences.reduce((a, b) => a + b, 0) / acc.confidences.length;

    return {
      tendency: name,
      confidence: Math.round(avg * 100) / 100,
      derivedFrom: acc.derivedFrom,
      supportingCoreTraits: acc.derivedFrom,
    };
  });
}
