# Cover Letter MCP Server

A local MCP (Model Context Protocol) server that exposes the portfolio's cover-letter pipeline as reusable tools for Claude Desktop, Cursor, and other MCP-compatible AI clients.

Two deployment modes are available:
- **Local stdio** — runs on your machine, used by Claude Desktop / Cursor
- **Remote HTTP** — deployed inside the Fly.io portfolio app at `/api/mcp`

## Architecture

```
Claude Desktop / Cursor / Remote Clients
  ↓
MCP Layer (stdio: mcp/server.ts  |  HTTP: src/app/api/mcp/route.ts)
  ↓
Server Factory  mcp/createServer.ts  (shared, no duplication)
  ↓
Tool Handlers   mcp/tools/
  ↓
Service Layer   src/lib/cover-letter/  (all business logic lives here)
```

## Prerequisites

- [Bun](https://bun.sh) runtime
- Python 3 with ReportLab installed (`pip install reportlab`)
- Portfolio database initialised (`bun db:init && bun db:import`)

---

## Local stdio server

Used by Claude Desktop and Cursor running on the same machine. No auth, no HTTP.

### Running

```bash
bun run mcp:cover-letter
# or:
bun run mcp/server.ts
```

### Claude Desktop configuration

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

Replace `/absolute/path/to/portfolio` with the actual project root (e.g. `C:\\repos\\portfolio` on Windows).

---

## Remote HTTP server (Fly.io)

Exposed at `https://vikram-portfolio.fly.dev/api/mcp`. Requires authentication.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `ENABLE_REMOTE_MCP` | yes | Must be `"true"` to activate the endpoint. Missing → 404. |
| `MCP_AUTH_TOKEN` | yes | Secret Bearer token for AI client auth. Generate with `openssl rand -base64 32`. |
| `ANTHROPIC_API_KEY` | yes (for `generate_cover_letter_pdf`) | Claude API key |

### Setting Fly secrets

```bash
fly secrets set MCP_AUTH_TOKEN="$(openssl rand -base64 32)"
fly secrets set ENABLE_REMOTE_MCP="true"
fly secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

### Connecting from Claude Desktop (remote)

```json
{
  "mcpServers": {
    "cover-letter-remote": {
      "url": "https://vikram-portfolio.fly.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN"
      }
    }
  }
}
```

### Testing with curl

The MCP Streamable HTTP transport requires `Accept: application/json, text/event-stream`.
Responses are SSE-formatted (`event: message\ndata: {...}`).

```bash
# No auth → 401
curl -s -X POST https://vikram-portfolio.fly.dev/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# List tools (authenticated)
curl -s -X POST https://vikram-portfolio.fly.dev/api/mcp \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Call analyze_job_description
curl -s -X POST https://vikram-portfolio.fly.dev/api/mcp \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyze_job_description",
      "arguments": {
        "jobDescription": "We are looking for a senior TypeScript and React developer with Node.js experience...",
        "language": "en"
      }
    }
  }'
```

### Disabling remote MCP

To disable without removing the secret:

```bash
fly secrets set ENABLE_REMOTE_MCP="false"
```

The endpoint returns 404 when disabled.

---

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

PDFs are written to `generated/cover-letters/` at the project root (gitignored). On Fly.io, this path is inside the container — use `generate_cover_letter_pdf` which returns the full content instead.

---

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
Generate a complete cover letter PDF for this role at Acme Corp:
[paste job description]
```

---

## Security notes

### Local stdio
- No auth required — trust is implicit (local process)
- Exposes no admin write operations
- All DB access is read-only via `getSiteContent`

### Remote HTTP
- Auth is mandatory — endpoint returns 404 when `ENABLE_REMOTE_MCP !== "true"`
- Bearer token checked with timing-safe comparison (`crypto.timingSafeEqual`)
- Fallback: existing admin JWT cookie (for browser-originated requests)
- No arbitrary SQL, filesystem traversal, or shell-string execution
- Python invoked with `spawn` (no shell interpolation, args array, not string)
- PDF output restricted to `generated/cover-letters/` — no user-controlled paths
- Temporary JSON payload files deleted after each PDF render
- Errors are truncated before logging — no stack traces, no secrets in responses
- `MCP_AUTH_TOKEN` never appears in logs or responses
- Rate limiting: TODO (in-memory or Redis, 60 req/min per token recommended)

---

## File layout

```
mcp/
├── createServer.ts                    Shared server factory (used by both transports)
├── server.ts                          stdio entry point (local Claude Desktop)
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

src/app/api/mcp/
└── route.ts                           Remote HTTP MCP endpoint (Fly.io)
```

Business logic is **not** in `mcp/` — it lives in `src/lib/cover-letter/`.
