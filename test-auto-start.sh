#!/bin/bash

echo "🧪 Testing Auto-Start Setup..."
echo ""

# Check if concurrently is installed
if npm list concurrently > /dev/null 2>&1; then
    echo "✅ concurrently installed"
else
    echo "❌ concurrently not installed"
    echo "   Run: npm install"
    exit 1
fi

# Check if scripts are configured
if grep -q '"dev": "concurrently' package.json; then
    echo "✅ npm run dev script configured"
else
    echo "❌ npm run dev script not configured"
    exit 1
fi

if grep -q '"backend": "cd backend' package.json; then
    echo "✅ npm run backend script configured"
else
    echo "❌ npm run backend script not configured"
    exit 1
fi

if grep -q '"frontend": "vite"' package.json; then
    echo "✅ npm run frontend script configured"
else
    echo "❌ npm run frontend script not configured"
    exit 1
fi

echo ""
echo "✅ ALL CHECKS PASSED!"
echo ""
echo "🚀 Ready to use: npm run dev"
echo ""
echo "This will start:"
echo "  - Backend on port 5000"
echo "  - Frontend on port 4028"
echo ""
echo "Stop with: Ctrl+C"
echo ""
