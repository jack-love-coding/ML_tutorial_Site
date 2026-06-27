import { curriculumModuleById } from './catalog.ts'
import type { CurriculumSpineStage } from './types.ts'
import type { LocalizedCopy } from '../types/ml.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const curriculumSpineStages: CurriculumSpineStage[] = [
  {
    id: 'orientation',
    title: copy('方向感：模型怎样学习', 'Orientation: How Models Learn'),
    learnerQuestion: copy(
      '模型从数据中学习到底是什么意思？',
      'What does it mean for a model to learn from data?',
    ),
    bridge: copy(
      '先建立共同词汇：样本、特征、标签、预测、误差和训练循环。后面的数据、模型和数学都会反复回到这几个词。',
      'Start with the shared vocabulary: sample, feature, label, prediction, error, and training loop. Later stages keep returning to these words.',
    ),
    requiredModuleIds: ['ai-overview', 'python-notebook'],
    supportModuleIds: [],
    outcomes: [
      copy(
        '能解释输入、目标、模型、预测、误差、参数和训练循环。',
        'Explain input, target, model, prediction, error, parameters, and the training loop.',
      ),
    ],
  },
  {
    id: 'data-to-features',
    title: copy('数据变成特征', 'Data Becomes Features'),
    learnerQuestion: copy(
      '原始表格怎样变成模型可以读取的特征？',
      'How does a raw table become features a model can read?',
    ),
    bridge: copy(
      '知道模型会学习之后，先看它到底吃进去什么。原始列、缺失、类别和标签质量会决定后面所有模型的输入。',
      'Once learning is defined, inspect what the model consumes. Raw columns, missing values, categories, and labels shape later inputs.',
    ),
    requiredModuleIds: ['numerical-data', 'categorical-data', 'dataset-quality'],
    supportModuleIds: [],
    outcomes: [
      copy(
        '能区分数值列、类别列、标签质量和会影响模型输入的清洗决策。',
        'Distinguish numeric columns, categorical columns, label quality, and cleaning decisions that affect model input.',
      ),
    ],
  },
  {
    id: 'feature-space-and-loss',
    title: copy('特征空间与损失', 'Feature Space and Loss'),
    learnerQuestion: copy(
      '模型怎么知道自己错了，特征向量又为什么有方向和距离？',
      'How does a model know it is wrong, and why do feature vectors have direction and distance?',
    ),
    bridge: copy(
      '当数据变成特征向量，下一步就是给预测错误一个评分规则。loss 把数据选择、模型输出和训练反馈连起来。',
      'Once data becomes feature vectors, the next step is scoring prediction error. Loss connects data choices, output, and feedback.',
    ),
    requiredModuleIds: ['beginner-linear-algebra', 'linear-algebra-feature-space', 'loss-functions'],
    supportModuleIds: ['linear-algebra-distance-similarity'],
    outcomes: [
      copy(
        '能把一行数据追踪成特征向量，并解释 loss 怎样给一次预测打分。',
        'Trace a row into a feature vector and explain how loss scores one prediction.',
      ),
    ],
  },
  {
    id: 'linear-regression',
    title: copy('第一个可解释模型', 'First Interpretable Model'),
    learnerQuestion: copy(
      '线性模型如何用权重拟合数值目标？',
      'How does a linear model use weights to fit a numeric target?',
    ),
    bridge: copy(
      '有了特征和 loss，线性回归就是第一个能手算、能画图、能复盘误差的完整模型。房价项目用它做诚实 baseline。',
      'With features and loss in place, linear regression becomes the first complete model you can calculate, draw, and review.',
    ),
    requiredModuleIds: ['linear-regression'],
    supportModuleIds: ['linear-algebra-matrix-transformations', 'least-squares-fitting'],
    projectModuleIds: ['housing-price-project'],
    outcomes: [
      copy(
        '能解释残差、斜率/权重、多变量输入和房价项目中的线性 baseline。',
        'Explain residuals, slope/weights, multivariate input, and the linear baseline in the housing project.',
      ),
    ],
  },
  {
    id: 'training-motion',
    title: copy('训练为什么会动', 'Why Training Moves'),
    learnerQuestion: copy(
      '梯度、学习率和 batch noise 怎样改变训练轨迹？',
      'How do gradients, learning rate, and batch noise change the training trajectory?',
    ),
    bridge: copy(
      '线性模型让误差可见，梯度下降解释参数为什么会动。这里把 loss surface、学习率和 batch noise 变成训练轨迹。',
      'Linear models make error visible; gradient descent explains why parameters move through loss surface, learning rate, and batch noise.',
    ),
    requiredModuleIds: ['gradient-descent'],
    supportModuleIds: [
      'calculus-derivatives-local-change',
      'calculus-partial-derivatives-gradients',
      'calculus-gradient-descent',
      'calculus-sgd-batch-noise',
    ],
    outcomes: [
      copy(
        '能判断收敛、震荡、发散和 mini-batch 噪声的基本原因。',
        'Judge the basic causes of convergence, oscillation, divergence, and mini-batch noise.',
      ),
    ],
  },
  {
    id: 'classification-probability',
    title: copy('分类与概率输出', 'Classification and Probability Outputs'),
    learnerQuestion: copy(
      '分类模型怎样把分数或概率变成决策？',
      'How does a classifier turn scores or probabilities into decisions?',
    ),
    bridge: copy(
      '回归预测连续数值，分类要把分数或概率变成决策。这里先建立概率、阈值和错误成本，再进入项目复盘。',
      'Regression predicts continuous values; classification turns scores or probabilities into decisions through thresholds and error costs.',
    ),
    requiredModuleIds: [
      'logistic-regression',
      'beginner-probability-distributions',
      'probability-likelihood-entropy',
      'classification',
    ],
    supportModuleIds: ['categorical-data', 'dataset-quality'],
    projectModuleIds: ['classification-project'],
    outcomes: [
      copy(
        '能按错误成本选择阈值，并解释混淆矩阵、precision 和 recall 的取舍。',
        'Choose a threshold by error cost and explain confusion-matrix, precision, and recall tradeoffs.',
      ),
    ],
  },
  {
    id: 'generalization-selection',
    title: copy('泛化与模型选择', 'Generalization and Model Selection'),
    learnerQuestion: copy(
      '为什么训练集表现好，不代表未来数据也会好？',
      'Why does strong training performance not guarantee future performance?',
    ),
    bridge: copy(
      '能训练一个模型还不够，还要知道它离开训练集后会不会可靠。这里把 split、泄漏、交叉验证和正则化放成评估协议。',
      'Training a model is not enough; this stage turns splits, leakage, cross-validation, and regularization into an evaluation protocol.',
    ),
    requiredModuleIds: ['splits-generalization', 'model-selection', 'complexity-regularization'],
    supportModuleIds: ['training-diagnostics'],
    outcomes: [
      copy(
        '能区分训练、验证和最终测试的职责，并用曲线判断泄漏、过拟合或欠拟合。',
        'Separate train, validation, and final test roles, then use curves to diagnose leakage, overfitting, or underfitting.',
      ),
    ],
  },
  {
    id: 'trees-and-interactions',
    title: copy('非线性表格模型', 'Nonlinear Tabular Models'),
    learnerQuestion: copy(
      '不用神经网络时，模型怎样学习规则和特征交互？',
      'How can a model learn rules and feature interactions without a neural network?',
    ),
    bridge: copy(
      '在进入神经网络前，先看不用梯度也能学习非线性规则的模型。树和森林帮助区分规则、交互、复杂度和重要性。',
      'Before neural networks, study nonlinear rules without gradients. Trees and forests separate rules, interactions, complexity, and importance.',
    ),
    requiredModuleIds: ['tree-forest'],
    supportModuleIds: [],
    outcomes: [
      copy(
        '能解释树的切分、深度过拟合、随机森林稳定性和特征重要性局限。',
        'Explain tree splits, depth overfitting, random-forest stability, and limits of feature importance.',
      ),
    ],
  },
  {
    id: 'neural-network-foundations',
    title: copy('神经网络基础', 'Neural Network Foundations'),
    learnerQuestion: copy(
      '层、激活函数、反向传播和优化器状态怎样产生非线性表示？',
      'How do layers, activations, backpropagation, and optimizer state create nonlinear representations?',
    ),
    bridge: copy(
      '树模型会切规则，神经网络会学习表示。这里把层、激活函数、反向传播和优化器状态接成可诊断的训练系统。',
      'Trees cut rules; neural networks learn representations. This stage connects layers, activations, backpropagation, and optimizer state.',
    ),
    requiredModuleIds: ['mlp', 'optimizer-comparison'],
    supportModuleIds: [
      'matrix-calculus-autodiff',
      'calculus-training-code-diagnostics',
      'deep-architecture-math',
    ],
    outcomes: [
      copy(
        '能把隐藏层表示、优化器状态和 loss 曲线连起来诊断训练行为。',
        'Connect hidden representations, optimizer state, and loss curves to diagnose training behavior.',
      ),
    ],
  },
  {
    id: 'visual-deep-learning',
    title: copy('视觉深度学习', 'Visual Deep Learning'),
    learnerQuestion: copy(
      'CNN 为什么比全连接网络更适合图像？',
      'Why are CNNs better suited to images than fully connected networks?',
    ),
    bridge: copy(
      '理解 MLP 后，再看图像为什么需要空间结构。CNN 把 H×W×C、局部窗口、参数共享和 shape 变化连成视觉模型。',
      'After MLPs, study why images need spatial structure. CNNs connect H×W×C, local windows, weight sharing, and shape changes.',
    ),
    requiredModuleIds: ['tensor-shapes-vectorization', 'cnn-visualization'],
    supportModuleIds: [],
    outcomes: [
      copy(
        '能解释 image tensor、卷积核、padding、stride、pooling 和感受野。',
        'Explain image tensors, kernels, padding, stride, pooling, and receptive fields.',
      ),
    ],
  },
  {
    id: 'sequence-attention',
    title: copy('序列、注意力与 Transformer', 'Sequences, Attention, and Transformers'),
    learnerQuestion: copy(
      '模型怎样处理 token 顺序，并用注意力混合上下文？',
      'How does a model handle token order and use attention to mix context?',
    ),
    bridge: copy(
      '图像强调空间位置，序列强调 token 位置。先把 token id、embedding、position 和 mask 接成 [B,T,H]，再进入 attention。',
      'Images emphasize spatial position; sequences emphasize token position. Connect token ids, embeddings, position, and mask into [B,T,H] before attention.',
    ),
    requiredModuleIds: ['sequence-embedding-bridge', 'attention-transformer'],
    supportModuleIds: [
      'linear-algebra-distance-similarity',
      'probability-likelihood-entropy',
      'tensor-shapes-vectorization',
    ],
    outcomes: [
      copy(
        '能从 token id 追踪到 [B,T,H]，再解释 attention 怎样混合上下文。',
        'Trace token ids to [B,T,H], then explain how attention mixes context.',
      ),
    ],
  },
]

export function curriculumSpineRequiredModuleIds() {
  return curriculumSpineStages.flatMap((stage) => stage.requiredModuleIds)
}

export function curriculumSpineValidationIssues() {
  const issues: string[] = []
  const requiredSeen = new Set<string>()

  for (const stage of curriculumSpineStages) {
    const referencedModuleIds = [
      ...stage.requiredModuleIds,
      ...stage.supportModuleIds,
      ...(stage.projectModuleIds ?? []),
    ]

    for (const moduleId of referencedModuleIds) {
      if (!curriculumModuleById.has(moduleId)) {
        issues.push(`${stage.id} references unknown module ${moduleId}`)
      }
    }

    for (const moduleId of stage.requiredModuleIds) {
      if (requiredSeen.has(moduleId)) {
        issues.push(`${moduleId} appears more than once as a required spine module`)
      }
      requiredSeen.add(moduleId)
    }
  }

  return issues
}
