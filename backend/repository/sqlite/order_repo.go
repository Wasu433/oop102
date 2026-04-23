package sqlite

import (
    "database/sql"
    "fmt"
    "time"

    "backend/domain"
)

// SQLiteOrderRepo implements domain.OrderRepository using SQLite
type SQLiteOrderRepo struct {
    db *sql.DB
}

func NewSQLiteOrderRepo(db *sql.DB) *SQLiteOrderRepo {
    return &SQLiteOrderRepo{db: db}
}

func (r *SQLiteOrderRepo) Save(order *domain.Order) error {
    tx, err := r.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    if _, err := tx.Exec(
        "INSERT OR REPLACE INTO orders (id, total, created_at, status) VALUES (?, ?, ?, ?)",
        order.ID, order.Total, order.CreatedAt.Format(time.RFC3339), order.Status,
    ); err != nil {
        return err
    }

    if _, err := tx.Exec("DELETE FROM order_items WHERE order_id = ?", order.ID); err != nil {
        return err
    }

    stmt, err := tx.Prepare("INSERT INTO order_items (order_id, coffee_id, quantity) VALUES (?, ?, ?)")
    if err != nil {
        return err
    }
    defer stmt.Close()

    for _, item := range order.Items {
        if _, err := stmt.Exec(order.ID, item.Coffee.ID, item.Quantity); err != nil {
            return err
        }
    }

    return tx.Commit()
}

func (r *SQLiteOrderRepo) FindByID(id string) (*domain.Order, error) {
    var o domain.Order
    row := r.db.QueryRow("SELECT id, total, created_at, status FROM orders WHERE id = ?", id)
    var createdAtStr string
    if err := row.Scan(&o.ID, &o.Total, &createdAtStr, &o.Status); err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("ไม่เจอออเดอร์ ID: %s", id)
        }
        return nil, err
    }
    t, err := time.Parse(time.RFC3339, createdAtStr)
    if err != nil {
        t = time.Now()
    }
    o.CreatedAt = t

    items, err := r.loadItemsForOrder(id)
    if err != nil {
        return nil, err
    }
    o.Items = items

    return &o, nil
}

func (r *SQLiteOrderRepo) FindAll() ([]domain.Order, error) {
    rows, err := r.db.Query("SELECT id, total, created_at, status FROM orders ORDER BY created_at")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var result []domain.Order
    for rows.Next() {
        var o domain.Order
        var createdAtStr string
        if err := rows.Scan(&o.ID, &o.Total, &createdAtStr, &o.Status); err != nil {
            return nil, err
        }
        t, err := time.Parse(time.RFC3339, createdAtStr)
        if err != nil {
            t = time.Now()
        }
        o.CreatedAt = t

        items, err := r.loadItemsForOrder(o.ID)
        if err != nil {
            return nil, err
        }
        o.Items = items
        result = append(result, o)
    }
    if err := rows.Err(); err != nil {
        return nil, err
    }
    return result, nil
}

func (r *SQLiteOrderRepo) loadItemsForOrder(orderID string) ([]domain.OrderItem, error) {
    q := `SELECT oi.coffee_id, oi.quantity, c.name, c.price, c.emoji
          FROM order_items oi
          LEFT JOIN coffees c ON oi.coffee_id = c.id
          WHERE oi.order_id = ?`
    rows, err := r.db.Query(q, orderID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var items []domain.OrderItem
    for rows.Next() {
        var coffeeID string
        var qty int
        var name string
        var price float64
        var emoji string
        if err := rows.Scan(&coffeeID, &qty, &name, &price, &emoji); err != nil {
            return nil, err
        }
        coffee := domain.Coffee{ID: coffeeID, Name: name, Price: price, Emoji: emoji}
        items = append(items, domain.OrderItem{Coffee: coffee, Quantity: qty})
    }
    if err := rows.Err(); err != nil {
        return nil, err
    }
    return items, nil
}
