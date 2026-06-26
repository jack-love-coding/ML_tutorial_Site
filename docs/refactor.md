## 总体判断

以下基于 `main` 分支源码与课程配置，不是正式的学生可用性测试。

你现在最需要的不是继续补课程，而是先建立一套统一的**课程模型和教学主线**。项目当前更像三个逐步独立生长的教学产品：

* Math Lab
* Data Lab
* `/learn/*` 核心实验与算法课程

它们分别有自己的路由、页面模板、进度记录、目录和课程组织方式。README 设想的是一条从数学、数据到模型与深度学习的连续路径，但实际实现已经分裂成三套体系。

项目本身的基础很好：内容覆盖广、数学实验丰富、双语结构完整，而且已经存在像向量拖拽、实时点积和余弦相似度这样的真实交互。 问题主要出在内容增长之后缺少统一治理。

---

## 一、当前最关键的结构问题

| 优先级 | 问题                  | 具体影响                                                                                                     |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| P0  | **课程存在三套信息架构**      | Math、Data、Algorithms 使用不同 URL、页面和进度模型，学生很难理解它们是先后关系、并列专题，还是独立课程。顶部导航也把它们呈现成三个产品。                         |
| P0  | **主线顺序和教学前置关系冲突**   | 当前 `moduleOrder` 把房价项目、分类项目、树模型、CNN、Transformer、LLM/RAG 放在 loss、梯度下降、线性回归和 MLP 之前。                       |
| P0  | **首页同时表达多条互相矛盾的路线** | 首页文案说推荐顺序是 Math → Data → ML Models → Deep Learning，但实际时间线会先走项目、CNN、Transformer、LLM/RAG，之后才回到 Data 和模型基础。 |
| P1  | **进度体系被拆成三份**       | Algorithm、Math、Data 分别使用三个 localStorage key，首页又主要读取 Math 进度，因此不存在真正统一的“继续学习”。                            |
| P1  | **文案缺少单一来源**        | 首页文案同时存在于 `messages.ts` 和组件内部；课程内容又散落在各个 TS/Vue 文件中，容易产生术语漂移和版本不一致。                                      |
| P1  | **部分“实验”实际只是信息切换**  | `AppliedWorkflowLessonLab` 中大量模块只是点击阶段按钮，然后显示另一段静态说明。这属于交互式目录，不属于能验证因果关系的学习实验。                           |
| P2  | **页面实现开始难以扩展**      | `AlgorithmView.vue` 通过大量 `isXxxPage` 判断分发页面，只给部分模块提供 chapter URL。新增课程会继续增加条件分支。                          |

还有一个明显的内容治理信号：README 仍然把 CNN、Attention、Transformer 和优化器对比描述为“后续扩展”，但这些课程已经进入模块目录。

---

## 二、建议重新定义产品结构

建议将项目明确定位为：

> **面向初学者的“机器学习基础 → 深度学习核心 → 专项应用”可视化课程。**

经典机器学习不是与深度学习并列的巨大板块，而是理解深度学习训练机制所需的前置层。

### 新的一级结构

```text
首页
├─ 核心学习路径
│  ├─ 基础准备
│  ├─ 模型如何学习
│  ├─ 神经网络核心
│  └─ 深度学习专项
├─ 专题知识库
│  ├─ 数学
│  ├─ 数据
│  └─ 模型与训练
├─ 项目实战
└─ 学习进度
```

顶部导航建议缩减成：

1. **学习路径**
2. **专题库**
3. **项目实战**
4. **我的进度**

Math Lab 和 Data Lab 保留为专题库中的分类，而不是两个独立产品。

---

## 三、建议的核心教学主线

### 阶段 A：先建立共同语言

1. **AI 与机器学习地图**

   * 输入、目标、模型、反馈、泛化
   * 监督、无监督和生成式任务的区别

2. **数据、向量与张量**

   * 表格如何变成特征向量
   * sample、feature、batch、shape
   * train / validation / test

3. **第一个小型学习闭环**

   * 数据 → 预测 → 误差 → 调整
   * 这里使用极简演示，不直接进入完整房价项目

### 阶段 B：模型为什么能学会

4. **线性回归、残差与损失**
5. **梯度与梯度下降**
6. **逻辑回归、概率和分类阈值**
7. **泛化、正则化与模型选择**

