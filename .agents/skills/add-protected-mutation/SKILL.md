---
name: add-protected-mutation
description: Use when adding a tRPC mutation that requires admin authentication, such as updating, creating, or deleting database content.
---

# Add Protected Mutation

## Steps
1. Import `protectedProcedure` from `src/trpc/init.ts`
2. Define a Zod input schema for the mutation
3. Implement using `protectedProcedure.input(schema).mutation(async ({ input, ctx }) => { ... })`
4. Use `getWriteDb()` inside the mutation handler — never outside
5. Return a typed result (or `{ success: true }` for void operations)
6. Add the mutation to its domain router in `src/trpc/routers/<domain>.ts`

## Pattern
```ts
import { protectedProcedure } from '@/trpc/init'
import { getWriteDb } from '@/server/db'
import { z } from 'zod'

export const entityRouter = router({
  update: protectedProcedure
    .input(z.object({ id: z.number(), title_en: z.string(), title_de: z.string() }))
    .mutation(async ({ input }) => {
      const db = getWriteDb()
      db.run('UPDATE entity SET title_en = ?, title_de = ? WHERE id = ?',
        [input.title_en, input.title_de, input.id])
      return { success: true }
    }),
})
```

## How auth works
- `protectedProcedure` extracts the JWT from the request cookie
- `verifyJWT` in `src/trpc/init.ts` validates it before the handler runs
- No manual auth check needed in mutation handlers

## Constraints
- `getWriteDb()` only inside `protectedProcedure` handlers
- Always validate inputs with Zod — never trust raw client input
- Never expose DB errors directly to the client

## Files
- `src/trpc/init.ts` — `protectedProcedure` definition
- `src/trpc/routers/<domain>.ts` — mutation location
- `src/server/db.ts` — `getWriteDb()`
- `src/lib/auth.ts` — JWT verification

## Anti-Patterns
- `publicProcedure` for any write operation
- `getWriteDb()` called outside a mutation handler
- Unvalidated inputs passed directly to SQL queries
