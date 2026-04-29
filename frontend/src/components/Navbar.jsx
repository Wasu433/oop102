import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'หน้าแรก' },
  { to: '/pricing', label: 'ราคา' },
  { to: '/api', label: 'เอกสาร API' },
  { to: '/contact', label: 'ติดต่อ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

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

        {/* ปุ่ม CTA หน้าจอใหญ่ */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/contact" className="text-sm text-gray-500 hover:text-navy transition-colors">
            เข้าสู่ระบบ
          </Link>
          <Link to="/pricing" className="btn-primary py-2 px-4 text-sm">
            รับ API Key
          </Link>
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
          <div className="pt-3 border-t border-rim mt-3">
            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="btn-primary block text-center w-full"
            >
              รับ API Key
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
