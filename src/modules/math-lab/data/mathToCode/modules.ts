import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  Misconception,
  QuizItem,
} from '../../types/mathLab.ts'

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
print(features.shape, weights.shape)  # (2,) (2,)
contributions = weights * features   # [8, -3]
weighted_sum = contributions.sum()   # 5
prediction = weights @ features + 5 # 10
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
print(features.shape, weights.shape)  # (2,) (2,)
contributions = weights * features   # [8, -3]
weighted_sum = contributions.sum()   # 5
prediction = weights @ features + 5 # 10
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
    quiz('mapping-control-check', 'w1 从 4 增至 5 时，prediction 怎样变化？', 'How does prediction change when w1 increases from 4 to 5?', 'plus-two', [['plus-two', '增加 2，从 10 到 12', 'It increases by 2, from 10 to 12'], ['plus-one', '增加 1', 'It increases by 1'], ['no-change', '不变', 'It does not change']], '因为固定 x1 = 2，所以 w1 每增加 1，w1x1 与 prediction 都增加 2。回看控制变量实验的直线切片。', 'Because x1 = 2 is fixed, each increase of 1 in w1 increases w1x1 and prediction by 2. Revisit the linear slice in the controlled experiment.', 'function-is-line', 'controlled-experiment'),
    quiz('mapping-error-check', '哪个 w1 让当前单样本预测恰好命中 target = 9？', 'Which w1 makes this one sample hit target = 9 exactly?', 'three-point-five', [['three-point-five', '3.5', '3.5'], ['four', '4', '4'], ['six', '6', '6']], '解 2w1+2=9 得 w1=3.5；这只说明当前样本命中，不代表所有样本都最优。回看目标只用于反馈的约定。', 'Solving 2w1+2=9 gives w1=3.5; this fits the current sample only and does not prove it is best for all samples. Revisit the rule that targets are feedback only.', 'target-leakage', 'controlled-experiment'),
  ],
  misconceptions: [
    misconception('negative-weight-useless', '负权重表示特征无效，应当删除。', 'A negative weight means the feature is useless and should be removed.', '负号表示当前线性规则中的影响方向；是否删除特征需要数据证据。', 'The sign indicates effect direction in the current linear rule; feature removal requires evidence from data.', '删除 -3 会把预测从 10 错改为 13。', 'Deleting -3 incorrectly changes prediction from 10 to 13.'),
    misconception('target-leakage', '目标 9 应放进预测函数，才能得到准确结果。', 'Target 9 should enter the prediction function to make it accurate.', '目标是预测后的监督反馈，不是新样本预测时可用的输入。', 'The target is supervision after prediction, not an available input for a new sample.', '先调用 predict_one，再单独计算 residual = prediction - target。', 'Call predict_one first, then separately compute residual = prediction - target.'),
    misconception('elementwise-is-prediction', 'weights * features 已经是加权预测。', 'weights * features is already the weighted prediction.', '逐元素乘法只得到贡献列表，还需求和并加偏置。', 'Elementwise multiplication only produces a contribution list; it must be summed and then biased.', '[8, -3] 是两个数；求和得 5，加偏置才得 10。', '[8, -3] contains two values; summing gives 5, and adding bias gives 10.'),
    misconception('function-is-line', '函数的图像必须是一条直线。', 'A function’s graph must be a straight line.', '函数的核心是合法输入对应唯一输出，图形可以弯曲或分段。', 'A function is defined by each valid input having one output; its graph may curve or be piecewise.', '本实验是直线，只因控制切片恰好为 2w1+2。', 'This experiment is linear only because the controlled slice happens to be 2w1+2.'),
  ],
  nextModuleIds: [], accent: '#d65a31', theme: '#fff1e8',
  sourceNoteFile: 'math-lab-calculus-route-sources.md',
  sourceReferences: [
    { label: copy('3Blue1Brown 微积分本质', '3Blue1Brown Essence of Calculus'), href: 'https://www.3blue1brown.com/topics/calculus', usage: copy('用于函数图像、输入输出与局部变化的可视化直觉；本课不复制其媒体资产。', 'Used for visual intuition about function graphs, input-output behavior, and local change; no media assets are copied into this lesson.') },
    { label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'), href: 'https://mml-book.github.io/', license: 'CC BY-NC-SA 4.0', usage: copy('用于核对函数、向量记号与线性预测的数学约定，并支撑下一课的点积 handoff。', 'Used to verify function and vector notation and the linear-prediction convention, and to support the dot-product handoff to the next lesson.') },
  ],
}

export const mathToCodeModules: MathLabModule[] = [functionsAndMappingsModule]
