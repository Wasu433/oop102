-- 001_init.sql

CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,

    brand TEXT NOT NULL,         -- ยี่ห้อ เช่น Toyota, Honda
    model TEXT NOT NULL,         -- รุ่น เช่น Civic, Corolla
    year INTEGER NOT NULL,       -- ปี เช่น 2020

    price NUMERIC(12,2),         -- ราคา
    color TEXT,                  -- สี
    fuel TEXT,                   -- Petrol, Diesel, Hybrid, Electric
    mileage INTEGER,             -- ระยะทาง (km)

    location TEXT,               -- เช่น Bangkok, Tokyo
    image_url TEXT,              -- รูปภาพ
    source_url TEXT,             -- ลิงก์จาก API ภายนอก

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ป้องกันข้อมูลซ้ำ
CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_unique
ON cars (brand, model, year, price, color, fuel, mileage, location);

-- Index เพิ่มเพื่อ performance
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_model ON cars(model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_location ON cars(location);
