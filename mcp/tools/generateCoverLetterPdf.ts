import { orchestrateCoverLetterGeneration } from "@/lib/cover-letter/orchestrateCoverLetterGeneration";
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

    const pdfPath = await spawnPdfRenderer(coverLetter, siteContent);

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
