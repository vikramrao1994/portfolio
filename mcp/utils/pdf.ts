import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildPdfPayload } from "@/lib/cover-letter/buildPdfPayload";
import type { CoverLetterContent } from "@/lib/cover-letter/coverLetterContentSchema";
import type { Site } from "@/lib/siteSchema";

export function runPython(args: string[], cwd: string): Promise<void> {
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

export function buildPdfFilename(companyName: string | undefined, lang: string): string {
  const slug = companyName
    ? companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40)
    : "cover-letter";
  return `cover-letter-${slug}-${lang}.pdf`;
}

export async function spawnPdfRenderer(
  coverLetter: CoverLetterContent,
  siteContent: Site,
): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-cover-letter-"));
  const payloadPath = path.join(tmpDir, "payload.json");
  const outputDir = path.join(process.cwd(), "generated", "cover-letters");

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const filename = buildPdfFilename(coverLetter.recipient?.companyName, coverLetter.language);
    const outPdfPath = path.join(outputDir, filename);

    const pdfPayload = buildPdfPayload({ coverLetter, siteContent });
    await fs.writeFile(payloadPath, JSON.stringify(pdfPayload, null, 2), "utf8");

    const scriptPath = path.join(process.cwd(), "scripts", "cover-letter", "main.py");
    await runPython(
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
