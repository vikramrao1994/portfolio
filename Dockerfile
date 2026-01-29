# syntax=docker/dockerfile:1

# Base stage with common dependencies
FROM oven/bun:1-debian AS base
WORKDIR /app

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Dependencies stage
FROM base AS deps

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Python dependencies stage
FROM base AS python-deps

# Copy Python requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Builder stage
FROM base AS builder

# Copy node modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy Python dependencies
COPY --from=python-deps /usr/local/lib/python3.11/dist-packages /usr/local/lib/python3.11/dist-packages

# Copy application source
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run prebuild script (fetches data and initializes DB)
# This creates the initial database that will be copied to the image
RUN bun run prebuild

# Build Next.js application with standalone output
RUN bun run build

# Runner stage - minimal production image
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Python dependencies
COPY --from=python-deps /usr/local/lib/python3.11/dist-packages /usr/local/lib/python3.11/dist-packages

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts/cv ./scripts/cv
COPY --from=builder /app/scripts/start.sh ./scripts/start.sh
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/db ./db

# Create data directory for SQLite database
RUN mkdir -p /data && chown -R nextjs:nodejs /data

# If database exists from build, copy it as initial seed
# This will be overridden by the volume mount in production
COPY --from=builder --chown=nextjs:nodejs /app/data/portfolio.db /app/data/portfolio.db

# Make startup script executable
RUN chmod +x ./scripts/start.sh

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application using startup script
CMD ["./scripts/start.sh"]
