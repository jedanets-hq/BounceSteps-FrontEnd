const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkAdminInUsers() {
  try {
    console.log('🔍 Checking for admin users in users table...\n');

    const result = await pool.query(`
      SELECT id, email, first_name, last_name, user_type, created_at
      FROM users
      WHERE user_type = 'admin'
      ORDER BY created_at DESC;
    `);

    console.log(`Found ${result.rows.length} admin users:`);
    result.rows.forEach(admin => {
      console.log(`  - ID: ${admin.id}, Email: ${admin.email}, Name: ${admin.first_name} ${admin.last_name}`);
    });

    if (result.rows.length === 0) {
      console.log('\n⚠️  No admin users found in users table!');
      console.log('Creating admin user...');

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const insertResult = await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, user_type, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, user_type;
      `, ['admin@isafari.com', hashedPassword, 'Admin', 'User', 'admin', true]);

      console.log('✅ Admin user created:', insertResult.rows[0]);
    }

    console.log('\n✅ Check completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminInUsers();
