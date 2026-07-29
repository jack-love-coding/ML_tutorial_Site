import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  MathLabTocItem,
  VisualAsset,
} from '../types/mathLab.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function tocFor(item: MathLabSection): MathLabTocItem {
  return { id: item.id, level: item.level, title: item.title }
}

function insertAfterOpening<T>(items: readonly T[], additions: readonly T[]): T[] {
  if (!items.length) return [...additions]
  return [items[0]!, ...additions, ...items.slice(1)]
}

function keepFirstLabPlacement(sections: readonly MathLabSection[]): MathLabSection[] {
  const seen = new Set<string>()
  return sections.map((item) => {
    if (!item.labIds?.length) return item
    const labIds = item.labIds.filter((labId) => {
      if (seen.has(labId)) return false
      seen.add(labId)
      return true
    })
    return labIds.length ? { ...item, labIds } : { ...item, labIds: undefined }
  })
}

const calibrationRouteVisual: VisualAsset = {
  id: 'logit-calibration-numerical-route-illustration',
  type: 'image',
  title: copy('同一条残差曲线，两类数值问题', 'One residual curve, two numerical problems'),
  assetPath: '/math-lab/numerical-methods/finite-difference-root-finding-calibration.png',
  transcript: copy(
    '图中央是一条随偏置 b 单调上升的残差曲线 F(b)。左侧在 b=0.35 附近取 F(b-h)、F(b) 与 F(b+h)，比较有限差分斜率，并标出步长过大时的截断误差与步长过小时的浮点相消。右侧沿同一曲线寻找与横轴的交点 F(b)=0，比较二分、Newton 和割线法，最后得到 b 约等于 0.73029。',
    'A monotone residual curve F(b) sits at the center. The left samples F(b-h), F(b), and F(b+h) around b=0.35 to compare finite-difference slopes, labeling truncation for overly large steps and floating-point cancellation for overly small steps. The right follows the same curve to its crossing F(b)=0, comparing bisection, Newton, and secant and ending near b=0.73029.',
  ),
  learningPurpose: copy(
    '先用局部函数值理解导数近似，再沿完全相同的函数寻找零点。',
    'Use local function values to understand derivative approximation, then find a zero of exactly the same function.',
  ),
  alt: copy(
    '中心为 logit 偏置残差曲线，左边展示有限差分步长，右边展示三种求根路径。',
    'A logit-bias residual curve in the center, with finite-difference step sizes on the left and three root-finding paths on the right.',
  ),
  caption: copy(
    '有限差分回答“这里有多陡”；非线性求根回答“哪里等于零”。两章共享同一份数据、变量和残差。',
    'Finite differences ask how steep the curve is here; nonlinear solvers ask where it equals zero. Both lessons share one fixture, variables, and residual.',
  ),
}

const finiteDifferenceAnimation: VisualAsset = {
  id: 'logit-calibration-finite-difference-video',
  type: 'manim-video',
  title: copy('从三次函数求值到 U 形误差曲线', 'From three function evaluations to a U-shaped error curve'),
  assetPath: '/manim/numerical-methods/logit-calibration-finite-difference.mp4',
  posterPath: '/manim/numerical-methods/logit-calibration-finite-difference-poster.png',
  transcript: copy(
    '动画先把 12 个固定 logit 加上 b=0.35，通过 sigmoid 得到平均概率，并减去目标 0.62，得到 F(b)=-0.0607869881。随后在 b 左右移动 h，前向差分使用 F(b+h)-F(b)，中心差分使用 F(b+h)-F(b-h)。当 h 从 10 的负 1 次方减小时，中心差分误差先降至 h=10 的负 5 次方处的 2.339×10 的负 12 次方，再因两个极接近数相减而回升；h=10 的负 12 次方时误差为 6.200×10 的负 5 次方。最后把差分结果与解析导数 0.1630982544 对齐，并强调最小步长不等于最好步长。',
    'The animation adds b=0.35 to 12 fixed logits, applies sigmoid, averages the probabilities, and subtracts target 0.62 to obtain F(b)=-0.0607869881. It then moves h to either side of b: forward difference uses F(b+h)-F(b), while central difference uses F(b+h)-F(b-h). As h falls from 10^-1, central error first drops to 2.339×10^-12 at h=10^-5, then rises because two nearly equal values are subtracted; at h=10^-12 the error is 6.200×10^-5. The ending aligns the approximation with analytic derivative 0.1630982544 and stresses that the smallest step is not the best step.',
  ),
  learningPurpose: copy(
    '把差分模板、函数调用和误差随步长先降后升的原因连在一起。',
    'Connect each stencil to its function calls and to why error first falls and then rises with smaller step size.',
  ),
  alt: copy(
    '在 b=0.35 附近采样残差并生成有限差分误差对步长的 U 形曲线。',
    'Residual samples near b=0.35 form a U-shaped finite-difference error-versus-step curve.',
  ),
  caption: copy(
    '固定运行结果：中心差分在采样网格中的最佳步长是 1e-5，而不是最小的 1e-12。',
    'Locked output: the best sampled central step is 1e-5, not the smallest 1e-12.',
  ),
}

