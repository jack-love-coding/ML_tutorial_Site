import type {
  LabConfig,
  LabTaskConfig,
  LocalizedCopy,
  MathConcept,
  MathLabComponentName,
  MathLabModule,
  MathLabSection,
  Misconception,
  QuizItem,
  SourceReference,
  VisualAsset,
} from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function variable(symbol: string, zh: string, en: string) {
  return { symbol, description: copy(zh, en) }
}

function concept(
  id: string,
  name: LocalizedCopy,
  formulaLatex: string,
  variables: MathConcept['variables'],
  plainExplanation: LocalizedCopy,
  geometricIntuition: LocalizedCopy,
  numericalExample: LocalizedCopy,
  modelConnection: LocalizedCopy,
  codeExample?: string,
): MathConcept {
  return {
    id,
    name,
    formulaLatex,
    variables,
    plainExplanation,
    geometricIntuition,
    numericalExample,
    modelConnection,
    codeExample,
  }
}

function imageAsset(id: string, assetPath: string, title: LocalizedCopy, transcript: LocalizedCopy): VisualAsset {
  return {
    id,
    type: 'image',
    title,
    assetPath,
    transcript,
    alt: transcript,
    caption: transcript,
    learningPurpose: copy(
      '复用既有微积分视觉资产，把抽象公式连接到可观察图像。',
      'Reuse an existing calculus visual asset to connect abstract formulas with observable images.',
    ),
  }
}

function lab(
  id: string,
  title: LocalizedCopy,
  componentName: MathLabComponentName,
  successCriteria: LocalizedCopy[],
  task?: LabTaskConfig,
): LabConfig {
  return {
    id,
    title,
    type: 'interactive-visual',
    componentName,
    successCriteria,
    ...(task ? { task } : {}),
  }
}

function quiz(
  id: string,
  prompt: LocalizedCopy,
  correctId: string,
  correct: LocalizedCopy,
  distractor: LocalizedCopy,
  explanation: LocalizedCopy,
  tag: string,
  revisitVisualId?: string,
): QuizItem {
  return {
    id,
    type: 'single-choice',
    prompt,
    choices: [
      { id: correctId, label: correct },
      { id: 'distractor', label: distractor },
    ],
    answer: correctId,
    explanation,
    misconceptionTags: [tag],
    revisitVisualId,
  }
}

function misconception(id: string, statement: LocalizedCopy, correction: LocalizedCopy, example: LocalizedCopy): Misconception {
  return { id, statement, correction, example }
}

const sources = {
  essenceCalculus: {
    label: copy('3Blue1Brown Essence of Calculus', '3Blue1Brown Essence of Calculus'),
    href: 'https://www.3blue1brown.com/topics/calculus',
    usage: copy(
      '参考局部变化、割线、切线和微积分直觉的视觉组织方式。',
      'Reference for the visual organization of local change, secants, tangents, and calculus intuition.',
    ),
  },
  d2lOptimization: {
    label: copy('Dive into Deep Learning Optimization Algorithms', 'Dive into Deep Learning Optimization Algorithms'),
    href: 'https://d2l.ai/chapter_optimization/index.html',
    license: 'CC BY-SA 4.0',
    usage: copy(
      '参考梯度下降、随机梯度和优化算法的机器学习表述。',
      'Reference for machine-learning explanations of gradient descent, stochastic gradients, and optimization algorithms.',
    ),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '参考微积分、梯度和优化与机器学习参数学习之间的关系。',
      'Reference for relationships between calculus, gradients, optimization, and machine-learning parameter learning.',
    ),
  },
} satisfies Record<string, SourceReference>

function moduleDefinition(
  input: Omit<MathLabModule, 'order' | 'toc' | 'nextModuleIds' | 'sourceNoteFile' | 'importedAssetPaths'>,
): MathLabModule {
  return {
    ...input,
    order: 0,
    toc: input.sections.map((item) => ({ id: item.id, level: item.level, title: item.title })),
    nextModuleIds: [],
    sourceNoteFile: 'math-lab-calculus-route-sources.md',
    importedAssetPaths: input.visuals
      .flatMap((visual) => [visual.assetPath, visual.posterPath])
      .filter((path): path is string => Boolean(path)),
  }
}

