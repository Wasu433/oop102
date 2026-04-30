import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadSession, clearSession, loadUserKeys, saveProfile, loadProfile } from '../api/authApi'

const TIER_LABEL = { free: 'Starter', standard: 'Standard', pro: 'Pro' }
const TIER_COLOR = {
  free:     'bg-gray-100 text-gray-600 border-gray-200',
  standard: 'bg-blue-50 text-blue-700 border-blue-200',
  pro:      'bg-purple-50 text-purple-700 border-purple-200',
}

export default function ProfilePage() {
  const navigate  = useNavigate()
  const user      = loadSession()

  useEffect(() => { if (!user) navigate('/login') }, [])
  if (!user) return null

  const [profile,   setProfile]   = useState(() => loadProfile(user.id))
  const [editName,  setEditName]  = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [avatarErr, setAvatarErr] = useState('')
  const fileRef = useRef()

  const displayName = profile.name || user.username || user.email || '?'
  const keys  = loadUserKeys(user.id)
  const tier  = user.tier || 'free'

  const handleAvatarClick = () => {
    setAvatarErr('')
    fileRef.current.click()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setAvatarErr('รูปภาพต้องมีขนาดไม่เกิน 2 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const updated = { ...profile, avatar: ev.target.result }
      setProfile(updated)
      saveProfile(user.id, updated)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveAvatar = () => {
    const updated = { ...profile, avatar: null }
    setProfile(updated)
    saveProfile(user.id, updated)
  }

  const startEditName = () => {
    setNameInput(profile.name || user.username || '')
    setEditName(true)
  }

  const handleSaveName = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    const updated = { ...profile, name: trimmed }
    setProfile(updated)
    saveProfile(user.id, updated)
    setEditName(false)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/')
    window.location.reload()
  }

  return (
    <div className="bg-base min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-6 space-y-6">

        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-navy transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Avatar + name */}
        <div className="card p-8 flex flex-col items-center text-center">

          {/* Avatar */}
          <div className="relative mb-4 group">
            <div
              onClick={handleAvatarClick}
              className="w-20 h-20 rounded-full border-2 border-accent/30 overflow-hidden cursor-pointer"
            >
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full bg-highlight flex items-center justify-center">
                    <span className="text-2xl font-semibold text-accent">
                      {displayName[0].toUpperCase()}
                    </span>
                  </div>
                )
              }
            </div>

            {/* overlay เมื่อ hover */}
            <div
              onClick={handleAvatarClick}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {avatarErr && <p className="text-xs text-red-500 mb-2">{avatarErr}</p>}

          {profile.avatar && (
            <button onClick={handleRemoveAvatar} className="text-xs text-gray-400 hover:text-red-500 transition-colors mb-2">
              ลบรูปภาพ
            </button>
          )}

          {/* ชื่อ + ปุ่มแก้ไข */}
          {editName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditName(false) }}
                className="input text-sm text-center w-44"
                maxLength={40}
              />
              <button onClick={handleSaveName} className="btn-primary text-xs px-3 py-1.5">บันทึก</button>
              <button onClick={() => setEditName(false)} className="btn-secondary text-xs px-3 py-1.5">ยกเลิก</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-xl font-medium text-navy">{displayName}</h1>
              <button onClick={startEditName} title="แก้ไขชื่อ" className="text-gray-300 hover:text-accent transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <span className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full border ${TIER_COLOR[tier] || TIER_COLOR.free}`}>
            {TIER_LABEL[tier] || tier}
          </span>
        </div>

        {/* Info */}
        <div className="card p-6 space-y-5">
          <h2 className="text-navy font-medium">ข้อมูลบัญชี</h2>
          <div className="space-y-4">
            <Row label="User ID"   value={user.id} mono />
            <Row label="Username"  value={user.username || '—'} />
            <Row label="ชื่อที่แสดง" value={displayName} />
            <Row label="อีเมล"     value={user.email} />
            <Row label="แผน"       value={TIER_LABEL[tier] || tier} />
            <Row label="สมัครเมื่อ" value={user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          </div>
        </div>

        {/* Keys summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-navy font-medium">API Keys ({keys.length})</h2>
            <Link to="/dashboard" className="text-xs text-accent hover:text-secondary transition-colors">จัดการ keys →</Link>
          </div>
          {keys.length === 0 ? (
            <p className="text-sm text-gray-400">ยังไม่มี API Key</p>
          ) : (
            <div className="space-y-2">
              {keys.map((k, i) => (
                <div key={k.key} className="flex items-center justify-between py-2 border-b border-rim last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy">{k.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{k.key.slice(0, 14)}••••</p>
                  </div>
                  {i === 0 && <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full">หลัก</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/pricing" className="btn-primary text-center flex-1">ดูแผนราคา / อัปเกรด</Link>
          <button onClick={handleLogout} className="btn-secondary flex-1 text-center">ออกจากระบบ</button>
        </div>

      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-rim last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-navy text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
