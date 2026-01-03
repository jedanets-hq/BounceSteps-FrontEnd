#!/bin/bash

echo "🛑 Stopping iSafari Global Servers..."

# Kill backend
pkill -f "node server.js" 2>/dev/null && echo "✅ Backend stopped"

# Kill frontend
pkill -f "vite" 2>/dev/null && echo "✅ Frontend stopped"

echo ""
echo "All servers stopped."
