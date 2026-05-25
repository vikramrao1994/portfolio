---
name: add-db-query
description: Use when adding a new database query function to retrieve or aggregate data from SQLite.
---

# Add DB Query

## Steps
1. Create or extend `src/server/queries/<table>.ts`
2. Import `getDb` from `src/server/db.ts`
3. Write query using `db.query(...).all()` or `.get()`
4. Parse result with `.safeParse()` using the relevant Zod schema
5. Return typed, validated data (return `null`/`[]` on parse failure)
6. Call from `getSiteContent()` in `src/server/siteContent.ts` if public-facing

## Pattern
```ts
import { getDb } from '@/server/db'
import { ExperienceSchema } from '@/lib/schemas'

export function getExperience(lang: 'en' | 'de') {
  const db = getDb()
  const rows = db.query('SELECT * FROM experience ORDER BY sort_order').all()
  return rows.map(row => ExperienceSchema.safeParse(row)).filter(r => r.success).map(r => r.data!)
}
```

## Constraints
- Always use `getDb()` for public reads — never `getWriteDb()` in query files
- Always validate with Zod — never return raw DB rows
- Accept `lang: 'en' | 'de'` parameter and select appropriate columns
- Never expose raw SQL errors to callers

## Files
- `src/server/db.ts` — `getDb()` / `getWriteDb()`
- `src/server/queries/<table>.ts` — query functions
- `src/lib/schemas.ts` — Zod schemas
- `src/server/siteContent.ts` — aggregation entry point

## Anti-Patterns
- Returning unvalidated raw DB rows
- Using `getWriteDb()` for reads
- SQL queries inline in components or pages
