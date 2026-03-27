#!/bin/bash

echo "📊 MONITORING VERCEL DEPLOYMENT"
echo "==============================="
echo ""

ADMIN_URL="https://bounce-steps-admin.vercel.app"
NEW_BACKEND="https://bouncesteps-backend-392429231515.us-central1.run.app/api"
OLD_BACKEND="https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app/api"

echo "🎯 Target: Admin portal should use NEW backend URL"
echo "   NEW: $NEW_BACKEND"
echo "   OLD: $OLD_BACKEND (should not appear)"
echo ""

echo "⏳ Checking deployment status every 30 seconds..."
echo ""

for i in {1..10}; do
    echo "🔍 Check #$i - $(date +%H:%M:%S)"
    
    # Check if admin portal is accessible
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "   ✅ Admin portal is accessible (HTTP $HTTP_STATUS)"
        
        # Check which backend URL is being used
        RESPONSE=$(curl -s "$ADMIN_URL" | grep -o "bouncesteps-backend[^\"]*" | head -1)
        
        if [[ "$RESPONSE" == *"392429231515.us-central1"* ]]; then
            echo "   🎉 SUCCESS! Using NEW backend URL: $RESPONSE"
            echo ""
            echo "✅ DEPLOYMENT COMPLETE!"
            echo ""
            echo "🚀 NEXT STEPS:"
            echo "   1. Open: $ADMIN_URL"
            echo "   2. Login with admin credentials"
            echo "   3. Check console - should show NEW URL"
            echo "   4. Dashboard should load with data!"
            echo ""
            exit 0
        elif [[ "$RESPONSE" == *"gvnqzuauoa-ew.a"* ]]; then
            echo "   ⏳ Still using OLD backend URL: $RESPONSE"
            echo "   ⏳ Vercel still building... waiting..."
        else
            echo "   ❓ Could not detect backend URL in response"
        fi
    else
        echo "   ⏳ Admin portal not ready yet (HTTP $HTTP_STATUS)"
    fi
    
    if [ $i -lt 10 ]; then
        echo "   ⏳ Waiting 30 seconds for next check..."
        echo ""
        sleep 30
    fi
done

echo ""
echo "⚠️  Deployment taking longer than expected (5 minutes)"
echo ""
echo "🔧 Manual steps:"
echo "   1. Check Vercel dashboard: https://vercel.com/dashboard"
echo "   2. Look for 'bounce-steps-admin' project"
echo "   3. Check latest deployment status"
echo "   4. If failed, click 'Redeploy'"
echo ""
echo "🧪 Or test manually:"
echo "   1. Open: $ADMIN_URL"
echo "   2. Press F12 (console)"
echo "   3. Look for 'API URL IN USE:' message"
echo "   4. Should show: $NEW_BACKEND"
echo ""