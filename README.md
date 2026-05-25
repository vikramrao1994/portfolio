# Portfolio

Multilingual (EN/DE) personal portfolio — Next.js 16, React 19, TypeScript, SQLite, Fly.io.

**Live:** https://vikram-portfolio.fly.dev

## Quick Start

**Prerequisites:** Bun, Python 3

```bash
bun install
cp .env.example .env   # fill in vars
bun db:init            # create tables
bun db:import          # load data
bun run dev            # http://localhost:3000
```

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript strict |
| Database | SQLite (bun:sqlite) |
| API | tRPC v11 + TanStack Query |
| Validation | Zod |
| UI | Kern React Kit |
| i18n | next-intl (en/de) |
| Auth | JWT (jose), httpOnly cookies |
| 3D | Three.js + @react-three/drei |
| Lint | Biome |
| Deploy | Fly.io + Docker + GitHub Actions |

## Commands

```bash
bun run dev          # dev server
bun run build        # production build
bun run lint         # Biome linting
bun db:init          # init database schema
bun db:import        # import Firebase data
bun db:clear         # clear all tables
```

## Project Structure

```
src/
  app/[locale]/     # Routes (en/de), admin, login
  components/       # Reusable UI components
  server/           # DB + siteContent.ts data aggregation
  trpc/             # tRPC routers and client
  lib/              # Zod schemas, auth utilities
  context/          # SiteContentContext
  hooks/            # useBreakpoints, useMutation
  proxy.ts          # Middleware (i18n + admin auth)
messages/           # en.json, de.json (UI labels)
db/schema.sql       # SQLite schema
scripts/cv/         # Python PDF generation
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_PATH=./data/portfolio.db
BACKGROUND_PIC_URL=<firebase_url>
PROFILE_PIC_URL=<firebase_url>
DATA_JSON_URL=<firebase_realtime_db>
ADMIN_PASSWORD=<secure_password>
JWT_SECRET=<random_64+_char_secret>
```

Production secrets (`ADMIN_PASSWORD`, `JWT_SECRET`) are set via `fly secrets set` — never in fly.toml.

## Admin Dashboard

- EN: `/admin` | DE: `/de/admin`
- Login: `/login` — POST `{ password }` to `/api/auth/login`
- JWT cookie (httpOnly, 24h expiry) validated by middleware

## CV Generation

```bash
GET /api/cv?lang=en   # PDF (10min server cache)
GET /api/cv?lang=de
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Fly.io setup, secrets, CI/CD, and database management.
