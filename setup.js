require("dotenv").config(); // .env থেকে গোপন তথ্য লোড করি (সবার আগে)

const pool = require("./db");

// This SQL creates both tables if they don't already exist.
const sql = `
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    PASSWORD TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE items (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
title TEXT NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);  
`;

async function setup() {
  try {
    await pool.query(sql);
    console.log("✅ Tables created (users, items).");
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  } finally {
    await pool.end(); // close the pool so the script exits
  }
}

setup();