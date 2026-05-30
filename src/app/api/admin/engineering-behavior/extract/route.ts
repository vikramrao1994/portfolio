import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { extractBehaviorProfile } from "@/lib/engineering-behavior/extractBehaviorProfile";

export const dynamic = "force-dynamic";

export async function POST() {
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

  try {
    const result = await extractBehaviorProfile();
    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.startsWith("Claude API key is not configured")) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    if (msg.startsWith("Claude generation failed")) {
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    if (msg.startsWith("Claude response failed validation")) {
      return NextResponse.json({ error: msg }, { status: 502 });
    }
    if (msg.startsWith("No documents")) {
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    return NextResponse.json({ error: "Extraction failed", detail: msg }, { status: 500 });
  }
}
