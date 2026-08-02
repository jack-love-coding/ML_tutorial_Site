import type { LocalizedCopy, MlpPlaygroundFocus } from '../types/ml'

export type NeuralLabMode = 'guided' | 'explore'

export type MlpGuidedControl =
  | 'dataset'
  | 'features'
  | 'layers'
  | 'activation'
  | 'learningRate'
  | 'batchSize'
  | 'noise'
  | 'regularization'

export type MlpGuidedScenario = 'xor' | 'circle' | 'regression'

export interface MlpLessonFocusConfig {
  chapterId: string
  focus: MlpPlaygroundFocus
  scenario: MlpGuidedScenario
  guidedControls: MlpGuidedControl[]
  evidence: LocalizedCopy
}

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

export const mlpLessonFocusConfigs: MlpLessonFocusConfig[] = [
  {
    chapterId: 'linearLimits',
    focus: 'dataset',
    scenario: 'xor',
    guidedControls: ['dataset', 'layers'],
    evidence: copy('先比较 0 层与 1 层隐藏层的边界。', 'Compare the boundary with zero and one hidden layer.'),
  },
  {
    chapterId: 'neuronAffine',
    focus: 'features',
    scenario: 'circle',
    guidedControls: ['features', 'layers'],
    evidence: copy('观察输入特征如何改变每个节点的响应图。', 'Watch input features change each node response map.'),
  },
  {
    chapterId: 'activations',
    focus: 'activations',
    scenario: 'xor',
    guidedControls: ['activation'],
    evidence: copy('只切换激活函数，保持其他条件不变。', 'Change only the activation and hold everything else fixed.'),
  },
  {
    chapterId: 'hiddenRepresentation',
    focus: 'network',
    scenario: 'circle',
    guidedControls: ['features', 'layers'],
    evidence: copy('沿节点热力图读取隐藏层怎样重写空间。', 'Read the node maps to see how hidden layers rewrite space.'),
  },
  {
    chapterId: 'forwardOutput',
    focus: 'network',
    scenario: 'xor',
    guidedControls: ['dataset', 'layers'],
    evidence: copy('从输入沿连接一直追到输出等值线。', 'Trace the signal from inputs through links to the output contour.'),
  },
  {
    chapterId: 'backprop',
    focus: 'loss',
    scenario: 'xor',
    guidedControls: ['learningRate'],
    evidence: copy('单步训练，观察误差信号如何改变连接。', 'Step training and watch the error signal change connections.'),
  },
  {
    chapterId: 'trainingDynamics',
    focus: 'loss',
    scenario: 'circle',
    guidedControls: ['learningRate', 'batchSize'],
    evidence: copy('同时读取 Epoch、训练损失和测试损失。', 'Read epoch, training loss, and test loss together.'),
  },
  {
    chapterId: 'capacityGeneralization',
    focus: 'generalization',
    scenario: 'circle',
    guidedControls: ['layers', 'noise', 'regularization'],
    evidence: copy('增加容量和噪声，再用测试集判断是否过拟合。', 'Add capacity and noise, then use test data to detect overfitting.'),
  },
]

export const mlpLessonFocusByChapter = new Map(
  mlpLessonFocusConfigs.map((config) => [config.chapterId, config]),
)
