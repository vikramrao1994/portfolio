---
name: add-component
description: Use when creating a new reusable React component that will be shared across pages or used multiple times.
---

# Add Component

## Steps
1. Check Kern React Kit (`@publicplan/kern-react-kit/components`) for an equivalent — prefer reuse
2. Create `src/components/<ComponentName>/<ComponentName>.tsx` with the component as a **default export**
3. Create `src/components/<ComponentName>/index.ts` with the re-export:
   ```ts
   export { default } from './<ComponentName>'
   ```
4. Default to a Server Component — add `"use client"` only if needed
5. Use `spacing()` from `src/utils/spacing.ts` for all margins/padding
6. For images: use `src/components/Image` (wraps next-image-export-optimizer)
7. For tech icons: use `TechBadge` component with `tech-stack-icons`

## When to add `"use client"`
- `useState`, `useEffect`, `useRef`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`, `IntersectionObserver`)
- Consuming context (`useSiteContent`, `useBreakpoints`)

## Responsive pattern
```tsx
import { useBreakpoints } from '@/hooks/useBreakpoints'
const { mobile, tablet, desktop } = useBreakpoints()
// mobile: 0-576px | tablet: 577-991px | desktop: 992+
```

## Constraints
- No CSS modules — inline styles with `spacing()` only
- No Tailwind classes
- No `<img>` — use `src/components/Image`
- No barrel exports except in the component's own `index.ts`

## Files
- `src/components/<ComponentName>/<ComponentName>.tsx` — implementation
- `src/components/<ComponentName>/index.ts` — re-export
- `src/utils/spacing.ts` — spacing utility

## Anti-Patterns
- Creating a component that duplicates an existing Kern React Kit component
- CSS module files co-located with components
- Direct `<img>` tags instead of the custom Image component
- Exporting from component internals without going through `index.ts`
