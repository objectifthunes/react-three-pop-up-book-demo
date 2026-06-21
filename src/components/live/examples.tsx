'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import {
  Book,
  BookInteraction,
  StapleBookBinding,
  Cover,
  Page,
  Spread,
  Text,
  AutoTurnSettings,
  AutoTurnDirection,
  PopUpBook,
  PopUpScene,
  usePopUpBook,
  usePopUpScene,
  PopUpSceneUpdater,
  type ThreeBook,
} from '@objectifthunes/react-three-pop-up-book'
import { LiveR3FStage } from './LiveR3FStage'
import { LiveRow, LiveButton, LiveSlider, LiveToggle, LiveReadout } from './controls'

const PAGE_COLOR = '#f5efe0'
const COVER_COLOR = '#7b3f00'

function pagePaperSetup() {
  return { width: 2, height: 3, thickness: 0.02, stiffness: 0.2, color: new THREE.Color(1, 1, 1), material: null as THREE.Material | null }
}
function coverPaperSetup() {
  return { width: 2.1, height: 3.1, thickness: 0.04, stiffness: 0.5, color: new THREE.Color(1, 1, 1), material: null as THREE.Material | null }
}

/** Lights, ground (from the stage) + OrbitControls + <Book> opened to its first page. */
function BookFrame({ bookRef, onReady, openToPage = 1, children }: {
  bookRef: React.RefObject<ThreeBook | null>
  onReady?: (book: ThreeBook) => void
  openToPage?: number
  children: ReactNode
}) {
  const orbit = useRef<{ enabled: boolean } | null>(null)
  const binding = useMemo(() => new StapleBookBinding(), [])
  const handleBuilt = useCallback((book: ThreeBook) => {
    try { book.setOpenProgressByIndex(book.coverPaperCount + openToPage) } catch { /* noop */ }
    onReady?.(book)
  }, [onReady, openToPage])
  return (
    <>
      <OrbitControls ref={orbit as never} makeDefault enableDamping dampingFactor={0.05} enablePan={false} minDistance={2.5} maxDistance={12} target={[0, 0, 0]} />
      <Book
        ref={bookRef}
        binding={binding}
        initialOpenProgress={0}
        castShadows
        pagePaperSetup={pagePaperSetup()}
        coverPaperSetup={coverPaperSetup()}
        onBuilt={handleBuilt}
      >
        <BookInteraction orbitControlsRef={orbit} />
        {children}
      </Book>
    </>
  )
}

// Return arrays of Cover/Page elements — React flattens arrays into direct
// children of <Book>, which is how the declarative content collector finds them.
function coverEls() {
  return [0, 1, 2, 3].map((i) => <Cover key={`c${i}`} color={COVER_COLOR} />)
}

function pageEls(count = 8, from = 1) {
  return Array.from({ length: count }).map((_, i) => (
    <Page key={`p${from + i}`} color={PAGE_COLOR} />
  ))
}

/** A draggable book, opened to page 1. */
export function LiveBook({ pageCount = 8, hint = 'Drag a page to turn it · drag the background to orbit' }: { pageCount?: number; hint?: string }) {
  const bookRef = useRef<ThreeBook | null>(null)
  return (
    <LiveR3FStage hint={hint}>
      <BookFrame bookRef={bookRef}>{coverEls()}{pageEls(pageCount)}</BookFrame>
    </LiveR3FStage>
  )
}

/** Programmatic page turns via book.startAutoTurning(). */
export function LiveAutoTurn() {
  const bookRef = useRef<ThreeBook | null>(null)
  const settings = useMemo(() => new AutoTurnSettings(), [])
  const turn = (dir: AutoTurnDirection, count = 1) => bookRef.current?.startAutoTurning(dir, settings, count)
  return (
    <LiveR3FStage
      hint="Each button drives the book — turnNext / turnPrev / turnAll under the hood"
      controls={
        <LiveRow>
          <LiveButton onClick={() => turn(AutoTurnDirection.Next, 1)}>Next ▸</LiveButton>
          <LiveButton onClick={() => turn(AutoTurnDirection.Back, 1)}>◂ Prev</LiveButton>
          <LiveButton onClick={() => turn(AutoTurnDirection.Next, 99)}>Flip to end</LiveButton>
          <LiveButton onClick={() => turn(AutoTurnDirection.Back, 99)}>Back to start</LiveButton>
        </LiveRow>
      }
    >
      <BookFrame bookRef={bookRef}>{coverEls()}{pageEls(10)}</BookFrame>
    </LiveR3FStage>
  )
}

