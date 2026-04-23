package repository

import (
    "database/sql"
    "fmt"

    "backend/domain"
)

// SQLiteCoffeeRepo implements domain.CoffeeRepository using SQLite
type SQLiteCoffeeRepo struct {
    db *sql.DB
}

func NewSQLiteCoffeeRepo(db *sql.DB) *SQLiteCoffeeRepo {
    return &SQLiteCoffeeRepo{db: db}
}

func (r *SQLiteCoffeeRepo) FindByID(id string) (*domain.Coffee, error) {
    var c domain.Coffee
    row := r.db.QueryRow("SELECT id, name, price, emoji FROM coffees WHERE id = ?", id)
    if err := row.Scan(&c.ID, &c.Name, &c.Price, &c.Emoji); err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("ไม่เจอเมนู ID: %s", id)
        }
        return nil, err
    }
    return &c, nil
}

func (r *SQLiteCoffeeRepo) FindAll() ([]domain.Coffee, error) {
    rows, err := r.db.Query("SELECT id, name, price, emoji FROM coffees ORDER BY id")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var result []domain.Coffee
    for rows.Next() {
        var c domain.Coffee
        if err := rows.Scan(&c.ID, &c.Name, &c.Price, &c.Emoji); err != nil {
            return nil, err
        }
        result = append(result, c)
    }
    if err := rows.Err(); err != nil {
        return nil, err
    }
    return result, nil
}

// SeedInitialCoffees inserts default menu if not present. Useful for initial setup.
func SeedInitialCoffees(db *sql.DB) error {
    tx, err := db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    stmt, err := tx.Prepare("INSERT OR IGNORE INTO coffees (id, name, price, emoji) VALUES (?, ?, ?, ?)")
    if err != nil {
        return err
    }
    defer stmt.Close()

    defaults := []domain.Coffee{
        {ID: "1", Name: "Latte", Price: 65, Emoji: "☕"},
        {ID: "2", Name: "Mocha", Price: 75, Emoji: "☕"},
        {ID: "3", Name: "Americano", Price: 55, Emoji: "☕"},
        {ID: "4", Name: "Matcha Latte", Price: 70, Emoji: "🍵"},
        {ID: "5", Name: "Thai Tea", Price: 50, Emoji: "🧋"},
        {ID: "6", Name: "Caramel Macchiato", Price: 80, Emoji: "☕"},
    }

    for _, c := range defaults {
        if _, err := stmt.Exec(c.ID, c.Name, c.Price, c.Emoji); err != nil {
            return err
        }
    }

    return tx.Commit()
}
