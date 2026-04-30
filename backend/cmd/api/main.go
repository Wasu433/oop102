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
	dbConn, err := db.OpenAndMigrate("", "")
	if err != nil {
		log.Fatalf("connect db: %v", err)
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
	authHandler := deliveryhttp.NewAuthHandler(userRepo, keyRepo)

	mux := stdhttp.NewServeMux()
	apiPrefix := "/api/v1"

	rateLimitedCarHandler := deliveryhttp.NewRateLimitMiddleware(rateLimitUC, carHandler)

	mux.Handle(apiPrefix+"/cars", rateLimitedCarHandler)
	mux.Handle(apiPrefix+"/cars/", rateLimitedCarHandler)

	mux.HandleFunc(apiPrefix+"/users", apiKeyHandler.HandleCreateUser)
	mux.HandleFunc(apiPrefix+"/keys", apiKeyHandler.HandleCreateAPIKey)
	mux.HandleFunc(apiPrefix+"/rate-limit", apiKeyHandler.HandleGetRateLimitInfo)

	mux.HandleFunc(apiPrefix+"/auth/register", authHandler.HandleRegister)
	mux.HandleFunc(apiPrefix+"/auth/login", authHandler.HandleLogin)

	log.Println("Car API server listening on :8080")
	if err := stdhttp.ListenAndServe(":8080", deliveryhttp.CORSMiddleware(mux)); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
