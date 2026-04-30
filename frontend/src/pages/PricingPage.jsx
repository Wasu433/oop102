import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSession } from '../api/authApi'

const plans = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    note: 'เหมาะสำหรับโปรเจกต์ส่วนตัวและต้นแบบ',
    cta: 'เริ่มต้นฟรี',
    ctaStyle: 'btn-secondary',
    ctaTo: '/register',
    features: [
      '500 API calls / เดือน',
      '1 API Key',
      'ดูข้อมูลรถพื้นฐาน',
      'ค้นหารถตามยี่ห้อ',
      'ไม่มี Support',
      'Dashboard Usage',
    ],
  },
  {
    name: 'Standard',
    monthly: 299,
    annual: 2870,
    note: 'สำหรับ startup และแอปที่ใช้งานจริง',
    cta: 'ทดลองใช้ฟรี 7 วัน',
    ctaStyle: 'btn-primary',
    ctaTo: '/register?plan=standard&trial=7',
    trialDays: 7,
    popular: true,
    features: [
      '10,000 API calls / เดือน',
      '3 API Keys',
      'ดูข้อมูลรถเต็ม',
      'ค้นหา / กรองราคา / กรองปีรถ',
      'Export JSON',
      'Email Support',
      'API Usage Alert',
      'Dashboard Usage',
    ],
  },
  {
    name: 'Pro',
    monthly: 599,
    annual: 5750,
    note: 'สำหรับองค์กรที่ต้องการปริมาณสูง',
    cta: 'อัปเกรดเป็น Pro',
    ctaStyle: 'btn-secondary',
    ctaTo: '/contact',
    features: [
      '1,000,000 API calls / เดือน',
      '10 API Keys',
      'ดูข้อมูลรถเต็ม',
      'Advanced Search',
      'Dashboard Usage',
      'API Usage Alert',
      'Export CSV / JSON',
      'Priority Support',
    ],
  },
]

const faqs = [
  {
    q: 'สามารถอัปเกรดหรือดาวน์เกรดแผนได้ทุกเมื่อหรือไม่?',
    a: 'ได้เลย การเปลี่ยนแผนมีผลทันที เครดิตส่วนต่างจะถูกคำนวณในใบแจ้งหนี้ถัดไป',
  },
  {
    q: 'จะเกิดอะไรขึ้นเมื่อใช้ requests เกินโควต้า?',
    a: 'Requests ที่เกินจะได้รับ status 429 คุณสามารถอัปเกรดแผนได้ทันทีหรือซื้อ credits เพิ่มได้',
  },
  {
    q: 'Pro มีช่วงทดลองใช้ฟรีหรือไม่?',
    a: 'มีครับ/ค่ะ Pro ทดลองใช้ฟรี 14 วันพร้อมฟีเจอร์ครบถ้วน ไม่ต้องใส่ข้อมูลบัตรเครดิต',
  },
  {
    q: 'นับ "request" อย่างไร?',
    a: 'ทุกการเรียก API ไม่ว่า endpoint ใดนับเป็น 1 request ส่วน response ที่ cache ไว้จะไม่นับ',
  },
  {
    q: 'มีส่วนลดสำหรับการชำระรายปีหรือไม่?',
    a: 'การชำระรายปีประหยัด 20% สำหรับแผน Standard ส่วนราคา Pro ประหยัด 20%',
  },
]

const Check = () => (
  <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const user = loadSession()

  const getPlanCTA = (plan) => {
    if (!user) return { label: plan.cta, to: plan.ctaTo }
    const userTier = user.tier || 'free'
    const planTier = plan.name.toLowerCase()
    if (userTier === planTier) return { label: 'ดู API Key ของฉัน', to: '/dashboard', disabled: false }
    if (planTier === 'free') return { label: 'ดาวน์เกรด', to: '/contact' }
    return { label: planTier === 'pro' ? 'ติดต่ออัปเกรด Pro' : 'อัปเกรด Standard', to: '/contact' }
  }

  return (
    <div className="bg-base min-h-screen">

      {/* หัวข้อ */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <span className="eyebrow mb-3 block">ราคา</span>
          <h1 className="text-4xl font-medium text-navy mb-4">ราคาที่เรียบง่ายและโปร่งใส</h1>
          <p className="text-gray-500">
            เริ่มต้นฟรี ขยายตามการเติบโตของคุณ ทุกแผนรวมการเข้าถึง API เต็มรูปแบบและเอกสารครบถ้วน
          </p>

          {/* สวิตช์รายเดือน / รายปี */}
          <div className="inline-flex items-center gap-3 mt-8 bg-white border border-rim rounded-lg px-4 py-2.5">
            <span className={`text-sm ${!annual ? 'text-navy font-medium' : 'text-gray-400'}`}>รายเดือน</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${annual ? 'bg-navy' : 'bg-rim'}`}
              aria-label="สลับรายปี/รายเดือน"
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${annual ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-navy font-medium' : 'text-gray-400'}`}>
              รายปี
              <span className="ml-1.5 text-[10px] font-semibold uppercase bg-highlight text-accent px-1.5 py-0.5 rounded-full">
                –20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* แผนราคา */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const price = plan.monthly === null ? null : annual ? plan.annual : plan.monthly
            return (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 relative ${
                  plan.popular
                    ? 'bg-highlight border-secondary shadow-md'
                    : 'bg-white border-rim shadow-card'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] font-semibold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
                    ยอดนิยม
                  </span>
                )}

                <h2 className="text-navy font-medium text-lg mb-1">{plan.name}</h2>
                <p className="text-gray-500 text-sm mb-5">{plan.note}</p>

                <div className="mb-6">
                  {price === null ? (
                    <span className="text-3xl font-medium text-navy">กำหนดเอง</span>
                  ) : price === 0 ? (
                    <span className="text-3xl font-medium text-navy">ฟรี</span>
                  ) : (
                    <>
                      <span className="text-3xl font-medium text-navy">฿{price.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm ml-1">/ {annual ? 'ปี' : 'เดือน'}</span>
                    </>
                  )}
                  {annual && price > 0 && (
                    <p className="text-xs text-accent mt-1">เทียบเท่า ฿{Math.round(price / 12).toLocaleString()} / เดือน</p>
                  )}
                </div>

                {(() => {
                  const cta = getPlanCTA(plan)
                  return cta.disabled ? (
                    <span className={`block text-center w-full mb-7 ${plan.ctaStyle} opacity-60 cursor-default`}>
                      {cta.label}
                    </span>
                  ) : (
                    <>
                      <Link
                        to={cta.to}
                        className={`block text-center w-full ${plan.trialDays && !user ? 'mb-2' : 'mb-7'} ${plan.ctaStyle}`}
                      >
                        {cta.label}
                      </Link>
                      {plan.trialDays && !user && (
                        <p className="text-center text-xs text-gray-400 mb-5">
                          ทดลองฟรี {plan.trialDays} วัน — ไม่ต้องใส่บัตรเครดิต
                        </p>
                      )}
                    </>
                  )
                })()}

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          ต้องการแผนแบบกำหนดเอง?{' '}
          <Link to="/contact" className="text-accent hover:text-secondary transition-colors">
            ติดต่อทีมขายของเรา →
          </Link>
        </p>
      </section>

      {/* คำถามที่พบบ่อย */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="section-title text-center mb-10">คำถามที่พบบ่อย</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-navy text-sm font-medium">{q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-rim pt-3">{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
