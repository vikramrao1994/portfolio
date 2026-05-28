# Portfolio

Multilingual (EN/DE) personal portfolio with deterministic AI-assisted document generation.

**Live:** https://vikram-portfolio.fly.dev

## What This Is

- Public portfolio web app (EN/DE) served from SQLite via Next.js + tRPC
- Deterministic AI document pipeline: evidence retrieval → rhetoric planning → Claude prose → PDF
- MCP server: cover-letter pipeline as composable tools (local stdio + remote HTTP)

Architecture philosophy: scoring and retrieval are deterministic and authoritative. Claude handles prose only.

## Core Features

- Multilingual cover-letter generation (EN/DE, 4 tone profiles)
- Phase 4A retrieval: deterministic evidence scoring + lexical chunk retrieval
- Phase 5A rhetoric: company alignment inference + narrative planning (no Claude)
- Structured Claude JSON generation from bounded, pre-selected evidence packs
- Deterministic ReportLab PDF rendering (Python)
- Local stdio MCP + remote HTTP MCP (Fly.io, Bearer auth, feature-flagged)
- CV PDFs with optional verification/reference hyperlinks
- Admin CRUD dashboard with JWT auth
- 3D avatar (Three.js) with `prefers-reduced-motion` support

## Architecture Summary

```
Deterministic                         Probabilistic
──────────────────────────────        ─────────────────────────────
extractJobKeywords()
scoreCandidateEvidence()
buildCandidateChunks()
lexicalRetrieveEvidence()
buildEvidencePack()
buildCompanyAlignment()               generateCoverLetterWithClaude()
buildRhetoricalPlan()
runCoverLetterPdfRenderer()
```

Evidence selection, scoring, and narrative structure are fully deterministic.
Claude receives a pre-built prompt with a bounded evidence pack — it writes sentences, not strategy.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Database | SQLite (`bun:sqlite`) |
| API | tRPC v11 + TanStack Query + Zod |
| UI | Kern React Kit |
| i18n | next-intl (en/de) |
| Auth | JWT (jose), httpOnly cookies |
| 3D | Three.js + @react-three/drei |
| AI | Anthropic Claude (structured JSON prose generation) |
| PDF | Python ReportLab (deterministic) |
| Lint | Biome |
| Deploy | Fly.io + Docker + GitHub Actions |

## Local Development

**Prerequisites:** Bun, Python 3, ReportLab (`pip install reportlab`)

```bash
bun install
cp .env.example .env        # fill in vars
bun db:init && bun db:import
bun run dev                 # http://localhost:3000
bun run mcp:cover-letter    # local MCP stdio server
```

## MCP Overview

Five composable tools expose the cover-letter pipeline:

| Tool | Type | Description |
|---|---|---|
| `generate_cover_letter_pdf` | one-shot | Full pipeline + PDF (requires `ANTHROPIC_API_KEY`) |
| `analyze_job_description` | deterministic | Keyword extraction from job posting |
| `match_candidate_evidence` | deterministic | Evidence scoring + ranking |
| `generate_cover_letter_prompt` | deterministic | Prompt builder (no Claude call) |
| `render_cover_letter_pdf` | deterministic | ReportLab PDF render |

See [mcp/README.md](mcp/README.md) for transport setup, auth, and security details.

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_PATH=./data/portfolio.db
ADMIN_PASSWORD=<secure_password>
JWT_SECRET=<random_64+_char_secret>
ANTHROPIC_API_KEY=<sk-ant-...>
```

Production secrets are set via `fly secrets set` — never in `fly.toml`.

## Admin Dashboard

- EN: `/admin` | DE: `/de/admin`
- Login: `/login` → POST `{ password }` to `/api/auth/login`
- JWT cookie (httpOnly, 24h expiry) validated by middleware

## Documentation Map

| Doc | Content |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Architecture rules, pipelines, decision tables, constraints |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Fly.io ops, secrets, CI/CD, database management |
| [mcp/README.md](mcp/README.md) | MCP tools, transport modes, auth, security |
| [.agents/skills/](.agents/skills/skills.md) | Reusable engineering workflows |
