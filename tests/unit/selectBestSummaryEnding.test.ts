import { describe, expect, test } from "bun:test";
import {
  scoreSummarySentence,
  selectBestSummaryEnding,
  truncateSummaryPreservingNarrative,
} from "@/lib/cv-tailor/selectBestSummaryEnding";
import type { PositioningPlan } from "@/lib/application-documents/positioning/types";

const MAX = 700;

function makePlan(archetype: PositioningPlan["archetype"] = "frontend-specialist"): PositioningPlan {
  return {
    archetype,
    primaryNarrative: "Frontend specialist with component architecture expertise",
    secondaryNarrative: "Strong TypeScript and accessibility foundation",
    differentiators: [
      { label: "BundID", evidenceTitle: "BundID Integration", reason: "regulated env", strength: 9 },
      { label: "DSGVO", evidenceTitle: "GDPR Compliance", reason: "data privacy", strength: 8 },
    ],
    suppressNarratives: [],
    emphasisRules: [],
  };
}

describe("truncateSummaryPreservingNarrative — under limit", () => {
  test("summary under maxLength is returned unchanged", () => {
    const summary = "Short narrative sentence about expertise and architecture.";
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "en",
      maxLength: MAX,
    });
    expect(result).toBe(summary);
  });

  test("summary exactly at maxLength is returned unchanged", () => {
    const summary = "A".repeat(MAX);
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "en",
      maxLength: MAX,
    });
    expect(result.length).toBeLessThanOrEqual(MAX);
  });
});

describe("truncateSummaryPreservingNarrative — length constraint", () => {
  test("result never exceeds maxLength", () => {
    const summary = "Sentence one about architecture and design.\n".repeat(30);
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "en",
      maxLength: MAX,
    });
    expect(result.length).toBeLessThanOrEqual(MAX);
  });

  test("German summary result never exceeds maxLength", () => {
    const summary =
      "Erfahrung mit regulierten Umgebungen: BundID-Authentifizierung und DSGVO-konforme Entwicklung.\n".repeat(
        15,
      );
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "de",
      maxLength: MAX,
    });
    expect(result.length).toBeLessThanOrEqual(MAX);
  });
});

describe("truncateSummaryPreservingNarrative — no dangling endings", () => {
  test("does not end with bare 'under'", () => {
    const summary =
      "Senior frontend engineer with expertise in component architecture and design systems under\nStrong accessibility and WCAG compliance track record built over five years of production delivery.";
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "en",
      maxLength: MAX,
    });
    expect(result.trimEnd()).not.toMatch(/\bunder$/);
  });

  test("does not end with bare 'mit'", () => {
    const summary =
      "Erfahrener Frontend-Entwickler mit\nStarke Kenntnisse in Komponentenarchitektur und Barrierefreiheit gemäß WCAG.";
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "de",
      maxLength: MAX,
    });
    expect(result.trimEnd()).not.toMatch(/\bmit$/);
  });

  test("does not end with bare 'und'", () => {
    const summary =
      "Entwicklung barrierefreier Oberflächen und\nDSGVO-konforme Datenhaltung ist Kernkompetenz.";
    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan(),
      language: "de",
      maxLength: MAX,
    });
    expect(result.trimEnd()).not.toMatch(/\bund$/);
  });
});

describe("truncateSummaryPreservingNarrative — German narrative preference", () => {
  test("prefers DSGVO/BundID narrative sentence over tech enumeration when truncating", () => {
    const narrativeSentence =
      "Erfahrung mit regulierten Umgebungen: BundID-Authentifizierung und DSGVO-konforme Entwicklung.";
    const techSentence =
      "Kenntnisse in React, TypeScript, Next.js, Docker und PostgreSQL.";
    const summary = `${narrativeSentence}\n${techSentence}`;

    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan("frontend-specialist"),
      language: "de",
      maxLength: narrativeSentence.length + 20,
    });
    expect(result).toContain("BundID");
    expect(result).toContain("DSGVO");
  });
});

describe("truncateSummaryPreservingNarrative — English narrative preference", () => {
  test("prefers narrative sentence over tech enumeration when truncating", () => {
    const narrativeSentence =
      "Frontend specialist with deep component architecture expertise delivering accessible, production-quality interfaces.";
    const techSentence = "Strong in React, TypeScript, Next.js, Docker, and PostgreSQL.";
    const summary = `${narrativeSentence}\n${techSentence}`;

    const result = truncateSummaryPreservingNarrative({
      summary,
      positioningPlan: makePlan("frontend-specialist"),
      language: "en",
      maxLength: narrativeSentence.length + 20,
    });
    expect(result).toContain("architecture");
  });
});

describe("scoreSummarySentence — German signals", () => {
  test("sentence with DSGVO scores higher than tech-only sentence in German", () => {
    const plan = makePlan("frontend-specialist");
    const narrative = "DSGVO-konforme Entwicklung mit Eigenverantwortung und Barrierefreiheit.";
    const techOnly = "React, TypeScript, Docker, Node.js, PostgreSQL.";

    const narrativeScore = scoreSummarySentence({ sentence: narrative, positioningPlan: plan, language: "de" });
    const techScore = scoreSummarySentence({ sentence: techOnly, positioningPlan: plan, language: "de" });
    expect(narrativeScore).toBeGreaterThan(techScore);
  });
});

describe("scoreSummarySentence — English signals", () => {
  test("sentence with ownership/architecture scores higher than tech-only in English", () => {
    const plan = makePlan("frontend-specialist");
    const narrative = "Designed and delivered accessible component architecture with ownership.";
    const techOnly = "React, TypeScript, Node.js, Docker, PostgreSQL.";

    const narrativeScore = scoreSummarySentence({ sentence: narrative, positioningPlan: plan, language: "en" });
    const techScore = scoreSummarySentence({ sentence: techOnly, positioningPlan: plan, language: "en" });
    expect(narrativeScore).toBeGreaterThan(techScore);
  });
});

describe("selectBestSummaryEnding — empty input", () => {
  test("returns null for empty sentences array", () => {
    expect(selectBestSummaryEnding([], makePlan(), "en", MAX)).toBeNull();
  });

  test("returns null when all candidates exceed maxLength", () => {
    const sentences = ["A".repeat(800), "B".repeat(900)];
    expect(selectBestSummaryEnding(sentences, makePlan(), "en", 50)).toBeNull();
  });
});
