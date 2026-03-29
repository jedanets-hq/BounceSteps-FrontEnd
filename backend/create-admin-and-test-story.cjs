const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function setup() {
  try {
    console.log('🔧 Setting up test data...\n');
    
    // 1. Create admin user if not exists
    const adminCheck = await pool.query(`
      SELECT id, email FROM users WHERE user_type = 'admin' LIMIT 1
    `);
    
    let adminId;
    if (adminCheck.rows.length === 0) {
      console.log('📝 Creating admin user...');
      // Using a pre-hashed password for 'admin123'
      const hashedPassword = '$2b$10$rKZLvXZvXZvXZvXZvXZvXeO7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J';
      
      const newAdmin = await pool.query(`
        INSERT INTO users (
          first_name, last_name, email, password, user_type, is_verified, is_active
        ) VALUES (
          'Admin', 'User', 'admin@isafari.com', $1, 'admin', true, true
        )
        RETURNING id, email
      `, [hashedPassword]);
      
      adminId = newAdmin.rows[0].id;
      console.log('✅ Admin created:', newAdmin.rows[0].email);
      console.log('   Password: admin123\n');
    } else {
      adminId = adminCheck.rows[0].id;
      console.log('✅ Admin user exists:', adminCheck.rows[0].email, '\n');
    }
    
    // 2. Get a traveler user
    const travelerCheck = await pool.query(`
      SELECT id, first_name, last_name, email 
      FROM users 
      WHERE user_type = 'traveler' 
      LIMIT 1
    `);
    
    if (travelerCheck.rows.length === 0) {
      console.log('❌ No traveler user found!');
      return;
    }
    
    const traveler = travelerCheck.rows[0];
    console.log('✅ Using traveler:', traveler.email, '\n');
    
    // 3. Create test stories with different statuses
    console.log('📝 Creating test stories...\n');
    
    const stories = [
      {
        title: 'Amazing Safari in Serengeti',
        content: 'I had the most incredible experience exploring the Serengeti National Park. The wildlife was breathtaking, and our guide was extremely knowledgeable. We saw lions, elephants, and even witnessed the great migration. This trip exceeded all my expectations!',
        location: 'Serengeti National Park, Tanzania',
        trip_date: '2026-02-15',
        status: 'pending'
      },
      {
        title: 'Climbing Mount Kilimanjaro',
        content: 'Reaching the summit of Kilimanjaro was a life-changing experience. The journey was challenging but incredibly rewarding. Our porters and guides were amazing, and the views from the top were absolutely stunning. Highly recommend this adventure!',
        location: 'Mount Kilimanjaro, Tanzania',
        trip_date: '2026-01-20',
        status: 'pending'
      },
      {
        title: 'Zanzibar Beach Paradise',
        content: 'The beaches in Zanzibar are absolutely pristine. Crystal clear waters, white sand, and amazing local cuisine. We stayed in Stone Town and explored the spice farms. A perfect relaxation destination after our safari adventure.',
        location: 'Zanzibar, Tanzania',
        trip_date: '2026-02-01',
        status: 'approved'
      }
    ];
    
    for (const story of stories) {
      const result = await pool.query(`
        INSERT INTO traveler_stories (
          user_id, title, content, location, trip_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, status
      `, [traveler.id, story.title, story.content, story.location, story.trip_date, story.status]);
      
      console.log(`✅ Created: [${result.rows[0].status}] ${result.rows[0].title}`);
    }
    
    // 4. Show summary
    console.log('\n📊 Summary:');
    const statusCounts = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM traveler_stories
      GROUP BY status
    `);
    
    statusCounts.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });
    
    console.log('\n✅ Setup complete!');
    console.log('\n📋 Test credentials:');
    console.log('   Admin: admin@isafari.com / admin123');
    console.log('   Traveler:', traveler.email, '(use existing password)\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setup();
