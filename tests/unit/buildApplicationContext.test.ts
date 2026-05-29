import { describe, expect, mock, test } from "bun:test";

// Mock the DB layer before any module in its import chain is loaded.
// buildApplicationContext → buildCoverLetterContext → getSiteContent → sqlite
// Replacing getSiteContent with a fixture prevents any DB access.
mock.module("@/server/siteContent", () => ({
  getSiteContent: async () => MOCK_SITE,
}));

// Dynamic imports so the mock above intercepts the chain before modules load.
const { buildApplicationContext } = await import(
  "@/lib/application-documents/context/buildApplicationContext"
);

const MOCK_SITE = {
  heading: {
    name: "Vikram Rao",
    subheadline: { en: "Frontend Engineer" },
    headline: { en: "Building accessible interfaces" },
    address: { en: "Berlin, Germany" },
    email: "test@example.com",
    phone: "+49 123 456",
    website: "https://vikram.dev",
    linkedin: "",
    github: "vikramrao",
    instagram: "",
    age: "",
    years_of_experience: "6",
    open_to_oppertunities: true,
  },
  about_me: [{ en: "I build accessible, production-quality frontend systems." }],
  executive_summary: [
    { en: "Frontend engineer with expertise in component architecture and accessibility." },
    { en: "Delivered BundID integration and DSGVO-compliant features for public sector clients." },
  ],
  education: [
    {
      school: "University of Example",
      degree: "BSc Computer Science",
      duration: "2015–2019",
      course: { en: "Software Engineering and UI Design" },
      location: { en: "Berlin" },
    },
  ],
  experience: [
    {
      company: "Acme GmbH",
      duration: "2021–present",
      title: { en: "Frontend Engineer" },
      type: { en: "Full-time" },
      location: { en: "Berlin" },
      summary: [
        { en: "Built component library using React and TypeScript for design systems." },
        { en: "Implemented WCAG 2.1 accessibility across all product surfaces." },
        { en: "Delivered BundID integration and DSGVO-compliant data flows." },
      ],
      tech_stack: ["React", "TypeScript", "Next.js", "Storybook"],
    },
    {
      company: "StartupXYZ",
      duration: "2019–2021",
      title: { en: "Software Engineer" },
      type: { en: "Full-time" },
      location: { en: "Remote" },
      summary: [
        { en: "Built automation pipelines for developer tooling using Python and TypeScript." },
        { en: "Developed MCP-based retrieval system for document generation." },
      ],
      tech_stack: ["Python", "TypeScript", "Docker", "PostgreSQL"],
    },
  ],
  skills: [
    {
      key: { en: "Frontend" },
      most_used_skills: ["React", "TypeScript", "Next.js"],
      skills: ["Storybook", "CSS", "Accessibility"],
    },
    {
      key: { en: "Backend" },
      most_used_skills: ["Node.js", "Python"],
      skills: ["PostgreSQL", "Docker"],
    },
  ],
  personal_projects: [],
};

const JD_FRONTEND_EN = `
We are looking for a senior frontend engineer.
Requirements: React, TypeScript, component architecture, design systems, accessibility (WCAG), information architecture.
Ownership and cross-functional collaboration. User-centric development. Full-time, hybrid.
`;

const JD_FRONTEND_DE = `
Wir suchen einen erfahrenen Frontend-Entwickler.
Anforderungen: React, TypeScript, Komponentenarchitektur, Barrierefreiheit (WCAG), Designsysteme.
Eigenverantwortung und Zusammenarbeit. Nutzerzentrierte Entwicklung. Festanstellung, Homeoffice möglich.
`;

describe("buildApplicationContext — smoke: English JD", () => {
  test("returns non-empty evidencePack", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_EN, "en");
    expect(ctx.evidencePack.length).toBeGreaterThan(0);
  });

  test("returns companyAlignment with at least one trait", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_EN, "en");
    expect(ctx.companyAlignment).toBeDefined();
    expect(
      ctx.companyAlignment.companyTraits.length +
        ctx.companyAlignment.inferredPriorities.length,
    ).toBeGreaterThan(0);
  });

  test("returns rhetoricalPlan with coreNarrative", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_EN, "en");
    expect(ctx.rhetoricalPlan).toBeDefined();
    expect(typeof ctx.rhetoricalPlan.coreNarrative).toBe("string");
  });

  test("returns positioningPlan with archetype", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_EN, "en");
    expect(ctx.positioningPlan).toBeDefined();
    expect(ctx.positioningPlan.archetype).toBeTruthy();
  });

  test("positioningPlan primaryNarrative is non-empty", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_EN, "en");
    expect(ctx.positioningPlan.primaryNarrative.length).toBeGreaterThan(0);
  });
});

describe("buildApplicationContext — smoke: German JD", () => {
  test("returns non-empty evidencePack", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_DE, "de");
    expect(ctx.evidencePack.length).toBeGreaterThan(0);
  });

  test("returns non-empty positioningPlan", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_DE, "de");
    expect(ctx.positioningPlan).toBeDefined();
    expect(ctx.positioningPlan.archetype).toBeTruthy();
    expect(ctx.positioningPlan.primaryNarrative.length).toBeGreaterThan(0);
  });

  test("returns companyAlignment with at least one trait", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_DE, "de");
    expect(
      ctx.companyAlignment.companyTraits.length +
        ctx.companyAlignment.inferredPriorities.length,
    ).toBeGreaterThan(0);
  });

  test("extractedKeywords contain German-canonicalized concepts", async () => {
    const ctx = await buildApplicationContext(JD_FRONTEND_DE, "de");
    expect(ctx.extractedKeywords.hardSkills).toContain("Accessibility");
    expect(ctx.extractedKeywords.hardSkills).toContain("Component Architecture");
  });
});
