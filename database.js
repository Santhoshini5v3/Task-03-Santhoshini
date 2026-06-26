const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (creates file if not exists)
const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected!');
  }
});

// Create products table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    price     REAL NOT NULL,
    quantity  INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`, (err) => {
  if (err) {
    console.error('❌ Table creation failed:', err.message);
  } else {
    console.log('✅ Products table ready!');
  }
});

module.exports = db;