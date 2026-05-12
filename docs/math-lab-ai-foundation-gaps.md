# 数学直觉实验室 AI 前置数学缺口与参考资料

本文档整理【数学直觉实验室】在 CS357 数值计算主线之外需要补强的 5 个 AI 前置数学缺口。目标不是搬运公开课程，而是把公开资料中的教学结构改写为本站统一的“数学直觉 + 手算例子 + 公式解释 + 常见误区 + 交互实验”格式。

## 总体改写原则

- 先回答学生会在 AI 代码中遇到的真实问题，再引入数学对象。
- 每章至少包含一个核心公式、一个手算例子、一个交互实验、两个 quiz 和两个误区卡片。
- 数学图形使用确定性的 Vue/SVG/Canvas 实现，不用生成图片承载公式、坐标轴或文字。
- 参考资料只用于结构校准、概念覆盖和术语准确性；正文和例子按本站语气原创改写。

## 5 个缺口与站内章节映射

| 缺口 | 站内章节 | 需要补的直觉 | 核心实验 | 主要参考 |
| --- | --- | --- | --- | --- |
| 张量 shape、broadcasting、向量化 | `tensor-shapes-vectorization` | batch 维不是特征维；矩阵乘法消掉中间维；broadcasting 有明确规则 | `TensorShapeLab` | D2L Preliminaries |
| 矩阵微积分与自动微分 | `matrix-calculus-autodiff` | 导数是局部线性化；反向传播是链式法则在计算图上的组合 | `AutodiffGraphLab` | MIT 18.S096、MML、CS229 |
| 概率、似然、熵、交叉熵 | `probability-likelihood-entropy` | 模型输出是分布；交叉熵是正确类别负对数概率；KL 不等于普通距离 | `ProbabilityEntropyLab` | D2L、Google MLCC、MML、CS229 |
| 训练诊断数学 | `training-diagnostics` | loss 曲线、validation gap 和 gradient norm 是训练状态的数学观测 | `TrainingDiagnosticsLab` | Google MLCC、D2L、CS231n |
| 深度结构中的数学 | `deep-architecture-math` | CNN 是局部共享线性变换；attention 是点积相似度和 softmax 加权；residual/norm 稳定深层信息流 | `ArchitectureMathLab` | CS231n、CS224N、D2L |

## 学习路径位置

本次采用插入重排，而不是把 AI 桥接内容放到末尾。目标路径为：

```text
vectors-matrices-norms
-> tensor-shapes-vectorization
-> taylor-series
-> matrix-calculus-autodiff
-> monte-carlo
-> probability-likelihood-entropy
-> lu-decomposition
-> sparse-matrices
-> condition-numbers
-> eigenvalues-eigenvectors
-> markov-chains
-> finite-difference-methods
-> nonlinear-equations
-> optimization
-> training-diagnostics
-> least-squares-fitting
-> svd
-> pca
-> deep-architecture-math
```

这样安排的理由：

- 向量矩阵之后立即补 shape，避免学生先学复杂分解却仍无法读懂模型张量。
- Taylor 之后补自动微分，让“局部近似”和“反向传播”直接连接。
- Monte Carlo 之后补概率、似然和熵，让随机实验自然过渡到概率模型。
- 优化之后补训练诊断，让梯度下降从公式进入真实训练曲线。
- SVD/PCA 之后补 CNN/Attention/Transformer 数学结构，作为 AI 数学桥接总结。

## 参考资料

- [D2L Preliminaries](https://d2l.ai/chapter_preliminaries/ndarray.html)：适合参考 ndarray、linear algebra、calculus、autograd、probability 和 optimization 的教学顺序。
- [MIT 18.S096 Matrix Calculus for Machine Learning and Beyond](https://ocw.mit.edu/courses/18-s096-matrix-calculus-for-machine-learning-and-beyond-january-iap-2023/)：适合参考局部线性化、矩阵微积分和机器学习中的导数语言。
- [Mathematics for Machine Learning](https://mml-book.github.io/)：适合校准线性代数、向量微积分、概率、优化、PCA 等概念边界。
- [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course)：适合参考初学者视角下的 loss、梯度下降、分类、泛化和训练诊断。
- [Stanford CS231n Notes](https://cs231n.github.io/)：适合参考反向传播、梯度流、CNN、优化和训练技巧。
- [Stanford CS224N](https://web.stanford.edu/class/cs224n/)：适合参考 word vectors、self-attention、Transformers 和 NLP 模型中的数学结构。
- [Stanford CS229 Notes](https://cs229.stanford.edu/main_notes.pdf)：适合参考概率解释、最大似然、线性/逻辑回归、反向传播和 PCA。

## 后续精修方向

- 为 `matrix-calculus-autodiff` 增加更完整的 Jacobian/VJP/JVP 视觉解释。
- 为 `probability-likelihood-entropy` 增加校准曲线和 temperature scaling 实验。
- 为 `training-diagnostics` 增加真实训练日志导入接口。
- 为 `deep-architecture-math` 增加 multi-head attention shape 分解实验。
