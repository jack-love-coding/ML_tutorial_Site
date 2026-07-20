# Logit-bias calibration: finite differences

This 78-second silent animation defines one deterministic residual from 12 fixed logits, a scalar bias, and target mean probability 0.62. At the probe $b=0.35$, it compares forward and central stencils geometrically, then plots the complete sampled error sweep from $h=10^{-1}$ through $10^{-12}$.

The locked Notebook output shows the best sampled forward step at $10^{-7}$ and the best sampled central step at $10^{-5}$. Central absolute error reaches approximately $2.339\times10^{-12}$ before floating-point cancellation makes smaller steps worse; at $10^{-12}$ it rises to about $6.200\times10^{-5}$. The animation aligns this result with the analytic derivative $F'(0.35)=0.1630982544$, distinguishes truncation from cancellation, and hands the same residual to the root-finding lesson.

The fixture is project-authored and deterministic. No model is trained, and matching a mean probability is explicitly not presented as complete calibration.