/** Imperative open-progress via book.setOpenProgress(t). */
export function LiveControls() {
  const bookRef = useRef<ThreeBook | null>(null)
  const [v, setV] = useState(0)
  const onChange = (val: number) => { setV(val); bookRef.current?.setOpenProgress(val) }
  return (
    <LiveR3FStage
      hint="The slider calls book.setOpenProgress(t) — 0 closed, 1 fully open"
      controls={<LiveSlider label="openProgress" min={0} max={1} step={0.01} value={v} onChange={onChange} format={(x) => x.toFixed(2)} />}
    >
      <BookFrame bookRef={bookRef} openToPage={-1}>{coverEls()}{pageEls(8)}</BookFrame>
    </LiveR3FStage>
  )
}

/** Reactive state read off the live book each frame. */
export function LiveState() {
  const bookRef = useRef<ThreeBook | null>(null)
  const [s, setS] = useState({ turning: false, falling: false, idle: true, progress: 0, papers: 0 })
  useEffect(() => {
    const id = setInterval(() => {
      const b = bookRef.current
      if (b) setS({ turning: b.isTurning, falling: b.isFalling, idle: b.isIdle, progress: b.openProgress, papers: b.paperCount })
    }, 100)
    return () => clearInterval(id)
  }, [])
  return (
    <LiveR3FStage
      hint="Drag a page — these read off the book every frame (useBookState in the source)"
      controls={
        <LiveRow>
          <LiveReadout label="isTurning" value={String(s.turning)} />
          <LiveReadout label="isFalling" value={String(s.falling)} />
          <LiveReadout label="isIdle" value={String(s.idle)} />
          <LiveReadout label="openProgress" value={s.progress.toFixed(2)} />
          <LiveReadout label="paperCount" value={s.papers} />
        </LiveRow>
      }
    >
      <BookFrame bookRef={bookRef}>{coverEls()}{pageEls(8)}</BookFrame>
    </LiveR3FStage>
  )
}

/** Declarative content: the whole book is Cover / Page JSX. */
export function LiveDeclarative() {
  const bookRef = useRef<ThreeBook | null>(null)
  return (
    <LiveR3FStage hint="Every surface is JSX — <Cover>, <Page>, <Spread> and <Text> children of <Book>">
      <BookFrame bookRef={bookRef}>
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        {pageEls(8)}
      </BookFrame>
    </LiveR3FStage>
  )
}

/** Pages carry styled text (the page labels are <Text> rendered by the library). */
export function LiveText() {
  const bookRef = useRef<ThreeBook | null>(null)
  return (
    <LiveR3FStage hint="Each page here carries a <Text> block — drag to leaf through them">
      <BookFrame bookRef={bookRef}>{coverEls()}{pageEls(8)}</BookFrame>
    </LiveR3FStage>
  )
}

function usePatternImage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = 700; c.height = 500
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 700, 500)
    g.addColorStop(0, '#1e3a8a'); g.addColorStop(0.5, '#9333ea'); g.addColorStop(1, '#db2777')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 700, 500)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 90px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('PHOTO', 350, 250)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = c.toDataURL('image/png')
  }, [])
  return img
}

/** An image on a page with the three fit modes. */
export function LiveTextures() {
  const bookRef = useRef<ThreeBook | null>(null)
  const img = usePatternImage()
  const [fit, setFit] = useState<'contain' | 'cover' | 'fill'>('cover')
  const [fullBleed, setFullBleed] = useState(true)
  return (
    <LiveR3FStage
      hint="<Page image={img} fitMode=… fullBleed> draws an image with the chosen fit"
      controls={
        <LiveRow>
          {(['contain', 'cover', 'fill'] as const).map((f) => (
            <LiveButton key={f} active={fit === f} onClick={() => setFit(f)}>{f}</LiveButton>
          ))}
          <LiveToggle label="fullBleed" checked={fullBleed} onChange={setFullBleed} />
        </LiveRow>
      }
    >
      <BookFrame bookRef={bookRef} key={`${fit}-${fullBleed}-${img ? 1 : 0}`}>
        {coverEls()}
        <Page color={PAGE_COLOR} />
        <Page color={PAGE_COLOR} image={img ?? undefined} fitMode={fit} fullBleed={fullBleed} />
        {pageEls(6)}
      </BookFrame>
    </LiveR3FStage>
  )
}

