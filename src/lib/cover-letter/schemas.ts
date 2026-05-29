import { z } from "zod";

export const LanguageSchema = z.enum(["en", "de"]);
export type Language = z.infer<typeof LanguageSchema>;

export const ToneSchema = z.enum(["professional", "warm", "direct", "modern"]);
export type Tone = z.infer<typeof ToneSchema>;

// Canonical cover-letter request shared by API routes and MCP tools.
// API routes extend this with stricter field constraints (e.g. min(100) on jobDescription).
// z.infer  → post-default type: tone and includeFullCandidateData are required
// z.input  → pre-default type: tone and includeFullCandidateData are optional (used as service input)
export const CoverLetterRequestSchema = z.object({
  jobDescription: z.string().min(1).max(20_000),
  language: LanguageSchema,
  companyName: z.string().max(120).optional(),
  jobTitle: z.string().max(120).optional(),
  recruiterName: z.string().max(120).optional(),
  tone: ToneSchema.default("professional"),
  includeFullCandidateData: z.boolean().default(false),
});

export type CoverLetterRequest = z.infer<typeof CoverLetterRequestSchema>;

// Must stay compatible with scripts/cover-letter/main.py
export const CoverLetterPdfPayloadSchema = z.object({
  language: LanguageSchema,
  sender: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().optional(),
  }),
  recipient: z.object({
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    addressLines: z.array(z.string()).optional(),
  }),
  date: z.string(),
  subject: z.string(),
  salutation: z.string(),
  paragraphs: z.array(z.string()),
  closing: z.string(),
  signatureName: z.string(),
  // Server-controlled only — never accepted from Claude output, request body, or MCP input
  signature: z
    .object({
      enabled: z.boolean(),
      imageUrl: z.string().url(),
    })
    .optional(),
});

export type CoverLetterPdfPayload = z.infer<typeof CoverLetterPdfPayloadSchema>;
