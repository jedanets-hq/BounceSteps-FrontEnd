const { pool } = require('./backend/models');

async function testReviewsSystem() {
  try {
    console.log('🧪 Testing Reviews System...\n');
    
    // 1. Check if reviews table exists
    console.log('1️⃣ Checking reviews table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Reviews table exists\n');
      
      // 2. Check table structure
      console.log('2️⃣ Checking table structure...');
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reviews'
        ORDER BY ordinal_position;
      `);
      console.log('Columns:', columns.rows);
      console.log('');
      
      // 3. Check if there are any reviews
      console.log('3️⃣ Checking existing reviews...');
      const reviewsCount = await pool.query('SELECT COUNT(*) FROM reviews');
      console.log(`Total reviews: ${reviewsCount.rows[0].count}\n`);
      
      // 4. Check services with average_rating
      console.log('4️⃣ Checking services with ratings...');
      const servicesWithRatings = await pool.query(`
        SELECT id, title, average_rating 
        FROM services 
        WHERE average_rating > 0 
        LIMIT 5
      `);
      console.log('Services with ratings:', servicesWithRatings.rows);
      console.log('');
      
      // 5. Test review submission (if we have a service and user)
      console.log('5️⃣ Testing review submission...');
      const testService = await pool.query('SELECT id FROM services LIMIT 1');
      const testUser = await pool.query('SELECT id FROM users LIMIT 1');
      
      if (testService.rows.length > 0 && testUser.rows.length > 0) {
        const serviceId = testService.rows[0].id;
        const userId = testUser.rows[0].id;
        
        // Check if review already exists
        const existingReview = await pool.query(
          'SELECT id FROM reviews WHERE service_id = $1 AND user_id = $2',
          [serviceId, userId]
        );
        
        if (existingReview.rows.length === 0) {
          // Insert test review
          const newReview = await pool.query(`
            INSERT INTO reviews (service_id, user_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [serviceId, userId, 5, 'Test review - Great service!']);
          
          console.log('✅ Test review created:', newReview.rows[0]);
          
          // Check if service rating was updated
          const updatedService = await pool.query(
            'SELECT average_rating FROM services WHERE id = $1',
            [serviceId]
          );
          console.log('✅ Service rating updated to:', updatedService.rows[0].average_rating);
        } else {
          console.log('ℹ️  Test review already exists');
        }
      } else {
        console.log('⚠️  No services or users found for testing');
      }
      
      console.log('\n✅ Reviews system test completed!');
    } else {
      console.log('❌ Reviews table does not exist!');
      console.log('Run the migration: backend/migrations/create-reviews-table.sql');
    }
    
  } catch (error) {
    console.error('❌ Error testing reviews system:', error);
  } finally {
    await pool.end();
  }
}

testReviewsSystem();
