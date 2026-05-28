---
name: add-retrieval-pipeline
description: Use when adding or modifying evidence chunking, lexical retrieval, evidence pack merging, or keyword extraction in the cover-letter pipeline.
---

# Add Retrieval Pipeline

## Architecture

```
extractJobKeywords()          → ExtractedKeywords (hardSkills, softSkills, domains, seniority, workMode, languages)
scoreCandidateEvidence()      → EvidenceItem[] (deterministic, authoritative)
buildCandidateChunks()        → CandidateChunk[] (experience, skill, summary, project)
lexicalRetrieveEvidence()     → RetrievedCandidateChunk[] (sorted by score, max 8)
buildEvidencePack()           → EvidencePackItem[] (deterministic priority + retrieved fill, max 8)
```

Entry point: `buildCoverLetterContext()` in `src/lib/cover-letter/context/buildCoverLetterContext.ts` — calls all of the above in sequence.

## Key files

| File | Purpose |
|---|---|
| `src/lib/cover-letter/extractJobKeywords.ts` | Deterministic keyword extraction from job description |
| `src/lib/cover-letter/scoreCandidateEvidence.ts` | Deterministic evidence scoring (experience, skills, education, summary) |
| `src/lib/cover-letter/rag/buildCandidateChunks.ts` | Splits siteContent into typed text chunks with metadata |
| `src/lib/cover-letter/rag/lexicalRetrieveEvidence.ts` | Lexical scoring: hard skill (+5/+6 in meta), soft skill (+2), domain (+3), token overlap (+1 cap 4) |
| `src/lib/cover-letter/rag/buildEvidencePack.ts` | Merges deterministic + retrieved, deduplicates, sorts by score |
| `src/lib/cover-letter/rag/types.ts` | `CandidateChunk`, `RetrievedCandidateChunk`, `EvidencePackItem` |
| `src/lib/cover-letter/context/types.ts` | `CoverLetterContext` |

## Scoring rules (lexical retrieval)

| Match | Score |
|---|---|
| Hard skill in chunk text | +5 |
| Hard skill in `metadata.skills` | +6 (stronger signal) |
| Multi-word hard skill exact phrase | +2 bonus |
| Soft skill in text | +2 |
| Domain in text | +3 |
| Raw token overlap | +1 per token, capped at +4 |

Chunks with score `0` are excluded.

## Evidence pack merge rules

1. `deterministicEvidence` (from `scoreCandidateEvidence`) fills first — always prioritised
2. `retrievedChunks` fill remaining slots up to `MAX_PACK_SIZE = 8`
3. Deduplication by title (case-insensitive)
4. Final sort by score descending, sliced to 8

## Adding a new retrieval signal

1. Define the new signal in `ExtractedKeywords` type (`src/lib/cover-letter/types.ts`)
2. Extract it in `extractJobKeywords.ts`
3. Score it in `lexicalRetrieveEvidence.ts` (follow the scoring pattern with explicit score comments)
4. If it needs chunking changes, update `buildCandidateChunks.ts` and `CandidateChunk` type

## Constraints

- Deterministic scoring is authoritative — retrieved chunks supplement, never override
- Do not add AI calls inside retrieval functions — all retrieval is deterministic
- Score weights must remain consistent between `scoreCandidateEvidence` and `lexicalRetrieveEvidence`
- `MAX_PACK_SIZE = 8` is intentional — avoid evidence overload in Claude's context
