import type { LocalizedCopy, StorySection } from '../../../types/ml'
import type { AiOverviewChapterId, LearningParadigm } from '../types'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

type AiWorldNodeId = 'ai' | 'machine-learning' | 'deep-learning' | 'generative-ai' | 'llm'
type AiWorldNode = {
  id: AiWorldNodeId
  parentId: AiWorldNodeId | null
  label: LocalizedCopy
  relationship: LocalizedCopy
}

export const aiWorldNodes: readonly AiWorldNode[] = [
  { id: 'ai', parentId: null, label: loc('人工智能', 'Artificial intelligence'), relationship: loc('最广的范围：机器执行涉及感知、推理、规划或学习的任务。', 'The broadest scope: machines perform tasks involving perception, reasoning, planning, or learning.') },
  { id: 'machine-learning', parentId: 'ai', label: loc('机器学习', 'Machine learning'), relationship: loc('人工智能的一部分：系统从数据与反馈中调整行为。', 'A part of AI in which systems adjust behavior from data and feedback.') },
  { id: 'deep-learning', parentId: 'machine-learning', label: loc('深度学习', 'Deep learning'), relationship: loc('机器学习的一部分：多层参数化结构学习数据表示。', 'A part of ML that learns representations through many parameterized layers.') },
  { id: 'generative-ai', parentId: 'deep-learning', label: loc('生成式人工智能', 'Generative AI'), relationship: loc('在本入门地图中位于深度学习内，用于生成新的内容。', 'Within deep learning on this introductory map, it generates new content.') },
  { id: 'llm', parentId: 'generative-ai', label: loc('大语言模型', 'Large language model'), relationship: loc('以语言处理与生成为中心的大规模生成模型。', 'A large generative model centered on processing and generating language.') },
] as const

type MlProcessStepId = 'data' | 'roles' | 'model' | 'prediction' | 'error' | 'parameter-update' | 'unseen-evaluation'
type MlProcessStep = { id: MlProcessStepId; label: LocalizedCopy; description: LocalizedCopy }

export const mlProcessSteps: readonly MlProcessStep[] = [
  { id: 'data', label: loc('数据', 'Data'), description: loc('从学习记录收集可复现的训练样本。', 'Collect reproducible training examples from learner records.') },
  { id: 'roles', label: loc('变量角色', 'Variable roles'), description: loc('区分学习者标识、输入特征与目标变量。', 'Separate learner identifiers, input features, and the target variable.') },
  { id: 'model', label: loc('模型', 'Model'), description: loc('模型用参数表达从特征到目标的映射。', 'The model uses parameters to express a mapping from features to the target.') },
  { id: 'prediction', label: loc('预测', 'Prediction'), description: loc('当前参数为训练样本产生预测 ŷ。', 'Current parameters produce a prediction ŷ for a training example.') },
  { id: 'error', label: loc('误差', 'Error'), description: loc('比较预测 ŷ 与已观察目标 y。', 'Compare prediction ŷ with the observed target y.') },
  { id: 'parameter-update', label: loc('参数更新', 'Parameter update'), description: loc('根据误差信号调整模型参数。', 'Adjust model parameters using the error signal.') },
  { id: 'unseen-evaluation', label: loc('未见数据评估', 'Unseen-data evaluation'), description: loc('在未参与参数更新的数据上检查模型。', 'Check the model on data that did not participate in parameter updates.') },
] as const

export const aiOverviewVisualCopy = {
  nestedMap: loc('AI 概念嵌套地图', 'Nested AI concept map'),
  traditionalAi: loc('传统人工智能方法', 'Traditional AI methods'),
  currentState: loc('当前状态', 'Current state'),
  candidatesRules: loc('候选项或规则', 'Candidates or rules'),
  selectedStep: loc('选中的一步', 'Selected step'),
  result: loc('结果', 'Result'),
  previous: loc('上一步', 'Previous'),
  next: loc('下一步', 'Next'),
  reset: loc('重置', 'Reset'),
  currentStep: loc('当前步骤', 'Current step'),
  processTrace: loc('机器学习过程追踪', 'Machine-learning process trace'),
  learnerId: loc('学习者标识', 'Learner ID'),
  feature: loc('输入特征', 'Feature'),
  target: loc('目标变量', 'Target'),
  unseenData: loc('未见数据', 'Unseen data'),
  paradigmComparison: loc('学习范式比较', 'Learning-paradigm comparison'),
  availableInformation: loc('可用信息', 'Available information'),
  learningSignal: loc('学习信号', 'Learning signal'),
  learnedObject: loc('学习对象', 'Learned object'),
  output: loc('输出', 'Output'),
  typicalProblem: loc('典型问题', 'Typical problem'),
  applications: loc('应用', 'Applications'),
  decisionTree: loc('学习范式决策树', 'Learning-paradigm decision tree'),
  learningAssistantMap: loc('智能学习助手方法图', 'Learning-assistant method map'),
  llmRoute: loc('通往大语言模型的路线', 'Route to LLMs'),
  knowledgeMap: loc('AI 概览知识图', 'AI overview knowledge map'),
  print: loc('打印知识图', 'Print knowledge map'),
} as const

type LearningAssistantAlgorithmId = 'linear-regression' | 'k-means' | 'q-learning'
type LearningAssistantAlgorithm = {
  id: LearningAssistantAlgorithmId
  label: LocalizedCopy
  taskRole: LocalizedCopy
  input: LocalizedCopy
  learningSignal: LocalizedCopy
  output: LocalizedCopy
}

export const learningAssistantAlgorithms: readonly LearningAssistantAlgorithm[] = [
  {
    id: 'linear-regression',
    label: loc('线性回归', 'Linear regression'),
    taskRole: loc('预测下一次练习分数。', 'Predict the next exercise score.'),
    input: loc('练习时长、历史分数与已观察目标。', 'Practice duration, historical score, and observed targets.'),
    learningSignal: loc('预测分数与目标分数之间的误差。', 'Error between predicted and target scores.'),
    output: loc('连续的分数预测。', 'A continuous score prediction.'),
  },
  {
    id: 'k-means',
    label: loc('K-means 聚类', 'K-means clustering'),
    taskRole: loc('发现相似的学习模式。', 'Find similar learning patterns.'),
    input: loc('没有分组答案的正确率与作答时间。', 'Accuracy and response time without group answers.'),
    learningSignal: loc('样本到簇中心的距离。', 'Distance from examples to cluster centers.'),
    output: loc('需要人工解释的学习者簇。', 'Learner clusters that require human interpretation.'),
  },
  {
    id: 'q-learning',
    label: loc('Q-learning', 'Q-learning'),
    taskRole: loc('选择下一道练习。', 'Select the next exercise.'),
    input: loc('掌握状态、可选难度与行动后的奖励。', 'Mastery state, available difficulty, and post-action rewards.'),
    learningSignal: loc('即时与延迟奖励形成的回报。', 'Return formed from immediate and delayed rewards.'),
    output: loc('每个掌握状态下的练习选择。', 'An exercise choice for each mastery state.'),
  },
] as const

