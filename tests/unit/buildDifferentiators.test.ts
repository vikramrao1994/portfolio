import { describe, expect, test } from "bun:test";
import { buildDifferentiators } from "@/lib/application-documents/positioning/buildDifferentiators";
import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";

function item(
  title: string,
  matchedKeywords: string[],
  score = 5,
): EvidencePackItem {
  return {
    title,
    type: "experience",
    score,
    matchedKeywords,
    matchedTerms: [],
    reason: "test fixture",
    content: `Content for ${title}`,
  };
}

describe("buildDifferentiators — uniqueness bonus ordering", () => {
  test("MCP keyword (weight 10) scores higher than React (weight 2)", () => {
    const diffs = buildDifferentiators([
      item("React Component Library", ["React"], 5),
      item("MCP Tooling Pipeline", ["MCP"], 5),
    ]);
    const mcpIdx = diffs.findIndex((d) => d.evidenceTitle === "MCP Tooling Pipeline");
    const reactIdx = diffs.findIndex((d) => d.evidenceTitle === "React Component Library");
    expect(mcpIdx).toBeLessThan(reactIdx);
  });

  test("BundID (weight 9) scores higher than Docker (no weight)", () => {
    const diffs = buildDifferentiators([
      item("Docker Deployment Setup", ["Docker"], 5),
      item("BundID Integration", ["BundID"], 5),
    ]);
    const bundidIdx = diffs.findIndex((d) => d.evidenceTitle === "BundID Integration");
    const dockerIdx = diffs.findIndex((d) => d.evidenceTitle === "Docker Deployment Setup");
    expect(bundidIdx).toBeLessThan(dockerIdx);
  });

  test("agent-readable metadata (weight 10) beats TypeScript (weight 2)", () => {
    const diffs = buildDifferentiators([
      item("TypeScript Refactor", ["TypeScript"], 4),
      item("Agent Metadata System", ["agent-readable metadata"], 4),
    ]);
    expect(diffs[0].evidenceTitle).toBe("Agent Metadata System");
  });

  test("100k packet visualization (weight 9) beats React (weight 2)", () => {
    const diffs = buildDifferentiators([
      item("React Dashboard", ["React"], 6),
      item("Network Visualization", ["100k packet visualization"], 6),
    ]);
    expect(diffs[0].evidenceTitle).toBe("Network Visualization");
  });

  test("results are sorted by strength descending", () => {
    const diffs = buildDifferentiators([
      item("Low Value", ["React"], 1),
      item("High Value", ["MCP", "agent-readable metadata"], 8),
      item("Medium Value", ["AI"], 4),
    ]);
    for (let i = 0; i < diffs.length - 1; i++) {
      expect(diffs[i].strength).toBeGreaterThanOrEqual(diffs[i + 1].strength);
    }
  });

  test("returns at most 3 differentiators", () => {
    const manyItems = Array.from({ length: 8 }, (_, i) =>
      item(`Item ${i}`, ["React"], i),
    );
    const diffs = buildDifferentiators(manyItems);
    expect(diffs.length).toBeLessThanOrEqual(3);
  });

  test("empty evidence pack returns empty array", () => {
    expect(buildDifferentiators([])).toEqual([]);
  });

  test("DSGVO keyword (weight 8) beats Docker (no weight) at equal base score", () => {
    const diffs = buildDifferentiators([
      item("Docker Setup", ["Docker"], 5),
      item("DSGVO Compliance Module", ["DSGVO"], 5),
    ]);
    const dsgvoFirst = diffs[0].evidenceTitle === "DSGVO Compliance Module";
    expect(dsgvoFirst).toBe(true);
  });

  test("Komponentenarchitektur (weight 7) beats TypeScript (weight 2)", () => {
    const diffs = buildDifferentiators([
      item("TypeScript Migration", ["TypeScript"], 5),
      item("Component System Design", ["Komponentenarchitektur"], 5),
    ]);
    expect(diffs[0].evidenceTitle).toBe("Component System Design");
  });

  test("differentiator label uses first 3 matched keywords", () => {
    const diffs = buildDifferentiators([
      item("Multi KW Item", ["React", "TypeScript", "Next.js", "GraphQL"], 5),
    ]);
    expect(diffs[0].label).toBe("React, TypeScript, Next.js");
  });

  test("differentiator label falls back to title when no keywords", () => {
    const diffs = buildDifferentiators([
      item("My Fallback Item", [], 5),
    ]);
    expect(diffs[0].label).toBe("My Fallback Item");
  });
});
