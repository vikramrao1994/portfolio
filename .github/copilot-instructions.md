# Copilot Instructions for AI Coding Agents

This project is a multilingual portfolio site built with Next.js 16 (App Router), React 19, TypeScript, and Bun. It is deployed on Fly.io and uses SQLite for persistence. Follow these guidelines to be productive and maintain consistency:

## Architecture & Structure
- **Monorepo-style layout**: All core logic is in `src/` (see `README.md` and `CLAUDE.md` for structure).
- **App Router**: All routing is under `src/app/`, with locale-based folders (`[locale]`) for i18n.
- **Admin dashboard**: Protected routes in `src/app/[locale]/admin/`.
- **API**: Use tRPC (`src/app/api/trpc/[trpc]/`) for type-safe server-client communication. Use Zod for validation.
- **Database**: SQLite via Bun's native driver, configured in `src/server/db.ts`.
- **CV Generation**: Python scripts in `scripts/cv/` (see `CLAUDE.md`).

## Developer Workflows
- **Install dependencies**: `bun install` (not npm/yarn)
- **Dev server**: `bun run dev`
- **Linting**: `bun run lint` (Biome, not ESLint)
- **Build**: `bun run build` (uses Turbopack)
- **Python CV**: Run scripts in `scripts/cv/` for PDF generation
- **Deploy**: See `fly.toml` and `Dockerfile` for Fly.io setup

## Project Conventions
- **UI**: Use Kern React Kit components (`@publicplan/kern-react-kit`) and the custom `Image` component (`src/components/Image`).
- **Styling**: Prefer inline styles with the `spacing()` utility (`src/utils/spacing.ts`). Avoid new CSS/SCSS modules.
- **Data fetching**: Use TanStack Query for client-side, tRPC for server-client.
- **Validation**: Use Zod schemas shared between client and server.
- **Internationalization**: Use `next-intl` (see `src/i18n/`).
- **3D/Graphics**: Use Three.js and @react-three/drei for 3D elements (see `components/AvatarCanvas`).

## Patterns & Examples
- **Component imports**: Use `index.ts` re-exports for clean imports (e.g., `import { About } from 'components/About'`).
- **Admin mutations**: Use tRPC routers in `src/trpc/routers/`.
- **Database access**: Use helpers in `src/server/db.ts` and queries in `src/server/queries/`.
- **PDF CV**: Triggered via API or Python scripts; see `src/app/api/cv/route.ts`.

## References
- See `README.md` and `CLAUDE.md` for more details on structure and workflows.
- For Fly.io deployment, see `DEPLOYMENT.md`.

---

If unsure about a pattern, check for similar usage in `src/components/`, `src/trpc/routers/`, or `src/server/` before introducing new approaches.
