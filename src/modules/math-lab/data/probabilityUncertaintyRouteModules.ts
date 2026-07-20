import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
} from '../types/mathLab.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  zhTitle: string,
  enTitle: string,
  zhContent: string,
  enContent: string,
): MathLabSection {
  return {
    id,
    level: 2,
    title: copy(zhTitle, enTitle),
    content: copy(zhContent, enContent),
  }
}

function withToc(moduleDefinition: MathLabModule): MathLabModule {
  return {
    ...moduleDefinition,
    toc: moduleDefinition.sections.map(({ id, level, title }) => ({ id, level, title })),
  }
}

function withConceptCode(
  concepts: readonly MathConcept[],
  conceptId: string,
  codeExample: string,
  output: string,
): MathConcept[] {
  return concepts.map((concept) => concept.id === conceptId
    ? { ...concept, codeExample, codeOutput: copy(output, output) }
    : concept)
}

const monteCarloCode = md`import numpy as np

sample_sizes = (100, 1_000, 10_000)

for sample_count in sample_sizes:
    rng = np.random.default_rng(7)
    points = rng.random((sample_count, 2))
    squared_radius = np.sum(points ** 2, axis=1)
    inside_fraction = float(np.mean(squared_radius <= 1.0))
    pi_estimate = 4 * inside_fraction
    absolute_error = abs(pi_estimate - np.pi)
    print(
        sample_count,
        "pi_hat =", round(pi_estimate, 6),
        "abs_error =", round(absolute_error, 6),
    )`

const monteCarloOutput = `100 pi_hat = 3.08 abs_error = 0.061593
1000 pi_hat = 3.196 abs_error = 0.054407
10000 pi_hat = 3.1644 abs_error = 0.022807`

const probabilityModelCode = md`import numpy as np

logits = np.array([1.2, 0.3, -0.7], dtype=float)
target_index = 0
reference = np.array([0.5, 0.3, 0.2], dtype=float)

if logits.ndim != 1 or not np.isfinite(logits).all():
    raise ValueError("logits must be a finite one-dimensional array")
if reference.shape != logits.shape or (reference <= 0).any():
    raise ValueError("reference must be positive and match logits")
if not np.isclose(reference.sum(), 1.0):
    raise ValueError("reference must sum to one")

shifted = logits - logits.max()
probabilities = np.exp(shifted) / np.exp(shifted).sum()
target_nll = -np.log(probabilities[target_index])
entropy = -np.sum(probabilities * np.log(probabilities))
kl_p_q = np.sum(probabilities * np.log(probabilities / reference))

print("probabilities =", [round(value, 6) for value in probabilities])
print("target_nll =", round(float(target_nll), 6))
print("entropy =", round(float(entropy), 6))
print("kl_p_q =", round(float(kl_p_q), 6))`

const probabilityModelOutput = `probabilities = [0.642616, 0.261268, 0.096115]
target_nll = 0.442207
entropy = 0.859968
kl_p_q = 0.054711`

const markovCode = md`import numpy as np

transition = np.array([
    [0.6, 0.2, 0.3],
    [0.1, 0.4, 0.3],
    [0.3, 0.4, 0.4],
], dtype=float)
state = np.array([0.0, 1.0, 0.0])

if not np.isfinite(transition).all() or (transition < 0).any():
    raise ValueError("transition probabilities must be finite and non-negative")
if not np.allclose(transition.sum(axis=0), 1.0):
    raise ValueError("every transition column must sum to one")
if not np.isclose(state.sum(), 1.0) or (state < 0).any():
    raise ValueError("state must be a probability distribution")

day_1 = transition @ state
for _ in range(20):
    state = transition @ state

stationary_residual = np.linalg.norm(transition @ state - state, ord=1)
print("day_1 =", [round(value, 6) for value in day_1])
print("day_20 =", [round(value, 6) for value in state])
print("stationary_residual_l1 =", f"{stationary_residual:.3e}")`

const markovOutput = `day_1 = [0.2, 0.4, 0.4]
day_20 = [0.393443, 0.245902, 0.360656]
stationary_residual_l1 = 1.819e-09`

