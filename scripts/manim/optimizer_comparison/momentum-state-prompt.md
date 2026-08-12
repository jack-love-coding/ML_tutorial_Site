# Manim Animation: Momentum state

## Overview

Create a language-neutral, 40-second, 1920×1080, 30fps beginner animation. Progress from the gradient direction to accumulated velocity and then the Momentum update `v_t=0.9v_{t-1}+g_t; \theta_{t+1}=\theta_t-\eta v_t`. The numeric card must be read from the shared PR1 practical trace. The web player contributes bilingual narration, so do not claim that a visible language is the only explanation.

## Visual contract

Use the same terrain geometry as SGD but a **square** parameter marker. Pair the square with the visible `v_t` label and path; shape, text, and spatial position must distinguish it without color. Retain a calm pace, one outcome at a time, a static SVG poster, and no reliance on motion for the conclusion.

## Scene sequence

0:00–0:09: Introduce the terrain and show the velocity recurrence above it. Place the square at the start and identify it as the parameter position.

0:09–0:18: Reveal the shared-engine step-one update norm and loss card. Explain through the transcript that velocity combines a previous direction with the current gradient.

0:18–0:27: Animate the square through the turning valley path. Indicate `v_t` while it moves, so the learner sees that the state remembers direction rather than merely changing a color.

0:27–0:40: Settle at the marked minimum, retain the formula, and hold `\theta_t \rightarrow \theta_{t+1}`. Use raw Manim LaTeX and exact controlled timings.
