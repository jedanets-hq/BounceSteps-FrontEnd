/**
 * FIX PROVIDER SERVICE CATEGORIES
 * 
 * This script updates provider's service_categories to include
 * all categories from their existing services.
 * 
 * This ensures providers appear in Journey Planner for all their service categories.
 */

require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/models');

async function fixProviderCategories() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('FIXING PROVIDER SERVICE CATEGORIES');
    console.log('='.repeat(80) + '\n');

    await client.query('BEGIN');

    // Step 1: Get all providers with their services
    console.log('📋 Step 1: Analyzing providers and their services...\n');
    
    const providersResult = await client.query(`
      SELECT 
        sp.user_id,
        sp.business_name,
        sp.service_categories,
        array_agg(DISTINCT s.category) FILTER (WHERE s.category IS NOT NULL) as actual_categories
      FROM service_providers sp
      LEFT JOIN services s ON sp.user_id = s.provider_id
      GROUP BY sp.user_id, sp.business_name, sp.service_categories
      HAVING array_agg(DISTINCT s.category) FILTER (WHERE s.category IS NOT NULL) IS NOT NULL
    `);

    console.log(`Found ${providersResult.rows.length} providers with services\n`);

    if (providersResult.rows.length === 0) {
      console.log('✅ No providers need category updates!');
      await client.query('COMMIT');
      return;
    }

    // Step 2: Show providers that need updates
    console.log('📋 Step 2: Providers that need category updates:\n');
    
    const providersToUpdate = [];
    
    providersResult.rows.forEach((provider, idx) => {
      let registeredCategories = [];
      try {
        if (provider.service_categories) {
          registeredCategories = typeof provider.service_categories === 'string' 
            ? JSON.parse(provider.service_categories)
            : provider.service_categories;
        }
      } catch (e) {
        console.log(`   ⚠️  Error parsing categories for ${provider.business_name}: ${e.message}`);
      }

      const actualCategories = provider.actual_categories || [];
      const missingCategories = actualCategories.filter(cat => !registeredCategories.includes(cat));
      
      if (missingCategories.length > 0) {
        providersToUpdate.push({
          user_id: provider.user_id,
          business_name: provider.business_name,
          registered: registeredCategories,
          actual: actualCategories,
          missing: missingCategories
        });

        console.log(`   ${idx + 1}. ${provider.business_name}`);
        console.log(`      Registered: ${JSON.stringify(registeredCategories)}`);
        console.log(`      Actual Services: ${JSON.stringify(actualCategories)}`);
        console.log(`      Missing: ${JSON.stringify(missingCategories)}`);
        console.log('');
      }
    });

    if (providersToUpdate.length === 0) {
      console.log('✅ All providers already have correct categories!');
      await client.query('COMMIT');
      return;
    }

    // Step 3: Update providers
    console.log(`\n📋 Step 3: Updating ${providersToUpdate.length} providers...\n`);
    
    for (const provider of providersToUpdate) {
      // Merge registered and actual categories (remove duplicates)
      const mergedCategories = [...new Set([...provider.registered, ...provider.actual])];
      
      await client.query(`
        UPDATE service_providers
        SET service_categories = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [JSON.stringify(mergedCategories), provider.user_id]);
      
      console.log(`   ✅ Updated ${provider.business_name}`);
      console.log(`      New Categories: ${JSON.stringify(mergedCategories)}`);
      console.log('');
    }

    // Step 4: Verify updates
    console.log('📋 Step 4: Verifying updates...\n');
    
    const verifyResult = await client.query(`
      SELECT 
        sp.user_id,
        sp.business_name,
        sp.service_categories,
        array_agg(DISTINCT s.category) FILTER (WHERE s.category IS NOT NULL) as actual_categories
      FROM service_providers sp
      LEFT JOIN services s ON sp.user_id = s.provider_id
      WHERE sp.user_id = ANY($1)
      GROUP BY sp.user_id, sp.business_name, sp.service_categories
    `, [providersToUpdate.map(p => p.user_id)]);

    let allMatch = true;
    verifyResult.rows.forEach((provider, idx) => {
      let registeredCategories = [];
      try {
        if (provider.service_categories) {
          registeredCategories = typeof provider.service_categories === 'string' 
            ? JSON.parse(provider.service_categories)
            : provider.service_categories;
        }
      } catch (e) {
        console.log(`   ⚠️  Error parsing categories: ${e.message}`);
      }

      const actualCategories = provider.actual_categories || [];
      const allIncluded = actualCategories.every(cat => registeredCategories.includes(cat));
      
      console.log(`   ${idx + 1}. ${provider.business_name}`);
      console.log(`      Registered: ${JSON.stringify(registeredCategories)}`);
      console.log(`      Actual: ${JSON.stringify(actualCategories)}`);
      console.log(`      Status: ${allIncluded ? '✅ ALL MATCH' : '❌ MISMATCH'}`);
      console.log('');
      
      if (!allIncluded) allMatch = false;
    });

    if (allMatch) {
      console.log('✅ All providers now have correct categories!');
    } else {
      console.log('⚠️  Some providers still have mismatched categories');
    }

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(80));
    console.log('✅ CATEGORY FIX COMPLETE!');
    console.log('='.repeat(80) + '\n');

    console.log('💡 NEXT STEPS:');
    console.log('   1. Test Journey Planner to verify providers appear correctly');
    console.log('   2. Providers should now appear for all their service categories');
    console.log('   3. Location filtering should also work correctly\n');

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixProviderCategories();
