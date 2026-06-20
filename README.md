# react-three-pop-up-book-demo

Next.js (App Router, Turbopack) documentation site + live demo for
[`@objectifthunes/react-three-pop-up-book`](https://www.npmjs.com/package/@objectifthunes/react-three-pop-up-book)
— React Three Fiber hooks that add 3D pop-ups to a declarative book.

Live at https://objectifthunes.github.io/react-three-pop-up-book-demo/.

Every export is documented with source-paired examples, and the library's full studio runs in the browser at
`/full/editor/` (plus a minimal hook-based pop-up at `/full/minimal/`).

## Local dev

`@objectifthunes/*` are **private** npm packages, so you need read access. Authenticate once:

```bash
echo "//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN" >> ~/.npmrc
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Build / static export

```bash
pnpm build
```

`next build` runs with `output: 'export'` and emits a static site to `out/`. CI deploys that folder to GitHub
Pages.

## CI / deployment

`.github/workflows/pages.yml` builds and deploys to GitHub Pages on every push to `main`. Because the packages
are private, the workflow writes an npm auth line to `~/.npmrc` from the **`NPM_TOKEN`** repository secret before
installing.

## Notes

Runs on React Three Fiber v9 (React 19). The libraries declare `@react-three/fiber >= 8` as a peer dependency.
