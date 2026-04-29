INSERT INTO users (id, email, password, plan_id)
VALUES (
    'user_001',
    'free@test.com',
    NULL,
    (SELECT id FROM plans WHERE name = 'free')
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO api_keys (key, user_id, name)
VALUES (
    'sk_test_free_123456',
    'user_001',
    'Free Test Key'
)
ON CONFLICT (key) DO NOTHING;