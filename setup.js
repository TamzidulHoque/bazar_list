require("dotenv").config(); // .env থেকে গোপন তথ্য লোড করি (সবার আগে)

const pool = require("./db");
const { hashPassword } = require("./password");

// দুই টেবিল বানাই। role: 'user' | 'manager' | 'admin'
const sql = `
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
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

// শুরুতেই admin আর manager account বসিয়ে দিই (password hash করে)
const seedUsers = [
  { name: "Tahmid",  email: "tamzidultahmid@gmail.com", password: "Saad654321", role: "admin" },
  { name: "Saadman", email: "saadman@gmail.com",        password: "Saad654321", role: "manager" },
];

async function setup() {
  try {
    await pool.query(sql);
    console.log("✅ Tables created (users, items).");

    for (const u of seedUsers) {
      const hashed = hashPassword(u.password);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        [u.name, u.email, hashed, u.role]
      );
      console.log(`👤 Seeded ${u.role}: ${u.email}`);
    }
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  } finally {
    await pool.end(); // pool বন্ধ করি যাতে script শেষ হয়
  }
}

setup();
