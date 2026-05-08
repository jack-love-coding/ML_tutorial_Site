# AI 教育网站「数学基础与数学直觉」板块建设 Plan

> 项目背景：面向学习人工智能、机器学习、深度学习的学生，建设一个以 **数学直觉 + 可视化 + 代码实验 + 模型应用** 为核心的学习板块。技术栈以 Vue 为主，结合 Codex、Image Gen Skill、Manim、Three.js 与交互式代码环境实现。

- 版本：v1.0
- 日期：2026-05-05
- 推荐实现形态：Vue 3 + TypeScript + Vite / Nuxt / VitePress，根据现有网站架构选择
- 核心目标：让学生不仅“看懂公式”，而且能够把公式转化为图像、代码、模型行为和调参判断

---

## 1. 产品定位

### 1.1 板块名称建议

可选名称：

1. **数学直觉实验室 Math Intuition Lab**
2. **AI 数学地基 Math Foundations for AI**
3. **从公式到模型 Formula to Model**
4. **深度学习数学可视化课程 Visual Math for Deep Learning**

推荐使用：

> **数学直觉实验室 Math Intuition Lab**

理由：

- “实验室”暗示学生需要动手探索，而不是被动听课。
- “数学直觉”比“数学基础”更有差异化。
- 适合承载 Manim 动画、Three.js 交互、代码实验和 AI 辅导。

---

## 2. 教学设计原则

### 2.1 总原则

本板块不以传统数学课程为中心，而以 AI 模型中的真实问题为中心。

传统路径：

```text
线性代数 → 微积分 → 概率统计 → 优化 → 机器学习
```

本站路径：

```text
模型问题 → 数学概念 → 可视化直觉 → 代码实验 → AI 模型应用 → 诊断反馈
```

### 2.2 五重表示法

每一个核心概念都必须同时提供五种表示：

| 表示层 | 学生看到什么 | 目的 |
|---|---|---|
| 公式 | 数学定义、推导、符号 | 建立严谨表达 |
| 语言 | 通俗解释、类比、误区提醒 | 降低理解门槛 |
| 图像 | Manim 动画、Three.js 交互 | 建立几何直觉 |
| 数值 | 小样本手算、表格变化 | 连接公式与结果 |
| 代码 | NumPy / PyTorch / JS 实验 | 连接数学与模型实现 |

页面设计时应避免只给公式或只给动画。每节课都要让学生完成一次“公式—图像—代码—模型行为”的闭环。

---

## 3. 学习路径设计

### 3.1 总学习路线

```text
第 0 层：符号与 Python / NumPy 预备
第 1 层：线性代数直觉
第 2 层：微积分与反向传播
第 3 层：概率统计与损失函数
第 4 层：优化与训练动态
第 5 层：深度学习结构中的数学，例如 CNN / Attention / Transformer
第 6 层：综合项目与诊断
```

### 3.2 课程地图

```text
Math Intuition Lab
├─ 00. 入门诊断：你缺哪块数学地基？
├─ 01. 向量：信息、方向与相似度
├─ 02. 矩阵：空间变换与特征混合
├─ 03. 特征值 / SVD / PCA：找到数据的主方向
├─ 04. 导数与梯度：函数如何变化
├─ 05. 链式法则：反向传播的核心
├─ 06. 概率分布：模型如何表达不确定性
├─ 07. 最大似然、交叉熵与 KL 散度
├─ 08. 梯度下降、SGD、Momentum、Adam
├─ 09. 训练诊断：梯度消失、爆炸、过拟合
├─ 10. CNN 数学直觉：卷积、局部性、共享权重
├─ 11. Attention 数学直觉：QKᵀ、softmax 与信息汇聚
└─ 12. 综合项目：从零实现一个小型神经网络
```

---

## 4. 核心模块规划

## 模块 00：入门诊断

### 目标

判断学生当前的数学基础，并推荐个性化路径。

### 内容

- 线性代数诊断：向量点积、矩阵乘法、投影。
- 微积分诊断：导数、偏导、链式法则。
- 概率诊断：条件概率、期望、交叉熵直觉。
- 优化诊断：学习率、梯度方向、loss 曲线判断。

### 页面组件

- `MathDiagnosticQuiz.vue`
- `SkillRadarChart.vue`
- `RecommendedPathCard.vue`
- `MisconceptionReport.vue`

### 输出结果

```ts
interface DiagnosticResult {
  linearAlgebra: number
  calculus: number
  probability: number
  optimization: number
  recommendedStartModuleId: string
  weakConcepts: string[]
}
```

---

## 模块 01：向量是有方向的信息

### 学习目标

学生完成后应能解释：

- 为什么图片、文本、声音都可以变成向量。
- 点积为什么表示相似度。
- cosine similarity 与向量夹角的关系。
- embedding 为什么可以用距离和方向表达语义。

### 数学内容

- 向量表示
- 点积
- 范数
- 夹角
- 投影
- cosine similarity

### Manim 动画

1. 向量从原点出发，表示方向和长度。
2. 两个向量夹角变化时，点积从正到零再到负。
3. 投影动画：一个向量在另一个方向上的“影子”。

### Three.js 交互

交互实验：**拖动两个 3D 向量，实时观察点积和夹角变化**。

学生可以：

- 拖动向量端点。
- 查看 dot product、cosine similarity、angle。
- 切换 2D / 3D 视角。
- 观察当夹角为 0°、90°、180° 时数值变化。

### 代码实验

```python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([2, 1, 0])

dot = np.dot(a, b)
cos = dot / (np.linalg.norm(a) * np.linalg.norm(b))

print(dot, cos)
```

