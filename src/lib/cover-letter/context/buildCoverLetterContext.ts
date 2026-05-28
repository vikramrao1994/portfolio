import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { buildCandidateChunks } from "@/lib/cover-letter/rag/buildCandidateChunks";
import { buildEvidencePack } from "@/lib/cover-letter/rag/buildEvidencePack";
import { lexicalRetrieveEvidence } from "@/lib/cover-letter/rag/lexicalRetrieveEvidence";
import type { Language } from "@/lib/cover-letter/schemas";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import { getSiteContent } from "@/server/siteContent";
import type { CoverLetterContext } from "./types";

export async function buildCoverLetterContext(
  jobDescription: string,
  language: Language,
): Promise<CoverLetterContext> {
  const siteContent = await getSiteContent(language);
  const extractedKeywords = extractJobKeywords(jobDescription);
  const deterministicEvidence = scoreCandidateEvidence(siteContent, extractedKeywords);
  const candidateChunks = buildCandidateChunks(siteContent, language);
  const retrievedChunks = lexicalRetrieveEvidence(candidateChunks, extractedKeywords);
  const evidencePack = buildEvidencePack(deterministicEvidence, retrievedChunks);

  return {
    siteContent,
    extractedKeywords,
    deterministicEvidence,
    candidateChunks,
    retrievedChunks,
    evidencePack,
  };
}
