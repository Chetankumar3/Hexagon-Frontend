import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API_CONFIG from '../../config/api'
import { IconMapPin as MapPin, IconLink as LinkIcon, IconCalendar as Calendar, IconSparkles as Sparkles } from '@tabler/icons-react'
import PostCard from '../PostCard'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function PublicProfile() {
  const { accountRef } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [meId, setMeId] = useState(null)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // me (optional)
        let currentMeId = null
        try {
          const meRes = await fetch(API_CONFIG.getApiUrl('/users/me'), { headers: authHeaders() })
          if (meRes.ok) {
            const me = await meRes.json()
            currentMeId = me?._id || me?.id || null
            setMeId(currentMeId)
          }
        } catch {}

        // profile by username or id
        const prRes = await fetch(API_CONFIG.getApiUrl(`/profiles?accountId=${encodeURIComponent(accountRef)}`))
        const arr = prRes.ok ? await prRes.json() : []
        const p = arr?.[0] || null
        if (cancelled) return
        setProfile(p)
        const profileId = p?._id || p?.accountId || accountRef

        // stats
        const statsRes = await fetch(API_CONFIG.getApiUrl(`/follow/stats?accountId=${encodeURIComponent(profileId)}`))
        const stats = statsRes.ok ? await statsRes.json() : { followers: 0, following: 0 }
        if (cancelled) return
        setCounts({ followers: Number(stats.followers || 0), following: Number(stats.following || 0) })

        // follow status (if logged in)
        if (currentMeId && profileId) {
          if (String(currentMeId) !== String(profileId)) {
            // Viewing another user, check follow status
            const st = await fetch(API_CONFIG.getApiUrl(`/follow/status?followingId=${encodeURIComponent(profileId)}`), { headers: authHeaders() })
            if (st.ok && !cancelled) {
              const j = await st.json()
              setIsFollowing(!!j.following)
            }
          } else {
            // Viewing self
            setIsFollowing(false)
          }
        } else {
          // Not logged in
          setIsFollowing(false)
        }

        // posts
        const postsRes = await fetch(API_CONFIG.getApiUrl(`/posts?accountId=${encodeURIComponent(profileId)}`))
        const fetched = postsRes.ok ? await postsRes.json() : []
        const normalized = (Array.isArray(fetched) ? fetched : []).map((pp) => ({
          id: pp.id || pp._id,
          accountId: pp.accountId,
          content: pp.content,
          image: null,
          images: (pp.images || []).map((u) => API_CONFIG.getApiUrl(u)),
          likes: Number(pp.likes || pp.likesCount || 0),
          comments: Number(pp.comments || pp.commentsCount || 0),
          timestamp: new Date(pp.createdAt || Date.now()).toLocaleString(),
        }))
        if (!cancelled) setPosts(normalized)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [accountRef])

  if (loading) return <div className="p-12">Loading profile...</div>
  if (!profile) return <div className="p-12 text-red-500">No profile found.</div>

  const isSelf = meId && profile && (profile._id === meId || profile.accountId === meId)
  const profileId = profile?._id || profile?.accountId || accountRef

  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div className="w-full max-w-5xl">
        <section className="relative w-full px-4">
          <div className="relative h-72 md:h-80 w-full overflow-hidden bg-zinc-200">
            {profile.coverUrl ? (
              <img src={profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="relative -mt-24 md:-mt-28 mb-4 flex items-center gap-4 px-4 pb-4">
            <div className="h-32 w-32 md:h-36 md:w-36 rounded-full border-[6px] border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover rounded-full" />
              ) : (
                <div className="h-full w-full rounded-full bg-zinc-100" />
              )}
            </div>
            <div className="flex flex-col justify-center h-32 md:h-36 mb-2">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
                {profile.displayName || ''}
                <Sparkles className="h-5 w-5 text-amber-500" />
              </h2>
              <p className="text-zinc-600">@{profile.accountId}</p>
            </div>
            <div className="ml-auto mb-2 flex gap-3">
              {!isSelf && (
                <button
                  onClick={async () => {
                    try {
                      const url = API_CONFIG.getApiUrl('/follow')
                      const opts = isFollowing
                        ? { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ followingId: profileId }) }
                        : { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ followingId: profileId }) }
                      const res = await fetch(url, opts)
                      if (res.ok) {
                        setIsFollowing((v) => !v)
                        setCounts((c) => ({ ...c, followers: (c.followers || 0) + (isFollowing ? -1 : 1) }))
                      }
                    } catch {}
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ring-1 ${isFollowing ? 'ring-zinc-300 text-zinc-700' : 'bg-zinc-900 text-white ring-zinc-900'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-3 flex w-full flex-col gap-6 px-4">
          <aside className="w-full">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="mb-2 text-zinc-700 whitespace-pre-line min-h-[2em]">{profile.about}</div>
              <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-600">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>}
                {profile.website && <span className="flex items-center gap-1"><LinkIcon className="h-4 w-4" /><a href={profile.website} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline">{profile.website}</a></span>}
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /></span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold text-zinc-900">{posts.length}</div><div className="text-sm text-zinc-600">Posts</div></div>
                <div><div className="text-2xl font-bold text-zinc-900">{counts.followers}</div><div className="text-sm text-zinc-600">Followers</div></div>
                <div><div className="text-2xl font-bold text-zinc-900">{counts.following}</div><div className="text-sm text-zinc-600">Following</div></div>
              </div>
            </div>
          </aside>

          <div className="w-full max-w-3xl mx-auto grid gap-4 px-4 md:pl-10 md:pr-4">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                authorName={profile.displayName}
                authorUsername={profile.accountId}
                authorAvatarUrl={profile.avatarUrl}
                authorAccountId={p.accountId}
                viewerAccountId={meId}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}


