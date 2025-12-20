#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 🚀 ISAFARI GLOBAL - QUICK PASSWORD SETUP
# ═══════════════════════════════════════════════════════════════════════════
# This script helps you quickly set the MongoDB password
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🔐 iSAFARI GLOBAL - MONGODB PASSWORD SETUP"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ ERROR: backend/.env file not found!"
    echo ""
    echo "📝 Please make sure you are running this script from the isafari_global root directory"
    exit 1
fi

# Prompt for password
echo "📝 Enter your MongoDB password:"
echo "   (This is the password for user: mfungojoctan01_db_user)"
echo ""
read -sp "Password: " DB_PASSWORD
echo ""
echo ""

# URL encode the password
# Note: This is a simple version, for complex passwords use proper URL encoding
ENCODED_PASSWORD=$(echo -n "$DB_PASSWORD" | jq -sRr @uri 2>/dev/null || echo "$DB_PASSWORD")

# Update .env file
echo "🔄 Updating backend/.env file..."

# Create backup
cp backend/.env backend/.env.backup
echo "✅ Backup created: backend/.env.backup"

# Replace password in .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|<db_password>|$ENCODED_PASSWORD|g" backend/.env
else
    # Linux
    sed -i "s|<db_password>|$ENCODED_PASSWORD|g" backend/.env
fi

echo "✅ Password updated in backend/.env"
echo ""

# Test connection
echo "🧪 Testing MongoDB connection..."
echo ""

cd backend
node test-new-mongodb-connection.js

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "✅ SUCCESS! MongoDB connection is working!"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🚀 You can now start the iSafari system:"
    echo ""
    echo "   Option 1: Start everything together"
    echo "   ./start-with-new-mongodb.bat"
    echo ""
    echo "   Option 2: Start separately"
    echo "   Terminal 1: cd backend && npm start"
    echo "   Terminal 2: npm run dev"
    echo "   Terminal 3: cd admin-portal && npm run dev"
    echo ""
else
    echo ""
    echo "❌ MongoDB connection test failed!"
    echo ""
    echo "📝 Please check:"
    echo "1. Password is correct"
    echo "2. IP is whitelisted in MongoDB Atlas"
    echo "3. MongoDB cluster is accessible"
    echo ""
    echo "💡 You can restore the backup with:"
    echo "   cp backend/.env.backup backend/.env"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════════════════════"
