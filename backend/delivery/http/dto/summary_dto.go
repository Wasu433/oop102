package dto

// SummaryResponse สำหรับส่งข้อมูลสรุปยอดขายกลับ API
type SummaryResponse struct {
	TotalOrders  int     `json:"total_orders"`
	TotalRevenue float64 `json:"total_revenue"`
}
