import type { OutputMode } from "@/lib/application-documents/shared/applicationDocumentMcpOutput";
import { buildTailoredCvPayload } from "@/lib/cv-tailor/buildTailoredCvPayload";
import { generateCvSummaryWithClaude } from "@/lib/cv-tailor/generateCvSummaryWithClaude";
import { GenerateTailoredCvPdfInputSchema } from "@mcp/schemas/toolSchemas";
import { spawnTailoredCvPdf } from "@mcp/utils/pdf";
import { errorResponse, successResponse } from "@mcp/utils/responses";

export async function generateTailoredCvPdf(args: unknown, outputMode: OutputMode) {
  const start = Date.now();
  const parsed = GenerateTailoredCvPdfInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid input: ${parsed.error.message}`);
  }

  const { jobDescription, language, companyName, jobTitle } = parsed.data;

  try {
    const { suggestion, siteContent, model, usage } = await generateCvSummaryWithClaude({
      jobDescription,
      language,
      companyName,
      jobTitle,
    });

    console.error(
      `[generate_tailored_cv_pdf] Claude done (${model}, ${usage.input_tokens}in/${usage.output_tokens}out)`,
    );

    const tailoredPayload = buildTailoredCvPayload(siteContent, suggestion, language);
    const pdfResult = await spawnTailoredCvPdf(tailoredPayload, language, companyName, outputMode);

    console.error(
      `[generate_tailored_cv_pdf] PDF ready (${pdfResult.mode}, ${Date.now() - start}ms total)`,
    );

    return successResponse({ ...pdfResult, suggestion });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[generate_tailored_cv_pdf] error: ${msg}`);
    return errorResponse(`Tailored CV generation failed: ${msg}`);
  }
}
