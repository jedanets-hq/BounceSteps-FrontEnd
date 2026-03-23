const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testWorkflow() {
  try {
    console.log('🧪 Testing Traveler Stories Workflow\n');
    
    // 1. Check if we have a traveler user
    const travelerCheck = await pool.query(`
      SELECT id, first_name, last_name, email 
      FROM users 
      WHERE user_type = 'traveler' 
      LIMIT 1
    `);
    
    if (travelerCheck.rows.length === 0) {
      console.log('❌ No traveler user found. Creating test traveler...');
      
      const newTraveler = await pool.query(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, user_type, is_verified
        ) VALUES (
          'Test', 'Traveler', 'test.traveler@isafari.com', 
          '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'traveler', true
        )
        RETURNING id, first_name, last_name, email
      `);
      
      console.log('✅ Created test traveler:', newTraveler.rows[0]);
      console.log('   Email: test.traveler@isafari.com');
      console.log('   Password: password123\n');
    } else {
      console.log('✅ Found traveler user:', travelerCheck.rows[0], '\n');
    }
    
    // 2. Check if we have an admin user
    const adminCheck = await pool.query(`
      SELECT id, first_name, last_name, email 
      FROM users 
      WHERE user_type = 'admin' 
      LIMIT 1
    `);
    
    if (adminCheck.rows.length === 0) {
      console.log('❌ No admin user found. Creating test admin...');
      
      const newAdmin = await pool.query(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, user_type, is_verified
        ) VALUES (
          'Admin', 'User', 'admin@isafari.com', 
          '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'admin', true
        )
        RETURNING id, first_name, last_name, email
      `);
      
      console.log('✅ Created test admin:', newAdmin.rows[0]);
      console.log('   Email: admin@isafari.com');
      console.log('   Password: password123\n');
    } else {
      console.log('✅ Found admin user:', adminCheck.rows[0], '\n');
    }
    
    // 3. Create a test story
    const traveler = travelerCheck.rows[0] || (await pool.query(`
      SELECT id FROM users WHERE user_type = 'traveler' LIMIT 1
    `)).rows[0];
    
    console.log('📝 Creating test story...');
    const testStory = await pool.query(`
      INSERT INTO traveler_stories (
        user_id, title, content, location, trip_date, status
      ) VALUES (
        $1, 
        'Amazing Safari Experience in Serengeti', 
        'I had the most incredible experience exploring the Serengeti National Park. The wildlife was breathtaking, and our guide was extremely knowledgeable. We saw lions, elephants, and even witnessed the great migration. This trip exceeded all my expectations!',
        'Serengeti National Park, Tanzania',
        '2026-02-15',
        'pending'
      )
      RETURNING id, title, status
    `, [traveler.id]);
    
    console.log('✅ Created test story:', testStory.rows[0], '\n');
    
    // 4. Show current stories by status
    const statusCounts = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM traveler_stories
      GROUP BY status
    `);
    
    console.log('📊 Stories by status:');
    statusCounts.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });
    
    console.log('\n✅ Workflow test complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Login as traveler and create a story from dashboard');
    console.log('   2. Login as admin and approve/reject stories');
    console.log('   3. Check homepage to see approved stories\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testWorkflow();
