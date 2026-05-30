import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { EngineeringDecisionSchema } from "@/lib/engineering-behavior/decisions/schema";
import { getDb, getWriteDb } from "@/server/db";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.authenticated === true;
}

type DecisionRow = {
  id: number;
  title: string;
  decision_json: string;
  created_at: string;
  updated_at: string;
};

function rowToDecision(row: DecisionRow) {
  const data = JSON.parse(row.decision_json);
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...data,
  };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .query(
      "SELECT id, title, decision_json, created_at, updated_at FROM engineering_decision ORDER BY created_at DESC",
    )
    .all() as DecisionRow[];

  return NextResponse.json({ decisions: rows.map(rowToDecision) });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = EngineeringDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const { title, ...rest } = parsed.data;
  const now = new Date().toISOString();

  const db = getWriteDb();
  const result = db
    .prepare(
      "INSERT INTO engineering_decision (title, decision_json, created_at, updated_at) VALUES (?, ?, ?, ?)",
    )
    .run(title, JSON.stringify(rest), now, now);

  return NextResponse.json({ id: Number(result.lastInsertRowid), createdAt: now }, { status: 201 });
}
