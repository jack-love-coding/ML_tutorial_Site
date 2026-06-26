# Technology Stack

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## Languages

**Primary:**
- TypeScript 5.9 - Vue components, course schemas, simulations, utilities, and tests.
- Vue single-file components - page, lab, and shared teaching UI in `src/**/*.vue`.

**Secondary:**
- JavaScript / ESM - Node test files in `tests/*.test.mjs`, Vite config, and package scripts.
- Markdown - project docs, refactor plans, and source notes in `docs/`.

## Runtime

**Environment:**
- Browser runtime for the learning site.
- Node.js runtime for tests, type-checking, Vite builds, and scripts.
- No required backend service or database in the current app.

**Package Manager:**
- npm with `package-lock.json`.
- Main commands are declared in `package.json`.

## Frameworks

**Core:**
- Vue 3.5 - UI and page composition.
- Vue Router 5 - client-side routing in `src/router/index.ts`.
- Pinia 3 - experiment state in `src/stores/experiments.ts`.
- Vite 8 - development server and production bundling.

**Visualization and Teaching Media:**
- D3 7 - deterministic SVG and chart-style visualizations.
- Three.js 0.184 - 3D labs and CNN visualization.
- KaTeX, markdown-it, sanitize-html - safe formula and markdown rendering through `src/utils/markdownMath.ts`.
- TensorFlow.js 4 - browser-local CNN explainer model assets under `public/cnn-explainer/`.

**Testing:**
- Node test runner via `node --test tests/*.test.*`.
- Tests cover content registration, simulations, markdown safety, public paths, layout structure, and progress helpers.

## Configuration

**Build:**
- `vite.config.ts` sets `base` from `VITE_BASE_PATH`, `/ML_tutorial_Site/` in `github-pages` mode, otherwise `/`.
- Vite chunk warning limit is `1400`.
- `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`.

**Environment:**
- No required runtime secrets.
- Optional `VITE_BASE_PATH` controls public base path.

## Platform Requirements

**Development:**
- Run `npm install`, `npm test`, `npm run build`, and `npm run build:pages`.
- The app is fully local and browser-based.

**Production:**
- Static site output in `dist/`.
- GitHub Pages mode must keep public paths compatible with `/ML_tutorial_Site/`.

## Refactor Implications

- Avoid adding a UI framework; reuse existing Vue, D3, Three.js, and style primitives.
- Keep heavy labs lazy-loaded through route/component boundaries.
- Curriculum V2 should improve chunk boundaries rather than centralizing all content into a larger eager bundle.

---
*Stack analysis: 2026-06-25*
