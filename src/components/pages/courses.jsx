import { Link } from 'react-router-dom'
import CourseCard from '../ui/CourseCard.jsx'
import React, { useEffect, useMemo, useState } from 'react'
import API_CONFIG from '../../config/api'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('all')
  const [selected, setSelected] = useState(() => new Set())
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(API_CONFIG.getApiUrl('/courses'))
        const j = res.ok ? await res.json() : []
        if (!cancelled) setCourses(Array.isArray(j) ? j : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const departments = useMemo(() => {
    const set = new Set()
    courses.forEach(c => {
      const d = (c.institute || c.department || '').trim()
      if (d) set.add(d)
    })
    return ['all', ...Array.from(set)]
  }, [courses])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter(c => {
      const matchesDept = dept === 'all' || (c.institute || c.department) === dept
      if (!q) return matchesDept
      const hay = `${c.title} ${c.description} ${c.professor || ''} ${c.instructor || ''}`.toLowerCase()
      return matchesDept && hay.includes(q)
    })
  }, [courses, query, dept])

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const confirmSelection = async () => {
    setSaving(true)
    setNotice('')
    try {
      const ids = Array.from(selected)
      for (const id of ids) {
        await fetch(API_CONFIG.getApiUrl('/enrollments'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ courseId: id })
        })
      }
      setNotice('Added to your profile')
      setSelected(new Set())
    } catch {
      setNotice('Failed to save selection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold pt-3 pb-2">Explore Courses</h1>
        </div>
        {/* Controls */}
        <div className="mb-8 pt-2 pb-2 grid grid-cols-1 md:grid-cols-[1fr,220px,auto] items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or instructor"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 bg-white"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
            ))}
          </select>
          <div className="flex md:justify-end gap-3">
            <Link to="/courses/create" className={`rounded-full px-4 py-2 text-sm font-medium ring-1 bg-zinc-900 text-white ring-zinc-900`}>
              + Add New Course
            </Link>
            <button
              type="button"
              disabled={selected.size === 0 || saving}
              onClick={confirmSelection}
              className={`rounded-full px-4 py-2 text-sm font-medium ring-1 ${selected.size === 0 || saving ? 'ring-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white ring-zinc-900'}`}
            >
              {saving ? 'Saving...' : 'Confirm Selection'}
            </button>
          </div>
        </div>
        {notice && (
          <div className="mb-6 text-right text-sm text-emerald-600">{notice}</div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full max-w-96 h-80 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-600 py-10">No courses found.</div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-12">
            {filtered.map((c) => (
              <div key={c._id} className="relative w-full">
                <Link to={`/courses/${c._id}`} className="block w-full transition-transform hover:-translate-y-0.5">
                  <CourseCard
                    title={c.title}
                    description={c.description}
                    duration={c.duration}
                    department={c.institute || c.department}
                    image={c.image}
                    professor={c.professor || c.instructor}
                  />
                </Link>
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    aria-pressed={selected.has(c._id)}
                    onClick={() => toggleSelect(c._id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${selected.has(c._id) ? 'bg-zinc-900 text-white ring-zinc-900' : 'ring-zinc-300 text-zinc-700 bg-white/80'}`}
                  >
                    {selected.has(c._id) ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}