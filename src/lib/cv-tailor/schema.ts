import { z } from "zod";

export const CvSummarySuggestionSchema = z.object({
  language: z.enum(["en", "de"]),

  headline: z.string().min(20).max(180),

  executiveSummary: z.string().min(120).max(700),

  emphasis: z.array(z.string()).min(1).max(6),

  matchedEvidence: z
    .array(
      z.object({
        title: z.string(),
        type: z.string(),
        reason: z.string(),
      }),
    )
    .max(8),
});

export type CvSummarySuggestion = z.infer<typeof CvSummarySuggestionSchema>;

export const CV_SUMMARY_SCHEMA_DESCRIPTION = `{
  "language": "<en or de>",
  "headline": "<tailored professional headline, 20–180 characters>",
  "executiveSummary": "<tailored executive summary prose, 120–700 characters, use \\n to separate distinct bullet points>",
  "emphasis": ["<key theme 1>", "<key theme 2>"],
  "matchedEvidence": [
    { "title": "<evidence title>", "type": "<type>", "reason": "<why it was used>" }
  ]
}`;
