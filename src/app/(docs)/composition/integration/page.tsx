import { Sparkles } from 'lucide-react'
import { ExportPage } from '@/components/ExportPage'
import { FullScreenPreview } from '@/components/Preview'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'

const e = findExport('/composition/integration/')!

const CODE = `import { useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import {
  Book, BookInteraction, Cover, Page,
  PopUpBook, PopUpScene, AutoTurnSettings,
} from '@objectifthunes/react-three-pop-up-book'

// A child of <Book>. It reads the built book from a ref and owns the PopUpBook.
function PopUps({ bookRef }) {
  const { camera, gl } = useThree()
  const popUpBookRef = useRef(null)
  const opened = useRef(false)
  const settings = useMemo(() => new AutoTurnSettings(), [])

  useFrame((_, dt) => {
    const book = bookRef.current
    if (!book || !book.isBuilt) return            // wait for geometry

    if (!popUpBookRef.current) {                  // first built frame: create once
      const popUpBook = new PopUpBook({ book })
      popUpBook.bindInteraction({
        camera, domElement: gl.domElement,
        bookInteraction: { enabled: true },       // turning is paused while over a pop-up
      })
      const scene = new PopUpScene({ pageWidth: 2, pageHeight: 3 })
      popUpBook.setScene(popUpBook.contentPageOffset, scene)   // first content page
      scene.addPopUp({ object: makeShape('cube'),   x: 0.6, z: 1.0 })
      scene.addPopUp({ object: makeShape('tree'),   x: 1.5, z: 0.7, scale: 1.3 })
      popUpBookRef.current = popUpBook
    }

    if (!opened.current && book.isIdle) {         // auto-open past the covers
      book.startAutoTurning(0, settings, popUpBookRef.current.frontCoverCount)
      opened.current = true
    }

    popUpBookRef.current.update(dt)               // positions + animates every frame
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
      <Source code={CODE} lang="tsx" />
      <PropTable
        label="THE WIRING, STEP BY STEP"
        cols={['Step', 'Call', '', 'Why']}
        rows={[
          { name: 'bookRef on <Book>', type: 'ref={bookRef}', desc: 'A <PopUps> child reads the live ThreeBook from the ref once it has been built.' },
          { name: 'create on first built frame', type: 'new PopUpBook({ book })', desc: 'Guarded by book.isBuilt and a ref so the PopUpBook is constructed exactly once.' },
          { name: 'bindInteraction', type: '{ camera, domElement: gl.domElement, bookInteraction }', desc: 'Raycasts pointer events; disables page turning (bookInteraction.enabled) while hovering a pop-up.' },
          { name: 'setScene', type: '(contentPageOffset, scene)', desc: 'Attaches a PopUpScene to a page side. contentPageOffset skips the front covers.' },
          { name: 'addPopUp', type: '({ object, x, z, scale? })', desc: 'Adds any THREE.Object3D as a pop-up on that page. See Objects & models.' },
          { name: 'auto-open', type: 'book.startAutoTurning(0, settings, frontCoverCount)', desc: 'Turns past the covers once the book is idle, so the first content page rises into view.' },
          { name: 'update(dt)', type: 'every frame', desc: 'Positions elements on the page surface and advances pop/collapse animations.' },
        ]}
      />
      <Notes>
        <p>
          This mirrors the library&apos;s own <code>BookScene</code>. The <strong>declarative</strong>{' '}
          <code>&lt;Book&gt;</code> from react-three-book owns the papers, covers and turn simulation; an{' '}
          <strong>imperative</strong> <code>PopUpBook</code> rides alongside it, created from the built book and
          driven each frame.
        </p>
        <p>
          Why imperative here rather than the hook?{' '}
          <a href="/hooks/use-pop-up-book/">usePopUpBook</a> returns <code>ref.current</code>, which is{' '}
          <code>null</code> on the render that first builds the book — the <code>PopUpBook</code> is created
          inside <code>useFrame</code>, after render. So you cannot synchronously call{' '}
          <code>setScene</code> / <code>addPopUp</code> / <code>bindInteraction</code> on the hook&apos;s return
          value the moment the book is ready. When you need that imperative control — wiring interaction, adding
          objects on the built frame, reacting to <code>onBuilt</code> — hold your own{' '}
          <code>PopUpBook</code> in a ref, as above. The hook is the right tool for the simpler case where you
          only need it to exist and self-update.
        </p>
        <p>
          New to this? Start with the{' '}
          <a href="/start/quick-start/">Quick start</a>. The classes used here —{' '}
          <code>PopUpBook</code>, <code>PopUpScene</code> — are summarised under{' '}
          <a href="/reference/classes/">Re-exported classes</a>, and the full studio is the{' '}
          <a href="/full/editor/">interactive editor</a>.
        </p>
      </Notes>
      <FullScreenPreview href="/full/editor/" illustration={<Sparkles size={40} strokeWidth={1.25} />} />
    </ExportPage>
  )
}
