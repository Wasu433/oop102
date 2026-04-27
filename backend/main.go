package main

import (
	"log"
	"net/http"

	httphandlers "backend/delivery/http"
	repo "backend/repository"
	orderRepo "coffee-shop/repository"
	orderUsecase "coffee-shop/usecase"
	carUsecase "backend/usecase"
)

func main() {
	// ========== Coffee/Order System ==========
	// Open SQLite (file: data.sqlite in backend folder)
	db, err := orderRepo.OpenSQLite("data.sqlite")
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	// Create repositories (SQLite implementations)
	coffeeRepo := orderRepo.NewSQLiteCoffeeRepo(db)
	orderRepoArg := orderRepo.NewSQLiteOrderRepo(db)

	// Optional: seed initial coffees
	if err := orderRepo.SeedInitialCoffees(db); err != nil {
		log.Printf("seed coffees: %v", err)
	}

	// Create usecase (business logic) and inject repositories
	orderUC := orderUsecase.NewOrderUseCase(coffeeRepo, orderRepoArg)

	// Create HTTP handlers and inject usecase
	coffeeHandler := httphandlers.NewCoffeeHandler(orderUC)
	orderHandler := httphandlers.NewOrderHandler(orderUC)
	summaryHandler := httphandlers.NewSummaryHandler(orderUC)

	// ========== Car Pricing System ==========
	// Create car repository (mock data)
	carRepository := repo.NewMockCarRepository()

	// Create car usecase
	carUC := carUsecase.NewCarUseCase(carRepository)

	// Create car handler
	carHandler := httphandlers.NewCarHandler(carUC)

	// ========== Setup Routing ==========
	mux := http.NewServeMux()

	// Coffee/Order routes
	mux.Handle("/coffees", coffeeHandler)
	mux.Handle("/orders", orderHandler)
	mux.Handle("/summary", summaryHandler)

	// Car routes
	mux.Handle("/api/v1/cars", carHandler)

	log.Println("Starting server at :8080")
	log.Println("Coffee API: GET /coffees, POST /orders, GET /summary")
	log.Println("Car API: GET /api/v1/cars, GET /api/v1/cars/{id}, GET /api/v1/cars/search?...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
