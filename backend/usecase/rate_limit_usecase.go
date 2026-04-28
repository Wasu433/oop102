package usecase

import (
	"fmt"
	"time"

	"backend/domain"
)

// RateLimitUseCase = ตรวจสอบและบันทึกการใช้งาน
type RateLimitUseCase struct {
	userRepo     domain.UserRepository
	keyRepo      domain.APIKeyRepository
	usageRepo    domain.APIUsageRepository
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

// CheckRateLimit = ตรวจสอบว่า API key นี้สามารถใช้งานได้หรือไม่
func (uc *RateLimitUseCase) CheckRateLimit(apiKey string) (bool, error) {
	// 1. หา API key
	key, err := uc.keyRepo.FindByKey(apiKey)
	if err != nil {
		return false, fmt.Errorf("invalid api key")
	}

	// 2. ตรวจสอบว่า key ยังใช้งานได้
	if !key.IsActive {
		return false, fmt.Errorf("api key is inactive")
	}

	// 3. หาข้อมูล user
	user, err := uc.userRepo.FindByID(key.UserID)
	if err != nil {
		return false, fmt.Errorf("user not found")
	}

	// 4. ดึงจำนวน requests ของ user วันนี้
	dailyUsage, err := uc.usageRepo.GetDailyUsage(apiKey)
	if err != nil {
		return false, err
	}

	// 5. ตรวจสอบ limit ตามเทียร์
	var limit int
	switch user.Tier {
	case domain.TierFree:
		limit = domain.FreeTierLimit
	case domain.TierPro:
		limit = domain.ProTierLimit
	default:
		limit = domain.FreeTierLimit
	}

	// ถ้าเกินลิมิต
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

	// บันทึก usage
	if err := uc.usageRepo.RecordUsage(usage); err != nil {
		return err
	}

	// อัปเดต last_used_at
	return uc.keyRepo.UpdateLastUsed(apiKey)
}

// GetRateLimitInfo = ดึงข้อมูล rate limit ปัจจุบัน
func (uc *RateLimitUseCase) GetRateLimitInfo(apiKey string) (*domain.RateLimit, error) {
	// หา API key
	key, err := uc.keyRepo.FindByKey(apiKey)
	if err != nil {
		return nil, fmt.Errorf("invalid api key")
	}

	// หา user
	user, err := uc.userRepo.FindByID(key.UserID)
	if err != nil {
		return nil, err
	}

	// ดึง usage
	usage, err := uc.usageRepo.GetDailyUsage(apiKey)
	if err != nil {
		return nil, err
	}

	// กำหนด limit ตามเทียร์
	var limit int
	switch user.Tier {
	case domain.TierFree:
		limit = domain.FreeTierLimit
	case domain.TierPro:
		limit = domain.ProTierLimit
	default:
		limit = domain.FreeTierLimit
	}

	// คำนวณเวลา reset (24 ชั่วโมงต่อมา)
	resetTime := time.Now().Add(24 * time.Hour).Format(time.RFC3339)

	return &domain.RateLimit{
		Tier:         user.Tier,
		DailyLimit:   limit,
		CurrentCount: usage,
		ResetTime:    resetTime,
	}, nil
}
