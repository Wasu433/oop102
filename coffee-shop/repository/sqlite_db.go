package repository

import (
    "database/sql"
    "fmt"

    _ "github.com/mattn/go-sqlite3"
)

// OpenSQLite เปิดการเชื่อมต่อ SQLite และสร้าง schema เบื้องต้นถ้ายังไม่มี
func OpenSQLite(path string) (*sql.DB, error) {
    db, err := sql.Open("sqlite3", path)
    if err != nil {
        return nil, err
    }

    if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
        db.Close()
        return nil, err
    }

    schema := `
    CREATE TABLE IF NOT EXISTS coffees (
        id TEXT PRIMARY KEY,
        name TEXT,
        price REAL,
        emoji TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        total REAL,
        created_at TEXT,
        status TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        coffee_id TEXT,
        quantity INTEGER,
        FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY(coffee_id) REFERENCES coffees(id)
    );
    `

    if _, err := db.Exec(schema); err != nil {
        db.Close()
        return nil, fmt.Errorf("failed to init schema: %w", err)
    }

    return db, nil
}
