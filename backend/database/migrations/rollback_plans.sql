-- rollback_plans.sql

DELETE FROM plans
WHERE name IN ('free', 'standard', 'pro');