const { pool } = require('./backend/models');

async function addMoreServices() {
  try {
    console.log('🔧 Adding more services to database...\n');
    
    // Get existing providers
    const providers = await pool.query('SELECT id, business_name FROM service_providers ORDER BY id');
    
    if (providers.rows.length === 0) {
      console.log('❌ No providers found!');
      return;
    }
    
    console.log(`Found ${providers.rows.length} providers:\n`);
    providers.rows.forEach(p => {
      console.log(`  - Provider ${p.id}: ${p.business_name}`);
    });
    
    // Sample services to add
    const newServices = [
      {
        provider_id: providers.rows[0].id, // First provider
        title: 'Serengeti Safari Tour',
        description: 'Experience the great migration and wildlife in Serengeti National Park',
        category: 'Tours & Activities',
        price: 250000,
        location: 'Serengeti, Tanzania',
        region: 'Mara',
        district: 'Serengeti',
        area: 'Seronera',
        images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801'],
        amenities: ['Guide', 'Transport', 'Meals', 'Park Fees'],
        is_active: true,
        status: 'active'
      },
      {
        provider_id: providers.rows[1]?.id || providers.rows[0].id,
        title: 'Zanzibar Beach Resort',
        description: 'Luxury beachfront accommodation with stunning ocean views',
        category: 'Accommodation',
        price: 180000,
        location: 'Zanzibar, Tanzania',
        region: 'Zanzibar',
        district: 'Unguja',
        area: 'Nungwi',
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Beach Access'],
        is_active: true,
        status: 'active'
      },
      {
        provider_id: providers.rows[2]?.id || providers.rows[0].id,
        title: 'Kilimanjaro Hiking Adventure',
        description: 'Climb Africa\'s highest peak with experienced guides',
        category: 'Tours & Activities',
        price: 500000,
        location: 'Moshi, Tanzania',
        region: 'Kilimanjaro',
        district: 'Moshi',
        area: 'Maran