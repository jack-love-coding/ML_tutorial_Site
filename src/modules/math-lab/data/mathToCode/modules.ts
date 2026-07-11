import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  Misconception,
  QuizItem,
} from '../../types/mathLab.ts'
import { runtimeLessonContent, type RuntimeLessonSection } from './runtimeLessonContent.generated.ts'

function md(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values)
    .replaceAll('\\`', '`')
    .replaceAll('\\\\', '\\')
}
const copy = (zh: string, en: string): LocalizedCopy => ({ 'zh-CN': zh, en })
const section = (id: string, zhTitle: string, enTitle: string, zh: string, en: string, labIds?: string[]): MathLabSection => ({
  id, level: 2, title: copy(zhTitle, enTitle), content: copy(zh, en), ...(labIds ? { labIds } : {}),
})
const variable = (symbol: string, zh: string, en: string) => ({ symbol, description: copy(zh, en) })

const predictionConcept: MathConcept = {
  id: 'function-prediction-mapping',
  name: copy('预测函数与映射', 'Prediction Functions and Mappings'),
  formulaLatex: '\\hat y=w_1x_1+w_2x_2+b',
  variables: [
    variable('x_1,x_2', '当前样本的两个特征。', 'The two features of the current sample.'),
    variable('w_1,w_2', '模型可调整的两个权重。', 'The model’s two adjustable weights.'),
    variable('b', '不依赖特征的偏置。', 'The feature-independent bias.'),
    variable('\\hat y', '模型按当前输入与参数给出的预测。', 'The prediction produced from the current inputs and parameters.'),
  ],
  plainExplanation: copy('函数像一份计算合同：合法输入和当前参数经过固定规则，只产生一个输出。', 'A function is a computation contract: valid inputs and current parameters pass through one fixed rule to produce exactly one output.'),
  geometricIntuition: copy('固定其余量、只改变一个变量时，多输入映射会切成一条可读的曲线。', 'Holding everything else fixed and changing one variable slices a multi-input mapping into a readable curve.'),
  numericalExample: copy('features = [2, 3]、weights = [4, -1]、bias = 5 时，prediction = 10。', 'With features = [2, 3], weights = [4, -1], and bias = 5, prediction = 10.'),
  codeExample: `features = [2, 3]\nweights = [4, -1]\nbias = 5\nprediction = weights[0] * features[0] + weights[1] * features[1] + bias\nprint(prediction)  # 10`,
  modelConnection: copy('训练会调整参数，但每一次前向计算仍是确定的输入—输出映射。', 'Training adjusts parameters, while each individual forward pass remains a deterministic input-output mapping.'),
}

const residualConcept: MathConcept = {
  id: 'prediction-residual-error',
  name: copy('残差与平方误差', 'Residual and Squared Error'),
  formulaLatex: 'r=\\hat y-y,\\qquad \\operatorname{MSE}=\\frac{1}{n}\\sum_{i=1}^{n}(\\hat y_i-y_i)^2',
  variables: [
    variable('y', '数据提供的目标，不参与生成预测。', 'The data-provided target; it does not generate the prediction.'),
    variable('r', '按预测减目标定义的有符号残差。', 'The signed residual, defined as prediction minus target.'),
    variable('n', '参与平均的样本数量。', 'The number of samples included in the average.'),
  ],
  plainExplanation: copy('先完成预测，再与目标比较；平方让正负偏差都形成非负误差。', 'Finish the prediction first, then compare it with the target; squaring turns either residual sign into nonnegative error.'),
  geometricIntuition: copy('误差衡量预测到目标的距离，所以预测更大不等于模型更好。', 'Error measures distance from prediction to target, so a larger prediction is not automatically better.'),
  numericalExample: copy('prediction = 10、target = 9 时，residual = 1，单样本 MSE = 1。', 'When prediction = 10 and target = 9, residual = 1 and the one-sample MSE = 1.'),
  modelConnection: copy('损失为训练提供反馈，但反馈不能偷偷成为本次预测的输入。', 'Loss provides training feedback, but that feedback must not secretly become an input to the current prediction.'),
}

const predictionLab: LabConfig = {
  id: 'prediction-mapping-lab',
  title: copy('单一权重控制实验', 'One-Weight Controlled Experiment'),
  type: 'interactive-visual',
  componentName: 'PredictionMappingLab',
  successCriteria: [
    copy('能说明实验只改变 w1，其余输入、参数与目标固定。', 'Explain that only w1 changes while all other inputs, parameters, and the target stay fixed.'),
    copy('能根据 prediction、residual 与 MSE 判断更大的预测不一定更好。', 'Use prediction, residual, and MSE to show that a larger prediction is not necessarily better.'),
  ],
}

const quiz = (id: string, zhPrompt: string, enPrompt: string, answer: string, choices: Array<[string, string, string]>, zhExplanation: string, enExplanation: string, tag: string, revisitVisualId: string): QuizItem => ({
  id, type: 'single-choice', prompt: copy(zhPrompt, enPrompt), answer,
  choices: choices.map(([choiceId, zh, en]) => ({ id: choiceId, label: copy(zh, en) })),
  explanation: copy(zhExplanation, enExplanation), misconceptionTags: [tag], revisitVisualId,
})

const misconception = (id: string, zhStatement: string, enStatement: string, zhCorrection: string, enCorrection: string, zhExample: string, enExample: string): Misconception => ({
  id, statement: copy(zhStatement, enStatement), correction: copy(zhCorrection, enCorrection), example: copy(zhExample, enExample),
})

