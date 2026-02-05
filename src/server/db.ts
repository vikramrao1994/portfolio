import { Database } from "bun:sqlite";
import path from "node:path";

// Keep a single connection per process (fine for Next server runtime)
let _db: Database | null = null;
let _writeDb: Database | null = null;

/**
 * Get a read-only database connection for public queries
 */
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

/**
 * Get a write-capable database connection
 * ONLY use this for authenticated admin operations
 */
export const getWriteDb = () => {
  if (_writeDb) return _writeDb;

  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "portfolio.db");
  // Omit readonly option to open in read-write mode (Bun SQLite default)
  const db = new Database(dbPath);

  db.exec("PRAGMA foreign_keys = ON;");
  _writeDb = db;
  return db;
};
