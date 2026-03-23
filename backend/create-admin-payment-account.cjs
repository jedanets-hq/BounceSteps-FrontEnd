require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function createAdminPaymentAccount() {
  console.log('='.repeat(80));
  console.log('CREATING ADMIN PAYMENT ACCOUNT');
  console.log('='.repeat(80));
  
  try {
    // Check if admin_payment_accounts table exists
    console.log('\n1. Checking if admin_payment_accounts table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_payment_accounts'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table admin_payment_accounts does not exist!');
      console.log('   Running migration to create table...');
      
      // Create table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_payment_accounts (
          id SERIAL PRIMARY KEY,
          account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('bank_account', 'visa_card', 'mastercard', 'mobile_money')),
          account_holder_name VARCHAR(255) NOT NULL,
          account_number VARCHAR(100) NOT NULL,
          bank_name VARCHAR(255),
          card_last_four VARCHAR(4),
          expiry_date VARCHAR(7),
          mobile_number VARCHAR(20),
          is_active BOOLEAN DEFAULT TRUE,
          is_primary BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Table created successfully');
    } else {
      console.log('✅ Table exists');
    }
    
    // Check existing accounts
    console.log('\n2. Checking existing admin payment accounts...');
    const existingAccounts = await pool.query(`
      SELECT * FROM admin_payment_accounts ORDER BY is_primary DESC, created_at DESC
    `);
    
    console.log(`Found ${existingAccounts.rows.length} existing accounts`);
    existingAccounts.rows.forEach((acc, i) => {
      console.log(`  ${i + 1}. ${acc.account_holder_name} (${acc.account_type}) - Primary: ${acc.is_primary}, Active: ${acc.is_active}`);
    });
    
    // Check if there's already a primary account
    const primaryAccount = existingAccounts.rows.find(acc => acc.is_primary && acc.is_active);
    
    if (primaryAccount) {
      console.log('\n✅ Primary account already exists:');
      console.log(`   Account Holder: ${primaryAccount.account_holder_name}`);
      console.log(`   Account Type: ${primaryAccount.account_type}`);
      console.log(`   Account Number: ${primaryAccount.account_number}`);
      console.log('\n   No action needed. System is ready to accept payments.');
    } else {
      console.log('\n⚠️  No primary account found. Creating default admin account...');
      
      // Create default admin payment account
      const result = await pool.query(`
        INSERT INTO admin_payment_accounts (
          account_type,
          account_holder_name,
          account_number,
          bank_name,
          is_primary,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        'bank_account',
        'iSafari Admin',
        '1234567890',
        'CRDB Bank',
        true,
        true
      ]);
      
      console.log('\n✅ Admin payment account created successfully!');
      console.log('   Account ID:', result.rows[0].id);
      console.log('   Account Holder:', result.rows[0].account_holder_name);
      console.log('   Account Type:', result.rows[0].account_type);
      console.log('   Account Number:', result.rows[0].account_number);
      console.log('   Bank:', result.rows[0].bank_name);
      console.log('   Primary:', result.rows[0].is_primary);
      console.log('   Active:', result.rows[0].is_active);
      
      console.log('\n📝 NOTE: This is a default account. You should update it with real account details:');
      console.log('   1. Go to Admin Portal > Payment Settings');
      console.log('   2. Update account holder name, account number, and bank details');
      console.log('   3. Or use the API: PUT /api/admin-payments/accounts/:id');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('SETUP COMPLETE');
    console.log('='.repeat(80));
    console.log('\n✅ System is now ready to accept promotion payments!');
    console.log('   Providers can now pay for verification and other promotions.');
    console.log('   Payments will be recorded to the primary admin account.');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

createAdminPaymentAccount();
