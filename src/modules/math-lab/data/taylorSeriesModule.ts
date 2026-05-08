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
    'taylor-series-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`读完这一章后，你应该能够完成本章的三件核心任务，并把它们连接到后续的数值计算和机器学习语境中：

- 使用 Taylor 级数在给定中心点附近近似一个函数。
- 使用 Taylor 展开推导导数、积分或差分公式的近似形式。
- 量化 Taylor 多项式截断后产生的误差。
- 解释中心点 \(x_0\)、阶数 \(n\)、步长 \(h=x-x_0\) 分别控制了什么。
- 读懂一阶近似、二阶近似和更高阶项的直觉：值、斜率、曲率以及形状修正。
- 将一阶 Taylor 近似联系到梯度下降，将二阶 Taylor 近似联系到 Newton 法和 Hessian。

Taylor 级数不是把一个函数“翻译成另一个函数”，而是在某个中心点附近搭建一个可计算的局部模型。你知道中心点处的函数值和各阶导数，就能写出一个多项式；阶数越高，多项式在中心附近匹配的信息越多。真正需要警惕的是“附近”两个字：Taylor 多项式的可靠范围由误差项、收敛半径和函数本身的光滑性共同决定。`,
      md`By the end of this chapter, you should be able to do three core tasks and connect them to numerical computing and machine learning:

- Approximate a function using a Taylor series around a chosen center.
- Use Taylor expansions to derive approximations for derivatives, integrals, or finite-difference formulas.
- Quantify the error in a truncated Taylor approximation.
- Explain what the center \(x_0\), the degree \(n\), and the step \(h=x-x_0\) control.
- Interpret first-order, second-order, and higher-order terms as value, slope, curvature, and shape corrections.
- Connect first-order Taylor approximation to gradient descent, and second-order Taylor approximation to Newton's method and Hessians.

A Taylor series does not replace a function globally by magic. It builds a computable local model near a center point. If you know the function value and derivatives at that center, you can write a polynomial. Higher degree means the polynomial matches more local information. The word local matters: the reliable range is controlled by the remainder term, the radius of convergence, and the smoothness of the function.`,
    ),
  ),
  section(
    'taylor-series-polynomial-overview',
    copy('多项式概览', 'Polynomial Overview'),
    copy(
      md`Taylor 多项式首先是多项式，所以先把多项式语言整理清楚。

### \(n\) 次多项式

关于变量 \(x\) 的多项式总可以写成

$$
a_nx^n+a_{n-1}x^{n-1}+\dotsb+a_2x^2+a_1x+a_0,
$$

其中 \(a_i\) 是常数，\(0\le i\le n\)。用求和符号可以更紧凑地写成

$$
\sum_{k=0}^{n} a_k x^k.
$$

如果最高次项系数 \(a_n\ne 0\)，这个多项式称为 \(n\) 次多项式。

这个定义看起来只是记号，但它解释了为什么 Taylor 近似适合计算机：多项式只需要加法、乘法和若干常数系数。许多数值库在近似 \(\sin x\)、\(\exp x\)、\(\log(1+x)\) 等函数时，都会把输入先缩放到一个合适的小区间，再使用多项式或有理函数近似。

### 单项式与线性组合

变量 \(x\) 的单项式是 \(x\) 的非负整数次幂，例如 \(1,x,x^2,\ldots,x^n\)。有些教材也把带非零系数的 \(a x^n\) 称为单项式。按照这个观点，任意 \(n\) 次多项式

$$
\sum_{k=0}^{n} a_k x^k
$$

都可以看作单项式集合

$$
\{x^i\mid 0\le i\le n\}
$$

的线性组合。系数 \(a_k\) 决定每个单项式贡献多少。

Taylor 多项式的特别之处在于：这些系数不是随便拟合出来的，而是由中心点 \(x_0\) 处的导数决定的。常数项匹配函数值，一次项匹配斜率，二次项匹配曲率。也就是说，它把“局部几何信息”翻译成“多项式系数”。`,
      md`Taylor polynomials are polynomials, so we first need the polynomial language.

### Degree \(n\) Polynomial

A polynomial in the variable \(x\) can always be written as

$$
a_nx^n+a_{n-1}x^{n-1}+\dotsb+a_2x^2+a_1x+a_0,
$$

where \(a_i\) are constants and \(0\le i\le n\). With summation notation, the same polynomial is

$$
\sum_{k=0}^{n} a_k x^k.
$$

If the leading coefficient \(a_n\ne 0\), this is called a degree \(n\) polynomial.

This definition is more than notation. It explains why Taylor approximation is computationally useful: polynomials need only additions, multiplications, and fixed coefficients. Many numerical libraries approximate functions such as \(\sin x\), \(\exp x\), and \(\log(1+x)\) by first reducing the input to a small interval and then using polynomial or rational approximations.

