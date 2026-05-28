# Portfolio — AI Execution Rules

## System Overview

Multilingual portfolio platform (EN/DE) with deterministic AI-assisted document generation.

- **Portfolio webapp**: Next.js 16 + SQLite + tRPC — public portfolio and admin CRUD
- **Cover-letter pipeline**: deterministic retrieval → rhetoric planning → Claude prose → ReportLab PDF
- **CV pipeline**: POST /api/cv → Python/ReportLab → PDF binary
- **MCP tooling**: cover-letter pipeline as composable tools (local stdio + remote HTTP)

Design principle: deterministic systems are authoritative; Claude handles prose only.

## Core Pipelines

### Cover-Letter

```
Job Description
→ extractJobKeywords()              deterministic keyword extraction
→ scoreCandidateEvidence()          deterministic scoring (authoritative)
→ buildCandidateChunks()            chunking for retrieval
→ lexicalRetrieveEvidence()         lexical retrieval (fills scoring gaps)
→ buildEvidencePack()               merge: deterministic priority + retrieved fill (max 8)
→ buildCompanyAlignment()           infer company traits from JD keywords
→ buildRhetoricalPlan()             narrative structure (deterministic, Claude-free)
→ buildClaudeJsonPrompt()           structured prompt with pre-selected evidence pack
→ generateCoverLetterWithClaude()   Claude JSON generation (prose only)
→ runCoverLetterPdfRenderer()       ReportLab PDF (Python, deterministic)
```

| Boundary | Responsibility |
|---|---|
| Deterministic | extraction, scoring, chunking, retrieval, rhetoric planning |
| Claude | prose generation — given pre-selected pack, writes sentences only |
| Python | PDF layout and rendering |

### CV

```
POST /api/cv?lang=en|de  (body: SiteSchema JSON)
→ Zod validate → write temp JSON
→ python3 scripts/cv/main.py --input <json> --lang <lang> --output <pdf>
→ return PDF binary → cleanup temp files
```

## Directory Map

```
src/lib/cover-letter/
  context/              buildCoverLetterContext.ts (pipeline entry)
  rag/                  buildCandidateChunks, lexicalRetrieveEvidence, buildEvidencePack
  rhetoric/             buildCompanyAlignment, buildRhetoricalPlan, buildNarrativeGuidelines
  *.ts                  extractJobKeywords, scoreCandidateEvidence, orchestrate*, build*
mcp/
  createServer.ts       shared MCP factory (stdio + HTTP, no duplication)
  server.ts             local stdio entry point
  tools/                5 thin tool handler adapters
  schemas/              Zod input schemas
src/app/api/
  cv/route.ts           POST /api/cv — Python CV PDF
  mcp/route.ts          POST /api/mcp — remote HTTP MCP (feature-flagged)
scripts/
  cv/                   main.py (entry) + resume_creator.py (ReportLab)
  cover-letter/         main.py (entry) + cover_letter_creator.py (ReportLab)
src/app/[locale]/       Next.js routes (en/de)
src/components/         Reusable UI (each has index.tsx + index.ts)
src/server/             DB connection + siteContent aggregation
src/trpc/               tRPC routers + provider + client hook
src/lib/                Zod schemas + auth
src/context/            SiteContentContext
src/hooks/              useBreakpoints, useMutation
src/proxy.ts            Middleware (i18n + admin auth)
messages/               en.json, de.json (UI labels only)
db/schema.sql           SQLite schema
.agents/skills/         Reusable engineering workflows
```

## Decision Rules

### Retrieval

| Scenario | Tool |
|---|---|
| Evidence scoring | `scoreCandidateEvidence()` — deterministic, always authoritative |
| Gap retrieval | `lexicalRetrieveEvidence()` — supplemental, fills what scoring misses |
| Future semantic | vector store — additive only, never replaces deterministic scoring |

### Rhetoric & Generation

| Responsibility | System |
|---|---|
| Evidence selection | deterministic scoring (non-negotiable) |
| Company trait inference | `buildCompanyAlignment()` — from JD keywords, no Claude |
| Narrative structure | `buildRhetoricalPlan()` — deterministic, no Claude |
| Prose generation | Claude — given plan + evidence pack, does NOT select evidence |

### PDF Rendering

- Both CV and cover-letter: Python ReportLab, `spawn` with args array (no shell interpolation)
- Flow: write temp JSON → spawn Python → read temp PDF → return binary → cleanup
- Layout is deterministic — Claude controls prose text only
- CV PDFs may include verification/reference hyperlinks; cover letters must not

### Database

- Public read → `getDb()`
- Admin write → `getWriteDb()` via `protectedProcedure` only
- NEVER write to DB outside a `protectedProcedure`

### Components

- Static/no interactivity → Server Component (default)
- `useState`, events, browser APIs, context consumers → `"use client"`

### Styling

1. Kern React Kit first (`@publicplan/kern-react-kit`)
2. Inline styles with `spacing()` from `src/utils/spacing.ts` (base: 8px)
3. NEVER create CSS/SCSS modules

### Auth & Localization

