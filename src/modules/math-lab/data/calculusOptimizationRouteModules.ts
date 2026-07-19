import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
} from '../types/mathLab.ts'
import { calculusRouteModules } from './calculusRouteModules.ts'

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

const descentCode = md`import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
targets = np.array([9.0, 7.0])
w0 = np.array([4.0, -1.0])
b0 = 5.0

def evaluate(w, b):
    predictions = X @ w + b
    residuals = predictions - targets
    return float(np.mean(residuals ** 2))

residuals = X @ w0 + b0 - targets
grad_w = (2 / X.shape[0]) * X.T @ residuals
grad_b = float(2 * residuals.mean())

print("start_loss =", evaluate(w0, b0))
print("gradient =", grad_w.tolist(), grad_b)
for learning_rate in (0.05, 0.10):
    w1 = w0 - learning_rate * grad_w
    b1 = b0 - learning_rate * grad_b
    print(
        "lr =", learning_rate,
        "params =", w1.tolist(), round(b1, 6),
        "loss =", round(evaluate(w1, b1), 6),
    )`

const descentOutput = `start_loss = 2.5
gradient = [0.0, -5.0] -1.0
lr = 0.05 params = [4.0, -0.75] 5.05 loss = 2.07125
lr = 0.1 params = [4.0, -0.5] 5.1 loss = 3.385`

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

const optimizerCode = md`import math

def loss(parameter):
    return 12.5 * parameter ** 2 + 20 * parameter + 10

def gradient(parameter):
    return 25 * parameter + 20

def run(name, steps=40, learning_rate=0.02):
    parameter, first_moment, second_moment = -1.5, 0.0, 0.0
    for step in range(1, steps + 1):
        grad = gradient(parameter)
        if name == "sgd":
            parameter -= learning_rate * grad
        elif name == "momentum":
            first_moment = 0.9 * first_moment + grad
            parameter -= learning_rate * first_moment
        elif name == "rmsprop":
            second_moment = 0.9 * second_moment + 0.1 * grad ** 2
            parameter -= learning_rate * grad / (math.sqrt(second_moment) + 1e-8)
        elif name == "adam":
            first_moment = 0.9 * first_moment + 0.1 * grad
            second_moment = 0.999 * second_moment + 0.001 * grad ** 2
            m_hat = first_moment / (1 - 0.9 ** step)
            v_hat = second_moment / (1 - 0.999 ** step)
            parameter -= learning_rate * m_hat / (math.sqrt(v_hat) + 1e-8)
    return parameter, loss(parameter)

for optimizer_name in ("sgd", "momentum", "rmsprop", "adam"):
    parameter, final_loss = run(optimizer_name)
    print(optimizer_name, round(parameter, 6), round(final_loss, 6))`

const optimizerOutput = `sgd -0.8 2.0
momentum -0.808317 2.000865
rmsprop -0.834905 2.01523
adam -0.857982 2.042024`

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

const descentSharedSection = section(
  'v3-descent-shared-update',
  '同一起点的一次更新：负号不等于参数一定变小',
  'One Update from the Same Start: Subtraction Does Not Mean Every Parameter Shrinks',
  md`当前梯度是 **grad_w=[0,-5]**、**grad_b=-1**。取学习率 0.05，更新为 **w_new = [4,-0.75]**、**b_new = 5.05**。\(w_2\) 和 \(b\) 都变大，因为它们的梯度为负，而更新规则减去负数。第一项保持 4，因为当前 \(w_1\) 梯度为 0。

新预测是 **[10.8,6.05]**，新残差是 **[1.8,-0.95]**，MSE 从 2.5 降到 2.07125。这个结果同时核对方向、步长和真实函数值。只看参数变大或变小没有意义；必须重新前向计算，确认 loss 对这次有限步长的响应。`,
  md`The current gradients are grad_w=[0,-5] and grad_b=-1. With learning rate 0.05, the updated values are w_new=[4,-0.75] and b_new=5.05. Both \(w_2\) and \(b\) increase because their gradients are negative and the update subtracts a negative number. The first weight stays at 4 because its current gradient is zero.

New predictions are [10.8,6.05], residuals are [1.8,-0.95], and MSE falls from 2.5 to 2.07125. This checks direction, step size, and the real function value together. Parameter values becoming larger or smaller is not the criterion; run the forward calculation again and inspect how loss responds to the finite step.`,
)

