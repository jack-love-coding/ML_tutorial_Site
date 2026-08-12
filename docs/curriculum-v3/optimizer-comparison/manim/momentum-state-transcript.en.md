# Momentum state animation: English transcript

The video is language-neutral. This timed text, markers, and poster are the complete fallback.

## 0:00–0:09

The square is the current parameter position. Momentum stores a velocity `v_t` as well as the current gradient.

## 0:09–0:18

`v_t=0.9v_{t-1}+g_t` combines earlier direction with the current gradient; `\theta_{t+1}=\theta_t-\eta v_t` then updates parameters. The card is a fixed shared-engine trace.

## 0:18–0:27

As the square turns through the valley, velocity retains part of the earlier direction. Accumulation is a state rule, not just a new color.

## 0:27–0:36

The star marks lower loss. Momentum state changes the next step, but suitability still depends on task, learning rate, and comparison policy.
