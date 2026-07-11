# 引导式实践：从数学到可复现代码

> **建议学习时间：90–120 分钟**
>
> 本页把前五课连成一次可独立完成的实践。你会从标量手算出发，逐步建立向量、批量预测、MSE 与数值敏感度证据。每一阶段都先写预期，再运行代码，并保存值、shape 与解释三类记录。
>
> **运行方式：**请按阶段 1 到阶段 9 的顺序执行；所有 Python 代码块位于同一份 notebook，后一阶段继承前面已经定义并检查过的变量。不要单独跳到某个代码块，也不要为每阶段重建完整环境。
>
> 本页不会启动参数迭代。概率模拟只是一扇预告窗口；核心预测链仍是 `x, X, w, b -> y_hat -> y -> L`。

## 阶段 1：复现任务与输入合同 {#studio-reproduce-task}

### 本阶段目标

先建立唯一的数据来源，明确行、列、变量角色和安全边界。两行分别是两个小游戏关卡，列顺序固定为“基础任务数、提示请求数”。`X,w,b` 产生预测，`targets` 只在预测之后参与误差比较。完成本阶段后，你应能解释每个数字来自哪里，而不是把四个数组当作无语义常量。

### 前置输入

准备 Python 3 与 NumPy。共同起点是 `X = [[2.0, 3.0], [1.0, 4.0]]`、`w = [4.0, -1.0]`、`b = 5.0`、`targets = [9.0, 7.0]`。预期 shape 依次为 `(2,2)`、`(2,)`、标量、`(2,)`。先在纸上标出样本轴和特征轴。

### Starter code 与操作步骤

```python
import numpy as np

X = np.asarray([[2.0, 3.0], [1.0, 4.0]], dtype=float).copy()
w = np.asarray([4.0, -1.0], dtype=float).copy()
b = float(5.0)
targets = np.asarray([9.0, 7.0], dtype=float).copy()

if X.ndim != 2 or X.shape[0] == 0 or X.shape[1] == 0:
    raise ValueError("X must be a nonempty 2D matrix")
if w.ndim != 1 or w.size == 0:
    raise ValueError("w must be a nonempty 1D vector")
if targets.ndim != 1 or targets.size == 0:
    raise ValueError("targets must be a nonempty 1D vector")
if not np.isfinite(X).all():
    raise ValueError("X must be finite")
if not np.isfinite(w).all():
    raise ValueError("w must be finite")
if not np.isfinite(targets).all():
    raise ValueError("targets must be finite")
if not np.isfinite(b):
    raise ValueError("b must be finite")

print(X.shape, w.shape, targets.shape)
```

### 预期中间结果

输出应为 `(2, 2) (2,) (2,)`。数据账本应写成：第 0 行 `[2,3]` 对应目标 9，第 1 行 `[1,4]` 对应目标 7；`w` 的第 0 项只配第一列，第 1 项只配第二列。此时尚未产生预测。

### 观察提示

注意 `.copy()` 切断了调用者数组与工作副本的可变别名，`dtype=float` 让后续微小扰动不会落入整数容器。shape 检查只保证结构，列名账本才保证语义；两者缺一不可。

### 常见失败与修复

若 `X` 写成一维的 `[2,3,1,4]`，不要凭猜测 reshape，先恢复“每行一个样本”的来源。若含 `NaN` 或无穷值，先定位数据生成环节，不要让异常值流入损失。若交换两列，必须同时交换列名与 `w` 的两项。

### 反思

为什么目标不能放进 `X`？当新关卡尚无已知结果时，模型仍应能产生预测。请用一句话区分“预测时可获得的信息”和“预测后用于比较的信息”，再进入标量基线。

## 阶段 2：建立标量透明基线 {#studio-scalar-baseline}

### 本阶段目标

不用 NumPy 的矩阵乘法，先逐项重建第一行预测。这个慢而透明的版本是后续向量化的独立证据：若短表达式与手算不同，应先相信可逐步审计的贡献表，再寻找轴或广播问题。

### 前置输入

在同一 notebook 中先完成阶段 1，保留已经检查的 `X,w,b,targets`。本阶段只从 `X` 取第一行 `x`，不重新创建权重或偏置。公式为 `y_hat = w^T x + b`；循环应适用于任意合法特征维度 $d$，而不是只适用于当前两列。

### Starter code 与操作步骤

