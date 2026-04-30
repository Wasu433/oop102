import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, saveSession } from '../api/authApi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.username || !form.email || !form.password || !form.confirm) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    if (form.password !== form.confirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }
    if (form.password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }

    setLoading(true)
    try {
      const { data } = await register(form.name, form.username, form.email, form.password)
      saveSession({ ...data, name: form.name })
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-base">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0.5 mb-6">
            <span className="text-navy font-semibold text-[15px] tracking-tight">Car</span>
            <span className="text-accent font-semibold text-[15px] tracking-tight">API</span>
            <span className="w-1.5 h-1.5 rounded-full bg-highlight border border-accent/40 ml-1 mt-0.5" />
          </Link>
          <h1 className="text-2xl font-medium text-navy mb-1">สมัครสมาชิก</h1>
          <p className="text-sm text-gray-500">สร้างบัญชีและรับ API Key ฟรีทันที</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">ชื่อ</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ชื่อของคุณ"
                className="input"
                autoComplete="name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="เช่น john_doe"
                className="input"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">อีเมล</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="input"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังสร้างบัญชี…' : 'สร้างบัญชี'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
            การสมัครถือว่าคุณยอมรับ{' '}
            <Link to="/terms" className="text-accent hover:underline">ข้อกำหนดการใช้งาน</Link>
            {' '}และ{' '}
            <Link to="/privacy" className="text-accent hover:underline">นโยบายความเป็นส่วนตัว</Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="text-accent hover:text-secondary font-medium transition-colors">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
