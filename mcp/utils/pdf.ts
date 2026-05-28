import path from "node:path";
import type { CoverLetterContent } from "@/lib/cover-letter/coverLetterContentSchema";
import { renderCoverLetterPdfToPath } from "@/lib/cover-letter/pdf/runCoverLetterPdfRenderer";
import type { Site } from "@/lib/siteSchema";

/**
 * Render a cover letter PDF to the persistent output directory and return the
 * absolute file path. Used by the local stdio MCP server tools.
 *
 * Note: on a remote deployment (e.g. Fly.io) this path is local to the server
 * container. See renderCoverLetterPdfToPath for details.
 */
export async function spawnPdfRenderer(
  coverLetter: CoverLetterContent,
  siteContent: Site,
): Promise<string> {
  const outputDir = path.join(process.cwd(), "generated", "cover-letters");
  return renderCoverLetterPdfToPath(coverLetter, siteContent, outputDir);
}
