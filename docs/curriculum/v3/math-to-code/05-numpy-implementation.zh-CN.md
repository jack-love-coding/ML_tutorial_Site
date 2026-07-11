# 第 5 课：用 NumPy 实现数学——让公式、shape 与输出互相作证

> **建议学习时间：60–90 分钟**
>
> **本课主线：**用 NumPy 完整复现 Task 1 的共享预测、MSE 与中央差分结果。
>
> **学习方式：**先写输出合同再运行；练习不计分，重点是调试证据而非记忆 API。

## 1. 开场：一行代码为什么可能悄悄算错？ {#numpy-opening}

`X @ w + b` 很短，却隐藏数据类型、维度、轴、广播和可变数组问题。程序没有报错，只说明 NumPy 找到某种合法运算，不说明它符合课程语义。

本课目标不是炫技地消除所有中间变量，而是建立可检查实现：数组的每一轴有含义，代码输出复现手算，异常输入明确拒绝，数值导数不修改原参数。

## 2. 回顾：从标量到批量的合同 {#numpy-recap}

单样本 $\hat y=w^Tx+b$；批量 $\hat y=Xw+b$；MSE $L=\operatorname{mean}((\hat y-y)^2)$；中央差分比较 $L(\theta+h)$ 与 $L(\theta-h)$。

在 NumPy 中，`shape (2,)` 是一维数组，不自动区分行向量与列向量；`shape (2,1)` 是二维列。选择哪种表示必须与接口合同一致。

## 3. 主线连接：代码变量逐项对应数学 {#numpy-shared-task}

核心词汇 `x`, `w`, `b`, `y_hat`, `y`, `L` 不重命名。代码核心是 `predictions = X @ w + b`：

```text
x: 单个样本 (2,)
X: 批量样本 (2,2)
w: 权重 (2,)
b: 偏置 scalar
y_hat / predictions: (2,)
y / targets: (2,)
L / mse: scalar
```

代码允许变量名更长，但数学角色必须回链。例如 `predictions` 就是批量 `y_hat`，不能同时拿它表示残差。

## 4. 直觉：shape 是数据流的类型说明 {#numpy-intuition}

把 shape 当成管道接口。`X` 的最后一轴是特征，必须与 `w` 的唯一轴对齐；乘法后这条特征轴被汇总，留下样本轴。标量 `b` 可 broadcast 到每个样本预测。

vectorization 不是“完全没有循环”，而是把循环交给数组运算并显式指定轴。它通常更简洁高效，也更容易统一验证；但轴选错会批量地产生错误。

调试时让值、shape、语义三者同时出现。例如 `(2,)` 既可能是两项预测，也可能是两项特征贡献，必须结合变量名与生成公式判断。

## 5. 正式表达：arrays、broadcasting 与轴 {#numpy-formal}

`ndarray` 由 `dtype`、`ndim`、`shape` 与元素组成。主线统一使用浮点数组，避免后续更新时整数截断。

矩阵乘法 `@` 遵循内维对齐；逐元素 `*` 遵循 broadcasting。`X * w` 中 `(2,2)` 与 `(2,)` 从末轴对齐，$w$ 被视为对每行重复，结果仍 `(2,2)`。`(X*w).sum(axis=1)` 才得到每样本点积。

广播规则机械而不懂业务。`y` 若误成 `(2,1)`，与 `predictions (2,)` 相减会生成 `(2,2)`，没有报错却计算四个交叉残差。必须先断言 shape 完全相同。

### 深入一：dtype、轴名称与广播语义

`np.array([2,3])` 默认可能是整数。前向结果仍对，但未来若原地执行小数更新，整数参数会拒绝转换或产生非预期行为。本课统一 `dtype=float`。转换后仍要检查 `np.isfinite`，因为 `NaN` 与无穷会让损失和梯度失去解释。

主线轴名称是 `axis 0 = samples`、`axis 1 = features`。说“沿 axis 1 求和”时，应补充“消去特征轴，为每个样本留下一个值”。这比只记数字更能适应以后 `(batch,time,features)` 的数据。

```text
X (samples=2, features=2)
* w (features=2)
-> contributions (samples=2, features=2)
sum over features
-> weighted (samples=2)
```

广播前问两次：机械上哪个轴被扩展？业务上这个量是否理应共享？`X*w` 让同一权重重复到每个样本，`weighted+b` 让同一偏置重复到每个预测，均符合模型。每样本偏置 `(n,)` 虽也能加，却改变了模型语义。

