#!/bin/bash

# iSafari Global - Start Everything
# Run this script after reboot to start all services

clear
echo "╔════════════════════════════════════════╗"
echo "║   🚀 iSafari Global Platform          ║"
echo "║   Starting All Services...             ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Check PostgreSQL
echo "1️⃣  Checking PostgreSQL..."
if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL is running"
else
    echo "   ❌ PostgreSQL is NOT running"
    echo "   Please start PostgreSQL first"
    exit 1
fi

# 2. Start Backend
echo ""
echo "2️⃣  Starting Backend..."
cd backend
pkill -f "node server.js" 2>/dev/null
node server.js > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Check backend health
if curl -s http://localhost:5000/api/health | grep -q "OK"; then
    echo "   ✅ Backend is running (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend failed to start"
    exit 1
fi

# 3. Start Frontend
echo ""
echo "3️⃣  Starting Frontend..."
echo "   Opening new terminal for frontend..."
echo "   Run: npm run dev"
echo ""

echo "╔════════════════════════════════════════╗"
echo "║   ✅ Backend Started Successfully      ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 Services:"
echo "   • Backend: http://localhost:5000"
echo "   • Frontend: http://localhost:4028 (start with: npm run dev)"
echo ""
echo "📝 Next Steps:"
echo "   1. Open a new terminal"
echo "   2. cd /home/danford/Documents/isafari_global"
echo "   3. npm run dev"
echo ""
echo "📖 Documentation: STARTUP-GUIDE.md"
