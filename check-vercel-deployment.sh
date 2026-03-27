#!/bin/bash

echo "=========================================="
echo "VERCEL DEPLOYMENT STATUS"
echo "=========================================="
echo ""

# Check latest commit on GitHub
LATEST_COMMIT=$(git log origin/main --oneline -1)
echo "📦 Latest commit on GitHub:"
echo "   $LATEST_COMMIT"
echo ""

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "🔍 Checking Vercel deployments..."
    echo ""
    vercel ls --scope jedanets-hq 2>/dev/null || echo "⚠️  Run 'vercel login' first"
else
    echo "ℹ️  Vercel CLI haipo. Angalia deployment manually:"
    echo ""
    echo "   🌐 https://vercel.com/jedanets-hq/bouncesteps-frontend"
    echo ""
fi

echo "=========================================="
echo "NEXT STEPS"
echo "=========================================="
echo ""
echo "1. Fungua Vercel dashboard:"
echo "   https://vercel.com/jedanets-hq"
echo ""
echo "2. Angalia kama deployment imeanza"
echo ""
echo "3. Deployment itachukua ~2-5 minutes"
echo ""
echo "4. Baada ya deployment, check:"
echo "   https://www.bouncesteps.com/sitemap.xml"
echo ""
