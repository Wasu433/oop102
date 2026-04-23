package http

import (
	"encoding/json"
	"net/http"

	"backend/usecase"
	"backend/delivery/http/dto"
)

// SummaryHandler จัดการ HTTP requests สำหรับ summary
// อยู่ใน delivery/http เพื่อแยก concern ด้าน transport (HTTP, JSON) ออกจาก business logic
// Handler นี้ parse JSON, เรียก usecase, แล้ว map response กลับเป็น JSON
// Business rules หลักยังอยู่ใน usecase ไม่ได้ย้ายมาที่นี่

type SummaryHandler struct {
	orderUC *usecase.OrderUseCase
}

func NewSummaryHandler(orderUC *usecase.OrderUseCase) *SummaryHandler {
	return &SummaryHandler{orderUC: orderUC}
}

// ServeHTTP จัดการ GET /summary
func (h *SummaryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	totalOrders, totalRevenue, err := h.orderUC.GetOrderSummary()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := dto.SummaryResponse{
		TotalOrders:  totalOrders,
		TotalRevenue: totalRevenue,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