const beginnerHandoffSection = section(
  'probability-route-beginner-handoff',
  '路线交接：从合法分布走向样本平均',
  'Route Handoff: From a Valid Distribution to Sample Averages',
  md`本章已经把样本空间、随机变量、条件概率、Bayes update、期望与方差放进同一幅地图，但需要先守住三个层次：**分布**是对所有可能结果的权重分配，**样本**是从分布得到的一次结果，**统计量**是对一批样本的汇总。把三者混在一起，就会把一次偶然结果误读成长期规律。

下一章把“重复观察”变成可执行算法。它会固定随机种子，先把积分改写成期望，再用样本均值估计这个期望。重点不是生成更多随机数，而是记录抽样规则、估计器、样本数和误差尺度，让随机计算仍然可以复现和检查。`,
  md`This chapter places sample spaces, random variables, conditional probability, Bayes updates, expectation, and variance on one map. Keep three levels separate: a **distribution** assigns mass to all possible outcomes, a **sample** is one outcome drawn from it, and a **statistic** summarizes a collection of samples. Mixing them turns one accidental outcome into a false long-run conclusion.

The next chapter turns repeated observation into an executable algorithm. It fixes a random seed, rewrites an integral as an expectation, and estimates that expectation with a sample average. The goal is not merely to generate more random numbers. It is to retain the sampling rule, estimator, sample count, and error scale so that randomized computation remains reproducible and inspectable.`,
)

const monteCarloEstimatorSection = section(
  'probability-route-monte-estimator-ledger',
  '估计器账本：目标、样本路径与误差不是同一件事',
  'Estimator Ledger: Target, Sample Path, and Error Are Different Objects',
  md`四分之一圆的真实面积比例是 \(\pi/4\)，但程序看不到这个答案，只能观察随机点是否满足 \(x^2+y^2\le1\)。每个点产生一个 0/1 指示变量，样本平均得到圆内比例，再乘 4 得到 \(\hat\pi\)。因此目标量是 \(\pi\)，样本路径是当前 seed 生成的点，估计器是“4 倍圆内比例”，误差是 \(|\hat\pi-\pi|\)。

固定 seed=7 后，100、1,000、10,000 个点分别得到 3.08、3.196 和 3.1644。中间的 1,000 点估计比 100 点离 \(\pi\) 略远，这不是算法失效。Monte Carlo 的 \(1/\sqrt{N}\) 描述典型波动尺度，不保证单条随机路径上的误差每次都单调变小。`,
  md`The true quarter-circle area fraction is \(\pi/4\), but the program cannot use that answer. It observes only whether a random point satisfies \(x^2+y^2\le1\). Every point produces a zero-one indicator, the sample mean estimates the inside fraction, and multiplying by four gives \(\hat\pi\). The target is \(\pi\), the sample path is the point sequence generated by the current seed, the estimator is four times the inside fraction, and the error is \(|\hat\pi-\pi|\).

With seed 7, 100, 1,000, and 10,000 points produce 3.08, 3.196, and 3.1644. The 1,000-point estimate is slightly farther from \(\pi\) than the 100-point estimate. That is not a failure. The \(1/\sqrt{N}\) rule describes a typical fluctuation scale, not a guarantee that error decreases monotonically along one sample path.`,
)

const monteCarloOutputSection = section(
  'probability-route-monte-output',
  'NumPy 运行结果：每个样本规模从同一随机流起点开始',
  'NumPy Output: Every Sample Size Starts from the Same Random Stream',
  md`代码为每个样本规模重新创建 seed=7 的生成器，所以前 100 个点也是 1,000 点试验的前 100 个点，比较不会混入不同随机流起点。数组 shape 是 \((N,2)\)：axis 0 是样本，axis 1 是二维坐标；\(sum(axis=1)\) 为每个点计算平方半径，不能误写成沿样本轴求和。

真实项目还应更换多个 seed，报告估计均值和区间，而不是只展示一条最好看的路径。本页保留一条固定输出作为代码回归锚点，再用实验台观察 seed、样本数和短周期生成器怎样改变轨迹。`,
  md`The code recreates a generator with seed 7 for every sample size. The first 100 points are therefore also the first 100 points of the 1,000-point trial, avoiding a changed random-stream start. Array shape is \((N,2)\): axis 0 contains samples and axis 1 contains the two coordinates. \(sum(axis=1)\) computes squared radius per point and must not be replaced by a reduction across samples.

A real study should repeat multiple seeds and report an estimate distribution or interval instead of selecting one attractive path. This page retains one fixed output as a code-regression anchor, while the lab shows how seed, sample count, and a short-period generator change the trajectory.`,
)