type ParadigmDecisionQuestionId = 'explicit-target' | 'sequential-reward' | 'structure-without-targets'
type ParadigmDecisionQuestion = {
  id: ParadigmDecisionQuestionId
  question: LocalizedCopy
  yes: LocalizedCopy
  no: LocalizedCopy
}

export const paradigmDecisionQuestions: readonly ParadigmDecisionQuestion[] = [
  { id: 'explicit-target', question: loc('每个训练样本是否有明确的目标答案？', 'Does each training example have an explicit target answer?'), yes: loc('是：检查监督学习。', 'Yes: inspect supervised learning.'), no: loc('否：继续检查反馈结构。', 'No: continue checking the feedback structure.') },
  { id: 'sequential-reward', question: loc('是否要连续行动，并从即时或延迟奖励中学习？', 'Must the system act sequentially and learn from immediate or delayed reward?'), yes: loc('是：检查强化学习。', 'Yes: inspect reinforcement learning.'), no: loc('否：继续检查数据中的结构。', 'No: continue checking structure in the data.') },
  { id: 'structure-without-targets', question: loc('是否要在没有目标标签时发现结构？', 'Must the system discover structure without target labels?'), yes: loc('是：检查无监督学习。', 'Yes: inspect unsupervised learning.'), no: loc('否：重新描述问题与可用信息。', 'No: restate the problem and available information.') },
] as const

type ScenarioCard = {
  id: LearningParadigm
  title: LocalizedCopy
  problem: LocalizedCopy
  availableInformation: LocalizedCopy
  learningSignal: LocalizedCopy
  output: LocalizedCopy
}

export const aiOverviewScenarioCards: readonly ScenarioCard[] = [
  {
    id: 'supervised',
    title: loc('预测下一次练习分数', 'Predict the next exercise score'),
    problem: loc('根据学习记录预测连续数值。', 'Predict a continuous value from learning records.'),
    availableInformation: loc('练习时长、历史分数和已观察到的下一次分数。', 'Practice duration, historical score, and observed next score.'),
    learningSignal: loc('预测 ŷ 与标签 y 的误差。', 'The error between prediction ŷ and label y.'),
    output: loc('下一次练习分数 ŷ。', 'Predicted next exercise score ŷ.'),
  },
  {
    id: 'unsupervised',
    title: loc('发现相似学习模式', 'Discover similar learning patterns'),
    problem: loc('在没有分组答案时寻找结构。', 'Find structure without provided group answers.'),
    availableInformation: loc('正确率与平均作答时间。', 'Accuracy and mean response time.'),
    learningSignal: loc('点到中心的距离与组内紧凑程度。', 'Distances to centers and within-group compactness.'),
    output: loc('K 个需要人工解释的簇。', 'K clusters that require human interpretation.'),
  },
  {
    id: 'reinforcement',
    title: loc('选择下一道练习', 'Choose the next exercise'),
    problem: loc('在连续决策中形成长期有效的策略。', 'Form a useful long-term policy through sequential decisions.'),
    availableInformation: loc('当前掌握状态、可选难度和行动后的奖励。', 'Current mastery state, available difficulties, and post-action rewards.'),
    learningSignal: loc('行动后得到的即时与延迟奖励。', 'Immediate and delayed rewards received after actions.'),
    output: loc('每个状态下的练习选择策略。', 'An exercise-selection policy for each state.'),
  },
] as const

type TraditionalAiStepId = 'current-state' | 'candidate-set' | 'selected-step' | 'result'
type TraditionalAiStep = { id: TraditionalAiStepId; label: LocalizedCopy; description: LocalizedCopy }
type TraditionalAiMethod = {
  id: 'search' | 'planning' | 'expert-system' | 'logic'
  label: LocalizedCopy
  mechanism: LocalizedCopy
  steps: readonly TraditionalAiStep[]
}

export const traditionalAiMethods: readonly TraditionalAiMethod[] = [
  {
    id: 'search',
    label: loc('搜索', 'Search'),
    mechanism: loc('枚举候选状态，按目标选择下一步。', 'Enumerate candidate states and select the next step toward a goal.'),
    steps: [
      { id: 'current-state', label: loc('当前状态', 'Current state'), description: loc('机器人位于迷宫入口。', 'The robot is at the maze entrance.') },
      { id: 'candidate-set', label: loc('候选集合', 'Candidate set'), description: loc('比较可到达的上、右两格。', 'Compare the reachable upper and right cells.') },
      { id: 'selected-step', label: loc('选中一步', 'Selected step'), description: loc('选择离目标估计更近的右格。', 'Select the right cell estimated closer to the goal.') },
      { id: 'result', label: loc('结果', 'Result'), description: loc('机器人右移，并从新位置继续搜索。', 'The robot moves right and continues searching from the new state.') },
    ],
  },
  {
    id: 'planning',
    label: loc('规划', 'Planning'),
    mechanism: loc('组合动作与前提，形成从当前状态到目标的计划。', 'Compose actions and preconditions into a plan from current state to goal.'),
    steps: [
      { id: 'current-state', label: loc('当前状态', 'Current state'), description: loc('学习者要修 Transformer，但尚未完成概率。', 'The learner wants Transformer but has not completed probability.') },
      { id: 'candidate-set', label: loc('可用动作', 'Applicable actions'), description: loc('检查概率、深度学习与 Transformer 的先修条件。', 'Check prerequisites for probability, deep learning, and Transformer.') },
      { id: 'selected-step', label: loc('选中一步', 'Selected step'), description: loc('先安排满足当前前提的概率课程。', 'Schedule probability first because its current preconditions hold.') },
      { id: 'result', label: loc('结果', 'Result'), description: loc('得到概率→深度学习→Transformer 的可执行计划。', 'Produce an executable probability → deep learning → Transformer plan.') },
    ],
  },
  {
    id: 'expert-system',
    label: loc('专家系统', 'Expert system'),
    mechanism: loc('匹配知识库中的条件—结论规则。', 'Match condition–conclusion rules in a knowledge base.'),
    steps: [
      { id: 'current-state', label: loc('当前事实', 'Current state'), description: loc('设备高温且风扇无转速。', 'The device is hot and the fan reports zero speed.') },
      { id: 'candidate-set', label: loc('候选规则', 'Candidate rules'), description: loc('知识库提供过热、传感器故障和风扇故障规则。', 'The knowledge base offers overheat, sensor-failure, and fan-failure rules.') },
      { id: 'selected-step', label: loc('选中规则', 'Selected step'), description: loc('匹配“高温且零转速→检查风扇”。', 'Match “high temperature and zero speed → inspect fan.”') },
      { id: 'result', label: loc('结果', 'Result'), description: loc('输出检查风扇与断电保护建议。', 'Output fan-inspection and power-protection advice.') },
    ],
  },
  {
    id: 'logic',
    label: loc('逻辑推理', 'Logic reasoning'),
    mechanism: loc('从事实和逻辑规则推出可证明的结论。', 'Derive provable conclusions from facts and logical rules.'),
    steps: [
      { id: 'current-state', label: loc('当前事实', 'Current state'), description: loc('所有进阶课程都需先修检查；本课是进阶课程。', 'All advanced courses require prerequisite checks; this is an advanced course.') },
      { id: 'candidate-set', label: loc('可用规则', 'Candidate rules'), description: loc('选择全称规则与当前课程事实。', 'Use the universal rule and the fact about this course.') },
      { id: 'selected-step', label: loc('推理一步', 'Selected step'), description: loc('把“本课”代入“所有进阶课程”。', 'Substitute “this course” into “all advanced courses.”') },
      { id: 'result', label: loc('结论', 'Result'), description: loc('推出本课需要先修检查。', 'Conclude that this course requires a prerequisite check.') },
    ],
  },
]

