CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,

    price REAL,
    color TEXT,
    fuel TEXT,
    mileage INTEGER,

    location TEXT,
    image_url TEXT,
    source_url TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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