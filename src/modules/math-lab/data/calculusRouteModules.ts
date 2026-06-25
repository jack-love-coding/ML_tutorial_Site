import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
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

function manimAsset(id: string, assetPath: string, posterPath: string, title: LocalizedCopy, transcript: LocalizedCopy): VisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath,
    posterPath,
    transcript,
    alt: transcript,
    caption: transcript,
    learningPurpose: copy(
      '复用既有 Manim 动画展示连续变化过程。',
      'Reuse an existing Manim animation to show a continuous-change process.',
    ),
  }
}

function lab(id: string, title: LocalizedCopy, componentName: string, successCriteria: LocalizedCopy[]): LabConfig {
  return {
    id,
    title,
    type: 'interactive-visual',
    componentName,
    successCriteria,
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
  pytorchOptimization: {
    label: copy('PyTorch Optimizing Model Parameters', 'PyTorch Optimizing Model Parameters'),
    href: 'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html',
    usage: copy(
      '参考训练循环中 zero_grad、loss.backward 和 optimizer.step 的代码顺序。',
      'Reference for the code order of zero_grad, loss.backward, and optimizer.step in a training loop.',
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

const localChangeLab = lab('calculus-local-change-lab', copy('局部变化故事实验', 'Local Change Story Lab'), 'LocalChangeStoryLab', [
  copy('能把平均变化率读成一段区间的斜率。', 'Read average rate of change as the slope over an interval.'),
  copy('能解释观察窗口变小时读数为什么更局部。', 'Explain why a shrinking observation window gives a more local reading.'),
])

const gradientPathLab = lab('calculus-gradient-path-lab', copy('梯度路径实验', 'Gradient Path Lab'), 'MathGradientLab', [
  copy('能指出梯度、负梯度和更新方向。', 'Identify gradient, negative gradient, and update direction.'),
  copy('能比较学习率过小、合适和过大的轨迹。', 'Compare paths for too-small, suitable, and too-large learning rates.'),
])

const partialDerivativeLab = lab(
  'calculus-partial-derivative-lab',
  copy('偏导数与梯度等高线实验', 'Partial Derivative and Gradient Contour Lab'),
  'PartialDerivativeContourLab',
  [
    copy('能分别解释两个偏导数，并指出完整梯度方向。', 'Explain both partial derivatives and identify the full gradient direction.'),
    copy('能用方向导数说明任意方向上的局部变化。', 'Use the directional derivative to explain local change along any chosen direction.'),
  ],
)

const batchGradientNoiseLab = lab(
  'calculus-batch-gradient-noise-lab',
  copy('批量梯度噪声实验', 'Batch Gradient Noise Lab'),
  'BatchGradientNoiseLab',
  [
    copy('能比较全数据梯度和当前 batch 梯度。', 'Compare the full-data gradient and the current batch gradient.'),
    copy('能解释 batch size 如何影响梯度估计方差。', 'Explain how batch size changes gradient-estimate variance.'),
  ],
)

const optimizerRaceLab = lab(
  'calculus-optimizer-race-lab',
  copy('优化器赛道实验', 'Optimizer Race Lab'),
  'OptimizerRaceLab',
  [
    copy('能比较 SGD、Momentum、RMSProp 和 Adam 的路径差异。', 'Compare the trajectory differences among SGD, Momentum, RMSProp, and Adam.'),
    copy('能解释每个优化器状态如何改变更新方向。', 'Explain how each optimizer state changes the update direction.'),
  ],
)

const trainingDiagnosticsLab = lab(
  'calculus-training-diagnostics-lab',
  copy('训练代码和曲线诊断实验', 'Training Code and Curve Diagnostics Lab'),
  'TrainingDiagnosticsLab',
  [
    copy('能把训练循环三行核心代码和参数更新时机对应起来。', 'Match the three core training-loop calls to parameter-update timing.'),
    copy('能根据 loss、validation loss 和 gradient norm 做初步诊断。', 'Make a first diagnosis from loss, validation loss, and gradient norm.'),
  ],
)

const backpropBridgeLab = lab(
  'calculus-backprop-bridge-lab',
  copy('backward 计算图桥接实验', 'Backward Computation Graph Bridge Lab'),
  'BackpropBlockLab',
  [
    copy('能把 loss.backward 连接到计算图上的局部导数传递。', 'Connect loss.backward to local derivative flow through a computation graph.'),
    copy('能区分计算梯度和更新参数这两个动作。', 'Separate gradient computation from parameter updates.'),
  ],
)

const firstChapter = moduleDefinition({
  id: 'calculus-functions-rate-change',
  enhancementTier: 'interactive',
  title: copy('函数和变化率', 'Functions and Rate of Change'),
  subtitle: copy('从买菜和小车案例理解函数、输入输出和平均变化率。', 'Use grocery and car cases to understand functions, input-output, and average rate of change.'),
  difficulty: 'foundation',
  estimatedMinutes: 32,
  prerequisites: ['tensor-shapes-vectorization'],
  aiModelConnections: [copy('loss 可以看成 parameter 的函数。', 'Loss can be treated as a function of a parameter.')],
  learningObjectives: [
    copy('把生活案例拆成输入、函数规则和输出。', 'Decompose a daily case into input, function rule, and output.'),
    copy('用两个点解释平均变化率。', 'Explain average rate of change using two points.'),
    copy('把变化率语言迁移到 loss 和 parameter。', 'Transfer rate-of-change language to loss and parameter.'),
  ],
  concepts: [
    concept(
      'function-average-rate',
      copy('平均变化率', 'Average Rate of Change'),
      '\\frac{f(x+h)-f(x)}{h}',
      [
        variable('x', '输入起点。', 'Starting input.'),
        variable('h', '输入改变的距离。', 'Distance of input change.'),
        variable('f(x+h)-f(x)', '输出改变。', 'Output change.'),
      ],
      copy('输出变化除以输入变化。', 'Output change divided by input change.'),
      copy('图像上是两点之间的割线斜率。', 'On a graph it is the secant slope between two points.'),
      copy('2 斤菜 12 元、5 斤菜 27 元，平均变化率是 5 元/斤。', 'If 2 jin cost 12 and 5 jin cost 27, the average rate is 5 per jin.'),
      copy('训练中先比较两个 parameter 值之间的 loss 变化。', 'In training, first compare loss change between two parameter values.'),
    ),
  ],
  sections: [
    section(
      'function-machine-case',
      copy('案例：买菜、小车和函数机器', 'Case: Groceries, a Car, and a Function Machine'),
      copy(
        md`买菜时，输入可以是重量，输出是总价；小车运动时，输入可以是时间，输出是位置。函数不是只存在于公式里，而是把输入送进规则后得到输出的关系。先找 input-output，再问 function 规则怎样连接它们。`,
        md`In a grocery case, the input can be weight and the output can be total price. For a moving car, the input can be time and the output can be position. A function is not only a written formula; it is an input-output relationship where a rule turns one value into another. This section asks the learner to name the input, name the output, and then describe the function rule that connects them. That simple loop prepares the same thinking for model loss, where the input may be a parameter and the output is a loss value.`,
      ),
      { visualIds: ['calculus-route-story'], labIds: ['calculus-local-change-lab'] },
    ),
    section(
      'average-rate-secant',
      copy('平均变化率：一段区间的割线', 'Average Rate of Change: A Secant over One Interval'),
      copy(
        md`平均变化率比较两个输入点之间的输出改变。中文锚点是“平均变化率”，图像锚点是连接两点的 secant。它回答这一段区间里，输入每多一点，输出平均改变多少。`,
        md`Average rate of change compares output change between two input points. The graph anchor is a secant line connecting those points. It answers an interval question: over this span, how much does the output change per unit of input on average? The word average matters because the function may curve inside the interval. We are not yet asking for the exact current-point behavior; we are learning to measure a whole window before shrinking it.`,
      ),
    ),
    section(
      'loss-as-function-preview',
      copy('预告：loss 也是函数', 'Preview: Loss Is Also a Function'),
      copy(
        md`在机器学习中，固定数据后，loss 可以看成 parameter 的函数。parameter 改一点，预测可能改一点，loss 也会改一点。平均变化率先给粗读数，后面导数会给当前点附近的读数。`,
        md`In machine learning, once the data are fixed, loss can be read as a function of a parameter. Change the parameter, predictions may change, and loss changes as a result. This is the bridge from everyday functions to training behavior. Average rate of change gives a coarse interval reading between two parameter settings. Later, derivatives and gradients shrink that reading to the current parameter position so an optimizer can choose a direction.`,
      ),
    ),
    section(
      'function-rate-review',
      copy('复盘：输入、输出和区间', 'Review: Input, Output, and Interval'),
      copy(
        md`复习时先说输入是什么、输出是什么、两个输入点相距多远。再用公式解释这段区间的输出变化。这样公式、图像和机器学习里的 loss 都能接在一起。`,
        md`Review Questions: What is the input? What is the output? Which two input points define the interval? What output change occurs between them? Can you explain why a secant slope is an interval reading rather than a current-point reading? Finally, can you map the same language to loss and parameter, where changing a parameter produces a changed loss?`,
      ),
    ),
  ],
  visuals: [
    imageAsset(
      'calculus-route-story',
      '/math-lab/generated/beginner-calculus-story.png',
      copy('微积分路线故事图', 'Calculus Route Story'),
      copy('小车轨迹、切线和梯度路径把函数、变化率和训练联系起来。', 'A car path, tangent, and gradient path connect functions, rates of change, and training.'),
    ),
  ],
  labs: [localChangeLab],
  quizzes: [
    quiz('function-rate-interval', copy('平均变化率读什么？', 'What does average rate of change read?'), 'interval', copy('一段区间的平均输出变化。', 'Average output change over an interval.'), copy('当前点的瞬时读数。', 'The instantaneous reading at one point.'), copy('它用两个点，所以读区间，不是当前点。', 'It uses two points, so it reads an interval, not one current point.'), 'average-is-current-point', 'calculus-route-story'),
    quiz('function-input-output', copy('小车位置函数最自然的输入和输出是什么？', 'What are natural input and output choices for car position as a function?'), 'time-position', copy('输入是时间，输出是位置。', 'Input is time, output is position.'), copy('输入输出必须完全一样。', 'Input and output must be identical.'), copy('函数的核心是 input-output 关系。', 'The core of a function is an input-output relationship.'), 'function-is-only-formula'),
  ],
  misconceptions: [
    misconception('function-is-only-formula', copy('函数只有公式一种形式。', 'A function only exists as a formula.'), copy('函数可以由表格、图像、代码或公式表达。', 'A function can be expressed by a table, graph, code, or formula.'), copy('小车时间到位置的记录也能表示函数。', 'A table from car time to position can represent a function.')),
    misconception('average-is-current-point', copy('平均变化率就是当前点读数。', 'Average rate of change is the current-point reading.'), copy('平均变化率读区间；导数读当前点附近。', 'Average rate reads an interval; derivative reads near the current point.'), copy('整段平均车速不等于这一刻仪表盘速度。', 'Trip average speed is not the speedometer reading at this moment.')),
  ],
  accent: '#d65a31',
  theme: '#fff1e8',
  sourceReferences: [sources.essenceCalculus, sources.mml],
})

const secondChapter = moduleDefinition({
  id: 'calculus-derivatives-local-change',
  enhancementTier: 'interactive',
  title: copy('导数：当前点附近的变化', 'Derivatives as Local Change'),
  subtitle: copy('把平均变化率窗口缩小，得到当前点附近的局部变化率。', 'Shrink the average-rate window to get local change near the current point.'),
  difficulty: 'foundation',
  estimatedMinutes: 34,
  prerequisites: ['calculus-functions-rate-change'],
  aiModelConnections: [copy('导数说明当前 parameter 附近 loss 的局部变化。', 'A derivative describes local loss change near the current parameter.')],
  learningObjectives: [
    copy('解释导数来自缩小的观察窗口。', 'Explain that a derivative comes from a shrinking observation window.'),
    copy('区分割线和切线。', 'Distinguish secant and tangent.'),
    copy('用导数符号读局部上升、下降和平坦。', 'Use derivative sign to read local rising, falling, and flat behavior.'),
  ],
  concepts: [
    concept(
      'derivative-local-change',
      copy('导数', 'Derivative'),
      "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}",
      [
        variable("f'(x)", '当前点附近的局部变化率。', 'Local rate of change near the current point.'),
        variable('h\\to0', '观察窗口逐渐缩小。', 'The observation window shrinks toward zero.'),
      ],
      copy('导数是平均变化率在窗口缩小时的极限读数。', 'A derivative is the limiting reading of average rate as the window shrinks.'),
      copy('图像上对应当前点附近的切线斜率。', 'On a graph it corresponds to tangent slope near the current point.'),
      copy('小车在 3 秒附近每秒约走 8 米，导数可读作这一刻速度约 8 米/秒。', 'If a car moves about 8 meters per second near 3 seconds, the derivative reads speed near this moment as about 8 m/s.'),
      copy('优化器用这种局部读数决定参数试探方向。', 'Optimizers use this local reading to choose a parameter probing direction.'),
    ),
  ],
  sections: [
    section(
      'derivative-speedometer-case',
      copy('案例：这一刻的 speedometer', 'Case: The Speedometer at This Moment'),
      copy(
        md`整段旅程有平均速度，但仪表盘读的是“这一刻”附近。导数也是这样，它不总结全程，而是问当前点附近输入动一点，输出怎样动。`,
        md`A whole trip has an average speed, but a speedometer reads speed near this moment. A derivative works the same way: it does not summarize the whole curve, it asks how output changes when the input moves a tiny amount near the current point. This is the bridge from average rate of change to instantaneous change. The car may speed up, slow down, or flatten its motion, so different points on the same function can have different derivative values.`,
      ),
      { visualIds: ['derivative-window-image', 'derivative-window-video'], labIds: ['calculus-local-change-lab'] },
    ),
    section(
      'derivative-window-shrinks',
      copy('观察窗口：h=2,1,0.5,0.1', 'Observation Window: h=2,1,0.5,0.1'),
      copy(
        md`从 \(h=2,1,0.5,0.1\) 逐步缩小观察窗口。每一步仍是割线，但 secant 的两点越来越靠近当前点。窗口很小时，割线斜率靠近 tangent 斜率。`,
        md`Shrink the observation window through \(h=2,1,0.5,0.1\). Each reading is still a secant because two points are involved, but the points move closer to the current point. When the window becomes very small, the secant slope approaches the tangent slope. The derivative is therefore not a separate memorized trick; it is the stable local reading produced by shrinking an average-rate window.`,
      ),
    ),
    section(
      'derivative-signs-local',
      copy('导数符号：局部行为', 'Derivative Signs: Local Behavior'),
      copy(
        md`positive slope 表示附近往右走输出上升，negative slope 表示附近下降，flat neighborhood 表示附近变平。它们都是局部判断，不是整条曲线的全局判断。`,
        md`A positive slope means the output rises locally as input moves right. A negative slope means the output falls locally. A flat neighborhood means the derivative is near zero and the curve is locally level. These are local statements, not global promises. A curve can rise at one point and fall later. A flat point can be a minimum, a maximum, or a saddle-like pause depending on the surrounding shape.`,
      ),
    ),
    section(
      'derivative-review',
      copy('复盘：导数是局部读数', 'Review: Derivative Is a Local Reading'),
      copy(
        md`复盘时把大窗口平均变化率、小窗口割线和当前点切线连起来。再把正、负、零斜率翻译成局部上升、下降和平坦。`,
        md`Review Questions: Which two points define the secant? What happens as the observation window shrinks? Why does the tangent describe local change rather than a global average? What does a positive slope mean nearby? What does a negative slope mean nearby? What does a flat neighborhood say, and what does it not guarantee about the whole curve?`,
      ),
    ),
  ],
  visuals: [
    imageAsset('derivative-window-image', '/math-lab/generated/beginner-derivative-window-longform.png', copy('导数观察窗口', 'Derivative Observation Window'), copy('观察窗口逐步缩小，平均变化率靠近当前点导数。', 'The observation window shrinks so average rate approaches the derivative at the current point.')),
    manimAsset('derivative-window-video', '/manim/math-lab/beginner-derivative-window.mp4', '/manim/math-lab/beginner-derivative-window.svg', copy('导数窗口动画', 'Derivative Window Video'), copy('动画展示割线斜率怎样靠近切线斜率。', 'The animation shows secant slope approaching tangent slope.')),
  ],
  labs: [localChangeLab],
  quizzes: [
    quiz('derivative-not-global-average', copy('导数读什么？', 'What does a derivative read?'), 'local', copy('当前点附近的局部变化率。', 'The local rate of change near the current point.'), copy('整条曲线的平均高度。', 'The average height of the whole curve.'), copy('导数来自缩小窗口，所以是局部读数。', 'A derivative comes from a shrinking window, so it is local.'), 'derivative-global-average', 'derivative-window-video'),
    quiz('derivative-sign-reading', copy('导数为负表示什么？', 'What does a negative derivative mean?'), 'falling', copy('附近往右走时函数下降。', 'The function falls nearby as input moves right.'), copy('整条曲线永远下降。', 'The whole curve decreases forever.'), copy('导数符号描述局部斜率，不描述全局命运。', 'Derivative sign describes local slope, not the global fate of the curve.'), 'tangent-is-whole-curve'),
  ],
  misconceptions: [
    misconception('derivative-global-average', copy('导数是全局平均。', 'A derivative is a global average.'), copy('导数是当前点附近的局部变化率。', 'A derivative is local change near the current point.'), copy('仪表盘速度不是整段旅程平均速度。', 'Speedometer speed is not whole-trip average speed.')),
    misconception('tangent-is-whole-curve', copy('切线代表整条曲线。', 'A tangent represents the whole curve.'), copy('切线只近似当前点附近。', 'A tangent only approximates the curve near the current point.'), copy('脚下道路近似直线，远处仍会转弯。', 'A road can look straight under your feet and bend later.')),
  ],
  accent: '#c2410c',
  theme: '#fff7ed',
  sourceReferences: [sources.essenceCalculus, sources.mml],
})

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

const fourthChapter = moduleDefinition({
  id: 'calculus-gradient-descent',
  enhancementTier: 'interactive',
  title: copy('梯度下降', 'Gradient Descent'),
  subtitle: copy('沿负梯度方向走，用学习率控制每一步长度。', 'Walk along the negative gradient and use learning rate to control step length.'),
  difficulty: 'foundation',
  estimatedMinutes: 38,
  prerequisites: ['calculus-partial-derivatives-gradients'],
  aiModelConnections: [copy('训练的核心更新就是让参数沿负梯度降低 loss。', 'The core training update moves parameters along the negative gradient to reduce loss.')],
  learningObjectives: [
    copy('解释负梯度为什么用于下降。', 'Explain why the negative gradient is used for descent.'),
    copy('区分方向和学习率步长。', 'Separate direction from learning-rate step size.'),
    copy('识别震荡和发散。', 'Recognize oscillation and divergence.'),
  ],
  concepts: [
    concept('negative-gradient-step', copy('负梯度步', 'Negative-Gradient Step'), '\\theta_{new}=\\theta-\\eta\\nabla L(\\theta)', [variable('\\theta', '当前参数。', 'Current parameters.'), variable('\\eta', '学习率。', 'Learning rate.'), variable('\\nabla L', 'loss 梯度。', 'Loss gradient.')], copy('从参数中减去学习率乘梯度。', 'Subtract learning rate times gradient from parameters.'), copy('像沿 loss 山谷的下坡方向迈步。', 'Like stepping downhill in a loss valley.'), copy('梯度 \\([3,-2]\\)、学习率 0.1，更新为 \\([-0.3,0.2]\\)。', 'Gradient \\([3,-2]\\) with learning rate 0.1 gives update \\([-0.3,0.2]\\).'), copy('优化器围绕方向和步长组织更新。', 'Optimizers organize updates around direction and step size.')),
  ],
  sections: [
    section('descent-loss-valley-case', copy('案例：loss valley 和负梯度', 'Case: Loss Valley and Negative Gradient'), copy(md`把 loss 想成山谷。梯度指向上坡最快，负梯度指向局部下坡方向。训练不是一跳到底，而是在 loss valley 中根据当前局部地图迈步。`, md`Imagine loss as a valley landscape. The gradient points toward fastest uphill increase, while the negative gradient points locally downhill. Training does not jump to the bottom in one move. It reads the local map at the current parameter position and takes one update step. This case links the derivative sign, the gradient vector, and visible training behavior in the same story.`), { visualIds: ['learning-rate-image', 'learning-rate-video'], labIds: ['calculus-gradient-path-lab'] }),
    section('descent-minus-sign', copy('减号：subtract 不等于参数都变小', 'Minus Sign: Subtract Does Not Mean Every Parameter Gets Smaller'), copy(md`公式里的 subtract 是减去梯度方向，不表示 not every parameter gets smaller。若梯度分量为负，减去它会让对应参数变大。真正目标是 loss 下降。`, md`The subtract operation removes the uphill gradient direction, but it does not mean every parameter gets smaller. If a gradient component is negative, subtracting it increases that parameter. The correct object to watch is loss, not whether every parameter value decreased. This distinction matters when reading optimizer logs, because healthy training can include some parameters increasing while the objective falls.`)),
    section('descent-learning-rate', copy('学习率：震荡和发散', 'Learning Rate: Oscillation and Divergence'), copy(md`学习率决定沿负梯度走多远。学习率太小会慢，合适会下降，过大可能跨过谷底造成震荡，严重时 divergence。中文锚点是学习率、震荡和发散。`, md`The learning rate decides how far to move along the negative gradient. Too small can be stable but slow. A suitable value descends gradually. Too large can overshoot the valley, produce oscillation, or cause divergence. The loss curve is the evidence: if updates repeatedly cross the valley or grow worse, the step size no longer matches the local landscape.`)),
    section('descent-review', copy('复盘：方向、步长和曲线', 'Review: Direction, Step Size, and Curve'), copy(md`复习时先问梯度和负梯度方向，再问学习率步长，最后看 loss 是下降、震荡还是发散。`, md`Review Questions: Which way does the gradient point? Which way does the negative gradient point? What does the learning rate multiply? Why can a parameter increase even when we subtract the gradient? What does oscillation look like in a loss valley? What curve behavior suggests divergence? These questions keep direction, step size, and training evidence separate.`)),
  ],
  visuals: [
    imageAsset('learning-rate-image', '/math-lab/generated/beginner-learning-rate-behavior-longform.png', copy('学习率行为图', 'Learning-Rate Behavior Image'), copy('三条轨迹对比小、合适和过大学习率。', 'Three paths compare small, suitable, and too-large learning rates.')),
    manimAsset('learning-rate-video', '/manim/math-lab/beginner-learning-rate-behavior.mp4', '/manim/math-lab/beginner-learning-rate-behavior.svg', copy('学习率行为动画', 'Learning-Rate Behavior Video'), copy('动画对比稳定下降、震荡和发散。', 'The animation compares stable descent, oscillation, and divergence.')),
  ],
  labs: [gradientPathLab],
  quizzes: [
    quiz('descent-subtract-gradient', copy('为什么要减去梯度？', 'Why subtract the gradient?'), 'downhill', copy('梯度指向上坡，负梯度更可能降低 loss。', 'The gradient points uphill, so the negative gradient is more likely to reduce loss.'), copy('保证所有参数变小。', 'It guarantees every parameter gets smaller.'), copy('减号选择方向，不保证每个参数都变小。', 'The minus sign chooses direction; it does not guarantee every parameter shrinks.'), 'minus-means-parameters-smaller', 'learning-rate-video'),
    quiz('descent-large-learning-rate', copy('学习率过大常导致什么？', 'What can a too-large learning rate cause?'), 'oscillation', copy('oscillation 或 divergence。', 'Oscillation or divergence.'), copy('一定更快收敛。', 'Always faster convergence.'), copy('过大步长会跨过谷底，破坏局部下降假设。', 'Oversized steps can cross the valley and break the local descent assumption.'), 'learning-rate-is-speed-only', 'learning-rate-image'),
  ],
  misconceptions: [
    misconception('minus-means-parameters-smaller', copy('减号表示所有参数变小。', 'The minus sign means all parameters get smaller.'), copy('负梯度目标是让 loss 降低，参数可大可小。', 'The negative gradient aims to reduce loss; parameters can increase or decrease.'), copy('梯度为负时减去它会让参数变大。', 'If the gradient is negative, subtracting it increases the parameter.')),
    misconception('learning-rate-is-speed-only', copy('学习率只是速度，越大越好。', 'Learning rate is only speed, so larger is better.'), copy('学习率是步长，过大可能震荡或发散。', 'Learning rate is step size; too large can oscillate or diverge.'), copy('一步跨过谷底后可能来回跳。', 'A step can overshoot the valley and bounce back.')),
  ],
  accent: '#ea580c',
  theme: '#fff7ed',
  sourceReferences: [sources.essenceCalculus, sources.d2lOptimization, sources.mml],
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

const sixthChapter = moduleDefinition({
  id: 'calculus-optimizer-comparison',
  enhancementTier: 'interactive',
  title: copy('优化器比较', 'Optimizer Comparison'),
  subtitle: copy('比较 plain SGD、Momentum、RMSProp 和 Adam 各自解决的问题。', 'Compare the problem addressed by plain SGD, Momentum, RMSProp, and Adam.'),
  difficulty: 'foundation',
  estimatedMinutes: 40,
  prerequisites: ['calculus-sgd-batch-noise'],
  aiModelConnections: [copy('优化器把梯度、状态和学习率合成实际更新。', 'Optimizers combine gradients, state, and learning rate into actual updates.')],
  learningObjectives: [
    copy('用 plain SGD 作为基准。', 'Use plain SGD as the baseline.'),
    copy('解释 Momentum 的 direction memory。', 'Explain Momentum direction memory.'),
    copy('解释 RMSProp 和 Adam 的 squared-gradient history 与 scale adaptation。', 'Explain squared-gradient history and scale adaptation in RMSProp and Adam.'),
  ],
  concepts: [
    concept('optimizer-problem-map', copy('优化器更新模板', 'Optimizer Update Template'), '\\theta_{t+1}=\\theta_t-\\eta\\,\\operatorname{update}(g_t,\\text{state}_t)', [variable('g_t', '当前梯度。', 'Current gradient.'), variable('\\text{state}_t', '优化器历史状态。', 'Optimizer history state.'), variable('\\operatorname{update}', '把梯度和状态变成更新的规则。', 'Rule that turns gradient and state into an update.')], copy('优化器改变梯度如何变成下一步。', 'An optimizer changes how a gradient becomes the next step.'), copy('像同一地形上的不同走路策略。', 'Like different walking strategies on the same landscape.'), copy('Momentum 用方向历史，Adam 还用平方梯度历史。', 'Momentum uses direction history, and Adam also uses squared-gradient history.'), copy('选择优化器要看地形、噪声和验证表现。', 'Optimizer choice depends on landscape, noise, and validation behavior.')),
  ],
  sections: [
    section('optimizer-baseline-sgd', copy('Plain SGD baseline', 'Plain SGD Baseline'), copy(md`plain SGD baseline 直接使用当前梯度乘学习率，然后沿负方向更新。它状态少、行为透明，是比较 Momentum、RMSProp 和 Adam 的基准。`, md`The plain SGD baseline uses the current gradient, multiplies by learning rate, and steps in the negative direction. It has little state and transparent behavior, so it is the reference point for optimizer comparison. If plain SGD is already descending smoothly, a more complex optimizer is not automatically better. If it bounces through a narrow valley or reacts badly to scale differences, other optimizer states may help.`), { labIds: ['calculus-optimizer-race-lab'] }),
    section('optimizer-momentum-ravine', copy('Momentum：ravine 里的 direction memory', 'Momentum: Direction Memory in a Ravine'), copy(md`Momentum 在狭长 ravine 中使用 direction memory。横向梯度可能来回反转，而沿谷底方向持续出现，动量会累积持续方向，减少低效摆动。`, md`Momentum uses direction memory in a narrow ravine. Sideways gradients may reverse from step to step, while the useful direction along the valley persists. Momentum accumulates directions that keep appearing and reduces directions that repeatedly flip. The result can be smoother progress through a ravine, not magic speed in every problem. The model still needs a learning rate and validation checks.`)),
    section('optimizer-rmsprop-adam', copy('RMSProp 和 Adam：squared-gradient history', 'RMSProp and Adam: Squared-Gradient History'), copy(md`RMSProp 维护 squared-gradient history，用历史平方梯度估计不同方向尺度，做 scale adaptation。Adam 结合 Momentum 式方向记忆和 RMSProp 式尺度自适应。`, md`RMSProp maintains squared-gradient history, using past squared gradients to estimate scale in each parameter direction and adapt the update. Adam combines Momentum-like direction memory with RMSProp-like scale adaptation. These methods can stabilize early training and reduce sensitivity to uneven parameter scales, but they do not remove the need for learning-rate choices, regularization, and validation-loss monitoring.`)),
    section('optimizer-review', copy('复盘：优化器解决具体问题', 'Review: Optimizers Solve Specific Problems'), copy(md`复习时问当前问题是什么：SGD 是否足够，是否有 ravine，是否有尺度差异，Adam 是否真的改善验证表现。`, md`Review Questions: What does plain SGD do without extra state? What ravine problem motivates Momentum? What does squared-gradient history help RMSProp estimate? How does Adam combine Momentum and scale adaptation? Why does an adaptive optimizer not remove the learning rate? Why is Adam not always best? The review maps optimizer choice to evidence rather than a memorized ranking.`)),
  ],
  visuals: [],
  labs: [optimizerRaceLab],
  quizzes: [
    quiz('optimizer-momentum-problem', copy('Momentum 主要缓解什么？', 'What does Momentum mainly address?'), 'ravine', copy('ravine 中来回摆动但有持续方向的轨迹。', 'A ravine path with bouncing but a persistent direction.'), copy('取消学习率。', 'Removing learning rate.'), copy('Momentum 使用方向记忆，但仍需要学习率。', 'Momentum uses direction memory but still needs learning rate.'), 'optimizer-removes-learning-rate'),
    quiz('optimizer-adam-combines', copy('Adam 结合什么？', 'What does Adam combine?'), 'both', copy('方向记忆和 squared-gradient history 的尺度自适应。', 'Direction memory and scale adaptation from squared-gradient history.'), copy('只用当前梯度，不保存状态。', 'Only current gradient with no state.'), copy('Adam 结合一阶和二阶历史，但不保证永远最好。', 'Adam combines first- and second-history estimates, but is not always best.'), 'adam-always-best'),
  ],
  misconceptions: [
    misconception('optimizer-removes-learning-rate', copy('优化器能取消学习率。', 'Optimizers remove the learning rate.'), copy('学习率仍控制全局步长尺度。', 'Learning rate still controls the global step-size scale.'), copy('Adam 通常也要调学习率。', 'Adam often still needs learning-rate tuning.')),
    misconception('adam-always-best', copy('Adam 永远最好。', 'Adam is always best.'), copy('Adam 常好用，但任务、泛化和地形会改变选择。', 'Adam is often useful, but task, generalization, and landscape affect the choice.'), copy('有些流程会比较 Adam 和 SGD with Momentum。', 'Some workflows compare Adam with SGD with Momentum.')),
  ],
  accent: '#2563eb',
  theme: '#eff6ff',
  sourceReferences: [sources.d2lOptimization, sources.pytorchOptimization, sources.mml],
})

const seventhChapter = moduleDefinition({
  id: 'calculus-training-code-diagnostics',
  enhancementTier: 'interactive',
  title: copy('训练代码和曲线诊断', 'Training Code and Curve Diagnostics'),
  subtitle: copy('把梯度公式落到训练循环代码，再用曲线诊断训练状态。', 'Connect gradient formulas to training-loop code, then diagnose training state with curves.'),
  difficulty: 'foundation',
  estimatedMinutes: 42,
  prerequisites: ['calculus-optimizer-comparison'],
  aiModelConnections: [copy('loss、validation loss 和 gradient norm 是训练更新的外显信号。', 'Loss, validation loss, and gradient norm are visible signals of training updates.')],
  learningObjectives: [
    copy('说明 zero_grad、loss.backward 和 optimizer.step 的顺序。', 'Explain the order of zero_grad, loss.backward, and optimizer.step.'),
    copy('把 backward 理解为计算图上的梯度计算。', 'Understand backward as gradient computation through the computation graph.'),
    copy('用曲线诊断 overfitting、exploding gradients 和 vanishing gradients。', 'Use curves to diagnose overfitting, exploding gradients, and vanishing gradients.'),
  ],
  concepts: [
    concept('training-loop-gradient-step', copy('训练循环梯度步', 'Training Loop Gradient Step'), '\\texttt{zero\\_grad()}\\rightarrow\\texttt{loss.backward()}\\rightarrow\\texttt{optimizer.step()}', [variable('zero\\_grad()', '清空旧梯度。', 'Clear old gradients.'), variable('loss.backward()', '沿计算图计算梯度。', 'Compute gradients through the graph.'), variable('optimizer.step()', '按优化器规则更新参数。', 'Update parameters by the optimizer rule.')], copy('先清梯度，再计算梯度，最后更新参数。', 'Clear gradients, compute gradients, then update parameters.'), copy('像擦黑板、算坡度、再迈步。', 'Like clearing the board, computing slope, then stepping.'), copy('忘记 zero_grad 会累积旧梯度；忘记 step 参数不会更新。', 'Forgetting zero_grad accumulates old gradients; forgetting step leaves parameters unchanged.'), copy('代码、自动微分和曲线诊断围绕这三步闭环。', 'Code, autodiff, and curve diagnostics revolve around this three-step loop.'), md`optimizer.zero_grad()
loss = criterion(model(x), y)
loss.backward()
optimizer.step()`),
  ],
  sections: [
    section('training-loop-order', copy('训练循环顺序', 'Training Loop Order'), copy(md`标准训练步先 zero_grad，再计算 loss，然后 loss.backward，最后 optimizer.step。旧梯度没清会累积；只 backward 不 step，参数不会更新。`, md`A standard training step calls zero_grad, computes loss, calls loss.backward, and then calls optimizer.step. The order matters. If old gradients are not cleared, they accumulate into the next step. If backward is called without step, parameters do not update. If step is called before current gradients exist, the optimizer cannot use the current loss signal. The code order is the practical face of the calculus update.`), { labIds: ['calculus-training-diagnostics-lab'] }),
    section('training-backward-meaning', copy('backward：计算图上的梯度计算', 'Backward: Gradient Computation Through the Computation Graph'), copy(md`loss.backward 不是直接更新参数。它做 gradient computation through computation graph，把上游梯度乘过局部导数，写入参数的 grad。optimizer.step 才真正改变参数。`, md`loss.backward is not the call that directly updates parameters. It performs gradient computation through computation graph: starting at loss, upstream gradients are multiplied through local derivatives until each parameter receives a gradient value. The call that actually changes parameter values is optimizer.step. This distinction explains many silent bugs in training code, especially loops that compute gradients but never step.`), { labIds: ['calculus-backprop-bridge-lab'] }),
    section('training-curves-diagnostics', copy('曲线诊断', 'Curve Diagnostics'), copy(md`gradient norm、validation loss、overfitting、exploding gradients、vanishing gradients 都是训练曲线里的诊断词。train loss 降而 validation loss 升，常见于过拟合；loss 和 gradient norm 暴涨，可能是梯度爆炸。`, md`gradient norm, validation loss, overfitting, exploding gradients, and vanishing gradients are diagnostic words for training curves. If train loss falls while validation loss rises, overfitting is likely. If loss and gradient norm rise sharply together, exploding gradients or an oversized learning rate should be checked. If loss remains high while gradient norm becomes tiny, vanishing gradients, saturation, or poor initialization may be involved. Curves point to the next test rather than acting as decoration.`)),
    section('training-code-review', copy('复盘：代码和证据', 'Review: Code and Evidence'), copy(md`复习时把代码和曲线对应：zero_grad 清旧账，loss.backward 算梯度，optimizer.step 更新参数。再用 loss、validation loss 和 gradient norm 判断问题。`, md`Review Questions: Which line clears old gradients? Which line computes gradients through the computation graph? Which line updates parameters? If train loss falls while validation loss rises, what diagnosis fits? If gradient norm explodes with loss, what should be checked? If gradients vanish while loss remains high, why might training longer not fix the problem? The goal is to connect calculus, code order, and curve evidence in one loop.`)),
  ],
  visuals: [],
  labs: [trainingDiagnosticsLab, backpropBridgeLab],
  quizzes: [
    quiz('training-loop-order', copy('哪一行真正更新参数？', 'Which line actually updates parameters?'), 'step', copy('optimizer.step()。', 'optimizer.step().'), copy('loss.backward()。', 'loss.backward().'), copy('backward 计算梯度，step 更新参数。', 'backward computes gradients; step updates parameters.'), 'backward-updates-parameters'),
    quiz('training-curve-diagnosis', copy('train loss 降、validation loss 升，像什么？', 'Train loss falls while validation loss rises. What does this resemble?'), 'overfit', copy('overfitting。', 'Overfitting.'), copy('只要训练更久。', 'Just train longer.'), copy('训练集变好但验证集变差，说明泛化没有跟上。', 'Training improves while validation worsens, so generalization is not keeping up.'), 'train-longer-fixes-all'),
  ],
  misconceptions: [
    misconception('backward-updates-parameters', copy('backward 会直接更新参数。', 'backward directly updates parameters.'), copy('backward 计算梯度，optimizer.step 更新参数。', 'backward computes gradients; optimizer.step updates parameters.'), copy('只 backward 不 step，优化器不会迈步。', 'Calling backward without step does not make the optimizer step.')),
    misconception('train-longer-fixes-all', copy('所有问题训练更久就能解决。', 'Training longer fixes every problem.'), copy('过拟合、梯度爆炸和梯度消失通常要改变设置。', 'Overfitting, exploding gradients, and vanishing gradients usually require changing settings.'), copy('validation loss 已升时，训练更久可能更差。', 'If validation loss is rising, training longer can be worse.')),
  ],
  accent: '#334155',
  theme: '#f8fafc',
  sourceReferences: [sources.pytorchOptimization, sources.d2lOptimization, sources.mml],
})

export const calculusRouteModules: MathLabModule[] = [
  firstChapter,
  secondChapter,
  thirdChapter,
  fourthChapter,
  fifthChapter,
  sixthChapter,
  seventhChapter,
]
