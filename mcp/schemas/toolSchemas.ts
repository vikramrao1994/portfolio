import { z } from "zod";
import { CoverLetterContentSchema } from "@/lib/cover-letter/coverLetterContentSchema";
import { LanguageSchema, ToneSchema } from "@/lib/cover-letter/schemas";

// Shared base for tools that only need a job description + language.
// AnalyzeJobDescription and MatchCandidateEvidence have identical input shapes.
const JobDescriptionInputSchema = z.object({
  jobDescription: z.string().min(50).max(20000),
  language: LanguageSchema,
});

export const AnalyzeJobDescriptionInputSchema = JobDescriptionInputSchema;
export const MatchCandidateEvidenceInputSchema = JobDescriptionInputSchema;

export const GenerateCoverLetterPromptInputSchema = JobDescriptionInputSchema.extend({
  companyName: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
});

export const RenderCoverLetterPdfInputSchema = z.object({
  coverLetter: CoverLetterContentSchema,
});

export const GenerateCoverLetterPdfInputSchema = z.object({
  jobDescription: z.string().min(50).max(20000),
  language: LanguageSchema,
  companyName: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  recruiterName: z.string().max(100).optional(),
  tone: ToneSchema.optional(),
});

export const GenerateTailoredCvPdfInputSchema = z.object({
  jobDescription: z.string().min(100).max(20_000),
  language: LanguageSchema,
  companyName: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  tone: ToneSchema.optional(),
  filename: z.string().max(120).optional(),
});
