import type { BehaviorTrait } from "../schema";
import { CORE_TRAITS, type CoreTraitName, TRAIT_TO_CORE_TRAIT } from "./constants";
import type { CoreTrait } from "./schema";

type Acc = {
  confidences: number[];
  supportingTraits: string[];
  supportingEvidence: string[];
  sourceDocuments: Set<string>;
};

export function buildCoreTraits(traits: BehaviorTrait[]): CoreTrait[] {
  const accumulators = new Map<CoreTraitName, Acc>();

  for (const t of traits) {
    const coreName = TRAIT_TO_CORE_TRAIT[t.trait];
    if (!coreName) continue;

    const acc = accumulators.get(coreName) ?? {
      confidences: [],
      supportingTraits: [],
      supportingEvidence: [],
      sourceDocuments: new Set<string>(),
    };

    acc.confidences.push(t.confidence);
    acc.supportingTraits.push(t.trait);
    acc.supportingEvidence.push(t.evidence);
    acc.sourceDocuments.add(t.sourceDocument);

    accumulators.set(coreName, acc);
  }

  return CORE_TRAITS.filter((name) => accumulators.has(name)).map((name) => {
    const acc = accumulators.get(name) as Acc;
    const avg = acc.confidences.reduce((a, b) => a + b, 0) / acc.confidences.length;

    return {
      trait: name,
      confidence: Math.round(avg * 100) / 100,
      supportingTraits: [...new Set(acc.supportingTraits)],
      supportingEvidence: acc.supportingEvidence,
      sourceDocuments: [...acc.sourceDocuments],
    };
  });
}
