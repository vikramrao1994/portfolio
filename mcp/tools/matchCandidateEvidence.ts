import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import { getSiteContent } from "@/server/siteContent";
import { MatchCandidateEvidenceInputSchema } from "../schemas/toolSchemas";
import { errorResponse, successResponse } from "../utils/responses";

export async function matchCandidateEvidence(args: unknown) {
  const start = Date.now();
  const parsed = MatchCandidateEvidenceInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  try {
    const { jobDescription, language } = parsed.data;
    const keywords = extractJobKeywords(jobDescription);
    const site = await getSiteContent(language);
    const evidence = scoreCandidateEvidence(site, keywords);
    console.error(`[match_candidate_evidence] ${evidence.length} items in ${Date.now() - start}ms`);
    return successResponse({ evidence });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[match_candidate_evidence] error: ${msg}`);
    return errorResponse(`Evidence matching failed: ${msg}`);
  }
}
