export const CORE_TRAITS = [
  "structured_problem_solving",
  "autonomous_execution",
  "engineering_quality",
  "collaborative_delivery",
  "continuous_growth",
] as const;

export type CoreTraitName = (typeof CORE_TRAITS)[number];

export const ENGINEERING_TENDENCIES = [
  "prefers_structured_solutions",
  "comfortable_with_autonomy",
  "prioritizes_maintainability",
  "embraces_continuous_learning",
  "values_cross_functional_collaboration",
] as const;

export type TendencyName = (typeof ENGINEERING_TENDENCIES)[number];

// Raw behavior trait → consolidated core trait
export const TRAIT_TO_CORE_TRAIT: Record<string, CoreTraitName> = {
  structured_problem_solving: "structured_problem_solving",
  systems_thinking: "structured_problem_solving",
  architectural_thinking: "structured_problem_solving",
  ownership: "autonomous_execution",
  initiative: "autonomous_execution",
  execution_under_pressure: "autonomous_execution",
  reliability: "engineering_quality",
  quality_focus: "engineering_quality",
  documentation_mindset: "engineering_quality",
  communication: "collaborative_delivery",
  collaboration: "collaborative_delivery",
  stakeholder_focus: "collaborative_delivery",
  mentorship: "collaborative_delivery",
  adaptability: "continuous_growth",
  continuous_learning: "continuous_growth",
};

// Core trait → engineering tendencies it contributes to
export const CORE_TRAIT_TO_TENDENCIES: Record<CoreTraitName, TendencyName[]> = {
  structured_problem_solving: ["prefers_structured_solutions"],
  autonomous_execution: ["comfortable_with_autonomy"],
  engineering_quality: ["prioritizes_maintainability", "prefers_structured_solutions"],
  collaborative_delivery: ["values_cross_functional_collaboration"],
  continuous_growth: ["embraces_continuous_learning"],
};
