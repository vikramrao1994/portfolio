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
import { useEffect, useState } from "react";
import AdminCard from "@/components/Admin/Card/AdminCard";
import type {
  BehaviorTrait,
  EngineeringBehaviorProfile,
  LinkedInRecommendation,
} from "@/lib/engineering-behavior/schema";
import { RELATIONSHIP_OPTIONS } from "@/lib/engineering-behavior/schema";
import { spacing } from "@/utils/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface ProfileResponse {
  profile: EngineeringBehaviorProfile | null;
  createdAt: string | null;
}

interface ExtractionResponse {
  profile: EngineeringBehaviorProfile;
  documentsProcessed: number;
  documentsSkipped: number;
}

interface RecommendationsResponse {
  recommendations: LinkedInRecommendation[];
}

interface RecForm {
  authorName: string;
  authorRole: string;
  company: string;
  relationship: string;
  recommendationText: string;
}

const EMPTY_REC_FORM: RecForm = {
  authorName: "",
  authorRole: "",
  company: "",
  relationship: "",
  recommendationText: "",
};

const RELATIONSHIP_SELECT_OPTIONS = [
  { value: "", label: "— select —" },
  ...RELATIONSHIP_OPTIONS.map((r) => ({ value: r, label: r })),
];

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EngineeringBehaviorPage() {
  // Profile state
  const [profile, setProfile] = useState<EngineeringBehaviorProfile | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [lastExtractStats, setLastExtractStats] = useState<{
    documentsProcessed: number;
    documentsSkipped: number;
  } | null>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<LinkedInRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recForm, setRecForm] = useState<RecForm>(EMPTY_REC_FORM);
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [addRecError, setAddRecError] = useState<string | null>(null);

  // Load profile + recommendations on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/admin/engineering-behavior");
        if (!res.ok) {
          if (res.status !== 401) setLoadError("Failed to load existing profile.");
          return;
        }
        const data: ProfileResponse = await res.json();
        setProfile(data.profile);
        setCreatedAt(data.createdAt);
      } catch {
        setLoadError("Network error while loading profile.");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    async function loadRecommendations() {
      try {
        const res = await fetch("/api/admin/engineering-behavior/recommendations");
        if (!res.ok) return;
        const data: RecommendationsResponse = await res.json();
        setRecommendations(data.recommendations);
      } finally {
        setIsLoadingRecs(false);
      }
    }

    loadProfile();
    loadRecommendations();
  }, []);

  // Extraction
  async function handleExtract() {
    setIsExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/admin/engineering-behavior/extract", { method: "POST" });
      if (res.status === 401) {
        setExtractError("Not authenticated. Please log in again.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExtractError(data.error ?? "Extraction failed. Please try again.");
        return;
      }
      const data: ExtractionResponse = await res.json();
      setProfile(data.profile);
      setCreatedAt(data.profile.extractedAt);
      setLastExtractStats({
        documentsProcessed: data.documentsProcessed,
        documentsSkipped: data.documentsSkipped,
      });
    } catch {
      setExtractError("Network error. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  }

  // Add recommendation
  function updateRecForm<K extends keyof RecForm>(key: K, value: RecForm[K]) {
    setRecForm((prev) => ({ ...prev, [key]: value }));
    setAddRecError(null);
  }

  async function handleAddRec() {
    if (recForm.recommendationText.trim().length < 20) {
      setAddRecError("Recommendation text must be at least 20 characters.");
      return;
    }
    setIsAddingRec(true);
    setAddRecError(null);
    try {
      const res = await fetch("/api/admin/engineering-behavior/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: recForm.authorName || undefined,
          authorRole: recForm.authorRole || undefined,
          company: recForm.company || undefined,
          relationship: recForm.relationship || undefined,
          recommendationText: recForm.recommendationText,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAddRecError(data.error ?? "Failed to add recommendation.");
        return;
      }
      // Refresh list
      const listRes = await fetch("/api/admin/engineering-behavior/recommendations");
      if (listRes.ok) {
        const data: RecommendationsResponse = await listRes.json();
        setRecommendations(data.recommendations);
      }
      setRecForm(EMPTY_REC_FORM);
    } catch {
      setAddRecError("Network error. Please try again.");
    } finally {
      setIsAddingRec(false);
    }
  }

  // Delete recommendation
  async function handleDeleteRec(id: number) {
    try {
      await fetch(`/api/admin/engineering-behavior/recommendations/${id}`, { method: "DELETE" });
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // silently ignore — list will be stale until next load
    }
  }

  // Unique source count for status display
  const uniqueSources = profile
    ? [...new Set(profile.traits.map((t) => t.sourceDocument))].length
    : 0;

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

            {/* Existing recommendations */}
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
                <RecommendationList recommendations={recommendations} onDelete={handleDeleteRec} />
              )}
            </div>

            {/* Add form */}
            <Heading
              type="small"
              headerElement="h3"
              title="Add Recommendation"
              style={{ marginBottom: spacing(2) }}
            />
            <TextInput
              id="authorName"
              label="Author Name"
              value={recForm.authorName}
              onChange={(e) => updateRecForm("authorName", e.target.value)}
              style={{ marginBottom: spacing(2) }}
            />
            <TextInput
              id="authorRole"
              label="Author Role"
              value={recForm.authorRole}
              onChange={(e) => updateRecForm("authorRole", e.target.value)}
              style={{ marginBottom: spacing(2) }}
            />
            <TextInput
              id="company"
              label="Company"
              value={recForm.company}
              onChange={(e) => updateRecForm("company", e.target.value)}
              style={{ marginBottom: spacing(2) }}
            />
            <SelectInput
              id="relationship"
              label="Relationship"
              value={recForm.relationship}
              options={RELATIONSHIP_SELECT_OPTIONS}
              onChange={(e) => updateRecForm("relationship", e.target.value)}
              style={{ marginBottom: spacing(2) }}
            />
            <TextareaInput
              id="recommendationText"
              label="Recommendation Text"
              value={recForm.recommendationText}
              onChange={(e) => updateRecForm("recommendationText", e.target.value)}
              rows={8}
              style={{ marginBottom: spacing(2) }}
            />
            {addRecError && (
              <Body style={{ color: "red", marginBottom: spacing(2) }}>{addRecError}</Body>
            )}
            <Button
              type="button"
              variant="primary"
              text={isAddingRec ? "Adding..." : "Add Recommendation"}
              disabled={isAddingRec}
              onClick={handleAddRec}
            />
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
                text={isExtracting ? "Extracting..." : "Extract Behavior From Documents"}
                disabled={isExtracting}
                onClick={handleExtract}
              />
            </div>

            {extractError && (
              <Body style={{ color: "red", marginBottom: spacing(2) }}>{extractError}</Body>
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

            {loadError && <Body style={{ color: "red", marginTop: spacing(2) }}>{loadError}</Body>}
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
    </Grid.Root>
  );
}
