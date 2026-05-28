import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { buildPromptMarkdown } from "@/lib/cover-letter/buildPromptMarkdown";
import { buildCoverLetterContext } from "@/lib/cover-letter/context/buildCoverLetterContext";
import { createPromptFilename } from "@/lib/cover-letter/createPromptFilename";
import { CoverLetterRequestSchema } from "@/lib/cover-letter/schemas";

export const dynamic = "force-dynamic";

const CoverLetterPromptRequestSchema = CoverLetterRequestSchema.extend({
  jobDescription: z.string().min(100).max(20_000),
  companyName: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  recruiterName: z.string().trim().max(120).optional(),
});

export async function POST(req: Request) {
  // Verify admin auth
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyJWT(token);
  if (!payload?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CoverLetterPromptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const context = await buildCoverLetterContext(input.jobDescription, input.language);
    const { siteContent, extractedKeywords, deterministicEvidence, evidencePack } = context;

    const markdown = buildPromptMarkdown(
      input,
      siteContent,
      extractedKeywords,
      deterministicEvidence,
      evidencePack,
    );
    const filename = createPromptFilename(input.companyName, input.jobTitle, input.language);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Prompt generation failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
