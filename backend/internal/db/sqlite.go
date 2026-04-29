package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	_ "github.com/mattn/go-sqlite3"
)

// OpenAndMigrate opens sqlite at path and runs all SQL files in migrationsDir (sorted by name)
func OpenAndMigrate(dbPath string, migrationsDir string) (*sql.DB, error) {
	// ensure parent dir exists
	if dir := filepath.Dir(dbPath); dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("mkdir %s: %w", dir, err)
		}
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		db.Close()
		return nil, err
	}

	// Read migration files
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		// if migrations dir missing, just return db
		return db, nil
	}

	var files []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		files = append(files, filepath.Join(migrationsDir, e.Name()))
	}
	sort.Strings(files)

	for _, f := range files {
		base := filepath.Base(f)

		// ✅ กัน seed ซ้ำ
		if base == "002_seed_car.sql" {
			var count int
			err := db.QueryRow("SELECT COUNT(*) FROM cars").Scan(&count)
			if err == nil && count > 0 {
				continue // ข้ามถ้ามีข้อมูลแล้ว
			}
		}

		if err := execSQLFile(db, f); err != nil {
			db.Close()
			return nil, fmt.Errorf("exec migration %s: %w", f, err)
		}
	}

	return db, nil
}

func execSQLFile(db *sql.DB, path string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	_, err = db.Exec(string(b))
	return err
}