import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildApplicationDocumentFilename } from "@/lib/application-documents/shared/buildApplicationDocumentFilename";
import { buildPdfPayload } from "@/lib/cover-letter/buildPdfPayload";
import type { CoverLetterContent } from "@/lib/cover-letter/coverLetterContentSchema";
import type { Site } from "@/lib/siteSchema";

function buildFilename(coverLetter: CoverLetterContent, siteContent: Site): string {
  return buildApplicationDocumentFilename({
    candidateName: siteContent.heading?.name ?? "",
    companyName: coverLetter.recipient?.companyName,
    language: coverLetter.language as "en" | "de",
    documentType: "cover-letter",
  });
}

function spawnPython(args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stderr = "";
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Python exited with code ${code}\n${stderr}`));
    });
  });
}

/**
 * Render a cover letter PDF to a persistent output directory and return the
 * file path. Used by the local stdio MCP server where the caller can access
 * the filesystem directly.
 *
 * On a remote deployment (e.g. Fly.io) this path is local to the container.
 * The caller is responsible for passing the correct outputDir for the runtime.
 */
export async function renderCoverLetterPdfToPath(
  coverLetter: CoverLetterContent,
  siteContent: Site,
  outputDir: string,
): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cl-pdf-"));
  const payloadPath = path.join(tmpDir, "payload.json");

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const filename = buildFilename(coverLetter, siteContent);
    const outPdfPath = path.join(outputDir, filename);

    const pdfPayload = buildPdfPayload({ coverLetter, siteContent });
    await fs.writeFile(payloadPath, JSON.stringify(pdfPayload, null, 2), "utf8");

    const scriptPath = path.join(process.cwd(), "scripts", "cover-letter", "main.py");
    await spawnPython(
      [scriptPath, "--input", payloadPath, "--lang", coverLetter.language, "--output", outPdfPath],
      process.cwd(),
    );

    return outPdfPath;
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

/**
 * Render a cover letter PDF to an in-memory buffer. Used by the HTTP admin
 * route where the PDF is streamed directly to the browser and never persisted.
 */
export async function renderCoverLetterPdfToBuffer(
  coverLetter: CoverLetterContent,
  siteContent: Site,
): Promise<{ bytes: ArrayBuffer; filename: string }> {
  const filename = buildFilename(coverLetter, siteContent);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cl-pdf-"));
  const payloadPath = path.join(tmpDir, "payload.json");
  const outPdfPath = path.join(tmpDir, filename);

  try {
    const pdfPayload = buildPdfPayload({ coverLetter, siteContent });
    await fs.writeFile(payloadPath, JSON.stringify(pdfPayload, null, 2), "utf8");

    const scriptPath = path.join(process.cwd(), "scripts", "cover-letter", "main.py");
    await spawnPython(
      [scriptPath, "--input", payloadPath, "--lang", coverLetter.language, "--output", outPdfPath],
      process.cwd(),
    );

    const raw = await fs.readFile(outPdfPath);
    return { bytes: raw.buffer as ArrayBuffer, filename };
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
