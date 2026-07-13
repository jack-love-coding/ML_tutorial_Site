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
    id: 'ai-overview:regression-candidate-search',
    moduleSlug: 'ai-overview',
    labId: 'ai-overview-task-lab',
    sectionIds: ['supervised-linear-regression'],
    level: 4,
    learningGoal: loc(
      '把 w、b 的变化连接到预测、残差、平方误差、MSE 与当前最佳候选。',
      'Connect changes in w and b to predictions, residuals, squared errors, MSE, and the current best candidate.',
    ),
    predictionPrompt: loc(
      '先预测：改变 w 或 b 后，哪几行残差会变化，当前候选能否刷新最佳 MSE？',
      'Predict first: after changing w or b, which residual rows change, and can the current candidate improve the best MSE?',
    ),
    manipulableVariables: [
      item('regression-preset', loc('数据 preset', 'Data preset'), loc('切换清晰趋势、噪声或异常点数据。', 'Switch among clear trend, noisy, and outlier data.')),
      item('regression-parameters', loc('w、b 与候选搜索', 'w, b, and candidate search'), loc('手动调整参数，或执行单步/自动候选搜索、速度、暂停与重置。', 'Adjust parameters manually or use candidate step/auto search, speed, pause, and reset.')),
      item('regression-residuals', loc('残差显示', 'Residual visibility'), loc('显示或隐藏图中的残差线。', 'Show or hide residual lines in the plot.')),
    ],
    observableMetrics: [
      item('regression-row-table', loc('预测/残差/平方误差表', 'Prediction/residual/squared-error table'), loc('逐行读取 x、y、ŷ、residual 与 squared error。', 'Read x, y, ŷ, residual, and squared error row by row.')),
      item('regression-ranking', loc('候选 MSE 与当前最佳', 'Candidate MSE and current best'), loc('比较候选搜索表中的 current candidate、MSE 和 current best。', 'Compare the current candidate, MSE, and current best in the search table.')),
    ],
    successCriteria: [
      loc('能从共享表格验证 MSE，而不是只看直线外观。', 'You can verify MSE from the shared table instead of judging only the line shape.'),
      loc('能区分当前候选与迄今最佳候选。', 'You can distinguish the current candidate from the best candidate so far.'),
    ],
    reflectionPrompt: loc('异常点出现后，哪几行平方误差主导 MSE，当前最佳是否改变？', 'After adding an outlier, which squared-error rows dominate MSE, and does the current best change?'),
    evidence: [
      evidence('regression-config', 'configuration', loc('preset 与 w、b', 'Preset and w, b'), loc('实验控件当前显示的参数。', 'Parameters currently shown by the lab controls.')),
      evidence('regression-metrics', 'metric', loc('当前 MSE 与排名', 'Current MSE and ranking'), loc('同步样本表和候选搜索表。', 'The synchronized sample and candidate-search tables.')),
      evidence('regression-explanation', 'explanation', loc('误差解释', 'Error explanation'), loc('说明哪一行误差使候选变好或变差。', 'Explain which row makes the candidate better or worse.')),
    ],
  },
  {
    id: 'ai-overview:kmeans-replay', moduleSlug: 'ai-overview', labId: 'ai-overview-task-lab',
    sectionIds: ['unsupervised-kmeans'], level: 4,
    learningGoal: loc('把 K、seed、分配与中心更新连接到可重放的收敛历史。', 'Connect K, seed, assignments, and center updates to replayable convergence history.'),
    predictionPrompt: loc('先预测：改变 K 或 seed 后，初始中心、分配和组内距离会怎样变化？', 'Predict first: after changing K or seed, how will initial centers, assignments, and within-group distance change?'),
    manipulableVariables: [
      item('kmeans-k-seed', loc('K 与 seed', 'K and seed'), loc('设置簇数 K=2..5 和整数随机种子。', 'Set cluster count K=2..5 and an integer random seed.')),
      item('kmeans-playback', loc('单步、自动、时间线与重置', 'Step, auto, timeline, and reset'), loc('前进、暂停、回看历史或重置同一确定性运行。', 'Advance, pause, revisit history, or reset the same deterministic run.')),
    ],
    observableMetrics: [
      item('kmeans-state', loc('phase、iteration 与中心/分配', 'Phase, iteration, centers, and assignments'), loc('读取初始化、分配、重算或收敛状态。', 'Read initialization, assignment, recomputation, or convergence state.')),
      item('kmeans-distance', loc('组内距离总和', 'Within-group distance total'), loc('用数值检查当前分组是否更紧凑。', 'Use the value to check whether the grouping is tighter.')),
    ],
    successCriteria: [loc('能从成员均值解释中心移动方向。', 'You can explain center movement from the member mean.'), loc('同一 K 与 seed 重置后能重放相同历史。', 'The same K and seed replay the same history after reset.')],
    reflectionPrompt: loc('改变 K 与只改变 seed，分别改变了问题还是起点？', 'When you change K versus only the seed, are you changing the problem or only the starting point?'),
    evidence: [
      evidence('kmeans-config', 'configuration', loc('K 与 seed', 'K and seed'), loc('实验控件显示的有效值。', 'Effective values shown by the controls.')),
      evidence('kmeans-metrics', 'metric', loc('phase / iteration / distance', 'Phase / iteration / distance'), loc('历史与指标读数。', 'History and metric readouts.')),
      evidence('kmeans-explanation', 'explanation', loc('中心更新解释', 'Center-update explanation'), loc('用成员均值说明移动方向。', 'Explain the movement direction using the member mean.')),
    ],
  },
  {
    id: 'ai-overview:q-learning-update', moduleSlug: 'ai-overview', labId: 'ai-overview-task-lab',
    sectionIds: ['reinforcement-q-learning'], level: 4,
    learningGoal: loc('把 state、action、reward 与一次 Q value 更新和策略箭头连接起来。', 'Connect state, action, and reward to one Q-value update and the policy arrows.'),
    predictionPrompt: loc('先预测：执行一次 action 后，reward、target 与当前 state 的 Q value 会向哪个方向变化？', 'Predict first: after one action, which direction will reward, target, and the current state’s Q value move?'),
    manipulableVariables: [
      item('q-seed-exploration', loc('seed 与 exploration rate', 'Seed and exploration rate'), loc('设置整数 seed 与训练探索率。', 'Set the integer seed and training exploration rate.')),
      item('q-playback', loc('单行动、单回合、连续训练与重置', 'One action, one episode, continuous training, and reset'), loc('使用速度、暂停和重置控制训练。', 'Control training with speed, pause, and reset.')),
    ],
    observableMetrics: [
      item('q-update', loc('state/action/reward/Q update', 'State/action/reward/Q update'), loc('读取旧值、target、修正和新值。', 'Read old value, target, correction, and new value.')),
      item('q-policy', loc('episode、累计 reward 与 policy', 'Episode, cumulative reward, and policy'), loc('比较当前四个 action values、全局箭头和完整 Q table。', 'Compare the four current action values, global arrows, and full Q table.')),
    ],
    successCriteria: [loc('能解释正负 reward 如何通过 target 影响 Q value。', 'You can explain how positive or negative reward affects Q value through the target.'), loc('能区分训练探索与关闭探索后的 policy 评估。', 'You can separate training exploration from policy evaluation with exploration disabled.')],
    reflectionPrompt: loc('为什么 reward 不是逐状态预先给定的监督 label？', 'Why is reward not a supervised label pre-attached to every state?'),
    evidence: [
      evidence('q-config', 'configuration', loc('seed 与探索率', 'Seed and exploration rate'), loc('实验控件显示的有效值。', 'Effective values shown by the controls.')),
      evidence('q-metrics', 'metric', loc('更新项与累计 reward', 'Update terms and cumulative reward'), loc('状态面板、动作值和策略读数。', 'State panel, action values, and policy readout.')),
      evidence('q-explanation', 'explanation', loc('Q 更新解释', 'Q-update explanation'), loc('说明 target、修正与新值的方向。', 'Explain the direction of target, correction, and new value.')),
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
