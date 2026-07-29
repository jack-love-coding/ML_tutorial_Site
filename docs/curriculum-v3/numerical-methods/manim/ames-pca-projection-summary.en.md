# Ames PCA projection and reconstruction

This silent 80-second animation applies PCA to 2,927 rows and eight continuous or ordinal numeric features from the local Ames snapshot. Every feature is standardized with the population standard deviation (`ddof=0`) before the covariance matrix is formed.

The lesson connects `C = ZᵀZ/n`, its eigendecomposition, and `Z = UΣVᵀ`. The two numerical routes agree to a maximum explained-variance-ratio difference of `1.332 × 10⁻¹⁵`. The first two components explain 71.73% cumulatively; the first four explain 92.15%, so the declared 90% threshold first selects `k=4`.

Projection and reconstruction use `T_k = ZV_k` and `Z_hat_k = T_kV_kᵀ`. Reconstruction RMSE in standardized-feature units falls from 0.531684 at `k=2` to 0.280168 at `k=4`. PCA does not use the sale-price target and does not by itself guarantee better prediction.
