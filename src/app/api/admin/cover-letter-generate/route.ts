import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { buildClaudeJsonPrompt } from "@/lib/cover-letter/buildClaudeJsonPrompt";
import { extractJobKeywords } from "@/lib/cover-letter/extractJobKeywords";
import { generateCoverLetterWithClaude } from "@/lib/cover-letter/generateCoverLetterWithClaude";
import { scoreCandidateEvidence } from "@/lib/cover-letter/scoreCandidateEvidence";
import { getSiteContent } from "@/server/siteContent";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  jobDescription: z.string().min(100).max(20_000),
  language: z.enum(["en", "de"]),
  companyName: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  recruiterName: z.string().trim().max(120).optional(),
  tone: z.enum(["professional", "warm", "direct", "modern"]).default("professional"),
  includeFullCandidateData: z.boolean().default(true),
});

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyJWT(token);
  if (!payload?.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const input = parsed.data;

  try {
    const site = await getSiteContent(input.language);
    const keywords = extractJobKeywords(input.jobDescription);
    const evidence = scoreCandidateEvidence(site, keywords);
    const prompt = buildClaudeJsonPrompt(input, site, keywords, evidence);

    const { coverLetter, model, usage } = await generateCoverLetterWithClaude(prompt);

    return NextResponse.json(
      { coverLetter, promptMarkdown: prompt, model, usage },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.startsWith("Claude API key is not configured")) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    if (msg.startsWith("Claude generation failed")) {
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    if (msg === "Claude returned invalid JSON") {
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    if (msg.startsWith("Claude response failed validation")) {
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    return NextResponse.json({ error: "Generation failed", detail: msg }, { status: 500 });
  }
}
