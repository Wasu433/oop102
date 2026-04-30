import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSession } from '../api/authApi'

const endpoints = [
  {
    method: 'GET',
    path: '/v1/cars',
    summary: 'รายการรถ',
    desc: 'คืนรายการรถยนต์แบบแบ่งหน้า พร้อมตัวกรองที่หลากหลาย',
    params: [
      { name: 'brand',  type: 'string',  req: false, desc: 'กรองตามชื่อยี่ห้อ เช่น Toyota' },
      { name: 'model',  type: 'string',  req: false, desc: 'กรองตามชื่อรุ่น เช่น Camry' },
      { name: 'year',   type: 'integer', req: false, desc: 'ปีรุ่น เช่น 2024' },
      { name: 'fuel',   type: 'string',  req: false, desc: 'petrol | diesel | electric | hybrid' },
      { name: 'page',   type: 'integer', req: false, desc: 'หน้าที่ต้องการ (ค่าเริ่มต้น: 1)' },
      { name: 'limit',  type: 'integer', req: false, desc: 'จำนวนผลลัพธ์ต่อหน้า สูงสุด 100 (ค่าเริ่มต้น: 20)' },
    ],
    response: `{
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
  "meta": { "total": 4821, "page": 1, "limit": 20 }
}`,
  },
  {
    method: 'GET',
    path: '/v1/cars/:id',
    summary: 'ข้อมูลรถตาม ID',
    desc: 'คืนรายละเอียดและราคาเต็มรูปแบบสำหรับรถยนต์ที่ระบุ',
    params: [
      { name: 'id', type: 'string', req: true, desc: 'รหัสรถยนต์ที่ไม่ซ้ำกัน (path param)' },
    ],
    response: `{
  "id": "TH-TOY-CAMRY-HV-2024",
  "brand": "Toyota",
  "model": "Camry",
  "trim": "2.5 HV Premium",
  "year": 2024,
  "fuel": "hybrid",
  "price_thb": 1759000,
  "price_history": [
    { "date": "2024-01-01", "price_thb": 1779000 },
    { "date": "2024-01-15", "price_thb": 1759000 }
  ],
  "updated": "2024-01-15"
}`,
  },
  {
    method: 'GET',
    path: '/v1/cars/search',
    summary: 'ค้นหารถ',
    desc: 'ค้นหาแบบ full-text ข้ามยี่ห้อ รุ่น และตัวถัง',
    params: [
      { name: 'q', type: 'string', req: true, desc: 'คำค้นหา' },
    ],
    response: `{
  "data": [ /* รูปแบบเดียวกับ /v1/cars */ ],
  "meta": { "total": 9, "query": "camry hybrid" }
}`,
  },
  {
    method: 'GET',
    path: '/v1/brands',
    summary: 'รายการยี่ห้อ',
    desc: 'คืนรายชื่อยี่ห้อทั้งหมดพร้อมจำนวนรุ่น',
    params: [],
    response: `{
  "data": [
    { "brand": "Toyota", "models": 312 },
    { "brand": "Honda",  "models": 198 }
  ]
}`,
  },
]

const codeExamples = {
  curl: `curl -X GET "https://api.carprice.th/v1/cars?brand=Toyota&year=2024" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Accept: application/json"`,

  js: `import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.carprice.th',
  headers: { 'X-API-Key': process.env.VITE_API_KEY }
})

const { data } = await client.get('/v1/cars', {
  params: { brand: 'Toyota', year: 2024, fuel: 'hybrid' }
})
console.log(data.data) // array ของรถยนต์`,

  python: `import requests

headers = { "X-API-Key": "YOUR_API_KEY" }
params  = { "brand": "Toyota", "year": 2024 }

resp = requests.get(
    "https://api.carprice.th/v1/cars",
    headers=headers,
    params=params
)
print(resp.json()["data"])`,
}

