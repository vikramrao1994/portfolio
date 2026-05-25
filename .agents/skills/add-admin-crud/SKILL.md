---
name: add-admin-crud
description: Use when building an admin dashboard page with full create/read/update/delete capability for a content entity.
---

# Add Admin CRUD Page

## Steps
1. Add tRPC router for the entity (see skill: add-trpc-router)
   - `getRaw` query (publicProcedure or protectedProcedure)
   - `create` mutation (protectedProcedure)
   - `update` mutation (protectedProcedure)
   - `delete` mutation (protectedProcedure)
2. Add DB table if it doesn't exist (see skill: add-database-table)
3. Create page at `src/app/[locale]/admin/<entity>/page.tsx`
   - Must be a Client Component (`"use client"`) for interactive forms
   - Middleware auto-protects all `/admin/` routes — no manual auth needed
4. Use `useTRPC()` + TanStack Query:
   ```tsx
   const trpc = useTRPC()
   const { data } = useQuery(trpc.<domain>.getRaw.queryOptions())
   const update = useMutation(trpc.<domain>.update.mutationOptions())
   ```
5. Add translations for admin UI labels (see skill: add-localized-ui)

## Constraints
- All mutations must use `protectedProcedure` — never `publicProcedure` for writes
- Never call `getWriteDb()` directly from client components
- Always invalidate TanStack Query cache after successful mutations
- Include both EN and DE fields in forms for bilingual content

## Files
- `src/trpc/routers/<entity>.ts` — tRPC router
- `src/trpc/router.ts` — add router here
- `src/app/[locale]/admin/<entity>/page.tsx` — admin page
- `src/trpc/client.tsx` — `useTRPC()` hook
- `src/proxy.ts` — middleware (auto-protects /admin/)

## Anti-Patterns
- Admin mutations using `publicProcedure`
- Direct DB access from client-side admin pages
- Forgetting to handle the DE language fields in forms
- Not invalidating query cache after mutations
