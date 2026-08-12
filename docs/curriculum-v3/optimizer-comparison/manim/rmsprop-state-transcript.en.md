# RMSProp state animation: English transcript

The video is language-neutral. This timed text, markers, and poster are the complete fallback.

## 0:00–0:09

The triangle is the current parameter position. RMSProp stores squared-gradient history `s_t` to estimate scale in different directions.

## 0:09–0:18

`s_t=0.95s_{t-1}+0.05g_t^2`; the update divides by `\sqrt{s_t}+\epsilon`. The numerical card is the shared-engine fixed practical-trace anchor.

## 0:18–0:27

The triangle moves along its path. Larger squared-gradient history reduces the effective step in that direction; it is a scale adjustment, not a guarantee for every landscape.

## 0:27–0:36

The star is lower loss. State changes the next step, while fair comparison still needs predeclared conditions.
