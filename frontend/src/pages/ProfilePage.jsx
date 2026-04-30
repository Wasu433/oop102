import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadSession, clearSession, loadUserKeys } from '../api/authApi'

const TIER_LABEL = { free: 'Starter', standard: 'Standard', pro: 'Pro' }
const TIER_COLOR = {
  free:     'bg-gray-100 text-gray-600 border-gray-200',
  standard: 'bg-blue-50 text-blue-700 border-blue-200',
  pro:      'bg-purple-50 text-purple-700 border-purple-200',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = loadSession()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [])

  if (!user) return null

  const keys = loadUserKeys(user.id)
  const tier = user.tier || 'free'
  const tierLabel = TIER_LABEL[tier] || tier
  const tierColor = TIER_COLOR[tier] || TIER_COLOR.free

  const handleLogout = () => {
    clearSession()
    navigate('/')
    window.location.reload()
  }

  return (
    <div className="bg-base min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-6 space-y-6">

        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-navy transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Avatar + name */}
        <div className="card p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-highlight border-2 border-accent/30 flex items-center justify-center mb-4">
            <span className="text-2xl font-semibold text-accent">
              {(user.username || user.email || '?')[0].toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-medium text-navy">{user.username || '—'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <span className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full border ${tierColor}`}>
            {tierLabel}
          </span>
        </div>

        {/* Info */}
        <div className="card p-6 space-y-5">
          <h2 className="text-navy font-medium">ข้อมูลบัญชี</h2>

          <div className="space-y-4">
            <Row label="User ID" value={user.id} mono />
            <Row label="Username" value={user.username || '—'} />
            <Row label="อีเมล" value={user.email} />
            <Row label="แผน" value={tierLabel} />
            <Row label="สมัครเมื่อ" value={user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          </div>
        </div>

        {/* Keys summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-navy font-medium">API Keys ({keys.length})</h2>
            <Link to="/dashboard" className="text-xs text-accent hover:text-secondary transition-colors">จัดการ keys →</Link>
          </div>
          {keys.length === 0 ? (
            <p className="text-sm text-gray-400">ยังไม่มี API Key</p>
          ) : (
            <div className="space-y-2">
              {keys.map((k, i) => (
                <div key={k.key} className="flex items-center justify-between py-2 border-b border-rim last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy">{k.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{k.key.slice(0, 14)}••••</p>
                  </div>
                  {i === 0 && <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full">หลัก</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/pricing" className="btn-primary text-center flex-1">ดูแผนราคา / อัปเกรด</Link>
          <button onClick={handleLogout} className="btn-secondary flex-1 text-center">ออกจากระบบ</button>
        </div>

      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-rim last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-navy text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
