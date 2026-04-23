package db

import (
    "database/sql"
    "fmt"
    "io/fs"
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
    // split by semicolons could be problematic; use Exec of whole file
    _, err = db.Exec(string(b))
    return err
}
