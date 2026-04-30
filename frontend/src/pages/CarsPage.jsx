import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadSession, getCars, loadLikes, saveLikes, loadUserKeys } from '../api/authApi'

const FUEL_TH   = { petrol:'น้ำมัน', diesel:'ดีเซล', electric:'ไฟฟ้า', hybrid:'ไฮบริด' }
const FUEL_COLOR = {
  petrol:   'bg-orange-50 text-orange-600 border-orange-100',
  diesel:   'bg-gray-100   text-gray-600   border-gray-200',
  electric: 'bg-green-50  text-green-600  border-green-100',
  hybrid:   'bg-teal-50   text-teal-600   border-teal-100',
}

const PAGE_SIZE   = 20
const PRICE_STEPS = [0,300000,500000,700000,1000000,1500000,2000000,3000000,5000000,999999999]
const PRICE_LABEL = ['ทุกราคา','< 300K','300K–500K','500K–700K','700K–1M','1M–1.5M','1.5M–2M','2M–3M','3M–5M','5M+']

function HeartBtn({ filled, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-full bg-white/90 shadow-sm transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
      title={disabled ? 'เข้าสู่ระบบเพื่อถูกใจ' : filled ? 'เลิกถูกใจ' : 'ถูกใจ'}
    >
      {filled
        ? <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
      }
    </button>
  )
}

