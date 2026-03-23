const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Create a test JWT token for a service provider
const JWT_SECRET = 'your-local-jwt-secret-key-change-this-to-random-string';
const userId = 4; // dantest1@gmail.com - has bookings

const token = jwt.sign(
  { id: userId, email: 'dantest1@gmail.com', userType: 'service_provider' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('🔑 Generated JWT token for user', userId);
console.log('Token:', token.substring(0, 50) + '...\n');

async function testBookingUpdate() {
  try {
    // Step 1: Get bookings
    console.log('📋 Step 1: Getting bookings...');
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings/provider', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const bookingsData = await bookingsResponse.json();
    console.log(`Status: ${bookingsResponse.status}`);
    console.log(`Bookings found: ${bookingsData.bookings ? bookingsData.bookings.length : 0}\n`);
    
    if (!bookingsData.success || !bookingsData.bookings || bookingsData.bookings.length === 0) {
      console.log('❌ No bookings found');
      return;
    }
    
    // Find a pending booking
    const pendingBooking = bookingsData.bookings.find(b => b.status === 'pending');
    
    if (!pendingBooking) {
      console.log('⚠️ No pending bookings found. Using first booking...');
      const testBooking = bookingsData.bookings[0];
      console.log(`Booking ${testBooking.id}: ${testBooking.service_title} - ${testBooking.status}\n`);
      
      // Try to update it
      console.log('📝 Step 2: Updating booking status...');
      const updateResponse = await fetch(`http://localhost:5000/api/bookings/${testBooking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      
      const updateData = await updateResponse.json();
      console.log(`Status: ${updateResponse.status}`);
      console.log('Response:', JSON.stringify(updateData, null, 2));
      
      if (updateData.success) {
        console.log('\n✅ Update successful!');
      } else {
        console.log(`\n❌ Update failed: ${updateData.message}`);
      }
      return;
    }
    
    console.log(`Found pending booking: ${pendingBooking.id}`);
    console.log(`Service: ${pendingBooking.service_title}`);
    console.log(`Status: ${pendingBooking.status}\n`);
    
    // Step 2: Update booking
    console.log('📝 Step 2: Updating booking to confirmed...');
    const updateResponse = await fetch(`http://localhost:5000/api/bookings/${pendingBooking.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'confirmed' })
    });
    
    const updateData = await updateResponse.json();
    console.log(`Status: ${updateResponse.status}`);
    console.log('Response:', JSON.stringify(updateData, null, 2));
    
    if (updateData.success) {
      console.log('\n✅ Update successful!');
      
      // Step 3: Test delete
      console.log('\n📝 Step 3: Testing delete...');
      const deleteResponse = await fetch(`http://localhost:5000/api/bookings/${pendingBooking.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log(`Status: ${deleteResponse.status}`);
      console.log('Response:', JSON.stringify(deleteData, null, 2));
      
      if (deleteData.success) {
        console.log('\n✅ Delete successful!');
      } else {
        console.log(`\n❌ Delete failed: ${deleteData.message}`);
      }
    } else {
      console.log(`\n❌ Update failed: ${updateData.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBookingUpdate();
