 package sqlite

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