const rootFindingAnimation: VisualAsset = {
  id: 'logit-calibration-root-finding-video',
  type: 'manim-video',
  title: copy('同一残差上的二分、Newton 与割线迭代', 'Bisection, Newton, and secant on one residual'),
  assetPath: '/manim/numerical-methods/logit-calibration-root-finding.mp4',
  posterPath: '/manim/numerical-methods/logit-calibration-root-finding-poster.png',
  transcript: copy(
    '动画沿上一章的同一条 F(b) 曲线寻找零点。二分法从 [-4,4] 开始，每次保留异号的一半，37 次更新后到达残差约 10 的负 12 次方；Newton 从 0 开始，用切线连续到 0.714023、0.730271 与 0.730291，三次更新完成；割线法从 -1 与 1 开始，用两次函数值估计斜率，五次更新完成。画面分别记录函数与导数求值成本，并展示无异号区间会让二分法拒绝启动、在 sigmoid 饱和区直接使用 Newton 可能离开保护域。结尾给出 b*=0.7302907403 与平均概率约 0.62。',
    'The animation follows the same F(b) curve from the previous lesson to its zero. Bisection starts at [-4,4], keeps the sign-changing half, and reaches residual around 10^-12 after 37 updates. Newton starts at 0 and follows tangents through 0.714023, 0.730271, and 0.730291, finishing in three updates. Secant starts at -1 and 1, estimates slopes from paired function values, and finishes in five updates. Function and derivative evaluation costs are counted separately. A non-sign-changing interval makes bisection refuse to start, while an unsafeguarded Newton step in sigmoid saturation can leave the protected domain. The ending gives b*=0.7302907403 and mean probability about 0.62.',
  ),
  learningPurpose: copy(
    '用一条真实残差曲线比较三种算法的信息需求、稳定性与局部速度。',
    'Compare information requirements, reliability, and local speed on one concrete residual curve.',
  ),
  alt: copy(
    '二分区间、Newton 切线和割线依次逼近 b 约等于 0.73029 的交点。',
    'A bisection bracket, Newton tangents, and secants converge to the crossing near b=0.73029.',
  ),
  caption: copy(
    '迭代次数不能单独比较：Newton 的每次更新还读取导数，二分法则保留明确区间。',
    'Iteration counts are not directly comparable: Newton also reads a derivative, while bisection maintains an explicit bracket.',
  ),
}