### Monomials and Linear Combinations

A monomial in \(x\) is a nonnegative integer power of \(x\), such as \(1,x,x^2,\ldots,x^n\). Some texts also allow a nonzero coefficient and call \(a x^n\) a monomial. From this viewpoint, every degree \(n\) polynomial

$$
\sum_{k=0}^{n} a_k x^k
$$

is a linear combination of the monomial set

$$
\{x^i\mid 0\le i\le n\}.
$$

The coefficient \(a_k\) controls how much the monomial \(x^k\) contributes.

The special feature of a Taylor polynomial is that its coefficients are not arbitrary fitted numbers. They are determined by derivatives at the center \(x_0\). The constant term matches the function value, the linear term matches the slope, and the quadratic term matches curvature. Taylor approximation translates local geometric information into polynomial coefficients.`,
    ),
  ),
  section(
    'taylor-series-taylor-series-expansion',
    copy('Taylor 级数展开', 'Taylor Series Expansion'),
    copy(
      md`### 无限 Taylor 级数

设函数 \(f(x)\) 在中心点 \(x_0\) 附近足够光滑。Taylor 级数用 \(x_0\) 处的函数值和导数来构造一个幂级数：

$$
f(x_0)+\frac{f'(x_0)}{1!}(x-x_0)+\frac{f''(x_0)}{2!}(x-x_0)^2+\frac{f'''(x_0)}{3!}(x-x_0)^3+\dotsb.
$$

用求和符号写成

$$
\sum_{k=0}^{\infty}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

这里 \(f^{(k)}(x_0)\) 表示第 \(k\) 阶导数在 \(x_0\) 处的值，并且 \(0!=1\)。

如果 \(f\) 本身就是多项式，那么它的 Taylor 级数会在足够高阶后停止出现新信息：高阶导数最终为零，所以无限展开等于多项式本身。

### 有限 Taylor 多项式

实际计算中我们通常不能保留无限多项；有时函数也只在有限阶意义下可微。因此我们截断 Taylor 级数，用前 \(n+1\) 项构造 \(n\) 次 Taylor 多项式：

$$
T_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

这个式子是本章的核心公式。它读起来可以非常具体：

