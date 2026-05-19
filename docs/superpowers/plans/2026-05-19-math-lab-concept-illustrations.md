# Math Lab Concept Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add prompt-designed, generated, concept-level course illustrations for every current Math Lab `MathConcept`.

**Architecture:** Keep prompt and asset metadata in one typed registry, render concept illustrations from `MathLabModulePage.vue`, and store generated PNGs under `public/math-lab/concepts/generated/`. Tests verify the registry covers the actual module inventory and, once assets are marked generated, every referenced image exists locally.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, existing `withPublicBase`, built-in image generation tool for raster image creation.

---

## File Structure

- Create: `src/modules/math-lab/data/conceptIllustrations.ts`
  - Owns the concept illustration record type, 47 prompt entries, and lookup helpers.
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
  - Resolves and renders a concept illustration inside each formula-focus concept section.
- Modify: `src/styles/modules/math-lab.css`
  - Adds responsive styling for concept illustrations using existing visual asset primitives.
- Create: `tests/math-lab-concept-illustrations.test.mjs`
  - Verifies inventory coverage, local public paths, generated asset existence for generated entries, and page wiring.
- Create: `docs/math-lab-concept-illustration-prompts.md`
  - Documents prompt policy, batch order, and final prompt list.
- Create: `public/math-lab/concepts/generated/*.png`
  - Final generated concept images.

## Task 1: Add Coverage Tests First

**Files:**
- Create: `tests/math-lab-concept-illustrations.test.mjs`

- [ ] **Step 1: Write the failing coverage test**

Add this file:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

const expectedConcepts = {
  'vectors-matrices-norms': [
    'dot-product-cosine-similarity',
    'matrix-as-linear-transform',
    'induced-matrix-norm',
  ],
  'tensor-shapes-vectorization': [
    'linear-layer-shape-contract',
    'broadcasting-compatibility',
  ],
  'taylor-series': ['taylor-polynomial', 'taylor-remainder'],
  'matrix-calculus-autodiff': ['local-linearization', 'vjp-jvp'],
  'monte-carlo': ['monte-carlo-estimator-core'],
  'probability-likelihood-entropy': ['softmax-cross-entropy', 'kl-divergence'],
  'lu-decomposition': ['lu-factorization-core', 'lup-pivoting-core'],
  'sparse-matrices': ['sparse-nnz-core', 'sparse-csr-rowptr-core'],
  'condition-numbers': ['condition-number-core', 'residual-error-bound'],
  'eigenvalues-eigenvectors': ['eigenpair', 'characteristic-polynomial', 'rayleigh-quotient'],
  'markov-chains': ['markov-property-core', 'markov-transition-matrix-core', 'markov-stationary-pagerank-core'],
  'finite-difference-methods': [
    'finite-difference-derivative-core',
    'finite-difference-error-balance',
    'finite-difference-gradient-jacobian',
  ],
  'nonlinear-equations': ['nonlinear-root-residual', 'newton-step', 'multidimensional-newton'],
  optimization: ['optimization-minimizer', 'optimization-steepest-descent', 'optimization-newton-step'],
  'training-diagnostics': ['gradient-update-diagnostics', 'validation-gap'],
  'least-squares-fitting': [
    'least-squares-residual-objective',
    'least-squares-normal-equations',
    'least-squares-svd-pseudoinverse',
  ],
  svd: ['singular-value-decomposition', 'rank-from-singular-values', 'svd-pseudoinverse', 'svd-low-rank'],
  pca: ['pca-centered-projection', 'pca-covariance-diagonalization', 'pca-svd-explained-variance'],
  'deep-architecture-math': ['convolution-output-size', 'scaled-dot-product-attention'],
}

test('math lab concept illustration registry covers every current concept', () => {
  const registrySource = read('src/modules/math-lab/data/conceptIllustrations.ts')

  const moduleIds = Object.keys(expectedConcepts)
  for (const moduleId of moduleIds) {
    assert.match(registrySource, new RegExp(`moduleId: '${moduleId}'`))
  }

  const expectedPairs = Object.entries(expectedConcepts).flatMap(([moduleId, conceptIds]) =>
    conceptIds.map((conceptId) => `${moduleId}:${conceptId}`),
  )

  assert.equal(expectedPairs.length, 47)

  for (const pair of expectedPairs) {
    assert.match(registrySource, new RegExp(`key: '${pair}'`), `${pair} should have a registry entry`)
  }
})

