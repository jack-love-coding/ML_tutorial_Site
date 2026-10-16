import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  QuizItem,
} from '../types/mathLab'
import { beginnerFoundationModules } from './beginnerFoundationModules.ts'
import { mathToCodeModules } from './mathToCode/modules.ts'
import { probabilitySamplingOutput } from '../utils/probabilityReadingExamples.ts'

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

const linearShapeSection = section(
  'minimum-linear-shape-ledger',
  '样本、特征与 shape 账本',
  'Samples, Features, and a Shape Ledger',
  String.raw`上一节的关卡记录 \(\mathbf{x}=[2,3]\) 有两个特征，NumPy shape 是 \((2,)\)。末尾逗号是单元素 shape 元组的写法，表示数组只有一个轴；\((1,2)\) 则是有一行、两列的二维数组。

把第二个样本 \([1,4]\) 叠在下一行，得到

$$
X=\begin{bmatrix}2&3\\1&4\end{bmatrix}\in\mathbb{R}^{2\times2}.
$$

这里 axis 0 是样本轴，axis 1 是特征轴。第一个 2 表示两行样本，第二个 2 表示每行两个特征。先读第一列的两个基础任务数 2、1，再读第二列的两个提示数 3、4，就能核对图中的列序。

两个轴恰好都长 2，不表示可以交换。转置后 shape 仍是 \((2,2)\)，行的含义却已经改变；shape 检查需要和列名一起读。目标 \(y=[9,7]\) 仍单独保存。后面的“逐行计算”一节加入权重和偏置，解释为什么每行得到一个预测。`,
  String.raw`The previous section's record \(\mathbf{x}=[2,3]\) has two features and NumPy shape \((2,)\). The trailing comma marks a one-element shape tuple: the array has one axis. Shape \((1,2)\) instead describes a two-dimensional array with one row and two columns. Keep base tasks before hint requests in the column order.

Stack a second example, \([1,4]\), as the next row:

$$
X=\begin{bmatrix}2&3\\1&4\end{bmatrix}\in\mathbb{R}^{2\times2}.
$$

Axis 0 is the sample axis and axis 1 is the feature axis. The first 2 means two example rows; the second means two features per row. Read base-task counts 2 and 1 down the first column, then hint counts 3 and 4 down the second to check the diagram's column order.

Both axes happen to have length 2, but they are not interchangeable. Transposing preserves shape \((2,2)\) while changing what each row means; read shape alongside column names. Targets \(y=[9,7]\) remain separate. The later “One Prediction per Sample Row” section adds weights and bias to explain why each row yields one prediction.`,
  ['beginner-linear-shape-ledger'],
)

const linearBatchSection = section(
  'minimum-linear-batch-output',
  '用 NumPy 批量复现预测',
  'Reproduce the Batch Prediction with NumPy',
  String.raw`对第一行，\(4\times2+(-1)\times3+5=10\)；对第二行，\(4\times1+(-1)\times4+5=5\)。因此 \(X\mathbf{w}+b=[10,5]\)。代码块会同时展示数组、shape、预测和运行输出，读者可以先手算，再用代码核对。

完整计算的 shape 账本是 \(X:(2,2)\)、\(w:(2,)\)、\(b:()\)、\(Xw+b:(2,)\)。检查 \(X.shape[1]=w.shape[0]\)，并确认输出长度等于样本数。还要读列名：这个方阵转置后 shape 不变，但会把样本和特征混淆；可以加一条样本构成 \((3,2)\)，检查代码是否仍按行输出三个预测。`,
  String.raw`For the first row, \(4\times2+(-1)\times3+5=10\); for the second, \(4\times1+(-1)\times4+5=5\). Therefore \(X\mathbf{w}+b=[10,5]\). The code panel shows the array, shapes, predictions, and real output together so a learner can calculate first and verify with code.

The full computation's shape ledger is \(X:(2,2)\), \(w:(2,)\), \(b:()\), and \(Xw+b:(2,)\). Check \(X.shape[1]=w.shape[0]\) and that output length equals sample count. Read the column names too: transposing this square matrix preserves shape but mixes sample and feature meanings. Add a third sample to obtain \((3,2)\) and check that the code still returns three predictions, one per row.`,
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

const probabilitySharedSection = section(
  'minimum-probability-shared-task',
  '从确定预测切换到不确定结果',
  'Move from a Deterministic Prediction to an Uncertain Outcome',
  String.raw`回归模型在输入和参数固定时给出确定的数值，但真实结果仍可能有误差。接下来改问“是否发生”：即使当前信息相同，下一局是否按时完成仍可能受玩家状态、随机地图和测量噪声影响。房价是连续目标；按时与否是两个结果，这个区别将引出分类模型。

例如模型给出“按时完成的概率为 0.70”，它不是一次试验的真假保证。一次结果只能产生一个样本；需要许多同类案例才能检查 0.70 是否与真实频率接近。下一节再把两个结果写成样本空间，并约定如何用 0/1 表示。`,
  String.raw`A regression model returns a fixed number when inputs and parameters are fixed, yet the observed outcome may differ. Next we ask whether something happens: even with the same current information, finishing a level on time may depend on player state, a random map, and measurement noise. Housing price is a continuous target; on-time versus late gives two outcomes. This distinction leads toward classification.

For example, a model's on-time probability of 0.70 is not a truth guarantee for one trial. One observed result supplies one sample; many comparable cases are needed to check whether 0.70 agrees with observed frequency. The next section names the sample space and defines the 0/1 representation.`,
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
      { ...linearBatchSection, codeConceptIds: ['beginner-feature-vector'] },
      linearSummarySection,
    ],
    quizzes: pickQuiz(moduleDefinition.quizzes, [
      'beginner-linear-vector',
      'beginner-linear-matrix',
      'beginner-linear-cosine-distance',
    ]),
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
    probabilitySamplingOutput,
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

const beginnerEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'beginner-linear-algebra': enhanceLinearAlgebra,
  'beginner-probability-distributions': enhanceProbability,
}

export const minimumFoundationMathToCodeModules: MathLabModule[] = mathToCodeModules

export const minimumFoundationBeginnerModules: MathLabModule[] = beginnerFoundationModules.map((moduleDefinition) =>
  beginnerEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition,
)
