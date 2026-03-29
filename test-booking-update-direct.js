/**
 * Test booking update directly
 */

const API_URL = 'http://localhost:5000/api';

// Get user token from localStorage (you need to copy this from browser console)
// Run this in browser console: JSON.parse(localStorage.getItem('isafari_user')).token
const TOKEN = 'YOUR_JWT_TOKEN_HERE';

// Test booking ID (replace with actual booking ID from your database)
const BOOKING_ID = 1;

async function testBookingUpdate() {
  console.log('🧪 Testing booking update...\n');
  
  try {
    console.log(`📝 Updating booking ${BOOKING_ID} to 'confirmed'...`);
    console.log(`🔗 URL: ${API_URL}/bookings/${BOOKING_ID}/status`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 20)}...`);
    
    const response = await fetch(`${API_URL}/bookings/${BOOKING_ID}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ status: 'confirmed' })
    });
    
    console.log(`📥 Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Booking updated successfully');
    } else {
      console.log('\n❌ FAILED:', data.message);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

console.log('⚠️  INSTRUCTIONS:');
console.log('1. Open browser console');
console.log('2. Run: JSON.parse(localStorage.getItem("isafari_user")).token');
console.log('3. Copy the token');
console.log('4. Replace TOKEN variable in this script');
console.log('5. Run: node test-booking-update-direct.js');
console.log('\nOR test directly in browser console:');
console.log(`
const token = JSON.parse(localStorage.getItem('isafari_user')).token;
const bookingId = 1; // Replace with actual booking ID

fetch('http://localhost:5000/api/bookings/' + bookingId + '/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ status: 'confirmed' })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
`);

// Uncomment to run test (after adding token)
// testBookingUpdate();
