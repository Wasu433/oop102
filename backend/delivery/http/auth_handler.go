package http

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/domain"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userRepo domain.UserRepository
	keyRepo  domain.APIKeyRepository
}

func NewAuthHandler(userRepo domain.UserRepository, keyRepo domain.APIKeyRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, keyRepo: keyRepo}
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Login    string `json:"login"` // email หรือ username
	Password string `json:"password"`
}

type AuthResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Tier      string `json:"tier"`
	APIKey    string `json:"api_key"`
	CreatedAt string `json:"created_at"`
}

// POST /api/v1/auth/register
func (h *AuthHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Username = strings.TrimSpace(req.Username)
	req.Name = strings.TrimSpace(req.Name)

	if req.Email == "" || req.Password == "" || req.Name == "" || req.Username == "" {
		jsonError(w, "name, username, email และ password จำเป็นต้องกรอก", http.StatusBadRequest)
		return
	}
	if len(req.Password) < 8 {
		jsonError(w, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", http.StatusBadRequest)
		return
	}

	if existing, _ := h.userRepo.FindByEmail(req.Email); existing != nil {
		jsonError(w, "อีเมลนี้ถูกใช้งานแล้ว", http.StatusConflict)
		return
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "เกิดข้อผิดพลาด กรุณาลองใหม่", http.StatusInternalServerError)
		return
	}

	now := time.Now().Format(time.RFC3339)
	userID := "usr_" + generateAPIKey()[3:19]
	user := &domain.User{
		ID:        userID,
		Email:     req.Email,
		Username:  req.Username,
		Tier:      domain.TierFree,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.userRepo.CreateUserWithPassword(user, string(hashed)); err != nil {
		jsonError(w, "ไม่สามารถสร้างบัญชีได้", http.StatusInternalServerError)
		return
	}

	// สร้าง API Key อัตโนมัติ
	apiKey := &domain.APIKey{
		Key:       generateAPIKey(),
		UserID:    userID,
		Name:      "Default Key",
		IsActive:  true,
		CreatedAt: now,
	}
	h.keyRepo.CreateAPIKey(apiKey)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{
		ID:        user.ID,
		Name:      req.Name,
		Username:  user.Username,
		Email:     user.Email,
		Tier:      user.Tier,
		APIKey:    apiKey.Key,
		CreatedAt: user.CreatedAt,
	})
}

// POST /api/v1/auth/login
func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.Login = strings.TrimSpace(req.Login)

	if req.Login == "" || req.Password == "" {
		jsonError(w, "username/email และ password จำเป็นต้องกรอก", http.StatusBadRequest)
		return
	}

	// ลองหาจาก email ก่อน ถ้าไม่เจอให้หาจาก username
	var user *domain.User
	var hashedPassword string
	var err error

	if strings.Contains(req.Login, "@") {
		user, hashedPassword, err = h.userRepo.FindByEmailWithPassword(strings.ToLower(req.Login))
	} else {
		user, hashedPassword, err = h.userRepo.FindByUsernameWithPassword(req.Login)
	}
	if err != nil {
		jsonError(w, "username/email หรือรหัสผ่านไม่ถูกต้อง", http.StatusUnauthorized)
		return
	}

	if hashedPassword == "" {
		jsonError(w, "บัญชีนี้ไม่มีรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		jsonError(w, "username/email หรือรหัสผ่านไม่ถูกต้อง", http.StatusUnauthorized)
		return
	}

	// ดึง API key แรกของ user
	keys, _ := h.keyRepo.FindByUserID(user.ID)
	apiKeyStr := ""
	if len(keys) > 0 {
		apiKeyStr = keys[0].Key
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		Tier:      user.Tier,
		APIKey:    apiKeyStr,
		CreatedAt: user.CreatedAt,
	})
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
