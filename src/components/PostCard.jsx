import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Trash2, MessageSquare, FileCheck } from 'lucide-react'
import API_CONFIG from '../config/api'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function PostCard({
  post,
  authorName,
  authorUsername,
  authorAvatarUrl,
  authorAccountId,
  viewerAccountId,
  canDelete = false,
  onDelete,
}) {
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comments || 0)
  const [hasInitializedCount, setHasInitializedCount] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // total likes
        const totalRes = await fetch(
          API_CONFIG.getApiUrl(
            `/likes?count=1&targetType=post&targetId=${encodeURIComponent(String(post.id))}`
          ),
          { headers: authHeaders(), cache: 'no-store' }
        )
        if (!cancelled && totalRes.ok) {
          const { count } = await totalRes.json()
          setLikeCount(typeof count === 'number' ? count : post.likes || 0)
        }

        // total comments
        const comRes = await fetch(
          API_CONFIG.getApiUrl(
            `/comments?count=1&targetType=post&targetId=${encodeURIComponent(String(post.id))}`
          ),
          { headers: authHeaders(), cache: 'no-store' }
        )
        if (!cancelled && comRes.ok) {
          const { count } = await comRes.json()
          setCommentCount(typeof count === 'number' ? count : post.comments || 0)
        }

        // whether viewer has liked
        const meRes = await fetch(API_CONFIG.getApiUrl('/users/me'), {
          headers: authHeaders(),
          cache: 'no-store',
        })
        if (!cancelled && meRes.ok) {
          const me = await meRes.json()
          const viewerId = me?._id
          if (viewerId) {
            const likedRes = await fetch(
              API_CONFIG.getApiUrl(
                `/likes?count=1&targetType=post&targetId=${encodeURIComponent(String(post.id))}&accountId=${encodeURIComponent(String(viewerId))}`
              ),
              { headers: authHeaders(), cache: 'no-store' }
            )
            if (!cancelled && likedRes.ok) {
              const { count: myCount } = await likedRes.json()
              setIsLiked((myCount || 0) > 0)
            }
          }
        }
        setHasInitializedCount(true)
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [post.id, post.likes])

  // Load follow status for the author if viewer is different
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!authorAccountId || !viewerAccountId || authorAccountId === viewerAccountId) return
        const res = await fetch(API_CONFIG.getApiUrl(`/follow/status?followingId=${encodeURIComponent(authorAccountId)}`), { headers: authHeaders() })
        if (!cancelled && res.ok) {
          const j = await res.json()
          setIsFollowing(!!j.following)
        }
      } catch {
        // ignore
      }
    })()
    return () => { cancelled = true }
  }, [authorAccountId, viewerAccountId])

  const getAccountId = async () => {
    try {
      const res = await fetch(API_CONFIG.getApiUrl('/users/me'), {
        headers: authHeaders(),
        cache: 'no-store',
      })
      if (res.ok) {
        const j = await res.json()
        return j?._id || 'demo-account'
      }
    } catch {
      // ignore
    }
    return 'demo-account'
  }

  const handleLike = async () => {
    if (isLiking) return
    
    if (isLiked) {
      // Unlike (dislike)
      setIsLiking(true)
      try {
        const res = await fetch(API_CONFIG.getApiUrl('/likes'), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ targetType: 'post', targetId: post.id }),
        })
        if (res.ok) {
          setLikeCount((c) => Math.max(0, c - 1))
          setIsLiked(false)
        }
      } finally {
        setIsLiking(false)
      }
    } else {
      // Like
      setIsLiking(true)
      try {
        const accountId = await getAccountId()
        const res = await fetch(API_CONFIG.getApiUrl('/likes'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ targetType: 'post', targetId: post.id, accountId }),
        })
        if (res.status === 201) {
          setLikeCount((c) => c + 1)
          setIsLiked(true)
        }
      } finally {
        setIsLiking(false)
      }
    }
  }

  const images = post.images && post.images.length > 0 ? post.images : post.image ? [post.image] : []

  const quickAnalyze = async () => {
    try {
      setAnalyzing(true)
      // single-call quick analyze
      const qaRes = await fetch(API_CONFIG.getApiUrl('/assignments/quick-analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ postId: post.id })
      })
      if (!qaRes.ok) throw new Error('Failed to analyze assignment')
      // Backend already created a comment with the analysis
        setShowComments(true)
        setCommentCount((c) => (c || 0) + 1)
    } catch (e) {
      console.error('Quick analyze failed:', e)
      alert('Failed to analyze. Please try again in a moment.')
    } finally {
      setAnalyzing(false)
    }
  }

  const renderImages = () => {
    if (images.length === 0) return null
    if (images.length === 1) {
      return (
        <div className="mt-3 mb-3 relative w-full aspect-video overflow-hidden rounded-xl">
          <img src={images[0]} alt="Post content" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      )
    }
    if (images.length === 2) {
      return (
        <div className="mt-3 mb-3 grid grid-cols-2 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-xl">
              <img src={img} alt={`Post content ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )
    }
    if (images.length === 3) {
      return (
        <div className="mt-3 mb-3 grid grid-cols-2 gap-2">
          <div className="relative row-span-2 aspect-square overflow-hidden rounded-xl">
            <img src={images[0]} alt="Post content 1" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <img src={images[1]} alt="Post content 2" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <img src={images[2]} alt="Post content 3" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      )
    }
    return (
      <div className="mt-3 mb-3 grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((img, idx) => (
          <div key={idx} className="relative aspect-square overflow-hidden rounded-xl">
            <img src={img} alt={`Post content ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" />
            {idx === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
      <header className="mb-4 flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          {authorAvatarUrl ? (
            <img src={authorAvatarUrl} alt={authorName || authorUsername || 'avatar'} className="h-10 w-10 object-cover" />
          ) : null}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 text-[15px]">{authorName || authorUsername || 'User'}</span>
              <span className="text-sm text-gray-500">{post.timestamp}</span>
            </div>
            {authorAccountId && viewerAccountId && authorAccountId !== viewerAccountId && (
              <button
                onClick={async () => {
                  try {
                    const url = API_CONFIG.getApiUrl('/follow')
                    const opts = isFollowing
                      ? { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ followingId: authorAccountId }) }
                      : { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ followingId: authorAccountId }) }
                    const res = await fetch(url, opts)
                    if (res.ok) setIsFollowing((v) => !v)
                  } catch {
                    // ignore
                  }
              }}
                className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ring-1 ${isFollowing ? 'ring-zinc-300 text-zinc-700' : 'bg-zinc-900 text-white ring-zinc-900'}`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <p className="mt-3 mb-2 text-[15px] leading-6 text-gray-800 whitespace-pre-line">{post.content}</p>
          {renderImages()}
        </div>
      </header>

      <footer className="mt-4 border-t border-zinc-100 pt-3 flex items-center justify-center gap-10 md:justify-end">
        <button onClick={handleLike} disabled={isLiking} className="flex items-center gap-2 text-gray-600 transition hover:text-pink-600 disabled:opacity-60">
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
          <span className="text-sm font-medium">{hasInitializedCount ? likeCount : post.likes || 0}</span>
        </button>
        <button onClick={() => setShowComments((s) => !s)} className="flex items-center gap-2 text-gray-600 transition hover:text-blue-600">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>
        <button onClick={quickAnalyze} disabled={analyzing} className="flex items-center gap-2 text-gray-600 transition hover:text-purple-600 disabled:opacity-60">
          <FileCheck className="h-5 w-5" />
          <span className="text-sm font-medium">{analyzing ? 'Analyzing…' : 'Analyze'}</span>
        </button>
        {canDelete ? (
          <button onClick={onDelete} className="flex items-center gap-2 text-gray-600 transition hover:text-red-600">
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
      </footer>

      {showComments && (
        <div className="mt-4">
          <Comments targetType="post" targetId={post.id} onCountChange={setCommentCount} />
        </div>
      )}
    </article>
  )
}

function Comments({ targetType, targetId, onCountChange }) {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        // load viewer profile for input avatar
        try {
          const meRes = await fetch(API_CONFIG.getApiUrl('/users/me'), { headers: authHeaders(), cache: 'no-store' })
          if (meRes.ok) {
            const meJson = await meRes.json()
            const meId = meJson?._id
            if (meId) {
              const pr = await fetch(API_CONFIG.getApiUrl(`/profiles?accountId=${encodeURIComponent(meId)}`))
              const arr = pr.ok ? await pr.json() : []
              setMe({ id: meId, avatarUrl: arr?.[0]?.avatarUrl || null })
            }
          }
        } catch (err) {
          console.warn('Failed to load profile:', err)
        }

        const res = await fetch(
          API_CONFIG.getApiUrl(`/comments?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(String(targetId))}`),
          { headers: authHeaders() }
        )
        if (res.ok) {
          const list = await res.json()
          const base = Array.isArray(list) ? list : []
          // enrich with profile avatars (best-effort)
          const enriched = await Promise.all(base.map(async (c) => {
            try {
              const pr = await fetch(API_CONFIG.getApiUrl(`/profiles?accountId=${encodeURIComponent(c.accountId)}`))
              const arr = pr.ok ? await pr.json() : []
              const profile = arr?.[0] || null
              return { ...c, _avatarUrl: profile?.avatarUrl || null, _display: profile?.displayName || c.accountId }
            } catch { return { ...c, _avatarUrl: null, _display: c.accountId } }
          }))
          setItems(enriched)
          onCountChange && onCountChange(list.length || 0)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [targetType, targetId])

  const addComment = async () => {
    const body = text.trim()
    if (!body) return
    const meRes = await fetch(API_CONFIG.getApiUrl('/users/me'), { headers: authHeaders() })
    if (!meRes.ok) return
    const me = await meRes.json()
    const accountId = me?._id
    const res = await fetch(API_CONFIG.getApiUrl('/comments'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ targetType, targetId, accountId, content: body }),
    })
    if (res.status === 201) {
      const created = await res.json()
      setItems((arr) => [{ ...created, _avatarUrl: me?.profile?.avatar || null, _display: me?.username || 'You' }, ...arr])
      setText('')
      onCountChange && onCountChange((items.length || 0) + 1)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-4 bg-white">
      {/* Composer */}
      <div className="flex gap-3 items-start">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="me" className="h-10 w-10 object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">🙂</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
              placeholder="Post your reply"
              className="flex-1 bg-transparent text-sm outline-none"
        />
            <button onClick={addComment} className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white">Reply</button>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="mt-4 divide-y divide-zinc-100">
        {loading ? (
          <div className="text-sm text-zinc-500">Loading comments...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-500">No comments yet.</div>
        ) : (
          items.map((c) => (
            <div key={c._id} className="flex gap-3 py-3 hover:bg-zinc-50 rounded-lg px-2">
              <div className="h-9 w-9 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
                {c._avatarUrl ? (
                  <img src={c._avatarUrl} alt="avatar" className="h-9 w-9 object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">🗨️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                  <span className="font-medium text-zinc-800 text-sm truncate max-w-[50%]">{c._display || c.accountId}</span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-[15px] leading-6 text-zinc-800 whitespace-pre-wrap">{c.content}</div>
                <div className="mt-2 flex items-center gap-5 text-zinc-500">
                  <button className="text-xs hover:text-zinc-700">Reply</button>
                  <button className="text-xs hover:text-zinc-700">Like</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AssignmentAnalyzer({ postId, postContent, postImages, onClose }) {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(API_CONFIG.getApiUrl('/courses'))
        const data = res.ok ? await res.json() : []
        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load courses:', err)
      }
    })()
  }, [])

  const createAndAnalyze = async () => {
    if (!selectedCourseId) {
      alert('Please select a course')
      return
    }

    setAnalyzing(true)
    setAnalysis(null)

    try {
      // Create assignment
      const createRes = await fetch(API_CONFIG.getApiUrl('/assignments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ postId, courseId: selectedCourseId }),
      })

      if (!createRes.ok) {
        throw new Error('Failed to create assignment')
      }

      const { assignment: created } = await createRes.json()

      // Analyze
      const analyzeRes = await fetch(
        API_CONFIG.getApiUrl(`/assignments/${created._id}/analyze`),
        {
          method: 'POST',
          headers: authHeaders(),
        }
      )

      if (!analyzeRes.ok) {
        throw new Error('Failed to analyze assignment')
      }

      const { analysis: analysisData } = await analyzeRes.json()
      setAnalysis(analysisData)
    } catch (error) {
      console.error('Assignment analysis error:', error)
      alert('Failed to analyze assignment. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Analyze Assignment</h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 text-2xl"
            >
              ×
            </button>
          </div>

          {!analysis ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                  disabled={analyzing}
                >
                  <option value="">Choose a course...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 p-4 bg-zinc-50 rounded-lg">
                <p className="text-sm text-zinc-600 mb-2">Content to analyze:</p>
                <p className="text-sm text-zinc-800 whitespace-pre-wrap">{postContent || '[No text]'}</p>
                {postImages && postImages.length > 0 && (
                  <p className="text-xs text-zinc-500 mt-2">{postImages.length} image(s) will be analyzed</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-zinc-300 text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createAndAnalyze}
                  disabled={!selectedCourseId || analyzing}
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium bg-zinc-900 text-white disabled:opacity-60"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Assignment'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">✅ Analysis Complete</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Score</p>
                  <p className="text-3xl font-bold text-zinc-900">{analysis.score || 0}/100</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Plagiarism Score</p>
                  <p className={`text-3xl font-bold ${(analysis.plagiarismScore || 0) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.plagiarismScore || 0}%
                  </p>
                </div>
              </div>

              {analysis.feedback && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2">Feedback</h3>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap bg-zinc-50 p-4 rounded-lg">
                    {analysis.feedback}
                  </p>
                </div>
              )}

              {analysis.plagiarismDetails && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2">Plagiarism Analysis</h3>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap bg-zinc-50 p-4 rounded-lg">
                    {analysis.plagiarismDetails}
                  </p>
                </div>
              )}

              {analysis.strengths && analysis.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2">Strengths</h3>
                  <ul className="list-disc list-inside text-sm text-zinc-800 space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-700 mb-2">Areas for Improvement</h3>
                  <ul className="list-disc list-inside text-sm text-zinc-800 space-y-1">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">Suggestions</h3>
                  <ul className="list-disc list-inside text-sm text-zinc-800 space-y-1">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium bg-zinc-900 text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