test('concept illustration records use local public PNG paths and complete prompt metadata', () => {
  const registrySource = read('src/modules/math-lab/data/conceptIllustrations.ts')

  const entries = [...registrySource.matchAll(/key: '([^']+)'[\s\S]*?assetPath: '([^']+)'[\s\S]*?prompt: String\.raw`([\s\S]*?)`/g)]
  assert.equal(entries.length, 47)

  for (const [, key, assetPath, prompt] of entries) {
    assert.match(assetPath, /^\/math-lab\/concepts\/generated\/[a-z0-9-]+\.png$/)
    assert.match(prompt, /Use case: infographic-diagram/)
    assert.match(prompt, /Asset type: ML Atlas Math Lab concept illustration/)
    assert.match(prompt, /Constraints:/)
    assert.doesNotMatch(prompt, /NEEDS_CONTENT|FILL_ME/i, `${key} prompt should be complete`)
  }
})

test('generated concept illustration assets exist when marked generated', () => {
  const registrySource = read('src/modules/math-lab/data/conceptIllustrations.ts')
  const generatedEntries = [...registrySource.matchAll(/status: 'generated'[\s\S]*?assetPath: '([^']+)'/g)]

  for (const [, assetPath] of generatedEntries) {
    const publicPath = `public/${assetPath.replace(/^\//, '')}`
    assert.ok(existsSync(new URL(publicPath, root)), `${assetPath} should exist`)
  }
})

test('module page renders concept illustration assets through public base helper', () => {
  const pageSource = read('src/modules/math-lab/pages/MathLabModulePage.vue')

  assert.match(pageSource, /conceptIllustrationFor/)
  assert.match(pageSource, /math-concept-illustration/)
  assert.match(pageSource, /withPublicBase/)
  assert.match(pageSource, /conceptIllustrationSrc/)
})
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
npm test -- tests/math-lab-concept-illustrations.test.mjs
```

Expected: FAIL because `src/modules/math-lab/data/conceptIllustrations.ts` does not exist yet.

## Task 2: Add The Typed Prompt Registry

**Files:**
- Create: `src/modules/math-lab/data/conceptIllustrations.ts`
- Test: `tests/math-lab-concept-illustrations.test.mjs`

- [ ] **Step 1: Create the registry type and lookup helper**

Create `src/modules/math-lab/data/conceptIllustrations.ts` with this structure:

```ts
import type { LocalizedCopy, MathLabModuleId, VisualAsset } from '../types/mathLab'

export type ConceptIllustrationStatus = 'prompt-ready' | 'generated'

export interface ConceptIllustration extends Omit<VisualAsset, 'id' | 'type' | 'transcript' | 'learningPurpose'> {
  key: `${MathLabModuleId}:${string}`
  moduleId: MathLabModuleId
  conceptId: string
  status: ConceptIllustrationStatus
  title: LocalizedCopy
  assetPath: string
  prompt: string
  transcript: LocalizedCopy
  learningPurpose: LocalizedCopy
}

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function illustration(input: ConceptIllustration): ConceptIllustration {
  return input
}

export const conceptIllustrations: ConceptIllustration[] = [
  illustration({
    key: 'vectors-matrices-norms:dot-product-cosine-similarity',
    moduleId: 'vectors-matrices-norms',
    conceptId: 'dot-product-cosine-similarity',
    status: 'prompt-ready',
    title: copy('点积与余弦相似度直觉插图', 'Dot product and cosine similarity intuition'),
    assetPath: '/math-lab/concepts/generated/dot-product-cosine-similarity.png',
    alt: copy('两个特征向量的夹角、投影和相似度关系示意', 'Two feature vectors showing angle, projection, and similarity'),
    caption: copy('用夹角和投影建立点积符号、长度和相似度之间的直觉联系。', 'Connect dot-product sign, vector length, and similarity through angle and projection.'),
    transcript: copy('两个向量从同一原点出发，其中一个向量投影到另一个方向，背景有特征空间网格。', 'Two vectors share an origin, one projects onto the other, with a feature-space grid behind them.'),
    learningPurpose: copy('帮助学生把点积从公式读成方向相似度和长度共同作用。', 'Help learners read the dot product as direction similarity combined with length.'),
    prompt: String.raw`Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: a clean courseware illustration of two feature vectors sharing an origin, the angle between them, and one vector casting a soft projection shadow onto the other vector to show cosine similarity
Scene/backdrop: light scientific canvas with a subtle coordinate grid and small feature-space markers
Subject: two high-contrast arrows, a translucent projection band, and a similarity glow that becomes strongest when directions align
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered concept, readable at page-card size
Color palette: deep ink, cyan, amber, white, restrained accents
Constraints: no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic abstract math wallpaper, unreadable labels, photorealistic classroom scenes`,
  }),
]

