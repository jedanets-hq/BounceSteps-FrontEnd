#!/bin/bash

# iSafari Global - System Verification Script
# Checks if both backend and frontend are running correctly

echo "🔍 iSafari Global System Verification"
echo "======================================"
echo ""

# Check Backend
echo "1️⃣  Checking Backend Server (Port 5000)..."
if lsof -i :5000 >/dev/null 2>&1; then
    echo "   ✅ Backend is running"
    
    # Test health endpoint
    HEALTH=$(curl -s http://localhost:5000/api/health)
    if echo "$HEALTH" | grep -q "OK"; then
        echo "   ✅ Health endpoint responding"
        echo "   📊 Response: $HEALTH"
    else
        echo "   ⚠️  Health endpoint not responding correctly"
    fi
else
    echo "   ❌ Backend is NOT running"
    echo "   💡 Start with: ./start-backend.sh"
fi

echo ""

# Check Frontend
echo "2️⃣  Checking Frontend Server (Port 4028)..."
if lsof -i :4028 >/dev/null 2>&1; then
    echo "   ✅ Frontend is running"
    
    # Test frontend access
    if curl -s http://localhost:4028 | grep -q "vite"; then
        echo "   ✅ Vite dev server active"
    fi
    
    # Test API proxy
    PROXY=$(curl -s http://localhost:4028/api/health)
    if echo "$PROXY" | grep -q "OK"; then
        echo "   ✅ API proxy working"
        echo "   📊 Proxy Response: $PROXY"
    else
        echo "   ⚠️  API proxy not working"
    fi
else
    echo "   ❌ Frontend is NOT running"
    echo "   💡 Start with: ./start-frontend.sh"
fi

echo ""

# Check Database
echo "3️⃣  Checking Database Connection..."
if lsof -i :5433 >/dev/null 2>&1; then
    echo "   ✅ PostgreSQL running on port 5433"
else
    echo "   ⚠️  PostgreSQL may not be running on port 5433"
fi

echo ""

# System Summary
echo "📋 System Summary"
echo "=================="
BACKEND_STATUS=$(lsof -i :5000 >/dev/null 2>&1 && echo "🟢 RUNNING" || echo "🔴 STOPPED")
FRONTEND_STATUS=$(lsof -i :4028 >/dev/null 2>&1 && echo "🟢 RUNNING" || echo "🔴 STOPPED")

echo "Backend:  $BACKEND_STATUS  (http://localhost:5000)"
echo "Frontend: $FRONTEND_STATUS  (http://localhost:4028)"

echo ""

# Overall Status
if lsof -i :5000 >/dev/null 2>&1 && lsof -i :4028 >/dev/null 2>&1; then
    echo "✅ ALL SYSTEMS OPERATIONAL"
    echo "🌐 Access the app at: http://localhost:4028"
else
    echo "⚠️  SOME SERVICES ARE DOWN"
    echo ""
    echo "To start all services:"
    echo "  Backend:  ./start-backend.sh"
    echo "  Frontend: ./start-frontend.sh"
fi

echo ""
