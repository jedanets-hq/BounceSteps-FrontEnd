#!/bin/bash

# iSafari Backend - Render Deployment Script
# This script prepares and deploys backend to Render

echo "🚀 iSafari Backend - Render Deployment"
echo "======================================"
echo ""

# Step 1: Add all changes
echo "📦 Step 1: Adding all changes to Git..."
git add .

# Step 2: Commit changes
echo "💾 Step 2: Committing changes..."
git commit -m "Add admin routes for admin portal - Render deployment"

# Step 3: Check if remote exists
echo "🔍 Step 3: Checking Git remote..."
if git remote | grep -q "origin"; then
    echo "✅ Remote 'origin' exists"
    
    # Step 4: Push to GitHub
    echo "⬆️  Step 4: Pushing to GitHub..."
    git push origin main || git push origin master
    
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Go to Render Dashboard: https://dashboard.render.com"
    echo "2. Your backend service should auto-deploy (if enabled)"
    echo "3. Wait 2-5 minutes for deployment to complete"
    echo "4. Verify deployment: https://backend-bncb.onrender.com/api/health"
    echo ""
else
    echo "⚠️  No Git remote found!"
    echo ""
    echo "📋 MANUAL DEPLOYMENT STEPS:"
    echo ""
    echo "OPTION 1: Connect to GitHub"
    echo "1. Create GitHub repository"
    echo "2. Run: git remote add origin <your-github-repo-url>"
    echo "3. Run: git push -u origin main"
    echo "4. Connect Render to your GitHub repo"
    echo ""
    echo "OPTION 2: Manual Deploy on Render"
    echo "1. Go to: https://dashboard.render.com"
    echo "2. Click your backend service"
    echo "3. Click 'Manual Deploy' > 'Deploy latest commit'"
    echo ""
    echo "OPTION 3: Create New Service"
    echo "1. Zip backend folder"
    echo "2. Upload to Render as new Web Service"
    echo "3. Configure environment variables"
    echo ""
fi

echo "======================================"
echo "🎉 Deployment preparation complete!"
