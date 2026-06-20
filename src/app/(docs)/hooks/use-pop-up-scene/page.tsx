import Link from 'next/link'
import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'

const e = findExport('/hooks/use-pop-up-scene/')!

const SIGNATURE = `function usePopUpScene(
  options?: PopUpSceneOptions,   // default { pageWidth: 2, pageHeight: 3 }
): PopUpScene

interface PopUpSceneOptions {
  pageWidth: number
  pageHeight: number
}`

const CODE = `import { usePopUpScene } from '@objectifthunes/react-three-pop-up-book'

function PopUps({ bookRef }) {
  // One memoized scene, sized to the pages. Re-created options just resize it.
  const scene = usePopUpScene({ pageWidth: 2, pageHeight: 3 })
  const attached = useRef(false)
  const popUpBookRef = useRef(null)

  useFrame((_, dt) => {
    const book = bookRef.current
    if (!book || !book.isBuilt) return
    if (!popUpBookRef.current) popUpBookRef.current = new PopUpBook({ book })
    if (!attached.current) {
      // Attach the scene at the first content page, then fill it.
      popUpBookRef.current.setScene(popUpBookRef.current.contentPageOffset, scene)
      scene.addPopUp({ object: makeTree(), x: 1.2, z: 1.0 })
      attached.current = true
    }
    popUpBookRef.current.update(dt)
  })
  return null
}`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <Source code={SIGNATURE} lang="ts" />
      <PropTable
        label="PARAMETERS"
        cols={['Param', 'Type', '', 'Meaning']}
        rows={[
          { name: 'options', type: 'PopUpSceneOptions', def: '{ pageWidth: 2, pageHeight: 3 }', desc: 'Page dimensions in book units. Match your <Book> page setup so pop-ups land in the right place.' },
          { name: 'options.pageWidth', type: 'number', desc: 'Width of a page in world units. Updated on the live scene whenever it changes.' },
          { name: 'options.pageHeight', type: 'number', desc: 'Height of a page in world units. Updated on the live scene whenever it changes.' },
        ]}
      />
      <PropTable
        label="RETURNS"
        cols={['Value', 'Type', '', 'Notes']}
        rows={[
          { name: '(return)', type: 'PopUpScene', desc: 'A stable PopUpScene instance, created once and kept across renders. Always non-null — unlike usePopUpBook, you get it synchronously.' },
        ]}
      />
      <Source code={CODE} lang="tsx" />
      <Notes>
        <p>
          The hook builds the <Link href="/reference/classes/">PopUpScene</Link> on first render with the given
          options (defaulting to <code>&#123; pageWidth: 2, pageHeight: 3 &#125;</code>), keeps the same instance
          across renders, writes new <code>pageWidth</code>/<code>pageHeight</code> onto it in a layout effect
          when they change, and disposes it on unmount. Because the scene is returned synchronously, you can
          attach it to a <Link href="/hooks/use-pop-up-book/">PopUpBook</Link> with{' '}
          <code>popUpBook.setScene(contentPageOffset, scene)</code> as soon as the book is built, then add
          pop-ups to it.
        </p>
        <p>
          One scene covers one page side. When you want a scene for every visible page at once — and to add and
          remove them as the count changes — reach for{' '}
          <Link href="/hooks/use-pop-up-scenes/">usePopUpScenes</Link> instead.
        </p>
      </Notes>
    </ExportPage>
  )
}
