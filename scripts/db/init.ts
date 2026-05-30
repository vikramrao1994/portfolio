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

// Migrate existing databases — silent no-op if column already exists
try {
  db.exec(
    "ALTER TABLE engineering_behavior_profile ADD COLUMN engineering_profile_json TEXT",
  );
} catch {
  // Column already present
}

db.close();
console.log(`✅ SQLite initialized: ${DB_PATH}`);