## 6. 算例一：完整复现 Task 1 输出 {#numpy-worked-shared}

```python
import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
w = np.array([4.0, -1.0])
b = 5.0
y = np.array([9.0, 7.0])

assert X.shape == (2, 2)       # X.shape == (2, 2)
assert w.shape == (2,)
assert y.shape == (2,)

predictions = X @ w + b
mse = np.mean((predictions - y) ** 2)

print(predictions)  # [10.  5.]
print(mse)          # 2.5
```

因此 `predictions = [10.0, 5.0]` 且 `mse == 2.5`。中央差分逐个复制候选参数后得到 `gradient = [0.0, -5.0, -1.0]`，最后一项对应偏置。

手算核验仍是第一行 $8-3+5=10$，第二行 $4-4+5=5$；代码不能取代这份独立证据。

完整快照是：`X (2,2)`、`w (2,)`、`X@w (2,)=[5,0]`、`predictions (2,)=[10,5]`、`residuals (2,)=[1,-2]`、`squared (2,)=[1,4]`、`mse shape ()=2.5`。NumPy 标量 shape `()` 不等于 `(1,)`；预测函数返回每样本数组，损失函数返回标量。

按这个顺序打印能定位错误层。贡献或点积错，检查列序和轴；点积正确但预测错，检查偏置；预测正确但残差错，检查目标；平方正确但 MSE 错，检查汇总轴。

## 7. 算例二：独立传感器网格的 shape 调试 {#numpy-worked-auxiliary}

```python
sensor_grid = np.array([
    [10.0, 20.0, 30.0],
    [40.0, 50.0, 60.0],
])
column_bias = np.array([1.0, 2.0, 3.0])
print(sensor_grid.shape)  # (2, 3)

wrong_column_bias = column_bias[:, None]  # shape (3, 1)
wrong = sensor_grid[0] + wrong_column_bias
print(wrong.shape)  # (3, 3)，合法广播却不是目标

fixed_column_bias = column_bias            # shape (3,)
fixed = sensor_grid + fixed_column_bias
print(fixed)
# [[11. 22. 33.]
#  [41. 52. 63.]]
```

这个例子不使用主线的 $X,w,b$，而是一张两行三列的传感器读数表。目标是把三个列校准量 `[1,2,3]` 加到每一行，所以 `(2,3) + (3,) -> (2,3)`：NumPy 从末轴对齐，三项列校准被复用到两行。

`wrong_column_bias` 被人为改成 `(3,1)`。它与单行 `(3,)` 广播成 `(3,3)`，程序不报错，却生成三组彼此交叉的加法。诊断证据是实际 shape，不是“输出看起来有数字”。修复不是随意 `squeeze()`，而是确认列校准合同本来就是 `(3,)`。

实际 NumPy 输出数组不用逗号，二维数组会换行。本节注释按真实格式写成 `[[11. 22. 33.]` 与下一行 `[41. 52. 63.]]`，避免学习者把 Python 列表显示与 `ndarray` 显示混为一谈。

## 8. 代码实现：验证、向量化与无副作用差分 {#numpy-code}

下面是本课唯一的完整参考实现。`BEGIN/END` 标记让内容测试能独立定位合同代码，而不把周围讲解误当实现。