const conceptIllustrationMap = new Map(conceptIllustrations.map((item) => [item.key, item]))

export function conceptIllustrationFor(moduleId: MathLabModuleId, conceptId: string) {
  return conceptIllustrationMap.get(`${moduleId}:${conceptId}`)
}
```

- [ ] **Step 2: Fill the remaining 46 entries**

For every expected pair in `tests/math-lab-concept-illustrations.test.mjs`, add one complete `illustration({...})` entry. Keep each prompt concrete and concept-specific. Use `status: 'prompt-ready'` until the corresponding PNG has been generated and moved into `public/math-lab/concepts/generated/`.

- [ ] **Step 3: Run prompt metadata tests**

Run:

```bash
npm test -- tests/math-lab-concept-illustrations.test.mjs
```

Expected: The first two tests pass. The generated asset test passes with zero generated entries until image generation begins.

## Task 3: Render Concept Illustrations On The Module Page

**Files:**
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
- Modify: `src/styles/modules/math-lab.css`
- Test: `tests/math-lab-concept-illustrations.test.mjs`

- [ ] **Step 1: Import and resolve concept illustration records**

In `MathLabModulePage.vue`, add:

```ts
import { conceptIllustrationFor, type ConceptIllustration } from '../data/conceptIllustrations'
```

Add helpers near `imageSrc`:

```ts
function conceptIllustration(conceptId: string) {
  return conceptIllustrationFor(moduleDefinition.value?.id ?? moduleId.value, conceptId)
}

function conceptIllustrationSrc(asset?: ConceptIllustration) {
  return withPublicBase(asset?.assetPath)
}
```

- [ ] **Step 2: Render each concept image inside the concept section**

Inside the `v-for="concept in moduleDefinition.concepts"` section, after the `CodeLab`, add:

```vue
<figure
  v-if="conceptIllustration(concept.id)"
  class="math-concept-illustration"
>
  <img
    :src="conceptIllustrationSrc(conceptIllustration(concept.id))"
    :alt="conceptIllustration(concept.id)?.alt?.[currentLocale] ?? conceptIllustration(concept.id)?.title[currentLocale]"
    loading="lazy"
  />
  <figcaption>
    <strong>{{ conceptIllustration(concept.id)?.title[currentLocale] }}</strong>
    <MarkdownMathContent
      :source="conceptIllustration(concept.id)?.caption?.[currentLocale] ?? conceptIllustration(concept.id)?.transcript[currentLocale] ?? ''"
    />
  </figcaption>
</figure>
```

- [ ] **Step 3: Add responsive styling**

Append to `src/styles/modules/math-lab.css` near `.math-visual-asset`:

```css
.math-concept-illustration {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
}

.math-concept-illustration img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  object-fit: cover;
  background: #0c1628;
}

.math-concept-illustration figcaption {
  display: grid;
  gap: 6px;
  color: var(--muted);
  line-height: 1.55;
}

