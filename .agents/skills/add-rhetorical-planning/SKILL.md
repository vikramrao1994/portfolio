---
name: add-rhetorical-planning
description: Use when adding or modifying company alignment inference, rhetorical narrative planning, paragraph goals, or writing guidelines in the cover-letter pipeline.
---

# Add Rhetorical Planning

## Architecture

```
buildCompanyAlignment(jobDescription, extractedKeywords)
  → CompanyAlignment { companyTraits[], inferredPriorities[], engineeringCultureSignals[], workModeFit }

buildRhetoricalPlan(evidencePack, companyAlignment, jobDescription, tone)
  → RhetoricalPlan {
      coreNarrative,        "delivery-focused frontend engineer with TypeScript and React delivery"
      primaryStrength,      derived from top experience item
      secondaryStrength,    derived from second-best evidence item
      companyAlignment,     short human-readable summary
      toneProfile,          { style, evidenceDensity, sentenceStyle }
      paragraphGoals[],     { paragraph, goal, emphasis, evidenceIds[] }
      writingGuidelines[]   injected into Claude prompt
    }
```

The rhetorical plan is built deterministically before Claude is called. Claude receives the plan as part of the prompt — it does NOT decide narrative structure.

## Key files

| File | Purpose |
|---|---|
| `src/lib/cover-letter/rhetoric/buildCompanyAlignment.ts` | Infers company traits from JD keywords |
| `src/lib/cover-letter/rhetoric/buildRhetoricalPlan.ts` | Builds full narrative plan from evidence + alignment |
| `src/lib/cover-letter/rhetoric/buildNarrativeGuidelines.ts` | Formats plan into Claude-readable guidelines |
| `src/lib/cover-letter/rhetoric/types.ts` | `RhetoricalPlan`, `CompanyAlignment`, `Tone` |
| `src/lib/cover-letter/rhetoric/constants.ts` | Trait/signal keyword lists |
| `src/lib/cover-letter/buildClaudeJsonPrompt.ts` | Injects rhetorical plan into Claude prompt |

## Tone profiles

| Tone | Behavior |
|---|---|
| `professional` | Formal, no contractions, measured confidence |
| `direct` | Lead with strongest point, short declarative sentences |
| `warm` | Slightly personal, references company work, still concise |
| `modern` | Conversational-professional, contractions OK |

Evidence density (derived from pack size): ≤3 items → high density, ≤6 → medium, >6 → low.

## Paragraph goal structure

3 paragraphs, each with `goal`, `emphasis`, and `evidenceIds[]`:

| Paragraph | Default goal |
|---|---|
| 1 | Core competency + delivery track record (top experience items) |
| 2 | Technical depth + skills alignment (non-experience, non-summary items) |
| 3 | Company culture alignment (ownership, collaboration, or engineering values) |

## Adding a new company trait signal

1. Add the keyword/pattern to `src/lib/cover-letter/rhetoric/constants.ts`
2. Detect it in `buildCompanyAlignment.ts` and add to `companyTraits[]` or `engineeringCultureSignals[]`
3. Add a corresponding writing guideline in `buildWritingGuidelines()` inside `buildRhetoricalPlan.ts`
4. Verify the guideline appears in the Claude prompt by inspecting `generateCoverLetterPrompt` MCP tool output

## Constraints

- Rhetorical planning must remain Claude-free — no API calls in this layer
- `buildRhetoricalPlan` is called before `generateCoverLetterWithClaude` — order is enforced in `orchestrateCoverLetterGeneration.ts`
- Writing guidelines are injected into the prompt, not enforced post-generation — keep them clear and specific
- Paragraph goals must reference `evidenceIds` from the evidence pack — Claude uses these as anchors
- Do not add more than 3 paragraph goals — cover letters have exactly 3 body paragraphs
