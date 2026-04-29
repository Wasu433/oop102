package sqlite

import (
	"database/sql"
	"fmt"

	"backend/domain"
)

// SQLiteCarRepository implements domain.CarRepository using SQLite
type SQLiteCarRepository struct {
	db *sql.DB
}

// NewSQLiteCarRepository สร้าง car repository ใหม่
func NewSQLiteCarRepository(db *sql.DB) *SQLiteCarRepository {
	return &SQLiteCarRepository{db: db}
}

// FindByID ค้นหารถตาม ID
func (r *SQLiteCarRepository) FindByID(id string) (*domain.Car, error) {
	var car domain.Car
	row := r.db.QueryRow(
		"SELECT id,  brand , model, year, price, color, fuel, mileage FROM cars WHERE id = ?",
		id,
	)

	err := row.Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("car not found with id: %s", id)
		}
		return nil, err
	}

	return &car, nil
}

// FindAll ดึงรถทั้งหมด
func (r *SQLiteCarRepository) FindAll() ([]domain.Car, error) {
	rows, err := r.db.Query(
		"SELECT id,  brand , model, year, price, color, fuel, mileage FROM cars ORDER BY id",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Car
	for rows.Next() {
		var car domain.Car
		err := rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage)
		if err != nil {
			return nil, err
		}
		result = append(result, car)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// FindByBrand ค้นหารถตามยี่ห้อ
func (r *SQLiteCarRepository) FindByBrand(brand string) ([]domain.Car, error) {
	rows, err := r.db.Query(
		"SELECT id,  brand , model, year, price, color, fuel, mileage FROM cars WHERE  brand  = ? ORDER BY id",
		brand,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Car
	for rows.Next() {
		var car domain.Car
		err := rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage)
		if err != nil {
			return nil, err
		}
		result = append(result, car)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// FindByYearBrandModel ค้นหารถตามปี ยี่ห้อ และรุ่น
func (r *SQLiteCarRepository) FindByYearBrandModel(year int, brand, model string) ([]domain.Car, error) {
	query := "SELECT id, brand , model, year, price, color, fuel, mileage FROM cars WHERE 1=1"
	var args []interface{}

	if year > 0 {
		query += " AND year = ?"
		args = append(args, year)
	}

	if brand != "" {
		query += " AND  brand = ?"
		args = append(args, brand)
	}

	if model != "" {
		query += " AND model = ?"
		args = append(args, model)
	}

	query += " ORDER BY id"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Car
	for rows.Next() {
		var car domain.Car
		err := rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage)
		if err != nil {
			return nil, err
		}
		result = append(result, car)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// FindByPriceRange ค้นหารถในช่วงราคา
func (r *SQLiteCarRepository) FindByPriceRange(minPrice, maxPrice float64) ([]domain.Car, error) {
	rows, err := r.db.Query(
		"SELECT id,  brand , model, year, price, color, fuel, mileage FROM cars WHERE price >= ? AND price <= ? ORDER BY price",
		minPrice,
		maxPrice,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Car
	for rows.Next() {
		var car domain.Car
		err := rows.Scan(&car.ID, &car.Brand, &car.Model, &car.Year, &car.Price, &car.Color, &car.Fuel, &car.Mileage)
		if err != nil {
			return nil, err
		}
		result = append(result, car)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}
