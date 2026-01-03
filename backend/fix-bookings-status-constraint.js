/**
 * Fix Bookings Status Constraint
 * 
 * TATIZO: Database constraint "bookings_status_check" haina 'draft' status
 * SULUHISHO: Kubadilisha constraint kuongeza 'draft'
 * 
 * Run: node backend/fix-bookings-status-constraint.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixBookingsStatusConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing bookings status constraint...\n');
    
    // 1. Check current constraint
    console.log('1️⃣ Checking current constraint...');
    const constraintCheck = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass AND contype = 'c'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log('   Current constraints:');
      constraintCheck.rows.forEach(row => {
        console.log(`   - ${row.conname}: ${row.definition}`);
      });
    } else {
      console.log('   No check constraints found');
    }
    
    // 2. Drop existing constraint
    console.log('\n2️⃣ Dropping existing constraint...');
    await client.query(`
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check
    `);
    console.log('   ✅ Constraint dropped');
    
    // 3. Add new constraint with 'draft' included
    console.log('\n3️⃣ Adding new constraint with draft status...');
    await client.query(`
      ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
      CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))
    `);
    console.log('   ✅ New constraint added');
    
    // 4. Verify the change
    console.log('\n4️⃣ Verifying the change...');
    const verifyCheck = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass AND contype = 'c'
    `);
    
    if (verifyCheck.rows.length > 0) {
      console.log('   Updated constraints:');
      verifyCheck.rows.forEach(row => {
        console.log(`   - ${row.conname}: ${row.definition}`);
      });
    }
    
    // 5. Test by creating a draft booking (then delete it)
    console.log('\n5️⃣ Testing draft status...');
    try {
      // Get a test service
      const serviceResult = await client.query('SELECT id, provider_id FROM services LIMIT 1');
      if (serviceResult.rows.length > 0) {
        const service = serviceResult.rows[0];
        
        // Get a test user
        const userResult = await client.query("SELECT id FROM users WHERE user_type = 'traveler' LIMIT 1");
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          
          // Try to create a draft booking
          const testBooking = await client.query(`
            INSERT INTO bookings (traveler_id, service_id, provider_id, booking_date, status, payment_status, total_amount)
            VALUES ($1, $2, $3, CURRENT_DATE, 'draft', 'pending', 0)
            RETURNING id, status
          `, [userId, service.id, service.provider_id]);
          
          console.log(`   ✅ Test draft booking created: ID ${testBooking.rows[0].id}, Status: ${testBooking.rows[0].status}`);
          
          // Delete test booking
          await client.query('DELETE FROM bookings WHERE id = $1', [testBooking.rows[0].id]);
          console.log('   ✅ Test booking deleted');
        }
      }
    } catch (testError) {
      console.log('   ⚠️ Test skipped:', testError.message);
    }
    
    console.log('\n✅ CONSTRAINT FIXED SUCCESSFULLY!');
    console.log('\n📋 Status values now allowed:');
    console.log('   - draft (NEW - for pre-orders before submission)');
    console.log('   - pending (submitted to provider)');
    console.log('   - confirmed (provider accepted)');
    console.log('   - cancelled');
    console.log('   - completed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixBookingsStatusConstraint()
  .then(() => {
    console.log('\n🎉 Done! Pre-Order button should work now.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
