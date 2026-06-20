'use client'

import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Eye } from 'lucide-react'
import { Eyebrow } from '../Eyebrow'

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
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.7, 4.4], fov: 45 }} gl={{ antialias: true }}>
            <color attach="background" args={[0x14141f]} />
            <ambientLight intensity={0.9} />
            <hemisphereLight args={[0xffffff, 0x404050, 0.6]} />
            <directionalLight intensity={1.15} position={[3, 10, 6]} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <directionalLight intensity={0.5} position={[-5, 6, -2]} />
            <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow>
              <planeGeometry args={[40, 40]} />
              <meshStandardMaterial color={0x20202e} />
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