const monteCarloHandoffSection = section(
  'probability-route-monte-handoff',
  '本章小结：样本平均怎样进入模型训练',
  'Summary: How Sample Averages Enter Model Training',
  md`Monte Carlo 把难算的期望换成可算的样本平均。你现在应能区分 seed 与随机性、样本与估计器、单条误差与典型误差尺度，并解释为什么小批量梯度也是对全数据平均的随机估计。

下一章把注意力从“怎样抽样”转到“模型怎样给结果分配概率”。它会从 logits 构造稳定 softmax，计算正确类别的 negative log likelihood，再分别读取 entropy 与 KL。`,
  md`Monte Carlo replaces a hard expectation with a computable sample average. You should now be able to separate a seed from randomness, a sample from an estimator, and one realized error from a typical error scale, while recognizing a mini-batch gradient as a random estimate of a full-data average.

Review Questions: What is the estimator in the quarter-circle example? Why can one fixed-seed error rise when sample count increases? Why does halving typical Monte Carlo error require about four times as many samples?

The next chapter shifts from how samples are drawn to how a model assigns probability to outcomes. It builds a stable softmax from logits, calculates target negative log likelihood, and reads entropy and KL separately.`,
)

const modelBayesSection = section(
  'probability-route-model-bayes-anchor',
  '先验、信号与后验：命中率不是最终概率',
  'Prior, Signal, and Posterior: Hit Rate Is Not the Final Probability',
  md`沿用邮件案例：垃圾邮件先验是 0.08，可疑链接在垃圾邮件中出现的概率是 0.82，在普通邮件中误报的概率是 0.12。总体看到链接信号的概率为 \(0.82\times0.08+0.12\times0.92=0.176\)，所以

\[
P(spam\mid signal)=\frac{0.82\times0.08}{0.176}=0.372727\ldots
\]

0.82 是 \(P(signal\mid spam)\)，0.372727 才是 \(P(spam\mid signal)\)。似然说明模型或信号怎样看待已经发生的结果，后验则是在看到新信息后对类别概率的更新；二者交换条件后含义不同。`,
  md`Keep the email example: spam prior is 0.08, a suspicious link appears in spam with probability 0.82, and it appears in normal mail with false-positive probability 0.12. Overall signal probability is \(0.82\times0.08+0.12\times0.92=0.176\), so

\[
P(spam\mid signal)=\frac{0.82\times0.08}{0.176}=0.372727\ldots
\]

The value 0.82 is \(P(signal\mid spam)\), while 0.372727 is \(P(spam\mid signal)\). Likelihood describes how a model or signal treats an observed outcome; a posterior updates class probability after new information. Reversing the condition changes the question.`,
)

const modelOutputSection = section(
  'probability-route-model-output',
  '稳定 softmax 运行结果：一次同时核对 NLL、熵与 KL',
  'Stable Softmax Output: Check NLL, Entropy, and KL Together',
  md`代码先从 logits 减去最大值再 exponentiate。softmax 对整体平移不敏感，所以这个操作不改变概率，却能避免大正数 exponent 溢出。输出概率为 **[0.642616,0.261268,0.096115]**，三项非负且总和为 1；目标类别 0 的 NLL 是 0.442207。

entropy=0.859968 只描述当前分布自身的分散程度；KL=0.054711 比较当前分布 \(p\) 与参考分布 \(q=[0.5,0.3,0.2]\)。KL 的方向不能随意交换，且 \(q_i=0,p_i>0\) 时会出现无限代价。代码因此要求参考分布严格为正并与 logits shape 一致。`,
  md`The code subtracts the largest logit before exponentiation. Softmax is invariant to a common shift, so probabilities stay unchanged while large positive exponents are prevented from overflowing. Output is [0.642616,0.261268,0.096115], with nonnegative entries summing to one. Target-class-zero NLL is 0.442207.

Entropy 0.859968 describes the spread of the current distribution itself. KL 0.054711 compares the current distribution \(p\) with reference \(q=[0.5,0.3,0.2]\). KL direction cannot be swapped freely, and \(q_i=0,p_i>0\) creates infinite cost. The code therefore requires a strictly positive reference with the same shape as logits.`,
)

