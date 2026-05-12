# MLP Redesign Sources and Asset Notes

This document tracks the public references, rewrite boundaries, and generated assets used for the MLP module redesign.

## Source Policy

- Main technical structure: Dive into Deep Learning, "Multilayer Perceptrons", "Backpropagation", and "Generalization in Deep Learning".
- Beginner intuition: Google Machine Learning Crash Course pages on hidden layers and activation functions.
- Supplemental non-commercial reference: OpenStax Principles of Data Science, section 7.1, "Introduction to Neural Networks".
- Interaction reference: TensorFlow Playground and `tensorflow/playground` on GitHub.
- Production implementation: written as native Vue and TypeScript for this project. The TensorFlow Playground interface is used as an interaction reference only; the legacy D3 application is not embedded or copied.

## License Notes

- D2L is used as a conceptual and mathematical reference. Site copy is rewritten and condensed for this course flow.
- Google MLCC is used for beginner-level intuition around nodes, hidden layers, and activation functions. Site copy is rewritten.
- OpenStax content is CC BY-NC-SA. Because it is non-commercial, this module keeps explicit attribution wherever OpenStax is referenced and does not use long verbatim passages.
- TensorFlow Playground source is Apache-2.0. This redesign does not import the original implementation; it recreates the learning experience with project-local code.

## Chapter Mapping

| Chapter | Main references | Rewrite scope |
|---|---|---|
| Linear limits and XOR motivation | D2L MLP, Google MLCC hidden layers, TensorFlow Playground | Reframed as the bridge from logistic regression limits to hidden representations. |
| Neuron and affine transform | D2L MLP, OpenStax neural networks | Rewritten around one-neuron score calculation and bias as a movable threshold. |
| Activation functions | D2L MLP, Google MLCC activation functions | Reorganized by behavior: bounded, sparse, smooth, or identity. |
| Hidden representation and feature recomposition | D2L MLP, TensorFlow Playground | Reframed around geometry rewriting and node heatmaps. |
| Forward propagation and output layer | D2L Backpropagation | Condensed to the minimal computation graph needed for the lab. |
| Backpropagation and chain rule | D2L Backpropagation, OpenStax neural networks | Rewritten as responsibility assignment through local derivatives. |
| Training dynamics and diagnostics | D2L Backpropagation, TensorFlow Playground | Focused on learning rate, batch size, noise, loss curves, and gradients. |
| Capacity, regularization, and generalization | D2L Generalization, OpenStax neural networks | Reframed as model capacity versus validation behavior, with L1/L2 controls. |

## Image Assets

Generated bitmap assets are stored in `public/mlp/generated/`. They intentionally contain no embedded text; all labels and explanations live in HTML content for localization and accessibility.

| Asset | Prompt summary |
|---|---|
| `affine-activation-map.png` | Abstract educational illustration of a 2D input plane, linear score field, neuron gate, and smooth activation response. |
| `hidden-space-rewrite.png` | Conceptual visualization of tangled input classes becoming separable after a hidden representation transform. |
| `backprop-responsibility.png` | Layered neural network with a loss signal flowing backward through weighted connections. |
| `capacity-generalization.png` | Three side-by-side decision-boundary panels showing underfit, balanced fit, and overfit behavior. |

## Manim Assets

Rendered videos are stored in `public/manim/mlp/` and produced by `scripts/manim/render_mlp.py`.

| Video | Scene | Purpose |
|---|---|---|
| `affine-activation.mp4` | `AffineActivationScene` | Show a linear score passing through a nonlinear activation. |
| `hidden-rewrite.mp4` | `HiddenRewriteScene` | Show hidden layers turning crossed classes into a simpler separable layout. |
| `backprop-responsibility.mp4` | `BackpropResponsibilityScene` | Show forward computation and backward loss responsibility. |
| `capacity-overfitting.mp4` | `CapacityOverfittingScene` | Compare underfit, balanced, and overfit boundaries. |

## Maintenance Checklist

- Keep chapter `sources` in `src/data/mlpModule.ts` aligned with this document.
- Keep generated visual paths in `mlpVisuals` synchronized with `public/mlp/generated/` and `public/manim/mlp/`.
- Re-run `python scripts\manim\render_mlp.py --skip-render` after metadata or poster edits.
- Re-run `python scripts\manim\render_mlp.py` after scene edits.
