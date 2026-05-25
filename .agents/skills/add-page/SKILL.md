---
name: add-page
description: Use when adding a new Next.js page route, including locale-aware public pages and protected admin pages.
---

# Add Page

## Steps
1. Create `src/app/[locale]/<page-name>/page.tsx` with a default export
2. Default to a Server Component (fetch data directly in the component)
3. For data: call `getSiteContent(lang)` or query DB directly via `getDb()`
4. Get locale: `const locale = await getLocale()` or from params
5. Add translations if the page has static UI text (see skill: add-localized-ui)
6. For admin pages: add under `src/app/[locale]/admin/<page-name>/page.tsx` — middleware handles auth

## Locale-aware pattern
```tsx
import { getLocale } from 'next-intl/server'

export default async function MyPage() {
  const locale = await getLocale()
  const data = await getSiteContent(locale as 'en' | 'de')
  return <MyComponent data={data} />
}
```

## Constraints
- Always place pages under `[locale]` — never outside it (breaks i18n routing)
- Never fetch data client-side on first load for public pages — use Server Components
- Admin pages under `/admin/` are auto-protected by `src/proxy.ts` middleware
- No manual JWT checks in page files — middleware handles it

## Files
- `src/app/[locale]/<page-name>/page.tsx`
- `src/proxy.ts` — middleware (handles admin auth + i18n)
- `src/server/siteContent.ts` — data aggregation
- `messages/en.json`, `messages/de.json` — translations

## Anti-Patterns
- Pages placed outside `[locale]/` folder
- Client-side data fetching for initial page content
- Manual auth checks inside page components
- Hardcoded locale strings instead of reading from params/`getLocale()`
