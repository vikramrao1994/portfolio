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

  paragraphs: z
    .array(z.string().min(40).max(900))
    .min(3)
    .max(5),

  closing: z.string().min(2).max(120),

  signatureName: z.string().min(2).max(120),
});

export type CoverLetterContent = z.infer<typeof CoverLetterContentSchema>;
