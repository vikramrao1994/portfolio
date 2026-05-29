import type { OutputMode } from "@/lib/application-documents/shared/applicationDocumentMcpOutput";
import { getSiteContent } from "@/server/siteContent";
import { spawnPdfRenderer } from "@mcp/utils/pdf";
import { RenderCoverLetterPdfInputSchema } from "@mcp/schemas/toolSchemas";
import { errorResponse, successResponse } from "@mcp/utils/responses";

export async function renderCoverLetterPdf(args: unknown, outputMode: OutputMode, appBaseUrl?: string) {
  const start = Date.now();
  const parsed = RenderCoverLetterPdfInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid cover letter: ${parsed.error.message}`);
  }

  const { coverLetter } = parsed.data;

  try {
    const siteContent = await getSiteContent(coverLetter.language);
    const pdfResult = await spawnPdfRenderer(coverLetter, siteContent, outputMode, appBaseUrl);
    console.error(
      `[render_cover_letter_pdf] PDF ready (${pdfResult.mode}, ${Date.now() - start}ms)`,
    );
    return successResponse(pdfResult);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[render_cover_letter_pdf] error: ${msg}`);
    return errorResponse(`PDF rendering failed: ${msg}`);
  }
}
