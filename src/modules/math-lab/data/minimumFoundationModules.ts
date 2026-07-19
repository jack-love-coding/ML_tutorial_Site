import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  QuizItem,
  VisualAsset,
} from '../types/mathLab'
import { beginnerFoundationModules } from './beginnerFoundationModules.ts'
import { mathToCodeModules } from './mathToCode/modules.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  zhTitle: string,
  enTitle: string,
  zhContent: string,
  enContent: string,
  visualIds: string[] = [],
): MathLabSection {
  return {
    id,
    level: 2,
    title: copy(zhTitle, enTitle),
    content: copy(zhContent, enContent),
    ...(visualIds.length ? { visualIds } : {}),
  }
}

function image(
  id: string,
  filename: string,
  zhTitle: string,
  enTitle: string,
  zhDescription: string,
  enDescription: string,
): VisualAsset {
  const description = copy(zhDescription, enDescription)
  return {
    id,
    type: 'image',
    title: copy(zhTitle, enTitle),
    assetPath: `/math-lab/generated/${filename}`,
    transcript: description,
    learningPurpose: description,
    alt: description,
    caption: description,
  }
}

function withToc(moduleDefinition: MathLabModule): MathLabModule {
  return {
    ...moduleDefinition,
    toc: moduleDefinition.sections.map(({ id, level, title }) => ({ id, level, title })),
  }
}

function withConceptOutput(
  concepts: readonly MathConcept[],
  conceptId: string,
  codeExample: string,
  zhOutput: string,
  enOutput = zhOutput,
): MathConcept[] {
  return concepts.map((concept) => concept.id === conceptId
    ? { ...concept, codeExample, codeOutput: copy(zhOutput, enOutput) }
    : concept)
}

function pickQuiz(quizzes: readonly QuizItem[], ids: readonly string[]): QuizItem[] {
  const quizById = new Map(quizzes.map((quiz) => [quiz.id, quiz]))
  return ids.map((id) => quizById.get(id)).filter((quiz): quiz is QuizItem => Boolean(quiz))
}

const functionVisuals = [
  image(
    'minimum-function-machine',
    'beginner-function-machine-longform.png',
    '函数是一台有输入合同的机器',
    'A Function Is a Machine with an Input Contract',
    '同一个输入只能沿确定规则得到一个输出；参数改变规则，目标只在输出之后提供比较。',
    'One input follows a deterministic rule to one output; parameters change the rule, while the target is used only after the output for comparison.',
  ),
  image(
    'minimum-average-rate',
    'beginner-average-to-derivative-longform.png',
    '从区间平均变化率走向局部变化',
    'From Average Rate over an Interval to Local Change',
    '两个输入点给出区间平均变化率；把观察窗口缩小，便为下一章的局部导数建立直觉。',
    'Two input points give an average rate over an interval; shrinking the observation window prepares the local-derivative intuition used later.',
  ),
]

const derivativeVisuals = [
  image(
    'minimum-derivative-tangent',
    'beginner-derivative-tangent-longform.png',
    '割线怎样靠近切线',
    'How Secants Approach a Tangent',
    '对称观察点逐渐靠近当前输入时，区间斜率逐步变成只描述当前邻域的局部斜率。',
    'As symmetric observation points approach the current input, the interval slope becomes a local slope that describes only the current neighborhood.',
  ),
  image(
    'minimum-derivative-window',
    'beginner-derivative-window-longform.png',
    '有限差分观察窗口',
    'The Finite-Difference Observation Window',
    '窗口过宽会混入远处曲率，窗口过窄会放大浮点消去；稳定区间比盲目追求最小 h 更重要。',
    'A wide window mixes in distant curvature, while an excessively narrow window amplifies floating cancellation; a stable range matters more than the smallest h.',
  ),
]

