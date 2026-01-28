import { z } from "zod";

export const LanguageSchema = z.enum(["en", "de"]);
export type Language = z.infer<typeof LanguageSchema>;

export const LocalizedStringSchema = z
  .object({
    en: z.string().optional(),
    de: z.string().optional(),
  })
  .refine(
    (v) =>
      (typeof v.en === "string" && v.de === undefined) ||
      (typeof v.de === "string" && v.en === undefined),
    {
      message: "Expected exactly one language key (en or de)",
    },
  );

export const TechIconSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const HeadingSchema = z.object({
  name: z.string(),
  subheadline: LocalizedStringSchema,
  headline: LocalizedStringSchema,
  address: LocalizedStringSchema,

  email: z.string(),
  phone: z.string(),

  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  instagram: z.string().optional(),

  age: z.string().optional(),
  years_of_experience: z.string().optional(),
  open_to_oppertunities: z.boolean(),
});

/* ---------- About / Summary ---------- */

export const AboutMeItemSchema = LocalizedStringSchema;
export const ExecutiveSummaryItemSchema = LocalizedStringSchema;

export const EducationItemSchema = z.object({
  school: z.string(),
  degree: z.string(),
  duration: z.string(),
  course: LocalizedStringSchema,
  location: LocalizedStringSchema,
  logo: z.string().nullable().optional(),
  certificate: z.string().nullable().optional(),
});

export const ExperienceItemSchema = z
  .object({
    company: z.string(),
    duration: z.string(),
    exact_duration: z.string().nullable().optional(),

    title: LocalizedStringSchema,
    type: LocalizedStringSchema,
    location: LocalizedStringSchema,

    logo: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    certificate: z.string().nullable().optional(),

    summary: z.array(LocalizedStringSchema),
    tech_stack: z.array(z.string()),
    tech_stack_icons: z.array(TechIconSchema),
  })
  .passthrough();

export const SkillsGroupSchema = z.object({
  key: LocalizedStringSchema,
  most_used_skills: z.array(z.string()),
  skills: z.array(z.string()),
});

export const SiteSchema = z.object({
  heading: HeadingSchema,
  about_me: z.array(AboutMeItemSchema),
  executive_summary: z.array(ExecutiveSummaryItemSchema),
  education: z.array(EducationItemSchema),
  experience: z.array(ExperienceItemSchema),
  skills: z.array(SkillsGroupSchema),
});

export type Site = z.infer<typeof SiteSchema>;
