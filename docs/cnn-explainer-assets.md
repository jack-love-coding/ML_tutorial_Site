# CNN Explainer Asset Record

This note tracks the local Tiny VGG assets used by the `cnn-visualization` module.

## Upstream Source

- Project: CNN Explainer by Polo Club of Data Science.
- Repository: https://github.com/poloclub/cnn-explainer
- Live reference: https://poloclub.github.io/cnn-explainer/
- Paper: https://arxiv.org/abs/2004.15004
- Upstream commit checked during import: `d0971f9447ed9806022a3d47587b62394682bc51`
- Upstream commit date: `2023-10-14T15:56:25Z`
- License: MIT. A copy is kept at `public/cnn-explainer/tiny-vgg/LICENSE`.

## Local Runtime Assets

| Local file | Upstream file | Purpose |
| --- | --- | --- |
| `public/cnn-explainer/tiny-vgg/model.json` | `public/assets/data/model.json` | TensorFlow.js Layers model topology and weights manifest. |
| `public/cnn-explainer/tiny-vgg/group1-shard1of1.bin` | `public/assets/data/group1-shard1of1.bin` | Tiny VGG weight shard loaded by the model manifest. |
| `public/cnn-explainer/tiny-vgg/LICENSE` | `LICENSE` | MIT license notice for copied assets. |

The class labels used in `src/utils/cnnExplainer.ts` follow the upstream `src/config.js` class list:
`lifeboat`, `ladybug`, `pizza`, `bell pepper`, `school bus`, `koala`, `espresso`, `red panda`, `orange`, `sport car`.

## Import Boundaries

- The Vue implementation does not copy the upstream Svelte UI. It recreates the overview/detail teaching pattern with project-local Vue, TypeScript, D3/SVG, and existing ML Atlas styles.
- Upstream sample JPEG images were not migrated because their Tiny ImageNet image licensing is not tracked in this repository. The lesson uses a generated local demo image plus user-uploaded local images instead.
- Runtime model paths use project-local public URLs and should be passed through `withPublicBase` so GitHub Pages builds load from `/ML_tutorial_Site/cnn-explainer/tiny-vgg/`.
- If the model assets are updated, update this file, `docs/ml-atlas-references.md`, and the CNN utility tests in the same change.
