# Cover Letter MCP Server

A local MCP (Model Context Protocol) server that exposes the portfolio's cover-letter pipeline as reusable tools for Claude Desktop, Cursor, and other MCP-compatible AI clients.

## Architecture

```
Claude Desktop / Cursor
  ↓
MCP Tools  (mcp/)
  ↓
Shared Service Layer  (src/lib/cover-letter/)
  ↓
Existing App Logic  (extractors, scorers, builders, Python renderer)
```

The MCP layer is a thin wrapper. All business logic stays in `src/lib/cover-letter/`.

## Prerequisites

- [Bun](https://bun.sh) runtime
- Python 3 with ReportLab installed (`pip install reportlab`)
- Portfolio database initialised (`bun db:init && bun db:import`)

## Running the server

```bash
bun run mcp:cover-letter
```

Or directly:

```bash
bun run mcp/server.ts
```

The server communicates over stdio (no HTTP port, no auth).

## Available tools

### `generate_cover_letter_pdf` ⚡ one-shot

Runs the **complete pipeline in a single call**: keyword extraction → evidence scoring → Claude generation → ReportLab PDF render. Requires `ANTHROPIC_API_KEY` in the environment.

**Input**

| Field | Type | Required |
|---|---|---|
| `jobDescription` | string (50–20000 chars) | yes |
| `language` | `"en"` \| `"de"` | yes |
| `companyName` | string | no |
| `jobTitle` | string | no |
| `recruiterName` | string | no |
| `tone` | `"professional"` \| `"warm"` \| `"direct"` \| `"modern"` | no (default: `professional`) |

**Output**

```json
{
  "coverLetter": {
    "language": "en",
    "recipient": { "companyName": "Stripe" },
    "subject": "Application for Senior TypeScript Engineer",
    "salutation": "Dear Hiring Team,",
    "paragraphs": ["...", "...", "..."],
    "closing": "Kind regards,",
    "signatureName": "Vikram Rao"
  },
  "pdfPath": "/absolute/path/to/generated/cover-letters/cover-letter-stripe-en.pdf",
  "matchedEvidence": [
    {
      "title": "Senior Frontend Engineer – Acme Corp",
      "score": 12,
      "matchedKeywords": ["TypeScript", "React"],
      "reason": "3 tech-stack matches, 1 hard-skill summary match"
    }
  ]
}
```

---

### `analyze_job_description`

Extracts hard skills, soft skills, domains, seniority signals, work-mode preferences, and language requirements from a job posting using deterministic keyword matching.

**Input**

| Field | Type | Required |
|---|---|---|
| `jobDescription` | string (50–20000 chars) | yes |
| `language` | `"en"` \| `"de"` | yes |

**Output** — `ExtractedKeywords`

```json
{
  "hardSkills": ["TypeScript", "React"],
  "softSkills": ["communication"],
  "domains": ["fintech"],
  "seniority": ["senior"],
  "workMode": ["remote"],
  "languages": ["German"]
}
```

---

### `match_candidate_evidence`

Scores and ranks candidate portfolio evidence (work experience, skills, education, executive summary) against a job description. Uses the same deterministic algorithm as the web app.

**Input**

| Field | Type | Required |
|---|---|---|
| `jobDescription` | string (50–20000 chars) | yes |
| `language` | `"en"` \| `"de"` | yes |

**Output**

```json
{
  "evidence": [
    {
      "title": "Senior Frontend Engineer – Acme Corp",
      "type": "experience",
      "score": 12,
      "matchedKeywords": ["TypeScript", "React", "Node.js"],
      "reason": "3 tech-stack matches, 1 hard-skill summary match",
      "content": "..."
    }
  ]
}
```

---

### `generate_cover_letter_prompt`

Builds the Markdown prompt used for LLM-based cover letter generation. Includes keyword analysis, ranked evidence, candidate profile, and writing instructions. **Does not call Claude** — returns the prompt text only.

**Input**

| Field | Type | Required |
|---|---|---|
| `jobDescription` | string (50–20000 chars) | yes |
| `language` | `"en"` \| `"de"` | yes |
| `companyName` | string | no |
| `jobTitle` | string | no |

**Output**

```json
{ "markdown": "# Cover Letter Task\n\n..." }
```

---

### `render_cover_letter_pdf`

Renders a validated cover letter JSON to a PDF file using ReportLab via the Python renderer. Returns the absolute path to the generated file.

**Input** — `coverLetter` object:

| Field | Type | Required |
|---|---|---|
| `language` | `"en"` \| `"de"` | yes |
| `recipient` | object (`companyName?`, `contactName?`, `addressLines?`) | yes |
| `subject` | string (5–160 chars) | yes |
| `salutation` | string (2–120 chars) | yes |
| `paragraphs` | string[] (3–5 items, each 40–1500 chars) | yes |
| `closing` | string (2–120 chars) | yes |
| `signatureName` | string (2–120 chars) | yes |

**Output**

```json
{ "pdfPath": "/absolute/path/to/generated/cover-letters/cover-letter-acme-en.pdf" }
```

PDFs are written to `generated/cover-letters/` at the project root (gitignored).

---

## Claude Desktop integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "cover-letter": {
      "command": "bun",
      "args": ["run", "mcp/server.ts"],
      "cwd": "/absolute/path/to/portfolio"
    }
  }
}
```

Replace `/absolute/path/to/portfolio` with the actual project root path (e.g. `C:\\repos\\portfolio` on Windows).

## Example prompts

```
Analyze this job description and tell me which candidate experience matches best:
[paste job description]
```

```
Generate a cover letter prompt for a Senior TypeScript Engineer role at Stripe.
Job description: [paste]
```

```
Render this cover letter JSON as a PDF:
{ "language": "en", "recipient": { "companyName": "Stripe" }, ... }
```

## Security notes

- The server exposes **no admin write operations** — all DB access is read-only via `getSiteContent`.
- No arbitrary SQL, filesystem traversal, or shell-string execution.
- Python is invoked with `execFile`-style `spawn` (no shell interpolation).
- PDF output is restricted to `generated/cover-letters/` at the project root.
- Temporary JSON payload files are deleted after each PDF render.
- Never log sensitive content (API keys, full job descriptions).

## File layout

```
mcp/
├── server.ts                          MCP server entry point (stdio transport)
├── tools/
│   ├── generateCoverLetterPdf.ts      Tool 0: one-shot full pipeline (Claude + PDF)
│   ├── analyzeJobDescription.ts       Tool 1: deterministic keyword extraction
│   ├── matchCandidateEvidence.ts      Tool 2: deterministic candidate scoring
│   ├── generateCoverLetterPrompt.ts   Tool 3: Markdown prompt builder
│   └── renderCoverLetterPdf.ts        Tool 4: Python PDF renderer wrapper
├── schemas/
│   └── toolSchemas.ts                 Zod input schemas for all tools
├── utils/
│   ├── pdf.ts                         Shared PDF rendering utilities
│   └── responses.ts                   MCP response helpers
└── README.md
```

Business logic is **not** in this folder — it lives in `src/lib/cover-letter/`.