- \(T_0(x)=f(x_0)\)：只使用中心点的函数值，是一个水平常数模型。
- \(T_1(x)=f(x_0)+f'(x_0)(x-x_0)\)：加入斜率，是切线模型。
- \(T_2(x)=T_1(x)+\frac{f''(x_0)}{2}(x-x_0)^2\)：加入曲率，是局部抛物线模型。
- 更高阶项继续修正非对称性、拐弯速度和更细的形状变化。

中心点 \(x_0\) 决定“在哪里贴合”，阶数 \(n\) 决定“贴合多少阶导数”，距离 \(|x-x_0|\) 决定“离开局部信息有多远”。

### 例题：在 0 附近展开 \(\cos x\)

要在 \(x_0=0\) 附近展开 \(f(x)=\cos x\)，先列出导数在 0 处的值：

$$
\begin{aligned}
f(0)&=\cos 0=1,\\
f'(0)&=-\sin 0=0,\\
f''(0)&=-\cos 0=-1,\\
f'''(0)&=\sin 0=0,\\
f^{(4)}(0)&=\cos 0=1.
\end{aligned}
$$

代入 Taylor 公式：

$$
\begin{aligned}
\cos x
&=1+0\cdot x-\frac{x^2}{2!}+0\cdot x^3+\frac{x^4}{4!}-\dotsb\\
&=\sum_{k=0}^{\infty}\frac{(-1)^k}{(2k)!}x^{2k}.
\end{aligned}
$$

偶数阶留下来，奇数阶消失，是因为 \(\cos x\) 是偶函数；这一点也能从导数循环中看出来。

### 例题：用截断 Taylor 多项式近似 \(\sin(2)\)

现在用 \(x_0=0\) 处的 4 次 Taylor 多项式近似 \(f(x)=\sin x\)。导数值为

$$
\begin{aligned}
f(0)&=\sin 0=0,\\
f'(0)&=\cos 0=1,\\
f''(0)&=-\sin 0=0,\\
f'''(0)&=-\cos 0=-1,\\
f^{(4)}(0)&=\sin 0=0.
\end{aligned}
$$

因此

$$
\begin{aligned}
T_4(x)&=0+x+0-\frac{x^3}{3!}+0\\
&=x-\frac{x^3}{6}.
\end{aligned}
$$

代入 \(x=2\)：

$$
\sin(2)\approx T_4(2)=2-\frac{2^3}{6}=\frac{2}{3}.
$$

这个近似不算很精确，因为 \(2\) 离中心 \(0\) 已经不算近。若提高阶数，\(\sin x\) 的 Taylor 级数为

$$
\sin x=\sum_{k=0}^{\infty}\frac{(-1)^k}{(2k+1)!}x^{2k+1}.
$$

下面的动画展示了 \(\sin x\) 在 0 附近从一次、三次到五次 Taylor 多项式逐步贴合原函数的过程。观察重点不是“次数越高必然全局更好”，而是“中心附近贴合得更紧”。`,
      md`### Infinite Taylor Series

Assume \(f(x)\) is sufficiently smooth near the center \(x_0\). The Taylor series builds a power series from the function value and derivatives at \(x_0\):

$$
f(x_0)+\frac{f'(x_0)}{1!}(x-x_0)+\frac{f''(x_0)}{2!}(x-x_0)^2+\frac{f'''(x_0)}{3!}(x-x_0)^3+\dotsb.
$$

With summation notation:

$$
\sum_{k=0}^{\infty}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

Here \(f^{(k)}(x_0)\) means the \(k\)-th derivative evaluated at \(x_0\), and \(0!=1\).

If \(f\) itself is a polynomial, its Taylor series eventually stops adding new information: high-order derivatives become zero, so the infinite expansion is the polynomial itself.

### Finite Taylor Polynomial

In computation we usually cannot keep infinitely many terms. Sometimes the function is only differentiable to a finite order. We therefore truncate the Taylor series and keep the first \(n+1\) terms:

$$
T_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

This is the central formula for the chapter. Read it concretely:

- \(T_0(x)=f(x_0)\): a constant model using only the function value at the center.
- \(T_1(x)=f(x_0)+f'(x_0)(x-x_0)\): the tangent-line model using slope.
- \(T_2(x)=T_1(x)+\frac{f''(x_0)}{2}(x-x_0)^2\): a local parabola using curvature.
- Higher-order terms keep correcting asymmetry, bending rate, and finer shape changes.

The center \(x_0\) decides where the approximation matches. The degree \(n\) decides how many derivatives it matches. The distance \(|x-x_0|\) decides how far you are asking local information to travel.

### Example: Expanding \(\cos x\) Around 0

To expand \(f(x)=\cos x\) around \(x_0=0\), first evaluate derivatives at 0:

$$
\begin{aligned}
f(0)&=\cos 0=1,\\
f'(0)&=-\sin 0=0,\\
f''(0)&=-\cos 0=-1,\\
f'''(0)&=\sin 0=0,\\
f^{(4)}(0)&=\cos 0=1.
\end{aligned}
$$

Substitute these into the Taylor formula:

$$
\begin{aligned}
\cos x
&=1+0\cdot x-\frac{x^2}{2!}+0\cdot x^3+\frac{x^4}{4!}-\dotsb\\
&=\sum_{k=0}^{\infty}\frac{(-1)^k}{(2k)!}x^{2k}.
\end{aligned}
$$

Even-order terms remain and odd-order terms vanish because \(\cos x\) is an even function. The derivative cycle shows the same pattern.

### Example: Using a Truncated Taylor Polynomial for \(\sin(2)\)

Now approximate \(f(x)=\sin x\) at \(x=2\) using the degree-4 Taylor polynomial centered at \(x_0=0\). The derivative values are

$$
\begin{aligned}
f(0)&=\sin 0=0,\\
f'(0)&=\cos 0=1,\\
f''(0)&=-\sin 0=0,\\
f'''(0)&=-\cos 0=-1,\\
f^{(4)}(0)&=\sin 0=0.
\end{aligned}
$$

Therefore

$$
\begin{aligned}
T_4(x)&=0+x+0-\frac{x^3}{3!}+0\\
&=x-\frac{x^3}{6}.
\end{aligned}
$$

Plugging in \(x=2\):

$$
\sin(2)\approx T_4(2)=2-\frac{2^3}{6}=\frac{2}{3}.
$$

This is not extremely accurate because \(2\) is not very close to the center \(0\). Increasing the degree gives the Taylor series

$$
\sin x=\sum_{k=0}^{\infty}\frac{(-1)^k}{(2k+1)!}x^{2k+1}.
$$

The animation below shows the first-, third-, and fifth-degree Taylor polynomials for \(\sin x\) becoming tighter near 0. The key observation is not that higher degree must be better everywhere; it is that the approximation matches more tightly near the center.`,
    ),
    { visualIds: ['taylor-polynomial-video'] },
  ),
  section(
    'taylor-series-taylor-series-error',
    copy('Taylor 级数误差', 'Taylor Series Error'),
    copy(
      md`Taylor 近似真正有用，是因为它不仅给出近似值，还能告诉我们误差如何随距离和阶数变化。

### 截断误差阶数

设 \(f(x)\) 至少有 \(n+1\) 阶导数，\(T_n(x)\) 是以 \(x_0\) 为中心的 \(n\) 次 Taylor 多项式。令

$$
h=|x-x_0|.
$$

当 \(h\to 0\) 时，截断误差满足

$$
\left|f(x)-T_n(x)\right|\le C h^{n+1}=O(h^{n+1}).
$$

这说明两个事实：

- 固定阶数 \(n\) 时，越靠近中心点，误差下降越快。
- 固定距离 \(h\) 时，提高阶数通常会改善近似，但改善程度取决于高阶导数和收敛性质。

### Taylor 余项定理

更精确的误差表达来自 Lagrange 余项。若 \(f(x)\) 有 \(n+1\) 阶导数，则存在某个介于 \(x_0\) 和 \(x\) 之间的点 \(\xi\)，使得

$$
R_n(x)=f(x)-T_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}.
$$

因此可以把上面的常数 \(C\) 写成区间上的上界：

$$
C=\max_{\xi}\frac{\left|f^{(n+1)}(\xi)\right|}{(n+1)!}.
$$

这也解释了“下一项估计”的来源：如果高阶导数变化不剧烈，那么 Taylor 级数的下一项常常能给误差规模提供一个实用估计。但这只是估计，不是所有函数、所有点上都可靠的定理替代品。

### 误差的渐近行为

如果 \(n\) 次 Taylor 多项式在距离 \(h_1\) 处的误差约为 \(e_1\)，那么在距离 \(h_2\) 处的误差可以按阶数估计：

$$
e_1\propto h_1^{n+1},\qquad e_2\propto h_2^{n+1}.
$$

两式相除得到

$$
\frac{e_1}{e_2}=\left(\frac{h_1}{h_2}\right)^{n+1},
$$

也就是

$$
e_2=\left(\frac{h_2}{h_1}\right)^{n+1}e_1.
$$

这个公式常用于估算“把步长减半后误差会降多少”。例如三次 Taylor 多项式的截断误差是 \(O(h^4)\)，步长减半后误差大约乘以 \((1/2)^4=1/16\)。

### 例题：\(\sin x\) 的 4 次 Taylor 误差界

用 \(x_0=0\) 处的 4 次 Taylor 多项式近似 \(\sin x\) 时，余项为

$$
R_4(x)=\frac{f^{(5)}(\xi)}{5!}x^5.
$$

因为 \(f^{(5)}(x)=\cos x\)，并且 \(|\cos \xi|\le 1\)，所以

$$
|R_4(x)|\le \frac{|x|^5}{5!}=\frac{|x|^5}{120}.
$$

这给出了一个可靠的上界。它可能比真实误差保守，但不会低估。

### 例题：给定一个误差反推新误差

设对函数 \(\sqrt{x-10}\) 在中心 \(x_0=12\) 展开三次 Taylor 多项式。若当 \(h_1=0.5\) 时截断误差约为 \(e_1=10^{-4}\)，估计 \(h_2=0.25\) 时的误差。

三次多项式意味着主导误差阶数为 \(n+1=4\)，因此

$$
e_2=\left(\frac{0.25}{0.5}\right)^4 10^{-4}
=\frac{1}{16}\cdot 10^{-4}
=6.25\times 10^{-6}.
$$

### 交互实验：中心、阶数和观察点

下面的实验台把本节公式变成可拖动的图像。你可以选择 \(\sin x\)、\(\cos x\)、\(e^x\)，移动展开中心 \(a\)、阶数 \(n\) 和观察点 \(x\)。读数会同时显示真实值 \(f(x)\)、Taylor 多项式 \(T_n(x)\)、绝对误差、下一项估计和可用误差界。

实验时建议关注三件事：

- 固定阶数，移动观察点远离中心，误差线通常会快速变长。
- 固定观察点，提高阶数，中心附近的曲线会更贴合。
- 对 \(e^x\) 这类函数，远离中心时误差界会明显受高阶导数大小影响。`,
      md`Taylor approximation is useful because it gives both an approximation and a way to reason about error.

### Truncation Error Order

Let \(f(x)\) have at least \(n+1\) derivatives, and let \(T_n(x)\) be the degree \(n\) Taylor polynomial centered at \(x_0\). Define

$$
h=|x-x_0|.
$$

As \(h\to 0\), the truncation error satisfies

$$
\left|f(x)-T_n(x)\right|\le C h^{n+1}=O(h^{n+1}).
$$

This says two things:

- With fixed degree \(n\), moving closer to the center makes the error shrink rapidly.
- With fixed distance \(h\), increasing the degree often improves the approximation, but the improvement depends on high-order derivatives and convergence behavior.

### Taylor Remainder Theorem

A sharper expression comes from the Lagrange remainder. If \(f(x)\) has \(n+1\) derivatives, then for some point \(\xi\) between \(x_0\) and \(x\),

$$
R_n(x)=f(x)-T_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}.
$$