const errors = [
  { code: '200 OK',                  desc: 'คำขอสำเร็จ' },
  { code: '400 Bad Request',         desc: 'พารามิเตอร์ไม่ถูกต้อง' },
  { code: '401 Unauthorized',        desc: 'ไม่มีหรือ X-API-Key ไม่ถูกต้อง' },
  { code: '404 Not Found',           desc: 'ไม่พบข้อมูลที่ร้องขอ' },
  { code: '429 Too Many Requests',   desc: 'เกินขีดจำกัดการใช้งานของแผน' },
  { code: '500 Server Error',        desc: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ — ลองใหม่ด้วย backoff' },
]

export default function ApiPage() {
  const [active, setActive] = useState(endpoints[0].path)
  const [lang, setLang] = useState('curl')
  const user = loadSession()

  const selected = endpoints.find((e) => e.path === active)

  return (
    <div className="bg-base min-h-screen">

      {/* หัวข้อ */}
      <div className="bg-white border-b border-rim">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <span className="eyebrow mb-2 block">อ้างอิง</span>
          <h1 className="text-4xl font-medium text-navy mb-3">เอกสาร API</h1>
          <p className="text-gray-500 max-w-xl">
            REST API ที่ส่งข้อมูล JSON กลับมา ยืนยันตัวตนทุก request ด้วย API Key ใน header{' '}
            <code className="text-accent bg-base px-1.5 py-0.5 rounded text-sm font-mono">X-API-Key</code>
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-sm text-gray-500">
            <span>
              URL หลัก:{' '}
              <code className="text-navy font-mono text-sm bg-base px-2 py-0.5 rounded border border-rim">
                https://api.carprice.th
              </code>
            </span>
            <span className="text-rim">|</span>
            <span>
              เวอร์ชัน:{' '}
              <code className="text-navy font-mono text-sm">v1</code>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* แถบด้านข้าง */}
        <aside className="lg:col-span-1">
          <div className="card p-4 sticky top-24">
            <p className="eyebrow mb-3 px-2">Endpoints</p>
            <nav className="space-y-0.5">
              {endpoints.map(({ path, summary }) => (
                <button
                  key={path}
                  onClick={() => setActive(path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    active === path
                      ? 'bg-highlight text-navy font-medium'
                      : 'text-gray-500 hover:text-navy hover:bg-base'
                  }`}
                >
                  {summary}
                </button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-rim">
              <p className="eyebrow mb-3 px-2">เริ่มต้นใช้งาน</p>
              <Link to={user ? '/dashboard' : '/pricing'} className="block px-3 py-2 text-sm text-accent hover:text-secondary transition-colors">
                {user ? 'จัดการ API Key →' : 'รับ API Key →'}
              </Link>
            </div>
          </div>
        </aside>

        {/* เนื้อหาหลัก */}
        <div className="lg:col-span-3 space-y-8">

          {/* รายละเอียด endpoint */}
          <div className="card p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold bg-highlight text-accent px-2.5 py-1 rounded font-mono">
                GET
              </span>
              <code className="text-navy font-mono text-sm">{selected.path}</code>
            </div>
            <p className="text-gray-500 text-sm mb-6">{selected.desc}</p>

            {/* ตารางพารามิเตอร์ */}
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
                        <tr key={p.name}>
                          <td className="px-4 py-2.5">
                            <code className="text-accent text-xs font-mono">{p.name}</code>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{p.type}</td>
                          <td className="px-4 py-2.5">
                            {p.req ? (
                              <span className="text-[10px] font-medium bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded">จำเป็น</span>
                            ) : (
                              <span className="text-[10px] text-gray-400">ไม่จำเป็น</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ผลลัพธ์ */}
            <h3 className="text-navy text-sm font-medium mb-3">ผลลัพธ์</h3>
            <pre className="code-block"><code>{selected.response}</code></pre>
          </div>

          {/* ตัวอย่างโค้ด */}
          <div className="card p-7">
            <h2 className="text-navy font-medium mb-5">ตัวอย่างโค้ด</h2>
            <div className="flex gap-1.5 mb-5">
              {Object.keys(codeExamples).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    lang === l ? 'bg-navy text-white' : 'bg-base text-gray-500 hover:text-navy border border-rim'
                  }`}
                >
                  {l === 'js' ? 'JavaScript' : l === 'python' ? 'Python' : 'cURL'}
                </button>
              ))}
            </div>
            <pre className="code-block"><code>{codeExamples[lang]}</code></pre>
          </div>

          {/* รหัสสถานะ HTTP */}
          <div className="card p-7">
            <h2 className="text-navy font-medium mb-5">รหัสสถานะ HTTP</h2>
            <div className="space-y-2">
              {errors.map(({ code, desc }) => {
                const isOk = code.startsWith('2')
                return (
                  <div key={code} className="flex items-start gap-3 py-2 border-b border-rim last:border-0">
                    <code className={`text-xs font-mono font-medium whitespace-nowrap pt-0.5 ${isOk ? 'text-green-600' : 'text-accent'}`}>
                      {code}
                    </code>
                    <span className="text-sm text-gray-500">{desc}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