```python
x = X[0].copy()
if x.ndim != 1 or x.shape != w.shape:
    raise ValueError("x and w must have the same length")

scalar_contributions = []
weighted_sum_scalar = 0.0
for index in range(w.size):
    contribution = float(x[index] * w[index])
    scalar_contributions.append(contribution)
    weighted_sum_scalar += x[index] * w[index]
prediction_scalar = weighted_sum_scalar + b
print(scalar_contributions, weighted_sum_scalar, prediction_scalar)
```

把运行结果与纸面式子逐格对齐：`4*2=8`、`(-1)*3=-3`，所以 `8 + (-3) + 5 = 10`。不要提前折叠中间名字。

### 预期中间结果

输出依次包含 `scalar_contributions = [8.0, -3.0]`、`weighted_sum_scalar = 5.0`、`prediction_scalar = 10.0`。贡献的单位都是分钟，加权和也是分钟，偏置再增加 5 分钟。目标 9 仍未进入该计算。

### 观察提示

负权重没有删除第二项，而是生成 -3 的贡献。输出为一个标量，说明“配对乘法—汇总—加偏置”三步均已完成。若停在 `[8,-3]`，那只是贡献向量。

### 常见失败与修复

得到 16 时，往往把 `-1*3` 看成 `+3`；得到 5 时，往往漏了偏置；得到 13 时，往往删掉负贡献。修复方法不是改最终数字，而是逐项打印索引、特征、权重和乘积。

### 反思

标量展开比 `@` 更长，为什么仍值得保留？请指出它能独立发现的两类错误。可选扩展：为第二行 `[1,4]` 重复展开并预期得到 5；这项扩展不影响主线继续。

## 阶段 3：把标量链翻译为向量预测 {#studio-vector-prediction}

### 本阶段目标

把第一行的两个贡献合并为向量运算，同时保留 shape 和中间值。重点不是少写两行，而是证明 `*`、`.sum()` 与 `@` 描述同一个点积，并且最终输出仍是标量。

### 前置输入

在同一 notebook 中先完成阶段 2，沿用它已经定义的 `x`，并保留阶段 1 的 `X,w,b,targets`。预期 `x.shape == w.shape == (2,)`。标量基线给出贡献 `[8,-3]`、加权和 5、预测 10，作为独立参照。

### Starter code 与操作步骤

```python
if x.ndim != 1 or x.shape != w.shape:
    raise ValueError("x and w must share one vector shape")

contributions = x * w
weighted_sum = float(contributions.sum())
weighted_sum_at = float(x @ w)
prediction = weighted_sum + b

if not np.isfinite(contributions).all() or not np.isfinite(prediction):
    raise ValueError("vector prediction must be finite")
np.testing.assert_allclose(weighted_sum, weighted_sum_at)
print(contributions, weighted_sum, prediction)
```

### 预期中间结果

`contributions` 为 `[8.0, -3.0]`、shape `(2,)`；`weighted_sum = 5.0`，`weighted_sum_at = 5.0`，两者均为标量；`prediction = 10.0`。这与阶段 2 完全一致。

### 观察提示

`x*w` 保留特征轴，`.sum()` 消去特征轴；`x@w` 一次表达同一过程。两个实现相等只说明数值链一致，列语义仍要由阶段 1 的协议保证。

### 常见失败与修复

若 `prediction` 变成长度 2 的数组，检查是否误写 `x*w+b`。若 `x` 是 `(1,2)`，结果容器会不同；本阶段明确选 `(2,)`，应回到切片来源修正，而不是随意挤压未知数据。

### 反思

请解释为什么“程序能计算”弱于“公式、shape、数值三者一致”。可选扩展：打印 `contributions.dtype` 与 `prediction` 的 Python 类型，观察数组、NumPy 标量和 Python 标量的差异；它不阻塞下一阶段。

## 阶段 4：扩展为批量预测 {#studio-batch-prediction}

### 本阶段目标

让同一组参数作用于两行样本，保持“一行一个预测”的合同。你会同时维护向量化结果和逐行基线，确认新增样本不会改写已有样本的前向结果。

### 前置输入

在同一 notebook 中先完成阶段 3，沿用已检查的 `X,w,b,targets` 与单行核验结果。shape 预期为 `(n,d) @ (d,) -> (n,)`，本例 `n=2,d=2`。两个 2 的角色不同：前者是样本数，后者是特征数。

### Starter code 与操作步骤