So the constant \(C\) above can be written as an interval bound:

$$
C=\max_{\xi}\frac{\left|f^{(n+1)}(\xi)\right|}{(n+1)!}.
$$

This also explains the next-term estimate: when high-order derivatives do not vary too much, the next term of the Taylor series often gives a practical estimate of the error scale. It is an estimate, not a replacement for an actual bound in every function and every region.

### Asymptotic Error Behavior

If a degree \(n\) Taylor polynomial has error about \(e_1\) at distance \(h_1\), then the error at distance \(h_2\) can be estimated by the order:

$$
e_1\propto h_1^{n+1},\qquad e_2\propto h_2^{n+1}.
$$

Dividing gives

$$
\frac{e_1}{e_2}=\left(\frac{h_1}{h_2}\right)^{n+1},
$$

or

$$
e_2=\left(\frac{h_2}{h_1}\right)^{n+1}e_1.
$$

This formula is commonly used to estimate how much error falls when the step size is halved. For a cubic Taylor polynomial, the truncation error is \(O(h^4)\), so halving the distance multiplies the error by about \((1/2)^4=1/16\).

### Example: Error Bound for Degree-4 Taylor Approximation of \(\sin x\)

Using the degree-4 Taylor polynomial for \(\sin x\) centered at \(x_0=0\), the remainder is

