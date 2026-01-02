require('dotenv').config();
const mongoose = require('mongoose');

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(i => console.log('  -', i.name));
    
    console.log('\n🗑️  Dropping google_id_1_sparse index...');
    try {
      await usersCollection.dropIndex('google_id_1_sparse');
      console.log('✅ google_id_1_sparse dropped');
    } catch (e) {
      console.log('ℹ️  Index already dropped or does not exist');
    }
    
    console.log('\n📋 Remaining indexes:');
    const remaining = await usersCollection.indexes();
    remaining.forEach(i => console.log('  -', i.name));
    
    console.log('\n✅ Done! google_id is no longer unique.');
    console.log('✅ Multiple users with google_id: null are now allowed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

dropIndex();
