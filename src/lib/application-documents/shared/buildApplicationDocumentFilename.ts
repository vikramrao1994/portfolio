export function buildApplicationDocumentFilename({
  candidateName,
  companyName,
  language,
  documentType,
}: {
  candidateName: string;
  companyName?: string;
  language: "en" | "de";
  documentType: "cv" | "cover-letter";
}): string {
  const sanitize = (s: string): string =>
    s
      .replace(/[^\w\s]/g, " ")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 60);

  const namePart = sanitize(candidateName) || "Candidate";
  const rawCompany = companyName ? sanitize(companyName) : "";
  const companyPart = rawCompany || "Application";
  const langPart = language.toUpperCase();
  const typePart = documentType === "cv" ? "CV" : "COVER_LETTER";

  return `${namePart}_${companyPart}_${langPart}_${typePart}.pdf`;
}
