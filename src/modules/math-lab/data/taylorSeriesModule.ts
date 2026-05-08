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
    'taylor-local-polynomial-model',
    copy('从多项式到局部模型', 'From Polynomials to Local Models'),
    copy(
      md`Taylor 级数的出发点很朴素：如果一个函数在某个点附近足够平滑，我们希望用一个更容易计算的多项式来描述它在附近的形状。

一个关于变量 \(x\) 的 \(n\) 次多项式可以写成

$$
a_nx^n+a_{n-1}x^{n-1}+\cdots+a_2x^2+a_1x+a_0,
$$

也可以用求和符号写成

$$
\sum_{k=0}^{n} a_k x^k.
$$

这里的 \(x^0,x^1,x^2,\ldots\) 是单项式，整个多项式就是这些单项式的线性组合。Taylor 方法把这种多项式语言用于一般函数：系数不再随意选择，而是由函数在某个中心点的导数决定。

最短的局部模型只记住中心点 \(a\) 的高度：

$$
f(x)\approx f(a).
$$

加入一阶项以后，模型知道从中心点出发应该如何倾斜：

$$
f(x)\approx f(a)+f'(a)(x-a).
$$

加入二阶项以后，模型开始知道曲率，也就是函数在中心附近是向上弯、向下弯，还是接近直线：

$$
f(x)\approx f(a)+f'(a)(x-a)+\frac{f''(a)}{2}(x-a)^2.
$$

可以把每一层读成不同的局部信息：

| 项 | 数学对象 | 直觉 |
| --- | --- | --- |
| \(f(a)\) | 函数值 | 当前高度 |
| \(f'(a)(x-a)\) | 一阶项 | 当前斜率给出的线性趋势 |
| \(\frac{f''(a)}{2}(x-a)^2\) | 二阶项 | 当前曲率给出的弯曲修正 |
| 更高阶项 | 高阶导数 | 更细的局部形状修正 |

所以 Taylor 多项式不是凭空拟合函数，而是从一个锚点开始读取函数的局部形状。中心 \(a\) 一变，最可靠的近似区域也会跟着移动。`,
      md`The starting point of Taylor series is simple: if a function is smooth enough near a point, we want a polynomial that is easier to compute and still describes the function's nearby shape.

A degree \(n\) polynomial in \(x\) can be written as

$$
a_nx^n+a_{n-1}x^{n-1}+\cdots+a_2x^2+a_1x+a_0,
$$

or more compactly as

$$
\sum_{k=0}^{n} a_k x^k.
$$

The terms \(x^0,x^1,x^2,\ldots\) are monomials, and the polynomial is a linear combination of them. Taylor's method uses this polynomial language for general functions: the coefficients are not chosen freely; they are determined by derivative information at a chosen center.

The shortest local model remembers only the height at the center \(a\):

$$
f(x)\approx f(a).
$$

Adding the first-order term tells the model how to tilt away from the center:

$$
f(x)\approx f(a)+f'(a)(x-a).
$$

Adding the second-order term starts to encode curvature: whether the function bends upward, bends downward, or stays close to linear near the center.

$$
f(x)\approx f(a)+f'(a)(x-a)+\frac{f''(a)}{2}(x-a)^2.
$$

Each layer carries a different kind of local information:

| Term | Mathematical object | Intuition |
| --- | --- | --- |
| \(f(a)\) | Function value | Current height |
| \(f'(a)(x-a)\) | First-order term | Linear trend from the current slope |
| \(\frac{f''(a)}{2}(x-a)^2\) | Second-order term | Curvature correction |
| Higher-order terms | Higher derivatives | Finer local shape corrections |

A Taylor polynomial is therefore not fitting the function from nowhere. It reads the function from an anchor point. When the center \(a\) changes, the most reliable neighborhood changes with it.`,
    ),
  ),
  section(
    'taylor-polynomial-formula',
    copy('Taylor 多项式的构造', 'Constructing the Taylor Polynomial'),
    copy(
      md`如果函数 \(f\) 在中心 \(x_0\) 附近足够光滑，那么它在 \(x_0\) 处的 Taylor 级数为

$$
f(x_0)
+\frac{f'(x_0)}{1!}(x-x_0)
+\frac{f''(x_0)}{2!}(x-x_0)^2
+\frac{f^{(3)}(x_0)}{3!}(x-x_0)^3
+\cdots.
$$

用求和符号写成

$$
\sum_{k=0}^{\infty}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

其中 \(f^{(k)}(x_0)\) 是第 \(k\) 阶导数在中心点的值，并且 \(0!=1\)。实际计算时，我们通常只保留有限项：

$$
T_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

这个 \(T_n(x)\) 称为 \(n\) 次 Taylor 多项式。它用有限计算量近似原函数。对多项式函数来说，只要保留的阶数不低于原多项式次数，Taylor 多项式就会精确还原原函数。

三个常见展开值得熟练掌握：

**指数函数**

因为 \(e^x\) 的每阶导数都是 \(e^x\)，在 \(0\) 处每阶导数都等于 \(1\)，所以

$$
e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots.
$$

**正弦函数**

导数在 \(\sin,\cos,-\sin,-\cos\) 之间循环，在 \(0\) 处只留下奇次幂：

$$
\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\frac{x^7}{7!}+\cdots.
$$

**余弦函数**

在 \(0\) 处只留下偶次幂：

$$
\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\frac{x^6}{6!}+\cdots.
$$

下面的动画展示的是 \(\sin x\) 在 \(0\) 附近的一次、三次、五次 Taylor 多项式。注意：阶数提高时，贴近区域会变宽，但最稳定的区域仍围绕中心展开。`,
      md`If \(f\) is sufficiently smooth near the center \(x_0\), its Taylor series about \(x_0\) is

$$
f(x_0)
+\frac{f'(x_0)}{1!}(x-x_0)
+\frac{f''(x_0)}{2!}(x-x_0)^2
+\frac{f^{(3)}(x_0)}{3!}(x-x_0)^3
+\cdots.
$$

In summation notation,

$$
\sum_{k=0}^{\infty}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

Here \(f^{(k)}(x_0)\) is the \(k\)-th derivative evaluated at the center, and \(0!=1\). In computation, we usually keep only finitely many terms:

$$
T_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k.
$$

This \(T_n(x)\) is the degree \(n\) Taylor polynomial. It approximates the original function using finite work. For a polynomial function, a Taylor polynomial with degree at least as large as the original degree recovers the polynomial exactly.

Three common expansions are worth knowing fluently:

**Exponential function**

Every derivative of \(e^x\) is \(e^x\), so at \(0\) every derivative is \(1\):

$$
e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots.
$$

**Sine function**

The derivatives cycle through \(\sin,\cos,-\sin,-\cos\), and only odd powers remain at \(0\):

$$
\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\frac{x^7}{7!}+\cdots.
$$

**Cosine function**

At \(0\), only even powers remain:

$$
\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\frac{x^6}{6!}+\cdots.
$$

The animation below shows the first-, third-, and fifth-degree Taylor polynomials for \(\sin x\) near \(0\). As the degree increases, the region of agreement widens, but the most stable region still surrounds the center.`,
    ),
    { visualIds: ['taylor-polynomial-video'] },
  ),
  section(
    'taylor-remainder-error',
    copy('截断、余项与误差', 'Truncation, Remainder, and Error'),
    copy(
      md`Taylor 级数通常是无限和，但计算机只能处理有限项。保留到 \(n\) 次项以后，剩下的部分就是余项：

$$
R_n(x)=f(x)-T_n(x).
$$

如果 \(f\) 在 \(x\) 和 \(x_0\) 之间具有 \(n+1\) 阶导数，那么 Lagrange 余项形式给出

$$
R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1},
$$

其中 \(\xi\) 位于 \(x\) 和 \(x_0\) 之间。因此，如果在这段区间内

$$
\left|f^{(n+1)}(t)\right|\le M,
$$

就有误差界

$$
\left|f(x)-T_n(x)\right|
\le
\frac{M}{(n+1)!}|x-x_0|^{n+1}.
$$

这解释了一个重要直觉：当 \(h=|x-x_0|\to 0\) 时，

$$
\left|f(x)-T_n(x)\right|=O(h^{n+1}).
$$

也就是说，在同样阶数下，离中心点的距离变小，误差通常会按更高次幂快速下降。如果已知在距离 \(h_1\) 处的误差约为 \(e_1\)，那么距离 \(h_2\) 处可以粗略估计为

$$
e_2\approx \left(\frac{h_2}{h_1}\right)^{n+1}e_1.
$$

例如三次 Taylor 多项式的误差通常按四次方缩放。若 \(h_2=h_1/2\)，误差大约变成原来的 \(1/16\)。

**例题：用误差界决定 \(\sin(0.5)\) 需要多少项。**

使用 Maclaurin 展开

$$
\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots.
$$

若保留到三次项，

$$
T_3(0.5)=0.5-\frac{0.5^3}{6}.
$$

下一项大小为

$$
\frac{0.5^5}{5!}\approx 2.60\times 10^{-4}.
$$

如果目标误差小于 \(10^{-3}\)，三次项已经足够；如果目标误差小于 \(10^{-5}\)，就需要继续保留五次项或更高。

现在可以在实验台里移动中心、阶数和观察点。最值得观察的是：观察点远离中心时，即使阶数不低，误差也可能明显变大。`,
      md`A Taylor series is often an infinite sum, but a computer can only keep finitely many terms. After we keep terms through degree \(n\), the leftover part is the remainder:

$$
R_n(x)=f(x)-T_n(x).
$$

If \(f\) has \(n+1\) derivatives between \(x\) and \(x_0\), the Lagrange form of the remainder is

$$
R_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1},
$$

where \(\xi\) lies between \(x\) and \(x_0\). Therefore, if

$$
\left|f^{(n+1)}(t)\right|\le M
$$

on that interval, then

$$
\left|f(x)-T_n(x)\right|
\le
\frac{M}{(n+1)!}|x-x_0|^{n+1}.
$$

This explains a key intuition: when \(h=|x-x_0|\to 0\),

$$
\left|f(x)-T_n(x)\right|=O(h^{n+1}).
$$

For the same degree, moving closer to the center usually shrinks the error rapidly. If the error at distance \(h_1\) is approximately \(e_1\), then at distance \(h_2\) we often estimate

$$
e_2\approx \left(\frac{h_2}{h_1}\right)^{n+1}e_1.
$$

For example, the error of a cubic Taylor polynomial usually scales like a fourth power. If \(h_2=h_1/2\), the error is roughly \(1/16\) of the original.

**Worked example: decide how many terms are needed for \(\sin(0.5)\).**

Use the Maclaurin expansion

$$
\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots.
$$

If we keep terms through degree 3,

$$
T_3(0.5)=0.5-\frac{0.5^3}{6}.
$$

The next term has size

$$
\frac{0.5^5}{5!}\approx 2.60\times 10^{-4}.
$$

If the target error is below \(10^{-3}\), the cubic approximation is enough. If the target error is below \(10^{-5}\), keep the fifth-degree term or higher.

Use the lab below to move the center, degree, and point of evaluation. The important pattern is that error can grow clearly when the point moves away from the center, even if the degree is not small.`,
    ),
    { labIds: ['taylor-series-lab'] },
  ),
  section(
    'taylor-ml-connection',
    copy('机器学习中的 Taylor 直觉', 'Taylor Intuition in Machine Learning'),
    copy(
      md`机器学习里经常无法直接“看完整个函数”，只能在当前参数附近看局部变化。Taylor 展开正好给出这种语言。

**梯度下降是一阶局部模型。**

对损失函数 \(L(\theta)\)，在当前参数 \(\theta\) 附近：

$$
L(\theta+\Delta)
\approx L(\theta)+\nabla L(\theta)^\top \Delta.
$$

为了让这个线性近似下降，\(\Delta\) 应该和梯度方向相反，这就是负梯度方向的来源。

**Newton 法是二阶局部模型。**

加入 Hessian 后：

$$
L(\theta+\Delta)
\approx
L(\theta)+\nabla L(\theta)^\top\Delta
+\frac{1}{2}\Delta^\top H(\theta)\Delta.
$$

二阶项告诉优化器地形的弯曲程度，所以 Newton 类方法能在合适条件下走得更快，但也更贵、更依赖 Hessian 稳定性。

**数值库和深度学习框架也会用截断思想。**

激活函数近似、矩阵函数近似、求指数、求三角函数、自动微分中的局部线性化，都在不同层面使用“局部展开 + 控制误差”的思想。

最重要的判断是：Taylor 多项式通常越靠近中心越可靠；越远离中心，就越要检查误差、收敛半径或替代方法。`,
      md`In machine learning we often cannot inspect the whole function directly. We inspect local change near the current parameters. Taylor expansion gives that language.

**Gradient descent is a first-order local model.**

For a loss \(L(\theta)\), near the current parameter \(\theta\):

$$
L(\theta+\Delta)
\approx L(\theta)+\nabla L(\theta)^\top \Delta.
$$

To make this linear approximation decrease, \(\Delta\) should point opposite the gradient. That is the source of the negative-gradient direction.

**Newton's method is a second-order local model.**

With the Hessian included:

$$
L(\theta+\Delta)
\approx
L(\theta)+\nabla L(\theta)^\top\Delta
+\frac{1}{2}\Delta^\top H(\theta)\Delta.
$$

The second-order term tells the optimizer about curvature. Newton-type methods can move faster under good conditions, but they are more expensive and depend on a stable Hessian.

**Numerical libraries and deep learning frameworks also use truncation ideas.**

Activation approximations, matrix-function approximations, exponentials, trigonometric functions, and local linearization in automatic differentiation all use the same pattern: local expansion plus error control.

The most important judgment is this: Taylor polynomials are usually more reliable near the center. Far from the center, check the error, radius of convergence, or use a different method.`,
    ),
  ),
  section(
    'taylor-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. Taylor 多项式的一般形式是什么？
2. 给定函数和中心点，如何写出 \(n\) 次 Taylor 多项式？
3. 为什么 Taylor 多项式首先是局部近似？
4. 一阶项、二阶项和更高阶项分别编码什么局部信息？
5. 如何用 Taylor 多项式近似函数值？
6. 如何用 Lagrange 余项给出误差界？
7. 给定目标误差时，如何判断需要保留多少项？
8. Taylor 展开如何解释梯度下降和 Newton 法？`,
      md`1. What is the general form of a Taylor polynomial?
2. Given a function and a center, how do you write the degree \(n\) Taylor polynomial?
3. Why is a Taylor polynomial first of all a local approximation?
4. What local information do first-, second-, and higher-order terms encode?
5. How can a Taylor polynomial approximate a function value?
6. How can the Lagrange remainder give an error bound?
7. Given a target error, how can you decide how many terms are needed?
8. How does Taylor expansion explain gradient descent and Newton's method?`,
    ),
  ),
]

