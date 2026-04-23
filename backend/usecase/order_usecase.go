// usecase/order_usecase.go
// ชั้นสมอง ตัดสินใจทางธุรกิจทั้งหมด
// รับ "สัญญา" (interface) ไม่ใช่ตัวจริง นี่คือ Dependency Inversion

package usecase

import (
	"coffee-shop/domain"
	"fmt"
	"time"
)

// Request/Response Objects

// OrderItemRequest = ข้อมูลที่รับเข้ามาจากภายนอก (Handler ส่งมา)
type OrderItemRequest struct {
	CoffeeID string
	Quantity int
}

// OrderRequest = ข้อมูล request ทั้งหมดของ 1 ออเดอร์
type OrderRequest struct {
	Items []OrderItemRequest
}

// Use Case

// OrderUseCase = สมองของร้านกาแฟ รู้จักแค่ "สัญญา" ไม่รู้จัก "ตัวจริง"
type OrderUseCase struct {
	coffeeRepo domain.CoffeeRepository // สัญญา ไม่ใช่ตัวจริง
	orderRepo  domain.OrderRepository  // สัญญา ไม่ใช่ตัวจริง
	counter    int                      // นับจำนวนออเดอร์
}

// NewOrderUseCase สร้าง use case ใหม่
// รับ interface → ไม่สนว่า repo จริงๆ คืออะไร
func NewOrderUseCase(
	cr domain.CoffeeRepository,
	or domain.OrderRepository,
) *OrderUseCase {
	return &OrderUseCase{
		coffeeRepo: cr,
		orderRepo:  or,
	}
}

// Business Logic

// GetMenu ดึงเมนูกาแฟทั้งหมด
func (uc *OrderUseCase) GetMenu() ([]domain.Coffee, error) {
	return uc.coffeeRepo.FindAll()
}

// PlaceOrder สั่งกาแฟ นี่คือ "กฎธุรกิจ" หลัก
func (uc *OrderUseCase) PlaceOrder(req OrderRequest) (*domain.Order, error) {
	// กฎ 1 ออเดอร์ต้องมีสินค้า
	if len(req.Items) == 0 {
		return nil, fmt.Errorf("ออเดอร์ต้องมีสินค้าอย่างน้อย 1 อย่าง")
	}

	var items []domain.OrderItem

	for _, reqItem := range req.Items {
		// กฎ 2 จำนวนต้องมากกว่า 0
		if reqItem.Quantity <= 0 {
			return nil, fmt.Errorf("จำนวนต้องมากกว่า 0")
		}

		// ค้นหากาแฟ (ถ้าไม่เจอ → error)
		coffee, err := uc.coffeeRepo.FindByID(reqItem.CoffeeID)
		if err != nil {
			return nil, fmt.Errorf("ไม่เจอเมนู ID '%s': %w", reqItem.CoffeeID, err)
		}

		items = append(items, domain.OrderItem{
			Coffee:   *coffee,
			Quantity: reqItem.Quantity,
		})
	}

	// สร้างออเดอร์
	uc.counter++
	order := &domain.Order{
		ID:        fmt.Sprintf("ORD-%03d", uc.counter),
		Items:     items,
		CreatedAt: time.Now(),
		Status:    "กำลังเตรียม ☕",
	}

	// ใช้กฎธุรกิจจาก domain
	order.Calculate()

	// บันทึก
	if err := uc.orderRepo.Save(order); err != nil {
		return nil, fmt.Errorf("บันทึกออเดอร์ไม่ได้: %w", err)
	}

	return order, nil
}

// GetAllOrders ดึงออเดอร์ทั้งหมด
func (uc *OrderUseCase) GetAllOrders() ([]domain.Order, error) {
	return uc.orderRepo.FindAll()
}

// GetOrderSummary สรุปยอดขายทั้งหมด
func (uc *OrderUseCase) GetOrderSummary() (totalOrders int, totalRevenue float64, err error) {
	orders, err := uc.orderRepo.FindAll()
	if err != nil {
		return 0, 0, err
	}
	for _, o := range orders {
		totalOrders++
		totalRevenue += o.Total
	}
	return
}