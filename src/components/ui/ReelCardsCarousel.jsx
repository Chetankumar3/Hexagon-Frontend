import React, { useState, useEffect, useRef } from 'react'

const ReelCard = ({ reel, hovered, setHovered, index, onOpen }) => {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const scenes = Array.isArray(reel?.scenes) ? reel.scenes : []
  const cover = scenes[0]?.imageUrl || 'https://placehold.co/800x1400/111/EEE?text=Reel'

  useEffect(() => {
    if (scenes.length <= 1) return
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % scenes.length)
    }, 2000)
    return () => { clearInterval(timerRef.current) }
  }, [scenes.length])

  const current = scenes[active]?.imageUrl || cover

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={`rounded-3xl relative bg-gray-100 dark:bg-neutral-900 overflow-hidden transition-all duration-300 ease-out ${
        hovered !== null && hovered !== index ? 'blur-sm scale-[0.98]' : 'blur-none scale-100'
      }`}
      style={{ height: '600px', width: '384px', minWidth: '384px', cursor: 'pointer' }}
      onClick={() => onOpen && onOpen(reel)}
    >
      <img src={current} alt={reel.title} className="object-cover absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="text-sm font-medium text-white/70 mb-2">AI Reel</p>
        <p className="text-xl font-bold mb-2 line-clamp-2">{reel.title}</p>
        <p className="text-xs text-white/80">{scenes.length} scenes • {reel.totalDuration || 0}s</p>
      </div>
    </div>
  )
}

const Carousel = ({ items }) => {
  const carouselRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const check = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanLeft(scrollLeft > 0)
    setCanRight(scrollLeft < scrollWidth - clientWidth)
  }

  const scroll = (dx) => carouselRef.current?.scrollBy({ left: dx, behavior: 'smooth' })

  return (
    <div className="relative w-full">
      <div className={`absolute left-3 top-1/2 z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ transform: 'translateY(-50%)' }} onClick={() => scroll(-400)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className={`absolute right-3 top-1/2 z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-opacity ${canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ transform: 'translateY(-50%)' }} onClick={() => scroll(400)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="flex w-full overflow-x-scroll scrollbar-hide py-10 md:py-20 scroll-smooth" ref={carouselRef} onScroll={check} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="absolute right-0 top-0 bottom-0 h-full w-5 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-30"></div>
        <div className="flex flex-row justify-center gap-4 pl-4 pr-4 max-w-7xl mx-auto">
          {items}
        </div>
      </div>
    </div>
  )
}

export default function ReelCardsCarousel({ reels, onOpen }) {
  const [hovered, setHovered] = useState(null)
  const items = (Array.isArray(reels) ? reels : []).map((r, i) => (
    <div key={i} className="last:pr-[5%] md:last:pr-[33%] rounded-3xl">
      <ReelCard reel={r} hovered={hovered} setHovered={setHovered} index={i} onOpen={onOpen} />
    </div>
  ))
  return (
    <div className="w-full h-full py-10">
      <Carousel items={items} />
    </div>
  )
}


