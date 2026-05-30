import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "portfolio.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
const db = new Database(DB_PATH);

db.exec("PRAGMA foreign_keys = ON;");
db.exec(schema);

// Migrate existing databases — silent no-op if already applied
try {
  db.exec("ALTER TABLE engineering_behavior_profile ADD COLUMN engineering_profile_json TEXT");
} catch {
  // Column already present
}

try {
  db.exec(
    "ALTER TABLE engineering_behavior_profile ADD COLUMN engineering_style_profile_json TEXT",
  );
} catch {
  // Column already present
}

try {
  db.exec(`CREATE TABLE IF NOT EXISTS engineering_decision (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    decision_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);
} catch {
  // Table already present
}

db.close();
console.log(`✅ SQLite initialized: ${DB_PATH}`);
