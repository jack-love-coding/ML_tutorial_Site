# Manim Animation: Reverse-mode Backpropagation Through an MLP

## Overview

Create one 172.2-second, language-neutral Manim Community animation that builds backpropagation from function composition to a complete parameter update. The mathematical story must exactly match the MLP course runtime: tanh at the hidden and output nodes, one-sample loss $L=\frac12(\hat y-y)^2$, deterministic scalar values, and a later $2\to2\to1$ expansion. Do not treat gradients as physical objects or imply that backpropagation reconstructs the input.

Use a light `#F6F7F9` background with dark `#172033` text. Forward dependencies are solid blue `#256BD9`; tanh local derivatives use green `#287C55`; reverse adjoints and branch accumulation use orange-red `#C74E2D`; parameter gradients and updates use purple `#7655B5`. Color is never the only cue: forward and backward arrows point in opposite directions, backward lines are thicker, and equations explicitly name adjoints and derivatives.

All formulas must use `MathTex` with Python raw strings. Keep equations inside a 16:9 safe area. Use `next_section` with the exact section IDs and start times below. The final published render is 1920×1080 at 30 fps.

## Knowledge progression

Function composition → local derivative → forward cache → adjoints and chain rule → branch accumulation → matrix shapes → reverse-mode VJP → gradient-descent update.

## Scene sequence

### 1. Forward computation and cache

**Section ID:** `forward-cache`
**Timestamp:** 0:00–0:24

Open with `BACKPROPAGATION` and the symbolic dependency chain $x\to z^{(1)}\to h\to z^{(2)}\to\hat y\to L$. Build six circular nodes from left to right. Under each node display the deterministic forward value:

- $x=1.2$
- $z^{(1)}=0.640000$
- $h=0.564900$
- $z^{(2)}=0.671390$
- $\hat y=0.585893$
- $L=0.017278$

Grow solid blue arrows in dependency order. Finish with a cache panel listing $x,z^{(1)},h,z^{(2)},\hat y,y$. Hold long enough to establish that reverse mode reuses stored intermediates.

### 2. Output error and output delta

**Section ID:** `output-error`
**Timestamp:** 0:24–0:52

Compress the graph upward. Write $L=\frac12(\hat y-y)^2$, then derive $\bar{\hat y}=\partial L/\partial\hat y=\hat y-y=0.185893$. Draw the first thick orange reverse arrow from $L$ to $\hat y$. Next write

$$\delta^{(2)}=\bar{\hat y}(1-\hat y^2)=0.122081.$$

Outline $1-\hat y^2$ in green to distinguish the local tanh derivative from the upstream adjoint. Do not skip the output activation derivative.

### 3. Scalar chain rule

**Section ID:** `scalar-chain`
**Timestamp:** 0:52–1:28

Extend thick reverse arrows across every dependency. Reveal these equations one at a time:

$$\bar h=w^{(2)}\delta^{(2)}=0.134290,$$

$$\delta^{(1)}=\bar h(1-h^2)=0.091436,$$

$$\frac{\partial L}{\partial w^{(1)}}=\delta^{(1)}x=0.109724.$$

Indicate the hidden tanh node in green when its local derivative is applied, then indicate the input when multiplication by $x$ produces the weight gradient. End with the fully expanded chain rule. Preserve the order from loss to parameter and keep the graph visible so every factor has a visual source.

### 4. Expanded graph and branch accumulation

**Section ID:** `branch-sum`
**Timestamp:** 1:28–2:00

Replace the scalar path with a $2\to2\to1$ graph. Show two input nodes, two hidden pre-activations, two tanh activations, one output pre-activation, and one prediction. Build all forward links in blue. Then highlight the two distinct reverse contributions from $z^{(1)}_1$ and $z^{(1)}_2$ into the shared input $x_1$.

Write

$$\bar x_1=\delta^{(1)}_1W^{(1)}_{11}+\delta^{(1)}_2W^{(1)}_{21}.$$

Use a visible plus sign and surround the complete sum in orange-red. The animation must communicate that gradients add at fan-out points rather than choosing one path.

### 5. Reverse mode and VJP

**Section ID:** `reverse-vjp`
**Timestamp:** 2:00–2:28

Show a horizontal tape of rounded cards labelled $x,z^{(1)},h,z^{(2)},\hat y,L$. Grow one thin blue arrow left-to-right for evaluation order and one thicker orange arrow right-to-left for reverse traversal. Write the local reverse-mode rule

$$\bar{\mathbf u}\mathrel{+}=J_f(\mathbf u)^{\mathsf T}\bar{\mathbf v}.$$

Surround the equation in green, with special visual emphasis on `+=`. The narration supported by the page transcript should explain that frameworks record primitive operations, traverse them in reverse topological order, execute vector–Jacobian products, and accumulate repeated contributions. Do not construct a full Jacobian matrix on screen.

### 6. Parameter update and new loss

**Section ID:** `parameter-update`
**Timestamp:** 2:28–2:52.2

Clear the tape and write $\theta_{\mathrm{new}}=\theta-\eta\nabla_\theta L$. Reveal the four scalar updates:

- $w^{(1)}: 0.700000-0.1(0.109724)=0.689028$
- $b^{(1)}: -0.200000-0.1(0.091436)=-0.209144$
- $w^{(2)}: 1.100000-0.1(0.068964)=1.093104$
- $b^{(2)}: 0.050000-0.1(0.122081)=0.037792$

Finish with $L:0.017278\longrightarrow0.013425$. Indicate the loss comparison, then draw a green frame around the completed result. The visual conclusion is: cached values support local VJPs; local VJPs yield gradients; learning rate and the minus sign turn gradients into updates.

## Accessibility and pacing

- No automatic camera movement or flashing.
- Every color-coded distinction also uses direction, stroke width, formula labels, or grouping.
- Hold completed formulas for several seconds before transitions.
- The webpage provides localized chapter buttons, poster fallback, and complete Chinese and English transcripts.
- The animation contains no embedded prose that would make the single asset language-specific.
