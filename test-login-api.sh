#!/bin/bash

echo "Testing Login API..."
echo ""

# Test with traveler account
echo "1. Testing traveler@test.com..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@test.com","password":"password123"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo ""

# Test with provider account  
echo "2. Testing provider@test.com..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"provider@test.com","password":"password123"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo ""

# Test with wrong password
echo "3. Testing wrong password..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@test.com","password":"wrongpassword"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
