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
    requiredModuleIds: ['beginner-linear-algebra', 'linear-algebra-feature-space', 'loss-functions'],
    supportModuleIds: ['linear-algebra-distance-similarity'],
    outcomes: [
      copy(
        '能把样本读成特征向量，并把 loss 读成训练反馈信号。',
        'Read a sample as a feature vector and read loss as the feedback signal for training.',
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
        '能解释 sigmoid/probability、阈值、混淆矩阵、precision/recall、ROC 和校准。',
        'Explain sigmoid/probability, thresholds, confusion matrix, precision/recall, ROC, and calibration.',
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
    requiredModuleIds: ['splits-generalization', 'model-selection', 'complexity-regularization'],
    supportModuleIds: ['training-diagnostics'],
    outcomes: [
      copy(
        '能解释数据泄漏、验证集、交叉验证、正则化和 train/validation 曲线。',
        'Explain leakage, validation sets, cross-validation, regularization, and train/validation curves.',
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
    requiredModuleIds: ['mlp', 'optimizer-comparison'],
    supportModuleIds: [
      'matrix-calculus-autodiff',
      'calculus-training-code-diagnostics',
      'deep-architecture-math',
    ],
    outcomes: [
      copy(
        '能解释隐藏层表示、激活函数、反向传播、优化器差异和过拟合诊断。',
        'Explain hidden representations, activations, backpropagation, optimizer differences, and overfitting diagnostics.',
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
    requiredModuleIds: ['sequence-embedding-bridge', 'attention-transformer'],
    supportModuleIds: [
      'linear-algebra-distance-similarity',
      'probability-likelihood-entropy',
      'tensor-shapes-vectorization',
    ],
    outcomes: [
      copy(
        '能解释 token id、embedding lookup、位置/mask、Q/K/V、softmax weighted sum、multi-head shape 和 Transformer block。',
        'Explain token ids, embedding lookup, position/mask, Q/K/V, softmax weighted sums, multi-head shapes, and Transformer blocks.',
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
