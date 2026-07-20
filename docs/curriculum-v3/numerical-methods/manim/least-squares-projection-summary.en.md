# Ames least-squares projection — English summary

This silent Simplified-Chinese video follows the local 2,927-row Ames snapshot into an unweighted, unregularized least-squares model. Five standardized features and an intercept form a 2,927-by-6, rank-six design matrix with a kUSD target. The video interprets `Xβ` as a point in the column space of X and defines the residual consistently as `r=y−ŷ`; every 2D drawing is explicitly identified as a high-dimensional schematic.

At the fitted point, the gradient condition gives `Xᵀr≈0`, with notebook value `max|Xᵀr|=3.726×10^-10`. A separate card shows `RMSE=35.834182 kUSD` so learners do not confuse an optimality check with predictive error. The final derivation turns orthogonality into `XᵀXβ=Xᵀy`, defines the 6-by-6 system `Gβ=c`, and hands off to reusable LUP factors without recommending an explicit inverse or normal equations as the default production solver.
