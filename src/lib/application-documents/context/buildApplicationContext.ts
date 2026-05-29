import { buildPositioningPlan } from "@/lib/application-documents/positioning/buildPositioningPlan";
import type { PositioningPlan } from "@/lib/application-documents/positioning/types";
import { buildCoverLetterContext } from "@/lib/cover-letter/context/buildCoverLetterContext";
import type { CoverLetterContext } from "@/lib/cover-letter/context/types";
import { buildCompanyAlignment } from "@/lib/cover-letter/rhetoric/buildCompanyAlignment";
import { buildRhetoricalPlan } from "@/lib/cover-letter/rhetoric/buildRhetoricalPlan";
import type { CompanyAlignment, RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { Language, Tone } from "@/lib/cover-letter/schemas";
import {
  computeProjectEvidenceReport,
  type PersonalProjectReport,
} from "../observability/projectEvidenceReport";

export interface ApplicationContext extends CoverLetterContext {
  companyAlignment: CompanyAlignment;
  rhetoricalPlan: RhetoricalPlan;
  positioningPlan: PositioningPlan;
  projectEvidenceReport: PersonalProjectReport;
}

export async function buildApplicationContext(
  jobDescription: string,
  language: Language,
  tone: Tone = "professional",
): Promise<ApplicationContext> {
  const context = await buildCoverLetterContext(jobDescription, language);
  const {
    siteContent,
    extractedKeywords,
    deterministicEvidence,
    candidateChunks,
    retrievedChunks,
    evidencePack,
  } = context;

  const companyAlignment = buildCompanyAlignment({ jobDescription, extractedKeywords });

  const rhetoricalPlan = buildRhetoricalPlan({
    evidencePack,
    companyAlignment,
    jobDescription,
    tone,
  });

  const positioningPlan = buildPositioningPlan({
    evidencePack,
    companyAlignment,
    rhetoricalPlan,
    extractedKeywords,
  });

  const projectEvidenceReport = computeProjectEvidenceReport({
    siteContent,
    deterministicEvidence,
    candidateChunks,
    retrievedChunks,
    evidencePack,
    rhetoricalPlan,
    positioningPlan,
  });

  return { ...context, companyAlignment, rhetoricalPlan, positioningPlan, projectEvidenceReport };
}
