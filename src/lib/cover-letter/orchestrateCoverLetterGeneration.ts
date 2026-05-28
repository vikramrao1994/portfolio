import { buildCoverLetterContext } from "@/lib/cover-letter/context/buildCoverLetterContext";
import type { EvidencePackItem } from "@/lib/cover-letter/rag/types";
import { buildCompanyAlignment } from "@/lib/cover-letter/rhetoric/buildCompanyAlignment";
import { buildRhetoricalPlan } from "@/lib/cover-letter/rhetoric/buildRhetoricalPlan";
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

  const context = await buildCoverLetterContext(jobDescription, language);
  const { siteContent, extractedKeywords, deterministicEvidence: evidence, evidencePack } = context;

  const companyAlignment = buildCompanyAlignment({
    jobDescription,
    extractedKeywords,
  });

  const rhetoricalPlan = buildRhetoricalPlan({
    evidencePack,
    companyAlignment,
    jobDescription,
    tone: tone ?? "professional",
  });

  const prompt = buildClaudeJsonPrompt(
    {
      jobDescription,
      language,
      companyName,
      jobTitle,
      recruiterName,
      tone: tone ?? "professional",
      includeFullCandidateData: includeFullCandidateData ?? true,
    },
    siteContent,
    extractedKeywords,
    evidence,
    evidencePack,
    rhetoricalPlan,
  );

  const { coverLetter, model, usage } = await generateCoverLetterWithClaude(prompt);

  return {
    coverLetter,
    siteContent,
    extractedKeywords,
    evidence,
    evidencePack,
    rhetoricalPlan,
    prompt,
    model,
    usage,
  };
}
