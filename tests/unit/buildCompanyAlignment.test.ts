import { describe, expect, test } from "bun:test";
import { buildCompanyAlignment } from "@/lib/cover-letter/rhetoric/buildCompanyAlignment";
import type { ExtractedKeywords } from "@/lib/cover-letter/types";

const EMPTY_KEYWORDS: ExtractedKeywords = {
  hardSkills: [],
  softSkills: [],
  domains: [],
  seniority: [],
  workMode: [],
  languages: [],
};

describe("buildCompanyAlignment — ownership signals", () => {
  test("German Eigenverantwortung → ownership mindset", () => {
    const result = buildCompanyAlignment({
      jobDescription: "Eigenverantwortung und eigenständige Arbeitsweise",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("ownership mindset");
  });

  test("English ownership → ownership mindset", () => {
    const result = buildCompanyAlignment({
      jobDescription: "you own your work, take ownership of features",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("ownership mindset");
  });
});

describe("buildCompanyAlignment — startup/agile signals", () => {
  test("German agiles Umfeld → startup adaptability", () => {
    const result = buildCompanyAlignment({
      jobDescription: "agiles Umfeld, dynamisches Unternehmen",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("startup adaptability");
  });

  test("English fast-paced startup → startup adaptability", () => {
    const result = buildCompanyAlignment({
      jobDescription: "fast-paced startup, series A environment",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("startup adaptability");
  });
});

describe("buildCompanyAlignment — accessibility signals", () => {
  test("German Barrierefreiheit → accessibility focus", () => {
    const result = buildCompanyAlignment({
      jobDescription: "Barrierefreiheit und WCAG-konforme Entwicklung",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("accessibility focus");
  });

  test("German barrierefrei → accessibility focus", () => {
    const result = buildCompanyAlignment({
      jobDescription: "barrierefreies Design für alle Nutzer",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("accessibility focus");
  });

  test("English accessibility → accessibility focus", () => {
    const result = buildCompanyAlignment({
      jobDescription: "accessibility and WCAG 2.1 compliance required",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("accessibility focus");
  });
});

describe("buildCompanyAlignment — product mindset signals", () => {
  test("German nutzerzentriert → product mindset", () => {
    const result = buildCompanyAlignment({
      jobDescription: "nutzerzentrierte Oberflächen und Nutzerfokus",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("product mindset");
  });

  test("English user-centric → product mindset", () => {
    const result = buildCompanyAlignment({
      jobDescription: "user-centric interfaces, product mindset required",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.companyTraits).toContain("product mindset");
  });
});

describe("buildCompanyAlignment — German/English equivalence", () => {
  test("German and English JDs with equivalent terms produce the same matched traits", () => {
    // Use only terms that have both German and English phrase entries.
    // "agiles Umfeld" maps to startup adaptability in German only (no "agile environment" entry).
    const de = buildCompanyAlignment({
      jobDescription:
        "Eigenverantwortung, Barrierefreiheit, nutzerzentrierte Oberflächen",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    const en = buildCompanyAlignment({
      jobDescription:
        "ownership, accessibility, user-centric interfaces",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(de.companyTraits).toContain("ownership mindset");
    expect(en.companyTraits).toContain("ownership mindset");
    expect(de.companyTraits).toContain("accessibility focus");
    expect(en.companyTraits).toContain("accessibility focus");
    expect(de.companyTraits).toContain("product mindset");
    expect(en.companyTraits).toContain("product mindset");
  });
});

describe("buildCompanyAlignment — engineering culture signals", () => {
  test("German Code-Reviews → collaborative code quality practices", () => {
    const result = buildCompanyAlignment({
      jobDescription: "Code-Reviews und Pull-Request-Prozess sind Standard",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.engineeringCultureSignals).toContain("collaborative code quality practices");
  });

  test("German agile/Scrum → agile delivery process", () => {
    const result = buildCompanyAlignment({
      jobDescription: "wir arbeiten agil mit Scrum und Sprint-Planung",
      extractedKeywords: EMPTY_KEYWORDS,
    });
    expect(result.engineeringCultureSignals).toContain("agile delivery process");
  });
});

describe("buildCompanyAlignment — inferred priorities from extractedKeywords", () => {
  test("frontend hard skill in extractedKeywords produces frontend craft priority", () => {
    const result = buildCompanyAlignment({
      jobDescription: "Wir entwickeln großartige Software",
      extractedKeywords: { ...EMPTY_KEYWORDS, hardSkills: ["frontend-entwicklung"] },
    });
    expect(result.inferredPriorities).toContain("frontend craft");
  });
});
