package dto

// CarResponse = ส่งข้อมูลรถกลับผ่าน API
type CarResponse struct {
	ID      string  `json:"id"`
	Brand   string  `json:"brand"`
	Model   string  `json:"model"`
	Year    int     `json:"year"`
	Price   float64 `json:"price"`
	Color   string  `json:"color"`
	Fuel    string  `json:"fuel"`
	Mileage int     `json:"mileage"`
}

// CarListResponse = เมื่อ return รายการรถ
type CarListResponse []CarResponse
