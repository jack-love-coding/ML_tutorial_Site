# Manim Animation: Linear score to sigmoid probability

## Overview

**Estimated Duration:** 42 seconds

**Progression:** real-number score → weighted sum → log-odds → sigmoid → canonical Banknote row. The animation is language-neutral: use only mathematical notation, number labels, arrows, dots, solid and dashed guides. The paired Chinese and English transcripts carry all prose.

## Global visual contract

- Use Manim Community Edition. Every formula is `MathTex(r"...")`; do not put natural-language teaching text inside the movie.
- Semantic palette: score `#285c9e` / `BLUE`, probability `#2e7d4f` / `GREEN`, neutral structure `WHITE`. A solid circular dot always means the evaluated score; the probability map is always a thick smooth curve; the default bridge is a dashed guide.
- Load `phase29-linear-score` and `phase29-sigmoid-probability` from the Phase 29 manifest. Display `row_id=1`, `z=-54.33776892070457`, and `p=2.520036312527197e-24` only after formatting values from that loader.
- The final still must be poster-complete: formula, score-to-probability curve, p=0.5 guide, and canonical-value card remain visible for at least 2 seconds.

## Scene sequence

### Scene 1: Weighted score on a number line

**Timestamp:** 0:00–0:10

Open by writing `MathTex(r"z=\\mathbf{w}^{\\top}\\mathbf{x}+b")` in BLUE at the top center over 1.5 seconds. Place `MathTex(r"z=\\log\\frac{p}{1-p}")` below it at 72% scale. Fade in a WHITE number line from x=-5.7 to x=5.7 in the lower third, with a solid white zero tick at the center. Create a BLUE solid circular score marker at the far left, label it with the manifest-formatted `MathTex(r"z=-54.34")`, and draw a BLUE dashed guide from the marker toward zero. Keep the score’s extreme location explicit rather than pretending it lies near the origin. Hold 1 second.

### Scene 2: From an unbounded score to a bounded range

**Timestamp:** 0:10–0:21

Fade out only the number-line group. Fade in coordinate axes shifted slightly right: x spans -8 to 8 and y spans 0 to 1. Create a GREEN sigmoid curve defined by `1/(1+exp(-z))` over 3 seconds. Draw a WHITE dashed horizontal p=0.5 guide. Fade in a WHITE circular point at z=0 and write `MathTex(r"z=0\\Longleftrightarrow p=0.5")` directly above it. Transform the former BLUE score marker into a BLUE dot pinned at the visible left edge of the curve, visually signaling that the actual score is beyond the displayed range. Hold 1 second.

### Scene 3: Canonical row value

**Timestamp:** 0:21–0:32

At the bottom, fade in a BLUE outlined rectangle and then write `MathTex(r"\\sigma(-54.34)=2.52\\times10^{-24}")` in GREEN centered within the card. Use the same loaded value that is written in the transcript and scene source. Do not use class semantics beyond the data’s numeric label. Briefly indicate the dashed p=0.5 line, then the solid score dot, so a learner can see that the sign of z determines which side of the default bridge the row occupies. Pause 1 second with all elements visible.

### Scene 4: Static conclusion

**Timestamp:** 0:32–0:42

Keep the formula, log-odds equation, sigmoid curve, p=0.5 guide, edge dot, and numeric card together. Use a short 0.8-second emphasis pulse on the curve followed by the score card; no autoplay-dependent movement remains. Preserve this arrangement unchanged through 0:42 for a readable poster frame. Fade nothing before the final frame.

## Transition and accessibility notes

The equation remains at the top across all segments, making the transition a change of representation rather than a replacement of the concept. Solid/dashed strokes, curve/point geometry, numeric labels, and transcripts duplicate every color cue. No audio or language-specific screen text is required.
