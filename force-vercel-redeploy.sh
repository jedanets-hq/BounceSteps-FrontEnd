#!/bin/bash

echo "🚀 FORCING VERCEL REDEPLOY - ADMIN PORTAL"
echo "========================================"
echo ""

echo "📍 Current Issue:"
echo "   Admin portal still using OLD URL: https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app/api"
echo "   Should be using NEW URL: https://bouncesteps-backend-392429231515.us-central1.run.app/api"
echo ""

echo "🔧 Solution: Force Vercel to rebuild with latest changes"
echo ""

# Navigate to admin directory
cd isafari_global/bouncesteps-admin

echo "1️⃣ Making a small change to force rebuild..."
echo "# Force rebuild - $(date)" >> README.md

echo "2️⃣ Committing change..."
git add README.md
git commit -m "Force Vercel rebuild - update backend URL to working service"

echo "3️⃣ Pushing to GitHub (this will trigger Vercel rebuild)..."
git push origin main

echo ""
echo "✅ PUSH COMPLETE!"
echo ""
echo "⏳ Vercel will now rebuild automatically (2-3 minutes)"
echo ""
echo "📋 What happens next:"
echo "   1. Vercel detects new commit"
echo "   2. Vercel rebuilds with NEW backend URL"
echo "   3. Admin portal will use: https://bouncesteps-backend-392429231515.us-central1.run.app/api"
echo ""
echo "🧪 Test after 3 minutes:"
echo "   1. Open: https://bounce-steps-admin.vercel.app"
echo "   2. Check console - should show NEW URL"
echo "   3. Dashboard should load with data!"
echo ""
echo "🔗 Monitor deployment:"
echo "   Vercel Dashboard: https://vercel.com/dashboard"
echo ""