type LearningParadigmRow = {
  id: LearningParadigm
  availableInfo: LocalizedCopy
  learningSignal: LocalizedCopy
  learnedObject: LocalizedCopy
  output: LocalizedCopy
  typicalProblem: LocalizedCopy
  applications: readonly LocalizedCopy[]
}

export const learningParadigmRows: readonly LearningParadigmRow[] = [
  {
    id: 'supervised',
    availableInfo: loc('输入样本与对应目标标签。', 'Input examples paired with target labels.'),
    learningSignal: loc('预测与真实标签之间的误差。', 'Error between prediction and observed label.'),
    learnedObject: loc('从输入到目标的映射。', 'A mapping from inputs to targets.'),
    output: loc('连续预测值或类别。', 'A continuous prediction or class.'),
    typicalProblem: loc('为新样本预测已定义的目标。', 'Predict a defined target for a new example.'),
    applications: [loc('垃圾邮件检测', 'Spam detection'), loc('电力需求预测', 'Electricity-demand prediction')],
  },
  {
    id: 'unsupervised',
    availableInfo: loc('没有目标标签的样本。', 'Examples without target labels.'),
    learningSignal: loc('距离、密度或重建质量等结构准则。', 'Structural criteria such as distance, density, or reconstruction quality.'),
    learnedObject: loc('数据中的分组、结构或低维表示。', 'Groups, structure, or lower-dimensional representations in data.'),
    output: loc('需要人工解释的簇或表示。', 'Clusters or representations that require interpretation.'),
    typicalProblem: loc('在没有答案标签时发现结构。', 'Discover structure without answer labels.'),
    applications: [loc('新闻主题分组', 'News-topic grouping'), loc('图像颜色压缩', 'Image color compression')],
  },
  {
    id: 'reinforcement',
    availableInfo: loc('状态、可选动作与行动后的奖励。', 'States, available actions, and rewards after actions.'),
    learningSignal: loc('即时与延迟回报形成的修正。', 'Corrections driven by immediate and delayed return.'),
    learnedObject: loc('状态下选择动作的策略与行动价值。', 'A policy and action values for choosing actions in states.'),
    output: loc('当前状态下的动作选择。', 'An action choice in the current state.'),
    typicalProblem: loc('通过连续行动优化长期结果。', 'Optimize a long-term outcome through sequential actions.'),
    applications: [loc('机器人手臂控制', 'Robot-arm control'), loc('交通信号调度', 'Traffic-signal scheduling')],
  },
]

export const llmRouteStages = [
  { id: 'python', label: loc('Python', 'Python') },
  { id: 'math-numpy', label: loc('数学与 NumPy', 'Mathematics and NumPy') },
  { id: 'probability', label: loc('概率', 'Probability') },
  { id: 'classical-ml', label: loc('经典机器学习', 'Classical ML') },
  { id: 'deep-learning', label: loc('深度学习', 'Deep learning') },
  { id: 'transformer', label: loc('Transformer', 'Transformer') },
  { id: 'llm', label: loc('大语言模型', 'LLM') },
] as const

function chapter(
  id: AiOverviewChapterId,
  minutes: number,
  title: LocalizedCopy,
  markdown: LocalizedCopy,
  callout: LocalizedCopy,
  experimentPrompt: LocalizedCopy,
): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.aiOverview.title',
    title,
    estimatedMinutes: minutes,
    markdown,
    callout,
    experimentPrompt,
  }
}

