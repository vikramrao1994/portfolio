# Portfolio Project Guide for AI Assistants

This is a multilingual (EN/DE) full-stack portfolio website built with Next.js 16, React 19, TypeScript, and Bun runtime, deployed on Fly.io with SQLite persistence.

## Technology Stack

### Runtime & Build Tools
- **Default to Bun** instead of Node.js/npm
  - Use `bun run dev` instead of `npm run dev`
  - Use `bun install` instead of `npm install`
  - Use `bunx` instead of `npx`
- **Database**: Use native `bun:sqlite` driver (already configured in `src/server/db.ts`)
- **Linting**: Use `bun run lint` (Biome, not ESLint/Prettier)
- **Python**: Required for CV generation (`scripts/cv/generate_cv_en.py` and `generate_cv_de.py`)

### Core Framework
- **Next.js 16.1.1** with App Router (not Pages Router)
- **React 19.2.3** with experimental React Compiler enabled
- **TypeScript 5.x** in strict mode
- **Turbopack** for fast builds (configured in next.config.ts)

### Data Fetching & Mutations
- **tRPC v11** for type-safe API layer (admin mutations)
- **TanStack Query** for client-side data fetching and caching
- **Zod** for runtime validation (shared between server and client)

### UI & Styling
- **Kern React Kit** (@publicplan/kern-react-kit): Use these components instead of creating custom ones
  - Available: Grid, Card, Button, Badge, Accordion, AccordionItem, List, ListItem, Drawer, etc.
  - Import from: `@publicplan/kern-react-kit/components`
- **Styling**: Use inline styles with the `spacing()` utility from `src/utils/spacing.ts`
  - Base unit: 8px (e.g., `spacing(2)` = 16px)
  - Avoid creating new CSS/SCSS modules
- **Icons**: Use `tech-stack-icons` for technology badges (see `components/TechBadge`)
- **Images**: Use the custom `Image` component from `src/components/Image` (wraps next-image-export-optimizer)

### 3D Graphics
- **Three.js** for 3D avatar (see `components/AvatarCanvas`)
- **@react-three/drei** for Three.js utilities

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Locale-based routing (en/de)
│   │   ├── page.tsx       # Main portfolio page
│   │   ├── admin/         # Protected admin dashboard
│   │   ├── login/         # Admin login page
│   │   ├── photography/   # Photography page (placeholder)
│   │   └── [...rest]/     # 404 catch-all
│   ├── api/
│   │   ├── cv/            # PDF CV generation endpoint
│   │   ├── auth/          # Authentication endpoints (login, logout)
│   │   └── trpc/[trpc]/   # tRPC API handler
│   ├── layout.tsx         # Root layout with providers
│   └── providers.tsx      # Client-side providers (QueryClientProvider)
├── components/            # React components (all have index.ts for clean imports)
├── context/               # SiteContentContext for sharing data
├── hooks/                 # Custom hooks (useBreakpoints, useMutation)
├── server/                # Server-side logic
│   ├── db.ts             # SQLite connection (getDb for reads, getWriteDb for admin writes)
│   ├── siteContent.ts    # Main data aggregation function
│   └── queries/          # Database queries (typed with Zod)
├── trpc/                  # tRPC setup
│   ├── init.ts           # Context, procedures, router factory
│   ├── router.ts         # Root app router
│   ├── routers/          # Sub-routers by domain (heading.ts, etc.)
│   ├── client.tsx        # TRPCProvider and useTRPC hook
│   └── query-client.ts   # TanStack Query client factory
├── lib/                   # Zod schemas and validation (includes auth.ts)
├── i18n/                  # Internationalization config
├── proxy.ts               # Middleware for i18n routing + admin auth
├── styles/                # Global SCSS styles
└── utils/                 # Utility functions

scripts/
├── db/                    # Database initialization & data import
├── cv/                    # Python CV generation scripts
└── prefetch.js            # Fetches data from Firebase

db/
└── schema.sql             # SQLite schema definition

