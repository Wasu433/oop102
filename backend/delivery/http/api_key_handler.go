package http

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"backend/domain"
	"backend/usecase"
)

// APIKeyHandler = จัดการ API keys
type APIKeyHandler struct {
	userRepo  domain.UserRepository
	keyRepo   domain.APIKeyRepository
	rateLimitUC *usecase.RateLimitUseCase
}

func NewAPIKeyHandler(
	userRepo domain.UserRepository,
	keyRepo domain.APIKeyRepository,
	rateLimitUC *usecase.RateLimitUseCase,
) *APIKeyHandler {
	return &APIKeyHandler{
		userRepo:  userRepo,
		keyRepo:   keyRepo,
		rateLimitUC: rateLimitUC,
	}
}

// Request/Response DTOs

type CreateUserRequest struct {
	Email string `json:"email"`
	Tier  string `json:"tier"` 
}

type CreateAPIKeyRequest struct {
	UserID string `json:"user_id"`
	Name   string `json:"name"`
}

type APIKeyResponse struct {
	Key       string `json:"key"`
	UserID    string `json:"user_id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
}

type RateLimitResponse struct {
	Tier       string `json:"tier"`
	DailyLimit int    `json:"daily_limit"`
	Current    int    `json:"current"`
	ResetTime  string `json:"reset_time"`
}

// GenerateAPIKey = สร้าง API key แบบ random
func generateAPIKey() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return "sk_" + hex.EncodeToString(b)
}

// HandleCreateUser = POST /api/v1/users
func (h *APIKeyHandler) HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	tier := strings.ToLower(strings.TrimSpace(req.Tier))
	if tier == "" {
		tier = domain.TierFree
	}
	switch tier {
	case domain.TierFree, domain.TierStandard, domain.TierPro:
	default:
		http.Error(w, "invalid tier", http.StatusBadRequest)
		return
	}

	// สร้าง user ใหม่
	userID := generateAPIKey() // ใช้เป็น user ID
	user := &domain.User{
		ID:        userID,
		Email:     req.Email,
		Tier:      tier,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	if err := h.userRepo.CreateUser(user); err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// HandleCreateAPIKey = POST /api/v1/keys
func (h *APIKeyHandler) HandleCreateAPIKey(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateAPIKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// สร้าง API key ใหม่
	apiKey := &domain.APIKey{
		Key:       generateAPIKey(),
		UserID:    req.UserID,
		Name:      req.Name,
		IsActive:  true,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	if err := h.keyRepo.CreateAPIKey(apiKey); err != nil {
		http.Error(w, "Failed to create API key", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(APIKeyResponse{
		Key:       apiKey.Key,
		UserID:    apiKey.UserID,
		Name:      apiKey.Name,
		CreatedAt: apiKey.CreatedAt,
	})
}

// HandleGetUserKeys = GET /api/v1/keys?user_id=xxx
func (h *APIKeyHandler) HandleGetUserKeys(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id required", http.StatusBadRequest)
		return
	}
	keys, err := h.keyRepo.FindByUserID(userID)
	if err != nil {
		http.Error(w, "Failed to fetch keys", http.StatusInternalServerError)
		return
	}
	resp := make([]APIKeyResponse, len(keys))
	for i, k := range keys {
		resp[i] = APIKeyResponse{Key: k.Key, UserID: k.UserID, Name: k.Name, CreatedAt: k.CreatedAt}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HandleDeleteAPIKey = DELETE /api/v1/keys/{key}
func (h *APIKeyHandler) HandleDeleteAPIKey(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ดึง key value จาก path: /api/v1/keys/{key}
	keyValue := strings.TrimPrefix(r.URL.Path, "/api/v1/keys/")
	// frontend encodes the key in the URL (encodeURIComponent). Decode it here.
	if decoded, err := url.PathUnescape(keyValue); err == nil {
		keyValue = decoded
	}
	if keyValue == "" {
		jsonError(w, "key required in path", http.StatusBadRequest)
		return
	}

	// รับ user_id จาก query param หรือ body
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		var body struct {
			UserID string `json:"user_id"`
		}
		json.NewDecoder(r.Body).Decode(&body)
		userID = body.UserID
	}
	if userID == "" {
		jsonError(w, "user_id required", http.StatusBadRequest)
		return
	}

	// ตรวจสอบว่า key นี้เป็นของ user นี้จริง
	existing, err := h.keyRepo.FindByKey(keyValue)
	if err != nil {
		jsonError(w, "key not found", http.StatusNotFound)
		return
	}
	if existing.UserID != userID {
		jsonError(w, "unauthorized", http.StatusForbidden)
		return
	}

	if err := h.keyRepo.DeleteAPIKey(keyValue); err != nil {
		jsonError(w, "failed to delete key", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "key deleted"})
}

// HandleGetRateLimitInfo = GET /api/v1/rate-limit
func (h *APIKeyHandler) HandleGetRateLimitInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	apiKey := r.Header.Get("X-API-Key")
	if apiKey == "" {
		http.Error(w, "API key required", http.StatusBadRequest)
		return
	}

	info, err := h.rateLimitUC.GetRateLimitInfo(apiKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(RateLimitResponse{
		Tier:       info.Tier,
		DailyLimit: info.DailyLimit,
		Current:    info.CurrentCount,
		ResetTime:  info.ResetTime,
	})
}
