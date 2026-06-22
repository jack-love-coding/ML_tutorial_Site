# 线性代数入门路线设计

Date: 2026-06-22

## 目标

整理 Math Lab 里的线性代数入门内容，让完全零基础的学生先看懂向量距离和 embedding 相似度，再进入矩阵、列空间、rank 和 null space。

这条路线不急着把线性代数讲全。第一轮只解决两个问题：

1. 一排数字为什么可以表示一个对象？
2. 矩阵为什么可以把一个向量变成另一个向量？

学生学完后，应该能用自己的话解释：

- 学习记录、推荐偏好和句子 embedding 都可以看成向量。
- 欧几里得距离和 norm 在问"差多远"和"自己多长"。
- cosine similarity 在问"方向像不像"，它和距离不是同一个问题。
- 矩阵乘向量可以读成对矩阵列向量的线性组合。
- column space 是所有可能输出的位置，rank 是有效独立方向数，null space 是矩阵看不见的输入方向。

## 当前项目位置

现有代码已经有两个合适的承接点：

- `beginner-linear-algebra`：零基础线性代数入口，适合放第一轮直觉和低门槛故事。
- `vectors-matrices-norms`：更正式的向量、矩阵和范数章节，适合承接 column space、rank、null space 和公式化表达。

本设计不推翻这两个模块。后续实现应优先沿用现有 typed schema、双语 `LocalizedCopy`、`MathConcept`、`VisualAsset`、`LabConfig`、`QuizItem` 和 `Misconception`。新增实验放在 `src/modules/math-lab/labs/`，核心计算放在 `src/modules/math-lab/utils/`，并配测试。

## 总路线

采用两阶段入口。

阶段一先避开矩阵，专心讲向量、距离、norm、方向相似度和 embedding 检索。阶段二再讲矩阵，把"大表格"改成"列向量被输入坐标混合出来"。

三个案例贯穿两阶段：

- 学生学习记录：练习次数、错题数、分数。
- 推荐系统：电影类型偏好、评分、价格敏感度。
- 句子 embedding：几句话被编码成高维向量，用来做相似检索。

这些案例不要分成三块各讲一遍。每学一个动作，就在三个场景里各看一次。学生会更早发现：换了数据，数学动作没变。

## 阶段一：向量与相似度

### 1. 数字不是孤立数字

先从对象和特征开始。一个学生不是数字，但我们可以记录"练习 2 次、错 5 题、测验 80 分"。一个用户不是数字，但可以记录他对动作片、喜剧片、科幻片的偏好。一句话也不是数字，但 embedding 模型会把它编码成一排数。

这一节只让学生接受一件事：同一个对象的多个观察值放在一起，就成了可以比较的表示。

### 2. 两个对象有多远

先讲差向量，再讲欧几里得距离：

```math
d(\mathbf{x},\mathbf{y})=\sqrt{\sum_i (x_i-y_i)^2}
```

例子从二维学生记录开始，比如 `[练习次数, 错题数]`。先算两个学生差多少，再换成两个用户偏好，最后换成两个短句的向量表示。

这一节要反复提醒：距离回答的是位置差多少。位置近不自动等于语义相似，后面还要看方向。

### 3. norm 是向量自己的长度

用同一个公式把"到原点的距离"说清楚：

```math
\|\mathbf{x}\|_2=\sqrt{\sum_i x_i^2}
```

这里可以顺手提到 L1、L2 和 infinity norm，但只讲直觉：

- L2 像直线距离。
- L1 像沿街区走路。
- infinity norm 看最大那一维有多大。

不要在入口阶段展开完整范数空间理论。

### 4. 从距离走到方向相似度

先讲点积，再讲 cosine similarity：

```math
\cos(\theta)=\frac{\mathbf{x}\cdot\mathbf{y}}{\|\mathbf{x}\|\|\mathbf{y}\|}
```

核心解释要慢一点：点积会同时受长度和夹角影响。cosine 把长度除掉后，更像是在问"这两个方向是不是朝着同一边"。

这一节要安排一个小反例：两个向量距离不算近，但方向很像；两个向量距离不远，但方向差别明显。这个反例很重要，embedding 检索会用到。

### 5. 再画 2D 和 3D 箭头

前面先算距离和相似度，这里再把数字放到坐标平面上。

图里要显示：

- norm 是原点到向量终点的线。
- distance 是两个向量终点之间的线。
- cosine 看两支箭头之间的夹角。

这样安排可以避免学生一开始误以为向量只存在于二维图里。

### 6. 高维 embedding

高维 embedding 画不出来，但计算规则没变。页面要把这句话说得朴素一点：图画不下，不代表数学换了。

可以用 4 到 6 句短文本做预设：

- "我想学机器学习"
- "我想了解人工智能"
- "今天晚饭吃什么"
- "推荐一部科幻电影"
- "帮我复习线性代数"

实验展示 cosine 排名，并让学生比较欧几里得距离排序是否一致。

### 7. checkpoint

阶段一的测验不要只问公式。重点问选择：

