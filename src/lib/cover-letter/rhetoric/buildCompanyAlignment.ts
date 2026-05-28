import type { ExtractedKeywords } from "../types";
import {
  COMPANY_TRAIT_SIGNALS,
  ENGINEERING_CULTURE_SIGNALS,
  INFERRED_PRIORITY_SIGNALS,
} from "./constants";
import type { CompanyAlignment } from "./types";

function matchesAny(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p.toLowerCase()));
}

export function buildCompanyAlignment({
  jobDescription,
  extractedKeywords,
}: {
  jobDescription: string;
  extractedKeywords: ExtractedKeywords;
}): CompanyAlignment {
  const companyTraits = COMPANY_TRAIT_SIGNALS.filter((s) =>
    matchesAny(jobDescription, s.phrases),
  ).map((s) => s.value);

  const engineeringCultureSignals = ENGINEERING_CULTURE_SIGNALS.filter((s) =>
    matchesAny(jobDescription, s.phrases),
  ).map((s) => s.value);

  // Check JD text first, then fall back to extracted hard skills for priority inference
  const kwText = extractedKeywords.hardSkills.join(" ");
  const inferredPriorities = [
    ...new Set(
      INFERRED_PRIORITY_SIGNALS.filter(
        (s) => matchesAny(jobDescription, s.phrases) || matchesAny(kwText, s.phrases),
      ).map((s) => s.value),
    ),
  ];

  return { companyTraits, engineeringCultureSignals, inferredPriorities };
}