messages/
├── en.json                # English translations
└── de.json                # German translations
```

## Database Patterns

### Connection
- Use `getDb()` from `src/server/db.ts` for **read-only** public queries
- Use `getWriteDb()` from `src/server/db.ts` for **admin write operations** (via tRPC protected procedures)
- Single connection per process (connection pooling)
- Location: `./data/portfolio.db` (dev) or `/data/portfolio.db` (production)

### Schema (11 tables)
All content tables have **bilingual columns** (en/de) for translatable content:

1. **heading** - Single-row config (profile info, contact details, metadata)
2. **about_me** - Paragraphs with sort_order
3. **education** - Education history with logos/certificates
4. **executive_summary** - Profile bullet points
5. **experience** - Work experience with logos/links/meta_json
6. **experience_summary** - Nested under experience (FK relationship)
7. **experience_tech** - Tech names for experience
8. **experience_tech_icon** - Tech stack icons (from tech-stack-icons)
9. **skills_group** - Skill categories (Frontend, Backend, etc.)
10. **skills_item** - Individual skills with bucket (most_used | other)
11. **personal_project** - (Unused, ready for future)
12. **hobbies** - (Unused, ready for future)

### Querying Patterns
- All queries are in `src/server/queries/` and return Zod-validated data
- Use `getSiteContent(lang)` from `src/server/siteContent.ts` for full data aggregation
- Always pass `lang` parameter ("en" or "de") to get localized content

### Data Initialization
```bash
bun db:init      # Creates tables from schema.sql
bun db:import    # Imports data from data.json (fetched from Firebase)
bun db:clear     # Clears all tables
```

## Component Patterns

### Server vs Client Components
- **Default to Server Components** in App Router
- Use `"use client"` only when needed:
  - Interactive components (useState, useEffect, event handlers)
  - Browser APIs (window, localStorage, IntersectionObserver)
  - Context consumers (useSiteContent, useBreakpoints)

### Component Organization
- Each component has its own folder with `index.tsx` and `index.ts`
- Export from `index.ts` for clean imports: `import { Header } from '@/components/Header'`
- Co-locate utilities/types within component folders if not reusable

### Existing Components (Reuse these!)
- **Header** - Navigation with drawer menu, language switcher, CV download
- **Footer** - Credits and tech stack
- **Intro** - Profile card with avatar, experience counter
- **About** - About me section with paragraphs
- **Work** - Work experience with accordion, tech badges
- **Skills** - Skill groups with color-coded icons
- **Education** - Education history
- **Avatar** - Interactive 2D/3D toggle with Three.js (respects prefers-reduced-motion)
- **TechBadge** - Technology badge with icon
- **Counter** - Animated number counter with easing

### Responsive Design
```typescript
import { useBreakpoints } from '@/hooks/useBreakpoints'

const { mobile, tablet, desktop } = useBreakpoints()
// mobile: 0-576px, tablet: 577-991px, desktop: 992+
```

### Custom Hooks
- `useBreakpoints` - Responsive breakpoint detection
- `useMutation` - TanStack Query wrapper for simple POST/PUT/DELETE mutations (used for login/logout)

## Internationalization (i18n)

### Pattern
- Use `next-intl` for all translations
- Supported locales: `en` (default), `de`
- Routing: `/` = English, `/de` = German (as-needed prefix)

### Usage
```typescript
import { useLocale, useTranslations } from 'next-intl'

const locale = useLocale() // "en" | "de"
const t = useTranslations('HomePage')
const text = t('title')
```

### Content Structure
- Database content: Use `en` and `de` columns (no translation files)
- UI labels: Add to `messages/en.json` and `messages/de.json`
- Always add translations for BOTH languages when adding new UI text

## Data Flow

1. **Server-side**: `getDb()` → queries → `getSiteContent(lang)` → props
2. **Client-side**: `SiteContentProvider` wraps app → components use `useSiteContent()` hook
3. **Context Provider**: Located in `src/app/providers.tsx`

```typescript
import { useSiteContent } from '@/context/SiteContentContext'

const { heading, about, work, skills, education } = useSiteContent()
```

## API Routes

### GET /api/cv?lang=en|de
- Generates PDF CV using Python ReportLab
- 10-minute server-side caching
- Process: Fetch data → write JSON → call Python script → return PDF
- Scripts: `scripts/cv/generate_cv_en.py` and `generate_cv_de.py`

### POST /api/auth/login
- Authenticates admin with password
- Returns JWT in httpOnly cookie (`auth_token`)
- Request body: `{ "password": "string" }`

### POST /api/auth/logout
- Clears the `auth_token` cookie
- Returns success JSON

## Admin Authentication

### Overview
The admin section (`/admin` and `/de/admin`) is protected by simple password authentication using JWT-based sessions stored in httpOnly cookies.

### Architecture
- **Password**: Single admin password stored in `ADMIN_PASSWORD` env var
- **Sessions**: Stateless JWT tokens (24-hour expiry) signed with `JWT_SECRET`
- **Protection**: Middleware in `src/proxy.ts` validates JWT before allowing access
- **Library**: `jose` for JWT signing/verification (Web Crypto API based)

### Authentication Flow
1. User visits `/admin` → Middleware redirects to `/login` if no valid token
2. User submits password → `POST /api/auth/login` validates and sets cookie
3. On success → Redirect to `/admin` with valid JWT cookie
4. Logout → `POST /api/auth/logout` clears cookie

### Key Files
- `src/lib/auth.ts` - JWT utilities (`createJWT`, `verifyJWT`, `comparePasswords`)
- `src/proxy.ts` - Middleware combining i18n routing + admin auth
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/app/[locale]/login/page.tsx` - Login form UI
- `src/app/[locale]/admin/page.tsx` - Protected admin dashboard

