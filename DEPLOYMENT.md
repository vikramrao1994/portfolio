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

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Add `FLY_API_TOKEN` to GitHub secrets:

```bash
fly tokens create deploy
# Add token to GitHub repo secrets
```

## Additional Resources

- [Fly.io Next.js Documentation](https://fly.io/docs/js/frameworks/nextjs/)
- [Fly.io SQLite Guide](https://fly.io/docs/rails/advanced-guides/sqlite3/)
- [Fly.io Volumes Documentation](https://fly.io/docs/volumes/overview/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)

## Support

- Fly.io Community: https://community.fly.io
- Documentation: https://fly.io/docs
- Status Page: https://status.fly.io
