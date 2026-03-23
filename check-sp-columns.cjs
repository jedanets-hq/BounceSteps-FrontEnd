require('dotenv').config({ path: './backend/.env' });
const {pool} = require('./backend/config/postgresql');

pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'service_providers' 
  ORDER BY ordinal_position
`)
.then(r => {
  console.log('Service Providers Columns:');
  r.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));
})
.catch(e => console.error('Error:', e.message))
.finally(() => process.exit());