```python
if X.shape[1] != w.shape[0]:
    raise ValueError("X feature count must equal w length")

weighted_batch = X @ w
predictions = weighted_batch + b
if predictions.shape != targets.shape:
    raise ValueError("predictions and targets must share shape")
if not np.isfinite(predictions).all():
    raise ValueError("predictions must be finite")

loop_predictions = []
for row in X:
    if row.ndim != 1 or row.shape != w.shape:
        raise ValueError("each row must share w shape")
    row_prediction = float(b)
    for index in range(w.size):
        row_prediction += row[index] * w[index]
    if not np.isfinite(row_prediction):
        raise ValueError("loop prediction must be finite")
    loop_predictions.append(row_prediction)
loop_predictions = np.asarray(loop_predictions, dtype=float)
if loop_predictions.shape != predictions.shape or not np.isfinite(loop_predictions).all():
    raise ValueError("loop predictions must match finite vectorized predictions")
np.testing.assert_allclose(predictions, loop_predictions)
print(weighted_batch, predictions)
```

### 预期中间结果

`weighted_batch = [5.0, 0.0]`，`predictions = [10.0, 5.0]`，shape 都是 `(2,)`。第一项复现前两阶段；第二项来自 `1*4 + 4*(-1) + 5 = 5`。

### 观察提示

矩阵乘法消去特征轴，保留样本轴。标量偏置在点积之后复用到两个预测。逐行与向量化相等，是两条实现路径相互核验，不是让同一表达式重复打印。

### 常见失败与修复

若得到 `(2,2)`，检查是否把 `w` 变成 `(2,1)` 后又与偏置或目标交叉广播。若首项不是 10，先展开第一行贡献；若两项顺序颠倒，检查行与样本标识是否同步。

### 反思

为什么增加第三行不需要改变 `w`，而增加第三列必须扩展 `w`？可选扩展：追加 `[3,2]`，预期旧预测不变、新预测为 15；该观察不影响核心两行数据。

## 阶段 5：比较误差并重建 MSE {#studio-error-comparison}

### 本阶段目标

在预测已完成后引入目标，保留残差、平方误差和平均值三个层次。这样最终标量异常时，可以沿数据流逆向定位，而不会让正负残差在过早聚合中互相抵消。

### 前置输入

在同一 notebook 中先完成阶段 4，保留它定义的 `predictions`，并沿用阶段 1 的 `targets`。预期值分别是 `[10.0, 5.0]` 与 `[9.0, 7.0]`；两者必须都是有限的一维数组，shape 完全相同且非空。

### Starter code 与操作步骤

```python
if predictions.ndim != 1 or targets.ndim != 1:
    raise ValueError("predictions and targets must be vectors")
if predictions.size == 0 or predictions.shape != targets.shape:
    raise ValueError("prediction and target shapes must match and be nonempty")

residuals = predictions - targets
squared_errors = residuals ** 2
MSE = float(np.mean(squared_errors))
if not np.isfinite(MSE):
    raise ValueError("MSE must be finite")
print(residuals, squared_errors, MSE)
```

### 预期中间结果

`residuals = [1.0, -2.0]`，`squared_errors = [1.0, 4.0]`，`MSE = 2.5`。第二个样本贡献 4，第一项贡献 1；平均后得到一个标量，单位是分钟平方。

### 观察提示

目标只从本阶段开始出现。先平方后平均保留每个样本的距离；若先平均残差再平方，会得到 0.25，且正负方向互相抵消。MSE 汇总后不能反推出哪一行误差更大，所以诊断时应保留前两个数组。

### 常见失败与修复

若目标是 `(2,1)`，不要依赖广播；它会与 `(2,)` 形成交叉残差。应在减法前拒绝 shape 不同。若 MSE 为 1.5，检查是否误算 `(-2)^2`；若为 5，检查是否忘了除以样本数。

### 反思

只保存 2.5 会丢失什么信息？请写出从 MSE 逆向检查到平方误差、残差、预测的顺序。可选扩展：把目标改为 `[8,8]`，预期 MSE 为 6.5；完成与否不影响数值敏感度阶段。

## 阶段 6：估计数值敏感度 {#studio-numerical-sensitivity}

### 本阶段目标

用中央差分估计损失对 `w_1,w_2,b` 的局部变化率，并保证每次扰动从相同参数副本出发。这里读取的是当前点附近的敏感度，不执行参数更新；数值导数不是梯度下降。

### 前置输入

在同一 notebook 中先完成阶段 5，沿用其中的 `X,targets,w,b` 与 MSE 定义，选择 `h = 1e-4`。预期 `dL/dw_1 = 0`、`dL/dw_2 = -5`、`dL/db = -1`。`h`、中心点、左右扰动点与函数结果都必须有限，且 `h>0`。

### Starter code 与操作步骤

