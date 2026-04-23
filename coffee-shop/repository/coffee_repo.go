// repository/coffee_repo.go
// ทำสัญญา CoffeeRepository ให้เป็นจริง โดยเก็บข้อมูลในหน่วยความจำ (RAM)
// ถ้าอยากเปลี่ยนไปใช้ PostgreSQL ก็แค่สร้างไฟล์ใหม่ แก้ตรงนี้ไฟล์เดียว

package repository

import (
	"coffee-shop/domain"
	"fmt"
	"sort"
)

// InMemoryCoffeeRepo เก็บข้อมูลในหน่วยความจำ (เหมือนกระดาษโน้ต)
type InMemoryCoffeeRepo struct {
	coffees map[string]domain.Coffee
}

// NewInMemoryCoffeeRepo สร้าง repo ใหม่พร้อมเมนูเริ่มต้น
func NewInMemoryCoffeeRepo() *InMemoryCoffeeRepo {
	return &InMemoryCoffeeRepo{
		coffees: map[string]domain.Coffee{
			"1": {ID: "1", Name: "Latte", Price: 65, Emoji: "☕"},
			"2": {ID: "2", Name: "Mocha", Price: 75, Emoji: "☕"},
			"3": {ID: "3", Name: "Americano", Price: 55, Emoji: "☕"},
			"4": {ID: "4", Name: "Matcha Latte", Price: 70, Emoji: "🍵"},
			"5": {ID: "5", Name: "Thai Tea", Price: 50, Emoji: "🧋"},
			"6": {ID: "6", Name: "Caramel Macchiato", Price: 80, Emoji: "☕"},
		},
	}
}

// FindByID ค้นหากาแฟด้วย ID
// ทำตามสัญญา CoffeeRepository
func (r *InMemoryCoffeeRepo) FindByID(id string) (*domain.Coffee, error) {
	c, ok := r.coffees[id]
	if !ok {
		return nil, fmt.Errorf("ไม่เจอเมนู ID: %s", id)
	}
	return &c, nil
}

// FindAll ดึงกาแฟทั้งหมด เรียงตาม ID
// ทำตามสัญญา CoffeeRepository
func (r *InMemoryCoffeeRepo) FindAll() ([]domain.Coffee, error) {
	var result []domain.Coffee
	for _, c := range r.coffees {
		result = append(result, c)
	}
	// เรียงลำดับให้สม่ำเสมอ (map ใน Go ไม่มีลำดับ)
	sort.Slice(result, func(i, j int) bool {
		return result[i].ID < result[j].ID
	})
	return result, nil
}