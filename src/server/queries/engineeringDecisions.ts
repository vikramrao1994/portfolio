import {
  type EngineeringDecision,
  type StoredDecision,
  StoredDecisionSchema,
} from "@/lib/engineering-behavior/decisions/schema";
import { getDb, getWriteDb } from "@/server/db";

type DecisionRow = {
  id: number;
  title: string;
  decision_json: string;
  created_at: string;
  updated_at: string;
};

function rowToDecision(row: DecisionRow): StoredDecision {
  const data = JSON.parse(row.decision_json);
  return StoredDecisionSchema.parse({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...data,
  });
}

export function listDecisions(): StoredDecision[] {
  const rows = getDb()
    .query(
      "SELECT id, title, decision_json, created_at, updated_at FROM engineering_decision ORDER BY created_at DESC",
    )
    .all() as DecisionRow[];
  return rows.map(rowToDecision);
}

export function createDecision(decision: EngineeringDecision): { id: number; createdAt: string } {
  const { title, ...rest } = decision;
  const now = new Date().toISOString();
  const result = getWriteDb()
    .prepare(
      "INSERT INTO engineering_decision (title, decision_json, created_at, updated_at) VALUES (?, ?, ?, ?)",
    )
    .run(title, JSON.stringify(rest), now, now);
  return { id: Number(result.lastInsertRowid), createdAt: now };
}

export function updateDecision(
  id: number,
  decision: EngineeringDecision,
): { updatedAt: string } | null {
  const { title, ...rest } = decision;
  const now = new Date().toISOString();
  const result = getWriteDb()
    .prepare(
      "UPDATE engineering_decision SET title = ?, decision_json = ?, updated_at = ? WHERE id = ?",
    )
    .run(title, JSON.stringify(rest), now, id);
  return result.changes === 0 ? null : { updatedAt: now };
}

export function deleteDecision(id: number): void {
  getWriteDb().prepare("DELETE FROM engineering_decision WHERE id = ?").run(id);
}
