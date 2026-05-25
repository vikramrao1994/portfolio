---
name: add-localized-ui
description: Use when adding any new user-facing text string, label, or UI copy that needs to appear in both English and German.
---

# Add Localized UI

## Steps
1. Add the key to `messages/en.json` under the appropriate namespace
2. Add the same key to `messages/de.json` with the German translation
3. Use `useTranslations('Namespace')` in the component
4. Call `t('key')` to render the translated string

## Pattern
```json
// messages/en.json
{ "HomePage": { "downloadCV": "Download CV" } }

// messages/de.json
{ "HomePage": { "downloadCV": "Lebenslauf herunterladen" } }
```

```tsx
import { useTranslations } from 'next-intl'
const t = useTranslations('HomePage')
return <button>{t('downloadCV')}</button>
```

## When to use DB columns instead
Use DB `<field>_en` / `<field>_de` columns (not translation files) for:
- Content that changes per user/deployment
- Portfolio section text, titles, descriptions
- Any data managed via the admin dashboard

Use `messages/` only for static UI chrome: button labels, nav items, headings, error messages.

## Constraints
- Both `en.json` and `de.json` must be updated in the same commit
- Never hardcode English strings in JSX
- Never use `useLocale()` to manually pick a string — use `useTranslations()`

## Files
- `messages/en.json`
- `messages/de.json`
- `src/i18n/request.ts` — next-intl config

## Anti-Patterns
- Hardcoded English text in components
- Adding a key to only one language file
- Using translation files for database-driven content
