#!/bin/bash

echo "🚀 Starting iSafari Global - Backend + Frontend"
echo ""
echo "Checking for running processes..."

# Kill any existing processes
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "⚠️  Stopping existing backend on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -ti:4028 > /dev/null 2>&1; then
    echo "⚠️  Stopping existing frontend on port 4028..."
    lsof -ti:4028 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Ports cleared"
echo ""
echo "Starting services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start with npm run dev
npm run dev
