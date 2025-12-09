#!/bin/bash

# Database Migration Script for RankUni Production Database
# This script runs Prisma migrations against the Neon PostgreSQL database

set -e  # Exit on error

echo "🗄️  RankUni Database Migration Script"
echo "====================================="
echo ""

# Database URL (pooled connection)
export DATABASE_URL="postgresql://neondb_owner:npg_aeYbCS9Q8ZvH@ep-restless-dust-adiut7rt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo "📊 Running Prisma migrations..."
echo ""

# Check if we need to install dependencies first
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
    echo ""
fi

# Run migrations
echo "🔄 Deploying migrations to production database..."
npx prisma migrate deploy

echo ""
echo "✅ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Seed the database with school data"
echo "2. Run: ./seed-database.sh"
echo ""
