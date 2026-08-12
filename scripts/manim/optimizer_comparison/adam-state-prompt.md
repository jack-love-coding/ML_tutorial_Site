# Manim Animation: Adam state

## Overview

Create a language-neutral 40-second 1920×1080 30fps beginner animation. Build from a gradient and its magnitude to first/second moments and time-index correction, then show `m_t, v_t -> \hat m_t,\hat v_t; \theta_{t+1}=\theta_t-\eta\hat m_t/(\sqrt{\hat v_t}+\epsilon)`. Use the shared PR1 practical trajectory anchor directly. Keep Adam distinct from L2 and AdamW claims; this short animation explains state only.

## Visual contract

Use the common terrain but a **diamond** parameter marker. Couple it to the text `m_t, v_t, t`, a visible route, and the star minimum; no meaning may rely on color alone. Avoid camera movement, rapid flashes, audio assumptions, or unlabelled numeric claims. The SVG poster, markers, and bilingual transcript are first-class teaching fallbacks.

## Scene sequence

0:00–0:09: Fade in the terrain, diamond legend, and complete moment/correction formula. Give a calm pause so the learner can identify all three state terms.

0:09–0:18: Add the deterministic shared-engine card with step-one update norm and loss. The transcript explains why corrected moments use a time step.

0:18–0:27: Move the diamond through the valley, indicating the `m_t, v_t, t` card. The position path is a visual consequence of state, not a claim that this optimizer always wins.

0:27–0:40: Arrive at the marked minimum and hold `\theta_t \rightarrow \theta_{t+1}`. Keep exact raw LaTeX and poster-compatible layout.
