-- =========================
-- Insert Users
-- password = '123456789' (bcrypt hashed)
-- =========================
INSERT INTO users (id, email, username, password, plan_id)
VALUES
(
    'user001',
    'free@test.com',
    'free_user',
    '$2a$10$sabYHKd2TyPeORD3qZOpe.jbmLQWGboqcQ69GJFMq5XVGUpQ0Z4Yu',
    (SELECT id FROM plans WHERE name = 'free')
),
(
    'user002',
    'standard@test.com',
    'standard_user',
    '$2a$10$sabYHKd2TyPeORD3qZOpe.jbmLQWGboqcQ69GJFMq5XVGUpQ0Z4Yu',
    (SELECT id FROM plans WHERE name = 'standard')
),
(
    'user003',
    'pro@test.com',
    'pro_user',
    '$2a$10$sabYHKd2TyPeORD3qZOpe.jbmLQWGboqcQ69GJFMq5XVGUpQ0Z4Yu',
    (SELECT id FROM plans WHERE name = 'pro')
    
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