### 练习

- 给定三个 embedding，判断哪两个最相似。
- 手算两个二维向量的点积和夹角。
- 用代码验证结果。

---

## 模块 02：矩阵是空间变换

### 学习目标

学生完成后应能解释：

- 矩阵不只是数字表，而是空间变换。
- 神经网络线性层 `y = Wx + b` 如何改变特征空间。
- 为什么矩阵乘法可以表示特征混合。
- 为什么秩与信息压缩有关。

### 数学内容

- 矩阵乘法
- 线性变换
- 基向量
- 秩
- 列空间
- 零空间
- 线性层

### Manim 动画

1. 二维网格被矩阵拉伸、旋转、剪切。
2. 基向量 `e1`、`e2` 被矩阵移动后，整个空间随之变化。
3. 矩阵把二维空间压扁成一条线，展示低秩变换。

### Three.js 交互

交互实验：**矩阵变换游乐场**。

学生可以输入：

```text
[a b]
[c d]
```

页面实时展示：

- 网格如何变形。
- 单位圆如何变成椭圆。
- 基向量如何移动。
- determinant 是否接近 0。
- 变换是否可逆。

### AI 模型连接

神经网络层：

```text
输入特征 x → 权重矩阵 W → 新特征 Wx → 加偏置 b → 激活函数
```

页面应展示：

```text
原始二维点云 → 线性层变换 → ReLU → 分类边界变化
```

---

## 模块 03：SVD / PCA 与数据主方向

### 学习目标

学生完成后应能解释：

- PCA 为什么能降维。
- SVD 如何把矩阵分解成方向、尺度、方向。
- 低秩近似为什么能压缩图像。
- embedding 空间中的“主方向”是什么。

### 数学内容

- 协方差矩阵
- 特征值 / 特征向量
- SVD
- PCA
- 低秩近似

### Manim 动画

1. 二维点云旋转到主方向。
2. 投影到第一主成分。
3. 用奇异值逐步恢复图像。

### Three.js 交互

交互实验：**PCA 点云压缩器**。

学生可以：

- 上传或选择点云数据。
- 拖动主方向向量。
- 查看投影误差。
- 切换保留 1 / 2 / 3 个主成分。

### 代码实验

```python
import numpy as np

X = X - X.mean(axis=0)
U, S, Vt = np.linalg.svd(X, full_matrices=False)
X_approx = U[:, :2] @ np.diag(S[:2]) @ Vt[:2]
```

---

## 模块 04：梯度是最快上升方向

### 学习目标

学生完成后应能解释：

- 导数是局部变化率。
- 偏导是“只改变一个变量时”的变化率。
- 梯度是函数上升最快方向。
- 梯度下降为什么沿负梯度方向移动。

### 数学内容

- 导数
- 偏导数
- 梯度
- 等高线
- Taylor 一阶近似

### Manim 动画

1. 一维函数切线变化。
2. 二维函数的等高线和梯度箭头。
3. 从 Taylor 近似解释局部线性化。

### Three.js 交互

交互实验：**损失地形探索器**。

展示三维曲面：

```text
z = f(x, y)
```

学生可以：

- 点击曲面上的点。
- 查看当前位置的梯度向量。
- 沿负梯度方向走一步。
- 改变学习率。
- 观察 loss 如何下降或发散。

---

## 模块 05：链式法则与反向传播

### 学习目标

学生完成后应能解释：

- 反向传播不是魔法，而是链式法则的高效实现。
- 复杂神经网络是大量函数的复合。
- 每一层都只需要知道局部导数和上游梯度。
- 为什么计算图可以自动求导。

### 数学内容

- 函数复合
- 链式法则
- 计算图
- Jacobian
- backpropagation

### Manim 动画

1. 函数链：`x → a → b → L`。
2. 前向传播值从左到右流动。
3. 反向传播梯度从右到左流动。
4. 每条边显示局部导数。

### Three.js / SVG 交互

更适合使用 SVG / Canvas，而不是 Three.js。

交互实验：**计算图梯度追踪器**。

学生可以：

- 点击任意节点查看局部导数。
- 修改输入值，观察所有节点变化。
- 切换“前向值模式”和“反向梯度模式”。

### 代码实验

