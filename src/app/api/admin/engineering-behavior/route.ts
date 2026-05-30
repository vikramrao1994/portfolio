import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { getDb } from "@/server/db";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.authenticated === true;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const row = db
    .query(
      "SELECT profile_json, engineering_profile_json, engineering_style_profile_json, created_at FROM engineering_behavior_profile WHERE id = 1",
    )
    .get() as {
    profile_json: string;
    engineering_profile_json: string | null;
    engineering_style_profile_json: string | null;
    created_at: string;
  } | null;

  if (!row) {
    return NextResponse.json({
      profile: null,
      engineeringProfile: null,
      styleProfile: null,
      createdAt: null,
    });
  }

  try {
    const profile = JSON.parse(row.profile_json);
    const engineeringProfile = row.engineering_profile_json
      ? JSON.parse(row.engineering_profile_json)
      : null;
    const styleProfile = row.engineering_style_profile_json
      ? JSON.parse(row.engineering_style_profile_json)
      : null;
    return NextResponse.json({
      profile,
      engineeringProfile,
      styleProfile,
      createdAt: row.created_at,
    });
  } catch {
    return NextResponse.json({ error: "Stored profile is corrupted" }, { status: 500 });
  }
}
