import { z } from "zod";
import {
  ACCEPTED_TRADEOFFS,
  ANTI_PATTERNS,
  DECISION_STYLE_PATTERNS,
  PREFERRED_ENVIRONMENTS,
  PREFERRED_PATTERNS,
} from "../style/constants";
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
  styleSignals: z.array(z.enum(DECISION_STYLE_PATTERNS)).default([]),
  preferredPatterns: z.array(z.enum(PREFERRED_PATTERNS)).default([]),
  acceptedTradeoffs: z.array(z.enum(ACCEPTED_TRADEOFFS)).default([]),
  antiPatterns: z.array(z.enum(ANTI_PATTERNS)).default([]),
  preferredEnvironments: z.array(z.enum(PREFERRED_ENVIRONMENTS)).default([]),
});

export type EngineeringDecision = z.infer<typeof EngineeringDecisionSchema>;

export const StoredDecisionSchema = EngineeringDecisionSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StoredDecision = z.infer<typeof StoredDecisionSchema>;
