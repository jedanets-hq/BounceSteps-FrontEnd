#!/bin/bash

# iSafari Global - Start Backend
# Simple script to start backend server

cd "$(dirname "$0")/backend"

echo "🚀 Starting iSafari Backend..."

# Kill any existing backend process
pkill -f "node server.js" 2>/dev/null

# Start backend in background
node server.js > backend.log 2>&1 &

echo "✅ Backend started"
echo "📝 Process ID: $!"
echo "📊 Logs: backend/backend.log"
echo "🌐 URL: http://localhost:5000"

# Wait and check health
sleep 3
if curl -s http://localhost:5000/api/health | grep -q "OK"; then
    echo "✅ Backend is running successfully!"
else
    echo "❌ Backend health check failed"
    echo "Check logs: tail -f backend/backend.log"
fi
