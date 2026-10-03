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

const trainingCode = md`import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
targets = np.array([9.0, 7.0])
w = np.array([4.0, -1.0])
b = 5.0
learning_rate = 0.02

for step in range(6):
    predictions = X @ w + b
    residuals = predictions - targets
    loss = float(np.mean(residuals ** 2))
    grad_w = (2 / X.shape[0]) * X.T @ residuals
    grad_b = float(2 * residuals.mean())
    grad_norm = float(np.sqrt(grad_w @ grad_w + grad_b ** 2))
    if not np.isfinite(loss) or not np.isfinite(grad_norm):
        raise FloatingPointError("loss and gradient norm must stay finite")
    print(step, round(loss, 6), round(grad_norm, 6))
    w -= learning_rate * grad_w
    b -= learning_rate * grad_b

print("params =", [round(value, 6) for value in w], round(b, 6))`

const trainingOutput = `0 2.5 5.09902
1 2.1194 2.600154
2 2.004564 1.978928
3 1.929655 1.846495
4 1.862445 1.799814
5 1.798275 1.766463
params = [3.85485, -0.775054] 5.015959`

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

const trainingSharedSection = section(
  'v3-training-shared-loop',
  '把共同批次放进六步训练循环',
  'Place the Shared Batch Inside a Six-Step Training Loop',
  md`代码继续使用同一个 \(X,targets,w,b\)，学习率设为 0.02。每一步依次计算 predictions、residuals、MSE、grad_w、grad_b 和 gradient norm，确认有限后再更新参数。前六个 loss 为 **2.5, 2.1194, 2.004564, 1.929655, 1.862445, 1.798275**，说明当前设置下训练稳定下降。

gradient norm 从 5.09902 降到 1.766463，但没有立刻接近零。这不矛盾：参数正在靠近较低区域，两个参数方向的斜率缩小速度不同。记录 loss 和 gradient norm 能区分“损失仍高但没有梯度”与“损失高且梯度很大”这两类完全不同的问题。`,
  md`The code keeps the same X, targets, w, and b with learning rate 0.02. Each step calculates predictions, residuals, MSE, grad_w, grad_b, and gradient norm, checks finite status, then updates parameters. The first six losses are 2.5, 2.1194, 2.004564, 1.929655, 1.862445, and 1.798275, showing stable descent under this setup.

Gradient norm falls from 5.09902 to 1.766463 but does not immediately approach zero. That is consistent: parameters are moving toward a lower region while different directions flatten at different rates. Recording loss and gradient norm separates “loss remains high with almost no gradient” from “loss is high and gradients are very large,” which require different diagnoses.`,
)

const trainingOrderSection = section(
  'v3-training-code-order',
  '逐行读 PyTorch：清空、前向、反向、更新各自只做一件事',
  'Read PyTorch Line by Line: Clear, Forward, Backward, and Update Have Separate Jobs',
  md`典型 PyTorch 顺序是 **optimizer.zero_grad()**、前向得到 predictions、计算 loss、**loss.backward()**、**optimizer.step()**。**zero_grad** 清除参数对象上上一步留下的 grad；**backward** 沿计算图应用链式法则并把结果写入 grad；**step** 才读取这些 grad 与 optimizer state 改变参数。

忘记 **zero_grad** 会在默认行为下累加旧梯度；忘记 **backward** 会让当前 loss 没有产生新梯度；忘记 **step** 会让参数保持不变。调试时不要只问“代码是否执行”，应在一个小 batch 上比较更新前后参数、grad shape、grad norm 和 loss。`,
  md`A typical PyTorch order is optimizer.zero_grad(), forward predictions, loss calculation, loss.backward(), and optimizer.step(). zero_grad clears gradients left on parameter objects by the previous step. backward applies the chain rule through the computation graph and writes results into grad. step is the call that reads gradients and optimizer state to change parameters.

Omitting zero_grad accumulates old gradients under the default behavior. Omitting backward leaves no current-loss gradient. Omitting step leaves parameters unchanged. Debugging should go beyond asking whether code executed: on one small batch, compare parameters before and after, gradient shapes, gradient norm, and loss.`,
)

