#!/bin/bash

# Database Seeding Script for RankUni Production Database
# This script loads school data into the Neon PostgreSQL database

set -e  # Exit on error

echo "🌱 RankUni Database Seeding Script"
echo "==================================="
echo ""

# Database URL (pooled connection)
export DATABASE_URL="postgresql://neondb_owner:npg_aeYbCS9Q8ZvH@ep-restless-dust-adiut7rt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo "📊 Seeding database with school data..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
    echo ""
fi

# Regenerate Prisma Client with PostgreSQL
echo "🔄 Regenerating Prisma Client for PostgreSQL..."
npx prisma generate
echo ""

# Seed French schools
echo "🇫🇷 Ingesting French schools..."
npx tsx scripts/ingest-fr.ts
echo ""

# Seed US schools (if script exists)
if [ -f "scripts/ingest-us.ts" ]; then
    echo "🇺🇸 Ingesting US schools..."
    npx tsx scripts/ingest-us.ts
    echo ""
fi

# Seed UK schools (if script exists)
if [ -f "scripts/ingest-uk.ts" ]; then
    echo "🇬🇧 Ingesting UK schools..."
    npx tsx scripts/ingest-uk.ts
    echo ""
fi

echo "✅ Database seeding complete!"
echo ""
echo "🌐 Your site is now live with data at:"
echo "   https://rankuni.vercel.app"
echo "   https://rankuni.app (once DNS is configured)"
echo ""
