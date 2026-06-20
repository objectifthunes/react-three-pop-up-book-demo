import { Sparkles } from 'lucide-react'
import { ExportPage } from '@/components/ExportPage'
import { FullScreenPreview } from '@/components/Preview'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { findExport } from '@/components/exports'

const e = findExport('/live/editor/')!

const CODE = `// The studio is the library's own React demo: a declarative <Book> plus a
// PopUpBook managed imperatively inside the scene, with a Pop-Ups panel.
<Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
  <BookScene popUps={popUps} onPopUpsChange={setPopUps} … />
</Canvas>`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <FullScreenPreview href="/full/editor/" illustration={<Sparkles size={40} strokeWidth={1.25} />} />
      <Source code={CODE} lang="tsx" />
      <Notes>
        <p>
          The editor is the library&apos;s full Vite demo, ported verbatim. It is the declarative react-three-book
          studio — <strong>Book</strong>, <strong>Textures</strong>, <strong>Editor</strong> tabs — plus a{' '}
          <strong>Pop-Ups</strong> tab: choose a page, add primitives (cube, tree, cone, sphere, star, cylinder)
          or load a GLTF model, then drag to place, scale and rotate.
        </p>
        <p>
          The book auto-opens past its covers so the first pages&apos; pop-ups rise into view. It runs entirely
          client-side (<code>next/dynamic</code>, <code>ssr: false</code>) on React Three Fiber.
        </p>
      </Notes>
    </ExportPage>
  )
}
