package main

import (
	"log"
	"net/http"

	"database/sql"

	httphandlers "backend/delivery/http"
	carUsecase "backend/usecase"
	sqliteRepo "backend/repository/sqlite"
	db_conn "backend/internal/db"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// ========== Database Setup ==========
	dbPath := "database/app.db"
	migrationsDir := "database/migrations"
	dbConn, err := db_conn.OpenAndMigrate(dbPath, migrationsDir)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer dbConn.Close()

	// ========== Car Pricing System ==========
	// Create car repository (SQLite)
	carRepository := sqliteRepo.NewSQLiteCarRepository(dbConn)

	// Create car usecase
	carUC := carUsecase.NewCarUseCase(carRepository)

	// Create car handler
	carHandler := httphandlers.NewCarHandler(carUC)

	// ========== Setup Routing ==========
	mux := http.NewServeMux()

	// Car routes
	mux.Handle("/api/v1/cars", carHandler)

	// ========== Start Server ==========
	log.Println("🚗 Car API Server starting at :8080")
	log.Println("Endpoints:")
	log.Println("  GET  /api/v1/cars")
	log.Println("  GET  /api/v1/cars/{id}")
	log.Println("  GET  /api/v1/cars/search?brand=...&model=...&year=...&minPrice=...&maxPrice=...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
