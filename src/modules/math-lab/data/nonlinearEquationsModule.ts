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
    'nonlinear-equations-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`本章讨论的问题是：当方程没有可直接写出的闭式解时，怎样用迭代把残差压小，并且怎样判断一个方法会稳定、快速还是失败。

读完后你应该能做到：

- 把求 \(f(x)=y\) 改写成求 \(\tilde f(x)=f(x)-y=0\)，并解释“根”和“残差”的关系。
- 手算二分法、Newton 法和割线法在 \(f(x)=x^3-x-1\) 上的前几步。
- 比较二分法的线性收敛、割线法的超线性收敛和 Newton 法的局部二次收敛。
- 说明每种方法每步需要哪些函数求值，以及为什么复用旧的函数值能节省成本。
- 写出非线性方程组的 Jacobian，并用 \(J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k)\) 做一次多维 Newton 更新。
- 识别失败场景：没有异号区间、导数太小、初始点离根太远、Jacobian 奇异或病态。`,
      md`This chapter asks: when an equation has no convenient closed-form solution, how do we iteratively reduce its residual, and how do we tell whether a method will be stable, fast, or likely to fail?

By the end, you should be able to:

- Rewrite \(f(x)=y\) as a root-finding problem \(\tilde f(x)=f(x)-y=0\), and explain the relationship between a root and a residual.
- Hand-compute the first few steps of bisection, Newton's method, and the secant method on \(f(x)=x^3-x-1\).
- Compare linear convergence for bisection, superlinear convergence for the secant method, and local quadratic convergence for Newton's method.
- State which function evaluations each method needs per step, and why reusing old function values saves cost.
- Write the Jacobian for a nonlinear system and perform one multidimensional Newton update using \(J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k)\).
- Recognize failure cases: no sign-changing bracket, a tiny derivative, a starting point far from the root, or a singular or ill-conditioned Jacobian.`,
    ),
  ),
  section(
    'nonlinear-equations-root-of-a-function',
    copy('从方程解到函数的根', 'From Equation Solution to Function Root'),
    copy(
      md`设 \(f:\mathbb{R}\to\mathbb{R}\)。如果某个点 \(x^*\) 满足

$$
f(x^*)=0,
$$

那么 \(x^*\) 就是 \(f\) 的一个**根**。数值求根并不是只服务于等于零的方程。更常见的目标可能是

$$
f(x)=y.
$$

这时只要把方程移到一边：

$$
\tilde f(x)=f(x)-y,
\qquad
\tilde f(x)=0.
$$

所以，求 \(f(x)=y\) 的解等价于求 \(\tilde f\) 的根。

迭代方法通常不直接说“我已经得到精确根”，而是检查当前残差

$$
r_k=f(x_k)
$$

是否足够小。残差小意味着当前点代回方程后接近满足 \(f(x)=0\)。但它不自动保证 \(x_k\) 离真实根很近，特别是在根附近函数很平、多个根靠得很近，或者导数接近零时。`,
      md`Let \(f:\mathbb{R}\to\mathbb{R}\). A point \(x^*\) is a **root** of \(f\) if

$$
f(x^*)=0.
$$

Root finding is not only for equations that already equal zero. A common target is

$$
f(x)=y.
$$

Move everything to one side:

$$
\tilde f(x)=f(x)-y,
\qquad
\tilde f(x)=0.
$$

Solving \(f(x)=y\) is therefore the same as finding a root of \(\tilde f\).

Iterative methods usually do not claim an exact root immediately. They check whether the current residual

$$
r_k=f(x_k)
$$

is small enough. A small residual means the current point nearly satisfies \(f(x)=0\). It does not automatically mean \(x_k\) is close to the true root, especially when the function is flat near the root, multiple roots are close together, or the derivative is near zero.`,
    ),
  ),
  section(
    'nonlinear-equations-convergence-and-cost',
    copy('收敛速度、误差和每步成本', 'Convergence Rate, Error, and Per-Step Cost'),
    copy(
      md`设 \(e_k=x_k-x^*\) 是第 \(k\) 步的误差。若某个迭代方法满足

$$
\lim_{k\to\infty}\frac{\|e_{k+1}\|}{\|e_k\|^r}=C,
\qquad 0<C<\infty,
$$

就说它的收敛阶为 \(r\)。

常见读法是：

| \(r\) | 名称 | 直觉 |
| --- | --- | --- |
| \(r=1\) | 线性收敛 | 每步大约按固定比例缩小误差 |
| \(1<r<2\) | 超线性收敛 | 比固定比例更快，但还不到平方级 |
| \(r=2\) | 二次收敛 | 进入局部区域后，有效数字常近似翻倍 |