const linearShapeSection = section(
  'minimum-linear-shape-ledger',
  '样本、特征与 shape 账本',
  'Samples, Features, and a Shape Ledger',
  String.raw`前一章把一个关卡记录写成 \(\mathbf{x}=[2,3]\)：第一列是路径分支数，第二列是可用提示数。**顺序是数据合同的一部分**，不能因为两个值都是数字就交换。一个样本有两个特征，所以 \(\mathbf{x}\in\mathbb{R}^2\)，NumPy shape 是 \((2,)\)。

把第二个样本 \([1,4]\) 叠在下一行，得到

$$
X=\begin{bmatrix}2&3\\1&4\end{bmatrix}\in\mathbb{R}^{2\times2}.
$$

这里 axis 0 是样本轴，axis 1 是特征轴。第一个 2 表示两行样本，第二个 2 表示每行两个特征。权重 \(\mathbf{w}=[4,-1]\) 的 shape 是 \((2,)\)，它必须和特征轴长度一致。偏置 \(b=5\) 是标量。

完整 shape 账本是：\(X:(2,2)\)、\(w:(2,)\)、\(b:()\)、\(Xw:(2,)\)、prediction:\((2,)\)。矩阵乘向量时，特征轴被逐项配对并求和，样本轴保留下来。模型因此一次得到两个预测，而不是把两个样本混成一个数。`,
  String.raw`The previous chapter wrote one level record as \(\mathbf{x}=[2,3]\): the first column is the number of route branches and the second is the number of available hints. **Order is part of the data contract.** The two values cannot be swapped merely because both are numeric. One example has two features, so \(\mathbf{x}\in\mathbb{R}^2\) and its NumPy shape is \((2,)\).

Stack a second example, \([1,4]\), as the next row:

$$
X=\begin{bmatrix}2&3\\1&4\end{bmatrix}\in\mathbb{R}^{2\times2}.
$$

Axis 0 is the sample axis and axis 1 is the feature axis. The first 2 means two example rows; the second means two features per row. Weight vector \(\mathbf{w}=[4,-1]\) has shape \((2,)\), which must match the feature-axis length. Bias \(b=5\) is a scalar.

The complete shape ledger is \(X:(2,2)\), \(w:(2,)\), \(b:()\), \(Xw:(2,)\), and prediction:\((2,)\). Matrix-vector multiplication pairs and reduces the feature axis while preserving the sample axis. The model therefore returns two predictions at once instead of mixing two examples into one number.`,
  ['beginner-vector-feature-space-longform'],
)

const linearBatchSection = section(
  'minimum-linear-batch-output',
  '用 NumPy 批量复现预测',
  'Reproduce the Batch Prediction with NumPy',
  String.raw`对第一行，\(4\times2+(-1)\times3+5=10\)；对第二行，\(4\times1+(-1)\times4+5=5\)。因此 \(X\mathbf{w}+b=[10,5]\)。代码块会同时展示数组、shape、预测和运行输出，读者可以先手算，再用代码核对。

这段代码最重要的不是缩短成一行，而是暴露语义边界：行数是样本数，列数是特征数；\(X.shape[1]\) 必须等于 \(w.shape[0]\)；预测数量必须等于样本数量。若把 \(X\) 转置，方阵例子仍可能保持 \((2,2)\) 并悄悄产生错误含义，所以还要用列名和非方阵反例检查轴，而不能只看 shape 是否“能运行”。`,
  String.raw`For the first row, \(4\times2+(-1)\times3+5=10\); for the second, \(4\times1+(-1)\times4+5=5\). Therefore \(X\mathbf{w}+b=[10,5]\). The code panel shows the array, shapes, predictions, and real output together so a learner can calculate first and verify with code.

The important point is not reducing everything to one line. The code must expose semantic boundaries: rows count examples, columns count features, \(X.shape[1]\) must equal \(w.shape[0]\), and the prediction count must equal the sample count. Accidentally transposing a square \(X\) may preserve shape \((2,2)\) while changing meaning, so column names and a non-square counterexample are needed in addition to a shape check.`,
  ['beginner-matrix-transform-longform'],
)

