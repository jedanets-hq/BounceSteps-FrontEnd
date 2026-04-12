#!/bin/bash

# Push to GitHub and Deploy to Vercel Script
# This script handles the complete deployment pipeline

set -e  # Exit on any error

echo "🚀 Starting deployment pipeline for bouncesteps-frontend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the bouncesteps-frontend directory."
    exit 1
fi

# Add all changes
echo "📦 Adding all changes to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit."
else
    # Commit changes with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "💾 Committing changes..."
    git commit -m "Deploy: Frontend updates - $TIMESTAMP"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    # Deploy to production
    vercel --prod --yes
    echo "✅ Deployment completed successfully!"
    echo "🔗 Your app should be live at: https://www.bouncesteps.com"
else
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "🔑 Please run 'vercel login' first, then run this script again."
    exit 1
fi

echo "🎉 All done! Your frontend has been pushed to GitHub and deployed to Vercel."