
// ReelsStudio.jsx - Updated alternative view
import React, { useState } from 'react'
import CourseCard from '../ui/CourseCard.jsx'
import API_CONFIG from '../../config/api.js'

export default function ReelsStudio() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [reels, setReels] = useState([
    {
      id: 'r1',
      title: 'Sample Reel: Getting Started',
      description: 'A beautiful, generalized reel generated as a demo.',
      image: 'https://images.unsplash.com/photo-1517814384312-c0d03c2f5d1a?q=80&w=1400&auto=format&fit=crop',
      duration: '15s',
      author: 'Hexagon AI'
    }
  ])

  const onGenerate = async () => {
    const p = String(prompt || '').trim()
    if (!p) return
    
    setLoading(true)
    
    try {
      const res = await fetch(API_CONFIG.getApiUrl('/reels/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p }),
      })
      
      const data = res.ok ? await res.json() : null
      
      if (data?.success && data?.reel) {
        const newReel = {
          id: `r${Date.now()}`,
          title: data.reel.title,
          description: data.reel.script.slice(0, 120) + '...',
          image: data.reel.scenes?.[0]?.imageUrl || 'https://placehold.co/1600x900/6366f1/white?text=Reel',
          duration: `${data.reel.totalDuration}s`,
          author: 'Hexagon AI',
          fullData: data.reel
        }
        setReels((arr) => [newReel, ...arr])
      }
    } catch (err) {
      console.error('Failed to generate:', err)
    } finally {
      setLoading(false)
      setPrompt('')
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Reels Studio</h1>
          <p className="opacity-80 mt-2">Describe a reel and we will craft a beautiful 15-20 second video script with images.</p>
        </div>

        {/* Prompt area */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Morning coffee routine, Quick productivity hack, Healthy smoothie recipe"
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setPrompt('')}
                className="rounded-full px-4 py-2 text-sm font-medium ring-1 ring-zinc-300 text-zinc-800"
                disabled={loading}
              >
                Clear
              </button>
              <button
                onClick={onGenerate}
                disabled={loading || !prompt.trim()}
                className="rounded-full px-5 py-2 text-sm font-medium bg-zinc-900 text-white disabled:opacity-60"
              >
                {loading ? 'Generating…' : 'Generate Reel'}
              </button>
            </div>
          </div>
        </div>

        {/* Generated reels grid */}
        <div className="mt-10 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2">
          {reels.map((r) => (
            <div key={r.id} className="transition-transform hover:-translate-y-0.5">
              <CourseCard
                title={r.title}
                description={r.description}
                duration={r.duration}
                department={r.author}
                image={r.image}
                professor={null}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}