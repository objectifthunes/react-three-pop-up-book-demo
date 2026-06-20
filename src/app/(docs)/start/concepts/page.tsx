import Link from 'next/link'
import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'
import { LivePopUp } from '@/components/live/examples'

const e = findExport('/start/concepts/')!

const CODE = `import {
  // React Three Fiber hooks + updater (this package)
  usePopUpBook, usePopUpScene, usePopUpScenes, PopUpSceneUpdater,
  // imperative classes (re-exported from three-pop-up-book)
  PopUpBook, PopUpScene, PopUpSpreadScene, PopUpElement,
  // the whole declarative book (re-exported from react-three-book)
  Book, BookInteraction, Cover, Page, Spread, Text, useBook,
} from '@objectifthunes/react-three-pop-up-book'`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <LivePopUp />
      <Notes>
        <p>
          This library is a thin layer of React Three Fiber hooks on top of two things it{' '}
          <em>re-exports</em>: the declarative <Link href="/composition/integration/">&lt;Book&gt;</Link> from{' '}
          <code>@objectifthunes/react-three-book</code>, and the pop-up classes from{' '}
          <code>@objectifthunes/three-pop-up-book</code>. Everything is imported from the single entry point{' '}
          <code>@objectifthunes/react-three-pop-up-book</code> — you should never import the underlying packages
          directly.
        </p>
        <p>
          The mental model has three actors. A <strong>PopUpBook</strong> coordinator wraps the built{' '}
          <code>ThreeBook</code> and knows where every page surface is each frame.{' '}
          <strong>PopUpScenes</strong> hold the pop-ups for one page side and are attached at an absolute page
          index with <code>setScene(index, scene)</code>. You <strong>drive</strong> the whole thing by calling{' '}
          <code>popUpBook.update(dt)</code> once per frame, after <code>book.update(dt)</code> — that positions
          every <code>PopUpElement</code> on the live, possibly-curling page and advances its spring.
        </p>
      </Notes>
      <Source code={CODE} lang="tsx" />
      <PropTable
        label="THE PIECES"
        cols={['Piece', 'Kind', '', 'Role']}
        rows={[
          { name: 'usePopUpBook', type: 'hook', desc: 'Creates a PopUpBook for the current <Book> and self-drives update(delta) each frame. Returns the instance (null until a re-render). See its page for the caveat.' },
          { name: 'usePopUpScene', type: 'hook', desc: 'One memoized PopUpScene, sized to your pages, disposed on unmount. Attach it with popUpBook.setScene().' },
          { name: 'usePopUpScenes', type: 'hook', desc: 'An array of scenes that grows and shrinks with a count — one per visible page — disposing the extras.' },
          { name: 'PopUpSceneUpdater', type: 'component', desc: 'A render-null component that calls popUpBook.update(delta) in its own useFrame. Drop it in the <Canvas> when you build the PopUpBook yourself.' },
          { name: 'PopUpBook / PopUpScene / …', type: 'class', desc: 'The re-exported imperative classes (also PopUpSpreadScene, PopUpElement). The robust pattern builds these directly; the hooks wrap them in React lifecycle.' },
        ]}
      />
      <Notes>
        <p>
          The hooks exist to fold this loop into React’s lifecycle — creation, disposal and the per-frame
          update — so a component can stay declarative. But because a built book only becomes available after a
          render, the most robust pattern (used by every live demo here) reaches for the classes directly inside
          a <code>useFrame</code>. Start with the <Link href="/start/quick-start/">quick start</Link>, then
          choose hooks or classes per page.
        </p>
      </Notes>
    </ExportPage>
  )
}
