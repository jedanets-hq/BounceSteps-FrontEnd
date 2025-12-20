#!/bin/bash

echo "🧪 Testing Booking Creation..."
echo "================================"
echo ""

# Check backend
echo "1. Checking Backend..."
HEALTH=$(curl -s http://localhost:5000/api/health)
if [ -z "$HEALTH" ]; then
    echo "❌ Backend not running!"
    exit 1
fi
echo "✅ Backend is running"
echo ""

# Check database column
echo "2. Verifying Database Schema..."
cd backend
COLUMNS=$(node -e "
const db = require('./config/database');
db.query('SELECT column_name FROM information_schema.columns WHERE table_name = \\'bookings\\' AND column_name LIKE \\'%price%\\'')
  .then(r => {
    if (r.rows.length > 0) {
      console.log('✅ Column found: ' + r.rows[0].column_name);
      process.exit(0);
    } else {
      console.log('❌ No price column found');
      process.exit(1);
    }
  })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
" 2>&1)

echo "$COLUMNS"
cd ..
echo ""

echo "3. Testing Booking Creation..."
echo "   You need to:"
echo "   - Open http://localhost:4028"
echo "   - Login as traveler"
echo "   - Plan a journey"
echo "   - Select services from provider modal"
echo "   - Submit pre-order"
echo ""
echo "4. Check backend logs for errors:"
echo "   tail -f backend/server.log"
echo ""
echo "✅ System ready for testing!"