// ── Pop-up examples ─────────────────────────────────────────────────────────

const SHAPE_PALETTE = [0xff5a5f, 0x4cc38a, 0x5b8def, 0xf2c14e, 0xa66cff, 0xff9f43]
type ShapeKind = 'cube' | 'cone' | 'sphere' | 'cylinder' | 'star'

function makeShape(kind: ShapeKind, color: number): THREE.Object3D {
  let geo: THREE.BufferGeometry
  if (kind === 'cube') geo = new THREE.BoxGeometry(0.35, 0.35, 0.35)
  else if (kind === 'cone') geo = new THREE.ConeGeometry(0.22, 0.5, 24)
  else if (kind === 'sphere') geo = new THREE.SphereGeometry(0.22, 24, 16)
  else if (kind === 'cylinder') geo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24)
  else {
    const shape = new THREE.Shape()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.26 : 0.12
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2
      const x = Math.cos(a) * r, y = Math.sin(a) * r
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y)
    }
    geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false })
    geo.rotateX(-Math.PI / 2)
  }
  // Hand the library any object — addPopUp plants it on the page by its base.
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }))
  mesh.castShadow = true
  return mesh
}

type PopUpSetup = (scene: PopUpScene) => void

const settingsSingleton = new AutoTurnSettings()

/**
 * Hook-driven pop-ups. A child of <Book>, so usePopUpBook() reads the book from
 * context. usePopUpBook returns null until the PopUpBook surfaces (it's created
 * in the hook's own useFrame once the book builds), so we nudge a re-render until
 * it's available, then attach a usePopUpScene. The hook drives update() itself —
 * no PopUpSceneUpdater needed.
 */
function PopUpsHooks({ setup }: { setup: PopUpSetup }) {
  const { camera, gl } = useThree()
  const popUpBook = usePopUpBook()
  const scene = usePopUpScene({ pageWidth: 2, pageHeight: 3 })
  const setupRef = useRef(setup); setupRef.current = setup
  const opened = useRef(false)
  const [, force] = useState(0)

  // Surface the PopUpBook (null until a re-render after the book builds).
  useFrame(() => { if (!popUpBook) force((n) => (n + 1) & 1023) })

  useEffect(() => {
    if (!popUpBook) return
    popUpBook.bindInteraction({ camera, domElement: gl.domElement, bookInteraction: { enabled: true } })
    popUpBook.setScene(popUpBook.contentPageOffset, scene)
    setupRef.current(scene)
  }, [popUpBook, scene, camera, gl])

  // Auto-open past the covers so the pop-ups rise into view.
  useFrame(() => {
    const book = popUpBook?.book
    if (popUpBook && book && !opened.current && book.isBuilt && book.isIdle) {
      book.startAutoTurning(AutoTurnDirection.Next, settingsSingleton, popUpBook.frontCoverCount)
      opened.current = true
    }
  })
  return null
}

/**
 * Imperative PopUpBook + <PopUpSceneUpdater> driving the loop — for the
 * scene-updater page. A sibling of <Book>; reads the book from a ref.
 */
function PopUpsUpdater({ bookRef, setup }: { bookRef: React.RefObject<ThreeBook | null>; setup: PopUpSetup }) {
  const { camera, gl } = useThree()
  const [pub, setPub] = useState<PopUpBook | null>(null)
  const setupRef = useRef(setup); setupRef.current = setup
  const opened = useRef(false)
  useFrame(() => {
    const book = bookRef.current
    if (!book || !book.isBuilt) return
    if (!pub) {
      const p = new PopUpBook({ book })
      p.bindInteraction({ camera, domElement: gl.domElement, bookInteraction: { enabled: true } })
      const scene = new PopUpScene({ pageWidth: 2, pageHeight: 3 })
      p.setScene(p.contentPageOffset, scene)
      setupRef.current(scene)
      setPub(p)
    } else if (!opened.current && book.isIdle) {
      book.startAutoTurning(AutoTurnDirection.Next, settingsSingleton, pub.frontCoverCount)
      opened.current = true
    }
  })
  useEffect(() => () => { pub?.dispose() }, [pub])
  return <PopUpSceneUpdater popUpBook={pub} />
}

