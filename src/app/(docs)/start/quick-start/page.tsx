import Link from 'next/link'
import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'
import { LivePopUp } from '@/components/live/examples'

const e = findExport('/start/quick-start/')!

const INSTALL = `npm install @objectifthunes/react-three-pop-up-book \\
  @objectifthunes/react-three-book @objectifthunes/three-pop-up-book @objectifthunes/three-book \\
  three @react-three/fiber @react-three/drei`

const CODE = `import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Book, BookInteraction, Cover, Page,
  PopUpBook, PopUpScene, AutoTurnSettings, StapleBookBinding,
} from '@objectifthunes/react-three-pop-up-book'

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
      const scene = new PopUpScene({ pageWidth: 2, pageHeight: 3 })
      popUpBook.setScene(popUpBook.contentPageOffset, scene)        // first content page
      scene.addPopUp({ object: makeCube(), x: 0.8, z: 1.2 })        // any THREE.Object3D
      popUpBookRef.current = popUpBook
    }
    if (!opened.current && book.isIdle) {                           // auto-open past covers
      book.startAutoTurning(0, settings, popUpBookRef.current.frontCoverCount)
      opened.current = true
    }
    popUpBookRef.current.update(dt)                                 // positions + animates
  })
  return null
}

export default function App() {
  const bookRef = useRef(null)
  return (
    <Canvas camera={{ position: [0, 4, 6] }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 2]} />
      <Book ref={bookRef} binding={new StapleBookBinding()}>
        <BookInteraction />
        <Cover /><Cover /><Cover /><Cover />
        <Page color="#f5efe0" />
        <PopUps bookRef={bookRef} />
      </Book>
    </Canvas>
  )
}`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <LivePopUp />
      <Source code={INSTALL} lang="bash" />
      <PropTable
        label="THE MOVING PARTS"
        cols={['Step', 'Call', '', 'Why']}
        rows={[
          { name: 'Hold a ref', type: '<Book ref={bookRef}>', desc: 'The built ThreeBook is what the PopUpBook coordinates. Read it from the ref once book.isBuilt.' },
          { name: 'Create once', type: 'new PopUpBook({ book })', desc: 'Built lazily inside useFrame, guarded by a ref so it happens a single time.' },
          { name: 'Attach a scene', type: 'setScene(contentPageOffset, scene)', desc: 'contentPageOffset is the absolute index of the first content page, past the covers.' },
          { name: 'Add pop-ups', type: 'scene.addPopUp({ object, x, z })', desc: 'object is any THREE.Object3D — a primitive mesh or a loaded model.' },
          { name: 'Auto-open', type: 'startAutoTurning(0, settings, frontCoverCount)', desc: 'Turns past the front covers so the first content spread — and its pop-ups — comes into view.' },
          { name: 'Drive it', type: 'popUpBook.update(dt)', desc: 'Every frame: positions elements on the live page surface and advances the spring animation.' },
        ]}
      />
      <Source code={CODE} lang="tsx" />
      <Notes>
        <p>
          This is the same imperative pattern the <Link href="/composition/integration/">composition</Link> and the{' '}
          <Link href="/start/concepts/">core concepts</Link> use. You keep a <code>bookRef</code> on{' '}
          <code>&lt;Book&gt;</code>, and a child component builds the <code>PopUpBook</code> inside a{' '}
          <code>useFrame</code> once <code>book.isBuilt</code>, then calls <code>popUpBook.update(dt)</code>{' '}
          itself. Because the instance is created and used in the same frame, you never wait on a render to
          attach scenes.
        </p>
        <p>
          Prefer the hook surface? <Link href="/hooks/use-pop-up-book/">usePopUpBook</Link> wraps this loop for
          you, and the full wiring — declarative book plus scenes — is laid out under{' '}
          <Link href="/composition/integration/">Composing with &lt;Book&gt;</Link>.
        </p>
      </Notes>
    </ExportPage>
  )
}
