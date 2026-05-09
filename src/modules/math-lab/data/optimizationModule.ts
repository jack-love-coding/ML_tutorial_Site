import type { LocalizedCopy, MathLabModule, MathLabSection } from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return {
    id,
    level: 2,
    title,
    content,
    ...placements,
  }
}

const sections: MathLabSection[] = [
  section(
    'optimization-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`读完这一章后，你应该能把“求最小值”这件事从一个微积分题，读成数值算法和模型训练共同使用的语言。

你需要掌握：

- 说清优化的目标：在定义域 \(S\) 内寻找使 \(f(\mathbf{x})\) 尽可能小的点 \(\mathbf{x}^*\)。
- 区分无约束优化和带等式/不等式约束的优化，并能把最大化问题改写成最小化 \(-f\)。
- 区分局部最小值和全局最小值，知道无穷定义域上最优解不一定存在，函数也可能有多个局部最小值。
- 用一阶导数和二阶导数判断一维局部极值，理解 \(f'(x^*)=0\) 是必要条件，\(f''(x^*)>0\) 给出局部最小的充分条件。
- 解释单峰函数、区间缩减和黄金分割搜索为什么只需要函数值，并能计算一次迭代后的区间长度。
- 从 Taylor 二次近似推出一维 Newton 优化步 \(x_{k+1}=x_k-f'(x_k)/f''(x_k)\)，并说明它只有局部收敛保证。
- 在多维情形下写出梯度、Hessian、Hessian 正定性判据、最速下降方向、线搜索和 Newton 步。
- 把优化连接到机器学习训练：损失函数、学习率、特征缩放、Hessian 曲率、二阶方法成本和非凸失败模式。

本章的核心直觉是：优化算法并不是“盲目让参数变小”，而是在目标函数地形上选择方向和步长。方向来自导数信息，步长来自一维搜索或学习率策略，可靠性则取决于函数形状、初始点和数值条件。`,
      md`After this chapter, you should be able to read minimization not only as a calculus exercise, but as the shared language behind numerical algorithms and model training.

You should be able to:

- State the goal of optimization: find a point \(\mathbf{x}^*\) in the domain \(S\) where \(f(\mathbf{x})\) is as small as possible.
- Distinguish unconstrained optimization from optimization with equality or inequality constraints, and rewrite a maximization problem as minimization of \(-f\).
- Distinguish local and global minima, know that an optimum need not exist on an infinite domain, and recognize that a function may have multiple local minima.
- Use first and second derivatives to classify one-dimensional extrema: \(f'(x^*)=0\) is necessary, and \(f''(x^*)>0\) gives a sufficient condition for a local minimum.
- Explain unimodal functions, interval reduction, and why Golden Section Search only needs function values; compute the bracket length after one iteration.
- Derive the one-dimensional Newton optimization step \(x_{k+1}=x_k-f'(x_k)/f''(x_k)\) from a quadratic Taylor model, and explain its local convergence guarantee.
- In multiple dimensions, write the gradient, Hessian, Hessian definiteness test, steepest descent direction, line search, and Newton step.
- Connect optimization to machine-learning training: losses, learning rates, feature scaling, Hessian curvature, second-order cost, and non-convex failure modes.

The core intuition is this: an optimization algorithm is not blindly making parameters smaller. It chooses a direction and a step length on the objective landscape. Derivatives provide directions, line search or learning-rate rules provide step lengths, and reliability depends on function shape, initialization, and numerical conditioning.`,
    ),
  ),
  section(
    'optimization-problem-statement',
    copy('从目标函数到最小化问题', 'From Objective Function to Minimization Problem'),
    copy(
      md`优化的目标是寻找函数定义域中让函数值最小的点。设 \(f:S\to \mathbb{R}\)，其中 \(S\subset \mathbb{R}^n\)。如果

$$
f(\mathbf{x}^*)\le f(\mathbf{x})\qquad \forall \mathbf{x}\in S,
$$

那么 \(\mathbf{x}^*\) 称为 \(f\) 在 \(S\) 上的 minimizer，也就是最小化点。

本章把优化分成两类：

| 类型 | 数学形式 | 直觉 |
| --- | --- | --- |
| 无约束优化 | \(\min_{\mathbf{x}} f(\mathbf{x})\) | 只关心目标函数本身 |
| 约束优化 | \(\min_{\mathbf{x}} f(\mathbf{x})\), subject to \(\mathbf{g}(\mathbf{x})=0\) and/or \(\mathbf{h}(\mathbf{x})\le 0\) | 只能在可行区域里找最小值 |

如果定义域 \(S\) 是无穷集合，最小值不一定存在。例如 \(f(x)=e^x\) 在 \(\mathbb{R}\) 上没有达到最小值；它可以无限接近 \(0\)，但没有任何有限 \(x\) 让 \(e^x=0\)。

最大化也可以改写成最小化：

$$
\max_{\mathbf{y}} f(\mathbf{y})
\quad\Longleftrightarrow\quad
\min_{\mathbf{x}} -f(\mathbf{x}).
$$

**手算例题：矩形面积。** 给定 \(d_1,d_2>0\)，周长不超过 \(20\)，希望最大化面积 \(d_1d_2\)：

$$
\max_{d_1,d_2} d_1d_2
\qquad
\text{subject to}\qquad
2(d_1+d_2)-20\le 0.
$$

等价地，我们可以最小化 \(-d_1d_2\)。在可行区域里，最优矩形是正方形 \(d_1=d_2=5\)，面积为 \(25\)。这个例子的关键点是：约束先决定可行区域，目标函数再在可行区域中排序。

![矩形面积和周长约束示意](/math-lab/cs357-assets/figs/calculus_area.png)

![面积与周长关系示意](/math-lab/cs357-assets/figs/area_perimeter_visualization.png)`,
      md`Optimization means finding a point in the domain where the function value is minimal. Let \(f:S\to \mathbb{R}\), with \(S\subset \mathbb{R}^n\). If

$$
f(\mathbf{x}^*)\le f(\mathbf{x})\qquad \forall \mathbf{x}\in S,
$$

then \(\mathbf{x}^*\) is called a minimizer of \(f\) on \(S\).

The chapter separates two types of optimization:

| Type | Mathematical form | Intuition |
| --- | --- | --- |
| Unconstrained optimization | \(\min_{\mathbf{x}} f(\mathbf{x})\) | Only the objective matters |
| Constrained optimization | \(\min_{\mathbf{x}} f(\mathbf{x})\), subject to \(\mathbf{g}(\mathbf{x})=0\) and/or \(\mathbf{h}(\mathbf{x})\le 0\) | Search only inside the feasible region |

If the domain \(S\) is infinite, a solution is not guaranteed to exist. For example, \(f(x)=e^x\) has no attained minimum on \(\mathbb{R}\); it approaches \(0\), but no finite \(x\) makes \(e^x=0\).

Maximization can also be rewritten as minimization:

$$
\max_{\mathbf{y}} f(\mathbf{y})
\quad\Longleftrightarrow\quad
\min_{\mathbf{x}} -f(\mathbf{x}).
$$

**Worked example: rectangle area.** Given \(d_1,d_2>0\) and perimeter at most \(20\), maximize the area \(d_1d_2\):

$$
\max_{d_1,d_2} d_1d_2
\qquad
\text{subject to}\qquad
2(d_1+d_2)-20\le 0.
$$

Equivalently, minimize \(-d_1d_2\). Inside the feasible region, the best rectangle is the square \(d_1=d_2=5\), with area \(25\). The key point is that constraints define the feasible region first, and the objective ranks points inside that region.

![Rectangle area with perimeter constraint](/math-lab/cs357-assets/figs/calculus_area.png)

![Relationship between area and perimeter](/math-lab/cs357-assets/figs/area_perimeter_visualization.png)`,
    ),
  ),
  section(
    'optimization-local-global',
    copy('局部最小值与全局最小值', 'Local and Global Minima'),
    copy(
      md`设 \(f:S\to\mathbb{R}\)。局部最小值和全局最小值的区别，是“比较范围”不同。

- 如果 \(\mathbf{x}^*\) 只需要比它附近的一小片可行点更好，就是局部最小值。
- 如果 \(\mathbf{x}^*\) 比整个定义域 \(S\) 中所有可行点都好，就是全局最小值。

寻找局部最小值通常比证明全局最小值容易。也要强调：一个函数可以有多个局部最小值，而判断全局最小值是否存在本身就可能很难。

![局部最小值和全局最小值](/math-lab/cs357-assets/figs/globalvslocal.png)

机器学习中的非凸损失正是这个问题的放大版本。神经网络训练通常只保证找到某个可接受的低损失区域，而不是证明它是全局最小点。起点、学习率、批量噪声和模型结构都会影响优化轨迹最终进入哪个低谷。`,
      md`Let \(f:S\to\mathbb{R}\). The difference between a local minimum and a global minimum is the scope of comparison.

- \(\mathbf{x}^*\) is a local minimum if it is better than feasible points in some neighborhood around it.
- \(\mathbf{x}^*\) is a global minimum if it is better than every feasible point in the whole domain \(S\).

Finding a local minimum is usually easier than proving global optimality. A function can have more than one local minimum, and deciding whether a global minimum exists can itself be difficult.

![Local and global minima](/math-lab/cs357-assets/figs/globalvslocal.png)

Non-convex machine-learning losses are a large-scale version of this issue. Neural-network training usually aims for an acceptable low-loss region rather than a proof of global optimality. The start point, learning rate, mini-batch noise, and architecture all influence which basin the optimization path eventually enters.`,
    ),
  ),
  section(
    'optimization-one-dimensional-tests',
    copy('一维判据：导数、二阶导数与单峰性', 'One-Dimensional Tests: Derivatives, Curvature, and Unimodality'),
    copy(
      md`一维优化先从光滑函数 \(f:\mathbb{R}\to\mathbb{R}\) 开始。微积分给出局部极值的基本检查：

1. 一阶必要条件：如果 \(x^*\) 是内部局部最小值，通常有 \(f'(x^*)=0\)。
2. 二阶充分条件：如果 \(f'(x^*)=0\) 且 \(f''(x^*)>0\)，那么 \(x^*\) 是局部最小值。
3. 如果 \(f''(x^*)<0\)，该点是局部最大值；如果 \(f''(x^*)=0\)，这个判据本身无法下结论。

**例题 1：三次函数的局部极值。** 对

$$
f(x)=x^3-6x^2+9x-6,
$$

有

$$
f'(x)=3x^2-12x+9=3(x-1)(x-3),\qquad
f''(x)=6x-12.
$$

临界点是 \(x=1\) 和 \(x=3\)。因为 \(f''(1)=-6<0\)，所以 \(x=1\) 是局部最大值；因为 \(f''(3)=6>0\)，所以 \(x=3\) 是局部最小值。

**例题 2：四次函数的所有驻点。** 对

$$
f(x)=\frac{x^4}{4}-\frac{x^3}{3}-11x^2+40x,
$$

有

$$
f'(x)=x^3-x^2-22x+40,\qquad f''(x)=3x^2-2x-22.
$$

解 \(f'(x)=0\) 得到 \(x=-5,2,4\)。代入二阶导数后：

| 点 | \(f''(x)\) 符号 | 分类 |
| --- | --- | --- |
| \(-5\) | 正 | 局部最小值 |
| \(2\) | 负 | 局部最大值 |
| \(4\) | 正 | 局部最小值 |

另一条主线是单峰函数。函数 \(f\) 在区间 \([a,b]\) 上单峰，意思是它在这个区间里有唯一的全局最小值，并且从左侧走向最小点时函数值持续下降，从最小点右侧离开时函数值持续上升。单峰性很重要，因为它让“比较两个内部点，然后丢掉一段区间”变得可靠。

几个边界例子：

- \(f(x)=x^2\) 在 \([-1,1]\) 上是单峰的。
- \(f(x)=0\) for \(x<0\), \(f(x)=x\) for \(x\ge 0\)，在 \([-1,1]\) 上不是单峰的，因为最小值不唯一。
- \(f(x)=\cos x\) 在 \([-\pi/2,2\pi]\) 上不是单峰的，因为它不是先降后升的一座谷。

下面的图展示了区间缩减思想：只要函数在当前区间上单峰，就可以通过两个内部点的函数值比较，保留仍然包含最小点的那一段。

![单峰函数的区间缩减](/math-lab/cs357-assets/figs/ternery_search_optimization.png)`,
      md`One-dimensional optimization starts with a smooth function \(f:\mathbb{R}\to\mathbb{R}\). Calculus gives the basic local test:

1. First-order necessary condition: if \(x^*\) is an interior local minimum, usually \(f'(x^*)=0\).
2. Second-order sufficient condition: if \(f'(x^*)=0\) and \(f''(x^*)>0\), then \(x^*\) is a local minimum.
3. If \(f''(x^*)<0\), the point is a local maximum; if \(f''(x^*)=0\), this test alone is inconclusive.

**Example 1: local extrema of a cubic.** For

$$
f(x)=x^3-6x^2+9x-6,
$$

we have

$$
f'(x)=3x^2-12x+9=3(x-1)(x-3),\qquad
f''(x)=6x-12.
$$

The critical points are \(x=1\) and \(x=3\). Since \(f''(1)=-6<0\), \(x=1\) is a local maximum. Since \(f''(3)=6>0\), \(x=3\) is a local minimum.

**Example 2: all stationary points of a quartic.** For

$$
f(x)=\frac{x^4}{4}-\frac{x^3}{3}-11x^2+40x,
$$

we have

$$
f'(x)=x^3-x^2-22x+40,\qquad f''(x)=3x^2-2x-22.
$$

Solving \(f'(x)=0\) gives \(x=-5,2,4\). Substituting into the second derivative gives:

| Point | Sign of \(f''(x)\) | Classification |
| --- | --- | --- |
| \(-5\) | positive | local minimum |
| \(2\) | negative | local maximum |
| \(4\) | positive | local minimum |

Another source-note thread is unimodality. A function \(f\) is unimodal on \([a,b]\) if it has a unique global minimum on that interval and the function decreases as one moves toward the minimum from the left, then increases after leaving the minimum on the right. Unimodality matters because it makes it safe to compare two interior points and discard part of the interval.

Boundary examples:

- \(f(x)=x^2\) is unimodal on \([-1,1]\).
- \(f(x)=0\) for \(x<0\), \(f(x)=x\) for \(x\ge 0\), is not unimodal on \([-1,1]\) because the minimum is not unique.
- \(f(x)=\cos x\) is not unimodal on \([-\pi/2,2\pi]\), because it is not a single valley that decreases and then increases.

The figure below shows the interval-reduction idea: if the function is unimodal on the current interval, comparing two interior function values lets us keep the subinterval that still contains the minimizer.

![Interval reduction for a unimodal function](/math-lab/cs357-assets/figs/ternery_search_optimization.png)`,
    ),
  ),
  section(
    'optimization-golden-section',
    copy('黄金分割搜索：不用导数的一维优化', 'Golden Section Search: One-Dimensional Optimization Without Derivatives'),
    copy(
      md`黄金分割搜索是一种区间缩减法。它类似于求根里的二分法：二分法每次保留仍含根的区间；黄金分割搜索每次保留仍含唯一最小点的区间。

设当前区间为 \([a,b]\)。取两个内部点

$$
x_1=a+(1-\tau)(b-a),\qquad x_2=a+\tau(b-a),
$$

其中

$$
\tau=\frac{\sqrt{5}-1}{2}\approx 0.618.
$$

如果 \(f(x_1)>f(x_2)\)，最小点在右侧，新区间取 \([x_1,b]\)。如果 \(f(x_1)\le f(x_2)\)，最小点在左侧，新区间取 \([a,x_2]\)。

为什么 \(\tau\) 是这个数？推导来自“下一轮要复用一个内部点”。令 \(h_0=b-a\)，希望下一轮长度 \(h_1=\tau h_0\)。为了复用旧的内部点，还要满足

$$
\tau h_1=(1-\tau)h_0.
$$

把 \(h_1=\tau h_0\) 代入：

$$
\tau^2 h_0=(1-\tau)h_0
\quad\Longrightarrow\quad
\tau^2=1-\tau
\quad\Longrightarrow\quad
\tau=\frac{\sqrt{5}-1}{2}.
$$

因此每次迭代后区间长度大约乘以 \(0.618\)，线性收敛：

$$
\lim_{k\to\infty}\frac{|e_{k+1}|}{|e_k|}=\tau.
$$

黄金分割搜索不需要 \(f'(x)\) 或 \(f''(x)\)。第一次需要计算两个内部函数值，之后每轮都能复用一个点，所以每轮只增加一次新的函数求值。

**例题：区间长度。** 若初始 bracket 为 \([-10,10]\)，长度是 \(20\)。一次黄金分割搜索后，新 bracket 长度为

$$
20\tau\approx 20\times 0.618=12.36.
$$

这类方法适合函数值容易算、导数难算或不可靠的场景。但它依赖单峰假设；如果区间内有多个低谷，缩减可能保留了错误的低谷。`,
      md`Golden Section Search is an interval-reduction method. It resembles bisection for root finding: bisection keeps an interval that still contains the root, while Golden Section Search keeps an interval that still contains the unique minimizer.

Let the current interval be \([a,b]\). Choose two interior points

$$
x_1=a+(1-\tau)(b-a),\qquad x_2=a+\tau(b-a),
$$

where

$$
\tau=\frac{\sqrt{5}-1}{2}\approx 0.618.
$$

If \(f(x_1)>f(x_2)\), the minimizer lies on the right, so the new interval is \([x_1,b]\). If \(f(x_1)\le f(x_2)\), the minimizer lies on the left, so the new interval is \([a,x_2]\).

Why this value of \(\tau\)? The source-note derivation comes from the desire to reuse one interior point in the next iteration. Let \(h_0=b-a\), and require the next interval length to satisfy \(h_1=\tau h_0\). To reuse an old interior point, we also need

$$
\tau h_1=(1-\tau)h_0.
$$

Substitute \(h_1=\tau h_0\):

$$
\tau^2 h_0=(1-\tau)h_0
\quad\Longrightarrow\quad
\tau^2=1-\tau
\quad\Longrightarrow\quad
\tau=\frac{\sqrt{5}-1}{2}.
$$

Thus each iteration multiplies the bracket length by about \(0.618\), giving linear convergence:

$$
\lim_{k\to\infty}\frac{|e_{k+1}|}{|e_k|}=\tau.
$$

Golden Section Search does not need \(f'(x)\) or \(f''(x)\). It evaluates two interior function values at the start, then reuses one point each round, so each later iteration needs only one new function evaluation.

**Example: bracket length.** If the initial bracket is \([-10,10]\), its length is \(20\). After one Golden Section iteration, the new bracket length is

$$
20\tau\approx 20\times 0.618=12.36.
$$

This method is useful when function values are easy to compute but derivatives are difficult or unreliable. It relies on unimodality; if the interval contains several valleys, interval reduction may keep the wrong one.`,
    ),
  ),
  section(
    'optimization-newton-1d',
    copy('一维 Newton 优化：用二次局部模型走一步', 'Newton Optimization in 1-D: Step Through a Quadratic Local Model'),
    copy(
      md`Newton 优化来自 Taylor 二次近似。在当前点 \(x_0\) 附近，

$$
f(x)\approx f(x_0)+f'(x_0)(x-x_0)+\frac{1}{2}f''(x_0)(x-x_0)^2.
$$

为了最小化这个二次模型，对 \(x\) 求导并令其为 \(0\)：

$$
f'(x_0)+f''(x_0)(x-x_0)=0.
$$

令 \(h=x-x_0\)，得到

$$
h=-\frac{f'(x_0)}{f''(x_0)}.
$$

因此迭代公式是

$$
x_{k+1}=x_k-\frac{f'(x_k)}{f''(x_k)}.
$$

这和对方程 \(f'(x)=0\) 做 Newton 求根是同一件事：寻找局部最小值时，先寻找导数为零的点。

**例题：一维 Newton 一步。** 对

$$
f(x)=4x^3+2x^2+5x+40,\qquad x_0=2,
$$

有

$$
f'(x)=12x^2+4x+5,\qquad f''(x)=24x+4.
$$

代入 \(x_0=2\)：

$$
f'(2)=61,\qquad f''(2)=52.
$$

所以

$$
x_1=2-\frac{61}{52}\approx 0.827.
$$

Newton 法通常在足够接近局部最小点时二次收敛，但这是局部保证。初始点太远、\(f''(x_k)\) 太小、二阶导数为负或接近零时，它可能发散，也可能走向局部最大值或拐点。`,
      md`Newton optimization comes from the quadratic Taylor approximation. Around the current point \(x_0\),

$$
f(x)\approx f(x_0)+f'(x_0)(x-x_0)+\frac{1}{2}f''(x_0)(x-x_0)^2.
$$

To minimize this quadratic model, differentiate with respect to \(x\) and set the derivative to zero:

$$
f'(x_0)+f''(x_0)(x-x_0)=0.
$$

Let \(h=x-x_0\). Then

$$
h=-\frac{f'(x_0)}{f''(x_0)}.
$$

The iteration is therefore

$$
x_{k+1}=x_k-\frac{f'(x_k)}{f''(x_k)}.
$$

This is the same as applying Newton root finding to \(f'(x)=0\): to find a local minimum, first find a point where the derivative is zero.

**Example: one Newton step in 1-D.** For

$$
f(x)=4x^3+2x^2+5x+40,\qquad x_0=2,
$$

we have

$$
f'(x)=12x^2+4x+5,\qquad f''(x)=24x+4.
$$

At \(x_0=2\),

$$
f'(2)=61,\qquad f''(2)=52.
$$

So

$$
x_1=2-\frac{61}{52}\approx 0.827.
$$

Newton's method typically converges quadratically when the iterate is close enough to the local minimum, but that is a local guarantee. If the start is far away, \(f''(x_k)\) is too small, or the curvature is negative or near zero, the method may diverge or move toward a local maximum or inflection point.`,
    ),
  ),
  section(
    'optimization-gradient-hessian',
    copy('多维优化：梯度、Hessian 与局部判据', 'Multidimensional Optimization: Gradient, Hessian, and Local Tests'),
    copy(
      md`多维优化把一维导数推广成梯度，把二阶导数推广成 Hessian 矩阵。对 \(f:\mathbb{R}^n\to\mathbb{R}\)，梯度为

$$
\nabla f(\mathbf{x})=
\begin{bmatrix}
\dfrac{\partial f}{\partial x_1}\\
\dfrac{\partial f}{\partial x_2}\\
\vdots\\
\dfrac{\partial f}{\partial x_n}
\end{bmatrix}.
$$

Hessian 为

$$
H_f(\mathbf{x})=
\begin{bmatrix}
\dfrac{\partial^2 f}{\partial x_1^2} & \dfrac{\partial^2 f}{\partial x_1\partial x_2} & \cdots & \dfrac{\partial^2 f}{\partial x_1\partial x_n}\\
\dfrac{\partial^2 f}{\partial x_2\partial x_1} & \dfrac{\partial^2 f}{\partial x_2^2} & \cdots & \dfrac{\partial^2 f}{\partial x_2\partial x_n}\\
\vdots & \vdots & \ddots & \vdots\\
\dfrac{\partial^2 f}{\partial x_n\partial x_1} & \dfrac{\partial^2 f}{\partial x_n\partial x_2} & \cdots & \dfrac{\partial^2 f}{\partial x_n^2}
\end{bmatrix}.
$$

在梯度为零的点，Hessian 的特征值决定局部形状：

| \(H_f(\mathbf{x}^*)\) | 特征值 | 结论 |
| --- | --- | --- |
| 正定 | 全部为正 | 局部最小值 |
| 负定 | 全部为负 | 局部最大值 |
| 不定 | 有正有负 | 鞍点 |

因此，多维局部最小的常用条件是：

1. 必要条件：\(\nabla f(\mathbf{x}^*)=\mathbf{0}\)。
2. 充分条件：\(\nabla f(\mathbf{x}^*)=\mathbf{0}\)，且 \(H_f(\mathbf{x}^*)\) 正定。

**例题：二维驻点。** 对

$$
f(x_1,x_2)=2x_1^3+4x_2^2+2x_2-24x_1,
$$

梯度和 Hessian 为

$$
\nabla f(\mathbf{x})=
\begin{bmatrix}
6x_1^2-24\\
8x_2+2
\end{bmatrix},
\qquad
H_f(\mathbf{x})=
\begin{bmatrix}
12x_1 & 0\\
0 & 8
\end{bmatrix}.
$$

令梯度为零，得到 \(x_1=\pm2\)、\(x_2=-0.25\)。在 \((2,-0.25)\)，Hessian 为 \(\operatorname{diag}(24,8)\)，正定，所以是局部最小值。在 \((-2,-0.25)\)，Hessian 为 \(\operatorname{diag}(-24,8)\)，不定，所以是鞍点。`,
      md`Multidimensional optimization generalizes the one-dimensional derivative into the gradient, and the second derivative into the Hessian matrix. For \(f:\mathbb{R}^n\to\mathbb{R}\), the gradient is

$$
\nabla f(\mathbf{x})=
\begin{bmatrix}
\dfrac{\partial f}{\partial x_1}\\
\dfrac{\partial f}{\partial x_2}\\
\vdots\\
\dfrac{\partial f}{\partial x_n}
\end{bmatrix}.
$$

The Hessian is

$$
H_f(\mathbf{x})=
\begin{bmatrix}
\dfrac{\partial^2 f}{\partial x_1^2} & \dfrac{\partial^2 f}{\partial x_1\partial x_2} & \cdots & \dfrac{\partial^2 f}{\partial x_1\partial x_n}\\
\dfrac{\partial^2 f}{\partial x_2\partial x_1} & \dfrac{\partial^2 f}{\partial x_2^2} & \cdots & \dfrac{\partial^2 f}{\partial x_2\partial x_n}\\
\vdots & \vdots & \ddots & \vdots\\
\dfrac{\partial^2 f}{\partial x_n\partial x_1} & \dfrac{\partial^2 f}{\partial x_n\partial x_2} & \cdots & \dfrac{\partial^2 f}{\partial x_n^2}
\end{bmatrix}.
$$

At a zero-gradient point, the eigenvalues of the Hessian determine the local shape:

| \(H_f(\mathbf{x}^*)\) | Eigenvalues | Conclusion |
| --- | --- | --- |
| positive definite | all positive | local minimizer |
| negative definite | all negative | local maximizer |
| indefinite | mixed signs | saddle point |

The common local-minimum test is therefore:

1. Necessary condition: \(\nabla f(\mathbf{x}^*)=\mathbf{0}\).
2. Sufficient condition: \(\nabla f(\mathbf{x}^*)=\mathbf{0}\) and \(H_f(\mathbf{x}^*)\) is positive definite.

**Example: stationary points in 2-D.** For

$$
f(x_1,x_2)=2x_1^3+4x_2^2+2x_2-24x_1,
$$

the gradient and Hessian are

$$
\nabla f(\mathbf{x})=
\begin{bmatrix}
6x_1^2-24\\
8x_2+2
\end{bmatrix},
\qquad
H_f(\mathbf{x})=
\begin{bmatrix}
12x_1 & 0\\
0 & 8
\end{bmatrix}.
$$

Setting the gradient to zero gives \(x_1=\pm2\), \(x_2=-0.25\). At \((2,-0.25)\), the Hessian is \(\operatorname{diag}(24,8)\), positive definite, so the point is a local minimum. At \((-2,-0.25)\), the Hessian is \(\operatorname{diag}(-24,8)\), indefinite, so the point is a saddle.`,
    ),
  ),
  section(
    'optimization-steepest-descent',
    copy('最速下降与线搜索', 'Steepest Descent and Line Search'),
    copy(
      md`对可微函数 \(f:\mathbb{R}^n\to\mathbb{R}\)，梯度 \(\nabla f(\mathbf{x})\) 指向最快上升方向。因此最速下降方向是

$$
\mathbf{s}_k=-\nabla f(\mathbf{x}_k).
$$

如果从当前点沿这个方向走，更新可以写成

$$
\mathbf{x}_{k+1}=\mathbf{x}_k+\alpha_k\mathbf{s}_k
=\mathbf{x}_k-\alpha_k\nabla f(\mathbf{x}_k).
$$

方向只解决“往哪里走”，还没有解决“走多远”。这里用线搜索选择步长：

$$
\alpha_k=\operatorname*{argmin}_{\alpha} f(\mathbf{x}_k+\alpha\mathbf{s}_k).
$$

也就是说，每个多维步长问题被临时压成一个一维优化问题，可以用黄金分割搜索这类一维方法求 \(\alpha_k\)。最速下降通常线性收敛。

**例题：最速下降方向。** 对

$$
f(x_1,x_2)=10x_1^3-x_2^2+x_1-1,
$$

梯度为

$$
\nabla f=
\begin{bmatrix}
30x_1^2+1\\
-2x_2
\end{bmatrix}.
$$

在 \((2,2)\) 处，

$$
-\nabla f(2,2)=
-\begin{bmatrix}
121\\
-4
\end{bmatrix}
=
\begin{bmatrix}
-121\\
4
\end{bmatrix}.
$$

**例题：步长如何改变结果。** 对

$$
f(x_1,x_2)=(x_1-1)^2+(x_2-1)^2,
$$

从 \(\mathbf{y}_0=[3,3]^T\) 出发，\(\nabla f(\mathbf{y}_0)=[4,4]^T\)。若取 \(\alpha_0=1\)，则

$$
\mathbf{y}_1=[3,3]^T-[4,4]^T=[-1,-1]^T,
$$

这一步越过了最小点。若取 \(\alpha_0=0.5\)，则刚好到达 \([1,1]^T\)。

![最速下降步长示意](/math-lab/cs357-assets/figs/steepest_contour_map_1.png)

线搜索还有一个很有用的几何结论：如果 \(\alpha_k\) 是沿当前下降方向的一维精确最小值，那么

$$
\nabla f(\mathbf{x}_{k+1})^T\nabla f(\mathbf{x}_k)=0.
$$

换句话说，相邻两步的梯度正交。这解释了为什么最速下降在狭长谷地中经常出现锯齿形轨迹。下面的实验可以调起点、学习率和步数，观察同一条公式如何产生收敛、慢收敛或震荡。`,
      md`For a differentiable function \(f:\mathbb{R}^n\to\mathbb{R}\), the gradient \(\nabla f(\mathbf{x})\) points in the direction of fastest increase. Therefore the steepest descent direction is

$$
\mathbf{s}_k=-\nabla f(\mathbf{x}_k).
$$

Moving from the current point in that direction gives

$$
\mathbf{x}_{k+1}=\mathbf{x}_k+\alpha_k\mathbf{s}_k
=\mathbf{x}_k-\alpha_k\nabla f(\mathbf{x}_k).
$$

The direction answers where to move, but not how far. Here the step length is chosen by line search:

$$
\alpha_k=\operatorname*{argmin}_{\alpha} f(\mathbf{x}_k+\alpha\mathbf{s}_k).
$$

That means each multidimensional step-length problem is temporarily reduced to a one-dimensional optimization problem; a method such as Golden Section Search can be used to find \(\alpha_k\). Steepest descent usually converges linearly.

**Example: steepest descent direction.** For

$$
f(x_1,x_2)=10x_1^3-x_2^2+x_1-1,
$$

the gradient is

$$
\nabla f=
\begin{bmatrix}
30x_1^2+1\\
-2x_2
\end{bmatrix}.
$$

At \((2,2)\),

$$
-\nabla f(2,2)=
-\begin{bmatrix}
121\\
-4
\end{bmatrix}
=
\begin{bmatrix}
-121\\
4
\end{bmatrix}.
$$

**Example: how step size changes the result.** For

$$
f(x_1,x_2)=(x_1-1)^2+(x_2-1)^2,
$$

starting at \(\mathbf{y}_0=[3,3]^T\), we have \(\nabla f(\mathbf{y}_0)=[4,4]^T\). If \(\alpha_0=1\),

$$
\mathbf{y}_1=[3,3]^T-[4,4]^T=[-1,-1]^T,
$$

which overshoots the minimum. If \(\alpha_0=0.5\), the step lands exactly at \([1,1]^T\).

![Steepest descent step-size example](/math-lab/cs357-assets/figs/steepest_contour_map_1.png)

Line search also gives a useful geometric fact: if \(\alpha_k\) is the exact one-dimensional minimizer along the current descent direction, then

$$
\nabla f(\mathbf{x}_{k+1})^T\nabla f(\mathbf{x}_k)=0.
$$

In other words, consecutive gradients are orthogonal. This explains the zig-zag paths often seen in narrow valleys. The lab below lets you change the start point, learning rate, and number of steps to see the same update formula produce convergence, slow convergence, or oscillation.`,
    ),
    {
      visualIds: ['gradient-descent-video'],
      labIds: ['optimization-gradient-lab'],
    },
  ),
  section(
    'optimization-newton-nd',
    copy('多维 Newton 法：解一个 Hessian 线性系统', 'Newton Method in N-D: Solve a Hessian Linear System'),
    copy(
      md`多维 Newton 法可以从 Taylor 二次模型推出：

$$
f(\mathbf{x}+\mathbf{s})
\approx
f(\mathbf{x})+\nabla f(\mathbf{x})^T\mathbf{s}
+\frac{1}{2}\mathbf{s}^T H_f(\mathbf{x})\mathbf{s}
=\hat f(\mathbf{s}).
$$

令这个局部二次模型对 \(\mathbf{s}\) 的梯度为零：

$$
\nabla f(\mathbf{x})+H_f(\mathbf{x})\mathbf{s}=0.
$$

于是 Newton 步 \(\mathbf{s}_k\) 通过线性系统得到：

$$
H_f(\mathbf{x}_k)\mathbf{s}_k=-\nabla f(\mathbf{x}_k),
\qquad
\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{s}_k.
$$

Hessian 编码局部曲率，所以 Newton 步不仅知道下降方向，也会根据不同方向的曲率自动调整步长。正常条件下它可以二次收敛；但它需要二阶导数，每步通常要解线性系统，代价可达 \(O(n^3)\)。如果 Hessian 接近奇异、不定或初始点太远，它可能表现很差。

**例题：二维二次函数的一步 Newton。** 对

$$
f(x,y)=3x^2+2y^2,
$$

有

$$
\nabla f(x,y)=
\begin{bmatrix}
6x\\
4y
\end{bmatrix},
\qquad
H_f(x,y)=
\begin{bmatrix}
6&0\\
0&4
\end{bmatrix}.
$$

Newton 步满足

$$
H_f(x_k,y_k)\mathbf{s}_k=-\nabla f(x_k,y_k).
$$

因此

$$
\mathbf{s}_k=
-\begin{bmatrix}
6&0\\
0&4
\end{bmatrix}^{-1}
\begin{bmatrix}
6x_k\\
4y_k
\end{bmatrix}
=
\begin{bmatrix}
-x_k\\
-y_k
\end{bmatrix},
$$

更新后直接到达 \((0,0)\)。这也是“二次函数上 Newton 法一步收敛”的原因：二次 Taylor 模型对二次函数本身就是精确模型。

~~~python
import numpy as np
import numpy.linalg as la

def newtons_method(x_init):
    x_new = x_init
    x_prev = np.random.randn(x_init.shape[0])
    while la.norm(x_prev - x_new) > 1e-6:
        x_prev = x_new
        step = -la.solve(hessian(x_prev), gradient(x_prev))
        x_new = x_prev + step
    return x_new
~~~`,
      md`The multidimensional Newton method can be derived from a quadratic Taylor model:

$$
f(\mathbf{x}+\mathbf{s})
\approx
f(\mathbf{x})+\nabla f(\mathbf{x})^T\mathbf{s}
+\frac{1}{2}\mathbf{s}^T H_f(\mathbf{x})\mathbf{s}
=\hat f(\mathbf{s}).
$$

Set the gradient of this local quadratic model with respect to \(\mathbf{s}\) equal to zero:

$$
\nabla f(\mathbf{x})+H_f(\mathbf{x})\mathbf{s}=0.
$$

The Newton step \(\mathbf{s}_k\) is therefore obtained from a linear system:

$$
H_f(\mathbf{x}_k)\mathbf{s}_k=-\nabla f(\mathbf{x}_k),
\qquad
\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{s}_k.
$$

The Hessian encodes local curvature, so a Newton step has both a descent direction and a curvature-aware step length. Under normal local conditions it can converge quadratically. But it needs second derivatives and usually solves a linear system at each iteration, with cost up to \(O(n^3)\). If the Hessian is nearly singular, indefinite, or the start is too far away, the method can behave poorly.

**Example: one Newton step for a 2-D quadratic.** For

$$
f(x,y)=3x^2+2y^2,
$$

we have

$$
\nabla f(x,y)=
\begin{bmatrix}
6x\\
4y
\end{bmatrix},
\qquad
H_f(x,y)=
\begin{bmatrix}
6&0\\
0&4
\end{bmatrix}.
$$

The Newton step satisfies

$$
H_f(x_k,y_k)\mathbf{s}_k=-\nabla f(x_k,y_k).
$$

Therefore

$$
\mathbf{s}_k=
-\begin{bmatrix}
6&0\\
0&4
\end{bmatrix}^{-1}
\begin{bmatrix}
6x_k\\
4y_k
\end{bmatrix}
=
\begin{bmatrix}
-x_k\\
-y_k
\end{bmatrix},
$$

so the update lands directly at \((0,0)\). Newton method converges in one step on a quadratic because the quadratic Taylor model is the function itself.

~~~python
import numpy as np
import numpy.linalg as la

def newtons_method(x_init):
    x_new = x_init
    x_prev = np.random.randn(x_init.shape[0])
    while la.norm(x_prev - x_new) > 1e-6:
        x_prev = x_new
        step = -la.solve(hessian(x_prev), gradient(x_prev))
        x_new = x_prev + step
    return x_new
~~~`,
    ),
  ),
  section(
    'optimization-ml-practice',
    copy('机器学习中的优化直觉', 'Optimization Intuition in Machine Learning'),
    copy(
      md`机器学习训练通常就是优化问题：给定参数 \(\theta\)、数据 \(D\) 和损失函数 \(L(\theta;D)\)，训练就是寻找让损失小的参数。

$$
\theta^*=\operatorname*{argmin}_{\theta} L(\theta;D).
$$

本章的每个数值概念都有直接对应：

| 数学概念 | 训练中的含义 |
| --- | --- |
| 目标函数 | loss、负对数似然、正则化后的经验风险 |
| 局部最小值 | 非凸模型可能到达的低损失 basin |
| 梯度 | 反向传播给出的最快上升方向；最小化时取负方向 |
| 学习率 \(\alpha\) | 沿下降方向走多远；过小慢，过大震荡或发散 |
| 线搜索 | 在传统数值优化中选步长；深度学习常用预设 schedule 或自适应优化器近似 |
| Hessian | 局部曲率；连接 Newton 法、二阶优化、病态狭长谷地 |
| 黄金分割搜索 | 导数难用时的一维搜索模板 |

特征缩放也可以从优化地形理解。如果两个特征尺度差异很大，损失等高线会变成狭长谷地，梯度下降容易左右摆动。标准化特征、使用自适应学习率或近似二阶信息，都是在改善地形或步长选择。

小批量梯度下降把全数据梯度换成一个有噪声但便宜的估计。它不再每步精确最小化当前方向，而是在大量便宜更新中利用噪声探索低损失区域，这也是深度学习训练循环的常见形态。

失败模式也要记住：

- 梯度很小不一定是好最优点，可能是鞍点或平坦区。
- Newton 法需要可靠的 Hessian；Hessian 不定时，Newton 步不一定下降。
- 黄金分割搜索要求当前区间近似单峰；多低谷区间会破坏它的判断。
- 固定学习率不等于线搜索；它便宜，但需要调参。
- 非凸训练路径依赖初始点和噪声，不同训练运行可能落入不同区域。`,
      md`Machine-learning training is usually an optimization problem: given parameters \(\theta\), data \(D\), and a loss function \(L(\theta;D)\), training searches for low-loss parameters.

$$
\theta^*=\operatorname*{argmin}_{\theta} L(\theta;D).
$$

Every numerical concept in this chapter has a direct training counterpart:

| Mathematical concept | Meaning in training |
| --- | --- |
| Objective function | loss, negative log-likelihood, regularized empirical risk |
| Local minimum | a low-loss basin reachable in a non-convex model |
| Gradient | the fastest uphill direction from backpropagation; minimization uses the negative direction |
| Learning rate \(\alpha\) | how far to move along the descent direction; too small is slow, too large oscillates or diverges |
| Line search | a classical numerical way to choose step length; deep learning often uses schedules or adaptive optimizers instead |
| Hessian | local curvature; connects Newton methods, second-order optimization, and poorly conditioned narrow valleys |
| Golden Section Search | a template for one-dimensional search when derivatives are unavailable |

Feature scaling can also be understood through the optimization landscape. If two features have very different scales, loss contours become long narrow valleys and gradient descent may zig-zag. Standardizing features, using adaptive learning rates, or approximating second-order information all improve the landscape or the step-length choice.

Mini-batch gradient descent replaces the full-data gradient with a noisy but cheap estimate. It does not exactly minimize along the current direction each step; instead, many inexpensive updates use noise to explore low-loss regions, which is the usual shape of deep-learning training loops.

Keep the failure modes in view:

- A tiny gradient is not automatically a good optimum; it may be a saddle or flat region.
- Newton method needs a reliable Hessian; if the Hessian is indefinite, the Newton step need not descend.
- Golden Section Search assumes the current interval is roughly unimodal; multiple valleys break that logic.
- A fixed learning rate is not line search; it is cheap, but it must be tuned.
- Non-convex training paths depend on initialization and noise, so different runs may land in different regions.`,
    ),
  ),
  section(
    'optimization-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`用下面的问题检查本章是否真正连起来了：

1. 一维局部最小值的一阶必要条件和二阶充分条件分别是什么？
2. 多维局部最小值需要怎样的梯度和 Hessian 条件？
3. 如何根据 Hessian 的特征值区分局部最小值、局部最大值和鞍点？
4. 局部最小值和全局最小值有什么区别？为什么全局最优更难保证？
5. 单峰函数是什么意思？为什么黄金分割搜索需要这个假设？
6. 黄金分割搜索中 \(\tau=(\sqrt{5}-1)/2\) 的作用是什么？
7. 初始区间 \([-10,10]\) 做一次黄金分割搜索后长度是多少？
8. 如何计算一个多输入单输出函数的梯度？
9. Hessian 矩阵和 Jacobian 矩阵有什么关系和区别？
10. 最速下降方向为什么是 \(-\nabla f(\mathbf{x})\)？
11. 为什么最速下降每步还需要步长或线搜索？
12. 一维 Newton 优化步 \(x_{k+1}=x_k-f'(x_k)/f''(x_k)\) 来自哪里？
13. 多维 Newton 法每步要解哪个线性系统？
14. Newton 法什么时候可能无法收敛到最小值？
15. 黄金分割搜索每轮需要哪些函数值？为什么第一轮之后只需一次新函数求值？
16. Newton 法的典型局部收敛速度是什么？代价是什么？
17. 在机器学习中，学习率过大和特征尺度差异过大会怎样改变优化轨迹？
18. 为什么“梯度为零”本身不足以证明找到了好的最小点？`,
      md`Use these questions to check whether the chapter has connected:

1. What are the first-order necessary and second-order sufficient conditions for a one-dimensional local minimum?
2. What gradient and Hessian conditions are used for a multidimensional local minimum?
3. How do Hessian eigenvalues distinguish local minima, local maxima, and saddle points?
4. What is the difference between a local and a global minimum? Why is global optimality harder to guarantee?
5. What does unimodal mean, and why does Golden Section Search need that assumption?
6. What role does \(\tau=(\sqrt{5}-1)/2\) play in Golden Section Search?
7. If the initial bracket is \([-10,10]\), what is the bracket length after one Golden Section iteration?
8. How do you compute the gradient of a scalar-valued function with many inputs?
9. What is the relationship and difference between a Hessian matrix and a Jacobian matrix?
10. Why is the steepest descent direction \(-\nabla f(\mathbf{x})\)?
11. Why does steepest descent still need a step length or line search?
12. Where does the one-dimensional Newton optimization step \(x_{k+1}=x_k-f'(x_k)/f''(x_k)\) come from?
13. What linear system is solved at each step of multidimensional Newton method?
14. When can Newton method fail to converge to a minimum?
15. What function values are needed in each Golden Section iteration, and why is only one new function evaluation needed after the first iteration?
16. What is the typical local convergence rate of Newton method, and what is its computational cost?
17. In machine learning, how can a too-large learning rate or badly scaled features change the optimization path?
18. Why is zero gradient alone not enough to prove that you have found a good minimum?`,
    ),
  ),
]

export function buildOptimizationModule(base: MathLabModule): MathLabModule {
  return {
    ...base,
    enhancementTier: 'video',
    title: copy('优化', 'Optimization'),
    subtitle: copy(
      '从最小值、导数判据和线搜索，走到梯度下降与 Newton 法。',
      'Move from minima, derivative tests, and line search to gradient descent and Newton methods.',
    ),
    difficulty: 'advanced',
    estimatedMinutes: 38,
    prerequisites: ['taylor-series', 'vectors-matrices-norms', 'finite-difference-methods'],
    aiModelConnections: [
      copy(
        '损失函数训练、负对数似然、正则化、学习率调度和二阶优化都直接使用本章语言。',
        'Loss training, negative log-likelihood, regularization, learning-rate schedules, and second-order optimization all use this chapter directly.',
      ),
      copy(
        '梯度下降给出可微模型训练的基本更新，Hessian 解释曲率、鞍点和病态狭长谷地。',
        'Gradient descent gives the basic update for differentiable model training; Hessians explain curvature, saddles, and ill-conditioned narrow valleys.',
      ),
    ],
    learningObjectives: [
      copy('把最小化、最大化、约束和可行区域写成统一的优化问题。', 'Write minimization, maximization, constraints, and feasible regions as one optimization language.'),
      copy('用一阶和二阶导数判断一维局部最小值。', 'Use first and second derivatives to identify one-dimensional local minima.'),
      copy('解释单峰性和黄金分割搜索的区间缩减逻辑。', 'Explain unimodality and interval reduction in Golden Section Search.'),
      copy('从 Taylor 二次模型推出 Newton 优化步。', 'Derive the Newton optimization step from a quadratic Taylor model.'),
      copy('用梯度和 Hessian 判断多维局部极值、鞍点和曲率。', 'Use gradients and Hessians to reason about multidimensional extrema, saddles, and curvature.'),
      copy('把最速下降、线搜索和学习率连接到机器学习训练轨迹。', 'Connect steepest descent, line search, and learning rates to machine-learning training paths.'),
    ],
    concepts: [
      {
        id: 'optimization-minimizer',
        name: copy('最小化点', 'Minimizer'),
        formulaLatex: 'f(\\mathbf{x}^*)\\le f(\\mathbf{x})\\quad \\forall\\mathbf{x}\\in S',
        variables: [
          {
            symbol: 'S',
            description: copy('可行定义域。', 'Feasible domain.'),
          },
          {
            symbol: '\\mathbf{x}^*',
            description: copy('让目标函数在比较范围内最小的点。', 'A point where the objective is minimal over the comparison set.'),
          },
        ],
        plainExplanation: copy(
          '优化先定义“可以选哪些点”，再在这些点中比较目标函数值。',
          'Optimization first defines which points are allowed, then compares objective values among them.',
        ),
        geometricIntuition: copy(
          '把函数看成地形，最小化点就是可行区域里最低的谷底；局部谷底不一定是全局最低处。',
          'View the function as terrain: a minimizer is the lowest valley in the feasible region, but a local valley need not be globally lowest.',
        ),
        numericalExample: copy(
          md`在 \(f(x)=x^2\) 上，\(x^*=0\) 是全局最小点。`,
          md`For \(f(x)=x^2\), \(x^*=0\) is the global minimizer.`,
        ),
        modelConnection: copy(
          '模型训练把参数空间当作定义域，把 loss 当作目标函数。',
          'Model training treats parameter space as the domain and the loss as the objective.',
        ),
      },
      {
        id: 'optimization-steepest-descent',
        name: copy('最速下降更新', 'Steepest Descent Update'),
        formulaLatex: '\\mathbf{x}_{k+1}=\\mathbf{x}_k-\\alpha_k\\nabla f(\\mathbf{x}_k)',
        variables: [
          {
            symbol: '\\alpha_k',
            description: copy('第 \(k\) 步的步长，可由线搜索或学习率策略给出。', 'Step length at iteration \(k\), supplied by line search or a learning-rate rule.'),
          },
          {
            symbol: '\\nabla f(\\mathbf{x}_k)',
            description: copy('当前位置最快上升方向。', 'Fastest uphill direction at the current point.'),
          },
        ],
        plainExplanation: copy(
          '负梯度给方向，步长决定沿这个方向走多远。',
          'The negative gradient gives the direction; the step length decides how far to move.',
        ),
        geometricIntuition: copy(
          '在等高线图上，负梯度近似垂直穿过等高线指向更低处；步长太大会越过谷底。',
          'On a contour plot, the negative gradient cuts across contour lines toward lower values; a step that is too large overshoots the valley.',
        ),
        numericalExample: copy(
          md`对 \(f(x)=x^2\)，从 \(x_0=3\)、\(\alpha=0.2\) 出发，\(x_1=3-0.2\cdot6=1.8\)。`,
          md`For \(f(x)=x^2\), starting at \(x_0=3\) with \(\alpha=0.2\) gives \(x_1=3-0.2\cdot6=1.8\).`,
        ),
        codeExample: 'x = 3.0\nalpha = 0.2\nfor _ in range(8):\n    grad = 2 * x\n    x = x - alpha * grad\nprint(x)',
        modelConnection: copy(
          '小批量梯度下降用噪声梯度近似全数据梯度，是现代深度学习训练循环的核心。',
          'Mini-batch gradient descent uses noisy gradient estimates of the full-data gradient and is central to modern deep-learning training loops.',
        ),
      },
      {
        id: 'optimization-newton-step',
        name: copy('Newton 步', 'Newton Step'),
        formulaLatex: 'H_f(\\mathbf{x}_k)\\mathbf{s}_k=-\\nabla f(\\mathbf{x}_k),\\qquad \\mathbf{x}_{k+1}=\\mathbf{x}_k+\\mathbf{s}_k',
        variables: [
          {
            symbol: 'H_f(\\mathbf{x}_k)',
            description: copy('当前位置的 Hessian，描述局部曲率。', 'The Hessian at the current point, describing local curvature.'),
          },
          {
            symbol: '\\mathbf{s}_k',
            description: copy('解线性系统得到的 Newton 修正步。', 'The Newton correction step obtained by solving a linear system.'),
          },
        ],
        plainExplanation: copy(
          'Newton 法每步最小化局部二次模型，而不是只跟随一阶斜率。',
          'Newton method minimizes a local quadratic model at each step instead of following only first-order slope.',
        ),
        geometricIntuition: copy(
          'Hessian 会按曲率重新缩放方向：陡方向少走，平方向多走。',
          'The Hessian rescales directions by curvature: shorter steps in steep directions, longer steps in flatter directions.',
        ),
        numericalExample: copy(
          md`对 \(f(x,y)=3x^2+2y^2\)，Newton 法从任意点一步到达 \((0,0)\)。`,
          md`For \(f(x,y)=3x^2+2y^2\), Newton method reaches \((0,0)\) from any point in one step.`,
        ),
        modelConnection: copy(
          '二阶优化、拟牛顿方法、Laplace 近似和部分深度学习诊断都会使用 Hessian 曲率信息。',
          'Second-order optimization, quasi-Newton methods, Laplace approximations, and some deep-learning diagnostics use Hessian curvature information.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [
      {
        id: 'gradient-descent-video',
        type: 'manim-video',
        title: copy('梯度下降轨迹', 'Gradient Descent Trajectory'),
        assetPath: '/manim/math-lab/gradient-descent.mp4',
        posterPath: '/manim/math-lab/gradient-descent.svg',
        transcript: copy(
          '轨迹沿等高线的负梯度方向前进。学习率较小时路径稳定但慢；学习率过大时会跨过谷底并震荡。',
          'The path moves across contour lines in the negative-gradient direction. A small learning rate is stable but slow; a large one can cross the valley and oscillate.',
        ),
        learningPurpose: copy(
          '把最速下降公式和可见轨迹对应起来，观察方向、步长和收敛状态。',
          'Connect the steepest descent formula to a visible path, observing direction, step length, and convergence behavior.',
        ),
        alt: copy('梯度下降在二次损失等高线上的迭代轨迹。', 'Gradient descent trajectory on contours of a quadratic loss.'),
        caption: copy('负梯度决定方向，学习率决定每步长度。', 'The negative gradient sets direction; the learning rate sets step length.'),
      },
    ],
    labs: [
      {
        id: 'optimization-gradient-lab',
        title: copy('最速下降轨迹实验', 'Steepest Descent Path Lab'),
        type: 'interactive-visual',
        componentName: 'MathGradientLab',
        successCriteria: [
          copy(md`能指出 \(-\nabla f(\mathbf{x}_k)\) 在图中对应哪条方向。`, md`Point out where \(-\nabla f(\mathbf{x}_k)\) appears in the plot.`),
          copy('能解释学习率过小、合适、过大时轨迹的差别。', 'Explain how the path changes when the learning rate is too small, suitable, or too large.'),
          copy('能把读数中的 loss 和梯度大小连接到收敛状态。', 'Connect the loss and gradient readouts to the convergence state.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'optimization-local-test-1d',
        type: 'single-choice',
        prompt: copy(
          md`若 \(f'(x^*)=0\) 且 \(f''(x^*)>0\)，通常可以判断 \(x^*\) 是什么？`,
          md`If \(f'(x^*)=0\) and \(f''(x^*)>0\), what can we usually conclude about \(x^*\)?`,
        ),
        choices: [
          {
            id: 'local-minimum',
            label: copy('局部最小值', 'A local minimum'),
          },
          {
            id: 'local-maximum',
            label: copy('局部最大值', 'A local maximum'),
          },
          {
            id: 'global-proof',
            label: copy('一定是全局最小值', 'Definitely a global minimum'),
          },
        ],
        answer: 'local-minimum',
        explanation: copy(
          md`一阶导数为零给出驻点，二阶导数为正说明局部向上弯曲，因此是局部最小值。它不自动证明全局最优。`,
          md`The zero first derivative gives a stationary point, and positive second derivative means local upward curvature. That gives a local minimum, not an automatic proof of global optimality.`,
        ),
        misconceptionTags: ['optimization-local-vs-global'],
      },
      {
        id: 'optimization-golden-bracket-length',
        type: 'numeric',
        prompt: copy(
          md`黄金分割搜索从区间 \([-10,10]\) 开始，一次迭代后新区间长度约是多少？`,
          md`Golden Section Search starts with bracket \([-10,10]\). Approximately what is the new bracket length after one iteration?`,
        ),
        answer: 12.36,
        tolerance: 0.05,
        explanation: copy(
          md`初始长度是 \(20\)，新区间长度为 \(20\tau\)，其中 \(\tau=(\sqrt5-1)/2\approx0.618\)，所以约为 \(12.36\)。`,
          md`The initial length is \(20\). The new length is \(20\tau\), where \(\tau=(\sqrt5-1)/2\approx0.618\), so it is about \(12.36\).`,
        ),
        misconceptionTags: ['optimization-golden-section'],
      },
      {
        id: 'optimization-steepest-direction',
        type: 'single-choice',
        prompt: copy('最小化时最速下降方向是哪一个？', 'Which direction is steepest descent for minimization?'),
        choices: [
          {
            id: 'negative-gradient',
            label: copy(md`\(-\nabla f(\mathbf{x})\)`, md`\(-\nabla f(\mathbf{x})\)`),
          },
          {
            id: 'positive-gradient',
            label: copy(md`\(\nabla f(\mathbf{x})\)`, md`\(\nabla f(\mathbf{x})\)`),
          },
          {
            id: 'hessian-only',
            label: copy('只看 Hessian 的第一列', 'Only the first column of the Hessian'),
          },
        ],
        answer: 'negative-gradient',
        explanation: copy(
          '梯度指向最快上升方向；最小化要沿相反方向走。',
          'The gradient points fastest uphill; minimization moves in the opposite direction.',
        ),
        misconceptionTags: ['optimization-gradient-direction'],
        revisitVisualId: 'gradient-descent-video',
      },
      {
        id: 'optimization-newton-nd-system',
        type: 'single-choice',
        prompt: copy('多维 Newton 法每步主要要求解什么？', 'What is the main solve at each step of multidimensional Newton method?'),
        choices: [
          {
            id: 'hessian-system',
            label: copy(md`线性系统 \(H_f(\mathbf{x}_k)\mathbf{s}_k=-\nabla f(\mathbf{x}_k)\)`, md`The linear system \(H_f(\mathbf{x}_k)\mathbf{s}_k=-\nabla f(\mathbf{x}_k)\)`),
          },
          {
            id: 'sort-samples',
            label: copy('对样本按标签排序', 'Sort samples by label'),
          },
          {
            id: 'golden-always',
            label: copy('总是做黄金分割搜索', 'Always run Golden Section Search'),
          },
        ],
        answer: 'hessian-system',
        explanation: copy(
          'Newton 步来自局部二次模型；令模型梯度为零，就得到 Hessian 线性系统。',
          'The Newton step comes from a local quadratic model; setting the model gradient to zero gives the Hessian linear system.',
        ),
        misconceptionTags: ['optimization-newton-step'],
      },
    ],
    misconceptions: [
      {
        id: 'optimization-local-is-global',
        statement: copy('找到局部最小值就等于解决了全局优化问题。', 'Finding a local minimum solves the global optimization problem.'),
        correction: copy(
          '局部最小值只和附近点比较；全局最小值要和整个定义域内所有可行点比较。',
          'A local minimum only compares against nearby points; a global minimum compares against every feasible point in the domain.',
        ),
        example: copy(
          '非凸 loss 可能有多个低谷，训练从不同初始点出发可能落入不同低谷。',
          'A non-convex loss may have multiple basins, and different initializations can land in different ones.',
        ),
      },
      {
        id: 'optimization-larger-learning-rate',
        statement: copy('学习率越大，梯度下降一定越快。', 'A larger learning rate always makes gradient descent faster.'),
        correction: copy(
          '学习率太大会越过谷底，导致震荡或发散；合适步长取决于曲率和尺度。',
          'A learning rate that is too large overshoots the valley, causing oscillation or divergence; a suitable step length depends on curvature and scale.',
        ),
        example: copy(
          md`在 \(f(x)=x^2\) 中，若 \(\alpha>1\)，更新 \(x_{k+1}=x_k-2\alpha x_k\) 会不断翻转并放大。`,
          md`For \(f(x)=x^2\), if \(\alpha>1\), the update \(x_{k+1}=x_k-2\alpha x_k\) flips sign and grows in magnitude.`,
        ),
      },
      {
        id: 'optimization-zero-gradient-good',
        statement: copy('梯度为零就说明已经找到好的最小点。', 'Zero gradient means we have found a good minimum.'),
        correction: copy(
          '梯度为零只是驻点条件；还需要看 Hessian 或更大范围的函数形状。',
          'Zero gradient is only a stationary-point condition; the Hessian or broader function shape still matters.',
        ),
        example: copy(
          md`在 \(f(x,y)=x^2-y^2\) 的 \((0,0)\) 处，梯度为零，但 Hessian 不定，所以这是鞍点。`,
          md`For \(f(x,y)=x^2-y^2\), the gradient is zero at \((0,0)\), but the Hessian is indefinite, so the point is a saddle.`,
        ),
      },
      {
        id: 'optimization-newton-always',
        statement: copy('Newton 法有二次收敛，所以总比梯度下降可靠。', 'Newton method has quadratic convergence, so it is always more reliable than gradient descent.'),
        correction: copy(
          '二次收敛通常是局部结论；Newton 法还需要可靠 Hessian、好初始点和昂贵线性系统求解。',
          'Quadratic convergence is usually local; Newton method also needs a reliable Hessian, a good start, and expensive linear-system solves.',
        ),
        example: copy(
          '当 Hessian 接近奇异或不定时，Newton 步可能非常大，甚至不是下降方向。',
          'When the Hessian is nearly singular or indefinite, the Newton step can be very large or not even be a descent direction.',
        ),
      },
    ],
    accent: '#f59e0b',
    theme: '#fff7df',
  }
}
