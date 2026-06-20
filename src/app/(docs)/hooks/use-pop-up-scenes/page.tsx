import Link from 'next/link'
import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'

const e = findExport('/hooks/use-pop-up-scenes/')!

const SIGNATURE = `function usePopUpScenes(
  count: number,
  options?: PopUpSceneOptions,   // default { pageWidth: 2, pageHeight: 3 }
): PopUpScene[]`

const CODE = `import { usePopUpScenes } from '@objectifthunes/react-three-pop-up-book'

function PopUps({ bookRef, pageCount }) {
  // One scene per content page — the array grows / shrinks with pageCount.
  const scenes = usePopUpScenes(pageCount, { pageWidth: 2, pageHeight: 3 })
  const attached = useRef(false)
  const popUpBookRef = useRef(null)

  useFrame((_, dt) => {
    const book = bookRef.current
    if (!book || !book.isBuilt) return
    if (!popUpBookRef.current) popUpBookRef.current = new PopUpBook({ book })
    if (!attached.current) {
      const offset = popUpBookRef.current.contentPageOffset
      scenes.forEach((scene, i) => {
        popUpBookRef.current.setScene(offset + i, scene)   // map scene i -> page i
      })
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
          { name: 'count', type: 'number', desc: 'How many scenes you want — one per visible page. Raising it appends new scenes; lowering it pops and disposes the extras.' },
          { name: 'options', type: 'PopUpSceneOptions', def: '{ pageWidth: 2, pageHeight: 3 }', desc: 'Page dimensions applied to every scene in the array, and re-applied to all of them when they change.' },
        ]}
      />
      <PropTable
        label="RETURNS"
        cols={['Value', 'Type', '', 'Notes']}
        rows={[
          { name: '(return)', type: 'PopUpScene[]', desc: 'A stable array of length `count`. Index i is the scene you map onto page i. Disposed scenes are removed; the whole array is disposed on unmount.' },
        ]}
      />
      <Source code={CODE} lang="tsx" />
      <Notes>
        <p>
          This is the multi-page sibling of <Link href="/hooks/use-pop-up-scene/">usePopUpScene</Link>. It keeps
          an array of <Link href="/reference/classes/">PopUpScene</Link> instances whose length tracks{' '}
          <code>count</code>: it pushes a freshly-built scene for each new slot and pops-and-disposes scenes when
          the count drops, applies the latest <code>pageWidth</code>/<code>pageHeight</code> to every scene in a
          layout effect, and disposes the lot on unmount. You decide how the array maps onto pages — typically{' '}
          <code>setScene(contentPageOffset + i, scenes[i])</code>.
        </p>
        <p>
          The scenes are returned synchronously, so you can attach them as soon as the{' '}
          <Link href="/hooks/use-pop-up-book/">PopUpBook</Link> exists. If you only ever need a single page’s
          worth of pop-ups, the single-scene hook is simpler.
        </p>
      </Notes>
    </ExportPage>
  )
}
