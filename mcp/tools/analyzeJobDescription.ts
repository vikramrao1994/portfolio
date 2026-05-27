import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { AnalyzeJobDescriptionInputSchema } from "../schemas/toolSchemas";
import { errorResponse, successResponse } from "../utils/responses";

export async function analyzeJobDescription(args: unknown) {
  const start = Date.now();
  const parsed = AnalyzeJobDescriptionInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  try {
    const { jobDescription } = parsed.data;
    const keywords = extractJobKeywords(jobDescription);
    console.error(`[analyze_job_description] completed in ${Date.now() - start}ms`);
    return successResponse(keywords);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[analyze_job_description] error: ${msg}`);
    return errorResponse(`Analysis failed: ${msg}`);
  }
}
