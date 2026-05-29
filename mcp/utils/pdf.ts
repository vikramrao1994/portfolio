import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ApplicationDocumentMcpResponse, OutputMode } from "@/lib/application-documents/shared/applicationDocumentMcpOutput";
import { buildApplicationDocumentFilename } from "@/lib/application-documents/shared/buildApplicationDocumentFilename";
import { createTemporaryMcpDownload } from "@/lib/application-documents/shared/temporaryMcpDownloadStore";
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

function resolveAppBaseUrl(appBaseUrl: string | undefined): string {
  const url = appBaseUrl ?? process.env.PUBLIC_APP_URL;
  if (!url) {
    throw new Error(
      "Remote MCP download URL cannot be constructed: PUBLIC_APP_URL is not set and no appBaseUrl was provided.",
    );
  }
  return url.replace(/\/$/, "");
}

/**
 * Render a cover letter PDF.
 *
 * local-file:      writes to ~/Downloads, returns { mode: "local", filename, pdfPath }
 * remote-download: stores in /tmp with TTL, returns { mode: "remote", filename, downloadUrl, expiresAt }
 */
export async function spawnPdfRenderer(
  coverLetter: CoverLetterContent,
  siteContent: Site,
  outputMode: OutputMode,
  appBaseUrl?: string,
): Promise<ApplicationDocumentMcpResponse> {
  const { bytes, filename } = await renderCoverLetterPdfToBuffer(coverLetter, siteContent);
  const buffer = Buffer.from(bytes);

  if (outputMode === "local-file") {
    const pdfPath = await resolveLocalOutputPath(filename);
    await fs.writeFile(pdfPath, buffer);
    return { mode: "local", filename, pdfPath };
  }

  const baseUrl = resolveAppBaseUrl(appBaseUrl);
  const { token, expiresAt } = await createTemporaryMcpDownload({
    filename,
    mimeType: "application/pdf",
    buffer,
  });
  return {
    mode: "remote",
    type: "application/pdf",
    filename,
    downloadUrl: `${baseUrl}/api/mcp/download/${token}`,
    expiresAt,
  };
}

/**
 * Render a tailored CV PDF.
 *
 * local-file:      writes to ~/Downloads, returns { mode: "local", filename, pdfPath }
 * remote-download: stores in /tmp with TTL, returns { mode: "remote", filename, downloadUrl, expiresAt }
 */
export async function spawnTailoredCvPdf(
  tailoredPayload: Site,
  language: Language,
  companyName: string | undefined,
  outputMode: OutputMode,
  appBaseUrl?: string,
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

  const baseUrl = resolveAppBaseUrl(appBaseUrl);
  const { token, expiresAt } = await createTemporaryMcpDownload({
    filename,
    mimeType: "application/pdf",
    buffer,
  });
  return {
    mode: "remote",
    type: "application/pdf",
    filename,
    downloadUrl: `${baseUrl}/api/mcp/download/${token}`,
    expiresAt,
  };
}
