import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ApplicationDocumentMcpResponse, OutputMode } from "@/lib/application-documents/shared/applicationDocumentMcpOutput";
import { buildApplicationDocumentFilename } from "@/lib/application-documents/shared/buildApplicationDocumentFilename";
import type { CoverLetterContent } from "@/lib/cover-letter/coverLetterContentSchema";
import { renderCoverLetterPdfToBuffer } from "@/lib/cover-letter/pdf/runCoverLetterPdfRenderer";
import type { Language } from "@/lib/cover-letter/schemas";
import { renderTailoredCvPdfToBuffer } from "@/lib/cv-tailor/renderTailoredCvPdf";
import type { Site } from "@/lib/siteSchema";

async function resolveLocalOutputPath(filename: string): Promise<string> {
  const downloadsDir = path.join(os.homedir(), "Downloads");
  try {
    await fs.mkdir(downloadsDir, { recursive: true });
    return path.join(downloadsDir, filename);
  } catch {
    const fallbackDir = path.join(process.cwd(), "generated", "application-documents");
    await fs.mkdir(fallbackDir, { recursive: true });
    return path.join(fallbackDir, filename);
  }
}

/**
 * Render a cover letter PDF.
 *
 * local-file:   writes to ~/Downloads, returns { mode: "local", filename, pdfPath }
 * remote-base64: encodes in memory, returns { mode: "remote", type, filename, content }
 *                no file is written to disk.
 */
export async function spawnPdfRenderer(
  coverLetter: CoverLetterContent,
  siteContent: Site,
  outputMode: OutputMode,
): Promise<ApplicationDocumentMcpResponse> {
  const { bytes, filename } = await renderCoverLetterPdfToBuffer(coverLetter, siteContent);
  const buffer = Buffer.from(bytes);

  if (outputMode === "local-file") {
    const pdfPath = await resolveLocalOutputPath(filename);
    await fs.writeFile(pdfPath, buffer);
    return { mode: "local", filename, pdfPath };
  }

  return { mode: "remote", type: "application/pdf", filename, content: buffer.toString("base64") };
}

/**
 * Render a tailored CV PDF.
 *
 * local-file:   writes to ~/Downloads, returns { mode: "local", filename, pdfPath }
 * remote-base64: encodes in memory, returns { mode: "remote", type, filename, content }
 *                no file is written to disk.
 */
export async function spawnTailoredCvPdf(
  tailoredPayload: Site,
  language: Language,
  companyName: string | undefined,
  outputMode: OutputMode,
): Promise<ApplicationDocumentMcpResponse> {
  const filename = buildApplicationDocumentFilename({
    candidateName: tailoredPayload.heading?.name ?? "",
    companyName,
    language,
    documentType: "cv",
  });

  const { bytes } = await renderTailoredCvPdfToBuffer(tailoredPayload, language, filename);
  const buffer = Buffer.from(bytes);

  if (outputMode === "local-file") {
    const pdfPath = await resolveLocalOutputPath(filename);
    await fs.writeFile(pdfPath, buffer);
    return { mode: "local", filename, pdfPath };
  }

  return { mode: "remote", type: "application/pdf", filename, content: buffer.toString("base64") };
}