这个定义解释了为什么“每步成本”和“总速度”要分开看。二分法每步便宜且稳，但只线性收敛；Newton 法每步要算 \(f\) 和 \(f'\)，甚至在多维时还要求解线性系统，但一旦已经靠近根，速度可能非常快；割线法不需要导数，每步只需一个新的函数值，收敛阶约为

$$
r=\frac{1+\sqrt{5}}{2}\approx 1.618.
$$

**例子。** 幂迭代的误差满足

$$
\lim_{k\to\infty}\frac{\|e_{k+1}\|}{\|e_k\|}
=\left|\frac{\lambda_2}{\lambda_1}\right|.
$$

当主特征值和次大特征值的比例接近 \(1\) 时，常数 \(C\) 接近 \(1\)，线性收敛会很慢。这个例子虽然来自特征值章节，但它给了同一个判断框架：看误差如何从一步传到下一步。`,
      md`Let \(e_k=x_k-x^*\) be the error after step \(k\). If an iterative method satisfies

$$
\lim_{k\to\infty}\frac{\|e_{k+1}\|}{\|e_k\|^r}=C,
\qquad 0<C<\infty,
$$

then the method has convergence order \(r\).

The common reading is:

| \(r\) | Name | Intuition |
| --- | --- | --- |
| \(r=1\) | linear convergence | each step shrinks error by roughly a fixed factor |
| \(1<r<2\) | superlinear convergence | faster than a fixed factor, but not quadratic |
| \(r=2\) | quadratic convergence | once local behavior applies, correct digits often roughly double |

This definition explains why per-step cost and total speed must be judged separately. Bisection is cheap and reliable per step, but only linearly convergent. Newton's method evaluates \(f\) and \(f'\), and in multiple dimensions solves a linear system, but once it is close to the root it can move very quickly. The secant method avoids derivatives, uses only one new function value per step after startup, and has convergence order

$$
r=\frac{1+\sqrt{5}}{2}\approx 1.618.
$$

**Example.** Power iteration has error behavior

$$
\lim_{k\to\infty}\frac{\|e_{k+1}\|}{\|e_k\|}
=\left|\frac{\lambda_2}{\lambda_1}\right|.
$$

When the ratio between the dominant and second eigenvalues is close to \(1\), the constant \(C\) is close to \(1\), and linear convergence is slow. This example comes from eigenvalues, but the judgment frame is the same: read how error moves from one step to the next.`,
    ),
  ),
  section(
    'nonlinear-equations-bisection-method',
    copy('二分法：用异号区间换确定性', 'Bisection Method: Trade a Bracket for Certainty'),
    copy(
      md`二分法像连续函数上的二分搜索。它要求 \(f\) 在 \([a,b]\) 上连续，并且两端异号：

$$
\operatorname{sgn}(f(a))=-\operatorname{sgn}(f(b)).
$$

根据介值定理，区间中至少有一个根。算法每步做三件事：

1. 取中点 \(c=(a+b)/2\)。
2. 计算 \(f(c)\)。
3. 用 \(c\) 替换与它同号的端点，保留异号区间。

第 \(k\) 步后区间长度为

$$
\frac{b-a}{2^k},
$$

所以二分法线性收敛，误差比例常数为 \(1/2\)。初始时需要计算 \(f(a)\) 和 \(f(b)\)，之后每步只需要一个新的函数值，因为另一个端点的函数值可以复用。

**局限。** 二分法需要提前找到异号区间。它不能直接处理 \(x^2=0\) 这类“碰到 x 轴但不穿过”的根，因为两侧符号不变。它也不知道区间里有几个根，只能保证保留下来的区间至少含有一个。

**手算例题。** 对

$$
f(x)=x^3-x-1
$$

有 \(f(1)=-1\)、\(f(2)=5\)，因此 \([1,2]\) 是合法区间。

![三次函数曲线](/math-lab/cs357-assets/figs/cubic.png)

前三步为：

| 步数 | 区间 | 中点 \(c\) | \(f(c)\) | 保留区间 |
| --- | --- | ---: | ---: | --- |
| 1 | \([1,2]\) | \(1.5\) | \(0.875\) | \([1,1.5]\) |
| 2 | \([1,1.5]\) | \(1.25\) | \(-0.296875\) | \([1.25,1.5]\) |
| 3 | \([1.25,1.5]\) | \(1.375\) | \(0.224609375\) | \([1.25,1.375]\) |

用 SciPy 可以写成：

~~~python
import scipy.optimize as opt

def f(x):
    return x**3 - x - 1

root = opt.bisect(f, a=1, b=2)
~~~

默认容差下，近似根约为 \(1.324717957244502\)。`,
      md`Bisection is binary search for a continuous function. It requires \(f\) to be continuous on \([a,b]\), with opposite signs at the endpoints:

$$
\operatorname{sgn}(f(a))=-\operatorname{sgn}(f(b)).
$$

By the intermediate value theorem, the interval contains at least one root. Each step does three things:

1. Take the midpoint \(c=(a+b)/2\).
2. Evaluate \(f(c)\).
3. Replace the endpoint with the same sign as \(f(c)\), keeping a sign-changing bracket.

After \(k\) steps, the interval length is

$$
\frac{b-a}{2^k},
$$

so bisection converges linearly with error ratio \(1/2\). The first step needs \(f(a)\) and \(f(b)\); after that, each step needs only one new function value because one endpoint value is reused.