const finiteDifferenceConcept: MathConcept = {
  id: 'logit-calibration-finite-difference-contract',
  name: copy('偏置残差的有限差分合同', 'Finite-difference contract for bias residual'),
  formulaLatex: "F'(b)\approx\frac{F(b+h)-F(b-h)}{2h}",
  variables: [
    { symbol: 'b', description: copy('加到全部固定 logit 上的标量偏置。', 'Scalar bias added to every fixed logit.') },
    { symbol: 'F(b)', description: copy('平均 sigmoid 概率减去目标 0.62。', 'Mean sigmoid probability minus target 0.62.') },
    { symbol: 'h', description: copy('差分采样点与 b 的距离。', 'Distance from b to the finite-difference samples.') },
  ],
  plainExplanation: copy(
    '不知道导数实现时，可以只调用 F；但 h 太大会看见曲线弯曲，太小又会放大浮点相消。',
    'When a derivative implementation is unavailable, call only F; an overly large h sees curvature, while an overly small h amplifies floating-point cancellation.',
  ),
  geometricIntuition: copy(
    '中心差分用 b 两侧的割线斜率逼近 b 处切线，窗口缩小时先靠近切线，随后被数值精度限制。',
    'Central difference uses a secant through both sides of b to approach the tangent; shrinking the window helps until numeric precision limits it.',
  ),
  numericalExample: copy(
    '在 b=0.35，解析导数为 0.1630982544；采样网格中 h=1e-5 的中心差分误差为 2.339e-12。',
    'At b=0.35, the analytic derivative is 0.1630982544; central difference at sampled h=1e-5 has error 2.339e-12.',
  ),
  codeExample: `central = (residual(b + h) - residual(b - h)) / (2 * h)`,
  codeOutput: copy('h=1e-5 · central=0.16309825440208314', 'h=1e-5 · central=0.16309825440208314'),
  modelConnection: copy(
    '这类检查可用于定位手写梯度、custom op 或黑盒目标的局部变化率问题。',
    'This check can diagnose local-rate problems in handwritten gradients, custom ops, or black-box objectives.',
  ),
}

const rootFindingConcept: MathConcept = {
  id: 'logit-calibration-root-contract',
  name: copy('把平均概率目标改写成零点', 'Rewrite a mean-probability target as a zero'),
  formulaLatex: 'F(b)=\frac{1}{12}\sum_{i=1}^{12}\sigma(z_i+b)-0.62=0',
  variables: [
    { symbol: 'z_i', description: copy('第 i 个固定模型 logit。', 'The i-th fixed model logit.') },
    { symbol: 'b', description: copy('待求的全局加性偏置。', 'Unknown global additive bias.') },
    { symbol: 'F(b)', description: copy('带符号残差；根的位置就是目标匹配点。', 'Signed residual whose zero is the target-matching point.') },
  ],
  plainExplanation: copy(
    '只要能计算平均概率，就能计算 F(b)。二分法只要异号区间；Newton 还使用 F′(b)；割线法用两次函数值近似斜率。',
    'If mean probability can be evaluated, F(b) can be evaluated. Bisection needs a sign-changing bracket, Newton also uses F′(b), and secant estimates slope from two function values.',
  ),
  geometricIntuition: copy(
    '二分法夹住交点，Newton 用局部切线预测交点，割线法用两个历史点连线预测交点。',
    'Bisection encloses the crossing, Newton predicts it with a tangent, and secant predicts it with a line through two historical points.',
  ),
  numericalExample: copy(
    '固定根 b*=0.7302907403，此时平均概率为 0.619999999995351。',
    'The locked root is b*=0.7302907403, where mean probability is 0.619999999995351.',
  ),
  codeExample: `next_b = b - residual(b) / residual_derivative(b)`,
  codeOutput: copy('0 → 0.714023 → 0.730271 → 0.730291', '0 → 0.714023 → 0.730271 → 0.730291'),
  modelConnection: copy(
    '阈值匹配、约束满足、隐式层和平衡方程都常先改写为残差等于零。',
    'Threshold matching, constraint satisfaction, implicit layers, and equilibrium equations are often written as zero residuals.',
  ),
}