const partialDerivativeLab = lab(
  'calculus-partial-derivative-lab',
  copy('偏导数与梯度等高线实验', 'Partial Derivative and Gradient Contour Lab'),
  'PartialDerivativeContourLab',
  [
    copy('能分别解释两个偏导数，并指出完整梯度方向。', 'Explain both partial derivatives and identify the full gradient direction.'),
    copy('能用方向导数说明任意方向上的局部变化。', 'Use the directional derivative to explain local change along any chosen direction.'),
  ],
  {
    predictionPrompt: copy(
      '先预测：如果只沿 x 方向移动，loss 会比沿 y 方向变化更快吗？写下你判断的依据。',
      'Predict first: if you move only along x, will the loss change faster than along y? Write the basis for your judgment.',
    ),
    reflectionPrompt: copy(
      '结合 ∂L/∂x、∂L/∂y 和方向导数，解释完整梯度为什么不是只看一个坐标。',
      'Use ∂L/∂x, ∂L/∂y, and the directional derivative to explain why the full gradient is not just one coordinate.',
    ),
  },
)

const batchGradientNoiseLab = lab(
  'calculus-batch-gradient-noise-lab',
  copy('批量梯度噪声实验', 'Batch Gradient Noise Lab'),
  'BatchGradientNoiseLab',
  [
    copy('能比较全数据梯度和当前 batch 梯度。', 'Compare the full-data gradient and the current batch gradient.'),
    copy('能解释 batch size 如何影响梯度估计方差。', 'Explain how batch size changes gradient-estimate variance.'),
  ],
  {
    predictionPrompt: copy(
      '先预测：把 batch size 从 4 调到 16 后，梯度误差和方向夹角会怎样变化？',
      'Predict first: when batch size changes from 4 to 16, what should happen to gradient error and direction angle?',
    ),
    reflectionPrompt: copy(
      '用全数据梯度、batch 梯度和方向夹角解释 batch size 为什么会影响稳定性。',
      'Use the full-data gradient, batch gradient, and direction angle to explain why batch size changes stability.',
    ),
  },
)