从零实现：

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op
```

可参考 micrograd 风格实现，但要改造成教学可视化版本。

---

## 模块 06：概率是模型的不确定性语言

### 学习目标

学生完成后应能解释：

- 分类模型输出的不是“绝对答案”，而是概率分布。
- 条件概率 `p(y|x)` 是监督学习的重要形式。
- 期望和方差如何描述数据分布。
- 噪声、采样和泛化之间的关系。

### 数学内容

- 随机变量
- 分布
- 期望
- 方差
- 条件概率
- 贝叶斯公式
- Bernoulli / Categorical / Gaussian

### Manim 动画

1. 从数据点到概率分布。
2. 高斯分布均值和方差变化。
3. 条件概率区域高亮。

### Three.js / Canvas 交互

交互实验：**分布采样器**。

学生可以：

- 调整均值和方差。
- 点击“采样”，观察样本直方图逐渐接近真实分布。
- 对比小样本和大样本估计误差。

---

## 模块 07：最大似然、交叉熵与 KL 散度

### 学习目标

学生完成后应能解释：

- MSE 对应高斯噪声假设。
- Cross entropy 对应分类任务中的负对数似然。
- KL 散度衡量两个分布之间的差异。
- 为什么 softmax + cross entropy 的梯度形式简洁。

### 数学内容

- 最大似然估计 MLE
- 负对数似然 NLL
- entropy
- cross entropy
- KL divergence
- softmax

### Manim 动画

1. 正确类别概率越高，负对数损失越低。
2. 两个分布逐渐靠近时，KL 散度下降。
3. softmax logits 变成概率分布。

### 交互实验

**分类损失调音台**。

学生可以拖动 logits：

```text
z = [z1, z2, z3]
```

页面实时展示：

- softmax 概率。
- cross entropy loss。
- 正确类别概率。
- 梯度 `p - y`。

---

## 模块 08：优化与训练动态

### 学习目标

学生完成后应能解释：

- 学习率过大为什么会震荡或发散。
- 学习率过小为什么训练缓慢。
- SGD 为什么有噪声。
- Momentum 如何利用历史方向。
- Adam 为什么会自适应调整不同参数方向的步长。

### 数学内容

- 梯度下降
- SGD
- mini-batch
- momentum
- RMSProp
- Adam
- 学习率调度
- weight decay
- 梯度裁剪

### Three.js 交互

交互实验：**优化器赛跑**。

在同一个 loss surface 上展示：

- GD
- SGD
- Momentum
- Adam

学生可以调整：

- learning rate
- batch noise
- momentum coefficient
- beta1 / beta2
- 初始点

输出：

- 参数轨迹
- loss 曲线
- 是否发散
- 收敛步数

---

## 模块 09：训练诊断

### 学习目标

学生完成后应能根据训练曲线判断问题：

- loss 不下降
- loss 发散
- 训练集好、验证集差
- 梯度消失
- 梯度爆炸
- underfitting
- overfitting

### 页面设计

交互式训练诊断卡片：

```text
现象 → 可能原因 → 数学解释 → 解决方案 → 代码修改
```

示例：

| 现象 | 数学解释 | 解决方法 |
|---|---|---|
| loss NaN | 数值溢出、log(0)、梯度爆炸 | 降低学习率、gradient clipping、稳定 softmax |
| 训练 loss 降，验证 loss 升 | 泛化误差增大 | 正则化、数据增强、early stopping |
| 深层网络前几层梯度接近 0 | 链式法则中多个小导数连乘 | ReLU、残差连接、normalization |

---

## 模块 10：CNN 数学直觉

### 学习目标

学生完成后应能解释：

- 卷积核是局部特征检测器。
- 权重共享如何减少参数量。
- feature map 表示空间响应。
- pooling 为什么会降低分辨率。

### Manim 动画

1. 卷积核滑过图像。
2. 局部区域与 filter 做点积。
3. feature map 逐步生成。

### Three.js / Canvas 交互

交互实验：**卷积核画板**。

学生可以：

- 选择边缘检测、模糊、锐化 filter。
- 手动修改 3x3 kernel。
- 在图像上实时查看输出 feature map。

---

## 模块 11：Attention 数学直觉

### 学习目标

学生完成后应能解释：

- `QKᵀ` 为什么表示 token 间相似度。
- softmax 如何把相似度变成注意力权重。
- 乘以 `V` 为什么是信息加权汇聚。
- 除以 `√d_k` 为什么有助于控制数值尺度。

### 数学内容

```text
Attention(Q, K, V) = softmax(QKᵀ / √d_k)V
```

### Manim 动画

1. token 变成 embedding。
2. embedding 线性变换成 Q、K、V。
3. Q 与 K 做点积生成 attention score matrix。
4. softmax 生成权重。
5. 权重加权汇聚 V。

### Three.js / SVG 交互

交互实验：**Attention Heatmap Playground**。

学生可以：

- 输入一句短句。
- 点击一个 token。
- 查看它对其他 token 的 attention 权重。
- 修改某个 token embedding，观察 heatmap 变化。
- 对比未缩放和除以 `√d_k` 的 softmax 差异。

---

## 5. 页面信息架构

### 5.1 顶层路由建议

```text
/math-lab
/math-lab/diagnostic
/math-lab/path
/math-lab/modules/:moduleId
/math-lab/labs/:labId
/math-lab/projects/:projectId
/math-lab/progress
```

### 5.2 课程页结构

每个课程页建议使用统一结构：

```text
Concept Page
├─ Hero：本节核心问题
├─ Why it matters：它在 AI 模型中出现在哪里
├─ Formula：严谨公式
├─ Plain Language：人话解释
├─ Visual Intuition：Manim 动画 / Three.js 交互
├─ Numerical Example：手算小例子
├─ Code Lab：NumPy / PyTorch / JS 实验
├─ Model Connection：连接到真实神经网络
├─ Common Misconceptions：常见误解
├─ Checkpoint Quiz：即时检测
└─ Next Step：下一节推荐
```

---

## 6. Vue 技术架构建议

### 6.1 推荐技术栈

#### 基础

```text
Vue 3
TypeScript
Vite
Vue Router
Pinia
Vitest
Playwright
ESLint
Prettier
```

#### 数学展示

```text
KaTeX 或 MathJax：公式渲染
Markdown / MDX-like content：课程内容管理
Monaco Editor 或 CodeMirror：代码实验编辑器
```

#### 可视化

```text
Three.js：3D 向量、矩阵变换、loss surface、PCA、优化轨迹
Manim：高精度预渲染数学动画
Canvas / SVG：计算图、attention heatmap、卷积核实验
```

#### AI 辅助

```text
Codex：项目开发、组件生成、测试补全、重构、代码审查
Image Gen Skill：课程插画、概念隐喻图、封面图、学习路径视觉资产
可选 Tutor Agent：学生问答、提示、误区诊断、个性化练习生成
```

### 6.2 项目目录建议

```text
src/
├─ app/
│  ├─ router/
│  ├─ stores/
│  └─ layouts/
├─ modules/
│  └─ math-lab/
│     ├─ pages/
│     │  ├─ MathLabHome.vue
│     │  ├─ DiagnosticPage.vue
│     │  ├─ LearningPathPage.vue
│     │  ├─ ConceptPage.vue
│     │  └─ LabPage.vue
│     ├─ components/
│     │  ├─ ConceptHero.vue
│     │  ├─ FormulaBlock.vue
│     │  ├─ ManimPlayer.vue
│     │  ├─ ThreeSceneShell.vue
│     │  ├─ CodeLab.vue
│     │  ├─ CheckpointQuiz.vue
│     │  ├─ MisconceptionCard.vue
│     │  └─ LearningPathMap.vue
│     ├─ labs/
│     │  ├─ vector-dot-product/
│     │  ├─ matrix-transform/
│     │  ├─ gradient-descent/
│     │  ├─ softmax-cross-entropy/
│     │  └─ attention-playground/
│     ├─ content/
│     │  ├─ modules/
│     │  ├─ quizzes/
│     │  └─ misconceptions/
│     ├─ composables/
│     │  ├─ useThreeScene.ts
│     │  ├─ useMathProgress.ts
│     │  ├─ useFormulaRenderer.ts
│     │  └─ useLabTelemetry.ts
│     └─ types/
│        └─ mathLab.ts
├─ shared/
│  ├─ components/
│  ├─ utils/
│  └─ styles/
public/
├─ manim/
│  ├─ vectors/
│  ├─ matrices/
│  ├─ gradients/
│  └─ attention/
scripts/
├─ manim/
│  ├─ render_all.py
│  ├─ scenes/
│  └─ outputs/
└─ content/
   └─ validate_content_schema.ts
