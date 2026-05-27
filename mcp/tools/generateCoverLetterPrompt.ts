import { buildPromptMarkdown } from "@/lib/cover-letter/buildPromptMarkdown";
import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import type { CoverLetterPromptRequest } from "@/lib/cover-letter/types";
import { getSiteContent } from "@/server/siteContent";
import { GenerateCoverLetterPromptInputSchema } from "../schemas/toolSchemas";
import { errorResponse, successResponse } from "../utils/responses";

export async function generateCoverLetterPrompt(args: unknown) {
  const start = Date.now();
  const parsed = GenerateCoverLetterPromptInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  try {
    const { jobDescription, language, companyName, jobTitle } = parsed.data;
    const keywords = extractJobKeywords(jobDescription);
    const site = await getSiteContent(language);
    const evidence = scoreCandidateEvidence(site, keywords);

    const req: CoverLetterPromptRequest = {
      jobDescription,
      language,
      companyName,
      jobTitle,
      tone: "professional",
      includeFullCandidateData: true,
    };

    const markdown = buildPromptMarkdown(req, site, keywords, evidence);
    console.error(`[generate_cover_letter_prompt] completed in ${Date.now() - start}ms`);
    return successResponse({ markdown });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[generate_cover_letter_prompt] error: ${msg}`);
    return errorResponse(`Prompt generation failed: ${msg}`);
  }
}
