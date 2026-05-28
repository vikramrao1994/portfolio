export type Tone = "professional" | "warm" | "direct" | "modern";

export type CompanyAlignment = {
  companyTraits: string[];
  engineeringCultureSignals: string[];
  inferredPriorities: string[];
};

export type RhetoricalPlan = {
  coreNarrative: string;
  primaryStrength: string;
  secondaryStrength?: string;
  companyAlignment: string;
  toneProfile: {
    style: Tone;
    evidenceDensity: "low" | "medium" | "high";
    sentenceStyle: "balanced" | "concise" | "detailed";
  };
  paragraphGoals: Array<{
    paragraph: number;
    goal: string;
    emphasis: string;
    evidenceIds: string[];
  }>;
  writingGuidelines: string[];
};