完成这一阶段后，再开放房价预测和垃圾邮件分类项目。项目应当是阶段总结，而不是前置知识。

### 阶段 C：进入神经网络

8. **MLP 前向传播与激活函数**
9. **链式法则、反向传播与自动微分**
10. **训练诊断、优化器与正则化**

### 阶段 D：专项路线

* **视觉路线**：Tensor shape → 卷积 → CNN
* **序列路线**：Embedding → Attention → Transformer
* **生成式应用路线**：Token → Retrieval → RAG
* **数学加深路线**：SVD、PCA、条件数、数值计算

31 章 Math Lab 不应成为所有人的完整前置课程。更适合采用“即时补充”：

* 学线性模型前补向量和矩阵；
* 学梯度下降前补导数和梯度；
* 学逻辑回归前补概率和对数；
* 学 Attention 前补点积、softmax 和矩阵 shape。

你现有的 Math 数据结构已经包含 `prerequisites`、难度、时间、实验、测验和下一课关系，非常适合作为统一课程模型的基础。

---

## 四、首页应该怎样收敛

当前首页同时展示全部模块、Math 路线、超长时间线和 readiness checks，功能太多，学生无法判断第一步。

建议首页只承担四件事：

### 首屏

* 新学生：**用 5 分钟定位起点**
* 老学生：**继续上次学习**
* 显示一个明确的推荐下一课
* 不展示全部模块

### 第二屏：选择路线

只展示三个入口：

* 零基础核心路径
* 深度学习核心路径
* 数学专题加深

### 第三屏：学习进度

统一显示：

* 当前阶段
* 已完成课时
* 最近薄弱概念
* 推荐复习内容

### 第四屏：探索专题

这里再展示 Math、Data、Models、Projects 分类。

这样首页是“决策界面”，而不是课程内容总目录。

---

## 五、文案需要从“作者说明”改成“学生任务”

目前部分正文会直接出现 `Ref ID`，或者把“插图与动画”“交互实验设计”作为学生正文标题。  这些内容更像课程设计稿，不应进入主要阅读流。

### 建议统一每课的文案模板

```text
1. 这节课要解决什么问题
2. 先做一个预测
3. 建立一个核心直觉
4. 完成一个手算例子
5. 解读公式中的每个变量
6. 操作实验并记录现象
7. 解释为什么会出现这个现象
8. 识别一个常见误解
9. 完成 checkpoint
10. 连接到下一课
```

### 以梯度下降为例

不要在正文里写：

> 使用某个预设，观察轨迹如何变化。

应直接变成实验任务：

```text
先预测
把学习率从 0.2 提高到 0.8，轨迹会更快到达最低点，还是开始震荡？

操作
只改变学习率，锁定起点和批量模式。

观察
记录最终 loss、越过谷底的次数和轨迹长度。

解释
为什么更大的单步速度不一定意味着更快收敛？
```

### 首页文案示例

**标题**

> 看见神经网络怎样从误差中学会

**副标题**

> 从张量、损失和梯度到 CNN 与 Attention，每一课都让你先预测、再操作、最后解释模型行为。

这比“系统入门 ML / AI”更具体，也更符合项目最有辨识度的能力。

---

## 六、重新定义什么是“有效交互”

建议把交互分为五级：

| 级别 | 形式             | 是否适合核心课程 |
| -- | -------------- | -------- |
| 1  | 展开、切换标签、查看说明   | 只能用于导航   |
| 2  | 动画或视频播放        | 用于建立直觉   |
| 3  | 操纵变量并看到结果变化    | 基础实验     |
| 4  | 带目标和限制条件的挑战    | 核心学习活动   |
| 5  | 提交解释、保存证据、获得诊断 | 掌握度评估    |

当前向量实验已经达到第 3 级，但还可以增加“预测”和“解释”。而大量 workflow tabs 仍停留在第 1 级。

### 可优先升级的实验

* **梯度下降**：在不震荡的前提下找到最大的安全学习率。
* **数据处理**：排列正确的 split、fit、transform 顺序，系统指出泄漏位置。
* **分类阈值**：在 recall 不低于指定值的情况下最大化 precision。
* **CNN**：先预测输出 shape 和参数量，再运行卷积验证。
* **Attention**：先预测某个 token 会关注谁，再查看 attention matrix。
* **RAG**：调整 chunk size 和 top-k，区分 retrieval failure 与 generation failure。

