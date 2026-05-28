import type { Site } from "@/lib/siteSchema";
import type { CandidateChunk, EvidencePackItem, RetrievedCandidateChunk } from "../rag/types";
import type { EvidenceItem, ExtractedKeywords } from "../types";

export interface CoverLetterContext {
  siteContent: Site;
  extractedKeywords: ExtractedKeywords;
  deterministicEvidence: EvidenceItem[];
  candidateChunks: CandidateChunk[];
  retrievedChunks: RetrievedCandidateChunk[];
  evidencePack: EvidencePackItem[];
}
