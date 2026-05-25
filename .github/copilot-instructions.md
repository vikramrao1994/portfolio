# Copilot Instructions

This is a multilingual (EN/DE) portfolio — Next.js 16 App Router, React 19, TypeScript, Bun, SQLite, Fly.io.

**Primary AI reference:** [CLAUDE.md](../CLAUDE.md) — contains all engineering rules, decision rules, and reusable workflow skills.

## Key Rules (summary)

- Use `bun` / `bunx` — never `npm` / `npx`
- Lint with `bun run lint` (Biome)
- All DB data → Zod validation
- Public reads → `getDb()` | Admin writes → `getWriteDb()` via `protectedProcedure`
- UI → Kern React Kit + `spacing()` utility — no CSS modules, no Tailwind
- All user-facing text → both `en.json` and `de.json`
- Admin mutations → `protectedProcedure` (JWT enforced by middleware)

## References
- Architecture & AI rules: [CLAUDE.md](../CLAUDE.md)
- Human onboarding: [README.md](../README.md)
- Deployment operations: [DEPLOYMENT.md](../DEPLOYMENT.md)
