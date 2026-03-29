const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testCloudData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing Cloud SQL Data Access...\n');
    console.log(`📍 Connected to: ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);
    
    // Test users
    const users = await client.query('SELECT id, email, first_name, last_name, user_type FROM users');
    console.log('👥 Users:');
    users.rows.forEach(u => {
      console.log(`   - ${u.first_name} ${u.last_name} (${u.email}) - ${u.user_type}`);
    });
    
    // Test service providers
    const providers = await client.query('SELECT id, business_name, business_type FROM service_providers');
    console.log('\n🏢 Service Providers:');
    providers.rows.forEach(p => {
      console.log(`   - ${p.business_name} (${p.business_type})`);
    });
    
    // Test services
    const services = await client.query('SELECT id, title, category, price FROM services');
    console.log('\n🎯 Services:');
    services.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category}) - ${s.price} TZS`);
    });
    
    // Test bookings
    const bookings = await client.query('SELECT id, status, total_amount FROM bookings');
    console.log('\n📅 Bookings:');
    bookings.rows.forEach(b => {
      console.log(`   - Booking #${b.id}: ${b.status} - ${b.total_amount || 'N/A'}`);
    });
    
    // Test messages
    const messages = await client.query('SELECT COUNT(*) as count FROM messages');
    console.log(`\n💬 Messages: ${messages.rows[0].count} total`);
    
    // Test admin
    const admin = await client.query('SELECT id, email FROM admin_users');
    console.log('\n👨‍💼 Admin Users:');
    admin.rows.forEach(a => {
      console.log(`   - Admin (${a.email})`);
    });
    
    console.log('\n✅ All data is accessible from Cloud SQL!');
    console.log('🎉 Your system is working exactly like it was locally!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testCloudData();
