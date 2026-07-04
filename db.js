// "pg" is the PostgreSQL driver. We use its "Pool" to manage connections.
const { Pool } = require("pg");

// A Pool keeps a set of ready-to-use connections to your database,
// so you don't open/close one for every query (faster + safer).
const pool = new Pool({
    host: "localhost",       // the database is on your own computer
    port: 5432,              // the port PostgreSQL listens on
    user: "postgres",        // the database username
    password: "1daywillcome&Followme", // <-- change this
    database: "bazar",       // the database we just created
});

module.exports = pool; // export the pool so other files can use it