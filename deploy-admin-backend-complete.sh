#!/bin/bash

echo "🚀 DEPLOYING BACKEND WITH ADMIN ROUTES TO CLOUD RUN..."
echo "======================================================="
echo ""

# Navigate to backend directory
cd isafari_global/bouncesteps-backend

echo "📦 Deploying backend to Cloud Run with database connection..."
echo ""

# Deploy to Cloud Run with all necessary environment variables
gcloud run deploy bouncesteps-backend \
  --source . \
  --platform managed \
  --region europe-west1 \
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
curl -s "$API_URL/health" | head -5
echo ""
echo ""

echo "Testing: $API_URL/api/admin/test"
curl -s "$API_URL/api/admin/test" | head -5
echo ""
echo ""

echo "Testing: $API_URL/api/admin/dashboard/stats"
curl -s "$API_URL/api/admin/dashboard/stats?period=30days" | head -10
echo ""
echo ""

echo "Testing: $API_URL/api/admin/users"
curl -s "$API_URL/api/admin/users?page=1&limit=5" | head -10
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
