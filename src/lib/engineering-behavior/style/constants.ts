// ── Decision Style Patterns ───────────────────────────────────────────────────

export const DECISION_STYLE_PATTERNS = [
  "prefers_explicit_contracts",
  "prefers_deterministic_workflows",
  "values_type_safety",
  "prioritizes_observability",
  "prefers_shared_abstractions",
  "prioritizes_maintainability",
  "favors_reproducibility",
] as const;

export type DecisionStylePattern = (typeof DECISION_STYLE_PATTERNS)[number];

export const DECISION_STYLE_LABELS: Record<DecisionStylePattern, string> = {
  prefers_explicit_contracts: "Prefers explicit contracts",
  prefers_deterministic_workflows: "Prefers deterministic workflows",
  values_type_safety: "Values type safety",
  prioritizes_observability: "Prioritizes observability",
  prefers_shared_abstractions: "Prefers shared abstractions",
  prioritizes_maintainability: "Prioritizes maintainability",
  favors_reproducibility: "Favors reproducibility",
};

// Sentence fragments used in summary generation
export const DECISION_STYLE_SUMMARY_PHRASES: Record<DecisionStylePattern, string> = {
  prefers_explicit_contracts: "explicit contracts",
  prefers_deterministic_workflows: "deterministic workflows",
  values_type_safety: "type safety",
  prioritizes_observability: "observability",
  prefers_shared_abstractions: "shared abstractions",
  prioritizes_maintainability: "maintainability",
  favors_reproducibility: "reproducibility",
};

export const DECISION_STYLE_SUMMARY_PHRASES_DE: Record<DecisionStylePattern, string> = {
  prefers_explicit_contracts: "explizite Verträge",
  prefers_deterministic_workflows: "deterministische Workflows",
  values_type_safety: "Typsicherheit",
  prioritizes_observability: "Observability",
  prefers_shared_abstractions: "gemeinsame Abstraktionen",
  prioritizes_maintainability: "Wartbarkeit",
  favors_reproducibility: "Reproduzierbarkeit",
};

// Engineering tendency → decision style patterns it contributes
export const TENDENCY_TO_DECISION_STYLE: Record<string, DecisionStylePattern[]> = {
  prefers_structured_solutions: ["prefers_explicit_contracts", "prefers_deterministic_workflows"],
  comfortable_with_autonomy: [],
  prioritizes_maintainability: ["prioritizes_maintainability", "prefers_shared_abstractions"],
  embraces_continuous_learning: [],
  values_cross_functional_collaboration: ["prefers_shared_abstractions"],
};

// Decision category → decision style patterns it signals
export const CATEGORY_TO_DECISION_STYLE: Record<string, DecisionStylePattern[]> = {
  architecture: ["prefers_explicit_contracts", "favors_reproducibility"],
  frontend: ["prefers_shared_abstractions"],
  backend: ["values_type_safety", "prefers_deterministic_workflows"],
  testing: ["favors_reproducibility", "prioritizes_maintainability"],
  developer_experience: ["prioritizes_maintainability"],
  tooling: ["favors_reproducibility"],
  process: ["prefers_deterministic_workflows", "prioritizes_observability"],
  delivery: ["favors_reproducibility", "prioritizes_observability"],
};

// ── Preferred Patterns ────────────────────────────────────────────────────────

export const PREFERRED_PATTERNS = [
  "shared_component_libraries",
  "validation_at_boundaries",
  "typed_apis",
  "reusable_infrastructure",
  "deterministic_pipelines",
  "structured_workflows",
  "contract_first_design",
] as const;

export type PreferredPattern = (typeof PREFERRED_PATTERNS)[number];

export const PREFERRED_PATTERN_LABELS: Record<PreferredPattern, string> = {
  shared_component_libraries: "Shared component libraries",
  validation_at_boundaries: "Validation at boundaries",
  typed_apis: "Typed APIs",
  reusable_infrastructure: "Reusable infrastructure",
  deterministic_pipelines: "Deterministic pipelines",
  structured_workflows: "Structured workflows",
  contract_first_design: "Contract-first design",
};

