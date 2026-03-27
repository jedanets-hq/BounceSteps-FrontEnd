#!/bin/bash

# Validation script - Run this before ANY push operation
# This ensures everything is correct before pushing to GitHub

set -e

echo ""
echo "🔍 PRE-PUSH VALIDATION CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Current branch
echo "📍 Check 1: Current Branch"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "   Current: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "   ❌ ERROR: Must be on 'main' branch"
    echo "   Fix: git checkout main"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ Correct branch"
fi
echo ""

# Check 2: Repository
echo "🏠 Check 2: Repository"
REPO_URL=$(git config --get remote.origin.url)
echo "   URL: $REPO_URL"

if [[ ! "$REPO_URL" =~ "BounceSteps-FrontEnd" ]]; then
    echo "   ❌ ERROR: Wrong repository!"
    echo "   Expected: BounceSteps-FrontEnd"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ Correct repository"
fi
echo ""

# Check 3: Up to date with remote
echo "📥 Check 3: Sync Status"
git fetch origin main --quiet

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || echo "unknown")
BASE_COMMIT=$(git merge-base HEAD origin/main 2>/dev/null || echo "unknown")

echo "   Local:  $LOCAL_COMMIT"
echo "   Remote: $REMOTE_COMMIT"

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "   ℹ️  No new commits to push"
elif [ "$BASE_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "   ❌ ERROR: Local is behind remote"
    echo "   Fix: git pull origin main"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ Ready to push"
fi
echo ""

# Check 4: Uncommitted changes
echo "📝 Check 4: Working Directory"
if [ -n "$(git status --porcelain)" ]; then
    echo "   ⚠️  WARNING: Uncommitted changes detected"
    git status --short
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ No uncommitted changes"
fi
echo ""

# Check 5: Package.json exists
echo "📦 Check 5: Project Files"
if [ ! -f "package.json" ]; then
    echo "   ❌ ERROR: package.json not found"
    echo "   Are you in the correct directory?"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ package.json found"
fi
echo ""

# Check 6: Vercel config
echo "⚙️  Check 6: Vercel Configuration"
if [ ! -f "vercel.json" ]; then
    echo "   ⚠️  WARNING: vercel.json not found"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ vercel.json found"
fi
echo ""

# Check 7: Show commits to be pushed
if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ] && [ "$BASE_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "📦 Check 7: Commits to Push"
    git log origin/main..HEAD --oneline --decorate
    echo ""
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ VALIDATION FAILED"
    echo ""
    echo "   Errors: $ERRORS"
    echo "   Warnings: $WARNINGS"
    echo ""
    echo "Fix the errors above before pushing."
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  VALIDATION PASSED WITH WARNINGS"
    echo ""
    echo "   Warnings: $WARNINGS"
    echo ""
    echo "You can proceed, but review warnings above."
    echo ""
    exit 0
else
    echo "✅ ALL CHECKS PASSED"
    echo ""
    echo "Safe to push:"
    echo "   git push origin main"
    echo ""
    echo "Or use:"
    echo "   ./deploy.sh"
    echo ""
    exit 0
fi
