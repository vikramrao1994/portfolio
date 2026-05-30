import { z } from "zod";
import { DECISION_CATEGORIES } from "./constants";

export const EngineeringDecisionSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(DECISION_CATEGORIES),
  situation: z.string().min(1),
  optionsConsidered: z.array(z.string().min(1)).min(1),
  chosenOption: z.string().min(1),
  rationale: z.array(z.string().min(1)).min(1),
  tradeoffs: z.array(z.string()),
  relatedTraits: z.array(z.string()),
  relatedTendencies: z.array(z.string()),
  evidenceSource: z.string().optional(),
});

export type EngineeringDecision = z.infer<typeof EngineeringDecisionSchema>;

export const StoredDecisionSchema = EngineeringDecisionSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StoredDecision = z.infer<typeof StoredDecisionSchema>;
