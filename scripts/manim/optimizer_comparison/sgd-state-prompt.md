# Manim Animation: SGD state

## Overview

Create a language-neutral, 36-second, 1920×1080, 30fps animation for beginner learners. Build the target concept from a loss landscape and a gradient direction to the update `\theta_{t+1}=\theta_t-\eta g_t`. Do not use narration-dependent text: the web player supplies localized transcripts. The path is the first practical SGD trajectory idea, and the numerical card must read the shared engine JSON rather than repeat a hand-authored number.

## Visual contract

Use pale nested contours, a **circle** parameter marker, a solid dark path, and a star minimum. The circle shape, the words `g_t`, and the path encode roles independently of color. Keep a labelled state card on the right. No flashing, no rapid camera motion, and every transition must remain understandable in the poster and transcript fallback.

## Scene sequence

0:00–0:09: Fade in title, exact equation, contours, circle legend, and a start position. The learner should read the gradient as the local uphill direction before an update happens.

0:09–0:18: Draw the path toward the valley and reveal the shared-engine card: step 1 update norm and loss after step 1. State that the card is a deterministic trace anchor, not a universal setting.

0:18–0:27: Move the circle along the first turn. Indicate the `g_t` state card. Hold long enough for a learner to connect `-\eta g_t` with moving downhill.

0:27–0:36: Move to the minimum and show the conclusion `state changes the next step`. Pause on the completed path. Render with Manim Community Edition; use raw strings for all LaTeX.
