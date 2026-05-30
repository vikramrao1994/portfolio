import { describe, expect, test } from "bun:test";
import { buildDecisionCorpus } from "@/lib/engineering-behavior/decisions/buildDecisionCorpus";
import { EngineeringDecisionSchema, StoredDecisionSchema } from "@/lib/engineering-behavior/decisions/schema";
import { suggestDecisionPatterns } from "@/lib/engineering-behavior/decisions/extractDecisionPatterns";
import { buildAntiPatternKeys } from "@/lib/engineering-behavior/style/buildAntiPatterns";
import { buildDecisionStyleKeys } from "@/lib/engineering-behavior/style/buildDecisionStyle";
import { buildPreferredPatternKeys } from "@/lib/engineering-behavior/style/buildPreferredPatterns";
import { buildEngineeringStyleProfile } from "@/lib/engineering-behavior/style/buildEngineeringStyleProfile";
import {
  DECISION_STYLE_LABELS,
  PREFERRED_PATTERN_LABELS,
} from "@/lib/engineering-behavior/style/constants";
import type { StoredDecision } from "@/lib/engineering-behavior/decisions/schema";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeDecision(overrides: Partial<StoredDecision> = {}): StoredDecision {
  return StoredDecisionSchema.parse({
    id: 1,
    title: "Test Decision",
    category: "architecture",
    situation: "A situation.",
    optionsConsidered: ["Option A", "Option B"],
    chosenOption: "Option A",
    rationale: ["Reason 1"],
    tradeoffs: [],
    relatedTraits: [],
    relatedTendencies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });
}

// ── 1. Explicit tags contribute to style profile ──────────────────────────────

describe("buildDecisionCorpus — tag aggregation", () => {
  test("counts styleSignals from decisions", () => {
    const d1 = makeDecision({ styleSignals: ["prefers_explicit_contracts", "values_type_safety"] });
    const d2 = makeDecision({ id: 2, styleSignals: ["prefers_explicit_contracts"] });
    const corpus = buildDecisionCorpus([d1, d2]);
    expect(corpus.styleSignalCounts.prefers_explicit_contracts).toBe(2);
    expect(corpus.styleSignalCounts.values_type_safety).toBe(1);
  });

  test("counts preferredPatterns from decisions", () => {
    const d = makeDecision({ preferredPatterns: ["validation_at_boundaries", "typed_apis"] });
    const corpus = buildDecisionCorpus([d]);
    expect(corpus.preferredPatternCounts.validation_at_boundaries).toBe(1);
    expect(corpus.preferredPatternCounts.typed_apis).toBe(1);
  });

  test("counts acceptedTradeoffs from decisions", () => {
    const d = makeDecision({ acceptedTradeoffs: ["schema_maintenance_for_type_safety"] });
    const corpus = buildDecisionCorpus([d]);
    expect(corpus.acceptedTradeoffCounts.schema_maintenance_for_type_safety).toBe(1);
  });

  test("counts antiPatterns from decisions", () => {
    const d = makeDecision({ antiPatterns: ["implicit_contracts", "unvalidated_boundaries"] });
    const corpus = buildDecisionCorpus([d]);
    expect(corpus.antiPatternCounts.implicit_contracts).toBe(1);
    expect(corpus.antiPatternCounts.unvalidated_boundaries).toBe(1);
  });

  test("counts preferredEnvironments from decisions", () => {
    const d = makeDecision({ preferredEnvironments: ["strong_engineering_culture"] });
    const corpus = buildDecisionCorpus([d]);
    expect(corpus.preferredEnvironmentCounts.strong_engineering_culture).toBe(1);
  });
});

// ── 2. Explicit tags are primary; category alone does not override ─────────────

describe("buildDecisionStyleKeys — explicit tags take priority", () => {
  test("returns explicit tags when present, ignoring category mappings", () => {
    const d = makeDecision({
      category: "backend",
      styleSignals: ["prioritizes_observability"],
    });
    const corpus = buildDecisionCorpus([d]);
    const keys = buildDecisionStyleKeys(corpus, null);
    expect(keys).toContain("prioritizes_observability");
    // category "backend" would map to values_type_safety + prefers_deterministic_workflows
    // but they should NOT appear since tags are primary
    expect(keys).not.toContain("values_type_safety");
    expect(keys).not.toContain("prefers_deterministic_workflows");
  });

  test("falls back to category/tendency when no tags present", () => {
    const d = makeDecision({ category: "backend", styleSignals: [] });
    const corpus = buildDecisionCorpus([d]);
    const keys = buildDecisionStyleKeys(corpus, null);
    expect(keys).toContain("values_type_safety");
  });

  test("sorts by frequency descending", () => {
    const d1 = makeDecision({ styleSignals: ["prefers_explicit_contracts", "values_type_safety"] });
    const d2 = makeDecision({ id: 2, styleSignals: ["prefers_explicit_contracts"] });
    const corpus = buildDecisionCorpus([d1, d2]);
    const keys = buildDecisionStyleKeys(corpus, null);
    expect(keys[0]).toBe("prefers_explicit_contracts");
  });
});

describe("buildPreferredPatternKeys — explicit tags take priority", () => {
  test("returns explicit tags when present", () => {
    const d = makeDecision({
      category: "frontend",
      preferredPatterns: ["deterministic_pipelines"],
    });
    const corpus = buildDecisionCorpus([d]);
    const keys = buildPreferredPatternKeys(corpus, null);
    expect(keys).toContain("deterministic_pipelines");
    // category "frontend" fallback would give shared_component_libraries, typed_apis — not returned
    expect(keys).not.toContain("shared_component_libraries");
  });
});

