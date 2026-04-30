package main

import (
	"log"
	"os"
	"path/filepath"
	stdhttp "net/http"

	deliveryhttp "backend/delivery/http"
	db "backend/internal/db"
	sqlite "backend/repository/sqlite"
	"backend/usecase"
)

func main() {
	dbDir := findDatabaseDir()
	dbPath := filepath.Join(dbDir, "app.db")
	migrationsDir := filepath.Join(dbDir, "migrations")

	dbConn, err := db.OpenAndMigrate(dbPath, migrationsDir)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer dbConn.Close()

	userRepo := sqlite.NewSQLiteUserRepository(dbConn)
	keyRepo := sqlite.NewSQLiteAPIKeyRepository(dbConn)
	usageRepo := sqlite.NewSQLiteAPIUsageRepository(dbConn)

	rateLimitUC := usecase.NewRateLimitUseCase(userRepo, keyRepo, usageRepo)

	carRepo := sqlite.NewSQLiteCarRepository(dbConn)
	carUC := usecase.NewCarUseCase(carRepo)
	carHandler := deliveryhttp.NewCarHandler(carUC)

	apiKeyHandler := deliveryhttp.NewAPIKeyHandler(userRepo, keyRepo, rateLimitUC)

	mux := stdhttp.NewServeMux()
	apiPrefix := "/api/v1"

	rateLimitedCarHandler := deliveryhttp.NewRateLimitMiddleware(rateLimitUC, carHandler)

	// Car routes
	mux.Handle(apiPrefix+"/cars", rateLimitedCarHandler)
	mux.Handle(apiPrefix+"/cars/", rateLimitedCarHandler)

	// API Key management routes
	mux.HandleFunc(apiPrefix+"/users", apiKeyHandler.HandleCreateUser)
	mux.HandleFunc(apiPrefix+"/keys", apiKeyHandler.HandleCreateAPIKey)
	mux.HandleFunc(apiPrefix+"/rate-limit", apiKeyHandler.HandleGetRateLimitInfo)

	log.Println("🚗 Car API server listening on :8080")
	log.Println("\n=== Car API Endpoints ===")
	log.Println("  GET  /api/v1/cars")
	log.Println("  GET  /api/v1/cars/{id}")
	log.Println("  GET  /api/v1/cars/search?brand=...&minPrice=...&maxPrice=...")
	log.Println("\nUse header: X-API-Key: <your_key>")

	if err := stdhttp.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func findDatabaseDir() string {
	candidates := []string{
		filepath.Join("backend", "database"),
		filepath.Join("..", "..", "database"),
		filepath.Join("..", "database"),
		filepath.Join("database"),
	}

	for _, c := range candidates {
		if fi, err := os.Stat(c); err == nil && fi.IsDir() {
			return c
		}
	}

	return filepath.Join("backend", "database")
}