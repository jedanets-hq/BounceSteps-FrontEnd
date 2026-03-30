const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('🔍 Testing Admin API Endpoint...\n');
    
    // First, login as admin to get token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@isafari.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Admin login failed:', loginData.message);
      console.log('Trying to create admin user...\n');
      
      // Try to create admin user
      const { Pool } = require('pg');
      const bcrypt = require('bcrypt');
      
      const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'isafari_db',
        user: 'postgres',
        password: '@Jctnftr01'
      });
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, user_type, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE
        SET password = $2, user_type = $5
      `, ['admin@isafari.com', hashedPassword, 'Admin', 'User', 'admin', true, true]);
      
      console.log('✅ Admin user created/updated\n');
      await pool.end();
      
      // Try login again
      const retryLogin = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@isafari.com',
          password: 'admin123'
        })
      });
      
      const retryData = await retryLogin.json();
      if (!retryData.success) {
        console.log('❌ Still failed to login:', retryData.message);
        return;
      }
      
      loginData.token = retryData.token;
      loginData.user = retryData.user;
    }
    
    console.log('✅ Admin logged in successfully');
    console.log('   User:', loginData.user.email, '- Type:', loginData.user.userType);
    console.log('   Token:', loginData.token.substring(0, 20) + '...\n');
    
    // Test the admin stories endpoint
    console.log('2️⃣ Testing /api/traveler-stories/admin/all endpoint...');
    const storiesResponse = await fetch('http://localhost:5000/api/traveler-stories/admin/all', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const storiesData = await storiesResponse.json();
    
    if (!storiesData.success) {
      console.log('❌ Failed to fetch stories:', storiesData.message);
      return;
    }
    
    console.log(`✅ Successfully fetched ${storiesData.stories.length} stories\n`);
    
    if (storiesData.stories.length > 0) {
      console.log('Stories:');
      storiesData.stories.forEach((story, index) => {
        console.log(`\n${index + 1}. ${story.title}`);
        console.log(`   Status: ${story.status}`);
        console.log(`   User: ${story.first_name} ${story.last_name}`);
        console.log(`   Email: ${story.email}`);
      });
    }
    
    // Test with status filter
    console.log('\n\n3️⃣ Testing with status filter (pending)...');
    const pendingResponse = await fetch('http://localhost:5000/api/traveler-stories/admin/all?status=pending', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const pendingData = await pendingResponse.json();
    console.log(`✅ Found ${pendingData.stories.length} pending stories\n`);
    
    console.log('✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAdminAPI();
