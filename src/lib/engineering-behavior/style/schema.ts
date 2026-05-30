import { z } from "zod";

export const EngineeringStyleProfileSchema = z.object({
  decisionStyle: z.array(z.string()),
  preferredPatterns: z.array(z.string()),
  acceptedTradeoffs: z.array(z.string()),
  antiPatterns: z.array(z.string()),
  preferredEnvironments: z.array(z.string()),
  representativeDecisions: z.array(z.string()),
  summary_en: z.string(),
  summary_de: z.string(),
  generatedAt: z.string(),
});

export type EngineeringStyleProfile = z.infer<typeof EngineeringStyleProfileSchema>;
