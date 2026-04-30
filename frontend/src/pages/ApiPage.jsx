import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSession } from '../api/authApi'

const API_BASE = 'http://localhost:8080/api/v1'

const BRANDS = ['Toyota','Honda','BMW','Mercedes-Benz','Mazda','Isuzu','Ford','Nissan','Mitsubishi','MG','BYD','Tesla']
const YEAR_OPTIONS = Array.from({ length: 27 }, (_, i) => 2026 - i)

const endpoints = [
  {
    method: 'GET',
    path: '/v1/cars',
    summary: 'รายการรถ',
    desc: 'คืนรายการรถยนต์ทั้งหมด พร้อมตัวกรองที่หลากหลาย ต้องใส่ API Key ทุกครั้ง',
    params: [
      { name: 'api_key',  type: 'string',  req: false, desc: 'API Key — ใส่ใน URL param แทน header ได้' },
      { name: 'brand',    type: 'string',  req: false, desc: 'กรองตามยี่ห้อ เช่น Toyota' },
      { name: 'model',    type: 'string',  req: false, desc: 'กรองตามรุ่น เช่น Camry' },
      { name: 'year',     type: 'integer', req: false, desc: 'ปีรุ่น เช่น 2024' },
      { name: 'minPrice', type: 'number',  req: false, desc: 'ราคาต่ำสุด (฿) — Standard ขึ้นไป' },
      { name: 'maxPrice', type: 'number',  req: false, desc: 'ราคาสูงสุด (฿) — Standard ขึ้นไป' },
    ],
    response: `[
  {
    "id":      "car_001",
    "brand":   "Toyota",
    "model":   "Camry",
    "year":    2024,
    "price":   1759000,
    "color":   "Pearl White",
    "fuel":    "hybrid",
    "mileage": 0
  },
  ...
]`,
  },
  {
    method: 'GET',
    path: '/v1/cars/:id',
    summary: 'ข้อมูลรถตาม ID',
    desc: 'คืนรายละเอียดรถยนต์เฉพาะคัน',
    params: [
      { name: 'id',      type: 'string', req: true,  desc: 'รหัสรถยนต์ (path param)' },
      { name: 'api_key', type: 'string', req: false, desc: 'API Key — ใส่ใน URL param แทน header ได้' },
    ],
    response: `{
  "id":      "car_001",
  "brand":   "Toyota",
  "model":   "Camry",
  "year":    2024,
  "price":   1759000,
  "color":   "Pearl White",
  "fuel":    "hybrid",
  "mileage": 0
}`,
  },
  {
    method: 'GET',
    path: '/v1/cars/search',
    summary: 'ค้นหารถ',
    desc: 'ค้นหาด้วย query string หลายตัว: brand, model, year, minPrice, maxPrice',
    params: [
      { name: 'api_key',  type: 'string',  req: false, desc: 'API Key — ใส่ใน URL param แทน header ได้' },
      { name: 'brand',    type: 'string',  req: false, desc: 'ยี่ห้อ' },
      { name: 'model',    type: 'string',  req: false, desc: 'รุ่น' },
      { name: 'year',     type: 'integer', req: false, desc: 'ปี' },
      { name: 'minPrice', type: 'number',  req: false, desc: 'ราคาต่ำสุด' },
      { name: 'maxPrice', type: 'number',  req: false, desc: 'ราคาสูงสุด' },
    ],
    response: `[ /* รูปแบบเดียวกับ /v1/cars */ ]`,
  },
]