```python
def mse_for(candidate_w, candidate_b):
    candidate_predictions = X @ candidate_w + candidate_b
    return float(np.mean((candidate_predictions - targets) ** 2))

def central_difference_safe(fn, theta, h=1e-4):
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    left_theta = theta - h
    right_theta = theta + h
    denominator = 2 * h
    if (
        not np.isfinite(left_theta)
        or not np.isfinite(right_theta)
        or not np.isfinite(denominator)
        or denominator <= 0
    ):
        raise ValueError("perturbation points and denominator must be finite")
    left = float(fn(left_theta))
    if not np.isfinite(left):
        raise ValueError("left difference result must be finite")
    right = float(fn(right_theta))
    if not np.isfinite(right):
        raise ValueError("right difference result must be finite")
    result = (right - left) / denominator
    if not np.isfinite(result):
        raise ValueError("central difference must be finite")
    return result

gradient_w = []
for j in range(w.size):
    def loss_for_weight(candidate, j=j):
        candidate_w = w.copy()
        candidate_w[j] = candidate
        return mse_for(candidate_w, b)
    gradient_w.append(central_difference_safe(loss_for_weight, w[j], h=1e-4))
gradient_b = central_difference_safe(lambda candidate: mse_for(w, candidate), b, h=1e-4)
print(gradient_w, gradient_b)
```

### 预期中间结果

输出约为 `[0.0, -5.0] -1.0`，浮点尾差允许很小偏离。负号表示参数小幅向右移动时损失的一阶趋势向下；零只说明当前切片一阶局部平坦。

### 观察提示

`candidate_w = w.copy()` 防止一次左右求值污染下一次。把 `h` 改为 `0.1` 与 `0.0001`，本例二次损失仍应接近相同结果，但这不支持“步长越小总越好”的一般结论。

### 常见失败与修复

得到正 5 时检查左右相减顺序；得到负 10 时检查分母是否漏掉 2；每项相同时检查闭包索引；重复运行发生漂移时检查是否原地改了 `w`。先修复合同，再讨论数值精度。

### 反思

为什么 `dL/dw_2=-5` 不能读成“把参数增加 1，损失一定减少 5”？请在回答中写出“当前点、局部、小幅”三个限定。可选扩展：比较多个数量级的 `h`；它不阻塞后续预告。

## 阶段 7：概率预告（非完整概率课程） {#studio-probability-preview}

### 本阶段目标

显式区分确定性预测与随机重复实验。这里仅观察有限次抛硬币的频率怎样波动，用固定随机种子保证同一环境可复现；本阶段不建立概率公理、分布推导、估计理论或 Monte Carlo 的系统知识。

### 前置输入

在同一 notebook 中先完成阶段 6，保留核心预测链的固定 `[10,5]`、MSE 2.5 与敏感度记录。本阶段另建独立变量，不把随机数混入 `X,w,b,targets`。准备样本量 `n_values=[10,100,1000]` 和理论参考值 0.5。

### Starter code 与操作步骤

```python
rng = np.random.default_rng(2026)
n_values = [10, 100, 1000]
frequency_rows = []
for n in n_values:
    draws = rng.integers(0, 2, size=n)
    frequency = float(draws.mean())
    frequency_rows.append((n, frequency, frequency - 0.5))
print(frequency_rows)
```

先记录种子、样本量、频率与相对 0.5 的偏差。随后重新创建同一种子，核对整张表一致；不要把某一次频率称为永恒结果。

### 预期中间结果

得到三行有限数值，每个频率位于 0 与 1 之间。同一种子与同一 NumPy 版本下应复现相同序列；不同种子通常得到不同频率。较大样本量常更接近 0.5，但单次表格不构成单调保证。

### 观察提示

确定性预测在输入和参数固定时输出唯一；随机模拟还需记录生成器与种子。这里的“可复现”是重建同一伪随机序列，不是消除随机现象。概率概念将在后续 Monte Carlo 学习中系统展开。

### 常见失败与修复

若每次结果不同，检查是否遗漏固定生成器；若用同一个生成器连续运行两遍，第二遍会接着消费序列，应重新创建相同种子再核对。若把频率偏差接进 MSE，立即拆开两条数据流。

### 反思

固定种子解决了哪一种复现问题，又没有回答哪些概率问题？**可选扩展：**比较五个种子或画静态频率表；该扩展不影响本页核心链，也不阻塞下一阶段。

## 阶段 8：失败分析与最小修复 {#studio-failure-analysis}

### 本阶段目标

把常见“能运行但语义错误”的情况缩成最小反例，并按上游到下游的顺序定位。目标是建立诊断习惯：先看输入和 shape，再看贡献、预测、残差，最后看聚合值。

