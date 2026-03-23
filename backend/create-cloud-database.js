const { Client } = require('pg');

async function createDatabase() {
  // Connect to postgres default database first (on Cloud SQL)
  const client = new Client({
    host: '34.42.58.123',
    port: 5432,
    user: 'postgres',
    password: '@JedaNets01',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✅ Connected to Cloud SQL PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'bouncesteps-db'"
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE "bouncesteps-db"');
      console.log('✅ Database "bouncesteps-db" created successfully');
    } else {
      console.log('ℹ️  Database "bouncesteps-db" already exists');
    }

    await client.end();
    console.log('✅ Setup complete! You can now run: npm start');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
