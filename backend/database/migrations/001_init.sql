-- 001_init.sql
CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,       -- ยี่ห้อ เช่น Toyota, Honda
    model TEXT NOT NULL,      -- รุ่น เช่น Civic, Corolla
    year INTEGER NOT NULL,    -- ปี เช่น 2020
    price REAL NOT NULL,      -- ราคา
    image_url TEXT            -- ลิงก์รูปภาพ (เผื่อไว้โชว์)
);