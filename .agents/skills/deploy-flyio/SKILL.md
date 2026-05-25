---
name: deploy-flyio
description: Use when deploying to Fly.io, managing secrets, checking deployment status, or performing production operations.
---

# Deploy to Fly.io

## Standard deploy
```bash
fly deploy
```

## CI remote build (used in GitHub Actions)
```bash
flyctl deploy --remote-only --ha=false
```

## Secrets management
```bash
# Set runtime secrets (NEVER put in fly.toml)
fly secrets set ADMIN_PASSWORD="your-secure-password"
fly secrets set JWT_SECRET="$(openssl rand -base64 64)"

# List current secrets (values hidden)
fly secrets list
```

## Status and monitoring
```bash
fly status              # app overview
fly logs                # tail logs
fly logs --recent       # recent log dump
fly machines list       # machine details
fly volumes list        # persistent volume info
fly releases            # deployment history
```

## Rollback
```bash
fly releases            # list versions
fly releases rollback <version>
```

## SSH access
```bash
fly ssh console         # interactive shell in container
```

## Database operations via SSH
```bash
# Backup
fly ssh sftp get /data/portfolio.db ./backup-$(date +%Y%m%d).db

# Check DB
fly ssh console
ls -lh /data/portfolio.db

# Reset DB (destructive — removes all data)
fly ssh console
rm /data/portfolio.db && exit
fly apps restart
```

## Constraints
- `ADMIN_PASSWORD` and `JWT_SECRET` must be set via `fly secrets set` — never in `fly.toml`
- Volume `portfolio_data` must exist in the same region as the app (`fra`)
- `fly.toml` `[mounts].source` must match the volume name exactly
- SQLite is single-region — do not scale to multiple regions without LiteFS

## Files
- `fly.toml` — app config, region, mounts, health checks
- `Dockerfile` — multi-stage build (Bun + Python)
- `.github/workflows/deploy-production.yml` — CI deploy workflow

## Anti-Patterns
- Setting `ADMIN_PASSWORD` or `JWT_SECRET` in `fly.toml` env block
- Running `bun db:init` via SSH on the production volume
- Force-pushing to main to trigger a deploy without passing CI
