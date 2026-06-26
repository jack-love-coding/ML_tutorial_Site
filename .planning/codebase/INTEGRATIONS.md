# External Integrations

**Analysis Date:** 2026-06-25
**Mapped Commit:** `95a3eab`

## APIs and External Services

**Runtime APIs:**
- No application backend API is required.
- No authentication provider, database, payment provider, analytics service, or server webhook is currently wired.

**Browser APIs:**
- `localStorage` is used for progress persistence through shared JSON helpers in `src/utils/progressStorage.ts`.
- DOM, pointer, keyboard, and resize APIs are used by interactive Vue labs.
- Canvas/SVG/WebGL are used through D3 and Three.js.

## Data Storage

**Client Storage:**
- Algorithm progress key: `ml-atlas:algorithm-progress:v1` in `src/utils/algorithmProgress.ts`.
- Math Lab progress key: `ml-atlas:math-lab-progress:v1` in `src/modules/math-lab/utils/progress.ts`.
- Data Lab progress key: `ml-atlas:data-lab-progress:v1` in `src/modules/data-lab/utils/progress.ts`.
- Curriculum V2 must migrate read-only from these v1 stores before writing a unified v2 store.

**Static Assets:**
- Generated lesson images live under `public/*/generated/`.
- Manim video/SVG assets live under `public/manim/**`.
- CNN explainer TensorFlow.js model and labels live under `public/cnn-explainer/`.

## Content Sources

**Internal Course Content:**
- Algorithm modules are TypeScript objects under `src/data/`.
- Math Lab modules are TypeScript objects under `src/modules/math-lab/data/`.
- Data Lab modules are TypeScript objects under `src/modules/data-lab/data/`.

**External References:**
- Course modules include source references in typed data records.
- Runtime course assets should use local `public/` paths, not remote URLs.

## CI/CD and Deployment

**Hosting Target:**
- Static site deployment, including GitHub Pages via `npm run build:pages`.

**CI Pipeline:**
- No `.github/workflows/` files were mapped in this pass.
- The repository relies on npm scripts for local validation.

## Environment Configuration

**Development:**
- `npm run dev` starts Vite.
- No `.env` file is required for normal local learning-site behavior.

**Production:**
- Static output must respect Vite `base`.
- Public assets are addressed through `/` paths plus `withPublicBase` or adjacent helpers where needed.

## Integration Risks

- Progress migration is the main integration risk because three localStorage namespaces must be preserved.
- GitHub Pages base-path behavior is a deployment integration requirement and must be tested for route and asset changes.
- Generated static assets are part of the teaching contract; moving content must not break public asset references.

---
*Integration audit: 2026-06-25*
