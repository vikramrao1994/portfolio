import type { ExtractedKeywords } from "../types";
import { tokenizeText } from "./textUtils";
import type { CandidateChunk, RetrievedCandidateChunk } from "./types";

const DEFAULT_LIMIT = 8;

function termContains(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i").test(text);
}

function buildReason(
  matchedKeywords: string[],
  hardInMeta: string[],
  matchedTerms: string[],
): string {
  const parts: string[] = [];
  if (hardInMeta.length > 0) {
    parts.push(`Matched ${hardInMeta.join(", ")} in skills metadata`);
  }
  const inContent = matchedKeywords.filter((k) => !hardInMeta.includes(k));
  if (inContent.length > 0) {
    parts.push(`Matched ${inContent.join(", ")} in content`);
  }
  if (parts.length === 0 && matchedTerms.length > 0) {
    parts.push(`Term overlap: ${matchedTerms.slice(0, 4).join(", ")}`);
  }
  return parts.length > 0 ? parts.join("; ") : "Lexical match";
}

export function lexicalRetrieveEvidence(
  chunks: CandidateChunk[],
  keywords: ExtractedKeywords,
  limit = DEFAULT_LIMIT,
): RetrievedCandidateChunk[] {
  const jdTokens = new Set(
    tokenizeText([...keywords.hardSkills, ...keywords.softSkills, ...keywords.domains].join(" ")),
  );

  const results: RetrievedCandidateChunk[] = [];

  for (const chunk of chunks) {
    const textLower = chunk.text.toLowerCase();
    const metaSkills = (chunk.metadata?.skills ?? []).map((s) => s.toLowerCase());

    let score = 0;
    const matchedKeywords: string[] = [];
    const hardInMeta: string[] = [];

    // Hard skill in chunk text: +5 each
    for (const kw of keywords.hardSkills) {
      const kwLower = kw.toLowerCase();
      if (termContains(textLower, kwLower)) {
        score += 5;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    }

    // Hard skill in metadata.skills: +6 each (stronger signal)
    for (const kw of keywords.hardSkills) {
      const kwLower = kw.toLowerCase();
      if (metaSkills.some((s) => termContains(s, kwLower))) {
        score += 6;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        if (!hardInMeta.includes(kw)) hardInMeta.push(kw);
      }
    }

    // Soft skill: +2 each
    for (const kw of keywords.softSkills) {
      if (termContains(textLower, kw.toLowerCase())) {
        score += 2;
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      }
    }

    // Domain: +3 each
    for (const domain of keywords.domains) {
      if (termContains(textLower, domain.toLowerCase())) {
        score += 3;
        if (!matchedKeywords.includes(domain)) matchedKeywords.push(domain);
      }
    }

    // Multi-word hard skill exact phrase bonus: +2
    for (const kw of keywords.hardSkills) {
      if (kw.includes(" ") && textLower.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    // Raw token overlap: +1 per matching token, capped at +4
    const chunkTokens = new Set(tokenizeText(chunk.text));
    const matchedTerms: string[] = [];
    let tokenBonus = 0;
    for (const token of chunkTokens) {
      if (jdTokens.has(token) && token.length > 2) {
        matchedTerms.push(token);
        tokenBonus++;
        if (tokenBonus >= 4) break;
      }
    }
    score += tokenBonus;

    if (score === 0) continue;

    results.push({
      chunk,
      score,
      matchedKeywords,
      matchedTerms,
      reason: buildReason(matchedKeywords, hardInMeta, matchedTerms),
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