describe("buildAntiPatternKeys — explicit tags take priority", () => {
  test("returns explicit tags when present", () => {
    const d = makeDecision({ antiPatterns: ["opaque_workflows"] });
    const corpus = buildDecisionCorpus([d]);
    const styleKeys = buildDecisionStyleKeys(corpus, null);
    const keys = buildAntiPatternKeys(corpus, styleKeys);
    expect(keys).toContain("opaque_workflows");
  });
});

// ── 3. Missing tag arrays default to [] ───────────────────────────────────────

describe("Zod schema — missing tag arrays default to []", () => {
  test("parses decision without tag fields, defaulting arrays to []", () => {
    const raw = {
      title: "Old Decision",
      category: "tooling",
      situation: "A situation.",
      optionsConsidered: ["A"],
      chosenOption: "A",
      rationale: ["Because"],
      tradeoffs: [],
      relatedTraits: [],
      relatedTendencies: [],
    };
    const result = EngineeringDecisionSchema.parse(raw);
    expect(result.styleSignals).toEqual([]);
    expect(result.preferredPatterns).toEqual([]);
    expect(result.acceptedTradeoffs).toEqual([]);
    expect(result.antiPatterns).toEqual([]);
    expect(result.preferredEnvironments).toEqual([]);
  });
});

// ── 4. Suggested decisions include explicit tags ───────────────────────────────

describe("suggestDecisionPatterns — all suggestions include tags", () => {
  test("every suggestion has at least one styleSignal", () => {
    const suggestions = suggestDecisionPatterns();
    for (const s of suggestions) {
      expect(s.styleSignals.length).toBeGreaterThan(0);
    }
  });

  test("every suggestion has at least one preferredPattern", () => {
    const suggestions = suggestDecisionPatterns();
    for (const s of suggestions) {
      expect(s.preferredPatterns.length).toBeGreaterThan(0);
    }
  });

  test("every suggestion has at least one acceptedTradeoff", () => {
    const suggestions = suggestDecisionPatterns();
    for (const s of suggestions) {
      expect(s.acceptedTradeoffs.length).toBeGreaterThan(0);
    }
  });
});

// ── 5. Unknown tag keys are rejected by Zod ───────────────────────────────────

describe("Zod schema — rejects unknown enum keys", () => {
  test("rejects unknown styleSignal key", () => {
    const raw = {
      title: "T",
      category: "tooling",
      situation: "S",
      optionsConsidered: ["A"],
      chosenOption: "A",
      rationale: ["R"],
      tradeoffs: [],
      relatedTraits: [],
      relatedTendencies: [],
      styleSignals: ["not_a_real_signal"],
    };
    const result = EngineeringDecisionSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });

  test("rejects unknown antiPattern key", () => {
    const raw = {
      title: "T",
      category: "tooling",
      situation: "S",
      optionsConsidered: ["A"],
      chosenOption: "A",
      rationale: ["R"],
      tradeoffs: [],
      relatedTraits: [],
      relatedTendencies: [],
      antiPatterns: ["just_doing_things"],
    };
    const result = EngineeringDecisionSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });
});

// ── 6. Style profile output is deterministic ─────────────────────────────────

describe("buildEngineeringStyleProfile — deterministic output", () => {
  test("same input produces same output on repeated calls", () => {
    const decisions = [
      makeDecision({ styleSignals: ["prefers_explicit_contracts"], preferredPatterns: ["typed_apis"], acceptedTradeoffs: ["schema_maintenance_for_type_safety"], antiPatterns: ["unvalidated_boundaries"] }),
    ];
    const corpus = buildDecisionCorpus(decisions);
    const p1 = buildEngineeringStyleProfile(corpus, null, decisions);
    const p2 = buildEngineeringStyleProfile(corpus, null, decisions);
    expect(p1.decisionStyle).toEqual(p2.decisionStyle);
    expect(p1.preferredPatterns).toEqual(p2.preferredPatterns);
    expect(p1.acceptedTradeoffs).toEqual(p2.acceptedTradeoffs);
    expect(p1.antiPatterns).toEqual(p2.antiPatterns);
  });
});

// ── 7. EN/DE labels still render correctly ────────────────────────────────────

describe("label maps — EN labels are non-empty strings", () => {
  test("all DECISION_STYLE_LABELS have values", () => {
    for (const [, label] of Object.entries(DECISION_STYLE_LABELS)) {
      expect(typeof label).toBe("string");
      expect((label as string).length).toBeGreaterThan(0);
    }
  });

  test("all PREFERRED_PATTERN_LABELS have values", () => {
    for (const [, label] of Object.entries(PREFERRED_PATTERN_LABELS)) {
      expect(typeof label).toBe("string");
      expect((label as string).length).toBeGreaterThan(0);
    }
  });
});

// ── 8. Existing decisions without tags do not crash generation ────────────────

describe("buildEngineeringStyleProfile — backward compat", () => {
  test("decisions with empty tag arrays produce a valid profile", () => {
    const decisions = [
      makeDecision({ category: "backend", styleSignals: [], preferredPatterns: [], acceptedTradeoffs: [], antiPatterns: [], preferredEnvironments: [] }),
    ];
    const corpus = buildDecisionCorpus(decisions);
    const profile = buildEngineeringStyleProfile(corpus, null, decisions);
    expect(Array.isArray(profile.decisionStyle)).toBe(true);
    expect(Array.isArray(profile.preferredPatterns)).toBe(true);
    expect(Array.isArray(profile.representativeDecisions)).toBe(true);
    expect(typeof profile.summary_en).toBe("string");
    expect(typeof profile.summary_de).toBe("string");
  });
});
