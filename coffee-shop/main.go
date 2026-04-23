package main

import (
	"coffee-shop/handler"
	"coffee-shop/repository"
	"coffee-shop/usecase"
)

func main() {
	// Dependency Injection
	// นี่คือ "สายไฟ" ที่เชื่อมทุกชั้นเข้าด้วยกัน
	// ชั้นนอกไม่รู้จักชั้นใน แต่ main.go รู้จักทุกคน

	// ชั้น 1 สร้าง Repository (ตู้เก็บข้อมูล)
	coffeeRepo := repository.NewInMemoryCoffeeRepo()
	orderRepo := repository.NewInMemoryOrderRepo()

	// ชั้น 2 สร้าง Use Case (สมอง) โดยยัด Repository เข้าไป
	// UseCase รับ interface ไม่ใช่ตัวจริง — นี่คือ Dependency Inversion
	orderUseCase := usecase.NewOrderUseCase(coffeeRepo, orderRepo)

	// ชั้น 3 สร้าง Handler (ผู้รับคำสั่ง) โดยยัด UseCase เข้าไป
	cliHandler := handler.NewCLIHandler(orderUseCase)

	// ชั้น 4 เริ่มรัน!
	cliHandler.Run()
}