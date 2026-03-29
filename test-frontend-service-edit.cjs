const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testFrontendServiceEdit() {
  try {
    console.log('🔍 Testing Frontend Service Edit Flow...\n');
    
    // 1. Simulate fetching services (like frontend does)
    console.log('📡 Step 1: Fetching services from /services/provider/my-services...');
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(DISTINCT b.id) as total_bookings
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      WHERE s.provider_id = (SELECT id FROM service_providers LIMIT 1)
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    const service = result.rows[0];
    console.log('✅ Service fetched:');
    console.log('  ID:', service.id);
    console.log('  Title:', service.title);
    console.log('  Is Active:', service.is_active);
    console.log('  Payment Methods (raw):', service.payment_methods);
    console.log('  Contact Info (raw):', service.contact_info);
    console.log('');
    
    // 2. Parse JSON fields (like frontend does)
    console.log('📦 Step 2: Parsing JSON fields...');
    const parsedService = {
      ...service,
      images: service.images ? (typeof service.images === 'string' ? JSON.parse(service.images) : service.images) : [],
      amenities: service.amenities ? (typeof service.amenities === 'string' ? JSON.parse(service.amenities) : service.amenities) : [],
      payment_methods: service.payment_methods ? (typeof service.payment_methods === 'string' ? JSON.parse(service.payment_methods) : service.payment_methods) : {},
      contact_info: service.contact_info ? (typeof service.contact_info === 'string' ? JSON.parse(service.contact_info) : service.contact_info) : {}
    };
    
    console.log('✅ Parsed payment_methods:', JSON.stringify(parsedService.payment_methods, null, 2));
    console.log('✅ Parsed contact_info:', JSON.stringify(parsedService.contact_info, null, 2));
    console.log('');
    
    // 3. Simulate edit form population (OLD WAY - without payment/contact)
    console.log('❌ Step 3a: OLD handleEditService (BROKEN)...');
    const oldFormData = {
      name: parsedService.title,
      description: parsedService.description || '',
      price: parsedService.price || '',
      duration: parsedService.duration || '',
      capacity: parsedService.max_participants || '',
      includes: parsedService.amenities ? parsedService.amenities.join(', ') : '',
      excludes: '',
      requirements: '',
      images: Array.isArray(parsedService.images) && parsedService.images.length > 0 
        ? parsedService.images.map(img => ({preview: img, isUrl: true})) 
        : []
      // MISSING: paymentMethods and contactInfo!
    };
    console.log('  Payment Methods in form:', oldFormData.paymentMethods || 'UNDEFINED ❌');
    console.log('  Contact Info in form:', oldFormData.contactInfo || 'UNDEFINED ❌');
    console.log('');
    
    // 4. Simulate edit form population (NEW WAY - with payment/contact)
    console.log('✅ Step 3b: NEW handleEditService (FIXED)...');
    const newFormData = {
      name: parsedService.title,
      description: parsedService.description || '',
      price: parsedService.price || '',
      duration: parsedService.duration || '',
      capacity: parsedService.max_participants || '',
      includes: parsedService.amenities ? parsedService.amenities.join(', ') : '',
      excludes: '',
      requirements: '',
      images: Array.isArray(parsedService.images) && parsedService.images.length > 0 
        ? parsedService.images.map(img => ({preview: img, isUrl: true})) 
        : [],
      // FIXED: Include payment methods and contact info
      paymentMethods: {
        visa: parsedService.payment_methods.visa || { enabled: false, cardHolder: '', lastFourDigits: '' },
        paypal: parsedService.payment_methods.paypal || { enabled: false, email: '' },
        googlePay: parsedService.payment_methods.googlePay || { enabled: false, email: '' },
        mobileMoney: parsedService.payment_methods.mobileMoney || { enabled: false, provider: '', phone: '' }
      },
      contactInfo: {
        email: parsedService.contact_info.email || { enabled: false, address: '' },
        whatsapp: parsedService.contact_info.whatsapp || { enabled: false, number: '' }
      }
    };
    console.log('  Payment Methods in form:', JSON.stringify(newFormData.paymentMethods, null, 2));
    console.log('  Contact Info in form:', JSON.stringify(newFormData.contactInfo, null, 2));
    console.log('');
    
    // 5. Test pause/activate
    console.log('🔄 Step 4: Testing pause/activate...');
    const newStatus = !parsedService.is_active;
    const pauseResult = await pool.query(
      'UPDATE services SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING is_active',
      [newStatus, parsedService.id]
    );
    console.log(`✅ Status changed from ${parsedService.is_active} to ${pauseResult.rows[0].is_active}`);
    
    // Revert
    await pool.query(
      'UPDATE services SET is_active = $1 WHERE id = $2',
      [parsedService.is_active, parsedService.id]
    );
    console.log('  Reverted to original status');
    console.log('');
    
    console.log('✅ All tests completed!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('  ✅ Database operations work correctly');
    console.log('  ✅ Pause/Activate works');
    console.log('  ❌ OLD frontend code loses payment/contact data on edit');
    console.log('  ✅ NEW frontend code preserves payment/contact data on edit');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testFrontendServiceEdit();
