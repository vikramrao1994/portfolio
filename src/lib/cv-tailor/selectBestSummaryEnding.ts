import type { PositioningPlan } from "@/lib/application-documents/positioning/types";

type Language = "en" | "de";

const ENGLISH_NARRATIVE_SIGNALS = [
  "architect",
  "architecture",
  "ownership",
  "designed",
  "delivered",
  "built",
  "implemented",
  "specialized",
  "expertise",
  "workflow",
  "product",
  "platform",
  "accessibility",
  "performance",
  "ai",
  "agent",
  "automation",
  "human-machine",
  "component system",
  "design system",
];

const GERMAN_NARRATIVE_SIGNALS = [
  "architektur",
  "architektiert",
  "konzeption",
  "umsetzung",
  "eigenverantwortlich",
  "verantwortlich",
  "end-to-end",
  "barrierefreiheit",
  "dsgvo",
  "reguliert",
  "nutzerzentriert",
  "informationsarchitektur",
  "komponentenarchitektur",
  "design system",
  "design systems",
  "qualitätssicherung",
  "testinfrastruktur",
  "sicherheit",
  "wartbarkeit",
  "skalierbarkeit",
  "code-reviews",
  "entwicklungszyklus",
  "optimierung",
  "plattform",
  "expertise",
  "performance",
  "workflow",
  "qa",
];

// Language-independent — tech tool names are the same in both languages.
const TECH_ENUMERATION_SIGNALS = [
  "react",
  "typescript",
  "javascript",
  "node.js",
  "docker",
  "aws",
  "postgresql",
  "next.js",
  "graphql",
  "rest api",
  "vue",
  "angular",
  "express",
  "mongodb",
  "mysql",
  "redis",
  "kubernetes",
  "terraform",
  "jest",
  "redux",
  "material ui",
  "git",
];

// English archetype signals
const ENGLISH_ARCHETYPE_SIGNALS: Record<string, string[]> = {
  "ai-product-engineer": [
    "agent",
    "automation",
    "mcp",
    "retrieval",
    "workflow",
    "developer tooling",
    "ai",
    "llm",
    "pipeline",
    "orchestration",
  ],
  "frontend-specialist": [
    "accessibility",
    "design system",
    "component architecture",
    "component system",
    "user workflow",
    "wcag",
    "a11y",
  ],
  "performance-engineer": [
    "performance",
    "visualization",
    "web worker",
    "large dataset",
    "rendering",
    "throughput",
    "latency",
    "optimization",
  ],
  "full-stack-builder": [
    "full-stack",
    "end-to-end",
    "platform",
    "architecture",
    "infrastructure",
    "ownership",
  ],
  "startup-generalist": [
    "ownership",
    "product",
    "startup",
    "scale",
    "cross-functional",
    "generalist",
  ],
};

// German archetype signals — same archetypes, localized terms
const GERMAN_ARCHETYPE_SIGNALS: Record<string, string[]> = {
  "ai-product-engineer": [
    "agent",
    "automatisierung",
    "mcp",
    "retrieval",
    "workflow",
    "entwickler-tools",
    "ki",
    "llm",
    "pipeline",
    "orchestrierung",
  ],
  "frontend-specialist": [
    "barrierefreiheit",
    "design system",
    "komponentenarchitektur",
    "nutzerworkflow",
    "wcag",
    "a11y",
  ],
  "performance-engineer": [
    "performance",
    "visualisierung",
    "web worker",
    "rendering",
    "durchsatz",
    "latenz",
    "optimierung",
  ],
  "full-stack-builder": [
    "full-stack",
    "end-to-end",
    "plattform",
    "architektur",
    "infrastruktur",
    "eigenverantwortlich",
  ],
  "startup-generalist": [
    "eigenverantwortlich",
    "product",
    "startup",
    "skalierung",
    "cross-functional",
    "generalist",
  ],
};

