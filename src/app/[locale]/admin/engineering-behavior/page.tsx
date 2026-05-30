"use client";

import {
  Accordion,
  Body,
  Button,
  Grid,
  Heading,
  Lists,
  SelectInput,
  TextareaInput,
  TextInput,
} from "@publicplan/kern-react-kit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import AdminCard from "@/components/Admin/Card/AdminCard";
import { DECISION_CATEGORIES } from "@/lib/engineering-behavior/decisions/constants";
import type {
  EngineeringDecision,
  StoredDecision,
} from "@/lib/engineering-behavior/decisions/schema";
import type {
  CoreTrait,
  EngineeringProfile,
  EngineeringTendency,
} from "@/lib/engineering-behavior/profile/schema";
import {
  type BehaviorTrait,
  type EngineeringBehaviorProfile,
  type LinkedInRecommendation,
  RELATIONSHIP_OPTIONS,
} from "@/lib/engineering-behavior/schema";
import {
  ACCEPTED_TRADEOFF_LABELS,
  ACCEPTED_TRADEOFFS,
  type AcceptedTradeoff,
  ANTI_PATTERN_LABELS,
  ANTI_PATTERNS,
  type AntiPattern,
  DECISION_STYLE_LABELS,
  DECISION_STYLE_PATTERNS,
  type DecisionStylePattern,
  PREFERRED_ENVIRONMENT_LABELS,
  PREFERRED_ENVIRONMENTS,
  PREFERRED_PATTERN_LABELS,
  PREFERRED_PATTERNS,
  type PreferredEnvironment,
  type PreferredPattern,
} from "@/lib/engineering-behavior/style/constants";
import type { EngineeringStyleProfile } from "@/lib/engineering-behavior/style/schema";
import { adminDelete, adminGet, adminPost, adminPut } from "@/utils/adminFetch";
import { spacing } from "@/utils/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface ProfileResponse {
  profile: EngineeringBehaviorProfile | null;
  engineeringProfile: EngineeringProfile | null;
  styleProfile: EngineeringStyleProfile | null;
  createdAt: string | null;
}

interface StyleProfileResponse {
  styleProfile: EngineeringStyleProfile;
}

interface ExtractionResponse {
  profile: EngineeringBehaviorProfile;
  engineeringProfile: EngineeringProfile;
  documentsProcessed: number;
  documentsSkipped: number;
}

interface RecommendationsResponse {
  recommendations: LinkedInRecommendation[];
}

interface DecisionsResponse {
  decisions: StoredDecision[];
}

interface SuggestionsResponse {
  suggestions: EngineeringDecision[];
}

interface RecForm {
  authorName: string;
  authorRole: string;
  company: string;
  relationship: string;
  recommendationText: string;
}

interface DecisionForm {
  title: string;
  category: string;
  situation: string;
  optionsConsidered: string;
  chosenOption: string;
  rationale: string;
  tradeoffs: string;
  relatedTraits: string;
  relatedTendencies: string;
  evidenceSource: string;
  styleSignals: DecisionStylePattern[];
  preferredPatterns: PreferredPattern[];
  acceptedTradeoffs: AcceptedTradeoff[];
  antiPatterns: AntiPattern[];
  preferredEnvironments: PreferredEnvironment[];
}

const RELATIONSHIP_SELECT_OPTIONS = [
  { value: "", label: "— select —" },
  ...RELATIONSHIP_OPTIONS.map((r) => ({ value: r, label: r })),
];