```python
# MATH_TO_CODE_REFERENCE_BEGIN
import numpy as np

def _matrix(X):
    X = np.asarray(X, dtype=float).copy()
    if X.ndim != 2 or X.shape[0] == 0 or X.shape[1] == 0:
        raise ValueError("X must be a nonempty 2D matrix")
    if not np.isfinite(X).all():
        raise ValueError("X must contain only finite values")
    return X

def _vector(values, name):
    values = np.asarray(values, dtype=float).copy()
    if values.ndim != 1 or values.size == 0:
        raise ValueError(f"{name} must be a nonempty 1D vector")
    if not np.isfinite(values).all():
        raise ValueError(f"{name} must contain only finite values")
    return values

def _scalar(value, name):
    value = np.asarray(value, dtype=float).copy()
    if value.ndim != 0:
        raise ValueError(f"{name} must be a scalar")
    result = float(value)
    if not np.isfinite(result):
        raise ValueError(f"{name} must be finite")
    return result

def predict_batch(X, w, b):
    X = np.asarray(X, dtype=float).copy()
    w = np.asarray(w, dtype=float).copy()
    if X.ndim != 2 or X.shape[0] == 0 or X.shape[1] == 0:
        raise ValueError("X must be a nonempty 2D matrix")
    if w.ndim != 1 or w.size == 0:
        raise ValueError("w must be a nonempty 1D vector")
    if X.shape[1] != w.shape[0]:
        raise ValueError("X feature count must equal w length")
    if not np.isfinite(X).all() or not np.isfinite(w).all():
        raise ValueError("X and w must contain only finite values")
    b = _scalar(b, "b")
    if not np.isfinite(b):
        raise ValueError("b must be finite")
    result = X @ w + b
    if not np.isfinite(result).all():
        raise ValueError("predictions must be finite")
    return result

def mse_loss(predictions, targets):
    predictions = np.asarray(predictions, dtype=float).copy()
    targets = np.asarray(targets, dtype=float).copy()
    if predictions.ndim != 1 or targets.ndim != 1:
        raise ValueError("predictions and targets must be 1D")
    if predictions.size == 0 or targets.size == 0:
        raise ValueError("predictions and targets must be nonempty")
    if predictions.shape != targets.shape:
        raise ValueError("prediction and target shapes must match")
    if not np.isfinite(predictions).all() or not np.isfinite(targets).all():
        raise ValueError("predictions and targets must be finite")
    result = float(np.mean((predictions - targets) ** 2))
    if not np.isfinite(result):
        raise ValueError("MSE must be finite")
    return result

def central_difference(fn, theta, h=1e-4):
    theta = _scalar(theta, "theta")
    h = _scalar(h, "h")
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    left_theta = theta - h
    right_theta = theta + h
    denominator = 2 * h
    if (
        not np.isfinite(left_theta)
        or not np.isfinite(right_theta)
        or not np.isfinite(denominator)
    ):
        raise ValueError("difference inputs and denominator must be finite")
    left = _scalar(fn(left_theta), "left function result")
    right = _scalar(fn(right_theta), "right function result")
    if not np.isfinite(left) or not np.isfinite(right):
        raise ValueError("left and right function results must be finite")
    result = (right - left) / denominator
    if not np.isfinite(result):
        raise ValueError("central difference must be finite")
    return result

def evaluate(X, y, w, b, h=1e-4):
    normalized_X = _matrix(X)
    normalized_y = _vector(y, "y")
    normalized_w = _vector(w, "w")
    normalized_b = _scalar(b, "b")
    normalized_h = _scalar(h, "h")
    if normalized_X.shape[1] != normalized_w.shape[0]:
        raise ValueError("X feature count must equal w length")
    if normalized_X.shape[0] != normalized_y.shape[0]:
        raise ValueError("X row count must equal y length")
    if normalized_h <= 0:
        raise ValueError("h must be positive")

    predictions = predict_batch(normalized_X, normalized_w, normalized_b)
    L = mse_loss(predictions, normalized_y)
    gradient_w = np.empty_like(normalized_w, dtype=float)
    for j in range(normalized_w.size):
        def loss_for(candidate, j=j):
            candidate_w = normalized_w.copy()
            candidate_w[j] = candidate
            candidate_predictions = predict_batch(
                normalized_X, candidate_w, normalized_b
            )
            return mse_loss(candidate_predictions, normalized_y)
        gradient_w[j] = central_difference(
            loss_for, normalized_w[j], normalized_h
        )
    gradient_b = central_difference(
        lambda candidate: mse_loss(
            predict_batch(normalized_X, normalized_w, candidate), normalized_y
        ),
        normalized_b,
        normalized_h,
    )
    if not np.isfinite(gradient_w).all() or not np.isfinite(gradient_b):
        raise ValueError("gradient must be finite")
    return predictions, L, gradient_w, gradient_b
# MATH_TO_CODE_REFERENCE_END
```

入口先用 `np.asarray(..., dtype=float).copy()` 接受 Python list 与整数数组，同时切断可变别名；随后严格检查预期 ndim、非空、shape 和有限值。没有 `zip`，所以不可能静默截断多余特征。每个运算结果也在返回前检查有限值。

### 完整评估与回归测试

`evaluate` 只把规范化副本传给后续函数，候选权重每次再复制。它既接受 list，也接受整数 dtype 的 `ndarray`，不会改变调用者输入。期望返回 `[10,5]`、2.5、`[0,-5]`、-1。前向计算向量化，跨参数的数值差分使用循环；vectorization 不表示所有层面都禁止循环。

