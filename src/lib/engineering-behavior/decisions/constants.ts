export const DECISION_CATEGORIES = [
  "architecture",
  "frontend",
  "backend",
  "testing",
  "developer_experience",
  "tooling",
  "process",
  "delivery",
] as const;

export type DecisionCategory = (typeof DECISION_CATEGORIES)[number];
