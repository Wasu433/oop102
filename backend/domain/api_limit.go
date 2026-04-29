package domain

// User = ผู้ใช้บริการ API
type User struct {
	ID        string
	Email     string
	Tier      string // "free", "pro" หรือ "enterprise"
	CreatedAt string
	UpdatedAt string
}

// APIKey = กุญแจสำหรับเข้าใช้ API
type APIKey struct {
	Key       string
	UserID    string
	Name      string
	IsActive  bool
	CreatedAt string
	LastUsedAt *string
}

// APIUsage = บันทึกการใช้งาน API
type APIUsage struct {
	ID         int
	APIKey     string
	Endpoint   string
	Method     string
	StatusCode int
	Timestamp  string
}

// RateLimit = กฎการจำกัดการใช้งาน
type RateLimit struct {
	Tier          string
	DailyLimit    int
	CurrentCount  int
	ResetTime     string
}

// Tier constants
const (
	TierFree       = "free"
	TierPro        = "pro"
	TierEnterprise = "enterprise"
)

// Rate limit values
const (
	FreeTierLimit       = 100      // 100 requests/day
	ProTierLimit        = 10000    // 10,000 requests/day
	EnterpriseTierLimit = 100000   // 100,000 requests/day
)

// UserRepository = interface สำหรับ user storage
type UserRepository interface {
	CreateUser(user *User) error
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
}

// APIKeyRepository = interface สำหรับ API key storage
type APIKeyRepository interface {
	CreateAPIKey(key *APIKey) error
	FindByKey(key string) (*APIKey, error)
	FindByUserID(userID string) ([]APIKey, error)
	UpdateLastUsed(key string) error
}

// APIUsageRepository = interface สำหรับ usage tracking
type APIUsageRepository interface {
	RecordUsage(usage *APIUsage) error
	GetDailyUsage(apiKey string) (int, error)
	GetUsageSince(apiKey string, since string) (int, error)
}
