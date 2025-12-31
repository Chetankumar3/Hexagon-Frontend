import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import API_CONFIG from '../../config/api.js'
import ReelCardsCarousel from '../ui/ReelCardsCarousel.jsx'

function authHeaders() {
  const token =
    localStorage.getItem('hexagon_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Sample reels for when database is empty
const SAMPLE_REELS = [
  {
    _id: 'sample-1',
    title: 'Master the Art of Productivity',
    script: 'Transform your daily routine with these simple productivity hacks that top performers swear by.',
    narration: 'Transform your daily routine with these simple productivity hacks that top performers swear by. Start by organizing your workspace, then focus on one task at a time. Remember, consistency beats intensity every single day.',
    totalDuration: 18,
    scenes: [
      {
        duration: 5,
        text: 'Master the Art of Productivity',
        description: 'Clean organized workspace',
        voiceover: 'Transform your daily routine with these simple productivity hacks',
        imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 6,
        text: 'Focus on one task at a time',
        description: 'Person working efficiently',
        voiceover: 'that top performers swear by. Start by organizing your workspace',
        imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 7,
        text: 'Consistency beats intensity',
        description: 'Calendar with daily tasks',
        voiceover: 'then focus on one task at a time. Remember, consistency beats intensity every single day.',
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      }
    ],
    viewCount: 1250,
    likeCount: 89,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'sample-2',
    title: 'Quick Morning Routine for Success',
    script: 'Wake up early and start your day right with this energizing morning routine.',
    narration: 'Wake up early and start your day right with this energizing morning routine. Begin with five minutes of meditation, followed by a healthy breakfast and a quick workout. Your future self will thank you.',
    totalDuration: 16,
    scenes: [
      {
        duration: 4,
        text: 'Wake up early and start your day right',
        description: 'Sunrise morning scene',
        voiceover: 'Wake up early and start your day right',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 6,
        text: 'Meditation and healthy breakfast',
        description: 'Person meditating',
        voiceover: 'with this energizing morning routine. Begin with five minutes of meditation, followed by a healthy breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 6,
        text: 'Quick workout for energy',
        description: 'Person exercising',
        voiceover: 'and a quick workout. Your future self will thank you.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      }
    ],
    viewCount: 980,
    likeCount: 67,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'sample-3',
    title: 'Learn Programming in 30 Days',
    script: 'Start your coding journey with these proven strategies that make learning programming fun and effective.',
    narration: 'Start your coding journey with these proven strategies that make learning programming fun and effective. Practice daily, build projects, and never stop learning. The best time to start was yesterday, the second best is now.',
    totalDuration: 20,
    scenes: [
      {
        duration: 5,
        text: 'Start your coding journey',
        description: 'Code on screen',
        voiceover: 'Start your coding journey with these proven strategies',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 7,
        text: 'Practice daily and build projects',
        description: 'Developer working',
        voiceover: 'that make learning programming fun and effective. Practice daily, build projects',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 8,
        text: 'Never stop learning',
        description: 'Books and laptop',
        voiceover: 'and never stop learning. The best time to start was yesterday, the second best is now.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      }
    ],
    viewCount: 2100,
    likeCount: 145,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'sample-4',
    title: 'Healthy Eating Made Simple',
    script: 'Discover easy meal prep tips that will save you time and keep you healthy all week long.',
    narration: 'Discover easy meal prep tips that will save you time and keep you healthy all week long. Plan your meals, prep in bulk, and enjoy nutritious food without the daily hassle.',
    totalDuration: 17,
    scenes: [
      {
        duration: 4,
        text: 'Healthy eating made simple',
        description: 'Fresh vegetables',
        voiceover: 'Discover easy meal prep tips',
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 6,
        text: 'Plan and prep in bulk',
        description: 'Meal prep containers',
        voiceover: 'that will save you time and keep you healthy all week long. Plan your meals, prep in bulk',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 7,
        text: 'Enjoy nutritious food daily',
        description: 'Healthy meal',
        voiceover: 'and enjoy nutritious food without the daily hassle.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      }
    ],
    viewCount: 1560,
    likeCount: 112,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'sample-5',
    title: 'Mindfulness in 5 Minutes',
    script: 'Learn quick mindfulness techniques that you can practice anywhere, anytime.',
    narration: 'Learn quick mindfulness techniques that you can practice anywhere, anytime. Take deep breaths, focus on the present moment, and watch your stress melt away.',
    totalDuration: 15,
    scenes: [
      {
        duration: 4,
        text: 'Mindfulness in 5 minutes',
        description: 'Peaceful nature scene',
        voiceover: 'Learn quick mindfulness techniques',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 5,
        text: 'Practice anywhere, anytime',
        description: 'Person meditating',
        voiceover: 'that you can practice anywhere, anytime. Take deep breaths',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      },
      {
        duration: 6,
        text: 'Watch stress melt away',
        description: 'Calm peaceful scene',
        voiceover: 'focus on the present moment, and watch your stress melt away.',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1080&h=1920&fit=crop',
        imageSource: 'Unsplash'
      }
    ],
    viewCount: 890,
    likeCount: 78,
    createdAt: new Date().toISOString()
  }
]

export default function ReelsFeed() {
  const { t } = useTranslation()
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [selectedReel, setSelectedReel] = useState(null)
  const [selectedReelIndex, setSelectedReelIndex] = useState(0)
  const [sceneIdx, setSceneIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const sceneTimerRef = React.useRef(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Fetch reels
  const fetchReels = useCallback(async (pageNum = 1) => {
    try {
      const res = await fetch(API_CONFIG.getApiUrl(`/reels?page=${pageNum}&limit=10`), {
        headers: authHeaders()
      })
      const data = await res.json()
      
      if (data.success && data.reels && data.reels.length > 0) {
        if (pageNum === 1) {
          setReels(data.reels)
        } else {
          setReels(prev => [...prev, ...data.reels])
        }
        setHasMore(pageNum < data.pagination.pages)
      } else {
        // Use sample reels if database is empty
        if (pageNum === 1) {
          setReels(SAMPLE_REELS)
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reels:', error)
      // Use sample reels on error
      if (pageNum === 1) {
        setReels(SAMPLE_REELS)
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReels(1)
  }, [fetchReels])

  // Handle reel card open
  const handleReelOpen = (reel) => {
    const index = reels.findIndex(r => r._id === reel._id)
    setSelectedReel(reel)
    setSelectedReelIndex(index >= 0 ? index : 0)
    setPlayerOpen(true)
    setSceneIdx(0)
    setPlaying(false)
  }

  // Fullscreen player controls (defined first for use in navigation)
  const pausePlayback = () => {
    setPlaying(false)
    try { 
      if ('speechSynthesis' in window) window.speechSynthesis.cancel() 
    } catch (err) {
      console.error('Speech synthesis cancel error:', err)
    }
    if (sceneTimerRef.current) {
      clearInterval(sceneTimerRef.current)
    }
  }

  // Navigate to next reel
  const goToNextReel = useCallback(() => {
    if (selectedReelIndex < reels.length - 1) {
      pausePlayback()
      const nextIndex = selectedReelIndex + 1
      setSelectedReelIndex(nextIndex)
      setSelectedReel(reels[nextIndex])
      setSceneIdx(0)
      setPlaying(false)
    }
  }, [selectedReelIndex, reels])

  // Navigate to previous reel
  const goToPreviousReel = useCallback(() => {
    if (selectedReelIndex > 0) {
      pausePlayback()
      const prevIndex = selectedReelIndex - 1
      setSelectedReelIndex(prevIndex)
      setSelectedReel(reels[prevIndex])
      setSceneIdx(0)
      setPlaying(false)
    }
  }, [selectedReelIndex, reels])

  // Handle touch swipe gestures
  const minSwipeDistance = 50
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isUpSwipe = distance > minSwipeDistance
    const isDownSwipe = distance < -minSwipeDistance
    if (isUpSwipe) {
      goToNextReel()
    }
    if (isDownSwipe) {
      goToPreviousReel()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    if (!playerOpen) return
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        goToPreviousReel()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        goToNextReel()
      } else if (e.key === 'Escape') {
        pausePlayback()
        setPlayerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerOpen, goToNextReel, goToPreviousReel])

  // Fullscreen player controls
  const startPlayback = () => {
    if (!selectedReel) return
    setPlaying(true)
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const narration = selectedReel.narration
          ? String(selectedReel.narration)
          : (Array.isArray(selectedReel.scenes) && selectedReel.scenes.length > 0
              ? selectedReel.scenes.map(s => String(s?.text || '')).join('. ')
              : String(selectedReel.script || ''))
              .replace(/\[\s*scene\s*\d+\s*\]/gi, '')
              .replace(/scene\s*\d+\s*[:.-]?/gi, '')
        const utter = new SpeechSynthesisUtterance(narration)
        utter.rate = 1.0
        utter.pitch = 1.0
        utter.volume = 1.0
        window.speechSynthesis.speak(utter)
      }
    } catch (err) {
      console.error('Speech synthesis error:', err)
    }
    if (selectedReel.scenes?.length > 1) {
      clearInterval(sceneTimerRef.current)
      sceneTimerRef.current = setInterval(() => {
        setSceneIdx((i) => (i + 1) % selectedReel.scenes.length)
      }, 2000)
    }
  }
  
  useEffect(() => () => { 
    clearInterval(sceneTimerRef.current)
    try { 
      if ('speechSynthesis' in window) window.speechSynthesis.cancel() 
    } catch (err) {
      console.error('Speech synthesis cleanup error:', err)
    }
  }, [])

  if (loading && reels.length === 0) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-zinc-600 text-lg">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">{t("reels.title")}</h1>
          <p className="opacity-80 mt-2">{t("reels.subtitle")}</p>
        </div>
        
        {/* Apple Card Carousel - Same format as Studio */}
        {reels.length > 0 && (
          <ReelCardsCarousel reels={reels} onOpen={handleReelOpen} />
        )}

        {loading && (
          <div className="mt-10 w-full flex justify-center">
            <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm max-w-2xl w-full">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-600">{t("common.loading")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Load more button */}
        {hasMore && reels.length > 0 && !loading && (
          <div className="mt-10 w-full flex justify-center">
            <button
              onClick={() => {
                const nextPage = page + 1
                setPage(nextPage)
                fetchReels(nextPage)
              }}
              className="px-6 py-3 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition"
            >
              {t("reels.loadMore")}
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Reel Player - Same as Studio */}
      {playerOpen && selectedReel && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="text-white text-sm">
              {selectedReelIndex + 1} / {reels.length}
            </div>
            <button onClick={() => { pausePlayback(); setPlayerOpen(false); }} className="px-3 py-1.5 rounded-full bg-white text-black text-sm">{t("common.close")}</button>
          </div>

          {/* Previous button */}
          {selectedReelIndex > 0 && (
            <button
              onClick={goToPreviousReel}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition backdrop-blur-sm"
              aria-label="Previous reel"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Next button */}
          {selectedReelIndex < reels.length - 1 && (
            <button
              onClick={goToNextReel}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition backdrop-blur-sm"
              aria-label="Next reel"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          <div className="w-full max-w-[420px] aspect-[9/16] bg-black rounded-2xl overflow-hidden relative">
            <img src={selectedReel.scenes?.[sceneIdx]?.imageUrl || selectedReel.scenes?.[0]?.imageUrl} alt="scene" className="w-full h-full object-cover" />
            
            {/* Clickable areas for navigation */}
            <div 
              className="absolute top-0 bottom-0 left-0 w-1/3 cursor-pointer"
              onClick={goToPreviousReel}
              title="Previous reel (← or swipe up)"
            />
            <div 
              className="absolute top-0 bottom-0 right-0 w-1/3 cursor-pointer"
              onClick={goToNextReel}
              title="Next reel (→ or swipe down)"
            />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-20">
              <div className="text-white text-sm mb-2">
                {t("reels.reel")} {selectedReelIndex + 1} {t("reels.of")} {reels.length} • {t("reels.scene")} {sceneIdx + 1} / {selectedReel.scenes?.length || 1} • {selectedReel.scenes?.[sceneIdx]?.duration || 0}s
              </div>
              <div className="text-white text-base font-medium line-clamp-3">{selectedReel.scenes?.[sceneIdx]?.text}</div>
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
    </div>
  )
}

