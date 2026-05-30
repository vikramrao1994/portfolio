import { z } from "zod";

export const ENGINEERING_BEHAVIOR_TRAITS = [
  "structured_problem_solving",
  "systems_thinking",
  "architectural_thinking",
  "ownership",
  "initiative",
  "reliability",
  "quality_focus",
  "communication",
  "collaboration",
  "stakeholder_focus",
  "adaptability",
  "continuous_learning",
  "execution_under_pressure",
  "documentation_mindset",
  "mentorship",
] as const;

export type TraitName = (typeof ENGINEERING_BEHAVIOR_TRAITS)[number];

export const TRAIT_CATEGORIES = [
  "problem_solving",
  "ownership",
  "communication",
  "leadership",
  "engineering_quality",
  "decision_making",
  "collaboration",
  "adaptability",
] as const;

export type TraitCategory = (typeof TRAIT_CATEGORIES)[number];

export const SOURCE_TYPES = [
  "employment_certificate",
  "reference_letter",
  "recommendation_letter",
  "linkedin_recommendation",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const RELATIONSHIP_OPTIONS = [
  "Manager",
  "Team Lead",
  "CTO",
  "Engineering Manager",
  "Architect",
  "Product Owner",
  "Product Manager",
  "Senior Engineer",
  "Engineer",
  "Peer",
  "Founder",
  "Director",
  "Other",
] as const;

export type Relationship = (typeof RELATIONSHIP_OPTIONS)[number];

export const BehaviorTraitSchema = z.object({
  trait: z.enum(ENGINEERING_BEHAVIOR_TRAITS),
  category: z.enum(TRAIT_CATEGORIES),
  confidence: z.number().min(0).max(1),
  evidence: z.string().min(1),
  evidenceLanguage: z.enum(["de", "en"]),
  sourceDocument: z.string().min(1),
  sourceType: z.enum(SOURCE_TYPES),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  company: z.string().optional(),
  relationship: z.string().optional(),
});

export type BehaviorTrait = z.infer<typeof BehaviorTraitSchema>;

export const LinkedInRecommendationSchema = z.object({
  id: z.number(),
  authorName: z.string().nullable(),
  authorRole: z.string().nullable(),
  company: z.string().nullable(),
  relationship: z.string().nullable(),
  recommendationText: z.string().min(1),
  createdAt: z.string(),
});

export type LinkedInRecommendation = z.infer<typeof LinkedInRecommendationSchema>;

export const ClaudeExtractionResponseSchema = z.object({
  traits: z.array(BehaviorTraitSchema).min(1),
  summary_en: z.string().min(1),
  summary_de: z.string().min(1),
});

export const EngineeringBehaviorProfileSchema = ClaudeExtractionResponseSchema.extend({
  extractedAt: z.string(),
});

export type EngineeringBehaviorProfile = z.infer<typeof EngineeringBehaviorProfileSchema>;
