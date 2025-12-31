import React from 'react'
import PostComposer from '../PostComposer'

export default function PostCreate() {
  return (
    <div className="min-h-[70vh] w-full flex justify-center pt-16 pb-12">
      <div className="w-full max-w-2xl px-4">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900">Create Post</h1>
        <PostComposer onCreated={() => window.history.back()} />
      </div>
    </div>
  )
}


