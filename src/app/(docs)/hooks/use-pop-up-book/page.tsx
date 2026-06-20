import Link from 'next/link'
import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'
import { LivePopUp } from '@/components/live/examples'

const e = findExport('/hooks/use-pop-up-book/')!

const CODE = `import { useRef } from 'react'
import { Book, useBook, usePopUpBook } from '@objectifthunes/react-three-pop-up-book'

// (A) No argument — reads the <Book> from context. Must be a child of <Book>.
function PopUpsFromContext() {
  const popUpBook = usePopUpBook()   // null on the first frames; self-drives update(dt)
  // popUpBook is non-null after the book builds and a re-render happens.
  return null
}

// (B) Pass a bookRef when the hook lives outside the <Book> subtree.
function PopUps({ bookRef }) {
  const popUpBook = usePopUpBook(bookRef)
  return null
}`

const SIGNATURE = `function usePopUpBook(
  bookRef?: React.RefObject<ThreeBook | null>,
): PopUpBook | null`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <LivePopUp />
      <Source code={SIGNATURE} lang="ts" />
      <PropTable
        label="PARAMETERS"
        cols={['Param', 'Type', '', 'Meaning']}
        rows={[
          { name: 'bookRef', type: 'RefObject<ThreeBook | null>', desc: 'Optional. The ref you put on <Book>. Omit it to read the book from useBook() context instead — in which case the hook must be a descendant of <Book>.' },
        ]}
      />
      <PropTable
        label="RETURNS"
        cols={['Value', 'Type', '', 'Notes']}
        rows={[
          { name: '(return)', type: 'PopUpBook | null', desc: 'The coordinator instance, or null. It is null until the book is built and a re-render occurs — the hook does NOT force that re-render itself.' },
        ]}
      />
      <Notes>
        <p>
          Read the source and you’ll see what the hook actually does: it runs its own{' '}
          <code>useFrame</code>, and on the first frame after <code>book.isBuilt</code> it constructs{' '}
          <code>new PopUpBook(&#123; book &#125;)</code>, then calls <code>popUpBook.update(delta)</code> every
          frame from then on. It disposes the instance on unmount, and rebuilds it if the underlying book
          changes. Because it drives the loop internally, you do <strong>not</strong> also need a{' '}
          <Link href="/components/scene-updater/">PopUpSceneUpdater</Link> when you use this hook.
        </p>
        <p>
          The important caveat: the returned value is <code>null</code> until the instance exists{' '}
          <em>and</em> a render has run, so you cannot rely on it being non-null synchronously to attach scenes.
          When you need the instance the moment the book is built — to call <code>setScene</code> and{' '}
          <code>addPopUp</code> in the same frame — prefer the imperative pattern from the{' '}
          <Link href="/start/quick-start/">quick start</Link>: build the{' '}
          <Link href="/reference/classes/">PopUpBook class</Link> yourself inside a <code>useFrame</code>. To
          create the scenes you attach, see <Link href="/hooks/use-pop-up-scene/">usePopUpScene</Link>.
        </p>
      </Notes>
      <Source code={CODE} lang="tsx" />
    </ExportPage>
  )
}
