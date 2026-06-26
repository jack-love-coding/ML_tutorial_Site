# Phase 5 Decision: Pilot LessonPage and Block Renderer

Date: 2026-06-25

## Context

Algorithm lesson pages had accumulated page-specific branches for AI Overview, Gradient Descent, and MLP. Each branch mixed story rendering, lab placement, source panels, guide copy, visual assets, and fallback layout in `AlgorithmView.vue`. This made the pilot lessons harder to compare and made future lesson cleanup risky because the shared lesson shell was implicit instead of named.

## Decision

Introduce a generic `LessonPage` shell and `LessonBlockRenderer` for the common teaching surface, but keep specialized experiments behind a small lab registry. The first migration is limited to three pilots:

- `ai-overview`
- `gradient-descent`
- `mlp`

The shared shell owns section scrolling, localized titles, guide panels, optional visual/source blocks, and lab slots. The registry owns which specialized lab appears, where it appears, and which block render mode is needed.

## Implementation Rules

- Do not bulk-migrate all algorithm modules in this phase.
- Do not rewrite specialized lab internals just to fit a generic renderer.
- Keep lab placement explicit through `src/lessons/labRegistry.ts`.
- Keep Gradient Descent's richer teaching blocks as a named render mode instead of another `AlgorithmView.vue` branch.
- Keep MLP's top cockpit placement explicit so the story still opens with the interactive XOR playground.
- Use the same section title fallback path in generic result panels to avoid missing translation warnings for title literals.

## Verification

Phase 5 adds `tests/lessonPagePilot.test.ts` to protect the pilot registry, shared shell, block renderer, and removal of old explicit pilot branches from `AlgorithmView.vue`.
