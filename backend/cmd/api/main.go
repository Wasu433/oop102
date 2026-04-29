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
    // Database setup
    dbDir := findDatabaseDir()
    dbPath := filepath.Join(dbDir, "app.db")
    migrationsDir := filepath.Join(dbDir, "migrations")
    dbConn, err := db.OpenAndMigrate(dbPath, migrationsDir)
    if err != nil {
        log.Fatalf("open db: %v", err)
    }
    defer dbConn.Close()

    // ========== Rate Limiting Setup ==========
    userRepo := sqlite.NewSQLiteUserRepository(dbConn)
    keyRepo := sqlite.NewSQLiteAPIKeyRepository(dbConn)
    usageRepo := sqlite.NewSQLiteAPIUsageRepository(dbConn)

    rateLimitUC := usecase.NewRateLimitUseCase(userRepo, keyRepo, usageRepo)

    // ========== Car System Setup ==========
    // Create SQLite repository for cars
    carRepo := sqlite.NewSQLiteCarRepository(dbConn)

    // Create usecase (business logic)
    carUC := usecase.NewCarUseCase(carRepo)

    // Create handler (HTTP delivery)
    carHandler := deliveryhttp.NewCarHandler(carUC)

    // ========== API Key Management Handler ==========
    apiKeyHandler := deliveryhttp.NewAPIKeyHandler(userRepo, keyRepo, rateLimitUC)

    // ========== Setup routing ==========
    mux := stdhttp.NewServeMux()
    apiPrefix := "/api/v1"

    // Rate limit middleware - wrap car handler
    rateLimitedCarHandler := deliveryhttp.NewRateLimitMiddleware(rateLimitUC, carHandler)

    // Car routes (with rate limiting)
    mux.Handle(apiPrefix+"/cars", rateLimitedCarHandler)

    // API Key management routes (no rate limiting)
    mux.HandleFunc(apiPrefix+"/users", apiKeyHandler.HandleCreateUser)
    mux.HandleFunc(apiPrefix+"/keys", apiKeyHandler.HandleCreateAPIKey)
    mux.HandleFunc(apiPrefix+"/rate-limit", apiKeyHandler.HandleGetRateLimitInfo)

    log.Println("🚗 Car API server listening on :8080")
    log.Println("\n=== Car API Endpoints ===")
    log.Println("  GET  /api/v1/cars")
    log.Println("  GET  /api/v1/cars/{id}")
    log.Println("  GET  /api/v1/cars/search?brand=...&minPrice=...&maxPrice=...")
    log.Println("\n=== API Key Management Endpoints ===")
    log.Println("  POST /api/v1/users           - สร้าง user ใหม่")
    log.Println("  POST /api/v1/keys            - สร้าง API key")
    log.Println("  GET  /api/v1/rate-limit      - ดูสถานะ rate limit (ต้องใช้ X-API-Key header)")
    log.Println("\n=== Rate Limiting ===")
    log.Println("  Free tier       : 100 calls/day")
    log.Println("  Pro tier        : 10000 calls/day")
    log.Println("  Enterprise tier : 100000 calls/day")
    log.Println("\nUse header: X-API-Key: <your_key>")

    if err := stdhttp.ListenAndServe(":8080", mux); err != nil {
        log.Fatalf("server failed: %v", err)
    }
}

func findDatabaseDir() string {
    candidates := []string{
        filepath.Join("backend", "database"),
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
