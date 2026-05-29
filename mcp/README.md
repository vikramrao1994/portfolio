# Application Documents MCP Server

Exposes the portfolio's cover-letter and CV pipeline as composable MCP tools.
Two transport modes: local stdio (Claude Desktop / Cursor) and remote HTTP (Fly.io).

## Architecture

```
Claude Desktop / Cursor / Remote Clients
  ↓
MCP Layer  (stdio: mcp/server.ts  |  HTTP: src/app/api/mcp/route.ts)
  ↓
Server Factory  mcp/createServer.ts  (shared, no duplication)
  ↓
Tool Handlers  mcp/tools/  (thin adapters only — no business logic)
  ↓
Service Layer  src/lib/cover-letter/  |  src/lib/cv-tailor/  (all pipeline logic lives here)
```

## Exposed Tools

| Tool | Type | Description |
|---|---|---|
| `generate_cover_letter_pdf` | one-shot | Full pipeline: extraction → scoring → retrieval → rhetoric → Claude → PDF |
| `generate_tailored_cv_pdf` | one-shot | Tailored CV PDF: extracts evidence, calls Claude to customize headline + summary only, renders PDF via Python ReportLab |
| `analyze_job_description` | deterministic | Keyword extraction (hard skills, soft skills, domains, seniority, work mode) |
| `match_candidate_evidence` | deterministic | Evidence scoring + ranking against job description |
| `generate_cover_letter_prompt` | deterministic | Builds the Claude prompt — no API call made |
| `render_cover_letter_pdf` | deterministic | Renders a cover letter JSON to PDF via Python ReportLab |

`generate_cover_letter_pdf` and `generate_tailored_cv_pdf` require `ANTHROPIC_API_KEY`. All other tools are deterministic.

## Local Mode (stdio)

No auth. Runs on the same machine as Claude Desktop / Cursor.

```bash
bun run mcp:cover-letter
# or: bun run mcp/server.ts
```

Claude Desktop config (`claude_desktop_config.json`):
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

**Prerequisites:** Bun, Python 3 + ReportLab, portfolio DB initialized (`bun db:init && bun db:import`)

### Local PDF Output

Generated PDFs are written to the OS Downloads folder (`~/Downloads/` on macOS/Linux,
`C:\Users\<user>\Downloads\` on Windows). If the Downloads folder is inaccessible,
the fallback is `generated/application-documents/` within the project directory.

Responses include `pdfPath` (the absolute path to the saved file) and `filename`.

## Remote HTTP Mode (Fly.io)

Endpoint: `https://vikram-portfolio.fly.dev/api/mcp`

Required secrets:
```bash
fly secrets set MCP_AUTH_TOKEN="$(openssl rand -base64 32)"
fly secrets set ENABLE_REMOTE_MCP="true"
fly secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

Claude Desktop remote config:
```json
{
  "mcpServers": {
    "cover-letter-remote": {
      "url": "https://vikram-portfolio.fly.dev/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_MCP_AUTH_TOKEN" }
    }
  }
}
```

Test with curl:
```bash
# List tools (authenticated)
curl -s -X POST https://vikram-portfolio.fly.dev/api/mcp \
  -H "Authorization: Bearer YOUR_MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Transport: MCP Streamable HTTP — requires `Accept: application/json, text/event-stream`. Responses are SSE-formatted.

Disable:
```bash
fly secrets set ENABLE_REMOTE_MCP="false"   # returns 404 when disabled
```

### Remote PDF Output

The remote HTTP MCP endpoint is **stateless** — no PDF is permanently stored on Fly.io.

Generated PDFs are stored temporarily in `/tmp/application-documents-downloads/` with a
10-minute TTL. The tool response contains a short-lived download URL:

```json
{
  "mode": "remote",
  "type": "application/pdf",
  "filename": "Vikram_Rao_Eterno_EN_COVER_LETTER.pdf",
  "downloadUrl": "https://www.vikramrao.me/api/mcp/download/<token>",
  "expiresAt": "2026-05-29T12:10:00.000Z"
}
```

- URLs expire after **10 minutes** and are **single-use** (deleted on first download).
- Tokens are 64-character hex strings generated with `crypto.randomBytes(32)`.
- No base64 content is returned. No Fly volume is required.
- After expiry or download, the token returns 410 Gone.

**Requires:** `PUBLIC_APP_URL` set to the app's public origin (e.g. `https://www.vikramrao.me`)
so the download URL can be constructed. Falls back to the request origin if the env var is absent.

## Authentication

| Mode | Auth |
|---|---|
| Local stdio | None — trust is implicit (local process) |
| Remote HTTP | Bearer token (`MCP_AUTH_TOKEN`), timing-safe comparison |
| Remote HTTP fallback | Existing admin JWT cookie (browser-originated requests) |

Missing `ENABLE_REMOTE_MCP=true` → 404. Missing/wrong `MCP_AUTH_TOKEN` → 401.

## Filename Convention

All generated PDFs use the format:

```
NAME_COMPANY_LANGUAGE_CV.pdf
NAME_COMPANY_LANGUAGE_COVER_LETTER.pdf
```

Examples:
```
Vikram_Rao_Eterno_EN_CV.pdf
Vikram_Rao_Eterno_EN_COVER_LETTER.pdf
Vikram_Rao_Coding_Partners_DE_COVER_LETTER.pdf
```

