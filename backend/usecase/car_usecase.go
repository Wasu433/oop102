package usecase

import (
	"fmt"
	"backend/domain"
)

// CarUseCase = สมองของระบบจัดการรถยนต์
// รู้จักแค่ interface ไม่รู้จักตัวจริง
type CarUseCase struct {
	carRepo domain.CarRepository
}

// NewCarUseCase = สร้าง use case ใหม่
func NewCarUseCase(repo domain.CarRepository) *CarUseCase {
	return &CarUseCase{carRepo: repo}
}

// GetAllCars = ดึงรถทั้งหมด
func (uc *CarUseCase) GetAllCars() ([]domain.Car, error) {
	cars, err := uc.carRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get all cars: %w", err)
	}
	return cars, nil
}

// GetCarByID = ดึงรถตาม ID
func (uc *CarUseCase) GetCarByID(id string) (*domain.Car, error) {
	if id == "" {
		return nil, fmt.Errorf("id cannot be empty")
	}
	car, err := uc.carRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("car not found: %w", err)
	}
	return car, nil
}

// SearchCars = ค้นหารถตามเงื่อนไข
func (uc *CarUseCase) SearchCars(brand string, model string, year int) ([]domain.Car, error) {
	// ตรวจสอบ input
	if brand == "" && model == "" && year == 0 {
		// ถ้าไม่มีเงื่อนไข ให้ดึงทั้งหมด
		return uc.GetAllCars()
	}

	cars, err := uc.carRepo.FindByYearBrandModel(year, brand, model)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	if len(cars) == 0 {
		return []domain.Car{}, nil // คืนค่าแบบว่าง ไม่ใช่ error
	}

	return cars, nil
}

// GetAffordableCars = ดึงรถในช่วงราคา
func (uc *CarUseCase) GetAffordableCars(minPrice, maxPrice float64) ([]domain.Car, error) {
	// ตรวจสอบ input
	if minPrice < 0 || maxPrice < 0 {
		return nil, fmt.Errorf("price cannot be negative")
	}
	if minPrice > maxPrice {
		return nil, fmt.Errorf("minPrice must be less than or equal to maxPrice")
	}

	cars, err := uc.carRepo.FindByPriceRange(minPrice, maxPrice)
	if err != nil {
		return nil, fmt.Errorf("failed to search by price: %w", err)
	}

	return cars, nil
}

// GetNewCars = ดึงรถใหม่ (mileage < 100)
func (uc *CarUseCase) GetNewCars() ([]domain.Car, error) {
	cars, err := uc.GetAllCars()
	if err != nil {
		return nil, err
	}

	var newCars []domain.Car
	for _, car := range cars {
		if car.IsNewCar() {
			newCars = append(newCars, car)
		}
	}

	return newCars, nil
}

// GetCarsByBrand = ดึงรถตามยี่ห้อ
func (uc *CarUseCase) GetCarsByBrand(brand string) ([]domain.Car, error) {
	if brand == "" {
		return nil, fmt.Errorf("brand cannot be empty")
	}

	cars, err := uc.carRepo.FindByBrand(brand)
	if err != nil {
		return nil, fmt.Errorf("failed to find cars by brand: %w", err)
	}

	return cars, nil
}
