#!/bin/bash

echo "🚀 Setting up Traveler Stories System..."
echo ""

# Navigate to backend directory
cd backend

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/stories
chmod 755 uploads/stories
echo "✅ Uploads directory created"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
node run-migrations.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart backend server: cd backend && npm run dev"
echo "2. Refresh frontend browser"
echo "3. Test by creating a story in Profile → My Stories"
echo ""
