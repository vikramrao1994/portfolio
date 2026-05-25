---
name: add-portfolio-section
description: Use when adding a new visible section to the main portfolio page, such as a new content category, timeline, or feature block.
---

# Add Portfolio Section

## Steps
1. **DB** (if new content): Add table + schema + query (see skills: add-database-table, add-db-query)
2. **Aggregation**: Add to `getSiteContent()` in `src/server/siteContent.ts`
3. **Context**: Add new field to `SiteContentContext` in `src/context/SiteContentContext/index.tsx`
4. **Component**: Create section component (see skill: add-component)
5. **Page**: Import and render in `src/app/[locale]/page.tsx`
6. **Translations**: Add any static labels to `messages/en.json` and `messages/de.json`
7. **Admin** (if editable): Add tRPC router + admin CRUD page (see skills: add-trpc-router, add-admin-crud)

## Checklist
- [ ] DB table created (if new entity)
- [ ] Zod schema defined
- [ ] Query function returns bilingual data
- [ ] `getSiteContent()` includes new data
- [ ] `SiteContentContext` type updated
- [ ] Component created with `spacing()` layout
- [ ] Section renders in `page.tsx`
- [ ] EN + DE translations added for labels
- [ ] Admin CRUD added if content is editable

## Constraints
- Pass `lang` parameter through the entire data chain
- Always validate DB results before adding to context
- New sections must render correctly in both `/` (EN) and `/de` (DE)

## Files
- `db/schema.sql`
- `src/lib/schemas.ts`
- `src/server/queries/<table>.ts`
- `src/server/siteContent.ts`
- `src/context/SiteContentContext/index.tsx`
- `src/components/<NewSection>/`
- `src/app/[locale]/page.tsx`
- `messages/en.json`, `messages/de.json`

## Anti-Patterns
- Fetching section data client-side on initial render
- Hardcoded locale in data fetching
- Missing DE translation for any new label
- Section not integrated into `SiteContentContext`
