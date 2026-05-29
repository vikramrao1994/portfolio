import type {
  CandidateChunk,
  EvidencePackItem,
  RetrievedCandidateChunk,
} from "@/lib/cover-letter/rag/types";
import type { RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { EvidenceItem } from "@/lib/cover-letter/types";
import { getLang } from "@/lib/cover-letter/utils";
import type { Site } from "@/lib/siteSchema";
import type { PositioningPlan } from "../positioning/types";

export interface PersonalProjectReport {
  /** All personal projects present in the candidate DB at pipeline entry. */
  projectsLoaded: Array<{ title: string; skills: string[] }>;
  /** Projects that received a score > 0 from deterministic scoring (currently always empty — not scored). */
  projectsScored: Array<{ title: string; score: number; matchedKeywords: string[] }>;
  /** Projects that were chunked into the retrieval corpus (currently always empty — not chunked). */
  projectsChunked: string[];
  /** Projects surfaced by lexical retrieval (currently always empty — no project chunks exist). */
  projectsRetrieved: Array<{ title: string; score: number; reason: string }>;
  /** Projects that reached the final evidence pack, with pack position (0-indexed). */
  projectsInPack: Array<{ title: string; score: number; position: number }>;
  /** Project titles referenced in rhetorical plan paragraph-goal evidenceIds. */
  projectsInRhetoricalPlan: string[];
  /** Project titles that became differentiators in the positioning plan. */
  projectsInPositioning: string[];
  /** Project titles Claude cited in its generation output (CV summary matchedEvidence only; cover letters: always []). */
  projectsCitedByGeneration: string[];
}

export function computeProjectEvidenceReport({
  siteContent,
  deterministicEvidence,
  candidateChunks,
  retrievedChunks,
  evidencePack,
  rhetoricalPlan,
  positioningPlan,
  citedTitles = [],
}: {
  siteContent: Site;
  deterministicEvidence: EvidenceItem[];
  candidateChunks: CandidateChunk[];
  retrievedChunks: RetrievedCandidateChunk[];
  evidencePack: EvidencePackItem[];
  rhetoricalPlan: RhetoricalPlan;
  positioningPlan: PositioningPlan;
  citedTitles?: string[];
}): PersonalProjectReport {
  const projectsLoaded = siteContent.personal_projects.map((p) => ({
    title: getLang(p.project) || "(untitled)",
    skills: p.skills,
  }));

  const projectTitleSet = new Set(projectsLoaded.map((p) => p.title.toLowerCase()));
  const isProject = (t: string) => projectTitleSet.has(t.toLowerCase());

  const projectsScored = deterministicEvidence
    .filter((e) => isProject(e.title))
    .map((e) => ({ title: e.title, score: e.score, matchedKeywords: e.matchedKeywords }));

  const projectsChunked = candidateChunks.filter((c) => c.type === "project").map((c) => c.title);

  const projectsRetrieved = retrievedChunks
    .filter((r) => r.chunk.type === "project")
    .map((r) => ({ title: r.chunk.title, score: r.score, reason: r.reason }));

  const projectsInPack = evidencePack.flatMap((item, idx) =>
    item.type === "project" ? [{ title: item.title, score: item.score, position: idx }] : [],
  );

  const packProjectTitles = new Set(projectsInPack.map((p) => p.title));
  const allPlanEvidenceIds = rhetoricalPlan.paragraphGoals.flatMap((g) => g.evidenceIds);
  const projectsInRhetoricalPlan = allPlanEvidenceIds.filter(
    (id) => isProject(id) || packProjectTitles.has(id),
  );

  const projectsInPositioning = positioningPlan.differentiators
    .filter((d) => isProject(d.evidenceTitle) || packProjectTitles.has(d.evidenceTitle))
    .map((d) => d.evidenceTitle);

  const projectsCitedByGeneration = citedTitles.filter(isProject);

  return {
    projectsLoaded,
    projectsScored,
    projectsChunked,
    projectsRetrieved,
    projectsInPack,
    projectsInRhetoricalPlan,
    projectsInPositioning,
    projectsCitedByGeneration,
  };
}
