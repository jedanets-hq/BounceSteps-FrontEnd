/**
 * Quick fix for duplicate email error
 * Run this script to handle duplicate email issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixDuplicateEmailError() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find duplicate emails
    const duplicates = await usersCollection.aggregate([
      {
        $group: {
          _id: { email: { $toLower: "$email" } },
          count: { $sum: 1 },
          users: { $push: { _id: "$_id", email: "$email", created_at: "$created_at" } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    console.log(`Found ${duplicates.length} duplicate email groups`);
    
    for (const duplicate of duplicates) {
      const users = duplicate.users;
      // Keep the first user, remove others
      const keepUser = users[0];
      const removeUsers = users.slice(1);
      
      console.log(`Email: ${keepUser.email}`);
      console.log(`  Keeping: ${keepUser._id}`);
      
      for (const removeUser of removeUsers) {
        console.log(`  Removing: ${removeUser._id}`);
        await usersCollection.deleteOne({ _id: removeUser._id });
      }
    }
    
    console.log('✅ Duplicate cleanup completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  fixDuplicateEmailError();
}

module.exports = { fixDuplicateEmailError };
