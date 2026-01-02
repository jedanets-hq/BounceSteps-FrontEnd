const { pool } = require('./config/postgresql');

async function clearAllData() {
  console.log('\n🗑️  CLEARING ALL POSTGRESQL DATA...\n');
  console.log('═'.repeat(50));

  try {
    // Delete all data from tables (in correct order to respect foreign keys)
    const tables = [
      'story_comments',
      'story_likes',
      'traveler_stories',
      'service_promotions',
      'notifications',
      'payments',
      'reviews',
      'bookings',
      'services',
      'service_providers',
      'users'
    ];

    for (const table of tables) {
      const result = await pool.query(`DELETE FROM ${table}`);
      console.log(`✅ Cleared ${table}: ${result.rowCount} rows deleted`);
    }

    // Reset sequences
    console.log('\n🔄 Resetting ID sequences...');
    for (const table of tables) {
      await pool.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
      console.log(`✅ Reset ${table}_id_seq`);
    }

    console.log('\n✅ ALL DATA CLEARED SUCCESSFULLY!');
    console.log('📊 Database is now empty and ready for fresh data');
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the clear function
clearAllData()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
