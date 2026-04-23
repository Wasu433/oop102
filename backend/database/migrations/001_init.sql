-- 001_init.sql: create tables
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS coffees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  emoji TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  total REAL NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  coffee_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(coffee_id) REFERENCES coffees(id)
);
