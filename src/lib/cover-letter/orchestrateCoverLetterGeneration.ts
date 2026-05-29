import { buildApplicationContext } from "@/lib/application-documents/context/buildApplicationContext";
import type { PositioningPlan } from "@/lib/application-documents/positioning/types";
import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import type { RhetoricalPlan } from "@/lib/cover-letter/rhetoric/types";
import type { Site } from "@/lib/siteSchema";
import { buildClaudeJsonPrompt } from "./buildClaudeJsonPrompt";
import type { CoverLetterContent } from "./coverLetterContentSchema";
import { generateCoverLetterWithClaude } from "./generateCoverLetterWithClaude";
import type { Language, Tone } from "./schemas";
import type { EvidenceItem, ExtractedKeywords } from "./types";

// Pre-default input type: tone and includeFullCandidateData are optional.
// After defaults are applied, services receive the required CoverLetterRequest type.
export type OrchestrateCoverLetterInput = {
  jobDescription: string;
  language: Language;
  companyName?: string;
  jobTitle?: string;
  recruiterName?: string;
  tone?: Tone;
  includeFullCandidateData?: boolean;
};

export interface OrchestrateCoverLetterResult {
  coverLetter: CoverLetterContent;
  siteContent: Site;
  extractedKeywords: ExtractedKeywords;
  evidence: EvidenceItem[];
  evidencePack: EvidencePackItem[];
  rhetoricalPlan: RhetoricalPlan;
  positioningPlan: PositioningPlan;
  prompt: string;
  model: string;
  usage: {
    input_tokens: number | undefined;
    output_tokens: number | undefined;
  };
}

export async function orchestrateCoverLetterGeneration(
  input: OrchestrateCoverLetterInput,
): Promise<OrchestrateCoverLetterResult> {
  const {
    jobDescription,
    language,
    companyName,
    jobTitle,
    recruiterName,
    tone,
    includeFullCandidateData,
  } = input;

  const context = await buildApplicationContext(jobDescription, language, tone ?? "professional");
  const {
    siteContent,
    extractedKeywords,
    deterministicEvidence: evidence,
    evidencePack,
    rhetoricalPlan,
    positioningPlan,
  } = context;

  const prompt = buildClaudeJsonPrompt(
    {
      jobDescription,
      language,
      companyName,
      jobTitle,
      recruiterName,
      tone: tone ?? "professional",
      includeFullCandidateData: includeFullCandidateData ?? false,
    },
    siteContent,
    extractedKeywords,
    evidence,
    evidencePack,
    rhetoricalPlan,
    positioningPlan,
  );

  const { coverLetter, model, usage } = await generateCoverLetterWithClaude(prompt);

  return {
    coverLetter,
    siteContent,
    extractedKeywords,
    evidence,
    evidencePack,
    rhetoricalPlan,
    positioningPlan,
    prompt,
    model,
    usage,
  };
}
