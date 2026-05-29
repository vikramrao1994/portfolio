export type PositioningArchetype =
  | "frontend-specialist"
  | "full-stack-builder"
  | "ai-product-engineer"
  | "performance-engineer"
  | "startup-generalist";

export type PositioningPlan = {
  archetype: PositioningArchetype;
  primaryNarrative: string;
  secondaryNarrative: string;
  differentiators: Array<{
    label: string;
    evidenceTitle: string;
    reason: string;
    strength: number;
  }>;
  suppressNarratives: string[];
  emphasisRules: string[];
};
