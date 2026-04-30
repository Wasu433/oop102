package db

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func OpenAndMigrate(dbPath string, migrationsDir string) (*sql.DB, error) {
	// โหลด .env จาก backend/database/.env
	for _, path := range []string{
		"backend/database/.env",
		"../../database/.env",
		"../database/.env",
		"database/.env",
	} {
		if _, err := os.Stat(path); err == nil {
			godotenv.Load(path)
			break
		}
	}

	host := getenv("DB_HOST", "localhost")
	port := getenv("DB_PORT", "5432")
	user := getenv("DB_USER", "car_user")
	password := getenv("DB_PASSWORD", "123456")
	dbname := getenv("DB_NAME", "car_db")

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("connect postgres: %w", err)
	}

	return db, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
