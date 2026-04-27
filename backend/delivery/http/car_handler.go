package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"backend/domain"
	"backend/usecase"
	"backend/delivery/http/dto"
)

// CarHandler = จัดการ HTTP requests สำหรับรถยนต์
type CarHandler struct {
	carUC *usecase.CarUseCase
}

// NewCarHandler = สร้าง handler ใหม่
func NewCarHandler(carUC *usecase.CarUseCase) *CarHandler {
	return &CarHandler{carUC: carUC}
}

// ServeHTTP = จัดการ HTTP requests
func (h *CarHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse path: /api/v1/cars หรือ /api/v1/cars/{id} หรือ /api/v1/cars/search?...
	path := r.URL.Path
	parts := strings.Split(strings.TrimPrefix(path, "/api/v1/cars"), "/")

	// GET /api/v1/cars/search?brand=...&model=...&year=...
	if r.URL.RawQuery != "" && (parts[0] == "" || parts[0] == "search") {
		h.handleSearch(w, r)
		return
	}

	// GET /api/v1/cars/{id}
	if len(parts) > 1 && parts[1] != "" {
		h.handleGetByID(w, r, parts[1])
		return
	}

	// GET /api/v1/cars
	h.handleGetAll(w, r)
}

// handleGetAll = GET /api/v1/cars
func (h *CarHandler) handleGetAll(w http.ResponseWriter, r *http.Request) {
	cars, err := h.carUC.GetAllCars()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := mapCarsToResponse(cars)
	json.NewEncoder(w).Encode(resp)
}

// handleGetByID = GET /api/v1/cars/{id}
func (h *CarHandler) handleGetByID(w http.ResponseWriter, r *http.Request, id string) {
	car, err := h.carUC.GetCarByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	resp := mapCarToResponse(car)
	json.NewEncoder(w).Encode(resp)
}

// handleSearch = GET /api/v1/cars/search?brand=Toyota&model=Yaris&year=2022
func (h *CarHandler) handleSearch(w http.ResponseWriter, r *http.Request) {
	brand := r.URL.Query().Get("brand")
	model := r.URL.Query().Get("model")
	yearStr := r.URL.Query().Get("year")

	var year int
	if yearStr != "" {
		var err error
		year, err = strconv.Atoi(yearStr)
		if err != nil {
			http.Error(w, "invalid year format", http.StatusBadRequest)
			return
		}
	}

	cars, err := h.carUC.SearchCars(brand, model, year)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp := mapCarsToResponse(cars)
	json.NewEncoder(w).Encode(resp)
}

// mapCarToResponse = แปลง domain model -> DTO
func mapCarToResponse(car *domain.Car) dto.CarResponse {
	return dto.CarResponse{
		ID:      car.ID,
		Brand:   car.Brand,
		Model:   car.Model,
		Year:    car.Year,
		Price:   car.Price,
		Color:   car.Color,
		Fuel:    car.Fuel,
		Mileage: car.Mileage,
	}
}

// mapCarsToResponse = แปลง domain models -> DTOs
func mapCarsToResponse(cars []domain.Car) dto.CarListResponse {
	list := make(dto.CarListResponse, len(cars))
	for i, car := range cars {
		list[i] = mapCarToResponse(&car)
	}
	return list
}
