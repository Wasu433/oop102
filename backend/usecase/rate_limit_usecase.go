package usecase

import (
	"fmt"
	"strings"
	"time"

	"backend/domain"
)

// RateLimitUseCase = ตรวจสอบและบันทึกการใช้งาน
type RateLimitUseCase struct {
	userRepo  domain.UserRepository
	keyRepo   domain.APIKeyRepository
	usageRepo domain.APIUsageRepository
}

func NewRateLimitUseCase(
	userRepo domain.UserRepository,
	keyRepo domain.APIKeyRepository,
	usageRepo domain.APIUsageRepository,
) *RateLimitUseCase {
	return &RateLimitUseCase{
		userRepo:  userRepo,
		keyRepo:   keyRepo,
		usageRepo: usageRepo,
	}
}

func getLimitByTier(tier string) (string, int) {
	tier = strings.ToLower(strings.TrimSpace(tier))

	switch tier {
	case domain.TierFree:
		return tier, domain.FreeTierLimit
	case domain.TierPro:
		return tier, domain.ProTierLimit
	case domain.TierEnterprise:
		return tier, domain.EnterpriseTierLimit
	default:
		return domain.TierFree, domain.FreeTierLimit
	}
}

// CheckRateLimit = ตรวจสอบว่า API key นี้สามารถใช้งานได้หรือไม่
func (uc *RateLimitUseCase) CheckRateLimit(apiKey string) (bool, error) {
	key, err := uc.keyRepo.FindByKey(apiKey)
	if err != nil {
		return false, fmt.Errorf("invalid api key")
	}

	if !key.IsActive {
		return false, fmt.Errorf("api key is inactive")
	}

	user, err := uc.userRepo.FindByID(key.UserID)
	if err != nil {
		return false, fmt.Errorf("user not found")
	}

	dailyUsage, err := uc.usageRepo.GetDailyUsage(apiKey)
	if err != nil {
		return false, err
	}

	_, limit := getLimitByTier(user.Tier)

	if dailyUsage >= limit {
		return false, fmt.Errorf("rate limit exceeded. limit: %d/day, current: %d", limit, dailyUsage)
	}

	return true, nil
}

// RecordUsage = บันทึกการใช้งาน
func (uc *RateLimitUseCase) RecordUsage(apiKey, endpoint, method string, statusCode int) error {
	usage := &domain.APIUsage{
		APIKey:     apiKey,
		Endpoint:   endpoint,
		Method:     method,
		StatusCode: statusCode,
		Timestamp:  time.Now().Format(time.RFC3339),
	}

	if err := uc.usageRepo.RecordUsage(usage); err != nil {
		return err
	}

	return uc.keyRepo.UpdateLastUsed(apiKey)
}

// GetRateLimitInfo = ดึงข้อมูล rate limit ปัจจุบัน
func (uc *RateLimitUseCase) GetRateLimitInfo(apiKey string) (*domain.RateLimit, error) {
	key, err := uc.keyRepo.FindByKey(apiKey)
	if err != nil {
		return nil, fmt.Errorf("invalid api key")
	}

	user, err := uc.userRepo.FindByID(key.UserID)
	if err != nil {
		return nil, err
	}

	usage, err := uc.usageRepo.GetDailyUsage(apiKey)
	if err != nil {
		return nil, err
	}

	tier, limit := getLimitByTier(user.Tier)

	resetTime := time.Now().Add(24 * time.Hour).Format(time.RFC3339)

	return &domain.RateLimit{
		Tier:         tier,
		DailyLimit:   limit,
		CurrentCount: usage,
		ResetTime:    resetTime,
	}, nil
}