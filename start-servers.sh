#!/bin/bash

echo "🚀 Starting iSafari Global Servers..."

# Kill any existing processes
echo "Stopping existing servers..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start Backend
echo "Starting Backend Server..."
cd backend
node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
cd ..

# Wait for backend to be ready
sleep 3

# Start Frontend
echo "Starting Frontend Server..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
sleep 5

# Test servers
echo ""
echo "Testing servers..."
BACKEND_STATUS=$(curl -s http://localhost:5000/api/health | grep -o "OK" || echo "FAILED")
FRONTEND_STATUS=$(curl -s http://localhost:4028 | grep -o "html" || echo "FAILED")

echo ""
echo "📊 Server Status:"
echo "Backend (http://localhost:5000): $BACKEND_STATUS"
echo "Frontend (http://localhost:4028): $FRONTEND_STATUS"
echo ""

if [ "$BACKEND_STATUS" = "OK" ] && [ "$FRONTEND_STATUS" = "html" ]; then
    echo "✅ All servers running successfully!"
    echo ""
    echo "🌐 Open your browser and go to: http://localhost:4028"
    echo "💡 Press Ctrl+Shift+R to clear cache"
    echo ""
    echo "📝 Logs:"
    echo "   Backend: backend/backend.log"
    echo "   Frontend: frontend.log"
else
    echo "❌ Some servers failed to start. Check logs for details."
fi

echo ""
echo "To stop servers, run: ./stop-servers.sh"
