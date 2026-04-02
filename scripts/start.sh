#!/bin/sh
set -e

# Startup script for production deployment
# Handles database initialization and starts the Next.js server

echo "🚀 Starting portfolio application..."

# Determine database path
# On Fly.io with volume mount, use /data
# Otherwise use local data directory
if [ -d "/data" ] && [ -w "/data" ]; then
  export DB_PATH="/data/portfolio.db"
  DB_DIR="/data"
  echo "📦 Using volume-mounted database at ${DB_PATH}"
else
  export DB_PATH="./data/portfolio.db"
  DB_DIR="./data"
  echo "📦 Using local database at ${DB_PATH}"
fi

# Check if database exists
if [ ! -f "${DB_PATH}" ]; then
  echo "⚙️  Database not found, initializing..."

  # Create data directory if it doesn't exist
  mkdir -p "${DB_DIR}"

  # Copy initial database from build if it exists
  if [ -f "./data/portfolio.db" ]; then
    echo "📋 Copying initial database from build..."
    cp ./data/portfolio.db "${DB_PATH}"
    echo "✅ Database initialized from build"
  else
    echo "❌ No initial database found in build"
    echo "⚠️  Database will need to be initialized manually"
  fi
else
  echo "✅ Database already exists at ${DB_PATH}"
fi

# Apply schema to ensure all tables exist (safe — all tables use IF NOT EXISTS)
echo "🔧 Applying schema migrations..."
bun run db:init
echo "✅ Schema up to date"

# Start the Next.js server
echo "🌐 Starting Next.js server on port ${PORT:-3000}..."
exec bun server.js
