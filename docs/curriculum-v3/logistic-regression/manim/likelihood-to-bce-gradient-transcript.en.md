# From likelihood to BCE and gradient

## 0:00–0:12

One Bernoulli outcome has probability $p^y(1-p)^{1-y}$. Each $q_i$ is the probability assigned by the model to that row’s observed class.

## 0:12–0:24

Multiplying rows gives $prod_iq_i=0.008289470886818511$. Taking logs gives $sum_i\log q_i=-4.79276913734611$; products can underflow while sums remain incrementally additive.

## 0:24–0:36

Maximizing log-likelihood equals minimizing negative log-likelihood. The stable row form is $\ell(z,y)=\operatorname{softplus}(z)-yz$; the fixed gradient-check mean objective is $L(\theta)=0.7455450279170539$.

## 0:36–0:48

One row contributes $(p_i-y_i)x_i$ to the coefficient gradient, and batching gives $X^\top(p-y)/n$. In the fixed check, $g_1=0.40722679415570556$ and a central difference uses $h=10^{-6}$; parameters update along $-\nabla L$.
