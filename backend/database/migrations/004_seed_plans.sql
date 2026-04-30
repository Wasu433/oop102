INSERT INTO plans (name, request_limit, price)
VALUES
('free', 500, 0.00),
('standard', 10000, 299.00),
('pro', 1000000, 599.00)
ON CONFLICT (name) DO NOTHING;