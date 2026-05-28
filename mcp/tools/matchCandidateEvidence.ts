import { buildCoverLetterContext } from "@/lib/cover-letter/context/buildCoverLetterContext";
import { MatchCandidateEvidenceInputSchema } from "@mcp/schemas/toolSchemas";
import { errorResponse, successResponse } from "@mcp/utils/responses";

export async function matchCandidateEvidence(args: unknown) {
  const start = Date.now();
  const parsed = MatchCandidateEvidenceInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  try {
    const { jobDescription, language } = parsed.data;
    const context = await buildCoverLetterContext(jobDescription, language);
    const { deterministicEvidence, retrievedChunks, evidencePack } = context;

    console.error(
      `[match_candidate_evidence] ${deterministicEvidence.length} deterministic, ${retrievedChunks.length} retrieved, ${evidencePack.length} pack items in ${Date.now() - start}ms`,
    );

    return successResponse({
      evidence: deterministicEvidence,
      retrievedChunks: retrievedChunks.map(({ chunk, score, matchedKeywords, reason }) => ({
        id: chunk.id,
        title: chunk.title,
        type: chunk.type,
        score,
        matchedKeywords,
        reason,
      })),
      evidencePack,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[match_candidate_evidence] error: ${msg}`);
    return errorResponse(`Evidence matching failed: ${msg}`);
  }
}
