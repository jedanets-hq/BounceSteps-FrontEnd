#!/bin/bash

echo "🔍 Checking Vercel Deployment Status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get latest commit
LATEST_COMMIT=$(git log origin/main --oneline -1)
echo "📦 Latest commit on GitHub:"
echo "   $LATEST_COMMIT"
echo ""

# Check version
VERSION=$(grep '"version"' package.json | head -1 | cut -d'"' -f4)
echo "📌 Package version: $VERSION"
echo ""

echo "🌐 Vercel Dashboard:"
echo "   https://vercel.com/jedanets-hqs-projects/bounce-steps-front-end"
echo ""

echo "🚀 Production URL:"
echo "   https://www.bouncesteps.com"
echo ""

echo "⏱️  Expected deployment time: 3-5 minutes"
echo ""

echo "✅ Next steps:"
echo "   1. Open Vercel dashboard (link above)"
echo "   2. Wait for 'Building...' to change to 'Ready'"
echo "   3. Clear browser cache (Ctrl+Shift+Delete)"
echo "   4. Test production site"
echo ""

echo "🧪 To test cache clearing:"
echo "   1. Open: https://www.bouncesteps.com/version.json"
echo "   2. Should show version: $VERSION"
echo "   3. Build time should be recent (within last 5 minutes)"
echo ""
