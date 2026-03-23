const fetch = require('node-fetch');

async function testProfileUpdate() {
  try {
    console.log('🔍 Testing profile update...\n');
    
    // First, login as a service provider
    console.log('1️⃣ Logging in as service provider...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'dantest1@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginData.user.id);
    const token = loginData.token;
    
    // Test 1: Update user profile
    console.log('\n2️⃣ Testing user profile update...');
    const userUpdateResponse = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        first_name: 'Dan Updated',
        last_name: 'Test Updated',
        phone: '+255123456789'
      })
    });
    
    const userUpdateData = await userUpdateResponse.json();
    console.log('User update response:', userUpdateData);
    
    // Test 2: Update business profile
    console.log('\n3️⃣ Testing business profile update...');
    const businessUpdateResponse = await fetch('http://localhost:5000/api/users/business-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        business_name: 'Updated Business Name',
        business_type: 'Tour Operator',
        service_location: 'Dar es Salaam, Tanzania',
        service_categories: ['Tours & Activities', 'Transportation'],
        location_data: {
          region: 'Dar es Salaam',
          district: 'Kinondoni',
          ward: 'Mikocheni',
          street: 'Test Street'
        },
        description: 'This is an updated business description for testing.'
      })
    });
    
    const businessUpdateData = await businessUpdateResponse.json();
    console.log('Business update response:', businessUpdateData);
    
    // Test 3: Fetch profile to verify changes
    console.log('\n4️⃣ Fetching profile to verify changes...');
    const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const profileData = await profileResponse.json();
    console.log('Profile data:', JSON.stringify(profileData, null, 2));
    
    // Test 4: Change password
    console.log('\n5️⃣ Testing password change...');
    const passwordChangeResponse = await fetch('http://localhost:5000/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      })
    });
    
    const passwordChangeData = await passwordChangeResponse.json();
    console.log('Password change response:', passwordChangeData);
    
    // Test 5: Try logging in with new password
    if (passwordChangeData.success) {
      console.log('\n6️⃣ Testing login with new password...');
      const newLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'dantest1@gmail.com',
          password: 'newpassword123'
        })
      });
      
      const newLoginData = await newLoginResponse.json();
      console.log('New login response:', newLoginData.success ? '✅ Success!' : '❌ Failed');
      
      // Change password back
      if (newLoginData.success) {
        console.log('\n7️⃣ Changing password back to original...');
        const revertPasswordResponse = await fetch('http://localhost:5000/api/users/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newLoginData.token}`
          },
          body: JSON.stringify({
            currentPassword: 'newpassword123',
            newPassword: 'password123'
          })
        });
        
        const revertPasswordData = await revertPasswordResponse.json();
        console.log('Password reverted:', revertPasswordData.success ? '✅ Success!' : '❌ Failed');
      }
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testProfileUpdate();
