const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testServiceProviderIssues() {
  try {
    console.log('🔍 Testing Service Provider Issues...\n');
    
    // 1. Get a sample service to test
    const servicesResult = await pool.query(`
      SELECT s.*, sp.business_name, sp.user_id
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
      LIMIT 1
    `);
    
    if (servicesResult.rows.length === 0) {
      console.log('❌ No active services found in database');
      return;
    }
    
    const service = servicesResult.rows[0];
    console.log('📦 Sample Service Found:');
    console.log('  ID:', service.id);
    console.log('  Title:', service.title);
    console.log('  Provider:', service.business_name);
    console.log('  Is Active:', service.is_active);
    console.log('  Payment Methods:', service.payment_methods);
    console.log('  Contact Info:', service.contact_info);
    console.log('  Images:', service.images);
    console.log('');
    
    // 2. Test pause functionality (toggle is_active)
    console.log('🔄 Testing PAUSE functionality...');
    const newStatus = !service.is_active;
    const pauseResult = await pool.query(
      'UPDATE services SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, service.id]
    );
    
    if (pauseResult.rows.length > 0) {
      console.log('✅ Pause/Activate works!');
      console.log('  New Status:', pauseResult.rows[0].is_active);
      
      // Revert back
      await pool.query(
        'UPDATE services SET is_active = $1 WHERE id = $2',
        [service.is_active, service.id]
      );
      console.log('  Reverted to original status');
    } else {
      console.log('❌ Pause/Activate failed!');
    }
    console.log('');
    
    // 3. Test edit functionality
    console.log('📝 Testing EDIT functionality...');
    const updatedTitle = service.title + ' (TEST EDIT)';
    const editResult = await pool.query(`
      UPDATE services SET
        title = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [updatedTitle, service.description, service.id]);
    
    if (editResult.rows.length > 0) {
      console.log('✅ Edit works!');
      console.log('  Updated Title:', editResult.rows[0].title);
      console.log('  Payment Methods preserved:', editResult.rows[0].payment_methods);
      console.log('  Contact Info preserved:', editResult.rows[0].contact_info);
      
      // Revert back
      await pool.query(
        'UPDATE services SET title = $1 WHERE id = $2',
        [service.title, service.id]
      );
      console.log('  Reverted to original title');
    } else {
      console.log('❌ Edit failed!');
    }
    console.log('');
    
    // 4. Check if data is being fetched correctly
    console.log('📡 Testing data fetch from /services/provider/my-services...');
    const myServicesResult = await pool.query(`
      SELECT 
        s.*,
        sp.business_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT b.id) as total_bookings
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN reviews r ON s.id = r.service_id
      LEFT JOIN bookings b ON s.id = b.service_id
      WHERE sp.user_id = $1
      GROUP BY s.id, sp.business_name
      ORDER BY s.created_at DESC
    `, [service.user_id]);
    
    console.log(`✅ Found ${myServicesResult.rows.length} services for this provider`);
    if (myServicesResult.rows.length > 0) {
      const firstService = myServicesResult.rows[0];
      console.log('  First Service:');
      console.log('    Title:', firstService.title);
      console.log('    Is Active:', firstService.is_active);
      console.log('    Payment Methods:', firstService.payment_methods);
      console.log('    Contact Info:', firstService.contact_info);
    }
    console.log('');
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testServiceProviderIssues();
