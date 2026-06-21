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
import { makeCastle, makeCottage, makeDragon, makePine, makeFlower, makeMushroom, makeHill, makeForest, makeRoundTree, makeSignpost, parchmentDataUrl, coverArtDataUrl, loadImage } from './storybook'

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
//
// Each pop-up element is a composed THREE.Group (a castle, a dragon, a stand of
// pines) from the storybook kit. addPopUp reads the group's bounding box and
// plants its base on the page, so a whole diorama rises as the page settles.

const STORYBOOK_COVER = '#5a3b8c'

/** Storybook paper: a bound cover + parchment endpapers/pages. Loading these as
 *  images also suppresses the library's auto "Page N" / cover labels (the label
 *  is only drawn on a surface that has no image). */
function useStorybookArt() {
  const [art, setArt] = useState<{ parchment: HTMLImageElement; cover: HTMLImageElement } | null>(null)
  useEffect(() => {
    let alive = true
    Promise.all([loadImage(parchmentDataUrl()), loadImage(coverArtDataUrl('A Pop-Up Tale', STORYBOOK_COVER))])
      .then(([parchment, cover]) => { if (alive) setArt({ parchment, cover }) })
    return () => { alive = false }
  }, [])
  return art
}

type Art = { parchment: HTMLImageElement; cover: HTMLImageElement }
// Covers: front-outer art, parchment endpaper, parchment endpaper, back-outer art.
function storyCovers(art: Art) {
  return [art.cover, art.parchment, art.parchment, art.cover].map((image, i) => (
    <Cover key={`c${i}`} color={STORYBOOK_COVER} image={image} fitMode="cover" fullBleed />
  ))
}
function storyPages(art: Art, count = 8) {
  return Array.from({ length: count }).map((_, i) => (
    <Page key={`p${i}`} color={PAGE_COLOR} image={art.parchment} fitMode="cover" fullBleed />
  ))
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

function BookCanvas({ children, hint }: { children: ReactNode; hint: string }) {
  const orbit = useRef<{ enabled: boolean } | null>(null)
  const binding = useMemo(() => new StapleBookBinding(), [])
  const art = useStorybookArt()
  return (
    <LiveR3FStage tall hint={hint}>
      <OrbitControls ref={orbit as never} makeDefault enableDamping dampingFactor={0.05} enablePan={false} minDistance={2.5} maxDistance={12} target={[0, 0, 0]} />
      {art && (
        <Book binding={binding} initialOpenProgress={0} castShadows pagePaperSetup={pagePaperSetup()} coverPaperSetup={coverPaperSetup()}>
          <BookInteraction orbitControlsRef={orbit} />
          {storyCovers(art)}
          {storyPages(art, 8)}
          {children}
        </Book>
      )}
    </LiveR3FStage>
  )
}

/** A whole kingdom rises off the page — via usePopUpBook + usePopUpScene. */
export function LivePopUp() {
  return (
    <BookCanvas hint="A whole diorama rises as the page settles — drag the page to fold the kingdom away">
      <PopUpsHooks setup={(scene) => {
        scene.addPopUp({ object: makeHill(0.62), x: 1.0, z: 1.15, scale: 1.1 })
        scene.addPopUp({ object: makeCastle(), x: 1.0, z: 1.15, scale: 0.92 })
        scene.addPopUp({ object: makePine(0.95), x: 0.35, z: 0.7 })
        scene.addPopUp({ object: makePine(0.8), x: 1.66, z: 0.8 })
        scene.addPopUp({ object: makePine(1.05), x: 0.45, z: 2.0 })
        scene.addPopUp({ object: makeCottage(), x: 1.55, z: 1.95, scale: 0.9, rotation: -0.5 })
        scene.addPopUp({ object: makeDragon(), x: 1.45, z: 1.5, scale: 0.7, rotation: -0.9 })
        scene.addPopUp({ object: makeFlower(), x: 0.8, z: 2.5, scale: 0.9 })
        scene.addPopUp({ object: makeMushroom(), x: 1.1, z: 2.55 })
      }} />
    </BookCanvas>
  )
}

/** Any THREE.Object3D works — here every pop-up is a composed multi-mesh group. */
export function LivePopUpObjects() {
  return (
    <BookCanvas hint="addPopUp({ object }) accepts any THREE.Object3D — a loaded GLTF or, here, composed groups">
      <PopUpsHooks setup={(scene) => {
        scene.addPopUp({ object: makeForest(), x: 0.6, z: 1.0, scale: 1.0 })
        scene.addPopUp({ object: makeRoundTree(1.0), x: 1.4, z: 0.8 })
        scene.addPopUp({ object: makeDragon(), x: 1.2, z: 1.9, scale: 0.8, rotation: 0.5 })
        scene.addPopUp({ object: makeMushroom(), x: 0.5, z: 2.4 })
        scene.addPopUp({ object: makeFlower(0xe88bb0), x: 1.6, z: 2.3, scale: 0.9 })
      }} />
    </BookCanvas>
  )
}

/** Pop-ups driven by <PopUpSceneUpdater> with an imperatively-created PopUpBook. */
export function LiveSceneUpdater() {
  const bookRef = useRef<ThreeBook | null>(null)
  const orbit = useRef<{ enabled: boolean } | null>(null)
  const binding = useMemo(() => new StapleBookBinding(), [])
  const art = useStorybookArt()
  return (
    <LiveR3FStage tall hint="<PopUpSceneUpdater popUpBook={…} /> drives the per-frame animation loop">
      <OrbitControls ref={orbit as never} makeDefault enableDamping dampingFactor={0.05} enablePan={false} minDistance={2.5} maxDistance={12} target={[0, 0, 0]} />
      {art && (
        <Book ref={bookRef} binding={binding} initialOpenProgress={0} castShadows pagePaperSetup={pagePaperSetup()} coverPaperSetup={coverPaperSetup()}>
          <BookInteraction orbitControlsRef={orbit} />
          {storyCovers(art)}
          {storyPages(art, 8)}
        </Book>
      )}
      {art && <PopUpsUpdater bookRef={bookRef} setup={(scene) => {
        scene.addPopUp({ object: makeHill(0.5), x: 1.0, z: 1.3, scale: 1.0 })
        scene.addPopUp({ object: makeCastle(), x: 1.0, z: 1.3, scale: 0.85 })
        scene.addPopUp({ object: makePine(0.9), x: 0.4, z: 0.8 })
        scene.addPopUp({ object: makeCottage(), x: 1.5, z: 2.1, scale: 0.85, rotation: -0.4 })
      }} />}
    </LiveR3FStage>
  )
}