$$
R_4(x)=\frac{f^{(5)}(\xi)}{5!}x^5.
$$

Since \(f^{(5)}(x)=\cos x\) and \(|\cos \xi|\le 1\),

$$
|R_4(x)|\le \frac{|x|^5}{5!}=\frac{|x|^5}{120}.
$$

This is a reliable upper bound. It may be conservative, but it does not underestimate the error.

### Example: Predicting a New Error from a Known Error

Suppose \(\sqrt{x-10}\) is expanded as a degree-3 Taylor polynomial centered at \(x_0=12\). If the truncation error at \(h_1=0.5\) is about \(e_1=10^{-4}\), estimate the error at \(h_2=0.25\).

A cubic polynomial has leading error order \(n+1=4\), so

$$
e_2=\left(\frac{0.25}{0.5}\right)^4 10^{-4}
=\frac{1}{16}\cdot 10^{-4}
=6.25\times 10^{-6}.
$$

### Interactive Lab: Center, Degree, and Observation Point

The lab below turns the formulas in this section into a draggable visual model. You can choose \(\sin x\), \(\cos x\), or \(e^x\), then move the expansion center \(a\), degree \(n\), and observation point \(x\). The readouts show the true value \(f(x)\), the Taylor value \(T_n(x)\), the absolute error, the next-term estimate, and an available error bound.

Watch three patterns:

- With fixed degree, moving the observation point away from the center usually lengthens the error segment quickly.
- With fixed observation point, increasing the degree tightens the match near the center.
- For functions such as \(e^x\), error bounds can grow noticeably because the high-order derivatives grow as the input grows.`,
    ),
    { labIds: ['taylor-series-lab'] },
  ),
  section(
    'taylor-series-ml-summary',
    copy('从 Taylor 到优化和机器学习', 'From Taylor to Optimization and Machine Learning'),
    copy(
      md`Taylor 级数在机器学习中常常不以“Taylor 级数”这个名字出现，但它是许多优化和近似方法背后的局部语言。

### 一阶近似与梯度下降

对多变量函数 \(L(\theta)\)，在参数 \(\theta\) 附近的一阶 Taylor 近似是

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^T\Delta.
$$

如果希望让损失下降，选择与梯度相反的方向 \(\Delta=-\eta \nabla L(\theta)\)，就得到梯度下降的基本更新直觉：

$$
\theta_{\text{new}}=\theta-\eta \nabla L(\theta).
$$

这不是凭空来的规则，而是“一阶局部模型告诉我们哪个方向会让函数下降最快”的结果。

### 二阶近似与 Newton 法

加入二阶项后，

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^T\Delta+\frac{1}{2}\Delta^T H(\theta)\Delta,
$$

其中 \(H(\theta)\) 是 Hessian 矩阵。令这个二次模型的梯度为零，可以得到 Newton 步：

$$
H(\theta)\Delta=-\nabla L(\theta).
$$

二阶模型利用曲率信息，因此在局部二次近似可靠时会很快；代价是需要 Hessian 或其近似，计算和存储成本都更高。

### 激活函数和数值库中的截断

激活函数、softmax、指数、对数和三角函数在底层实现中经常会遇到近似问题。Taylor 多项式提供了基本思路：在小区间上用低阶表达式替代昂贵函数，并用误差界控制精度。实际工程库通常会再结合范围缩减、分段多项式、Chebyshev 近似或有理函数近似，以获得更稳定的全局精度。

在阅读后续章节时，可以把 Taylor 看成一种反复出现的思维方式：

