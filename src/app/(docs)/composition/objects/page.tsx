import { ExportPage } from '@/components/ExportPage'
import { Source } from '@/components/Source'
import { Notes } from '@/components/Notes'
import { PropTable } from '@/components/PropTable'
import { findExport } from '@/components/exports'

const e = findExport('/composition/objects/')!

const PRIMITIVE_CODE = `import * as THREE from 'three'

// A pop-up is ANY THREE.Object3D. Build a mesh whose local origin sits on the
// page (y = 0) and whose geometry grows upward — the library lifts it for you.
function makeCube(color = '#e85050'): THREE.Object3D {
  const geo = new THREE.BoxGeometry(0.35, 0.35, 0.35)
  geo.translate(0, 0.175, 0)                 // base on the page, top at y = 0.35
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  return mesh
}

// A small "tree" is just a Group of two meshes — Groups work too.
function makeTree(): THREE.Object3D {
  const group = new THREE.Group()
  const trunk = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8); trunk.translate(0, 0.15, 0)
  group.add(new THREE.Mesh(trunk, new THREE.MeshStandardMaterial({ color: '#8B4513' })))
  const foliage = new THREE.ConeGeometry(0.2, 0.4, 8); foliage.translate(0, 0.5, 0)
  group.add(new THREE.Mesh(foliage, new THREE.MeshStandardMaterial({ color: '#228B22' })))
  return group
}

scene.addPopUp({ object: makeCube(), x: 0.6, z: 1.0 })
scene.addPopUp({ object: makeTree(), x: 1.5, z: 0.7, scale: 1.3 })`

const GLTF_CODE = `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
const url = URL.createObjectURL(file)            // e.g. a user-picked .glb

loader.loadAsync(url).then((gltf) => {
  const model = gltf.scene                       // a THREE.Group
  model.traverse((c) => { if (c.isMesh) c.castShadow = true })

  // gltf.scene is just an Object3D — add it like any other pop-up.
  scene.addPopUp({ object: model, x: pageWidth / 2, z: pageHeight / 2 })
}).finally(() => URL.revokeObjectURL(url))`

export default async function Page() {
  return (
    <ExportPage group={e.group} title={e.name} lede={e.lede}>
      <Source code={PRIMITIVE_CODE} lang="ts" />
      <Source code={GLTF_CODE} lang="ts" />
      <PropTable
        label="PopUpElementOptions"
        cols={['Field', 'Type', 'Default', 'Meaning']}
        rows={[
          { name: 'object', type: 'THREE.Object3D', desc: 'Any object — a Mesh, a Group, or a loaded gltf.scene. It is parented under the element’s pivot.' },
          { name: 'x', type: 'number', desc: 'Position across the page, in page units (0 = the spine edge, pageWidth = the outer edge).' },
          { name: 'z', type: 'number', desc: 'Position down the page, in page units (0 = top, pageHeight = bottom).' },
          { name: 'scale', type: 'number', def: '1', desc: 'Uniform scale applied to the object before it is laid on the page.' },
          { name: 'rotation', type: 'number', def: '0', desc: 'Y-axis spin (radians) about the object’s own vertical, on the page plane.' },
        ]}
      />
      <Notes>
        <p>
          <code>addPopUp</code> accepts <strong>any</strong> <code>THREE.Object3D</code>: a single{' '}
          <code>Mesh</code>, a <code>Group</code> of meshes (like the tree above), or the{' '}
          <code>scene</code> of a loaded GLTF. There is no special pop-up type to subclass.
        </p>
        <p>
          The object&apos;s <strong>local origin sits on the page surface</strong>. Build geometry that rises
          from <code>y = 0</code> upward — the primitives above each <code>translate</code> their geometry so the
          base rests at the origin and the body grows in <code>+y</code>. The library then places that origin at
          your <code>(x, z)</code> on the page and lifts the object on its pivot as the page settles, scaling its
          height from 0 to full with a spring. An origin centred inside the mesh would sink half the object into
          the paper.
        </p>
        <p>
          Set <code>castShadow</code> on your meshes (traverse the GLTF and set it per mesh) if you want the
          pop-ups to drop shadows onto the page. For the full option surface and the rest of the API, see{' '}
          <a href="/reference/classes/">Re-exported classes</a>.
        </p>
      </Notes>
    </ExportPage>
  )
}
