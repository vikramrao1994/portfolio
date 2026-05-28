import { z } from "zod";

export const CoverLetterContentSchema = z.object({
  language: z.enum(["en", "de"]),

  recipient: z.object({
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    addressLines: z.array(z.string()).max(5).optional(),
  }),

  subject: z.string().min(5).max(160),

  salutation: z.string().min(2).max(120),

  paragraphs: z.array(z.string().min(40).max(1500)).min(3).max(5),

  closing: z.string().min(2).max(120),

  signatureName: z.string().min(2).max(120),
});

export type CoverLetterContent = z.infer<typeof CoverLetterContentSchema>;

/**
 * Human-readable schema description passed to Claude in the generation prompt.
 * Keep this in sync with CoverLetterContentSchema above — both live here so
 * a change to the Zod schema surfaces directly next to the description that
 * must match it.
 *
 * Note: paragraph max here (900 chars) is intentionally stricter than the Zod
 * ceiling (1500 chars). The prompt guides Claude toward concise paragraphs;
 * the schema is the last-resort safety net.
 */
export const COVER_LETTER_CONTENT_SCHEMA_DESCRIPTION = `{
  "language": "<en or de>",
  "recipient": {
    "companyName": "<company name, or omit if unknown>",
    "contactName": "<recruiter/contact name, or omit if unknown>",
    "addressLines": ["<street>", "<city, postcode>"]
  },
  "subject": "<formal subject line, 5-160 characters>",
  "salutation": "<formal greeting ending with comma, 2-120 characters>",
  "paragraphs": [
    "<paragraph 1 — 40-900 characters>",
    "<paragraph 2 — 40-900 characters>",
    "<paragraph 3 — 40-900 characters>"
  ],
  "closing": "<formal sign-off ending with comma, 2-120 characters>",
  "signatureName": "<full name, 2-120 characters>"
}`;
