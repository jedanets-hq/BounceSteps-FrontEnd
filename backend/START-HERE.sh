#!/bin/bash

# ╔══════════════════════════════════════════════════════════╗
# ║  iSafari Global - COMPLETE STARTUP SCRIPT               ║
# ║  This ensures backend starts BEFORE frontend             ║
# ╚══════════════════════════════════════════════════════════╝

clear
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║         🚀 iSafari Global - Starting System             ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1: Clean up old processes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "🔄 Cleaning up old processes..."
pkill -9 -f "node.*server.js" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
sleep 2
echo "✅ Old processes cleaned"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2: Check PostgreSQL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "📊 Checking PostgreSQL database..."
if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running (port 5433)"
elif pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running (port 5432)"
    echo "⚠️  Note: Using port 5432 (check .env if needed)"
else
    echo "❌ PostgreSQL is NOT running!"
    echo ""
    echo "Please start PostgreSQL first:"
    echo "  sudo systemctl start postgresql"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3: Start Backend (CRITICAL!)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "🔧 Starting Backend Server..."
cd backend
mkdir -p logs

# Start backend in background
node server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend started (PID: $BACKEND_PID)"

cd ..

# Wait for backend to initialize
echo "   Waiting for backend to initialize..."
for i in {1..10}; do
    sleep 1
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        break
    fi
    echo "   ... checking ($i/10)"
done

# Verify backend is running
HEALTH=$(curl -s http://localhost:5000/api/health 2>&1)
if echo "$HEALTH" | grep -q "OK"; then
    echo "✅ Backend is running successfully!"
    echo "   URL: http://localhost:5000"
else
    echo "❌ Backend failed to start!"
    echo ""
    echo "Check logs:"
    echo "  tail -f backend/logs/backend.log"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4: Start Frontend
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "🎨 Starting Frontend..."
echo ""

# Start frontend (this will block and show output)
npm run dev

# Note: Script will stay here until Ctrl+C
