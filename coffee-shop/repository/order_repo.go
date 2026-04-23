// repository/order_repo.go
// ทำสัญญา OrderRepository ให้เป็นจริง โดยเก็บออเดอร์ในหน่วยความจำ

package repository

import (
	"coffee-shop/domain"
	"fmt"
	"sort"
)

// InMemoryOrderRepo เก็บออเดอร์ในหน่วยความจำ
type InMemoryOrderRepo struct {
	orders map[string]domain.Order
}

// NewInMemoryOrderRepo สร้าง repo ใหม่ (เริ่มต้นว่างเปล่า)
func NewInMemoryOrderRepo() *InMemoryOrderRepo {
	return &InMemoryOrderRepo{
		orders: make(map[string]domain.Order),
	}
}

// Save บันทึกออเดอร์ใหม่
func (r *InMemoryOrderRepo) Save(order *domain.Order) error {
	r.orders[order.ID] = *order
	return nil
}

// FindByID ค้นหาออเดอร์ด้วย ID
func (r *InMemoryOrderRepo) FindByID(id string) (*domain.Order, error) {
	o, ok := r.orders[id]
	if !ok {
		return nil, fmt.Errorf("ไม่เจอออเดอร์ ID: %s", id)
	}
	return &o, nil
}

// FindAll ดึงออเดอร์ทั้งหมด เรียงตามเวลา
func (r *InMemoryOrderRepo) FindAll() ([]domain.Order, error) {
	var result []domain.Order
	for _, o := range r.orders {
		result = append(result, o)
	}
	// เรียงตามเวลาที่สั่ง (เก่าสุดขึ้นก่อน)
	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt.Before(result[j].CreatedAt)
	})
	return result, nil
}