const thirdChapter = moduleDefinition({
  id: 'calculus-partial-derivatives-gradients',
  enhancementTier: 'interactive',
  title: copy('偏导数和梯度', 'Partial Derivatives and Gradients'),
  subtitle: copy('一次读一个参数方向，再把所有方向收集成梯度。', 'Read one parameter direction at a time, then collect every direction into a gradient.'),
  difficulty: 'foundation',
  estimatedMinutes: 36,
  prerequisites: ['calculus-derivatives-local-change'],
  aiModelConnections: [copy('训练需要知道每个 weight、bias 和 parameter 对 loss 的局部影响。', 'Training needs the local effect of each weight, bias, and parameter on loss.')],
  learningObjectives: [
    copy('解释偏导数如何固定其他参数。', 'Explain how a partial derivative holds other parameters fixed.'),
    copy('把偏导数组成梯度向量。', 'Collect partial derivatives into a gradient vector.'),
    copy('说明梯度指向 loss 增加最快方向。', 'Explain that the gradient points toward fastest loss increase.'),
  ],
  concepts: [
    concept(
      'partial-gradient-list',
      copy('偏导数和梯度', 'Partial Derivatives and Gradient'),
      '\\nabla L(\\theta)=\\left[\\frac{\\partial L}{\\partial \\theta_1},\\frac{\\partial L}{\\partial \\theta_2},\\ldots\\right]',
      [
        variable('\\theta_i', '第 i 个参数。', 'Parameter i.'),
        variable('\\partial L/\\partial \\theta_i', '只动第 i 个参数时 loss 的局部变化率。', 'Local loss change when only parameter i moves.'),
        variable('\\nabla L(\\theta)', '所有偏导数组成的向量。', 'The vector of all partial derivatives.'),
      ],
      copy('偏导数读一个方向，梯度收集所有方向。', 'A partial derivative reads one direction; the gradient collects all directions.'),
      copy('梯度箭头在 loss 地形上指向最快上升。', 'The gradient arrow points toward fastest increase on the loss landscape.'),
      copy('若梯度是 \\([4,-1]\\)，第一个方向上升快，第二个方向增加会让 loss 降低。', 'If the gradient is \\([4,-1]\\), the first direction increases loss quickly and increasing the second lowers loss.'),
      copy('优化器读取梯度后才决定更新。', 'The optimizer reads the gradient before deciding an update.'),
    ),
  ],
  sections: [
    section('partial-knob-case', copy('案例：旋钮、weight、bias 和 parameter', 'Case: Knobs, Weight, Bias, and Parameter'), copy(md`模型里常有很多旋钮。weight 控制输入放大多少，bias 控制整体平移多少，每个 parameter 都会影响 loss。若同时乱动所有旋钮，就很难解释变化来自哪里。`, md`A model often has many knobs. A weight controls how strongly an input is scaled, a bias shifts the output, and every parameter can affect loss. If all knobs move at once, the resulting loss change is hard to interpret. The partial-derivative move is to isolate one knob so the learner can connect one local parameter change to one local loss response before combining the directions again.`), { visualIds: ['partial-gradient-image'], labIds: ['calculus-partial-derivative-lab'] }),
    section('partial-one-direction', copy('偏导数：固定其他参数', 'Partial Derivative: Hold the Others Fixed'), copy(md`偏导数的关键是“只动一个方向”。计算 \(\partial L/\partial w\) 时先固定其他旋钮，这就是 hold the others fixed。这样 loss 变化才能归因到当前方向。`, md`The key instruction for a partial derivative is to move one direction while holding the others fixed. When computing \(\partial L/\partial w\), the other knobs are temporarily fixed. That makes the loss change attributable to the current direction. The computation graph can be large, but the question remains small and precise: if only this parameter changes a tiny amount, how does loss respond nearby?`)),
    section('gradient-collects-partials', copy('梯度：收集很多偏导数', 'Gradient: Collect Many Partials'), copy(md`梯度把很多偏导数按参数顺序排成向量。因为每个分量都是 loss 对一个参数方向的局部变化率，所以梯度指向当前位置最快上升方向。中文锚点是：梯度指向上坡。`, md`A gradient places many partial derivatives into one vector in parameter order. Each component is a local loss rate in one parameter direction, so the full gradient points toward fastest increase from the current position. That is why the gradient is not the downhill direction by itself. The next chapter will subtract the gradient, using the negative direction when the goal is to reduce loss.`)),
    section('partial-gradient-review', copy('复盘：一个方向到一组方向', 'Review: One Direction to a Set of Directions'), copy(md`复习时先问正在移动哪个旋钮，哪些旋钮固定。一个偏导数回答一个方向，一组偏导数组成梯度，梯度指向最快上升。`, md`Review Questions: Which parameter knob is moving? Which knobs are fixed? What local loss change does this one partial derivative report? After every direction has a partial derivative, how are they collected into the gradient? Does the gradient point uphill or downhill? This review closes the loop from one local derivative to many-parameter training.`)),
  ],
  visuals: [imageAsset('partial-gradient-image', '/math-lab/generated/beginner-partial-gradient-longform.png', copy('偏导数和梯度图', 'Partial Gradient Image'), copy('两个参数旋钮分别产生偏导，多个局部变化率合成梯度方向。', 'Two parameter knobs produce partials, and local rates combine into a gradient direction.'))],
  labs: [partialDerivativeLab],
  quizzes: [
    quiz('partial-one-knob', copy('偏导数一次怎样移动参数？', 'How does a partial derivative move parameters?'), 'one', copy('固定其他参数，只动一个方向。', 'Hold other parameters fixed and move one direction.'), copy('同时移动所有参数。', 'Move all parameters at once.'), copy('偏导数隔离一个方向。', 'A partial derivative isolates one direction.'), 'partial-moves-all-parameters', 'partial-gradient-image'),
    quiz('gradient-points-uphill', copy('梯度指向哪里？', 'Where does the gradient point?'), 'uphill', copy('loss 增加最快方向。', 'Fastest loss increase.'), copy('loss 下降最快方向。', 'Fastest loss decrease.'), copy('梯度指向上坡，下降要用负梯度。', 'The gradient points uphill; descent uses the negative gradient.'), 'gradient-is-downhill'),
  ],
  misconceptions: [
    misconception('partial-moves-all-parameters', copy('偏导数表示所有参数一起变。', 'A partial derivative means all parameters move together.'), copy('偏导数固定其他参数，只读一个方向。', 'A partial derivative holds other parameters fixed and reads one direction.'), copy('读 weight 时 bias 暂时不动。', 'When reading weight, bias is temporarily fixed.')),
    misconception('gradient-is-downhill', copy('梯度就是下坡方向。', 'The gradient is the downhill direction.'), copy('梯度指向上坡，负梯度才用于下降。', 'The gradient points uphill; the negative gradient is used for descent.'), copy('想下山要反着坡度箭头走。', 'To go downhill, walk opposite the slope arrow.')),
  ],
  accent: '#7c3aed',
  theme: '#f5f3ff',
  sourceReferences: [sources.essenceCalculus, sources.mml],
})