**Limitation.** Bisection needs a sign-changing bracket in advance. It cannot directly handle a root such as \(x^2=0\), where the graph touches the x-axis but does not cross it. It also does not know how many roots are inside the interval; it only keeps an interval containing at least one root.

**Worked example.** For

$$
f(x)=x^3-x-1
$$

we have \(f(1)=-1\) and \(f(2)=5\), so \([1,2]\) is a valid bracket.

![Cubic curve](/math-lab/cs357-assets/figs/cubic.png)

The first three steps are:

| Step | Interval | Midpoint \(c\) | \(f(c)\) | Kept interval |
| --- | --- | ---: | ---: | --- |
| 1 | \([1,2]\) | \(1.5\) | \(0.875\) | \([1,1.5]\) |
| 2 | \([1,1.5]\) | \(1.25\) | \(-0.296875\) | \([1.25,1.5]\) |
| 3 | \([1.25,1.5]\) | \(1.375\) | \(0.224609375\) | \([1.25,1.375]\) |

Using SciPy:

~~~python
import scipy.optimize as opt

def f(x):
    return x**3 - x - 1

root = opt.bisect(f, a=1, b=2)
~~~

With default tolerances, the approximate root is about \(1.324717957244502\).`,
    ),
  ),
  section(
    'nonlinear-equations-newton-and-secant-methods',
    copy('Newton 法与割线法：更快，但更依赖局部形状', 'Newton and Secant Methods: Faster, but More Local'),
    copy(
      md`Newton 法来自一阶 Taylor 近似。令当前点为 \(x_k\)，取

$$
f(x_k+h)\approx f(x_k)+f'(x_k)h.
$$

让这个局部线性模型等于零：

$$
f(x_k)+f'(x_k)h=0,
\qquad
h=-\frac{f(x_k)}{f'(x_k)}.
$$

于是得到 Newton 更新

$$
x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)}.
$$

几何上，\(x_{k+1}\) 是当前点切线与 x 轴的交点。每步需要计算 \(f(x_k)\) 和 \(f'(x_k)\)。如果初始点已经靠近一个简单根，并且导数不为零，Newton 法通常二次收敛；如果初始点太远、导数接近零，或者函数局部形状很差，它可能跳走。

对同一个函数 \(f(x)=x^3-x-1\)，从 \(x_0=1\) 出发：

$$
x_1=1-\frac{-1}{2}=1.5,
$$

$$
x_2=1.5-\frac{0.875}{5.75}\approx 1.3478260869565217,
$$

$$
x_3\approx 1.325200398950907.
$$

已经明显靠近真实根。

割线法保留 Newton 法的形式，但不用解析导数。它用两次函数值估计斜率：

$$
f'(x_k)\approx
\frac{f(x_k)-f(x_{k-1})}{x_k-x_{k-1}},
$$

所以

$$
x_{k+1}
=x_k-
f(x_k)\frac{x_k-x_{k-1}}{f(x_k)-f(x_{k-1})}.
$$

割线法启动时需要两个初始点。之后每步只需要一个新的函数值，因为 \(f(x_k)\) 可以从上一轮复用。它通常比二分法快，但没有二分法的全局保证，也比理想 Newton 法慢。

下面的实验用同一函数同时跑二分法、Newton 法和割线法。调到 \(f(x)=x^3\) 时，根附近导数趋近零，你会看到 Newton 的典型二次收敛消失。`,
      md`Newton's method comes from a first-order Taylor approximation. Let the current point be \(x_k\), and write

$$
f(x_k+h)\approx f(x_k)+f'(x_k)h.
$$

Set this local linear model to zero:

$$
f(x_k)+f'(x_k)h=0,
\qquad
h=-\frac{f(x_k)}{f'(x_k)}.
$$

This gives the Newton update

$$
x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)}.
$$