- 有复杂函数，就先在当前点附近写局部模型。
- 要优化，就先问一阶项给出的下降方向，再看二阶项是否值得使用。
- 要做数值近似，就同时追踪截断误差和舍入误差。
- 要判断近似是否可信，就看中心、距离、阶数和余项界。`,
      md`Taylor series often appears in machine learning without being named explicitly. It is the local language behind many optimization and approximation methods.

### First-Order Approximation and Gradient Descent

For a multivariable loss \(L(\theta)\), the first-order Taylor approximation near \(\theta\) is

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^T\Delta.
$$

To decrease the loss, choose the direction opposite the gradient, \(\Delta=-\eta \nabla L(\theta)\). This gives the basic gradient descent update:

$$
\theta_{\text{new}}=\theta-\eta \nabla L(\theta).
$$

The rule is not arbitrary. It comes from the first-order local model telling us which direction decreases the function fastest.

### Second-Order Approximation and Newton's Method

Adding the second-order term gives

$$
L(\theta+\Delta)\approx L(\theta)+\nabla L(\theta)^T\Delta+\frac{1}{2}\Delta^T H(\theta)\Delta,
$$

where \(H(\theta)\) is the Hessian matrix. Setting the gradient of this quadratic model to zero gives the Newton step:

$$
H(\theta)\Delta=-\nabla L(\theta).
$$

The second-order model uses curvature, so it can move quickly when the local quadratic approximation is reliable. The cost is that the Hessian, or an approximation to it, can be expensive to compute and store.

### Activation Functions and Truncation in Numerical Libraries

Activation functions, softmax, exponentials, logarithms, and trigonometric functions all raise approximation questions in low-level implementations. Taylor polynomials provide the basic idea: replace an expensive function by a low-degree expression on a small interval, and control accuracy with an error bound. Production numerical libraries often combine this with range reduction, piecewise polynomials, Chebyshev approximation, or rational approximation for better global stability.

In later chapters, treat Taylor approximation as a reusable way of thinking:

- When a function is complicated, first write a local model near the current point.
- When optimizing, ask what descent direction the first-order term gives, then decide whether second-order information is worth its cost.
- When approximating numerically, track both truncation error and roundoff error.
- When judging whether an approximation is trustworthy, inspect the center, distance, degree, and remainder bound.`,
    ),
  ),
  section(
    'taylor-series-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. Taylor 级数的一般形式是什么？每个符号分别表示什么？
2. 给定函数和中心点 \(x_0\)，怎样写出 \(n\) 次 Taylor 多项式？
3. 常数项、一次项、二次项分别匹配函数的哪些局部信息？
4. 怎样用 Taylor 级数近似函数在某点的值？
5. 怎样从 Taylor 展开推导导数或差分近似？
6. 对 \(n\) 次 Taylor 多项式，误差关于距离 \(h=|x-x_0|\) 的阶数是什么？
7. 对简单函数，怎样用 Taylor 余项定理找到误差界中的常数 \(C\)？
8. 如果要求误差小于给定阈值，怎样估算需要保留多少项？
9. 为什么 Taylor 多项式通常是局部近似，而不是自动给出全局准确模型？
10. 一阶和二阶 Taylor 近似分别如何连接到梯度下降和 Newton 法？`,
      md`1. What is the general form of a Taylor series? What does each symbol mean?
2. Given a function and a center \(x_0\), how do you write the degree \(n\) Taylor polynomial?
3. What local information is matched by the constant, linear, and quadratic terms?
4. How do you use a Taylor series to approximate a function value at a point?
5. How can Taylor expansion be used to derive derivative or finite-difference approximations?
6. For a degree \(n\) Taylor polynomial, what is the error order in terms of \(h=|x-x_0|\)?
7. For simple functions, how do you use the Taylor Remainder Theorem to find the constant \(C\) in an error bound?
8. If the error must be below a given threshold, how can you estimate how many terms are required?
9. Why is a Taylor polynomial usually a local approximation rather than an automatically accurate global model?
10. How do first- and second-order Taylor approximations connect to gradient descent and Newton's method?`,
    ),
  ),
]

