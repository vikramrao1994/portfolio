# Deployment Guide - Fly.io with Docker

This guide walks you through deploying your portfolio application to Fly.io using Docker containers.

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Fly CLI**: Install flyctl
   ```bash
   # macOS
   brew install flyctl

   # Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```
3. **Docker**: Install Docker Desktop or Docker Engine
4. **Bun**: Required for local development (already in use)

## Architecture Overview

### Stack Components
- **Runtime**: Bun (JavaScript/TypeScript)
- **Framework**: Next.js 16 (Standalone build)
- **Database**: SQLite on persistent volume
- **PDF Generation**: Python 3 with ReportLab
- **Container**: Multi-stage Docker build

### Volume Strategy
- SQLite database is stored on a persistent Fly.io volume at `/data`
- Initial database is built during Docker image creation
- On first startup, the built database is copied to the volume
- Subsequent deployments preserve the volume data

## Initial Setup

### 1. Authenticate with Fly.io

```bash
fly auth login
```

### 2. Configure Your App

Edit [fly.toml](fly.toml) and update:

```toml
app = 'your-unique-app-name'  # Choose a unique name
primary_region = 'iad'         # Choose your region (iad=US East, fra=Frankfurt, syd=Sydney)
```

Available regions: Run `fly platform regions` to see all options

### 3. Create the Fly.io App

```bash
fly apps create your-unique-app-name
```

### 4. Create a Persistent Volume

The database needs persistent storage:

```bash
fly volumes create portfolio_data \
  --region iad \
  --size 1
```

**Important**: The volume name (`portfolio_data`) must match the `source` in [fly.toml](fly.toml)

## Environment Variables

### Build-time Variables

If you need to set environment variables during the build (e.g., `NEXT_PUBLIC_*` vars), use build secrets:

```bash
fly secrets set NEXT_PUBLIC_API_URL=https://your-api.com
```

### Runtime Variables

Runtime environment variables are defined in [fly.toml](fly.toml):

```toml
[env]
  NODE_ENV = 'production'
  PORT = '3000'
  DB_PATH = '/data/portfolio.db'
```

To add more runtime secrets:

```bash
fly secrets set SECRET_KEY=your-secret-value
```

## Deployment

### First Deployment

```bash
# Deploy the application
fly deploy

# Monitor the deployment
fly logs
```

The deployment process:
1. Builds the Docker image with all dependencies
2. Runs `prebuild` script (fetches data, initializes DB)
3. Builds Next.js in standalone mode
4. Pushes image to Fly.io registry
5. Creates machine with volume mounted
6. Starts app with startup script

### Subsequent Deployments

```bash
fly deploy
```

**Note**: The persistent volume preserves your database across deployments. The startup script only initializes the database if it doesn't exist.

## Database Management

### Accessing the Database

SSH into your running machine:

```bash
fly ssh console
```

Inside the container:

```bash
# Check if database exists
ls -lh /data/portfolio.db

# View database size
du -h /data/portfolio.db

# Connect to database (if bun is available)
bun --eval "import { Database } from 'bun:sqlite'; const db = new Database('/data/portfolio.db'); console.log(db.query('SELECT COUNT(*) FROM heading').get());"
```

### Resetting the Database

If you need to reset the database:

```bash
# SSH into the machine
fly ssh console

# Remove the existing database
rm /data/portfolio.db

# Restart the app to reinitialize
exit
fly apps restart
```

### Backing Up the Database

```bash
# Create a backup using fly sftp
fly ssh sftp get /data/portfolio.db ./backup-$(date +%Y%m%d).db
```

### Restoring a Database

```bash
# Upload a database backup
fly ssh sftp shell

# In SFTP shell:
put ./backup.db /data/portfolio.db
exit

# Restart the app
fly apps restart
```

## Scaling

### Vertical Scaling (More Resources)

Edit [fly.toml](fly.toml):

```toml
[[vm]]
  cpu_kind = 'shared'
  cpus = 2              # Increase CPUs
  memory_mb = 1024      # Increase memory
```

Then redeploy:

```bash
fly deploy
```

### Regional Scaling

**Important**: SQLite is single-region by default. For multi-region:

