# Math Lab AI Foundation Sources

This maintenance note tracks the source mapping and generated media for the five AI bridge math modules. These references are for maintainers only. Student-facing module pages should not render a source panel.

## Shared Boundaries

- Public courses and books were used for coverage checks, terminology alignment, and sequencing only.
- Lesson copy is rewritten as original bilingual teaching content. Do not paste course prose or screenshots into module sections.
- Generated concept images are text-free anchors. They must not carry formulas, axes, UI labels, or translatable text.
- Manim videos are process visuals. Formulas, coordinates, and explanatory prose should remain in Vue, SVG, D3, Three.js, Markdown, or KaTeX.

## Module Map

| Module | Internal sources | Generated image | Manim video |
|---|---|---|---|
| `tensor-shapes-vectorization` | D2L Preliminaries; Mathematics for Machine Learning | `public/math-lab/ai-bridge/generated/tensor-shape-pipeline.png` | `public/manim/math-ai/tensor-broadcasting.mp4` |
| `matrix-calculus-autodiff` | MIT 18.S096; Mathematics for Machine Learning; Stanford CS229; Stanford CS231n | `public/math-lab/ai-bridge/generated/autodiff-local-linearization.png` | `public/manim/math-ai/autodiff-vjp-flow.mp4` |
| `probability-likelihood-entropy` | D2L Preliminaries; Google ML Crash Course; Mathematics for Machine Learning; Stanford CS229 | `public/math-lab/ai-bridge/generated/probability-simplex.png` | `public/manim/math-ai/softmax-cross-entropy.mp4` |
| `training-diagnostics` | Google ML Crash Course; D2L Preliminaries; Stanford CS231n | `public/math-lab/ai-bridge/generated/training-diagnostics-dashboard.png` | `public/manim/math-ai/training-loss-diagnostics.mp4` |
| `deep-architecture-math` | Stanford CS231n; Stanford CS224N; D2L Preliminaries | `public/math-lab/ai-bridge/generated/architecture-stack.png` | `public/manim/math-ai/attention-conv-residual.mp4` |

## Public Source Records

- D2L Preliminaries, `https://d2l.ai/chapter_preliminaries/index.html`, CC BY-SA 4.0: tensor notation, linear algebra, autodiff, probability, and optimization coverage order.
- MIT 18.S096 Matrix Calculus, `https://ocw.mit.edu/courses/18-s096-matrix-calculus-for-machine-learning-and-beyond-january-iap-2023/`: local linearization, Jacobian language, and matrix-calculus framing.
- Mathematics for Machine Learning, `https://mml-book.github.io/`: concept boundaries for linear algebra, vector calculus, probability, optimization, and PCA.
- Google Machine Learning Crash Course, `https://developers.google.com/machine-learning/crash-course`, CC BY 4.0: beginner-facing loss, probability, generalization, and diagnostics framing.
- Stanford CS231n Notes, `https://cs231n.github.io/`: backpropagation, CNN, optimization, and training-practice organization.
- Stanford CS224N, `https://web.stanford.edu/class/cs224n/`: self-attention, Transformer, and NLP architecture math.
- Stanford CS229 Notes, `https://cs229.stanford.edu/main_notes.pdf`: maximum likelihood, probabilistic models, logistic regression, backpropagation, and PCA derivation boundaries.

## Generated Image Prompt Summaries

- `tensor-shape-pipeline.png`: text-free matrix/tensor pipeline showing batch tiles moving through a weight grid and bias stream into output activations.
- `autodiff-local-linearization.png`: text-free local surface and tangent-plane metaphor with a backward responsibility path.
- `probability-simplex.png`: text-free probability simplex with moving mass, entropy spread, and asymmetric divergence hints.
- `training-diagnostics-dashboard.png`: text-free training curves, gradient pulses, and widening validation gap dashboard motif.
- `architecture-stack.png`: text-free composition of convolution windows, attention links, multi-head lanes, residual bypass, and normalization flow.

## Regeneration

- Re-run `python scripts\manim\render_ai_bridge.py --skip-render` after poster or metadata changes.
- Re-run `python scripts\manim\render_ai_bridge.py` after Manim scene changes.
- Keep `sourceReferences` in `src/modules/math-lab/data/aiBridgeModules.ts` synchronized with this file.
