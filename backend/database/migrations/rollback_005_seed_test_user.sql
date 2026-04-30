DELETE FROM api_keys WHERE key = 'sk_test_free_123456';
DELETE FROM users WHERE id = 'user_001';

DELETE FROM migration_history WHERE migration_name = '005_seed_test_user';