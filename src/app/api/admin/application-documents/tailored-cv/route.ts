import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { buildTailoredCvPayload } from "@/lib/cv-tailor/buildTailoredCvPayload";
import { generateCvSummaryWithClaude } from "@/lib/cv-tailor/generateCvSummaryWithClaude";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  jobDescription: z.string().min(100).max(20_000),
  language: z.enum(["en", "de"]),
  companyName: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
});

function slugify(s: string | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

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

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authPayload = await verifyJWT(token);
  if (!authPayload?.authenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Claude API key is not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const { jobDescription, language, companyName, jobTitle } = parsed.data;

  let generated: Awaited<ReturnType<typeof generateCvSummaryWithClaude>>;
  try {
    generated = await generateCvSummaryWithClaude({
      jobDescription,
      language,
      companyName,
      jobTitle,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith("Claude API key is not configured")) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    if (
      msg.startsWith("Claude generation failed") ||
      msg === "Claude returned invalid JSON" ||
      msg.startsWith("Claude response failed validation")
    ) {
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    return NextResponse.json({ error: "CV summary generation failed", detail: msg }, { status: 500 });
  }

  const { suggestion, siteContent } = generated;
  const tailoredPayload = buildTailoredCvPayload(siteContent, suggestion, language);

  const companySlug = slugify(companyName);
  const jobSlug = slugify(jobTitle);
  const filenameParts = ["tailored-cv", companySlug, jobSlug, language].filter(Boolean);
  const filename = `${filenameParts.join("-")}.pdf`;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-tailor-"));
  const payloadPath = path.join(tmpDir, "payload.json");
  const outPdfPath = path.join(tmpDir, filename);

  try {
    await fs.writeFile(payloadPath, JSON.stringify(tailoredPayload, null, 2), "utf8");
    const scriptPath = path.join(process.cwd(), "scripts", "cv", "main.py");
    await runPython(
      [scriptPath, "--input", payloadPath, "--lang", language, "--output", outPdfPath],
      process.cwd(),
    );
    const pdf = await fs.readFile(outPdfPath);
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
    return NextResponse.json({ error: "CV PDF generation failed", detail: msg }, { status: 500 });
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