const finiteDifferenceSections = [
  section(
    'v3-finite-difference-calibration-contract',
    copy('连续案例：给 12 个 logit 加一个偏置', 'Continuous case: Add one bias to 12 logits'),
    copy(
      md`假设模型已经给出 12 个固定 logit $z_i$。本章不训练模型，只研究一个确定性的数值函数：给每个 logit 加上相同偏置 $b$，经 sigmoid 后取平均，再与目标正例率 0.62 比较：

$$
p_i(b)=\sigma(z_i+b),\qquad
F(b)=\frac1{12}\sum_{i=1}^{12}p_i(b)-0.62.
$$

当 $F(b)<0$，平均概率低于目标；当 $F(b)>0$，平均概率高于目标。固定数据在 $b=0$ 时的平均概率为 0.5015191619。在本章探针点 $b_0=0.35$，$F(b_0)=-0.0607869881$，所以我们既可以问“这里的残差随 $b$ 变化多快”，也为下一章留下“应把 $b$ 调到哪里”的问题。

这是一份项目编写的教学数据，不代表生产人群。匹配一个平均概率只解出一个标量方程，不等于每个样本概率都已经校准。`,
      md`Suppose a model has already produced 12 fixed logits $z_i$. This lesson does not train a model; it studies one deterministic numerical function. Add the same bias $b$ to every logit, apply sigmoid, average, and compare with target positive rate 0.62:

$$
p_i(b)=\sigma(z_i+b),\qquad
F(b)=\frac1{12}\sum_{i=1}^{12}p_i(b)-0.62.
$$

When $F(b)<0$, mean probability is below target; when $F(b)>0$, it is above target. At $b=0$, the fixed fixture has mean probability 0.5015191619. At this lesson's probe $b_0=0.35$, $F(b_0)=-0.0607869881$. We can now ask how rapidly the residual changes here, while leaving the next lesson to ask where $b$ should be moved.

This project-authored fixture does not represent a production population. Matching one mean probability solves one scalar equation; it does not imply that every sample probability is calibrated.`,
    ),
    { visualIds: [calibrationRouteVisual.id] },
  ),
  section(
    'v3-finite-difference-calibration-sweep',
    copy('固定步长扫描：误差为什么先下降再回升', 'Locked step sweep: Why error falls, then rises'),
    copy(
      md`因为 sigmoid 的导数可写出，本例可以计算对照值

$$
F'(b)=\frac1{12}\sum_i p_i(b)(1-p_i(b)),
$$

在 $b_0=0.35$ 得到 $F'(b_0)=0.1630982543997438$。Notebook 对 $h=10^{-1},\ldots,10^{-12}$ 逐档计算前向差分与中心差分。前向差分的采样最佳点在 $h=10^{-7}$，绝对误差约 $6.083\times10^{-10}$；中心差分的采样最佳点在 $h=10^{-5}$，误差约 $2.339\times10^{-12}$。

继续缩小并不会持续改善。到 $h=10^{-12}$，中心差分要相减两个几乎相同的浮点数，再除以极小的 $2h$，误差回升到约 $6.200\times10^{-5}$。误差曲线的左侧由浮点相消主导，右侧由 Taylor 截断主导，中间才是稳定窗口。最佳 $h$ 依赖函数尺度、精度与差分模板，不能把 1e-5 写成通用常数。`,
      md`Because the sigmoid derivative is available, this example has a comparison value

$$
F'(b)=\frac1{12}\sum_i p_i(b)(1-p_i(b)),
$$

giving $F'(0.35)=0.1630982543997438$. The Notebook evaluates forward and central differences for $h=10^{-1},\ldots,10^{-12}$. The best sampled forward point is $h=10^{-7}$ with absolute error about $6.083\times10^{-10}$; the best sampled central point is $h=10^{-5}$ with error about $2.339\times10^{-12}$.

Further shrinking does not keep helping. At $h=10^{-12}$, central difference subtracts nearly equal floating-point values and divides by tiny $2h$, so error rises to about $6.200\times10^{-5}$. Floating-point cancellation dominates the left side of the error curve, Taylor truncation the right, and a stable window lies between them. The best $h$ depends on function scale, precision, and stencil; 1e-5 is not a universal constant.`,
    ),
    { visualIds: [finiteDifferenceAnimation.id] },
  ),
  section(
    'v3-finite-difference-calibration-lab',
    copy('主实验：移动 b 与 h，找出稳定差分窗口', 'Primary lab: Move b and h to find a stable difference window'),
    copy(
      md`实验台默认载入同一偏置残差。先固定中心差分，把 $h$ 从 1e-1 缩到 1e-12：观察割线如何靠近切线、误差何时不再下降。再切换前向差分，比较只新增一次函数调用的低成本与一阶截断误差。

接着移动 $b$。sigmoid 在饱和区的 $p(1-p)$ 更小，因此曲线会变平，函数值差也更容易接近浮点精度。最后可切回指数函数与二次函数，确认“稳定步长窗口会随函数形状移动”，而不是把本案例的数值背下来。`,
      md`The lab defaults to the same bias residual. Keep central difference selected and shrink $h$ from 1e-1 to 1e-12: watch the secant approach the tangent and identify when error stops falling. Then switch to forward difference to compare its one-extra-call cost with first-order truncation.

Next move $b$. In sigmoid saturation, $p(1-p)$ is smaller, the curve flattens, and function-value differences approach floating-point precision sooner. Finally switch back to the exponential and quadratic functions to confirm that the stable step window moves with function shape; do not memorize the case-specific number.`,
    ),
    { labIds: ['finite-difference-error-lab'] },
  ),
  section(
    'v3-finite-difference-to-root-finding',
    copy('下一章：从“这里有多陡”到“哪里等于零”', 'Next: From “how steep here” to “where is zero”'),
    copy(
      md`本章用函数值恢复了 $F'(b)$ 的局部信息，但校准问题最终要求 $F(b)=0$。下一章保持同一数据、同一符号与同一残差，比较三种迭代路径：二分法用异号区间保证推进，Newton 法读取本章的导数，割线法则继续只用函数值估计斜率。`,
      md`This lesson recovered local information about $F'(b)$ from function values, but the calibration task ultimately asks for $F(b)=0$. The next lesson keeps the same data, symbols, and residual while comparing three paths: bisection advances with a sign-changing bracket, Newton reads the derivative from this lesson, and secant continues to estimate slope from function values alone.`,
    ),
  ),
]

