# Phase 6 Decision: Teaching Interaction Protocol

Date: 2026-06-25

## Context

The pilot lessons now share a `LessonPage` shell, but their interactions still varied in teaching clarity. Some labs were strong simulations, while others could still read like static switching surfaces unless the page explicitly asked learners to predict, manipulate, observe, and explain.

The milestone brief defined an effective interaction as more than a tab click. Core interactions should state a learning goal, prediction prompt, manipulable variables, observable metrics, success criteria, reflection prompt, and evidence.

## Decision

Add a typed Teaching Interaction Protocol registry for the three LessonPage pilots:

- AI Overview: task decomposition.
- Gradient Descent: safe learning-rate search.
- MLP: XOR capacity and generalization reading.

Render each protocol as a lightweight task panel inside the shared lesson block before the specialized lab. The protocol is a teaching layer over existing lab behavior, not a replacement for lab internals or a new persistence model.

## Implementation Rules

- Keep protocols typed and bilingual in `src/lessons/interactionProtocol.ts`.
- Keep one core protocol anchor per pilot module during this phase to avoid repeated task panels in the story scroller.
- Require L4/L5 interaction framing for pilots: prediction, manipulation, observable evidence, success criteria, and explanation.
- Do not persist learner-written evidence in this phase.
- Do not bulk-redesign workflow labs, Classification, CNN, Attention, or RAG during this phase.
- Keep the protocol renderer separate from lab internals so future labs can adopt it through data, not page-specific branches.

## Verification

Phase 6 adds `tests/teachingInteractionProtocol.test.ts` to validate:

- Pilot coverage.
- Bilingual protocol fields.
- Manipulable variables.
- Observable metrics.
- Success criteria.
- Evidence shape.
- Explanation evidence.
- LessonPage/BlockRenderer wiring.
