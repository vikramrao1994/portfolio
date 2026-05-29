import { buildApplicationContext } from "@/lib/application-documents/context/buildApplicationContext";
import { buildPromptMarkdown } from "@/lib/cover-letter/buildPromptMarkdown";
import type { CoverLetterRequest } from "@/lib/cover-letter/schemas";
import { GenerateCoverLetterPromptInputSchema } from "@mcp/schemas/toolSchemas";
import { errorResponse, successResponse } from "@mcp/utils/responses";

export async function generateCoverLetterPrompt(args: unknown) {
  const start = Date.now();
  const parsed = GenerateCoverLetterPromptInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  try {
    const { jobDescription, language, companyName, jobTitle } = parsed.data;

    const context = await buildApplicationContext(jobDescription, language, "professional");
    const {
      siteContent,
      extractedKeywords,
      deterministicEvidence,
      evidencePack,
      rhetoricalPlan,
      positioningPlan,
    } = context;

    const req: CoverLetterRequest = {
      jobDescription,
      language,
      companyName,
      jobTitle,
      tone: "professional",
      includeFullCandidateData: false,
    };

    const markdown = buildPromptMarkdown(
      req,
      siteContent,
      extractedKeywords,
      deterministicEvidence,
      evidencePack,
      rhetoricalPlan,
      positioningPlan,
    );
    console.error(`[generate_cover_letter_prompt] completed in ${Date.now() - start}ms`);
    return successResponse({ markdown });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[generate_cover_letter_prompt] error: ${msg}`);
    return errorResponse(`Prompt generation failed: ${msg}`);
  }
}
