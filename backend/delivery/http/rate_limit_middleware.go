package http

import (
	"encoding/json"
	"net/http"

	"backend/usecase"
)

// RateLimitMiddleware = ตรวจสอบ rate limit ทุก request
type RateLimitMiddleware struct {
	rateLimitUC *usecase.RateLimitUseCase
	next        http.Handler
}

func NewRateLimitMiddleware(
	rateLimitUC *usecase.RateLimitUseCase,
	next http.Handler,
) *RateLimitMiddleware {
	return &RateLimitMiddleware{
		rateLimitUC: rateLimitUC,
		next:        next,
	}
}

func (m *RateLimitMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// ดึง API key จาก header
	apiKey := r.Header.Get("X-API-Key")

	// ถ้าไม่มี API key ให้ผ่าน (สำหรับ public endpoints)
	if apiKey == "" {
		m.next.ServeHTTP(w, r)
		return
	}

	// ตรวจสอบ rate limit
	allowed, err := m.rateLimitUC.CheckRateLimit(apiKey)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": err.Error(),
		})
		return
	}

	if !allowed {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "rate limit exceeded",
		})
		return
	}

	// เรียก handler ถัดไป
	m.next.ServeHTTP(w, r)

	// บันทึก usage หลัง response
	go func() {
		_ = m.rateLimitUC.RecordUsage(
			apiKey,
			r.URL.Path,
			r.Method,
			http.StatusOK, // ในโลกจริงต้องดึง status code จาก response
		)
	}()
}
