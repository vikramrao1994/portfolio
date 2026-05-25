---
name: database-migration
description: Use when modifying the SQLite schema in production (adding columns, renaming, or altering existing tables without data loss).
---

# Database Migration

## Dev vs Prod approach

**Dev only:** `bun db:init` drops and recreates all tables. Safe to use freely.

**Production:** `bun db:init` will destroy all data. Use `ALTER TABLE` via SSH instead.

## Production migration steps
1. SSH into the Fly.io machine: `fly ssh console`
2. Run the migration SQL directly:
   ```bash
   bun --eval "
     import { Database } from 'bun:sqlite';
     const db = new Database('/data/portfolio.db');
     db.run('ALTER TABLE <table> ADD COLUMN <col> TEXT DEFAULT \"\"');
     console.log('done');
   "
   ```
3. Verify: query the table to confirm the column exists
4. Update `db/schema.sql` to reflect the new state (for future `bun db:init` runs)
5. Update `src/lib/schemas.ts` Zod schema to include the new field
6. Update query functions in `src/server/queries/<table>.ts`
7. Deploy updated code: `fly deploy`

## Safe operations (no data loss)
- `ADD COLUMN` with a default value
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX`

## Risky operations (data loss risk)
- `DROP TABLE` — destructive
- `DROP COLUMN` — not supported in older SQLite; use table rebuild pattern
- Renaming columns — use table rebuild pattern

## Table rebuild pattern (for column rename/drop)
```sql
BEGIN;
CREATE TABLE <table>_new AS SELECT ... FROM <table>;
DROP TABLE <table>;
ALTER TABLE <table>_new RENAME TO <table>;
COMMIT;
```

## Constraints
- Never run `bun db:init` on production
- Always update `db/schema.sql` after a production migration
- Always update Zod schemas to match new column state
- Test migration on a local DB copy before applying to prod

## Files
- `db/schema.sql` — source of truth for schema
- `src/lib/schemas.ts` — Zod schemas (update after migration)
- `src/server/queries/<table>.ts` — queries (update after migration)

## Anti-Patterns
- Running `bun db:init` in production
- Applying schema changes without updating `schema.sql`
- Forgetting to update Zod schemas after adding columns
