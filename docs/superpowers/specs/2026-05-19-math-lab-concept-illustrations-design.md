# Math Lab Concept Illustrations Design

Date: 2026-05-19

## Objective

Improve the Math Lab illustration system by designing GPT image prompts and generating project-bound course illustrations for every current typed knowledge point. The user selected the phased hybrid approach: create the full prompt plan first, then generate and wire the images in module batches.

## Scope

The target inventory is the current Math Lab learning path:

- 19 modules from `vectors-matrices-norms` through `deep-architecture-math`.
- 47 typed `MathConcept` entries found in `src/modules/math-lab/data/**`.
- One concept-level raster illustration per `MathConcept`.

Existing Manim videos, deterministic SVG/Canvas labs, and imported CS357 figures remain in place. The new images are support illustrations, not replacements for formulas, interactive labs, or deterministic plots.

## Deliverables

1. A typed concept illustration registry that maps each `moduleId` and `conceptId` to:
   - final image prompt intended for GPT image generation,
   - image filename,
   - localized title, alt text, caption, and learning purpose,
   - generation status metadata.
2. Generated PNG assets stored under `public/math-lab/concepts/generated/`.
3. Page wiring so each concept illustration appears near the matching formula-focus concept.
4. Tests that verify:
   - every current `MathConcept` has exactly one registry entry,
   - every registry entry references an existing local image file once generation is complete,
   - every concept-level visual uses a public path compatible with `withPublicBase`,
   - the module page renders concept illustrations without eager-loading lab components.
5. A source and generation record in `docs/`, including the prompt policy and any known image quality limitations.

## Illustration Principles

Each image should be a meaningful teaching aid:

- Show the concept's job in a learner-visible system, not a generic decorative math background.
- Prefer text-free visual anchors. If labels are needed, keep them sparse and generic because generated text can be unreliable.
- Use a consistent ML Atlas courseware look: clean 16:9 educational illustration, high contrast, restrained palette, no logos, no watermark.
- Tie the image to variables or relationships from the concept formula, but leave exact formulas to KaTeX and deterministic content.
- Make the visual useful alongside the existing interactive lab: the image should prime intuition, while the lab handles precise manipulation.

## Prompt Schema

Each registry entry will store a prompt using this structure:

```text
Use case: infographic-diagram
Asset type: ML Atlas Math Lab concept illustration
Primary request: <concept-specific teaching scene>
Scene/backdrop: clean courseware canvas with subtle grid or lab surface
Subject: <main mathematical objects and their relationship>
Style/medium: polished vector-like educational illustration, raster PNG
Composition/framing: 16:9, centered concept, readable at page-card size
Color palette: high-contrast scientific palette, restrained and consistent
Constraints: no formulas, no long text, no logos, no watermark, no decorative filler
Avoid: generic abstract math wallpaper, unreadable labels, photorealistic classroom scenes
```

## Architecture

Add a small data module, likely `src/modules/math-lab/data/conceptIllustrations.ts`, exporting typed records. Module builders can merge matching records into `MathConcept` or the page can resolve records by `moduleId` plus `conceptId`.

The least invasive page change is to keep module definitions stable and let `MathLabModulePage.vue` resolve concept illustrations from the registry while rendering the concept section. This avoids editing every builder file and keeps prompt metadata in one auditable location.

The image assets live in `public/math-lab/concepts/generated/` and are referenced with absolute public paths such as `/math-lab/concepts/generated/dot-product-cosine-similarity.png`.

## Data Flow

1. Extract `moduleId`, module title, `concept.id`, concept name, formula, and model connection from existing typed data.
2. Create one prompt entry for each concept.
3. Generate images in batches following `mathLabModules` order.
4. Move selected outputs from the image generation default location into `public/math-lab/concepts/generated/`.
5. Render each concept image in the formula-focus concept section with localized alt and caption.
6. Tests verify the registry and asset coverage.

## Batch Plan

Batch 1:

- `vectors-matrices-norms`
- `tensor-shapes-vectorization`
- `taylor-series`
- `matrix-calculus-autodiff`
- `monte-carlo`

Batch 2:

- `probability-likelihood-entropy`
- `lu-decomposition`
- `sparse-matrices`
- `condition-numbers`
- `eigenvalues-eigenvectors`

Batch 3:

- `markov-chains`
- `finite-difference-methods`
- `nonlinear-equations`
- `optimization`
- `training-diagnostics`

Batch 4:

- `least-squares-fitting`
- `svd`
- `pca`
- `deep-architecture-math`

## Error Handling

- If image generation creates text artifacts, keep formulas and detailed labels out of the prompt and regenerate with a stricter "no text" constraint.
- If an image is visually generic, rewrite the prompt around the concept's concrete relationship before accepting it.
- If a generated image is useful but contains minor imprecision, caption it as intuition only and ensure deterministic formulas/labs carry the exact content.
- Do not overwrite existing generated assets unless the task explicitly requires replacement.

## Testing And Verification

Run, at minimum:

```bash
npm test
```

Run `npm run build` after page wiring or TypeScript changes. For final completion, audit the actual file list and registry count against the 47-concept inventory rather than relying only on passing tests.

## Out Of Scope

- Replacing Manim videos.
- Rebuilding imported CS357 note content.
- Adding a new UI framework.
- Using generated images for exact formulas, charts, or coordinate plots that should remain deterministic.

