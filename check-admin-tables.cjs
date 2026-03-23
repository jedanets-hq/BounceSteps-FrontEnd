const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://isafari_db_user:@Jctnftr01@dpg-cu2bnhm8ii6s73a5rvog-a.oregon-postgres.render.com/isafari_db',
  ssl: { rejectUnauthorized: false }
});

async function checkAdminTables() {
  try {
    console.log('🔍 Checking for admin tables...\n');
    
    // Check for admin_users table
    const adminUsersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `);
    
    console.log('admin_users table exists:', adminUsersCheck.rows[0].exists);
    
    if (adminUsersCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) FROM admin_users');
      console.log('admin_users count:', count.rows[0].count);
      
      const admins = await pool.query('SELECT id, email, role, is_active FROM admin_users');
      console.log('\nAdmin users:');
      console.table(admins.rows);
    }
    
    // Check for admin_audit_log table
    const auditLogCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_audit_log'
      );
    `);
    
    console.log('\nadmin_audit_log table exists:', auditLogCheck.rows[0].exists);
    
    // Check for provider_badges table
    const badgesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_badges'
      );
    `);
    
    console.log('provider_badges table exists:', badgesCheck.rows[0].exists);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminTables();
