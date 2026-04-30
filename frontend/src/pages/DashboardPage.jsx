import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  loadSession, saveSession,
  getRateLimit, createApiKey, getUserKeys,
} from '../api/authApi'

const API_BASE = 'http://localhost:8080/api/v1'

const TIER_CONFIG = {
  free:     { label: 'Starter',  limit: 100,     maxKeys: 1,  color: 'bg-gray-100 text-gray-600',    alertAt: null },
  standard: { label: 'Standard', limit: 10000,   maxKeys: 3,  color: 'bg-blue-100 text-blue-700',    alertAt: 0.8  },
  pro:      { label: 'Pro',      limit: 1000000, maxKeys: 10, color: 'bg-purple-100 text-purple-700', alertAt: 0.8  },
}

function UsageBar({ current, limit }) {
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const bar = pct >= 90 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-accent'
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>{current.toLocaleString()} requests ใช้แล้ว</span>
        <span>{limit.toLocaleString()} / วัน</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`${bar} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% ของโควต้าวันนี้</p>
    </div>
  )
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000) }}
      className="text-xs px-2 py-0.5 rounded border border-rim text-gray-400 hover:text-navy hover:border-accent transition-colors flex-shrink-0">
      {done ? '✓ คัดลอก' : 'คัดลอก'}
    </button>
  )
}

function KeyCard({ k, isSelected, onSelect, showSelect }) {
  const [show, setShow] = useState(false)
  const masked = k.key.slice(0, 10) + '••••••••••••••••••••'
  return (
    <div className={`border rounded-xl p-4 transition-all ${isSelected ? 'border-accent bg-highlight' : 'border-rim bg-white'}`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-navy">{k.name}</p>
          {isSelected && <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full">ใช้งาน</span>}
        </div>
        {showSelect && (
          <button onClick={onSelect}
            className={`text-xs transition-colors ${isSelected ? 'text-gray-400 cursor-default' : 'text-accent hover:text-secondary'}`}
            disabled={isSelected}>
            {isSelected ? 'กำลังใช้' : 'เลือกใช้'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 font-mono text-xs text-gray-600 bg-base rounded-lg px-3 py-2">
        <span className="flex-1 truncate">{show ? k.key : masked}</span>
        <button onClick={() => setShow(!show)} className="text-gray-400 hover:text-navy transition-colors flex-shrink-0">
          {show
            ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/></svg>
            : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          }
        </button>
        <CopyBtn text={k.key} />
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5">
        สร้างเมื่อ {new Date(k.created_at).toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' })}
      </p>
    </div>
  )
}

const BRANDS = ['','Toyota','Honda','BMW','Mercedes-Benz','Mazda','Isuzu','Ford','Nissan','Mitsubishi','MG','BYD','Tesla']
const FUELS  = ['','hybrid','petrol','diesel','electric']
const FUEL_TH = { hybrid:'ไฮบริด', petrol:'น้ำมัน', diesel:'ดีเซล', electric:'ไฟฟ้า' }

function ApiTester({ apiKey }) {
  const [brand,    setBrand]    = useState('')
  const [year,     setYear]     = useState('')
  const [fuel,     setFuel]     = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [err,      setErr]      = useState('')
  const [tab,      setTab]      = useState('json') // 'json' | 'curl'

  const buildParams = () => {
    const p = {}
    if (brand)    p.brand    = brand
    if (year)     p.year     = year
    if (fuel)     p.fuel     = fuel
    if (minPrice) p.minPrice = minPrice
    if (maxPrice) p.maxPrice = maxPrice
    return p
  }

  const buildCurl = () => {
    const params = buildParams()
    const qs = Object.entries(params).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    const url = `${API_BASE}/cars${qs ? '?' + qs : ''}`
    return `curl -X GET "${url}" \\\n  -H "X-API-Key: ${apiKey}"`
  }

  const runTest = async () => {
    setLoading(true); setErr(''); setResult(null)
    try {
      const { data } = await axios.get(`${API_BASE}/cars`, {
        headers: { 'X-API-Key': apiKey },
        params: buildParams(),
      })
      setResult(Array.isArray(data) ? data : [])
      setTab('json')
    } catch (e) {
      setErr(e.response?.data?.error || e.response?.data || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-navy font-medium">ทดสอบเรียก API</h2>
          <p className="text-xs text-gray-400 mt-0.5">ลองใช้ API Key ของคุณดึงข้อมูลรถจริงจากฐานข้อมูล</p>
        </div>
      </div>

      {/* Endpoint */}
      <div className="bg-navy rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono flex-shrink-0">GET</span>
        <code className="text-green-300 text-xs font-mono flex-1 truncate">{API_BASE}/cars</code>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">brand</label>
          <select value={brand} onChange={e => setBrand(e.target.value)} className="input text-sm">
            <option value="">ทั้งหมด</option>
            {BRANDS.filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">year</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="input text-sm">
            <option value="">ทั้งหมด</option>
            {[2024,2023,2022,2021].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">fuel</label>
          <select value={fuel} onChange={e => setFuel(e.target.value)} className="input text-sm">
            <option value="">ทั้งหมด</option>
            {FUELS.filter(Boolean).map(f => <option key={f} value={f}>{FUEL_TH[f]||f}</option>)}
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
        <div className="flex items-end">
          <button onClick={runTest} disabled={loading || !apiKey}
            className="btn-primary w-full py-2 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังเรียก…</>
              : <>▶ ส่ง Request</>}
          </button>
        </div>
      </div>

      {/* Result */}
      {(result !== null || err) && (
        <div className="mt-2">
          {/* Tab bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {['json','curl'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${tab===t ? 'bg-navy text-white' : 'bg-base text-gray-500 hover:text-navy border border-rim'}`}>
                  {t === 'json' ? `Response (${result?.length ?? 0} คัน)` : 'cURL'}
                </button>
              ))}
            </div>
            {result !== null && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                200 OK
              </span>
            )}
          </div>

          {err ? (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 font-mono">{JSON.stringify(err)}</p>
            </div>
          ) : tab === 'curl' ? (
            <div className="relative">
              <pre className="code-block text-xs leading-relaxed whitespace-pre-wrap break-all">{buildCurl()}</pre>
              <button onClick={() => navigator.clipboard.writeText(buildCurl())}
                className="absolute top-3 right-3 text-xs text-gray-400 hover:text-white border border-white/20 px-2 py-0.5 rounded transition-colors">
                คัดลอก
              </button>
            </div>
          ) : (
            <div className="relative">
              <pre className="code-block text-xs leading-relaxed max-h-72 overflow-y-auto">
                {JSON.stringify(result?.slice(0, 5), null, 2)}
                {result?.length > 5 ? `\n\n// ... และอีก ${result.length - 5} คัน` : ''}
              </pre>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                className="absolute top-3 right-3 text-xs text-gray-400 hover:text-white border border-white/20 px-2 py-0.5 rounded transition-colors">
                คัดลอก
              </button>
            </div>
          )}
        </div>
      )}

      {!apiKey && (
        <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-2">
          กรุณาสร้าง API Key ก่อนทดสอบ
        </p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const navigate  = useNavigate()
  const user      = loadSession()
  const tier      = user?.tier || 'free'
  const cfg       = TIER_CONFIG[tier] || TIER_CONFIG.free

  const [keys,         setKeys]         = useState([])
  const [selectedIdx,  setSelectedIdx]  = useState(0)
  const [usage,        setUsage]        = useState(null)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [loadingKeys,  setLoadingKeys]  = useState(true)
  const [newName,      setNewName]      = useState('')
  const [showForm,     setShowForm]     = useState(false)
  const [creating,     setCreating]     = useState(false)
  const [createErr,    setCreateErr]    = useState('')

  useEffect(() => { if (!user) navigate('/login') }, [])

  // โหลด keys จาก backend
  useEffect(() => {
    if (!user) return
    getUserKeys(user.id)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : []
        setKeys(list)
        // sync api_key ใน session เป็น key แรก (ถ้าเปลี่ยน)
        if (list.length > 0 && list[0].key !== user.api_key) {
          saveSession({ ...user, api_key: list[0].key })
        }
      })
      .catch(() => {
        // fallback: ใช้ key จาก session
        if (user.api_key) setKeys([{ key: user.api_key, name: 'Default Key', created_at: user.created_at || new Date().toISOString(), user_id: user.id }])
      })
      .finally(() => setLoadingKeys(false))
  }, [])

  const fetchUsage = useCallback(async () => {
    if (!user || keys.length === 0) { setLoadingUsage(false); return }
    const apiKey = keys[selectedIdx]?.key || user.api_key
    if (!apiKey) { setLoadingUsage(false); return }
    setLoadingUsage(true)
    try {
      const { data } = await getRateLimit(apiKey)
      setUsage(data)
    } catch {
      setUsage({ tier, daily_limit: cfg.limit, current: 0, reset_time: '' })
    } finally {
      setLoadingUsage(false)
    }
  }, [keys, selectedIdx])

  useEffect(() => { fetchUsage() }, [keys, selectedIdx])

  const handleCreate = async () => {
    if (!newName.trim()) { setCreateErr('กรุณาระบุชื่อ key'); return }
    if (keys.length >= cfg.maxKeys) { setCreateErr(`แผน ${cfg.label} สร้างได้สูงสุด ${cfg.maxKeys} keys`); return }
    setCreating(true); setCreateErr('')
    try {
      const { data } = await createApiKey(user.id, newName.trim())
      setKeys(prev => [...prev, data])
      setNewName(''); setShowForm(false)
    } catch (e) {
      setCreateErr(e.response?.data?.error || 'สร้าง key ไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setCreating(false)
    }
  }

  if (!user) return null

  const usedPct   = usage ? Math.min((usage.current / usage.daily_limit) * 100, 100) : 0
  const showAlert = cfg.alertAt && usage && usedPct >= cfg.alertAt * 100
  const upgradeTo = tier === 'free' ? 'Standard' : tier === 'standard' ? 'Pro' : null

  return (
    <div className="bg-base min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-navy">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              ยินดีต้อนรับกลับมา,{' '}
              <span className="font-medium text-navy">{user.username || user.email}</span>
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">API Usage Alert</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                ใช้ไปแล้ว {usedPct.toFixed(0)}% — {usage.current.toLocaleString()} / {usage.daily_limit.toLocaleString()} requests
                {upgradeTo && <> — <Link to="/pricing" className="underline font-medium">อัปเกรดเป็น {upgradeTo}</Link> เพื่อเพิ่มโควต้า</>}
              </p>
            </div>
          </div>
        )}

        {/* Usage */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-navy font-medium">การใช้งาน API วันนี้</h2>
            <button onClick={fetchUsage}
              className="text-xs text-gray-400 hover:text-navy transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              รีเฟรช
            </button>
          </div>

          {loadingUsage ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-2.5 bg-gray-100 rounded-full" />
            </div>
          ) : (
            <UsageBar current={usage?.current || 0} limit={usage?.daily_limit || cfg.limit} />
          )}

          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-rim">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">ใช้แล้ว</p>
              <p className="text-xl font-medium text-navy">{(usage?.current || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">คงเหลือ</p>
              <p className="text-xl font-medium text-green-600">
                {Math.max(0, (usage?.daily_limit || cfg.limit) - (usage?.current || 0)).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">รีเซ็ต</p>
              <p className="text-sm font-medium text-navy">ทุก 24 ชม.</p>
            </div>
          </div>

          {keys.length > 1 && (
            <div className="mt-4 pt-4 border-t border-rim">
              <p className="text-xs text-gray-400 mb-2">เลือก key ที่จะดู usage</p>
              <div className="flex flex-wrap gap-2">
                {keys.map((k, i) => (
                  <button key={k.key} onClick={() => setSelectedIdx(i)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      i === selectedIdx ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-rim hover:border-accent'
                    }`}>
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-navy font-medium">API Keys</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {loadingKeys ? 'กำลังโหลด...' : `${keys.length} / ${cfg.maxKeys} keys`}
              </p>
            </div>
            {!loadingKeys && keys.length < cfg.maxKeys && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary py-1.5 px-3 text-xs">
                + สร้าง Key ใหม่
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-base rounded-xl p-4 mb-4 border border-rim">
              <p className="text-sm font-medium text-navy mb-3">สร้าง API Key ใหม่</p>
              <div className="flex gap-2">
                <input type="text" value={newName}
                  onChange={e => { setNewName(e.target.value); setCreateErr('') }}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="ชื่อ key เช่น Production, Testing"
                  className="input text-sm flex-1" />
                <button onClick={handleCreate} disabled={creating}
                  className="btn-primary py-2 px-4 text-sm disabled:opacity-60">
                  {creating ? 'กำลังสร้าง…' : 'สร้าง'}
                </button>
                <button onClick={() => { setShowForm(false); setCreateErr('') }}
                  className="btn-secondary py-2 px-3 text-sm">
                  ยกเลิก
                </button>
              </div>
              {createErr && <p className="text-xs text-red-500 mt-2">{createErr}</p>}
            </div>
          )}

          {loadingKeys ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(2)].map((_,i) => <div key={i} className="h-20 bg-gray-50 rounded-xl border border-rim" />)}
            </div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">ยังไม่มี API Key</p>
          ) : (
            <div className="space-y-3">
              {keys.map((k, i) => (
                <KeyCard
                  key={k.key}
                  k={k}
                  isSelected={i === selectedIdx}
                  onSelect={() => setSelectedIdx(i)}
                  showSelect={tier !== 'free' && keys.length > 1}
                />
              ))}
            </div>
          )}

          {!loadingKeys && keys.length >= cfg.maxKeys && keys.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              ถึงขีดจำกัดแล้ว ({cfg.maxKeys} keys) — <Link to="/pricing" className="text-accent hover:text-secondary">อัปเกรด</Link> เพื่อสร้างเพิ่ม
            </p>
          )}
        </div>

        {/* API Tester */}
        <ApiTester apiKey={keys[selectedIdx]?.key || user.api_key || ''} />

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/api" className="card p-5 flex items-center gap-4 hover:border-accent transition-colors group">
            <div className="w-10 h-10 bg-highlight rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-navy group-hover:text-accent transition-colors">เอกสาร API & Endpoints</p>
              <p className="text-xs text-gray-400 mt-0.5">Reference และตัวอย่างการใช้งาน</p>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>

          <Link to="/cars" className="card p-5 flex items-center gap-4 hover:border-accent transition-colors group">
            <div className="w-10 h-10 bg-highlight rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-2-6H7L5 9m14 0H5m14 0l1 3H4l1-3m0 0v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-navy group-hover:text-accent transition-colors">รถยนต์ในระบบ</p>
              <p className="text-xs text-gray-400 mt-0.5">ดูและกดถูกใจรถที่ชื่นชอบ</p>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Upgrade banner */}
        {upgradeTo && (
          <div className="bg-navy rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">อัปเกรดเป็น {upgradeTo}</p>
              <p className="text-gray-400 text-sm mt-0.5">
                {tier === 'free'
                  ? 'รับโควต้า 10,000 req/วัน และ 3 API keys'
                  : 'รับโควต้า 1,000,000 req/วัน และ 10 API keys'}
              </p>
            </div>
            <Link to="/pricing" className="bg-white text-navy text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-highlight transition-colors whitespace-nowrap flex-shrink-0">
              ดูแผนราคา →
            </Link>
          </div>
        )}

        {tier === 'pro' && (
          <div className="bg-navy rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">คุณอยู่แผน Pro แล้ว</p>
              <p className="text-gray-400 text-sm mt-0.5">โควต้า 1,000,000 req/วัน · 10 API keys</p>
            </div>
            <Link to="/contact" className="bg-white text-navy text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-highlight transition-colors whitespace-nowrap flex-shrink-0">
              ติดต่อทีม →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