```python
w_before = w.copy()
predictions, L, gradient_w, gradient_b = evaluate(X, y, w, b)
np.testing.assert_allclose(predictions, [10., 5.])
np.testing.assert_allclose(L, 2.5)
np.testing.assert_allclose(gradient_w, [0., -5.], atol=1e-6)
np.testing.assert_allclose(gradient_b, -1., atol=1e-6)
np.testing.assert_array_equal(w, w_before)
```

`allclose` 处理浮点尾差，`array_equal` 要求参数完全未变。异常测试还要覆盖不匹配特征、空目标、`NaN`、`Infinity`、目标 `(2,1)` 与非正 $h$。错误消息最好同时报告期望和实际 shape。

## 9. 控制实验：从循环到向量化，输出必须相同 {#numpy-experiment}

先写显式循环基线，每行调用单样本函数；再写 `X @ w + b`。固定 `X,w,b`，只改变实现方式，两份预测必须逐项等于 `[10,5]`。随后共同交换两行输入，循环与向量化都应输出 `[5,10]`；这检验实现尊重行独立性，而没有引入新数值算例。

第二个独立实验只改变目标 shape：把 `(2,)` 改成 `(2,1)`。观察原始减法生成 `(2,2)`；加入严格 shape 断言后应立即拒绝。这个失败演示说明广播既是能力也是风险。

性能比较可作为观察，不作为正确性证据。先保证公式、值和 shape 一致，再讨论速度。

不一致时按最小单位定位：先比第一行贡献、点积和偏置后预测，再检查第二行；预测全部一致后才比较损失。只看最终 MSE 太晚，不同错误还可能偶然得到相同平均值。

广播实验应打印预测 `(2,)`、目标列 `(2,1)` 与差值 `(2,2)`。二维差值表把每个目标与所有预测交叉组合。修复不是盲目 `squeeze()`，而是回到数据来源确认当前任务目标本应是一维；随意压缩可能破坏真正的多输出任务。

一般地，新增任意样本行时必须同步新增目标并断言样本数一致；新增特征列时必须扩展 `w` 并更新列名。这两类变化分别保护样本对齐与特征对齐，不能用同一个“shape 看起来变大了”概括。

## 10. 误区诊断：NumPy 的“合法错误” {#numpy-misconceptions}

进入误区前做一次“从输出倒查”。若最终 MSE 不是 2.5，先确认 residuals 是否 `[1,-2]`；若不是，再确认 predictions 是否 `[10,5]`；若不是，再确认 weighted 是否 `[5,0]`；最后检查贡献矩阵。每次只向上游退一层，能把错误定位在最小转换处。

运行时还应观察所有数组是否有限、输入是否被修改、重复调用是否一致。一个函数第一次返回正确结果、第二次因共享数组被改而不同，仍不满足可复现合同。为此，候选参数用副本，公开常量只读，测试比较调用前后值。

代码注释要解释“为什么”而不只是复述语法。`sum(axis=1)  # sum` 信息不足；`# sum feature contributions, keep one value per sample` 明确轴语义。shape 改动时，这类注释能提醒维护者同步检查合同。

### 误区一：没报错就表示 shape 正确

**为什么容易发生：**广播会主动寻找兼容方式。

**本例诊断：**`(2,) - (2,1)` 得 `(2,2)`，产生交叉残差。

**修复动作：**损失前断言预测与目标 shape 完全相同。

### 误区二：vectorization 意味着删掉全部中间量

**为什么容易发生：**一行表达式看起来更专业。

**本例诊断：**删掉贡献表后更难发现 axis 错误；短代码不自动更清楚。

**修复动作：**开发时保留贡献、加权和、预测、残差和平方误差，稳定后再封装。

### 误区三：数值导数可以原地修改 w

**为什么容易发生：**只改一个索引最方便。

**本例诊断：**若 `theta+h` 后未完全恢复，`theta-h` 不再从同一中心出发，重复调用也不同。

**修复动作：**每个候选使用 `w.copy()`，调用前后断言原参数不变。

## 11. 三层练习：读 shape、手算与调试 {#numpy-practice}

以下练习不做正式评定。

### 第一层：概念辨析

**练习 1A** `(2,)` 能否单凭 shape 判断是特征还是预测？

