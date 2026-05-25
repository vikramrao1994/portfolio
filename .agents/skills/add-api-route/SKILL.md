---
name: add-api-route
description: Use when adding a new Next.js API route handler (non-tRPC), such as file downloads, webhooks, or streaming responses.
---

# Add API Route

## Steps
1. Create `src/app/api/<route-name>/route.ts`
2. Export named handler functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use `NextRequest` / `NextResponse` from `next/server`
4. Validate inputs with Zod before processing
5. For admin-only routes: verify JWT from cookie manually using `verifyJWT` from `src/lib/auth.ts`
6. Return `NextResponse.json(data)` or `new Response(body, { headers })` for binary

## Pattern
```ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const inputSchema = z.object({ lang: z.enum(['en', 'de']) })

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const parsed = inputSchema.safeParse({ lang: searchParams.get('lang') })
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  // ...
}
```

## Existing API routes (do not duplicate)
- `GET /api/cv?lang=en|de` — PDF generation (10min cache)
- `POST /api/auth/login` — admin login
- `POST /api/auth/logout` — admin logout
- `/api/trpc/[trpc]` — tRPC handler (use tRPC for typed mutations instead)

## Constraints
- Prefer tRPC for typed CRUD mutations — use raw API routes only for non-RPC operations
- Always validate request inputs with Zod
- For protected routes: use `verifyJWT` from `src/lib/auth.ts`
- Never expose stack traces or raw errors in responses

## Files
- `src/app/api/<route-name>/route.ts`
- `src/lib/auth.ts` — JWT verification for protected routes

## Anti-Patterns
- Unvalidated query params or request bodies
- Duplicating tRPC functionality with raw fetch routes
- Returning raw DB rows without Zod validation
