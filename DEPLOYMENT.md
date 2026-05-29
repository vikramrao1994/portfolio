# Deployment — Fly.io Operations Reference

## Architecture

- Platform: Fly.io, region: Frankfurt (fra)
- App: `vikram-portfolio`
- DB: SQLite on persistent volume at `/data/portfolio.db` (1GB)
- Build: Multi-stage Docker (Bun + Python 3), Next.js standalone output
- CI/CD: GitHub Actions (`.github/workflows/`)

## Initial Setup

```bash
fly auth login
fly apps create vikram-portfolio
fly volumes create portfolio_data --region fra --size 1
```

Verify `fly.toml`:
```toml
app = 'vikram-portfolio'
primary_region = 'fra'

[mounts]
  source = 'portfolio_data'   # must match volume name
  destination = '/data'
```

## Required Secrets

Set all secrets via `fly secrets set` — never in `fly.toml`.

| Secret | Required | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | yes | Admin dashboard password |
| `JWT_SECRET` | yes | `openssl rand -base64 64` |
| `ANTHROPIC_API_KEY` | for AI tools | Claude API key (`sk-ant-...`) |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-haiku-4-5-20251001` |
| `MCP_AUTH_TOKEN` | for remote MCP | `openssl rand -base64 32` |
| `ENABLE_REMOTE_MCP` | for remote MCP | Must be `"true"` to activate — absent → 404 |
| `ENABLE_VISUAL_SIGNATURE` | no | Set to `"true"` to embed visual signature in cover-letter PDFs |
| `SIGNATURE_IMAGE_URL` | for visual signature | Full HTTPS URL to the PNG signature image in Firebase Storage |

```bash
fly secrets set ADMIN_PASSWORD="your-secure-password"
fly secrets set JWT_SECRET="$(openssl rand -base64 64)"
fly secrets set ANTHROPIC_API_KEY="sk-ant-..."
# Remote MCP (enable only when needed):
fly secrets set MCP_AUTH_TOKEN="$(openssl rand -base64 32)"
fly secrets set ENABLE_REMOTE_MCP="true"
# Visual signature (optional):
fly secrets set ENABLE_VISUAL_SIGNATURE="true"
fly secrets set SIGNATURE_IMAGE_URL="https://firebasestorage.googleapis.com/v0/b/..."
```

## Deployment

```bash
fly deploy                              # standard deploy
fly deploy --remote-only --ha=false    # CI remote build
```

DB initialization: startup script copies DB to volume on first run; subsequent deploys preserve volume data.

## Remote MCP

The portfolio exposes a secure HTTP MCP endpoint at `/api/mcp`.

- Disabled by default (`ENABLE_REMOTE_MCP` unset or not `"true"`) — returns 404
- Auth: Bearer token (`MCP_AUTH_TOKEN`) checked with timing-safe comparison
- Fallback: admin JWT cookie for browser-originated requests
- Transport: MCP Streamable HTTP, SSE-formatted responses
- No arbitrary SQL, filesystem traversal, or shell-string execution
- Python invoked with `spawn` (args array, no shell interpolation)
- Remote MCP is stateless — PDFs are returned as base64 content; no PDF files are written to disk on Fly.io
- Temp JSON/PDF files in `/tmp` are deleted immediately after each render

Disable without removing secret:
```bash
fly secrets set ENABLE_REMOTE_MCP="false"
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

## PDF Rendering

Both CV and cover-letter PDFs are generated via Python ReportLab:

- Python 3 + ReportLab must be present in the Docker image (via `requirements.txt`)
- CV: `POST /api/cv?lang=en|de` — accepts SiteSchema JSON body, spawns `scripts/cv/main.py`
- Cover-letter: MCP `render_cover_letter_pdf` tool — spawns `scripts/cover-letter/main.py`
- Both renderers write to a temp directory, read the buffer, then clean up — temp files never persist
- Admin HTTP routes: buffer streamed directly to browser (`Content-Disposition: attachment`)
- Local stdio MCP: buffer written to `~/Downloads/`; response includes `pdfPath`
- Remote HTTP MCP: buffer returned as base64 in tool response; no file stored on Fly.io
- Rendering is deterministic — no AI-controlled layout

