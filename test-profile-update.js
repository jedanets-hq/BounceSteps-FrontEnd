// Test script to diagnose profile update issue
const API_URL = 'https://isafarimasterorg.onrender.com/api';

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update...\n');
  
  // You need to replace this with a real token from your browser
  // 1. Login to the app
  // 2. Open browser console
  // 3. Run: JSON.parse(localStorage.getItem('isafari_user')).token
  // 4. Copy the token and paste it below
  
  const token = 'YOUR_TOKEN_HERE'; // Replace with actual token
  
  if (token === 'YOUR_TOKEN_HERE') {
    console.log('❌ Please replace YOUR_TOKEN_HERE with your actual JWT token');
    console.log('\nTo get your token:');
    console.log('1. Login to the app');
    console.log('2. Open browser console (F12)');
    console.log('3. Run: JSON.parse(localStorage.getItem("isafari_user")).token');
    console.log('4. Copy the token and paste it in this script\n');
    return;
  }
  
  // Test data
  const testData = {
    first_name: 'Test',
    last_name: 'Provider',
    phone: '+255123456789'
  };
  
  console.log('📤 Sending update request...');
  console.log('Data:', testData);
  console.log('Token:', token.substring(0, 20) + '...\n');
  
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\n📋 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Profile update successful!');
    } else {
      console.log('\n❌ Profile update failed!');
      console.log('Error:', data.message || data.error);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testProfileUpdate();
