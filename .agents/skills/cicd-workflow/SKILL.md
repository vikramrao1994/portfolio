---
name: cicd-workflow
description: Use when configuring, debugging, or modifying GitHub Actions CI/CD workflows for PR checks or production deployments.
---

# CI/CD Workflow

## Workflows

| File | Trigger | Purpose |
|---|---|---|
| `pr-checks.yml` | PR open/update | Lint + build validation, cancels old runs |
| `deploy-production.yml` | Push to `main` | Deploy to Fly.io + smoke tests, no concurrency |
| `pr-review-apps.yml.disabled` | (disabled) | Per-PR staging apps |

## Setup: GitHub secret
```bash
# Generate Fly.io deploy token
fly tokens create deploy --name "GitHub Actions" --app vikram-portfolio

# Add to GitHub
gh secret set FLY_API_TOKEN --body "<token>"
```

## PR checks flow
1. `bun install` (cached by `bun.lockb` hash)
2. `bun run lint` (Biome)
3. Validate `Dockerfile` and `fly.toml`
4. `bun run build`

## Production deploy flow
1. Setup flyctl (pinned version)
2. `flyctl deploy --remote-only --ha=false`
3. Verify deployment status
4. Smoke test: `curl https://vikram-portfolio.fly.dev`

## Enable PR review apps
```bash
mv .github/workflows/pr-review-apps.yml.disabled .github/workflows/pr-review-apps.yml
# Edit APP_NAME_PREFIX and FLY_REGION in the workflow file
git add .github/workflows/pr-review-apps.yml && git commit -m "Enable PR review apps"
```

## Debugging failed workflows
```bash
gh run list              # list recent runs
gh run view <run-id>     # view specific run
gh run watch             # watch current run live

# After deploy failure
fly status
fly logs --recent
fly ssh console
```

## Concurrency rules
- Production: `cancel-in-progress: false` (queues, never cancels)
- PR checks: `cancel-in-progress: true` (cancels stale runs for same PR)

## Constraints
- Never skip `pr-checks` as a required status check on `main`
- Flyctl version in workflow should be periodically updated and tested
- `FLY_API_TOKEN` must be a deploy token (app-scoped), not a personal auth token
- Never commit secrets to workflow files — use GitHub encrypted secrets

## Files
- `.github/workflows/pr-checks.yml`
- `.github/workflows/deploy-production.yml`
- `.github/workflows/pr-review-apps.yml.disabled`

## Anti-Patterns
- Hardcoding secrets in workflow YAML
- Using personal Fly.io auth tokens instead of deploy tokens
- Bypassing PR checks by pushing directly to `main`
- Using `--ha=true` for single-region SQLite deployments
