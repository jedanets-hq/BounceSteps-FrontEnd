#!/bin/bash

# Test Pre-Order Flow - iSafari Global
# Test script to verify pre-order system is working

echo "🧪 Testing Pre-Order System..."
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Backend
echo "1️⃣  Checking Backend Server..."
BACKEND_STATUS=$(curl -s http://localhost:5000/api/health)
if [ -z "$BACKEND_STATUS" ]; then
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo "   Starting backend..."
    cd backend && node server.js > server.log 2>&1 &
    sleep 3
else
    echo -e "${GREEN}✅ Backend is running${NC}"
fi

# 2. Check Frontend
echo ""
echo "2️⃣  Checking Frontend Server..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4028)
if [ "$FRONTEND_STATUS" != "200" ]; then
    echo -e "${RED}❌ Frontend is NOT running${NC}"
    echo "   Please run: npm run dev"
else
    echo -e "${GREEN}✅ Frontend is running${NC}"
fi

# 3. Check Database Connection
echo ""
echo "3️⃣  Checking Database..."
cd backend
DB_CHECK=$(node -e "
const db = require('./config/database');
db.query('SELECT COUNT(*) FROM services')
  .then(r => {
    console.log('Services in DB: ' + r.rows[0].count);
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Error');
    process.exit(1);
  });
" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connected${NC}"
    echo "   $DB_CHECK"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi
cd ..

# 4. Check Services
echo ""
echo "4️⃣  Checking Available Services..."
cd backend
SERVICES=$(node -e "
const db = require('./config/database');
db.query('SELECT id, title, price, is_active FROM services WHERE is_active = true LIMIT 3')
  .then(r => {
    r.rows.forEach(s => {
      console.log('   - Service ID: ' + s.id + ' | ' + s.title + ' | TZS ' + s.price);
    });
    process.exit(0);
  })
  .catch(() => process.exit(1));
" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services found:${NC}"
    echo "$SERVICES"
else
    echo -e "${RED}❌ No services found${NC}"
fi
cd ..

# 5. Check Service Providers
echo ""
echo "5️⃣  Checking Service Providers..."
cd backend
PROVIDERS=$(node -e "
const db = require('./config/database');
db.query('SELECT COUNT(*) as count FROM service_providers')
  .then(r => {
    console.log('Total Providers: ' + r.rows[0].count);
    process.exit(0);
  })
  .catch(() => process.exit(1));
" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Providers registered${NC}"
    echo "   $PROVIDERS"
else
    echo -e "${RED}❌ No providers found${NC}"
fi
cd ..

# Summary
echo ""
echo "================================"
echo "📊 SYSTEM STATUS SUMMARY"
echo "================================"
echo ""
echo "Backend:   http://localhost:5000"
echo "Frontend:  http://localhost:4028"
echo ""
echo -e "${YELLOW}📝 MANUAL TESTING STEPS:${NC}"
echo ""
echo "1. Open browser: http://localhost:4028"
echo "2. Register/Login as Traveler"
echo "3. Click 'Plan Journey' or 'Journey Planner'"
echo "4. Complete all 5 steps:"
echo "   - Step 1: Select location & dates"
echo "   - Step 2: Choose accommodation"
echo "   - Step 3: Select service categories"
echo "   - Step 4: Choose providers & SELECT SERVICES"
echo "   - Step 5: Review summary"
echo "5. Click 'Continue to Cart & Payment'"
echo "6. Verify cart has services (not providers)"
echo "7. Click 'Submit Pre-Order Request'"
echo "8. Check for success message"
echo ""
echo "9. Login as Service Provider"
echo "10. Go to 'Pre-Order Management' tab"
echo "11. Verify pre-order appears in 'Pending Pre-Orders'"
echo "12. Click 'Accept Pre-Order'"
echo "13. Verify status changes to 'Confirmed'"
echo ""
echo -e "${GREEN}✅ All automated checks complete!${NC}"
echo ""
