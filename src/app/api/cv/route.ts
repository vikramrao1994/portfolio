import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import type { Language } from "@/lib/siteSchema";
import { getSiteContent } from "@/server/siteContent";

const CACHE_SECONDS = 60 * 10; // 10 minutes

function assertLang(lang: string | null): Language {
  if (lang === "de" || lang === "en") return lang;
  return "en";
}

function runPython(args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("python3", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Python exited with code ${code}\n${stderr}`));
    });
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = assertLang(url.searchParams.get("lang"));

  const SITE = await getSiteContent(lang);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-"));
  const payloadPath = path.join(tmpDir, `payload-${lang}.json`);
  const outPdfPath = path.join(tmpDir, `Vikram_Rao_CV_${lang.toUpperCase()}.pdf`);

  try {
    await fs.writeFile(payloadPath, JSON.stringify(SITE, null, 2), "utf8");
    const scriptPath = path.join(process.cwd(), "scripts", "cv", "main.py");
    await runPython(
      [scriptPath, "--input", payloadPath, "--lang", lang, "--output", outPdfPath],
      process.cwd(),
    );
    const pdf = await fs.readFile(outPdfPath);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Vikram_Rao_CV_${lang.toUpperCase()}.pdf"`,
        // Server-side caching
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "CV generation failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}