// Decision category → preferred patterns it evidences
export const CATEGORY_TO_PREFERRED_PATTERNS: Record<string, PreferredPattern[]> = {
  architecture: ["contract_first_design", "reusable_infrastructure"],
  frontend: ["shared_component_libraries", "typed_apis"],
  backend: ["validation_at_boundaries", "typed_apis", "deterministic_pipelines"],
  testing: ["structured_workflows"],
  developer_experience: ["shared_component_libraries", "structured_workflows"],
  tooling: ["reusable_infrastructure"],
  process: ["structured_workflows", "deterministic_pipelines"],
  delivery: ["reusable_infrastructure"],
};

// Engineering tendency → preferred patterns (supplemental)
export const TENDENCY_TO_PREFERRED_PATTERNS: Record<string, PreferredPattern[]> = {
  prefers_structured_solutions: ["structured_workflows"],
  comfortable_with_autonomy: [],
  prioritizes_maintainability: ["shared_component_libraries"],
  embraces_continuous_learning: [],
  values_cross_functional_collaboration: [],
};

// ── Accepted Tradeoffs ────────────────────────────────────────────────────────

export const ACCEPTED_TRADEOFFS = [
  "upfront_complexity_for_long_term_maintainability",
  "governance_overhead_for_consistency",
  "schema_maintenance_for_type_safety",
  "additional_structure_for_reliability",
  "stricter_conventions_for_quality",
] as const;

export type AcceptedTradeoff = (typeof ACCEPTED_TRADEOFFS)[number];

export const ACCEPTED_TRADEOFF_LABELS: Record<AcceptedTradeoff, string> = {
  upfront_complexity_for_long_term_maintainability:
    "Accepts upfront complexity for long-term maintainability",
  governance_overhead_for_consistency: "Accepts governance overhead for consistency",
  schema_maintenance_for_type_safety: "Accepts schema maintenance overhead for type safety",
  additional_structure_for_reliability: "Accepts additional structure for reliability",
  stricter_conventions_for_quality: "Accepts stricter conventions for quality",
};

export const ACCEPTED_TRADEOFF_SUMMARY_PHRASES: Record<AcceptedTradeoff, string> = {
  upfront_complexity_for_long_term_maintainability:
    "upfront complexity for long-term maintainability",
  governance_overhead_for_consistency: "governance overhead for consistency",
  schema_maintenance_for_type_safety: "schema maintenance overhead for type safety",
  additional_structure_for_reliability: "additional structure for reliability",
  stricter_conventions_for_quality: "stricter conventions for quality",
};

export const ACCEPTED_TRADEOFF_SUMMARY_PHRASES_DE: Record<AcceptedTradeoff, string> = {
  upfront_complexity_for_long_term_maintainability:
    "initialen Aufwand für langfristige Wartbarkeit",
  governance_overhead_for_consistency: "Governance-Aufwand für Konsistenz",
  schema_maintenance_for_type_safety: "Schema-Pflegeaufwand für Typsicherheit",
  additional_structure_for_reliability: "zusätzliche Struktur für Zuverlässigkeit",
  stricter_conventions_for_quality: "strengere Konventionen für Qualität",
};

// Decision style pattern → accepted tradeoffs it implies
export const DECISION_STYLE_TO_TRADEOFFS: Record<DecisionStylePattern, AcceptedTradeoff[]> = {
  prefers_explicit_contracts: [
    "schema_maintenance_for_type_safety",
    "additional_structure_for_reliability",
  ],
  prefers_deterministic_workflows: [
    "upfront_complexity_for_long_term_maintainability",
    "additional_structure_for_reliability",
  ],
  values_type_safety: ["schema_maintenance_for_type_safety", "stricter_conventions_for_quality"],
  prioritizes_observability: ["additional_structure_for_reliability"],
  prefers_shared_abstractions: ["governance_overhead_for_consistency"],
  prioritizes_maintainability: ["upfront_complexity_for_long_term_maintainability"],
  favors_reproducibility: ["upfront_complexity_for_long_term_maintainability"],
};

// ── Anti-Patterns ─────────────────────────────────────────────────────────────

export const ANTI_PATTERNS = [
  "implicit_contracts",
  "duplicated_ui_implementations",
  "opaque_workflows",
  "unvalidated_boundaries",
  "manual_type_synchronization",
  "ad_hoc_pipeline_design",
] as const;

