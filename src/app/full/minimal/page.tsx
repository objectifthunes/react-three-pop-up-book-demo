'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const Minimal = dynamic(() => import('@/demo/react-three-pop-up-book/Minimal'), {
  ssr: false,
  loading: () => <div className="loading-note">Loading a minimal pop-up book…</div>,
})

export default function Page() {
  useEffect(() => {
    const o = document.body.style.overflow
    const b = document.body.style.background
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#1a1a2e'
    return () => {
      document.body.style.overflow = o
      document.body.style.background = b
    }
  }, [])

  return <Minimal />
}
