import type { LocalizedCopy, MlpPlaygroundFocus, MlpPlaygroundState } from '../types/ml'

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

interface NeuralGuidedChapterContractBase {
  chapterId: string
  observation: LocalizedCopy
}

export interface CnnGuidedChapterContract extends NeuralGuidedChapterContractBase {
  kind: 'cnn'
  chapterId: string
  stage: CnnSemanticStage
  inspectorView: CnnInspectorView
  guidedControls: CnnGuidedControl[]
  initialSampleId: string
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

export type MlpResultReadout =
  | 'trainLoss'
  | 'testLoss'
  | 'trainAccuracy'
  | 'testAccuracy'
  | 'weightNorm'
  | 'activeWeights'
  | 'gradientNorm'

export interface MlpGuidedChapterContract extends NeuralGuidedChapterContractBase {
  kind: 'mlp'
  chapterId: string
  focus: MlpPlaygroundFocus
  guidedControls: MlpGuidedControl[]
  initialState: Partial<MlpPlaygroundState>
  resultReadouts: MlpResultReadout[]
  explorePreset: Partial<MlpPlaygroundState>
}

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

const mlpLessonFocusSeeds: Array<Omit<MlpGuidedChapterContract, 'explorePreset'>> = [
  {
    kind: 'mlp',
    chapterId: 'linearLimits',
    focus: 'dataset',
    guidedControls: ['dataset', 'layers'],
    resultReadouts: ['trainAccuracy', 'testAccuracy'],
    initialState: {
      problemType: 'classification',
      classificationDataset: 'xor',
      featureKeys: ['x1', 'x2'],
      networkShape: [],
      activation: 'tanh',
      learningRate: 0.03,
      noise: 0.08,
      regularizationType: 'none',
      regularizationRate: 0,
    },
    observation: copy('先比较 0 层与 1 层隐藏层的边界。', 'Compare the boundary with zero and one hidden layer.'),
  },
  {
    kind: 'mlp',
    chapterId: 'neuronAffine',
    focus: 'features',
    guidedControls: ['features', 'layers'],
    resultReadouts: ['weightNorm', 'activeWeights'],
    initialState: {
      problemType: 'classification', classificationDataset: 'circle', featureKeys: ['x1', 'x2'],
      networkShape: [4], activation: 'tanh', learningRate: 0.03, noise: 0.08,
    },
    observation: copy('观察输入特征如何改变每个节点的响应图。', 'Watch input features change each node response map.'),
  },
  {
    kind: 'mlp',
    chapterId: 'activations',
    focus: 'activations',
    guidedControls: ['activation'],
    resultReadouts: ['gradientNorm', 'testLoss'],
    initialState: {
      problemType: 'classification', classificationDataset: 'xor', featureKeys: ['x1', 'x2'],
      networkShape: [4, 2], activation: 'tanh', learningRate: 0.03, noise: 0.08,
    },
    observation: copy('只切换激活函数，保持其他条件不变。', 'Change only the activation and hold everything else fixed.'),
  },
  {
    kind: 'mlp',
    chapterId: 'hiddenRepresentation',
    focus: 'network',
    guidedControls: ['features', 'layers'],
    resultReadouts: ['activeWeights', 'testLoss'],
    initialState: {
      problemType: 'classification', classificationDataset: 'circle',
      featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared'], networkShape: [4, 2],
      activation: 'tanh', learningRate: 0.03, noise: 0.08,
    },
    observation: copy('沿节点热力图读取隐藏层怎样重写空间。', 'Read the node maps to see how hidden layers rewrite space.'),
  },
  {
    kind: 'mlp',
    chapterId: 'forwardOutput',
    focus: 'network',
    guidedControls: ['dataset', 'layers'],
    resultReadouts: ['trainLoss', 'testLoss'],
    initialState: {
      problemType: 'classification', classificationDataset: 'xor', featureKeys: ['x1', 'x2'],
      networkShape: [4, 2], activation: 'tanh', learningRate: 0.03, noise: 0.08,
    },
    observation: copy('从输入沿连接一直追到输出等值线。', 'Trace the signal from inputs through links to the output contour.'),
  },
  {
    kind: 'mlp',
    chapterId: 'backprop',
    focus: 'loss',
    guidedControls: ['learningRate'],
    resultReadouts: ['gradientNorm', 'trainLoss'],
    initialState: {
      problemType: 'classification', classificationDataset: 'xor', featureKeys: ['x1', 'x2'],
      networkShape: [4, 2], activation: 'tanh', learningRate: 0.03, noise: 0.08,
    },
    observation: copy('单步训练，观察误差信号如何改变连接。', 'Step training and watch the error signal change connections.'),
  },
  {
    kind: 'mlp',
    chapterId: 'trainingDynamics',
    focus: 'loss',
    guidedControls: ['learningRate', 'batchSize'],
    resultReadouts: ['trainLoss', 'testLoss', 'gradientNorm'],
    initialState: {
      problemType: 'classification', classificationDataset: 'circle',
      featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared'], networkShape: [4, 2],
      activation: 'tanh', learningRate: 0.03, batchSize: 16, noise: 0.08,
    },
    observation: copy('同时读取 Epoch、训练损失和测试损失。', 'Read epoch, training loss, and test loss together.'),
  },
  {
    kind: 'mlp',
    chapterId: 'capacityGeneralization',
    focus: 'generalization',
    guidedControls: ['layers', 'noise', 'regularization'],
    resultReadouts: ['trainLoss', 'testLoss', 'weightNorm'],
    initialState: {
      problemType: 'classification', classificationDataset: 'circle', featureKeys: ['x1', 'x2'],
      networkShape: [2], activation: 'tanh', learningRate: 0.03, noise: 0.18,
      regularizationType: 'none', regularizationRate: 0,
    },
    observation: copy('增加容量和噪声，再用测试集判断是否过拟合。', 'Add capacity and noise, then use test data to detect overfitting.'),
  },
]

export const mlpLessonFocusConfigs: MlpGuidedChapterContract[] = mlpLessonFocusSeeds.map((contract) => ({
  ...contract,
  explorePreset: { ...contract.initialState },
}))

export const mlpLessonFocusByChapter = new Map(
  mlpLessonFocusConfigs.map((config) => [config.chapterId, config]),
)

export const cnnLessonFocusConfigs: CnnGuidedChapterContract[] = [
  {
    kind: 'cnn',
    chapterId: 'image-volume',
    stage: 'input',
    inspectorView: 'shape',
    guidedControls: ['sample', 'upload', 'playback', 'layer', 'inspector'],
    initialSampleId: 'sample-0',
    observation: copy('确认一张图片先成为高 × 宽 × 3 的数值体。', 'Confirm that an image first becomes a height x width x 3 volume.'),
  },
  {
    kind: 'cnn',
    chapterId: 'kernel-convolution',
    stage: 'conv-block-1',
    inspectorView: 'operation',
    guidedControls: ['sample', 'playback', 'layer', 'inspector'],
    initialSampleId: 'sample-0',
    observation: copy('选中第一个卷积块，把局部窗口、kernel 与一个输出值对齐。', 'Select the first convolution block and align its local window, kernel, and one output value.'),
  },
  {
    kind: 'cnn',
    chapterId: 'padding-stride-shape',
    stage: 'pool-1',
    inspectorView: 'shape',
    guidedControls: ['playback', 'layer', 'inspector'],
    initialSampleId: 'sample-0',
    observation: copy('沿架构轨道比较每次卷积和池化前后的空间尺寸。', 'Compare spatial sizes before and after each convolution and pooling stage.'),
  },
  {
    kind: 'cnn',
    chapterId: 'channels-feature-maps',
    stage: 'conv-block-2',
    inspectorView: 'role',
    guidedControls: ['sample', 'layer', 'inspector'],
    initialSampleId: 'sample-1',
    observation: copy('切换到第二个卷积块，观察 channel 数量如何增加。', 'Move to the second convolution block and watch the channel count grow.'),
  },
  {
    kind: 'cnn',
    chapterId: 'pooling-classifier-head',
    stage: 'classifier',
    inspectorView: 'operation',
    guidedControls: ['playback', 'layer', 'inspector'],
    initialSampleId: 'sample-2',
    observation: copy('追踪 feature maps 如何经 Flatten 和 Softmax 变成 top-3。', 'Trace feature maps through Flatten and Softmax into the top three classes.'),
  },
  {
    kind: 'cnn',
    chapterId: 'transfer-learning-review',
    stage: 'classifier',
    inspectorView: 'role',
    guidedControls: ['sample', 'upload', 'layer', 'inspector'],
    initialSampleId: 'sample-3',
    observation: copy('把卷积骨干视为冻结的特征提取器，只替换任务分类头。', 'Treat the convolutional backbone as frozen and replace only the task head.'),
  },
]

export const cnnLessonFocusByChapter = new Map(
  cnnLessonFocusConfigs.map((config) => [config.chapterId, config]),
)
