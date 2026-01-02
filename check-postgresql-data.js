const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { pool } = require('./config/postgresql');

async function checkDatabaseStatus() {
  console.log('\n🔍 CHECKING POSTGRESQL DATABASE STATUS...\n');
  console.log('═'.repeat(50));

  try {
    // Check connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'iSafari-Global-Network'}`);
    console.log(`🖥️  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`🔌 Port: ${process.env.DB_PORT || 5432}`);
    client.release();

    console.log('\n📁 TABLE COUNTS:');
    console.log('─'.repeat(50));

    const tables = [
      'users',
      'service_providers',
      'services',
      'bookings',
      'reviews',
      'payments',
      'notifications',
      'traveler_stories',
      'story_likes',
      'story_comments',
      'service_promotions'
    ];

    let totalRecords = 0;

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        totalRecords += count;
        console.log(`  ${table.padEnd(25)} : ${count} records`);
      } catch (error) {
        console.log(`  ${table.padEnd(25)} : ❌ Error - ${error.message}`);
      }
    }

    console.log('─'.repeat(50));
    console.log(`  ${'TOTAL'.padEnd(25)} : ${totalRecords} records`);

    // Show sample data from users table
    console.log('\n👥 SAMPLE USERS:');
    console.log('─'.repeat(50));
    const users = await pool.query('SELECT id, email, user_type, created_at FROM users LIMIT 5');
    if (users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`  ID: ${user.id} | ${user.email} | ${user.user_type} | ${user.created_at}`);
      });
    } else {
      console.log('  No users found');
    }

    // Show sample data from services table
    console.log('\n🎯 SAMPLE SERVICES:');
    console.log('─'.repeat(50));
    const services = await pool.query('SELECT id, title, category, price, created_at FROM services LIMIT 5');
    if (services.rows.length > 0) {
      services.rows.forEach(service => {
        console.log(`  ID: ${service.id} | ${service.title} | ${service.category} | ${service.price} TZS`);
      });
    } else {
      console.log('  No services found');
    }

    console.log('\n✅ DATABASE CHECK COMPLETE!');
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the check function
checkDatabaseStatus()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
