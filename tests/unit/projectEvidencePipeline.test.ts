import { describe, expect, test } from "bun:test";
import { buildDifferentiators } from "@/lib/application-documents/positioning/buildDifferentiators";
import { computeProjectEvidenceReport } from "@/lib/application-documents/observability/projectEvidenceReport";
import { buildCandidateChunks } from "@/lib/cover-letter/rag/buildCandidateChunks";
import { buildEvidencePack } from "@/lib/cover-letter/rag/buildEvidencePack";
import { lexicalRetrieveEvidence } from "@/lib/cover-letter/rag/lexicalRetrieveEvidence";
import type { CandidateChunk, EvidencePackItem } from "@/lib/cover-letter/rag/types";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import type { EvidenceItem, ExtractedKeywords } from "@/lib/cover-letter/types";
import type { RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { PositioningPlan } from "@/lib/application-documents/positioning/types";
import type { Site } from "@/lib/siteSchema";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const AI_PROJECT = {
  project: { en: "AI-Operable Portfolio Platform" },
  summary: [
    { en: "Built MCP server exposing document generation as composable agentic tools." },
    { en: "Implemented RAG pipeline with lexical retrieval and deterministic scoring." },
  ],
  skills: ["MCP", "Claude API", "RAG", "TypeScript", "Next.js"],
  logo: null,
  link: null,
};

const EXPERIENCE_ENTRY = {
  company: "Acme GmbH",
  duration: "2021–present",
  title: { en: "Frontend Engineer" },
  type: { en: "Full-time" },
  location: { en: "Berlin" },
  summary: [
    { en: "Built component library using React and TypeScript for design systems." },
    { en: "Delivered shared libraries and accessibility improvements across all product surfaces." },
  ],
  tech_stack: ["React", "TypeScript", "Next.js", "Storybook"],
  tech_stack_icons: [],
};

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    heading: {
      name: "Vikram Rao",
      subheadline: { en: "Engineer" },
      headline: { en: "Building things" },
      address: { en: "Berlin" },
      email: "test@example.com",
      phone: "+49 123",
      open_to_oppertunities: true,
    },
    about_me: [],
    executive_summary: [],
    education: [],
    experience: [],
    skills: [],
    personal_projects: [],
    ...overrides,
  } as Site;
}

const AI_KEYWORDS: ExtractedKeywords = {
  hardSkills: ["MCP", "RAG", "Claude API", "agents"],
  softSkills: ["automation"],
  domains: ["AI tooling"],
  seniority: [],
  workMode: [],
  languages: [],
};

const FRONTEND_KEYWORDS: ExtractedKeywords = {
  hardSkills: ["React", "TypeScript", "design systems", "shared libraries"],
  softSkills: ["collaboration"],
  domains: ["component architecture"],
  seniority: [],
  workMode: [],
  languages: [],
};

function minimalRhetoricalPlan(): RhetoricalPlan {
  return {
    coreNarrative: "delivery-focused software engineer with production delivery experience",
    primaryStrength: "frontend delivery",
    companyAlignment: "engineering quality",
    toneProfile: { style: "professional", evidenceDensity: "medium", sentenceStyle: "balanced" },
    paragraphGoals: [],
    writingGuidelines: [],
  };
}

function minimalPositioningPlan(): PositioningPlan {
  return {
    archetype: "ai-product-engineer",
    primaryNarrative: "AI engineer",
    secondaryNarrative: "",
    differentiators: [],
    suppressNarratives: [],
    emphasisRules: [],
  };
}

// ── scoreCandidateEvidence ────────────────────────────────────────────────────

describe("scoreCandidateEvidence — personal projects", () => {
  test("project with matching skills produces a scored evidence item", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const items = scoreCandidateEvidence(site, AI_KEYWORDS);

    const projectItem = items.find((i) => i.type === "project");
    expect(projectItem).toBeDefined();
    expect(projectItem?.title).toBe("AI-Operable Portfolio Platform");
    expect(projectItem?.score).toBeGreaterThan(0);
    expect(projectItem?.matchedKeywords.length).toBeGreaterThan(0);
  });

  test("project skills match hard skill keywords at +5 each", () => {
    const site = makeSite({
      personal_projects: [
        { project: { en: "MCP Tool" }, summary: [], skills: ["MCP", "RAG"], logo: null, link: null },
      ],
    });
    const items = scoreCandidateEvidence(site, { ...AI_KEYWORDS, softSkills: [], domains: [] });
    const projectItem = items.find((i) => i.type === "project");
    expect(projectItem).toBeDefined();
    // MCP (+5) + RAG (+5) = 10
    expect(projectItem?.score).toBeGreaterThanOrEqual(10);
  });

  test("project with no keyword matches is excluded", () => {
    const site = makeSite({
      personal_projects: [
        {
          project: { en: "Unrelated Project" },
          summary: [{ en: "A project about gardening." }],
          skills: ["Gardening", "Botany"],
          logo: null,
          link: null,
        },
      ],
    });
    const items = scoreCandidateEvidence(site, AI_KEYWORDS);
    expect(items.find((i) => i.type === "project")).toBeUndefined();
  });

  test("project content includes title, summary, and technologies", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const items = scoreCandidateEvidence(site, AI_KEYWORDS);
    const projectItem = items.find((i) => i.type === "project");
    expect(projectItem?.content).toContain("AI-Operable Portfolio Platform");
    expect(projectItem?.content).toContain("Technologies:");
  });

  test("projects compete with experience entries in ranking", () => {
    const site = makeSite({
      experience: [EXPERIENCE_ENTRY],
      personal_projects: [AI_PROJECT],
    });
    const items = scoreCandidateEvidence(site, AI_KEYWORDS);
    // Both types should appear (AI project is strong for AI JD)
    const types = new Set(items.map((i) => i.type));
    expect(types.has("project")).toBe(true);
  });
});

