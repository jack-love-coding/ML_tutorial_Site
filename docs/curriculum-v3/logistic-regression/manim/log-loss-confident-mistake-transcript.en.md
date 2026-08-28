# Confident mistake, stable BCE, and gradient signal

## 0:00–0:10

For a label $y\in\{0,1\}$ and logit $z$, the stable row negative log-likelihood is $\ell(z,y)=\operatorname{softplus}(z)-yz$. It is evaluated in the logit domain; when $z$ is finite, the result stays finite without first clipping a probability to 0 or 1.

## 0:10–0:20

Frozen validation row 919 has $y=1$, while the model gives $z=-4.1665$ and $p=0.01527$. It assigns a very small class 1 probability to the observed class 1, so $\ell=4.1819$. A solid point, dashed guide, and numeric card express the high loss without relying on color.

## 0:20–0:29

The logit derivative is $\partial\ell/\partial z=p-y$. Multiplying that residual signal by the standardized feature vector gives one row’s coefficient contribution, $\nabla_w\ell=(p-y)x$. After batch accumulation, parameters update along $-\nabla_wL$; this does not promise to repair any one row in isolation.

## 0:29–0:38

Before training, central difference can check the analytic gradient: $[L(\theta+h e_j)-L(\theta-h e_j)]/(2h)\approx\partial L/\partial\theta_j$. The published check uses $h=10^{-6}$ and has maximum component error $7.45\times10^{-11}$. The static poster retains the loss formula, high-loss point, gradient arrow, and agreement card, so the mechanism remains readable with reduced motion or a video failure.