1. Use [LiteFS](https://fly.io/docs/litefs/) for replication (beta)
2. Or migrate to a distributed database (PostgreSQL, etc.)

To add more machines in the same region:

```bash
fly scale count 2 --region iad
```

## Monitoring

### View Logs

```bash
# Tail logs
fly logs

# View recent logs
fly logs --recent

# Follow specific app
fly logs -a your-app-name
```

### Check App Status

```bash
# App overview
fly status

# Machine details
fly machines list

# Volume status
fly volumes list
```

### Metrics Dashboard

Visit your app's dashboard:

```bash
fly dashboard
```

Or go to: `https://fly.io/apps/your-app-name`

## Troubleshooting

### Database Not Found

If you see "Database not found" errors:

1. Check if volume is mounted:
   ```bash
   fly ssh console
   ls -la /data
   ```

2. Verify DB_PATH environment variable:
   ```bash
   fly ssh console
   echo $DB_PATH
   ```

3. Check startup logs:
   ```bash
   fly logs | grep -i database
   ```

### Build Failures

If Docker build fails:

1. Test build locally:
   ```bash
   docker build -t portfolio-test .
   ```

2. Check if prebuild script works:
   ```bash
   bun run prebuild
   ```

3. Verify Python dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

### Health Check Failures

If health checks fail:

1. Check if app is responding:
   ```bash
   fly ssh console
   curl http://localhost:3000
   ```

2. View detailed health check logs:
   ```bash
   fly logs | grep -i health
   ```

3. Temporarily disable health checks in [fly.toml](fly.toml) to debug

### Out of Memory

If the app crashes due to memory:

1. Increase memory in [fly.toml](fly.toml):
   ```toml
   memory_mb = 1024  # or higher
   ```

2. Check memory usage:
   ```bash
   fly ssh console
   free -h
   ```

### Volume Issues

If volume isn't persisting data:

1. Verify volume is mounted:
   ```bash
   fly volumes list
   ```

2. Check volume configuration in [fly.toml](fly.toml):
   ```toml
   [mounts]
     source = 'portfolio_data'  # Must match volume name
     destination = '/data'
   ```

3. Ensure volume is in the same region as your app

## Custom Domain

### Add a Domain

```bash
# Add your domain
fly certs add yourdomain.com

# Add www subdomain
fly certs add www.yourdomain.com
```

### Configure DNS

Add these records to your DNS provider:

```
A     @     [your-fly-ip]
AAAA  @     [your-fly-ipv6]
A     www   [your-fly-ip]
AAAA  www   [your-fly-ipv6]
```

Get your IPs:

```bash
fly ips list
```

### Verify Certificate

```bash
fly certs show yourdomain.com
```

## Cost Optimization

### Free Tier Resources

Fly.io free tier includes:
- 3 shared-cpu-1x machines (256MB RAM each)
- 160GB outbound data transfer
- Automatic SSL certificates

### Reduce Costs

1. **Use Smaller Machines**:
   ```toml
   memory_mb = 256  # Minimum for Next.js
   ```

2. **Auto-stop Machines**:
   ```toml
   [http_service]
     auto_stop_machines = true
     auto_start_machines = true
   ```

3. **Monitor Volume Size**:
   ```bash
   fly volumes list
   ```

## CI/CD Integration

This project includes a complete GitHub Actions CI/CD pipeline for automated deployments to Fly.io.

### Workflows Overview

The repository includes three GitHub Actions workflows:

1. **[pr-checks.yml](.github/workflows/pr-checks.yml)** - Runs on every PR
   - Lints code with Biome
   - Validates Dockerfile and fly.toml
   - Runs build checks
   - Ensures code quality before merging

2. **[deploy-production.yml](.github/workflows/deploy-production.yml)** - Deploys to production
   - Triggers on push to `main` branch
   - Can be manually triggered from GitHub UI
   - Deploys to Fly.io with remote build
   - Runs smoke tests after deployment
   - Prevents concurrent deployments

3. **[pr-review-apps.yml.disabled](.github/workflows/pr-review-apps.yml.disabled)** - Optional PR staging environments
   - Creates temporary Fly.io apps for each PR
   - Each PR gets a unique URL (e.g., `portfolio-pr-123.fly.dev`)
   - Automatically destroys apps when PR is closed
   - Disabled by default (rename to `.yml` to enable)

### Initial Setup

#### 1. Generate Fly.io Deploy Token

Create a deploy token with access to your app:

```bash
# Generate a deploy token (recommended for single app)
fly tokens create deploy --name "GitHub Actions" --app your-app-name

# OR use an organization token for all apps in your org
fly tokens create org --name "GitHub Actions"
```

**Important**: Store the token securely - it won't be shown again!

#### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FLY_API_TOKEN`
5. Value: Paste the token from step 1
6. Click **Add secret**

Alternatively, use GitHub CLI:

```bash
gh secret set FLY_API_TOKEN --body "your-fly-token-here"
```

#### 3. Update Workflow Configuration

Edit [.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml):

```yaml
environment:
  name: production
  url: https://your-actual-app-name.fly.dev # Update this
```

And update the smoke test URL:

```yaml
APP_URL="https://your-actual-app-name.fly.dev" # Update this
```

#### 4. (Optional) Create GitHub Environment

For additional protection, create a `production` environment:

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it `production`
4. Add protection rules (optional):
   - Required reviewers
   - Wait timer
   - Deployment branches (main only)

### Workflow Behavior

#### Pull Request Flow

```mermaid
PR opened/updated
    ↓
Run pr-checks.yml
    ↓
Lint code
    ↓
Validate configs
    ↓
Run build
    ↓
✅ PR checks pass
```

#### Production Deployment Flow

```mermaid
Push to main
    ↓
Run deploy-production.yml
    ↓
Setup Flyctl
    ↓
Deploy to Fly.io (remote build)
    ↓
Verify deployment status
    ↓
Run smoke tests
    ↓
✅ Production deployed
```

### Manual Deployment

You can manually trigger a deployment from GitHub:

1. Go to **Actions** tab
2. Select **Deploy to Fly.io Production** workflow
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Click **Run workflow**

### Enabling PR Review Apps

To enable automatic staging environments for PRs:

#### 1. Rename the workflow file

```bash
mv .github/workflows/pr-review-apps.yml.disabled .github/workflows/pr-review-apps.yml
```

#### 2. Update configuration

Edit the workflow and set your app name prefix:

```yaml
env:
  APP_NAME_PREFIX: "your-portfolio-pr" # Change this
  FLY_REGION: "iad" # Your preferred region
```

#### 3. Commit and push

```bash
git add .github/workflows/pr-review-apps.yml
git commit -m "Enable PR review apps"
git push
```

Now, each PR will get its own isolated Fly.io app with a unique URL!

### CI/CD Best Practices

#### 1. Pin Flyctl Version

The production workflow pins flyctl to a specific version:

```yaml
uses: superfly/flyctl-actions/setup-flyctl@master
with:
  version: 0.3.48 # Update periodically
```

Update this periodically after testing new versions.

#### 2. Use Remote Builds

The workflows use `--remote-only` to build on Fly.io's infrastructure:

```bash
flyctl deploy --remote-only --ha=false
```

Benefits:
- Faster builds on Fly.io's optimized builders
- No need for Docker in CI
- Consistent build environment

#### 3. Concurrency Controls

Production deployments prevent concurrent runs:

```yaml
concurrency:
  group: production-deployment
  cancel-in-progress: false # Wait for current deployment
```

PR checks cancel old runs for the same PR:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # Cancel old checks
```

#### 4. Caching

The PR check workflow uses caching to speed up builds:

```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
```

### Monitoring CI/CD

#### View Workflow Runs

```bash
# Using GitHub CLI
gh run list
gh run view <run-id>
gh run watch # Watch current run
```

#### Check Deployment Status

After a workflow completes:

```bash
fly status
fly logs --recent
```

#### Debugging Failed Workflows

1. Check the workflow run in GitHub Actions
2. View detailed logs for each step
3. SSH into Fly.io machine to debug:
   ```bash
   fly ssh console
   ```

### Security Considerations

#### Token Permissions

- Use **deploy tokens** (app-specific) instead of personal auth tokens
- Rotate tokens periodically
- Never commit tokens to the repository
- Use GitHub's encrypted secrets

#### Environment Secrets

For sensitive environment variables:

```bash
# Set via Fly.io CLI (not in fly.toml)
fly secrets set DATABASE_URL=postgres://...
fly secrets set API_KEY=secret-value

# Or via GitHub Actions
fly secrets set SECRET=${{ secrets.MY_SECRET }}
```

#### Branch Protection

Recommended branch protection rules for `main`:

1. Require PR reviews
2. Require status checks (pr-checks)
3. No direct pushes to main
4. Require linear history

### Advanced: Multi-Environment Setup

For staging + production environments:

#### 1. Create staging app

```bash
fly apps create your-app-staging
fly volumes create portfolio_data --app your-app-staging --region iad --size 1
```

#### 2. Create additional workflow

Copy `deploy-production.yml` → `deploy-staging.yml`:

```yaml
on:
  push:
    branches: [develop] # Deploy from develop branch

environment:
  name: staging
  url: https://your-app-staging.fly.dev
```

#### 3. Update fly.toml per environment

Use `--config` flag to specify different configs:

```bash
flyctl deploy --config fly.staging.toml --app your-app-staging
```

### Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify deployment
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Portfolio deployed to production'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Cost Management

Review apps can increase costs. To limit:

1. Set a TTL for review apps (auto-destroy after N days)
2. Limit concurrent review apps
3. Use smaller machine sizes for staging
4. Monitor usage in Fly.io dashboard

### Rollback Strategy

If a deployment fails:

```bash
# View deployment history
fly releases

# Rollback to previous version
fly releases rollback <version>
```

Or redeploy a previous commit via GitHub Actions.

## Additional Resources

- [Fly.io Next.js Documentation](https://fly.io/docs/js/frameworks/nextjs/)
- [Fly.io SQLite Guide](https://fly.io/docs/rails/advanced-guides/sqlite3/)
- [Fly.io Volumes Documentation](https://fly.io/docs/volumes/overview/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)

## Support

- Fly.io Community: https://community.fly.io
- Documentation: https://fly.io/docs
- Status Page: https://status.fly.io
