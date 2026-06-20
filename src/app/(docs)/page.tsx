import Link from 'next/link'
import { ArrowDownToLine, Code2, PlayCircle, Sparkles } from 'lucide-react'
import { CodeBlock } from '@/components/CodeBlock'
import { Eyebrow } from '@/components/Eyebrow'
import { GROUPS, exportsByGroup, LIB_VERSION, NPM_URL } from '@/components/exports'

const INSTALL = `pnpm add @objectifthunes/react-three-pop-up-book @objectifthunes/react-three-book \\
  @objectifthunes/three-pop-up-book @objectifthunes/three-book \\
  three @react-three/fiber @react-three/drei`

const WIRE_UP = `import { Book, BookInteraction, Cover, Page,
  usePopUpBook, usePopUpScene, PopUpSceneUpdater } from '@objectifthunes/react-three-pop-up-book'

function PopUps() {
  const popUpBook = usePopUpBook()                       // wraps the current <Book>
  const scene = usePopUpScene({ pageWidth: 2, pageHeight: 3 })
  useEffect(() => {
    if (!popUpBook) return
    popUpBook.setScene(popUpBook.contentPageOffset, scene)
    scene.addPopUp({ object: myCube, x: 0.6, z: 1.0 })
  }, [popUpBook, scene])
  return <PopUpSceneUpdater popUpBook={popUpBook} />     // drives the animation loop
}

// inside your <Canvas>:
<Book binding={binding}><BookInteraction /><Cover /><Page /><PopUps /></Book>`

const CATEGORY_BLURB: Record<string, string> = {
  start:       'Install, a hook-based quick start, and how the hooks wrap the imperative classes.',
  hooks:       'usePopUpBook, usePopUpScene and usePopUpScenes — the React surface of the library.',
  components:  'PopUpSceneUpdater — the one component that drives the per-frame animation loop.',
  composition: 'Wiring it all to a declarative <Book>, and adding primitives or GLTF models.',
  reference:   'The re-exported PopUpBook / PopUpScene / PopUpElement classes and the option types.',
  live:        'The full React studio with a Pop-Ups tab, and a minimal hook-based pop-up book.',
}

export default async function HomePage() {
  return (
    <div className="landing">
      <section className="landing__hero">
        <Eyebrow icon={<Sparkles size={12} strokeWidth={1.75} />}>@OBJECTIFTHUNES/REACT-THREE-POP-UP-BOOK · DEMO</Eyebrow>
        <h1 className="landing__title">Pop-ups, the React way.</h1>
        <p className="landing__lede">
          A live, source-paired reference for <code>@objectifthunes/react-three-pop-up-book</code> — React Three
          Fiber hooks that add spring-loaded 3D pop-ups to a declarative <code>&lt;Book&gt;</code>. Manage the
          coordinator and scenes with hooks; the library handles the lifecycle and disposal. Every export
          documented, with working examples.
        </p>
        <div className="landing__hero-actions">
          <Link className="landing__cta landing__cta--primary" href="/full/editor/">Open the live editor ↗</Link>
          <Link className="landing__cta" href="/start/quick-start/">Quick start</Link>
          <a className="landing__cta" href={NPM_URL} target="_blank" rel="noopener noreferrer">npm</a>
        </div>
      </section>

      <section>
        <div className="landing__grid">
          {GROUPS.map(g => {
            const items = exportsByGroup(g.id)
            if (items.length === 0) return null
            const first = items[0]
            return (
              <Link key={g.id} href={first.href} className="landing__card">
                <div className="landing__card-row">
                  <span className="landing__card-title">{g.label}</span>
                  <span className="landing__card-count">{items.length} {items.length === 1 ? 'page' : 'pages'}</span>
                </div>
                <p className="landing__card-blurb">{CATEGORY_BLURB[g.id]}</p>
                <span className="landing__card-open">Open →</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="landing__block">
        <Eyebrow icon={<ArrowDownToLine size={12} strokeWidth={1.75} />}>INSTALL</Eyebrow>
        <CodeBlock code={INSTALL} lang="bash" />
        <Eyebrow icon={<Code2 size={12} strokeWidth={1.75} />}>WIRE-UP</Eyebrow>
        <CodeBlock code={WIRE_UP} lang="tsx" />
      </section>

      <section className="landing__skill">
        <div className="landing__skill-header">
          <div>
            <Eyebrow icon={<PlayCircle size={12} strokeWidth={1.75} />}>SEE IT MOVE</Eyebrow>
            <h2 className="landing__skill-title">Two live demos, no install.</h2>
          </div>
          <Link className="landing__skill-cta" href="/full/editor/">Open editor</Link>
        </div>
        <p style={{ color: 'var(--ot-text-secondary)', fontSize: 14 }}>
          The <strong>Interactive editor</strong> is the full React studio — the declarative book editor plus a{' '}
          <strong>Pop-Ups</strong> tab to add, drag, scale and rotate 3D objects (and load a GLTF). The{' '}
          <strong>Minimal pop-up</strong> shows the bare hook setup: <code>usePopUpBook</code> +{' '}
          <code>usePopUpScene</code> + <code>PopUpSceneUpdater</code>.
        </p>
        <ul className="landing__skill-bullets">
          <li>Three hooks: usePopUpBook / usePopUpScene / usePopUpScenes</li>
          <li>PopUpSceneUpdater drives the frame loop</li>
          <li>Re-exports all of react-three-book</li>
          <li>Add primitives or loaded GLTF models</li>
          <li>v{LIB_VERSION} · React Three Fiber</li>
          <li>Everything here is on the published package</li>
        </ul>
      </section>
    </div>
  )
}
