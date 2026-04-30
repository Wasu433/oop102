package sqlite

import (
	"database/sql"
	"fmt"

	"backend/domain"
)

type SQLiteCarRepository struct {
	db *sql.DB
}

func NewSQLiteCarRepository(db *sql.DB) *SQLiteCarRepository {
	return &SQLiteCarRepository{db: db}
}

func (r *SQLiteCarRepository) FindByID(id string) (*domain.Car, error) {
	var car domain.Car
	err := r.db.QueryRow(
		"SELECT id, brand, model, year, price, color, fuel, mileage FROM cars WHERE id = $1",
		id,
	).Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("car not found with id: %s", id)
		}
		return nil, err
	}
	return &car, nil
}

func (r *SQLiteCarRepository) FindAll() ([]domain.Car, error) {
	rows, err := r.db.Query(
		"SELECT id, brand, model, year, price, color, fuel, mileage FROM cars ORDER BY id",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanCars(rows)
}

func (r *SQLiteCarRepository) FindByBrand(brand string) ([]domain.Car, error) {
	rows, err := r.db.Query(
		"SELECT id, brand, model, year, price, color, fuel, mileage FROM cars WHERE brand = $1 ORDER BY id",
		brand,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanCars(rows)
}

func (r *SQLiteCarRepository) FindByYearBrandModel(year int, brand, model string) ([]domain.Car, error) {
	query := "SELECT id, brand, model, year, price, color, fuel, mileage FROM cars WHERE 1=1"
	var args []interface{}
	n := 1

	if year > 0 {
		query += fmt.Sprintf(" AND year = $%d", n)
		args = append(args, year)
		n++
	}
	if brand != "" {
		query += fmt.Sprintf(" AND brand = $%d", n)
		args = append(args, brand)
		n++
	}
	if model != "" {
		query += fmt.Sprintf(" AND model = $%d", n)
		args = append(args, model)
	}
	query += " ORDER BY id"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanCars(rows)
}

func (r *SQLiteCarRepository) FindByPriceRange(minPrice, maxPrice float64) ([]domain.Car, error) {
	rows, err := r.db.Query(
		"SELECT id, brand, model, year, price, color, fuel, mileage FROM cars WHERE price >= $1 AND price <= $2 ORDER BY price",
		minPrice, maxPrice,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanCars(rows)
}

func scanCars(rows *sql.Rows) ([]domain.Car, error) {
	var result []domain.Car
	for rows.Next() {
		var car domain.Car
		if err := rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage); err != nil {
			return nil, err
		}
		result = append(result, car)
	}
	return result, rows.Err()
}
