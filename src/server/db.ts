import { Database } from "bun:sqlite";
import path from "node:path";

// Keep a single connection per process (fine for Next server runtime)
let _db: Database | null = null;

export const getDb = () => {
  if (_db) return _db;

  // Support volume-mounted database for production (Fly.io)
  // In production, DB_PATH env var should point to /data/portfolio.db
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "portfolio.db");
  const db = new Database(dbPath, { readonly: true });

  db.exec("PRAGMA foreign_keys = ON;");
  _db = db;
  return db;
};
