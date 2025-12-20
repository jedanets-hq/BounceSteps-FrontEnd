const mongoose = require('mongoose');
const { connectMongoDB } = require('../config/mongodb');
const { Service, ServiceProvider, User } = require('../models');

/**
 * Database Cleanup Script
 * Removes test/demo services and inactive providers
 */

async function cleanupDatabase() {
  try {
    console.log('🔧 Starting database cleanup...');
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // 1. Find and remove services without valid providers
    console.log('\n📊 Checking for orphaned services...');
    const allServices = await Service.find({});
    let orphanedCount = 0;
    
    for (const service of allServices) {
      const provider = await ServiceProvider.findById(service.provider_id);
      if (!provider) {
        await Service.findByIdAndDelete(service._id);
        orphanedCount++;
        console.log(`   ❌ Removed orphaned service: ${service.title}`);
      }
    }
    console.log(`✅ Removed ${orphanedCount} orphaned services`);
    
    // 2. Find and remove test/demo services (services with test keywords)
    console.log('\n📊 Checking for test/demo services...');
    const testKeywords = ['test', 'demo', 'sample', 'example', 'dummy'];
    const testServices = await Service.find({
      $or: [
        { title: { $regex: testKeywords.join('|'), $options: 'i' } },
        { description: { $regex: testKeywords.join('|'), $options: 'i' } }
      ]
    });
    
    for (const service of testServices) {
      await Service.findByIdAndDelete(service._id);
      console.log(`   ❌ Removed test service: ${service.title}`);
    }
    console.log(`✅ Removed ${testServices.length} test/demo services`);
    
    // 3. Find services with no bookings and created more than 30 days ago
    console.log('\n📊 Checking for inactive old services...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveServices = await Service.find({
      created_at: { $lt: thirtyDaysAgo },
      bookings_count: 0,
      is_active: false
    });
    
    for (const service of inactiveServices) {
      await Service.findByIdAndDelete(service._id);
      console.log(`   ❌ Removed inactive service: ${service.title}`);
    }
    console.log(`✅ Removed ${inactiveServices.length} inactive old services`);
    
    // 4. Update service categories to standard values
    console.log('\n📊 Standardizing service categories...');
    const standardCategories = {
      'accommodation': 'Accommodation',
      'transport': 'Transportation',
      'transportation': 'Transportation',
      'tours': 'Tours & Activities',
      'activities': 'Tours & Activities',
      'food': 'Food & Dining',
      'dining': 'Food & Dining',
      'restaurant': 'Food & Dining',
      'shopping': 'Shopping',
      'health': 'Health & Wellness',
      'wellness': 'Health & Wellness',
      'entertainment': 'Entertainment',
      'insurance': 'Travel Insurance',
      'visa': 'Visa Services',
      'rental': 'Equipment Rental',
      'photography': 'Photography'
    };
    
    const allActiveServices = await Service.find({ is_active: true });
    let categorizedCount = 0;
    
    for (const service of allActiveServices) {
      const currentCategory = service.category?.toLowerCase() || '';
      const standardCategory = standardCategories[currentCategory] || service.category;
      
      if (standardCategory !== service.category) {
        await Service.findByIdAndUpdate(service._id, { category: standardCategory });
        categorizedCount++;
        console.log(`   ✏️  Updated category: ${service.title} -> ${standardCategory}`);
      }
    }
    console.log(`✅ Standardized ${categorizedCount} service categories`);
    
    // 5. Summary
    console.log('\n📈 Cleanup Summary:');
    const remainingServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ is_active: true });
    const totalProviders = await ServiceProvider.countDocuments();
    const verifiedProviders = await ServiceProvider.countDocuments({ is_verified: true });
    
    console.log(`   📦 Total Services: ${remainingServices}`);
    console.log(`   ✅ Active Services: ${activeServices}`);
    console.log(`   👥 Total Providers: ${totalProviders}`);
    console.log(`   ✓  Verified Providers: ${verifiedProviders}`);
    
    console.log('\n✅ Database cleanup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupDatabase();