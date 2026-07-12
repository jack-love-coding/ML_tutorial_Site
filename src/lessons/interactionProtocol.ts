import type { LocalizedCopy, ModuleSlug } from '../types/ml'
import type { LessonPagePilotSlug } from './labRegistry'

export type TeachingInteractionLevel = 4 | 5
export type TeachingInteractionEvidenceKind = 'configuration' | 'metric' | 'observation' | 'explanation'

export interface TeachingInteractionItem {
  id: string
  label: LocalizedCopy
  description: LocalizedCopy
}

export interface TeachingInteractionEvidence {
  id: string
  kind: TeachingInteractionEvidenceKind
  label: LocalizedCopy
  source: LocalizedCopy
}

export interface TeachingInteractionProtocol {
  id: string
  moduleSlug: LessonPagePilotSlug
  labId: string
  sectionIds: readonly string[]
  level: TeachingInteractionLevel
  learningGoal: LocalizedCopy
  predictionPrompt: LocalizedCopy
  manipulableVariables: readonly TeachingInteractionItem[]
  observableMetrics: readonly TeachingInteractionItem[]
  successCriteria: readonly LocalizedCopy[]
  reflectionPrompt: LocalizedCopy
  evidence: readonly TeachingInteractionEvidence[]
}

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function item(id: string, label: LocalizedCopy, description: LocalizedCopy): TeachingInteractionItem {
  return { id, label, description }
}

function evidence(
  id: string,
  kind: TeachingInteractionEvidenceKind,
  label: LocalizedCopy,
  source: LocalizedCopy,
): TeachingInteractionEvidence {
  return { id, kind, label, source }
}

export const lessonInteractionProtocols: readonly TeachingInteractionProtocol[] = [
  {
    id: 'ai-overview:learning-signal-comparison',
    moduleSlug: 'ai-overview',
    labId: 'ai-overview-task-lab',
    sectionIds: ['three-problems', 'learning-paradigms', 'choose-learning-approach'],
    level: 4,
    learningGoal: loc(
      '把智能学习助手的三个问题拆成可用信息、学习信号、输出与解释边界。',
      'Decompose the learning assistant’s three problems into available information, learning signal, output, and interpretation boundary.',
    ),
    predictionPrompt: loc(
      '先预测：从分数预测切到学习模式发现或练习选择后，信号会变成标签误差、结构距离还是行动奖励？',
      'Predict first: after switching from numerical prediction to pattern discovery or exercise choice, does the signal become label error, structural distance, or action reward?',
    ),
    manipulableVariables: [
      item(
        'scenario-card',
        loc('任务场景卡', 'Task scenario card'),
        loc('在预测下一次练习结果、发现学习模式和选择下一道练习之间切换。', 'Switch among predicting the next result, discovering learning patterns, and choosing the next exercise.'),
      ),
      item(
        'story-lens',
        loc('比较维度', 'Comparison dimension'),
        loc('依次查看可用信息、学习信号、学到什么和输出。', 'Inspect available information, learning signal, learned object, and output in turn.'),
      ),
    ],
    observableMetrics: [
      item(
        'paradigm',
        loc('学习范式', 'Learning paradigm'),
        loc('读出当前场景是监督、无监督还是强化学习。', 'Read whether the current scenario is supervised, unsupervised, or reinforcement learning.'),
      ),
      item(
        'feedback-signal',
        loc('学习信号', 'Learning signal'),
        loc('判断信号来自标签误差、结构距离还是行动后的奖励。', 'Decide whether the signal comes from label error, structural distance, or reward after an action.'),
      ),
    ],
    successCriteria: [
      loc(
        '能在不背算法名的情况下说出当前任务的可用信息、信号和输出。',
        'You can name the available information, signal, and output without relying on algorithm names.',
      ),
      loc(
        '能解释为什么无标签不等于无目标、reward 也不等于监督标签。',
        'You can explain why no labels does not mean no objective and why reward is not a supervised label.',
      ),
    ],
    reflectionPrompt: loc(
      '如果把当前场景的学习信号换成另一个范式的信号，哪个关键假设会先失效？',
      'If the current learning signal were replaced by another paradigm’s signal, which key assumption would fail first?',
    ),
    evidence: [
      evidence(
        'selected-scenario',
        'configuration',
        loc('选择的场景卡', 'Selected scenario card'),
        loc('概览实验台中的高亮任务卡。', 'The highlighted task card in the overview lab.'),
      ),
      evidence(
        'signal-readout',
        'observation',
        loc('信息/信号/输出读数', 'Information/signal/output readout'),
        loc('当前场景详情中的可用信息、学习信号与输出。', 'Available information, learning signal, and output in the current scenario detail.'),
      ),
      evidence(
        'learner-explanation',
        'explanation',
        loc('范式解释', 'Paradigm explanation'),
        loc('用自己的话说明该信号为什么支持当前范式，并指出一个易混误区。', 'Explain why the signal supports the current paradigm and name one tempting misconception.'),
      ),
    ],
  },
  {
    id: 'gradient-descent:safe-learning-rate',
    moduleSlug: 'gradient-descent',
    labId: 'gradient-chapter-lab',
    sectionIds: ['learning-rate'],
    level: 5,
    learningGoal: loc(
      '在不震荡或发散的前提下，找到更快下降的学习率设置。',
      'Find a faster learning-rate setting without causing oscillation or divergence.',
    ),
    predictionPrompt: loc(
      '先预测：把学习率提高一倍后，路径会更快进谷底，还是跨过谷底来回震荡？',
      'Predict first: if the learning rate doubles, will the path reach the valley faster or overshoot and oscillate?',
    ),
    manipulableVariables: [
      item(
        'learning-rate',
        loc('学习率', 'Learning rate'),
        loc('只改变步长，保留地形和起点作为对照。', 'Change only the step size while keeping terrain and start point as the control.'),
      ),
      item(
        'loss-function',
        loc('损失地形', 'Loss terrain'),
        loc('在二次碗、峡谷、鞍点和多井地形之间对比路径稳定性。', 'Compare path stability across bowl, ravine, saddle, and multi-well terrains.'),
      ),
      item(
        'start-point',
        loc('起点', 'Start point'),
        loc('拖动等高线起点，观察同一规则在不同位置的表现。', 'Drag the contour-map start point and observe the same rule from different locations.'),
      ),
    ],
    observableMetrics: [
      item(
        'loss',
        loc('最终 loss', 'Final loss'),
        loc('下降速度必须和最终损失一起读，不能只看前几步。', 'Read descent speed together with final loss, not only the first few steps.'),
      ),
      item(
        'step-size',
        loc('单步长度', 'Step size'),
        loc('用步长判断学习率是否正在跨过谷底。', 'Use step size to judge whether the learning rate is jumping across the valley.'),
      ),
      item(
        'status',
        loc('轨迹状态', 'Trajectory status'),
        loc('观察稳定、震荡、停滞或发散的状态标签。', 'Watch the status label for stable, oscillating, stalled, or divergent behavior.'),
      ),
    ],
    successCriteria: [
      loc(
        '能给出一个比默认值更积极、但仍保持稳定的学习率。',
        'You can name a more aggressive learning rate than the default that remains stable.',
      ),
      loc(
        '能用 loss、步长和轨迹状态解释为什么“更大”不一定“更快”。',
        'You can use loss, step size, and trajectory status to explain why bigger is not always faster.',
      ),
    ],
    reflectionPrompt: loc(
      '如果模型训练时 loss 先下降后变差，你会先调学习率、换地形假设，还是检查 batch 噪声？说明证据。',
      'If training loss drops then worsens, would you first tune learning rate, rethink the terrain, or inspect batch noise? Name the evidence.',
    ),
    evidence: [
      evidence(
        'chosen-learning-rate',
        'configuration',
        loc('最终学习率', 'Final learning rate'),
        loc('优化控制区的学习率数值。', 'The learning-rate value in the optimization controls.'),
      ),
      evidence(
        'live-metrics',
        'metric',
        loc('loss / step / status 读数', 'Loss / step / status readout'),
        loc('实时读数面板中的 loss、step size 和 status。', 'Loss, step size, and status from the live readout panel.'),
      ),
      evidence(
        'trajectory-shape',
        'observation',
        loc('轨迹形状', 'Trajectory shape'),
        loc('等高线图中是否出现跨谷、回摆、停滞或稳定收敛。', 'Whether the contour path overshoots, bounces, stalls, or converges steadily.'),
      ),
      evidence(
        'stability-explanation',
        'explanation',
        loc('稳定性解释', 'Stability explanation'),
        loc('用学习率乘梯度范数解释当前路径。', 'Explain the path using learning rate times gradient norm.'),
      ),
    ],
  },
  {
    id: 'mlp:xor-capacity',
    moduleSlug: 'mlp',
    labId: 'mlp-playground-cockpit',
    sectionIds: ['linearLimits'],
    level: 5,
    learningGoal: loc(
      '区分“线性模型表达不了”与“训练没有调好”这两类失败。',
      'Separate failures caused by linear expressiveness from failures caused by training setup.',
    ),
    predictionPrompt: loc(
      '先预测：XOR 数据在 0 个隐藏层和 1 个隐藏层下，output 等值线会怎样改变？',
      'Predict first: on XOR data, how will the output contour change between zero hidden layers and one hidden layer?',
    ),
    manipulableVariables: [
      item(
        'hidden-layers',
        loc('隐藏层数量与宽度', 'Hidden layer count and width'),
        loc('用加减按钮改变网络容量。', 'Use the layer buttons to change network capacity.'),
      ),
      item(
        'feature-set',
        loc('输入特征集合', 'Input feature set'),
        loc('切换 x1、x2、平方、交叉项和 sin 特征。', 'Toggle x1, x2, squared, interaction, and sin features.'),
      ),
      item(
        'regularization',
        loc('正则化', 'Regularization'),
        loc('切换 none、L1、L2 与强度，观察边界和权重。', 'Switch none, L1, L2 and strength while watching boundary and weights.'),
      ),
    ],
    observableMetrics: [
      item(
        'train-test-quality',
        loc('训练/测试质量', 'Train/test quality'),
        loc('同时读训练与测试 accuracy、R2 或 loss。', 'Read train and test accuracy, R2, or loss together.'),
      ),
      item(
        'boundary-contour',
        loc('输出等值线', 'Output contour'),
        loc('观察边界是否从一刀切变成可弯折的形状。', 'Watch whether the boundary changes from one cut to a bendable contour.'),
      ),
      item(
        'weight-state',
        loc('权重状态', 'Weight state'),
        loc('用权重范数、有效连接和梯度强度判断容量是否在工作。', 'Use weight norm, active links, and gradient norm to judge whether capacity is doing useful work.'),
      ),
    ],
    successCriteria: [
      loc(
        '能让 XOR 从线性失败变成可分，同时说出是隐藏层或特征改变了表达空间。',
        'You can make XOR separable and explain whether hidden layers or features changed the representation space.',
      ),
      loc(
        '能在提高容量后检查测试质量，避免只看训练 loss 下降。',
        'After increasing capacity, you check test quality instead of trusting only lower training loss.',
      ),
    ],
    reflectionPrompt: loc(
      '当训练分数变好但测试分数没有同步变好时，你看到的是欠拟合、表达能力提升，还是过拟合？用两个指标作证。',
      'When training quality improves but test quality does not, are you seeing underfitting, useful expressiveness, or overfitting? Use two metrics as evidence.',
    ),
    evidence: [
      evidence(
        'network-configuration',
        'configuration',
        loc('网络与特征配置', 'Network and feature configuration'),
        loc('隐藏层、特征、激活函数和正则化设置。', 'Hidden layers, features, activation, and regularization settings.'),
      ),
      evidence(
        'quality-metrics',
        'metric',
        loc('训练/测试指标', 'Train/test metrics'),
        loc('底部指标面板中的训练质量、测试质量和 loss。', 'Training quality, test quality, and loss from the metrics panels.'),
      ),
      evidence(
        'fit-map',
        'observation',
        loc('输出拟合图', 'Output fit map'),
        loc('输出图中的边界形状、等值线和测试点覆盖。', 'Boundary shape, contour, and test-point coverage in the output map.'),
      ),
      evidence(
        'capacity-explanation',
        'explanation',
        loc('容量解释', 'Capacity explanation'),
        loc('说明失败来自表达限制、优化设置还是泛化问题。', 'Explain whether failure comes from expressiveness, optimization setup, or generalization.'),
      ),
    ],
  },
]

export function getLessonInteractionProtocol(moduleSlug: ModuleSlug, sectionId: string) {
  return lessonInteractionProtocols.find(
    (protocol) => protocol.moduleSlug === moduleSlug && protocol.sectionIds.includes(sectionId),
  )
}
