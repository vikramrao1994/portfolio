import type { Language } from "@/lib/cover-letter/schemas";
import type { Site } from "@/lib/siteSchema";
import type { CvSummarySuggestion } from "./schema";

export function buildTailoredCvPayload(
  siteContent: Site,
  suggestion: CvSummarySuggestion,
  language: Language,
): Site {
  const tailoredHeadline =
    language === "de" ? { de: suggestion.headline } : { en: suggestion.headline };

  // Split summary into individual bullet items on newlines; fall back to single item.
  const summaryLines = suggestion.executiveSummary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const tailoredSummary =
    summaryLines.length > 0
      ? summaryLines.map((line) => (language === "de" ? { de: line } : { en: line }))
      : [language === "de" ? { de: suggestion.executiveSummary } : { en: suggestion.executiveSummary }];

  return {
    ...siteContent,
    heading: {
      ...siteContent.heading,
      headline: tailoredHeadline,
    },
    executive_summary: tailoredSummary,
  };
}
