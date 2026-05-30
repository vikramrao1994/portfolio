import { z } from "zod";
import { CORE_TRAITS, ENGINEERING_TENDENCIES } from "./constants";

export const CoreTraitSchema = z.object({
  trait: z.enum(CORE_TRAITS),
  confidence: z.number().min(0).max(1),
  supportingTraits: z.array(z.string()),
  supportingEvidence: z.array(z.string()),
  sourceDocuments: z.array(z.string()),
});

export type CoreTrait = z.infer<typeof CoreTraitSchema>;

export const EngineeringTendencySchema = z.object({
  tendency: z.enum(ENGINEERING_TENDENCIES),
  confidence: z.number().min(0).max(1),
  derivedFrom: z.array(z.string()),
  supportingCoreTraits: z.array(z.string()),
});

export type EngineeringTendency = z.infer<typeof EngineeringTendencySchema>;

export const EngineeringProfileSchema = z.object({
  coreTraits: z.array(CoreTraitSchema),
  engineeringTendencies: z.array(EngineeringTendencySchema),
  summary_en: z.string(),
  summary_de: z.string(),
  generatedAt: z.string(),
});

export type EngineeringProfile = z.infer<typeof EngineeringProfileSchema>;