const modelHandoffSection = section(
  'probability-route-model-handoff',
  '本章小结：合法概率、低损失与可靠概率是三层要求',
  'Summary: Valid Probability, Low Loss, and Reliable Probability Are Three Requirements',
  md`softmax 只保证数值落在概率单纯形上；NLL 或 cross entropy 训练模型把更多概率放到真实类别；calibration 再检查同一置信度分箱的实际正确率。合法、能优化、可解释为频率是三层不同要求，不能只凭最大概率很高就跳到“模型可靠”。

下一章让分布不再停在一个时刻。天气概率会通过列随机矩阵逐步转移，长期状态再连接到特征值 1、PageRank 和随机游走。`,
  md`Softmax only guarantees a point on the probability simplex. NLL or cross entropy trains the model to place more mass on the target class. Calibration then checks observed correctness inside confidence bins. Validity, trainability, and frequency reliability are three different requirements; a high maximum probability does not establish model reliability.

Review Questions: Why subtract the maximum logit? How do entropy, cross entropy, and KL answer different questions? Why can a low training loss coexist with poor calibration?

The next chapter lets a distribution evolve over time. Weather probabilities move through a column-stochastic matrix, and long-run state connects to eigenvalue 1, PageRank, and random walks.`,
)

const markovEntrySection = section(
  'probability-route-markov-entry',
  '从单次分布到状态演化：概率质量必须守恒',
  'From One Distribution to State Evolution: Probability Mass Must Be Conserved',
  md`上一章的 softmax 给出一个时刻的类别分布。马尔可夫链再增加时间轴：当前状态分布 \(x_k\) 经过转移矩阵 \(M\) 得到 \(x_{k+1}=Mx_k\)。本章采用列向量和左乘，因此第 \(j\) 列描述“从状态 \(j\) 出发去哪里”，每列必须非负且求和为 1。

这个约定使总概率保持为 1。若代码把行随机资料直接套进列向量公式，矩阵乘法仍可能运行，却会改变业务含义。第一项检查因此不是“shape 能不能乘”，而是状态方向、列含义和归一化是否一致。`,
  md`The previous chapter's softmax gives a class distribution at one moment. A Markov chain adds a time axis: current state distribution \(x_k\) becomes \(x_{k+1}=Mx_k\) through transition matrix \(M\). This chapter uses column vectors and left multiplication, so column \(j\) means where probability moves from current state \(j\). Every column must be nonnegative and sum to one.

That convention preserves total probability. Applying a row-stochastic source directly to a column-vector formula may still execute while changing meaning. The first check is therefore not only whether shapes multiply, but whether state orientation, column meaning, and normalization agree.`,
)

const markovOutputSection = section(
  'probability-route-markov-output',
  'NumPy 运行结果：一步预测与长期稳定必须分别核对',
  'NumPy Output: Check One-Step Prediction and Long-Run Stability Separately',
  md`雨天初始状态 **[0,1,0]** 会选中天气矩阵第二列，因此 day_1 是 **[0.2,0.4,0.4]**。运行 20 步后得到 **[0.393443,0.245902,0.360656]**。状态总和仍为 1，但“总和为 1”只说明它是合法分布，不说明它已经稳定。

稳定性用 \(\lVert Mx-x\rVert_1\) 检查。当前残差是 **1.819e-09**，表示再走一步几乎不变。若链存在互不连通的闭合类或周期，合法分布仍可能依赖初始状态或持续振荡，所以残差和结构条件都要看。`,
  md`Rainy initial state [0,1,0] selects the second weather column, so day 1 is [0.2,0.4,0.4]. After 20 steps, the state is [0.393443,0.245902,0.360656]. Its entries still sum to one, but that establishes only a valid distribution, not stationarity.

Stationarity is checked with \(\lVert Mx-x\rVert_1\). The current residual is 1.819e-09, so one more step changes almost nothing. If a chain has disconnected closed classes or periodic structure, a valid distribution may still depend on initial state or keep oscillating. Both residual and chain structure matter.`,
)

