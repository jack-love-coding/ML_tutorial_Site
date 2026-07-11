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

const quiz = (id: string, zhPrompt: string, enPrompt: string, answer: string, choices: Array<[string, string, string]>, zhExplanation: string, enExplanation: string, tag: string): QuizItem => ({
  id, type: 'single-choice', prompt: copy(zhPrompt, enPrompt), answer,
  choices: choices.map(([choiceId, zh, en]) => ({ id: choiceId, label: copy(zh, en) })),
  explanation: copy(zhExplanation, enExplanation), misconceptionTags: [tag],
})

const misconception = (id: string, zhStatement: string, enStatement: string, zhCorrection: string, enCorrection: string, zhExample: string, enExample: string): Misconception => ({
  id, statement: copy(zhStatement, enStatement), correction: copy(zhCorrection, enCorrection), example: copy(zhExample, enExample),
})

const sections: MathLabSection[] = [
  section('opening-question', '1. 开场问题：四行代码做了什么？', '1. Opening Question: What Do Four Lines of Code Do?', md`
先不要运行代码：

\`features = [2, 3]\`，\`weights = [4, -1]\`，\`bias = 5\`，\`prediction = 10\`。

先写下：为什么两个输入得到一个输出？哪些量来自样本，哪些量由模型调整？若只把 \`weights[0]\` 从 4 改成 5，预测如何变化？本课建立可反复核验的链条：**输入与参数 → 明确规则 → 唯一输出 → 与目标比较 → 下一次实验**。练习只用于形成理解，不计分。`, md`
Do not run the code yet:

\`features = [2, 3]\`, \`weights = [4, -1]\`, \`bias = 5\`, and \`prediction = 10\`.

First write down: Why do two inputs produce one output? Which quantities come from the sample, and which can the model adjust? If only \`weights[0]\` changes from 4 to 5, how will the prediction change? This lesson builds a reusable audit chain: **inputs and parameters → explicit rule → unique output → comparison with target → next experiment**. The exercises are formative and not graded.`),
  section('prerequisite-recap', '2. 先备知识：代入、坐标与列表', '2. Prerequisites: Substitution, Coordinates, and Lists', md`
在 $f(x)=2x+1$ 中代入 $x=3$，得到 $f(3)=7$。点 $(3,7)$ 依次记录输入和输出；图连接多个计算结果，但不改变规则。Python 列表的位置同样有意义：\`features[0] = 2\` 是基础任务数，\`features[1] = 3\` 是提示请求数。交换它们会改变权重与特征的配对。

检查：$g(a)=4a-1$ 时 $g(2)=7$。4 和 -1 在比较不同 $a$ 时固定，但“常量、变量、参数”仍取决于当前观察问题。`, md`
Substitute $x=3$ into $f(x)=2x+1$ to obtain $f(3)=7$. The point $(3,7)$ records input first and output second; a graph connects several computed results without changing the rule. Position also matters in a Python list: \`features[0] = 2\` is the number of base tasks, while \`features[1] = 3\` is the number of hint requests. Swapping them changes the feature-weight pairing.

Check: for $g(a)=4a-1$, $g(2)=7$. The values 4 and -1 stay fixed while comparing different values of $a$, although whether a quantity is called a constant, variable, or parameter still depends on the question being observed.`),
  section('shared-prediction-task', '3. 共同预测任务：分清角色', '3. Shared Prediction Task: Separate the Roles', md`
预测对象是小游戏关卡完成时长。$x_1=2$ 个基础任务、$x_2=3$ 次提示请求；$w_1=4$ 分钟/任务、$w_2=-1$ 分钟/提示、$b=5$ 分钟。模型输出 $\\hat y$，数据提供目标 $y$。

$$\\hat y=w_1x_1+w_2x_2+b=8+(-3)+5=10$$

因此 \`features = [2, 3]\`、\`weights = [4, -1]\`、\`bias = 5\` 产生 \`prediction = 10\` 分钟；\`target = 9\` 分钟只在预测后参与比较。紧凑式 $\\hat y=\\mathbf w^\\mathsf T\\mathbf x+b$ 与纯文本 \`y_hat = w^T x + b\` 表示同一规则。`, md`
The prediction is the completion time of a small game level. Here $x_1=2$ base tasks and $x_2=3$ hint requests; $w_1=4$ minutes/task, $w_2=-1$ minute/hint, and $b=5$ minutes. The model produces $\\hat y$, while the data provide target $y$.

$$\\hat y=w_1x_1+w_2x_2+b=8+(-3)+5=10$$

Thus \`features = [2, 3]\`, \`weights = [4, -1]\`, and \`bias = 5\` produce \`prediction = 10\` minutes. The \`target = 9\` minutes enters only after prediction. The compact form $\\hat y=\\mathbf w^\\mathsf T\\mathbf x+b$ and plain text \`y_hat = w^T x + b\` express the same rule.`),
  section('mapping-intuition', '4. 映射直觉：有合同的机器', '4. Mapping Intuition: A Machine with a Contract', md`
函数的入口、步骤和出口都应明确。固定参数时，不同输入可以得到同一输出：$F([2,3];[4,-1],5)=10$，$F([1,-1];[4,-1],5)=10$；多对一不违反函数定义，同一组完整输入无缘无故得到两个输出才违反。

参数像旋钮。只把 $w_1$ 调到 5，$F([2,3];[5,-1],5)=12$。复杂流程还能组合为 $r\\to\\mathbf x\\to\\hat y\\to\\hat y-y$；比较目标之前必须先有预测。`, md`
A function’s entrance, steps, and exit must be explicit. With parameters fixed, different inputs may share one output: $F([2,3];[4,-1],5)=10$ and $F([1,-1];[4,-1],5)=10$. Many-to-one is valid; one identical complete input producing two unexplained outputs is not.

Parameters act like knobs. Changing only $w_1$ to 5 gives $F([2,3];[5,-1],5)=12$. Larger workflows can compose mappings as $r\\to\\mathbf x\\to\\hat y\\to\\hat y-y$; a prediction must exist before it can be compared with a target.`),
  section('formal-definition', '5. 正式定义：定义域、输出与参数', '5. Formal Definition: Domain, Output, and Parameters', md`
函数 $f:A\\to B$ 让定义域 $A$ 中每个合法输入对应陪域 $B$ 中恰好一个输出。本任务可写为 $F:\\mathbb R^2\\times\\mathbb R^2\\times\\mathbb R\\to\\mathbb R$：两个特征、两个权重和一个偏置映射成一个预测。特征与权重必须等长，否则配对规则不完整。

一次前向计算中所有数值固定；比较样本时固定参数、改变 $\\mathbf x$；控制实验固定 $\\mathbf x,w_2,b,y$，只改变 $w_1$；训练则用样本反馈逐步调整参数。固定其他量后，$\\hat y(w_1)=2w_1+2$，横轴 $w_1$、纵轴 $\\hat y$。`, md`
A function $f:A\\to B$ maps every valid input in domain $A$ to exactly one output in codomain $B$. This task can be written $F:\\mathbb R^2\\times\\mathbb R^2\\times\\mathbb R\\to\\mathbb R$: two features, two weights, and one bias map to one prediction. Features and weights must have equal length or the pairing rule is incomplete.

All values are fixed during one forward pass. Comparing samples holds parameters fixed and changes $\\mathbf x$; the controlled experiment fixes $\\mathbf x,w_2,b,y$ and changes only $w_1$; training uses sample feedback to update parameters over time. Holding the other quantities fixed gives $\\hat y(w_1)=2w_1+2$, with $w_1$ on the horizontal axis and $\\hat y$ on the vertical axis.`),
  section('worked-prediction', '6. 例一：完整手算预测', '6. Example One: A Complete Hand Calculation', md`
先写规则 $\\hat y=w_1x_1+w_2x_2+b$，再对齐 $x_1=2,x_2=3,w_1=4,w_2=-1,b=5$。配对贡献为 $4\\times2=8$ 与 $(-1)\\times3=-3$；相加并补偏置：$8+(-3)+5=10$。

预测完成后读取 \`target = 9\`，按本单元约定 $r=\\hat y-y=10-9=1$。正残差表示预测时长高 1 分钟。反向核验：先算 $w_2x_2+b=-3+5=2$，再加 8，仍得 10。`, md`
Write the rule $\\hat y=w_1x_1+w_2x_2+b$ before aligning $x_1=2,x_2=3,w_1=4,w_2=-1,b=5$. The paired contributions are $4\\times2=8$ and $(-1)\\times3=-3$; summing them and adding bias gives $8+(-3)+5=10$.

Only after prediction do we read \`target = 9\`. Using this unit’s convention, $r=\\hat y-y=10-9=1$. The positive residual says the predicted duration is one minute high. Cross-check by grouping $w_2x_2+b=-3+5=2$ first and then adding 8; the result is still 10.`),
  section('worked-motion-example', '7. 例二：运动图中的输入与参数', '7. Example Two: Inputs and Parameters in a Motion Graph', md`
辅助例子 $s(t)=s_0+vt$ 中，$t$ 是秒，$s(t)$ 是米，$s_0=2$ 米，$v=3$ 米/秒。于是 $s(4)=2+3\\times4=14$ 米；$t=0,1,2,3,4$ 对应位置 $2,5,8,11,14$，每秒增加 3。

点 $(4,14)$ 必须读成输入 4 秒、输出 14 米。运动例子只有一个输入，预测任务有两个特征；速度与权重都影响映射，但物理含义不同，类比不能抹去边界。`, md`
In the auxiliary example $s(t)=s_0+vt$, $t$ is measured in seconds, $s(t)$ in metres, $s_0=2$ metres, and $v=3$ metres/second. Therefore $s(4)=2+3\\times4=14$ metres; times $t=0,1,2,3,4$ map to positions $2,5,8,11,14$, increasing by 3 each second.

The point $(4,14)$ must be read as input 4 seconds and output 14 metres. The motion example has one input, while the prediction task has two features. Velocity and weight both affect a mapping, but their physical meanings differ; the analogy must preserve that boundary.`),
  section('python-translation', '8. 从公式逐行翻译到 Python', '8. Translate the Formula to Python Line by Line', md`
保留中间量：\`contribution_1 = 4 * 2  # 8\`，\`contribution_2 = -1 * 3  # -3\`，\`weighted_sum = 5\`，\`prediction = 10\`，最后才算 \`residual = prediction - target  # 1\`。

\`predict_one(features, weights, bias)\` 应先检查两个列表等长，再逐项乘、求和并加偏置。NumPy 中 \`weights * features\` 只得到 \`[8, -3]\`，仍不是标量；\`weights @ features\` 得到 5，再加偏置得到 10。数学函数强调确定映射；Python \`def\` 只是实现方式，也可能包含状态或随机性。`, md`
Keep every intermediate value: \`contribution_1 = 4 * 2  # 8\`, \`contribution_2 = -1 * 3  # -3\`, \`weighted_sum = 5\`, and \`prediction = 10\`; only then compute \`residual = prediction - target  # 1\`.

\`predict_one(features, weights, bias)\` should first check equal list lengths, then multiply paired entries, sum them, and add the bias. In NumPy, \`weights * features\` only produces \`[8, -3]\`, which is not yet a scalar. \`weights @ features\` gives 5, and adding the bias gives 10. A mathematical function emphasizes a deterministic mapping; a Python \`def\` is merely one implementation and may also contain state or randomness.`),
  section('controlled-experiment', '9. 控制变量实验：只改变 w1', '9. Controlled Experiment: Change Only w1', md`
固定 $\\mathbf x=[2,3],w_2=-1,b=5,y=9$，**只改变 $w_1$**，因此 $\\hat y=2w_1+2$。$w_1=2,3,4,5,6$ 时，预测依次为 $6,8,10,12,14$；残差为 $-3,-1,1,3,5$；平方误差为 $9,1,1,9,25$。$w_1=3.5$ 时预测恰好为 9。

### 形成性反馈

- 若认为 $w_1$ 从 4 到 5 只让预测增加 1，回看固定的 $x_1=2$，所以 $\\Delta\\hat y=2\\Delta w_1$。
- 若认为预测越大越好，回看目标 9：误差读的是距离。
- 若 $w_1=2$ 算出 0，检查偏置 $+5$ 与负号。

实验下方的表格保留所有结果，即使关闭动画或启用 reduced motion，教学信息也不会丢失。`, md`
Fix $\\mathbf x=[2,3],w_2=-1,b=5,y=9$ and **change only $w_1$**, so $\\hat y=2w_1+2$. For $w_1=2,3,4,5,6$, predictions are $6,8,10,12,14$; residuals are $-3,-1,1,3,5$; squared errors are $9,1,1,9,25$. At $w_1=3.5$, the prediction is exactly 9.

### Formative feedback

- If you expected changing $w_1$ from 4 to 5 to add only 1, revisit fixed $x_1=2$: $\\Delta\\hat y=2\\Delta w_1$.
- If you expected a larger prediction to be better, revisit target 9: error measures distance.
- If you obtained 0 at $w_1=2$, check bias $+5$ and the negative sign.

The table below the experiment preserves every result, so no teaching information is lost when animation is disabled or reduced motion is enabled.`, ['prediction-mapping-lab']),
  section('misconceptions', '10. 常见误区与修复', '10. Common Misconceptions and Repairs', md`
负权重不表示特征无效：删除 $(-1)\\times3$ 会把预测误算成 13。目标也不能放进预测函数；真实部署时目标未知，它只在预测后提供监督反馈。\`weights * features\` 只完成配对乘法，还需要求和与偏置。函数也不等于直线；本实验出现直线，只因固定其他量后规则恰好是 $2w_1+2$。

修复方法是记录变量角色、长度、逐项贡献、加权和、偏置、预测、目标与残差；每次实验明确写出固定量与唯一改变的量。`, md`
A negative weight does not make a feature useless: deleting $(-1)\\times3$ would incorrectly change the prediction to 13. The target must not enter the prediction function either; it is unknown at deployment and provides supervision only after prediction. \`weights * features\` performs paired multiplication but still needs summation and bias. Nor is every function a straight line; this experiment is linear only because the controlled slice happens to be $2w_1+2$.

Repair these errors by logging variable roles, lengths, paired contributions, weighted sum, bias, prediction, target, and residual. For every experiment, state all fixed quantities and the single quantity being changed.`),
  section('layered-practice', '11. 三层练习：解释、手算、观察', '11. Three-Layer Practice: Explain, Calculate, Observe', md`
这些练习用于形成理解，不计分。概念层：把 \`features\`、\`weights\`、\`bias\`、\`prediction\`、\`target\` 分类，并解释两个不同输入都映射到 10 为什么仍是函数。手算层：只把偏置改为 2，预测为 7、残差为 -2；补全 $w_1=3,3.5,4$ 对应预测 $8,9,10$。观察层：比较 $x_1=2$ 的 $2w_1+2$ 与 $x_1=1$ 的 $w_1+2$，说明特征值怎样改变参数敏感度。

调试练习：设计日志区分“特征顺序错位”“漏加偏置”“把目标放进预测”。参考思路必须说明依据，而不能只给最终数字。`, md`
These exercises are formative and not graded. Concept layer: classify \`features\`, \`weights\`, \`bias\`, \`prediction\`, and \`target\`, then explain why two different inputs mapping to 10 can still be a function. Calculation layer: change only bias to 2 to obtain prediction 7 and residual -2; complete the predictions $8,9,10$ for $w_1=3,3.5,4$. Observation layer: compare $2w_1+2$ when $x_1=2$ with $w_1+2$ when $x_1=1$, and explain how a feature value changes sensitivity to its parameter.

Debugging exercise: design a log that distinguishes “feature order mismatch,” “missing bias,” and “target leaked into prediction.” A reference response must state its reasoning, not merely the final number.`),
  section('lesson-handoff', '12. 小结与向量课 handoff', '12. Summary and Handoff to the Vector Lesson', md`
本课已把合法输入、确定规则、唯一输出和监督反馈分开。你应能重建 $\\hat y=w_1x_1+w_2x_2+b$，用 \`features = [2, 3]\`、\`weights = [4, -1]\`、\`bias = 5\` 算出 \`prediction = 10\`，再与 \`target = 9\` 得到残差 1。

下一课直接接收 $\\mathbf x=[2,3]$ 与 $\\mathbf w=[4,-1]$，解释顺序、维度、方向，以及为何 $\\mathbf w^\\mathsf T\\mathbf x=4\\times2+(-1)\\times3=5$ 称为点积。handoff 卡：\`w^T x = 5\`，\`y_hat = 5 + 5 = 10\`，\`residual = 10 - 9 = 1\`。`, md`
This lesson has separated valid input, deterministic rule, unique output, and supervisory feedback. You should be able to reconstruct $\\hat y=w_1x_1+w_2x_2+b$, use \`features = [2, 3]\`, \`weights = [4, -1]\`, and \`bias = 5\` to obtain \`prediction = 10\`, then compare with \`target = 9\` to obtain residual 1.

The next lesson receives $\\mathbf x=[2,3]$ and $\\mathbf w=[4,-1]$ unchanged. It explains order, dimension, direction, and why $\\mathbf w^\\mathsf T\\mathbf x=4\\times2+(-1)\\times3=5$ is a dot product. Handoff card: \`w^T x = 5\`, \`y_hat = 5 + 5 = 10\`, and \`residual = 10 - 9 = 1\`.`),
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
    quiz('mapping-role-check', '哪个量不参与生成本次 prediction？', 'Which quantity does not generate the current prediction?', 'target', [['target', 'target = 9', 'target = 9'], ['bias', 'bias = 5', 'bias = 5'], ['features', 'features = [2, 3]', 'features = [2, 3]']], '目标只在预测完成后用于计算残差；把目标放进预测会造成答案泄漏。', 'The target is used only after prediction to compute the residual; feeding it into prediction would leak the answer.', 'target-leakage'),
    quiz('mapping-contribution-check', '第二个特征对预测的贡献是多少？', 'What is the second feature’s contribution?', 'minus-three', [['minus-three', '-3', '-3'], ['three', '+3', '+3'], ['zero', '0', '0']], '贡献是 w2x2 = (-1)×3 = -3；负号表示方向，不能把这一项删除。', 'The contribution is w2x2 = (-1)×3 = -3; the negative sign carries direction and does not delete the term.', 'negative-weight-useless'),
    quiz('mapping-control-check', 'w1 从 4 增至 5 时，prediction 怎样变化？', 'How does prediction change when w1 increases from 4 to 5?', 'plus-two', [['plus-two', '增加 2，从 10 到 12', 'It increases by 2, from 10 to 12'], ['plus-one', '增加 1', 'It increases by 1'], ['no-change', '不变', 'It does not change']], '因为固定 x1 = 2，所以 w1 每增加 1，w1x1 与 prediction 都增加 2。', 'Because x1 = 2 is fixed, each increase of 1 in w1 increases w1x1 and prediction by 2.', 'parameter-change-one-to-one'),
    quiz('mapping-error-check', '哪个 w1 让当前单样本预测恰好命中 target = 9？', 'Which w1 makes this one sample hit target = 9 exactly?', 'three-point-five', [['three-point-five', '3.5', '3.5'], ['four', '4', '4'], ['six', '6', '6']], '解 2w1+2=9 得 w1=3.5；这只说明当前样本命中，不代表所有样本都最优。', 'Solving 2w1+2=9 gives w1=3.5; this fits the current sample only and does not prove it is best for all samples.', 'larger-is-better'),
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
    { label: copy('批准的中文母稿', 'Approved Chinese master manuscript'), href: '/docs/curriculum/v3/math-to-code/01-functions-mappings.zh-CN.md', usage: copy('课程结构、数值、例题、误区、练习与 handoff 的直接来源。', 'Direct source for lesson structure, numbers, examples, misconceptions, practice, and handoff.') },
  ],
}

export const mathToCodeModules: MathLabModule[] = [functionsAndMappingsModule]
