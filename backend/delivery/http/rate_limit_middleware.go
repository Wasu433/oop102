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
	// ดึง API key จาก header หรือ query param ?api_key=
	apiKey := r.Header.Get("X-API-Key")
	if apiKey == "" {
		apiKey = r.URL.Query().Get("api_key")
	}

	// ถ้าไม่มี API key ปฏิเสธการเข้าถึง
	if apiKey == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "API key required. Please provide a valid api_key query parameter or X-API-Key header.",
		})
		return
	}

	// ตรวจสอบ rate limit
	allowed, err := m.rateLimitUC.CheckRateLimit(apiKey)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		errMsg := err.Error()
		if errMsg == "invalid api key" || errMsg == "api key is inactive" || errMsg == "user not found" {
			w.WriteHeader(http.StatusUnauthorized)
		} else {
			w.WriteHeader(http.StatusTooManyRequests)
		}
		json.NewEncoder(w).Encode(map[string]string{
			"error": errMsg,
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
