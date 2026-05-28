import { getSiteContent } from "@/server/siteContent";
import { extractJobKeywords } from "../extractJobKeywords";
import { buildCandidateChunks } from "../rag/buildCandidateChunks";
import { buildEvidencePack } from "../rag/buildEvidencePack";
import { lexicalRetrieveEvidence } from "../rag/lexicalRetrieveEvidence";
import { scoreCandidateEvidence } from "../scoreCandidateEvidence";
import type { CoverLetterContext } from "./types";

export async function buildCoverLetterContext(
  jobDescription: string,
  language: "en" | "de",
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
