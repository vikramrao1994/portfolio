# Portfolio Website

A modern personal portfolio built with Next.js, TypeScript, and deployed on Fly.io. Features a full-stack architecture with SQLite database, internationalization support, and automated CI/CD.

**Live Site**: [https://vikram-portfolio.fly.dev/](https://vikram-portfolio.fly.dev/)

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Bun](https://bun.sh)
- **UI Library**: [Kern React Kit](https://www.npmjs.com/package/@publicplan/kern-react-kit)
- **3D Graphics**: [Three.js](https://threejs.org/) with [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: SCSS modules
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

### Backend & Database
- **Database**: SQLite with Bun's native driver
- **Validation**: [Zod](https://zod.dev/)
- **PDF Generation**: Python with ReportLab

### Infrastructure
- **Hosting**: [Fly.io](https://fly.io)
- **Container**: Docker (multi-stage build)
- **Storage**: Persistent volume for SQLite database
- **CI/CD**: GitHub Actions with automated deployments

## Features

- Responsive design optimized for desktop and mobile
- Multilingual support with internationalization
- Server-side rendering with Next.js App Router
- Persistent SQLite database on Fly.io volume
- Automated PDF CV generation
- Contact form with server-side validation
- 3D interactive elements with Three.js
- Automated deployments via GitHub Actions
- Health checks and monitoring

## Project Structure

```
portfolio/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── server/           # Server-side logic and API routes
│   ├── lib/              # Shared utilities
│   ├── i18n/             # Internationalization configs
│   └── styles/           # Global styles and SCSS modules
├── scripts/
│   ├── db/               # Database initialization scripts
│   ├── cv/               # Python CV generation scripts
│   └── prefetch.js       # Data fetching script
├── db/                   # SQLite database schemas
├── data/                 # Local database storage (dev)
├── public/               # Static assets
├── .github/workflows/    # CI/CD workflows
├── Dockerfile            # Multi-stage Docker build
├── fly.toml              # Fly.io configuration
└── DEPLOYMENT.md         # Detailed deployment guide

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Python 3](https://www.python.org/) (for CV generation)
- [Docker](https://www.docker.com/) (optional, for local testing)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. Install dependencies
   ```bash
   bun install
   ```

3. Install Python dependencies
   ```bash
   pip3 install -r requirements.txt
   ```

4. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database
   ```bash
   bun run db:init
   bun run db:import
   ```

### Development

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build Scripts

- `bun run prebuild` - Fetch data, initialize database, import data
- `bun run build` - Build Next.js for production
- `bun run start` - Start production server
- `bun run lint` - Lint code with Biome
- `bun run format` - Format code with Biome
- `bun run check` - Check code quality
- `bun run fix` - Auto-fix code issues

## Database

The application uses SQLite for data persistence:

- **Development**: Local database at `./data/portfolio.db`
- **Production**: Persistent volume at `/data/portfolio.db` on Fly.io

Database scripts:
- `bun run db:init` - Initialize database schema
- `bun run db:import` - Import data from JSON sources

## Deployment

The project is deployed on Fly.io with automated CI/CD via GitHub Actions.

### Quick Deploy

```bash
fly deploy
```

### Detailed Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive documentation including:
- Initial Fly.io setup
- Volume configuration for database persistence
- Environment variable management
- CI/CD pipeline setup with GitHub Actions
- Monitoring and troubleshooting
- Custom domain configuration
- Multi-environment setup (staging/production)

### CI/CD Workflows

1. **[pr-checks.yml](.github/workflows/pr-checks.yml)** - Runs on every PR
   - Code linting
   - Build validation
   - Configuration checks

2. **[deploy-production.yml](.github/workflows/deploy-production.yml)** - Production deployments
   - Triggers on push to `main`
   - Automated deployment to Fly.io
   - Post-deployment smoke tests

3. **[pr-review-apps.yml.disabled](.github/workflows/pr-review-apps.yml.disabled)** - Optional PR preview environments

## Architecture

### Docker Build

Multi-stage build process:
1. **Base**: Python + Bun runtime
2. **Dependencies**: Install Node and Python packages
3. **Build**: Run prebuild scripts, initialize database, build Next.js
4. **Production**: Minimal image with standalone Next.js output

### Database Strategy

- SQLite database is built during Docker image creation
- On first startup, database is copied to persistent volume
- Subsequent deployments preserve existing database
- Volume ensures data persists across deployments

### Startup Process

1. Check for persistent volume at `/data`
2. Initialize database if not exists
3. Start Next.js server on configured port
4. Health checks verify app is responding

## Customization

### Content Updates

- Edit database content via import scripts in `scripts/db/`
- Update CV generation in `scripts/cv/`
- Modify components in `src/components/`

### Styling

- Global styles: `src/styles/`
- Component styles: Co-located SCSS modules
- Theme configuration: `src/styles/variables.scss`

### Internationalization

Add new locales:
1. Create locale files in `messages/`
2. Update `src/i18n/request.ts`
3. Add locale to `next.config.ts`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port (default: 3000) | No |
| `DB_PATH` | Database file path | No |

See [.env.example](.env) for complete list.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For deployment issues, see [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section.