- Admin mutation → `protectedProcedure` | Public fetch → `publicProcedure`
- UI text → `next-intl` (`messages/en.json` + `messages/de.json`)
- Content → DB `_en`/`_de` columns | ALWAYS add both languages
- ALL DB data → Zod `.safeParse()` | Use `z.infer<typeof Schema>` not manual types

### MCP

| Mode | When |
|---|---|
| Local stdio (`bun run mcp:cover-letter`) | Claude Desktop / Cursor on same machine — no auth |
| Remote HTTP (`src/app/api/mcp/route.ts`) | Fly.io, Bearer token required, feature-flagged |

Remote: `ENABLE_REMOTE_MCP=true` + `MCP_AUTH_TOKEN` required. Either missing → 404/401.

## Portfolio DB Schema

All content tables have `_en`/`_de` columns. DB paths: dev `./data/portfolio.db` | prod `/data/portfolio.db`

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

## Key Files

| Purpose | File |
|---|---|
| Pipeline entry | `src/lib/cover-letter/context/buildCoverLetterContext.ts` |
| Orchestration | `src/lib/cover-letter/orchestrateCoverLetterGeneration.ts` |
| Evidence scoring | `src/lib/cover-letter/scoreCandidateEvidence.ts` |
| Lexical retrieval | `src/lib/cover-letter/rag/lexicalRetrieveEvidence.ts` |
| Evidence pack | `src/lib/cover-letter/rag/buildEvidencePack.ts` |
| Rhetoric plan | `src/lib/cover-letter/rhetoric/buildRhetoricalPlan.ts` |
| Claude generation | `src/lib/cover-letter/generateCoverLetterWithClaude.ts` |
| MCP factory | `mcp/createServer.ts` |
| Remote MCP route | `src/app/api/mcp/route.ts` |
| CV API route | `src/app/api/cv/route.ts` |
| DB connection | `src/server/db.ts` |
| Data aggregation | `src/server/siteContent.ts` |
| Zod schemas | `src/lib/schemas.ts` |
| Middleware | `src/proxy.ts` |

## API Routes

| Route | Description |
|---|---|
| `POST /api/cv?lang=en\|de` | JSON body (SiteSchema) → Python ReportLab PDF |
| `POST /api/mcp` | MCP Streamable HTTP (Bearer auth, feature-flagged) |
| `POST /api/auth/login` | Password → JWT cookie |
| `POST /api/auth/logout` | Clear JWT cookie |
| `POST /api/trpc/[trpc]` | tRPC handler |

## Commands

| Command | Use |
|---|---|
| `bun run dev` | Dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run lint` | Biome lint |
| `bun run mcp:cover-letter` | Local MCP server (stdio) |
| `bun db:init` | Create tables from schema.sql |
| `bun db:import` | Import data from Firebase JSON |
| `bun db:clear` | Clear all tables |

## Stack

Runtime: Bun | Framework: Next.js 16.1.1, App Router, React 19, TypeScript strict | DB: SQLite (`bun:sqlite`) | Lint: Biome | i18n: next-intl (en/de) | UI: Kern React Kit | API: tRPC v11 + TanStack Query + Zod | Auth: JWT (jose, httpOnly) | 3D: Three.js + @react-three/drei | Deploy: Fly.io (Frankfurt), Docker, GitHub Actions

## Existing Components (reuse before creating new)

- Header, Footer, Intro, About, Work, Skills, Education
- Avatar (2D/3D Three.js toggle, respects `prefers-reduced-motion`)
- TechBadge, Counter (animated easing)

```typescript
import { useBreakpoints } from '@/hooks/useBreakpoints'
const { mobile, tablet, desktop } = useBreakpoints()
// mobile: 0-576px | tablet: 577-991px | desktop: 992+
```

## Critical Constraints

- Evidence selection is deterministic — Claude receives a pre-selected pack, never raw DB data
- `scoreCandidateEvidence()` is authoritative — never bypass with AI ranking
- PDF rendering is deterministic — Claude controls prose text only, not layout
- CV PDFs may include verification hyperlinks; cover letters must not
- No hallucinated experience — all evidence content comes from the DB only
- MCP tools are thin transport adapters — all logic lives in `src/lib/cover-letter/`
- No shell interpolation in Python invocations — always `spawn` with args arrays
- `ENABLE_REMOTE_MCP` must be `"true"` explicitly (absent → off)

## Skills Reference

Reusable workflows: [`.agents/skills/`](.agents/skills/skills.md)

| Category | Skills |
|---|---|
| Data | add-database-table, add-zod-schema, add-db-query, database-migration |
| API | add-trpc-router, add-protected-mutation, add-api-route |
| UI | add-component, add-page, add-localized-ui, update-translations |
| Features | add-admin-crud, add-portfolio-section, generate-cv |
| AI Pipeline | add-retrieval-pipeline, add-rhetorical-planning, add-pdf-verification-links |
| Infra | deploy-flyio, cicd-workflow |

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
- Evidence compression overload — dumping all DB data into Claude's context
- Generic company-fit paragraphs — rhetoric plan must drive narrative specificity
- Orchestration loops — one deterministic pass, no retry/feedback cycles
- Duplicated retrieval or prompt-building logic in MCP tools
- Bypassing `scoreCandidateEvidence()` with AI-based ranking
- Shell string interpolation in Python `spawn` calls