```

---

## 7. 内容数据模型

### 7.1 Module Schema

```ts
export interface MathLabModule {
  id: string
  order: number
  title: string
  subtitle: string
  difficulty: 'foundation' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  prerequisites: string[]
  aiModelConnections: string[]
  learningObjectives: string[]
  concepts: MathConcept[]
  visuals: VisualAsset[]
  labs: LabConfig[]
  quizzes: QuizItem[]
  misconceptions: Misconception[]
  nextModuleIds: string[]
}

export interface MathConcept {
  id: string
  name: string
  formulaLatex: string
  plainExplanation: string
  geometricIntuition: string
  numericalExample: string
  codeExample?: string
  modelConnection: string
}

export interface VisualAsset {
  id: string
  type: 'manim-video' | 'three-scene' | 'svg' | 'canvas' | 'image'
  title: string
  assetPath?: string
  componentName?: string
  learningPurpose: string
}

export interface LabConfig {
  id: string
  title: string
  type: 'interactive-visual' | 'code' | 'hybrid'
  componentName: string
  successCriteria: string[]
}

export interface QuizItem {
  id: string
  type: 'single-choice' | 'multi-choice' | 'numeric' | 'free-text' | 'drag-drop'
  prompt: string
  answer: unknown
  explanation: string
  misconceptionTags: string[]
}

export interface Misconception {
  id: string
  statement: string
  correction: string
  example: string
}
```

### 7.2 内容文件示例

```yaml
id: matrix-as-transformation
order: 2
title: 矩阵是空间变换
subtitle: 理解 y = Wx + b 背后的几何意义
difficulty: foundation
estimatedMinutes: 45
prerequisites:
  - vector-dot-product
aiModelConnections:
  - linear-layer
  - embedding-projection
  - classifier-boundary
learningObjectives:
  - 解释矩阵如何变换空间
  - 解释神经网络线性层的几何意义
  - 判断一个 2x2 矩阵是否会压缩维度
visuals:
  - id: grid-transform-manim
    type: manim-video
    assetPath: /manim/matrices/grid-transform.mp4
    learningPurpose: 展示矩阵如何改变整个空间
  - id: matrix-transform-three
    type: three-scene
    componentName: MatrixTransformLab
    learningPurpose: 让学生手动修改矩阵并观察网格变化
```

---

## 8. Manim 使用计划

### 8.1 Manim 的职责

Manim 用于制作**精确、可控、可复用的数学动画**，适合解释推导过程和视觉隐喻。

适合用 Manim 的内容：

- 向量点积与投影
- 矩阵变换网格
- PCA 主方向
- 梯度与等高线
- 链式法则与反向传播
- softmax 与 cross entropy
- Attention 公式拆解

不适合完全依赖 Manim 的内容：

- 学生需要实时拖拽参数的实验。
- 需要根据输入即时变化的场景。
- 大量状态交互和个性化反馈。

这些应交给 Three.js、SVG、Canvas 或 Vue 组件。

### 8.2 Manim 资产管线

```text
内容脚本 YAML
    ↓
Manim Scene Python
    ↓
render_all.py 批量渲染
    ↓
生成 mp4 / webm / gif / poster
    ↓