- Underscores, not hyphens
- Company falls back to `Application` if not provided
- Language is uppercased (`EN` / `DE`)
- Unsafe characters are sanitized; path traversal is not possible

## generate_tailored_cv_pdf

Generates a job-specific CV PDF by customising only the CV headline and executive summary.
Work experience, education, skills, dates, employers, and job titles are **never modified**.
Canonical CV data in the database is **not overwritten**.

**Example prompt:**
> "Generate a tailored English CV PDF for this Frontend Engineer job description."

**Input:**
```json
{
  "jobDescription": "We are looking for a Frontend Engineer to join our Innovation Team...",
  "language": "en",
  "companyName": "Eterno Health",
  "jobTitle": "Frontend Engineer Innovation Team"
}
```

**Local output:**
```json
{
  "mode": "local",
  "filename": "Vikram_Rao_Eterno_Health_EN_CV.pdf",
  "pdfPath": "/Users/<user>/Downloads/Vikram_Rao_Eterno_Health_EN_CV.pdf",
  "suggestion": { ... }
}
```

**Remote output:**
```json
{
  "mode": "remote",
  "type": "application/pdf",
  "filename": "Vikram_Rao_Eterno_Health_EN_CV.pdf",
  "downloadUrl": "https://www.vikramrao.me/api/mcp/download/<token>",
  "expiresAt": "2026-05-29T12:10:00.000Z",
  "suggestion": { ... }
}
```

**Security:** No DB writes occur. Claude receives pre-selected evidence, not raw DB content.
Local: file written to `~/Downloads`. Remote: in-memory only — no file persisted on Fly.io.
Filenames are sanitized; path traversal is not possible. Custom filenames are not accepted as input.

---

## Tooling Philosophy

- **Thin transport layer**: MCP tools are adapters. All business logic lives in `src/lib/cover-letter/` and `src/lib/cv-tailor/`.
- **Shared services**: `mcp/createServer.ts` is used by both stdio and HTTP transports — no duplication.
- **Deterministic orchestration**: tools call deterministic functions; `generate_cover_letter_pdf` calls Claude once with a pre-built prompt.
- **No duplicated logic**: do not add evidence scoring, retrieval, or prompt-building inside `mcp/tools/`.

## Visual Signature

Cover-letter PDFs optionally include a handwritten PNG signature fetched from Firebase Storage:

- Enabled by `ENABLE_VISUAL_SIGNATURE=true` + `SIGNATURE_IMAGE_URL=<firebase-url>` env vars
- Claude output and MCP tool inputs **never** control the signature URL — it is server-sourced only
- Python fetches directly into memory (`BytesIO`); no disk writes, no local caching
- Hostname allowlist: `firebasestorage.googleapis.com` only
- Validation: HTTPS required, PNG content-type, max 500 KB
- Graceful degradation: PDF renders without signature if fetch fails
- This is cosmetic only — **not** a cryptographic digital signature

## Security Constraints

- No arbitrary SQL, filesystem traversal, or shell-string execution
- Python spawned with args array (`spawn`), never shell-interpolated strings
- Local MCP: PDF output restricted to `~/Downloads` (fallback: `generated/application-documents/`) — no user-controlled paths
- Remote MCP: PDFs stored in `/tmp` with a 10-minute TTL; response contains a short-lived `downloadUrl` (no base64, no Fly volume)
- Custom filenames are not accepted as tool input — filename is derived from sanitized company/name fields only
- Temp JSON payload files deleted after each PDF render
- Errors truncated before logging — no stack traces or secrets in responses
- `MCP_AUTH_TOKEN` never appears in logs or responses
- Signature URL is server-controlled only — never accepted from MCP tool input
- Rate limiting: recommended 60 req/min per token (not yet implemented — see `src/app/api/mcp/route.ts`)
- DB access is read-only — no admin write operations exposed via MCP

## File Layout

```
mcp/
├── createServer.ts                 Shared server factory (stdio + HTTP)
├── server.ts                       stdio entry point
├── tools/
│   ├── generateCoverLetterPdf.ts   one-shot cover letter pipeline (Claude + PDF)
│   ├── generateTailoredCvPdf.ts    one-shot tailored CV pipeline (Claude + PDF)
│   ├── analyzeJobDescription.ts    deterministic keyword extraction
│   ├── matchCandidateEvidence.ts   deterministic evidence scoring
│   ├── generateCoverLetterPrompt.ts  prompt builder (no Claude call)
│   └── renderCoverLetterPdf.ts     Python PDF renderer adapter
├── schemas/toolSchemas.ts          Zod input schemas for all tools
└── utils/
    ├── pdf.ts                      Shared PDF rendering helpers (Downloads / server output)
    └── responses.ts                MCP response helpers

src/app/api/mcp/route.ts            Remote HTTP endpoint (Fly.io)
src/lib/cover-letter/               Cover letter pipeline logic
src/lib/cv-tailor/                  CV tailoring pipeline logic
src/lib/application-documents/
└── shared/
    ├── buildApplicationDocumentFilename.ts   Standardized PDF filename helper
    └── resolveApplicationDocumentOutputPath.ts  Output dir resolver (local vs remote)
```
