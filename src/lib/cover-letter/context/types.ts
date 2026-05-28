import type {
  CandidateChunk,
  EvidencePackItem,
  RetrievedCandidateChunk,
} from "@/lib/cover-letter/rag/types";
import type { EvidenceItem, ExtractedKeywords } from "@/lib/cover-letter/types";
import type { Site } from "@/lib/siteSchema";

export interface CoverLetterContext {
  siteContent: Site;
  extractedKeywords: ExtractedKeywords;
  deterministicEvidence: EvidenceItem[];
  candidateChunks: CandidateChunk[];
  retrievedChunks: RetrievedCandidateChunk[];
  evidencePack: EvidencePackItem[];
}
