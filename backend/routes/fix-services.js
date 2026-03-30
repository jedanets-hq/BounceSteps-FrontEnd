const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// TEMPORARY FIX ENDPOINT - Remove after fixing
router.post('/fix-provider-ids', async (req, res) => {
  try {
    console.log('🔧 FIXING PROVIDER IDS AND FOREIGN KEY...');
    
    // Step 1: Drop the wrong foreign key constraint
    console.log('1️⃣ Dropping wrong foreign key constraint...');
    await pool.query(`
      ALTER TABLE services 
      DROP CONSTRAINT IF EXISTS services_provider_id_fkey
    `);
    console.log('   ✅ Dropped');
    
    // Step 2: Create correct foreign key constraint
    console.log('2️⃣ Creating correct foreign key constraint...');
    await pool.query(`
      ALTER TABLE services 
      ADD CONSTRAINT services_provider_id_fkey 
      FOREIGN KEY (provider_id) 
      REFERENCES service_providers(id) 
      ON DELETE CASCADE
    `);
    console.log('   ✅ Created');
    
    // Step 3: Find services with wrong provider_id
    console.log('3️⃣ Finding services with wrong provider_id...');
    const wrongServices = await pool.query(`
      SELECT 
        s.id as service_id,
        s.provider_id as current_provider_id,
        s.title,
        sp.id as correct_provider_id,
        sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.provider_id != sp.id
    `);
    
    console.log(`   Found ${wrongServices.rows.length} services with wrong provider_id`);
    
    if (wrongServices.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'Foreign key fixed. All services already have correct provider_id',
        fixed: 0
      });
    }
    
    // Step 4: Fix each service
    console.log('4️⃣ Fixing services...');
    const fixed = [];
    for (const service of wrongServices.rows) {
      console.log(`   Fixing Service #${service.service_id}: "${service.title}"`);
      console.log(`   ${service.current_provider_id} → ${service.correct_provider_id}`);
      
      await pool.query(
        'UPDATE services SET provider_id = $1 WHERE id = $2',
        [service.correct_provider_id, service.service_id]
      );
      
      fixed.push({
        service_id: service.service_id,
        title: service.title,
        old_provider_id: service.current_provider_id,
        new_provider_id: service.correct_provider_id,
        provider: service.business_name
      });
    }
    
    console.log(`✅ Fixed ${fixed.length} services!`);
    
    res.json({
      success: true,
      message: `Successfully fixed foreign key and ${fixed.length} services`,
      fixed: fixed
    });
    
  } catch (error) {
    console.error('❌ Error fixing provider IDs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fix provider IDs',
      error: error.message
    });
  }
});

// Fix missing service_provider records
router.post('/create-missing-providers', async (req, res) => {
  try {
    console.log('🔧 Creating missing service_provider records...');
    
    // Create missing service_provider records
    const result = await pool.query(`
      INSERT INTO service_providers (user_id, business_name, created_at, updated_at)
      SELECT DISTINCT 
        s.provider_id as user_id,
        'Service Provider' as business_name,
        NOW() as created_at,
        NOW() as updated_at
      FROM services s
      WHERE s.provider_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM service_providers sp WHERE sp.user_id = s.provider_id
        )
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `);
    
    console.log(`✅ Created ${result.rows.length} service_provider records`);
    
    res.json({
      success: true,
      message: `Created ${result.rows.length} service_provider records`,
      providers: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error creating providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create providers',
      error: error.message
    });
  }
});

// Check data for debugging
router.get('/check-data', async (req, res) => {
  try {
    // Get services with provider_id
    const services = await pool.query(`
      SELECT id, title, provider_id
      FROM services
      WHERE provider_id IS NOT NULL
      LIMIT 10
    `);
    
    // Get users
    const users = await pool.query(`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE id IN (SELECT DISTINCT provider_id FROM services WHERE provider_id IS NOT NULL)
    `);
    
    // Get service_providers
    const providers = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
    `);
    
    res.json({
      success: true,
      services: services.rows,
      users: users.rows,
      providers: providers.rows
    });
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check data',
      error: error.message
    });
  }
});

// Check schema
router.post('/check-schema', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    
    res.json({
      success: true,
      columns: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check schema',
      error: error.message
    });
  }
});

// Fix orphaned services - delete or reassign
router.post('/fix-orphaned-services', async (req, res) => {
  try {
    console.log('🔧 Fixing orphaned services...');
    
    // Find services with non-existent provider_id
    const orphaned = await pool.query(`
      SELECT s.id, s.title, s.provider_id
      FROM services s
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE s.provider_id IS NOT NULL AND u.id IS NULL
    `);
    
    if (orphaned.rows.length === 0) {
      return res.json({
        success: true,
        message: 'No orphaned services found',
        fixed: []
      });
    }
    
    console.log(`Found ${orphaned.rows.length} orphaned services`);
    
    // Get first available provider
    const firstProvider = await pool.query(`
      SELECT sp.user_id
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      LIMIT 1
    `);
    
    if (firstProvider.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid providers found to reassign services'
      });
    }
    
    const validProviderId = firstProvider.rows[0].user_id;
    console.log(`Reassigning to provider ${validProviderId}`);
    
    // Reassign orphaned services
    const fixed = [];
    for (const service of orphaned.rows) {
      await pool.query(
        'UPDATE services SET provider_id = $1 WHERE id = $2',
        [validProviderId, service.id]
      );
      
      fixed.push({
        service_id: service.id,
        title: service.title,
        old_provider_id: service.provider_id,
        new_provider_id: validProviderId
      });
      
      console.log(`  ✅ Fixed service ${service.id}: ${service.title}`);
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixed.length} orphaned services`,
      fixed: fixed
    });
    
  } catch (error) {
    console.error('❌ Error fixing orphaned services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix orphaned services',
      error: error.message
    });
  }
});

