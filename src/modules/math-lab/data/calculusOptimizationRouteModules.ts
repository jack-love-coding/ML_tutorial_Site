import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
} from '../types/mathLab.ts'
import { calculusRouteModules } from './calculusRouteModules.ts'
import { calculusLessonProviders } from './calculusLessonProviders.ts'
import { aiMathPathModuleIds } from './mathCourseOrder.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  zhTitle: string,
  enTitle: string,
  zhContent: string,
  enContent: string,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return {
    id,
    level: 2,
    title: copy(zhTitle, enTitle),
    content: copy(zhContent, enContent),
    ...placements,
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

const gradientCode = md`import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
w = np.array([4.0, -1.0])
b = 5.0
targets = np.array([9.0, 7.0])

if X.ndim != 2 or w.ndim != 1 or X.shape[1] != w.shape[0]:
    raise ValueError("X and w shapes are incompatible")
if targets.shape != (X.shape[0],):
    raise ValueError("targets must align with the sample axis")
if not all(np.isfinite(value).all() for value in (X, w, targets)):
    raise ValueError("arrays must be finite")

predictions = X @ w + b
residuals = predictions - targets
loss = float(np.mean(residuals ** 2))
grad_w = (2 / X.shape[0]) * X.T @ residuals
grad_b = float(2 * residuals.mean())

print("predictions =", predictions.tolist())
print("residuals =", residuals.tolist())
print("loss =", loss)
print("grad_w =", grad_w.tolist())
print("grad_b =", grad_b)`

const gradientOutput = `predictions = [10.0, 5.0]
residuals = [1.0, -2.0]
loss = 2.5
grad_w = [0.0, -5.0]
grad_b = -1.0`

const batchCode = md`import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
targets = np.array([9.0, 7.0])
w = np.array([4.0, -1.0])
b = 5.0

sample_gradients = []
for index, (x, target) in enumerate(zip(X, targets)):
    residual = float(x @ w + b - target)
    grad_w = 2 * residual * x
    grad_b = 2 * residual
    sample_gradients.append(np.append(grad_w, grad_b))
    print(
        f"sample_{index}",
        "grad_w =", grad_w.tolist(),
        "grad_b =", grad_b,
    )

full_gradient = np.mean(sample_gradients, axis=0)
print("full_batch =", full_gradient.tolist())`

const batchOutput = `sample_0 grad_w = [4.0, 6.0] grad_b = 2.0
sample_1 grad_w = [-4.0, -16.0] grad_b = -4.0
full_batch = [0.0, -5.0, -1.0]`

const gradientSharedSection = section(
  'v3-gradient-shared-batch',
  '共同批次：从三个局部敏感度组成完整梯度',
  'Shared Batch: Three Local Sensitivities Form One Gradient',
  md`继续固定 \(X=[[2,3],[1,4]]\)、\(w=[4,-1]\)、\(b=5\) 和 \(targets=[9,7]\)。预测是 **[10,5]**，残差是 **[1,-2]**，MSE 是 2.5。现在不再只探测一个参数，而是分别计算 \(w_1,w_2,b\) 的偏导数。

对 MSE，\(\partial L/\partial w=(2/n)X^Tr\)，\(\partial L/\partial b=(2/n)\sum_i r_i\)。代入两行数据得到 **grad_w=[0,-5]**、**grad_b=-1**。第一个分量为 0，只说明当前点沿 \(w_1\) 的一阶变化抵消；它不说明 \(w_1\) 无用，也不说明所有参数已经最优。三个读数按参数顺序组成 **[0,-5,-1]**，这才是完整的局部更新信息。`,
  md`Keep \(X=[[2,3],[1,4]]\), \(w=[4,-1]\), \(b=5\), and \(targets=[9,7]\) fixed. Predictions are [10,5], residuals are [1,-2], and MSE is 2.5. Instead of probing one parameter, calculate the partial derivatives for \(w_1,w_2,b\).

For MSE, \(\partial L/\partial w=(2/n)X^Tr\) and \(\partial L/\partial b=(2/n)\sum_i r_i\). Substitution gives grad_w=[0,-5] and grad_b=-1. The first component being zero only means first-order changes along \(w_1\) cancel at this point. It does not make \(w_1\) useless or prove that all parameters are optimal. Ordered as the parameters are ordered, [0,-5,-1] is the complete local update information.`,
)

const gradientShapeSection = section(
  'v3-gradient-shape-direction',
  'shape 与方向：梯度为什么必须跟参数逐项对齐',
  'Shape and Direction: Why Gradients Must Align with Parameters',
  md`若参数写成 \(\theta=[w_1,w_2,b]\)，梯度就必须保持相同顺序和 shape。第 \(j\) 个梯度分量回答“只把第 \(j\) 个旋钮向右移动一点，loss 怎样变”。把分量顺序交换，即使三个数字都没变，也会把斜率应用到错误参数上。

梯度指向当前点 loss 增加最快的局部方向，所以负梯度 **[0,5,1]** 指向最快下降方向。方向导数进一步回答任意单位方向 \(u\) 上的局部变化：\(D_uL=\nabla L^Tu\)。因此“偏导数、梯度、方向导数”不是三个互相替代的名词：偏导数读坐标轴，梯度收集所有坐标轴，方向导数再读取指定组合方向。`,
  md`If parameters are ordered as \(\theta=[w_1,w_2,b]\), the gradient must preserve the same order and shape. Component j asks how loss changes when only parameter j moves slightly to the right. Swapping components applies correct numbers to the wrong parameters even though the array still looks valid.

The gradient points toward fastest local increase, so the negative gradient [0,5,1] points toward fastest local decrease. A directional derivative asks about any unit direction \(u\): \(D_uL=\nabla L^Tu\). Partial derivatives, gradients, and directional derivatives are therefore not interchangeable names. A partial reads one coordinate axis, the gradient collects all coordinate axes, and a directional derivative reads one chosen combination.`,
)

const gradientOutputSection = section(
  'v3-gradient-numpy-output',
  'NumPy 运行结果：先保留预测和残差，再计算梯度',
  'NumPy Output: Keep Predictions and Residuals Before the Gradient',
  md`代码先验证样本轴、特征轴和有限值，再依次保存 predictions、residuals、loss、grad_w 与 grad_b。这样的中间账本能定位错误：预测错先检查前向计算，残差 shape 错先检查 target 对齐，只有前两层正确后才解释梯度。

**X.T @ residuals** 会沿样本轴汇总每个特征的残差贡献，输出 shape 与 **w** 相同。偏置在每个样本上都乘 1，所以它的梯度是残差平均值的两倍。不要把 **grad_b** 塞进 **grad_w** 后再忘记它原本是共享标量参数。`,
  md`The code validates sample axis, feature axis, and finite values before retaining predictions, residuals, loss, grad_w, and grad_b in order. This ledger localizes failures: repair the forward pass if predictions are wrong, repair target alignment if residual shape is wrong, and interpret gradients only after both layers agree.

X.T @ residuals aggregates residual contributions along the sample axis and returns the same shape as w. Bias multiplies one for every example, so its gradient is twice the mean residual. It may be displayed beside grad_w, but it remains a shared scalar parameter rather than an unnamed extra feature.`,
)

const gradientSummarySection = section(
  'v3-gradient-summary',
  '本章小结：梯度只提供局部方向，下一章才定义更新',
  'Summary: A Gradient Gives Local Direction; the Next Chapter Defines an Update',
  md`当前批次把导数课的三个独立探测合成了 **[0,-5,-1]**。你现在应能解释每个分量对应哪个参数、为什么 shape 必须一致、为什么梯度指向上升而训练常沿负梯度移动。

下一章保持同一个起点，加入学习率 \(\eta\) 和赋值规则 \(\theta\leftarrow\theta-\eta\nabla L\)。关键问题从“坡度是多少”变成“沿这个方向走多远，以及走完后真实 loss 是否真的降低”。`,
  md`The current batch combines three derivative probes into [0,-5,-1]. You should now be able to name the parameter behind every component, explain why shapes must align, and explain why the gradient points uphill while training commonly follows the negative gradient.

Review Questions: Which parameter belongs to every gradient component? Why must gradient shape match parameter shape? Why is the negative gradient the local descent direction?

The next chapter keeps the same starting point and adds learning rate \(\eta\) plus the assignment rule \(\theta\leftarrow\theta-\eta\nabla L\). The question changes from “what is the slope?” to “how far should we move, and did the true loss actually decrease after the move?”`,
)

const batchSharedSection = section(
  'v3-batch-shared-gradients',
  '把全批量梯度拆开：两个样本给出相反意见',
  'Split the Full Gradient: Two Examples Give Opposing Opinions',
  md`第一个样本残差为 1，它的单样本梯度是 **grad_w=[4,6]**、**grad_b=2**；第二个样本残差为 -2，它给出 **grad_w=[-4,-16]**、**grad_b=-4**。两条样本对 \(w_1\) 的意见恰好抵消，对 \(w_2\) 和 \(b\) 的意见只部分抵消。

将两个梯度逐项平均得到 **[0,-5,-1]**，与上一章的 full-batch 结果完全一致。严格 SGD 每步只抽一个样本，所以当前方向可能是两者之一；mini-batch 使用若干样本的平均；full batch 使用全部样本。三者区别在每次估计用了多少样本，不在于是否还属于梯度方法。`,
  md`The first example has residual 1 and sample gradient grad_w=[4,6], grad_b=2. The second has residual -2 and gives grad_w=[-4,-16], grad_b=-4. Their opinions about \(w_1\) cancel exactly, while their opinions about \(w_2\) and \(b\) only partially cancel.

Componentwise averaging produces [0,-5,-1], exactly matching the previous full-batch result. Strict SGD samples one example per step, so its current direction may be either sample gradient. A mini-batch averages several examples, while full batch uses every example. They differ in how many examples estimate each update, not in whether the method still uses gradients.`,
)

const batchVarianceSection = section(
  'v3-batch-noise-variance',
  '噪声从哪里来：抽样改变了估计，不是改变了目标函数',
  'Where Noise Comes From: Sampling Changes the Estimate, Not the Objective',
  md`训练目标仍是所有样本平均 loss。mini-batch 只是用当前子集估计它的梯度，因此不同 batch 会产生不同方向和大小。若抽样无偏且数据顺序处理正确，许多更新的平均方向会接近全数据梯度；但单独一步不需要与 full batch 完全相同。

batch size 增大通常降低梯度估计方差，也增加一次更新的计算量和内存占用。小 batch 带来更明显的曲线抖动，却能更频繁更新。选择 batch size 时要同时观察吞吐、内存、梯度波动和验证表现，不能把“曲线不光滑”直接判成训练失败。`,
  md`The training objective remains the mean loss over all examples. A mini-batch estimates its gradient using the current subset, so different batches produce different directions and magnitudes. Under unbiased sampling and correct data ordering, average direction across many updates approaches the full-data gradient, but one step need not match full batch exactly.

Increasing batch size usually reduces gradient-estimate variance while increasing compute and memory per update. Small batches produce visibly noisier curves but allow more frequent updates. Batch-size choice must consider throughput, memory, gradient variation, and validation behavior together. A non-smooth curve is not automatically failed training.`,
)

const batchOutputSection = section(
  'v3-batch-numpy-output',
  '代码核对：先打印单样本梯度，再做逐项平均',
  'Code Check: Print Sample Gradients Before Averaging',
  md`代码用 **zip(X, targets)** 保持每行样本与目标一一对齐，并为每个样本保存 **[grad_w1,grad_w2,grad_b]**。最后 **mean(axis=0)** 沿样本轴求平均，保留参数轴；若误用 **axis=1**，会把三个不同参数的梯度混成每样本一个标量。

这个两样本例很小，正适合建立独立核对。真实 DataLoader 还要处理 shuffle、最后一个不足 batch、随机种子和分布式采样；但无论规模多大，最小合同仍是“样本和目标同步移动，batch 内按样本平均，输出 shape 与参数一致”。`,
  md`The code uses zip(X, targets) to preserve one-to-one alignment and stores [grad_w1,grad_w2,grad_b] for each example. The final mean(axis=0) averages along the sample axis and preserves the parameter axis. Using axis=1 would mix gradients for three different parameters into one scalar per example.

This two-example task is small enough for an independent check. A real DataLoader must also handle shuffling, an incomplete last batch, random seeds, and distributed sampling. The minimum contract stays the same at every scale: examples and targets move together, averaging happens across examples, and output shape matches parameters.`,
)

const batchVocabularySection = section(
  'v3-batch-training-clock',
  '训练时钟：batch size、iteration、epoch 不可互换',
  'The Training Clock: Batch Size, Iteration, and Epoch Are Not Interchangeable',
  md`batch size 是一次更新读取的样本数；iteration 是一次参数更新；epoch 是训练集被完整遍历一遍。若有 1,000 个样本且 batch size=100，一个 epoch 通常包含 10 次 iteration。若不丢弃最后一个 batch，1,050 个样本会包含 11 次，其中最后一次只有 50 个样本。

比较训练曲线时必须先看横轴。按 iteration 绘图更细，按 epoch 绘图便于比较数据遍历次数，按 wall-clock time 则更接近算力成本。同一条训练记录换横轴后视觉密度会不同，但参数更新事件本身没有改变。`,
  md`Batch size counts examples read for one update. An iteration is one parameter update. An epoch is one complete traversal of the training set. With 1,000 examples and batch size 100, one epoch usually contains 10 iterations. With 1,050 examples and no dropped last batch, it contains 11, with only 50 examples in the final batch.

Always inspect the horizontal axis before comparing training curves. Iterations give finer detail, epochs compare data passes, and wall-clock time reflects compute cost. Changing the plotting axis changes visual density, not the underlying update events.`,
)

const batchSummarySection = section(
  'v3-batch-summary',
  '本章小结：随机梯度是成本与方差之间的选择',
  'Summary: Stochastic Gradients Trade Compute Cost for Variance',
  md`两个单样本梯度差异很大，但它们的平均值准确恢复 full-batch 梯度。你现在应能区分目标函数与梯度估计、解释 batch size 怎样影响波动，并正确读取 iteration 与 epoch。

下一章会保留这种带噪梯度，再问优化器是否需要历史状态。Momentum 记住方向，RMSProp 记住平方梯度尺度，Adam 结合两类状态；这些状态改变“梯度怎样变成更新”，不会改变模型的前向函数和监督目标。`,
  md`The two sample gradients differ sharply, yet their average exactly recovers the full-batch gradient. You should now be able to separate the objective from its gradient estimate, explain how batch size changes variation, and read iterations and epochs correctly.

Review Questions: Why do the two sample gradients disagree? Along which axis must they be averaged? How do batch size, iteration, and epoch differ?

The next chapter keeps noisy gradients and asks whether an optimizer needs history. Momentum remembers direction, RMSProp remembers squared-gradient scale, and Adam combines both kinds of state. These states change how a gradient becomes an update; they do not change the model's forward function or supervised objective.`,
)

function enhanceGradient(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 60,
    concepts: withConceptCode(moduleDefinition.concepts, 'partial-gradient-list', gradientCode, gradientOutput),
    sections: [
      moduleDefinition.sections[0]!,
      gradientSharedSection,
      moduleDefinition.sections[1]!,
      gradientShapeSection,
      moduleDefinition.sections[2]!,
      gradientOutputSection,
      gradientSummarySection,
    ],
  })
}

function enhanceBatch(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 60,
    concepts: withConceptCode(moduleDefinition.concepts, 'mini-batch-gradient-estimate', batchCode, batchOutput),
    sections: [
      moduleDefinition.sections[0]!,
      batchSharedSection,
      moduleDefinition.sections[1]!,
      batchVarianceSection,
      batchOutputSection,
      moduleDefinition.sections[2]!,
      batchVocabularySection,
      batchSummarySection,
    ],
  })
}

const routeEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'calculus-partial-derivatives-gradients': enhanceGradient,
  'calculus-sgd-batch-noise': enhanceBatch,
}

// Compatibility collection for the complete seven-course route. Final providers bypass enhancers.
const courseModules = [
  ...calculusRouteModules.map(module => routeEnhancers[module.id]?.(module) ?? module),
  ...calculusLessonProviders.flatMap(provider => provider.modules),
]
export const calculusOptimizationRouteModules: MathLabModule[] = courseModules.sort(
  (left, right) => aiMathPathModuleIds.indexOf(left.id) - aiMathPathModuleIds.indexOf(right.id),
)
