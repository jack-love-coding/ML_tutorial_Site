# Ames LUP factorization and reuse — English summary

This silent Simplified-Chinese video factors the Ames 6-by-6 Gram system without computing an inverse. It shows the partial-pivot selection rule and the exact recorded pivot rows `[0,1,2,3,4]`. All five checks retain the current row, so the video explicitly says that no Ames row exchange occurred and never draws a fictitious swap. The general invariant remains `PG=LU`, with P acting on equation rows.

Forward and back substitution solve `Lz=Pc` and `Uβ=z`. Four notebook checks remain distinct: factorization residual `4.547×10^-13`, solve residual `1.455×10^-11`, manual-versus-SciPy difference `7.105×10^-15`, and LU-versus-lstsq difference `1.918×10^-13`. One factorization is then reused for price and natural-log-price right-hand sides; the latter has intercept `12.02122130`. The ending warns that small residuals do not imply low input sensitivity.
