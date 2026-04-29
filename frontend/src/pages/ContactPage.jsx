import { useState } from 'react'
import { Link } from 'react-router-dom'

const topics = [
  'สอบถามทั่วไป',
  'สนับสนุน API',
  'ราคาและการชำระเงิน',
  'แผนองค์กร',
  'แจ้งข้อผิดพลาด',
  'อื่นๆ',
]

const contactInfo = [
  {
    label: 'อีเมล',
    value: 'support@carprice.th',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    label: 'เวลาตอบกลับ',
    value: 'ภายใน 24 ชั่วโมงในวันทำการ',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'สถานที่ตั้ง',
    value: 'กรุงเทพมหานคร, ประเทศไทย',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 900)
  }

  const reset = () => {
    setSent(false)
    setForm({ name: '', email: '', topic: topics[0], message: '' })
  }

  return (
    <div className="bg-base min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* หัวข้อ */}
        <div className="mb-12">
          <span className="eyebrow mb-2 block">ติดต่อ</span>
          <h1 className="text-4xl font-medium text-navy mb-3">ติดต่อเรา</h1>
          <p className="text-gray-500 max-w-md">
            มีคำถามเกี่ยวกับ API ราคา หรือต้องการเชื่อมต่อแบบพิเศษ? เรายินดีให้ความช่วยเหลือ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ข้อมูลติดต่อ */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-highlight border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <div>
                  <p className="eyebrow mb-0.5">{label}</p>
                  <p className="text-sm text-gray-700">{value}</p>
                </div>
              </div>
            ))}

            {/* ลิงก์ self-serve */}
            <div className="pt-4 border-t border-rim">
              <p className="text-sm text-gray-500 mb-3">ต้องการค้นหาคำตอบด้วยตนเอง?</p>
              <Link to="/api" className="btn-ghost block mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                เอกสาร API
              </Link>
              <Link to="/pricing" className="btn-ghost block">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                ราคาและแผนบริการ
              </Link>
            </div>
          </div>

          {/* แบบฟอร์ม */}
          <div className="lg:col-span-3 card p-8">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 rounded-full bg-highlight border border-accent/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-navy font-medium text-lg mb-2">ส่งข้อความสำเร็จ</h2>
                <p className="text-gray-500 text-sm mb-6">เราจะติดต่อกลับภายใน 1 วันทำการ</p>
                <button onClick={reset} className="btn-secondary">
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">ชื่อ-นามสกุล</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      placeholder="ชื่อ-นามสกุลของคุณ"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">อีเมล</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      placeholder="อีเมลของคุณ"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">หัวข้อ</label>
                  <select name="topic" value={form.topic} onChange={onChange} className="input">
                    {topics.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">ข้อความ</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    required
                    rows={5}
                    placeholder="อธิบายคำถามหรือการใช้งานของคุณ…"
                    className="input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      กำลังส่ง…
                    </span>
                  ) : (
                    'ส่งข้อความ'
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
