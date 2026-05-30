import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { buildDecisionCorpus } from "@/lib/engineering-behavior/decisions/buildDecisionCorpus";
import { EngineeringProfileSchema } from "@/lib/engineering-behavior/profile/schema";
import { buildEngineeringStyleProfile } from "@/lib/engineering-behavior/style/buildEngineeringStyleProfile";
import { getDb, getWriteDb } from "@/server/db";
import { listDecisions } from "@/server/queries/engineeringDecisions";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.authenticated === true;
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decisions = listDecisions();
  if (decisions.length === 0) {
    return NextResponse.json(
      { error: "No decisions in corpus. Add decisions first." },
      { status: 422 },
    );
  }

  const profileRow = getDb()
    .query("SELECT engineering_profile_json FROM engineering_behavior_profile WHERE id = 1")
    .get() as { engineering_profile_json: string | null } | null;

  let engineeringProfile = null;
  if (profileRow?.engineering_profile_json) {
    const parsed = EngineeringProfileSchema.safeParse(
      JSON.parse(profileRow.engineering_profile_json),
    );
    if (parsed.success) engineeringProfile = parsed.data;
  }

  const corpus = buildDecisionCorpus(decisions);
  const styleProfile = buildEngineeringStyleProfile(corpus, engineeringProfile, decisions);

  const result = getWriteDb()
    .prepare(
      "UPDATE engineering_behavior_profile SET engineering_style_profile_json = ? WHERE id = 1",
    )
    .run(JSON.stringify(styleProfile));

  if (result.changes === 0) {
    return NextResponse.json(
      { error: "No behavior profile found. Extract behavior first." },
      { status: 422 },
    );
  }

  return NextResponse.json({ styleProfile });
}
