#!/bin/bash

echo "=========================================="
echo "🧪 TESTING REGISTRATION API"
echo "=========================================="
echo ""

API_URL="https://bouncesteps-backend-392429231515.us-central1.run.app/api"

echo "📍 Backend URL: $API_URL"
echo ""

echo "🧪 Test 1: Traveler Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test traveler registration
curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+255700000000",
    "dateOfBirth": "2000-01-01",
    "userType": "traveler"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo ""
echo "🧪 Test 2: Service Provider Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test service provider registration
curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@example.com",
    "password": "Test123456",
    "firstName": "Provider",
    "lastName": "Test",
    "phone": "+255700000001",
    "dateOfBirth": "1990-01-01",
    "userType": "service_provider",
    "companyName": "Test Company",
    "serviceLocation": "Dar es Salaam, Tanzania",
    "serviceCategories": ["Accommodation", "Tours"],
    "description": "Test description"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || cat

echo ""
echo ""
echo "=========================================="
echo "✅ Test Complete"
echo "=========================================="
echo ""
echo "📝 Notes:"
echo "   - 400 = Validation error (check error message)"
echo "   - 409 = Email already exists"
echo "   - 201 = Success"
echo "   - 500 = Server error"
echo ""
