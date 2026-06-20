import { Sparkles } from 'lucide-react'
import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'
import { LivePopUp } from '@/components/live/examples'

const e = findExport('/components/scene-updater/')!

const CODE = `import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Book, BookInteraction, PopUpBook, PopUpSceneUpdater } from '@objectifthunes/react-three-pop-up-book'

function Scene() {
  const bookRef = useRef(null)
  const [popUpBook, setPopUpBook] = useState<PopUpBook | null>(null)

  // You build the PopUpBook yourself, imperatively, once the book is ready.
  const handleBuilt = (book) => setPopUpBook(new PopUpBook({ book }))

  return (
    <Book ref={bookRef} binding={binding} onBuilt={handleBuilt}>
      <BookInteraction orbitControlsRef={orbit} />
      {/* …covers + pages… */}

      {/* Declarative replacement for your own useFrame: */}
      <PopUpSceneUpdater popUpBook={popUpBook} />
    </Book>
  )
}`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <LivePopUp />
      <Source code={CODE} lang="tsx" />
      <PropTable
        rows={[
          {
            name: 'popUpBook',
            type: 'PopUpBook | null',
            desc: 'The book to drive. Each frame the component calls popUpBook.update(delta); null is a no-op, so it is safe to render before the PopUpBook exists.',
          },
        ]}
      />
      <PropTable
        label="WHAT IT DOES"
        cols={['Effect', 'Detail', '', 'Notes']}
        rows={[
          { name: 'useFrame', type: '(_, delta) => popUpBook?.update(delta)', desc: 'Advances pop-up pop/collapse animations and re-positions every visible element onto the page surface, once per frame.' },
          { name: 'render', type: 'null', desc: 'Renders nothing — it is a behaviour-only component. Place it anywhere inside the <Canvas> (commonly as a child of <Book>).' },
        ]}
      />
      <Notes>
        <p>
          Reach for <code>PopUpSceneUpdater</code> when you manage the{' '}
          <code>PopUpBook</code> yourself — for example you created it imperatively in an{' '}
          <code>onBuilt</code> handler — and you want a declarative updater rather than writing your own{' '}
          <code>useFrame</code> that calls <code>popUpBook.update(delta)</code>. It is the smallest possible
          wrapper: one <code>useFrame</code>, returning <code>null</code>.
        </p>
        <p>
          Do <strong>not</strong> pair it with{' '}
          <a href="/hooks/use-pop-up-book/">usePopUpBook</a>. That hook already self-updates inside its own{' '}
          <code>useFrame</code>, so adding the updater on the same book would call <code>update(delta)</code>{' '}
          twice a frame and run pop-up animations at double speed. Use one or the other: the hook (self-driving)
          or your own <code>PopUpBook</code> + this updater.
        </p>
        <p>
          Order matters: <code>update(delta)</code> reads the book&apos;s paper transforms, so the book&apos;s
          own <code>update</code> must run first that frame. Inside a react-three-book{' '}
          <code>&lt;Book&gt;</code> the book updates itself, so dropping the updater under <code>&lt;Book&gt;</code>{' '}
          is enough.
        </p>
      </Notes>
    </ExportPage>
  )
}