const rootFindingSections = [
  section(
    'v3-root-calibration-contract',
    copy('沿用上一章：目标就是 F(b)=0', 'Continue the previous lesson: The target is F(b)=0'),
    copy(
      md`仍然使用固定的 12 个 logit 与目标 0.62。因为每一项 $\sigma(z_i+b)$ 都随 $b$ 单调增加，所以 $F(b)$ 也单调增加；在区间 $[-4,4]$ 两端分别有 $F(-4)<0$ 与 $F(4)>0$，连续性保证区间内至少有一个根，单调性进一步说明根唯一。

固定运行结果为

$$
b^*=0.730290740297536,\qquad
\frac1{12}\sum_i\sigma(z_i+b^*)=0.619999999995351.
$$

页面报告这么多小数是为了让代码、输出和测试逐项对齐，不表示业务上需要同样精度。实际停止阈值要根据概率误差、下游指标和计算成本选择。`,
      md`We keep the same 12 logits and target 0.62. Every term $\sigma(z_i+b)$ increases monotonically with $b$, so $F(b)$ is monotone. At the ends of $[-4,4]$, $F(-4)<0$ and $F(4)>0$; continuity guarantees at least one root, and monotonicity makes it unique.

The locked execution gives

$$
b^*=0.730290740297536,\qquad
\frac1{12}\sum_i\sigma(z_i+b^*)=0.619999999995351.
$$

The page prints many digits so code, outputs, and tests align exactly, not because a real application needs this precision. Production stopping tolerances should reflect probability error, downstream metrics, and compute cost.`,
    ),
    { visualIds: [calibrationRouteVisual.id] },
  ),
  section(
    'v3-root-calibration-solver-output',
    copy('固定结果：速度、可靠性与信息成本分开比较', 'Locked result: Compare speed, reliability, and information cost separately'),
    copy(
      md`Notebook 使用相同的残差阈值与位置阈值记录三条轨迹，但它们每步读取的信息不同：

| 方法 | 初始条件 | 更新次数 | 函数求值 | 导数求值 |
| --- | --- | ---: | ---: | ---: |
| 二分法 | 区间 $[-4,4]$ | 37 | 39 | 0 |
| Newton | $b_0=0$ | 3 | 4 | 4 |
| 割线法 | $b_{-1}=-1,b_0=1$ | 5 | 7 | 0 |

Newton 的路径是 $0\to0.714023\to0.730271\to0.730291$，在这个平滑且导数不小的案例里很快；但“3 次”不等于成本必然最低，因为每步还要计算导数。二分法较慢，却始终保留一个含根区间。割线法不用解析导数，速度位于两者之间，但没有二分法的区间保证。

停止时应同时看 $|F(b_k)|$ 与位置变化 $|b_k-b_{k-1}|$；二分法可用区间宽度。只看步长可能在平坦区域误判，只看残差也可能忽略变量尺度。`,
      md`The Notebook records all three traces with the same residual and position tolerances, but their steps consume different information:

| Method | Initial condition | Updates | Function evals | Derivative evals |
| --- | --- | ---: | ---: | ---: |
| Bisection | bracket $[-4,4]$ | 37 | 39 | 0 |
| Newton | $b_0=0$ | 3 | 4 | 4 |
| Secant | $b_{-1}=-1,b_0=1$ | 5 | 7 | 0 |

Newton follows $0\to0.714023\to0.730271\to0.730291$ and is fast for this smooth case with a non-small derivative. But “three updates” is not automatically cheapest because each update also evaluates a derivative. Bisection is slower yet always preserves a root-containing interval. Secant avoids an analytic derivative and lands between them in speed, but lacks bisection's bracket guarantee.

Stopping should check both $|F(b_k)|$ and position change $|b_k-b_{k-1}|$; bisection can use interval width. Step-only stopping can mislead on flat regions, while residual-only stopping can ignore variable scale.`,
    ),
    { visualIds: [rootFindingAnimation.id] },
  ),
  section(
    'v3-root-calibration-lab',
    copy('主实验：先守住区间，再观察开放方法', 'Primary lab: Preserve the bracket, then inspect open methods'),
    copy(
      md`实验台默认显示偏置残差，二分区间固定为 $[-4,4]$，Newton 从 0、割线从 -1 与 0 的可调当前点开始。逐步增加迭代次数，先核对二分区间每次减半，再观察 Newton 的切线落点和割线的两点斜率。

改变开放方法的初始点时，重点记录残差是否下降、步长是否突然放大、轨迹是否离开图示域。切换到平坦重根、余弦不动点和三次方程后，同一种算法会显示不同速度。方法名称不会自动保证收敛；函数形状、初始条件和保护策略共同决定结果。`,
      md`The lab defaults to the bias residual with bisection bracket $[-4,4]$, Newton starting at 0, and secant using -1 plus an adjustable current point. Increase iteration count one step at a time: first verify that bisection halves its interval, then inspect Newton tangent intercepts and secant two-point slopes.

When changing open-method starts, track whether residual falls, whether a step suddenly grows, and whether the path leaves the displayed domain. Switch to the flat multiple root, cosine fixed point, and cubic equation to see the same method converge at different rates. A method name cannot guarantee convergence; function shape, initial conditions, and safeguards jointly determine the outcome.`,
    ),
    { labIds: ['nonlinear-equations-root-finding-lab'] },
  ),
  section(
    'v3-root-calibration-failures-and-optimization',
    copy('失败边界与下一步：求零扩展为找最小值', 'Failure boundaries and next step: Extend zeros to minima'),
    copy(
      md`固定失败检查包含两个具体条件。第一，若给二分法区间 $[-4,-3]$，两端残差同号，算法应拒绝启动，而不是假装存在区间保证。第二，在很负的 $b$ 上 sigmoid 接近饱和，$F'(b)$ 很小，未保护的 Newton 步可能被 $1/F'(b)$ 放大并离开教学域。可靠实现通常保留区间、阻尼 Newton 步，或在开放步不安全时退回二分。

解出 $F(b)=0$ 只调整一个标量偏置，而且只匹配平均概率。下一章进入数值优化：当目标变为损失函数 $L(\theta)$，我们不再寻找带符号残差的交点，而要用梯度、学习率、线搜索和停止条件寻找较小的目标值。`,
      md`The locked failure checks contain two concrete conditions. First, the interval $[-4,-3]$ has same-sign residuals, so bisection must refuse to start rather than pretend it has a bracket guarantee. Second, sigmoid is nearly saturated at very negative $b$, making $F'(b)$ small; an unsafeguarded Newton step can be magnified by $1/F'(b)$ and leave the teaching domain. Reliable implementations often retain a bracket, damp Newton steps, or fall back to bisection when an open step is unsafe.

Solving $F(b)=0$ adjusts only one scalar bias and only matches mean probability. The next lesson moves to numerical optimization. When the target becomes a loss $L(\theta)$, we no longer seek a signed-residual crossing; we use gradients, learning rates, line searches, and stopping rules to find a smaller objective value.`,
    ),
  ),
]

