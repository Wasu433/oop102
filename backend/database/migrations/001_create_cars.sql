CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
        brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    color TEXT,
    fuel TEXT,
    mileage INTEGER,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_unique
    ON cars (brand, model, year, price, color, fuel, mileage);

    CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_model ON cars(model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_fuel ON cars(fuel);