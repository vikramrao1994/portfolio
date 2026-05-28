import type { EvidenceItem } from "../types";
import type { CandidateChunk, EvidencePackItem, RetrievedCandidateChunk } from "./types";

const MAX_PACK_SIZE = 8;

function deterministicTypeToChunkType(type: EvidenceItem["type"]): CandidateChunk["type"] {
  if (type === "executive_summary") return "summary";
  return type;
}

export function buildEvidencePack(
  deterministicEvidence: EvidenceItem[],
  retrievedChunks: RetrievedCandidateChunk[],
): EvidencePackItem[] {
  const pack: EvidencePackItem[] = [];
  const seenTitles = new Set<string>();

  // Deterministic evidence has priority
  for (const item of deterministicEvidence) {
    const key = item.title.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    pack.push({
      title: item.title,
      type: deterministicTypeToChunkType(item.type),
      score: item.score,
      matchedKeywords: item.matchedKeywords,
      matchedTerms: [],
      reason: item.reason,
      content: item.content,
    });
  }

  // Retrieved chunks fill remaining slots
  for (const retrieved of retrievedChunks) {
    if (pack.length >= MAX_PACK_SIZE) break;
    const key = retrieved.chunk.title.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    pack.push({
      title: retrieved.chunk.title,
      type: retrieved.chunk.type,
      score: retrieved.score,
      matchedKeywords: retrieved.matchedKeywords,
      matchedTerms: retrieved.matchedTerms,
      reason: retrieved.reason,
      content: retrieved.chunk.text,
      metadata: retrieved.chunk.metadata,
    });
  }

  return pack.sort((a, b) => b.score - a.score).slice(0, MAX_PACK_SIZE);
}
