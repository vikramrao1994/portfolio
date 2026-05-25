# Deployment — Fly.io Operations Reference

## Architecture
- Platform: Fly.io, region: Frankfurt (fra)
- App: `vikram-portfolio`
- DB: SQLite on persistent volume at `/data/portfolio.db` (1GB)
- Build: Multi-stage Docker (Bun + Python), Next.js standalone output
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

## Secrets

Set runtime secrets (NOT in fly.toml):
```bash
fly secrets set ADMIN_PASSWORD="your-secure-password"
fly secrets set JWT_SECRET="$(openssl rand -base64 64)"
```

## Deploy

```bash
fly deploy              # standard deploy
fly deploy --remote-only --ha=false   # CI remote build
```

DB initialization: startup script copies DB to volume on first run; subsequent deploys preserve volume data.

## CI/CD Workflows

| Workflow | Trigger | Action |
|---|---|---|
| `pr-checks.yml` | PR open/update | Lint + build validation |
| `deploy-production.yml` | Push to `main` | Deploy + smoke tests |
| `pr-review-apps.yml.disabled` | (disabled) | Per-PR staging apps |

**GitHub secret required:** `FLY_API_TOKEN`
```bash
fly tokens create deploy --name "GitHub Actions" --app vikram-portfolio
gh secret set FLY_API_TOKEN --body "<token>"
```

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

# Inside container
ls -lh /data/portfolio.db
bun --eval "import { Database } from 'bun:sqlite'; const db = new Database('/data/portfolio.db'); console.log(db.query('SELECT COUNT(*) FROM heading').get());"

# Backup
fly ssh sftp get /data/portfolio.db ./backup-$(date +%Y%m%d).db

# Reset DB
fly ssh console
rm /data/portfolio.db
exit
fly apps restart

# Restore from backup
fly ssh sftp shell
# In SFTP shell: put ./backup.db /data/portfolio.db
fly apps restart
```

## Rollback

```bash
fly releases            # list versions
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

## Custom Domain

```bash
fly certs add yourdomain.com
fly ips list             # get IPs for DNS records
fly certs show yourdomain.com
```

DNS: `A @ <fly-ip>` and `AAAA @ <fly-ipv6>`

## Troubleshooting

| Symptom | Check |
|---|---|
| DB not found | `fly ssh console; ls /data; echo $DB_PATH` |
| Build failure | `docker build -t test .` locally; check `bun run prebuild` |
| Health check fail | `fly ssh console; curl http://localhost:3000` |
| OOM crash | Increase `memory_mb` in fly.toml |
| Volume not persisting | Verify `source` in `[mounts]` matches `fly volumes list` name |
