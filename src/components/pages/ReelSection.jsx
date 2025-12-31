// ReelSection.jsx - Updated to work with new OpenAI backend
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import API_CONFIG from '../../config/api.js'
import ReelCardsCarousel from '../ui/ReelCardsCarousel.jsx'

export default function ReelSection() {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reel, setReel] = useState(null)

  const [playerOpen, setPlayerOpen] = useState(false)
  const [sceneIdx, setSceneIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const sceneTimerRef = useRef(null)
  const [voices, setVoices] = useState([])
  const [voiceName, setVoiceName] = useState('')

  // Load available voices for speechSynthesis
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices() || []
      setVoices(v)
      // pick a pleasant default if available
      const preferred = v.find(x => /Google UK English Female|Samantha|Victoria|Google US English Female/i.test(x.name)) || v[0]
      if (preferred && !voiceName) setVoiceName(preferred.name)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [voiceName])

  const onGenerate = async () => {
    const p = String(prompt || '').trim()
    if (!p) return
    setLoading(true)
    setError('')
    setReel(null)
    try {
      const res = await fetch(API_CONFIG.getApiUrl('/reels/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p })
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Failed to generate reel')
        return
      }
      setReel(data.reel)
    } catch (err) {
      console.error('Failed to generate:', err)
      setError('Error: Failed to generate content.')
    } finally {
      setLoading(false)
      setPrompt('')
    }
  }

  // Fullscreen player controls
  const startPlayback = () => {
    if (!reel) return
    setPlaying(true)
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        // Build clean narration from scenes (avoid saying "Scene 1/2...")
        const narration = reel.narration
          ? String(reel.narration)
          : (Array.isArray(reel.scenes) && reel.scenes.length > 0
              ? reel.scenes.map(s => String(s?.text || '')).join('. ')
              : String(reel.script || ''))
              .replace(/\[\s*scene\s*\d+\s*\]/gi, '')
              .replace(/scene\s*\d+\s*[:.-]?/gi, '')
        const utter = new SpeechSynthesisUtterance(narration)
        utter.rate = 1.0
        utter.pitch = 1.0
        utter.volume = 1.0
        // apply selected voice
        if (voiceName && voices.length) {
          const v = voices.find(v => v.name === voiceName)
          if (v) utter.voice = v
        }
        window.speechSynthesis.speak(utter)
      }
    } catch (err) {
      console.error('Speech synthesis error:', err)
    }
    if (reel.scenes?.length > 1) {
      clearInterval(sceneTimerRef.current)
      sceneTimerRef.current = setInterval(() => {
        setSceneIdx((i) => (i + 1) % reel.scenes.length)
      }, 2000)
    }
  }
  const pausePlayback = () => {
    setPlaying(false)
    try { 
      if ('speechSynthesis' in window) window.speechSynthesis.cancel() 
    } catch (err) {
      console.error('Speech synthesis cancel error:', err)
    }
    clearInterval(sceneTimerRef.current)
  }
  useEffect(() => () => { 
    clearInterval(sceneTimerRef.current)
    try { 
      if ('speechSynthesis' in window) window.speechSynthesis.cancel() 
    } catch (err) {
      console.error('Speech synthesis cleanup error:', err)
    }
  }, [])

  return (
    <section className="w-full py-8 flex flex-col items-center">
      {/* Claude-like Prompt Interface */}
      <div className="w-full max-w-7xl flex flex-col items-center justify-center min-h-[60vh] px-4">
        {/* Centered Greeting */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl font-bold text-zinc-900">✱</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 mb-4">
            {t("reels.studioTitle")}
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto">
            {t("reels.studioSubtitle")}
          </p>
        </div>

        {/* Large Input Field with Icons */}
        <div className="w-full max-w-4xl">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 21C7.02944 21 3 16.9706 3 12M12 21C13.6569 21 15 16.9706 15 12C15 7.02944 13.6569 3 12 3M12 21C10.3431 21 9 16.9706 9 12C9 7.02944 10.3431 3 12 3M3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading && prompt.trim()) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
              placeholder={t("reels.promptPlaceholder")}
              rows={3}
              className="w-full resize-none rounded-2xl border border-zinc-300 bg-white pl-20 pr-24 py-4 text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              <select className="text-sm text-zinc-600 bg-transparent border-none focus:outline-none cursor-pointer">
                <option>Sonnet 4.5</option>
              </select>
              <button
                onClick={onGenerate}
                disabled={loading || !prompt.trim()}
                className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                title={t("reels.generateReel")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setPrompt('')}
              className="px-5 py-2.5 rounded-full border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("reels.clear")}
            </button>
            <button
              onClick={onGenerate}
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 rounded-full border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("reels.generateReel")}
            </button>
          </div>
        </div>
      </div>

      {/* Apple-like Reel Card Carousel - Generated Reels */}
      {reel && (
        <div className="mt-16 w-full max-w-7xl flex justify-center px-4">
          <ReelCardsCarousel reels={[reel]} onOpen={() => { setPlayerOpen(true); setSceneIdx(0); }} />
        </div>
      )}

      {/* Fullscreen Reel Player */}
      {playerOpen && reel && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <button onClick={() => { pausePlayback(); setPlayerOpen(false); }} className="px-3 py-1.5 rounded-full bg-white text-black text-sm">{t("common.close")}</button>
          </div>
          <div className="w-full max-w-[420px] aspect-[9/16] bg-black rounded-2xl overflow-hidden relative">
            <img src={reel.scenes?.[sceneIdx]?.imageUrl || reel.scenes?.[0]?.imageUrl} alt="scene" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="text-white text-sm mb-2">{t("reels.scene")} {sceneIdx + 1} / {reel.scenes?.length || 1} • {reel.scenes?.[sceneIdx]?.duration || 0}s</div>
              <div className="text-white text-base font-medium line-clamp-3">{reel.scenes?.[sceneIdx]?.text}</div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {!playing ? (
                  <button onClick={startPlayback} className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium">{t("common.play")}</button>
                ) : (
                  <button onClick={pausePlayback} className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium">{t("common.pause")}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed view */}
      {reel && (
        <div className="mt-6 w-full max-w-4xl flex justify-center px-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm w-full">
            <h3 className="text-lg font-semibold mb-1">{reel.title}</h3>
            <p className="text-zinc-500 text-sm mb-2">{t("reels.totalDuration")}: {reel.totalDuration || 0}s • {reel.scenes?.length || 0} {t("reels.scenes")}</p>
            <div className="text-zinc-700 whitespace-pre-wrap">{reel.script}</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-10 w-full flex justify-center px-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm max-w-2xl w-full">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-600">{t("reels.generating")}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 w-full flex justify-center px-4">
          <div className="text-red-600 text-center max-w-2xl">{error}</div>
        </div>
      )}
    </section>
  )
}