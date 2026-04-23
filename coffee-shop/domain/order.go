// domain/order.go
// กฎธุรกิจของออเดอร์ อยู่ในชั้นในสุด ไม่รู้จัก DB หรือ HTTP เลย

package domain

import "time"

// OrderItem = กาแฟ 1 รายการในออเดอร์ (พร้อมจำนวน)
type OrderItem struct {
	Coffee   Coffee
	Quantity int
}

// Order = ใบสั่งซื้อ
type Order struct {
	ID        string
	Items     []OrderItem
	Total     float64
	CreatedAt time.Time
	Status    string
}

// Calculate = กฎธุรกิจ คำนวณยอดรวม
// นี่คือ Method ที่ "เป็นของ" Order
func (o *Order) Calculate() {
	total := 0.0
	for _, item := range o.Items {
		total += item.Coffee.Price * float64(item.Quantity)
	}
	o.Total = total
}

// ItemCount = นับจำนวนแก้วทั้งหมด
func (o *Order) ItemCount() int {
	count := 0
	for _, item := range o.Items {
		count += item.Quantity
	}
	return count
}