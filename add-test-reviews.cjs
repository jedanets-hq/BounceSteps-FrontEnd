const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function addTestReviews() {
  try {
    console.log('🔄 Adding test reviews to services...\n');
    
    // Get all active services
    const servicesResult = await pool.query(`
      SELECT s.id, s.title, sp.user_id as provider_user_id
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
      LIMIT 10
    `);
    
    if (servicesResult.rows.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    console.log(`✅ Found ${servicesResult.rows.length} services\n`);
    
    // Get traveler users (not service providers)
    const travelersResult = await pool.query(`
      SELECT id, first_name, last_name
      FROM users
      WHERE role = 'traveler' AND is_active = true
      LIMIT 5
    `);
    
    if (travelersResult.rows.length === 0) {
      console.log('❌ No traveler users found');
      return;
    }
    
    console.log(`✅ Found ${travelersResult.rows.length} travelers\n`);
    
    const reviewTexts = [
      'Amazing experience! Highly recommended.',
      'Great service, very professional and friendly.',
      'Good value for money. Would book again.',
      'Excellent! Everything was perfect.',
      'Nice service, enjoyed every moment.',
      'Very satisfied with the quality.',
      'Outstanding service and attention to detail.',
      'Wonderful experience from start to finish.',
      'Fantastic! Exceeded my expectations.',
      'Really enjoyed this service.'
    ];
    
    let reviewsAdded = 0;
    
    // Add 2-3 reviews per service
    for (const service of servicesResult.rows) {
      const numReviews = Math.floor(Math.random() * 2) + 2; // 2-3 reviews
      
      console.log(`📝 Adding reviews for: ${service.title}`);
      
      for (let i = 0; i < numReviews && i < travelersResult.rows.length; i++) {
        const traveler = travelersResult.rows[i];
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const reviewText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        
        try {
          await pool.query(`
            INSERT INTO reviews (service_id, user_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
          `, [service.id, traveler.id, rating, reviewText]);
          
          console.log(`  ⭐ ${rating} stars by ${traveler.first_name} ${traveler.last_name}`);
          reviewsAdded++;
        } catch (err) {
          console.log(`  ⚠️ Skipped (already exists)`);
        }
      }
      console.log('');
    }
    
    console.log(`✅ Added ${reviewsAdded} reviews!\n`);
    
    // Verify ratings were updated
    const updatedServices = await pool.query(`
      SELECT id, title, average_rating
      FROM services
      WHERE id = ANY($1)
      ORDER BY average_rating DESC
    `, [servicesResult.rows.map(s => s.id)]);
    
    console.log('📊 Updated service ratings:');
    updatedServices.rows.forEach(s => {
      const rating = parseFloat(s.average_rating || 0).toFixed(2);
      const stars = '⭐'.repeat(Math.round(rating));
      console.log(`  ${stars} ${rating} - ${s.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

addTestReviews();