- 什么时候更关心距离？
- 什么时候更关心方向？
- 为什么 embedding 检索常用 cosine？
- norm 变大一定表示更相似吗？

反馈要指出误区，并引导学生回看对应图或实验。

## 阶段二：矩阵、列空间、rank 和 null space

### 1. 矩阵先是多个加权求和配方

先不用矩阵符号，从一条预测公式开始：

```math
score=0.6\times practice-0.4\times mistakes+0.2\times review
```

一个输出是一条配方。多个输出就是多条配方排在一起。这个时候再说：把这些权重排成一个表，就是矩阵。

这一节先用行读法帮助学生会算：每一行和输入向量做点积，得到一个输出。

### 2. 矩阵乘向量是混合列向量

接着给出本阶段的核心公式：

```math
A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2+\cdots+x_n\mathbf{a}_n
```

其中 \(\mathbf{a}_1,\mathbf{a}_2,\ldots,\mathbf{a}_n\) 是矩阵 \(A\) 的列。

这句要成为整章的主心骨：矩阵乘向量，就是用输入坐标去混合矩阵的列。输入向量给比例，矩阵列给方向，输出就是混合结果。

### 3. column space 是所有可能输出

学生理解列向量混合后，再讲 column space。

column space 不先讲抽象定义，先讲"这些列向量所有可能混出来的位置"。如果矩阵只有两列，那就拖动 \(x_1\) 和 \(x_2\)，看输出点能落在哪里。能落到的地方，就是这个矩阵的 column space。

一句话版本：column space 是矩阵所有可能输出所在的空间。

### 4. rank 是有效独立方向数

rank 先不讲高斯消元。入口阶段只讲独立方向。

- rank 0：所有输入都被送到 0。
- rank 1：输出只能沿一条线变化。
- rank 2：二维里两列不共线，就能铺开一个平面。
- rank 不满：有些方向被压扁或合并，信息回不来了。

这里适合配一个平面被压成线的动画。学生能看到 rank 下降，不只是听到一个数字变小。

### 5. null space 是矩阵看不见的输入方向

在 rank 后面加入 null space：

```math
A\mathbf{x}=0
```

把 null space 讲成"输入里有些变化，经过矩阵后输出不变，甚至变成 0"。对模型来说，这表示某些输入方向被忽略、抵消或压掉了。

一句话版本：null space 是矩阵看不见的输入方向。

这里要小心，不要一上来讲维数定理。可以在结尾轻轻埋钩子：后面会学到，rank 和 null space 的维度之间有一条很整齐的关系。

### 6. 矩阵作为空间变换

现在再讲网格变形。矩阵列决定基向量会去哪里，整个空间跟着拉伸、旋转或压扁。

二维例子：

- 两列不共线：平面仍然铺开。
- 两列共线：平面被压成一条线。
- 一列为零或两列抵消明显：某些输入方向被丢掉。

这个顺序比一开始就讲"矩阵是变换"更稳。学生已经知道列空间和 rank，看到变形时就能解释为什么空间会被压扁。

### 7. ML 连接

阶段二最后回到模型：

- 线性层 `Wx+b`：`W` 负责混合和变换，`b` 负责平移。
- embedding 投影：矩阵把一个语义空间映射到另一个任务空间。
- 特征冗余：多个方向差不多时，有效 rank 可能较低。
- 降维和 PCA：后面会专门讨论怎样保留主要方向、压掉次要方向。

这里要说明：严格线性变换经过原点，加入 `b` 后是 affine transformation。机器学习里常把 `Wx+b` 叫线性层，学生知道这点就够了。

## 文案风格

中文文案使用 `humanizer-zh` 做润色检查。目标不是写得像宣传文案，而是像老师在黑板前慢慢带学生走。

写作规则：

- 多用具体例子，少用"至关重要""深刻理解"这类空话。
- 可以用"先别急，我们先看..."这样的教师口吻，但不要讨好式夸赞。
- 一段只处理一个动作。算距离就算距离，不顺手塞进矩阵。
- 避免"不仅...而且..."和连续三项口号式排比。
- 关键句可以短一点，比如"图画不下，不代表数学换了。"

英文版本保留清晰和准确，不追求逐句翻译中文语气。

## 教学图资产

使用 `imagegen` 的内置生成流程，项目资产必须迁入 `public/math-lab/generated/`。运行时不引用临时路径，也不引用远程图片。

建议新增图：

| 文件建议名 | 目的 |
| --- | --- |
| `linear-algebra-feature-cards.png` | 显示学生记录、推荐偏好、句子 embedding 都是对象的数字描述。 |
| `vector-distance-norm-intuition.png` | 对比欧几里得距离和 norm。 |
| `cosine-vs-distance-intuition.png` | 展示距离近和方向近不是同一件事。 |
| `vectors-2d-3d-bridge.png` | 把低维数字放回箭头、距离线和夹角图。 |
| `high-dimensional-embedding-search.png` | 表示高维看不见但可以计算相似度。 |
| `matrix-column-combination.png` | 显示 \(A\mathbf{x}\) 是列向量线性组合。 |
| `column-space-rank-intuition.png` | 显示 column space 和 rank 的关系。 |
| `null-space-invisible-direction.png` | 显示不同输入变化被矩阵压成同一个输出或 0。 |

