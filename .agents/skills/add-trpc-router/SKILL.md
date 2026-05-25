---
name: add-trpc-router
description: Use when adding a new tRPC router, typed API domain, admin mutation endpoint, or CRUD operations for a new entity.
---

# Add tRPC Router

## Steps
1. Create `src/trpc/routers/<domain>.ts`
2. Define Zod input schemas inline in the file
3. Use `protectedProcedure` for all write operations
4. Use `publicProcedure` only for safe, unauthenticated reads
5. Export the router and add it to `src/trpc/router.ts` via `mergeRouters`
6. Use `useTRPC()` + `useQuery`/`useMutation` in client components
7. Infer types: `inferProcedureInput<AppRouter["domain"]["proc"]>`

## Constraints
- Never bypass Zod validation
- Never use `publicProcedure` for admin writes
- Never define manual types when `z.infer` or `inferProcedureInput` works
- Keep routers domain-scoped (one file per entity)
- Never call `getWriteDb()` outside a `protectedProcedure`

## Files
- `src/trpc/init.ts` — context, procedure factories
- `src/trpc/router.ts` — root router (add your router here)
- `src/trpc/routers/<domain>.ts` — new router file
- `src/trpc/client.tsx` — `useTRPC()` hook

## Anti-Patterns
- Raw `fetch()` calls to tRPC endpoints
- DB writes outside `protectedProcedure`
- Duplicated manual input/output types
- Mixing multiple unrelated domains in one router file