// Check foreign key constraints
router.post('/check-foreign-keys', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('services', 'bookings', 'service_providers')
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    res.json({
      success: true,
      constraints: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error checking foreign keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check foreign keys',
      error: error.message
    });
  }
});

// Fix services.provider_id to reference service_providers.id correctly
router.post('/fix-services-provider-mapping', async (req, res) => {
  try {
    console.log('🔧 Fixing services.provider_id mapping...');
    
    // Step 1: Find all services and their current provider_id
    const services = await pool.query(`
      SELECT id, title, provider_id
      FROM services
      WHERE provider_id IS NOT NULL
    `);
    
    console.log(`Found ${services.rows.length} services to check`);
    
    const fixed = [];
    const errors = [];
    
    for (const service of services.rows) {
      try {
        // Check if provider_id is a user_id (needs fixing) or service_provider.id (already correct)
        const spCheck = await pool.query(`
          SELECT id FROM service_providers WHERE id = $1
        `, [service.provider_id]);
        
        if (spCheck.rows.length > 0) {
          // Already correct - provider_id references service_providers.id
          console.log(`  ✅ Service ${service.id} already correct`);
          continue;
        }
        
        // provider_id might be a user_id, try to find corresponding service_provider
        const spByUser = await pool.query(`
          SELECT id, user_id FROM service_providers WHERE user_id = $1
        `, [service.provider_id]);
        
        if (spByUser.rows.length > 0) {
          // Found service_provider, update service
          const correctProviderId = spByUser.rows[0].id;
          
          await pool.query(`
            UPDATE services SET provider_id = $1 WHERE id = $2
          `, [correctProviderId, service.id]);
          
          fixed.push({
            service_id: service.id,
            title: service.title,
            old_provider_id: service.provider_id,
            new_provider_id: correctProviderId
          });
          
          console.log(`  ✅ Fixed service ${service.id}: ${service.provider_id} → ${correctProviderId}`);
        } else {
          // No service_provider found, need to create one
          const user = await pool.query(`
            SELECT id, first_name, last_name, email FROM users WHERE id = $1
          `, [service.provider_id]);
          
          if (user.rows.length > 0) {
            const u = user.rows[0];
            
            // Create service_provider
            const newSp = await pool.query(`
              INSERT INTO service_providers (
                user_id,
                business_name,
                description,
                business_type,
                location,
                rating,
                total_bookings,
                is_verified,
                created_at,
                updated_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
              RETURNING id
            `, [
              u.id,
              `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
              'Service provider',
              'General Services',
              'Tanzania',
              0,
              0,
              false
            ]);
            
            const newProviderId = newSp.rows[0].id;
            
            // Update service
            await pool.query(`
              UPDATE services SET provider_id = $1 WHERE id = $2
            `, [newProviderId, service.id]);
            
            fixed.push({
              service_id: service.id,
              title: service.title,
              old_provider_id: service.provider_id,
              new_provider_id: newProviderId,
              created_provider: true
            });
            
            console.log(`  ✅ Created provider ${newProviderId} and fixed service ${service.id}`);
          } else {
            errors.push({
              service_id: service.id,
              title: service.title,
              provider_id: service.provider_id,
              error: 'User not found'
            });
            
            console.log(`  ❌ Service ${service.id}: User ${service.provider_id} not found`);
          }
        }
      } catch (err) {
        errors.push({
          service_id: service.id,
          title: service.title,
          provider_id: service.provider_id,
          error: err.message
        });
        
        console.log(`  ❌ Service ${service.id}: ${err.message}`);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixed.length} services, ${errors.length} errors`,
      fixed: fixed,
      errors: errors
    });
    
  } catch (error) {
    console.error('❌ Error fixing services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix services',
      error: error.message
    });
  }
});

// Delete orphaned service
router.post('/delete-orphaned-service', async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'serviceId is required'
      });
    }
    
    console.log(`🗑️  Deleting service ${serviceId}...`);
    
    const result = await pool.query(`
      DELETE FROM services WHERE id = $1 RETURNING id, title
    `, [serviceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    console.log(`✅ Deleted service: ${result.rows[0].title}`);
    
    res.json({
      success: true,
      message: `Deleted service: ${result.rows[0].title}`,
      deleted: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
});

module.exports = router;
