# 🚀 API Configuration Guide

## วิธีการตั้งค่า API Keys สำหรับ Frontend

### 📋 ขั้นตอนการตั้งค่า

#### 1. **Copy ไฟล์ Example**
```bash
cd frontend
cp .env.example .env.local
```

#### 2. **แก้ไขไฟล์ `.env.local`**
เปิดไฟล์ `.env.local` และแทนที่ค่า:

```env
# Backend API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# API Keys (แทนที่ด้วย real key ของคุณ)
VITE_API_KEY=SWgtIh8yqB03x6IBKyTtRwLZe8fhrmc3

# Optional: Other API keys
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
VITE_STRIPE_KEY=your_stripe_key
```

#### 3. **เทสการเชื่อมต่อ**
```bash
npm run dev
# เปิด browser ไปที่ http://localhost:5173/cars
# ตรวจสอบ Console (F12) ว่าไม่มี warning
```

---

## 🔐 ความปลอดภัย

### ✅ ทำ
- ✅ ใช้ `.env.local` สำหรับ sensitive data
- ✅ Commit `.env.example` (ไม่มี real values)
- ✅ ใส่ `.env.local` ใน `.gitignore`
- ✅ ใช้ `VITE_` prefix สำหรับ environment variables

### ❌ อย่าทำ
- ❌ ไม่ commit `.env.local` ไปที่ Git
- ❌ ไม่ใส่ API key ใน source code โดยตรง
- ❌ ไม่แชร์ `.env.local` กับทีม (ให้คนแต่ละคนสร้างเอง)
- ❌ ไม่ push secrets ไปที่ public repositories

---

## 📚 Environment Variables ทั้งหมด

| Variable | ตำแหน่ง | ตัวอย่าง | บังคับหรือไม่ |
|----------|--------|---------|-----------|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:8080/api/v1` | บังคับ |
| `VITE_API_KEY` | API Key | `SWgtIh8yqB03x6IBKyTtRwLZe8fhrmc3` | ไม่บังคับ |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps API | `AIza...` | ไม่บังคับ |
| `VITE_STRIPE_KEY` | Stripe Key | `pk_test_...` | ไม่บังคับ |

---

## 🔑 วิธีเข้าถึง Environment Variables ใน Code

### TypeScript/React:
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// ตรวจสอบว่ามีค่าหรือไม่
if (!apiKey) {
  console.warn('API_KEY is not configured');
}
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'import.meta'"
**Solution:** ตรวจสอบ `vite.config.ts` มี `define` config หรือไม่

### Problem: Environment variables ไม่โหลด
**Solution:** 
1. Restart dev server: `npm run dev`
2. ลบ node_modules: `rm -rf node_modules && npm install`

### Problem: API เรียนไม่ได้
**Solution:** ตรวจสอบ:
- ✅ Backend ทำงานอยู่ที่ port 8080
- ✅ `VITE_API_BASE_URL` ถูกต้อง
- ✅ Browser Console มี error อะไร

---

## 📖 อ้างอิง

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
- [Environment Variables Best Practices](https://12factor.net/config)
