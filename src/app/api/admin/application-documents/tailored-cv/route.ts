import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildApplicationDocumentFilename } from "@/lib/application-documents/shared/buildApplicationDocumentFilename";
import { verifyJWT } from "@/lib/auth";
import { buildTailoredCvPayload } from "@/lib/cv-tailor/buildTailoredCvPayload";
import { generateCvSummaryWithClaude } from "@/lib/cv-tailor/generateCvSummaryWithClaude";
import { renderTailoredCvPdfToBuffer } from "@/lib/cv-tailor/renderTailoredCvPdf";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  jobDescription: z.string().min(100).max(20_000),
  language: z.enum(["en", "de"]),
  companyName: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
});

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authPayload = await verifyJWT(token);
  if (!authPayload?.authenticated)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json(
      { error: "CV summary generation failed", detail: msg },
      { status: 500 },
    );
  }

  const { suggestion, siteContent } = generated;
  const tailoredPayload = buildTailoredCvPayload(siteContent, suggestion, language);
  const filename = buildApplicationDocumentFilename({
    candidateName: siteContent.heading?.name ?? "",
    companyName,
    language,
    documentType: "cv",
  });

  try {
    const { bytes, filename: resolvedFilename } = await renderTailoredCvPdfToBuffer(
      tailoredPayload,
      language,
      filename,
    );
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resolvedFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "CV PDF generation failed", detail: msg }, { status: 500 });
  }
}