const markovSummarySection = section(
  'probability-route-markov-summary',
  '路线小结：概率从结果语言走到模型行为语言',
  'Route Summary: Probability Moves from Outcome Language to Model Behavior',
  md`四章路线现在闭合：分布为可能结果分配权重；Monte Carlo 用样本平均估计期望；softmax、NLL、entropy 与 KL 描述和训练模型分布；马尔可夫矩阵让概率质量随状态转移并暴露长期行为。

这些概念会在后续课程再次出现：mini-batch 是随机估计，分类和语言模型训练使用 cross entropy，强化学习使用状态转移与期望回报，生成模型通过采样产生结果。回看时要先判断当前对象属于分布、样本、统计量、损失还是状态转移，避免只因都含“概率”就混用公式。`,
  md`The four-chapter route is now closed. A distribution assigns mass to possible outcomes. Monte Carlo estimates expectations with sample averages. Softmax, NLL, entropy, and KL describe and train model distributions. A Markov matrix moves probability mass across states and exposes long-run behavior.

Review Questions: Which object is a distribution, sample, statistic, loss, or transition rule in each chapter? What invariants must a probability vector and transition matrix satisfy? Where do sampling error, calibration error, and stationary residual answer different questions?

These ideas return later. A mini-batch is a random estimate, classifiers and language models train with cross entropy, reinforcement learning uses state transitions and expected returns, and generative models produce samples. Before choosing a formula, identify whether the current object is a distribution, sample, statistic, loss, or state transition.`,
)

function enhanceBeginner(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 65),
    sections: [...moduleDefinition.sections, beginnerHandoffSection],
  })
}

function enhanceMonteCarlo(moduleDefinition: MathLabModule): MathLabModule {
  const originalSections = moduleDefinition.sections.filter(({ id }) => id !== 'monte-carlo-review')
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'monte-carlo-estimator-core',
      monteCarloCode,
      monteCarloOutput,
    ),
    sections: [
      originalSections[0]!,
      originalSections[1]!,
      monteCarloEstimatorSection,
      ...originalSections.slice(2, 4),
      monteCarloOutputSection,
      ...originalSections.slice(4),
      monteCarloHandoffSection,
    ],
  })
}

function enhanceProbabilityModel(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'softmax-cross-entropy',
      probabilityModelCode,
      probabilityModelOutput,
    ),
    sections: [
      moduleDefinition.sections[0]!,
      modelBayesSection,
      ...moduleDefinition.sections.slice(1, 4),
      modelOutputSection,
      ...moduleDefinition.sections.slice(4),
      modelHandoffSection,
    ],
  })
}

function enhanceMarkov(moduleDefinition: MathLabModule): MathLabModule {
  const originalSections = moduleDefinition.sections.filter(({ id }) => id !== 'markov-chains-review-questions')
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'markov-property-core',
      markovCode,
      markovOutput,
    ),
    sections: [
      originalSections[0]!,
      markovEntrySection,
      ...originalSections.slice(1, 4),
      markovOutputSection,
      ...originalSections.slice(4),
      markovSummarySection,
    ],
  })
}

const probabilityRouteEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'beginner-probability-distributions': enhanceBeginner,
  'monte-carlo': enhanceMonteCarlo,
  'probability-likelihood-entropy': enhanceProbabilityModel,
  'markov-chains': enhanceMarkov,
}

export function enhanceProbabilityUncertaintyModule(moduleDefinition: MathLabModule): MathLabModule {
  return probabilityRouteEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition
}
