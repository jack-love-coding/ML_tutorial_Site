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
    'finite-difference-methods-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`学完本章后，应该能把“导数未知或太贵”翻译成可计算的函数采样问题：

导数的零基础直觉是“局部变化率”：当前点附近输入轻轻动一点，输出会动多少。有限差分把这个直觉变成一个可执行动作：真的去取附近两个或多个函数值，再用它们估计斜率。

1. 从导数极限读出前向差分，并用 Taylor 展开说明它的截断误差是 $O(h)$。
2. 比较前向、后向和中心差分的函数调用次数、适用场景和误差阶。
3. 解释为什么 $h$ 不能无限变小：截断误差下降时，舍入和相消误差会被 $1/h$ 放大。
4. 用有限差分近似标量函数的梯度，并理解 $\delta_i$ 如何只扰动第 $i$ 个坐标。
5. 把同样的思想扩展到向量值函数的 Jacobian 矩阵。
6. 说明有限差分在梯度检查、Newton 法和数值库调试中的具体用途。`,
      md`By the end of this chapter, you should be able to translate "the derivative is unknown or too expensive" into a computable function-sampling problem:

The beginner intuition for a derivative is "local rate of change": near the current point, how much does output move when input moves a little? Finite differences turn that intuition into an executable action: actually sample nearby function values and use them to estimate slope.

1. Read the forward difference from the derivative limit and use Taylor expansion to explain its $O(h)$ truncation error.
2. Compare forward, backward, and central differences by function-evaluation cost, use case, and error order.
3. Explain why $h$ cannot be made arbitrarily small: as truncation error falls, roundoff and cancellation error are amplified by $1/h$.
4. Approximate the gradient of a scalar-valued function with finite differences and understand how $\delta_i$ perturbs only coordinate $i$.
5. Extend the same idea to the Jacobian matrix of a vector-valued function.
6. Explain concrete uses in gradient checking, Newton methods, and numerical-library debugging.`,
    ),
  ),
  section(
    'finite-difference-methods-derivative-from-samples',
    copy('从导数极限到可计算斜率', 'From the derivative limit to a computable slope'),
    copy(
      md`对光滑函数 $f(x)$，我们常常想知道某点的导数 $f'(x)$。解析导数可能不存在现成表达式，也可能只能通过黑盒模拟器、远程模型或昂贵数值程序得到函数值。有限差分的核心想法很直接：不要先求符号导数，而是在 $x$ 附近取几个函数值，用变化量近似斜率。

导数定义是

$$
f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}.
$$

把极限里的“无限小”换成一个小但有限的扰动 $h$，就得到前向差分：

$$
df(x)=\frac{f(x+h)-f(x)}{h}.
$$

这里的 $h$ 不是随意的细节。它决定我们观察函数的局部窗口有多宽。窗口太宽，斜率被函数弯曲污染；窗口太窄，两个几乎相等的浮点数相减会损失有效数字。

Taylor 展开给出误差来源：

$$
f(x+h)=f(x)+f'(x)h+\frac{f''(x)}{2}h^2+O(h^3).
$$

两边减去 $f(x)$ 再除以 $h$：

$$
\frac{f(x+h)-f(x)}{h}=f'(x)+\frac{f''(x)}{2}h+O(h^2).
$$

因此前向差分满足

$$
f'(x)=df(x)+O(h).
$$

关键结论是：有限差分不是魔法，它是 Taylor 局部模型的一阶截断。`,
      md`For a smooth function $f(x)$, we often want the derivative $f'(x)$ at one point. The analytic derivative may not be available, or the function value may come from a black-box simulator, a remote model, or an expensive numerical routine. The finite-difference idea is direct: do not first derive a symbolic formula; sample nearby function values and turn their change into a slope.

The derivative is defined by

$$
f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}.
$$

Replacing the infinitesimal step in the limit with a small finite perturbation $h$ gives the forward difference:

$$
df(x)=\frac{f(x+h)-f(x)}{h}.
$$

The step $h$ is not a cosmetic detail. It decides how wide a local window we use to inspect the function. If the window is too wide, curvature contaminates the slope. If the window is too narrow, subtracting two nearly equal floating-point numbers loses useful digits.

Taylor expansion shows the source of the error:

$$
f(x+h)=f(x)+f'(x)h+\frac{f''(x)}{2}h^2+O(h^3).
$$

Subtract $f(x)$ and divide by $h$:

$$
\frac{f(x+h)-f(x)}{h}=f'(x)+\frac{f''(x)}{2}h+O(h^2).
$$

Therefore the forward difference satisfies

$$
f'(x)=df(x)+O(h).
$$