const errors = [
  { code: '200 OK',                desc: 'คำขอสำเร็จ' },
  { code: '400 Bad Request',       desc: 'พารามิเตอร์ไม่ถูกต้อง' },
  { code: '401 Unauthorized',      desc: 'ไม่มี API Key หรือ key ไม่ถูกต้อง / ไม่ active' },
  { code: '429 Too Many Requests', desc: 'เกินโควต้าของแผน (daily limit)' },
  { code: '500 Server Error',      desc: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' },
]

const GETTING_STARTED = '__start__'
const URL_BUILDER     = '__builder__'

function Step({ n, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 pb-6 border-b border-rim last:border-0 last:pb-0">
        <p className="text-sm font-medium text-navy mb-1.5">{title}</p>
        {children}
      </div>
    </div>
  )
}

function CopyBtn({ text, label = 'คัดลอก', doneLabel = '✓ คัดลอก' }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) }}
      className="text-xs text-gray-400 hover:text-white border border-white/20 px-2 py-0.5 rounded transition-colors flex-shrink-0"
    >
      {done ? doneLabel : label}
    </button>
  )
}

function UrlBuilder({ sessionKey }) {
  const [brand,    setBrand]    = useState('')
  const [year,     setYear]     = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [customKey, setCustomKey] = useState('')

  const apiKey = customKey.trim() || sessionKey || ''
  const displayKey = apiKey || 'YOUR_API_KEY'

  const buildUrl = () => {
    const p = new URLSearchParams()
    p.set('api_key', displayKey)
    if (brand)    p.set('brand',    brand)
    if (year)     p.set('year',     year)
    if (minPrice) p.set('minPrice', minPrice)
    if (maxPrice) p.set('maxPrice', maxPrice)
    return `${API_BASE}/cars?${p.toString()}`
  }

  const url = buildUrl()
  const isReal = !!apiKey

  return (
    <div>
      {/* Key input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1.5">
          API Key ของคุณ{' '}
          {sessionKey && <span className="text-green-600 font-medium">— ดึงจากบัญชีอัตโนมัติ</span>}
        </label>
        <input
          type="text"
          value={customKey || sessionKey || ''}
          onChange={e => setCustomKey(e.target.value)}
          placeholder="sk_xxxxxxxx... หรือวาง key ของคุณที่นี่"
          className="input text-sm font-mono"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">brand</label>
          <select value={brand} onChange={e => setBrand(e.target.value)} className="input text-sm">
            <option value="">ทั้งหมด</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">year</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="input text-sm">
            <option value="">ทั้งหมด</option>
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">minPrice (฿)</label>
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            placeholder="เช่น 500000" className="input text-sm" min={0} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">maxPrice (฿)</label>
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            placeholder="เช่น 2000000" className="input text-sm" min={0} />
        </div>
      </div>

      {/* Generated URL */}
      <div className="bg-navy rounded-xl px-4 py-3 flex items-center gap-3">
        <code className="text-green-300 text-xs font-mono flex-1 break-all leading-relaxed">{url}</code>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <CopyBtn text={url} />
          {isReal && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded transition-colors text-center"
            >
              เปิด ↗
            </a>
          )}
        </div>
      </div>

      {!isReal && (
        <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          ใส่ API Key จริงเพื่อเปิดลิงก์ใน Browser ได้เลย
          {!sessionKey && <> — <Link to="/dashboard" className="underline font-medium">สร้าง Key ใน Dashboard</Link></>}
        </p>
      )}
      {isReal && (
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          ลิงก์พร้อมใช้งาน — คัดลอกหรือคลิก "เปิด" เพื่อทดสอบใน Browser
        </p>
      )}
    </div>
  )
}

