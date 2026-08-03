# Backpropagation animation transcript

## 0:00 | Forward computation and cache

The input first passes through an affine transform to produce $z^{(1)}$; tanh turns it into hidden response $h$. The second layer computes $z^{(2)}$, output tanh produces $\hat y$, and the prediction combines with target $y$ to produce loss $L$.

The forward pass does more than make a prediction. It saves $x,z^{(1)},h,z^{(2)},\hat y,y$. Backpropagation will reuse these values instead of reconstructing the input or re-deriving the whole network.

## 0:24 | From loss to output error

This chapter uses $L=\frac12(\hat y-y)^2$. Differentiating with respect to the prediction gives $\bar{\hat y}=\hat y-y=0.185893$. The prediction also passes through tanh, so the reverse pass must multiply by local derivative $1-\hat y^2$, giving output delta $\delta^{(2)}=0.122081$.

The upstream gradient and local derivative have different roles. The former measures how the loss responds to the node output; the latter measures how that node maps its input to its output.

## 0:52 | Apply the chain rule along one path

The output delta first multiplies the output weight, giving hidden adjoint $\bar h=0.134290$. Multiplying by the local hidden-tanh derivative gives $\delta^{(1)}=0.091436$. Finally, multiplying by input $x=1.2$ gives $\partial L/\partial w^{(1)}=0.109724$.

Along one path, backpropagation repeatedly multiplies by local derivatives. Every factor has a source in the forward graph.

## 1:28 | Expand the graph and accumulate branches

The network expands to two inputs and two hidden units. Input $x_1$ participates in both hidden affine operations, so the reverse pass receives one contribution from each path. $\bar x_1$ must equal the sum of both contributions.

Use multiplication within a path and addition where branches meet. Omitting either branch produces an incomplete gradient.

## 2:00 | Reverse mode and VJP

Automatic differentiation records primitive forward operations on a tape and stores the intermediates required by their reverse rules. Because the final loss is scalar, reverse mode starts from $\bar L=1$ and visits operations in reverse topological order.

Each operation computes a vector–Jacobian product: $\bar{\mathbf u}\mathrel{+}=J_f(\mathbf u)^{\mathsf T}\bar{\mathbf v}$. The plus-equals sign means one variable may receive gradients from multiple downstream branches. A framework backward call organizes these local rules automatically; it does not introduce different mathematics.

## 2:28 | Parameter update and another forward pass

A gradient is the local rate of change of loss with respect to a parameter, but it is not the update amount. The update also uses a learning rate and a minus sign: $\Delta\theta=-\eta\nabla_\theta L$.

In the default scenario, all four parameters take one step using the analytic gradients. A new forward pass changes the loss from $0.017278$ to $0.013425$. This decrease shows that the current step size works at this local point; it does not promise that every learning rate or every step will lower the loss.