function CarCard({ car, liked, onLike, loggedIn }) {
  const fuel = (car.fuel || '').toLowerCase()
  return (
    <div className="card overflow-hidden hover:border-accent hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="bg-gradient-to-br from-base to-highlight h-28 flex items-center justify-center relative border-b border-rim">
        <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.7} d="M19 9l-2-6H7L5 9m14 0H5m14 0l1 3H4l1-3m0 0v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
        </svg>
        <div className="absolute top-2 right-2">
          <HeartBtn filled={liked} onClick={() => loggedIn && onLike(car.id)} disabled={!loggedIn} />
        </div>
        {car.color && (
          <span className="absolute bottom-1.5 left-3 text-[10px] text-gray-400">{car.color}</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="text-sm font-semibold text-navy leading-tight">{car.brand} {car.model}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${FUEL_COLOR[fuel] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
            {FUEL_TH[fuel] || car.fuel}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">{car.year}</p>
        <div className="mt-auto flex items-end justify-between pt-2 border-t border-rim">
          <div>
            <p className="text-[10px] text-gray-400">ราคา</p>
            <p className="text-sm font-semibold text-navy">฿{Number(car.price).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">ระยะทาง</p>
            <p className="text-xs text-navy">{Number(car.mileage).toLocaleString()} km</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 rounded-lg border border-rim text-sm text-gray-500 hover:border-accent hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        ← ก่อน
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-navy text-white' : 'border border-rim text-gray-500 hover:border-accent hover:text-navy'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg border border-rim text-sm text-gray-500 hover:border-accent hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        ถัดไป →
      </button>
    </div>
  )
}

export default function CarsPage() {
  const user     = loadSession()
  const [allCars, setAllCars]   = useState([])
  const [likes,   setLikes]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab,     setTab]       = useState('all') // 'all' | 'liked'
  const [page,    setPage]      = useState(1)

  // filters
  const [search,      setSearch]      = useState('')
  const [yearFilter,  setYearFilter]  = useState('')
  const [priceRange,  setPriceRange]  = useState(0)   // index ใน PRICE_STEPS
  const [fuelFilter,  setFuelFilter]  = useState('')
  const [sortBy,      setSortBy]      = useState('default') // 'price_asc' | 'price_desc' | 'year_desc'
  const [minPriceIn,  setMinPriceIn]  = useState('')
  const [maxPriceIn,  setMaxPriceIn]  = useState('')

  useEffect(() => {
    if (user) setLikes(loadLikes(user.id))
    fetchAllCars()
  }, [])

  const fetchAllCars = async () => {
    setLoading(true)
    if (user) {
      const stored = loadUserKeys(user.id)
      const apiKey = stored[0]?.key || user.api_key
      try {
        const { data } = await getCars(apiKey)
        setAllCars(Array.isArray(data) ? data : [])
      } catch { setAllCars([]) }
    } else {
      setAllCars([])
    }
    setLoading(false)
  }

  const toggleLike = (id) => {
    if (!user) return
    const next = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id]
    setLikes(next)
    saveLikes(user.id, next)
  }

  const resetFilters = () => {
    setSearch(''); setYearFilter(''); setPriceRange(0)
    setFuelFilter(''); setSortBy('default')
    setMinPriceIn(''); setMaxPriceIn('')
    setPage(1)
  }

  // ปีที่มีในระบบ
  const years = useMemo(() =>
    [...new Set(allCars.map(c => c.year))].sort((a,b) => b - a), [allCars])
  const fuels = useMemo(() =>
    [...new Set(allCars.map(c => (c.fuel||'').toLowerCase()).filter(Boolean))], [allCars])

  const filtered = useMemo(() => {
    let list = tab === 'liked' ? allCars.filter(c => likes.includes(c.id)) : allCars

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        String(c.year).includes(q)
      )
    }
    if (yearFilter)  list = list.filter(c => c.year === Number(yearFilter))
    if (fuelFilter)  list = list.filter(c => (c.fuel||'').toLowerCase() === fuelFilter)

    // กรองราคา (ใช้ manual input ถ้ามี ไม่งั้นใช้ slider index)
    const minP = minPriceIn !== '' ? Number(minPriceIn) : PRICE_STEPS[priceRange]
    const maxP = maxPriceIn !== '' ? Number(maxPriceIn) : PRICE_STEPS[priceRange + 1] ?? 999999999
    if (priceRange > 0 || minPriceIn !== '' || maxPriceIn !== '') {
      list = list.filter(c => Number(c.price) >= minP && Number(c.price) <= maxP)
    }

    if (sortBy === 'price_asc')  list = [...list].sort((a,b) => a.price - b.price)
    if (sortBy === 'price_desc') list = [...list].sort((a,b) => b.price - a.price)
    if (sortBy === 'year_desc')  list = [...list].sort((a,b) => b.year - a.year)

    return list
  }, [allCars, search, yearFilter, fuelFilter, priceRange, minPriceIn, maxPriceIn, sortBy, tab, likes])

  // paginate
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isFiltered = search || yearFilter || fuelFilter || priceRange > 0 || minPriceIn || maxPriceIn

  // reset page when filters change
  const handleFilter = (fn) => { fn(); setPage(1) }

  return (
    <div className="bg-base min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-6">
          <span className="eyebrow mb-1 block">คลังรถยนต์</span>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-medium text-navy">รถยนต์ในระบบ</h1>
              <p className="text-sm text-gray-500 mt-1">
                {user
                  ? 'กดหัวใจเพื่อบันทึกรถที่ชื่นชอบ'
                  : <><Link to="/login" className="text-accent hover:text-secondary font-medium">เข้าสู่ระบบ</Link> เพื่อกดถูกใจ</>}
              </p>
            </div>
            {!user && (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">เข้าสู่ระบบ</Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-rim rounded-xl p-1 w-fit">
          {[{ key:'all', label:'รถทั้งหมด' }, { key:'liked', label:`ที่ถูกใจ (${likes.length})` }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1) }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">

          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="card p-5 sticky top-24 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-navy">ตัวกรอง</p>
                {isFiltered && (
                  <button onClick={resetFilters} className="text-xs text-accent hover:text-secondary transition-colors">ล้างทั้งหมด</button>
                )}
              </div>

              {/* ค้นหา */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">ค้นหา</p>
                <input type="text" value={search}
                  onChange={e => handleFilter(() => setSearch(e.target.value))}
                  placeholder="ยี่ห้อ / รุ่น / ปี"
                  className="input text-sm" />
              </div>

              {/* ปี */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">ปี</p>
                <select value={yearFilter}
                  onChange={e => handleFilter(() => setYearFilter(e.target.value))}
                  className="input text-sm">
                  <option value="">ทุกปี</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* เชื้อเพลิง */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">เชื้อเพลิง</p>
                <div className="space-y-1.5">
                  {['', ...fuels].map(f => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="fuel" checked={fuelFilter === f}
                        onChange={() => handleFilter(() => setFuelFilter(f))}
                        className="accent-navy" />
                      <span className="text-sm text-gray-600">{f ? (FUEL_TH[f] || f) : 'ทั้งหมด'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ช่วงราคา Preset */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">ช่วงราคา</p>
                <select value={priceRange}
                  onChange={e => handleFilter(() => { setPriceRange(Number(e.target.value)); setMinPriceIn(''); setMaxPriceIn('') })}
                  className="input text-sm">
                  {PRICE_LABEL.map((l,i) => <option key={i} value={i}>{l}</option>)}
                </select>
              </div>

              {/* ราคา custom */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">ราคาที่ต้องการ (฿)</p>
                <div className="flex gap-1.5 items-center">
                  <input type="number" value={minPriceIn} placeholder="ต่ำสุด"
                    onChange={e => handleFilter(() => { setMinPriceIn(e.target.value); setPriceRange(0) })}
                    className="input text-sm w-full" min={0} />
                  <span className="text-gray-400 flex-shrink-0">–</span>
                  <input type="number" value={maxPriceIn} placeholder="สูงสุด"
                    onChange={e => handleFilter(() => { setMaxPriceIn(e.target.value); setPriceRange(0) })}
                    className="input text-sm w-full" min={0} />
                </div>
              </div>

              {/* เรียงลำดับ */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">เรียงตาม</p>
                <select value={sortBy}
                  onChange={e => handleFilter(() => setSortBy(e.target.value))}
                  className="input text-sm">
                  <option value="default">ค่าเริ่มต้น</option>
                  <option value="price_asc">ราคา ต่ำ→สูง</option>
                  <option value="price_desc">ราคา สูง→ต่ำ</option>
                  <option value="year_desc">ปีใหม่ก่อน</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter row */}
            <div className="lg:hidden flex flex-wrap gap-2 mb-4">
              <input type="text" value={search}
                onChange={e => handleFilter(() => setSearch(e.target.value))}
                placeholder="ค้นหา..." className="input text-sm flex-1 min-w-[140px]" />
              <select value={yearFilter}
                onChange={e => handleFilter(() => setYearFilter(e.target.value))}
                className="input text-sm max-w-[100px]">
                <option value="">ทุกปี</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={fuelFilter}
                onChange={e => handleFilter(() => setFuelFilter(e.target.value))}
                className="input text-sm max-w-[120px]">
                <option value="">ทุกเชื้อเพลิง</option>
                {fuels.map(f => <option key={f} value={f}>{FUEL_TH[f]||f}</option>)}
              </select>
              <select value={sortBy}
                onChange={e => handleFilter(() => setSortBy(e.target.value))}
                className="input text-sm max-w-[150px]">
                <option value="default">เรียงลำดับ</option>
                <option value="price_asc">ราคา ต่ำ→สูง</option>
                <option value="price_desc">ราคา สูง→ต่ำ</option>
                <option value="year_desc">ปีใหม่ก่อน</option>
              </select>
            </div>

            {/* Count + clear */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'กำลังโหลด...' : `${filtered.length} คัน`}
                {filtered.length > 0 && ` (หน้า ${page}/${Math.ceil(filtered.length/PAGE_SIZE)})`}
              </p>
              {isFiltered && (
                <button onClick={resetFilters} className="text-xs text-accent hover:text-secondary transition-colors lg:hidden">ล้างตัวกรอง</button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_,i) => (
                  <div key={i} className="card overflow-hidden animate-pulse">
                    <div className="h-28 bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !user && tab === 'all' ? (
              <div className="text-center py-20 card">
                <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p className="text-navy font-medium mb-1">เข้าสู่ระบบเพื่อดูรถ</p>
                <p className="text-sm text-gray-400 mb-4">ต้องใช้ API Key ในการดึงข้อมูลรถ</p>
                <Link to="/login" className="btn-primary">เข้าสู่ระบบ</Link>
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-2-6H7L5 9m14 0H5m14 0l1 3H4l1-3m0 0v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
                <p className="text-gray-500 text-sm">
                  {tab === 'liked' ? 'ยังไม่มีรถที่ถูกใจ' : 'ไม่พบรถที่ตรงกับเงื่อนไข'}
                </p>
                {isFiltered && (
                  <button onClick={resetFilters} className="mt-3 text-sm text-accent hover:text-secondary transition-colors">
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map(car => (
                    <CarCard
                      key={car.id}
                      car={car}
                      liked={likes.includes(car.id)}
                      onLike={toggleLike}
                      loggedIn={!!user}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
