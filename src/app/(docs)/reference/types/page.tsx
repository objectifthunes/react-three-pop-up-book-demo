import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'

const e = findExport('/reference/types/')!

const CODE = `import type {
  PopUpSceneUpdaterProps,
  PopUpBookOptions, PopUpSceneOptions, PopUpElementOptions, PopUpInteractionOptions,
} from '@objectifthunes/react-three-pop-up-book'`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <Source code={CODE} lang="ts" />
      <PropTable
        label="TYPES"
        cols={['Type', 'Shape', '', 'Used by']}
        rows={[
          { name: 'PopUpBook | null', type: 'class | null', desc: 'Return of usePopUpBook — the managed book, or null until it exists.' },
          { name: 'PopUpScene', type: 'class', desc: 'Return of usePopUpScene — one memoized scene for a page.' },
          { name: 'PopUpScene[]', type: 'class[]', desc: 'Return of usePopUpScenes — an array that tracks a count.' },
          { name: 'PopUpSceneUpdaterProps', type: '{ popUpBook: PopUpBook | null }', desc: 'Props of PopUpSceneUpdater.' },
          { name: 'PopUpBookOptions', type: '{ book: Book }', desc: 'new PopUpBook({ book }) — wraps a built ThreeBook.' },
          { name: 'PopUpSceneOptions', type: '{ pageWidth: number; pageHeight: number }', desc: 'new PopUpScene(...) and usePopUpScene / usePopUpScenes.' },
          { name: 'PopUpElementOptions', type: '{ object, x, z, scale?, rotation? }', desc: 'scene.addPopUp(...) — see Objects & models.' },
          { name: 'PopUpInteractionOptions', type: '{ camera, domElement, bookInteraction }', desc: 'popUpBook.bindInteraction(...).' },
        ]}
      />
      <Notes>
        <p>
          A navigational index of the types you touch from React. The first three are the{' '}
          <strong>hook return types</strong> —{' '}
          <a href="/hooks/use-pop-up-book/">usePopUpBook</a> gives you a{' '}
          <code>PopUpBook | null</code>,{' '}
          <a href="/hooks/use-pop-up-scene/">usePopUpScene</a> a single{' '}
          <code>PopUpScene</code>, and{' '}
          <a href="/hooks/use-pop-up-scenes/">usePopUpScenes</a> a{' '}
          <code>PopUpScene[]</code>.
        </p>
        <p>
          <code>PopUpSceneUpdaterProps</code> belongs to the{' '}
          <a href="/components/scene-updater/">PopUpSceneUpdater</a> component. The four{' '}
          <code>…Options</code> shapes are re-exported from the core and feed the constructors and methods on the{' '}
          <a href="/reference/classes/">re-exported classes</a> — <code>PopUpInteractionOptions.bookInteraction</code>{' '}
          is the <code>{`{ enabled: boolean }`}</code> flag the binding toggles to pause page turning over a pop-up.
        </p>
      </Notes>
    </ExportPage>
  )
}
