const { pool } = require('./config/postgresql');

async function testPostgreSQLSetup() {
  console.log('\n🧪 TESTING POSTGRESQL SETUP...\n');
  console.log('═'.repeat(60));

  let allTestsPassed = true;

  try {
    // Test 1: Connection
    console.log('\n📊 Test 1: Database Connection');
    console.log('─'.repeat(60));
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully');
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    client.release();

    // Test 2: Tables Exist
    console.log('\n📊 Test 2: Verify Tables Exist');
    console.log('─'.repeat(60));
    const tables = [
      'users', 'service_providers', 'services', 'bookings',
      'reviews', 'payments', 'notifications', 'traveler_stories',
      'story_likes', 'story_comments', 'service_promotions'
    ];

    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table "${table}" exists`);
      } catch (error) {
        console.log(`❌ Table "${table}" missing`);
        allTestsPassed = false;
      }
    }

    // Test 3: Test CRUD Operations
    console.log('\n📊 Test 3: CRUD Operations');
    console.log('─'.repeat(60));

    // Create test user
    console.log('Creating test user...');
    const createResult = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, user_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, ['test@postgresql.com', 'hashedpassword', 'Test', 'User', 'traveler']);
    
    if (createResult.rows.length > 0) {
      console.log('✅ CREATE operation successful');
      const testUserId = createResult.rows[0].id;

      // Read test user
      console.log('Reading test user...');
      const readResult = await pool.query('SELECT * FROM users WHERE id = $1', [testUserId]);
      if (readResult.rows.length > 0) {
        console.log('✅ READ operation successful');
      } else {
        console.log('❌ READ operation failed');
        allTestsPassed = false;
      }

      // Update test user
      console.log('Updating test user...');
      const updateResult = await pool.query(`
        UPDATE users SET first_name = $1 WHERE id = $2 RETURNING *
      `, ['Updated', testUserId]);
      if (updateResult.rows.length > 0 && updateResult.rows[0].first_name === 'Updated') {
        console.log('✅ UPDATE operation successful');
      } else {
        console.log('❌ UPDATE operation failed');
        allTestsPassed = false;
      }

      // Delete test user
      console.log('Deleting test user...');
      const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [testUserId]);
      if (deleteResult.rows.length > 0) {
        console.log('✅ DELETE operation successful');
      } else {
        console.log('❌ DELETE operation failed');
        allTestsPassed = false;
      }
    } else {
      console.log('❌ CREATE operation failed');
      allTestsPassed = false;
    }

    // Test 4: Foreign Key Constraints
    console.log('\n📊 Test 4: Foreign Key Constraints');
    console.log('─'.repeat(60));
    try {
      // Try to insert service with non-existent provider_id
      await pool.query(`
        INSERT INTO services (provider_id, title, price)
        VALUES ($1, $2, $3)
      `, [99999, 'Test Service', 100]);
      console.log('❌ Foreign key constraint not working');
      allTestsPassed = false;
    } catch (error) {
      if (error.code === '23503') {
        console.log('✅ Foreign key constraints working correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
        allTestsPassed = false;
      }
    }

    // Test 5: Unique Constraints
    console.log('\n📊 Test 5: Unique Constraints');
    console.log('─'.repeat(60));
    
    // Create first user
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, user_type)
      VALUES ($1, $2, $3, $4, $5)
    `, ['unique@test.com', 'pass', 'First', 'User', 'traveler']);
    
    try {
      // Try to create duplicate email
      await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, user_type)
        VALUES ($1, $2, $3, $4, $5)
      `, ['unique@test.com', 'pass', 'Second', 'User', 'traveler']);
      console.log('❌ Unique constraint not working');
      allTestsPassed = false;
    } catch (error) {
      if (error.code === '23505') {
        console.log('✅ Unique constraints working correctly');
      } else {
        console.log('❌ Unexpected error:', error.message);
        allTestsPassed = false;
      }
    }
    
    // Cleanup
    await pool.query(`DELETE FROM users WHERE email = 'unique@test.com'`);

    // Test 6: Check for MongoDB References
    console.log('\n📊 Test 6: Check for MongoDB References');
    console.log('─'.repeat(60));
    const fs = require('fs');
    const path = require('path');
    
    let mongoRefsFound = false;
    const modelsDir = path.join(__dirname, 'models');
    const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
    
    for (const file of modelFiles) {
      const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
      if (content.includes('mongoose') || content.includes('Schema')) {
        console.log(`❌ MongoDB reference found in ${file}`);
        mongoRefsFound = true;
        allTestsPassed = false;
      }
    }
    
    if (!mongoRefsFound) {
      console.log('✅ No MongoDB references found in models');
    }

    // Final Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('\n✅ PostgreSQL is configured correctly');
      console.log('✅ All tables exist');
      console.log('✅ CRUD operations work');
      console.log('✅ Constraints are enforced');
      console.log('✅ No MongoDB references');
      console.log('\n🚀 Your backend is ready to use PostgreSQL!');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('\nPlease review the errors above and fix them.');
    }
    
    console.log('\n' + '═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    allTestsPassed = false;
  } finally {
    await pool.end();
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
testPostgreSQLSetup();
