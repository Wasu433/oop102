-- =========================
-- Insert Users
-- =========================
INSERT INTO users (id, email, password, plan_id)
VALUES 
(
    'user001',
    'free@test.com',
    '123456789',
    (SELECT id FROM plans WHERE name = 'free')
),
(
    'user002',
    'pro@test.com',
    '123456789',
    (SELECT id FROM plans WHERE name = 'pro')
),
(
    'user003',
    'enterprise@test.com',
    '123456789',
    (SELECT id FROM plans WHERE name = 'enterprise')
)
ON CONFLICT (email) DO NOTHING;

-- =========================
-- Insert API Keys
-- =========================
INSERT INTO api_keys (key, user_id, name)
VALUES
(
    'sk_test_free_123456',
    'user001',
    'Free Test Key'
),
(
    'sk_test_pro_123456',
    'user002',
    'Pro Test Key'
),
(
    'sk_test_enterprise_123456',
    'user003',
    'Enterprise Test Key'
)
ON CONFLICT (key) DO NOTHING;