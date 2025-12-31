import React, { useEffect, useRef, useState } from 'react'
import API_CONFIG from '../config/api'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function SearchUsers() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (!q.trim()) {
      setResults([])
      return
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(API_CONFIG.getApiUrl(`/users/search?query=${encodeURIComponent(q.trim())}`), { headers: authHeaders() })
        const list = res.ok ? await res.json() : []
        const resultsList = Array.isArray(list) ? list : []
        
        // Get current user ID to check if result is self
        let meId = null
        try {
          const meRes = await fetch(API_CONFIG.getApiUrl('/users/me'), { headers: authHeaders() })
          if (meRes.ok) {
            const me = await meRes.json()
            meId = String(me?._id || me?.id || '')
          }
        } catch {}
        
        // Mark self in results (backend already provides __following status)
        const resultsWithSelf = resultsList.map(user => {
          const userId = String(user._id || user.id || '')
          return {
            ...user,
            __following: user.__following || false,
            __isSelf: meId ? String(userId) === String(meId) : false
          }
        })
        
        setResults(resultsWithSelf)
        setOpen(true)
      } catch {
        setOpen(false)
      }
    }, 250)
    return () => timer.current && clearTimeout(timer.current)
  }, [q])

  const toggleFollow = async (userId, isFollowing) => {
    try {
      const url = API_CONFIG.getApiUrl('/follow')
      const opts = isFollowing
        ? { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ followingId: userId }) }
        : { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ followingId: userId }) }
      const res = await fetch(url, opts)
      if (res.ok) {
        setResults((arr) => arr.map((u) => (u._id === userId ? { ...u, __following: !isFollowing } : u)))
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && setOpen(true)}
        placeholder="Search people…"
        className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm min-w-[200px]"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 mt-2 w-[280px] rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
          <ul className="max-h-72 overflow-auto">
            {results.map((u) => (
              <li key={u._id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-zinc-50">
                <a href={`/u/${encodeURIComponent(u.username)}`} className="flex items-center gap-2 no-underline">
                  <img src={u.avatar || 'https://avatar.vercel.sh/user'} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{u.full_name || u.username}</div>
                    <div className="text-xs text-zinc-500">@{u.username}</div>
                  </div>
                </a>
                {!u.__isSelf && (
                  <button
                    onClick={() => toggleFollow(u._id, !!u.__following)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${u.__following ? 'ring-zinc-300 text-zinc-700' : 'bg-zinc-900 text-white ring-zinc-900'}`}
                  >
                    {u.__following ? 'Following' : 'Follow'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


