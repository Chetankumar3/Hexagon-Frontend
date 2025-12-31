import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppleCardsCarouselDemo } from '../ui/Applecards.jsx'
import ReelSection from './ReelSection.jsx'
import ReelsFeed from './ReelsFeed.jsx'

export default function Reels() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState('feed') // 'feed' or 'studio'

  return (
    <>
      {viewMode === 'feed' ? (
        <ReelsFeed />
      ) : (
    <div className="min-h-screen w-full bg-white flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end pt-12 pb-4">
          <button
            onClick={() => setViewMode('feed')}
            className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium"
          >
            {t("reels.viewFeed")}
          </button>
        </div>
        <ReelSection />
        <div className="mt-20 w-full flex justify-center">
          <AppleCardsCarouselDemo />
        </div>
      </div>
    </div>
      )}
      
      {viewMode === 'feed' && (
        <button
          onClick={() => setViewMode('studio')}
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full bg-white/90 text-black text-sm font-medium shadow-lg"
        >
          {t("common.studio")}
        </button>
      )}
    </>
  )
}


