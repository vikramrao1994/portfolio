import { buildClaudeJsonPrompt } from "@/lib/cover-letter/buildClaudeJsonPrompt";
import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { generateCoverLetterWithClaude } from "@/lib/cover-letter/generateCoverLetterWithClaude";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import type { CoverLetterPromptRequest } from "@/lib/cover-letter/types";
import { getSiteContent } from "@/server/siteContent";
import { GenerateCoverLetterPdfInputSchema } from "../schemas/toolSchemas";
import { errorResponse, successResponse } from "../utils/responses";
import { spawnPdfRenderer } from "../utils/pdf";

export async function generateCoverLetterPdf(args: unknown) {
  const start = Date.now();
  const parsed = GenerateCoverLetterPdfInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  const { jobDescription, language, companyName, jobTitle, recruiterName, tone } = parsed.data;

  try {
    // 1. Load candidate portfolio data
    const site = await getSiteContent(language);

    // 2. Deterministic keyword extraction
    const keywords = extractJobKeywords(jobDescription);

    // 3. Deterministic candidate evidence scoring
    const evidence = scoreCandidateEvidence(site, keywords);

    console.error(
      `[generate_cover_letter_pdf] keywords: ${keywords.hardSkills.length} hard, evidence: ${evidence.length} items`,
    );

    // 4. Build Claude prompt
    const req: CoverLetterPromptRequest = {
      jobDescription,
      language,
      companyName,
      jobTitle,
      recruiterName,
      tone: tone ?? "professional",
      includeFullCandidateData: true,
    };
    const prompt = buildClaudeJsonPrompt(req, site, keywords, evidence);

    // 5. Generate cover letter via Claude (validates response internally)
    const { coverLetter, model, usage } = await generateCoverLetterWithClaude(prompt);

    console.error(
      `[generate_cover_letter_pdf] Claude done (${model}, ${usage.input_tokens}in/${usage.output_tokens}out)`,
    );

    // 6. Render PDF via existing Python renderer
    const pdfPath = await spawnPdfRenderer(coverLetter, site);

    console.error(`[generate_cover_letter_pdf] PDF at ${pdfPath} (${Date.now() - start}ms total)`);

    return successResponse({
      coverLetter,
      pdfPath,
      matchedEvidence: evidence.map(({ title, score, matchedKeywords, reason }) => ({
        title,
        score,
        matchedKeywords,
        reason,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[generate_cover_letter_pdf] error: ${msg}`);
    return errorResponse(`Cover letter generation failed: ${msg}`);
  }
}