const sections: MathLabSection[] = [
  section('opening-question', '1. 开场问题：四行代码做了什么？', '1. Opening Question: What Do Four Lines of Code Do?', md`
先不要运行代码：

\`features = [2, 3]\`，\`weights = [4, -1]\`，\`bias = 5\`，\`prediction = 10\`。

先写下：为什么两个输入得到一个输出？哪些量来自样本，哪些量由模型调整？若只把 \`weights[0]\` 从 4 改成 5，预测如何变化？本课建立可反复核验的链条：**输入与参数 → 明确规则 → 唯一输出 → 与目标比较 → 下一次实验**。练习只用于形成理解，不计分。

### 先作预测

不要只写一个数，请补全两句话：“我认为 \`prediction\` 是 ____，因为 ____”；“若只把第一个权重从 4 改成 5，我认为预测会 ____”。把答案保留到控制变量实验再核对。此时的不确定不是失败，而是后续公式、图像和代码需要解释的对象。

这五个问题会贯穿本课：为什么两个输入汇成一个输出？为什么特征与权重必须按位置一一配对？样本量与模型参数怎样区分？目标何时才能进入计算？数学函数和 Python \`def\` 又有什么边界？模型即使有 billions of parameters，一次前向计算仍遵循同一条输入—规则—输出链。

### 本课怎样学习

每遇到公式，先用自然语言指出输入、参数和输出，再代入数字；每遇到代码，先预测中间变量和 shape，再运行核对；每遇到实验，先写固定量和唯一改变的量，再解释观察。答案折叠前保留自己的第一判断，因为“原先怎样想、证据怎样改变判断”比只抄最终数字更能形成可迁移的理解。本课不要求记忆孤立术语，而要求你能从表、图、公式或代码中的任一种表示重建其余表示。`, md`
Do not run the code yet:

\`features = [2, 3]\`, \`weights = [4, -1]\`, \`bias = 5\`, and \`prediction = 10\`.

First write down: Why do two inputs produce one output? Which quantities come from the sample, and which can the model adjust? If only \`weights[0]\` changes from 4 to 5, how will the prediction change? This lesson builds a reusable audit chain: **inputs and parameters → explicit rule → unique output → comparison with target → next experiment**. The exercises are formative and not graded.

### Make a prediction first

Do not write only a number. Complete two sentences: “I think \`prediction\` is ____, because ____”; and “If only the first weight changes from 4 to 5, I think the prediction will ____.” Keep your answers until the controlled experiment. Uncertainty here is useful evidence about what the formulas, graph, and code still need to explain.

Five questions organize the lesson: Why do two inputs become one output? Why must features and weights pair by position? How do sample values differ from model parameters? When may the target enter the computation? Where do a mathematical function and a Python \`def\` differ? Even a model with billions of parameters still follows the same input-rule-output chain in one forward pass.

### How to study this lesson

For every formula, name inputs, parameters, and output in ordinary language before substituting numbers. For every code block, predict intermediate values and shapes before running it. For every experiment, list fixed quantities and the single changed quantity before explaining the observation. Preserve your initial answer before reading feedback: the change from an initial model to an evidence-based model matters more than copying a final number. The goal is to reconstruct table, graph, formula, and code representations from one another, not memorize isolated terms.`),
  section('prerequisite-recap', '2. 先备知识：代入、坐标与列表', '2. Prerequisites: Substitution, Coordinates, and Lists', md`
### 2.1 代入：名字先占位置

在 $f(x)=2x+1$ 中代入 $x=3$，得到 $f(3)=2\times3+1=7$。同一个输入位置必须始终按同一规则处理；若同样给 $x=3$ 却临时改成 $2x-4$，讨论的已经不是同一个函数。

### 2.2 坐标：一对数记录一次映射

点 $(3,7)$ 依次记录输入和输出。继续计算 $f(0)=1,f(1)=3,f(2)=5$，图连接多个计算结果是为了观察整体趋势，并不会改变规则。读任何函数图都要问横轴是什么输入、纵轴是什么输出、一个点对应哪次计算。

### 2.3 Python 列表：位置属于计算合同

Python 从索引 0 开始。\`features[0] = 2\` 是基础任务数，\`features[1] = 3\` 是提示请求数。它们不是可随意交换的盒子；交换位置会改变权重与特征的配对，数据列顺序因此属于计算协议。

检查：$g(a)=4a-1$ 时 $g(2)=7$。4 和 -1 在比较不同 $a$ 时固定，但“常量、变量、参数”仍取决于当前观察问题。

### 小停顿：位置与语义同时检查

假设数据说明第 0 列是基础任务、第 1 列是提示请求，那么 \`[3, 2]\` 并不等同于 \`[2, 3]\`。数值集合相同，语义顺序却不同。代码运行前先写出“index → meaning”账本；输出异常时也先检查列顺序，而不是立刻修改公式。这里 4 和 -1 是否叫权重，要看它们是不是模型中跨样本保留、可由训练调整的量；不要仅因它们是常数就自动贴上权重标签。`, md`
### 2.1 Substitution: a name reserves a position

Substitute $x=3$ into $f(x)=2x+1$ to obtain $f(3)=2\times3+1=7$. The same input position must always follow the same rule. If the rule silently changes to $2x-4$ for the same $x=3$, we are no longer discussing one function.

### 2.2 Coordinates: one pair records one mapping

The point $(3,7)$ records input first and output second. Computing $f(0)=1,f(1)=3,f(2)=5$ gives more points. Joining them reveals a trend; it does not change the computation. For every graph, ask what the horizontal input is, what the vertical output is, and which calculation one point represents.

### 2.3 Python lists: position belongs to the contract

Python starts at index 0. \`features[0] = 2\` is the number of base tasks, while \`features[1] = 3\` is the number of hint requests. They are not interchangeable boxes. Swapping them changes feature-weight pairing, so column order is part of the data contract.

Check: for $g(a)=4a-1$, $g(2)=7$. The values 4 and -1 stay fixed while comparing different values of $a$, although whether a quantity is called a constant, variable, or parameter still depends on the question being observed.

### Pause: check both position and meaning

If the data contract says column 0 is base tasks and column 1 is hint requests, \`[3, 2]\` is not equivalent to \`[2, 3]\`. The same set of numbers has different ordered meaning. Write an “index → meaning” ledger before running code, and inspect column order before changing a formula when output looks wrong. Whether 4 and -1 are weights depends on whether they are model-owned values retained across samples and adjustable by training—not merely on their being constants in one calculation.`),
  section('shared-prediction-task', '3. 共同预测任务：分清角色', '3. Shared Prediction Task: Separate the Roles', md`
预测对象是小游戏关卡完成时长。$x_1=2$ 个基础任务、$x_2=3$ 次提示请求；$w_1=4$ 分钟/基础任务、$w_2=-1$ 分钟/提示请求、$b=5$ 分钟。模型输出 $\\hat y$，数据提供目标 $y$。

$$\\hat y=w_1x_1+w_2x_2+b=8+(-3)+5=10$$

因此 \`features = [2, 3]\`、\`weights = [4, -1]\`、\`bias = 5\` 产生 \`prediction = 10\` 分钟；\`target = 9\` 分钟只在预测后参与比较。紧凑式 $\\hat y=\\mathbf w^\\mathsf T\\mathbf x+b$ 与纯文本 \`y_hat = w^T x + b\` 表示同一规则。

| 角色 | 数学符号 | Python 名称 | 本课数值 | 来源 |
|---|---|---|---:|---|
| 第 1 特征 | $x_1$ | \`features[0]\` | 2 个基础任务 | 当前样本 |
| 第 2 特征 | $x_2$ | \`features[1]\` | 3 次提示请求 | 当前样本 |
| 权重 | $w_1,w_2$ | \`weights\` | 4 与 -1 | 模型参数 |
| 偏置 | $b$ | \`bias\` | 5 分钟 | 模型参数 |
| 预测 | $\\hat y$ | \`prediction\` | 10 分钟 | 函数输出 |
| 目标 | $y$ | \`target\` | 9 分钟 | 监督反馈 |

帽子符号提醒我们 $\\hat y$ 是估计，$y$ 是已知答案。目标绝不能参与生成这次预测，否则模型像考试时先看标准答案。更完整的记号 $F(\\mathbf x;\\mathbf w,b)=\\hat y$ 用分号区分样本特征与可训练参数；分号本身不是新运算。

### 单位与信息边界

每个乘积都必须能产生“分钟”：$w_1$ 的单位是分钟/基础任务，乘 $x_1$ 的基础任务后剩分钟；$w_2x_2$ 同理；偏置本身也是分钟，三项才能相加。若把没有相容单位的量硬加，数值即使能算也没有任务含义。一次部署预测只拥有 features 与当前 parameters；target 属于事后记录。训练可以用许多历史 target 改善参数，但不能倒流进同一次前向计算。`, md`
The prediction is the completion time of a small game level. Here $x_1=2$ base tasks and $x_2=3$ hint requests; $w_1=4$ minutes/base task, $w_2=-1$ minute/hint request, and $b=5$ minutes. The model produces $\\hat y$, while the data provide target $y$.

$$\\hat y=w_1x_1+w_2x_2+b=8+(-3)+5=10$$

Thus \`features = [2, 3]\`, \`weights = [4, -1]\`, and \`bias = 5\` produce \`prediction = 10\` minutes. The \`target = 9\` minutes enters only after prediction. The compact form $\\hat y=\\mathbf w^\\mathsf T\\mathbf x+b$ and plain text \`y_hat = w^T x + b\` express the same rule.

| Role | Symbol | Python name | Value here | Source |
|---|---|---|---:|---|
| First feature | $x_1$ | \`features[0]\` | 2 base tasks | Current sample |
| Second feature | $x_2$ | \`features[1]\` | 3 hint requests | Current sample |
| Weights | $w_1,w_2$ | \`weights\` | 4 and -1 | Model parameters |
| Bias | $b$ | \`bias\` | 5 minutes | Model parameter |
| Prediction | $\\hat y$ | \`prediction\` | 10 minutes | Function output |
| Target | $y$ | \`target\` | 9 minutes | Supervisory feedback |

The hat symbol marks $\\hat y$ as an estimate, while $y$ is the known answer. The target must not generate this prediction, or the model would be looking at the answer key. The fuller notation $F(\\mathbf x;\\mathbf w,b)=\\hat y$ uses a semicolon to separate sample features from trainable parameters; the semicolon is not a new operation.

### Units and the information boundary

Every product must produce minutes: $w_1$ is minutes per base task, so multiplying by a count of base tasks leaves minutes; $w_2x_2$ works the same way; bias is already measured in minutes. Only compatible quantities may be added. A deployed forward pass owns features and current parameters, while target is an after-the-fact record. Training may use many historical targets to improve parameters, but a target cannot flow backward into the same prediction that it evaluates.`),
  section('mapping-intuition', '4. 映射直觉：有合同的机器', '4. Mapping Intuition: A Machine with a Contract', md`
函数的入口、步骤和出口都应明确。固定参数时，不同输入可以得到同一输出：$F([2,3];[4,-1],5)=10$，$F([1,-1];[4,-1],5)=10$；多对一不违反函数定义，同一组完整输入无缘无故得到两个输出才违反。

把它想成透明机器：features 与 weights 从两个入口进入，内部依次执行“按位置配对 → 相乘 → 求和 → 加 bias”，出口只有一个 prediction。透明意味着每一步都能展开检查，而不是把“模型”当作无需解释的黑箱。只写 $f(\\mathbf x)$ 时，通常暗示参数已经固定；显式写 $F(\\mathbf x;\\mathbf w,b)$ 则把旋钮位置也纳入完整输入合同。

参数像旋钮。只把 $w_1$ 调到 5，$F([2,3];[5,-1],5)=12$。样本没变、规则结构没变，但参数状态变了，因此输出从 10 变成 12。机器学习训练就是利用反馈寻找更合适的旋钮位置。

复杂流程可以由小函数组合：原始记录 $r$ 先经特征函数 $h$ 得到 $\\mathbf x=h(r)$，预测函数 $F$ 产生 $\\hat y$，比较函数 $e$ 最后给出残差。顺序写成

$$r\\xrightarrow{h}\\mathbf x\\xrightarrow{F}\\hat y\\xrightarrow{e(\\cdot,y)}\\hat y-y.$$

比较目标之前必须先有预测，预测之前必须先有特征。函数组合让我们逐段检查复杂系统，而不必一次理解全部。`, md`
A function’s entrance, steps, and exit must be explicit. With parameters fixed, different inputs may share one output: $F([2,3];[4,-1],5)=10$ and $F([1,-1];[4,-1],5)=10$. Many-to-one is valid; one identical complete input producing two unexplained outputs is not.

Think of a transparent machine. Features and weights enter through two labeled ports; inside, the machine performs “pair by position → multiply → sum → add bias”; exactly one prediction leaves the exit. Transparent means every step can be expanded and audited rather than hiding behind the word “model.” Writing only $f(\\mathbf x)$ usually implies fixed parameters; writing $F(\\mathbf x;\\mathbf w,b)$ explicitly includes the knob settings in the complete contract.

Parameters act like knobs. Changing only $w_1$ to 5 gives $F([2,3];[5,-1],5)=12$. The sample and rule structure have not changed, but the parameter state has, so the output moves from 10 to 12. Training uses feedback to search for better knob settings.

Larger workflows compose smaller functions. A feature function $h$ maps raw record $r$ to $\\mathbf x=h(r)$; prediction function $F$ produces $\\hat y$; comparison function $e$ then produces a residual:

$$r\\xrightarrow{h}\\mathbf x\\xrightarrow{F}\\hat y\\xrightarrow{e(\\cdot,y)}\\hat y-y.$$

The order cannot be swapped: comparison needs a prediction, and prediction needs features. Function composition lets us inspect a complex system one contract at a time.`),
  section('formal-definition', '5. 正式定义：定义域、输出与参数', '5. Formal Definition: Domain, Output, and Parameters', md`
函数 $f:A\\to B$ 让定义域 $A$ 中每个合法输入对应陪域 $B$ 中恰好一个输出。$A$ 是定义域，说明允许什么输入；$B$ 是陪域，说明输出的类型或范围；实际产生的输出构成值域，值域包含在陪域中。

本任务可写为 $F:\\mathbb R^2\\times\\mathbb R^2\\times\\mathbb R\\to\\mathbb R$：两个特征、两个权重和一个偏置映射成一个预测。形状账本是 2 个 features、2 个 weights、1 个 bias、1 个 prediction。若 \`features = [2, 3, 8]\` 而 weights 仍只有两个，第三个特征没有权重；这不是“差不多能算”，而是规则没有定义完整。

一次前向计算中所有数值固定；比较样本时固定参数、改变 $\\mathbf x$；控制实验固定 $\\mathbf x,w_2,b,y$，只改变 $w_1$；训练则用样本反馈逐步调整参数。参数并非“永远不变”，而是属于模型、可被训练调整；特征属于样本。说某个量是变量还是常量，必须附带当前观察角度。

多输入函数难直接画在二维纸面。控制变量把它切成一条线：固定 $\\mathbf x=[2,3],w_2=-1,b=5$ 后，$\\hat y(w_1)=2w_1+2$，横轴 $w_1$、纵轴 $\\hat y$。斜率 2 来自当前 $x_1=2$：权重每增 1，对应贡献增 2；截距 2 来自 $w_2x_2+b=-3+5$。这个图只描述当前切片，不代表原函数只有一个输入。`, md`
A function $f:A\\to B$ maps every valid input in domain $A$ to exactly one output in codomain $B$. The domain says which inputs are legal; the codomain states the output type or allowed set; the range is the set of outputs actually produced and lies inside the codomain.

This task can be written $F:\\mathbb R^2\\times\\mathbb R^2\\times\\mathbb R\\to\\mathbb R$: two features, two weights, and one bias map to one prediction. Its shape ledger is 2 features, 2 weights, 1 bias, and 1 prediction. If \`features = [2, 3, 8]\` but there are only two weights, the third feature has no partner. The rule is incomplete, not “close enough to calculate.”

All values are fixed during one forward pass. Comparing samples holds parameters fixed and changes $\\mathbf x$; the controlled experiment fixes $\\mathbf x,w_2,b,y$ and changes only $w_1$; training uses sample feedback to update parameters over time. A parameter is not “unchangeable forever”; it is model-owned and trainable, while a feature belongs to a sample. Calling a quantity variable or constant requires stating the current viewpoint.

A multi-input function is difficult to draw directly on a two-dimensional page. Control creates a slice: fixing $\\mathbf x=[2,3],w_2=-1,b=5$ gives $\\hat y(w_1)=2w_1+2$, with $w_1$ horizontal and $\\hat y$ vertical. Slope 2 comes from current $x_1=2$: increasing the weight by 1 increases its contribution by 2. Intercept 2 comes from $w_2x_2+b=-3+5$. This graph describes one controlled slice, not a claim that the original function has only one input.`),
  section('worked-prediction', '6. 例一：完整手算预测', '6. Example One: A Complete Hand Calculation', md`
先写规则 $\\hat y=w_1x_1+w_2x_2+b$，再对齐 $x_1=2,x_2=3,w_1=4,w_2=-1,b=5$。配对贡献为 $4\\times2=8$ 与 $(-1)\\times3=-3$；相加并补偏置：$8+(-3)+5=10$。

完整手算按五步进行：第一步先写符号规则，防止看到数字就随意拼算式；第二步逐个对齐变量和值，并确认 $x_1$ 配 $w_1$、$x_2$ 配 $w_2$；第三步单独计算每个乘积并保留负号；第四步先汇总特征贡献，再加偏置；第五步在 prediction 完成以后才取出 target。把这五步写开看似更慢，却能把错误定位到配对、符号、求和、偏置或信息边界中的某一层。

三栏账本能防止漏项：第一项 $4\\times2$ 贡献 $+8$；第二项 $(-1)\\times3$ 贡献 $-3$；偏置贡献 $+5$；合计 $8-3+5=10$。负贡献不是删除这一项，而是把预测向下推 3。

预测完成后读取 \`target = 9\`，按本单元约定 $r=\\hat y-y=10-9=1$。正残差表示预测时长高 1 分钟。若采用“目标减预测”的另一约定会得到 -1，两者都可用，但必须声明并保持一致。

### 反向核验

先算 $w_2x_2+b=-3+5=2$，再加第一项 8，仍得 10。两种合法分组给出相同结果，可以抓住负号或漏偏置错误。`, md`
Write the rule $\\hat y=w_1x_1+w_2x_2+b$ before aligning $x_1=2,x_2=3,w_1=4,w_2=-1,b=5$. The paired contributions are $4\\times2=8$ and $(-1)\\times3=-3$; summing them and adding bias gives $8+(-3)+5=10$.

The complete hand calculation has five stages: write the symbolic rule before touching numbers; align each variable and value, pairing $x_1$ with $w_1$ and $x_2$ with $w_2$; calculate each product while preserving its sign; aggregate feature contributions before adding bias; and reveal target only after prediction is complete. Expanding these stages looks slower, but it localizes an error to pairing, sign, reduction, bias, or the information boundary.

A three-column contribution ledger prevents omissions: $4\\times2$ contributes $+8$; $(-1)\\times3$ contributes $-3$; bias contributes $+5$; the total is $8-3+5=10$. A negative contribution is not a deleted term—it pushes the prediction down by 3.

Only after prediction do we read \`target = 9\`. Using this unit’s convention, $r=\\hat y-y=10-9=1$. The positive residual says the predicted duration is one minute high. A “target minus prediction” convention would give -1; either convention can work, but it must be stated and used consistently.

### Cross-check

Group $w_2x_2+b=-3+5=2$ first and then add 8; the result is still 10. Agreement between two legal groupings helps catch a lost negative sign or omitted bias.`),
  section('worked-motion-example', '7. 例二：运动图中的输入与参数', '7. Example Two: Inputs and Parameters in a Motion Graph', md`
辅助例子 $s(t)=s_0+vt$ 中，$t$ 是秒，$s(t)$ 是米，$s_0=2$ 米，$v=3$ 米/秒。于是 $s(4)=2+3\\times4=14$ 米。

| t（秒） | s(t)=2+3t（米） | 从上一秒增加 |
|---:|---:|---:|
| 0 | 2 | — |
| 1 | 5 | 3 |
| 2 | 8 | 3 |
| 3 | 11 | 3 |
| 4 | 14 | 3 |

图上横轴是时间、纵轴是位置；点 $(0,2)$ 表示初始位置，每向右 1 秒向上 3 米，斜率因此是 3。图只是同一张表和公式的视觉表达。

点 $(4,14)$ 必须读成输入 4 秒、输出 14 米。类比的边界要明确：运动例子只有一个时间输入，预测任务有两个特征；$v$ 是带物理单位的速度，$w_1,w_2$ 是模型权重。它们都影响映射行为，却不能被说成完全相同。

| 运动函数 | 预测函数 | 共同思想 |
|---|---|---|
| 时间 $t$ | 特征 $\\mathbf x$ | 送入规则的输入 |
| 速度 $v$、初始位置 $s_0$ | 权重 $\\mathbf w$、偏置 $b$ | 决定映射行为的参数 |
| 位置 $s(t)$ | 预测 $\\hat y$ | 规则产生的输出 |

若只增大 $v$，直线围绕截距改变斜率；若只增大 $s_0$，整条线平移。这个控制变量思路正是实验中固定 $x,w_2,b$、只改 $w_1$ 的准备。坐标顺序始终是“输入在前、输出在后”，不能把 $(4,14)$ 读成 14 秒时位置 4 米。`, md`
In the auxiliary example $s(t)=s_0+vt$, $t$ is measured in seconds, $s(t)$ in metres, $s_0=2$ metres, and $v=3$ metres/second. Therefore $s(4)=2+3\\times4=14$ metres.

| t (seconds) | s(t)=2+3t (metres) | Increase from previous second |
|---:|---:|---:|
| 0 | 2 | — |
| 1 | 5 | 3 |
| 2 | 8 | 3 |
| 3 | 11 | 3 |
| 4 | 14 | 3 |

Time is horizontal and position is vertical. Point $(0,2)$ records the initial position; moving one second right and three metres up gives slope 3. The graph is a visual expression of the same table and formula.

The point $(4,14)$ must be read as input 4 seconds and output 14 metres. The limits of the analogy matter: the motion example has one time input, whereas the prediction task has two features. $v$ is a velocity with physical units; $w_1,w_2$ are model weights. Both affect mapping behavior, but they are not identical quantities.

| Motion function | Prediction function | Shared idea |
|---|---|---|
| Time $t$ | Features $\\mathbf x$ | Input sent into a rule |
| Velocity $v$, initial position $s_0$ | Weights $\\mathbf w$, bias $b$ | Parameters controlling mapping behavior |
| Position $s(t)$ | Prediction $\\hat y$ | Output produced by the rule |

Changing only $v$ changes slope around the same intercept; changing only $s_0$ translates the line. That controlled-variable reasoning prepares us to fix $x,w_2,b$ and change only $w_1$. Coordinates always place input before output: $(4,14)$ cannot mean position 4 at time 14.`),
  section('python-translation', '8. 从公式逐行翻译到 Python', '8. Translate the Formula to Python Line by Line', md`
### 8.1 纯 Python：保留每个中间量

\`\`\`python
features = [2, 3]
weights = [4, -1]
bias = 5
target = 9

contribution_1 = weights[0] * features[0]  # 8
contribution_2 = weights[1] * features[1]  # -3
weighted_sum = contribution_1 + contribution_2  # 5
prediction = weighted_sum + bias  # 10
residual = prediction - target  # 1
\`\`\`

保留中间量让每个数学符号、运算和输出形状都可追踪。

### 8.2 封装函数：把形状合同写进接口

\`\`\`python
def predict_one(features, weights, bias):
    if len(features) != len(weights):
        raise ValueError("features and weights must have the same length")

    weighted_sum = 0
    for feature, weight in zip(features, weights):
        weighted_sum = weighted_sum + feature * weight
    return weighted_sum + bias
\`\`\`

循环先加入 $2\\times4=8$，再加入 $3\\times(-1)=-3$，最后加偏置。长度检查不能省略：Python 的 \`zip\` 会静默截到较短列表（静默截断），让未配对特征悄悄消失，形成“能运行但规则错了”的 failure。

### 8.3 NumPy：紧凑不等于省略理解

\`\`\`python
import numpy as np
features = np.array([2.0, 3.0])
weights = np.array([4.0, -1.0])
bias = 5.0
target = 9.0
print(features.shape, weights.shape)  # (2,) (2,)
contributions = weights * features   # [8, -3]
weighted_sum = weights @ features    # 5
prediction = weighted_sum + bias     # 10
residual = prediction - target       # 1
\`\`\`

\`weights * features\` 仍有两个数；\`contributions.sum()\` 或 \`@\` 才完成汇总。预期一个标量却得到 shape \`(2,)\`，就是映射尚未完成的证据。

\`predict_one(features, weights, bias)\` 应先检查两个列表等长，再逐项乘、求和并加偏置。NumPy 中 \`weights * features\` 只得到 \`[8, -3]\`，仍不是标量；\`weights @ features\` 得到 5，再加偏置得到 10。

### 8.4 数学函数与 Python def 的边界

数学函数强调同一完整输入按确定规则得到同一输出。Python \`def\` 是实现规则的一种程序结构，但也可能读文件、修改全局变量、调用随机数或依赖时间，因此不是每个 \`def\` 都自动满足纯映射。这里的 predict_one 不读取隐藏状态，便于逐项核对公式。调试时应打印 features 的语义顺序、两个列表长度、contributions、weighted_sum、bias 与 prediction；target 和 residual 另起一行。这样能分别定位列错位、zip 截断、漏偏置和目标泄漏，而不是只看到“结果不对”。

逐行模拟循环也很重要：初始 \`weighted_sum = 0\`；第一次 zip 取 feature=2、weight=4，累积变成 8；第二次取 feature=3、weight=-1，累积变成 5；循环结束才加 bias 返回 10。若把 bias 放进循环，它会被重复添加；若在第一次循环就 return，第二个特征永远不会参与；若调换 zip 中变量的语义名称，数值可能暂时相同却让后续维护者误读。代码审查要同时核对控制流、变量语义和数学等式，而不是只看一次输出碰巧正确。`, md`
### 8.1 Pure Python: preserve every intermediate value

\`\`\`python
features = [2, 3]
weights = [4, -1]
bias = 5
target = 9

contribution_1 = weights[0] * features[0]  # 8
contribution_2 = weights[1] * features[1]  # -3
weighted_sum = contribution_1 + contribution_2  # 5
prediction = weighted_sum + bias  # 10
residual = prediction - target  # 1
\`\`\`

Keeping intermediates makes every symbol, operation, and output shape traceable.

### 8.2 Encapsulate the rule: put the shape contract in the interface

\`\`\`python
def predict_one(features, weights, bias):
    if len(features) != len(weights):
        raise ValueError("features and weights must have the same length")

    weighted_sum = 0
    for feature, weight in zip(features, weights):
        weighted_sum = weighted_sum + feature * weight
    return weighted_sum + bias
\`\`\`

The loop adds $2\\times4=8$, then $3\\times(-1)=-3$, and finally bias. The length check is essential: Python \`zip\` silently truncates to the shorter list, so an unpaired feature can disappear in code that runs but implements the wrong rule. That is a genuine failure mode, not a cosmetic warning.

### 8.3 NumPy: compact code must retain the reasoning

\`\`\`python
import numpy as np
features = np.array([2.0, 3.0])
weights = np.array([4.0, -1.0])
bias = 5.0
target = 9.0
print(features.shape, weights.shape)  # (2,) (2,)
contributions = weights * features   # [8, -3]
weighted_sum = weights @ features    # 5
prediction = weighted_sum + bias     # 10
residual = prediction - target       # 1
\`\`\`

\`weights * features\` still contains two values. \`contributions.sum()\` or \`@\` performs the reduction. Expecting a scalar but seeing shape \`(2,)\` is evidence that the mapping is unfinished.

\`predict_one(features, weights, bias)\` should first check equal list lengths, then multiply paired entries, sum them, and add the bias. In NumPy, \`weights * features\` only produces \`[8, -3]\`, which is not yet a scalar. \`weights @ features\` gives 5, and adding the bias gives 10.

### 8.4 Mathematical functions and the boundary of Python def

A mathematical function emphasizes that one complete input follows a deterministic rule to the same output. Python \`def\` is one implementation structure, but it may read files, mutate global state, call randomness, or depend on time; not every \`def\` is automatically a pure mapping. This predict_one reads no hidden state, making formula-to-code auditing possible. A useful debug log records semantic feature order, both lengths, contributions, weighted_sum, bias, and prediction, with target and residual on a separate line. That separates column mismatch, zip truncation, missing bias, and target leakage instead of reporting only “wrong result.”

Simulate the loop line by line: \`weighted_sum\` starts at 0; first zip pair feature=2, weight=4 changes it to 8; second pair feature=3, weight=-1 changes it to 5; bias is added only after the loop to return 10. Putting bias inside the loop adds it repeatedly. Returning during the first iteration silently drops the second feature. Misnaming zip variables may leave this output unchanged while misleading future maintenance. Code review must inspect control flow, variable meaning, and the equation—not only one accidentally correct output.`),
  section('controlled-experiment', '9. 控制变量实验：只改变 w1', '9. Controlled Experiment: Change Only w1', md`
固定 $\\mathbf x=[2,3],w_2=-1,b=5,y=9$，**只改变 $w_1$**，因此 $\\hat y=2w_1+2$。$w_1=2,3,4,5,6$ 时，预测依次为 $6,8,10,12,14$；残差为 $-3,-1,1,3,5$；平方误差为 $9,1,1,9,25$。$w_1=3.5$ 时预测恰好为 9。

| w1 | prediction | residual | squared error |
|---:|---:|---:|---:|
| 2 | 6 | -3 | 9 |
| 3 | 8 | -1 | 1 |
| 4 | 10 | 1 | 1 |
| 5 | 12 | 3 | 9 |
| 6 | 14 | 5 | 25 |

\`\`\`python
for candidate_w1 in [2, 3, 4, 5, 6]:
    candidate_weights = [candidate_w1, weights[1]]
    prediction = predict_one(features, candidate_weights, bias)
    residual = prediction - target
    squared_error = residual ** 2
    print(candidate_w1, prediction, residual, squared_error)
\`\`\`

\`candidate_weights\` 每轮只替换第 0 项；features、$w_2$、bias 和 target 都固定。这是把输出差异归因于 $w_1$ 的前提。$w_1$ 每增加 1，$\\Delta\\hat y=x_1\\Delta w_1=2$；这还是有限变化，不是导数。

观察 prediction 与误差必须分开：从 $w_1=2$ 到 3，prediction 从 6 接近 target 9，平方误差从 9 降到 1；从 3 到 4，prediction 越过目标但距离仍为 1；继续到 6，prediction 升到 14，误差反而增至 25。参数更大没有天然好坏，评价取决于目标与损失定义。

若只要求当前样本恰好命中目标，可解 $2w_1+2=9$，得到 $w_1=3.5$。代回得 $2\\times3.5+2=9$。但真实训练同时面对多个样本；让一个样本残差为零不等于有良好 generalization，也不构成“训练完成”的证据。

### 实验记录怎样可复查

一次可信的控制实验应记录四类信息：固定项（features、$w_2$、bias、target）、候选参数序列、每个候选值对应的 prediction/residual/squared error，以及观察结论。重置不是装饰：它把状态恢复到共同基线 $w_1=4$，让两位学习者能从同一行重新比较。滑块限制在有限范围并按 0.5 对齐，是为了避免 NaN、Infinity 或极端数值遮蔽当前教学问题；这些边界不表示真实模型权重只能落在该区间。表格与读数是实验的事实层，解释“为什么先降后升”才是推理层，两者不能混为一条结论。

### 形成性反馈

- 若认为 $w_1$ 从 4 到 5 只让预测增加 1，回看固定的 $x_1=2$，所以 $\\Delta\\hat y=2\\Delta w_1$。
- 若认为预测越大越好，回看目标 9：误差读的是距离。
- 若 $w_1=2$ 算出 0，检查偏置 $+5$ 与负号。

实验下方的表格保留所有结果，即使关闭动画或启用 reduced motion，教学信息也不会丢失。`, md`
Fix $\\mathbf x=[2,3],w_2=-1,b=5,y=9$ and **change only $w_1$**, so $\\hat y=2w_1+2$. For $w_1=2,3,4,5,6$, predictions are $6,8,10,12,14$; residuals are $-3,-1,1,3,5$; squared errors are $9,1,1,9,25$. At $w_1=3.5$, the prediction is exactly 9.

| w1 | Prediction | Residual | Squared error |
|---:|---:|---:|---:|
| 2 | 6 | -3 | 9 |
| 3 | 8 | -1 | 1 |
| 4 | 10 | 1 | 1 |
| 5 | 12 | 3 | 9 |
| 6 | 14 | 5 | 25 |

\`\`\`python
for candidate_w1 in [2, 3, 4, 5, 6]:
    candidate_weights = [candidate_w1, weights[1]]
    prediction = predict_one(features, candidate_weights, bias)
    residual = prediction - target
    squared_error = residual ** 2
    print(candidate_w1, prediction, residual, squared_error)
\`\`\`

Each \`candidate_weights\` changes only index 0; features, $w_2$, bias, and target stay fixed. That is the basis for attributing output differences to $w_1$. Each increase of 1 gives $\\Delta\\hat y=x_1\\Delta w_1=2$. This is a finite change, not yet a derivative.

Prediction and error must be read separately. From $w_1=2$ to 3, prediction moves from 6 toward target 9 and squared error falls from 9 to 1. From 3 to 4, prediction crosses the target but remains one unit away. Continuing to 6 raises prediction to 14 and error to 25. A larger parameter is not intrinsically better; evaluation depends on target and loss definition.

To hit this sample exactly, solve $2w_1+2=9$ to obtain $w_1=3.5$, then verify $2\\times3.5+2=9$. Real training must serve multiple samples. Zero residual on one sample neither proves generalization nor constitutes evidence that training is complete.

### Making the experiment auditable

A trustworthy controlled experiment records four things: fixed values (features, $w_2$, bias, target), candidate parameter sequence, prediction/residual/squared error for every candidate, and the resulting observation. Reset is not decoration: it restores shared baseline $w_1=4$ so learners can restart from the same row. The finite range and 0.5 grid prevent NaN, Infinity, or extreme values from obscuring this lesson; they do not claim real weights are restricted to that interval. Tables and readouts form the fact layer, while explaining why error first falls and then rises is the reasoning layer. Do not collapse those layers into one assertion.

### Formative feedback

- If you expected changing $w_1$ from 4 to 5 to add only 1, revisit fixed $x_1=2$: $\\Delta\\hat y=2\\Delta w_1$.
- If you expected a larger prediction to be better, revisit target 9: error measures distance.
- If you obtained 0 at $w_1=2$, check bias $+5$ and the negative sign.

The table below the experiment preserves every result, so no teaching information is lost when animation is disabled or reduced motion is enabled.`, ['prediction-mapping-lab']),
  section('misconceptions', '10. 常见误区与修复', '10. Common Misconceptions and Repairs', md`
### 误区一：负权重表示特征无效

**为什么容易发生：**日常语言把“负面”理解为坏或没用。**本例诊断：**删除 $(-1)\\times3=-3$ 会把预测从 10 错算成 13。**正确理解：**符号描述其他量固定时的影响方向。**修复动作：**写贡献账本，并只把 $x_2$ 增加 1 检查预测方向。

### 误区二：目标 9 应放进预测函数

**为什么容易发生：**题目给出的所有数字似乎都该代入。**本例诊断：**部署新样本时目标未知；依赖目标的程序无法预测。**正确理解：**$y$ 是预测后的监督反馈。**修复动作：**先完成 \`prediction = predict_one(...)\`，下一行才计算 residual。

### 误区三：weights * features 已是预测

**为什么容易发生：**NumPy 会顺利返回数组。**本例诊断：**结果是 shape \`(2,)\` 的 \`[8, -3]\`，不是标量。**正确理解：**配对相乘、汇总、加偏置缺一不可。**修复动作：**打印 contributions、weighted_sum、prediction 的值与 shape。

### 误区四：函数就是直线

**为什么容易发生：**初学代数最常见一次函数。**本例诊断：**平方、分段函数和图像模型也能满足唯一输出。**正确理解：**函数条件是合法完整输入对应唯一输出。**修复动作：**先检查映射合同，再讨论图形；本实验仅因切片为 $2w_1+2$ 才是直线。

### 统一诊断顺序

遇到错误结果，不要同时改多个数。先确认任务对象与单位，再确认变量角色和列顺序；接着检查 features/weights 长度、逐项贡献的符号、是否完成求和、是否加 bias；最后检查 target 是否只在 prediction 之后出现。每修复一步都用原始算例重跑：contributions 应为 [8,-3]，weighted_sum 为 5，prediction 为 10，residual 为 1。若中间值正确而最终值错误，问题一定出在后续边界，不必重写前面已经验证的部分。`, md`
### Misconception one: a negative weight makes a feature useless

**Why it seems plausible:** everyday language treats “negative” as bad or empty. **Diagnosis in this example:** deleting $(-1)\\times3=-3$ changes prediction from 10 to an incorrect 13. **Correct model:** the sign describes effect direction with other values fixed. **Repair action:** keep a contribution ledger and increase only $x_2$ by 1 to inspect direction.

### Misconception two: target 9 belongs inside prediction

**Why it seems plausible:** every number in a problem appears available for substitution. **Diagnosis in this example:** a deployed sample has no known target, so target-dependent code cannot predict it. **Correct model:** $y$ is supervision after prediction. **Repair action:** finish \`prediction = predict_one(...)\` first and compute residual on the next line.

### Misconception three: weights * features is already the prediction

**Why it seems plausible:** NumPy returns an array without an error. **Diagnosis in this example:** result \`[8, -3]\` has shape \`(2,)\`, not the required scalar. **Correct model:** paired multiplication, reduction, and bias are three distinct steps. **Repair action:** print values and shapes for contributions, weighted_sum, and prediction.

### Misconception four: every function is a line

**Why it seems plausible:** introductory algebra emphasizes linear functions. **Diagnosis in this example:** squares, piecewise rules, and image models can still give one output per valid input. **Correct model:** the defining condition is a unique output for each complete legal input. **Repair action:** check the mapping contract before graph shape; this slice is a line only because it is $2w_1+2$.

### One diagnostic order

When output is wrong, do not change several numbers at once. Confirm task object and units, then variable roles and column order; inspect feature/weight lengths, signs of paired contributions, reduction, and bias; finally verify that target appears only after prediction. Re-run the canonical example after each repair: contributions must be [8,-3], weighted_sum 5, prediction 10, and residual 1. If intermediates are correct but the final value is wrong, investigate the later boundary rather than rewriting already verified steps.`),
  section('layered-practice', '11. 三层练习：解释、手算、观察', '11. Three-Layer Practice: Explain, Calculate, Observe', md`
这些练习用于形成理解，不计分，也不作为课程完成证据。每题先写“我依据哪条规则”，再看提示与参考推理。

### 第一层：概念辨析

**练习 1A** 把 features、weights、bias、prediction、target 分为样本输入、模型参数、函数输出或监督反馈。

**提示：**问部署新样本时每个量从哪里来。

**参考推理：**features 来自样本；weights 与 bias 属于模型参数；prediction 是输出；target 是预测后使用的监督反馈，不能进入 predict_one。

[回看：共同预测任务](#shared-prediction-task)

**练习 1B** 两个不同输入都得到 prediction = 10，这仍是函数吗？

**提示：**区分“多个输入到同一输出”和“同一完整输入到多个输出”。

**参考推理：**仍是函数。函数允许多对一，只要求固定参数时每个完整合法输入有唯一输出。

[回看：映射直觉](#mapping-intuition)

**练习 1C** 有人说训练会改变权重，所以预测规则不是函数。怎样回应？

**提示：**分别考虑一次前向计算与训练中的多个参数状态。

**参考推理：**每次前向计算的输入和当前参数确定，输出唯一；训练只是依次考察参数不同的映射状态。

[回看：正式定义](#formal-definition)

### 第二层：手算与读码

**练习 2A** 保持 features 与 weights 不变，只把 bias 从 5 改成 2，计算 prediction 与 residual。

**提示：**两项特征贡献仍是 8 与 -3。

**参考推理：**加权和仍为 5，新 prediction = 7，residual = 7 - 9 = -2；偏置减少 3，预测也减少 3。

[回看：完整手算](#worked-prediction)

**练习 2B** 阅读 \`return [feature * weight for feature, weight in zip(features, weights)]\`，指出返回形状与逻辑缺口。

**提示：**用 [2,3] 与 [4,-1] 代入，再与一个标量预测比较。

**参考推理：**返回 [8,-3]，既没有求和也没有加 bias，还缺长度检查；zip 可能静默截断。应检查长度后使用 sum(...) + bias。

[回看：Python 翻译](#python-translation)

**练习 2C** 不运行程序，补全 $w_1=3,3.5,4$ 的 prediction。

**提示：**先化简为 $2w_1+2$。

**参考推理：**结果依次为 8、9、10。3.5 只让当前样本命中目标，不能证明对所有样本最好。

[回看：控制实验](#controlled-experiment)

### 第三层：开放观察

**练习 3A** 画出 $x_1=2$ 时的 $2w_1+2$，再只把 $x_1$ 改为 1 画第二条线。

**提示：**第二条线先独立化简，不要同时修改其他数字。

**参考推理：**第二条线为 $w_1+2$。两条截距同为 2，斜率分别为 2 和 1，说明特征值决定预测对对应权重的敏感程度。

[回看：控制实验](#controlled-experiment)

**练习 3B** 为运动函数选择另一组 $s_0,v$，只改 $v$ 后再恢复并只改 $s_0$。

**提示：**速度控制相邻位置差，初始位置控制 $t=0$ 的起点。

**参考推理：**改变 $v$ 改变斜率；改变 $s_0$ 让整条线平移但斜率不变。记录选择的数值与固定量，而不只说“图变了”。

[回看：运动图](#worked-motion-example)

**练习 3C** 设计最小调试日志，区分特征顺序错位、漏加偏置、把目标放进预测。

**提示：**至少记录名称、长度或 shape、逐项贡献、加权和、偏置和最终预测；目标单独记录。

**参考推理：**依次打印 features 的语义顺序、weights、长度、contributions、weighted_sum、bias、prediction，最后另行打印 target 与 residual。配对不同定位顺序错误；加权和正确却少 5 定位偏置；预测表达式出现 target 定位信息泄漏。

[回看：Python 翻译](#python-translation)`, md`
These exercises are formative, not graded, and not evidence of course completion. For each one, state the rule you used before opening the hint and reference reasoning.

### Layer one: concept distinctions

**Exercise 1A** Classify features, weights, bias, prediction, and target as sample input, model parameter, function output, or supervisory feedback.

**Hint:** Ask where each value comes from when predicting a new deployed sample.

**Reference reasoning:** Features come from the sample; weights and bias are model parameters; prediction is the output; target is supervisory feedback used after prediction and must not enter predict_one.

[Review: shared prediction task](#shared-prediction-task)

**Exercise 1B** If two different feature inputs both produce prediction = 10, is the rule still a function?

**Hint:** Separate many inputs sharing one output from one complete input producing several outputs.

**Reference reasoning:** Yes. A function may be many-to-one; it requires one unique output for each complete legal input when parameters are fixed.

[Review: mapping intuition](#mapping-intuition)

**Exercise 1C** Someone claims that training changes weights, so the prediction rule is not a function. How do you respond?

**Hint:** Separate one forward pass from multiple parameter states during training.

**Reference reasoning:** Inputs and current parameters are fixed in each forward pass, so output is unique. Training simply visits a sequence of mappings with different parameter states.

[Review: formal definition](#formal-definition)

### Layer two: calculation and code reading

**Exercise 2A** Keep features and weights fixed, change only bias from 5 to 2, and compute prediction and residual.

**Hint:** The two feature contributions remain 8 and -3.

**Reference reasoning:** Weighted sum stays 5; prediction becomes 7 and residual is $7-9=-2$. Reducing bias by 3 reduces prediction by 3.

[Review: complete hand calculation](#worked-prediction)

**Exercise 2B** Read \`return [feature * weight for feature, weight in zip(features, weights)]\` and identify its output shape and missing logic.

**Hint:** Substitute [2,3] and [4,-1], then compare the result with the required scalar prediction.

**Reference reasoning:** It returns [8,-3], neither sums nor adds bias, and lacks a length check. zip may silently truncate. Validate length, then use sum(...) + bias.

[Review: Python translation](#python-translation)

**Exercise 2C** Without running code, complete predictions for $w_1=3,3.5,4$.

**Hint:** Simplify the rule to $2w_1+2$ first.

**Reference reasoning:** The outputs are 8, 9, and 10. A value of 3.5 fits this sample but does not prove it is best for all samples.

[Review: controlled experiment](#controlled-experiment)

### Layer three: open observation

**Exercise 3A** Plot $2w_1+2$ for $x_1=2$, then change only $x_1$ to 1 and plot the second line.

**Hint:** Simplify the second rule independently; do not change any other number.

**Reference reasoning:** The second line is $w_1+2$. Both intercepts are 2, while slopes are 2 and 1. Feature value controls sensitivity to its corresponding weight in this rule.

[Review: controlled experiment](#controlled-experiment)

**Exercise 3B** Choose new $s_0,v$ for the motion function; change only $v$, then restore it and change only $s_0$.

**Hint:** Velocity controls successive position differences; initial position controls the value at $t=0$.

**Reference reasoning:** Changing $v$ changes slope. Changing $s_0$ translates the line without changing slope. Record chosen numbers and fixed quantities, not merely “the graph changed.”

[Review: motion graph](#worked-motion-example)

**Exercise 3C** Design a minimal debug log that distinguishes feature-order mismatch, missing bias, and target leakage into prediction.

**Hint:** Record names, lengths or shapes, paired contributions, weighted sum, bias, and final prediction; log target separately.

**Reference reasoning:** Print semantic feature order, weights, lengths, contributions, weighted_sum, bias, and prediction, then target and residual on a separate line. Wrong pairing reveals order; a correct weighted sum but missing 5 reveals bias; target inside the prediction expression reveals leakage.

[Review: Python translation](#python-translation)`),
  section('lesson-handoff', '12. 小结与向量课 handoff', '12. Summary and Handoff to the Vector Lesson', md`
本课已把合法输入、确定规则、唯一输出和监督反馈分开。四件可观察的事是：解释函数不等于直线；区分 feature、weight、bias、prediction 与 target；逐项重建 $8+(-3)+5=10$；把公式翻译成带长度、shape 和中间贡献检查的代码。

你应能重建 $\\hat y=w_1x_1+w_2x_2+b$，用 \`features = [2, 3]\`、\`weights = [4, -1]\`、\`bias = 5\` 算出 \`prediction = 10\`，再与 \`target = 9\` 得到残差 1。

下一课直接接收 $\\mathbf x=[2,3]$ 与 $\\mathbf w=[4,-1]$，解释顺序、维度、方向，以及为何 $\\mathbf w^\\mathsf T\\mathbf x=4\\times2+(-1)\\times3=5$ 称为点积。handoff 卡：样本向量候选 \`x = [2, 3]\`，权重向量候选 \`w = [4, -1]\`，\`w^T x = 4*2 + (-1)*3 = 5\`，\`y_hat = 5 + 5 = 10\`，\`residual = 10 - 9 = 1\`。

带走三个未决问题：为什么一组有序特征可以当作一个整体向量？为什么顺序、维度、方向与大小都会影响表示？为什么 $4\\times2+(-1)\\times3$ 不只是“两个乘法加起来”，还可以解释为沿权重方向读取样本？能不看答案重建 handoff 卡，并逐行说出输入、规则、输出和单位，就说明本课已为向量课准备好稳定输入。若仍会把 target 塞回 prediction，或把 [8,-3] 当作最终输出，应先沿回看链接重新做 1A、2B 与控制实验，口头解释修正依据并复算全部关键中间值后再进入下一课。`, md`
This lesson has separated valid input, deterministic rule, unique output, and supervisory feedback. Its four observable abilities are: explain why function does not mean line; distinguish feature, weight, bias, prediction, and target; reconstruct $8+(-3)+5=10$ term by term; and translate the formula into code with length, shape, and intermediate-contribution checks.

You should be able to reconstruct $\\hat y=w_1x_1+w_2x_2+b$, use \`features = [2, 3]\`, \`weights = [4, -1]\`, and \`bias = 5\` to obtain \`prediction = 10\`, then compare with \`target = 9\` to obtain residual 1.

The next lesson receives $\\mathbf x=[2,3]$ and $\\mathbf w=[4,-1]$ unchanged. It explains order, dimension, direction, and why $\\mathbf w^\\mathsf T\\mathbf x=4\\times2+(-1)\\times3=5$ is a dot product. Handoff card: candidate sample vector \`x = [2, 3]\`, candidate weight vector \`w = [4, -1]\`, \`w^T x = 4*2 + (-1)*3 = 5\`, \`y_hat = 5 + 5 = 10\`, and \`residual = 10 - 9 = 1\`.

Carry three open questions forward: Why can an ordered feature set be treated as one vector? Why do order, dimension, direction, and magnitude affect representation? Why is $4\\times2+(-1)\\times3$ more than “two products added,” and how can it read a sample along a weight direction? If you can reconstruct the handoff card without looking and name input, rule, output, and unit on each line, this lesson has prepared stable input for the vector lesson. If target still slips into prediction, or [8,-3] still looks like a final output, follow the review links and repeat 1A, 2B, and the controlled experiment before moving on.`),
]