const fifthChapter = moduleDefinition({
  id: 'calculus-sgd-batch-noise',
  enhancementTier: 'interactive',
  title: copy('Full Batch、Mini-Batch 和 SGD', 'Full Batch, Mini-Batch, and SGD'),
  subtitle: copy('用抽样平均理解 mini-batch 梯度噪声。', 'Use sample averages to understand mini-batch gradient noise.'),
  difficulty: 'foundation',
  estimatedMinutes: 36,
  prerequisites: ['calculus-gradient-descent'],
  aiModelConnections: [copy('真实训练常用 mini-batch 或 SGD 估计梯度。', 'Real training often estimates gradients with mini-batch or SGD.')],
  learningObjectives: [
    copy('区分 full batch 和 mini-batch。', 'Distinguish full batch and mini-batch.'),
    copy('解释 noisy estimate 不等于错误。', 'Explain why a noisy estimate is not automatically wrong.'),
    copy('正确使用 batch size、iteration、epoch。', 'Use batch size, iteration, and epoch correctly.'),
  ],
  concepts: [
    concept('mini-batch-gradient-estimate', copy('Mini-batch 梯度估计', 'Mini-Batch Gradient Estimate'), 'g_B(\\theta)=\\frac{1}{|B|}\\sum_{i\\in B}\\nabla_\\theta L_i(\\theta)', [variable('B', '当前小批量样本集合。', 'Current mini-batch example set.'), variable('|B|', 'batch size。', 'Batch size.'), variable('\\nabla_\\theta L_i', '单个样本梯度。', 'Single-example gradient.')], copy('用一批样本的平均梯度估计全数据梯度。', 'Estimate the full-data gradient with the average gradient of one batch.'), copy('像用样本平均估计总体平均。', 'Like estimating a population average with a sample average.'), copy('四个样本梯度 2、4、3、5 的估计为 3.5。', 'Four sample gradients 2, 4, 3, 5 estimate 3.5.'), copy('大模型靠这种估计降低每步成本。', 'Large models use this estimate to reduce per-step cost.')),
  ],
  sections: [
    section('sgd-full-batch-case', copy('Full batch：whole dataset average', 'Full Batch: Whole Dataset Average'), copy(md`full batch 每次更新前看完整训练集，把 whole dataset average 作为梯度。方向稳定，但数据大时每一步都很慢。它是理解 mini-batch 的基准。`, md`Full batch computes the gradient from the entire training set before each update. The direction is stable because it is the whole dataset average, but each step can be expensive when data are large. It is the baseline case: if all examples participate, the update direction is the average loss slope over the full dataset. Mini-batch and SGD change this cost by replacing the full average with a sampled estimate.`), { labIds: ['calculus-batch-gradient-noise-lab'] }),
    section('sgd-mini-batch-estimate', copy('Mini-batch 和 SGD：noisy estimate', 'Mini-Batch and SGD: Noisy Estimate'), copy(md`mini-batch 每次只看一小批样本。SGD 常泛指随机抽样更新；严格说 batch size 为 1 时是最纯的 SGD。noisy estimate 表示抽样方向会波动，不自动代表梯度坏了。`, md`A mini-batch update looks at only a small group of examples. SGD is often used broadly for stochastic updates, while strict SGD uses batch size one. A noisy estimate means the sampled average can differ from the full-data average. That noise is not automatically a bug. The useful question is whether the long-run path still trends downward and whether the noise scale matches the batch size and learning rate.`)),
    section('sgd-iteration-epoch', copy('batch size、iteration、epoch', 'Batch Size, Iteration, and Epoch'), copy(md`batch size 是一次更新用多少样本，iteration 是一次参数更新，epoch 是完整看过训练集一遍。1000 个样本、batch size=100 时，一个 epoch 通常有 10 个 iteration。`, md`Batch size is how many examples are used for one update. An iteration is one parameter update. An epoch means the training set has been seen once. With 1000 examples and batch size 100, one epoch usually has 10 iterations. This vocabulary matters because training logs report curves by iteration or epoch, and confusing them can make normal mini-batch noise look like a mysterious failure.`)),
    section('sgd-review', copy('复盘：抽样噪声和训练词汇', 'Review: Sampling Noise and Training Vocabulary'), copy(md`复习时先看梯度来自全数据、小批量还是单样本，再解释噪声是否符合抽样。最后说清 batch size、iteration 和 epoch。`, md`Review Questions: Is the gradient computed from the full dataset, a mini-batch, or one example? Why can a mini-batch direction be noisy but still useful? What does batch size count? What event is one iteration? What does one epoch mean? If a curve is plotted by epoch rather than iteration, how does that change your reading of noisy updates?`)),
  ],
  visuals: [],
  labs: [batchGradientNoiseLab],
  quizzes: [
    quiz('sgd-noisy-not-wrong', copy('mini-batch 梯度有噪声表示什么？', 'What can mini-batch gradient noise mean?'), 'sample', copy('可能只是抽样估计的正常波动。', 'It may be normal variation from a sampled estimate.'), copy('一定是公式错误。', 'It must be a formula error.'), copy('SGD 噪声需要诊断，但不自动等于错误。', 'SGD noise should be diagnosed, but it is not automatically wrong.'), 'sgd-is-broken-gradient'),
    quiz('sgd-iteration-epoch', copy('1000 样本、batch size=100，一个 epoch 几次 iteration？', 'With 1000 examples and batch size 100, how many iterations per epoch?'), 'ten', copy('10 次。', '10 iterations.'), copy('1 次。', '1 iteration.'), copy('iteration 是一次更新，epoch 是完整看过数据一遍。', 'An iteration is one update; an epoch is one full pass through data.'), 'epoch-equals-update'),
  ],
  misconceptions: [
    misconception('sgd-is-broken-gradient', copy('SGD 有噪声就坏了。', 'Noisy SGD means the gradient is broken.'), copy('小批量估计天然会有抽样噪声。', 'Mini-batch estimates naturally contain sampling noise.'), copy('不同 batch 会给略不同的平均方向。', 'Different batches give slightly different average directions.')),
    misconception('epoch-equals-update', copy('epoch 等于一次更新。', 'An epoch equals one update.'), copy('一个 epoch 可能包含多次 iteration。', 'One epoch can contain many iterations.'), copy('1000 样本 batch 100 时有 10 次更新。', '1000 examples with batch 100 gives 10 updates.')),
  ],
  accent: '#0f766e',
  theme: '#ecfdf5',
  sourceReferences: [sources.d2lOptimization, sources.mml],
})

export const calculusRouteModules: MathLabModule[] = [
  thirdChapter,
  fifthChapter,
]
