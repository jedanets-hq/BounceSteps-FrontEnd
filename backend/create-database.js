const { Client } = require('pg');

async function createDatabase() {
  // Connect to postgres default database first
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '@Jctnftr01',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'isafari_db'"
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE isafari_db');
      console.log('✅ Database "isafari_db" created successfully');
    } else {
      console.log('ℹ️  Database "isafari_db" already exists');
    }

    await client.end();
    console.log('✅ Setup complete! You can now run: npm start');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