function BookCanvas({ children, hint, sibling }: { children: ReactNode; hint: string; sibling?: ReactNode }) {
  const orbit = useRef<{ enabled: boolean } | null>(null)
  const binding = useMemo(() => new StapleBookBinding(), [])
  return (
    <LiveR3FStage tall hint={hint}>
      <OrbitControls ref={orbit as never} makeDefault enableDamping dampingFactor={0.05} enablePan={false} minDistance={2.5} maxDistance={12} target={[0, 0, 0]} />
      <Book binding={binding} initialOpenProgress={0} castShadows pagePaperSetup={pagePaperSetup()} coverPaperSetup={coverPaperSetup()}>
        <BookInteraction orbitControlsRef={orbit} />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        {pageEls(8)}
        {children}
      </Book>
      {sibling}
    </LiveR3FStage>
  )
}

/** Shapes that rise off the first content page — via usePopUpBook + usePopUpScene. */
export function LivePopUp() {
  return (
    <BookCanvas hint="Shapes rise off the page as it settles — drag the page to fold them away">
      <PopUpsHooks setup={(scene) => {
        scene.addPopUp({ object: makeShape('cube', SHAPE_PALETTE[0]), x: 0.5, z: 1.0 })
        scene.addPopUp({ object: makeShape('cone', SHAPE_PALETTE[1]), x: 1.3, z: 0.7, scale: 1.2 })
        scene.addPopUp({ object: makeShape('sphere', SHAPE_PALETTE[2]), x: 0.9, z: 2.0 })
      }} />
    </BookCanvas>
  )
}

/** Any THREE.Object3D works as a pop-up — a mix of primitives. */
export function LivePopUpObjects() {
  return (
    <BookCanvas hint="addPopUp({ object }) accepts any THREE.Object3D — primitives or a loaded GLTF">
      <PopUpsHooks setup={(scene) => {
        scene.addPopUp({ object: makeShape('star', SHAPE_PALETTE[3]), x: 0.6, z: 1.0, scale: 1.2 })
        scene.addPopUp({ object: makeShape('cylinder', SHAPE_PALETTE[4]), x: 1.2, z: 0.7 })
        scene.addPopUp({ object: makeShape('cube', SHAPE_PALETTE[5]), x: 1.0, z: 1.8, rotation: 0.6 })
      }} />
    </BookCanvas>
  )
}

/** Pop-ups driven by <PopUpSceneUpdater> with an imperatively-created PopUpBook. */
export function LiveSceneUpdater() {
  const bookRef = useRef<ThreeBook | null>(null)
  const orbit = useRef<{ enabled: boolean } | null>(null)
  const binding = useMemo(() => new StapleBookBinding(), [])
  return (
    <LiveR3FStage tall hint="<PopUpSceneUpdater popUpBook={…} /> drives the per-frame animation loop">
      <OrbitControls ref={orbit as never} makeDefault enableDamping dampingFactor={0.05} enablePan={false} minDistance={2.5} maxDistance={12} target={[0, 0, 0]} />
      <Book ref={bookRef} binding={binding} initialOpenProgress={0} castShadows pagePaperSetup={pagePaperSetup()} coverPaperSetup={coverPaperSetup()}>
        <BookInteraction orbitControlsRef={orbit} />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        <Cover color="#1f3a5f" />
        {pageEls(8)}
      </Book>
      <PopUpsUpdater bookRef={bookRef} setup={(scene) => {
        scene.addPopUp({ object: makeShape('cone', SHAPE_PALETTE[1]), x: 0.7, z: 1.0, scale: 1.3 })
        scene.addPopUp({ object: makeShape('cube', SHAPE_PALETTE[0]), x: 1.4, z: 0.8 })
        scene.addPopUp({ object: makeShape('sphere', SHAPE_PALETTE[2]), x: 1.0, z: 2.0 })
      }} />
    </LiveR3FStage>
  )
}
