#!/bin/bash

# Script ya kupush changes kwa GitHub
# Tumia hii kama git push inashindwa

echo "=========================================="
echo "PUSH CHANGES TO GITHUB"
echo "=========================================="
echo ""

# Check kama kuna changes za ku-push
COMMITS_AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")

if [ "$COMMITS_AHEAD" = "0" ]; then
    echo "✓ Hakuna commits mpya za ku-push"
    echo "✓ Local yako iko sawa na GitHub"
    exit 0
fi

echo "📦 Commits za ku-push: $COMMITS_AHEAD"
echo ""
git log origin/main..HEAD --oneline
echo ""

# Jaribu kupush
echo "🚀 Inapush kwa GitHub..."
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ SUCCESS! Changes zimepush kwa GitHub"
    echo "=========================================="
    echo ""
    echo "🎯 Vercel itadeploy automatically sasa"
    echo "📊 Angalia deployment: https://vercel.com/jedanets-hq"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ PUSH IMESHINDWA"
    echo "=========================================="
    echo ""
    echo "Fanya hivi:"
    echo ""
    echo "1. Fungua: https://github.com/settings/tokens/new"
    echo ""
    echo "2. Tengeneza token na scopes:"
    echo "   ✅ repo (full control)"
    echo "   ✅ workflow"
    echo ""
    echo "3. Copy token, kisha run:"
    echo "   git remote set-url origin https://YOUR_TOKEN@github.com/jedanets-hq/BounceSteps-FrontEnd"
    echo ""
    echo "4. Jaribu tena:"
    echo "   ./push-to-github.sh"
    echo ""
fi
