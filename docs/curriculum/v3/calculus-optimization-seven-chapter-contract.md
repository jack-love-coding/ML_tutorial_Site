# V3.2 微积分到优化七章内容契约

**状态：** 已实现并验证
**范围：** `calculus-functions-rate-change`、`calculus-derivatives-local-change`、`calculus-partial-derivatives-gradients`、`calculus-gradient-descent`、`calculus-sgd-batch-noise`、`calculus-optimizer-comparison`、`calculus-training-code-diagnostics`

## 教学顺序

这条路线不把微积分讲成一组孤立求导规则，而是沿一次可复现的模型训练回答七个连续问题：

1. 固定输入和参数后，函数怎样产生预测？
2. 当前参数附近，损失对一个参数有多敏感？
3. 多个偏导数怎样组成与参数同 shape 的梯度？
4. 梯度、负梯度和学习率怎样共同决定一次更新？
5. 为什么单样本或 mini-batch 梯度会波动，却仍能用于训练？
6. SGD、Momentum、RMSProp 和 Adam 分别保存什么状态、解决什么问题？
7. 公式怎样落到 `zero_grad → backward → step`，训练曲线又怎样帮助定位问题？

前两章已经采用详细长课形式。本阶段保留其 URL、正文、实验和 checkpoint，重点把后五章升级到同一内容标准，并用同一组数值把导数、梯度、更新、batch 噪声、优化器和训练代码连接起来。

## 共用数值主线

沿用最低数学基础与 Math-to-Code 的两样本任务：

```text
X = [[2, 3],
     [1, 4]]       shape (2, 2)
w = [4, -1]        shape (2,)
b = 5              scalar
targets = [9, 7]   shape (2,)
```

固定起点：

- `predictions = X @ w + b = [10, 5]`。
- `residuals = predictions - targets = [1, -2]`。
- `MSE = 2.5`。
- `grad_w = [0, -5]`，`grad_b = -1`。
- 学习率 `0.05` 的一次全批量更新得到 `w = [4, -0.75]`、`b = 5.05`、新 MSE `2.07125`。
- 学习率 `0.10` 的同一步更新得到新 MSE `3.385`，用于说明沿下降方向迈得过远仍可能使真实损失上升。
- 两个单样本梯度分别为 `([4, 6], 2)` 与 `([-4, -16], -4)`；平均后恢复全批量梯度 `([0, -5], -1)`。

优化器章把 `w_1=4` 与 `b=5` 固定，只研究一维切片

```text
L(w_2) = 12.5 * w_2**2 + 20 * w_2 + 10
```

其最小点为 `w_2=-0.8`、`L=2.0`。这个切片用于观察状态更新，不用于宣称某个优化器在所有任务中更好。

## 每章完成标准

- 中英文核心问题、解释、章节交接和变量名称一致。
- 至少给出一个可手算的中间结果，并说明符号与 shape 的含义。
- 后五章各有一个可复制的 NumPy/Python 代码块和真实运行输出。
- 梯度章明确区分一个偏导数、完整梯度和方向导数。
- 梯度下降章明确区分下降方向与实际下降结果，并比较至少两个学习率。
- batch 章明确区分 full batch、mini-batch、严格 SGD、iteration 和 epoch。
- 优化器章展示内部状态，不把 Adam 排成无条件第一名。
- 训练诊断章区分梯度计算与参数更新，并把 loss、validation loss、gradient norm 解释成观察信号。
- 面向学习者的标题和正文使用“观察、结果、依据、记录”等普通表达，不使用内部验收术语。

## 范围边界

- 不新增大量练习、评分系统、后端 Python 内核或账号能力。
- 不在本阶段推导完整收敛证明、凸优化理论或所有学习率调度器。
- 不把一次 toy task 的优化器结果推广为工程默认选择。
- 自动微分、链式法则图和深层网络梯度传播继续由后续 `matrix-calculus-autodiff` 与深度学习模块展开。
- 旧 URL、现有实验和 checkpoint 继续可用；本阶段通过 adapter 增强内容，不重写整个 Math Lab。

## 实现与验证记录

- 运行时通过 `calculusOptimizationRouteModules` adapter 保留七章顺序、旧 URL、现有实验和 checkpoint，并增强第 3–7 章。
- 后五章已接入共用数值主线、可复制代码、固定运行输出和章节间交接；每个实验只在一个章节位置挂载。
- `npm test`：683 项通过，0 项失败。
- `npm run build` 与 `npm run build:pages`：均通过类型检查和生产构建。
- 浏览器检查覆盖第 3–7 章桌面页面、第 3 与第 7 章 390px 移动端、第 7 章英文切换和代码复制；页面无控制台错误，移动端文档宽度与视口宽度均为 390px。
- 构建仍报告既有的大 chunk 提示；本阶段没有扩大初始同步路由边界，后续单独处理包体积优化。
