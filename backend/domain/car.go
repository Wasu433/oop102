package domain

// Car = โมเดลของรถยนต์
type Car struct {
	ID      string
	Brand   string
	Model   string
	Year    int
	Price   float64
	Color   string
	Fuel    string
	Mileage int
}

// IsAffordable = กฎธุรกิจ: ตรวจสอบราคา
func (c *Car) IsAffordable(maxPrice float64) bool {
	return c.Price <= maxPrice
}

// IsNewCar = กฎธุรกิจ: ตรวจสอบว่าเป็นรถใหม่หรือไม่
func (c *Car) IsNewCar() bool {
	return c.Mileage < 100
}

// CarRepository = สัญญา: "ใครก็ได้ที่เก็บข้อมูลรถ ต้องทำเหล่านี้ได้"
type CarRepository interface {
	FindByID(id string) (*Car, error)
	FindAll() ([]Car, error)
	FindByBrand(brand string) ([]Car, error)
	FindByYearBrandModel(year int, brand string, model string) ([]Car, error)
	FindByPriceRange(minPrice, maxPrice float64) ([]Car, error)
}