**提示：**考虑轴语义。

**参考推理：**不能；要结合变量角色、公式和生成步骤。shape 是必要证据但不是全部语义。

[回看：shape 直觉](#numpy-intuition)

**练习 1B** 为什么 `X*w` 不是批量预测？

**提示：**看输出仍有几条轴。

**参考推理：**它保留样本与特征两轴，只产生贡献表；还需沿特征轴求和并加偏置。

[回看：正式表达](#numpy-formal)

**练习 1C** 向量化结果是否仍需手算样本？

**提示：**独立证据能发现共同实现错误。

**参考推理：**需要；至少核验一两行，让公式与程序不只依赖同一段代码自证。

[回看：主线算例](#numpy-worked-shared)

### 第二层：读码与调试

**练习 2A** 在传感器例中，预测 `sensor_grid[0] + column_bias[:, None]` 的 shape。

**提示：**比较 `(3,)` 与 `(3,1)`，从末轴对齐。

**参考推理：**得到 `(3,3)`。一维行被视作 `(1,3)`，与 `(3,1)` 分别扩展，产生外加法网格，而不是一行校准结果。

[回看：独立 shape 调试算例](#numpy-worked-auxiliary)

**练习 2B** 找出 `np.mean(predictions-y)**2` 的问题。

**提示：**平方发生在平均之前还是之后？

**参考推理：**它先平均残差再平方，允许正负抵消；应写 `np.mean((predictions-y)**2)`。

[回看：主线算例](#numpy-worked-shared)

**练习 2C** 为 `h=0` 设计预期行为。

**提示：**分母与输入合同。

**参考推理：**应在计算前明确抛出异常，而不是产生除零后的无穷或 `NaN`。

[回看：代码实现](#numpy-code)

### 第三层：开放观察

**练习 3A** 比较循环与向量化在 2、1000 个重复样本上的结果。

**提示：**先比较值，再计时。

**参考推理：**数值应一致；性能差异依环境变化，不能用更快代替正确性证明。

[回看：控制实验](#numpy-experiment)

**练习 3B** 构造 `(2,1)` 目标并记录错误广播表。

**提示：**标注每个单元格来自哪两个索引。

**参考推理：**会出现四个交叉组合；严格 shape 检查应在损失计算前阻止它。

[回看：误区诊断](#numpy-misconceptions)

**练习 3C** 写最小回归检查复现 Task 1。

**提示：**锁定预测、MSE、梯度和参数不变性。

**参考推理：**断言预测 `[10,5]`、MSE 2.5、梯度近似 `[0,-5,-1]`，并比较差分前后的 `w,b`；再覆盖非法 shape 与非有限值。

[回看：代码实现](#numpy-code)

## 12. 小结与项目交接：从公式到可复现实验 {#numpy-handoff}

本课完成了 arrays、shapes、broadcasting、vectorization 与 debugging 的闭环，并以独立手算复现 Task 1。进入 `Project 1` 时，必须保留统一词汇 `x, w, b, y_hat, y, L`，即使代码使用 `X`、`predictions`、`targets` 表示批量版本。

建议用 15 分钟复述数组与轴协议，20 分钟逐行复现 Task 1，20 分钟实现带验证的函数和差分，最后用广播失败、循环对照与练习做 20–30 分钟调试。不要把复制粘贴输出当作完成：应先写期望 shape 和值，运行后比较，失败时沿贡献—点积—预测—残差—损失倒查。

项目交接自检是一次干净环境复现：重新创建四个输入数组，运行后得到预测 `[10,5]`、MSE 2.5、梯度 `[0,-5,-1]`；重复运行结果相同且 `w` 未变；非法 shape、非有限值和非正步长被清楚拒绝。该证据同时覆盖数学、代码、行为与安全合同。

保存实验时同时记录 NumPy 版本、输入数组和步长，使另一位学习者能重现结果；只保存截图而不保存输入，不足以审计公式与代码是否一致。

最终说明应同时引用公式、关键 shape、实际输出和一次失败观察，而不是只贴一段成功运行的代码。

项目输入合同：固定本单元两条样本与参数，先输出 `[10,5]` 和 MSE 2.5，再输出中央差分 `[0,-5,-1]`；随后一次只改变一个参数，记录公式、shape、表格与观察。概率模拟仅作明确预览，不参与这条预测链的核心结论，也不引入隐藏的通过判定。
