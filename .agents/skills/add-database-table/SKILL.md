---
name: add-database-table
description: Use when adding a new SQLite table for a new content type or entity that needs persistence.
---

# Add Database Table

## Steps
1. Add `CREATE TABLE` statement to `db/schema.sql`
   - Include `_en`/`_de` column pairs for any user-facing content
   - Add `sort_order INTEGER` if ordering matters
2. Add Zod schema in `src/lib/schemas.ts` (see skill: add-zod-schema)
3. Add query function in `src/server/queries/<table>.ts` (see skill: add-db-query)
4. Add to `getSiteContent()` return value in `src/server/siteContent.ts`
5. Run `bun db:init` to recreate tables (dev only — destructive)

## Constraints
- Always use bilingual `<field>_en`/`<field>_de` columns for user-facing text
- Always validate query results with Zod before returning
- `bun db:init` drops and recreates tables — never run on prod volume
- Production schema changes require a migration approach (SSH + manual ALTER)

## Files
- `db/schema.sql` — table definition
- `src/lib/schemas.ts` — Zod schema
- `src/server/queries/<table>.ts` — query functions
- `src/server/siteContent.ts` — data aggregation

## Anti-Patterns
- Skipping Zod validation on raw DB results
- Storing translatable content in a single non-bilingual column
- Running `bun db:init` on production
