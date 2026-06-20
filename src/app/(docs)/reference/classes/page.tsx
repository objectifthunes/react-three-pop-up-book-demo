import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'
import { LivePopUp } from '@/components/live/examples'

const e = findExport('/reference/classes/')!

const CODE = `// All five are re-exported from the React package, so one import does it:
import {
  PopUpBook, PopUpScene, PopUpSpreadScene, PopUpElement, springProgress,
} from '@objectifthunes/react-three-pop-up-book'

// They originate in @objectifthunes/three-pop-up-book — the framework-agnostic core.`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <LivePopUp />
      <Source code={CODE} lang="ts" />
      <PropTable
        label="PopUpBook"
        cols={['Member', 'Signature', '', 'What it does']}
        rows={[
          { name: 'constructor', type: '({ book })', desc: 'Wraps a built ThreeBook. Construct once the book exists.' },
          { name: 'contentPageOffset', type: 'number (get)', desc: 'Absolute page index where content begins, past the front covers.' },
          { name: 'frontCoverCount', type: 'number (get)', desc: 'How many cover papers to turn past when auto-opening.' },
          { name: 'setScene / removeScene', type: '(pageIndex, scene) / (pageIndex)', desc: 'Attach or detach a PopUpScene to a page side (pageIndex = paperIndex*2 + side).' },
          { name: 'update', type: '(dt: number) => void', desc: 'Per-frame: positions visible elements on the page surface and advances animations.' },
          { name: 'bindInteraction / hitTest', type: '({ camera, domElement, bookInteraction }) / (raycaster)', desc: 'Wire pointer events that pause turning over a pop-up; or raycast for the closest element.' },
          { name: 'onPopUpDown / onPopUpEnter / onPopUpLeave', type: 'callbacks', desc: 'Fired on click, hover-enter and hover-leave of a visible pop-up element.' },
          { name: 'dispose', type: '() => void', desc: 'Unbinds interaction and detaches all scenes.' },
        ]}
      />
      <PropTable
        label="PopUpScene"
        cols={['Member', 'Signature', '', 'What it does']}
        rows={[
          { name: 'constructor', type: '({ pageWidth, pageHeight })', desc: 'A container of pop-ups for one page, sized in page units.' },
          { name: 'addPopUp / removePopUp', type: '(options) => PopUpElement / (element)', desc: 'Add any THREE.Object3D as a pop-up, or remove and dispose one.' },
          { name: 'updatePopUp', type: '(element, Partial<options>)', desc: 'Patch an element’s x / z / scale / rotation.' },
          { name: 'setProgress', type: '(t: number) => void', desc: 'Set the visible target (0 hidden, >0 shown) for every element at once.' },
          { name: 'group / popUps', type: 'THREE.Group / readonly PopUpElement[]', desc: 'The scene’s container object and its live elements.' },
          { name: 'dispose', type: '() => void', desc: 'Disposes all elements and detaches the group.' },
        ]}
      />
      <PropTable
        label="PopUpSpreadScene"
        cols={['Member', 'Signature', '', 'What it does']}
        rows={[
          { name: 'constructor', type: '({ pageWidth, pageHeight })', desc: 'A scene spanning a two-page spread; elements split by x across the spine.' },
          { name: 'left / right', type: 'THREE.Group', desc: 'The two half-groups — elements with x < pageWidth land on the left, the rest on the right.' },
          { name: 'addPopUp / removePopUp / updatePopUp / setProgress', type: 'as PopUpScene', desc: 'Same surface as PopUpScene, routing each element to the correct half.' },
          { name: 'resize / dispose', type: '(pageWidth, pageHeight) / ()', desc: 'Re-size the spread, or dispose the underlying scene and both halves.' },
        ]}
      />
      <PropTable
        label="PopUpElement"
        cols={['Member', 'Type', '', 'What it does']}
        rows={[
          { name: 'object / pivot', type: 'THREE.Object3D / THREE.Group', desc: 'Your object, and the pivot the library positions on the page.' },
          { name: 'x / z / scale / rotation', type: 'number (get/set)', desc: 'Page-space placement, uniform scale, and Y-axis spin.' },
          { name: 'animated', type: 'boolean', desc: 'When true, pop/collapse use a spring bounce; when false, they snap instantly.' },
          { name: 'progress', type: 'number (get)', desc: 'Current rendered height factor, 0 (hidden) … 1 (full).' },
          { name: 'setProgress', type: '(t: number) => void', desc: 'Set the target (0 hides, >0 shows); animates if animated is on.' },
        ]}
      />
      <PropTable
        label="springProgress"
        cols={['Member', 'Signature', '', 'What it does']}
        rows={[
          { name: 'springProgress', type: '(t: number) => number', desc: 'Elastic ease-out over t in 0…1 — overshoots past 1 then settles. The pop-up bounce curve.' },
        ]}
      />
      <Notes>
        <p>
          These classes are <strong>re-exported verbatim</strong> from{' '}
          <code>@objectifthunes/three-pop-up-book</code>, the framework-agnostic core. This page is an overview
          of their key members so you can wire pop-ups from React without leaving the docs; it is not exhaustive.
        </p>
        <p>
          For the deep reference — every method, the geometry and progress model, and the interaction internals
          — see the dedicated{' '}
          <a href="https://objectifthunes.github.io/three-pop-up-book-demo/">three-pop-up-book docs site</a>. To
          see these classes wired into a React <code>&lt;Book&gt;</code>, read{' '}
          <a href="/composition/integration/">Composing with &lt;Book&gt;</a> and{' '}
          <a href="/composition/objects/">Objects &amp; models</a>.
        </p>
      </Notes>
    </ExportPage>
  )
}
