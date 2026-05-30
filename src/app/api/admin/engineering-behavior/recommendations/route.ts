import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth";
import { getDb, getWriteDb } from "@/server/db";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.authenticated === true;
}

const CreateRecommendationSchema = z.object({
  authorName: z.string().trim().max(120).optional(),
  authorRole: z.string().trim().max(120).optional(),
  company: z.string().trim().max(120).optional(),
  relationship: z.string().trim().max(60).optional(),
  recommendationText: z.string().trim().min(20).max(10_000),
});

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = db
    .query(
      `SELECT id, author_name, author_role, company, relationship, recommendation_text, created_at
       FROM linkedin_recommendation
       ORDER BY created_at DESC`,
    )
    .all() as {
    id: number;
    author_name: string | null;
    author_role: string | null;
    company: string | null;
    relationship: string | null;
    recommendation_text: string;
    created_at: string;
  }[];

  const recommendations = rows.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorRole: r.author_role,
    company: r.company,
    relationship: r.relationship,
    recommendationText: r.recommendation_text,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ recommendations });
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

  const parsed = CreateRecommendationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const { authorName, authorRole, company, relationship, recommendationText } = parsed.data;
  const createdAt = new Date().toISOString();

  const db = getWriteDb();
  const stmt = db.prepare(
    `INSERT INTO linkedin_recommendation (author_name, author_role, company, relationship, recommendation_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const result = stmt.run(
    authorName ?? null,
    authorRole ?? null,
    company ?? null,
    relationship ?? null,
    recommendationText,
    createdAt,
  );

  return NextResponse.json({ id: Number(result.lastInsertRowid), createdAt }, { status: 201 });
}
