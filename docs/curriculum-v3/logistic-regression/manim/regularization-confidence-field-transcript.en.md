# Aligned unregularized parity, then an L2 objective change

## 0:00–0:10

First fix train-only standardization, feature order, and the unregularized stable BCE: $L_{BCE}=\operatorname{mean}(\operatorname{softplus}(z)-yz)$. Scratch training stops on the gradient norm at iteration $90542$, with terminal BCE $0.011867429046995634$. This is the comparison baseline, not an implicit library default.

## 0:10–0:20

Align scratch and scikit-learn: the same preprocessing, intercept treatment, feature order, unregularized objective, stopping rule, and tolerance. The declared library configuration is `lbfgs`, $C=\infty$, and $\mathrm{tol}=10^{-12}$. It yields $|\Delta_\theta|_{max}=0.00015996734427758952$ and $|\Delta_p|_{max}=8.860994619164231\times10^{-7}$. Those small differences establish numerical agreement only for the declared configurations.

## 0:20–0:29

Only then does the problem change: $L_{L2}=L_{BCE}+\lambda\lVert w\rVert_2^2/2$, with $\lambda=0.05$. The published L2 objective is $0.3463182734496942$, and the intercept is not penalized. Shorter coefficient bars and a dashed confidence field show the result of the new objective, not that L2 is always better.

## 0:29–0:38

A fair comparison states data, preprocessing, objective, parameters, and stopping rule first. The same data do not imply the same objective, and neither coefficients nor confidence fields are causal effects here. The static poster retains both objectives, parity readings, solid/dashed fields, and the intercept label for reduced motion and media failure.