const linearSummarySection = section(
  'minimum-linear-summary',
  '本章小结：把 shape 交给导数课',
  'Summary: Hand the Shape Contract to the Derivative Lesson',
  String.raw`现在可以把四个对象分开：标量是一个数；向量把一个样本的有序特征绑在一起；矩阵把多个同结构样本按行堆叠；shape 说明每条轴有多长，但轴的业务含义仍要由数据合同说明。

进入下一章时固定 \(X=[[2,3],[1,4]]\)、\(w=[4,-1]\)、\(b=5\)、targets=\([9,7]\)。预测是 \([10,5]\)，残差是 \([1,-2]\)，MSE 是 \(2.5\)。导数章只改变一个参数，观察这份损失在当前点附近如何变化。`,
  String.raw`Four objects are now distinct: a scalar is one value; a vector binds the ordered features of one example; a matrix stacks examples with the same schema by row; and shape records axis lengths while the data contract still supplies axis meaning.

The next chapter fixes \(X=[[2,3],[1,4]]\), \(w=[4,-1]\), \(b=5\), and targets \([9,7]\). Predictions are \([10,5]\), residuals are \([1,-2]\), and MSE is \(2.5\). The derivative lesson changes one parameter at a time and asks how this loss changes near the current point.`,
)

const derivativeApproximationSection = section(
  'minimum-derivative-local-approximation',
  '用导数估计一个足够小的变化',
  'Use a Derivative to Estimate a Small Change',
  String.raw`在当前参数处，批量 MSE 对 \(w_2\) 的导数是 \(-5\)。这句话不是说“把 \(w_2\) 增加 1，损失必然减少 5”，而是给出局部近似：

$$
L(w_2+\Delta w_2)\approx L(w_2)+\frac{\partial L}{\partial w_2}\Delta w_2.
$$

若 \(\Delta w_2=0.01\)，则 \(L\) 的预测变化约为 \(-5\times0.01=-0.05\)，从 2.5 降到约 2.45。直接代入实际二次损失会得到约 2.45125；两者很接近，但并不完全相等，因为切线只保留一阶局部信息。

同一批次还给出 \(\partial L/\partial w_1=0\) 和 \(\partial L/\partial b=-1\)。零导数只表示当前一阶切片平坦，不能证明参数永远无用；负导数只描述向右小移时损失先下降，也不等于参数本身为负。`,
  String.raw`At the current parameters, the derivative of batch MSE with respect to \(w_2\) is \(-5\). This does not mean that increasing \(w_2\) by 1 must reduce loss by exactly 5. It gives a local approximation:

$$
L(w_2+\Delta w_2)\approx L(w_2)+\frac{\partial L}{\partial w_2}\Delta w_2.
$$

For \(\Delta w_2=0.01\), the predicted loss change is approximately \(-5\times0.01=-0.05\), from 2.5 to about 2.45. Direct evaluation of the quadratic loss gives about 2.45125. The values are close but not identical because a tangent keeps only first-order local information.

The same batch gives \(\partial L/\partial w_1=0\) and \(\partial L/\partial b=-1\). A zero derivative means only that the current first-order slice is flat; it does not prove a parameter is permanently useless. A negative derivative describes the initial loss direction for a small move to the right; it is not the sign of the parameter itself.`,
  ['minimum-derivative-tangent'],
)