图片可以有少量中文标签，但公式和关键解释必须在页面正文、alt、caption 或 transcript 里复述。不能让关键信息只存在于图片文字里。

## Manim 视频资产

使用 `Math-To-Manim` 的 reverse knowledge tree 流程来设计短视频。每个视频只解释一个核心动作，时长控制在 45 到 90 秒。

建议新增视频：

| 场景建议名 | 核心概念 | 视频目标 |
| --- | --- | --- |
| `VectorDistanceNormScene` | distance 和 norm | 从两个点的距离过渡到向量自己的长度。 |
| `CosineSimilarityAngleScene` | dot product 和 cosine | 显示长度被除掉后，cosine 更关注方向。 |
| `MatrixColumnCombinationScene` | 列向量线性组合 | 输入坐标拖动时，输出由矩阵列混合出来。 |
| `RankFlatteningScene` | rank | 平面怎样被 rank-1 矩阵压成线。 |
| `NullSpaceCollapseScene` | null space | 某些输入方向怎样被压成 0。 |

Manim 源脚本放在 `scripts/manim/`。渲染产物、poster 和 `metadata.json` 放在 `public/manim/**`。视频要有 transcript，关键教学信息不能只存在于动画里。

## 前端互动实验

### 向量距离与相似度实验

用途：阶段一主实验。

控件：

- 案例切换：学生记录、推荐偏好、句子 embedding。
- 向量 A 和 B 的数值输入或预设。
- 度量切换：Euclidean distance、L2 norm、dot product、cosine similarity。
- 重置按钮。

展示：

- 差向量。
- 距离和 norm 数值。
- cosine 排名。
- 一句自然语言解释，比如"这两个向量长度差很多，但方向接近"。

计算逻辑放在 utils，并测试 NaN、Infinity、零向量 cosine fallback。

### 2D/3D 箭头实验

用途：把已经学过的计算画出来。

控件：

- 维度切换：2D 和 3D。
- 向量坐标滑块。
- 显示/隐藏 norm、distance、angle。

展示：

- 原点到向量终点的线。
- 两个向量终点之间的距离线。
- 夹角弧线。

移动端需要 fallback，可以用静态 SVG 或简化 Canvas，不能依赖复杂 3D 才能理解。

### 列空间、rank 和 null space 实验

用途：阶段二主实验。

控件：

- 矩阵列向量 \(\mathbf{a}_1,\mathbf{a}_2\) 的拖动控件。
- 输入坐标 \(x_1,x_2\)。
- 预设：full rank、rank 1、zero column、near dependent。
- 显示/隐藏 column space、rank、null direction。

展示：

- \(x_1\mathbf{a}_1+x_2\mathbf{a}_2\) 的动态合成。
- column space 的线或平面区域。
- rank 当前值。
- rank 低时被压掉的方向。

核心计算放在 utils，至少测试 rank 0、rank 1、rank 2、近似共线和 null direction。

## 课程数据与页面集成

建议实现时分两步走：

1. 先增强 `beginner-linear-algebra` 的阶段一内容，让入口更低门槛。
2. 再增强 `vectors-matrices-norms` 的阶段二内容，把 column space、rank、null space 放进正式章节。

每个新增或修改内容都要保持：

- `zh-CN` 和 `en` 双语完整。
- 公式、变量解释、例子和实验控件名称一致。
- quiz feedback 能说明原因，并指向可复看的图或实验。
- public 资源路径以 `/` 开头，并兼容现有 public base 处理模式。

## 测试与验收

文档落地后，后续实现至少需要这些验证：

```bash
npm test
npm run build
```

测试重点：

- 向量距离、norm、dot product、cosine 的数值工具。
- 零向量、非法输入、超出范围输入的 fallback。
- rank 和 null space 计算的稳定性。
- 新 lab 组件是否 lazy import。
- 新 public 资产路径存在。
- 中英文文案完整。
- Markdown 和公式仍走安全渲染路径。

如果只改文档，不需要完整构建，但要检查文档路径、文件存在、没有占位符和未完成内容。

## 暂不做

- 不在入口阶段讲完整行空间、左零空间和维数定理。
- 不把高斯消元作为 rank 的第一解释。
- 不加入新的 UI 框架。
- 不用生成图替代精确公式、坐标计算或交互实验。
- 不改动无关 generated 图片。

## 后续计划边界

设计通过后，下一步再写实现计划。实现计划应拆成可验证的小步：

1. 内容数据改写和 `humanizer-zh` 润色。
2. 数值工具与测试。
3. 阶段一互动实验。
4. 阶段二互动实验。
5. `imagegen` 教学图生成与迁入。
6. `Math-To-Manim` 视频脚本、渲染和 metadata。
7. 页面集成、移动端检查和最终构建。
