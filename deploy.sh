#!/bin/bash

# RankUni Vercel Deployment Script
# This script helps prepare and deploy your application to Vercel

echo "🚀 RankUni Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - RankUni application"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check for uncommitted changes
if [[ `git status --porcelain` ]]; then
    echo ""
    echo "📝 Uncommitted changes detected. Committing..."
    git add .
    git commit -m "Update for deployment"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Create a GitHub repository:"
echo "   → Go to https://github.com/new"
echo "   → Name it 'rankuni' or 'school-performance'"
echo "   → Do NOT initialize with README"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/rankuni.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   → Go to https://vercel.com/new"
echo "   → Import your GitHub repository"
echo "   → Add environment variable: DATABASE_URL"
echo "   → Click Deploy"
echo ""
echo "4. Set up database:"
echo "   → Create Vercel Postgres or Neon database"
echo "   → Copy connection string to DATABASE_URL"
echo "   → Run: npx prisma migrate deploy"
echo ""
echo "5. Seed database:"
echo "   → Run ingestion scripts against production DB"
echo ""
echo "📖 Full guide: See vercel_deployment_guide.md"
echo ""
