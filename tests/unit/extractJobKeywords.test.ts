import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";

const FIXTURES = path.join(import.meta.dir, "../fixtures/application-documents");
const load = (name: string) => readFileSync(path.join(FIXTURES, name), "utf8");

describe("extractJobKeywords — German hard skill aliases", () => {
  test("barrierefreiheit → Accessibility", () => {
    expect(extractJobKeywords("Barrierefreiheit ist Pflicht").hardSkills).toContain("Accessibility");
  });

  test("barrierefrei → Accessibility", () => {
    expect(extractJobKeywords("barrierefreies Design").hardSkills).toContain("Accessibility");
  });

  test("komponentenarchitektur → Component Architecture", () => {
    expect(extractJobKeywords("Komponentenarchitektur für Designsysteme").hardSkills).toContain(
      "Component Architecture",
    );
  });

  test("informationsarchitektur → Information Architecture", () => {
    expect(extractJobKeywords("Informationsarchitektur und UX").hardSkills).toContain(
      "Information Architecture",
    );
  });

  test("ki → AI", () => {
    expect(extractJobKeywords("Erfahrung mit KI und LLMs").hardSkills).toContain("AI");
  });

  test("automatisierung → Automation", () => {
    expect(extractJobKeywords("Automatisierung von Prozessen").hardSkills).toContain("Automation");
  });

  test("qualitätssicherung → Quality Assurance", () => {
    expect(extractJobKeywords("Qualitätssicherung und Testing").hardSkills).toContain(
      "Quality Assurance",
    );
  });

  test("dsgvo → GDPR", () => {
    expect(extractJobKeywords("DSGVO-konforme Entwicklung").hardSkills).toContain("GDPR");
  });

  test("bundid → BundID", () => {
    expect(extractJobKeywords("BundID-Authentifizierung erforderlich").hardSkills).toContain(
      "BundID",
    );
  });

  test("designsystem → Design Systems", () => {
    expect(extractJobKeywords("Erfahrung mit Designsystem und Tokens").hardSkills).toContain(
      "Design Systems",
    );
  });
});

describe("extractJobKeywords — German soft skill aliases", () => {
  test("eigenverantwortung → Ownership", () => {
    expect(extractJobKeywords("Eigenverantwortung erwünscht").softSkills).toContain("Ownership");
  });

  test("eigenverantwortlich → Ownership", () => {
    expect(extractJobKeywords("du arbeitest eigenverantwortlich im Team").softSkills).toContain("Ownership");
  });

  test("zusammenarbeit → Collaboration", () => {
    expect(extractJobKeywords("enge Zusammenarbeit im Team").softSkills).toContain("Collaboration");
  });

  test("eigeninitiative → Initiative", () => {
    expect(extractJobKeywords("Eigeninitiative und Motivation").softSkills).toContain("Initiative");
  });
});

describe("extractJobKeywords — German/English conceptual equivalence", () => {
  test("Barrierefreiheit and accessibility both yield Accessibility", () => {
    const de = extractJobKeywords("Barrierefreiheit gemäß WCAG");
    const en = extractJobKeywords("accessibility and WCAG compliance");
    expect(de.hardSkills).toContain("Accessibility");
    expect(en.hardSkills).toContain("Accessibility");
  });

  test("Eigenverantwortung and ownership both yield Ownership", () => {
    const de = extractJobKeywords("Eigenverantwortung und Initiative");
    const en = extractJobKeywords("ownership mindset required");
    expect(de.softSkills).toContain("Ownership");
    expect(en.softSkills).toContain("Ownership");
  });

  test("KI yields AI (German alias; English 'AI' has no direct dict entry)", () => {
    // Only the German alias ki maps to "AI" — there is no English 'ai' entry in the dict.
    expect(extractJobKeywords("KI-gestützte Entwicklung").hardSkills).toContain("AI");
  });

  test("Automatisierung and automation both yield Automation", () => {
    const de = extractJobKeywords("Automatisierung von Build-Prozessen");
    const en = extractJobKeywords("automation of build processes");
    expect(de.hardSkills).toContain("Automation");
    expect(en.hardSkills).toContain("Automation");
  });

  test("DSGVO and GDPR both yield GDPR", () => {
    const de = extractJobKeywords("DSGVO-konform");
    const en = extractJobKeywords("GDPR compliance required");
    expect(de.hardSkills).toContain("GDPR");
    expect(en.hardSkills).toContain("GDPR");
  });
});

describe("extractJobKeywords — fixture files", () => {
  test("jd-frontend-de.txt extracts Accessibility, Component Architecture, Quality Assurance", () => {
    const result = extractJobKeywords(load("jd-frontend-de.txt"));
    expect(result.hardSkills).toContain("Accessibility");
    expect(result.hardSkills).toContain("Component Architecture");
    expect(result.hardSkills).toContain("Quality Assurance");
  });

  test("jd-regulated-de.txt extracts GDPR, BundID, Accessibility", () => {
    const result = extractJobKeywords(load("jd-regulated-de.txt"));
    expect(result.hardSkills).toContain("GDPR");
    expect(result.hardSkills).toContain("BundID");
    expect(result.hardSkills).toContain("Accessibility");
  });

  test("jd-ai-de.txt extracts AI and Automation", () => {
    const result = extractJobKeywords(load("jd-ai-de.txt"));
    expect(result.hardSkills).toContain("AI");
    expect(result.hardSkills).toContain("Automation");
  });

  test("jd-frontend-de.txt and jd-frontend-en.txt produce overlapping hard skills", () => {
    const de = extractJobKeywords(load("jd-frontend-de.txt"));
    const en = extractJobKeywords(load("jd-frontend-en.txt"));
    const deSet = new Set(de.hardSkills);
    const overlap = en.hardSkills.filter((s) => deSet.has(s));
    expect(overlap.length).toBeGreaterThan(0);
  });
});
