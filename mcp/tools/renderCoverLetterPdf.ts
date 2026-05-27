import { getSiteContent } from "@/server/siteContent";
import { RenderCoverLetterPdfInputSchema } from "../schemas/toolSchemas";
import { errorResponse, successResponse } from "../utils/responses";
import { spawnPdfRenderer } from "../utils/pdf";

export async function renderCoverLetterPdf(args: unknown) {
  const start = Date.now();
  const parsed = RenderCoverLetterPdfInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorResponse(`Invalid cover letter: ${parsed.error.message}`);
  }

  const { coverLetter } = parsed.data;

  try {
    const siteContent = await getSiteContent(coverLetter.language);
    const pdfPath = await spawnPdfRenderer(coverLetter, siteContent);
    console.error(`[render_cover_letter_pdf] PDF at ${pdfPath} (${Date.now() - start}ms)`);
    return successResponse({ pdfPath });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[render_cover_letter_pdf] error: ${msg}`);
    return errorResponse(`PDF rendering failed: ${msg}`);
  }
}
