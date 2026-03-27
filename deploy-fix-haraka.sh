#!/bin/bash

echo "🚀 DEPLOY FIX YA CORS - NJIA YA HARAKA"
echo "====================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI haijawekwa!"
    echo ""
    echo "📥 INSTALL VERCEL CLI:"
    echo "   npm install -g vercel"
    echo ""
    echo "Baada ya kuinstall, run script hii tena."
    exit 1
fi

echo "✅ Vercel CLI imeonekana"
echo ""

echo "🔧 STEP 1: Setting environment variables..."
echo ""

# Set environment variables
echo "Setting VITE_API_URL..."
echo "https://bouncesteps-backend-392429231515.us-central1.run.app/api" | vercel env add VITE_API_URL production

echo "Setting VITE_API_BASE_URL..."
echo "https://bouncesteps-backend-392429231515.us-central1.run.app/api" | vercel env add VITE_API_BASE_URL production

echo ""
echo "✅ Environment variables zimewekwa!"
echo ""

echo "🚀 STEP 2: Triggering redeploy..."
echo ""

# Trigger redeploy by making a small change
echo "# Updated $(date)" >> .vercel-deploy-trigger
git add .vercel-deploy-trigger
git commit -m "Fix CORS: Update backend URL to working service"

# Deploy
vercel --prod

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Ngoja 2-3 minutes"
echo "2. Enda https://www.bouncesteps.com"
echo "3. Open Developer Tools (F12)"
echo "4. Tafuta: 'API URL IN USE: https://bouncesteps-backend-392429231515.us-central1.run.app/api'"
echo "5. Test login - CORS errors zinapaswa kuisha!"
echo ""
echo "✅ DONE!"