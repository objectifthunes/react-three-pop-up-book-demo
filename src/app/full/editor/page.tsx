'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import '@objectifthunes/three-book/demo.css'

const App = dynamic(() => import('@/demo/react-three-pop-up-book/App'), {
  ssr: false,
  loading: () => <div className="loading-note">Loading the react-three-pop-up-book studio…</div>,
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

  return <App />
}
