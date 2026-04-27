package repository

import (
	"fmt"
	"backend/domain"
)

// MockCarRepository = เก็บข้อมูลรถในหน่วยความจำ (ไม่ใช้ Database)
type MockCarRepository struct {
	cars []domain.Car
}

// NewMockCarRepository = สร้าง repository ใหม่พร้อมข้อมูลจำลอง
func NewMockCarRepository() *MockCarRepository {
	return &MockCarRepository{
		cars: []domain.Car{
			{ID: "1", Brand: "Toyota", Model: "Corolla", Year: 2024, Price: 750000, Color: "White", Fuel: "Petrol", Mileage: 0},
			{ID: "2", Brand: "Honda", Model: "Civic", Year: 2023, Price: 850000, Color: "Blue", Fuel: "Petrol", Mileage: 5000},
			{ID: "3", Brand: "Toyota", Model: "Camry", Year: 2024, Price: 1200000, Color: "Black", Fuel: "Hybrid", Mileage: 0},
			{ID: "4", Brand: "BMW", Model: "3 Series", Year: 2023, Price: 2500000, Color: "Silver", Fuel: "Petrol", Mileage: 15000},
			{ID: "5", Brand: "Tesla", Model: "Model 3", Year: 2024, Price: 1800000, Color: "White", Fuel: "Electric", Mileage: 0},
			{ID: "6", Brand: "Toyota", Model: "Yaris", Year: 2022, Price: 600000, Color: "Red", Fuel: "Petrol", Mileage: 25000},
			{ID: "7", Brand: "Honda", Model: "Accord", Year: 2023, Price: 1100000, Color: "Black", Fuel: "Petrol", Mileage: 8000},
		},
	}
}

// FindByID = ค้นหารถตาม ID
func (r *MockCarRepository) FindByID(id string) (*domain.Car, error) {
	for _, car := range r.cars {
		if car.ID == id {
			return &car, nil
		}
	}
	return nil, fmt.Errorf("car not found with id: %s", id)
}

// FindAll = ดึงรถทั้งหมด
func (r *MockCarRepository) FindAll() ([]domain.Car, error) {
	return r.cars, nil
}

// FindByBrand = ค้นหารถตามยี่ห้อ
func (r *MockCarRepository) FindByBrand(brand string) ([]domain.Car, error) {
	var result []domain.Car
	for _, car := range r.cars {
		if car.Brand == brand {
			result = append(result, car)
		}
	}
	return result, nil
}

// FindByYearBrandModel = ค้นหารถตามปี ยี่ห้อ และรุ่น
func (r *MockCarRepository) FindByYearBrandModel(year int, brand string, model string) ([]domain.Car, error) {
	var result []domain.Car
	for _, car := range r.cars {
		match := true
		if year > 0 && car.Year != year {
			match = false
		}
		if brand != "" && car.Brand != brand {
			match = false
		}
		if model != "" && car.Model != model {
			match = false
		}
		if match {
			result = append(result, car)
		}
	}
	return result, nil
}

// FindByPriceRange = ค้นหารถในช่วงราคา
func (r *MockCarRepository) FindByPriceRange(minPrice, maxPrice float64) ([]domain.Car, error) {
	var result []domain.Car
	for _, car := range r.cars {
		if car.Price >= minPrice && car.Price <= maxPrice {
			result = append(result, car)
		}
	}
	return result, nil
}
