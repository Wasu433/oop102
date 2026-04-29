-- 003_api_rate_limiting.sql
-- ระบบ Rate Limiting + API Keys

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    tier TEXT NOT NULL DEFAULT 'free',  -- 'free', 'pro' หรือ 'enterprise'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
    key TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,                 -- ชื่อ API key
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT NOT NULL,
    last_used_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS api_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT NOT NULL,
    endpoint TEXT NOT NULL,             -- เช่น /api/v1/cars
    method TEXT NOT NULL,               -- GET, POST, etc
    status_code INTEGER,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(api_key) REFERENCES api_keys(key) ON DELETE CASCADE
);

-- Index สำหรับ query ที่เร็ว
CREATE INDEX IF NOT EXISTS idx_api_usage_key_timestamp ON api_usage(api_key, timestamp);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
