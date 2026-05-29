import type { OutputMode } from "@/lib/application-documents/shared/applicationDocumentMcpOutput";
import { orchestrateCoverLetterGeneration } from "@/lib/cover-letter/orchestrateCoverLetterGeneration";
import { GenerateCoverLetterPdfInputSchema } from "@mcp/schemas/toolSchemas";
import { spawnPdfRenderer } from "@mcp/utils/pdf";
import { errorResponse, successResponse } from "@mcp/utils/responses";

export async function generateCoverLetterPdf(args: unknown, outputMode: OutputMode) {
  const start = Date.now();
  const parsed = GenerateCoverLetterPdfInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  const { jobDescription, language, companyName, jobTitle, recruiterName, tone } = parsed.data;

  try {
    const { coverLetter, siteContent, evidence, model, usage } =
      await orchestrateCoverLetterGeneration({
        jobDescription,
        language,
        companyName,
        jobTitle,
        recruiterName,
        tone: tone ?? "professional",
      });

    console.error(
      `[generate_cover_letter_pdf] Claude done (${model}, ${usage.input_tokens}in/${usage.output_tokens}out)`,
    );

    const pdfResult = await spawnPdfRenderer(coverLetter, siteContent, outputMode);

    console.error(
      `[generate_cover_letter_pdf] PDF ready (${pdfResult.mode}, ${Date.now() - start}ms total)`,
    );

    return successResponse({
      coverLetter,
      ...pdfResult,
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
