# SGD state animation: English transcript

The video is language-neutral. This timed text, the markers, and the poster preserve the full teaching message.

## 0:00–0:09

Contours are a loss landscape. The circle is the current parameter position, and `g_t` points in the locally steepest uphill direction.

## 0:09–0:18

SGD uses `\theta_{t+1}=\theta_t-\eta g_t`: take one step opposite the gradient. The card is a reproducible shared-engine practical-trace anchor, not a universal recommendation.

## 0:18–0:27

The circle moves downhill. `\eta` controls the step length; at this moment SGD keeps no additional history beyond the current gradient.

## 0:27–0:36

The star marks a lower-loss position. Different stored state can propose a different next step, and no optimizer is best for every problem.