Geometrically, \(x_{k+1}\) is where the tangent line at the current point meets the x-axis. Each step evaluates \(f(x_k)\) and \(f'(x_k)\). If the initial point is already close to a simple root and the derivative is nonzero, Newton's method usually converges quadratically. If the initial point is too far away, the derivative is near zero, or the local function shape is poor, it can jump away.

For the same function \(f(x)=x^3-x-1\), starting from \(x_0=1\):

$$
x_1=1-\frac{-1}{2}=1.5,
$$

$$
x_2=1.5-\frac{0.875}{5.75}\approx 1.3478260869565217,
$$

$$
x_3\approx 1.325200398950907.
$$

The iterate is already close to the true root.

The secant method keeps the Newton shape but avoids an analytic derivative. It estimates slope using two function values:

$$
f'(x_k)\approx
\frac{f(x_k)-f(x_{k-1})}{x_k-x_{k-1}},
$$

so

$$
x_{k+1}
=x_k-
f(x_k)\frac{x_k-x_{k-1}}{f(x_k)-f(x_{k-1})}.
$$

The secant method needs two starting points. After startup, each step needs only one new function evaluation because \(f(x_k)\) is reused from the previous round. It is usually faster than bisection, has no global guarantee like bisection, and is slower than ideal Newton convergence.

The lab below runs bisection, Newton, and secant on the same function. Switch to \(f(x)=x^3\), where the derivative tends to zero near the root, and Newton's typical quadratic convergence disappears.`,
    ),
    { labIds: ['nonlinear-equations-root-finding-lab'] },
  ),
  section(
    'nonlinear-equations-nonlinear-system-of-equations',
    copy('非线性方程组与 Jacobian', 'Nonlinear Systems and the Jacobian'),
    copy(
      md`一维求根可以推广到多个方程。设

$$
\mathbf{f}:\mathbb{R}^n\to\mathbb{R}^n,
\qquad
\mathbf{f}(\mathbf{x})=
\begin{bmatrix}
f_1(\mathbf{x})\\
\vdots\\
f_n(\mathbf{x})
\end{bmatrix}.
$$

目标是求

$$
\mathbf{f}(\mathbf{x})=\mathbf{0}.
$$

如果原目标是 \(\mathbf{f}(\mathbf{x})=\mathbf{y}\)，同样可以改写成

$$
\tilde{\mathbf{f}}(\mathbf{x})=\mathbf{f}(\mathbf{x})-\mathbf{y}=\mathbf{0}.
$$

每个方程可以看作一条曲线或一个曲面，解就是这些曲线或曲面的交点。

多维 Newton 法用 Jacobian 描述局部线性化：

$$
J_f(\mathbf{x})=
\begin{bmatrix}
\frac{\partial f_1}{\partial x_1} & \cdots & \frac{\partial f_1}{\partial x_n}\\
\vdots & \ddots & \vdots\\
\frac{\partial f_n}{\partial x_1} & \cdots & \frac{\partial f_n}{\partial x_n}
\end{bmatrix}.
$$

局部模型为

$$
\mathbf{f}(\mathbf{x}+\mathbf{s})
\approx
\mathbf{f}(\mathbf{x})+J_f(\mathbf{x})\mathbf{s}.
$$

令它等于 \(\mathbf{0}\)，得到 Newton 步：

$$
J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k),
\qquad
\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{s}_k.
$$

实际计算中不要显式求 \(J_f^{-1}\)。应当求解线性系统 \(J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k)\)，这和线性系统、LU、条件数章节直接相连。

**手算例题。** 求

$$
\mathbf{f}(x,y)=
\begin{bmatrix}
x+2y-2\\
x^2+4y^2-4
\end{bmatrix}
$$

的一个根。Jacobian 是

$$
J_f(x,y)=
\begin{bmatrix}
1&2\\
2x&8y
\end{bmatrix}.
$$

从 \(\mathbf{x}_0=[1,1]^T\) 出发，有 \(\mathbf{f}(\mathbf{x}_0)=[1,1]^T\)，

$$
J_f(\mathbf{x}_0)=
\begin{bmatrix}
1&2\\
2&8
\end{bmatrix}.
$$

解线性系统

$$
\begin{bmatrix}
1&2\\
2&8
\end{bmatrix}
\mathbf{s}_0=
\begin{bmatrix}
-1\\
-1
\end{bmatrix}
$$

得到 \(\mathbf{s}_0=[-1.5,0.25]^T\)。因此

$$
\mathbf{x}_1=\mathbf{x}_0+\mathbf{s}_0=
\begin{bmatrix}
-0.5\\
1.25
\end{bmatrix}.
$$

后续迭代会靠近 \([0,1]^T\)。SciPy 中可以写：

~~~python
import numpy as np
import scipy.optimize as opt

def f(xvec):
    x, y = xvec
    return np.array([x + 2*y - 2, x**2 + 4*y**2 - 4])

def Jf(xvec):
    x, y = xvec
    return np.array([[1, 2], [2*x, 8*y]])

sol = opt.root(f, x0=[1, 1], jac=Jf)
~~~

多维 Newton 法同样只有局部收敛保证。若 Jacobian 奇异、病态，或初始点落在错误区域，步长可能非常不可靠。`,
      md`One-dimensional root finding extends to multiple equations. Let

$$
\mathbf{f}:\mathbb{R}^n\to\mathbb{R}^n,
\qquad
\mathbf{f}(\mathbf{x})=
\begin{bmatrix}
f_1(\mathbf{x})\\
\vdots\\
f_n(\mathbf{x})
\end{bmatrix}.
$$

The goal is

$$
\mathbf{f}(\mathbf{x})=\mathbf{0}.
$$

If the original target is \(\mathbf{f}(\mathbf{x})=\mathbf{y}\), rewrite it as

$$
\tilde{\mathbf{f}}(\mathbf{x})=\mathbf{f}(\mathbf{x})-\mathbf{y}=\mathbf{0}.
$$

Each equation can be read as a curve or surface, and the solution is an intersection of those curves or surfaces.

Multidimensional Newton uses the Jacobian for local linearization:

$$
J_f(\mathbf{x})=
\begin{bmatrix}
\frac{\partial f_1}{\partial x_1} & \cdots & \frac{\partial f_1}{\partial x_n}\\
\vdots & \ddots & \vdots\\
\frac{\partial f_n}{\partial x_1} & \cdots & \frac{\partial f_n}{\partial x_n}
\end{bmatrix}.
$$

The local model is

$$
\mathbf{f}(\mathbf{x}+\mathbf{s})
\approx
\mathbf{f}(\mathbf{x})+J_f(\mathbf{x})\mathbf{s}.
$$

Set it to \(\mathbf{0}\) to get the Newton step:

$$
J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k),
\qquad
\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{s}_k.
$$

In practice, do not explicitly form \(J_f^{-1}\). Solve the linear system \(J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k)\). This directly connects to linear systems, LU, and condition numbers.

**Worked example.** Find a root of

$$
\mathbf{f}(x,y)=
\begin{bmatrix}
x+2y-2\\
x^2+4y^2-4
\end{bmatrix}.
$$

The Jacobian is

$$
J_f(x,y)=
\begin{bmatrix}
1&2\\
2x&8y
\end{bmatrix}.
$$

Starting from \(\mathbf{x}_0=[1,1]^T\), we have \(\mathbf{f}(\mathbf{x}_0)=[1,1]^T\), and

$$
J_f(\mathbf{x}_0)=
\begin{bmatrix}
1&2\\
2&8
\end{bmatrix}.
$$

Solve the linear system

$$
\begin{bmatrix}
1&2\\
2&8
\end{bmatrix}
\mathbf{s}_0=
\begin{bmatrix}
-1\\
-1
\end{bmatrix}
$$

to get \(\mathbf{s}_0=[-1.5,0.25]^T\). Therefore

$$
\mathbf{x}_1=\mathbf{x}_0+\mathbf{s}_0=
\begin{bmatrix}
-0.5\\
1.25
\end{bmatrix}.
$$

Continuing the iteration approaches \([0,1]^T\). In SciPy:

~~~python
import numpy as np
import scipy.optimize as opt

def f(xvec):
    x, y = xvec
    return np.array([x + 2*y - 2, x**2 + 4*y**2 - 4])

def Jf(xvec):
    x, y = xvec
    return np.array([[1, 2], [2*x, 8*y]])

sol = opt.root(f, x0=[1, 1], jac=Jf)
~~~

Multidimensional Newton still has only local convergence guarantees. If the Jacobian is singular, ill-conditioned, or the starting point is in the wrong region, the step can be unreliable.`,
    ),
  ),
  section(
    'nonlinear-equations-ml-connections',
    copy('机器学习中的求根问题', 'Root Finding in Machine Learning'),
    copy(
      md`非线性方程求解不是孤立的数值分析技巧。机器学习和 AI 系统里常见的几类问题都能写成“让某个残差为零”。

**概率校准与阈值。** 如果模型输出经过 sigmoid 或 softmax 后需要达到某个目标概率，常会解 \(g(t)=p_{\text{target}}\)。这可以改写成 \(g(t)-p_{\text{target}}=0\)。

**优化的一阶条件。** 求局部最优时，很多方法实际在求

$$
\nabla L(\theta)=\mathbf{0}.
$$

Newton 法用于优化时，就是把求根思想用在梯度方程上。区别是优化更关心下降、阻尼和 Hessian 正定性。

**隐式层与深度均衡模型。** 一些模型定义输出为固定点

$$
z=g_\theta(z,x).
$$

这等价于解

$$
F(z)=g_\theta(z,x)-z=0.
$$

训练这种模型时，求解器的收敛性、Jacobian 条件数和残差容差都会直接影响前向结果和反向梯度。

**数值库实践。** 真实求解器很少只使用裸 Newton 公式。常见保护包括限制步长、线搜索、阻尼、信赖域、先用区间方法保底，再在局部切换到 Newton 或割线步。核心原因是：开放方法快，但全局保证弱；区间方法慢，但能给可靠的安全边界。`,
      md`Solving nonlinear equations is not an isolated numerical-analysis trick. Many machine-learning and AI systems contain the same pattern: make a residual equal zero.

**Probability calibration and thresholds.** If a sigmoid or softmax output must hit a target probability, one may solve \(g(t)=p_{\text{target}}\). This becomes \(g(t)-p_{\text{target}}=0\).

**First-order optimality.** For local optima, many methods are effectively solving

$$
\nabla L(\theta)=\mathbf{0}.
$$

Newton's method for optimization applies root-finding to the gradient equation. The optimization version additionally cares about descent, damping, and Hessian positive definiteness.

**Implicit layers and deep equilibrium models.** Some models define an output as a fixed point

$$
z=g_\theta(z,x).
$$

This is equivalent to solving

$$
F(z)=g_\theta(z,x)-z=0.
$$

For these models, solver convergence, Jacobian conditioning, and residual tolerance directly affect the forward result and backward gradient.

**Numerical-library practice.** Production solvers rarely use the bare Newton formula alone. Common safeguards include step limits, line search, damping, trust regions, starting with a bracketing method, then switching to Newton or secant steps locally. The reason is simple: open methods are fast but weak globally; bracketing methods are slower but provide reliable safety boundaries.`,
    ),
  ),
  section(
    'nonlinear-equations-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 怎样把 \(f(x)=y\) 改写成求根问题？
2. 根、残差和误差分别是什么？残差小是否一定代表误差小？
3. 二分法为什么要求连续函数和异号区间？
4. 二分法每步需要几个新的函数求值？为什么？
5. 给定初始区间 \([a,b]\) 和容差 \(tol\)，二分法大约需要多少步使区间长度小于 \(tol\)？
6. Newton 法的更新公式怎样由一阶 Taylor 近似推出？
7. Newton 法每步需要评估哪些函数？为什么它只有局部收敛保证？
8. 割线法怎样近似导数？它为什么需要两个起点？
9. 三种方法的收敛阶分别是什么？
10. 什么时候应该优先使用二分法，什么时候可以使用 Newton 或割线法？
11. 对向量函数 \(\mathbf{f}(\mathbf{x})\)，Jacobian 的元素是什么？
12. 多维 Newton 法每步为什么要解线性系统，而不是显式求逆？
13. 在隐式层、概率校准或优化一阶条件中，求根问题分别对应什么残差？`,
      md`1. How do you rewrite \(f(x)=y\) as a root-finding problem?
2. What are a root, a residual, and an error? Does a small residual always mean a small error?
3. Why does bisection require continuity and a sign-changing bracket?
4. How many new function evaluations does bisection need per step, and why?
5. Given an initial interval \([a,b]\) and tolerance \(tol\), about how many bisection steps are needed to make the interval length less than \(tol\)?
6. How does the Newton update follow from a first-order Taylor approximation?
7. Which functions does Newton evaluate each step, and why does it only have local convergence guarantees?
8. How does the secant method approximate a derivative, and why does it need two starting points?
9. What are the convergence orders of the three methods?
10. When should you prefer bisection, and when can you use Newton or secant?
11. For a vector-valued function \(\mathbf{f}(\mathbf{x})\), what are the entries of the Jacobian?
12. Why does multidimensional Newton solve a linear system instead of explicitly computing an inverse?
13. In implicit layers, probability calibration, or first-order optimality, what residual is being driven to zero?`,
    ),
  ),
]

export function buildNonlinearEquationsModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('求解非线性方程', 'Solving Nonlinear Equations'),
    subtitle: copy(
      '用二分法、Newton 法、割线法和 Jacobian 线性化把非线性残差压到零。',
      'Drive nonlinear residuals to zero with bisection, Newton, secant, and Jacobian linearization.',
    ),
    estimatedMinutes: 44,
    prerequisites: ['taylor-series', 'finite-difference-methods', 'lu-decomposition'],
    aiModelConnections: [
      copy(
        '概率校准、隐式层、深度均衡模型和优化一阶条件都可以写成让某个非线性残差为零。',
        'Probability calibration, implicit layers, deep equilibrium models, and first-order optimality can all be written as driving a nonlinear residual to zero.',
      ),
      copy(
        'Newton 型方法把 Taylor 局部线性化、Jacobian、线性系统求解和条件数连接成同一条数值计算链。',
        'Newton-style methods connect Taylor local linearization, Jacobians, linear solves, and conditioning into one numerical-computation chain.',
      ),
    ],
    learningObjectives: [
      copy(md`把 \(f(x)=y\) 改写为 \(\tilde f(x)=f(x)-y=0\)。`, md`Rewrite \(f(x)=y\) as \(\tilde f(x)=f(x)-y=0\).`),
      copy('手算二分法、Newton 法和割线法的前几步，并比较每步函数求值成本。', 'Hand-compute the first steps of bisection, Newton, and secant, and compare per-step evaluation cost.'),
      copy('解释线性、超线性和二次收敛的含义。', 'Explain linear, superlinear, and quadratic convergence.'),
      copy(md`写出 Jacobian，并用 \(J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k)\) 做多维 Newton 更新。`, md`Write a Jacobian and perform a multidimensional Newton update using \(J_f(\mathbf{x}_k)\mathbf{s}_k=-\mathbf{f}(\mathbf{x}_k)\).`),
      copy('识别导数太小、无异号区间、初始点不佳和 Jacobian 病态带来的失败风险。', 'Recognize failure risks from tiny derivatives, missing brackets, poor starting points, and ill-conditioned Jacobians.'),
    ],
    concepts: [
      {
        id: 'nonlinear-root-residual',
        name: copy('根与残差', 'Root and Residual'),
        formulaLatex: '\\tilde f(x)=f(x)-y=0',
        variables: [
          {
            symbol: 'x',
            description: copy('要寻找的未知量。', 'The unknown value being sought.'),
          },
          {
            symbol: '\\tilde f(x)',
            description: copy('移项后的残差函数；根就是让它等于零的点。', 'The shifted residual function; a root makes it zero.'),
          },
        ],
        plainExplanation: copy(
          '求解一般方程可以转化为求根，迭代方法就是不断让残差变小。',
          'Solving a general equation can be turned into root finding; iteration keeps reducing the residual.',
        ),
        geometricIntuition: copy(
          '在图像上，根是曲线穿过或触碰 x 轴的位置。',
          'On a graph, a root is where the curve crosses or touches the x-axis.',
        ),
        numericalExample: copy(
          md`求 \(\cos x=0.5\) 等价于求 \(\cos x-0.5=0\)。`,
          md`Solving \(\cos x=0.5\) is the same as solving \(\cos x-0.5=0\).`,
        ),
        codeExample:
          'import scipy.optimize as opt\n\nroot = opt.brentq(lambda x: x**3 - x - 1, 1, 2)\nprint(root)',
        modelConnection: copy(
          '校准阈值、隐式模型固定点和优化一阶条件都能写成残差函数为零。',
          'Calibration thresholds, implicit-model fixed points, and first-order optimality can all be written as residuals equal to zero.',
        ),
      },
      {
        id: 'newton-step',
        name: copy('Newton 步', 'Newton Step'),
        formulaLatex: 'x_{k+1}=x_k-\\frac{f(x_k)}{f\\prime(x_k)}',
        variables: [
          {
            symbol: 'f(x_k)',
            description: copy('当前位置的残差。', 'The residual at the current point.'),
          },
          {
            symbol: 'f\\prime(x_k)',
            description: copy('当前位置的局部斜率，决定残差应被怎样修正。', 'The local slope, determining how the residual should be corrected.'),
          },
        ],
        plainExplanation: copy(
          'Newton 法用当前切线预测根的位置。',
          'Newton uses the current tangent line to predict where the root lies.',
        ),
        geometricIntuition: copy(
          '从曲线上的当前点作切线，切线与 x 轴交点就是下一步。',
          'Draw the tangent at the current point; its x-axis intercept is the next step.',
        ),
        numericalExample: copy(
          md`对 \(x^3-x-1\)，从 \(x_0=1\) 出发得到 \(x_1=1.5\)。`,
          md`For \(x^3-x-1\), starting at \(x_0=1\) gives \(x_1=1.5\).`,
        ),
        modelConnection: copy(
          'Newton 型优化方法就是把这个求根步骤应用到梯度方程上。',
          'Newton-style optimization applies this root-finding step to the gradient equation.',
        ),
      },
      {
        id: 'multidimensional-newton',
        name: copy('多维 Newton 线性系统', 'Multidimensional Newton Linear System'),
        formulaLatex: 'J_f(\\mathbf{x}_k)\\mathbf{s}_k=-\\mathbf{f}(\\mathbf{x}_k)',
        variables: [
          {
            symbol: 'J_f',
            description: copy('由偏导数组成的 Jacobian，描述局部线性化。', 'The Jacobian of partial derivatives, describing the local linearization.'),
          },
          {
            symbol: '\\mathbf{s}_k',
            description: copy(
              md`当前步长，求出后用 \(\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{s}_k\) 更新。`,
              md`The step, applied as \(\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{s}_k\).`,
            ),
          },
        ],
        plainExplanation: copy(
          '多维 Newton 每步先把非线性系统线性化，再解一个线性系统求步长。',
          'Multidimensional Newton first linearizes the nonlinear system, then solves a linear system for the step.',
        ),
        geometricIntuition: copy(
          '曲面交点附近用切平面近似，切平面的交点给出下一次猜测。',
          'Near the surface intersection, tangent planes approximate the surfaces and suggest the next guess.',
        ),
        numericalExample: copy(
          md`在 \([1,1]^T\) 处，示例系统的第一步为 \(\mathbf{s}_0=[-1.5,0.25]^T\)。`,
          md`At \([1,1]^T\), the example system has first step \(\mathbf{s}_0=[-1.5,0.25]^T\).`,
        ),
        modelConnection: copy(
          '隐式层反向传播和二阶优化都需要理解 Jacobian 线性系统是否稳定。',
          'Implicit-layer backpropagation and second-order optimization both require understanding whether the Jacobian solve is stable.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [],
    labs: [
      {
        id: 'nonlinear-equations-root-finding-lab',
        title: copy('一维求根方法对比', '1D Root-Finding Comparison'),
        type: 'interactive-visual',
        componentName: 'NonlinearEquationsLab',
        successCriteria: [
          copy('能解释二分法为什么稳定但收敛较慢。', 'Explain why bisection is stable but relatively slow.'),
          copy('能说明 Newton 法为什么会很快，也为什么会受初始点和导数影响。', 'Explain why Newton can be fast and why it depends on the start and derivative.'),
          copy('能比较割线法与 Newton 法在导数需求和函数求值成本上的差别。', 'Compare secant and Newton in derivative requirements and function-evaluation cost.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'nonlinear-equation-shift',
        type: 'single-choice',
        prompt: copy(md`要求解 \(f(x)=y\)，应该构造哪个求根问题？`, md`To solve \(f(x)=y\), which root-finding problem should be constructed?`),
        choices: [
          {
            id: 'subtract-y',
            label: copy(md`\(\tilde f(x)=f(x)-y=0\)`, md`\(\tilde f(x)=f(x)-y=0\)`),
          },
          {
            id: 'add-y',
            label: copy(md`\(f(x)+y=0\)`, md`\(f(x)+y=0\)`),
          },
          {
            id: 'square',
            label: copy(md`\(f(x)^2+y^2=0\)`, md`\(f(x)^2+y^2=0\)`),
          },
        ],
        answer: 'subtract-y',
        explanation: copy(
          md`把 \(y\) 移到左边即可。任何满足 \(f(x)=y\) 的点都会让 \(f(x)-y=0\)。`,
          md`Move \(y\) to the left. Any point satisfying \(f(x)=y\) also makes \(f(x)-y=0\).`,
        ),
        misconceptionTags: ['root-vs-equation'],
      },
      {
        id: 'nonlinear-bisection-requirement',
        type: 'single-choice',
        prompt: copy('二分法最关键的初始条件是什么？', 'What is the key initial condition for bisection?'),
        choices: [
          {
            id: 'sign-bracket',
            label: copy('连续函数在初始区间两端异号。', 'A continuous function has opposite signs at the interval endpoints.'),
          },
          {
            id: 'derivative',
            label: copy('必须知道解析导数。', 'The analytic derivative must be known.'),
          },
          {
            id: 'two-close',
            label: copy('必须给两个已经非常接近根的点。', 'Two points already very close to the root must be given.'),
          },
        ],
        answer: 'sign-bracket',
        explanation: copy(
          '二分法依赖介值定理。连续函数两端异号时，区间中至少有一个根。',
          'Bisection relies on the intermediate value theorem. A continuous function with opposite endpoint signs has at least one root in the interval.',
        ),
        misconceptionTags: ['bisection-always-works'],
      },
      {
        id: 'nonlinear-newton-cost',
        type: 'single-choice',
        prompt: copy('一维 Newton 法每一步通常需要评估什么？', 'What does one step of one-dimensional Newton usually evaluate?'),
        choices: [
          {
            id: 'value-derivative',
            label: copy(md`函数值 \(f(x_k)\) 和导数 \(f'(x_k)\)。`, md`The function value \(f(x_k)\) and derivative \(f'(x_k)\).`),
          },
          {
            id: 'value-only',
            label: copy(md`只需要 \(f(x_k)\)。`, md`Only \(f(x_k)\).`),
          },
          {
            id: 'matrix-only',
            label: copy('只需要矩阵特征值。', 'Only matrix eigenvalues.'),
          },
        ],
        answer: 'value-derivative',
        explanation: copy(
          md`更新式 \(x_{k+1}=x_k-f(x_k)/f'(x_k)\) 同时使用残差和局部斜率。`,
          md`The update \(x_{k+1}=x_k-f(x_k)/f'(x_k)\) uses both the residual and the local slope.`,
        ),
        misconceptionTags: ['newton-no-derivative'],
      },
    ],
    misconceptions: [
      {
        id: 'bisection-always-works',
        statement: copy('二分法对任何函数都能使用。', 'Bisection works for any function.'),
        correction: copy(
          '二分法需要连续性和初始异号区间。没有这两个条件，介值定理不给保证。',
          'Bisection needs continuity and an initial sign-changing bracket. Without both, the intermediate value theorem gives no guarantee.',
        ),
        example: copy(
          md`\(x^2\) 在 \(0\) 有根，但在根两侧都非负，普通二分法找不到异号区间。`,
          md`\(x^2\) has a root at \(0\), but it is nonnegative on both sides, so ordinary bisection cannot find a sign-changing bracket.`,
        ),
      },
      {
        id: 'newton-always-fast',
        statement: copy('Newton 法总是最快并且一定收敛。', 'Newton is always fastest and always converges.'),
        correction: copy(
          'Newton 法的二次收敛是局部性质，依赖简单根、非零导数和足够好的初始点。',
          'Newton quadratic convergence is local and depends on a simple root, nonzero derivative, and a good enough starting point.',
        ),
        example: copy(
          md`如果 \(f'(x_k)\) 接近 \(0\)，步长 \(-f(x_k)/f'(x_k)\) 可能非常大，迭代会跳出有用区域。`,
          md`If \(f'(x_k)\) is near \(0\), the step \(-f(x_k)/f'(x_k)\) can be huge and jump out of the useful region.`,
        ),
      },
      {
        id: 'inverse-jacobian-required',
        statement: copy(
          md`多维 Newton 法每步都应该显式求 \(J_f^{-1}\)。`,
          md`Multidimensional Newton should explicitly compute \(J_f^{-1}\) each step.`,
        ),
        correction: copy(
          md`实际计算应解线性系统 \(J_f\mathbf{s}=-\mathbf{f}\)，显式求逆通常更贵也更不稳定。`,
          md`In practice, solve the linear system \(J_f\mathbf{s}=-\mathbf{f}\). Explicit inversion is usually more expensive and less stable.`,
        ),
        example: copy(
          md`二维手算可以写出逆矩阵，但数值库通常调用线性求解器，例如 LU、QR 或带阻尼的 Newton 变体。`,
          md`A two-dimensional hand calculation may write the inverse, but numerical libraries usually call a linear solver such as LU, QR, or a damped Newton variant.`,
        ),
      },
    ],
  }
}
