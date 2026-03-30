require('dotenv').config({ path: './backend/.env' });
const {pool} = require('./backend/config/postgresql');

async function checkOrphanServices() {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.provider_id,
        s.category,
        CASE 
          WHEN u.id IS NULL THEN 'User Missing'
          WHEN sp.id IS NULL THEN 'ServiceProvider Missing'
          ELSE 'OK'
        END as status
      FROM services s
      LEFT JOIN users u ON s.provider_id = u.id
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE u.id IS NULL OR sp.id IS NULL
      ORDER BY s.id
    `);
    
    console.log(`Found ${result.rows.length} orphan services:\n`);
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Provider: ${row.provider_id}, Status: ${row.status}`);
    });
    
    // Get a valid provider to reassign to
    const validProvider = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 1
    `);
    
    if (validProvider.rows.length > 0) {
      console.log('\n✅ Valid provider found for reassignment:');
      console.log(`   User ID: ${validProvider.rows[0].user_id}`);
      console.log(`   Business: ${validProvider.rows[0].business_name}`);
      console.log(`   Email: ${validProvider.rows[0].email}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkOrphanServices();
