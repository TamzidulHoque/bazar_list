// "pg" is the PostgreSQL driver. We use its "Pool" to manage connections.
const { Pool } = require("pg");

// সব সংবেদনশীল তথ্য এখন .env থেকে আসে (কোডে hardcoded নয়)।
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool; // export the pool so other files can use it