export type AntiPattern = (typeof ANTI_PATTERNS)[number];

export const ANTI_PATTERN_LABELS: Record<AntiPattern, string> = {
  implicit_contracts: "Implicit contracts",
  duplicated_ui_implementations: "Duplicated UI implementations",
  opaque_workflows: "Opaque workflows",
  unvalidated_boundaries: "Unvalidated boundaries",
  manual_type_synchronization: "Manual type synchronization",
  ad_hoc_pipeline_design: "Ad hoc pipeline design",
};

// Decision style pattern → anti-patterns it excludes
export const DECISION_STYLE_TO_ANTI_PATTERNS: Record<DecisionStylePattern, AntiPattern[]> = {
  prefers_explicit_contracts: ["implicit_contracts", "unvalidated_boundaries"],
  prefers_deterministic_workflows: ["opaque_workflows", "ad_hoc_pipeline_design"],
  values_type_safety: ["manual_type_synchronization", "unvalidated_boundaries"],
  prioritizes_observability: ["opaque_workflows"],
  prefers_shared_abstractions: ["duplicated_ui_implementations"],
  prioritizes_maintainability: [],
  favors_reproducibility: ["ad_hoc_pipeline_design"],
};

// ── Preferred Environments ────────────────────────────────────────────────────

export const PREFERRED_ENVIRONMENTS = [
  "high_autonomy_teams",
  "strong_engineering_culture",
  "cross_functional_product_teams",
  "platform_engineering_organizations",
  "teams_with_clear_ownership",
  "systems_with_strong_conventions",
] as const;

export type PreferredEnvironment = (typeof PREFERRED_ENVIRONMENTS)[number];

export const PREFERRED_ENVIRONMENT_LABELS: Record<PreferredEnvironment, string> = {
  high_autonomy_teams: "High autonomy teams",
  strong_engineering_culture: "Strong engineering culture",
  cross_functional_product_teams: "Cross-functional product teams",
  platform_engineering_organizations: "Platform engineering organizations",
  teams_with_clear_ownership: "Teams with clear ownership",
  systems_with_strong_conventions: "Systems with strong conventions",
};

export const PREFERRED_ENVIRONMENT_SUMMARY_PHRASES: Record<PreferredEnvironment, string> = {
  high_autonomy_teams: "high-autonomy teams",
  strong_engineering_culture: "organizations with a strong engineering culture",
  cross_functional_product_teams: "cross-functional product teams",
  platform_engineering_organizations: "platform engineering organizations",
  teams_with_clear_ownership: "teams with clear ownership",
  systems_with_strong_conventions: "systems with strong conventions",
};

export const PREFERRED_ENVIRONMENT_SUMMARY_PHRASES_DE: Record<PreferredEnvironment, string> = {
  high_autonomy_teams: "Teams mit hoher Autonomie",
  strong_engineering_culture: "Organisationen mit starker Ingenieurkultur",
  cross_functional_product_teams: "funktionsübergreifenden Produktteams",
  platform_engineering_organizations: "Platform-Engineering-Organisationen",
  teams_with_clear_ownership: "Teams mit klaren Verantwortlichkeiten",
  systems_with_strong_conventions: "Systemen mit starken Konventionen",
};

// Core trait → preferred environments it signals
export const CORE_TRAIT_TO_ENVIRONMENTS: Record<string, PreferredEnvironment[]> = {
  autonomous_execution: ["high_autonomy_teams", "teams_with_clear_ownership"],
  engineering_quality: ["strong_engineering_culture"],
  collaborative_delivery: ["cross_functional_product_teams"],
  structured_problem_solving: ["systems_with_strong_conventions"],
  continuous_growth: [],
};

// Engineering tendency → preferred environments (supplemental)
export const TENDENCY_TO_ENVIRONMENTS: Record<string, PreferredEnvironment[]> = {
  prefers_structured_solutions: ["systems_with_strong_conventions"],
  comfortable_with_autonomy: ["high_autonomy_teams"],
  prioritizes_maintainability: ["strong_engineering_culture", "platform_engineering_organizations"],
  embraces_continuous_learning: [],
  values_cross_functional_collaboration: ["cross_functional_product_teams"],
};
