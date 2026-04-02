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

# Always wipe the database on startup for a clean slate
echo "🗑️  Wiping existing database..."
rm -f "${DB_PATH}"
mkdir -p "${DB_DIR}"
echo "✅ Database wiped"

# Initialize fresh schema
echo "🔧 Initializing schema..."
bun scripts/db/init.ts
echo "✅ Schema initialized"

# Fetch all data from Firebase
echo "🔄 Fetching data from Firebase..."
bun scripts/db/fetch-and-import.ts
echo "✅ Data fetch complete"

# Start the Next.js server
echo "🌐 Starting Next.js server on port ${PORT:-3000}..."
exec bun server.js
