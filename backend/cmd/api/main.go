package main

import (
    "log"
    stdhttp "net/http"

    deliveryhttp "backend/delivery/http"
    db "backend/internal/db"
    sqlite "backend/repository/sqlite"
    "backend/usecase"
)

func main() {
    // Prefer SQLite for persistence. Migrations are in backend/database/migrations
    dbPath := "database/app.db"
    migrationsDir := "database/migrations"
    dbConn, err := db.OpenAndMigrate(dbPath, migrationsDir)
    if err != nil {
        log.Fatalf("open db: %v", err)
    }
    defer dbConn.Close()

    // create sqlite-backed repositories
    coffeeRepo := sqlite.NewSQLiteCoffeeRepo(dbConn)
    orderRepo := sqlite.NewSQLiteOrderRepo(dbConn)

    orderUC := usecase.NewOrderUseCase(coffeeRepo, orderRepo)

    mux := stdhttp.NewServeMux()
    apiPrefix := "/api"
    mux.Handle(apiPrefix+"/coffees", deliveryhttp.NewCoffeeHandler(orderUC))
    mux.Handle(apiPrefix+"/orders", deliveryhttp.NewOrderHandler(orderUC))
    mux.Handle(apiPrefix+"/summary", deliveryhttp.NewSummaryHandler(orderUC))

    log.Println("API server listening :8080")
    if err := stdhttp.ListenAndServe(":8080", mux); err != nil {
        log.Fatalf("server failed: %v", err)
    }
}
