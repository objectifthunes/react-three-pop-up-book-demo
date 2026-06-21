'use client'

import { useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Eye } from 'lucide-react'
import { Eyebrow } from '../Eyebrow'

/** A warm dusk sky — vertical gradient from deep indigo to a peach horizon. */
function DuskSky() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 8; c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#221a3a'); g.addColorStop(0.55, '#5b3f63'); g.addColorStop(0.82, '#c9706a'); g.addColorStop(1, '#f0a574')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return <primitive object={tex} attach="background" />
}

/** A framed, in-page React Three Fiber canvas with scene chrome + optional controls. */
export function LiveR3FStage({ children, controls, hint, tall }: {
  children: ReactNode
  controls?: ReactNode
  hint?: string
  tall?: boolean
}) {
  return (
    <div className="export-block">
      <Eyebrow icon={<Eye size={12} strokeWidth={1.75} />}>LIVE</Eyebrow>
      <div className="live">
        <div className={`live__stage${tall ? ' live__stage--tall' : ''}`}>
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.7, 4.4], fov: 45 }} gl={{ antialias: true, toneMappingExposure: 1.05 }}>
            <DuskSky />
            <fog attach="fog" args={[0x6a4a5e, 9, 22]} />
            {/* Dusk lighting: warm sky / cool ground bounce, a low golden key, cool indigo rim. */}
            <hemisphereLight args={[0xffd9b0, 0x2b2440, 0.7]} />
            <ambientLight intensity={0.25} />
            <directionalLight
              intensity={2.1}
              color={0xffd9a0}
              position={[5, 7, 4]}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0004}
            />
            <directionalLight intensity={0.6} color={0x6f7bd6} position={[-6, 4, -5]} />
            <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow>
              <planeGeometry args={[60, 60]} />
              <meshStandardMaterial color={0x2a2336} roughness={1} />
            </mesh>
            {children}
          </Canvas>
        </div>
        {hint ? <p className="live__hint">{hint}</p> : null}
        {controls ? <div className="live__controls">{controls}</div> : null}
      </div>
    </div>
  )
}
