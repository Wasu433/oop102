package http

import (
	"encoding/json"
	"net/http"
	"backend/usecase"
)

// CoffeeHandler รับผิดชอบ endpoint ที่เกี่ยวกับกาแฟ
// อยู่ใน delivery/http เพื่อแยก concern ด้านการรับ/ส่งข้อมูล (I/O) ออกจาก business logic
// handler นี้จะเรียก usecase เท่านั้น ไม่ยุ่งกับ database หรือ repository โดยตรง

type CoffeeHandler struct {
	orderUC *usecase.OrderUseCase
}

func NewCoffeeHandler(orderUC *usecase.OrderUseCase) *CoffeeHandler {
	return &CoffeeHandler{orderUC: orderUC}
}

// ServeHTTP สำหรับ GET /coffees
func (h *CoffeeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	coffees, err := h.orderUC.GetMenu()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(coffees)
}
