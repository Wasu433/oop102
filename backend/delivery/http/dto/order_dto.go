package dto

import "time"

// CoffeeResponse สำหรับส่งข้อมูลกาแฟกลับ API
type CoffeeResponse struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Emoji string  `json:"emoji"`
}

// OrderItemCreateRequest สำหรับรับข้อมูล item ในออเดอร์จาก API
// แยกออกจาก domain เพื่อให้ API สามารถเปลี่ยนได้โดยไม่กระทบ business logic
type OrderItemCreateRequest struct {
	CoffeeID string `json:"coffee_id"`
	Quantity int    `json:"quantity"`
}

// OrderCreateRequest สำหรับรับข้อมูลออเดอร์ใหม่จาก API
type OrderCreateRequest struct {
	Items []OrderItemCreateRequest `json:"items"`
}

// OrderItemResponse สำหรับส่งข้อมูล item ในออเดอร์กลับ API
type OrderItemResponse struct {
	Coffee   CoffeeResponse `json:"coffee"`
	Quantity int             `json:"quantity"`
}

// OrderResponse สำหรับส่งข้อมูลออเดอร์กลับ API
type OrderResponse struct {
	ID        string               `json:"id"`
	Items     []OrderItemResponse  `json:"items"`
	Total     float64              `json:"total"`
	CreatedAt time.Time            `json:"created_at"`
	Status    string               `json:"status"`
}

// OrderListResponse สำหรับส่งรายการออเดอร์ทั้งหมดกลับ API
type OrderListResponse []OrderResponse