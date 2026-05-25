---
name: add-zod-schema
description: Use when defining a new Zod schema for database rows, API inputs, or shared types between server and client.
---

# Add Zod Schema

## Steps
1. Add schema to `src/lib/schemas.ts`
2. Use `z.infer<typeof YourSchema>` for TypeScript types — never define manually
3. For DB row shapes: mirror the SQL column names exactly
4. For bilingual content: include both `field_en` and `field_de`
5. Export the schema and its inferred type

## Patterns
```ts
// DB row schema
export const ExperienceSchema = z.object({
  id: z.number(),
  title_en: z.string(),
  title_de: z.string(),
  sort_order: z.number(),
})
export type Experience = z.infer<typeof ExperienceSchema>

// tRPC input schema (inline in router)
const updateInput = z.object({ id: z.number(), title_en: z.string(), title_de: z.string() })
```

## Constraints
- Use `.safeParse()` when parsing DB results — never `.parse()` (throws)
- Never use `any` or skip validation for data crossing a system boundary
- Keep DB schemas in `src/lib/schemas.ts`; tRPC input schemas inline in router files

## Files
- `src/lib/schemas.ts` — canonical schema location

## Anti-Patterns
- Manual type definitions that duplicate a schema shape
- `.parse()` on untrusted data without try/catch
- Schemas defined inside component files
