import type { Site } from "@/lib/siteSchema";
import { buildClaudeJsonPrompt } from "./buildClaudeJsonPrompt";
import { buildCoverLetterContext } from "./context/buildCoverLetterContext";
import type { CoverLetterContent } from "./coverLetterContentSchema";
import { generateCoverLetterWithClaude } from "./generateCoverLetterWithClaude";
import type { EvidencePackItem } from "./rag/types";
import type { EvidenceItem, ExtractedKeywords } from "./types";

export interface OrchestrateCoverLetterInput {
  jobDescription: string;
  language: "en" | "de";
  companyName?: string;
  jobTitle?: string;
  recruiterName?: string;
  tone?: "professional" | "warm" | "direct" | "modern";
  includeFullCandidateData?: boolean;
}

export interface OrchestrateCoverLetterResult {
  coverLetter: CoverLetterContent;
  siteContent: Site;
  extractedKeywords: ExtractedKeywords;
  evidence: EvidenceItem[];
  evidencePack: EvidencePackItem[];
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
  );

  const { coverLetter, model, usage } = await generateCoverLetterWithClaude(prompt);

  return {
    coverLetter,
    siteContent,
    extractedKeywords,
    evidence,
    evidencePack,
    prompt,
    model,
    usage,
  };
}