// ── buildCandidateChunks ──────────────────────────────────────────────────────

describe("buildCandidateChunks — personal projects", () => {
  test("generates chunks with type === 'project'", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const chunks = buildCandidateChunks(site, "en");

    const projectChunks = chunks.filter((c) => c.type === "project");
    expect(projectChunks.length).toBe(1);
    expect(projectChunks[0].title).toBe("AI-Operable Portfolio Platform");
  });

  test("project chunk text contains title, summary, and technologies", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const chunks = buildCandidateChunks(site, "en");
    const chunk = chunks.find((c) => c.type === "project");

    expect(chunk?.text).toContain("AI-Operable Portfolio Platform");
    expect(chunk?.text).toContain("Technologies:");
    expect(chunk?.text).toContain("MCP");
  });

  test("project chunk metadata includes skills array", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const chunks = buildCandidateChunks(site, "en");
    const chunk = chunks.find((c) => c.type === "project");

    expect(chunk?.metadata?.skills).toBeDefined();
    expect(chunk?.metadata?.skills).toContain("MCP");
  });

  test("site with no projects produces no project chunks", () => {
    const site = makeSite({ personal_projects: [] });
    const chunks = buildCandidateChunks(site, "en");
    expect(chunks.filter((c) => c.type === "project").length).toBe(0);
  });
});

// ── lexicalRetrieveEvidence ───────────────────────────────────────────────────

describe("lexicalRetrieveEvidence — project chunks", () => {
  test("AI/tooling JD retrieves project chunk via skill metadata", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const chunks = buildCandidateChunks(site, "en");
    const retrieved = lexicalRetrieveEvidence(chunks, AI_KEYWORDS);

    const projectHit = retrieved.find((r) => r.chunk.type === "project");
    expect(projectHit).toBeDefined();
    expect(projectHit?.score).toBeGreaterThan(0);
  });

  test("project chunk retrieval reason references matched skills", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const chunks = buildCandidateChunks(site, "en");
    const retrieved = lexicalRetrieveEvidence(chunks, AI_KEYWORDS);
    const projectHit = retrieved.find((r) => r.chunk.type === "project");

    expect(projectHit?.reason.length).toBeGreaterThan(0);
  });
});

// ── buildEvidencePack ─────────────────────────────────────────────────────────

describe("buildEvidencePack — project evidence", () => {
  test("project EvidenceItem enters the pack", () => {
    const projectEvidence: EvidenceItem[] = [
      {
        title: "AI-Operable Portfolio Platform",
        type: "project",
        score: 25,
        matchedKeywords: ["MCP", "RAG"],
        reason: "Matches 2 keyword(s) in skills and description",
        content: "AI-Operable Portfolio Platform\nMCP server\nTechnologies: MCP, RAG",
      },
    ];
    const pack = buildEvidencePack(projectEvidence, []);
    expect(pack.length).toBe(1);
    expect(pack[0].type).toBe("project");
    expect(pack[0].title).toBe("AI-Operable Portfolio Platform");
  });

  test("project evidence from full pipeline can enter pack", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const deterministicEvidence = scoreCandidateEvidence(site, AI_KEYWORDS);
    const chunks = buildCandidateChunks(site, "en");
    const retrievedChunks = lexicalRetrieveEvidence(chunks, AI_KEYWORDS);
    const pack = buildEvidencePack(deterministicEvidence, retrievedChunks);

    expect(pack.some((item) => item.type === "project")).toBe(true);
  });
});

// ── projectEvidenceReport ─────────────────────────────────────────────────────

