import { buildPromptMarkdown } from "@/lib/cover-letter/buildPromptMarkdown";
import { buildCoverLetterContext } from "@/lib/cover-letter/context/buildCoverLetterContext";
import { buildCompanyAlignment } from "@/lib/cover-letter/rhetoric/buildCompanyAlignment";
import { buildRhetoricalPlan } from "@/lib/cover-letter/rhetoric/buildRhetoricalPlan";
import type { CoverLetterRequest } from "@/lib/cover-letter/schemas";
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

    const context = await buildCoverLetterContext(jobDescription, language);
    const { siteContent, extractedKeywords, deterministicEvidence, evidencePack } = context;

    const companyAlignment = buildCompanyAlignment({ jobDescription, extractedKeywords });
    const rhetoricalPlan = buildRhetoricalPlan({
      evidencePack,
      companyAlignment,
      jobDescription,
      tone: "professional",
    });

    const req: CoverLetterRequest = {
      jobDescription,
      language,
      companyName,
      jobTitle,
      tone: "professional",
      includeFullCandidateData: true,
    };

    const markdown = buildPromptMarkdown(
      req,
      siteContent,
      extractedKeywords,
      deterministicEvidence,
      evidencePack,
      rhetoricalPlan,
    );
    console.error(`[generate_cover_letter_prompt] completed in ${Date.now() - start}ms`);
    return successResponse({ markdown });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[generate_cover_letter_prompt] error: ${msg}`);
    return errorResponse(`Prompt generation failed: ${msg}`);
  }
}
