import { Link } from 'react-router-dom'

const columns = [
  {
    heading: 'ผลิตภัณฑ์',
    links: [
      { to: '/', label: 'หน้าแรก' },
      { to: '/pricing', label: 'ราคา' },
      { to: '/api', label: 'เอกสาร API' },
      { to: '/contact', label: 'ติดต่อ' },
    ],
  },
  {
    heading: 'นักพัฒนา',
    links: [
      { label: 'เริ่มต้นใช้งาน' },
      { label: 'การยืนยันตัวตน' },
      { label: 'ขีดจำกัดการใช้งาน' },
      { label: 'บันทึกการอัปเดต' },
    ],
  },
  {
    heading: 'บริษัท',
    links: [
      { label: 'เกี่ยวกับเรา' },
      { label: 'บล็อก' },
      { label: 'นโยบายความเป็นส่วนตัว' },
      { label: 'ข้อกำหนดการใช้บริการ' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-rim">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* แบรนด์ */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-0.5 mb-3 select-none">
            <span className="text-navy font-semibold text-[15px]">Car</span>
            <span className="text-accent font-semibold text-[15px]">API</span>
            <span className="w-1.5 h-1.5 rounded-full bg-highlight border border-accent/40 ml-1" />
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
            ข้อมูลราคารถยนต์ไทยแบบเรียลไทม์ สำหรับนักพัฒนาและธุรกิจ
          </p>
        </div>

        {columns.map(({ heading, links }) => (
          <div key={heading}>
            <p className="eyebrow mb-4">{heading}</p>
            <ul className="space-y-2.5">
              {links.map(({ to, label }) => (
                <li key={label}>
                  {to ? (
                    <Link to={to} className="text-sm text-gray-500 hover:text-navy transition-colors">
                      {label}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-rim">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} CarAPI. สงวนลิขสิทธิ์</p>
          <p className="text-xs text-gray-400">กรุงเทพมหานคร, ประเทศไทย</p>
        </div>
      </div>
    </footer>
  )
}
