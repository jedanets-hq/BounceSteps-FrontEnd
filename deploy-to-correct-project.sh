#!/bin/bash

echo "🚀 DEPLOYING BACKEND TO CORRECT PROJECT..."
echo "==========================================="
echo ""

# Switch to correct project
echo "1️⃣ Switching to BOUNCE STEPS project..."
gcloud config set project project-df58b635-5420-42bc-809

echo ""
echo "2️⃣ Current project:"
gcloud config get-value project

echo ""
echo "3️⃣ Deploying backend to Cloud Run..."
echo ""

# Navigate to backend directory
cd isafari_global/bouncesteps-backend

# Deploy to Cloud Run with all necessary environment variables
gcloud run deploy bouncesteps-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production,DB_HOST=34.42.58.123,DB_PORT=5432,DB_NAME=bouncesteps-db,DB_USER=postgres,DB_PASSWORD=@JedaNets01,JWT_SECRET=isafari-jwt-secret-key-2024-production,SESSION_SECRET=isafari-oauth-session-secret"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🔍 Testing admin endpoints..."
echo ""

# Wait for deployment to be ready
sleep 10

# Test admin endpoints
API_URL="https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app"

echo "Testing: $API_URL/health"
curl -s "$API_URL/health"
echo ""
echo ""

echo "Testing: $API_URL/api/admin/test"
curl -s "$API_URL/api/admin/test"
echo ""
echo ""

echo "Testing: $API_URL/api/admin/dashboard/stats"
curl -s "$API_URL/api/admin/dashboard/stats?period=30days"
echo ""
echo ""

echo "✅ DEPLOYMENT AND TESTING COMPLETE!"
echo ""
echo "📋 Admin Portal Endpoints:"
echo "   Dashboard Stats: $API_URL/api/admin/dashboard/stats"
echo "   Dashboard Activity: $API_URL/api/admin/dashboard/activity"
echo "   Users: $API_URL/api/admin/users"
echo "   Providers: $API_URL/api/admin/providers"
echo "   Services: $API_URL/api/admin/services"
echo "   Payments: $API_URL/api/admin/payments"
echo ""
echo "🎯 Admin portal should now work with live database data!"
