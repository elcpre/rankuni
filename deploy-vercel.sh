#!/bin/bash

# Vercel CLI Installation and Deployment Script
# This script installs Node.js, npm, and Vercel CLI, then deploys your app

set -e  # Exit on error

echo "🚀 RankUni Vercel Deployment Script"
echo "===================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for this session
    echo "Adding Homebrew to PATH..."
    eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || eval "$(/usr/local/bin/brew shellenv)"
else
    echo "✅ Homebrew already installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
else
    echo "✅ Node.js already installed ($(node --version))"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js manually."
    exit 1
else
    echo "✅ npm already installed ($(npm --version))"
fi

# Install Vercel CLI globally
echo ""
echo "📦 Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "✅ Vercel CLI installed successfully!"
echo ""
echo "🚀 Starting deployment..."
echo ""

# Navigate to project directory
cd "/Users/jose.millon/Documents/Projects/School Performance"

# Deploy to Vercel
echo "Running: vercel --prod"
echo ""
echo "You will be asked to:"
echo "1. Login to Vercel (browser will open)"
echo "2. Confirm project settings"
echo "3. Confirm production deployment"
echo ""

vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "Your site should be live at: https://rankuni.app"