const descentRateSection = section(
  'v3-descent-rate-comparison',
  '同一方向、两个学习率：0.05 下降，0.10 反而上升',
  'One Direction, Two Learning Rates: 0.05 Descends, 0.10 Rises',
  md`把学习率改成 0.10，方向仍是负梯度，参数变为 **w=[4,-0.5]**、**b=5.1**，但新 MSE 是 3.385，比起点更高。原因不是梯度方向算反了，而是有限步长跨过了当前局部近似适用的区域。局部最速下降只对足够小的移动给出一阶保证。

因此一次训练步应记录旧 loss、gradient norm、learning rate、更新量和新 loss。若 loss 上升，先缩小步长并核对梯度，再考虑曲率、batch 噪声或实现错误。学习率不是装饰性超参数，它把局部斜率换算成真实位移。`,
  md`Change the learning rate to 0.10. The direction remains the negative gradient and parameters become w=[4,-0.5], b=5.1, yet the new MSE is 3.385, higher than the starting value. The gradient was not reversed; the finite step crossed beyond the region where the current local approximation was reliable. Steepest local descent gives a first-order guarantee only for a sufficiently small move.

A training step should therefore retain old loss, gradient norm, learning rate, parameter change, and new loss. When loss rises, reduce the step and verify gradients before investigating curvature, batch noise, or implementation errors. Learning rate is the conversion from local slope to an actual displacement.`,
)

const descentOutputSection = section(
  'v3-descent-numpy-output',
  '代码核对：更新前后都重新计算真实 MSE',
  'Code Check: Recompute the True MSE Before and After Updating',
  md`代码只计算一次起点梯度，然后从同一个 **w0,b0** 分别尝试两个学习率。这样 0.05 与 0.10 的比较不会互相继承参数状态。若第二次试验从第一次更新后的参数继续走，它回答的是两步训练，而不是学习率控制实验。

运行输出清楚展示：相同梯度、相同方向，不同有限步长可以产生相反的 loss 结果。实际训练循环每一步都要重新计算梯度，因为参数改变后，原来的局部斜率不再代表新位置。`,
  md`The code computes the starting gradient once and tries two learning rates from the same w0,b0. This prevents the 0.05 and 0.10 trials from inheriting state from one another. Starting the second trial after the first update would test two training steps rather than a controlled learning-rate comparison.

The output shows that the same gradient and direction can produce opposite loss outcomes under different finite step sizes. A real training loop recomputes gradients after every update because the old local slope no longer describes the new parameter position.`,
)

