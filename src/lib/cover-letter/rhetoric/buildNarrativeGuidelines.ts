import type { RhetoricalPlan } from "./types";

export function buildNarrativeGuidelines(plan: RhetoricalPlan): string[] {
  return [
    ...plan.writingGuidelines,
    `Maintain this core narrative: ${plan.coreNarrative}`,
    `Lead with the primary strength: ${plan.primaryStrength}`,
    ...(plan.secondaryStrength
      ? [`Weave in the secondary strength naturally: ${plan.secondaryStrength}`]
      : []),
    `Company alignment angle: ${plan.companyAlignment} — connect your experience to their specific values, not generic praise`,
  ];
}