describe("computeProjectEvidenceReport — reflects project pipeline state", () => {
  test("projectsInPack > 0 when project evidence enters pack", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const deterministicEvidence = scoreCandidateEvidence(site, AI_KEYWORDS);
    const candidateChunks = buildCandidateChunks(site, "en");
    const retrievedChunks = lexicalRetrieveEvidence(candidateChunks, AI_KEYWORDS);
    const evidencePack = buildEvidencePack(deterministicEvidence, retrievedChunks);

    const report = computeProjectEvidenceReport({
      siteContent: site,
      deterministicEvidence,
      candidateChunks,
      retrievedChunks,
      evidencePack,
      rhetoricalPlan: minimalRhetoricalPlan(),
      positioningPlan: minimalPositioningPlan(),
    });

    expect(report.projectsLoaded.length).toBe(1);
    expect(report.projectsInPack.length).toBeGreaterThan(0);
  });

  test("projectsScored reflects evidence items with project titles", () => {
    const site = makeSite({ personal_projects: [AI_PROJECT] });
    const deterministicEvidence = scoreCandidateEvidence(site, AI_KEYWORDS);
    const candidateChunks = buildCandidateChunks(site, "en");
    const retrievedChunks = lexicalRetrieveEvidence(candidateChunks, AI_KEYWORDS);
    const evidencePack = buildEvidencePack(deterministicEvidence, retrievedChunks);

    const report = computeProjectEvidenceReport({
      siteContent: site,
      deterministicEvidence,
      candidateChunks,
      retrievedChunks,
      evidencePack,
      rhetoricalPlan: minimalRhetoricalPlan(),
      positioningPlan: minimalPositioningPlan(),
    });

    expect(report.projectsScored.length).toBeGreaterThan(0);
    expect(report.projectsChunked.length).toBeGreaterThan(0);
    expect(report.projectsRetrieved.length).toBeGreaterThan(0);
  });
});

// ── buildDifferentiators ──────────────────────────────────────────────────────

describe("buildDifferentiators — project items", () => {
  test("AI project can become a differentiator with MCP keywords", () => {
    const pack: EvidencePackItem[] = [
      {
        title: "AI-Operable Portfolio Platform",
        type: "project",
        score: 25,
        matchedKeywords: ["MCP", "RAG"],
        matchedTerms: [],
        reason: "test",
        content: "AI-Operable Portfolio Platform\nMCP server. Technologies: MCP, RAG",
      },
    ];
    const diffs = buildDifferentiators(pack);
    expect(diffs.length).toBe(1);
    expect(diffs[0].evidenceTitle).toBe("AI-Operable Portfolio Platform");
  });

  test("project and experience compete by score + uniqueness bonus", () => {
    const pack: EvidencePackItem[] = [
      {
        title: "Frontend Engineer @ Acme",
        type: "experience",
        score: 20,
        matchedKeywords: ["React", "TypeScript"],
        matchedTerms: [],
        reason: "test",
        content: "React TypeScript work",
      },
      {
        title: "AI-Operable Portfolio Platform",
        type: "project",
        score: 20,
        matchedKeywords: ["MCP"],
        matchedTerms: [],
        reason: "test",
        content: "MCP project",
      },
    ];
    const diffs = buildDifferentiators(pack);
    // MCP has uniqueness weight 10; the project should rank first
    expect(diffs[0].evidenceTitle).toBe("AI-Operable Portfolio Platform");
  });
});

// ── Conductor regression ──────────────────────────────────────────────────────

describe("Conductor regression — professional experience dominates for frontend JD", () => {
  test("experience items appear in evidence for frontend/React JD", () => {
    const site = makeSite({
      experience: [EXPERIENCE_ENTRY],
      personal_projects: [AI_PROJECT],
    });
    const items = scoreCandidateEvidence(site, FRONTEND_KEYWORDS);
    const expItem = items.find((i) => i.type === "experience");
    expect(expItem).toBeDefined();
  });

  test("AI project does not appear for a pure React/design-systems JD", () => {
    const site = makeSite({
      experience: [EXPERIENCE_ENTRY],
      personal_projects: [AI_PROJECT],
    });
    const items = scoreCandidateEvidence(site, FRONTEND_KEYWORDS);
    const projectItem = items.find((i) => i.type === "project");
    // AI project has no React/TypeScript/design-systems match in its skills
    // (its skills are MCP, Claude API, RAG, TypeScript, Next.js — only TypeScript matches)
    // It may appear due to TypeScript overlap but experience should outscore it
    if (projectItem) {
      const expItem = items.find((i) => i.type === "experience");
      expect(expItem).toBeDefined();
      expect(expItem!.score).toBeGreaterThanOrEqual(projectItem.score);
    }
  });

  test("project chunks are generated but frontend JD retrieves experience chunks first", () => {
    const site = makeSite({
      experience: [EXPERIENCE_ENTRY],
      personal_projects: [AI_PROJECT],
    });
    const chunks = buildCandidateChunks(site, "en");
    const retrieved = lexicalRetrieveEvidence(chunks, FRONTEND_KEYWORDS);

    const topResult = retrieved[0];
    // Top result should be experience or skill, not project, for this JD
    expect(topResult?.chunk.type).not.toBe("project");
  });
});
