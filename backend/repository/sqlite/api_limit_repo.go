package sqlite

import (
	"database/sql"
	"fmt"
	"time"

	"backend/domain"
)

// ── User Repository ──────────────────────────────────────────

type SQLiteUserRepository struct {
	db *sql.DB
}

func NewSQLiteUserRepository(db *sql.DB) *SQLiteUserRepository {
	return &SQLiteUserRepository{db: db}
}

func (r *SQLiteUserRepository) planIDFromTier(tier string) int {
	var id int
	r.db.QueryRow("SELECT id FROM plans WHERE name = $1", tier).Scan(&id)
	if id == 0 {
		id = 1
	}
	return id
}

func (r *SQLiteUserRepository) CreateUser(user *domain.User) error {
	planID := r.planIDFromTier(user.Tier)
	_, err := r.db.Exec(
		"INSERT INTO users (id, email, plan_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
		user.ID, user.Email, planID, user.CreatedAt, user.UpdatedAt,
	)
	return err
}

func (r *SQLiteUserRepository) CreateUserWithPassword(user *domain.User, hashedPassword string) error {
	planID := r.planIDFromTier(user.Tier)
	_, err := r.db.Exec(
		"INSERT INTO users (id, email, username, password, plan_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		user.ID, user.Email, user.Username, hashedPassword, planID, user.CreatedAt, user.UpdatedAt,
	)
	return err
}

func (r *SQLiteUserRepository) FindByID(id string) (*domain.User, error) {
	var user domain.User
	err := r.db.QueryRow(
		`SELECT u.id, u.email, p.name, u.created_at, u.updated_at
		 FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.Tier, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return &user, err
}

func (r *SQLiteUserRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	err := r.db.QueryRow(
		`SELECT u.id, u.email, p.name, u.created_at, u.updated_at
		 FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Tier, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return &user, err
}

func (r *SQLiteUserRepository) FindByEmailWithPassword(email string) (*domain.User, string, error) {
	var user domain.User
	var hashedPassword sql.NullString
	err := r.db.QueryRow(
		`SELECT u.id, u.email, COALESCE(u.username,''), u.password, p.name, u.created_at, u.updated_at
		 FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Username, &hashedPassword, &user.Tier, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, "", fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, "", err
	}
	return &user, hashedPassword.String, nil
}

func (r *SQLiteUserRepository) FindByUsernameWithPassword(username string) (*domain.User, string, error) {
	var user domain.User
	var hashedPassword sql.NullString
	err := r.db.QueryRow(
		`SELECT u.id, u.email, COALESCE(u.username,''), u.password, p.name, u.created_at, u.updated_at
		 FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.username = $1`,
		username,
	).Scan(&user.ID, &user.Email, &user.Username, &hashedPassword, &user.Tier, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, "", fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, "", err
	}
	return &user, hashedPassword.String, nil
}

// ── API Key Repository ───────────────────────────────────────

type SQLiteAPIKeyRepository struct {
	db *sql.DB
}

func NewSQLiteAPIKeyRepository(db *sql.DB) *SQLiteAPIKeyRepository {
	return &SQLiteAPIKeyRepository{db: db}
}

func (r *SQLiteAPIKeyRepository) CreateAPIKey(key *domain.APIKey) error {
	_, err := r.db.Exec(
		"INSERT INTO api_keys (key, user_id, name, is_active, created_at) VALUES ($1, $2, $3, $4, $5)",
		key.Key, key.UserID, key.Name, key.IsActive, key.CreatedAt,
	)
	return err
}

func (r *SQLiteAPIKeyRepository) FindByKey(key string) (*domain.APIKey, error) {
	var apiKey domain.APIKey
	var lastUsedAt sql.NullString

	err := r.db.QueryRow(
		"SELECT key, user_id, name, is_active, created_at, last_used_at FROM api_keys WHERE key = $1",
		key,
	).Scan(&apiKey.Key, &apiKey.UserID, &apiKey.Name, &apiKey.IsActive, &apiKey.CreatedAt, &lastUsedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("api key not found")
	}
	if err != nil {
		return nil, err
	}
	if lastUsedAt.Valid {
		apiKey.LastUsedAt = &lastUsedAt.String
	}
	return &apiKey, nil
}

func (r *SQLiteAPIKeyRepository) FindByUserID(userID string) ([]domain.APIKey, error) {
	rows, err := r.db.Query(
		"SELECT key, user_id, name, is_active, created_at, last_used_at FROM api_keys WHERE user_id = $1 AND is_active = TRUE",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []domain.APIKey
	for rows.Next() {
		var key domain.APIKey
		var lastUsedAt sql.NullString
		if err := rows.Scan(&key.Key, &key.UserID, &key.Name, &key.IsActive, &key.CreatedAt, &lastUsedAt); err != nil {
			return nil, err
		}
		if lastUsedAt.Valid {
			key.LastUsedAt = &lastUsedAt.String
		}
		keys = append(keys, key)
	}
	return keys, rows.Err()
}

func (r *SQLiteAPIKeyRepository) UpdateLastUsed(key string) error {
	_, err := r.db.Exec(
		"UPDATE api_keys SET last_used_at = $1 WHERE key = $2",
		time.Now().Format(time.RFC3339), key,
	)
	return err
}

// ── API Usage Repository ─────────────────────────────────────

type SQLiteAPIUsageRepository struct {
	db *sql.DB
}

func NewSQLiteAPIUsageRepository(db *sql.DB) *SQLiteAPIUsageRepository {
	return &SQLiteAPIUsageRepository{db: db}
}

func (r *SQLiteAPIUsageRepository) RecordUsage(usage *domain.APIUsage) error {
	_, err := r.db.Exec(
		"INSERT INTO api_usage (api_key, endpoint, method, status_code, timestamp) VALUES ($1, $2, $3, $4, $5)",
		usage.APIKey, usage.Endpoint, usage.Method, usage.StatusCode, usage.Timestamp,
	)
	return err
}

func (r *SQLiteAPIUsageRepository) GetDailyUsage(apiKey string) (int, error) {
	since := time.Now().Add(-24 * time.Hour).Format(time.RFC3339)
	var count int
	err := r.db.QueryRow(
		"SELECT COUNT(*) FROM api_usage WHERE api_key = $1 AND timestamp >= $2",
		apiKey, since,
	).Scan(&count)
	return count, err
}

func (r *SQLiteAPIUsageRepository) GetUsageSince(apiKey string, since string) (int, error) {
	var count int
	err := r.db.QueryRow(
		"SELECT COUNT(*) FROM api_usage WHERE api_key = $1 AND timestamp >= $2",
		apiKey, since,
	).Scan(&count)
	return count, err
}