const trainingSignalsSection = section(
  'v3-training-signal-table',
  '三条曲线怎样一起读：training、validation 与 gradient norm',
  'Read Three Signals Together: Training, Validation, and Gradient Norm',
  md`training loss 下降而 validation loss 先降后升，常见解释是模型继续拟合训练集但泛化变差；应检查 early stopping、正则化、数据划分和泄漏，而不是只训练更久。training 与 validation loss 同时很高且几乎不动，要再看 gradient norm：很小可能指向饱和、初始化或计算图断开，很大且伴随数值暴涨则可能是学习率过高、梯度爆炸或异常 batch。

曲线只提供下一步检查方向，不会单独给出唯一原因。比如 validation loss 抖动也可能来自验证集太小；gradient norm 很大也可能只是损失缩放方式改变。诊断应回到可复现设置：数据版本、随机种子、batch size、学习率、optimizer state 和具体异常 step。`,
  md`When training loss falls while validation loss first falls and then rises, the common interpretation is continued training fit with worsening generalization. Check early stopping, regularization, data splits, and leakage rather than simply training longer. If both losses stay high, inspect gradient norm. A tiny norm may indicate saturation, initialization, or a detached computation graph; a rapidly growing norm with numeric blow-up may indicate excessive learning rate, exploding gradients, or an anomalous batch.

Curves point to the next check rather than proving one unique cause. Validation noise may come from a small validation set, and a large gradient norm may reflect a changed loss reduction. Return to a reproducible run containing data version, seed, batch size, learning rate, optimizer state, and the exact anomalous step.`,
)

const trainingOutputSection = section(
  'v3-training-numpy-output',
  '运行结果账本：每一步都保留 loss 与 gradient norm',
  'Runtime Ledger: Retain Loss and Gradient Norm at Every Step',
  md`页面中的 NumPy 循环不是要替代 PyTorch，而是提供透明基线：所有梯度公式和参数赋值都集中在一段较短、可逐行检查的代码中。输出锁定六步数值与最终参数 **[3.85485,-0.775054]**、**b=5.015959**，以后若修改公式、缩放或 reduction，可立即看见哪一步开始偏离。

安全边界是 loss 与 gradient norm 必须有限。一旦出现 NaN 或 Infinity，应停止当前更新并检查最早异常层，而不是继续训练让错误扩散。真实框架还可以启用异常检测、梯度裁剪或混合精度缩放，但这些工具不能替代对输入、损失和学习率的原因检查。`,
  md`The NumPy loop is not a replacement for PyTorch. It is a transparent baseline whose gradient formulas and assignments fit in a short readable block. The output locks six numeric steps plus final parameters [3.85485,-0.775054] and b=5.015959. Future changes to formulas, scaling, or reduction will reveal the first step that diverges.

The safety boundary is that loss and gradient norm must remain finite. Stop the current update at the first NaN or Infinity and inspect the earliest anomalous layer instead of allowing the failure to spread. Framework anomaly detection, gradient clipping, and mixed-precision scaling can help, but none replaces checking inputs, loss definition, and learning rate.`,
)

const trainingSummarySection = section(
  'v3-training-summary',
  '本章小结：公式、代码和曲线形成同一个训练闭环',
  'Summary: Formulas, Code, and Curves Form One Training Loop',
  md`七章路线现在闭合：函数产生预测，导数读取局部敏感度，梯度对齐全部参数，学习率把负梯度变成有限更新，mini-batch 提供带方差的估计，优化器加入跨步状态，训练代码再把这些动作按顺序执行并记录结果。

接下来可以进入矩阵微积分与自动微分。那里会解释多层计算图怎样用链式法则传播梯度，以及为什么 **loss.backward()** 能为大量参数同时得到 grad。本章已经建立必要接口：每个参数有同 shape 梯度，**backward** 只计算梯度，**step** 才更新参数。`,
  md`The seven-chapter route is now closed. Functions produce predictions, derivatives read local sensitivity, gradients align every parameter, learning rate converts the negative gradient into a finite update, mini-batches provide estimates with variance, optimizers add cross-step state, and training code executes those actions in order while retaining results.

Review Questions: Which call clears gradients, which computes them, and which updates parameters? How do training loss, validation loss, and gradient norm narrow the next diagnostic check?

The next step can be matrix calculus and automatic differentiation. It explains how chain rules propagate through multilayer computation graphs and why loss.backward() can produce gradients for many parameters at once. This chapter has established the required interface: every parameter has a same-shape gradient, backward computes gradients, and step updates parameters.`,
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

function enhanceTraining(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts: withConceptCode(moduleDefinition.concepts, 'training-loop-gradient-step', trainingCode, trainingOutput),
    sections: [
      moduleDefinition.sections[0]!,
      trainingSharedSection,
      moduleDefinition.sections[1]!,
      trainingOrderSection,
      moduleDefinition.sections[2]!,
      trainingSignalsSection,
      trainingOutputSection,
      trainingSummarySection,
    ],
  })
}

const routeEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'calculus-partial-derivatives-gradients': enhanceGradient,
  'calculus-sgd-batch-noise': enhanceBatch,
  'calculus-training-code-diagnostics': enhanceTraining,
}

// Compatibility collection for the complete seven-course route. Final providers bypass enhancers.
const courseModules = [
  ...calculusRouteModules.map(module => routeEnhancers[module.id]?.(module) ?? module),
  ...calculusLessonProviders.flatMap(provider => provider.modules),
]
export const calculusOptimizationRouteModules: MathLabModule[] = courseModules.sort(
  (left, right) => aiMathPathModuleIds.indexOf(left.id) - aiMathPathModuleIds.indexOf(right.id),
)