const descentSummarySection = section(
  'v3-descent-summary',
  '本章小结：训练步是测量、决策、移动、复算',
  'Summary: A Training Step Measures, Decides, Moves, and Re-evaluates',
  md`完整一步不是一条孤立公式：先用当前参数前向计算，再得到 loss 和梯度；学习率把梯度变成更新量；参数移动后重新计算真实 loss。负梯度提供局部下降方向，学习率决定是否把这个方向变成有效移动。

下一章不再总用完整两行平均。它会分别查看单样本梯度 **[4,6,2]** 和 **[-4,-16,-4]**，解释为什么随机抽到不同样本会给出不同更新方向，以及这些方向平均后怎样回到全批量梯度 **[0,-5,-1]**。`,
  md`A complete step is not one isolated formula. Run the forward pass at current parameters, obtain loss and gradients, convert gradients into an update with the learning rate, move parameters, then recompute true loss. The negative gradient gives a local descent direction; the learning rate determines whether that direction becomes an effective move.

Review Questions: What four stages make one complete training step? Why can a correct negative-gradient direction still increase loss? What must be recomputed after parameters move?

The next chapter stops averaging both examples every time. It inspects sample gradients [4,6,2] and [-4,-16,-4], explains why randomly selecting different examples produces different update directions, and shows how their average returns to the full-batch gradient [0,-5,-1].`,
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

const optimizerSharedSection = section(
  'v3-optimizer-shared-slice',
  '共同损失切片：先固定问题，再比较更新状态',
  'Shared Loss Slice: Fix the Problem Before Comparing Optimizer State',
  md`为了让四种更新可手算，本章固定 \(w_1=4,b=5\)，只改变 \(w_2\)。共同损失切片是 \(L(w_2)=12.5w_2^2+20w_2+10\)，梯度是 \(25w_2+20\)，最低点位于 \(w_2=-0.8\)、\(L=2\)。所有优化器从 -1.5 出发，读取完全相同的梯度函数。

这个切片故意简单。它用于观察状态，而不是制造排行榜：SGD 只用当前梯度；Momentum 维护方向累计；RMSProp 维护平方梯度移动平均；Adam 同时维护一阶与二阶矩并做偏差修正。相同任务和相同步数是比较基础，但超参数仍会改变轨迹。`,
  md`To keep all four updates hand-checkable, fix \(w_1=4,b=5\) and vary only \(w_2\). The shared slice is \(L(w_2)=12.5w_2^2+20w_2+10\), its gradient is \(25w_2+20\), and its minimum is \(w_2=-0.8,L=2\). Every optimizer starts at -1.5 and reads the same gradient function.

The slice is intentionally simple. It exposes state rather than creating a leaderboard. SGD uses only the current gradient. Momentum accumulates direction. RMSProp tracks a moving average of squared gradients. Adam tracks first and second moments with bias correction. A shared task and step count make comparison possible, while hyperparameters still change the paths.`,
)

const optimizerStateSection = section(
  'v3-optimizer-state-ledger',
  '状态账本：每种优化器到底保存了什么',
  'State Ledger: What Each Optimizer Actually Stores',
  md`plain SGD 的更新是 \(\theta\leftarrow\theta-\eta g_t\)，没有跨步状态。Momentum 用 \(v_t=\beta v_{t-1}+g_t\) 累积方向，在狭长谷地中让持续方向叠加、反复翻转方向抵消。RMSProp 用 \(s_t=\rho s_{t-1}+(1-\rho)g_t^2\) 估计每个参数方向的近期尺度，再用 \(g_t/(\sqrt{s_t}+\epsilon)\) 调整步长。

Adam 同时保存一阶矩 \(m_t\) 和二阶矩 \(v_t\)，早期还要用 \(1-\beta_1^t\)、\(1-\beta_2^t\) 修正从零初始化带来的偏差。代码里 optimizer state 的 shape 通常与参数相同；模型 checkpoint 若只保存权重而不保存这些状态，恢复训练时的后续轨迹可能改变。`,
  md`Plain SGD updates \(\theta\leftarrow\theta-\eta g_t\) with no cross-step state. Momentum uses \(v_t=\beta v_{t-1}+g_t\) to accumulate direction, reinforcing persistent motion in a ravine while canceling directions that repeatedly flip. RMSProp uses \(s_t=\rho s_{t-1}+(1-\rho)g_t^2\) to estimate recent scale per parameter, then adjusts the step with \(g_t/(\sqrt{s_t}+\epsilon)\).

Adam stores both first moment \(m_t\) and second moment \(v_t\), with early-step corrections using \(1-\beta_1^t\) and \(1-\beta_2^t\) for zero initialization. Optimizer-state shapes usually match parameter shapes. A training checkpoint that stores only weights and omits these states may follow a different path after resuming.`,
)

const optimizerOutputSection = section(
  'v3-optimizer-python-output',
  'Python 运行结果：同一终点附近，不同中间轨迹',
  'Python Output: Similar Neighborhood, Different Intermediate Paths',
  md`四种方法使用同一个起点、40 步和学习率 0.02。输出显示它们都接近最低点 -0.8，但距离并不相同。这个结果不支持“SGD 永远最快”或“Adam 永远最好”：当前二次函数和学习率恰好对 SGD 很友好，换成不同尺度、噪声或学习率后排序可能改变。

运行时应同时保存 trajectory、final loss 和 state，而不只看最后一个参数。两个方法可能到达相近终点，却在中途有不同震荡、步长和梯度尺度。实验页面中的路径图负责展示这些差异，文本输出提供可复制的数值锚点。`,
  md`All methods use the same starting point, 40 steps, and learning rate 0.02. They all approach the minimum at -0.8, but not by equal distances. This result does not establish that SGD is always fastest or Adam is always best. This quadratic and learning rate happen to favor SGD; different scales, noise, or learning rates can change the order.

Retain trajectory, final loss, and state rather than only the final parameter. Two methods can reach similar endpoints while showing different oscillation, step sizes, and gradient scales along the way. The interactive path visual shows those differences, while text output supplies reproducible numeric anchors.`,
)

const optimizerBoundariesSection = section(
  'v3-optimizer-boundaries',
  '应用边界：学习率、weight decay 与验证表现仍然要单独判断',
  'Application Boundaries: Learning Rate, Weight Decay, and Validation Still Need Separate Decisions',
  md`自适应优化器没有取消学习率，只是为不同参数方向重新缩放当前更新。Adam 的 **epsilon** 防止分母过小，betas 控制状态记忆长度；这些默认值常能工作，却不是数学保证。若训练不稳定，应先核对 loss、梯度、数据尺度和学习率，再决定是否更换优化器。

weight decay 也不能简单等同于“把 L2 梯度塞进任何 Adam 实现”。AdamW 把参数衰减与自适应梯度更新解耦，行为与传统 L2 正则在 Adam 中并不完全相同。最终选择还要看 validation loss、泛化、吞吐和恢复训练需求，而不是只比较 training loss 前几步下降速度。`,
  md`Adaptive optimizers do not remove the learning rate. They rescale updates across parameter directions. Adam epsilon prevents an overly small denominator, while betas control state memory. Common defaults often work but are not mathematical guarantees. When training is unstable, inspect loss, gradients, data scale, and learning rate before assuming that changing optimizer is the repair.

Weight decay is also not identical to inserting an L2 gradient into every Adam implementation. AdamW decouples parameter decay from adaptive gradient updates, so its behavior differs from traditional L2 regularization under Adam. Final choice must include validation loss, generalization, throughput, and resume-training needs, not only early training-loss speed.`,
)

const optimizerSummarySection = section(
  'v3-optimizer-summary',
  '本章小结：优化器管理更新状态，不替代诊断',
  'Summary: Optimizers Manage Update State; They Do Not Replace Diagnosis',
  md`四种优化器读取同一个梯度，却用不同状态产生实际更新。你现在应能指出每种方法保存什么、它针对哪类轨迹问题，以及为什么不能从单个 toy task 得出通用排名。

下一章把这些更新放进训练循环。重点不再是手写四种公式，而是看代码顺序是否正确、梯度是否有限、参数是否真的改变，以及 training loss、validation loss 和 gradient norm 如何共同描述训练状态。`,
  md`The four optimizers read the same gradient but use different states to produce actual updates. You should now be able to name the state each method stores, the path problem it addresses, and why one toy task cannot produce a universal ranking.

Review Questions: Which state does each optimizer retain? Why does Adam still need a learning rate? Why can one quadratic slice not rank optimizers universally?

The next chapter places these updates inside a training loop. The focus shifts from writing four formulas to checking code order, finite gradients, actual parameter changes, and the combined story told by training loss, validation loss, and gradient norm.`,
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

function enhanceDescent(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 60,
    concepts: withConceptCode(moduleDefinition.concepts, 'negative-gradient-step', descentCode, descentOutput),
    sections: [
      moduleDefinition.sections[0]!,
      descentSharedSection,
      moduleDefinition.sections[1]!,
      descentRateSection,
      moduleDefinition.sections[2]!,
      descentOutputSection,
      descentSummarySection,
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

function enhanceOptimizer(moduleDefinition: MathLabModule): MathLabModule {
  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts: withConceptCode(moduleDefinition.concepts, 'optimizer-problem-map', optimizerCode, optimizerOutput),
    sections: [
      moduleDefinition.sections[0]!,
      optimizerSharedSection,
      moduleDefinition.sections[1]!,
      optimizerStateSection,
      moduleDefinition.sections[2]!,
      optimizerOutputSection,
      optimizerBoundariesSection,
      optimizerSummarySection,
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
  'calculus-gradient-descent': enhanceDescent,
  'calculus-sgd-batch-noise': enhanceBatch,
  'calculus-optimizer-comparison': enhanceOptimizer,
  'calculus-training-code-diagnostics': enhanceTraining,
}

export const calculusOptimizationRouteModules: MathLabModule[] = calculusRouteModules.map((moduleDefinition) =>
  routeEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition,
)