### Visual Signature

Cover-letter PDFs support an optional handwritten PNG signature fetched from Firebase Storage:

- Controlled entirely by `ENABLE_VISUAL_SIGNATURE` and `SIGNATURE_IMAGE_URL` env vars
- Claude output, request body, and MCP input **never** control the signature URL
- Python fetches the image directly into memory (`BytesIO`) — no disk writes, no caching
- Hostname allowlist enforced (`firebasestorage.googleapis.com` only)
- HTTPS required, PNG content-type validated, size capped at 500 KB
- If the image fetch fails for any reason, the PDF is still generated (signature omitted gracefully)
- This is a **visual/cosmetic** signature only — not a cryptographic digital signature

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `pr-checks.yml` | PR open/update | Lint + build validation |
| `deploy-production.yml` | Push to `main` | Deploy + smoke tests |

**GitHub secret required:** `FLY_API_TOKEN`
```bash
fly tokens create deploy --name "GitHub Actions" --app vikram-portfolio
gh secret set FLY_API_TOKEN --body "<token>"
```

## Security Checklist

- [ ] `ADMIN_PASSWORD` is a strong unique value (not reused)
- [ ] `JWT_SECRET` is 64+ random bytes
- [ ] `MCP_AUTH_TOKEN` is set to a random 32+ byte value
- [ ] `ENABLE_REMOTE_MCP=true` only when actively using remote MCP
- [ ] No secrets committed to git or `fly.toml`
- [ ] `MCP_AUTH_TOKEN` rotated after any suspected exposure
- [ ] `fly logs` reviewed for unexpected `/api/mcp` hits
- [ ] Rate limiting implemented before sharing MCP token with untrusted parties

## Monitoring

```bash
fly status              # app overview
fly logs                # tail logs
fly logs --recent       # recent logs
fly machines list       # machine details
fly volumes list        # volume status
fly releases            # release history
```

## Database Management

```bash
# SSH access
fly ssh console

# Inside container — check DB
bun --eval "import { Database } from 'bun:sqlite'; const db = new Database('/data/portfolio.db'); console.log(db.query('SELECT COUNT(*) FROM heading').get());"

# Backup
fly ssh sftp get /data/portfolio.db ./backup-$(date +%Y%m%d).db

# Reset DB
fly ssh console && rm /data/portfolio.db && exit && fly apps restart

# Restore from backup (in SFTP shell)
fly ssh sftp shell    # then: put ./backup.db /data/portfolio.db
fly apps restart
```

## Rollback

```bash
fly releases                    # list versions
fly releases rollback <version>
```

## Scaling

```toml
# fly.toml
[[vm]]
  cpu_kind = 'shared'
  cpus = 1
  memory_mb = 512

[http_service]
  auto_stop_machines = true
  auto_start_machines = true
```

Note: SQLite is single-region. For multi-region, use LiteFS or migrate to PostgreSQL.

## Troubleshooting

| Symptom | Check |
|---|---|
| DB not found | `fly ssh console; ls /data; echo $DB_PATH` |
| Build failure | `docker build -t test .` locally; check `bun run prebuild` |
| Health check fail | `fly ssh console; curl http://localhost:3000` |
| OOM crash | Increase `memory_mb` in `fly.toml` |
| Volume not persisting | Verify `source` in `[mounts]` matches `fly volumes list` name |
| PDF generation fails | Verify `python3` and ReportLab in container: `fly ssh console; python3 -c "import reportlab"` |
| Signature missing from PDF | Verify `ENABLE_VISUAL_SIGNATURE=true` and `SIGNATURE_IMAGE_URL` are set; check `fly logs` for `[signature]` lines |
| Signature fetch rejected | URL must be HTTPS and hosted on `firebasestorage.googleapis.com`; PNG only; max 500 KB |
| MCP returns 404 | Check `ENABLE_REMOTE_MCP=true` is set via `fly secrets list` |
| MCP returns 401 | Verify `MCP_AUTH_TOKEN` matches the Bearer token in the client config |