const probabilitySharedSection = section(
  'minimum-probability-shared-task',
  '从确定预测切换到不确定结果',
  'Move from a Deterministic Prediction to an Uncertain Outcome',
  String.raw`前三章固定输入和参数时，prediction 是确定的。概率处理的是另一类问题：即使我们知道当前信息，下一局是否按时完成仍可能受玩家状态、随机地图和测量噪声影响。

先把样本空间写清楚：\(\Omega=\{\text{按时完成},\text{未按时完成}\}\)。定义随机变量 \(Z\)：按时完成映射为 1，未按时完成映射为 0。随机变量不是“自己随机变化的字母”，而是把结果映射成可计算数字的函数。

若模型给出 \(P(Z=0)=0.30\)、\(P(Z=1)=0.70\)，这两个数必须非负且总和为 1。0.70 不是一次试验的真假保证，而是模型在当前信息下分配给“按时完成”的概率。一次结果只能产生一个样本；需要许多同类案例才能检查 0.70 是否与真实频率接近。`,
  String.raw`In the first three chapters, a fixed input and fixed parameters produce a deterministic prediction. Probability addresses a different question: even with current information, whether the next level finishes on time may still depend on player state, a random map, and measurement noise.

Start by naming the sample space: \(\Omega=\{\text{on time},\text{not on time}\}\). Define random variable \(Z\): on time maps to 1 and not on time maps to 0. A random variable is not a letter that “randomly changes by itself.” It is a function that maps outcomes to computable values.

If a model reports \(P(Z=0)=0.30\) and \(P(Z=1)=0.70\), the values must be nonnegative and sum to 1. The value 0.70 is not a truth guarantee for one trial; it is the probability mass assigned to “on time” under the current information. One observed result is only one sample. Many comparable cases are needed to check whether 0.70 agrees with observed frequency.`,
  ['beginner-sample-space-random-variable-longform'],
)

const probabilityCodeSection = section(
  'minimum-probability-numpy-output',
  '用固定随机种子观察经验频率',
  'Observe Empirical Frequency with a Fixed Random Seed',
  String.raw`代码先验证概率向量是一维、有限、非负且总和接近 1，再使用固定随机种子抽取 12 次结果。固定种子不会让随机过程变成确定规律；它只让这次教学演示可以复现。

运行输出中的经验频率可能不是 0.70。样本量小，偶然波动很明显；把试验次数增加到几千，经验频率通常会在 0.70 附近更稳定。这里必须分清三层：\([0.30,0.70]\) 是模型分布，抽到的 0/1 是样本，样本平均值是经验频率。

若概率包含负数、NaN，或总和不是 1，代码应明确失败，而不是偷偷归一化并掩盖上游错误。后续 softmax 会负责把 logits 转成合法分布，但 softmax 输出是否可信仍需数据和校准检查。`,
  String.raw`The code first checks that the probability vector is one-dimensional, finite, nonnegative, and sums to approximately 1. It then draws 12 outcomes with a fixed random seed. A fixed seed does not turn randomness into a deterministic law; it only makes this teaching run reproducible.

The empirical frequency in the output need not equal 0.70. With a small sample, chance variation is visible. With thousands of trials, empirical frequency usually becomes more stable near 0.70. Keep three layers separate: \([0.30,0.70]\) is the model distribution, the drawn zeros and ones are samples, and their mean is an empirical frequency.

If probabilities contain a negative value, NaN, or a sum other than 1, the code should fail clearly instead of silently normalizing and hiding an upstream bug. Later, softmax will turn logits into a valid distribution, but trustworthy probabilities still require data and calibration checks.`,
  ['beginner-distribution-frequency-longform'],
)

const probabilitySummarySection = section(
  'minimum-probability-summary',
  '本章小结与后续路线',
  'Summary and the Route Ahead',
  String.raw`本章需要带走四件事：样本空间列出可能结果；随机变量把结果映射为数；概率分布为可能值分配非负且总和为 1 的权重；经验频率来自重复样本，不等于单次结果。

条件概率、贝叶斯更新、期望与方差、softmax、交叉熵和校准在本页提供了应用预览，但它们会在后续概率专题中分别展开。此处只要求能检查一个离散分布、解释一次采样与长期频率的区别，并说明模型概率为什么不是绝对事实。`,
  String.raw`Carry four ideas forward: a sample space lists possible outcomes; a random variable maps outcomes to values; a probability distribution assigns nonnegative mass that sums to 1; and empirical frequency comes from repeated samples rather than one result.

Conditional probability, Bayes updates, expectation and variance, softmax, cross entropy, and calibration appear here as application previews and are expanded later in the probability route. At this point, the learner should be able to validate one discrete distribution, separate a sample from long-run frequency, and explain why a model probability is not an absolute fact.`,
)

