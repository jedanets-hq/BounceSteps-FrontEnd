const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function runMigration() {
  try {
    console.log('🚀 Running admin tables migration...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'create-admin-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('✅ Admin tables created successfully!\n');
    
    // Verify tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('admin_users', 'admin_audit_log', 'provider_badges')
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));
    
    // Check admin user
    const adminCheck = await pool.query('SELECT email, full_name, role FROM admin_users');
    console.log('\n👤 Admin users:');
    console.table(adminCheck.rows);
    
    console.log('\n🔑 Default admin credentials:');
    console.log('  Email: admin@isafari.global');
    console.log('  Password: admin123');
    console.log('\n⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

runMigration();