function enhanceFiniteDifference(moduleDefinition: MathLabModule): MathLabModule {
  const insertedSections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, finiteDifferenceSections))
  return {
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 75),
    learningObjectives: [
      copy('在固定 logit 偏置残差上解释前向与中心差分的函数调用、截断阶和浮点误差。', 'Explain calls, truncation order, and floating-point error for forward and central differences on a fixed logit-bias residual.'),
      copy('通过完整步长扫描识别稳定窗口，并说明为什么更小的 h 可能更差。', 'Identify a stable window from a complete step sweep and explain why a smaller h can be worse.'),
      ...moduleDefinition.learningObjectives,
    ],
    aiModelConnections: [
      copy('有限差分可在不读取内部计算图时检查偏置残差、custom op 与手写梯度的局部变化率。', 'Finite differences can check local rates in bias residuals, custom ops, and handwritten gradients without reading an internal computation graph.'),
      ...moduleDefinition.aiModelConnections,
    ],
    concepts: [finiteDifferenceConcept, ...moduleDefinition.concepts],
    sections: insertedSections,
    toc: insertAfterOpening(moduleDefinition.toc, finiteDifferenceSections.map(tocFor)),
    visuals: [calibrationRouteVisual, finiteDifferenceAnimation, ...moduleDefinition.visuals],
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      calibrationRouteVisual.assetPath!,
      finiteDifferenceAnimation.assetPath!,
      finiteDifferenceAnimation.posterPath!,
    ],
  }
}

