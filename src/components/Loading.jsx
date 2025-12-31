import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100" />
          <div className="absolute inset-0 animate-spin-slow rounded-full border-[6px] border-transparent border-t-zinc-900 border-r-zinc-300" />
          <div className="absolute -inset-4 blur-2xl opacity-50 bg-[radial-gradient(closest-side,rgba(0,0,0,0.06),transparent)]" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-zinc-900">Loading</h2>
        <p className="mt-1 text-sm text-zinc-600">Getting things ready for you…</p>

        <div className="mt-8 grid gap-3 text-left">
          <SkeletonRow />
          <SkeletonRow width="w-5/6" />
          <SkeletonRow width="w-3/4" />
        </div>
      </div>
    </div>
  )
}

function SkeletonRow({ width = 'w-full' }) {
  return (
    <div className={`h-3 ${width} rounded-full bg-zinc-200 overflow-hidden`}>
      <div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-zinc-300/70 to-transparent" />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm font-medium text-zinc-800">Please wait…</span>
      </div>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="relative h-6 w-6">
      <div className="absolute inset-0 rounded-full border-2 border-zinc-300" />
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-zinc-900" />
    </div>
  )
}

// Tailwind keyframes via utility classes
// Add in global styles: index.css

