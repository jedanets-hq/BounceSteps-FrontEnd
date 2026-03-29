const express = require('express');
const router = express.Router();
const { pool } = require('../models');

// Fix missing service_provider records
router.post('/fix-providers', async (req, res) => {
  try {
    console.log('🔧 Creating missing service_provider records...');
    
    // Create missing service_provider records
    const result = await pool.query(`
      INSERT INTO service_providers (user_id, business_name, created_at, updated_at)
      SELECT DISTINCT 
        s.provider_id as user_id,
        COALESCE(s.business_name, 'Service Provider') as business_name,
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
    console.error('❌ Error fixing providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix providers',
      error: error.message
    });
  }
});

module.exports = router;
