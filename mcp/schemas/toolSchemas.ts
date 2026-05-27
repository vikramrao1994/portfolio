import { z } from "zod";
import { CoverLetterContentSchema } from "@/lib/cover-letter/coverLetterContentSchema";

export const AnalyzeJobDescriptionInputSchema = z.object({
  jobDescription: z.string().min(50).max(20000),
  language: z.enum(["en", "de"]),
});

export const MatchCandidateEvidenceInputSchema = z.object({
  jobDescription: z.string().min(50).max(20000),
  language: z.enum(["en", "de"]),
});

export const GenerateCoverLetterPromptInputSchema = z.object({
  jobDescription: z.string().min(50).max(20000),
  language: z.enum(["en", "de"]),
  companyName: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
});

export const RenderCoverLetterPdfInputSchema = z.object({
  coverLetter: CoverLetterContentSchema,
});

export const GenerateCoverLetterPdfInputSchema = z.object({
  jobDescription: z.string().min(50).max(20000),
  language: z.enum(["en", "de"]),
  companyName: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  recruiterName: z.string().max(100).optional(),
  tone: z.enum(["professional", "warm", "direct", "modern"]).optional(),
});
