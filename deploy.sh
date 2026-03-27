#!/bin/bash

# Quick deployment script - tumia hii kila unapofanya changes
# This script ensures safe deployment to production

set -e  # Exit on error

echo "=========================================="
echo "🚀 BOUNCESTEPS DEPLOYMENT"
echo "=========================================="
echo ""

# Step 0: Validate environment
echo "🔍 Step 0: Validating environment..."
./validate-before-push.sh || {
    echo ""
    echo "❌ Validation failed. Fix errors above."
    exit 1
}
echo ""

# Step 1: Pull latest
echo "📥 Step 1: Pulling latest changes..."
git pull origin main
echo "✅ Done"
echo ""

# Step 2: Check status
echo "📊 Step 2: Checking status..."
git status
echo ""

# Step 3: Ask for commit message
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Step 3: Una changes za ku-commit"
    echo ""
    read -p "Enter commit message: " COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        echo "❌ Commit message required!"
        exit 1
    fi
    
    echo ""
    echo "📦 Adding files..."
    git add .
    
    echo "💾 Committing..."
    git commit -m "$COMMIT_MSG"
    echo "✅ Done"
    echo ""
else
    echo "ℹ️  Hakuna changes za ku-commit"
    echo ""
fi

# Step 4: Push
echo "🚀 Step 4: Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Done"
    echo ""
    
    # Step 5: Success
    echo "=========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "📦 Latest commit:"
    git log --oneline -1
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Vercel itadeploy automatically (~2-5 min)"
    echo "   2. Check: https://vercel.com/jedanets-hq"
    echo "   3. Verify: https://www.bouncesteps.com"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ PUSH FAILED"
    echo "=========================================="
    echo ""
    echo "Jaribu:"
    echo "   gh auth refresh -s repo,workflow"
    echo "   ./deploy.sh"
    echo ""
    exit 1
fi
