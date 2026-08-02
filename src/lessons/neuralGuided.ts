import type { LocalizedCopy, MlpPlaygroundFocus } from '../types/ml'

export type NeuralLabMode = 'guided' | 'explore'

export type CnnInspectorView = 'role' | 'operation' | 'shape'

export type CnnGuidedControl = 'sample' | 'upload' | 'playback' | 'layer' | 'inspector'

export type CnnSemanticStage =
  | 'input'
  | 'conv-block-1'
  | 'pool-1'
  | 'conv-block-2'
  | 'pool-2'
  | 'classifier'

export interface CnnLessonFocusConfig {
  chapterId: string
  stage: CnnSemanticStage
  inspectorView: CnnInspectorView
  guidedControls: CnnGuidedControl[]
  evidence: LocalizedCopy
}

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

export const cnnLessonFocusConfigs: CnnLessonFocusConfig[] = [
  {
    chapterId: 'image-volume',
    stage: 'input',
    inspectorView: 'shape',
    guidedControls: ['sample', 'upload', 'playback', 'layer', 'inspector'],
    evidence: copy('确认一张图片先成为高 × 宽 × 3 的数值体。', 'Confirm that an image first becomes a height x width x 3 volume.'),
  },
  {
    chapterId: 'kernel-convolution',
    stage: 'conv-block-1',
    inspectorView: 'operation',
    guidedControls: ['sample', 'playback', 'layer', 'inspector'],
    evidence: copy('选中第一个卷积块，把局部窗口、kernel 与一个输出值对齐。', 'Select the first convolution block and align its local window, kernel, and one output value.'),
  },
  {
    chapterId: 'padding-stride-shape',
    stage: 'pool-1',
    inspectorView: 'shape',
    guidedControls: ['playback', 'layer', 'inspector'],
    evidence: copy('沿架构轨道比较每次卷积和池化前后的空间尺寸。', 'Compare spatial sizes before and after each convolution and pooling stage.'),
  },
  {
    chapterId: 'channels-feature-maps',
    stage: 'conv-block-2',
    inspectorView: 'role',
    guidedControls: ['sample', 'layer', 'inspector'],
    evidence: copy('切换到第二个卷积块，观察 channel 数量如何增加。', 'Move to the second convolution block and watch the channel count grow.'),
  },
  {
    chapterId: 'pooling-classifier-head',
    stage: 'classifier',
    inspectorView: 'operation',
    guidedControls: ['playback', 'layer', 'inspector'],
    evidence: copy('追踪 feature maps 如何经 Flatten 和 Softmax 变成 top-3。', 'Trace feature maps through Flatten and Softmax into the top three classes.'),
  },
  {
    chapterId: 'transfer-learning-review',
    stage: 'classifier',
    inspectorView: 'role',
    guidedControls: ['sample', 'upload', 'layer', 'inspector'],
    evidence: copy('把卷积骨干视为冻结的特征提取器，只替换任务分类头。', 'Treat the convolutional backbone as frozen and replace only the task head.'),
  },
]

export const cnnLessonFocusByChapter = new Map(
  cnnLessonFocusConfigs.map((config) => [config.chapterId, config]),
)
