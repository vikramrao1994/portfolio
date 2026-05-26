import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPromptMarkdown } from "@/lib/cover-letter/buildPromptMarkdown";
import { createPromptFilename } from "@/lib/cover-letter/createPromptFilename";
import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import { verifyJWT } from "@/lib/auth";
import { getSiteContent } from "@/server/siteContent";

export const dynamic = "force-dynamic";

const CoverLetterPromptRequestSchema = z.object({
  jobDescription: z.string().min(100).max(20_000),
  language: z.enum(["en", "de"]),
  companyName: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  recruiterName: z.string().trim().max(120).optional(),
  tone: z
    .enum(["professional", "warm", "direct", "modern"])
    .default("professional"),
  includeFullCandidateData: z.boolean().default(true),
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
    const site = await getSiteContent(input.language);
    const keywords = extractJobKeywords(input.jobDescription);
    const evidence = scoreCandidateEvidence(site, keywords);
    const markdown = buildPromptMarkdown(input, site, keywords, evidence);
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
