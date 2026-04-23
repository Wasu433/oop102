package http

import (
	"encoding/json"
	"net/http"

	"coffee-shop/domain"
	"coffee-shop/usecase"
	"backend/delivery/http/dto"
)

// OrderHandler จัดการ HTTP requests สำหรับออเดอร์
// อยู่ใน delivery/http เพื่อแยก concern ด้าน transport (HTTP, JSON) ออกจาก business logic
// Handler นี้ parse JSON, map เป็น usecase structs, เรียก usecase, แล้ว map response กลับเป็น JSON
// Business rules หลักยังอยู่ใน usecase ไม่ได้ย้ายมาที่นี่

type OrderHandler struct {
	orderUC *usecase.OrderUseCase
}

func NewOrderHandler(orderUC *usecase.OrderUseCase) *OrderHandler {
	return &OrderHandler{orderUC: orderUC}
}

// ServeHTTP จัดการ POST /orders
func (h *OrderHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		var req dto.OrderCreateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		ucReq := mapToOrderRequest(req)
		order, err := h.orderUC.PlaceOrder(ucReq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		resp := mapToOrderResponse(order)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)

	case http.MethodGet:
		orders, err := h.orderUC.GetAllOrders()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		resp := mapToOrderListResponse(orders)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func mapToOrderListResponse(orders []domain.Order) dto.OrderListResponse {
	list := make(dto.OrderListResponse, len(orders))
	for i := range orders {
		list[i] = mapToOrderResponse(&orders[i])
	}
	return list
}

// mapToOrderRequest แปลง DTO เป็น usecase struct
func mapToOrderRequest(dtoReq dto.OrderCreateRequest) usecase.OrderRequest {
	items := make([]usecase.OrderItemRequest, len(dtoReq.Items))
	for i, item := range dtoReq.Items {
		items[i] = usecase.OrderItemRequest{
			CoffeeID: item.CoffeeID,
			Quantity: item.Quantity,
		}
	}
	return usecase.OrderRequest{Items: items}
}

// mapToOrderResponse แปลง domain model เป็น DTO
func mapToOrderResponse(order *domain.Order) dto.OrderResponse {
	items := make([]dto.OrderItemResponse, len(order.Items))
	for i, item := range order.Items {
		items[i] = dto.OrderItemResponse{
			Coffee: dto.CoffeeResponse{
				ID:    item.Coffee.ID,
				Name:  item.Coffee.Name,
				Price: item.Coffee.Price,
				Emoji: item.Coffee.Emoji,
			},
			Quantity: item.Quantity,
		}
	}
	return dto.OrderResponse{
		ID:        order.ID,
		Items:     items,
		Total:     order.Total,
		CreatedAt: order.CreatedAt,
		Status:    order.Status,
	}
}