export default function ApiPage() {
  const [active, setActive] = useState(GETTING_STARTED)
  const [lang,   setLang]   = useState('curl')
  const user = loadSession()
  const sessionKey = user?.api_key || ''

  const selected = endpoints.find((e) => e.path === active)

  const codeExamples = {
    curl: `# วิธีที่ 1 — Header (แนะนำสำหรับ code)
curl -X GET "${API_BASE}/cars?brand=Toyota&year=2024" \\
  -H "X-API-Key: YOUR_API_KEY"

# วิธีที่ 2 — URL Parameter (วางใน Browser ได้เลย)
curl -X GET "${API_BASE}/cars?brand=Toyota&year=2024&api_key=YOUR_API_KEY"`,

    js: `import axios from 'axios'

// วิธีที่ 1 — Header
const client = axios.create({
  baseURL: '${API_BASE}',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
})
const { data } = await client.get('/cars', {
  params: { brand: 'Toyota', year: 2024 }
})

// วิธีที่ 2 — URL Parameter
const resp = await axios.get('${API_BASE}/cars', {
  params: { brand: 'Toyota', year: 2024, api_key: 'YOUR_API_KEY' }
})`,

    python: `import requests

# วิธีที่ 1 — Header
resp = requests.get(
    "${API_BASE}/cars",
    headers={"X-API-Key": "YOUR_API_KEY"},
    params={"brand": "Toyota", "year": 2024}
)

# วิธีที่ 2 — URL Parameter (วางใน Browser ได้)
resp = requests.get(
    "${API_BASE}/cars",
    params={"brand": "Toyota", "year": 2024, "api_key": "YOUR_API_KEY"}
)
print(resp.json())`,
  }

  return (
    <div className="bg-base min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-rim">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <span className="eyebrow mb-2 block">อ้างอิง</span>
          <h1 className="text-4xl font-medium text-navy mb-3">เอกสาร API</h1>
          <p className="text-gray-500 max-w-xl">
            REST API ที่ส่ง JSON กลับมา ยืนยันตัวตนด้วย API Key ผ่าน{' '}
            <code className="text-accent bg-base px-1.5 py-0.5 rounded text-sm font-mono">X-API-Key</code>{' '}
            header หรือ{' '}
            <code className="text-accent bg-base px-1.5 py-0.5 rounded text-sm font-mono">?api_key=</code>{' '}
            ใน URL
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-sm text-gray-500">
            <span>
              Base URL:{' '}
              <code className="text-navy font-mono text-sm bg-base px-2 py-0.5 rounded border border-rim">
                {API_BASE}
              </code>
            </span>
            <span className="text-rim">|</span>
            <span>เวอร์ชัน: <code className="text-navy font-mono text-sm">v1</code></span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-4 sticky top-24">
            <p className="eyebrow mb-2 px-2">เริ่มต้น</p>
            <nav className="space-y-0.5 mb-3">
              {[
                { key: GETTING_STARTED, label: 'การเริ่มต้นใช้งาน' },
                { key: URL_BUILDER,     label: '🔗 URL Builder' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setActive(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    active === key ? 'bg-highlight text-navy font-medium' : 'text-gray-500 hover:text-navy hover:bg-base'
                  }`}>
                  {label}
                </button>
              ))}
            </nav>

            <p className="eyebrow mb-2 px-2">Endpoints</p>
            <nav className="space-y-0.5">
              {endpoints.map(({ path, summary }) => (
                <button key={path} onClick={() => setActive(path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    active === path ? 'bg-highlight text-navy font-medium' : 'text-gray-500 hover:text-navy hover:bg-base'
                  }`}>
                  {summary}
                </button>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-rim">
              <p className="eyebrow mb-2 px-2">ลิงก์ด่วน</p>
              <Link to={user ? '/dashboard' : '/register'}
                className="block px-3 py-2 text-sm text-accent hover:text-secondary transition-colors">
                {user ? 'จัดการ API Key →' : 'สร้างบัญชีและรับ Key →'}
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-8">

          {/* ─── Getting Started ─── */}
          {active === GETTING_STARTED && (
            <>
              <div className="card p-7">
                <h2 className="text-navy font-medium text-xl mb-1">การเริ่มต้นใช้งาน</h2>
                <p className="text-sm text-gray-500 mb-7">4 ขั้นตอน ตั้งแต่ไม่มีบัญชีจนเรียก API ได้จริง</p>

                <div className="space-y-0">
                  <Step n={1} title="สมัครสมาชิกหรือเข้าสู่ระบบ">
                    <p className="text-sm text-gray-500 mb-2">
                      ไปที่หน้า{' '}
                      <Link to="/register" className="text-accent hover:underline font-medium">สมัครสมาชิก</Link>{' '}
                      หรือ{' '}
                      <Link to="/login" className="text-accent hover:underline font-medium">เข้าสู่ระบบ</Link>
                    </p>
                    <div className="bg-base rounded-lg px-4 py-3 border border-rim text-xs text-gray-500">
                      ทุกบัญชีใหม่เริ่มด้วยแผน <strong className="text-navy">Free</strong> — 100 requests/วัน ไม่ต้องใส่บัตรเครดิต
                    </div>
                  </Step>

                  <Step n={2} title="สร้าง API Key ใน Dashboard">
                    <p className="text-sm text-gray-500 mb-3">
                      ไปที่{' '}
                      <Link to="/dashboard" className="text-accent hover:underline font-medium">Dashboard</Link>{' '}
                      → ส่วน <strong>API Keys</strong> → คลิก{' '}
                      <span className="bg-navy text-white text-xs px-2 py-0.5 rounded font-mono">+ สร้าง Key ใหม่</span>
                    </p>
                    <div className="space-y-1.5">
                      {['ตั้งชื่อ key เช่น Production หรือ Testing', 'Free: 1 key · Standard: 3 keys · Pro: 10 keys'].map(t => (
                        <div key={t} className="flex items-start gap-2 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                          </svg>
                          {t}
                        </div>
                      ))}
                    </div>
                  </Step>

                  <Step n={3} title="คัดลอก API Key">
                    <p className="text-sm text-gray-500 mb-3">
                      Key มีรูปแบบ{' '}
                      <code className="bg-base px-1.5 py-0.5 rounded border border-rim font-mono text-xs text-accent">sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>{' '}
                      คลิกปุ่ม <strong>คัดลอก</strong> ในการ์ด key
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-700">
                      เก็บ API Key ไว้เป็นความลับ อย่าแชร์ใน public repository
                    </div>
                  </Step>

                  <Step n={4} title="ส่ง Key กับทุก Request — เลือกได้ 2 วิธี">
                    <div className="space-y-4">
                      {/* Method 1 */}
                      <div className="rounded-xl border border-rim overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-base border-b border-rim">
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">วิธีที่ 1</span>
                          <span className="text-xs font-medium text-navy">HTTP Header</span>
                          <span className="text-xs text-gray-400 ml-auto">แนะนำสำหรับ code / app</span>
                        </div>
                        <div className="bg-navy px-4 py-3 flex items-center gap-3">
                          <code className="text-green-300 text-xs font-mono flex-1">
                            X-API-Key: <span className="text-yellow-300">YOUR_API_KEY</span>
                          </code>
                          <CopyBtn text="X-API-Key: YOUR_API_KEY" />
                        </div>
                      </div>

                      {/* Method 2 */}
                      <div className="rounded-xl border border-accent/30 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-highlight border-b border-accent/20">
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">วิธีที่ 2</span>
                          <span className="text-xs font-medium text-navy">URL Parameter</span>
                          <span className="text-xs text-accent ml-auto font-medium">วางใน Browser / แชร์เป็นลิงก์ได้เลย</span>
                        </div>
                        <div className="bg-navy px-4 py-3 flex items-center gap-3">
                          <code className="text-green-300 text-xs font-mono flex-1 break-all">
                            {API_BASE}/cars?<span className="text-yellow-300">api_key=YOUR_API_KEY</span>
                          </code>
                          <CopyBtn text={`${API_BASE}/cars?api_key=YOUR_API_KEY`} />
                        </div>
                        <div className="px-4 py-2.5 bg-base text-xs text-gray-500">
                          เพิ่ม <code className="bg-white border border-rim px-1 rounded font-mono text-accent">api_key=YOUR_KEY</code> ใน query string —
                          สามารถเปิดใน Browser หรือแชร์เป็นลิงก์ได้โดยตรง
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-600">
                        ไม่ใส่ key (ทั้งสองวิธี) → ได้รับ <code className="font-mono">401 Unauthorized</code> ทันที
                      </div>
                    </div>
                  </Step>
                </div>
              </div>

              {/* Code examples */}
              <div className="card p-7">
                <h2 className="text-navy font-medium mb-1">ตัวอย่างโค้ด</h2>
                <p className="text-sm text-gray-500 mb-5">
                  แสดงทั้ง 2 วิธี — แทน{' '}
                  <code className="bg-base px-1 rounded border border-rim font-mono text-xs">YOUR_API_KEY</code>{' '}
                  ด้วย key จริงของคุณ
                </p>
                <div className="flex gap-1.5 mb-5">
                  {Object.keys(codeExamples).map((l) => (
                    <button key={l} onClick={() => setLang(l)}
                      className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                        lang === l ? 'bg-navy text-white' : 'bg-base text-gray-500 hover:text-navy border border-rim'
                      }`}>
                      {l === 'js' ? 'JavaScript' : l === 'python' ? 'Python' : 'cURL'}
                    </button>
                  ))}
                </div>
                <pre className="code-block text-xs leading-relaxed whitespace-pre-wrap"><code>{codeExamples[lang]}</code></pre>
              </div>

              {/* Tier table */}
              <div className="card p-7">
                <h2 className="text-navy font-medium mb-5">ขีดจำกัดตามแผน</h2>
                <div className="overflow-x-auto rounded-lg border border-rim">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-base border-b border-rim">
                        <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">แผน</th>
                        <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">calls / วัน</th>
                        <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Keys</th>
                        <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">พารามิเตอร์ที่ใช้ได้</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rim">
                      {[
                        { tier: 'Free',     color: 'bg-gray-100 text-gray-600',     calls: '100',       keys: '1',  params: 'brand' },
                        { tier: 'Standard', color: 'bg-blue-100 text-blue-700',     calls: '10,000',    keys: '3',  params: 'brand, year, minPrice, maxPrice' },
                        { tier: 'Pro',      color: 'bg-purple-100 text-purple-700', calls: '1,000,000', keys: '10', params: 'brand, year, minPrice, maxPrice, fuel' },
                      ].map(r => (
                        <tr key={r.tier}>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.color}`}>{r.tier}</span></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.calls}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.keys}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono">{r.params}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  เกินโควต้า → <code className="font-mono">429 Too Many Requests</code>{' '}
                  <Link to="/pricing" className="text-accent hover:underline ml-1">ดูแผนราคา →</Link>
                </p>
              </div>

              {/* HTTP status */}
              <div className="card p-7">
                <h2 className="text-navy font-medium mb-5">รหัสสถานะ HTTP</h2>
                <div className="space-y-1">
                  {errors.map(({ code, desc }) => (
                    <div key={code} className="flex items-start gap-3 py-2 border-b border-rim last:border-0">
                      <code className={`text-xs font-mono font-medium whitespace-nowrap pt-0.5 ${code.startsWith('2') ? 'text-green-600' : 'text-accent'}`}>
                        {code}
                      </code>
                      <span className="text-sm text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── URL Builder ─── */}
          {active === URL_BUILDER && (
            <div className="card p-7">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-highlight rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-navy font-medium text-lg">URL Builder</h2>
                  <p className="text-xs text-gray-400 mt-0.5">สร้าง URL พร้อม API Key ใช้กับ Browser หรือแชร์เป็นลิงก์ได้เลย</p>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-xs text-green-700 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>
                  API รองรับการส่ง Key ผ่าน <strong>URL parameter</strong> <code className="bg-green-100 px-1 rounded font-mono">?api_key=YOUR_KEY</code>{' '}
                  ทำให้วาง URL นี้ใน Browser address bar ได้ตรง ๆ — ไม่ต้องใช้โปรแกรมพิเศษ
                </span>
              </div>

              <UrlBuilder sessionKey={sessionKey} />

              {/* Tip */}
              <div className="mt-6 pt-6 border-t border-rim">
                <p className="text-xs text-gray-400 font-medium mb-3">ตัวอย่าง URL สำเร็จรูป (ใส่ key จริงแทน YOUR_KEY)</p>
                <div className="space-y-2">
                  {[
                    { label: 'รถทั้งหมด',             url: `${API_BASE}/cars?api_key=YOUR_KEY` },
                    { label: 'Toyota ทั้งหมด',         url: `${API_BASE}/cars?api_key=YOUR_KEY&brand=Toyota` },
                    { label: 'Honda ปี 2024',           url: `${API_BASE}/cars?api_key=YOUR_KEY&brand=Honda&year=2024` },
                    { label: 'ราคา 500K–1M',           url: `${API_BASE}/cars?api_key=YOUR_KEY&minPrice=500000&maxPrice=1000000` },
                  ].map(({ label, url }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
                      <code className="text-xs font-mono text-accent bg-base px-2 py-1 rounded border border-rim flex-1 break-all">{url}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Endpoint Reference ─── */}
          {selected && (
            <>
              <div className="card p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold bg-highlight text-accent px-2.5 py-1 rounded font-mono">
                    {selected.method}
                  </span>
                  <code className="text-navy font-mono text-sm">{selected.path}</code>
                </div>
                <p className="text-gray-500 text-sm mb-6">{selected.desc}</p>

                {selected.params.length > 0 && (
                  <>
                    <h3 className="text-navy text-sm font-medium mb-3">พารามิเตอร์</h3>
                    <div className="overflow-x-auto rounded-lg border border-rim mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-base border-b border-rim">
                            <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">ชื่อ</th>
                            <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">ชนิด</th>
                            <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">จำเป็น</th>
                            <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">คำอธิบาย</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rim">
                          {selected.params.map((p) => (
                            <tr key={p.name} className={p.name === 'api_key' ? 'bg-green-50/50' : ''}>
                              <td className="px-4 py-2.5">
                                <code className="text-accent text-xs font-mono">{p.name}</code>
                                {p.name === 'api_key' && (
                                  <span className="ml-1.5 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">URL</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{p.type}</td>
                              <td className="px-4 py-2.5">
                                {p.req
                                  ? <span className="text-[10px] font-medium bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded">จำเป็น</span>
                                  : <span className="text-[10px] text-gray-400">ไม่จำเป็น</span>}
                              </td>
                              <td className="px-4 py-2.5 text-gray-500 text-xs">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <h3 className="text-navy text-sm font-medium mb-3">ตัวอย่าง Request</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Header method</p>
                    <pre className="code-block text-xs leading-relaxed whitespace-pre-wrap">{`curl "${API_BASE}${selected.path.replace('/v1','').replace(':id','1')}" \\
  -H "X-API-Key: YOUR_API_KEY"`}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">URL parameter method (วางใน Browser ได้เลย)</p>
                    <pre className="code-block text-xs leading-relaxed whitespace-pre-wrap">{`${API_BASE}${selected.path.replace('/v1','').replace(':id','1')}?api_key=YOUR_API_KEY`}</pre>
                  </div>
                </div>

                <h3 className="text-navy text-sm font-medium mb-3">ผลลัพธ์</h3>
                <pre className="code-block text-xs leading-relaxed"><code>{selected.response}</code></pre>
              </div>

              <div className="card p-7">
                <h2 className="text-navy font-medium mb-5">รหัสสถานะ HTTP</h2>
                <div className="space-y-1">
                  {errors.map(({ code, desc }) => (
                    <div key={code} className="flex items-start gap-3 py-2 border-b border-rim last:border-0">
                      <code className={`text-xs font-mono font-medium whitespace-nowrap pt-0.5 ${code.startsWith('2') ? 'text-green-600' : 'text-accent'}`}>
                        {code}
                      </code>
                      <span className="text-sm text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
