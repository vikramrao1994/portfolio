import type { Site } from "@/lib/siteSchema";
import { getSiteContent } from "@/server/siteContent";
import { buildClaudeJsonPrompt } from "./buildClaudeJsonPrompt";
import type { CoverLetterContent } from "./coverLetterContentSchema";
import { extractJobKeywords } from "./extractJobKeywords";
import { generateCoverLetterWithClaude } from "./generateCoverLetterWithClaude";
import { scoreCandidateEvidence } from "./scoreCandidateEvidence";
import type { CoverLetterPromptRequest, EvidenceItem, ExtractedKeywords } from "./types";

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

  const siteContent = await getSiteContent(language);
  const extractedKeywords = extractJobKeywords(jobDescription);
  const evidence = scoreCandidateEvidence(siteContent, extractedKeywords);

  const req: CoverLetterPromptRequest = {
    jobDescription,
    language,
    companyName,
    jobTitle,
    recruiterName,
    tone: tone ?? "professional",
    includeFullCandidateData: includeFullCandidateData ?? true,
  };

  const prompt = buildClaudeJsonPrompt(req, siteContent, extractedKeywords, evidence);
  const { coverLetter, model, usage } = await generateCoverLetterWithClaude(prompt);

  return { coverLetter, siteContent, extractedKeywords, evidence, prompt, model, usage };
}
