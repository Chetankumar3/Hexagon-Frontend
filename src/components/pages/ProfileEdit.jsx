import React, { useEffect, useRef, useState } from 'react'
import API_CONFIG from '../../config/api'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function ProfileEdit() {
  const [form, setForm] = useState({ full_name: '', bio: '', location: '', website: '', avatar: '', cover: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true
    ;(async () => {
      try {
        const me = await fetch(API_CONFIG.getApiUrl('/users/me'), { headers: authHeaders() })
        if (!me.ok) return
        const j = await me.json()
        const p = j?.profile || {}
        setForm({
          full_name: p.full_name || '',
          bio: p.bio || '',
          location: p.location || '',
          website: p.website || '',
          avatar: p.avatar || '',
          cover: p.cover || '',
        })
      } catch {
        // ignore
      }
    })()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const onAvatarFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await fileToDataUrl(f)
    setForm((s) => ({ ...s, avatar: String(dataUrl) }))
  }

  const onCoverFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await fileToDataUrl(f)
    setForm((s) => ({ ...s, cover: String(dataUrl) }))
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      // Only send non-empty fields so backend validators (e.g., URL) don't reject empty strings
      const cleanProfile = {}
      if (String(form.full_name || '').trim()) cleanProfile.full_name = String(form.full_name).trim()
      if (String(form.bio || '').trim()) cleanProfile.bio = String(form.bio).trim()
      if (String(form.location || '').trim()) cleanProfile.location = String(form.location).trim()
      if (String(form.website || '').trim()) cleanProfile.website = String(form.website).trim()
      if (String(form.avatar || '').trim()) cleanProfile.avatar = String(form.avatar).trim()
      if (String(form.cover || '').trim()) cleanProfile.cover = String(form.cover).trim()

      const payload = { profile: cleanProfile }

      const res = await fetch(API_CONFIG.getApiUrl('/users/me'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || 'Failed to save')
      } else {
        window.history.back()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[70vh] w-full flex justify-center pt-20 pb-10">
      <div className="w-full max-w-2xl p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] gap-4 items-center">
          <div className="flex justify-center md:justify-start">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover ring-1 ring-zinc-200" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-zinc-100" />
            )}
          </div>
          <div className="grid gap-2">
            <label className="block text-sm text-zinc-700">Profile image</label>
            <input type="file" accept="image/*" onChange={onAvatarFile} className="text-sm" />
            <input name="avatar" value={form.avatar} onChange={onChange} placeholder="or paste an image URL" className="w-full rounded border border-zinc-300 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-700 mb-1">Full name</label>
          <input name="full_name" value={form.full_name} onChange={onChange} className="w-full rounded border border-zinc-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-zinc-700 mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={onChange} className="w-full rounded border border-zinc-300 px-3 py-2" rows={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Location</label>
            <input name="location" value={form.location} onChange={onChange} className="w-full rounded border border-zinc-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Website</label>
            <input name="website" value={form.website} onChange={onChange} className="w-full rounded border border-zinc-300 px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-700 mb-1">Avatar URL</label>
          <input name="avatar" value={form.avatar} onChange={onChange} className="w-full rounded border border-zinc-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-zinc-700 mb-1">Cover image</label>
          <div className="grid gap-2">
            {form.cover ? (
              <img src={form.cover} alt="Cover preview" className="h-36 w-full rounded-xl object-cover ring-1 ring-zinc-200" />
            ) : null}
            <input type="file" accept="image/*" onChange={onCoverFile} className="text-sm" />
            <input name="cover" value={form.cover} onChange={onChange} placeholder="or paste an image URL" className="w-full rounded border border-zinc-300 px-3 py-2" />
          </div>
        </div>
        <div className="pt-2">
          <button onClick={onSave} disabled={saving} className="rounded bg-zinc-900 text-white px-4 py-2 disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
      </div>
    </div>
  )
}


