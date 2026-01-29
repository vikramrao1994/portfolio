import { SiteSchema } from "@/lib/siteSchema";
import {
  getAboutMe,
  getEducation,
  getExecutiveSummary,
  getExperience,
  getHeading,
  getSkills,
} from "@/server/queries/site";

export type Language = "en" | "de";

export const getSiteContent = async (language: Language) => {
  const heading = getHeading(language);
  const aboutMe = getAboutMe(language);
  const education = getEducation(language);
  const executiveSummary = getExecutiveSummary(language);
  const experience = getExperience(language);
  const skills = getSkills(language);
  const undefIfNull = <T>(v: T | null | undefined) => (v === null ? undefined : v);

  const SITE = {
    heading: {
      name: heading?.name ?? "",
      subheadline: { [language]: heading?.subheadline ?? "" },
      headline: { [language]: heading?.headline ?? "" },
      address: { [language]: heading?.address ?? "" },

      email: heading?.email ?? "",
      phone: heading?.phone ?? "",
      website: heading?.website ?? "",
      linkedin: heading?.linkedin ?? "",
      github: heading?.github ?? "",
      instagram: heading?.instagram ?? "",

      age: heading?.age ?? "",
      years_of_experience: heading?.yearsOfExperience ?? "",
      open_to_oppertunities: heading?.openToOpportunities ?? false,
    },

    about_me: aboutMe.map((p) => ({
      [language]: p.text,
    })),

    executive_summary: executiveSummary.map((t) => ({
      [language]: t,
    })),

    education: education.map((e) => ({
      school: e.school,
      degree: e.degree,
      duration: e.duration,
      course: { [language]: e.course },
      location: { [language]: e.location },
      logo: undefIfNull(e.logo),
      certificate: undefIfNull(e.certificate),
    })),

    experience: experience.map((e) => ({
      company: e.company,
      duration: e.duration,
      exact_duration: undefIfNull(e.exactDuration),

      title: { [language]: e.title },
      type: { [language]: e.type },
      location: { [language]: e.location },

      logo: undefIfNull(e.logo),
      link: undefIfNull(e.link),
      certificate: undefIfNull(e.certificate),

      summary: e.summary.map((s) => ({ [language]: s })),
      tech_stack: e.techStack,
      tech_stack_icons: e.techIcons,

      ...e.meta,
    })),

    skills: skills.map((g) => ({
      key: { [language]: g.key },
      most_used_skills: g.mostUsed,
      skills: g.other,
    })),
  };

  const parsed = SiteSchema.safeParse(SITE);
  if (!parsed.success) {
    console.error(parsed.error.issues);
    throw new Error("SITE schema validation failed");
  }
  return parsed.data;
};

export default getSiteContent;
