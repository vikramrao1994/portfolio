import { describe, expect, test } from "bun:test";
import { buildPositioningPlan } from "@/lib/application-documents/positioning/buildPositioningPlan";
import { scorePositioningArchetypes } from "@/lib/application-documents/positioning/scorePositioningArchetypes";
import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import type { CompanyAlignment, RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { ExtractedKeywords } from "@/lib/cover-letter/types";

function kw(hardSkills: string[], domains: string[] = []): ExtractedKeywords {
  return { hardSkills, softSkills: [], domains, seniority: [], workMode: [], languages: [] };
}

function alignment(
  companyTraits: string[] = [],
  inferredPriorities: string[] = [],
): CompanyAlignment {
  return { companyTraits, engineeringCultureSignals: [], inferredPriorities };
}

function rhetoricalPlan(
  coreNarrative: string,
  primaryStrength = "",
  secondaryStrength?: string,
): RhetoricalPlan {
  return {
    coreNarrative,
    primaryStrength,
    secondaryStrength,
    companyAlignment: "",
    toneProfile: { style: "professional", evidenceDensity: "medium", sentenceStyle: "balanced" },
    paragraphGoals: [],
    writingGuidelines: [],
  };
}

const NO_EVIDENCE: EvidencePackItem[] = [];

describe("scorePositioningArchetypes — signal scoring", () => {
  test("frontend signals give frontend-specialist the highest score", () => {
    const scores = scorePositioningArchetypes(
      kw(["React", "TypeScript", "Accessibility", "Component Architecture", "Design Systems"]),
      alignment(["accessibility focus"]),
      rhetoricalPlan("component architecture accessibility"),
      NO_EVIDENCE,
    );
    expect(scores["frontend-specialist"]).toBeGreaterThan(scores["ai-product-engineer"]);
    expect(scores["frontend-specialist"]).toBeGreaterThan(scores["startup-generalist"]);
    expect(scores["frontend-specialist"]).toBeGreaterThan(scores["performance-engineer"]);
  });

  test("AI/LLM/MCP signals give ai-product-engineer the highest score", () => {
    const scores = scorePositioningArchetypes(
      kw(["AI", "Machine Learning", "Automation", "Developer Tooling"]),
      alignment([], ["AI/ML engineering"]),
      rhetoricalPlan("agent automation developer tooling"),
      NO_EVIDENCE,
    );
    expect(scores["ai-product-engineer"]).toBeGreaterThan(scores["frontend-specialist"]);
    expect(scores["ai-product-engineer"]).toBeGreaterThan(scores["performance-engineer"]);
  });

  test("performance/visualization signals give performance-engineer a higher score than startup-generalist", () => {
    const scores = scorePositioningArchetypes(
      kw([]),
      alignment(["performance engineering"]),
      rhetoricalPlan("performance optimization visualization"),
      NO_EVIDENCE,
    );
    expect(scores["performance-engineer"]).toBeGreaterThan(scores["startup-generalist"]);
  });

  test("ownership/startup signals give startup-generalist a higher score than performance-engineer", () => {
    const scores = scorePositioningArchetypes(
      kw([], ["Startup"]),
      alignment(["ownership mindset", "startup adaptability"]),
      rhetoricalPlan("product thinking shipping startup ownership"),
      NO_EVIDENCE,
    );
    expect(scores["startup-generalist"]).toBeGreaterThan(scores["performance-engineer"]);
    expect(scores["startup-generalist"]).toBeGreaterThan(scores["ai-product-engineer"]);
  });

  test("German barrierefreiheit/komponentenarchitektur in narrative raises frontend-specialist score", () => {
    const scoresDE = scorePositioningArchetypes(
      kw(["Accessibility", "Component Architecture"]),
      alignment(),
      rhetoricalPlan("barrierefreiheit komponentenarchitektur"),
      NO_EVIDENCE,
    );
    const scoresEmpty = scorePositioningArchetypes(
      kw([]),
      alignment(),
      rhetoricalPlan(""),
      NO_EVIDENCE,
    );
    expect(scoresDE["frontend-specialist"]).toBeGreaterThan(scoresEmpty["frontend-specialist"]);
  });

  test("German ki/automatisierung in narrative raises ai-product-engineer score", () => {
    const scoresDE = scorePositioningArchetypes(
      kw([]),
      alignment(),
      rhetoricalPlan("ki automatisierung orchestrierung"),
      NO_EVIDENCE,
    );
    const scoresEmpty = scorePositioningArchetypes(
      kw([]),
      alignment(),
      rhetoricalPlan(""),
      NO_EVIDENCE,
    );
    expect(scoresDE["ai-product-engineer"]).toBeGreaterThan(scoresEmpty["ai-product-engineer"]);
  });

  test("evidence matchedKeywords contribute to scoring", () => {
    const evidenceWithAI: EvidencePackItem[] = [
      {
        title: "AI Tooling Project",
        type: "experience",
        score: 8,
        matchedKeywords: ["AI", "MCP", "automation"],
        matchedTerms: ["llm"],
        reason: "direct match",
        content: "Built AI tooling with MCP",
      },
    ];
    const scoresWithEvidence = scorePositioningArchetypes(
      kw([]),
      alignment(),
      rhetoricalPlan(""),
      evidenceWithAI,
    );
    const scoresWithout = scorePositioningArchetypes(kw([]), alignment(), rhetoricalPlan(""), NO_EVIDENCE);
    expect(scoresWithEvidence["ai-product-engineer"]).toBeGreaterThan(
      scoresWithout["ai-product-engineer"],
    );
  });
});

describe("buildPositioningPlan — archetype selection", () => {
  test("frontend JD → frontend-specialist", () => {
    const plan = buildPositioningPlan({
      evidencePack: NO_EVIDENCE,
      companyAlignment: alignment(["accessibility focus"]),
      rhetoricalPlan: rhetoricalPlan("component architecture accessibility"),
      extractedKeywords: kw([
        "React",
        "TypeScript",
        "Accessibility",
        "Component Architecture",
        "Design Systems",
      ]),
    });
    expect(plan.archetype).toBe("frontend-specialist");
  });

  test("AI tooling JD → ai-product-engineer", () => {
    const plan = buildPositioningPlan({
      evidencePack: NO_EVIDENCE,
      companyAlignment: alignment([], ["AI/ML engineering"]),
      rhetoricalPlan: rhetoricalPlan("agent automation developer tooling llm"),
      extractedKeywords: kw(["AI", "Machine Learning", "Automation", "Developer Tooling"]),
    });
    expect(plan.archetype).toBe("ai-product-engineer");
  });

  test("startup/ownership JD → startup-generalist", () => {
    const plan = buildPositioningPlan({
      evidencePack: NO_EVIDENCE,
      companyAlignment: alignment(["ownership mindset", "startup adaptability"]),
      rhetoricalPlan: rhetoricalPlan("product thinking shipping startup ownership end-to-end"),
      extractedKeywords: kw([], ["Startup"]),
    });
    expect(plan.archetype).toBe("startup-generalist");
  });

  test("regulated German frontend JD → frontend-specialist", () => {
    const plan = buildPositioningPlan({
      evidencePack: NO_EVIDENCE,
      companyAlignment: alignment(["accessibility focus"]),
      rhetoricalPlan: rhetoricalPlan(
        "barrierefreiheit komponentenarchitektur dsgvo frontend",
        "accessibility",
      ),
      extractedKeywords: kw([
        "Accessibility",
        "Component Architecture",
        "GDPR",
        "BundID",
        "TypeScript",
        "React",
      ]),
    });
    expect(plan.archetype).toBe("frontend-specialist");
  });

  test("plan includes primaryNarrative and secondaryNarrative strings", () => {
    const plan = buildPositioningPlan({
      evidencePack: NO_EVIDENCE,
      companyAlignment: alignment(["accessibility focus"]),
      rhetoricalPlan: rhetoricalPlan("component architecture"),
      extractedKeywords: kw(["React", "Accessibility", "Component Architecture"]),
    });
    expect(typeof plan.primaryNarrative).toBe("string");
    expect(plan.primaryNarrative.length).toBeGreaterThan(0);
    expect(typeof plan.secondaryNarrative).toBe("string");
    expect(plan.secondaryNarrative.length).toBeGreaterThan(0);
  });
});