This preserves the original lecture's key conclusion: finite difference is not magic; it is a first-order truncation of the Taylor local model.`,
    ),
  ),
  section(
    'finite-difference-methods-three-stencils',
    copy('三种基本差分模板', 'Three basic difference stencils'),
    copy(
      md`一维导数最常用的三种模板是前向、后向和中心差分：

| 方法 | 公式 | 额外函数调用 | 截断误差 |
| --- | --- | ---: | --- |
| 前向差分 | $df(x)=\dfrac{f(x+h)-f(x)}{h}$ | 1 次，计算 $f(x+h)$ | $O(h)$ |
| 后向差分 | $df(x)=\dfrac{f(x)-f(x-h)}{h}$ | 1 次，计算 $f(x-h)$ | $O(h)$ |
| 中心差分 | $df(x)=\dfrac{f(x+h)-f(x-h)}{2h}$ | 2 次，计算 $f(x+h),f(x-h)$ | $O(h^2)$ |

中心差分为什么更准？把 $f(x+h)$ 和 $f(x-h)$ 的 Taylor 展开相减，偶数阶项会抵消，留下

$$
f(x+h)-f(x-h)=2f'(x)h+\frac{f'''(x)}{3}h^3+O(h^5).
$$

所以中心差分的主误差是 $O(h^2)$，代价是要在两侧各取一次函数值。这个“更准但更贵”的取舍在数值库和模型调试中经常出现。

手算例题使用下面的二次函数：

$$
f(x)=2x^2+15x+1,\qquad f'(x)=4x+15.
$$

在 $x=10,h=0.01$ 时，真实导数是 $f'(10)=55$。

前向差分：

$$
f(10)=351,\qquad f(10.01)=351.5502,
$$

$$
df_{\text{forward}}(10)=\frac{351.5502-351}{0.01}=55.02,
$$

误差为 $|55.02-55|=0.02$。

后向差分：

$$
f(9.99)=350.4502,\qquad
df_{\text{backward}}(10)=\frac{351-350.4502}{0.01}=54.98,
$$

误差同样是 $0.02$，只是偏向相反。

中心差分：

$$
df_{\text{central}}(10)=\frac{351.5502-350.4502}{2(0.01)}=55.0.
$$

对二次函数，中心差分正好抵消二阶弯曲项，所以这个例子中得到精确导数。对一般函数，中心差分通常不是完全精确，但误差阶更高。`,
      md`The three most common one-dimensional derivative stencils are forward, backward, and central differences:

| Method | Formula | Extra function evaluations | Truncation error |
| --- | --- | ---: | --- |
| Forward difference | $df(x)=\dfrac{f(x+h)-f(x)}{h}$ | 1, evaluating $f(x+h)$ | $O(h)$ |
| Backward difference | $df(x)=\dfrac{f(x)-f(x-h)}{h}$ | 1, evaluating $f(x-h)$ | $O(h)$ |
| Central difference | $df(x)=\dfrac{f(x+h)-f(x-h)}{2h}$ | 2, evaluating $f(x+h),f(x-h)$ | $O(h^2)$ |

Why is the central difference more accurate? Subtract the Taylor expansions of $f(x+h)$ and $f(x-h)$. The even-order terms cancel:

$$
f(x+h)-f(x-h)=2f'(x)h+\frac{f'''(x)}{3}h^3+O(h^5).
$$

The leading central-difference error is therefore $O(h^2)$, at the cost of sampling both sides. This "more accurate but more expensive" tradeoff appears repeatedly in numerical libraries and model debugging.

The worked example keeps the original lecture's quadratic:

$$
f(x)=2x^2+15x+1,\qquad f'(x)=4x+15.
$$

At $x=10,h=0.01$, the exact derivative is $f'(10)=55$.

Forward difference:

$$
f(10)=351,\qquad f(10.01)=351.5502,
$$

$$
df_{\text{forward}}(10)=\frac{351.5502-351}{0.01}=55.02,
$$

so the error is $|55.02-55|=0.02$.

Backward difference:

$$
f(9.99)=350.4502,\qquad
df_{\text{backward}}(10)=\frac{351-350.4502}{0.01}=54.98,
$$

with the same error $0.02$, but biased in the opposite direction.

Central difference:

$$
df_{\text{central}}(10)=\frac{351.5502-350.4502}{2(0.01)}=55.0.
$$

For a quadratic, the central difference cancels the second-order curvature term exactly, so this example recovers the derivative. For a general function it is not usually exact, but it has a higher error order.`,
    ),
  ),
  section(
    'finite-difference-methods-step-size-error',
    copy('步长选择：截断误差和相消误差的拉扯', 'Choosing step size: truncation versus cancellation'),
    copy(
      md`前向差分有两个主要误差来源。第一类是截断误差：用有限的 $h$ 代替极限，Taylor 余项留下大约 $Mh$ 的误差。第二类是舍入与相消误差：$f(x+h)$ 和 $f(x)$ 很接近，浮点相减会丢失有效数字，再除以 $h$ 时误差被放大。

一个常用的总误差模型是

$$
\text{error}\approx \frac{\epsilon_m |f(x)|}{h}+Mh,
$$

其中 $\epsilon_m$ 是 machine epsilon，$M$ 可理解为附近高阶导数大小给出的常数界。令两项平衡，可以得到前向差分的典型步长尺度：

$$
h\approx \sqrt{\frac{\epsilon_m |f(x)|}{M}}.
$$

这解释了下图中的误差形状：$h$ 很大时，截断误差主导；$h$ 很小时，舍入和相消误差主导；总误差在两者交会附近最小。

![有限差分误差曲线](/math-lab/cs357-assets/figs/finite_diff_errors.png)

下面的实验台把同一件事做成可操作版本。调节 $h$ 时，观察斜率近似、真实误差和舍入误差估计如何一起移动。切换到中心差分时，截断误差下降得更快，但一次估计需要两个函数值。`,
      md`Forward difference has two main error sources. The first is truncation error: a finite $h$ replaces a limit, leaving a Taylor remainder of about $Mh$. The second is roundoff and cancellation: $f(x+h)$ and $f(x)$ are close, so floating-point subtraction loses useful digits, and division by $h$ amplifies that loss.

A common total-error model is

$$
\text{error}\approx \frac{\epsilon_m |f(x)|}{h}+Mh,
$$

where $\epsilon_m$ is machine epsilon and $M$ can be read as a local bound related to higher derivatives. Balancing the two terms gives the typical step size scale for a forward difference:

$$
h\approx \sqrt{\frac{\epsilon_m |f(x)|}{M}}.
$$

This explains the original lecture's error plot: when $h$ is large, truncation error dominates; when $h$ is tiny, roundoff and cancellation dominate; total error is smallest near their intersection.

![Finite-difference error curves](/math-lab/cs357-assets/figs/finite_diff_errors.png)

The lab below turns the same idea into an adjustable object. As you change $h$, watch the slope approximation, true error, and roundoff estimate move together. Switching to central difference reduces truncation error faster, but one estimate costs two function values.`,
    ),
    { labIds: ['finite-difference-error-lab'] },
  ),
  section(
    'finite-difference-methods-gradient-checking',
    copy('从一维斜率到梯度检查', 'From one-dimensional slope to gradient checking'),
    copy(
      md`对标量值函数

$$
f(x_1,\dots,x_n):\mathbb{R}^n\to\mathbb{R},
$$

导数变成梯度向量：

$$
\nabla f(\mathbf{x})=
\begin{bmatrix}
\frac{\partial f}{\partial x_1}\\
\frac{\partial f}{\partial x_2}\\
\vdots\\
\frac{\partial f}{\partial x_n}
\end{bmatrix}.
$$

有限差分逐坐标扰动。令 $\delta_i$ 表示第 $i$ 个位置为 $1$、其余位置为 $0$ 的单位向量，前向差分梯度为

$$
\nabla_{FD}f(\mathbf{x})=
\begin{bmatrix}
\dfrac{f(\mathbf{x}+h\delta_1)-f(\mathbf{x})}{h}\\
\dfrac{f(\mathbf{x}+h\delta_2)-f(\mathbf{x})}{h}\\
\vdots\\
\dfrac{f(\mathbf{x}+h\delta_n)-f(\mathbf{x})}{h}
\end{bmatrix}.
$$

每个分量都可以换成后向或中心差分。中心差分通常更适合做梯度检查，因为它的截断误差更小；前向差分在函数调用预算更紧时更便宜。

梯度例题是

$$
f(x_1,x_2)=2x_1+x_1^2x_2+x_2^3,
$$

在 $(x_1,x_2)=(1.3,4.9)$ 且 $h=0.05$ 时，前向差分得到

$$
\nabla_{FD}f=
\begin{bmatrix}
14.985\\
74.4575
\end{bmatrix}.
$$

解析梯度是

$$
\nabla f=
\begin{bmatrix}
2x_1x_2+2\\
x_1^2+3x_2^2
\end{bmatrix}
=
\begin{bmatrix}
14.74\\
73.72
\end{bmatrix}.
$$

所以绝对误差为

$$
\begin{bmatrix}
0.245\\
0.7375
\end{bmatrix}.
$$

在机器学习里，这正是 gradient check 的基本逻辑：自动微分给一个梯度，有限差分给一个独立近似。如果两者差太多，常见原因包括符号写错、广播维度错、loss 缩放错，或者 $h$ 选得太极端。`,
      md`For a scalar-valued function

$$
f(x_1,\dots,x_n):\mathbb{R}^n\to\mathbb{R},
$$

the derivative becomes a gradient vector:

$$
\nabla f(\mathbf{x})=
\begin{bmatrix}
\frac{\partial f}{\partial x_1}\\
\frac{\partial f}{\partial x_2}\\
\vdots\\
\frac{\partial f}{\partial x_n}
\end{bmatrix}.
$$

Finite differences perturb one coordinate at a time. Let $\delta_i$ be the unit vector with a $1$ in coordinate $i$ and $0$ elsewhere. The forward-difference gradient is

$$
\nabla_{FD}f(\mathbf{x})=
\begin{bmatrix}
\dfrac{f(\mathbf{x}+h\delta_1)-f(\mathbf{x})}{h}\\
\dfrac{f(\mathbf{x}+h\delta_2)-f(\mathbf{x})}{h}\\
\vdots\\
\dfrac{f(\mathbf{x}+h\delta_n)-f(\mathbf{x})}{h}
\end{bmatrix}.
$$

Each component can instead use a backward or central difference. Central difference is often better for gradient checking because its truncation error is smaller; forward difference is cheaper when the function-evaluation budget is tight.

The original lecture's gradient example is

$$
f(x_1,x_2)=2x_1+x_1^2x_2+x_2^3.
$$

At $(x_1,x_2)=(1.3,4.9)$ with $h=0.05$, the forward difference gives

$$
\nabla_{FD}f=
\begin{bmatrix}
14.985\\
74.4575
\end{bmatrix}.
$$

The analytic gradient is

$$
\nabla f=
\begin{bmatrix}
2x_1x_2+2\\
x_1^2+3x_2^2
\end{bmatrix}
=
\begin{bmatrix}
14.74\\
73.72
\end{bmatrix}.
$$

The absolute error is therefore

$$
\begin{bmatrix}
0.245\\
0.7375
\end{bmatrix}.
$$

In machine learning, this is the basic logic of a gradient check: automatic differentiation gives one gradient, finite difference gives an independent approximation. A large mismatch can indicate a sign error, a broadcasting mistake, a loss-scaling bug, or an extreme choice of $h$.`,
    ),
  ),
  section(
    'finite-difference-methods-jacobian',
    copy('向量值函数的 Jacobian 近似', 'Jacobian approximation for vector-valued functions'),
    copy(
      md`如果函数输出也是向量，

$$
\mathbf{f}(\mathbf{x})=
\begin{bmatrix}
f_1(\mathbf{x})\\
\cdots\\
f_m(\mathbf{x})
\end{bmatrix},
\qquad
\mathbf{f}:\mathbb{R}^n\to\mathbb{R}^m,
$$

导数就是 Jacobian：

$$
J(\mathbf{x})=
\begin{bmatrix}
\frac{\partial f_1}{\partial x_1} & \cdots & \frac{\partial f_1}{\partial x_n}\\
\vdots & \ddots & \vdots\\
\frac{\partial f_m}{\partial x_1} & \cdots & \frac{\partial f_m}{\partial x_n}
\end{bmatrix}.
$$

有限差分近似 Jacobian 的第 $j$ 列时，只扰动输入的第 $j$ 个坐标：

$$
J_{FD}(:,j)=\frac{\mathbf{f}(\mathbf{x}+h\delta_j)-\mathbf{f}(\mathbf{x})}{h}.
$$

这和梯度近似是同一个动作，只是每次函数调用返回整列输出变化。

Jacobian 例题为

$$
\mathbf{f}(x_1,x_2)=
\begin{bmatrix}
2x_1^2+6x_1x_2\\
3x_1+7x_2
\end{bmatrix}.
$$

在 $(x_1,x_2)=(3,7)$、$h=0.1$ 时，前向差分给出

$$
J_{FD}=
\begin{bmatrix}
54.2 & 18\\
3 & 7
\end{bmatrix}.
$$

解析 Jacobian 是

$$
J=
\begin{bmatrix}
4x_1+6x_2 & 6x_1\\
3 & 7
\end{bmatrix}
=
\begin{bmatrix}
54 & 18\\
3 & 7
\end{bmatrix}.
$$

只有第一项出现 $0.2$ 的误差，因为 $f_1$ 对 $x_1$ 的方向含有二次项，前向差分没有完全抵消弯曲。对于 Newton 法、非线性方程组和隐式层，Jacobian 差分常用来验证实现或构造近似线性化。`,
      md`If the output is also a vector,

$$
\mathbf{f}(\mathbf{x})=
\begin{bmatrix}
f_1(\mathbf{x})\\
\cdots\\
f_m(\mathbf{x})
\end{bmatrix},
\qquad
\mathbf{f}:\mathbb{R}^n\to\mathbb{R}^m,
$$

the derivative is the Jacobian:

$$
J(\mathbf{x})=
\begin{bmatrix}
\frac{\partial f_1}{\partial x_1} & \cdots & \frac{\partial f_1}{\partial x_n}\\
\vdots & \ddots & \vdots\\
\frac{\partial f_m}{\partial x_1} & \cdots & \frac{\partial f_m}{\partial x_n}
\end{bmatrix}.
$$

To approximate column $j$ of the Jacobian, finite difference perturbs only input coordinate $j$:

$$
J_{FD}(:,j)=\frac{\mathbf{f}(\mathbf{x}+h\delta_j)-\mathbf{f}(\mathbf{x})}{h}.
$$

This is the same action as gradient approximation, except each function call returns a whole output vector change.

The original lecture's Jacobian example is

$$
\mathbf{f}(x_1,x_2)=
\begin{bmatrix}
2x_1^2+6x_1x_2\\
3x_1+7x_2
\end{bmatrix}.
$$

At $(x_1,x_2)=(3,7)$ with $h=0.1$, forward difference gives

$$
J_{FD}=
\begin{bmatrix}
54.2 & 18\\
3 & 7
\end{bmatrix}.
$$

The analytic Jacobian is

$$
J=
\begin{bmatrix}
4x_1+6x_2 & 6x_1\\
3 & 7
\end{bmatrix}
=
\begin{bmatrix}
54 & 18\\
3 & 7
\end{bmatrix}.
$$

Only the first entry has error $0.2$, because $f_1$ is quadratic in the $x_1$ direction and forward difference does not cancel curvature. For Newton methods, nonlinear systems, and implicit layers, Jacobian differences are often used to validate an implementation or build an approximate linearization.`,
    ),
  ),
  section(
    'finite-difference-methods-ml-connections',
    copy('机器学习和数值计算中的位置', 'Where this appears in machine learning and numerical computing'),
    copy(
      md`有限差分不是自动微分的替代品，而是一个独立的数值探针。

**梯度检查。** 对小模型或单个 batch，比较自动微分梯度和中心差分梯度。若相对误差远大于预期，就优先检查 loss 符号、正则化系数、平均/求和约定和张量广播。

**Newton 法与局部线性化。** 非线性方程或优化算法需要导数或 Jacobian。如果解析 Jacobian 难写，可以先用有限差分验证方向、尺度和符号，再决定是否写专用导数。

**黑盒模型调试。** 当模型只暴露预测接口时，有限差分可以估计某个输入特征的局部敏感性。但这个敏感性受 $h$、输入尺度、噪声和非光滑操作影响，不能直接等同于全局因果解释。

**数值库回归测试。** 科学计算代码常把有限差分作为“慢但可信”的参考，用来检查新实现的导数、Jacobian 或局部模型。

复习本章时要抓住一个主线：有限差分用函数值差商替代导数，但好坏由 Taylor 截断、浮点舍入、函数调用成本和输入尺度共同决定。`,
      md`Finite difference is not a replacement for automatic differentiation. It is an independent numerical probe.

**Gradient checking.** On a small model or a single batch, compare the automatic-differentiation gradient with a central-difference gradient. If the relative error is much larger than expected, first inspect the loss sign, regularization scale, mean-versus-sum convention, and tensor broadcasting.

**Newton methods and local linearization.** Nonlinear equations and optimization algorithms need derivatives or Jacobians. When an analytic Jacobian is hard to write, finite difference can first validate direction, scale, and sign before you invest in a specialized derivative.

**Black-box model debugging.** When a model exposes only a prediction endpoint, finite difference can estimate local sensitivity to one input feature. That sensitivity depends on $h$, input scale, noise, and nonsmooth operations, so it should not be mistaken for a global causal explanation.

**Numerical-library regression tests.** Scientific-computing code often uses finite difference as a slow but trusted reference for derivative, Jacobian, or local-model implementations.

The chapter's main thread is this: finite difference replaces derivatives with quotients of function values, but its quality is controlled jointly by Taylor truncation, floating-point roundoff, function-call cost, and input scaling.`,
    ),
  ),
  section(
    'finite-difference-methods-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 为什么前向差分可以从导数极限直接读出来？
2. 用 Taylor 展开说明前向差分为什么是 $O(h)$ 截断误差。
3. 前向、后向和中心差分各需要多少额外函数调用？
4. 为什么中心差分通常比前向差分更准？它多付出了什么代价？
5. 对 $f(x)=2x^2+15x+1$，在 $x=10,h=0.01$ 时，前向差分为什么得到 $55.02$？
6. $h$ 太大和太小时，分别主要出现哪类误差？
7. 为什么总误差模型里会出现 $\epsilon_m|f(x)|/h$？
8. 在梯度近似里，$\delta_i$ 的作用是什么？
9. 有限差分如何用于检查自动微分梯度？
10. Jacobian 的一列为什么可以通过只扰动一个输入坐标得到？
11. 对黑盒模型做有限差分敏感性分析时，为什么要特别注意输入尺度和非光滑操作？`,
      md`1. Why can the forward difference be read directly from the derivative limit?
2. Use Taylor expansion to explain why forward difference has $O(h)$ truncation error.
3. How many extra function evaluations do forward, backward, and central differences require?
4. Why is central difference usually more accurate than forward difference, and what cost does it pay?
5. For $f(x)=2x^2+15x+1$ at $x=10,h=0.01$, why does forward difference produce $55.02$?
6. What error dominates when $h$ is too large, and what error dominates when $h$ is too small?
7. Why does the total-error model contain $\epsilon_m|f(x)|/h$?
8. In gradient approximation, what does $\delta_i$ do?
9. How can finite difference be used to check an automatic-differentiation gradient?
10. Why can one column of a Jacobian be obtained by perturbing only one input coordinate?
11. When using finite difference sensitivity on a black-box model, why should input scale and nonsmooth operations be treated carefully?`,
    ),
  ),
]

export function buildFiniteDifferenceModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    enhancementTier: 'interactive',
    title: copy('有限差分方法', 'Finite Difference Methods'),
    subtitle: copy(
      '用相邻函数值近似导数，并理解步长、误差和梯度检查之间的关系。',
      'Approximate derivatives from nearby function values, and connect step size, error, and gradient checking.',
    ),
    estimatedMinutes: 38,
    prerequisites: ['taylor-series', 'vectors-matrices-norms'],
    aiModelConnections: [
      copy(
        '有限差分常用于 gradient check：用独立的数值斜率验证自动微分、手写梯度或 Jacobian 实现。',
        'Finite difference is common in gradient checks: an independent numerical slope validates automatic differentiation, hand-written gradients, or Jacobian implementations.',
      ),
      copy(
        'Newton 法、黑盒模型敏感性分析和数值库回归测试都需要理解“函数值差商”和步长误差的取舍。',
        'Newton methods, black-box sensitivity analysis, and numerical-library regression tests all depend on the tradeoff between function-value quotients and step-size error.',
      ),
    ],
    learningObjectives: [
      copy('从导数极限推导前向差分，并解释 $h$ 的含义。', 'Derive forward difference from the derivative limit and explain the meaning of $h$.'),
      copy('比较前向、后向和中心差分的误差阶和函数调用成本。', 'Compare forward, backward, and central differences by error order and function-evaluation cost.'),
      copy('解释截断误差与相消误差怎样共同决定最佳步长。', 'Explain how truncation error and cancellation error jointly determine a useful step size.'),
      copy('用逐坐标扰动构造梯度和 Jacobian 的有限差分近似。', 'Construct finite-difference gradient and Jacobian approximations by coordinate perturbation.'),
      copy('把有限差分连接到 gradient check、Newton 法和黑盒模型调试。', 'Connect finite difference to gradient checking, Newton methods, and black-box model debugging.'),
    ],
    concepts: [
      {
        id: 'finite-difference-derivative-core',
        name: copy('前向差分导数近似', 'Forward Difference Derivative Approximation'),
        formulaLatex: "df(x)=\\frac{f(x+h)-f(x)}{h},\\qquad f'(x)=df(x)+O(h)",
        variables: [
          {
            symbol: 'h',
            description: copy('扰动步长，决定在多宽的局部窗口里估计斜率。', 'Perturbation step size, deciding the width of the local slope window.'),
          },
          {
            symbol: 'df(x)',
            description: copy('由有限函数值差商得到的导数近似。', 'The derivative approximation produced by a finite quotient of function values.'),
          },
        ],
        plainExplanation: copy(
          '有限差分把“求导”改写成“在附近多算几次函数值并相减”。',
          'Finite difference rewrites differentiation as evaluating nearby function values and subtracting them.',
        ),
        geometricIntuition: copy(
          '它用一条割线替代切线；步长越小，割线越局部，但浮点相减越危险。',
          'It replaces a tangent line with a secant line; smaller steps are more local but make floating-point subtraction riskier.',
        ),
        numericalExample: copy(
          md`对 \(f(x)=2x^2+15x+1\)，在 \(x=10,h=0.01\) 时，前向差分给出 \(55.02\)，真实导数是 \(55\)。`,
          md`For \(f(x)=2x^2+15x+1\), at \(x=10,h=0.01\), forward difference gives \(55.02\), while the exact derivative is \(55\).`,
        ),
        codeExample:
          'def forward_difference(f, x, h):\n    return (f(x + h) - f(x)) / h\n\nprint(forward_difference(lambda x: 2*x*x + 15*x + 1, 10.0, 0.01))',
        modelConnection: copy(
          '当自动微分结果可疑时，可以用有限差分在少量参数上做独立梯度检查。',
          'When an automatic-differentiation result is suspicious, finite difference can independently check a few parameter gradients.',
        ),
      },
      {
        id: 'finite-difference-error-balance',
        name: copy('步长误差平衡', 'Step-Size Error Balance'),
        formulaLatex: '\\text{error}\\approx \\frac{\\epsilon_m |f(x)|}{h}+Mh',
        variables: [
          {
            symbol: '\\epsilon_m',
            description: copy('机器精度，描述浮点数能保留的相对精度。', 'Machine epsilon, describing the relative precision retained by floating-point numbers.'),
          },
          {
            symbol: 'M',
            description: copy('由附近高阶导数大小给出的截断误差常数界。', 'A truncation-error constant bound related to nearby higher derivatives.'),
          },
        ],
        plainExplanation: copy(
          '步长变小会降低截断误差，却会放大相消后的舍入误差。',
          'Shrinking the step lowers truncation error but amplifies roundoff after cancellation.',
        ),
        geometricIntuition: copy(
          '一边是割线窗口太宽，一边是两个点太近到看不清差别。',
          'One side is a secant window that is too wide; the other side is two points too close to distinguish numerically.',
        ),
        numericalExample: copy(
          md`双精度下，前向差分的好步长常接近 \(\sqrt{\epsilon_m}\) 的量级，而不是任意接近 \(0\)。`,
          md`In double precision, a useful forward-difference step is often near the scale of \(\sqrt{\epsilon_m}\), not arbitrarily close to \(0\).`,
        ),
        modelConnection: copy(
          '梯度检查失败时，先同时尝试多个 $h$，而不是立即断定自动微分或手写梯度错误。',
          'When a gradient check fails, try several values of $h$ before immediately blaming automatic differentiation or a hand-written gradient.',
        ),
      },
      {
        id: 'finite-difference-gradient-jacobian',
        name: copy('梯度与 Jacobian 差分', 'Gradient and Jacobian Differences'),
        formulaLatex: 'J_{FD}(:,j)=\\frac{\\mathbf{f}(\\mathbf{x}+h\\delta_j)-\\mathbf{f}(\\mathbf{x})}{h}',
        variables: [
          {
            symbol: '\\delta_j',
            description: copy('第 j 个坐标方向的单位扰动向量。', 'The unit perturbation vector in coordinate direction j.'),
          },
          {
            symbol: 'J_{FD}(:,j)',
            description: copy('有限差分近似出的 Jacobian 第 j 列。', 'Column j of the finite-difference Jacobian approximation.'),
          },
        ],
        plainExplanation: copy(
          '逐坐标移动输入，观察整个输出向量如何变化，就能拼出梯度或 Jacobian。',
          'Move one input coordinate at a time and observe the output change to assemble a gradient or Jacobian.',
        ),
        geometricIntuition: copy(
          '每一列都是“沿一个输入方向推一下”后输出空间的局部响应。',
          'Each column is the local output-space response after pushing one input direction.',
        ),
        numericalExample: copy(
          md`在 Jacobian 例题中，前向差分得到 \(\begin{bmatrix}54.2&18\\3&7\end{bmatrix}\)，解析结果是 \(\begin{bmatrix}54&18\\3&7\end{bmatrix}\)。`,
          md`In the lecture's Jacobian example, forward difference gives \(\begin{bmatrix}54.2&18\\3&7\end{bmatrix}\), while the analytic result is \(\begin{bmatrix}54&18\\3&7\end{bmatrix}\).`,
        ),
        modelConnection: copy(
          'Newton 法、隐式层和可微模拟器调试都需要确认 Jacobian 的方向和尺度是否合理。',
          'Newton methods, implicit layers, and differentiable-simulator debugging all need checks on Jacobian direction and scale.',
        ),
      },
    ],
    sections,
    toc: sections.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
    })),
    visuals: [],
    labs: [
      {
        id: 'finite-difference-error-lab',
        title: copy('有限差分步长实验', 'Finite Difference Step-Size Lab'),
        type: 'interactive-visual',
        componentName: 'FiniteDifferenceLab',
        successCriteria: [
          copy('能说明前向、后向和中心差分各自用了哪些采样点。', 'Explain which sample points forward, backward, and central differences use.'),
          copy('能判断当前误差主要来自截断还是相消与舍入。', 'Judge whether the current error is mainly truncation or cancellation and roundoff.'),
          copy('能把同一个步长选择问题连接到 gradient check。', 'Connect the same step-size choice to gradient checking.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'finite-difference-step-too-small',
        type: 'single-choice',
        prompt: copy('有限差分中 $h$ 极小时最容易放大的是什么？', 'What is most easily amplified when finite-difference $h$ is extremely small?'),
        choices: [
          { id: 'correct', label: copy('舍入和相消误差', 'Roundoff and cancellation error') },
          { id: 'distractor', label: copy('样本数量不足导致的方差', 'Variance from too few samples') },
        ],
        answer: 'correct',
        explanation: copy(
          md`差商要除以 \(h\)。当 \(f(x+h)\) 与 \(f(x)\) 太接近时，相减损失的有效数字会被 \(1/h\) 放大。`,
          md`The quotient divides by \(h\). When \(f(x+h)\) and \(f(x)\) are too close, lost digits from subtraction are amplified by \(1/h\).`,
        ),
        misconceptionTags: ['finite-difference-smaller-h'],
      },
      {
        id: 'finite-difference-central-cost',
        type: 'single-choice',
        prompt: copy('中心差分相比前向差分通常付出的主要代价是什么？', 'What main cost does central difference usually pay compared with forward difference?'),
        choices: [
          { id: 'correct', label: copy('需要两侧函数值，因此函数调用更多', 'It needs function values on both sides, so it uses more evaluations') },
          { id: 'distractor', label: copy('它完全不能用于多变量函数', 'It cannot be used for multivariable functions at all') },
        ],
        answer: 'correct',
        explanation: copy(
          md`中心差分 \(\frac{f(x+h)-f(x-h)}{2h}\) 通常有 \(O(h^2)\) 截断误差，但要计算 \(f(x+h)\) 和 \(f(x-h)\)。`,
          md`Central difference \(\frac{f(x+h)-f(x-h)}{2h}\) usually has \(O(h^2)\) truncation error, but it evaluates both \(f(x+h)\) and \(f(x-h)\).`,
        ),
        misconceptionTags: ['finite-difference-central-free'],
      },
      {
        id: 'finite-difference-gradient-check',
        type: 'single-choice',
        prompt: copy('用有限差分做 gradient check 时，最合理的比较对象是什么？', 'When using finite difference for a gradient check, what should it be compared against?'),
        choices: [
          { id: 'correct', label: copy('自动微分或手写梯度在同一点的结果', 'The automatic-differentiation or hand-written gradient at the same point') },
          { id: 'distractor', label: copy('另一个随机初始化模型的 loss', 'The loss of another randomly initialized model') },
        ],
        answer: 'correct',
        explanation: copy(
          '梯度检查是在同一点、同一 loss、同一参数尺度下比较两个导数估计。',
          'A gradient check compares two derivative estimates at the same point, for the same loss, and at the same parameter scale.',
        ),
        misconceptionTags: ['finite-difference-gradient-check-context'],
      },
    ],
    misconceptions: [
      {
        id: 'finite-difference-smaller-h',
        statement: copy('有限差分的步长越小，结果一定越准。', 'A smaller finite-difference step is always more accurate.'),
        correction: copy(
          '步长变小会降低截断误差，但会放大浮点相消误差；总误差通常有一个中间最小点。',
          'A smaller step lowers truncation error but amplifies floating-point cancellation; total error usually has an interior minimum.',
        ),
        example: copy(
          md`前向差分常用模型为 \(\epsilon_m|f(x)|/h+Mh\)，其中第一项会在 \(h\) 太小时增大。`,
          md`A common forward-difference model is \(\epsilon_m|f(x)|/h+Mh\), whose first term grows when \(h\) is too small.`,
        ),
      },
      {
        id: 'finite-difference-central-free',
        statement: copy('中心差分误差阶更高，所以总是无条件更好。', 'Central difference has higher order, so it is always better without qualification.'),
        correction: copy(
          '中心差分通常更准，但需要两侧函数值；若函数调用昂贵、边界外不可评估或噪声较大，就要重新权衡。',
          'Central difference is often more accurate, but it needs function values on both sides; expensive calls, boundary constraints, or noisy functions change the tradeoff.',
        ),
        example: copy(
          md`如果 \(x-h\) 超出可行域，只能用前向差分或重新参数化。`,
          md`If \(x-h\) leaves the feasible domain, you may need forward difference or a reparameterization.`,
        ),
      },
      {
        id: 'finite-difference-gradient-check-context',
        statement: copy('有限差分检查通过一次就证明整个训练代码都正确。', 'One passing finite-difference check proves the whole training code is correct.'),
        correction: copy(
          '它只验证当前点、当前 loss 和当前参数子集附近的局部导数。',
          'It only validates the local derivative near the current point, loss, and chosen parameter subset.',
        ),
        example: copy(
          'batch 归一化、dropout 或随机增强会让同一参数点的函数值不再完全确定，检查前需要固定随机性或切到评估模式。',
          'Batch normalization, dropout, or random augmentation can make the function value nondeterministic at the same parameter point; fix randomness or switch to evaluation mode before checking.',
        ),
      },
    ],
  }
}
