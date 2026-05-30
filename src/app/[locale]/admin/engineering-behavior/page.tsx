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
import { Controller, useForm } from "react-hook-form";
import AdminCard from "@/components/Admin/Card/AdminCard";
import {
  type BehaviorTrait,
  type EngineeringBehaviorProfile,
  type LinkedInRecommendation,
  RELATIONSHIP_OPTIONS,
} from "@/lib/engineering-behavior/schema";
import { adminDelete, adminGet, adminPost } from "@/utils/adminFetch";
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
  const queryClient = useQueryClient();

  // ── Queries ──
  const { data: profileData, isLoading: isLoadingProfile, error: loadError } = useQuery({
    queryKey: ["engineering-behavior-profile"],
    queryFn: () => adminGet<ProfileResponse>("/api/admin/engineering-behavior"),
  });

  const { data: recsData, isLoading: isLoadingRecs } = useQuery({
    queryKey: ["engineering-behavior-recommendations"],
    queryFn: () => adminGet<RecommendationsResponse>("/api/admin/engineering-behavior/recommendations"),
  });

  // ── Mutations ──
  const extractMutation = useMutation({
    mutationFn: () => adminPost<ExtractionResponse>("/api/admin/engineering-behavior/extract"),
    onSuccess: (data) => {
      queryClient.setQueryData<ProfileResponse>(["engineering-behavior-profile"], {
        profile: data.profile,
        createdAt: data.profile.extractedAt,
      });
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
      reset();
    },
  });

  const deleteRecMutation = useMutation({
    mutationFn: (id: number) =>
      adminDelete(`/api/admin/engineering-behavior/recommendations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineering-behavior-recommendations"] });
    },
  });

  // ── Form ──
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecForm>({
    defaultValues: {
      authorName: "",
      authorRole: "",
      company: "",
      relationship: "",
      recommendationText: "",
    },
  });

  // ── Derived values ──
  const profile = profileData?.profile ?? null;
  const createdAt = profileData?.createdAt ?? null;
  const recommendations = recsData?.recommendations ?? [];
  const uniqueSources = profile
    ? [...new Set(profile.traits.map((t) => t.sourceDocument))].length
    : 0;
  const lastExtractStats = extractMutation.data
    ? {
        documentsProcessed: extractMutation.data.documentsProcessed,
        documentsSkipped: extractMutation.data.documentsSkipped,
      }
    : null;

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
            <form onSubmit={handleSubmit((data) => addRecMutation.mutate(data))}>
              <Controller
                name="authorName"
                control={control}
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
                control={control}
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
                control={control}
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
                control={control}
                render={({ field }) => (
                  <SelectInput
                    id="relationship"
                    label="Relationship"
                    value={field.value}
                    options={RELATIONSHIP_SELECT_OPTIONS}
                    onChange={field.onChange}
                    style={{ marginBottom: spacing(2) }}
                  />
                )}
              />
              <Controller
                name="recommendationText"
                control={control}
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
              {errors.recommendationText && (
                <Body style={{ color: "red", marginBottom: spacing(2) }}>
                  {errors.recommendationText.message}
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
                text={extractMutation.isPending ? "Extracting..." : "Extract Behavior From Documents"}
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
    </Grid.Root>
  );
}