### 前置输入

在同一 notebook 中先完成阶段 7，并保留前序阶段的正确快照：`weighted=[5,0]`、`predictions=[10,5]`、`residuals=[1,-2]`、`squared_errors=[1,4]`、MSE 2.5。每次只制造一个故障，并在下一次实验前恢复正确输入。

### Starter code 与操作步骤

```python
target_column = targets[:, None]       # (2, 1)
cross_residuals = predictions - target_column
print(target_column.shape, cross_residuals.shape)  # (2, 1) -> (2, 2)

wrong_axis = (X * w).sum(axis=0)
right_axis = (X * w).sum(axis=1)
print(wrong_axis, right_axis)

try:
    bad_X = np.asarray([[2.0, np.nan]], dtype=float)
    if not np.isfinite(bad_X).all():
        raise ValueError("X must be finite")
except ValueError as error:
    print(type(error).__name__, str(error))
```

### 预期中间结果

目标列 `(2,1)` 与预测 `(2,)` 广播成 `(2,2)` 交叉残差，而不是两项逐行残差；`wrong_axis = [12.0, -7.0]` 是按列汇总，正确轴得到 `[5,0]`；非有限输入在矩阵乘法前被明确拒绝。

### 观察提示

广播错误最危险之处是没有运行异常。shape 正常也未必语义正确，例如交换两列但不交换 `w`。因此诊断日志至少包含轴名称、shape、前两行、逐列贡献和有限值状态。

### 常见失败与修复

不要把所有异常都用 `squeeze()` 修正；先查数据本应是一维目标还是多输出矩阵。不要因最终 MSE 恰巧接近就停止检查；不同错误可能在聚合时抵消。不要一次改多个变量，否则无法归因。

### 反思

请写出你的最短诊断路径：输入合同 → 贡献 → 点积 → 预测 → 残差 → 平方 → 平均。可选扩展：交换样本行并同步交换目标，观察 MSE 不变；它不影响最终总结。

## 阶段 9：证据回看与学习反思 {#studio-reflection}

### 本阶段目标

把九阶段结果整理为一条可复述的公式—代码—行为链，明确已经建立的能力和仍待后续课程补齐的部分。当前这个 guided studio 是五课后的引导实践，不是正式的 `project-math-to-code`。

### 前置输入

在同一 notebook 中先完成阶段 8，继承此前定义的 `predictions,targets,MSE,gradient_w,gradient_b`。同时准备输入与 shape 表、标量贡献、向量点积、残差、一张概率预告表，以及至少一个故障的症状—原因—修复记录。

### Starter code 与操作步骤

```python
evidence = {
    "predictions": predictions.tolist(),
    "targets": targets.tolist(),
    "mse": MSE,
    "gradient_w": [float(value) for value in gradient_w],
    "gradient_b": float(gradient_b),
}
print(evidence)
```

按以下顺序口述：`X,w,b` 怎样生成 `predictions`；目标何时进入；MSE 怎样聚合；中央差分改变哪个参数、固定哪些量；随机模拟为何与核心链分开。

### 预期中间结果

摘要包含预测 `[10.0,5.0]`、目标 `[9.0,7.0]`、MSE 2.5、权重敏感度约 `[0.0,-5.0]` 和偏置敏感度约 -1。每个数都能指回一个公式、一个代码变量和一个可观察行为。

### 观察提示

如果只能展示最终字典，却无法解释 `[1,-2]` 与 `[1,4]`，说明聚合前证据尚未连贯。如果能解释负敏感度却没有“局部”限定，说明结论范围仍过大。概率表只能说明固定种子下的有限模拟观察。

### 常见失败与修复

只保留截图会丢失输入、版本和种子；补充可运行片段与环境记录。只保留成功案例会隐藏安全边界；附上一条 shape 或非有限值故障记录。把数值导数说成训练时，回到阶段 6，指出尚无学习率与迭代。

### 反思

用三段话回答：哪一个中间值最能发现公式翻译错误？哪一项安全检查最能防止静默错误？哪一个观察提醒你不要把局部结论扩大？

学习路线边界必须保持清楚：正式的 `project-math-to-code` 位于 Gradient Descent 与 Monte Carlo 之后；它会在优化与随机模拟基础完整后再出现。本页当前 guided studio 只负责把前五课连成可复现实践，不提前占用正式项目的位置。

可选扩展：把证据摘要写成 Markdown 表，或增加第三个样本并重建整条链。两项都不阻塞后续学习；核心成果仍是能独立解释固定两行任务的公式、shape、数值、失败诊断与边界。