export const aiOverviewChapters: StorySection[] = [
  chapter(
    'three-problems',
    12,
    loc('一个助手，三个问题', 'One Assistant, Three Problems'),
    loc(
      `同一个智能学习助手，为什么要用三种学习方法？答案不在“哪个算法更高级”，而在它面对的问题、已有信息和反馈不同。我们直接给三项任务贴上名字：**监督学习**预测下一次练习分数，**无监督学习**发现相似学习模式，**强化学习**选择下一道练习。

### 四格阅读法
预测分数时，问题是输出连续数值；可用信息包括练习时长、历史分数，以及过去样本中已经观察到的下一次分数；模型用预测 ŷ 与真实 y 的误差学习；输出是新学习者的分数预测。发现学习模式时没有“正确分组”标签，只有正确率与平均作答时间；算法依靠点之间的距离寻找结构；输出是需要教师解释的簇。选择下一道练习则是连续行动：助手观察掌握状态，选择难度，随后收到学习改善带来的奖励；它要学的是长期策略，而不是一次标准答案。

把三张信息图按“问题—可用信息—如何学习—输出”逐格比较。预测任务里的 y 是监督答案；聚类里的距离是结构信号，不是标签；强化学习里的 reward 在行动后出现，也不是老师提前给出的逐题答案。三种方法都能服务同一个产品，但学习信号不可互换。

再做一次反事实检查：如果把分数任务的 y 拿掉，监督误差就无法计算；如果给聚类硬塞一组人工答案，它已经变成另一个学习问题；如果在行动前就给出唯一正确选择，序列决策也会退化成带标签预测。范式由信息结构决定，不由界面长相决定。

### 先纠正两个误区
误区一是“只要用了 AI，背后就一定是同一种大模型”。实际上一个系统可以组合规则、回归、聚类和策略。误区二是“没有标签就没有目标”。K-means 仍追求组内更紧凑，只是没有人工答案。接下来查看三张共享版式的信息插图；即使关闭动画，四格文字也完整保留问题关系。

### 下一站
我们已经能按学习信号分问题，下一章要把 AI、机器学习、深度学习、生成式 AI 和 LLM 放回同一张地图，避免把层级和任务混为一谈。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L`,
      `Why does one intelligent learning assistant need three ways to learn? The answer is not that one algorithm is more advanced. The problem, available information, and feedback differ. We label the tasks immediately: **supervised learning** predicts the next exercise score, **unsupervised learning** discovers similar learning patterns, and **reinforcement learning** chooses the next exercise.

### A four-cell reading method
For score prediction, the problem is a continuous numerical output. Available information includes practice duration, historical score, and the observed next score in past examples. The model learns from the error between prediction ŷ and observed y, then outputs a score prediction for a new learner. Pattern discovery has no correct grouping labels. It sees accuracy and mean response time, uses distances among points as a structural signal, and outputs clusters that a teacher must interpret. Exercise selection is sequential: the assistant observes mastery state, chooses difficulty, and later receives a reward from learning improvement. It learns a long-term policy, not a single answer key.

Read the three cards as problem, available information, learning process, and output. The y in prediction is a supervised answer. Distance in clustering is a structural signal, not a label. A reinforcement reward arrives after an action; it is not a teacher-provided answer attached to every example. The three methods can coexist in one product, but their learning signals are not interchangeable.

Run the counterfactual check once more. Remove y from the prediction task and supervised error cannot be calculated. Force human group answers into clustering and it becomes a different learning problem. Supply one uniquely correct action before acting and the sequential decision problem collapses toward labeled prediction. The information structure, not the interface appearance, determines the paradigm.

### Correct two misconceptions now
First, using AI does not imply that one large model performs every part. A system can combine rules, regression, clustering, and a learned policy. Second, no labels does not mean no objective. K-means still seeks compact groups; it simply has no human answer key. Move next to the three shared-layout information illustrations. Their four-cell text preserves the full comparison even when motion is unavailable.

### Bridge
We can now classify problems by learning signal. Next we place AI, machine learning, deep learning, generative AI, and LLMs on one map so task type is not confused with conceptual scope.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L`,
    ),
    loc('先问答案、结构还是奖励从哪里来，再选学习范式。', 'Ask where answers, structure, or rewards come from before choosing a paradigm.'),
    loc('切换三张任务卡，逐项口述问题、信息、学习信号和输出。', 'Switch among the three cards and name the problem, information, learning signal, and output.'),
  ),
  chapter(
    'ai-world-map',
    18,
    loc('AI 世界地图', 'A Map of the AI World'),
    loc(
      `AI、机器学习、深度学习、生成式 AI 和 LLM 并不是五个并列按钮。**人工智能 AI** 是最宽的区域，目标是让机器完成需要感知、推理、规划或学习的任务。**机器学习 ML** 位于 AI 内部：系统从数据与反馈中调整行为。**深度学习**又位于 ML 内部，用多层参数学习表示。生成式 AI 与 LLM 放在深度学习区域中理解：生成式 AI 面向新内容生成，LLM 是主要处理和生成语言的一类大型模型。

### 地图之外还有传统 AI
AI 并不从深度学习开始。搜索会列出候选状态并按目标选择下一步；规划会把带前提与结果的动作串成计划；专家系统把当前事实与条件—结论规则匹配；逻辑推理依据事实和规则推出结论。切换演示器时固定观察四项：当前状态、可用候选或规则、选中的一步、产生的结果。它们的机制不同，却都能在没有神经网络的情况下表现出智能行为。

例如迷宫搜索从当前位置比较下一格；课程规划器检查先修条件后选择课程；诊断专家系统触发“若条件 A 与 B，则建议 C”；逻辑推理器从“所有课程均需先修检查”和“本课程是课程”推出结论。这里不展开历史、模型家族、Transformer 结构、tokenization 或预训练，因为本章只负责建立地图。

### 通往 LLM 的依赖路线
LLM 不是从一个聊天框突然出现。理解它需要深度学习与神经网络，也需要概率来描述不确定性、数据来提供学习材料、计算来执行大量参数更新。生成一个数字并不自动属于生成式 AI；线性回归也输出数字，但它预测预定义目标。反过来，AI 也不等于 ML：固定规则的专家系统仍属于 AI。

### 媒体过渡与下一站
先在嵌套地图中指出每个概念的范围，再用传统方法切换器追踪一步机制。下一章我们缩小到 ML 内部，跟随一行学习数据走完从特征到未见数据评估的共同语言。

### Ref ID
REF-GOOGLE-MLCC、REF-D2L、REF-HF-LLM-COURSE`,
      `AI, machine learning, deep learning, generative AI, and LLMs are not five parallel buttons. **Artificial intelligence** is the widest region: machines perform tasks involving perception, reasoning, planning, or learning. **Machine learning** sits inside AI because behavior is adjusted from data and feedback. **Deep learning** sits inside ML and learns representations through many parameterized layers. Generative AI and LLMs belong within the deep-learning region for this introductory map: generative AI creates new content, while an LLM is a large model centered on processing and generating language.

### Traditional AI also belongs on the map
AI did not begin with deep learning. Search enumerates candidate states and selects a next step toward a goal. Planning composes actions with preconditions and outcomes. An expert system matches current facts to condition–conclusion rules. Logic reasoning derives a conclusion from facts and formal rules. In the switchable demonstrator, always inspect the same four fields: current state, applicable candidate or rule, selected step, and result. The mechanisms differ, yet each can produce intelligent behavior without a neural network.

A maze search compares reachable cells. A course planner checks prerequisites before selecting a course. A diagnostic expert system fires a rule such as “if A and B, recommend C.” A logic engine derives a conclusion from “all courses require a prerequisite check” and “this item is a course.” We intentionally stop before AI history, model-family catalogs, Transformer mechanics, tokenization, and pretraining; this chapter has one job: establish scope.

### The dependency route toward LLMs
An LLM does not appear directly from a chat box. Understanding it depends on deep learning and neural networks, probability for uncertainty, data for learning material, and computation for many parameter updates. Producing a number does not automatically make a system generative: linear regression also outputs a number, but predicts a predefined target. Conversely, AI is not synonymous with ML; a fixed-rule expert system is still AI.

### Media transition and bridge
First locate every term in the nested map. Then use the traditional-method switcher to trace one mechanism step. Next we zoom into ML and follow one learner record from features to evaluation on unseen data.

### Ref ID
REF-GOOGLE-MLCC, REF-D2L, REF-HF-LLM-COURSE`,
    ),
    loc('AI 是范围，ML 是数据驱动方法，深度学习是 ML 的模型方法；不要把它们当同义词。', 'AI is a scope, ML is a data-driven approach, and deep learning is an ML model approach; they are not synonyms.'),
    loc('在嵌套地图定位五个概念，再切换搜索、规划、专家系统和逻辑推理的一步演示。', 'Locate five concepts on the nested map, then switch through one step of search, planning, expert systems, and logic.'),
  ),
  chapter(
    'ml-common-language',
    18,
    loc('机器学习的共同语言', 'The Common Language of Machine Learning'),
    loc(
      `一行数据怎样变成有用预测？固定表格有四列：学习者 ID、练习时长、历史分数、下一次分数。学习者 ID 用于区分记录，是**标识符**，不能因为它是数字就直接当成能力特征。练习时长和历史分数是候选特征；第一版模型只选择练习时长作为 $x$，把已观察的下一次分数作为目标 $y$。

### 跟随一行记录走完整个闭环
请按固定顺序朗读：

data → feature/target → model → prediction → error → parameter update → evaluation on unseen data

数据先被解释为候选字段；我们明确选择 $x$ 与 $y$；模型根据当前参数产生预测 $ŷ$；误差比较 $y$ 与 $ŷ$；更新规则据此改变参数 $w$、$b$；最后把已经确定的模型放到未见测试数据上，检查模式是否能迁移。训练数据参与参数学习，未见测试数据只负责最后检验。这里暂不引入 validation、交叉验证、指标家族、部署或监控。

例如记录“L-07，练习 3 小时，历史 62 分，下一次 68 分”。L-07 是标识符；若第一版只用练习时长，则 $x=3$；目标为 $y=68$。模型可能给出 $ŷ=65$，于是残差 $y-ŷ=3$。更新不是把答案 68 塞进新预测，而是稍微改变共享参数，使全部训练样本的整体误差更小。

### 两个连续 checkpoint
第一个 checkpoint 要把闭环步骤排序，常见误区是先在未见数据上更新参数；那会让测试数据变成训练反馈。第二个 checkpoint 要识别 ID、候选特征、选中特征和目标，常见误区是把任何数字列都当特征。完成选择后要读原因与误区标签，并用章节链接回到本节；答案只保存在本地呈现状态，不代表课程完成。

### 数据边界
缺失、偏差或涉及隐私的数据会让结果不可靠。此处只建立警觉，清洗与治理细节留给 Data Lab。接下来进入线性回归，用同一组 $x$、$y$ 完整算一次预测、残差、平方误差和 MSE。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-USER-GUIDE`,
      `How does one row of data become a useful prediction? The fixed table has four columns: learner ID, practice duration, historical score, and next score. Learner ID distinguishes records; it is an **identifier**, not an ability feature merely because it is numeric. Practice duration and historical score are candidate features. The first model selects only practice duration as $x$ and uses the observed next score as target $y$.

### Follow one record around the whole loop
Read the trace in its fixed order:

data → feature/target → model → prediction → error → parameter update → evaluation on unseen data

Raw fields are interpreted first. We deliberately choose $x$ and $y$. The model uses its current parameters to produce prediction $ŷ$. Error compares $y$ with $ŷ$. An update rule changes parameters $w$ and $b$. Only after the model is fixed do we evaluate it on unseen test data to ask whether the pattern transfers. Train data participates in parameter learning; unseen test data is reserved for the final check. Validation, cross-validation, metric families, deployment, and monitoring are intentionally deferred.

Consider “L-07, 3 practice hours, historical score 62, next score 68.” L-07 is the identifier. If the first model uses only duration, $x=3$. The target is $y=68$. A model might produce $ŷ=65$, giving residual $y-ŷ=3$. Updating does not paste 68 into the next prediction. It slightly changes shared parameters so the overall error across training examples can decrease.

### Two consecutive checkpoints
The first checkpoint orders the loop. A tempting misconception is to update parameters on unseen test data; that turns the test set into training feedback. The second identifies the ID, candidate feature, selected feature, and target. Its misconception is that every numeric column is automatically a feature. After choosing, read both the reason and misconception tag, then use the chapter link to revisit this section. Responses remain local presentation state and are not course-completion evidence.

### Data boundary
Missing, biased, or privacy-sensitive data can make the result unreliable. This chapter raises the boundary; Data Lab handles cleaning and governance. Next we keep the same $x$ and $y$ and calculate a linear-regression prediction, residual, squared error, and MSE.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-USER-GUIDE`,
    ),
    loc('标识符不是特征；训练数据用于学习，未见测试数据用于最后检查迁移。', 'An identifier is not a feature; train data supports learning, while unseen test data checks transfer.'),
    loc('沿可视轨迹排序闭环，并在固定学习者记录中标出 ID、x、y、ŷ 与误差。', 'Order the visual loop and label ID, x, y, ŷ, and error in the fixed learner record.'),
  ),
  chapter(
    'supervised-linear-regression',
    22,
    loc('监督学习与线性回归', 'Supervised Learning and Linear Regression'),
    loc(
      `监督学习如何从带答案的例子学会数值预测？沿用练习时长 $x$ 与下一次分数 $y$，线性模型写成：

$$ŷ = wx + b$$

$w$ 控制练习时长每增加 1 小时，预测改变多少；$b$ 是 $x=0$ 时的基线。先手动调整 $w$ 和 $b$，同时观察直线、每个预测点、残差和 MSE，而不是只盯着一条“看起来顺眼”的线。

### 完整算一个样本
使用清晰趋势数据与候选参数 $w=6$、$b=47$。对第一行 $x=1$、$y=52$：$ŷ=6×1+47=53$；残差 $y-ŷ=52-53=-1$；平方误差 $(y-ŷ)^2=(-1)^2=1$。其余四行 $x=[2,3,4,5]$、$y=[59,65,72,78]$ 的预测为 $[59,65,71,77]$，平方误差为 $[0,0,1,1]$。因此 MSE 是 $(1+0+0+1+1)/5=0.6$。变量名、表格和图上的残差必须指向同一计算。

### 从手调到自动搜索
“单步搜索”在一个小而可见的 $w,b$ 候选表中比较下一组参数；“自动搜索”按固定顺序走完候选。它是教学简化，让更新过程可追踪，不代表实际回归训练通常穷举参数。后续梯度下降课程会用局部斜率更高效地寻找低误差区域。

三组确定性数据为 clear trend、noisy trend 和 one outlier。控制项包括数据预设、$w$、$b$、单步搜索、自动搜索、速度、重置与残差显示。任何一次变更都要同步更新直线、预测表、残差和 MSE。异常点可能拉动整条线；低训练 MSE 仍不等于对未见数据有良好泛化。

### 迁移与边界
房价迁移例：若面积 $x=80$ 平方米，$w=1.2$ 万元/平方米、$b=20$ 万元，则 $ŷ=1.2×80+20=116$ 万元。它仍是回归。预测“是否答对”和“是否垃圾邮件”输出类别，属于分类；阈值与 logistic regression 留到后续。观看参数搜索媒体后，在 lab 中复现 $w=6,b=47,MSE=0.6$，再带着“如何更快更新”进入三范式比较。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-USER-GUIDE`,
      `How does supervised learning use examples with answers to learn a numerical prediction? Keep practice duration $x$ and next score $y$. The linear model is:

$$ŷ = wx + b$$

$w$ says how much the prediction changes for one additional practice hour. $b$ is the baseline at $x=0$. First adjust $w$ and $b$ manually while reading the line, every prediction, residual, and MSE together. A visually pleasing line is not enough.

### Work one sample completely
Use the clear-trend data and candidate parameters $w=6$, $b=47$. For the first row, $x=1$ and $y=52$: $ŷ=6×1+47=53$; residual $y-ŷ=52-53=-1$; squared error $(y-ŷ)^2=(-1)^2=1$. For $x=[2,3,4,5]$ and $y=[59,65,72,78]$, predictions are $[59,65,71,77]$ and squared errors are $[0,0,1,1]$. Therefore MSE is $(1+0+0+1+1)/5=0.6$. The variable names, table values, and plotted residuals must describe this same calculation.

### From manual tuning to automatic search
Single search step compares the next pair in a small visible table of $w,b$ candidates. Automatic search traverses that fixed list. This is a teaching simplification that makes updates traceable; practical regression training does not normally require exhaustive parameter enumeration. The later gradient-descent course uses local slope information to move more efficiently toward low error.

The three deterministic presets are clear trend, noisy trend, and one outlier. Controls are preset, $w$, $b$, single search step, automatic search, speed, reset, and residual visibility. Every change synchronizes the line, prediction table, residuals, and MSE. An outlier can pull the fitted line. Low train MSE still does not prove generalization to unseen examples.

### Transfer and boundary
For a house-price transfer, let area $x=80$ square meters, $w=1.2$ ten-thousand yuan per square meter, and $b=20$ ten-thousand yuan. Then $ŷ=1.2×80+20=116$ ten-thousand yuan. This remains regression. Predicting whether an answer is correct or an email is spam outputs a class and is classification; thresholds and logistic regression come later. After the parameter-search media, reproduce $w=6,b=47,MSE=0.6$ in the lab, then carry the question “what learning signal differs?” into the paradigm comparison.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-USER-GUIDE`,
    ),
    loc('线、表、残差与 MSE 必须是同一次 ŷ=wx+b 计算的四种视图。', 'The line, table, residuals, and MSE are four views of the same ŷ=wx+b calculation.'),
    loc('先复现 w=6、b=47、MSE=0.6，再切换噪声与异常点并解释变化。', 'Reproduce w=6, b=47, MSE=0.6, then switch to noise and an outlier and explain the change.'),
  ),
  chapter(
    'learning-paradigms',
    15,
    loc('三种学习范式', 'Three Learning Paradigms'),
    loc(
      `监督、无监督与强化学习最可靠的分界不是算法名字，而是**学习信号从哪里来**。用五个维度逐行比较：可用信息、学习信号、学到什么、输出、典型问题。

### 监督学习
可用信息是输入与标签；信号是预测与标签之间的误差；学到输入到目标的映射；输出可以是连续数值或类别。除分数预测外，垃圾邮件检测用 spam/not spam 标签，电力需求预测用历史真实用电量。标签是训练样本的答案，但标签可能有噪声，也可能不代表真实部署环境。

### 无监督学习
可用信息只有没有目标标签的样本；信号来自距离、密度、重建质量等结构准则；学到分组或低维表示；输出需要解释。新闻主题分组从词语模式找簇，图像颜色压缩把相近颜色归到有限代表色。无监督不是“随便找”，也不是“没有 objective”；结构准则就是它的优化方向。

### 强化学习
可用信息是状态、动作与行动后的奖励；信号是即时和延迟回报；学到策略或行动价值；输出是在状态下选择动作。机器人手臂控制从动作后的成功、误差或能耗得到奖励，交通信号调度从等待时间变化得到奖励。reward 不是监督标签：同一状态下没有老师预先附上一条唯一正确动作，奖励还可能延迟出现。

### 五个就地纠错
AI、ML、深度学习不是同义词，它们是范围与方法的嵌套。无监督学习不是无目标。奖励不是监督答案标签。输出数字不自动等于生成式 AI。低训练误差也不证明泛化，因为模型可能只适合训练样本。

formative checkpoint 给出三个新场景：带合格标签的零件检测、没有类别答案的音乐片段分组、根据长期留存奖励安排通知。每题都要选范式并指出 label、structural signal 或 reward 从哪里来；反馈说明正确原因、诱人误区和回看章节，而不是只显示对错。完成后进入 K-means，观察“没有标签但有明确更新方向”的完整机制。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L`,
      `The most reliable boundary among supervised, unsupervised, and reinforcement learning is not an algorithm name. It is **where the learning signal comes from**. Compare five dimensions: available information, learning signal, what is learned, output, and typical problem.

### Supervised learning
Available information contains inputs and labels. The signal is error between prediction and label. The model learns a mapping from input to target and outputs a continuous value or a class. Beyond score prediction, spam detection uses spam/not-spam labels, while electricity-demand prediction uses observed demand. Labels are answer keys for training examples, although they can be noisy or fail to represent deployment conditions.

### Unsupervised learning
Available information contains examples without target labels. Signals come from structural criteria such as distance, density, or reconstruction quality. The model learns groups or lower-dimensional representations, and the output requires interpretation. News-topic grouping finds clusters from word patterns. Image color compression assigns similar colors to a limited palette. Unsupervised does not mean arbitrary or without an objective; a structural criterion supplies its optimization direction.

### Reinforcement learning
Available information consists of states, actions, and rewards observed after actions. Immediate and delayed return supply the signal. The system learns a policy or action values and outputs an action choice in each state. A robot arm receives reward from success, error, or energy use. Traffic-signal scheduling receives reward from changes in waiting time. Reward is not a supervised label: a teacher has not attached one uniquely correct action to every state, and reward may arrive later.

### Five local corrections
AI, ML, and deep learning are not synonyms; they describe nested scope and methods. Unsupervised learning is not objective-free. Reward is not a supervised answer label. A numerical output is not automatically generative AI. Low training error does not prove generalization because a model can fit only its training examples.

The formative checkpoint introduces three fresh scenarios: defect inspection with pass/fail labels, music grouping without category answers, and notification scheduling driven by long-term retention reward. For each, choose a paradigm and locate the label, structural signal, or reward. Feedback explains the correct reason, the tempting misconception, and the chapter to revisit; it does more than display right or wrong. Next we enter K-means and inspect a complete mechanism that has no labels but does have a definite update direction.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L`,
    ),
    loc('先定位学习信号：标签误差、结构准则，还是行动后的奖励。', 'Locate the learning signal first: label error, a structural criterion, or post-action reward.'),
    loc('对三个新场景选择范式，并明确写出信号来自哪里。', 'Choose a paradigm for three new scenarios and state exactly where its signal comes from.'),
  ),
  chapter(
    'unsupervised-kmeans',
    18,
    loc('无监督学习与 K-means', 'Unsupervised Learning and K-means'),
    loc(
      `没有分组答案，模型怎样找到组？主图把 12 位固定学习者画成点：横轴是正确率，纵轴是平均作答时间。实验允许 $K=2–5$；引导讲解固定使用 $K=3$、随机种子 3103，这样初始化、视频和交互回放完全一致。

### 六步机制
第一步从现有点中按 seed 选择 K 个初始中心。第二步为一个点连向全部中心，直观看哪条比较线最短。第三步把所有点分配给最近中心。第四步完整计算一组的新中心：若组内三点为 $(92,28)$、$(88,33)$、$(95,37)$，横坐标均值是 $(92+88+95)/3=91.67$，纵坐标均值是 $(28+33+37)/3=32.67$，新中心移动到 $(91.67,32.67)$。第五步对每组移动中心。第六步重复分配与重算，直到分配和中心不再变化。

距离先通过连线长度理解。欧氏距离 $d=\\sqrt{(x-c_x)^2+(y-c_y)^2}$ 放在展开区预览，向量课程再正式解释。时间线记录 initialization、assignment、recomputation 与 converged，并显示每轮“组内距离总和”。正式 inertia/WCSS 公式同样只作为可展开预览。

控制项是 K、随机种子、单步、自动运行、重置与时间线导航。改变 K 回答的是“要求找几组”，改变 seed 只改变起点；两者都可能改变结果。若一个点重新加入右上方的组，该组中心要朝所有成员的均值移动，而不是朝最远点移动。checkpoint 正是检查这个方向误区，不要求复杂算术。

### 迁移与责任边界
用户分群的静态例子用访问频率与平均消费。算法只输出几何簇，不会自动命名“忠诚用户”或“价格敏感用户”。这些名字需要结合业务与公平性检查；簇不是人的本质，也不是真实世界天然存在的标签。

先观看 seed 3103、K=3 的收敛媒体，再在实验中逐帧核对初始化、连线、分配、均值与移动。下一章把“反复更新”放进有行动与奖励的 4×4 网格，比较 center 与 Q value 的更新信号。

### Ref ID
REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-USER-GUIDE、REF-D2L`,
      `How can a model find groups without grouping answers? The main plot shows 12 fixed learners: accuracy on the horizontal axis and mean response time on the vertical axis. The experiment allows $K=2–5$. The guided explanation fixes $K=3$ and random seed 3103 so initialization, video, and interactive replay agree exactly.

### The complete six-step mechanism
First, select K initial centers from existing points using the seed. Second, connect one point to every center and compare line lengths visually. Third, assign every point to its nearest center. Fourth, calculate one new center completely. If a group contains $(92,28)$, $(88,33)$, and $(95,37)$, the horizontal mean is $(92+88+95)/3=91.67$ and the vertical mean is $(28+33+37)/3=32.67$, so the center moves to $(91.67,32.67)$. Fifth, move every group center. Sixth, repeat assignment and recomputation until assignments and centers stop changing.

Distance begins as visible comparison lines. Euclidean distance $d=\\sqrt{(x-c_x)^2+(y-c_y)^2}$ appears only in an expandable preview; the vector course develops it formally. The timeline records initialization, assignment, recomputation, and converged phases, plus the plain-language “within-group distance total” for every iteration. The formal inertia/WCSS expression is also an optional preview.

Controls are K, random seed, single step, automatic run, reset, and timeline navigation. Changing K asks for a different number of groups. Changing the seed changes only the starting centers, though either can change the result. If a point is reassigned into the upper-right group, that center moves toward the mean of all members, not toward the farthest point. The checkpoint tests this direction misconception without demanding complex arithmetic.

### Transfer and responsibility boundary
The static user-segmentation example uses visit frequency and average spending. The algorithm outputs geometric clusters; it does not automatically name “loyal” or “price-sensitive” people. Such names require domain interpretation and fairness checks. Clusters are not human essences or naturally supplied truth labels.

Watch the seed 3103, K=3 convergence media, then verify initialization, lines, assignment, means, and movement frame by frame in the lab. Next we place repeated updates inside a 4×4 world with actions and rewards and compare center updates with Q-value updates.

### Ref ID
REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-USER-GUIDE, REF-D2L`,
    ),
    loc('K-means 没有答案标签，但“分配到最近中心、中心移到成员均值”给出明确方向。', 'K-means has no answer labels, but nearest-center assignment and movement to the member mean give a definite direction.'),
    loc('用 K=3、seed=3103 单步回放，并手算一组中心 (91.67, 32.67)。', 'Replay K=3, seed=3103 one step at a time and hand-check center (91.67, 32.67).'),
  ),
  chapter(
    'reinforcement-q-learning',
    20,
    loc('强化学习与 Q-learning', 'Reinforcement Learning and Q-learning'),
    loc(
      `重复行动和奖励怎样形成策略？经典环境是固定 4×4 网格：起点在左下，终点在右上，中间有两个障碍。到达目标奖励 +10；普通一步奖励 -1；撞障碍奖励 -3。随机种子固定为 7107，学习率 $α=0.5$、折扣因子 $γ=0.9$ 固定，学习者只调整探索率。

### 先认四个词
state 是当前位置；action 是上、右、下、左；reward 是执行动作后环境返回的数值；Q value 是“在某状态做某动作，此后继续行动”的累计价值估计。Q 值不是成功次数，也不是即时奖励本身。主视图只显示当前 state 的四个 action values、刚发生的一次更新、episode、累计 reward 与全局 policy 箭头；完整 16×4 Q table 放在展开区。

用一句话读更新：**旧经验加上学习率乘以修正量**。公式为

$$Q(s,a) \\leftarrow Q(s,a)+α[r+γ\\max_{a'}Q(s',a')-Q(s,a)]$$

数值例：旧值 $Q(s,\text{right})=2$，执行 right 得到 $r=+10$，下一状态最大值为 4。目标是 $10+0.9×4=13.6$；修正量为 $13.6-2=11.6$；新值为 $2+0.5×11.6=7.8$，所以这个 Q value 上升。若碰障碍得到 -3，且未来价值不足以补偿，目标低于旧值，Q value 就下降。checkpoint 只问方向与原因。

### 训练和评估要分开看
训练时探索率保持固定，随机动作让代理发现不同路径；最终评估把探索关闭，只沿当前最大 Q value 走，才能清楚检查已学 policy。控制项为随机 seed、探索率、单步动作、运行一回合、连续训练、速度、暂停与重置。探索率太低可能过早固守差路径，太高则训练轨迹更随机。

### 回到学习助手
掌握状态映射为 state，练习难度映射为 action，稍后的学习改善映射为 reward。一次更新能提高某状态下“选择中等难度”的 Q value，但这不是第二个模拟器。策略仍需安全约束，奖励设计错误会鼓励意外行为。

观看 seed 7107 的策略形成媒体后，单步核对奖励、target、修正量和箭头。下一章将用决策树重新组合线性回归、K-means 与 Q-learning。

### Ref ID
REF-D2L、REF-GOOGLE-MLCC、REF-SKLEARN-USER-GUIDE`,
      `How can repeated action and reward produce a strategy? The classic environment is a fixed 4×4 grid with a start in the lower-left, a goal in the upper-right, and two obstacles. Reaching the goal gives +10, an ordinary step gives -1, and an obstacle collision gives -3. Random seed is 7107. Learning rate $α=0.5$ and discount factor $γ=0.9$ stay fixed; the learner adjusts only exploration rate.

### Name four terms before using the formula
State is the current cell. Action is up, right, down, or left. Reward is the number returned by the environment after an action. A Q value estimates the cumulative value of taking one action in one state and continuing afterward. It is neither a success count nor the immediate reward itself. The main view shows only four action values for the current state, the latest update, episode, cumulative reward, and global policy arrows. The full 16×4 Q table is expandable.

Read the update in words: **old experience plus the learning rate times a correction**. The equation is

$$Q(s,a) \\leftarrow Q(s,a)+α[r+γ\\max_{a'}Q(s',a')-Q(s,a)]$$

For a numerical update, let old $Q(s,\text{right})=2$, action right receive $r=+10$, and the largest next-state value be 4. The target is $10+0.9×4=13.6$. The correction is $13.6-2=11.6$. The new value is $2+0.5×11.6=7.8$, so this Q value rises. After a collision reward of -3, if future value cannot compensate, the target lies below the old value and the Q value falls. The checkpoint asks only for direction and reason.

### Separate training from evaluation
Exploration remains fixed during training so random actions can reveal different routes. Final evaluation disables exploration and follows the current maximum Q value, making the learned policy inspectable without random actions. Controls are seed, exploration rate, single action, one episode, continuous training, speed, pause, and reset. Too little exploration can lock onto a weak route early; too much makes training trajectories highly random.

### Return to the learning assistant
Mastery maps to state, exercise difficulty to action, and later learning improvement to reward. One update may raise the Q value of selecting medium difficulty in a given mastery state, but this is a transfer demonstration, not a second simulator. Policies still need safety constraints, and a badly designed reward can encourage unintended behavior.

After the seed 7107 strategy-formation media, verify reward, target, correction, and arrow one step at a time. Next the decision tree recombines linear regression, K-means, and Q-learning.

### Ref ID
REF-D2L, REF-GOOGLE-MLCC, REF-SKLEARN-USER-GUIDE`,
    ),
    loc('reward 不是标签，Q value 也不是即时奖励；它是状态—动作的长期价值估计。', 'Reward is not a label, and a Q value is not immediate reward; it estimates long-term state–action value.'),
    loc('用 seed=7107 复现 Q: 2→7.8 的上升，再比较撞障碍后的下降方向。', 'Use seed=7107 to reproduce Q: 2→7.8, then compare the downward direction after a collision.'),
  ),
  chapter(
    'choose-learning-approach',
    12,
    loc('选择学习方法', 'Choose a Learning Approach'),
    loc(
      `面对新问题，怎样不靠背例子选择学习方法？从三个问题开始。第一，历史样本是否有明确目标答案？有，就先考虑监督学习，并继续判断输出是连续数值还是类别。第二，学习是否由连续行动与延迟奖励驱动？是，就先考虑强化学习。第三，没有目标答案时，目标是否是发现结构？是，就先考虑无监督学习。

### 决策树不是世界定律
这棵树是入门工具，不是证明。真实系统可能混合范式：先用监督模型估计状态，再用强化策略选动作；先用聚类发现群体，再为每组训练监督模型。遇到混合系统，应分别指出每个子问题的可用信息与学习信号，而不是强迫整个产品只有一个标签。

### 重新拼好智能学习助手
线性回归读取练习时长 $x$，输出下一次分数 $ŷ$；K-means 读取正确率与平均响应时间，以 $K=3$、seed 3103 展示学习模式；Q-learning 在 4×4 网格中用 +10、-1、-3 奖励和 seed 7107 学会选择动作。三者共享“数据/状态—模型—反馈—更新—检查”的大循环，却分别依靠标签误差、结构距离和奖励修正。

### 七阶段路线
后续路线固定为：

Python → mathematics and NumPy → probability → classical ML → deep learning → Transformer → LLM

Python 提供可执行表达；数学与 NumPy连接向量、矩阵和代码；概率描述不确定性；经典 ML 建立训练与评估习惯；深度学习引入表示学习；Transformer 解释序列中的注意力与并行结构；LLM 把这些基础组合到语言任务。路线不是说学完前一项才可看到后一项，而是说明概念依赖。

### 最终自检
拿“根据连续血糖读数给出下一步提醒”举例：若有医生标注的目标提醒，是监督信号；若根据长期健康改善选择连续提醒，是强化信号；若只探索患者模式，是无监督信号。说明信号来源比报出算法名更重要。

最后打开可打印双语一页知识图，检查共同闭环、三范式比较、三个代表算法、决策树与七阶段路线。它不生成分数或学习者报告；checkpoint 只是本地形成性反馈。你现在获得的是选择与解释的起点，下一步是沿路线进入数学、数据与经典 ML 的可复现实验。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L、REF-HF-LLM-COURSE`,
      `How can you choose a learning approach for a new problem without memorizing examples? Begin with three questions. First, do historical examples contain an explicit target answer? If yes, start with supervised learning and then ask whether the output is continuous or categorical. Second, is learning driven by sequential actions and delayed reward? If yes, start with reinforcement learning. Third, with no target answers, is the goal to discover structure? If yes, start with unsupervised learning.

### The decision tree is not a law of nature
This tree is an entry tool, not a proof. Real systems can mix paradigms. A supervised model may estimate state before a reinforcement policy selects an action. Clustering may discover groups before a supervised model is trained for each group. For a hybrid system, identify available information and learning signal for every subproblem instead of forcing one label onto the entire product.

### Reassemble the intelligent learning assistant
Linear regression reads practice duration $x$ and predicts next score $ŷ$. K-means reads accuracy and mean response time and demonstrates learning patterns with $K=3$, seed 3103. Q-learning uses +10, -1, and -3 rewards with seed 7107 in a 4×4 grid to learn action choices. All three fit a broad data/state, model, feedback, update, and check loop, but they rely respectively on label error, structural distance, and reward correction.

### The seven-stage route
The route ahead is fixed:

Python → mathematics and NumPy → probability → classical ML → deep learning → Transformer → LLM

Python provides executable expression. Mathematics and NumPy connect vectors and matrices to code. Probability describes uncertainty. Classical ML establishes training and evaluation habits. Deep learning introduces representation learning. Transformer explains attention and parallel sequence structure. LLM study combines these foundations for language tasks. The route expresses conceptual dependencies; it does not forbid looking ahead.

### Final self-check
Consider “use continuous glucose readings to provide the next reminder.” Doctor-authored target reminders create supervised signal. Long-term health improvement after sequential reminders creates reinforcement signal. Exploring patient patterns without target answers creates unsupervised signal. Explaining the signal source matters more than reciting an algorithm name.

Finally open the printable bilingual one-page map and inspect the common loop, paradigm comparison, three representative algorithms, decision tree, and seven-stage route. It creates no score or learner report; checkpoints remain local formative feedback. You now have a starting method for choosing and explaining approaches. Next, follow the route into reproducible mathematics, data, and classical-ML experiments.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L, REF-HF-LLM-COURSE`,
    ),
    loc('决策树帮助定位信号，不证明真实系统只能使用一种范式。', 'The decision tree locates learning signals; it does not prove that a real system uses only one paradigm.'),
    loc('用一个全新场景走决策树，再在双语知识图上指出后续七阶段路线。', 'Run a new scenario through the decision tree, then locate the seven-stage route on the bilingual map.'),
  ),
]
