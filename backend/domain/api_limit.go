package domain

// User = ผู้ใช้บริการ API
type User struct {
	ID        string
	Email     string
	Username  string
	Tier      string
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
	TierFree     = "free"
	TierStandard = "standard"
	TierPro      = "pro"
)

// Rate limit values
const (
	FreeTierLimit       = 100      // 100 requests/day
	StandardTierLimit   = 10000    // 50,000 requests/day
	ProTierLimit        = 1000000    // 10,000 requests/day
	
)

// UserRepository = interface สำหรับ user storage
type UserRepository interface {
	CreateUser(user *User) error
	CreateUserWithPassword(user *User, hashedPassword string) error
	FindByID(id string) (*User, error)
	FindByEmail(email string) (*User, error)
	FindByEmailWithPassword(email string) (*User, string, error)
	FindByUsernameWithPassword(username string) (*User, string, error)
}

// APIKeyRepository = interface สำหรับ API key storage
type APIKeyRepository interface {
	CreateAPIKey(key *APIKey) error
	FindByKey(key string) (*APIKey, error)
	FindByUserID(userID string) ([]APIKey, error)
	UpdateLastUsed(key string) error
	DeleteAPIKey(key string) error
}

// APIUsageRepository = interface สำหรับ usage tracking
type APIUsageRepository interface {
	RecordUsage(usage *APIUsage) error
	GetDailyUsage(apiKey string) (int, error)
	GetUsageSince(apiKey string, since string) (int, error)
}
