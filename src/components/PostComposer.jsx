import React, { useEffect, useRef, useState } from 'react'
import API_CONFIG from '../config/api'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function PostComposer({ onCreated }) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [assignmentName, setAssignmentName] = useState('')
  const fileInputRef = useRef(null)

  const onPickFiles = (e) => {
    const selected = Array.from(e.target.files || [])
    const next = [...files, ...selected].slice(0, 6)
    setFiles(next)
  }

  const removeFileAt = (idx) => {
    setFiles((arr) => arr.filter((_, i) => i !== idx))
  }

  const submit = async () => {
    if (submitting) return
    if (!content.trim() && files.length === 0) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      const tags = `${selectedCourseId ? ` @course(${selectedCourseId})` : ''}${assignmentName.trim() ? ` @assignment(${assignmentName.trim()})` : ''}`
      fd.append('content', `${content.trim()}${tags}`.trim())
      files.forEach((f) => fd.append('images', f))
      const res = await fetch(API_CONFIG.getApiUrl('/posts'), {
        method: 'POST',
        headers: { ...authHeaders() },
        body: fd,
      })
      if (res.ok) {
        const created = await res.json()
        onCreated && onCreated(formatPost(created))
        setContent('')
        setFiles([])
        setSelectedCourseId('')
        setAssignmentName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [enrRes, crsRes] = await Promise.all([
          fetch(API_CONFIG.getApiUrl('/enrollments/me'), { headers: { ...authHeaders() }, cache: 'no-store' }),
          fetch(API_CONFIG.getApiUrl('/courses'))
        ])
        const enr = enrRes.ok ? await enrRes.json() : []
        const crs = crsRes.ok ? await crsRes.json() : []
        if (!cancelled) {
          setEnrollments(Array.isArray(enr) ? enr : [])
          setCourses(Array.isArray(crs) ? crs : [])
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full resize-y rounded-lg border border-zinc-200 p-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        rows={3}
      />

      <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-3">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 bg-white"
        >
          <option value="">Select course (optional)</option>
          {enrollments.map((e) => {
            const course = courses.find(c => String(c._id) === String(e.courseId))
            const label = course ? course.title : e.courseId
            return <option key={e._id || e.courseId} value={e.courseId}>{label}</option>
          })}
        </select>
        <input
          value={assignmentName}
          onChange={e => setAssignmentName(e.target.value)}
          placeholder="Assignment name (optional)"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      {files.length > 0 && (
        <div className="my-3 grid grid-cols-2 gap-2 md:grid-cols-3 py-2">
          {files.map((f, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-zinc-200">
              <img src={URL.createObjectURL(f)} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
              <button
                onClick={() => removeFileAt(idx)}
                className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={onPickFiles} className="text-sm" />
          <span className="text-xs text-zinc-500">Up to 6 images</span>
        </div>
        <button
          onClick={submit}
          disabled={submitting || (!content.trim() && files.length === 0)}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}

function formatPost(p) {
  return {
    id: p.id || p._id,
    accountId: p.accountId,
    content: p.content,
    image: null,
    images: (p.images || []).map((u) => API_CONFIG.getApiUrl(u)),
    likes: Number(p.likes || p.likesCount || 0),
    comments: Number(p.comments || p.commentsCount || 0),
    timestamp: new Date(p.createdAt || Date.now()).toLocaleString(),
  }
}