const functionsAndMappingsModule: MathLabModule = {
  id: 'calculus-functions-rate-change', enhancementTier: 'interactive', order: 0,
  title: copy('函数与映射：输入怎样变成预测', 'Functions and Mappings: How Inputs Become Predictions'),
  subtitle: copy('从一个可手算的关卡时长预测，连接公式、代码、残差与控制变量实验。', 'Use one hand-checkable level-duration prediction to connect formulas, code, residuals, and a controlled experiment.'),
  difficulty: 'foundation', estimatedMinutes: 75, prerequisites: ['tensor-shapes-vectorization'],
  aiModelConnections: [
    copy('前向计算把特征与当前参数映射为预测。', 'A forward pass maps features and current parameters to a prediction.'),
    copy('训练反馈来自预测与目标的差，但目标不是预测输入。', 'Training feedback comes from prediction-target error, but the target is not a prediction input.'),
  ],
  learningObjectives: [
    copy('用定义域、规则与唯一输出解释函数和映射。', 'Explain functions and mappings through a domain, a rule, and a unique output.'),
    copy('区分特征、权重、偏置、预测、目标与残差。', 'Distinguish features, weights, bias, prediction, target, and residual.'),
    copy('逐项手算并用 Python 复现 prediction = 10。', 'Calculate every contribution and reproduce prediction = 10 in Python.'),
    copy('在只改变 w1 的实验中解释预测与误差的变化。', 'Explain prediction and error changes in an experiment that changes only w1.'),
  ],
  concepts: [predictionConcept, residualConcept], sections,
  toc: sections.map(({ id, level, title }) => ({ id, level, title })),
  visuals: [], labs: [predictionLab],
  quizzes: [
    quiz('mapping-role-check', '哪个量不参与生成本次 prediction？', 'Which quantity does not generate the current prediction?', 'target', [['target', 'target = 9', 'target = 9'], ['bias', 'bias = 5', 'bias = 5'], ['features', 'features = [2, 3]', 'features = [2, 3]']], '目标只在预测完成后用于计算残差；把目标放进预测会造成答案泄漏。回看“共同预测任务”中的信息边界。', 'The target is used only after prediction to compute the residual; feeding it into prediction would leak the answer. Revisit the information boundary in the shared prediction task.', 'target-leakage', 'shared-prediction-task'),
    quiz('mapping-contribution-check', '第二个特征对预测的贡献是多少？', 'What is the second feature’s contribution?', 'minus-three', [['minus-three', '-3', '-3'], ['three', '+3', '+3'], ['zero', '0', '0']], '贡献是 w2x2 = (-1)×3 = -3；负号表示方向，不能把这一项删除。回看例一的贡献账本。', 'The contribution is w2x2 = (-1)×3 = -3; the negative sign carries direction and does not delete the term. Revisit the contribution ledger in Example One.', 'negative-weight-useless', 'worked-prediction'),
    quiz('mapping-control-check', 'w1 从 4 增至 5 时，prediction 怎样变化？', 'How does prediction change when w1 increases from 4 to 5?', 'plus-two', [['plus-two', '增加 2，从 10 到 12', 'It increases by 2, from 10 to 12'], ['plus-one', '增加 1', 'It increases by 1'], ['no-change', '不变', 'It does not change']], '因为固定 x1 = 2，所以 w1 每增加 1，w1x1 与 prediction 都增加 2。回看控制变量实验的直线切片。', 'Because x1 = 2 is fixed, each increase of 1 in w1 increases w1x1 and prediction by 2. Revisit the linear slice in the controlled experiment.', 'parameter-change-one-to-one', 'controlled-experiment'),
    quiz('mapping-error-check', '哪个 w1 让当前单样本预测恰好命中 target = 9？', 'Which w1 makes this one sample hit target = 9 exactly?', 'three-point-five', [['three-point-five', '3.5', '3.5'], ['four', '4', '4'], ['six', '6', '6']], '解 2w1+2=9 得 w1=3.5；这只说明当前样本命中，不代表所有样本都最优。回看目标只用于反馈的约定。', 'Solving 2w1+2=9 gives w1=3.5; this fits the current sample only and does not prove it is best for all samples. Revisit the rule that targets are feedback only.', 'larger-is-better', 'controlled-experiment'),
  ],
  misconceptions: [
    misconception('negative-weight-useless', '负权重表示特征无效，应当删除。', 'A negative weight means the feature is useless and should be removed.', '负号表示当前线性规则中的影响方向；是否删除特征需要数据证据。', 'The sign indicates effect direction in the current linear rule; feature removal requires evidence from data.', '删除 -3 会把预测从 10 错改为 13。', 'Deleting -3 incorrectly changes prediction from 10 to 13.'),
    misconception('target-leakage', '目标 9 应放进预测函数，才能得到准确结果。', 'Target 9 should enter the prediction function to make it accurate.', '目标是预测后的监督反馈，不是新样本预测时可用的输入。', 'The target is supervision after prediction, not an available input for a new sample.', '先调用 predict_one，再单独计算 residual = prediction - target。', 'Call predict_one first, then separately compute residual = prediction - target.'),
    misconception('elementwise-is-prediction', 'weights * features 已经是加权预测。', 'weights * features is already the weighted prediction.', '逐元素乘法只得到贡献列表，还需求和并加偏置。', 'Elementwise multiplication only produces a contribution list; it must be summed and then biased.', '[8, -3] 是两个数；求和得 5，加偏置才得 10。', '[8, -3] contains two values; summing gives 5, and adding bias gives 10.'),
    misconception('function-is-line', '函数的图像必须是一条直线。', 'A function’s graph must be a straight line.', '函数的核心是合法输入对应唯一输出，图形可以弯曲或分段。', 'A function is defined by each valid input having one output; its graph may curve or be piecewise.', '本实验是直线，只因控制切片恰好为 2w1+2。', 'This experiment is linear only because the controlled slice happens to be 2w1+2.'),
    misconception('parameter-change-one-to-one', 'w1 增加 1，prediction 也只增加 1。', 'If w1 increases by 1, prediction must also increase by 1.', '参数变化会先乘对应特征；本例 x1 = 2，所以 prediction 增加 2。', 'Parameter change is multiplied by its paired feature; here x1 = 2, so prediction increases by 2.', 'w1 从 4 到 5 时，prediction 从 10 到 12。', 'When w1 moves from 4 to 5, prediction moves from 10 to 12.'),
    misconception('larger-is-better', '更大的 w1 或 prediction 一定更好。', 'A larger w1 or prediction is always better.', '好坏取决于 prediction 离 target 多远，而不是数值是否更大。', 'Quality depends on distance from the target, not whether the value is larger.', 'w1 = 6 时 prediction = 14，距离 target = 9 更远，squared error = 25。', 'At w1 = 6, prediction = 14 is farther from target = 9 and squared error is 25.'),
  ],
  nextModuleIds: [], accent: '#d65a31', theme: '#fff1e8',
  sourceNoteFile: 'math-lab-calculus-route-sources.md',
  sourceReferences: [
    { label: copy('3Blue1Brown 微积分本质', '3Blue1Brown Essence of Calculus'), href: 'https://www.3blue1brown.com/topics/calculus', usage: copy('用于函数图像、输入输出与局部变化的可视化直觉；本课不复制其媒体资产。', 'Used for visual intuition about function graphs, input-output behavior, and local change; no media assets are copied into this lesson.') },
    { label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'), href: 'https://mml-book.github.io/', license: 'CC BY-NC-SA 4.0', usage: copy('用于核对函数、向量记号与线性预测的数学约定，并支撑下一课的点积 handoff。', 'Used to verify function and vector notation and the linear-prediction convention, and to support the dot-product handoff to the next lesson.') },
  ],
}

const runtimeTitles = {
  vectors: [
    '1. Opening: How Can Two Values Represent One Sample?', '2. Recap: Ordered Lists, Coordinates, and Squared Error',
    '3. Shared Task: A Vector Binds One Sample’s Features', '4. Intuition: Coefficients Convert Features into Minutes',
    '5. Formal Contract: Dimension, Linear Functionals, and Units', '6. Example One: Dot Product, Prediction, and Error',
    '7. Example Two: Projection in a Dimensionless Geometry', '8. Code Translation: Preserve Shapes and Contributions',
    '9. Controlled Experiment: Change Contribution Coefficients', '10. Misconceptions: Plausible Vector Errors',
    '11. Three-Layer Practice: Representation to Observation', '12. Summary and Matrix Handoff',
  ],
  matrices: [
    '1. Opening: Why Not Repeat the Dot Product?', '2. Recap: Dot Products and Reading Rows and Columns',
    '3. Shared Task: The Xw+b Shape Ledger', '4. Intuition: Tables, Pipelines, and Image Grids',
    '5. Formal Contract: Rows, Columns, Multiplication, and Broadcasting', '6. Example One: Expand the Whole Batch with Shapes',
    '7. Example Two: A Linear Mirror of Grid Points', '8. Code Translation: Vectorize but Keep a Row Oracle',
    '9. Controlled Experiment: Add or Reorder One Row', '10. Misconceptions: Executable Is Not Necessarily Correct',
    '11. Three-Layer Practice: Shapes and Batch Observation', '12. Summary and Derivative Handoff',
  ],
  derivatives: [
    '1. Opening: Which Way Does Error Move Here?', '2. Recap: Average Change, MSE, and Controlled Variables',
    '3. Shared Task: From x,w,b to y_hat,y,L', '4. Intuition: Local Motion Slope and Loss Terrain',
    '5. Formal Contract: Derivatives, Partials, and Central Difference', '6. Example One: Check Three Loss Sensitivities',
    '7. Example Two: Local Slope of Motion', '8. Code Translation: Wrap the Probed Parameter',
    '9. Controlled Experiment: Change h, Not the Question', '10. Misconceptions: Boundaries of Local Information',
    '11. Three-Layer Practice: Symbols to Local Experiments', '12. Summary and NumPy Handoff',
  ],
  numpy: [
    '1. Opening: How Can One Line Silently Be Wrong?', '2. Recap: Scalar-to-Batch Contracts',
    '3. Shared Task: Map Every Code Variable to Mathematics', '4. Intuition: Shape as a Data-Flow Type',
    '5. Formal Contract: Arrays, Broadcasting, and Axes', '6. Example One: Reproduce Every Task 1 Output',
    '7. Example Two: Debug a Sensor Grid by Shape', '8. Implementation: Validation, Vectorization, and Pure Differences',
    '9. Controlled Experiment: Loop and Vectorized Outputs Must Match', '10. Misconceptions: NumPy’s Legal Errors',
    '11. Three-Layer Practice: Read, Calculate, and Debug Shapes', '12. Summary and Studio Handoff',
  ],
  studio: [
    'Stage 1: Reproduce the Task and Input Contract', 'Stage 2: Build a Transparent Scalar Baseline',
    'Stage 3: Translate the Scalar Chain into a Vector Prediction', 'Stage 4: Extend to Batch Prediction',
    'Stage 5: Compare Errors and Rebuild MSE', 'Stage 6: Estimate Numerical Sensitivity',
    'Stage 7: Probability Preview (Not a Complete Probability Course)', 'Stage 8: Failure Analysis and Minimal Repairs',
    'Stage 9: Evidence Review and Learning Reflection',
  ],
} as const

type RuntimeLessonKey = keyof typeof runtimeTitles

function runtimeSections(key: RuntimeLessonKey, labId?: string): MathLabSection[] {
  return runtimeLessonContent[key].map((item: RuntimeLessonSection, index) => ({
    id: item.originalId,
    level: 2,
    title: copy(item.title, runtimeTitles[key][index]!),
    content: copy(item.content, item.en),
    ...(labId && index === 8 ? { labIds: [labId] } : {}),
  }))
}

function promotedModule(input: {
  id: string
  key: RuntimeLessonKey
  zhTitle: string
  enTitle: string
  zhSubtitle: string
  enSubtitle: string
  prerequisites: string[]
  next?: string
  concepts: MathConcept[]
  objectives: Array<[string, string]>
  connections: Array<[string, string]>
  misconceptions: Misconception[]
  quizzes: QuizItem[]
  lab?: LabConfig
  sourceNoteFile: string
  sourceReferences?: MathLabModule['sourceReferences']
  accent: string
  theme: string
}): MathLabModule {
  const sections = runtimeSections(input.key, input.lab?.id)
  return {
    id: input.id, enhancementTier: input.lab ? 'interactive' : 'core', order: 0,
    title: copy(input.zhTitle, input.enTitle), subtitle: copy(input.zhSubtitle, input.enSubtitle),
    difficulty: 'foundation', estimatedMinutes: 80, prerequisites: input.prerequisites,
    aiModelConnections: input.connections.map(([zh, en]) => copy(zh, en)),
    learningObjectives: input.objectives.map(([zh, en]) => copy(zh, en)),
    concepts: input.concepts, sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [], labs: input.lab ? [input.lab] : [], quizzes: input.quizzes,
    misconceptions: input.misconceptions, nextModuleIds: input.next ? [input.next] : [],
    accent: input.accent, theme: input.theme, sourceNoteFile: input.sourceNoteFile,
    sourceReferences: input.sourceReferences ?? [
      { label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'), href: 'https://mml-book.github.io/', license: 'CC BY-NC-SA 4.0', usage: copy('用于核对数学定义、shape 与机器学习连接。', 'Used to verify mathematical definitions, shape contracts, and machine-learning connections.') },
      { label: copy('NumPy 官方文档', 'NumPy Documentation'), href: 'https://numpy.org/doc/stable/', usage: copy('用于核对数组、矩阵乘法、广播、轴与有限值 API。', 'Used to verify array, matrix multiplication, broadcasting, axis, and finite-value APIs.') },
    ],
  }
}

function simpleConcept(
  id: string, zhName: string, enName: string, formulaLatex: string,
  variables: Array<[string, string, string]>, zhPlain: string, enPlain: string,
  zhGeometry: string, enGeometry: string, zhExample: string, enExample: string,
  zhConnection: string, enConnection: string, codeExample?: string,
): MathConcept {
  return {
    id, name: copy(zhName, enName), formulaLatex,
    variables: variables.map(([symbol, zh, en]) => variable(symbol, zh, en)),
    plainExplanation: copy(zhPlain, enPlain), geometricIntuition: copy(zhGeometry, enGeometry),
    numericalExample: copy(zhExample, enExample), modelConnection: copy(zhConnection, enConnection),
    ...(codeExample ? { codeExample } : {}),
  }
}

function formativeQuiz(
  id: string, zhPrompt: string, enPrompt: string, answer: string,
  zhCorrect: string, enCorrect: string, zhWrong: string, enWrong: string,
  zhExplanation: string, enExplanation: string, tag: string, revisit: string,
): QuizItem {
  return quiz(id, zhPrompt, enPrompt, answer, [[answer, zhCorrect, enCorrect], ['distractor', zhWrong, enWrong]], zhExplanation, enExplanation, tag, revisit)
}

const vectorsModule = promotedModule({
  id: 'linear-algebra-feature-space', key: 'vectors',
  zhTitle: '向量与样本表示：一次预测如何读懂多个特征', enTitle: 'Vectors and Sample Representation: Reading Multiple Features in One Prediction',
  zhSubtitle: '把有序特征、带单位线性泛函、独立几何投影与可检查代码接成一条链。', enSubtitle: 'Connect ordered features, a unit-bearing linear functional, independent geometric projection, and checked code.',
  prerequisites: ['beginner-linear-algebra'], next: 'linear-algebra-distance-similarity', sourceNoteFile: 'math-lab-linear-algebra-route-sources.md', accent: '#2457d6', theme: '#edf3ff',
  objectives: [
    ['用顺序、语义和 shape 定义一个样本向量。', 'Define one sample vector through order, meaning, and shape.'],
    ['把 w 严格解释为带单位线性泛函并手算 w^T x。', 'Interpret w strictly as a unit-bearing linear functional and calculate w^T x.'],
    ['只在无量纲同尺度 u,v 例中解释长度、夹角与投影。', 'Use length, angle, and projection only in the dimensionless same-scale u,v example.'],
    ['用检查过的循环与 NumPy 复现 prediction=10 和 L=1。', 'Use a checked loop and NumPy to reproduce prediction=10 and L=1.'],
  ],
  connections: [
    ['模型输入把同一对象的多个特征绑定为有序向量。', 'Model inputs bind several features of one object into an ordered vector.'],
    ['线性层先用带单位系数读取特征贡献，再加偏置。', 'A linear layer first reads feature contributions through unit-bearing coefficients, then adds bias.'],
  ],
  concepts: [
    simpleConcept('unit-bearing-linear-functional', '带单位线性泛函', 'Unit-Bearing Linear Functional', '\\hat y=w^\\mathsf T x+b', [['x', '按特征协议排列的样本向量。', 'The sample vector ordered by the feature schema.'], ['w', '把各特征换算为输出单位的线性泛函。', 'The linear functional converting features into output units.']], 'w 逐坐标读取 x，汇总兼容单位的贡献。', 'w reads x coordinate by coordinate and aggregates contributions with compatible units.', '主线不把 w 解释为空间箭头。', 'The main task does not interpret w as a spatial arrow.', '4×2+(-1)×3=5；加 b=5 得预测 10。', '4×2+(-1)×3=5; adding b=5 gives prediction 10.', '仿射神经元和线性模型都使用同一向量到标量合同。', 'Affine neurons and linear models use the same vector-to-scalar contract.', `import numpy as np\nx = np.array([2.0, 3.0])\nw = np.array([4.0, -1.0])\nassert x.shape == w.shape == (2,)\ncontributions = w * x\nprediction = w @ x + 5.0\nprint(contributions, prediction)  # [8. -3.] 10.0`),
    simpleConcept('dimensionless-projection', '无量纲几何投影', 'Dimensionless Geometric Projection', '\\operatorname{proj}_v(u)=\\frac{u^\\mathsf T v}{v^\\mathsf T v}v', [['u,v', '同一无量纲、同尺度空间中的位移与参考方向。', 'A displacement and reference direction in one dimensionless same-scale space.']], '投影把 u 分解为沿 v 与垂直 v 的部分。', 'Projection splits u into parts parallel and perpendicular to v.', '单位与尺度兼容是欧氏几何解释的前提。', 'Compatible units and scale are prerequisites for Euclidean geometry.', 'u=[3,4], v=[4,0] 时投影为 [3,0]。', 'For u=[3,4] and v=[4,0], the projection is [3,0].', 'Embedding 几何也必须先说明尺度和相似度合同。', 'Embedding geometry also requires an explicit scale and similarity contract.'),
  ],
  misconceptions: [
    misconception('vector-dimension-is-norm', '维度就是几何长度。', 'Dimension is the geometric norm.', '维度计坐标数，范数计兼容几何中的大小。', 'Dimension counts coordinates; norm measures magnitude in compatible geometry.', 'u=[3,4] 的维度是 2、范数是 5。', 'u=[3,4] has dimension 2 and norm 5.'),
    misconception('vector-elementwise-is-dot', 'w*x 已经是标量预测。', 'w*x is already the scalar prediction.', '它只产生贡献向量，还需汇总并加偏置。', 'It only produces a contribution vector, which must be reduced and biased.', '[8,-3] 求和为 5，加偏置才为 10。', '[8,-3] sums to 5; adding bias gives 10.'),
    misconception('vector-w-is-arrow', '主线 w 是可直接做欧氏投影的箭头。', 'Main-task w is an arrow for direct Euclidean projection.', 'w 坐标带不同单位，是线性泛函；几何只用独立 u,v。', 'w has coordinate-specific units and is a linear functional; geometry uses separate u,v.', '分钟/任务与分钟/提示不能当作同尺度空间坐标。', 'Minutes/task and minutes/hint are not same-scale spatial coordinates.'),
    misconception('vector-shape-is-semantics', 'shape 相同就代表特征语义对齐。', 'Matching shape proves feature semantics align.', 'shape 只检查数量，列协议检查含义。', 'Shape checks counts; the column schema checks meaning.', '只交换 x 会在合法 shape 下得到错误配对。', 'Swapping only x creates wrong pairing under a legal shape.'),
  ],
  quizzes: [
    formativeQuiz('vector-role-check', '主线 w 的严格角色是什么？', 'What is the strict role of w in the main task?', 'functional', '带单位线性泛函', 'A unit-bearing linear functional', '无量纲位移箭头', 'A dimensionless displacement arrow', 'w 把特征换算成分钟贡献；回看主线连接。', 'w converts features into minute contributions; revisit the shared task.', 'vector-w-is-arrow', 'vectors-shared-task'),
    formativeQuiz('vector-output-check', 'w*x=[8,-3] 后还缺什么？', 'What remains after w*x=[8,-3]?', 'reduce', '求和并加偏置', 'Sum and add bias', '直接与 target 比较', 'Compare directly with target', '贡献向量不是标量预测；回看代码节。', 'A contribution vector is not a scalar prediction; revisit the code section.', 'vector-elementwise-is-dot', 'vectors-code'),
    formativeQuiz('vector-geometry-check', '何时可直接解释欧氏投影？', 'When is a direct Euclidean projection meaningful?', 'compatible', 'u,v 各轴无量纲、同尺度且语义兼容', 'u,v have dimensionless, same-scale, compatible axes', '只要都是二维数组', 'Whenever both arrays are 2D', '几何需要单位与尺度合同；回看辅助例。', 'Geometry needs a unit and scale contract; revisit the auxiliary example.', 'vector-shape-is-semantics', 'vectors-worked-auxiliary'),
    formativeQuiz('vector-dimension-check', 'u=[3,4] 的维度是多少？', 'What is the dimension of u=[3,4]?', 'two', '2', '2', '5', '5', '维度是坐标数；5 是范数。', 'Dimension counts coordinates; 5 is the norm.', 'vector-dimension-is-norm', 'vectors-formal'),
  ],
})

const matrixLab: LabConfig = {
  id: 'matrix-transform-lab', title: copy('独立网格矩阵变换实验', 'Independent Grid Matrix Transformation Lab'), type: 'interactive-visual', componentName: 'MatrixTransformLab',
  successCriteria: [
    copy('能说明实验矩阵 A 的列如何移动无量纲基向量。', 'Explain how the experiment matrix A moves dimensionless basis vectors.'),
    copy('能区分几何变换矩阵 A 与样本矩阵 X 的角色。', 'Distinguish geometric transform A from sample matrix X.'),
  ],
}

const matricesModule = promotedModule({
  id: 'linear-algebra-matrix-transformations', key: 'matrices',
  zhTitle: '矩阵与批量计算：从一个样本到一批预测', enTitle: 'Matrices and Batch Computation: From One Sample to Many Predictions',
  zhSubtitle: '用逐 shape 账本连接 Xw+b、批量 MSE、广播失败与独立网格变换。', enSubtitle: 'Connect Xw+b, batch MSE, broadcasting failures, and an independent grid transform through a shape ledger.',
  prerequisites: ['beginner-linear-algebra'], next: 'linear-algebra-rank-null-space', sourceNoteFile: 'math-lab-linear-algebra-route-sources.md', accent: '#0f766e', theme: '#ecfdf5', lab: matrixLab,
  objectives: [
    ['为 X、w、b、prediction、target 写出完整 shape 账本。', 'Write the complete shape ledger for X, w, b, prediction, and target.'],
    ['逐行与向量化复现 predictions=[10,5] 和 MSE=2.5。', 'Reproduce predictions=[10,5] and MSE=2.5 by row and by vectorization.'],
    ['诊断转置、广播与行/目标错位。', 'Diagnose transposition, broadcasting, and row/target misalignment.'],
    ['区分样本矩阵 X 与几何变换矩阵 A。', 'Distinguish sample matrix X from geometric transform A.'],
  ],
  connections: [
    ['批量线性层保留样本轴并收缩特征轴。', 'A batched linear layer preserves the sample axis and contracts the feature axis.'],
    ['shape 检查阻止静默广播把监督关系改成成对比较。', 'Shape checks stop silent broadcasting from replacing aligned supervision with pairwise comparisons.'],
  ],
  concepts: [
    simpleConcept('batch-affine-map', '批量仿射映射', 'Batched Affine Map', '\\hat y=Xw+b', [['X', 'shape (n,d) 的样本矩阵。', 'The sample matrix with shape (n,d).'], ['w', 'shape (d,) 的系数向量。', 'The coefficient vector with shape (d,).']], '特征轴被收缩，样本轴保留。', 'The feature axis is contracted and the sample axis remains.', '每一行独立通过同一个线性规则。', 'Every row independently passes through the same linear rule.', '(2,2) @ (2,) -> (2,)，输出 [10,5]。', '(2,2) @ (2,) -> (2,), producing [10,5].', '神经网络批量前向传播依赖相同轴合同。', 'Neural-network batch forward passes use the same axis contract.', `import numpy as np\nX = np.array([[2., 3.], [1., 4.]])\nw = np.array([4., -1.])\npredictions = X @ w + 5.0\nassert predictions.shape == (2,)\nprint(predictions)  # [10.  5.]`),
    simpleConcept('batch-mse', '批量均方误差', 'Batch Mean Squared Error', 'L=\\frac1n\\sum_i(\\hat y_i-y_i)^2', [['n', '样本数。', 'The number of samples.'], ['i', '保留下来的样本索引。', 'The preserved sample index.']], '先逐样本对齐残差，再对平方误差求平均。', 'Align residuals sample by sample, then average squared errors.', '错误广播会把一一对应改成成对差值。', 'Bad broadcasting replaces alignment with pairwise differences.', '残差 [1,-2]、平方 [1,4]、MSE=2.5。', 'Residuals [1,-2], squares [1,4], MSE=2.5.', '训练 loss 必须保留预测与目标的一一对应。', 'Training loss must preserve one-to-one alignment between predictions and targets.'),
  ],
  misconceptions: [
    misconception('matrix-transpose-same', '方阵转置后 shape 相同，所以语义不变。', 'A square transpose keeps shape, so semantics are unchanged.', '转置交换轴角色；方阵只会隐藏错误。', 'Transpose swaps axis roles; a square matrix merely hides the error.', '用 (3,2) 反例可暴露误转置。', 'A (3,2) counterexample exposes an accidental transpose.'),
    misconception('matrix-elementwise-prediction', 'X*w 就是整批预测。', 'X*w is the whole batch prediction.', '它是贡献矩阵，仍需沿特征轴汇总并加偏置。', 'It is a contribution matrix that still needs feature-axis reduction and bias.', '[[8,-3],[4,-4]] 汇总为 [5,0]。', '[[8,-3],[4,-4]] reduces to [5,0].'),
    misconception('matrix-broadcast-safe', '能广播就代表残差对齐。', 'Broadcastable means residuals are aligned.', '广播只看尾轴大小，不懂样本含义。', 'Broadcasting sees trailing sizes, not sample meaning.', '(2,1)-(2,) 会得到 (2,2)。', '(2,1)-(2,) produces (2,2).'),
    misconception('matrix-row-target-independent', '交换 X 的行不必交换 targets。', 'Rows of X can be reordered without targets.', '监督目标必须跟随同一样本。', 'A target must move with its sample.', '否则 shape 合法但 MSE 语义错误。', 'Otherwise shapes remain legal while MSE semantics break.'),
  ],
  quizzes: [
    formativeQuiz('matrix-shape-check', '(2,2)@(2,) 的输出 shape？', 'What is the output shape of (2,2)@(2,)?', 'vector', '(2,)', '(2,)', '(2,2)', '(2,2)', '特征轴收缩，样本轴保留。', 'The feature axis contracts and the sample axis remains.', 'matrix-elementwise-prediction', 'matrices-formal'),
    formativeQuiz('matrix-axis-check', 'X 的 axis 0 表示什么？', 'What does axis 0 of X represent?', 'samples', '样本', 'Samples', '特征', 'Features', '行沿样本轴排列；回看 shape 账本。', 'Rows lie along the sample axis; revisit the shape ledger.', 'matrix-transpose-same', 'matrices-shared-task'),
    formativeQuiz('matrix-broadcast-check', '(n,1)-(n,) 的主要风险？', 'What is the main risk of (n,1)-(n,)?', 'pairwise', '广播成 (n,n) 成对差值', 'Broadcasting to an (n,n) pairwise matrix', '自动得到正确残差', 'Automatically obtaining aligned residuals', 'NumPy 不理解监督配对。', 'NumPy does not understand supervisory alignment.', 'matrix-broadcast-safe', 'matrices-code'),
    formativeQuiz('matrix-row-check', '交换样本行时还需交换什么？', 'What must move when sample rows are reordered?', 'targets', '对应 targets', 'The corresponding targets', 'w 的特征顺序', 'The feature order in w', '目标随同一样本移动。', 'Targets move with their samples.', 'matrix-row-target-independent', 'matrices-experiment'),
  ],
})

const derivativesModule = promotedModule({
  id: 'calculus-derivatives-local-change', key: 'derivatives',
  zhTitle: '导数与误差敏感度：当前参数附近怎样变化', enTitle: 'Derivatives and Error Sensitivity: Change Near the Current Parameters',
  zhSubtitle: '用解析结果与中央差分核对局部损失敏感度，并严格区分估计与更新。', enSubtitle: 'Check local loss sensitivity with analytic results and central difference while separating estimation from updating.',
  prerequisites: ['calculus-functions-rate-change'], next: 'calculus-partial-derivatives-gradients', sourceNoteFile: 'math-lab-calculus-route-sources.md', accent: '#c2410c', theme: '#fff7ed',
  objectives: [
    ['从平均变化率解释导数的局部含义。', 'Explain the local meaning of a derivative from average change.'],
    ['用中央差分核对 w1、w2、b 的 MSE 敏感度。', 'Use central difference to check MSE sensitivities for w1, w2, and b.'],
    ['通过 h sweep 诊断截断误差与浮点消去。', 'Diagnose broad-window error and floating cancellation with an h sweep.'],
    ['明确中央差分只估计导数，不执行梯度下降。', 'State that central difference estimates a derivative and does not perform gradient descent.'],
  ],
  connections: [
    ['导数把当前参数与 loss 的局部变化连接起来。', 'Derivatives connect current parameters to local loss change.'],
    ['梯度检查用独立数值估计核对解析或自动微分。', 'Gradient checking uses an independent numerical estimate to verify analytic or automatic differentiation.'],
  ],
  concepts: [
    simpleConcept('central-difference-sensitivity', '中央差分敏感度', 'Central-Difference Sensitivity', '\\frac{L(\\theta+h)-L(\\theta-h)}{2h}', [['theta', '被单独探测的当前参数。', 'The current parameter probed in isolation.'], ['h', '正且有限的对称观察半宽。', 'A positive finite symmetric half-window.']], '对称地比较参数两侧的 loss，估计当前局部斜率。', 'Compare loss symmetrically on both sides to estimate the current local slope.', '窗口缩小让割线靠近局部切线，但过小会受浮点误差影响。', 'Shrinking the window approaches a local tangent, but an overly small window suffers floating error.', '当前批量敏感度约为 [0,-5,-1]。', 'Current batch sensitivities are approximately [0,-5,-1].', '这是 gradient checking 的数值基线，不是参数更新。', 'This is a numerical baseline for gradient checking, not a parameter update.', `from math import isfinite\ndef central_difference(fn, value, h=1e-4):\n    if not isfinite(value) or not isfinite(h) or h <= 0:\n        raise ValueError("value and positive h must be finite")\n    plus, minus = fn(value + h), fn(value - h)\n    result = (plus - minus) / (2 * h)\n    if not all(map(isfinite, (plus, minus, result))):\n        raise ValueError("difference must be finite")\n    return result`),
    simpleConcept('motion-local-slope', '运动的局部斜率', 'Local Motion Slope', "s'(t)=2t", [['t', '时间输入，单位秒。', 'Time input in seconds.'], ['s', '位置输出，单位米。', 'Position output in meters.']], '位置对时间的导数是局部速度。', 'The derivative of position with respect to time is local velocity.', '对称窗口比较 t 两侧的位置，得到当前局部斜率。', 'A symmetric window compares positions on both sides of t to obtain the current local slope.', 's(t)=t^2 在 t=3、h=0.1 时中央差分为 6 米/秒。', 'For s(t)=t^2 at t=3 with h=0.1, central difference is 6 meters/second.', '同样的局部率思想用于解释 loss 对参数的敏感度。', 'The same local-rate idea explains loss sensitivity to a parameter.'),
  ],
  misconceptions: [
    misconception('derivative-is-update', '中央差分就是梯度下降。', 'Central difference is gradient descent.', '中央差分估计斜率；更新还需要学习率与参数赋值。', 'Central difference estimates slope; an update also needs a learning rate and assignment.', '本课返回 -5，不执行 w2 <- w2-eta*(-5)。', 'This lesson returns -5 and does not execute w2 <- w2-eta*(-5).'),
    misconception('derivative-is-global', '当前导数决定整条曲线的方向。', 'The current derivative determines the whole curve.', '导数只描述当前点附近。', 'A derivative describes only the current neighborhood.', '远离当前点后曲线可能转向。', 'The curve may turn away from the current point.'),
    misconception('derivative-smallest-h', 'h 越小结果必然越准确。', 'A smaller h is always more accurate.', '过小 h 会让相近浮点数相减丢失有效位。', 'An overly small h loses significant digits when close floats are subtracted.', '应寻找稳定区间并与解析例核对。', 'Seek a stable range and compare with an analytic case.'),
    misconception('derivative-mutate-shared', '可以在同一个 w 上依次做 plus/minus 扰动。', 'The same w can be mutated for plus and minus probes.', '两侧计算必须从同一基线的独立副本开始。', 'Both sides must begin from independent copies of one baseline.', '否则 minus 侧继承 plus 状态，破坏对称。', 'Otherwise the minus side inherits the plus state and breaks symmetry.'),
    misconception('derivative-sign-is-parameter-sign', '导数为负表示参数本身必须为负。', 'A negative derivative means the parameter itself must be negative.', '导数符号描述当前点附近参数向右小移时 loss 的局部变化方向，不描述参数值的符号。', 'The derivative sign describes the local loss direction when the parameter moves slightly right; it does not describe the parameter value sign.', 'w2=-1 的导数是 -5，而正参数 b=5 的导数也是 -1；两者都只说明局部增加参数会使 loss 倾向下降。', 'w2=-1 has derivative -5, while positive parameter b=5 has derivative -1; both signs only say that a small local increase tends to lower loss.'),
  ],
  quizzes: [
    formativeQuiz('derivative-role-check', '中央差分输出是什么？', 'What does central difference output?', 'slope', '局部斜率估计', 'A local slope estimate', '更新后的参数', 'An updated parameter', '估计与更新必须分离。', 'Estimation and updating must remain separate.', 'derivative-is-update', 'derivatives-formal'),
    formativeQuiz('derivative-w2-check', '当前 dL/dw2 约为多少？', 'What is the current approximate dL/dw2?', 'minus-five', '-5', '-5', '+5', '+5', '残差与第二特征列配对得到 -5；负号描述当前局部 loss 方向，不是参数符号。', 'Pairing residuals with the second feature column gives -5; its sign describes the current local loss direction, not the parameter sign.', 'derivative-sign-is-parameter-sign', 'derivatives-worked-shared'),
    formativeQuiz('derivative-h-check', '为什么不总选最小 h？', 'Why not always choose the smallest h?', 'roundoff', '浮点消去可能主导', 'Floating cancellation may dominate', '因为中央差分要求 h=1', 'Because central difference requires h=1', 'h sweep 用于寻找稳定范围。', 'The h sweep seeks a stable range.', 'derivative-smallest-h', 'derivatives-experiment'),
    formativeQuiz('derivative-copy-check', 'plus/minus 探测应如何创建参数？', 'How should plus/minus probe parameters be created?', 'copies', '从同一基线各自复制', 'Copy each independently from one baseline', '依次修改同一数组', 'Mutate one array sequentially', '独立副本保护对称比较。', 'Independent copies protect the symmetric comparison.', 'derivative-mutate-shared', 'derivatives-code'),
  ],
})

const numpyModule = promotedModule({
  id: 'numpy-mathematics-implementation', key: 'numpy',
  zhTitle: 'NumPy 数学实现：让公式、shape 与失败一致', enTitle: 'NumPy Mathematics Implementation: Align Formulas, Shapes, and Failures',
  zhSubtitle: '用真实输出、循环 oracle、广播诊断与安全失败复现完整预测任务。', enSubtitle: 'Reproduce the full prediction task with real outputs, a loop oracle, broadcasting diagnostics, and safe failures.',
  prerequisites: ['calculus-derivatives-local-change'], next: 'math-to-code-guided-studio', sourceNoteFile: 'math-to-code-numpy-sources.md', accent: '#6d28d9', theme: '#f5f3ff',
  sourceReferences: [
    { label: copy('NumPy 广播', 'NumPy Broadcasting'), href: 'https://numpy.org/doc/stable/user/basics.broadcasting.html', usage: copy('核对末轴对齐、标量复用与合法但语义错误的广播结果。', 'Verify trailing-axis alignment, scalar reuse, and legal but semantically wrong broadcast results.') },
    { label: copy('NumPy 矩阵乘法', 'NumPy Matrix Multiplication'), href: 'https://numpy.org/doc/stable/reference/generated/numpy.matmul.html', usage: copy('核对 @ 的内维收缩与批量输出 shape。', 'Verify inner-dimension contraction and batched output shape for @.') },
    { label: copy('NumPy 有限值检查', 'NumPy Finite-Value Checking'), href: 'https://numpy.org/doc/stable/reference/generated/numpy.isfinite.html', usage: copy('核对 NaN 与 Infinity 的显式失败边界。', 'Verify explicit failure boundaries for NaN and Infinity.') },
    { label: copy('NumPy 数组转换', 'NumPy Array Conversion'), href: 'https://numpy.org/doc/stable/reference/generated/numpy.asarray.html', usage: copy('核对 list/ndarray 到 float 数组的转换合同。', 'Verify the conversion contract from lists or ndarrays to floating arrays.') },
  ],
  objectives: [
    ['把每个 NumPy 变量、shape 与数学角色逐项对齐。', 'Align every NumPy variable and shape with its mathematical role.'],
    ['复现 predictions=[10,5]、MSE=2.5 与敏感度 [0,-5,-1]。', 'Reproduce predictions=[10,5], MSE=2.5, and sensitivities [0,-5,-1].'],
    ['诊断广播、dtype、view mutation 与非有限值。', 'Diagnose broadcasting, dtype, view mutation, and non-finite values.'],
    ['证明循环与向量化实现输出相同。', 'Demonstrate that loop and vectorized implementations produce equal outputs.'],
  ],
  connections: [
    ['NumPy shape 合同是进入 PyTorch/JAX 张量代码的直接准备。', 'NumPy shape contracts directly prepare learners for PyTorch/JAX tensor code.'],
    ['安全失败让模型训练前的数据与数值问题可定位。', 'Safe failures localize data and numerical problems before model training.'],
  ],
  concepts: [
    simpleConcept('checked-numpy-batch', '检查过的 NumPy 批量预测', 'Checked NumPy Batch Prediction', '\\hat y=Xw+b', [['X', '有限 float 二维数组，shape (n,d)。', 'A finite 2D float array with shape (n,d).'], ['w', '有限 float 一维数组，shape (d,)。', 'A finite 1D float array with shape (d,).']], '先验证维度、轴、有限值，再执行矩阵乘法。', 'Validate dimensions, axes, and finite values before matrix multiplication.', 'shape 是类型说明，已知值 oracle 验证语义。', 'Shape is a type description; a known-value oracle verifies semantics.', 'predictions = [10.0, 5.0]，MSE = 2.5。', 'predictions = [10.0, 5.0], MSE = 2.5.', '同一模式扩展到批量神经网络计算。', 'The same pattern extends to batched neural-network computation.', `import numpy as np\nX = np.asarray([[2., 3.], [1., 4.]], dtype=float)\nw = np.asarray([4., -1.], dtype=float)\ntargets = np.asarray([9., 7.], dtype=float)\nif X.ndim != 2 or w.ndim != 1 or X.shape[1] != w.shape[0]:\n    raise ValueError("X and w shapes are incompatible")\nif not np.isfinite(X).all() or not np.isfinite(w).all():\n    raise ValueError("inputs must be finite")\npredictions = X @ w + 5.0\nMSE = np.mean((predictions - targets) ** 2)\nprint(predictions.tolist())  # [10.0, 5.0]\nprint(float(MSE))            # 2.5`),
    simpleConcept('numpy-broadcast-contract', '广播与轴合同', 'Broadcasting and Axis Contracts', '(n,)+(n,)\\to(n,)', [['axis 0', '样本轴。', 'The sample axis.'], ['axis 1', '特征轴。', 'The feature axis.']], '广播只按尾轴大小执行，不理解监督语义。', 'Broadcasting follows trailing sizes and does not understand supervisory semantics.', '(n,1) 与 (n,) 会扩成 (n,n)，不是对齐残差。', '(n,1) with (n,) expands to (n,n), not aligned residuals.', '二维预测列减一维 target 会产生错误成对矩阵。', 'A 2D prediction column minus a 1D target produces a wrong pairwise matrix.', '显式 shape 断言保护训练 loss 的样本对齐。', 'Explicit shape assertions protect sample alignment in training loss.'),
  ],
  misconceptions: [
    misconception('numpy-broadcast-means-correct', 'NumPy 能广播就说明数学正确。', 'If NumPy broadcasts, the mathematics is correct.', '广播只验证尺寸规则，不验证轴语义。', 'Broadcasting validates size rules, not axis semantics.', '(2,1)-(2,) 合法得到 (2,2)，却不是残差。', '(2,1)-(2,) legally gives (2,2), but not residuals.'),
    misconception('numpy-int-safe', '整数数组可安全接收浮点原地结果。', 'Integer arrays safely accept floating in-place results.', 'dtype 可能报错或截断，需要显式 float 合同。', 'Dtype may error or truncate; require an explicit float contract.', '用 np.asarray(..., dtype=float) 建立数值接口。', 'Use np.asarray(..., dtype=float) to establish the numeric interface.'),
    misconception('numpy-view-independent', '切片 view 是独立参数副本。', 'A slice view is an independent parameter copy.', 'view 可能修改父数组，扰动必须显式 copy。', 'A view may mutate its parent; perturbations require explicit copies.', 'plus 探测污染 baseline 会破坏 minus 结果。', 'A plus probe that contaminates baseline breaks the minus result.'),
    misconception('numpy-nan-will-raise', 'NaN 会自动抛错。', 'NaN automatically raises an error.', 'NaN 常会静默传播，必须显式检查。', 'NaN often propagates silently and must be checked explicitly.', 'np.isfinite(...).all() 在计算前后建立失败边界。', 'np.isfinite(...).all() establishes failure boundaries before and after computation.'),
    misconception('numpy-missing-bias', 'X@w 得到 [5,0]，所以这已经是最终预测。', 'X@w gives [5,0], so it is already the final prediction.', '加权和仍缺少共享偏置 b=5；完整预测必须执行 X@w+b。', 'The weighted sums still miss shared bias b=5; complete prediction must execute X@w+b.', '给 [5,0] 加 bias=5 才得到 predictions=[10,5]。', 'Adding bias=5 to [5,0] produces predictions=[10,5].'),
    misconception('numpy-sensor-axis', '列校准量必须改成 (3,1) 才能沿传感器轴相加。', 'Column calibration must be reshaped to (3,1) to add along the sensor axis.', '传感器列位于 shape (2,3) 的末轴，column_bias 应保持 (3,)；NumPy 会把它复用到每一行。', 'Sensor columns are the trailing axis of shape (2,3), so column_bias stays (3,) and NumPy reuses it across rows.', '单行 (3,) 加 wrong_column_bias (3,1) 会广播成错误的 (3,3)，而 (2,3)+(3,) 保持 (2,3)。', 'A row (3,) plus wrong_column_bias (3,1) broadcasts to a wrong (3,3), while (2,3)+(3,) remains (2,3).'),
  ],
  quizzes: [
    formativeQuiz('numpy-output-check', '安全实现的 predictions 是什么？', 'What are predictions from the safe implementation?', 'ten-five', '[10.0, 5.0]', '[10.0, 5.0]', '[5.0, 0.0]', '[5.0, 0.0]', 'X@w 的加权和 [5,0] 仍缺少 bias=5；加偏置后才得到 [10,5]。', 'Weighted sums X@w=[5,0] still miss bias=5; adding bias produces [10,5].', 'numpy-missing-bias', 'numpy-worked-shared'),
    formativeQuiz('numpy-axis-check', '给 shape (2,3) 的 sensor_grid 每列加 [1,2,3]，column_bias 应是什么 shape？', 'To add [1,2,3] to sensor columns of a (2,3) sensor_grid, what shape should column_bias have?', 'column-vector', '(3,)', '(3,)', '(3,1)', '(3,1)', '传感器列是末轴；(3,) 会复用到两行，而 (3,1) 与单行相加会错误广播为 (3,3)。', 'The sensor axis is trailing: (3,) is reused across rows, while (3,1) with one row wrongly broadcasts to (3,3).', 'numpy-sensor-axis', 'numpy-worked-auxiliary'),
    formativeQuiz('numpy-copy-check', '中央差分扰动前必须做什么？', 'What is required before central-difference perturbation?', 'copy', '复制参数数组', 'Copy the parameter array', '创建共享 view', 'Create a shared view', '副本阻止相邻探测互相污染。', 'Copies stop neighboring probes from contaminating one another.', 'numpy-view-independent', 'numpy-code'),
    formativeQuiz('numpy-finite-check', '哪个 API 建立非有限值失败边界？', 'Which API establishes the non-finite failure boundary?', 'finite', 'np.isfinite', 'np.isfinite', 'np.reshape', 'np.reshape', 'shape 操作不会检测 NaN/Infinity。', 'Shape operations do not detect NaN/Infinity.', 'numpy-nan-will-raise', 'numpy-code'),
  ],
})

const studioLab: LabConfig = {
  id: 'math-to-code-studio-lab',
  title: copy('公式到代码中间值实验台', 'Formula-to-Code Intermediate-Value Studio'),
  type: 'hybrid',
  componentName: 'MathToCodeStudioLab',
  successCriteria: [
    copy('能从 X、w、b 逐层解释预测、残差、平方误差、MSE 与数值敏感度。', 'Explain predictions, residuals, squared errors, MSE, and numerical sensitivities from X, w, and b layer by layer.'),
    copy('能用 shape 与有限值反馈定位无效输入，并恢复共同起点。', 'Use shape and finite-value feedback to locate invalid input and restore the shared baseline.'),
  ],
}

const studioModule = promotedModule({
  id: 'math-to-code-guided-studio', key: 'studio',
  zhTitle: '引导式实践：从数学到可复现代码', enTitle: 'Guided Studio: From Mathematics to Reproducible Code',
  zhSubtitle: '按同一 notebook 顺序重建标量、向量、批量预测、MSE、数值敏感度、概率预告与失败诊断。',
  enSubtitle: 'Rebuild scalar, vector, batch, MSE, numerical-sensitivity, probability-preview, and failure-diagnosis evidence in one ordered notebook.',
  prerequisites: ['numpy-mathematics-implementation'], sourceNoteFile: 'math-to-code-guided-studio-sources.md',
  accent: '#0f766e', theme: '#ecfdf5', lab: studioLab,
  objectives: [
    ['用同一组 X、w、b、targets 重建完整预测与误差链。', 'Rebuild the complete prediction and error chain from one X, w, b, and targets contract.'],
    ['保留矩阵、目标、预测、残差、平方误差、MSE 与导数中间值。', 'Preserve matrix, target, prediction, residual, squared-error, MSE, and derivative intermediates.'],
    ['用 shape、有限值与循环 oracle 诊断静默错误。', 'Diagnose silent errors with shapes, finite checks, and a loop oracle.'],
    ['区分局部数值敏感度、概率预告与后续正式项目。', 'Separate local numerical sensitivity, the probability preview, and the later formal project.'],
  ],
  connections: [
    ['可审计中间值是把数学定义迁移到张量框架和训练代码的基础。', 'Auditable intermediates are the basis for moving mathematical definitions into tensor frameworks and training code.'],
    ['固定种子预告可复现随机实验，但不替代后续 Monte Carlo 课程。', 'The fixed-seed preview demonstrates reproducible randomness without replacing the later Monte Carlo lesson.'],
  ],
  concepts: [
    simpleConcept('studio-forward-error-chain', '前向预测与误差链', 'Forward Prediction and Error Chain', '\\hat y=Xw+b,\\quad L=\\frac1n\\sum_i(\\hat y_i-y_i)^2', [['X', 'shape (n,d) 的有限样本矩阵。', 'A finite sample matrix with shape (n,d).'], ['w', 'shape (d,) 的有限权重向量。', 'A finite weight vector with shape (d,).'], ['y', '预测后才进入比较的 shape (n,) 目标。', 'Shape-(n,) targets that enter only after prediction.']], '每一层保留名字与 shape，便于从 MSE 逆向定位。', 'Preserve names and shapes at each layer so a surprising MSE can be traced upstream.', '样本轴保留到逐行误差，特征轴在点积时消去。', 'The sample axis survives through row errors while the feature axis is contracted by the dot product.', 'predictions=[10,5]，residuals=[1,-2]，squares=[1,4]，MSE=2.5。', 'predictions=[10,5], residuals=[1,-2], squares=[1,4], and MSE=2.5.', '同一账本可迁移到批量神经网络前向计算与损失诊断。', 'The same ledger transfers to batched neural-network forward passes and loss diagnosis.'),
    simpleConcept('studio-local-sensitivity', '局部数值敏感度', 'Local Numerical Sensitivity', '\\frac{L(\\theta+h)-L(\\theta-h)}{2h}', [['theta', '一次只探测的当前参数。', 'The current parameter probed one at a time.'], ['h', '有限、为正的局部扰动。', 'A finite positive local perturbation.']], '中央差分读取当前点附近的损失变化率，不更新参数。', 'Central difference reads a local loss rate near the current point and does not update parameters.', '左右探测必须从同一中心的独立副本出发。', 'Left and right probes must start from independent copies of the same center.', '敏感度约为 w=[0,-5]、b=-1。', 'Sensitivities are approximately w=[0,-5] and b=-1.', '后续梯度下降还需要学习率、更新规则与迭代证据。', 'Later gradient descent still requires a learning rate, update rule, and iteration evidence.'),
  ],
  misconceptions: [
    misconception('studio-broadcast-is-alignment', '只要广播成功，预测与目标就已逐行对齐。', 'Successful broadcasting proves predictions and targets are row-aligned.', '广播只检查尾轴尺寸；损失前必须要求一维 shape 完全相同。', 'Broadcasting checks trailing sizes only; loss requires identical one-dimensional shapes.', '(2,) 减 (2,1) 会静默产生 (2,2) 交叉残差。', '(2,) minus (2,1) silently creates (2,2) cross residuals.'),
    misconception('studio-mse-is-enough', '只保留 MSE 足以诊断所有错误。', 'MSE alone is enough to diagnose every error.', '聚合会丢失样本方向与贡献，必须保留残差和平方误差。', 'Aggregation loses sample direction and contribution, so residuals and squared errors must remain visible.', '2.5 不能反推出 [1,-2] 与 [1,4]。', 'The scalar 2.5 cannot reconstruct [1,-2] and [1,4].'),
    misconception('studio-sensitivity-is-training', '数值敏感度计算已经训练了模型。', 'Computing numerical sensitivity has trained the model.', '敏感度只估计局部斜率；这里没有学习率、赋值或迭代。', 'Sensitivity only estimates local slope; no learning rate, assignment, or iteration occurs here.', '返回 -5 不会把 w2 改成任何新值。', 'Returning -5 does not change w2 to a new value.'),
    misconception('studio-seed-removes-randomness', '固定种子消除了随机现象。', 'A fixed seed removes randomness from the phenomenon.', '固定种子只复现同一伪随机序列，不回答完整概率问题。', 'A fixed seed only reproduces one pseudorandom sequence; it does not answer the full probability questions.', '重新创建 seed=2026 可核对表格，但不同种子通常给出不同频率。', 'Recreating seed=2026 verifies the table, while different seeds usually produce different frequencies.'),
  ],
  quizzes: [],
})

export const mathToCodeModules: MathLabModule[] = [
  functionsAndMappingsModule,
  vectorsModule,
  matricesModule,
  derivativesModule,
  numpyModule,
  studioModule,
]
