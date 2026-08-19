import type { LocalizedCopy } from '../../../types/ml.ts'
import {
  LOGISTIC_CHAPTER_IDS,
  type LogisticCourseBlock,
  type LogisticCourseChapter,
} from '../types.ts'
import { oneRowLogisticTerms } from '../engine.ts'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const block = (
  kind: LogisticCourseBlock['kind'],
  zhCN: string,
  en: string,
  code?: string,
): LogisticCourseBlock => ({
  kind,
  title: loc(
    ({ question: '问题', explanation: '数据与直觉', formula: '数学连接', code: 'NumPy 代码', 'runtime-output': '运行结果', prediction: '先预测', animation: '动画', figure: '图表', table: '数据表', 'observation-lab': '观察台', observation: '观察结果', misconception: '常见误区', conclusion: '本章结论' } as const)[kind],
    ({ question: 'Question', explanation: 'Data and intuition', formula: 'Math connection', code: 'NumPy code', 'runtime-output': 'Runtime output', prediction: 'Predict first', animation: 'Animation', figure: 'Figure', table: 'Table', 'observation-lab': 'Observation lab', observation: 'What changed', misconception: 'Common misconception', conclusion: 'Chapter conclusion' } as const)[kind],
  ),
  body: loc(zhCN, en),
  ...(code ? { code } : {}),
})

/**
 * This row is a deliberately frozen teaching trace. Its raw values come from
 * `banknote-authentication.csv` row 1; the four standardized values use the
 * committed train-only ddof=0 preprocessing contract. Parameters are the
 * committed Batch 4 `standardized-armijo` best-validation vector at iteration 48.
 */
export const canonicalLinearScoreTrace = oneRowLogisticTerms({
  features: [1.1239821939635315, 1.1504115731070148, -0.9746430615682975, 0.3352312436885939],
  parameters: [-4.598465395266233, -4.558763355705237, -4.180883656385103, 0.2982393232531427, -1.3457375309610977],
  target: 0,
})

const traceOutput = [
  `row_id=${1} split=train label=class ${canonicalLinearScoreTrace.target}`,
  `z=${canonicalLinearScoreTrace.logit}`,
  `p=${canonicalLinearScoreTrace.probability}`,
  `BCE=${canonicalLinearScoreTrace.bce}`,
].join('\n')

const linearScoreBlocks: readonly LogisticCourseBlock[] = [
  block(
    'question',
    '一条真实 Banknote 记录如何从四个数变成一个可解释的 class 1 概率？',
    'How can one real Banknote record turn four numbers into an interpretable class 1 probability?',
  ),
  block(
    'explanation',
    '本章只使用本地 UCI Banknote 快照。它有四个小波派生特征：`variance`、`skewness`、`curtosis`、`entropy`；目标只写作 class 0 或 class 1。训练、验证、测试按固定的 960/206/206 顺序切分，标准化只在训练集拟合。下面始终跟随训练集的 row 1。',
    'This chapter uses only the local UCI Banknote snapshot. It has four wavelet-derived features: `variance`, `skewness`, `curtosis`, and `entropy`; the target is called only class 0 or class 1. The fixed 960/206/206 train/validation/test split is preserved, and standardization is fit on training rows only. We follow training row 1 throughout.',
  ),
  block(
    'formula',
    String.raw`先把同一行的四个标准化特征排成向量 $\mathbf{x}$，再计算线性分数：

$$z=\mathbf{w}^{\top}\mathbf{x}+b$$

每一项 $w_jx_j$ 是一个可单独检查的贡献；四项之和再加截距就是 $z$。这里的 $z$ 同时是 class 1 的 log-odds，而不是类别本身。`,
    String.raw`Put the same row’s four standardized features into a vector $\mathbf{x}$, then calculate the linear score:

$$z=\mathbf{w}^{\top}\mathbf{x}+b$$

Each $w_jx_j$ is an auditable contribution. Their sum plus the intercept is $z$. Here $z$ is the log-odds for class 1, not the class itself.`,
  ),
  block(
    'code',
    '这段 NumPy 代码和页面上的冻结 trace 使用相同的特征顺序、参数顺序和定义。',
    'This NumPy code uses the same feature order, parameter order, and definitions as the frozen trace on this page.',
    `import numpy as np

x = np.array([1.1239821939635315, 1.1504115731070148, -0.9746430615682975, 0.3352312436885939])
w = np.array([-4.598465395266233, -4.558763355705237, -4.180883656385103, 0.2982393232531427])
b = -1.3457375309610977
z = w @ x + b
p = 1 / (1 + np.exp(-z))
print(z, p)`,
  ),
  block(
    'runtime-output',
    `已锁定的完整精度输出来自同一份行 trace：\n\n\`\`\`text\n${traceOutput}\n\`\`\``,
    `The locked full-precision output comes from the same row trace:\n\n\`\`\`text\n${traceOutput}\n\`\`\``,
  ),
  block(
    'prediction',
    '在打开观察台前先判断：若四项贡献与截距相加后 $z=0$，概率会是多少？默认桥梁会把它归到哪个 class？',
    'Before opening the observation lab, predict: if the four contributions and intercept sum to $z=0$, what is the probability? Which class does the default bridge select?',
  ),
  block(
    'observation-lab',
    '观察每个特征贡献、截距和总分如何共同决定概率。正式实验台会保留这条真实行并限制可修改的教学参数。',
    'Observe how each feature contribution, the intercept, and the total score jointly determine probability. The dedicated lab keeps this real row and bounds any teaching parameters.',
  ),
  block(
    'observation',
    `本行四个贡献加上截距的和是 ${canonicalLinearScoreTrace.logit}。因为 $z<0$，class 1 概率小于 0.5；这只是默认 $p\ge0.5$ 桥梁的结果，不是训练时的目标函数。`,
    `For this row, the four contributions plus the intercept sum to ${canonicalLinearScoreTrace.logit}. Because $z<0$, the class 1 probability is below 0.5. This is only the default $p\ge0.5$ bridge, not the objective used to train the model.`,
  ),
  block(
    'misconception',
    '不要把大的原始数值直接当成大的影响。模型这里使用训练集统计量标准化后的特征；影响来自特征值、系数和截距的组合。',
    'Do not read a large raw value as a large influence by itself. This model uses features standardized with training statistics; influence comes from the combination of feature value, coefficient, and intercept.',
  ),
  block(
    'conclusion',
    '逻辑回归先产出可审计的线性分数。下一章把同一个分数稳定地压缩成概率，并从概率回看 odds 与 log-odds。',
    'Logistic regression first produces an auditable linear score. The next chapter stably compresses that same score into probability, then reads odds and log-odds back from it.',
  ),
]

export const logisticCourseChapters: readonly LogisticCourseChapter[] = [
  { id: 'linear-score', title: loc('线性分数：从一条真实记录开始', 'Linear score: start with one real record'), blocks: linearScoreBlocks },
]

export const logisticCourseReferences = [] as const
export const logisticCourseDownloads = [] as const
export const logisticCourseChapterOrder = LOGISTIC_CHAPTER_IDS
