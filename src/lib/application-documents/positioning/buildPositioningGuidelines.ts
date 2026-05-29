import type { PositioningPlan } from "./types";

export function buildPositioningGuidelines(plan: PositioningPlan): string {
  const diffLines = plan.differentiators
    .map((d, i) => `  ${i + 1}. ${d.label} (${d.evidenceTitle}, strength: ${d.strength})`)
    .join("\n");

  const suppressLines = plan.suppressNarratives.map((s) => `  - ${s}`).join("\n");
  const emphasisLines = plan.emphasisRules.map((e) => `  - ${e}`).join("\n");

  return [
    `ARCHETYPE: ${plan.archetype}`,
    "",
    `PRIMARY NARRATIVE: ${plan.primaryNarrative}`,
    "",
    `SECONDARY NARRATIVE: ${plan.secondaryNarrative}`,
    "",
    "DIFFERENTIATORS:",
    diffLines,
    "",
    "SUPPRESS:",
    suppressLines,
    "",
    "EMPHASIZE:",
    emphasisLines,
  ].join("\n");
}