每个实验至少应有：

```text
learningGoal
predictionPrompt
manipulableVariables
observableMetrics
successCriteria
reflectionPrompt
evidence
```

Math Lab 已经有 `successCriteria` 和实验 evidence 类型，可以扩展成全站统一协议。

---

## 七、技术重构方向

### 1. 建立唯一课程目录

```ts
interface CourseModule {
  id: string
  domain: 'foundation' | 'math' | 'data' | 'model' | 'deep-learning' | 'project'
  level: 'beginner' | 'intermediate' | 'advanced'
  title: LocalizedCopy
  summary: LocalizedCopy
  estimatedMinutes: number
  prerequisiteIds: string[]
  outcomeIds: string[]
  lessons: Lesson[]
  relatedModuleIds: string[]
}
```

导航、首页卡片、上一课、下一课、学习路线都从这个 catalog 派生，不再分别手写。

### 2. 使用统一 Lesson Block Renderer

```ts
type LessonBlock =
  | ExplanationBlock
  | WorkedExampleBlock
  | FormulaBlock
  | VisualBlock
  | VideoBlock
  | PredictionBlock
  | LabBlock
  | ReflectionBlock
  | CheckpointBlock
```

这样可以逐步替代 `AlgorithmView.vue` 中不断增加的模块条件分支。

### 3. 统一 URL

建议统一为：

```text
/learn/:moduleId
/learn/:moduleId/:lessonId
/tracks/:trackId
/library/:domain
/progress
```

旧的 `/math-lab/*`、`/data-lab/*` 路径保留 redirect，避免已有链接失效。

### 4. 统一进度模型

```ts
interface LearningProgressV2 {
  completedLessonIds: string[]
  completedModuleIds: string[]
  quizAttempts: QuizAttempt[]
  labEvidence: LabEvidence[]
  weakConceptTags: string[]
  mastery: MasteryScore[]
  lastVisitedLessonId?: string
}
```

同时编写 migration，把目前三个 v1 storage 数据合并进 v2。

### 5. 内容与界面代码分离

建议目录逐步调整为：

```text
src/
  curriculum/
    catalog.ts
    tracks.ts
    prerequisites.ts
  content/
    ai-overview/
      zh-CN.md
      en.md
  learning/
    progress.ts
    mastery.ts
  lessons/
    LessonPage.vue
    LessonBlockRenderer.vue
  labs/
    registry.ts
```

---

## 八、推荐的实施顺序

### 第一阶段：先停止继续扩课程

* 明确产品定位；
* 定义核心路径；
* 将 advanced、project 和 reference 内容移出主线；
* 建立模块 prerequisite 图。

### 第二阶段：统一课程数据

* 新建 curriculum catalog；
* 从 catalog 生成导航和路线；
* 修正 README；
* 添加课程配置校验测试。

校验至少包括：

* ID 和路由不重复；
* prerequisite 存在且无环；
* 所有主线课程有学习目标、时间和 checkpoint；
* 中英文内容齐全；
* lab、visual、checkpoint 引用有效。

### 第三阶段：改首页和进度

* 首页只展示开始、继续和路线选择；
* 合并三套进度；
* 提供全站推荐下一课；
* 弱项能够跳回具体 lesson，而不是整个 module。

### 第四阶段：统一课程页面

* 建立通用 LessonPage；
* 把特殊组件放入 lab registry；
* 逐步移除 `AlgorithmView.vue` 的 slug 条件分支；
* 所有课时支持独立 URL。

### 第五阶段：重做三门旗舰课程

第一轮不要重写全部内容，先选：

1. AI Overview
2. Gradient Descent
3. MLP / Backprop

把它们做成统一的“预测 → 操作 → 观察 → 解释 → checkpoint”范例，之后再批量迁移其他课程。

最重要的第一轮目标不是页面变得更漂亮，而是让任意一个新学生进入网站后，都能立即回答三个问题：

> 我现在在哪个阶段？
> 我为什么要学这一课？
> 学完以后下一步是什么？