public/manim/*
    ↓
Vue ManimPlayer 组件加载
```

### 8.3 Manim 文件命名规范

```text
scripts/manim/scenes/
├─ 01_vectors/
│  ├─ dot_product_projection.py
│  └─ cosine_similarity.py
├─ 02_matrices/
│  ├─ grid_transform.py
│  └─ low_rank_projection.py
├─ 04_gradients/
│  ├─ tangent_derivative.py
│  └─ contour_gradient.py
└─ 11_attention/
   └─ qkv_attention_flow.py
```

### 8.4 Manim Scene Metadata

每个动画都应配一个 metadata 文件：

```json
{
  "id": "grid-transform",
  "title": "矩阵如何变换二维空间",
  "moduleId": "matrix-as-transformation",
  "durationSeconds": 45,
  "concepts": ["matrix", "linear-transform", "basis-vector"],
  "hasVoiceover": false,
  "poster": "/manim/matrices/grid-transform.poster.png",
  "video": "/manim/matrices/grid-transform.webm"
}
```

---

## 9. Three.js 使用计划

### 9.1 Three.js 的职责

Three.js 用于制作学生可操作的实时交互实验。

适合 Three.js 的内容：

- 3D 向量空间
- 矩阵变换网格
- PCA 点云投影
- loss surface
- 优化轨迹
- 高维 embedding 的降维可视化

不建议用 Three.js 处理的内容：

- 简单二维公式动画。
- 普通流程图。
- 文本密集的计算图。
- attention heatmap 这类矩阵热力图，SVG / Canvas 更轻量。

### 9.2 Vue + Three.js 组件模式

建议所有 Three.js 场景使用统一 shell，避免组件内重复创建 renderer、camera、resize observer 和 dispose 逻辑。

```ts
export interface ThreeSceneController {
  mount: (el: HTMLElement) => void
  update?: (params: unknown) => void
  dispose: () => void
}
```

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { ThreeSceneController } from '../types/mathLab'

const props = defineProps<{
  controller: ThreeSceneController
  params?: unknown
}>()

const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (containerRef.value) props.controller.mount(containerRef.value)
})

watch(
  () => props.params,
  value => props.controller.update?.(value),
  { deep: true }
)

onBeforeUnmount(() => {
  props.controller.dispose()
})
</script>

<template>
  <div ref="containerRef" class="three-scene-shell" />
</template>
```

### 9.3 性能要求

- Three.js 场景必须在组件卸载时释放 geometry、material、texture、renderer。
- 移动端默认降低粒子数量和曲面网格分辨率。
- 对 loss surface、PCA 点云等复杂场景提供 “性能模式”。
- 所有交互控件应有非 3D fallback，例如 SVG 静态示意图。

---

## 10. Image Gen Skill 使用计划

### 10.1 图像资产类型

Image Gen Skill 用于生成非交互、非精确推导类视觉资产。

适合生成：

- 模块封面图
- 概念隐喻图
- 学习路径地图
- 课程插画
- 空状态图
- 成就徽章
- 章节缩略图

不适合生成：

- 精确坐标图
- 严格数学图形
- 需要完全准确公式的图片
- 需要可访问文本的长图

这些应使用 SVG、Manim 或浏览器渲染。

### 10.2 统一视觉风格

建议风格关键词：

```text
clean educational illustration, soft gradient, geometric shapes, minimal, modern web UI, mathematical diagrams, clear negative space, high readability
```

### 10.3 Prompt 模板

#### 向量模块封面

```text
Create a clean educational illustration for a math learning module about vectors as direction and magnitude. Show arrows in a 3D coordinate space, soft gradient background, geometric minimal style, modern AI education website, no text, high readability, balanced composition.
```

#### 矩阵模块封面

```text
Create a modern educational illustration showing a square grid being transformed by a matrix into a skewed and stretched grid. Use clean geometric lines, soft colors, AI learning platform style, no text, no formulas, high clarity.
```

#### 梯度下降模块封面

```text
Create an educational illustration of a small sphere descending on a smooth loss landscape toward a valley. Minimal 3D geometry, soft light, modern web education style, no text, no formulas.
```

#### Attention 模块封面

```text
Create a clean visual metaphor for transformer attention. Show tokens as glowing nodes connected by weighted lines, with one node attending more strongly to selected nodes. Modern AI education website style, no text, no formulas.
```

---

## 11. Codex 使用计划

### 11.1 Codex 的职责

Codex 用于加速工程实现，但不直接替代教学设计。建议让 Codex 执行明确、可测试、边界清晰的任务：

- 根据 spec 创建 Vue 组件。
- 为 Three.js 实验补齐 dispose 和 resize 逻辑。
- 为内容 schema 写 TypeScript 类型和校验。
- 为 quiz 判分逻辑写单元测试。
- 将重复页面抽象为通用组件。
- 根据设计稿生成初版页面布局。
- 审查数学公式展示和代码实验的一致性。

### 11.2 Codex 工作方式

推荐使用分支 / worktree 粒度拆任务：

```text
branch: feature/math-lab-shell
branch: feature/vector-dot-product-lab
branch: feature/matrix-transform-lab
branch: feature/manim-player
branch: feature/quiz-engine
branch: feature/progress-tracking
```

每个任务都提供：

```text
背景
目标
文件范围
输入输出
验收标准
测试要求
不要改动的文件
```

### 11.3 Codex Prompt 模板

#### 组件生成任务

```text
你正在为 Vue 3 + TypeScript 项目实现 Math Intuition Lab。

目标：实现 MatrixTransformLab.vue。

要求：
1. 使用已有 ThreeSceneShell.vue。
2. 支持输入 2x2 矩阵 a,b,c,d。
3. 实时展示 determinant、是否可逆、基向量变换结果。
4. Three.js 场景必须在组件卸载时释放资源。
5. 移动端提供低分辨率网格。
6. 添加 Vitest 单元测试，覆盖 determinant 和 matrix-vector multiply。

限制：
- 不要修改全局路由。
- 不要引入未批准的新 UI 框架。
- 不要把数学计算写死在组件模板中，应抽到 utils/matrix.ts。

完成后请输出：
- 改动文件列表
- 测试命令
- 关键实现说明
```

#### 代码审查任务

```text
请审查 src/modules/math-lab/labs/gradient-descent 下的实现。

重点检查：
1. 数学计算是否正确。
2. 学习率改变后轨迹是否正确重算。
3. Three.js 资源是否完整 dispose。
4. 是否存在移动端性能问题。
5. 组件是否有无障碍替代说明。
6. 是否有足够单元测试。

请按严重程度输出：Blocker / Major / Minor / Suggestion。
```

#### 内容一致性任务

```text
请检查 content/math-lab/modules/*.yaml 中的公式、plainExplanation、codeExample 是否一致。

重点：
1. 公式中的变量名是否与代码一致。
2. plainExplanation 是否避免误导性类比。
3. quiz answer 是否能从课程内容推导出来。
4. misconception 标签是否覆盖常见错误。

请输出每个模块的问题和建议改法。
```

---

## 12. 交互实验清单

| 实验 ID | 名称 | 技术 | 对应数学 | 优先级 |
|---|---|---|---|---|
| `vector-dot-product` | 向量点积实验 | Three.js | 点积、夹角、相似度 | P0 |
| `matrix-transform` | 矩阵变换实验 | Three.js | 线性变换、秩、可逆性 | P0 |
| `gradient-descent` | 梯度下降地形 | Three.js | 梯度、学习率、优化 | P0 |
| `softmax-cross-entropy` | 分类损失调音台 | Vue + SVG | softmax、交叉熵 | P0 |
| `backprop-graph` | 计算图反传 | Vue + SVG | 链式法则、反向传播 | P1 |
| `pca-playground` | PCA 点云投影 | Three.js | PCA、SVD、投影 | P1 |
| `distribution-sampler` | 概率分布采样器 | Canvas | 期望、方差、采样 | P1 |
| `optimizer-race` | 优化器赛跑 | Three.js | SGD、Momentum、Adam | P1 |
| `conv-kernel-board` | 卷积核画板 | Canvas | 卷积、filter、feature map | P2 |
| `attention-heatmap` | Attention 热力图 | SVG / Canvas | QKᵀ、softmax、V 加权 | P2 |

---

## 13. 学生学习体验设计

### 13.1 学习闭环

每节课要求学生完成以下闭环：

```text
看一个 AI 问题
    ↓
学习相关数学概念
    ↓
观看 Manim 动画
    ↓
操作 Three.js / SVG 实验
    ↓
完成代码实验
    ↓
回答 checkpoint
    ↓
得到误区反馈
    ↓
进入下一个概念
```

### 13.2 Checkpoint 类型

| 类型 | 示例 | 目的 |
|---|---|---|
| 概念判断 | “矩阵乘法只是逐元素相乘，对吗？” | 纠正常见误解 |
| 数值计算 | 给定两个向量，计算点积 | 训练基本计算 |
| 视觉判断 | 哪个图表示学习率过大？ | 建立图像直觉 |
| 代码填空 | 补全 `softmax` 函数 | 连接代码实现 |
| 模型诊断 | loss 发散时应该先检查什么？ | 连接训练实践 |

### 13.3 反馈机制

不要只显示“正确 / 错误”。反馈应包含：

```text
你的答案
正确答案
为什么
常见误区
回到哪个动画/实验再看一遍
推荐下一题
```

---

## 14. AI Tutor 设计建议

### 14.1 Tutor 角色

AI Tutor 不应直接替学生完成题目，而应像助教一样给提示。

推荐模式：

```text
第一轮：指出相关概念
第二轮：给一个更小的例子
第三轮：提示公式或代码位置
第四轮：给完整解析
```

### 14.2 Tutor 功能

- “用更简单的话解释这个公式”
- “给我一个二维例子”
- “把这个公式翻译成 NumPy 代码”
- “我为什么错了？”
- “生成 3 道类似练习”
- “根据我的诊断结果推荐复习路线”

### 14.3 Tutor Guardrails

- 学生正在做 graded quiz 时，默认只给提示，不直接给答案。
- 涉及公式推导时，必须逐步解释变量含义。
- 对概率和优化概念，避免过度类比导致误解。
- Tutor 输出必须绑定当前课程内容，不要跳到过深理论。

---

## 15. 评估体系

### 15.1 能力维度

```text
数学符号理解能力
几何直觉能力
数值计算能力
代码实现能力
模型连接能力
训练诊断能力
```

### 15.2 掌握度评分

```ts
interface MasteryScore {
  conceptId: string
  formula: number
  intuition: number
  numerical: number
  code: number
  modelConnection: number
  lastPracticedAt: string
}
```

### 15.3 学生进度页

展示：

- 当前路线进度。
- 已掌握概念。
- 薄弱概念。
- 推荐复习动画。
- 推荐代码实验。
- 下一步项目。

---

## 16. MVP 范围

### 16.1 MVP 必做

第一版不追求完整课程，而要做出“直觉实验室”的差异化体验。

MVP 包含：

1. `/math-lab` 首页。
2. 入门诊断页。
3. 3 个核心课程模块：
   - 向量与点积
   - 矩阵与线性变换
   - 梯度与梯度下降
4. 3 个交互实验：
   - vector-dot-product
   - matrix-transform
   - gradient-descent
5. ManimPlayer 通用组件。
6. ThreeSceneShell 通用组件。
7. CheckpointQuiz 组件。
8. 学习进度本地存储。
9. 课程内容 schema。
10. 基础测试：数学工具函数、quiz 判分、组件渲染。

### 16.2 MVP 暂缓

第一版可以暂不做：

- 完整 AI Tutor。
- 登录系统。
- 教师管理后台。
- 支付系统。
- 多语言。
- 移动端复杂 3D 交互。
- 全套 CNN / Transformer 课程。

---

## 17. 8 周实施里程碑

### Week 1：产品与内容骨架

目标：确定信息架构和内容模型。

任务：

- 创建 `/math-lab` 路由。
- 定义 `MathLabModule` schema。
- 完成课程地图。
- 完成三个 P0 模块的内容大纲。
- 创建基础页面布局。

交付物：

- `MathLabHome.vue`
- `LearningPathPage.vue`
- `mathLab.ts`
- `modules/*.yaml`

---

### Week 2：通用学习组件

目标：搭建课程页基础组件。

任务：

- `ConceptHero.vue`
- `FormulaBlock.vue`
- `ManimPlayer.vue`
- `CodeLab.vue`
- `CheckpointQuiz.vue`
- `MisconceptionCard.vue`

交付物：

- 可渲染一个完整静态课程页。
- 支持公式、代码、视频、quiz。

---

### Week 3：向量模块

目标：实现第一个完整交互模块。

任务：

- Manim：点积与投影动画。
- Three.js：向量拖拽实验。
- Quiz：点积、夹角、cosine similarity。
- Code Lab：NumPy 计算相似度。

验收标准：

- 学生能拖动两个向量并实时看到点积变化。
- 页面能解释 embedding similarity 的意义。
- 至少 5 道 checkpoint。

---

### Week 4：矩阵模块

目标：实现矩阵变换实验。

任务：

- Manim：二维网格变换动画。
- Three.js：矩阵变换 playground。
- 数学工具函数：determinant、matrix-vector multiply、inverse check。
- Model Connection：线性层 `Wx+b`。

验收标准：

- 学生能修改 2x2 矩阵并观察网格变化。
- 页面能解释线性层的几何意义。
- 数学工具函数测试覆盖率达到项目要求。

---

### Week 5：梯度模块

目标：实现梯度和梯度下降。

任务：

- Manim：导数、等高线、梯度方向。
- Three.js：loss surface。
- 交互：学习率、初始点、步数。
- Code Lab：手写一维 / 二维梯度下降。

验收标准：

- 学生能观察学习率过大导致震荡或发散。
- 页面能解释负梯度方向。
- 至少 3 个训练现象诊断题。

---

### Week 6：诊断与进度系统

目标：形成个性化学习入口。

任务：

- 入门诊断题库。
- skill radar。
- progress store。
- localStorage / backend adapter。
- 推荐路径逻辑。

验收标准：

- 学生完成诊断后得到推荐模块。
- 课程完成状态可保存。
- 薄弱概念能映射到复习内容。

---

### Week 7：打磨、可访问性与性能

目标：让体验稳定可用。

任务：

- 移动端适配。
- Three.js 性能模式。
- 视频 poster 和懒加载。
- keyboard navigation。
- reduced motion 支持。
- fallback 静态图。

验收标准：

- 低性能设备可使用核心内容。
- 不支持 WebGL 时仍有静态解释。
- 页面加载和交互性能达标。

---

### Week 8：测试、上线与复盘

目标：发布 MVP。

任务：

- 单元测试。
- E2E 测试。
- 内容校对。
- 数学公式校对。
- 埋点与学习分析。
- 发布检查。

验收标准：

- 三个核心模块可完整学习。
- 诊断、进度、quiz 可正常运行。
- 关键交互实验稳定。
- 有上线后数据指标。

---

## 18. 测试计划

### 18.1 单元测试

重点测试数学工具函数：

```text
dot(a, b)
norm(a)
cosineSimilarity(a, b)
matrixMultiply(A, B)
matrixVectorMultiply(A, x)
determinant2x2(A)
softmax(logits)
crossEntropy(prob, target)
gradientDescentStep(params, grad, lr)
```

### 18.2 组件测试

重点测试：

- 课程页是否正确渲染内容。
- Quiz 是否正确判分。
- 公式组件是否处理无效 LaTeX。
- ManimPlayer 是否正确加载 fallback。
- ThreeSceneShell 是否调用 dispose。

### 18.3 E2E 测试

用户路径：

```text
进入 /math-lab
完成诊断
进入向量模块
观看动画
操作 Three.js 实验
完成 code lab
回答 checkpoint
保存进度
进入下一模块
```

---

## 19. 埋点与学习分析

### 19.1 关键事件

```ts
interface MathLabEvent {
  eventName:
    | 'module_started'
    | 'animation_played'
    | 'lab_interacted'
    | 'quiz_submitted'
    | 'misconception_detected'
    | 'module_completed'
  moduleId: string
  conceptId?: string
  labId?: string
  score?: number
  metadata?: Record<string, unknown>
  timestamp: string
}
```

### 19.2 指标

- 诊断完成率。
- 模块开始率。
- 模块完成率。
- 每个实验平均交互时长。
- checkpoint 正确率。
- 常见误区分布。
- 学生从公式区跳转到动画区的比例。
- 学生从 quiz 错题回看内容的比例。

---

## 20. 设计规范

### 20.1 页面风格

推荐关键词：

```text
clean, focused, scientific, interactive, low cognitive load, high contrast, readable formulas
```

### 20.2 交互原则

- 每个动画旁边都要有一句核心解释。
- 每个 slider 都要显示当前数值。
- 每个公式都要解释变量含义。
- 每个交互实验都要有“重置”按钮。
- 每个复杂实验都要有“引导模式”和“自由探索模式”。

### 20.3 可访问性

- Manim 视频需要文字说明。
- Three.js 场景需要静态 fallback。
- 颜色不能作为唯一信息来源。
- 关键控件支持键盘操作。
- 对动画敏感用户提供 reduced motion。

---

## 21. 风险与应对

| 风险 | 表现 | 应对 |
|---|---|---|
| 视觉很炫但学习效果弱 | 学生只看动画，不理解公式 | 每个动画后必须有 checkpoint |
| 数学内容过难 | 初学者流失 | 每节课设置“先看直觉版 / 再看严谨版” |
| Three.js 性能问题 | 移动端卡顿 | 降低网格、懒加载、fallback |
| Manim 资产维护成本高 | 动画修改困难 | 脚本化渲染、metadata 管理、只做关键动画 |
| AI Tutor 直接给答案 | 学生绕过思考 | 分级提示、graded quiz 限制答案 |
| 公式和代码不一致 | 学生困惑 | 内容 schema 校验 + Codex 审查 + 单元测试 |
| 交互实验过多 | 开发周期失控 | P0/P1/P2 分级，先做 MVP |

---

## 22. Definition of Done

一个数学概念页面完成的标准：

- [ ] 有明确 AI 模型问题入口。
- [ ] 有公式定义。
- [ ] 有变量解释。
- [ ] 有通俗解释。
- [ ] 有 Manim 动画或静态图。
- [ ] 有交互实验或数值实验。
- [ ] 有代码示例。
- [ ] 有至少 3 道 checkpoint。
- [ ] 有常见误区说明。
- [ ] 有模型连接说明。
- [ ] 有移动端可读布局。
- [ ] 有无障碍 fallback。
- [ ] 有内容 schema 校验。
- [ ] 有关键数学函数测试。

---

## 23. 第一批开发任务 Checklist

### 内容

- [ ] 编写向量模块课程文案。
- [ ] 编写矩阵模块课程文案。
- [ ] 编写梯度模块课程文案。
- [ ] 编写诊断题库。
- [ ] 编写 checkpoint 题库。
- [ ] 编写常见误区库。

### 工程

- [ ] 创建 `/math-lab` 路由。
- [ ] 创建课程 schema。
- [ ] 创建内容加载器。
- [ ] 创建 ManimPlayer。
- [ ] 创建 ThreeSceneShell。
- [ ] 创建 FormulaBlock。
- [ ] 创建 CodeLab。
- [ ] 创建 CheckpointQuiz。
- [ ] 创建 progress store。

### 可视化

- [ ] Manim：dot product 动画。
- [ ] Manim：matrix grid transform 动画。
- [ ] Manim：gradient contour 动画。
- [ ] Three.js：vector lab。
- [ ] Three.js：matrix transform lab。
- [ ] Three.js：gradient descent lab。

### 测试

- [ ] dot product 单元测试。
- [ ] cosine similarity 单元测试。
- [ ] determinant 单元测试。
- [ ] gradient descent step 单元测试。
- [ ] quiz scoring 单元测试。
- [ ] route smoke test。
- [ ] ThreeSceneShell dispose test。

---

## 24. 后续扩展路线

### 第二阶段

- softmax + cross entropy 交互实验。
- backprop 计算图实验。
- probability distribution sampler。
- PCA playground。
- AI Tutor 初版。

### 第三阶段

- CNN 数学直觉模块。
- Attention 数学直觉模块。
- Transformer mini lab。
- 从零实现 MLP 项目。
- 教师端学习分析 dashboard。

### 第四阶段

- 个性化推荐系统。
- 多语言课程。
- 学生作品分享。
- 可视化题库编辑器。
- Manim 在线预览 / 自动渲染管线。

---

## 25. 建议的 MVP 成功指标

MVP 上线后，优先观察：

| 指标 | 目标 |
|---|---|
| 诊断完成率 | ≥ 60% |
| 首个模块完成率 | ≥ 40% |
| 交互实验使用率 | ≥ 70% |
| checkpoint 平均正确率 | 60%–85% |
| 错题后回看内容比例 | ≥ 30% |
| 三个核心模块完整完成率 | ≥ 20% |
| 用户主观反馈 | “动画和实验帮助我理解公式” |

checkpoint 正确率不应追求过高。如果长期高于 90%，说明题目太简单；如果低于 50%，说明教学解释不足或题目过难。

---

## 26. 最终建议

这个板块的差异化不在于“多放一些数学公式”，而在于让学生形成稳定的认知路径：

```text
我看到一个模型公式
→ 我知道它对应什么几何图像
→ 我能用代码实现它
→ 我能观察它在训练中造成什么现象
→ 我能诊断模型为什么学不好
```

因此，开发时优先级应始终是：

```text
直觉清晰度 > 交互炫酷程度
学习闭环完整性 > 单点动画精美程度
数学一致性 > 页面数量
可测试性 > 快速堆功能
```

第一版只要把 **向量、矩阵、梯度下降** 三个模块做深做透，就足以证明产品方向。后续再扩展到概率、反向传播、交叉熵、CNN 和 Attention，会自然形成完整的 AI 数学学习体系。

---

## 27. 参考资料依据

本计划参考的官方资料类型：

- Vue TypeScript 官方指南
- Vite 官方指南
- Three.js 官方文档
- Manim Community Edition 官方文档
- OpenAI Codex 官方开发者文档与开源仓库说明

