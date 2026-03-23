const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkAdminAccount() {
  try {
    const result = await pool.query(`
      SELECT * FROM admin_payment_accounts 
      ORDER BY is_primary DESC, created_at DESC
    `);
    
    console.log('💳 Admin Payment Accounts:');
    console.log('Total accounts:', result.rows.length);
    console.log('');
    
    if (result.rows.length === 0) {
      console.log('❌ NO ADMIN PAYMENT ACCOUNT FOUND!');
      console.log('This is the problem - provider cannot pay because there is no admin account to receive payment.');
    } else {
      result.rows.forEach((account, index) => {
        console.log(`Account ${index + 1}:`);
        console.log(`  ID: ${account.id}`);
        console.log(`  Type: ${account.account_type}`);
        console.log(`  Holder: ${account.account_holder_name}`);
        console.log(`  Number: ${account.account_number}`);
        console.log(`  Bank: ${account.bank_name || 'N/A'}`);
        console.log(`  Mobile: ${account.mobile_number || 'N/A'}`);
        console.log(`  Is Primary: ${account.is_primary ? '✅ YES' : 'No'}`);
        console.log(`  Is Active: ${account.is_active ? '✅ YES' : '❌ NO'}`);
        console.log(`  Created: ${account.created_at}`);
        console.log('');
      });
      
      const primaryActive = result.rows.find(a => a.is_primary && a.is_active);
      if (primaryActive) {
        console.log('✅ PRIMARY ACTIVE ACCOUNT EXISTS - Payment workflow should work!');
      } else {
        console.log('❌ NO PRIMARY ACTIVE ACCOUNT - Payment will fail!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminAccount();