export function buildTaylorSeriesModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('泰勒级数', 'Taylor Series'),
    subtitle: copy(
      '从一个中心点的函数值、斜率和曲率出发，构造可计算的局部近似。',
      'Build computable local approximations from a function value, slope, and curvature at one center.',
    ),
    estimatedMinutes: 34,
    prerequisites: [],
    aiModelConnections: [
      copy(
        '梯度下降、Newton 法、有限差分和许多数值库都依赖 Taylor 的局部近似思想。',
        'Gradient descent, Newton methods, finite differences, and many numerical libraries rely on Taylor local approximation.',
      ),
    ],
    learningObjectives: [
      copy('解释中心点、阶数和局部有效性的关系。', 'Explain how center, degree, and locality are connected.'),
      copy(
        md`写出 \(e^x\)、\(\sin x\)、\(\cos x\) 的常见 Maclaurin 展开。`,
        md`Write the common Maclaurin expansions for \(e^x\), \(\sin x\), and \(\cos x\).`,
      ),
      copy('用 Lagrange 余项或下一项估计截断误差。', 'Use the Lagrange remainder or next-term estimate to reason about truncation error.'),
      copy('把一阶和二阶 Taylor 近似连接到梯度下降与 Newton 法。', 'Connect first- and second-order Taylor approximations to gradient descent and Newton methods.'),
    ],
    concepts: [
      {
        id: 'taylor-series-core',
        name: copy('Taylor 多项式', 'Taylor Polynomial'),
        formulaLatex: 'T_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k',
        variables: [
          {
            symbol: 'a',
            description: copy('展开中心，也是“局部”这个词的锚点。', 'Expansion center, the anchor for locality.'),
          },
          {
            symbol: 'n',
            description: copy('保留到第几阶，控制计算成本和局部精度。', 'The retained degree, controlling cost and local accuracy.'),
          },
          {
            symbol: 'f^{(k)}(a)',
            description: copy(md`函数在中心点的第 \(k\) 阶导数。`, md`The \(k\)-th derivative evaluated at the center.`),
          },
        ],
        plainExplanation: copy(
          'Taylor 多项式用中心点附近可测的导数信息，一层层修正函数的局部形状。',
          'A Taylor polynomial uses derivative information at a center to refine the local shape of a function term by term.',
        ),
        geometricIntuition: copy(
          '零阶看高度，一阶看斜率，二阶看弯曲，更高阶继续补局部细节。',
          'Zeroth order sees height, first order sees slope, second order sees curvature, and higher orders add local detail.',
        ),
        numericalExample: copy(
          md`在 0 附近，\(\sin x\approx x-x^3/6\) 很准；离 0 越远，越需要更高阶项或误差检查。`,
          md`Near 0, \(\sin x\approx x-x^3/6\) is accurate; farther away, higher-order terms or error checks matter.`,
        ),
        codeExample:
          'import math\n\nx = 0.7\napprox = x - x**3 / math.factorial(3) + x**5 / math.factorial(5)\nprint(approx, math.sin(x), abs(approx - math.sin(x)))',
        modelConnection: copy(
          '优化算法常把损失函数在当前参数附近展开，用一阶或二阶局部模型决定下一步。',
          'Optimization algorithms often expand the loss near current parameters and use first- or second-order local models to choose the next step.',
        ),
      },
    ],
    sections,
    toc: sections.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
    })),
    visuals: [
      {
        id: 'taylor-polynomial-video',
        type: 'manim-video',
        title: copy('Taylor 多项式逐阶贴近', 'Taylor polynomials approaching a function'),
        assetPath: '/manim/math-lab/taylor-polynomial.mp4',
        posterPath: '/manim/math-lab/taylor-polynomial.svg',
        transcript: copy(
          md`动画展示 \(\sin x\) 在 0 附近从一次、三次到五次 Taylor 多项式逐步贴近原函数。`,
          md`The animation shows first-, third-, and fifth-degree Taylor polynomials approaching \(\sin x\) near 0.`,
        ),
        learningPurpose: copy(
          '用运动展示“阶数增加改善局部形状，但中心附近最可靠”。',
          'Use motion to show that higher degree improves local shape while the center neighborhood remains most reliable.',
        ),
      },
    ],
    labs: [
      {
        id: 'taylor-series-lab',
        title: copy('Taylor 局部近似实验', 'Taylor Local Approximation Lab'),
        type: 'interactive-visual',
        componentName: 'TaylorSeriesLab',
        successCriteria: [
          copy('能解释中心点改变后，近似最可靠的区域也会移动。', 'Explain why moving the center moves the most reliable region.'),
          copy('能比较增加阶数与远离中心对误差的影响。', 'Compare how increasing degree and moving away from the center affect error.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'taylor-series-locality',
        type: 'single-choice',
        prompt: copy('Taylor 多项式首先是什么类型的模型？', 'What kind of model is a Taylor polynomial first of all?'),
        choices: [
          {
            id: 'correct',
            label: copy('围绕某个中心点的局部模型', 'A local model around a chosen center'),
          },
          {
            id: 'global',
            label: copy('自动在所有地方都准确的全局模型', 'A global model that is automatically accurate everywhere'),
          },
        ],
        answer: 'correct',
        explanation: copy(
          'Taylor 多项式由中心点处的导数决定，所以它最先保证的是中心附近的形状匹配。',
          'A Taylor polynomial is determined by derivatives at the center, so its strongest guarantee is shape matching near that center.',
        ),
        misconceptionTags: ['taylor-global'],
        revisitVisualId: 'taylor-polynomial-video',
      },
      {
        id: 'taylor-series-second-order',
        type: 'single-choice',
        prompt: copy('二阶 Taylor 项主要补充了哪类局部信息？', 'What local information does the second-order Taylor term mainly add?'),
        choices: [
          {
            id: 'correct',
            label: copy('曲率信息', 'Curvature information'),
          },
          {
            id: 'label',
            label: copy('样本类别标签', 'Class labels'),
          },
        ],
        answer: 'correct',
        explanation: copy(
          md`\(f''(a)(x-a)^2/2\) 让近似从切线升级为能表达局部弯曲的二次模型。`,
          md`\(f''(a)(x-a)^2/2\) upgrades the approximation from a tangent line to a quadratic model that captures local bending.`,
        ),
        misconceptionTags: ['taylor-order'],
        revisitVisualId: 'taylor-polynomial-video',
      },
    ],
    misconceptions: [
      {
        id: 'taylor-global',
        statement: copy(
          'Taylor 多项式阶数越高，就一定在任何地方都很准。',
          'A higher-degree Taylor polynomial is always accurate everywhere.',
        ),
        correction: copy(
          '精度取决于中心点、阶数、函数本身和观察点距离；Taylor 近似首先是局部工具。',
          'Accuracy depends on center, degree, the function, and distance from the point of evaluation; Taylor approximation is first a local tool.',
        ),
        example: copy(
          md`\(\sin x\) 的 Maclaurin 多项式在 0 附近很好，但离 0 很远时必须检查误差或增加阶数。`,
          md`A Maclaurin polynomial for \(\sin x\) works well near 0, but far from 0 you must check error or increase degree.`,
        ),
      },
      {
        id: 'taylor-order',
        statement: copy(
          '一阶、二阶、高阶只是公式长短不同，没有直觉区别。',
          'First, second, and higher order only differ in formula length, not in intuition.',
        ),
        correction: copy(
          '不同阶数对应不同局部信息：高度、斜率、曲率和更细的形状修正。',
          'Different orders encode different local information: height, slope, curvature, and finer shape corrections.',
        ),
        example: copy(
          '梯度下降使用一阶局部模型；Newton 法额外使用二阶曲率信息。',
          'Gradient descent uses a first-order local model; Newton methods additionally use second-order curvature.',
        ),
      },
    ],
  }
}