export function buildTaylorSeriesModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('泰勒级数', 'Taylor Series'),
    subtitle: copy(
      '围绕一个中心点，用函数值、导数和误差界构造可计算的局部近似。',
      'Build computable local approximations from a center point, derivatives, and error bounds.',
    ),
    estimatedMinutes: 38,
    learningObjectives: [
      copy('使用 Taylor 级数近似函数。', 'Approximate a function using a Taylor series.'),
      copy('使用 Taylor 展开推导导数、积分或差分近似。', 'Use Taylor expansions to derive derivative, integral, or finite-difference approximations.'),
      copy('量化 Taylor 多项式截断误差。', 'Quantify the truncation error of a Taylor polynomial.'),
      copy('把一阶和二阶 Taylor 近似连接到优化算法。', 'Connect first- and second-order Taylor approximations to optimization algorithms.'),
    ],
    aiModelConnections: [
      copy(
        '梯度下降、Newton 法、激活函数近似和数值库截断都依赖 Taylor 式的局部建模思想。',
        'Gradient descent, Newton methods, activation approximations, and numerical-library truncation all rely on Taylor-style local modeling.',
      ),
    ],
    concepts: [
      {
        id: 'taylor-polynomial',
        name: copy('Taylor 多项式', 'Taylor Polynomial'),
        formulaLatex: 'T_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k',
        variables: [
          {
            symbol: 'x_0',
            description: copy('展开中心，所有导数都在这里取值。', 'The expansion center where derivatives are evaluated.'),
          },
          {
            symbol: 'n',
            description: copy('保留到的最高次数。', 'The highest retained degree.'),
          },
          {
            symbol: 'f^{(k)}(x_0)',
            description: copy('函数在中心点的第 k 阶导数。', 'The k-th derivative of the function at the center.'),
          },
        ],
        plainExplanation: copy(
          'Taylor 多项式用中心点处的函数值和导数构造一个局部多项式替身。',
          'A Taylor polynomial uses function values and derivatives at a center to build a local polynomial substitute.',
        ),
        geometricIntuition: copy(
          '零阶匹配高度，一阶匹配切线，二阶匹配曲率，更高阶继续调整局部形状。',
          'Order zero matches height, order one matches tangent slope, order two matches curvature, and higher orders refine local shape.',
        ),
        numericalExample: copy(
          '在 0 附近，\\(\\sin x\\approx x-x^3/6\\)。代入 \\(x=0.5\\) 得到约 \\(0.47917\\)，真实值约 \\(0.47943\\)。',
          'Near 0, \\(\\sin x\\approx x-x^3/6\\). At \\(x=0.5\\), this gives about \\(0.47917\\), while the true value is about \\(0.47943\\).',
        ),
        modelConnection: copy(
          '许多优化算法每一步都在当前参数附近建立一阶或二阶 Taylor 局部模型。',
          'Many optimization algorithms build a first- or second-order Taylor local model around the current parameters at each step.',
        ),
      },
      {
        id: 'taylor-remainder',
        name: copy('Taylor 余项', 'Taylor Remainder'),
        formulaLatex: 'R_n(x)=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}',
        variables: [
          {
            symbol: 'R_n(x)',
            description: copy('真实函数与 n 次 Taylor 多项式之间的误差。', 'The error between the true function and the degree n Taylor polynomial.'),
          },
          {
            symbol: '\\xi',
            description: copy('位于 x 和 x_0 之间的某个点。', 'Some point between x and x_0.'),
          },
        ],
        plainExplanation: copy(
          '余项说明截断后漏掉的量由下一阶导数和距离的 n+1 次方控制。',
          'The remainder says the omitted part is controlled by the next derivative and the distance raised to the n+1 power.',
        ),
        geometricIntuition: copy(
          '离中心越远，局部信息被外推得越远，误差通常增长越快。',
          'The farther you move from the center, the farther local information is extrapolated, so error usually grows faster.',
        ),
        numericalExample: copy(
          '对 \\(\\sin x\\) 的四次 Taylor 多项式，\\(|R_4(x)|\\le |x|^5/120\\)。',
          'For the degree-4 Taylor polynomial of \\(\\sin x\\), \\(|R_4(x)|\\le |x|^5/120\\).',
        ),
        modelConnection: copy(
          '误差界帮助判断近似激活函数、近似梯度和低精度计算是否仍在可接受范围内。',
          'Error bounds help judge whether approximate activations, approximate gradients, and lower-precision computations remain acceptable.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [
      {
        id: 'taylor-polynomial-video',
        type: 'manim-video',
        title: copy('Taylor 多项式逐阶贴合 \\(\\sin x\\)', 'Taylor polynomials progressively match \\(\\sin x\\)'),
        assetPath: '/manim/math-lab/taylor-polynomial.mp4',
        posterPath: '/manim/math-lab/taylor-polynomial.svg',
        transcript: copy(
          '动画展示一次、三次、五次 Taylor 多项式在 0 附近逐步贴近 \\(\\sin x\\)，同时保留远离中心时误差变大的视觉线索。',
          'The animation shows first-, third-, and fifth-degree Taylor polynomials becoming closer to \\(\\sin x\\) near 0 while preserving the visual cue that error grows away from the center.',
        ),
        learningPurpose: copy(
          '帮助读者把“匹配导数”看成曲线在中心附近逐步贴合。',
          'Help readers see derivative matching as progressive local curve agreement near the center.',
        ),
        alt: copy(
          'sin 曲线及其一次、三次、五次 Taylor 多项式的动画。',
          'Animation of the sine curve and its first-, third-, and fifth-degree Taylor polynomials.',
        ),
        caption: copy(
          '阶数升高主要改善中心附近的局部贴合；远离中心仍需要看余项。',
          'Increasing degree mainly improves local agreement near the center; away from the center, the remainder still matters.',
        ),
      },
    ],
    labs: [
      {
        id: 'taylor-series-lab',
        title: copy('Taylor 局部近似实验台', 'Taylor Local Approximation Lab'),
        type: 'interactive-visual',
        componentName: 'TaylorSeriesLab',
        successCriteria: [
          copy('能够移动中心点并说明误差线为何变化。', 'Move the center point and explain why the error segment changes.'),
          copy('能够比较一次、二次和高阶多项式的贴合范围。', 'Compare the useful range of first-, second-, and higher-degree polynomials.'),
          copy('能够用读数判断下一项估计和误差界的差别。', 'Use the readouts to distinguish a next-term estimate from an error bound.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'taylor-series-checkpoint',
        type: 'single-choice',
        prompt: copy(
          'Taylor 多项式的中心点 \(x_0\) 最直接决定什么？',
          'What does the center \(x_0\) of a Taylor polynomial most directly determine?',
        ),
        choices: [
          {
            id: 'match-location',
            label: copy('函数值和导数在哪里被匹配。', 'Where the function value and derivatives are matched.'),
          },
          {
            id: 'global-range',
            label: copy('多项式在整个实数轴上都准确。', 'That the polynomial is accurate on the entire real line.'),
          },
          {
            id: 'degree',
            label: copy('多项式必须有多少阶。', 'The required degree of the polynomial.'),
          },
        ],
        answer: 'match-location',
        explanation: copy(
          '中心点决定局部信息的采样位置；准确范围还取决于阶数、距离和余项。',
          'The center determines where local information is sampled; the useful range also depends on degree, distance, and the remainder.',
        ),
        misconceptionTags: ['taylor-global'],
        revisitVisualId: 'taylor-polynomial-video',
      },
      {
        id: 'taylor-remainder-order',
        type: 'single-choice',
        prompt: copy(
          '若使用 \(n\) 次 Taylor 多项式，并且函数足够光滑，中心附近的主导截断误差通常是什么阶？',
          'If a degree \(n\) Taylor polynomial is used and the function is smooth enough, what is the usual leading truncation-error order near the center?',
        ),
        choices: [
          {
            id: 'n-plus-one',
            label: copy('\\(O(h^{n+1})\\)', '\\(O(h^{n+1})\\)'),
          },
          {
            id: 'n',
            label: copy('\\(O(h^n)\\)', '\\(O(h^n)\\)'),
          },
          {
            id: 'constant',
            label: copy('\\(O(1)\\)', '\\(O(1)\\)'),
          },
        ],
        answer: 'n-plus-one',
        explanation: copy(
          'Lagrange 余项包含 \((x-x_0)^{n+1}\)，因此中心附近的截断误差按 \(h^{n+1}\) 缩放。',
          'The Lagrange remainder contains \((x-x_0)^{n+1}\), so near the center the truncation error scales like \(h^{n+1}\).',
        ),
        misconceptionTags: ['taylor-remainder'],
      },
    ],
    misconceptions: [
      {
        id: 'taylor-global',
        statement: copy(
          'Taylor 多项式阶数越高，就一定在所有地方越准确。',
          'A higher-degree Taylor polynomial is necessarily more accurate everywhere.',
        ),
        correction: copy(
          'Taylor 多项式首先是局部模型。阶数升高通常改善中心附近的贴合，但远离中心时仍可能发散或误差变大。',
          'A Taylor polynomial is first a local model. Higher degree often improves agreement near the center, but far away it can still diverge or have larger error.',
        ),
        example: copy(
          '\\(\\sin x\\) 在 0 附近用少数项就很好，但在更远处必须检查余项和收敛行为。',
          '\\(\\sin x\\) is well approximated by a few terms near 0, but farther away the remainder and convergence behavior must be checked.',
        ),
      },
      {
        id: 'taylor-remainder',
        statement: copy(
          'Taylor 余项就是被删掉的下一项，所以永远可以直接拿下一项当严格误差。',
          'The Taylor remainder is just the next omitted term, so the next term is always a strict error.',
        ),
        correction: copy(
          '下一项常能估计误差规模，但严格误差界需要控制区间内的高阶导数。',
          'The next term often estimates the error scale, but a rigorous bound requires controlling the higher derivative on the interval.',
        ),
        example: copy(
          '对 \\(\\sin x\\) 可以用 \\(|f^{(5)}(\\xi)|\\le 1\\) 得到严格界；对 \\(e^x\\) 则要看区间上 \\(e^\\xi\\) 的最大值。',
          'For \\(\\sin x\\), \\(|f^{(5)}(\\xi)|\\le 1\\) gives a rigorous bound; for \\(e^x\\), the maximum of \\(e^\\xi\\) on the interval matters.',
        ),
      },
    ],
  }
}
