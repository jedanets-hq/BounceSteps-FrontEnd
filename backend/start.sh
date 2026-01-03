#!/bin/bash

# iSafari Global - Simple Startup Script
echo "🚀 Starting iSafari Global..."
echo ""

# Get script directory
cd "$(dirname "${BASH_SOURCE[0]}")"

# Kill existing processes
echo "🔄 Cleaning up old processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Check PostgreSQL
echo ""
echo "📊 Checking PostgreSQL..."
if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running (port 5433)"
elif pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is on port 5432 (update .env if needed)"
else
    echo "❌ PostgreSQL is NOT running"
    echo "💡 Start with: sudo systemctl start postgresql"
    exit 1
fi

# Start Backend
echo ""
echo "🔧 Starting Backend..."
cd backend

# Create logs directory
mkdir -p logs

# Start backend in background
node server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

cd ..

# Wait for backend to start
echo "   Waiting for backend..."
sleep 3

# Check backend health
HEALTH_CHECK=$(curl -s http://localhost:5000/api/health 2>/dev/null)
if echo "$HEALTH_CHECK" | grep -q "OK"; then
    echo "✅ Backend is running on http://localhost:5000"
else
    echo "❌ Backend failed to start"
    echo "📝 Check logs: tail -f backend/logs/backend.log"
    exit 1
fi

# Start Frontend
echo ""
echo "🎨 Starting Frontend..."
echo "   This will open in a new process..."
echo ""

npm run dev &
FRONTEND_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ iSafari Global is starting!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Services:"
echo "   • Backend:  http://localhost:5000"
echo "   • Frontend: http://localhost:4028"
echo ""
echo "📝 Process IDs:"
echo "   • Backend:  $BACKEND_PID"
echo "   • Frontend: $FRONTEND_PID"
echo ""
echo "📋 Logs:"
echo "   • Backend:  tail -f backend/logs/backend.log"
echo ""
echo "🛑 To stop:"
echo "   • pkill -f 'node.*server.js'"
echo "   • pkill -f 'vite'"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait
