import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { buildPdfPayload } from "@/lib/cover-letter/buildPdfPayload";
import { CoverLetterContentSchema } from "@/lib/cover-letter/coverLetterContentSchema";
import { getSiteContent } from "@/server/siteContent";

export const dynamic = "force-dynamic";

function runPython(args: string[], cwd: string): Promise<void> {
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

function buildFilename(companyName: string | undefined, lang: string): string {
  const slug = companyName
    ? companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40)
    : "cover-letter";
  return `cover-letter-${slug}-${lang}.pdf`;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const jwtPayload = await verifyJWT(token);
  if (!jwtPayload?.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = CoverLetterContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cover letter JSON", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const coverLetter = parsed.data;
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cover-letter-"));
  const payloadPath = path.join(tmpDir, "payload.json");
  const outPdfPath = path.join(tmpDir, "cover-letter.pdf");

  try {
    const siteContent = await getSiteContent(coverLetter.language);
    const pdfPayload = buildPdfPayload({ coverLetter, siteContent });

    await fs.writeFile(payloadPath, JSON.stringify(pdfPayload, null, 2), "utf8");

    const scriptPath = path.join(process.cwd(), "scripts", "cover-letter", "main.py");
    await runPython(
      [scriptPath, "--input", payloadPath, "--lang", coverLetter.language, "--output", outPdfPath],
      process.cwd(),
    );

    const pdf = await fs.readFile(outPdfPath);
    const filename = buildFilename(coverLetter.recipient.companyName, coverLetter.language);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Python exited") || msg.includes("ENOENT")) {
      return NextResponse.json(
        { error: "PDF generation failed", detail: msg.slice(0, 500) },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
