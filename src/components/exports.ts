export type Badge = 'FULL-SCREEN' | 'COMPONENT' | 'HOOK' | 'CLASS' | 'TYPE'

export const LIB_NAME = '@objectifthunes/react-three-pop-up-book'
export const LIB_VERSION = '0.2.4'
export const NPM_URL = 'https://www.npmjs.com/package/@objectifthunes/react-three-pop-up-book'
export const REPO_URL = 'https://github.com/objectifthunes/react-three-pop-up-book'

export interface ExportEntry {
  slug: string
  name: string
  group: GroupId
  href: string
  badge?: Badge
  lede: string
}

export type GroupId =
  | 'start'
  | 'hooks'
  | 'components'
  | 'composition'
  | 'reference'
  | 'live'

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'start',       label: 'Getting started' },
  { id: 'hooks',       label: 'Hooks'           },
  { id: 'components',  label: 'Components'       },
  { id: 'composition', label: 'Composition'     },
  { id: 'reference',   label: 'Reference'       },
  { id: 'live',        label: 'Live demos'      },
]

export const EXPORTS: ExportEntry[] = [
  // Getting started
  { slug: 'quick-start', name: 'Quick start', group: 'start', href: '/start/quick-start/', lede: 'Add spring-loaded 3D pop-ups to a React <Book> with three hooks and a updater component.' },
  { slug: 'concepts',    name: 'Core concepts', group: 'start', href: '/start/concepts/', lede: 'How the hooks wrap the imperative PopUpBook/PopUpScene classes and ride React’s lifecycle.' },

  // Hooks
  { slug: 'use-pop-up-book',   name: 'usePopUpBook', group: 'hooks', href: '/hooks/use-pop-up-book/', lede: 'Create and manage a PopUpBook for the current <Book>, with automatic disposal.', badge: 'HOOK' },
  { slug: 'use-pop-up-scene',  name: 'usePopUpScene', group: 'hooks', href: '/hooks/use-pop-up-scene/', lede: 'A single, memoized PopUpScene for one page — sized to your pages, disposed on unmount.', badge: 'HOOK' },
  { slug: 'use-pop-up-scenes', name: 'usePopUpScenes', group: 'hooks', href: '/hooks/use-pop-up-scenes/', lede: 'An array of scenes that grows and shrinks with a count — one per visible page.', badge: 'HOOK' },

  // Components
  { slug: 'scene-updater', name: 'PopUpSceneUpdater', group: 'components', href: '/components/scene-updater/', lede: 'Drop this in your <Canvas> to drive the pop-up animation loop every frame.', badge: 'COMPONENT' },

  // Composition
  { slug: 'integration', name: 'Composing with <Book>', group: 'composition', href: '/composition/integration/', lede: 'The full pattern: a declarative <Book>, usePopUpBook, scenes, and the updater — wired together.' },
  { slug: 'objects',     name: 'Objects & models', group: 'composition', href: '/composition/objects/', lede: 'Add any THREE.Object3D — built-in primitives or a loaded GLTF model — as a pop-up.' },

  // Reference
  { slug: 'classes', name: 'Re-exported classes', group: 'reference', href: '/reference/classes/', lede: 'PopUpBook, PopUpScene, PopUpElement and friends, re-exported from three-pop-up-book.', badge: 'CLASS' },
  { slug: 'types',   name: 'Types index', group: 'reference', href: '/reference/types/', lede: 'Hook return types and the re-exported option shapes in one place.', badge: 'TYPE' },

  // Live demos
  { slug: 'editor',  name: 'Interactive editor', group: 'live', href: '/live/editor/', lede: 'The full React studio: declarative book, a Pop-Ups tab, drag-to-place and GLTF loading.', badge: 'FULL-SCREEN' },
  { slug: 'minimal', name: 'Minimal pop-up', group: 'live', href: '/live/minimal/', lede: 'The smallest hook-based setup — a <Book> with a few shapes that rise as the page settles.', badge: 'FULL-SCREEN' },
]

export function groupOf(id: GroupId) {
  return GROUPS.find(g => g.id === id)!
}

export function exportsByGroup(id: GroupId) {
  return EXPORTS.filter(e => e.group === id)
}

export function findExport(href: string): ExportEntry | undefined {
  return EXPORTS.find(e => e.href === href)
}

export const TOTAL_EXPORTS = EXPORTS.length
