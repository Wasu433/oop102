package main

import (
    "database/sql"
    "log"
    "net/http"

    "backend/delivery/http"
    repo "coffee-shop/repository"
    "coffee-shop/usecase"
)

func main() {
    // Open SQLite (file: data.sqlite in backend folder)
    db, err := repo.OpenSQLite("data.sqlite")
    if err != nil {
        log.Fatalf("failed to open db: %v", err)
    }
    defer db.Close()

    // Create repositories (SQLite implementations)
    coffeeRepo := repo.NewSQLiteCoffeeRepo(db)
    orderRepo := repo.NewSQLiteOrderRepo(db)

    // Optional: seed initial coffees
    if err := repo.SeedInitialCoffees(db); err != nil {
        log.Printf("seed coffees: %v", err)
    }

    // Create usecase (business logic) and inject repositories
    orderUC := usecase.NewOrderUseCase(coffeeRepo, orderRepo)

    // Create HTTP handlers and inject usecase
    coffeeHandler := http.NewCoffeeHandler(orderUC)
    orderHandler := http.NewOrderHandler(orderUC)
    summaryHandler := http.NewSummaryHandler(orderUC)

    mux := http.NewServeMux()
    mux.Handle("/coffees", coffeeHandler)
    mux.Handle("/orders", orderHandler)
    mux.Handle("/summary", summaryHandler)

    log.Println("Starting server at :8080")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatalf("server failed: %v", err)
    }
}
