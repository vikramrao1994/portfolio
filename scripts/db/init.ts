import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "portfolio.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
const db = new Database(DB_PATH);

db.exec("PRAGMA foreign_keys = ON;");
db.exec(schema);

db.close();
console.log(`✅ SQLite initialized: ${DB_PATH}`);