export function scoreSummarySentence({
  sentence,
  positioningPlan,
  language,
}: {
  sentence: string;
  positioningPlan: PositioningPlan;
  language: Language;
}): number {
  const lower = sentence.toLowerCase();
  let score = 0;
  let narrativeHits = 0;
  let techHits = 0;

  const narrativeSignals = language === "de" ? GERMAN_NARRATIVE_SIGNALS : ENGLISH_NARRATIVE_SIGNALS;
  for (const kw of narrativeSignals) {
    if (lower.includes(kw)) {
      score += 3;
      narrativeHits++;
    }
  }

  for (const diff of positioningPlan.differentiators) {
    const diffLabel = diff.label.toLowerCase();
    if (lower.includes(diffLabel)) {
      score += 5;
    } else {
      for (const word of diffLabel.split(/[,\s]+/).filter((w) => w.length > 3)) {
        if (lower.includes(word)) score += 2;
      }
    }
  }

  // primaryNarrative and secondaryNarrative are always English phrases — extract
  // individual content words regardless of output language, since they reflect
  // positioning concepts that may still appear as loanwords or in parenthetical form.
  const primaryWords = positioningPlan.primaryNarrative
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);
  for (const word of primaryWords) {
    if (lower.includes(word)) score += 2;
  }

  const secondaryWords = positioningPlan.secondaryNarrative
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);
  for (const word of secondaryWords) {
    if (lower.includes(word)) score += 1;
  }

  const archetypeMap = language === "de" ? GERMAN_ARCHETYPE_SIGNALS : ENGLISH_ARCHETYPE_SIGNALS;
  const archetypeSignals = archetypeMap[positioningPlan.archetype] ?? [];
  for (const signal of archetypeSignals) {
    if (lower.includes(signal)) score += 2;
  }

  for (const tech of TECH_ENUMERATION_SIGNALS) {
    if (lower.includes(tech)) techHits++;
  }

  // Penalize only when the sentence is dominated by tech enumeration and lacks
  // any narrative framing — not merely because it mentions a technology.
  const wordCount = Math.max(sentence.split(/\s+/).length, 1);
  if (narrativeHits === 0 && techHits >= 2 && techHits / wordCount > 0.25) {
    score -= 4;
  } else if (narrativeHits === 0 && techHits >= 3) {
    score -= 2;
  }

  return score;
}

// Takes pre-split sentences and returns the best-ending prefix text.
// Starts from the longest valid candidate; replaces only when a shorter candidate scores higher.
export function selectBestSummaryEnding(
  sentences: string[],
  positioningPlan: PositioningPlan,
  language: Language,
  maxLength: number,
): string | null {
  if (sentences.length === 0) return null;

  const candidates: Array<{ text: string; score: number }> = [];

  for (let i = 0; i < sentences.length; i++) {
    const text = sentences.slice(0, i + 1).join("\n");
    if (text.length <= maxLength) {
      candidates.push({
        text,
        score: scoreSummarySentence({ sentence: sentences[i], positioningPlan, language }),
      });
    }
  }

  if (candidates.length === 0) return null;

  let best = candidates[candidates.length - 1];
  for (const candidate of candidates) {
    if (candidate.score > best.score) {
      best = candidate;
    }
  }

  return best.text;
}

export function truncateSummaryPreservingNarrative({
  summary,
  positioningPlan,
  language,
  maxLength,
}: {
  summary: string;
  positioningPlan: PositioningPlan;
  language: Language;
  maxLength: number;
}): string {
  const normalized = summary.trim();
  if (normalized.length <= maxLength) return normalized;

  const sentences = normalized
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length > 1) {
    const result = selectBestSummaryEnding(sentences, positioningPlan, language, maxLength);
    if (result && result.length > 0 && result.length <= maxLength) return result;
  }

  // Fallback: sentence-boundary truncation for single-segment or degenerate input
  const truncated = normalized.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?"),
  );
  if (lastSentenceEnd >= Math.floor(maxLength * 0.6)) {
    const result = truncated.slice(0, lastSentenceEnd + 1).trim();
    if (result.length <= maxLength) return result;
  }
  const cut = normalized.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}