function enhanceNonlinearEquations(moduleDefinition: MathLabModule): MathLabModule {
  const insertedSections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, rootFindingSections))
  return {
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 80),
    learningObjectives: [
      copy('把平均 sigmoid 概率目标写成单调残差 F(b)=0，并说明根存在与唯一的条件。', 'Write a mean-sigmoid-probability target as monotone residual F(b)=0 and explain conditions for existence and uniqueness.'),
      copy('在同一停止合同下比较二分、Newton 与割线法的信息成本、稳定性和局部速度。', 'Compare information cost, reliability, and local speed for bisection, Newton, and secant under one stopping contract.'),
      ...moduleDefinition.learningObjectives,
    ],
    aiModelConnections: [
      copy('标量校准、约束满足与隐式方程都可先写成残差为零，再选择带保护的求解器。', 'Scalar calibration, constraint satisfaction, and implicit equations can be written as zero residuals before selecting a safeguarded solver.'),
      ...moduleDefinition.aiModelConnections,
    ],
    concepts: [rootFindingConcept, ...moduleDefinition.concepts],
    sections: insertedSections,
    toc: insertAfterOpening(moduleDefinition.toc, rootFindingSections.map(tocFor)),
    visuals: [calibrationRouteVisual, rootFindingAnimation, ...moduleDefinition.visuals],
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      calibrationRouteVisual.assetPath!,
      rootFindingAnimation.assetPath!,
      rootFindingAnimation.posterPath!,
    ],
  }
}

export function enhanceNumericalBatch3Module(moduleDefinition: MathLabModule): MathLabModule {
  if (moduleDefinition.id === 'finite-difference-methods') return enhanceFiniteDifference(moduleDefinition)
  if (moduleDefinition.id === 'nonlinear-equations') return enhanceNonlinearEquations(moduleDefinition)
  return moduleDefinition
}
