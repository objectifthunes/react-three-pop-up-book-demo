import { Sparkles } from 'lucide-react'
import { ExportPage } from '@/components/ExportPage'
import { FullScreenPreview } from '@/components/Preview'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { findExport } from '@/components/exports'

const e = findExport('/live/minimal/')!

const CODE = `import { Book, BookInteraction, Cover, Page, PopUpBook, PopUpScene } from '@objectifthunes/react-three-pop-up-book'

// A child of <Book> that owns the PopUpBook and drives it each frame.
function PopUps({ bookRef }) {
  const { camera, gl } = useThree()
  const popUpBookRef = useRef(null)
  const opened = useRef(false)
  const settings = useMemo(() => new AutoTurnSettings(), [])

  useFrame((_, dt) => {
    const book = bookRef.current
    if (!book || !book.isBuilt) return
    if (!popUpBookRef.current) {
      const popUpBook = new PopUpBook({ book })
      popUpBook.bindInteraction({ camera, domElement: gl.domElement, bookInteraction: { enabled: true } })
      const scene = new PopUpScene({ pageWidth: 2, pageHeight: 3 })
      popUpBook.setScene(popUpBook.contentPageOffset, scene)
      scene.addPopUp({ object: makeShape('cube'),   x: 0.6, z: 1.0 })
      scene.addPopUp({ object: makeShape('cone'),   x: 1.3, z: 0.7, scale: 1.2 })
      scene.addPopUp({ object: makeShape('sphere'), x: 0.9, z: 2.0 })
      popUpBookRef.current = popUpBook
    }
    if (!opened.current && book.isIdle) {
      book.startAutoTurning(0, settings, popUpBookRef.current.frontCoverCount)
      opened.current = true
    }
    popUpBookRef.current.update(dt)                          // positions + animates every frame
  })
  return null
}

// inside the <Canvas>:
<Book ref={bookRef} binding={binding}>
  <BookInteraction orbitControlsRef={orbit} />
  <Cover /><Cover /><Cover /><Cover />
  {pages.map((_, i) => <Page key={i} color="#f5efe0" />)}
  <PopUps bookRef={bookRef} />
</Book>`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <FullScreenPreview href="/full/minimal/" illustration={<Sparkles size={40} strokeWidth={1.25} />} />
      <Source code={CODE} lang="tsx" />
      <Notes>
        <p>
          A child <code>&lt;PopUps&gt;</code> of <code>&lt;Book&gt;</code> reads the built book from a ref,
          creates a <code>PopUpBook</code> and one <code>PopUpScene</code>, adds three meshes, and calls{' '}
          <code>popUpBook.update(dt)</code> in a <code>useFrame</code> — the book auto-opens past its covers so
          the shapes rise into view.
        </p>
        <p>
          The hook-based equivalents — <a href="/hooks/use-pop-up-book/">usePopUpBook</a>,{' '}
          <a href="/hooks/use-pop-up-scene/">usePopUpScene</a> and{' '}
          <a href="/components/scene-updater/">PopUpSceneUpdater</a> — are documented under Hooks; this demo uses
          the imperative classes directly, exactly like the full editor.
        </p>
      </Notes>
    </ExportPage>
  )
}
