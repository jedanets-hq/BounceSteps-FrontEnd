// This file is deprecated - use postgresql.js instead
// Kept for backward compatibility only

const { pool, query, connectPostgreSQL, initializeDatabase } = require('./postgresql');

module.exports = {
  pool,
  query,
  connectPostgreSQL,
  initializeDatabase
};