### Security Features
- HttpOnly cookies (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite: 'lax' (CSRF protection)
- 24-hour JWT expiry
- Constant-time password comparison (timing attack prevention)
- Lazy env var evaluation (secrets not baked into Docker image)

### Locale-Aware Routing
The middleware (`src/proxy.ts`) handles both locales:
- `/admin` → Protected (EN)
- `/de/admin` → Protected (DE)
- Redirects to locale-appropriate login page (`/login` or `/de/login`)

## tRPC (Admin Data Mutations)

### Overview
tRPC v11 provides type-safe API layer for admin operations. It reuses JWT authentication from the existing auth system.

### Architecture
- **Server**: `src/trpc/init.ts` creates context with JWT verification
- **Router**: `src/trpc/router.ts` exports `AppRouter` type
- **Procedures**: `protectedProcedure` requires valid JWT, `publicProcedure` for unauthenticated access
- **Client**: `useTRPC()` hook provides typed access to procedures

### Usage Pattern
```typescript
// In a client component wrapped with TRPCProvider
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";

const trpc = useTRPC();

// Query
const { data } = useQuery(trpc.heading.getRaw.queryOptions());

// Mutation
const mutation = useMutation(trpc.heading.update.mutationOptions());
await mutation.mutateAsync({ name: "New Name" });
```

### Type Inference
Infer input/output types from procedures instead of defining manually:
```typescript
import type { inferProcedureInput } from "@trpc/server";
import type { AppRouter } from "@/trpc/router";

type HeadingInput = inferProcedureInput<AppRouter["heading"]["update"]>;
```

### Adding New Routers
1. Create router in `src/trpc/routers/yourRouter.ts`
2. Use `protectedProcedure` for admin-only operations
3. Add Zod schema for input validation
4. Export and add to `src/trpc/router.ts`

### Key Files
- `src/trpc/init.ts` - Context creation, procedure definitions
- `src/trpc/router.ts` - Root router combining all sub-routers
- `src/trpc/routers/heading.ts` - Heading CRUD operations
- `src/trpc/client.tsx` - TRPCProvider and useTRPC hook
- `src/app/api/trpc/[trpc]/route.ts` - API handler

## Code Conventions

### TypeScript
- **Strict mode enabled** - no implicit any
- **Zod for validation** - Define schemas in `src/lib/schemas.ts`
- **Type inference** - Use `z.infer<typeof Schema>` instead of manual types
- **Explicit imports** - No barrel exports except index files

### Naming
- **PascalCase**: Components, types, schemas
- **camelCase**: Functions, variables, hooks
- **SCREAMING_SNAKE_CASE**: Constants (e.g., `DB_PATH`)
- **kebab-case**: File names for non-components

### Code Quality
- Use `bun run lint` (Biome) before committing
- Use `biome-ignore` comments sparingly and only when necessary
- Prefer functional programming patterns (map, filter, reduce)
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Error Handling
- Try-catch for async operations
- `.safeParse()` for Zod validation
- Return null/undefined instead of throwing in optional functions
- Graceful fallbacks (e.g., 2D avatar if 3D fails)

## Development Workflow

### Commands
```bash
bun run dev          # Start dev server (Turbopack)
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Biome linting
bun db:init          # Initialize database
bun db:import        # Import data from Firebase
```

### Database Updates
1. Update `db/schema.sql` for schema changes
2. Update queries in `src/server/queries/`
3. Update Zod schemas in `src/lib/schemas.ts`
4. Update `getSiteContent()` in `src/server/siteContent.ts`
5. Run `bun db:init` to recreate tables (dev only)

### Adding New Components
1. Create folder in `src/components/ComponentName/`
2. Add `index.tsx` with component logic
3. Add `index.ts` with export: `export { ComponentName } from './ComponentName'`
4. Use Kern React Kit components as building blocks
5. Use inline styles with `spacing()` utility

### Adding New Pages
1. Create folder in `src/app/[locale]/page-name/`
2. Add `page.tsx` with default export
3. Import and render in layout if needed
4. Add translations to `messages/en.json` and `messages/de.json`

## Deployment

### Platform
- **Fly.io** with persistent volumes
- **App name**: vikram-portfolio
- **Region**: Frankfurt (fra)
- **Database**: Mounted at `/data/portfolio.db` (1GB volume)

### CI/CD
- **PR Checks**: Linting + build validation (`.github/workflows/pr-checks.yml`)
- **Production Deploy**: Auto-deploy on push to main (`.github/workflows/deploy-production.yml`)

### Docker Build
- Multi-stage build with Bun + Python
- Base image: `oven/bun:1-debian`
- Includes: Node, Python packages, database, CV scripts
- Non-root user: nextjs:1001
- Health checks: HTTP (port 3000) + TCP

### Environment Variables
```
NODE_ENV=production
PORT=3000
DB_PATH=/data/portfolio.db
NEXT_TELEMETRY_DISABLED=1
BACKGROUND_PIC_URL=<firebase_url>      # .env only
PROFILE_PIC_URL=<firebase_url>          # .env only
DATA_JSON_URL=<firebase_realtime_db>    # .env only
ADMIN_PASSWORD=<secure_password>        # .env + Fly.io secret (runtime only)
JWT_SECRET=<random_secret_64+_chars>    # .env + Fly.io secret (runtime only)
```

### Setting Fly.io Secrets
Admin auth secrets must be set via Fly.io CLI (not in Dockerfile):
```bash
fly secrets set ADMIN_PASSWORD="your-secure-password"
fly secrets set JWT_SECRET="$(openssl rand -base64 64)"
```

## Important Notes

### What NOT to Do
- Don't create new CSS/SCSS modules (use inline styles + spacing utility)
- Don't use Tailwind classes (use Kern React Kit components)
- Don't use npm/Node.js commands (use Bun)
- Don't bypass Zod validation for database data
- Don't create new components if Kern React Kit has equivalent
- Don't write to database without using `protectedProcedure` (admin auth required)
- Don't skip translations when adding UI text
- Don't use barrel exports outside of component index files
- Don't use SWR (use TanStack Query via tRPC or `useMutation` hook)

### Performance Considerations
- React Compiler is enabled (automatic memoization)
- Images are optimized with WebP conversion
- Database uses read-only connection for public queries, write connection for admin only
- CV generation is cached for 10 minutes
- 3D avatar respects `prefers-reduced-motion`
- Lazy loading with IntersectionObserver
- TanStack Query provides 30-second stale time for cached data

### Accessibility
- Respect `prefers-reduced-motion` (see Avatar component)
- Use semantic HTML (Kern components follow this)
- Provide alt text for images
- Keyboard navigation support in Drawer/Accordion

## Key Files Reference

- **Database**: `src/server/db.ts` (getDb, getWriteDb), `db/schema.sql`
- **Main data aggregation**: `src/server/siteContent.ts`
- **Zod schemas**: `src/lib/schemas.ts`
- **Context provider**: `src/context/SiteContentContext/index.tsx`
- **i18n config**: `src/i18n/request.ts`, `src/i18n/routing.ts`
- **Middleware**: `src/proxy.ts` (i18n + admin auth)
- **Auth utilities**: `src/lib/auth.ts` (JWT, password comparison)
- **tRPC setup**: `src/trpc/init.ts`, `src/trpc/router.ts`, `src/trpc/client.tsx`
- **tRPC routers**: `src/trpc/routers/heading.ts`
- **Query client**: `src/trpc/query-client.ts`, `src/app/providers.tsx`
- **Next.js config**: `next.config.ts`
- **Build config**: `fly.toml`, `Dockerfile`
- **CV generation**: `scripts/cv/generate_cv_en.py`, `generate_cv_de.py`

## Contact & Links

- **GitHub**: Check commits for context on recent changes
- **Deployment**: https://vikram-portfolio.fly.dev (or check fly.toml for latest)
- **Repository**: Check .git for remote URL

---

When working on this project, prioritize:
1. **Bilingual support** - Always consider EN/DE translations
2. **Component reusability** - Use existing Kern React Kit components
3. **Type safety** - Validate all data with Zod
4. **Performance** - Leverage React Compiler, image optimization, caching
5. **Accessibility** - Respect user preferences and use semantic HTML
6. **Clean code** - Follow existing patterns and conventions

For database changes, always update schema → queries → types in that order.
For UI changes, check if Kern React Kit has the component before creating custom ones.
For content changes, ensure both EN and DE translations are updated.
