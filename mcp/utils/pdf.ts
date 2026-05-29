import path from "node:path";
import type { CoverLetterContent } from "@/lib/cover-letter/coverLetterContentSchema";
import { renderCoverLetterPdfToPath } from "@/lib/cover-letter/pdf/runCoverLetterPdfRenderer";
import type { Language } from "@/lib/cover-letter/schemas";
import {
  buildTailoredCvFilename,
  renderTailoredCvPdfToPath,
} from "@/lib/cv-tailor/renderTailoredCvPdf";
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

/**
 * Render a tailored CV PDF to the persistent output directory and return the
 * absolute file path. Used by the local stdio MCP server tools.
 *
 * Note: on a remote deployment (e.g. Fly.io) this path is local to the server
 * container.
 */
export async function spawnTailoredCvPdf(
  tailoredPayload: Site,
  language: Language,
  companyName: string | undefined,
  jobTitle: string | undefined,
  customFilename?: string,
): Promise<string> {
  const outputDir = path.join(process.cwd(), "generated", "cvs");
  const filename = sanitizeTailoredCvFilename(customFilename) ??
    buildTailoredCvFilename(companyName, jobTitle, language);
  return renderTailoredCvPdfToPath(tailoredPayload, language, outputDir, filename);
}

function sanitizeTailoredCvFilename(name: string | undefined): string | null {
  if (!name) return null;
  const safe = name
    .replace(/[/\\]/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 120);
  if (!safe) return null;
  return safe.endsWith(".pdf") ? safe : `${safe}.pdf`;
}
