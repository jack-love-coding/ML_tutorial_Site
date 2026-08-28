# From linear score to probability

## 0:00–0:10

One Banknote row first computes $z=\mathbf{w}^{\top}\mathbf{x}+b$. Each $w_jx_j$ and the intercept are inspectable contributions.

## 0:10–0:21

$z$ is the class 1 log-odds: $z=\log\frac{p}{1-p}$. It can be any real number, so it is not yet a probability.

## 0:21–0:32

The sigmoid compresses the score to $(0,1)$. $z=0$ maps exactly to $p=0.5$; this is a default decision bridge, not the training objective.

## 0:32–0:42

An extreme negative score produces a class 1 probability very near 0. The displayed values come from the published real-row asset; a solid dot, dashed guide, and numeric card carry the same message in the static poster.