const CATEGORY_SELECT_OPTIONS = [
  { value: "", label: "— select category —" },
  ...DECISION_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const EMPTY_DECISION_FORM: DecisionForm = {
  title: "",
  category: "",
  situation: "",
  optionsConsidered: "",
  chosenOption: "",
  rationale: "",
  tradeoffs: "",
  relatedTraits: "",
  relatedTendencies: "",
  evidenceSource: "",
  styleSignals: [],
  preferredPatterns: [],
  acceptedTradeoffs: [],
  antiPatterns: [],
  preferredEnvironments: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function recLabel(rec: LinkedInRecommendation): string {
  if (!rec.authorName) return `Recommendation #${rec.id}`;
  const role = rec.authorRole
    ? ` · ${rec.authorRole}${rec.company ? ` at ${rec.company}` : ""}`
    : "";
  const rel = rec.relationship ? ` [${rec.relationship}]` : "";
  return `${rec.authorName}${role}${rel}`;
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function decisionToForm(d: EngineeringDecision): DecisionForm {
  return {
    title: (d as StoredDecision).title ?? "",
    category: d.category,
    situation: d.situation,
    optionsConsidered: d.optionsConsidered.join("\n"),
    chosenOption: d.chosenOption,
    rationale: d.rationale.join("\n"),
    tradeoffs: d.tradeoffs.join("\n"),
    relatedTraits: d.relatedTraits.join("\n"),
    relatedTendencies: d.relatedTendencies.join("\n"),
    evidenceSource: d.evidenceSource ?? "",
    styleSignals: d.styleSignals ?? [],
    preferredPatterns: d.preferredPatterns ?? [],
    acceptedTradeoffs: d.acceptedTradeoffs ?? [],
    antiPatterns: d.antiPatterns ?? [],
    preferredEnvironments: d.preferredEnvironments ?? [],
  };
}

function formToDecision(form: DecisionForm): EngineeringDecision {
  return {
    title: form.title.trim(),
    category: form.category as EngineeringDecision["category"],
    situation: form.situation.trim(),
    optionsConsidered: parseLines(form.optionsConsidered),
    chosenOption: form.chosenOption.trim(),
    rationale: parseLines(form.rationale),
    tradeoffs: parseLines(form.tradeoffs),
    relatedTraits: parseLines(form.relatedTraits),
    relatedTendencies: parseLines(form.relatedTendencies),
    evidenceSource: form.evidenceSource.trim() || undefined,
    styleSignals: form.styleSignals,
    preferredPatterns: form.preferredPatterns,
    acceptedTradeoffs: form.acceptedTradeoffs,
    antiPatterns: form.antiPatterns,
    preferredEnvironments: form.preferredEnvironments,
  };
}

// ── Tag helpers ───────────────────────────────────────────────────────────────

function TagCheckboxGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: T[];
  onChange: (v: T[]) => void;
  options: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <div style={{ marginBottom: spacing(2) }}>
      <Body style={{ fontWeight: 600, marginBottom: spacing(0.5) }}>{label}</Body>
      <div style={{ display: "flex", flexWrap: "wrap", gap: `${spacing(1)}px ${spacing(2)}px` }}>
        {options.map((opt) => (
          <label
            key={opt}
            style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={(e) => {
                if (e.target.checked) onChange([...value, opt]);
                else onChange(value.filter((v) => v !== opt));
              }}
            />
            <Body style={{ fontSize: 13 }}>{labels[opt]}</Body>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TraitCards({ traits }: { traits: BehaviorTrait[] }) {
  return (
    <Accordion.Group>
      {traits.map((t, i) => (
        <Accordion.Root
          key={`${t.trait}-${t.sourceDocument}-${i}`}
          aria-label={`${t.trait} from ${t.sourceDocument}`}
        >
          <Accordion.Summary
            title={{
              textWrapper: "h3",
              title: `${t.trait}  ·  ${t.confidence.toFixed(2)}`,
              variant: "small",
            }}
          />
          <Lists.Root size="small" type="bullet" style={{ marginBottom: spacing(1) }}>
            <Lists.Item text={`Category: ${t.category}`} />
            <Lists.Item text={`Source Type: ${t.sourceType}`} />
            <Lists.Item text={`Source: ${t.sourceDocument}`} />
            {t.authorName && <Lists.Item text={`Author: ${t.authorName}`} />}
            {t.authorRole && <Lists.Item text={`Role: ${t.authorRole}`} />}
            {t.relationship && <Lists.Item text={`Relationship: ${t.relationship}`} />}
            <Lists.Item text={`Language: ${t.evidenceLanguage.toUpperCase()}`} />
          </Lists.Root>
          <Body style={{ fontStyle: "italic", marginBottom: spacing(2), color: "#444" }}>
            &ldquo;{t.evidence}&rdquo;
          </Body>
        </Accordion.Root>
      ))}
    </Accordion.Group>
  );
}

function CoreTraitCards({ coreTraits }: { coreTraits: CoreTrait[] }) {
  return (
    <Accordion.Group>
      {coreTraits.map((ct) => (
        <Accordion.Root key={ct.trait} aria-label={ct.trait}>
          <Accordion.Summary
            title={{
              textWrapper: "h3",
              title: `${ct.trait}  ·  ${ct.confidence.toFixed(2)}`,
              variant: "small",
            }}
          />
          <Lists.Root size="small" type="bullet" style={{ marginBottom: spacing(1) }}>
            <Lists.Item text={`Confidence: ${ct.confidence.toFixed(2)}`} />
            <Lists.Item text={`Supporting Traits: ${ct.supportingTraits.join(", ")}`} />
            <Lists.Item text={`Sources: ${ct.sourceDocuments.join(", ")}`} />
          </Lists.Root>
        </Accordion.Root>
      ))}
    </Accordion.Group>
  );
}

function TendencyCards({ tendencies }: { tendencies: EngineeringTendency[] }) {
  return (
    <Accordion.Group>
      {tendencies.map((et) => (
        <Accordion.Root key={et.tendency} aria-label={et.tendency}>
          <Accordion.Summary
            title={{
              textWrapper: "h3",
              title: `${et.tendency}  ·  ${et.confidence.toFixed(2)}`,
              variant: "small",
            }}
          />
          <Lists.Root size="small" type="bullet" style={{ marginBottom: spacing(1) }}>
            <Lists.Item text={`Confidence: ${et.confidence.toFixed(2)}`} />
            <Lists.Item text={`Derived From: ${et.derivedFrom.join(", ")}`} />
          </Lists.Root>
        </Accordion.Root>
      ))}
    </Accordion.Group>
  );
}

function RecommendationList({
  recommendations,
  onDelete,
}: {
  recommendations: LinkedInRecommendation[];
  onDelete: (id: number) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <Body style={{ color: "#888", marginBottom: spacing(2) }}>No recommendations added yet.</Body>
    );
  }
  return (
    <Accordion.Group>
      {recommendations.map((rec) => (
        <Accordion.Root key={rec.id} aria-label={recLabel(rec)}>
          <Accordion.Summary
            title={{ textWrapper: "h3", title: recLabel(rec), variant: "small" }}
          />
          <Body
            style={{
              whiteSpace: "pre-wrap",
              marginBottom: spacing(2),
              color: "#444",
              fontStyle: "italic",
            }}
          >
            {rec.recommendationText}
          </Body>
          <div style={{ marginBottom: spacing(2) }}>
            <Button
              type="button"
              variant="secondary"
              text="Delete"
              onClick={() => onDelete(rec.id)}
            />
          </div>
        </Accordion.Root>
      ))}
    </Accordion.Group>
  );
}

function DecisionFormFields({
  control,
  errors,
}: {
  control: ReturnType<typeof useForm<DecisionForm>>["control"];
  errors: ReturnType<typeof useForm<DecisionForm>>["formState"]["errors"];
}) {
  return (
    <>
      <Controller
        name="title"
        control={control}
        rules={{ validate: (v) => v.trim().length >= 1 || "Title is required." }}
        render={({ field }) => (
          <TextInput
            id="decision-title"
            label="Decision Title"
            value={field.value}
            onChange={field.onChange}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />
      {errors.title && (
        <Body style={{ color: "red", marginBottom: spacing(1) }}>{errors.title.message}</Body>
      )}

      <Controller
        name="category"
        control={control}
        rules={{ validate: (v) => v.length > 0 || "Category is required." }}
        render={({ field }) => (
          <SelectInput
            id="decision-category"
            label="Category"
            value={field.value}
            options={CATEGORY_SELECT_OPTIONS}
            onChange={field.onChange}
          />
        )}
      />
      {errors.category && (
        <Body style={{ color: "red", marginBottom: spacing(1) }}>{errors.category.message}</Body>
      )}

      <Controller
        name="situation"
        control={control}
        rules={{ validate: (v) => v.trim().length >= 1 || "Situation is required." }}
        render={({ field }) => (
          <TextareaInput
            id="decision-situation"
            label="Situation"
            value={field.value}
            onChange={field.onChange}
            rows={3}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />
      {errors.situation && (
        <Body style={{ color: "red", marginBottom: spacing(1) }}>{errors.situation.message}</Body>
      )}

      <Controller
        name="optionsConsidered"
        control={control}
        rules={{ validate: (v) => parseLines(v).length >= 1 || "At least one option required." }}
        render={({ field }) => (
          <TextareaInput
            id="decision-options"
            label="Options Considered (one per line)"
            value={field.value}
            onChange={field.onChange}
            rows={3}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />
      {errors.optionsConsidered && (
        <Body style={{ color: "red", marginBottom: spacing(1) }}>
          {errors.optionsConsidered.message}
        </Body>
      )}

      <Controller
        name="chosenOption"
        control={control}
        rules={{ validate: (v) => v.trim().length >= 1 || "Chosen option is required." }}
        render={({ field }) => (
          <TextInput
            id="decision-chosen"
            label="Chosen Option"
            value={field.value}
            onChange={field.onChange}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />
      {errors.chosenOption && (
        <Body style={{ color: "red", marginBottom: spacing(1) }}>
          {errors.chosenOption.message}
        </Body>
      )}

      <Controller
        name="rationale"
        control={control}
        rules={{ validate: (v) => parseLines(v).length >= 1 || "At least one rationale required." }}
        render={({ field }) => (
          <TextareaInput
            id="decision-rationale"
            label="Rationale (one per line)"
            value={field.value}
            onChange={field.onChange}
            rows={4}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />
      {errors.rationale && (
        <Body style={{ color: "red", marginBottom: spacing(1) }}>{errors.rationale.message}</Body>
      )}

      <Controller
        name="tradeoffs"
        control={control}
        render={({ field }) => (
          <TextareaInput
            id="decision-tradeoffs"
            label="Tradeoffs (one per line, optional)"
            value={field.value}
            onChange={field.onChange}
            rows={3}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />

      <Controller
        name="relatedTraits"
        control={control}
        render={({ field }) => (
          <TextareaInput
            id="decision-traits"
            label="Related Core Traits (one per line, optional)"
            value={field.value}
            onChange={field.onChange}
            rows={2}
            style={{ marginBottom: spacing(1) }}
          />
        )}
      />
      <Body style={{ color: "#888", fontSize: 12, marginBottom: spacing(2) }}>
        Available: structured_problem_solving, autonomous_execution, engineering_quality,
        collaborative_delivery, continuous_growth
      </Body>

      <Controller
        name="relatedTendencies"
        control={control}
        render={({ field }) => (
          <TextareaInput
            id="decision-tendencies"
            label="Related Tendencies (one per line, optional)"
            value={field.value}
            onChange={field.onChange}
            rows={2}
            style={{ marginBottom: spacing(1) }}
          />
        )}
      />
      <Body style={{ color: "#888", fontSize: 12, marginBottom: spacing(2) }}>
        Available: prefers_structured_solutions, comfortable_with_autonomy,
        prioritizes_maintainability, embraces_continuous_learning,
        values_cross_functional_collaboration
      </Body>

      <Controller
        name="evidenceSource"
        control={control}
        render={({ field }) => (
          <TextInput
            id="decision-evidence"
            label="Evidence Source (optional)"
            value={field.value}
            onChange={field.onChange}
            style={{ marginBottom: spacing(2) }}
          />
        )}
      />

      <Controller
        name="styleSignals"
        control={control}
        render={({ field }) => (
          <TagCheckboxGroup
            label="Style Signals"
            value={field.value}
            onChange={field.onChange}
            options={DECISION_STYLE_PATTERNS}
            labels={DECISION_STYLE_LABELS}
          />
        )}
      />

      <Controller
        name="preferredPatterns"
        control={control}
        render={({ field }) => (
          <TagCheckboxGroup
            label="Preferred Patterns"
            value={field.value}
            onChange={field.onChange}
            options={PREFERRED_PATTERNS}
            labels={PREFERRED_PATTERN_LABELS}
          />
        )}
      />

      <Controller
        name="acceptedTradeoffs"
        control={control}
        render={({ field }) => (
          <TagCheckboxGroup
            label="Accepted Tradeoffs"
            value={field.value}
            onChange={field.onChange}
            options={ACCEPTED_TRADEOFFS}
            labels={ACCEPTED_TRADEOFF_LABELS}
          />
        )}
      />

      <Controller
        name="antiPatterns"
        control={control}
        render={({ field }) => (
          <TagCheckboxGroup
            label="Anti-Patterns"
            value={field.value}
            onChange={field.onChange}
            options={ANTI_PATTERNS}
            labels={ANTI_PATTERN_LABELS}
          />
        )}
      />

      <Controller
        name="preferredEnvironments"
        control={control}
        render={({ field }) => (
          <TagCheckboxGroup
            label="Preferred Environments"
            value={field.value}
            onChange={field.onChange}
            options={PREFERRED_ENVIRONMENTS}
            labels={PREFERRED_ENVIRONMENT_LABELS}
          />
        )}
      />
    </>
  );
}

function DecisionCard({
  decision,
  onEdit,
  onDelete,
}: {
  decision: StoredDecision;
  onEdit: (d: StoredDecision) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Accordion.Root key={decision.id} aria-label={decision.title}>
      <Accordion.Summary
        title={{
          textWrapper: "h3",
          title: `${decision.title}  ·  ${decision.category}`,
          variant: "small",
        }}
      />
      <Lists.Root size="small" type="bullet" style={{ marginBottom: spacing(1) }}>
        <Lists.Item text={`Chosen: ${decision.chosenOption}`} />
        {decision.styleSignals.length > 0 && (
          <Lists.Item
            text={`Style: ${decision.styleSignals.map((k) => DECISION_STYLE_LABELS[k]).join(", ")}`}
          />
        )}
        {decision.preferredPatterns.length > 0 && (
          <Lists.Item
            text={`Patterns: ${decision.preferredPatterns.map((k) => PREFERRED_PATTERN_LABELS[k]).join(", ")}`}
          />
        )}
        {decision.antiPatterns.length > 0 && (
          <Lists.Item
            text={`Anti-patterns: ${decision.antiPatterns.map((k) => ANTI_PATTERN_LABELS[k]).join(", ")}`}
          />
        )}
        {decision.relatedTendencies.length > 0 && (
          <Lists.Item text={`Tendencies: ${decision.relatedTendencies.join(", ")}`} />
        )}
      </Lists.Root>

      <div
        style={{
          background: "#f8f9fa",
          borderRadius: 6,
          padding: `${spacing(2)}px ${spacing(2.5)}px`,
          marginBottom: spacing(2),
        }}
      >
        <Body style={{ marginBottom: spacing(1) }}>
          <strong>Situation:</strong> {decision.situation}
        </Body>

        {decision.optionsConsidered.length > 0 && (
          <div style={{ marginBottom: spacing(1) }}>
            <Body>
              <strong>Options considered:</strong>
            </Body>
            <Lists.Root size="small" type="bullet">
              {decision.optionsConsidered.map((o) => (
                <Lists.Item key={o} text={o} />
              ))}
            </Lists.Root>
          </div>
        )}

        {decision.rationale.length > 0 && (
          <div style={{ marginBottom: spacing(1) }}>
            <Body>
              <strong>Rationale:</strong>
            </Body>
            <Lists.Root size="small" type="bullet">
              {decision.rationale.map((r) => (
                <Lists.Item key={r} text={r} />
              ))}
            </Lists.Root>
          </div>
        )}

        {decision.tradeoffs.length > 0 && (
          <div style={{ marginBottom: spacing(1) }}>
            <Body>
              <strong>Tradeoffs:</strong>
            </Body>
            <Lists.Root size="small" type="bullet">
              {decision.tradeoffs.map((t) => (
                <Lists.Item key={t} text={t} />
              ))}
            </Lists.Root>
          </div>
        )}

        {decision.evidenceSource && (
          <Body>
            <strong>Source:</strong> {decision.evidenceSource}
          </Body>
        )}
      </div>

      <div style={{ display: "flex", gap: spacing(1), marginBottom: spacing(2) }}>
        <Button type="button" variant="secondary" text="Edit" onClick={() => onEdit(decision)} />
        <Button
          type="button"
          variant="secondary"
          text="Delete"
          onClick={() => onDelete(decision.id)}
        />
      </div>
    </Accordion.Root>
  );
}

function SuggestionCard({
  suggestion,
  onSave,
  isSaving,
}: {
  suggestion: EngineeringDecision;
  onSave: (d: EngineeringDecision) => void;
  isSaving: boolean;
}) {
  return (
    <Accordion.Root aria-label={suggestion.title}>
      <Accordion.Summary
        title={{
          textWrapper: "h3",
          title: `${suggestion.title}  ·  ${suggestion.category}`,
          variant: "small",
        }}
      />
      <Lists.Root size="small" type="bullet" style={{ marginBottom: spacing(1) }}>
        <Lists.Item text={`Chosen: ${suggestion.chosenOption}`} />
        {suggestion.relatedTendencies.length > 0 && (
          <Lists.Item text={`Tendencies: ${suggestion.relatedTendencies.join(", ")}`} />
        )}
      </Lists.Root>

      <div
        style={{
          background: "#f8f9fa",
          borderRadius: 6,
          padding: `${spacing(2)}px ${spacing(2.5)}px`,
          marginBottom: spacing(2),
        }}
      >
        <Body style={{ marginBottom: spacing(1) }}>
          <strong>Situation:</strong> {suggestion.situation}
        </Body>
        <Body style={{ marginBottom: spacing(1) }}>
          <strong>Rationale:</strong> {suggestion.rationale.join(" · ")}
        </Body>
        {suggestion.tradeoffs.length > 0 && (
          <Body>
            <strong>Tradeoffs:</strong> {suggestion.tradeoffs.join(" · ")}
          </Body>
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        text={isSaving ? "Saving..." : "Save this Decision"}
        disabled={isSaving}
        onClick={() => onSave(suggestion)}
      />
    </Accordion.Root>
  );
}

function StyleProfileSection({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: spacing(3) }}>
      <Heading type="small" headerElement="h3" title={label} style={{ marginBottom: spacing(1) }} />
      <Lists.Root size="small" type="bullet">
        {items.map((item) => (
          <Lists.Item key={item} text={item} />
        ))}
      </Lists.Root>
    </div>
  );
}

function StyleProfileCard({
  styleProfile,
  onGenerate,
  isGenerating,
  error,
}: {
  styleProfile: EngineeringStyleProfile | null;
  onGenerate: () => void;
  isGenerating: boolean;
  error: Error | null;
}) {
  return (
    <AdminCard
      id="engineering-style-profile"
      title="Engineering Style Profile"
      ariaLabel="Engineering Style Profile"
    >
      <Body style={{ color: "#666", marginBottom: spacing(3) }}>
        Synthesizes core traits, engineering tendencies, and the decision corpus into a canonical
        engineering identity. Fully deterministic — re-generate any time after adding decisions.
      </Body>

      <div style={{ marginBottom: spacing(3) }}>
        <Button
          type="button"
          variant="primary"
          text={isGenerating ? "Generating..." : "Generate Style Profile"}
          disabled={isGenerating}
          onClick={onGenerate}
        />
      </div>

      {error && <Body style={{ color: "red", marginBottom: spacing(2) }}>{error.message}</Body>}

      {styleProfile && (
        <>
          <StyleProfileSection label="Decision Style" items={styleProfile.decisionStyle} />
          <StyleProfileSection label="Preferred Patterns" items={styleProfile.preferredPatterns} />
          <StyleProfileSection label="Accepted Tradeoffs" items={styleProfile.acceptedTradeoffs} />
          <StyleProfileSection label="Anti-Patterns" items={styleProfile.antiPatterns} />
          <StyleProfileSection
            label="Preferred Environments"
            items={styleProfile.preferredEnvironments}
          />
          <StyleProfileSection
            label="Representative Decisions"
            items={styleProfile.representativeDecisions}
          />

          <div style={{ marginTop: spacing(1) }}>
            <Heading
              type="small"
              headerElement="h3"
              title="English Style Summary"
              style={{ marginBottom: spacing(1) }}
            />
            <Body style={{ whiteSpace: "pre-wrap", marginBottom: spacing(3) }}>
              {styleProfile.summary_en}
            </Body>

            <Heading
              type="small"
              headerElement="h3"
              title="German Style Summary"
              style={{ marginBottom: spacing(1) }}
            />
            <Body style={{ whiteSpace: "pre-wrap" }}>{styleProfile.summary_de}</Body>
          </div>
        </>
      )}

      {!styleProfile && (
        <Body style={{ color: "#888" }}>
          No style profile generated yet. Add decisions and click Generate.
        </Body>
      )}
    </AdminCard>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EngineeringBehaviorPage() {
  const queryClient = useQueryClient();

  // ── Queries ──
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: loadError,
  } = useQuery({
    queryKey: ["engineering-behavior-profile"],
    queryFn: () => adminGet<ProfileResponse>("/api/admin/engineering-behavior"),
  });

  const { data: recsData, isLoading: isLoadingRecs } = useQuery({
    queryKey: ["engineering-behavior-recommendations"],
    queryFn: () =>
      adminGet<RecommendationsResponse>("/api/admin/engineering-behavior/recommendations"),
  });

  const { data: decisionsData, isLoading: isLoadingDecisions } = useQuery({
    queryKey: ["engineering-behavior-decisions"],
    queryFn: () => adminGet<DecisionsResponse>("/api/admin/engineering-behavior/decisions"),
  });

  // ── Decision form state ──
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [editingDecision, setEditingDecision] = useState<StoredDecision | null>(null);
  const [suggestions, setSuggestions] = useState<EngineeringDecision[] | null>(null);
  const [savingSuggestionTitle, setSavingSuggestionTitle] = useState<string | null>(null);

  // ── Mutations ──
  const extractMutation = useMutation({
    mutationFn: () => adminPost<ExtractionResponse>("/api/admin/engineering-behavior/extract"),
    onSuccess: (data) => {
      queryClient.setQueryData<ProfileResponse>(["engineering-behavior-profile"], {
        profile: data.profile,
        engineeringProfile: data.engineeringProfile,
        styleProfile: profileData?.styleProfile ?? null,
        createdAt: data.profile.extractedAt,
      });
    },
  });

  const generateStyleMutation = useMutation({
    mutationFn: () => adminPost<StyleProfileResponse>("/api/admin/engineering-behavior/style"),
    onSuccess: (data) => {
      queryClient.setQueryData<ProfileResponse>(["engineering-behavior-profile"], (prev) =>
        prev ? { ...prev, styleProfile: data.styleProfile } : prev,
      );
    },
  });

  const addRecMutation = useMutation({
    mutationFn: (form: RecForm) =>
      adminPost("/api/admin/engineering-behavior/recommendations", {
        authorName: form.authorName || undefined,
        authorRole: form.authorRole || undefined,
        company: form.company || undefined,
        relationship: form.relationship || undefined,
        recommendationText: form.recommendationText,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-recommendations"] });
      recFormReset();
    },
  });

  const deleteRecMutation = useMutation({
    mutationFn: (id: number) =>
      adminDelete(`/api/admin/engineering-behavior/recommendations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-recommendations"] });
    },
  });

  const createDecisionMutation = useMutation({
    mutationFn: (data: EngineeringDecision) =>
      adminPost("/api/admin/engineering-behavior/decisions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-decisions"] });
      decisionFormReset(EMPTY_DECISION_FORM);
      setShowDecisionForm(false);
    },
  });

  const updateDecisionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EngineeringDecision }) =>
      adminPut(`/api/admin/engineering-behavior/decisions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-decisions"] });
      setEditingDecision(null);
      decisionFormReset(EMPTY_DECISION_FORM);
    },
  });

  const deleteDecisionMutation = useMutation({
    mutationFn: (id: number) => adminDelete(`/api/admin/engineering-behavior/decisions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-decisions"] });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: () =>
      adminGet<SuggestionsResponse>("/api/admin/engineering-behavior/decisions/suggest"),
    onSuccess: (data) => {
      setSuggestions(data.suggestions);
    },
  });

  // ── Recommendation form ──
  const {
    control: recControl,
    handleSubmit: recHandleSubmit,
    reset: recFormReset,
    formState: { errors: recErrors },
  } = useForm<RecForm>({
    defaultValues: {
      authorName: "",
      authorRole: "",
      company: "",
      relationship: "",
      recommendationText: "",
    },
  });

  // ── Decision form ──
  const {
    control: decisionControl,
    handleSubmit: decisionHandleSubmit,
    reset: decisionFormReset,
    formState: { errors: decisionErrors },
  } = useForm<DecisionForm>({ defaultValues: EMPTY_DECISION_FORM });

  // ── Handlers ──
  function handleEditDecision(d: StoredDecision) {
    setEditingDecision(d);
    decisionFormReset(decisionToForm(d));
    setShowDecisionForm(true);
  }

  function handleCancelDecisionForm() {
    setEditingDecision(null);
    decisionFormReset(EMPTY_DECISION_FORM);
    setShowDecisionForm(false);
  }

  function handleDecisionSubmit(form: DecisionForm) {
    const data = formToDecision(form);
    if (editingDecision) {
      updateDecisionMutation.mutate({ id: editingDecision.id, data });
    } else {
      createDecisionMutation.mutate(data);
    }
  }

  async function handleSaveSuggestion(suggestion: EngineeringDecision) {
    setSavingSuggestionTitle(suggestion.title);
    try {
      await adminPost("/api/admin/engineering-behavior/decisions", suggestion);
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-decisions"] });
      setSuggestions((prev) => prev?.filter((s) => s.title !== suggestion.title) ?? null);
    } finally {
      setSavingSuggestionTitle(null);
    }
  }

  // ── Derived values ──
  const profile = profileData?.profile ?? null;
  const engineeringProfile = profileData?.engineeringProfile ?? null;
  const styleProfile = profileData?.styleProfile ?? null;
  const createdAt = profileData?.createdAt ?? null;
  const recommendations = recsData?.recommendations ?? [];
  const decisions = decisionsData?.decisions ?? [];
  const uniqueSources = profile
    ? [...new Set(profile.traits.map((t) => t.sourceDocument))].length
    : 0;
  const lastExtractStats = extractMutation.data
    ? {
        documentsProcessed: extractMutation.data.documentsProcessed,
        documentsSkipped: extractMutation.data.documentsSkipped,
      }
    : null;

  const decisionMutationPending =
    createDecisionMutation.isPending || updateDecisionMutation.isPending;

  return (
    <Grid.Root>
      {/* ── LinkedIn Recommendations ── */}
      <Grid.Row>
        <Grid.Column>
          <AdminCard
            id="linkedin-recommendations"
            title="LinkedIn Recommendations"
            ariaLabel="LinkedIn Recommendations"
          >
            <Body style={{ color: "#666", marginBottom: spacing(3) }}>
              Paste LinkedIn recommendations manually. Author metadata is preserved so future phases
              can weight by observer role.
            </Body>

            <div style={{ marginBottom: spacing(3) }}>
              <Heading
                type="small"
                headerElement="h3"
                title="Saved Recommendations"
                style={{ marginBottom: spacing(2) }}
              />
              {isLoadingRecs ? (
                <Body style={{ color: "#888" }}>Loading...</Body>
              ) : (
                <RecommendationList
                  recommendations={recommendations}
                  onDelete={(id) => deleteRecMutation.mutate(id)}
                />
              )}
            </div>

            <Heading
              type="small"
              headerElement="h3"
              title="Add Recommendation"
              style={{ marginBottom: spacing(2) }}
            />
            <form onSubmit={recHandleSubmit((data) => addRecMutation.mutate(data))}>
              <Controller
                name="authorName"
                control={recControl}
                render={({ field }) => (
                  <TextInput
                    id="authorName"
                    label="Author Name"
                    value={field.value}
                    onChange={field.onChange}
                    style={{ marginBottom: spacing(2) }}
                  />
                )}
              />
              <Controller
                name="authorRole"
                control={recControl}
                render={({ field }) => (
                  <TextInput
                    id="authorRole"
                    label="Author Role"
                    value={field.value}
                    onChange={field.onChange}
                    style={{ marginBottom: spacing(2) }}
                  />
                )}
              />
              <Controller
                name="company"
                control={recControl}
                render={({ field }) => (
                  <TextInput
                    id="company"
                    label="Company"
                    value={field.value}
                    onChange={field.onChange}
                    style={{ marginBottom: spacing(2) }}
                  />
                )}
              />
              <Controller
                name="relationship"
                control={recControl}
                render={({ field }) => (
                  <SelectInput
                    id="relationship"
                    label="Relationship"
                    value={field.value}
                    options={RELATIONSHIP_SELECT_OPTIONS}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="recommendationText"
                control={recControl}
                rules={{
                  validate: (v) =>
                    v.trim().length >= 20 || "Recommendation text must be at least 20 characters.",
                }}
                render={({ field }) => (
                  <TextareaInput
                    id="recommendationText"
                    label="Recommendation Text"
                    value={field.value}
                    onChange={field.onChange}
                    rows={8}
                    style={{ marginBottom: spacing(2) }}
                  />
                )}
              />
              {recErrors.recommendationText && (
                <Body style={{ color: "red", marginBottom: spacing(2) }}>
                  {recErrors.recommendationText.message}
                </Body>
              )}
              {addRecMutation.error && (
                <Body style={{ color: "red", marginBottom: spacing(2) }}>
                  {addRecMutation.error.message}
                </Body>
              )}
              <Button
                type="submit"
                variant="primary"
                text={addRecMutation.isPending ? "Adding..." : "Add Recommendation"}
                disabled={addRecMutation.isPending}
              />
            </form>
          </AdminCard>
        </Grid.Column>
      </Grid.Row>

      {/* ── Extraction Control ── */}
      <Grid.Row>
        <Grid.Column>
          <AdminCard
            id="engineering-behavior"
            title="Engineering Behavior"
            ariaLabel="Engineering Behavior"
          >
            <Body style={{ color: "#666", marginBottom: spacing(3) }}>
              Extract behavioral observations from all sources: employment certificates,
              Arbeitszeugnisse, reference letters, and LinkedIn recommendations.
            </Body>

            <div style={{ marginBottom: spacing(3) }}>
              <Button
                type="button"
                variant="primary"
                text={
                  extractMutation.isPending ? "Extracting..." : "Extract Behavior From Documents"
                }
                disabled={extractMutation.isPending}
                onClick={() => extractMutation.mutate()}
              />
            </div>

            {extractMutation.error && (
              <Body style={{ color: "red", marginBottom: spacing(2) }}>
                {extractMutation.error.message}
              </Body>
            )}

            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 6,
                padding: `${spacing(2)}px ${spacing(2.5)}px`,
              }}
            >
              <Heading
                type="small"
                headerElement="h3"
                title="Status"
                style={{ marginBottom: spacing(1) }}
              />
              <Body style={{ marginBottom: spacing(0.5) }}>
                <strong>Last Extracted:</strong>{" "}
                {isLoadingProfile ? "Loading..." : createdAt ? formatDate(createdAt) : "Never"}
              </Body>
              <Body>
                <strong>Documents Processed:</strong>{" "}
                {lastExtractStats !== null
                  ? `${lastExtractStats.documentsProcessed} processed${lastExtractStats.documentsSkipped > 0 ? `, ${lastExtractStats.documentsSkipped} skipped` : ""}`
                  : profile
                    ? `${uniqueSources} source(s)`
                    : "—"}
              </Body>
            </div>

            {loadError && (
              <Body style={{ color: "red", marginTop: spacing(2) }}>{loadError.message}</Body>
            )}
          </AdminCard>
        </Grid.Column>
      </Grid.Row>

      {/* ── Profile Preview ── */}
      {profile && (
        <>
          <Grid.Row>
            <Grid.Column>
              <AdminCard
                id="behavior-profile-traits"
                title="Behavior Profile Preview"
                ariaLabel="Behavior Profile Preview"
              >
                <Body style={{ color: "#666", marginBottom: spacing(2) }}>
                  {profile.traits.length} trait{profile.traits.length !== 1 ? "s" : ""} extracted
                  from {uniqueSources} source{uniqueSources !== 1 ? "s" : ""}.
                </Body>
                <TraitCards traits={profile.traits} />
              </AdminCard>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <AdminCard
                id="behavior-summaries"
                title="Behavior Summaries"
                ariaLabel="Behavior Summaries"
              >
                <div style={{ marginBottom: spacing(3) }}>
                  <Heading
                    type="small"
                    headerElement="h3"
                    title="English Summary"
                    style={{ marginBottom: spacing(1) }}
                  />
                  <Body style={{ whiteSpace: "pre-wrap" }}>{profile.summary_en}</Body>
                </div>
                <div>
                  <Heading
                    type="small"
                    headerElement="h3"
                    title="German Summary"
                    style={{ marginBottom: spacing(1) }}
                  />
                  <Body style={{ whiteSpace: "pre-wrap" }}>{profile.summary_de}</Body>
                </div>
              </AdminCard>
            </Grid.Column>
          </Grid.Row>
        </>
      )}

      {/* ── Engineering Profile ── */}
      {engineeringProfile && (
        <>
          <Grid.Row>
            <Grid.Column>
              <AdminCard id="core-traits" title="Core Traits" ariaLabel="Core Traits">
                <Body style={{ color: "#666", marginBottom: spacing(2) }}>
                  {engineeringProfile.coreTraits.length} core trait
                  {engineeringProfile.coreTraits.length !== 1 ? "s" : ""} consolidated from
                  extracted observations.
                </Body>
                <CoreTraitCards coreTraits={engineeringProfile.coreTraits} />
              </AdminCard>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <AdminCard
                id="engineering-tendencies"
                title="Engineering Tendencies"
                ariaLabel="Engineering Tendencies"
              >
                <Body style={{ color: "#666", marginBottom: spacing(2) }}>
                  {engineeringProfile.engineeringTendencies.length} engineering
                  {engineeringProfile.engineeringTendencies.length !== 1
                    ? " tendencies"
                    : " tendency"}{" "}
                  derived from core traits.
                </Body>
                <TendencyCards tendencies={engineeringProfile.engineeringTendencies} />
              </AdminCard>
            </Grid.Column>
          </Grid.Row>
        </>
      )}

      {/* ── Engineering Decisions ── */}
      <Grid.Row>
        <Grid.Column>
          <AdminCard
            id="engineering-decisions"
            title="Engineering Decisions"
            ariaLabel="Engineering Decisions"
          >
            <Body style={{ color: "#666", marginBottom: spacing(3) }}>
              Capture real engineering decisions and the tradeoffs behind them. These form the
              Decision Corpus — the evidentiary foundation linking behaviour traits to concrete
              choices.
            </Body>

            <div style={{ display: "flex", gap: spacing(1.5), marginBottom: spacing(3) }}>
              {!showDecisionForm && (
                <Button
                  type="button"
                  variant="primary"
                  text="Add Decision"
                  onClick={() => {
                    setEditingDecision(null);
                    decisionFormReset(EMPTY_DECISION_FORM);
                    setShowDecisionForm(true);
                  }}
                />
              )}
              <Button
                type="button"
                variant="secondary"
                text={suggestMutation.isPending ? "Loading..." : "Suggest Decisions From Portfolio"}
                disabled={suggestMutation.isPending}
                onClick={() => suggestMutation.mutate()}
              />
            </div>

            {suggestMutation.error && (
              <Body style={{ color: "red", marginBottom: spacing(2) }}>
                {suggestMutation.error.message}
              </Body>
            )}

            {suggestions !== null && suggestions.length > 0 && (
              <div style={{ marginBottom: spacing(3) }}>
                <Heading
                  type="small"
                  headerElement="h3"
                  title="Suggested Decisions"
                  style={{ marginBottom: spacing(1) }}
                />
                <Body style={{ color: "#666", marginBottom: spacing(2) }}>
                  Review each suggestion and save the ones that apply. None are saved automatically.
                </Body>
                <Accordion.Group>
                  {suggestions.map((s) => (
                    <SuggestionCard
                      key={s.title}
                      suggestion={s}
                      onSave={handleSaveSuggestion}
                      isSaving={savingSuggestionTitle === s.title}
                    />
                  ))}
                </Accordion.Group>
              </div>
            )}

            {suggestions !== null && suggestions.length === 0 && (
              <Body style={{ color: "#888", marginBottom: spacing(2) }}>
                All suggestions have been saved.
              </Body>
            )}

            {showDecisionForm && (
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: 6,
                  padding: `${spacing(2.5)}px ${spacing(3)}px`,
                  marginBottom: spacing(3),
                }}
              >
                <Heading
                  type="small"
                  headerElement="h3"
                  title={editingDecision ? `Edit: ${editingDecision.title}` : "Add Decision"}
                  style={{ marginBottom: spacing(2) }}
                />
                <form onSubmit={decisionHandleSubmit(handleDecisionSubmit)}>
                  <DecisionFormFields control={decisionControl} errors={decisionErrors} />
                  {(createDecisionMutation.error || updateDecisionMutation.error) && (
                    <Body style={{ color: "red", marginBottom: spacing(2) }}>
                      {(createDecisionMutation.error ?? updateDecisionMutation.error)?.message}
                    </Body>
                  )}
                  <div style={{ display: "flex", gap: spacing(1.5) }}>
                    <Button
                      type="submit"
                      variant="primary"
                      text={
                        decisionMutationPending
                          ? "Saving..."
                          : editingDecision
                            ? "Update Decision"
                            : "Save Decision"
                      }
                      disabled={decisionMutationPending}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      text="Cancel"
                      onClick={handleCancelDecisionForm}
                    />
                  </div>
                </form>
              </div>
            )}
          </AdminCard>
        </Grid.Column>
      </Grid.Row>

      {/* ── Decision Corpus ── */}
      <Grid.Row>
        <Grid.Column>
          <AdminCard id="decision-corpus" title="Decision Corpus" ariaLabel="Decision Corpus">
            {isLoadingDecisions ? (
              <Body style={{ color: "#888" }}>Loading...</Body>
            ) : decisions.length === 0 ? (
              <Body style={{ color: "#888" }}>
                No decisions recorded yet. Add decisions above or use &ldquo;Suggest Decisions From
                Portfolio&rdquo; to populate the corpus.
              </Body>
            ) : (
              <>
                <Body style={{ color: "#666", marginBottom: spacing(2) }}>
                  {decisions.length} decision{decisions.length !== 1 ? "s" : ""} in corpus.
                </Body>
                <Accordion.Group>
                  {decisions.map((d) => (
                    <DecisionCard
                      key={d.id}
                      decision={d}
                      onEdit={handleEditDecision}
                      onDelete={(id) => deleteDecisionMutation.mutate(id)}
                    />
                  ))}
                </Accordion.Group>
              </>
            )}
          </AdminCard>
        </Grid.Column>
      </Grid.Row>

      {/* ── Engineering Style Profile ── */}
      <Grid.Row>
        <Grid.Column>
          <StyleProfileCard
            styleProfile={styleProfile}
            onGenerate={() => generateStyleMutation.mutate()}
            isGenerating={generateStyleMutation.isPending}
            error={generateStyleMutation.error}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
