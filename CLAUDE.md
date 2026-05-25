# Portfolio — AI Execution Rules

## Stack
- Runtime: Bun (NOT npm/Node)
- Framework: Next.js 16.1.1, App Router, React 19, TypeScript strict
- Build: Turbopack
- DB: SQLite via `bun:sqlite`
- Lint: Biome (`bun run lint`)
- i18n: next-intl, locales: `en` (default), `de`
- UI: Kern React Kit (`@publicplan/kern-react-kit`)
- API: tRPC v11 + TanStack Query + Zod
- Auth: JWT (jose) in httpOnly cookies
- 3D: Three.js + @react-three/drei
- Deploy: Fly.io (Frankfurt), Docker, GitHub Actions CI/CD

## Commands
| Command | Use |
|---|---|
| `bun run dev` | Dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run lint` | Biome lint |
| `bun db:init` | Create tables from schema.sql |
| `bun db:import` | Import data from Firebase JSON |
| `bun db:clear` | Clear all tables |

## Architecture

### Source Layout
```
src/app/[locale]/     → routes (en/de)
src/components/       → reusable UI (each has index.tsx + index.ts)
src/server/           → DB connection + queries + siteContent aggregation
src/trpc/             → routers + provider + client hook
src/lib/              → Zod schemas + auth.ts
src/context/          → SiteContentContext
src/hooks/            → useBreakpoints, useMutation
src/proxy.ts          → middleware (i18n + admin auth)
messages/             → en.json, de.json (UI labels only)
db/schema.sql         → SQLite schema
scripts/cv/           → Python CV generation
```

### Data Flow
1. Server: `getDb()` → queries → `getSiteContent(lang)` → page props
2. Client: `SiteContentProvider` → `useSiteContent()` in components
3. Admin mutations: `useTRPC()` → `protectedProcedure` → `getWriteDb()`

## Decision Rules

### Database
- Public read → `getDb()`
- Admin write → `getWriteDb()` via `protectedProcedure` only
- NEVER write to DB outside a `protectedProcedure`

### Components
- Static/no interactivity → Server Component (default)
- `useState`, events, browser APIs, context consumers → `"use client"`

### Styling
1. Check Kern React Kit first
2. Inline styles with `spacing()` from `src/utils/spacing.ts` (base: 8px)
3. NEVER create CSS/SCSS modules

### Auth
- Admin mutation → `protectedProcedure`
- Public fetch → `publicProcedure`

### Localization
- UI text → `next-intl` (`messages/en.json` + `messages/de.json`)
- Content → DB `en`/`de` columns
- ALWAYS add BOTH languages

### Validation
- ALL DB data → Zod schemas (`.safeParse()`)
- Schemas in `src/lib/schemas.ts`
- Use `z.infer<typeof Schema>` not manual types

## Database Schema (11 tables)
All content tables have bilingual `_en`/`_de` columns.

| Table | Purpose |
|---|---|
| heading | Single-row profile config |
| about_me | Paragraphs (sort_order) |
| education | Education history |
| executive_summary | Profile bullets |
| experience | Work experience |
| experience_summary | FK → experience |
| experience_tech | Tech names per experience |
| experience_tech_icon | tech-stack-icons refs |
| skills_group | Skill categories |
| skills_item | Skills (bucket: most_used\|other) |
| personal_project | Unused |
| hobbies | Unused |

DB paths: dev `./data/portfolio.db` | prod `/data/portfolio.db`

## Existing Components (reuse before creating new)
- Header, Footer, Intro, About, Work, Skills, Education
- Avatar (2D/3D Three.js toggle, respects prefers-reduced-motion)
- TechBadge, Counter (animated easing)

## Key Files
| Purpose | File |
|---|---|
| DB connection | `src/server/db.ts` |
| Data aggregation | `src/server/siteContent.ts` |
| Zod schemas | `src/lib/schemas.ts` |
| Middleware | `src/proxy.ts` |
| Auth utilities | `src/lib/auth.ts` |
| tRPC root router | `src/trpc/router.ts` |
| tRPC context | `src/trpc/init.ts` |
| tRPC client hook | `src/trpc/client.tsx` |
| Site context | `src/context/SiteContentContext/index.tsx` |
| CV API route | `src/app/api/cv/route.ts` |
| DB schema | `db/schema.sql` |

## API Routes
- `GET /api/cv?lang=en|de` — PDF via Python ReportLab, 10min cache
- `POST /api/auth/login` — validates password, sets JWT cookie
- `POST /api/auth/logout` — clears cookie
- `POST /api/trpc/[trpc]` — tRPC handler

## Responsive Breakpoints
```typescript
import { useBreakpoints } from '@/hooks/useBreakpoints'
const { mobile, tablet, desktop } = useBreakpoints()
// mobile: 0-576px | tablet: 577-991px | desktop: 992+
```

---

## Skills

Reusable workflows live in [`.agents/skills/`](.agents/skills/skills.md).
Load the relevant skill before implementing a recurring task.

| Category | Skills |
|---|---|
| Data | add-database-table, add-zod-schema, add-db-query, database-migration |
| API | add-trpc-router, add-protected-mutation, add-api-route |
| UI | add-component, add-page, add-localized-ui, update-translations |
| Features | add-admin-crud, add-portfolio-section, generate-cv |
| Infra | deploy-flyio, cicd-workflow |

---

## Anti-Patterns (NEVER do these)
- `npm install` / `npx` / `yarn` → use `bun`/`bunx`
- Tailwind classes → use Kern React Kit + `spacing()`
- New CSS/SCSS modules → inline styles only
- Raw DB access without Zod validation
- Writing DB outside `protectedProcedure`
- Skipping translation for either language
- `<img>` tags → use `src/components/Image`
- SWR → use TanStack Query via tRPC or `useMutation` hook
- Barrel exports outside component `index.ts` files
- Manual type definitions when `z.infer` suffices
- Untranslated content (missing `en` or `de`)
