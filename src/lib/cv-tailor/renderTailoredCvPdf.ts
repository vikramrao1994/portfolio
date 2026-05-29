import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Language } from "@/lib/cover-letter/schemas";
import type { Site } from "@/lib/siteSchema";

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

export function buildTailoredCvFilename(
  companyName: string | undefined,
  jobTitle: string | undefined,
  language: Language,
): string {
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

  const parts: string[] = ["tailored-cv"];
  if (companyName) parts.push(slugify(companyName));
  if (jobTitle) parts.push(slugify(jobTitle));
  parts.push(language);
  return `${parts.join("-")}.pdf`;
}

/**
 * Render a tailored CV to a persistent output directory and return the file path.
 * Used by the MCP server (local stdio) where callers can access the filesystem.
 */
export async function renderTailoredCvPdfToPath(
  tailoredPayload: Site,
  language: Language,
  outputDir: string,
  filename: string,
): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-tailor-"));
  const payloadPath = path.join(tmpDir, "payload.json");

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const outPdfPath = path.join(outputDir, filename);

    await fs.writeFile(payloadPath, JSON.stringify(tailoredPayload, null, 2), "utf8");

    const scriptPath = path.join(process.cwd(), "scripts", "cv", "main.py");
    await spawnPython(
      [scriptPath, "--input", payloadPath, "--lang", language, "--output", outPdfPath],
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
 * Render a tailored CV to an in-memory buffer and return bytes + filename.
 * Used by the HTTP admin route where the PDF is streamed to the browser.
 */
export async function renderTailoredCvPdfToBuffer(
  tailoredPayload: Site,
  language: Language,
  filename: string,
): Promise<{ bytes: ArrayBuffer; filename: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-tailor-"));
  const payloadPath = path.join(tmpDir, "payload.json");
  const outPdfPath = path.join(tmpDir, filename);

  try {
    await fs.writeFile(payloadPath, JSON.stringify(tailoredPayload, null, 2), "utf8");

    const scriptPath = path.join(process.cwd(), "scripts", "cv", "main.py");
    await spawnPython(
      [scriptPath, "--input", payloadPath, "--lang", language, "--output", outPdfPath],
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