function enhanceFunctions(moduleDefinition: MathLabModule): MathLabModule {
  const sections = moduleDefinition.sections
    .filter(({ id }) => id !== 'layered-practice')
    .map((item) => {
      if (item.id === 'mapping-intuition') return { ...item, visualIds: ['minimum-function-machine'] }
      if (item.id === 'worked-motion-example') return { ...item, visualIds: ['minimum-average-rate'] }
      return item
    })
  const concepts = withConceptOutput(
    moduleDefinition.concepts,
    'function-prediction-mapping',
    `features = [2, 3]
weights = [4, -1]
bias = 5
target = 9

contributions = [
    feature * weight
    for feature, weight in zip(features, weights)
]
prediction = sum(contributions) + bias
residual = prediction - target

print("contributions =", contributions)
print("prediction =", prediction)
print("residual =", residual)`,
    'contributions = [8, -3]\nprediction = 10\nresidual = 1',
  )
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 60,
    concepts,
    sections,
    visuals: [...functionVisuals, ...moduleDefinition.visuals],
  })
}

function enhanceLinearAlgebra(moduleDefinition: MathLabModule): MathLabModule {
  const originalSections = moduleDefinition.sections.filter(({ id }) => id !== 'beginner-linear-checkpoint')
  const concepts = withConceptOutput(
    moduleDefinition.concepts,
    'beginner-feature-vector',
    `import numpy as np

x = np.array([2.0, 3.0])
X = np.array([[2.0, 3.0], [1.0, 4.0]])
w = np.array([4.0, -1.0])
bias = 5.0

if X.ndim != 2 or w.ndim != 1 or X.shape[1] != w.shape[0]:
    raise ValueError("X and w shapes are incompatible")

predictions = X @ w + bias
print("x.shape =", x.shape)
print("X.shape =", X.shape)
print("predictions =", predictions.tolist())
print("predictions.shape =", predictions.shape)`,
    'x.shape = (2,)\nX.shape = (2, 2)\npredictions = [10.0, 5.0]\npredictions.shape = (2,)',
  )
  return withToc({
    ...moduleDefinition,
    subtitle: copy(
      '从一个样本向量走到批量矩阵、shape 账本和可复现的 NumPy 预测。',
      'Move from one example vector to a batch matrix, a shape ledger, and a reproducible NumPy prediction.',
    ),
    estimatedMinutes: 60,
    learningObjectives: [
      copy('区分标量、向量和矩阵，并说清每条轴的语义。', 'Distinguish scalars, vectors, and matrices and state the meaning of each axis.'),
      copy('把一个样本写成 shape (d,) 的向量，把一批样本写成 shape (n,d) 的矩阵。', 'Represent one example as a vector of shape (d,) and a batch as a matrix of shape (n,d).'),
      copy('手算并用 NumPy 复现 X @ w + b = [10, 5]。', 'Calculate and reproduce X @ w + b = [10, 5] with NumPy.'),
      copy('识别特征顺序、转置和广播造成的合法但错误的计算。', 'Recognize legal-but-wrong calculations caused by feature order, transposition, and broadcasting.'),
    ],
    concepts,
    sections: [
      originalSections[0]!,
      linearShapeSection,
      ...originalSections.slice(1),
      linearBatchSection,
      linearSummarySection,
    ],
    quizzes: pickQuiz(moduleDefinition.quizzes, [
      'beginner-linear-vector',
      'beginner-linear-matrix',
      'beginner-linear-cosine-distance',
    ]),
  })
}

