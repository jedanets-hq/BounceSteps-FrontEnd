const { pool } = require('./config/postgresql');
require('dotenv').config();

console.log('🔍 Checking PostgreSQL Connection...\n');
console.log('📊 Database:', process.env.DB_NAME || 'iSafari-Global-Network');
console.log('📊 Host:', process.env.DB_HOST || 'localhost');
console.log('📊 Port:', process.env.DB_PORT || 5432);
console.log('\n════════════════════════════════════════\n');

async function checkDatabase() {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');

    // Get database name
    const dbResult = await client.query('SELECT current_database()');
    const dbName = dbResult.rows[0].current_database;
    console.log(`📊 Current Database: ${dbName}\n`);

    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📁 Tables in database:');
    console.log('─'.repeat(50));

    for (const table of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      const count = countResult.rows[0].count;
      console.log(`  • ${table.table_name.padEnd(30)} : ${count} records`);
    }

    console.log('\n════════════════════════════════════════\n');

    // Users table details
    console.log('\n👥 USERS TABLE DETAILS:');
    console.log('─'.repeat(50));
    const users = await client.query('SELECT id, email, user_type, created_at FROM users LIMIT 5');

    if (users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Type: ${user.user_type}`);
        console.log(`  Created: ${user.created_at}`);
        console.log('  ' + '─'.repeat(45));
      });
    } else {
      console.log('  No users found');
    }

    // Service providers table details
    console.log('\n\n🏢 SERVICE PROVIDERS TABLE:');
    console.log('─'.repeat(50));
    const providers = await client.query('SELECT id, business_name, business_type, rating FROM service_providers LIMIT 3');

    if (providers.rows.length > 0) {
      providers.rows.forEach(provider => {
        console.log(`  ID: ${provider.id}`);
        console.log(`  Business: ${provider.business_name}`);
        console.log(`  Type: ${provider.business_type}`);
        console.log(`  Rating: ${provider.rating}`);
        console.log('  ' + '─'.repeat(45));
      });
    } else {
      console.log('  No service providers found');
    }

    // Services table details
    console.log('\n\n🎯 SERVICES TABLE:');
    console.log('─'.repeat(50));
    const services = await client.query('SELECT id, title, category, price, is_active FROM services LIMIT 3');

    if (services.rows.length > 0) {
      services.rows.forEach(service => {
        console.log(`  ID: ${service.id}`);
        console.log(`  Title: ${service.title}`);
        console.log(`  Category: ${service.category}`);
        console.log(`  Price: ${service.price}`);
        console.log(`  Active: ${service.is_active}`);
        console.log('  ' + '─'.repeat(45));
      });
    } else {
      console.log('  No services found');
    }

    client.release();
    console.log('\n✅ Database check complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error checking database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkDatabase();
