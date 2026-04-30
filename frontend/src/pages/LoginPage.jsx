import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, saveSession } from '../api/authApi'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setLoading(true)
    try {
      const { data } = await login(form.login, form.password)
      saveSession(data)
      navigate('/dashboard')
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
          <h1 className="text-2xl font-medium text-navy mb-1">เข้าสู่ระบบ</h1>
          <p className="text-sm text-gray-500">ยินดีต้อนรับกลับมา</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">อีเมล หรือ Username</label>
              <input
                type="text"
                name="login"
                value={form.login}
                onChange={handleChange}
                placeholder="you@example.com หรือ username"
                className="input"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-navy">รหัสผ่าน</label>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input"
                autoComplete="current-password"
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
              {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-accent hover:text-secondary font-medium transition-colors">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}