function enhanceDerivatives(moduleDefinition: MathLabModule): MathLabModule {
  const sections = moduleDefinition.sections
    .filter(({ id }) => id !== 'derivatives-practice')
    .flatMap((item) => {
      if (item.id === 'derivatives-intuition') {
        return [{ ...item, visualIds: ['minimum-derivative-tangent'] }]
      }
      if (item.id === 'derivatives-experiment') {
        return [{ ...item, visualIds: ['minimum-derivative-window'] }, derivativeApproximationSection]
      }
      return [item]
    })
  const concepts = withConceptOutput(
    moduleDefinition.concepts,
    'central-difference-sensitivity',
    `import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
targets = np.array([9.0, 7.0])
w = np.array([4.0, -1.0])
bias = 5.0

def mse_for_w2(candidate_w2: float) -> float:
    candidate_w = w.copy()
    candidate_w[1] = candidate_w2
    predictions = X @ candidate_w + bias
    return float(np.mean((predictions - targets) ** 2))

def central_difference(fn, value: float, h: float = 1e-4) -> float:
    if not np.isfinite(value) or not np.isfinite(h) or h <= 0:
        raise ValueError("value and positive h must be finite")
    return (fn(value + h) - fn(value - h)) / (2 * h)

slope = central_difference(mse_for_w2, w[1])
print("baseline_mse =", mse_for_w2(w[1]))
print("dL_dw2 =", round(slope, 6))
print("actual_mse_at_w2_plus_0.01 =", round(mse_for_w2(w[1] + 0.01), 6))`,
    'baseline_mse = 2.5\ndL_dw2 = -5.0\nactual_mse_at_w2_plus_0.01 = 2.45125',
  )
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts,
    sections,
    visuals: [...derivativeVisuals, ...moduleDefinition.visuals],
  })
}

function enhanceProbability(moduleDefinition: MathLabModule): MathLabModule {
  const originalSections = moduleDefinition.sections.filter(({ id }) => id !== 'beginner-probability-checkpoint')
  const concepts = withConceptOutput(
    moduleDefinition.concepts,
    'beginner-distribution',
    `import numpy as np

probabilities = np.array([0.30, 0.70], dtype=float)
if probabilities.ndim != 1:
    raise ValueError("probabilities must be one-dimensional")
if not np.isfinite(probabilities).all() or (probabilities < 0).any():
    raise ValueError("probabilities must be finite and non-negative")
if not np.isclose(probabilities.sum(), 1.0):
    raise ValueError("probabilities must sum to one")

rng = np.random.default_rng(7)
samples = rng.choice([0, 1], size=12, p=probabilities)
print("samples =", samples.tolist())
print("empirical_frequency =", round(float(samples.mean()), 3))`,
    'samples = [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0]\nempirical_frequency = 0.75',
  )
  return withToc({
    ...moduleDefinition,
    subtitle: copy(
      '从样本空间、随机变量和离散分布走到可复现采样与模型概率。',
      'Move from sample spaces, random variables, and discrete distributions to reproducible sampling and model probabilities.',
    ),
    estimatedMinutes: 65,
    learningObjectives: [
      copy('先列出样本空间，再把结果映射为离散随机变量。', 'List a sample space before mapping outcomes to a discrete random variable.'),
      copy('检查概率非负、有限且总和为 1。', 'Check that probabilities are nonnegative, finite, and sum to 1.'),
      copy('区分概率分布、一次样本和经验频率。', 'Distinguish a probability distribution, one sample, and an empirical frequency.'),
      copy('用固定随机种子复现采样，并解释模型概率不是绝对事实。', 'Reproduce sampling with a fixed random seed and explain why a model probability is not an absolute fact.'),
    ],
    concepts,
    sections: [
      originalSections[0]!,
      probabilitySharedSection,
      ...originalSections.slice(1, 3),
      probabilityCodeSection,
      ...originalSections.slice(3),
      probabilitySummarySection,
    ],
    quizzes: pickQuiz(moduleDefinition.quizzes, [
      'beginner-probability-space',
      'beginner-probability-distribution',
      'beginner-probability-softmax',
    ]),
  })
}

const mathToCodeEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'calculus-functions-rate-change': enhanceFunctions,
  'calculus-derivatives-local-change': enhanceDerivatives,
}

const beginnerEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'beginner-linear-algebra': enhanceLinearAlgebra,
  'beginner-probability-distributions': enhanceProbability,
}

export const minimumFoundationMathToCodeModules: MathLabModule[] = mathToCodeModules.map((moduleDefinition) =>
  mathToCodeEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition,
)

export const minimumFoundationBeginnerModules: MathLabModule[] = beginnerFoundationModules.map((moduleDefinition) =>
  beginnerEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition,
)