.math-concept-illustration figcaption strong {
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 1rem;
}
```

- [ ] **Step 4: Run the page wiring test**

Run:

```bash
npm test -- tests/math-lab-concept-illustrations.test.mjs
```

Expected: PASS.

## Task 4: Generate And Store Batch Images

**Files:**
- Modify: `src/modules/math-lab/data/conceptIllustrations.ts`
- Create: `public/math-lab/concepts/generated/*.png`

- [ ] **Step 1: Generate Batch 1 images with the built-in image tool**

Generate images for these concept IDs:

```text
dot-product-cosine-similarity
matrix-as-linear-transform
induced-matrix-norm
linear-layer-shape-contract
broadcasting-compatibility
taylor-polynomial
taylor-remainder
local-linearization
vjp-jvp
monte-carlo-estimator-core
```

Use the exact prompt from each registry entry. After each accepted output, move the image into:

```text
public/math-lab/concepts/generated/<concept-id>.png
```

Then change each accepted entry from:

```ts
status: 'prompt-ready',
```

to:

```ts
status: 'generated',
```

- [ ] **Step 2: Verify Batch 1 assets**

Run:

```bash
npm test -- tests/math-lab-concept-illustrations.test.mjs
```

Expected: PASS, including local file existence for the generated Batch 1 entries.

- [ ] **Step 3: Repeat for Batch 2**

Generate and mark these concept IDs:

```text
softmax-cross-entropy
kl-divergence
lu-factorization-core
lup-pivoting-core
sparse-nnz-core
sparse-csr-rowptr-core
condition-number-core
residual-error-bound
eigenpair
characteristic-polynomial
rayleigh-quotient
```

Run the same test command and expect PASS.

- [ ] **Step 4: Repeat for Batch 3**

Generate and mark these concept IDs:

```text
markov-property-core
markov-transition-matrix-core
markov-stationary-pagerank-core
finite-difference-derivative-core
finite-difference-error-balance
finite-difference-gradient-jacobian
nonlinear-root-residual
newton-step
multidimensional-newton
optimization-minimizer
optimization-steepest-descent
optimization-newton-step
gradient-update-diagnostics
validation-gap
```

Run the same test command and expect PASS.

- [ ] **Step 5: Repeat for Batch 4**

Generate and mark these concept IDs:

```text
least-squares-residual-objective
least-squares-normal-equations
least-squares-svd-pseudoinverse
singular-value-decomposition
rank-from-singular-values
svd-pseudoinverse
svd-low-rank
pca-centered-projection
pca-covariance-diagonalization
pca-svd-explained-variance
convolution-output-size
scaled-dot-product-attention
```

Run the same test command and expect PASS.

## Task 5: Add Prompt Documentation

**Files:**
- Create: `docs/math-lab-concept-illustration-prompts.md`

- [ ] **Step 1: Write the prompt record**

Create `docs/math-lab-concept-illustration-prompts.md` with:

```markdown
# Math Lab Concept Illustration Prompts

Generated for the Math Lab concept illustration upgrade on 2026-05-19.

The source of truth for runtime metadata is `src/modules/math-lab/data/conceptIllustrations.ts`.

## Policy

- One illustration per current typed `MathConcept`.
- Images are intuition anchors only; exact formulas remain in KaTeX, deterministic SVG, Canvas, Three.js, or Manim.
- Prompts avoid long generated text, formulas, logos, and watermark-like marks.
- Final project assets are stored in `public/math-lab/concepts/generated/`.

## Batches

Batch 1 covers vectors, tensor shapes, Taylor series, autodiff, and Monte Carlo.
Batch 2 covers probability, LU, sparse matrices, condition numbers, and eigen concepts.
Batch 3 covers Markov chains, finite differences, nonlinear equations, optimization, and diagnostics.
Batch 4 covers least squares, SVD, PCA, and deep architecture math.
```

Then add a generated list from the registry entries, grouped by module.

- [ ] **Step 2: Verify the doc has no unfinished markers**

Run:

```powershell
Select-String -Path docs\math-lab-concept-illustration-prompts.md -Pattern "NEEDS_CONTENT|FILL_ME" -CaseSensitive
```

Expected: no output.

## Task 6: Full Verification And Completion Audit

**Files:**
- Inspect all modified files and generated assets.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Audit objective coverage**

Confirm with real evidence:

```powershell
Get-ChildItem public\math-lab\concepts\generated -Filter *.png | Measure-Object
Select-String -Path src\modules\math-lab\data\conceptIllustrations.ts -Pattern "status: 'generated'" | Measure-Object
Select-String -Path src\modules\math-lab\data\conceptIllustrations.ts -Pattern "key: '" | Measure-Object
git -c safe.directory='D:/vue练习/ML_tutorial_Site' status --short
```

Expected:

- 47 PNG files.
- 47 generated statuses.
- 47 registry keys.
- Only files related to this task are modified or untracked.
