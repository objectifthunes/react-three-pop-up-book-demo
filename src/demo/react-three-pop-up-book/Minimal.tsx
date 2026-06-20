'use client'

/** The smallest react-three-pop-up-book setup. */

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  Book,
  BookInteraction,
  StapleBookBinding,
  Cover,
  Page,
  AutoTurnSettings,
  PopUpBook,
  PopUpScene,
  type ThreeBook,
} from '@objectifthunes/react-three-pop-up-book'

const PALETTE = [0xff5a5f, 0x4cc38a, 0x5b8def]

function makeShape(kind: 'cube' | 'cone' | 'sphere', color: number): THREE.Mesh {
  const geo =
    kind === 'cube' ? new THREE.BoxGeometry(0.35, 0.35, 0.35)
      : kind === 'cone' ? new THREE.ConeGeometry(0.22, 0.5, 24)
        : new THREE.SphereGeometry(0.22, 24, 16)
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }))
  mesh.castShadow = true
  mesh.position.y = 0.22
  return mesh
}

function PopUps({ bookRef, orbitRef }: {
  bookRef: React.RefObject<ThreeBook | null>
  orbitRef: React.RefObject<{ enabled: boolean } | null>
}) {
  const { camera, gl } = useThree()
  const popUpBookRef = useRef<PopUpBook | null>(null)
  const guard = useRef({ enabled: true })
  const opened = useRef(false)
  const settings = useMemo(() => new AutoTurnSettings(), [])

  useFrame((_, delta) => {
    const book = bookRef.current
    if (!book || !book.isBuilt) return

    if (!popUpBookRef.current) {
      const popUpBook = new PopUpBook({ book })
      popUpBook.bindInteraction({ camera, domElement: gl.domElement, bookInteraction: guard.current })
      popUpBook.onPopUpEnter = () => { if (orbitRef.current) orbitRef.current.enabled = false }
      popUpBook.onPopUpLeave = () => { if (orbitRef.current) orbitRef.current.enabled = true }
      const scene = new PopUpScene({ pageWidth: 2, pageHeight: 3 })
      popUpBook.setScene(popUpBook.contentPageOffset, scene)
      scene.addPopUp({ object: makeShape('cube', PALETTE[0]), x: 0.6, z: 1.0 })
      scene.addPopUp({ object: makeShape('cone', PALETTE[1]), x: 1.3, z: 0.7, scale: 1.2 })
      scene.addPopUp({ object: makeShape('sphere', PALETTE[2]), x: 0.9, z: 2.0 })
      popUpBookRef.current = popUpBook
    }

    if (!opened.current && book.isIdle) {
      book.startAutoTurning(0, settings, popUpBookRef.current.frontCoverCount)
      opened.current = true
    }

    popUpBookRef.current.update(delta)
  })

  useEffect(() => () => { popUpBookRef.current?.dispose(); popUpBookRef.current = null }, [])
  return null
}

export default function Minimal() {
  const orbitRef = useRef<{ enabled: boolean } | null>(null)
  const bookRef = useRef<ThreeBook | null>(null)
  const binding = useMemo(() => new StapleBookBinding(), [])

  return (
    <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }} style={{ position: 'fixed', inset: 0 }} gl={{ antialias: true }}>
      <color attach="background" args={[0x1a1a2e]} />
      <ambientLight intensity={0.8} />
      <directionalLight intensity={1.2} position={[5, 10, 5]} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={0x2a2a4a} />
      </mesh>
      <OrbitControls ref={orbitRef as never} enableDamping dampingFactor={0.05} target={[0, 0.5, 0]} />

      <Book
        ref={bookRef}
        binding={binding}
        initialOpenProgress={0}
        castShadows
        pagePaperSetup={{ width: 2, height: 3, thickness: 0.02, stiffness: 0.2, color: new THREE.Color(1, 1, 1), material: null }}
        coverPaperSetup={{ width: 2.1, height: 3.1, thickness: 0.04, stiffness: 0.5, color: new THREE.Color(1, 1, 1), material: null }}
      >
        <BookInteraction orbitControlsRef={orbitRef} />
        <Cover color="#3a6ea5" />
        <Cover color="#3a6ea5" />
        <Cover color="#3a6ea5" />
        <Cover color="#3a6ea5" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Page key={i} color="#f5efe0" />
        ))}
        <PopUps bookRef={bookRef} orbitRef={orbitRef} />
      </Book>
    </Canvas>
  )
}
