import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loadSession, clearSession, loadProfile } from '../api/authApi'

const TIER_LABEL = { free: 'Starter', standard: 'Standard', pro: 'Pro' }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = loadSession()
  const profileRef = useRef(null)
  const [profile, setProfile] = useState(() => user ? loadProfile(user.id) : {})
  const displayName = profile.name || (user ? (user.username || user.email || '?') : '?')

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // รีโหลด profile เมื่อมีการบันทึกจาก ProfilePage
  useEffect(() => {
    const handler = () => setProfile(user ? loadProfile(user.id) : {})
    window.addEventListener('carapi:profileUpdated', handler)
    return () => window.removeEventListener('carapi:profileUpdated', handler)
  }, [])

  const handleLogout = () => {
    clearSession()
    setOpen(false)
    setProfileOpen(false)
    navigate('/')
    window.location.reload()
  }

  const navLinks = [
    { to: '/', label: 'หน้าแรก' },
    { to: '/cars', label: 'รถยนต์' },
    { to: '/pricing', label: 'ราคา' },
    { to: '/api', label: 'เอกสาร API' },
    { to: '/contact', label: 'ติดต่อ' },
  ]

  return (
    <header className="bg-white border-b border-rim sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* โลโก้ */}
        <Link to="/" className="flex items-center gap-0.5 select-none">
          <span className="text-navy font-semibold text-[15px] tracking-tight">Car</span>
          <span className="text-accent font-semibold text-[15px] tracking-tight">API</span>
          <span className="w-1.5 h-1.5 rounded-full bg-highlight border border-accent/40 ml-1 mt-0.5" />
        </Link>

        {/* เมนูหน้าจอใหญ่ */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm transition-colors duration-150 ${
                pathname === to
                  ? 'text-navy font-medium'
                  : 'text-gray-500 hover:text-navy'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ส่วนขวา */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {/* Dashboard link */}
              <Link
                to="/dashboard"
                className={`text-sm transition-colors ${pathname === '/dashboard' ? 'text-navy font-medium' : 'text-gray-500 hover:text-navy'}`}
              >
                Dashboard
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-highlight border border-accent/30 overflow-hidden flex items-center justify-center">
                    {profile.avatar
                      ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-sm font-semibold text-accent">
                          {displayName[0].toUpperCase()}
                        </span>
                    }
                  </div>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card py-1 shadow-lg">
                    <div className="px-4 py-2.5 border-b border-rim">
                      <p className="text-sm font-medium text-navy truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{TIER_LABEL[user.tier] || 'Starter'}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-navy hover:bg-base transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      โปรไฟล์
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-navy hover:bg-base transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-navy hover:bg-base transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      อัปเกรดแผน
                    </Link>
                    <div className="border-t border-rim mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-500 hover:text-navy transition-colors">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* ปุ่มเมนูมือถือ */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 -mr-2 text-gray-500 hover:text-navy transition-colors"
          aria-label="เปิด/ปิดเมนู"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* เมนูมือถือ */}
      {open && (
        <div className="md:hidden bg-white border-t border-rim px-6 pb-5 pt-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center h-10 text-sm ${
                pathname === to ? 'text-navy font-medium' : 'text-gray-500'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-rim mt-3 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 py-1">
                  <div className="w-7 h-7 rounded-full bg-highlight border border-accent/30 overflow-hidden flex items-center justify-center">
                    {profile.avatar
                      ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-xs font-semibold text-accent">
                          {displayName[0].toUpperCase()}
                        </span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{displayName}</p>
                    <p className="text-xs text-gray-400">{TIER_LABEL[user.tier] || 'Starter'}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-secondary block text-center w-full">Dashboard</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="btn-secondary block text-center w-full">โปรไฟล์</Link>
                <Link to="/pricing" onClick={() => setOpen(false)} className="btn-secondary block text-center w-full">อัปเกรดแผน</Link>
                <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary block text-center w-full">เข้าสู่ระบบ</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary block text-center w-full">สมัครสมาชิก</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
