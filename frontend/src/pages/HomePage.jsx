import { Link } from 'react-router-dom'

const Icon = ({ d, ...props }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
  </svg>
)

const features = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'ราคาเรียลไทม์',
    desc: 'ข้อมูลตลาดอัปเดตทุกวันจากแหล่งข้อมูลยานยนต์ไทยที่เชื่อถือได้ ครอบคลุมทุกจังหวัด',
  },
  {
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
    title: 'รุ่นรถกว่า 50,000 รุ่น',
    desc: 'ครอบคลุมทุกยี่ห้อหลักในไทย ทั้ง Toyota, Honda, Isuzu, BMW, Mercedes และอีกมากมาย',
  },
  {
    icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z',
    title: 'กรองข้อมูลได้หลายมิติ',
    desc: 'ระบุยี่ห้อ ปีรุ่น ตัวถัง ประเภทเชื้อเพลิง สภาพ หรือจังหวัดได้ในคำขอเดียว',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'SLA อัปไทม์ 99.9%',
    desc: 'โครงสร้างพื้นฐานระดับองค์กรพร้อม CDN ทั่วโลกและระบบ failover อัตโนมัติ',
  },
  {
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    title: 'REST API ที่ใช้งานง่าย',
    desc: 'JSON response ที่มีโครงสร้างชัดเจน endpoints คาดเดาได้ และเอกสาร OpenAPI ครบถ้วน',
  },
  {
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    title: 'สนับสนุนนักพัฒนา',
    desc: 'ชุมชน Slack อีเมลสนับสนุน และคู่มือการเชื่อมต่อแบบ step-by-step',
  },
]

const stats = [
  ['50K+', 'รุ่นรถยนต์'],
  ['200+', 'ยี่ห้อ'],
  ['ทุกวัน', 'อัปเดตข้อมูล'],
  ['99.9%', 'อัปไทม์'],
]

const sampleCode = `GET /v1/cars?brand=Toyota&year=2024&fuel=hybrid
X-API-Key: ••••••••••••••••

{
  "data": [
    {
      "id": "TH-TOY-CAMRY-HV-2024",
      "brand": "Toyota",
      "model": "Camry",
      "trim": "2.5 HV Premium",
      "year": 2024,
      "fuel": "hybrid",
      "price_thb": 1759000,
      "updated": "2024-01-15"
    }
  ],
  "meta": { "total": 12, "page": 1 }
}`

const pricingTeaser = [
  { name: 'Starter', price: 'ฟรี', note: '500 req / เดือน' },
  { name: 'Pro',     price: '฿990', note: '50,000 req / เดือน', popular: true },
  { name: 'Enterprise', price: 'ติดต่อเรา', note: 'ไม่จำกัด' },
]

export default function HomePage() {
  return (
    <div className="bg-base">

      {/* ── Hero ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="badge mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            API ราคารถยนต์ไทย
          </span>

          <h1 className="text-5xl md:text-6xl font-medium text-navy leading-[1.1] tracking-tight mb-6">
            ราคารถที่แม่นยำ.<br />
            <span className="text-accent">API ที่ใช้งานง่าย.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            เข้าถึงราคาตลาดแบบเรียลไทม์ของทุกยี่ห้อ ทุกรุ่น และทุกตัวถังที่จำหน่ายในประเทศไทย
            เชื่อมต่อได้ในไม่กี่นาที ขยายได้ไม่มีขีดจำกัด
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/pricing" className="btn-primary text-base py-3 px-7">
              เริ่มต้นฟรี
              <svg className="inline-block ml-1.5 w-4 h-4 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/api" className="btn-secondary text-base py-3 px-7">
              ดูเอกสาร API
            </Link>
          </div>

          {/* สถิติ */}
          <div className="mt-14 pt-8 border-t border-rim flex flex-wrap justify-center gap-x-10 gap-y-4">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-xl font-medium text-navy">{val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ฟีเจอร์ ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <span className="eyebrow mb-2 block">ทำไมต้อง CarAPI</span>
            <h2 className="section-title">ทุกสิ่งที่ผลิตภัณฑ์ของคุณต้องการ</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="card-hover p-6">
                <div className="w-9 h-9 rounded-lg bg-highlight border border-accent/20 flex items-center justify-center mb-4">
                  <Icon d={icon} className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-navy font-medium mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ตัวอย่างการเชื่อมต่อ ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="eyebrow mb-3 block">การเชื่อมต่อ</span>
            <h2 className="section-title mb-4">พร้อมใช้งานภายใน 5 นาที</h2>
            <p className="section-sub mb-6">
              ไม่ต้องติดตั้ง SDK ส่ง HTTP Request พร้อม API Key รับข้อมูล JSON ได้ทันที
              รองรับทุกภาษา — Python, Node.js, Go, PHP หรือ curl ก็ได้
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'ยืนยันตัวตนผ่าน header X-API-Key',
                'กรอง แบ่งหน้า และเรียงข้อมูลได้ตามต้องการ',
                'ดูประวัติราคาตามช่วงวันที่ได้',
                'รองรับ Webhook แจ้งเตือนเมื่อราคาเปลี่ยนแปลง',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/api" className="btn-ghost">
              อ่านเอกสาร API
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* โค้ดตัวอย่าง */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-rim bg-base">
              <span className="w-3 h-3 rounded-full bg-red-300" />
              <span className="w-3 h-3 rounded-full bg-yellow-300" />
              <span className="w-3 h-3 rounded-full bg-green-300" />
              <span className="ml-3 text-xs text-gray-400 font-mono">GET /v1/cars</span>
            </div>
            <pre className="p-5 text-xs font-mono text-gray-200 bg-navy overflow-x-auto leading-relaxed">
              <code className="text-gray-300">{sampleCode}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── ตัวอย่างแผนราคา ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="eyebrow mb-2 block">ราคา</span>
              <h2 className="section-title">แผนบริการที่เรียบง่ายและโปร่งใส</h2>
            </div>
            <Link to="/pricing" className="btn-ghost shrink-0">
              ดูทุกแผน
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {pricingTeaser.map(({ name, price, note, popular }) => (
              <div
                key={name}
                className={`rounded-xl border p-6 ${
                  popular ? 'bg-highlight border-secondary' : 'bg-white border-rim'
                }`}
              >
                {popular && (
                  <span className="inline-block bg-navy text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3">
                    ยอดนิยม
                  </span>
                )}
                <p className="text-sm text-gray-500 mb-1">{name}</p>
                <p className="text-2xl font-medium text-navy">{price}</p>
                <p className="text-xs text-gray-400 mt-1">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-navy rounded-2xl px-8 py-14 text-center">
            <span className="badge bg-white/10 text-highlight border-white/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-highlight" />
              เริ่มสร้างวันนี้
            </span>
            <h2 className="text-3xl font-medium text-white mb-3">
              พร้อมเชื่อมต่อ API ราคารถยนต์ไทยแล้วหรือยัง?
            </h2>
            <p className="text-accent max-w-md mx-auto mb-8 leading-relaxed">
              ฟรีสูงสุด 500 requests ต่อเดือน ไม่ต้องใส่ข้อมูลบัตรเครดิต
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/pricing" className="bg-white text-navy px-7 py-3 rounded-lg text-sm font-medium hover:bg-highlight transition-colors">
                รับ API Key ฟรี
              </Link>
              <Link to="/api" className="bg-white/10 text-white border border-white/20 px-7 py-3 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                อ่านเอกสาร API
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
