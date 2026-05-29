import type { Site } from "@/lib/siteSchema";

export const PROFILE_LANGUAGE_PROFICIENCY = "English (C2) • German (A2)";

/**
 * Appends language proficiency to the CV headline before PDF rendering.
 * The renderer stays unaware — it renders whatever headline string it receives.
 */
export function appendLanguageProficiency(site: Site): Site {
  if (!site.heading) return site;
  const { headline } = site.heading;
  if (!headline) return site;

  if (headline.en !== undefined) {
    return {
      ...site,
      heading: {
        ...site.heading,
        headline: { en: `${headline.en} | ${PROFILE_LANGUAGE_PROFICIENCY}` },
      },
    };
  }
  if (headline.de !== undefined) {
    return {
      ...site,
      heading: {
        ...site.heading,
        headline: { de: `${headline.de} | ${PROFILE_LANGUAGE_PROFICIENCY}` },
      },
    };
  }
  return site;
}
