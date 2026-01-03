#!/usr/bin/env node

/**
 * Database Schema Verification Script
 * Checks PostgreSQL connection and verifies all required tables
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Database Schema Verification                             ║');
console.log('║  Checking PostgreSQL connection and tables                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (!DATABASE_URL) {
  console.log('❌ DATABASE_URL not set in environment variables');
  console.log('💡 Set DATABASE_URL in backend/.env file\n');
  process.exit(1);
}

console.log(`📝 Database URL: ${DATABASE_URL.substring(0, 50)}...\n`);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test functions
async function testConnection() {
  console.log('1️⃣  Testing Database Connection...');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('   ✅ Connected to PostgreSQL');
    console.log(`   📝 Server time: ${result.rows[0].now}\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}\n`);
    return false;
  }
}

async function checkTable(tableName, requiredColumns = []) {
  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [tableName]);

    if (!tableCheck.rows[0].exists) {
      console.log(`   ❌ Table "${tableName}" does not exist`);
      return false;
    }

    // Get table columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    const columns = columnsResult.rows.map(r => r.column_name);
    console.log(`   ✅ Table "${tableName}" exists`);
    console.log(`      Columns: ${columns.join(', ')}`);

    // Check required columns
    if (requiredColumns.length > 0) {
      const missing = requiredColumns.filter(col => !columns.includes(col));
      if (missing.length > 0) {
        console.log(`      ⚠️  Missing columns: ${missing.join(', ')}`);
        return false;
      }
    }

    // Get row count
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const rowCount = countResult.rows[0].count;
    console.log(`      📊 Rows: ${rowCount}\n`);

    return true;
  } catch (error) {
    console.log(`   ❌ Error checking table "${tableName}": ${error.message}\n`);
    return false;
  }
}

async function verifySchema() {
  console.log('2️⃣  Verifying Database Schema...\n');

  const tables = [
    {
      name: 'users',
      columns: ['id', 'email', 'password', 'user_type', 'created_at']
    },
    {
      name: 'services',
      columns: ['id', 'title', 'description', 'price', 'provider_id', 'category', 'location']
    },
    {
      name: 'service_providers',
      columns: ['id', 'user_id', 'business_name', 'business_type', 'location']
    },
    {
      name: 'cart_items',
      columns: ['id', 'user_id', 'service_id', 'quantity', 'added_at']
    },
    {
      name: 'bookings',
      columns: ['id', 'user_id', 'service_id', 'status', 'created_at']
    }
  ];

  let allTablesOk = true;
  for (const table of tables) {
    const ok = await checkTable(table.name, table.columns);
    if (!ok) allTablesOk = false;
  }

  return allTablesOk;
}

async function checkCartItemsSchema() {
  console.log('3️⃣  Checking cart_items Table Details...');
  try {
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position
    `);

    if (result.rows.length === 0) {
      console.log('   ❌ cart_items table not found\n');
      return false;
    }

    console.log('   ✅ cart_items table structure:');
    result.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`      • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    console.log();
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function testCartOperations() {
  console.log('4️⃣  Testing Cart Operations...');
  try {
    // Test INSERT
    const insertResult = await pool.query(`
      INSERT INTO cart_items (user_id, service_id, quantity)
      VALUES (1, 1, 1)
      ON CONFLICT (user_id, service_id) DO UPDATE SET quantity = cart_items.quantity + 1
      RETURNING *
    `);

    if (insertResult.rows.length > 0) {
      console.log('   ✅ INSERT operation works');
      const cartItemId = insertResult.rows[0].id;

      // Test SELECT
      const selectResult = await pool.query(
        'SELECT * FROM cart_items WHERE id = $1',
        [cartItemId]
      );

      if (selectResult.rows.length > 0) {
        console.log('   ✅ SELECT operation works');

        // Test UPDATE
        const updateResult = await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
          [2, cartItemId]
        );

        if (updateResult.rows.length > 0) {
          console.log('   ✅ UPDATE operation works');

          // Test DELETE
          const deleteResult = await pool.query(
            'DELETE FROM cart_items WHERE id = $1',
            [cartItemId]
          );

          console.log('   ✅ DELETE operation works\n');
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function checkIndexes() {
  console.log('5️⃣  Checking Database Indexes...');
  try {
    const result = await pool.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename IN ('users', 'services', 'cart_items', 'bookings')
      ORDER BY tablename, indexname
    `);

    if (result.rows.length > 0) {
      console.log('   ✅ Indexes found:');
      result.rows.forEach(idx => {
        console.log(`      • ${idx.tablename}: ${idx.indexname}`);
      });
    } else {
      console.log('   ⚠️  No indexes found');
    }
    console.log();
    return true;
  } catch (error) {
    console.log(`   ⚠️  Error checking indexes: ${error.message}\n`);
    return true; // Not critical
  }
}

// Main execution
async function main() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Cannot connect to database\n');
      process.exit(1);
    }

    const schemaOk = await verifySchema();
    await checkCartItemsSchema();
    const operationsOk = await testCartOperations();
    await checkIndexes();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Verification Summary                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (schemaOk && operationsOk) {
      console.log('✅ Database is properly configured and working!\n');
      process.exit(0);
    } else {
      console.log('❌ Database has issues - see details above\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
