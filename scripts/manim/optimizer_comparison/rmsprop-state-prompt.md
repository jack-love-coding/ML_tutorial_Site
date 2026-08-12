# Manim Animation: RMSProp state

## Overview

Create a language-neutral 40-second 1920×1080 30fps animation. Build from gradient magnitude to squared-gradient history and the RMSProp update `s_t=0.95s_{t-1}+0.05g_t^2; \theta_{t+1}=\theta_t-\eta g_t/(\sqrt{s_t}+\epsilon)`. Read the visible shared-engine anchor from the PR1 trajectory file and never duplicate a separate numerical authority.

## Visual contract

Use nested contours, a **triangle** parameter marker, a solid path, a labelled `s_t` state card, and a star minimum. The triangle, label, and path are all required because hue is not the sole encoding. Preserve enough quiet pauses for reduced-motion readers to use the poster and transcript as a complete fallback.

## Scene sequence

0:00–0:09: Reveal terrain and the exact RMSProp formula. The triangle starts high on the contour map; introduce squared gradients as scale information.

0:09–0:18: Reveal the deterministic anchor card. The transcript distinguishes a predeclared practical setting from a norm-matched comparison; the animation must not imply a universal winner.

0:18–0:27: Move the triangle through a path while indicating `s_t`; show that the denominator changes the effective step size by coordinate history.

0:27–0:40: Finish at the minimum with `\theta_t \rightarrow \theta_{t+1}`, leave the formula readable, and hold. Use only Manim Community primitives and raw LaTeX strings.
