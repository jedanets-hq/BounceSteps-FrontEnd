const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function addTestServices() {
  try {
    console.log('🔧 Adding test services for all providers...\n');
    
    // Get all providers
    const providers = await pool.query(`
      SELECT sp.id, sp.business_name, sp.region, sp.district, sp.area, sp.location
      FROM service_providers sp
      ORDER BY sp.id
    `);
    
    console.log(`Found ${providers.rows.length} providers\n`);
    
    // Service templates for each category
    const serviceTemplates = [
      {
        category: 'Transportation',
        titles: ['Safari Vehicle Rental', 'Airport Transfer Service', 'City Tour Transport'],
        descriptions: ['Comfortable and reliable transportation for your safari adventure', 'Professional airport pickup and drop-off service', 'Explore the city with our guided transport service'],
        prices: [150000, 80000, 50000]
      },
      {
        category: 'Accommodation',
        titles: ['Luxury Safari Lodge', 'Budget Guesthouse', 'Beach Resort'],
        descriptions: ['Experience luxury in the heart of nature', 'Affordable and comfortable accommodation', 'Relax by the beach in our beautiful resort'],
        prices: [250000, 75000, 180000]
      },
      {
        category: 'Tours & Activities',
        titles: ['Wildlife Safari Tour', 'Cultural Village Visit', 'Mountain Hiking Adventure'],
        descriptions: ['Discover amazing wildlife in their natural habitat', 'Experience authentic local culture and traditions', 'Challenge yourself with breathtaking mountain views'],
        prices: [200000, 60000, 120000]
      }
    ];
    
    let servicesAdded = 0;
    
    for (const provider of providers.rows) {
      console.log(`\n📦 Adding services for: ${provider.business_name} (ID: ${provider.id})`);
      
      // Check if provider already has services
      const existingServices = await pool.query(
        'SELECT COUNT(*) as count FROM services WHERE provider_id = $1',
        [provider.id]
      );
      
      if (parseInt(existingServices.rows[0].count) > 0) {
        console.log(`   ⏭️  Already has ${existingServices.rows[0].count} service(s), skipping...`);
        continue;
      }
      
      // Add 2-3 services per provider
      const numServices = Math.floor(Math.random() * 2) + 2; // 2 or 3 services
      
      for (let i = 0; i < numServices; i++) {
        const template = serviceTemplates[i % serviceTemplates.length];
        const titleIndex = Math.floor(Math.random() * template.titles.length);
        
        const service = {
          title: template.titles[titleIndex],
          description: template.descriptions[titleIndex],
          category: template.category,
          price: template.prices[titleIndex],
          location: provider.location || 'Tanzania',
          region: provider.region || '',
          district: provider.district || '',
          area: provider.area || '',
          images: JSON.stringify([]),
          amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Professional Guide']),
          payment_methods: JSON.stringify({
            visa: { enabled: true },
            mobileMoney: { enabled: true, provider: 'M-Pesa' }
          }),
          contact_info: JSON.stringify({
            email: { enabled: true, address: 'info@example.com' },
            whatsapp: { enabled: true, number: '+255712345678' }
          })
        };
        
        await pool.query(`
          INSERT INTO services (
            provider_id, title, description, category, price,
            location, region, district, area, country,
            images, amenities, payment_methods, contact_info,
            status, is_active, is_featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          provider.id,
          service.title,
          service.description,
          service.category,
          service.price,
          service.location,
          service.region,
          service.district,
          service.area,
          'Tanzania',
          service.images,
          service.amenities,
          service.payment_methods,
          service.contact_info,
          'active',
          true,
          i === 0 // First service is featured
        ]);
        
        console.log(`   ✅ Added: ${service.title} (${service.category})`);
        servicesAdded++;
      }
    }
    
    console.log(`\n\n✅ Successfully added ${servicesAdded} services!`);
    
    // Show final count
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM services');
    console.log(`📊 Total services in database: ${finalCount.rows[0].count}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addTestServices();
