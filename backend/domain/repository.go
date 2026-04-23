// domain/repository.go
// สัญญา (Interface) บอกว่าใครก็ได้ที่อยากเก็บข้อมูล ต้องทำสิ่งนี้ได้
// Domain ไม่สนว่าจะเก็บใน MySQL, PostgreSQL หรือ RAM ขอแค่ตามสัญญา

package domain

// CoffeeRepository = สัญญาของ "ตู้เก็บข้อมูลกาแฟ"
type CoffeeRepository interface {
	FindByID(id string) (*Coffee, error)
	FindAll() ([]Coffee, error)
}

// OrderRepository = สัญญาของ "ตู้เก็บออเดอร์"
type OrderRepository interface {
	Save(order *Order) error
	FindByID(id string) (*Order, error)
	FindAll() ([]Order, error)
}