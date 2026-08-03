<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AppLocale,
  LocalizedCopy,
  MlpActivationKind,
  MlpClassificationDataset,
  MlpFeatureKey,
  MlpPlaygroundSnapshot,
  MlpPlaygroundState,
  MlpRegressionDataset,
  MlpRegularizationType,
  StorySection,
} from '../types/ml'
import {
  DEFAULT_MLP_PLAYGROUND_STATE,
  MLP_FEATURES,
  createMlpPlaygroundSession,
  normalizeMlpPlaygroundState,
} from '../simulations/mlpPlayground'
import {
  mlpLessonFocusByChapter,
  type MlpGuidedControl,
  type NeuralLabMode,
} from '../lessons/neuralGuided'
import { round } from '../utils/math'
import MlpNetworkGraph from './MlpNetworkGraph.vue'
import MlpOutputFitMap from './MlpOutputFitMap.vue'
import MlpTrainingTimeline from './MlpTrainingTimeline.vue'

const props = defineProps<{
  accent: string
  section?: StorySection
  mode: NeuralLabMode
}>()

const { locale } = useI18n()
const state = ref<MlpPlaygroundState>(normalizeMlpPlaygroundState(DEFAULT_MLP_PLAYGROUND_STATE))
const session = shallowRef(createMlpPlaygroundSession(state.value))
const snapshot = shallowRef<MlpPlaygroundSnapshot>(session.value.snapshot())
const previousSnapshot = shallowRef<MlpPlaygroundSnapshot>()
const contourHistory = shallowRef<MlpPlaygroundSnapshot[]>([snapshot.value])
const isPlaying = ref(false)
let timer: number | undefined

const classificationDatasets: MlpClassificationDataset[] = ['circle', 'xor', 'gauss', 'spiral']
const regressionDatasets: MlpRegressionDataset[] = ['plane', 'gaussian']
const activations: MlpActivationKind[] = ['tanh', 'relu', 'sigmoid', 'linear']
const regularizations: MlpRegularizationType[] = ['none', 'l1', 'l2']
const learningRates = [0.00001, 0.0001, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10]
const regularizationRates = [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10]

type MlpDatasetKey = MlpClassificationDataset | MlpRegressionDataset

interface MlpFitAdvice {
  title: string
  summary: string
  chips: string[]
  config: Partial<MlpPlaygroundState>
}

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'MLP Playground',
        subtitle: '用热力图、等值线和网络内部状态观察拟合过程',
        task: '当前章节任务',
        play: '播放',
        pause: '暂停',
        step: '单步',
        reset: '重置',
        regenerate: '重新生成',
        problem: '任务类型',
        classification: '分类',
        regression: '回归',
        data: '数据',
        dataQuestion: '选择一个要拟合的数据形状',
        features: '输入特征',
        featureQuestion: '决定哪些信号进入网络',
        output: '输出拟合图',
        hiddenLayers: '隐藏层',
        activation: '激活函数',
        regularization: '正则化',
        learningRate: '学习率',
        regularizationRate: '正则强度',
        batchSize: '批大小',
        noise: '噪声',
        trainRatio: '训练集比例',
        showTestData: '显示测试集',
        discretize: '离散化输出',
        lossCurve: '损失曲线',
        trainLoss: '训练损失',
        testLoss: '测试损失',
        trainAccuracy: '训练准确率',
        testAccuracy: '测试准确率',
        trainScore: '训练 R2',
        testScore: '测试 R2',
        weightNorm: '权重范数',
        activeWeights: '有效连接',
        gradientNorm: '梯度强度',
        iteration: 'Epoch',
        neurons: '个神经元',
        noHiddenLayers: '0',
        colorLegend: '橙色偏向 -1，蓝色偏向 +1；白色附近是边界。',
        outputHint: '粗线是当前 0 等值线，淡线是最近几次训练留下的边界轨迹。',
        networkHint: '线条颜色表示权重正负，粗细表示权重大小，节点小图显示该节点对输入平面的响应。',
        scenarios: '场景',
        architecture: '网络架构',
        observation: '观察重点',
        runControls: 'MLP 训练控制',
        guidedControls: '本章控制',
        advancedData: '数据与输入',
        advancedOptimization: '训练与约束',
        advancedDiagnostics: '诊断',
        primaryResult: '主要结果',
        datasets: {
          circle: '同心圆',
          xor: 'XOR',
          gauss: '高斯团块',
          spiral: '双螺旋',
          plane: '平面',
          gaussian: '高斯场',
        },
        focus: {
          dataset: '先比较数据分布和输出等值线是否匹配。',
          features: '先看输入节点热力图，再看隐藏层如何组合这些特征。',
          network: '读取节点热力图和权重线，理解输出如何被组合出来。',
          activations: '只切换激活函数，比较节点响应形状、边界和 loss 曲线。',
          loss: '单步训练，观察 loss、权重、bias 和输出热力图是否同步变化。',
          regularization: '切换 L1/L2，观察权重线是否变细或被剪掉。',
          generalization: '同时读训练 loss 与测试 loss，判断是否正在记住噪声。',
        },
      }
    : {
        title: 'MLP Playground',
        subtitle: 'Read fitting through heatmaps, contours, and internal network state',
        task: 'Current chapter task',
        play: 'Play',
        pause: 'Pause',
        step: 'Step',
        reset: 'Reset',
        regenerate: 'Regenerate',
        problem: 'Problem type',
        classification: 'Classification',
        regression: 'Regression',
        data: 'Data',
        dataQuestion: 'Choose the shape to fit',
        features: 'Input features',
        featureQuestion: 'Choose which signals enter the network',
        output: 'Output fit',
        hiddenLayers: 'Hidden layers',
        activation: 'Activation',
        regularization: 'Regularization',
        learningRate: 'Learning rate',
        regularizationRate: 'Regularization rate',
        batchSize: 'Batch size',
        noise: 'Noise',
        trainRatio: 'Train split',
        showTestData: 'Show test data',
        discretize: 'Discretize output',
        lossCurve: 'Loss curve',
        trainLoss: 'Training loss',
        testLoss: 'Test loss',
        trainAccuracy: 'Train accuracy',
        testAccuracy: 'Test accuracy',
        trainScore: 'Train R2',
        testScore: 'Test R2',
        weightNorm: 'Weight norm',
        activeWeights: 'Active weights',
        gradientNorm: 'Gradient norm',
        iteration: 'Epoch',
        neurons: 'neurons',
        noHiddenLayers: '0',
        colorLegend: 'Orange leans -1, blue leans +1; white is near the boundary.',
        outputHint: 'The bold line is the current zero contour; pale lines are recent boundary traces.',
        networkHint: 'Link color shows weight sign, width shows weight size, and node maps show each response over the input plane.',
        scenarios: 'Scenarios',
        architecture: 'Network architecture',
        observation: 'What to watch',
        runControls: 'MLP training controls',
        guidedControls: 'Chapter controls',
        advancedData: 'Data and inputs',
        advancedOptimization: 'Training and constraints',
        advancedDiagnostics: 'Diagnostics',
        primaryResult: 'Primary result',
        datasets: {
          circle: 'Circle',
          xor: 'XOR',
          gauss: 'Gaussian',
          spiral: 'Spiral',
          plane: 'Plane',
          gaussian: 'Gaussian field',
        },
        focus: {
          dataset: 'Compare data distribution with the output contour.',
          features: 'Read input-node heatmaps first, then see how hidden layers combine those signals.',
          network: 'Read every node heatmap and weight link to understand how the output is composed.',
          activations: 'Change only the activation and compare node response shapes, boundary, and loss curves.',
          loss: 'Step training and watch loss, weights, biases, and output heatmap move together.',
          regularization: 'Switch L1/L2 and watch whether links thin out or get pruned.',
          generalization: 'Read train loss and test loss together to detect noise memorization.',
        },
      },
)

function localizedText(value?: LocalizedCopy) {
  if (!value) return ''
  return value[locale.value as AppLocale]
}

function stopPlayback() {
  if (timer) {
    window.clearInterval(timer)
    timer = undefined
  }
  isPlaying.value = false
}

function sync(nextSnapshot: MlpPlaygroundSnapshot, options: { clearHistory?: boolean } = {}) {
  previousSnapshot.value = options.clearHistory ? undefined : snapshot.value
  snapshot.value = nextSnapshot
  state.value = nextSnapshot.state

  if (options.clearHistory) {
    contourHistory.value = [nextSnapshot]
    return
  }

  const last = contourHistory.value.at(-1)
  if (!last || last.iteration !== nextSnapshot.iteration) {
    contourHistory.value = [...contourHistory.value, nextSnapshot].slice(-6)
  } else {
    contourHistory.value = [...contourHistory.value.slice(0, -1), nextSnapshot]
  }
}

function resetWith(partial: Partial<MlpPlaygroundState> = {}) {
  stopPlayback()
  sync(session.value.reset({ ...state.value, ...partial }), { clearHistory: true })
}

function resetToChapterInitialState(partial: Partial<MlpPlaygroundState>) {
  stopPlayback()
  const nextState = normalizeMlpPlaygroundState({ ...DEFAULT_MLP_PLAYGROUND_STATE, ...partial })
  session.value = createMlpPlaygroundSession(nextState)
  sync(session.value.snapshot(), { clearHistory: true })
}

function updateWithoutReset(partial: Partial<MlpPlaygroundState>) {
  sync(session.value.updateState({ ...state.value, ...partial }))
}

function step(count = 1) {
  sync(session.value.step(count))
}

function togglePlayback() {
  if (isPlaying.value) {
    stopPlayback()
    return
  }

  isPlaying.value = true
  timer = window.setInterval(() => step(1), 90)
}

function regenerateData() {
  stopPlayback()
  sync(session.value.regenerateData(), { clearHistory: true })
}

function chooseDataset(dataset: MlpClassificationDataset | MlpRegressionDataset) {
  if (state.value.problemType === 'classification') {
    resetWith({ problemType: 'classification', classificationDataset: dataset as MlpClassificationDataset })
  } else {
    resetWith({ problemType: 'regression', regressionDataset: dataset as MlpRegressionDataset })
  }
}

function isDatasetActive(dataset: MlpClassificationDataset | MlpRegressionDataset) {
  return state.value.problemType === 'classification'
    ? state.value.classificationDataset === dataset
    : state.value.regressionDataset === dataset
}

function datasetLabel(dataset: MlpClassificationDataset | MlpRegressionDataset) {
  return copy.value.datasets[dataset]
}

function toggleFeature(featureKey: MlpFeatureKey) {
  const featureKeys = state.value.featureKeys.includes(featureKey)
    ? state.value.featureKeys.filter((key) => key !== featureKey)
    : [...state.value.featureKeys, featureKey]
  if (!featureKeys.length) return
  resetWith({ featureKeys })
}

function addLayer() {
  if (state.value.networkShape.length >= 6) return
  resetWith({ networkShape: [...state.value.networkShape, 2] })
}

function removeLayer() {
  if (!state.value.networkShape.length) return
  resetWith({ networkShape: state.value.networkShape.slice(0, -1) })
}

function resizeLayer(index: number, delta: number) {
  const networkShape = [...state.value.networkShape]
  networkShape[index] = Math.min(8, Math.max(1, networkShape[index] + delta))
  resetWith({ networkShape })
}

function onRangeInput(key: keyof MlpPlaygroundState, event: Event, reset = false) {
  const value = Number((event.target as HTMLInputElement).value)
  if (reset) resetWith({ [key]: value } as Partial<MlpPlaygroundState>)
  else updateWithoutReset({ [key]: value } as Partial<MlpPlaygroundState>)
}

function onSelectInput(key: keyof MlpPlaygroundState, event: Event, reset = false) {
  const value = (event.target as HTMLSelectElement).value
  const patch = {
    [key]: key === 'learningRate' || key === 'regularizationRate' ? Number(value) : value,
  } as Partial<MlpPlaygroundState>
  if (reset) resetWith(patch)
  else updateWithoutReset(patch)
}

function onCheckboxInput(key: keyof MlpPlaygroundState, event: Event) {
  updateWithoutReset({ [key]: (event.target as HTMLInputElement).checked } as Partial<MlpPlaygroundState>)
}

function quickPreset(kind: 'xor' | 'circle' | 'regression') {
  if (kind === 'xor') {
    resetWith({
      problemType: 'classification',
      classificationDataset: 'xor',
      featureKeys: ['x1', 'x2'],
      networkShape: [4, 2],
      activation: 'tanh',
      noise: 0.08,
      regularizationType: 'none',
      regularizationRate: 0,
    })
    return
  }

  if (kind === 'regression') {
    resetWith({
      problemType: 'regression',
      regressionDataset: 'gaussian',
      featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared'],
      networkShape: [5, 3],
      activation: 'tanh',
      noise: 0.05,
      regularizationType: 'l2',
      regularizationRate: 0.001,
    })
    return
  }

  resetWith({
    problemType: 'classification',
    classificationDataset: 'circle',
    featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared'],
    networkShape: [4, 2],
    activation: 'tanh',
    noise: 0.08,
    regularizationType: 'none',
    regularizationRate: 0,
  })
}

const datasetOptions = computed(() =>
  state.value.problemType === 'classification' ? classificationDatasets : regressionDatasets,
)

const activeDatasetKey = computed<MlpDatasetKey>(() =>
  state.value.problemType === 'classification' ? state.value.classificationDataset : state.value.regressionDataset,
)

const fitAdviceLabels = computed(() =>
  locale.value === 'zh-CN'
    ? { heading: '推荐拟合方案', apply: '套用方案' }
    : { heading: 'Suggested fit', apply: 'Apply setup' },
)

const currentFitAdvice = computed<MlpFitAdvice>(() => {
  const zh = locale.value === 'zh-CN'
  const advice: Record<MlpDatasetKey, MlpFitAdvice> = {
    circle: {
      title: zh ? '用平方特征先把圆环展开' : 'Open the rings with squared features',
      summary: zh
        ? '同心圆最吃 x1^2 和 x2^2；一层 4 个神经元再接 2 个神经元，通常能快速画出闭合边界。'
        : 'Circle data benefits from x1^2 and x2^2; 4 then 2 hidden neurons usually form a clean closed boundary.',
      chips: zh
        ? ['特征 X1/X2/X1^2/X2^2', '隐藏层 4-2', 'tanh', '学习率 0.03']
        : ['X1/X2/X1^2/X2^2', 'Hidden 4-2', 'tanh', 'LR 0.03'],
      config: {
        problemType: 'classification',
        classificationDataset: 'circle',
        featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared'],
        networkShape: [4, 2],
        activation: 'tanh',
        learningRate: 0.03,
        regularizationType: 'none',
        regularizationRate: 0,
        noise: 0.08,
      },
    },
    xor: {
      title: zh ? '保留原始坐标，让隐藏层做折线' : 'Keep raw inputs and let hidden layers bend',
      summary: zh
        ? 'XOR 不需要先加平方特征；4-2 的 tanh 隐藏层足够展示从直线失败到弯折边界的变化。'
        : 'XOR does not need squared features first; a 4-2 tanh stack shows the move from linear failure to bent boundaries.',
      chips: zh
        ? ['特征 X1/X2', '隐藏层 4-2', 'tanh', '低噪声']
        : ['X1/X2', 'Hidden 4-2', 'tanh', 'Low noise'],
      config: {
        problemType: 'classification',
        classificationDataset: 'xor',
        featureKeys: ['x1', 'x2'],
        networkShape: [4, 2],
        activation: 'tanh',
        learningRate: 0.03,
        regularizationType: 'none',
        regularizationRate: 0,
        noise: 0.08,
      },
    },
    gauss: {
      title: zh ? '先用近似线性边界验证基线' : 'Start with a near-linear baseline',
      summary: zh
        ? '高斯团块本来接近线性可分，0 层隐藏层就能拟合；复杂网络会把简单问题讲复杂。'
        : 'Gaussian blobs are almost linearly separable, so zero hidden layers fit well without overcomplicating the lesson.',
      chips: zh
        ? ['特征 X1/X2', '隐藏层 0', '学习率 0.03', '少正则']
        : ['X1/X2', '0 hidden', 'LR 0.03', 'Light regularization'],
      config: {
        problemType: 'classification',
        classificationDataset: 'gauss',
        featureKeys: ['x1', 'x2'],
        networkShape: [],
        activation: 'tanh',
        learningRate: 0.03,
        regularizationType: 'none',
        regularizationRate: 0,
        noise: 0.08,
      },
    },
    spiral: {
      title: zh ? '螺旋需要更高容量和一点约束' : 'Use more capacity with light restraint',
      summary: zh
        ? '双螺旋边界弯曲多，建议用两到三层较宽隐藏层，并保留一点 L2 防止追噪声。'
        : 'Spirals need a highly curved boundary, so use wider hidden layers with a little L2 to avoid chasing noise.',
      chips: zh
        ? ['特征 X1/X2/sin', '隐藏层 8-8-6', 'tanh', 'L2 0.001']
        : ['X1/X2/sin', 'Hidden 8-8-6', 'tanh', 'L2 0.001'],
      config: {
        problemType: 'classification',
        classificationDataset: 'spiral',
        featureKeys: ['x1', 'x2', 'sinX1', 'sinX2'],
        networkShape: [8, 8, 6],
        activation: 'tanh',
        learningRate: 0.03,
        regularizationType: 'l2',
        regularizationRate: 0.001,
        noise: 0.08,
      },
    },
    plane: {
      title: zh ? '平面回归用线性读出即可' : 'A linear readout is enough for the plane',
      summary: zh
        ? '平面目标由 X1 和 X2 决定，0 层隐藏层最清楚；加深网络反而不利于看懂。'
        : 'The plane target is driven by X1 and X2, so zero hidden layers make the fit easiest to read.',
      chips: zh
        ? ['特征 X1/X2', '隐藏层 0', 'linear', '学习率 0.03']
        : ['X1/X2', '0 hidden', 'linear', 'LR 0.03'],
      config: {
        problemType: 'regression',
        regressionDataset: 'plane',
        featureKeys: ['x1', 'x2'],
        networkShape: [],
        activation: 'linear',
        learningRate: 0.03,
        regularizationType: 'none',
        regularizationRate: 0,
        noise: 0.04,
      },
    },
    gaussian: {
      title: zh ? '高斯场需要局部响应组合' : 'Combine local responses for the Gaussian field',
      summary: zh
        ? '高斯场有多个局部峰谷，平方和交叉特征配合 6-4 隐藏层，会比单纯线性读出稳定。'
        : 'The Gaussian field has local peaks and dips; squared and interaction features with a 6-4 stack are steadier than a plain line.',
      chips: zh
        ? ['平方 + 交叉特征', '隐藏层 6-4', 'tanh', 'L2 0.001']
        : ['Squared + interaction', 'Hidden 6-4', 'tanh', 'L2 0.001'],
      config: {
        problemType: 'regression',
        regressionDataset: 'gaussian',
        featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared', 'x1TimesX2'],
        networkShape: [6, 4],
        activation: 'tanh',
        learningRate: 0.01,
        regularizationType: 'l2',
        regularizationRate: 0.001,
        noise: 0.05,
      },
    },
  }

  return advice[activeDatasetKey.value]
})

function applyFitAdvice() {
  resetWith(currentFitAdvice.value.config)
}

const metricCards = computed(() => {
  const current = snapshot.value
  const classification = state.value.problemType === 'classification'
  return [
    {
      id: 'trainQuality',
      label: classification ? copy.value.trainAccuracy : copy.value.trainScore,
      value: classification
        ? `${Math.round(Number(current.trainAccuracy ?? 0) * 100)}%`
        : round(Number(current.trainScore ?? 0), 3),
    },
    {
      id: 'testQuality',
      label: classification ? copy.value.testAccuracy : copy.value.testScore,
      value: classification
        ? `${Math.round(Number(current.testAccuracy ?? 0) * 100)}%`
        : round(Number(current.testScore ?? 0), 3),
    },
    { id: 'weightNorm', label: copy.value.weightNorm, value: round(current.weightNorm, 3) },
    { id: 'activeWeights', label: copy.value.activeWeights, value: current.activeWeights },
    { id: 'gradientNorm', label: copy.value.gradientNorm, value: round(current.gradientNorm, 4) },
  ]
})

const focusText = computed(() => copy.value.focus[props.section?.playgroundFocus ?? 'network'])
const lessonFocus = computed(() => mlpLessonFocusByChapter.get(props.section?.id ?? 'linearLimits'))
const guidedControls = computed(() => new Set(lessonFocus.value?.guidedControls ?? []))
const epochDisplay = computed(() =>
  String(snapshot.value.iteration).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ','),
)
const networkSummary = computed(() =>
  state.value.networkShape.length ? `${state.value.networkShape.length}` : copy.value.noHiddenLayers,
)

function showsGuidedControl(control: MlpGuidedControl) {
  return guidedControls.value.has(control)
}

watch(
  () => props.section?.id,
  () => {
    const initialState = lessonFocus.value?.initialState
    if (initialState) resetToChapterInitialState(initialState)
  },
  { immediate: true },
)

onBeforeUnmount(stopPlayback)
</script>

<template>
  <section
    class="mlp-playground-cockpit mlp-guided-cockpit"
    :class="`is-${props.mode}`"
    :style="{ '--mlp-accent': props.accent }"
  >
    <header class="mlp-guided-toolbar">
      <div class="mlp-run-controls" :aria-label="copy.runControls">
        <button type="button" class="mlp-icon-button" :title="copy.reset" :aria-label="copy.reset" @click="resetWith()">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.5 8.5A8 8 0 1 1 4 15" />
            <path d="M4.5 4v4.5H9" />
          </svg>
        </button>
        <button
          type="button"
          class="mlp-icon-button mlp-icon-button--play"
          :title="isPlaying ? copy.pause : copy.play"
          :aria-label="isPlaying ? copy.pause : copy.play"
          @click="togglePlayback"
        >
          <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14M16 5v14" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button type="button" class="mlp-icon-button" :title="copy.step" :aria-label="copy.step" @click="step(1)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 5v14l9-7z" />
            <path d="M18 5v14" />
          </svg>
        </button>
      </div>

      <div class="mlp-epoch-readout">
        <span>{{ copy.iteration }}</span>
        <strong>{{ epochDisplay }}</strong>
      </div>

      <div class="mlp-guided-toolbar__result">
        <span>{{ copy.primaryResult }}</span>
        <strong>{{ copy.trainLoss }} {{ round(snapshot.trainLoss, 3) }}</strong>
        <em>{{ copy.testLoss }} {{ round(snapshot.testLoss, 3) }}</em>
      </div>

      <div v-if="props.mode === 'explore'" class="mlp-scenario-switch" :aria-label="copy.scenarios">
        <button type="button" :class="{ 'is-active': activeDatasetKey === 'xor' }" @click="quickPreset('xor')">XOR</button>
        <button type="button" :class="{ 'is-active': activeDatasetKey === 'circle' }" @click="quickPreset('circle')">
          {{ copy.datasets.circle }}
        </button>
        <button type="button" :class="{ 'is-active': state.problemType === 'regression' }" @click="quickPreset('regression')">
          {{ copy.regression }}
        </button>
      </div>
    </header>

    <section v-if="props.mode === 'guided' && guidedControls.size" class="mlp-guided-controls" :aria-label="copy.guidedControls">
      <div v-if="showsGuidedControl('dataset')" class="mlp-guided-control mlp-guided-control--dataset">
        <span>{{ copy.data }}</span>
        <div class="mlp-dataset-list">
          <button
            v-for="dataset in datasetOptions"
            :key="dataset"
            type="button"
            class="mlp-dataset-choice"
            :class="[`mlp-dataset-choice--${dataset}`, { 'is-active': isDatasetActive(dataset) }]"
            :title="datasetLabel(dataset)"
            :aria-label="datasetLabel(dataset)"
            @click="chooseDataset(dataset)"
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div v-if="showsGuidedControl('features')" class="mlp-guided-control mlp-guided-control--features">
        <span>{{ copy.features }}</span>
        <div>
          <button
            v-for="feature in MLP_FEATURES"
            :key="feature.key"
            type="button"
            class="mlp-feature-toggle"
            :class="[`mlp-feature-toggle--${feature.key}`, { 'is-active': state.featureKeys.includes(feature.key) }]"
            @click="toggleFeature(feature.key)"
          >
            <span class="mlp-feature-toggle__label">{{ feature.label }}</span>
            <span class="mlp-feature-toggle__swatch" aria-hidden="true" />
          </button>
        </div>
      </div>

      <label v-if="showsGuidedControl('activation')" class="mlp-guided-control">
        <span>{{ copy.activation }}</span>
        <select :value="state.activation" @change="onSelectInput('activation', $event, true)">
          <option v-for="activation in activations" :key="activation" :value="activation">{{ activation }}</option>
        </select>
      </label>

      <label v-if="showsGuidedControl('learningRate')" class="mlp-guided-control">
        <span>{{ copy.learningRate }}</span>
        <select :value="state.learningRate" @change="onSelectInput('learningRate', $event)">
          <option v-for="rate in learningRates" :key="rate" :value="rate">{{ rate }}</option>
        </select>
      </label>

      <label v-if="showsGuidedControl('batchSize')" class="mlp-guided-control">
        <span>{{ copy.batchSize }} <strong>{{ state.batchSize }}</strong></span>
        <input type="range" min="1" max="50" step="1" :value="state.batchSize" @input="onRangeInput('batchSize', $event)" />
      </label>

      <label v-if="showsGuidedControl('noise')" class="mlp-guided-control">
        <span>{{ copy.noise }} <strong>{{ round(state.noise, 2) }}</strong></span>
        <input type="range" min="0" max="0.5" step="0.01" :value="state.noise" @input="onRangeInput('noise', $event, true)" />
      </label>

      <label v-if="showsGuidedControl('regularization')" class="mlp-guided-control">
        <span>{{ copy.regularization }}</span>
        <select :value="state.regularizationType" @change="onSelectInput('regularizationType', $event)">
          <option v-for="regularization in regularizations" :key="regularization" :value="regularization">{{ regularization }}</option>
        </select>
      </label>
    </section>

    <p class="mlp-guided-observation">
      <span>{{ copy.observation }}</span>
      <strong>{{ localizedText(lessonFocus?.observation) || focusText }}</strong>
    </p>

    <div class="mlp-guided-flow">
      <article class="mlp-guided-stage mlp-guided-stage--data">
        <header>
          <span>01 · {{ copy.data }}</span>
          <strong>{{ datasetLabel(activeDatasetKey) }}</strong>
        </header>
        <button
          type="button"
          class="mlp-dataset-choice mlp-guided-dataset-preview"
          :class="[`mlp-dataset-choice--${activeDatasetKey}`, 'is-active']"
          :aria-label="datasetLabel(activeDatasetKey)"
          @click="regenerateData"
        >
          <span aria-hidden="true" />
        </button>
        <small>{{ state.featureKeys.join(' · ') }}</small>
      </article>

      <span class="mlp-guided-arrow" aria-hidden="true">→</span>

      <article class="mlp-guided-stage mlp-guided-stage--network">
        <header>
          <span>02 · {{ copy.architecture }}</span>
          <strong>{{ networkSummary }} {{ copy.hiddenLayers }}</strong>
        </header>

        <div v-if="showsGuidedControl('layers')" class="mlp-guided-layer-controls">
          <button type="button" :disabled="state.networkShape.length >= 6" @click="addLayer">+ {{ copy.hiddenLayers }}</button>
          <button type="button" :disabled="!state.networkShape.length" @click="removeLayer">− {{ copy.hiddenLayers }}</button>
          <div v-for="(count, index) in state.networkShape" :key="`guided-layer-${index}`">
            <button type="button" @click="resizeLayer(index, -1)">−</button>
            <strong>{{ count }}</strong>
            <button type="button" @click="resizeLayer(index, 1)">+</button>
          </div>
        </div>

        <MlpNetworkGraph :snapshot="snapshot" :previous-snapshot="previousSnapshot" :state="state" />
      </article>

      <span class="mlp-guided-arrow" aria-hidden="true">→</span>

      <article class="mlp-guided-stage mlp-guided-stage--output">
        <header>
          <span>03 · {{ copy.output }}</span>
          <strong>{{ round(snapshot.testLoss, 3) }}</strong>
        </header>
        <MlpOutputFitMap
          :snapshot="snapshot"
          :state="state"
          :history="contourHistory"
          :accent="props.accent"
        />
        <div class="mlp-output-legend">
          <span>{{ copy.colorLegend }}</span>
          <div><i>-1</i><b /><i>0</i><b /><i>1</i></div>
        </div>
      </article>
    </div>

    <section v-if="props.mode === 'explore'" class="mlp-explore-panel">
      <article>
        <header><span>{{ copy.advancedData }}</span><strong>{{ copy.dataQuestion }}</strong></header>
        <label class="mlp-top-select">
          <span>{{ copy.problem }}</span>
          <select :value="state.problemType" @change="onSelectInput('problemType', $event, true)">
            <option value="classification">{{ copy.classification }}</option>
            <option value="regression">{{ copy.regression }}</option>
          </select>
        </label>
        <label class="mlp-slider-control">
          <span>{{ copy.trainRatio }} <strong>{{ Math.round(state.trainRatio * 100) }}%</strong></span>
          <input type="range" min="0.1" max="0.9" step="0.05" :value="state.trainRatio" @input="onRangeInput('trainRatio', $event, true)" />
        </label>
        <label class="mlp-slider-control">
          <span>{{ copy.noise }} <strong>{{ round(state.noise, 2) }}</strong></span>
          <input type="range" min="0" max="0.5" step="0.01" :value="state.noise" @input="onRangeInput('noise', $event, true)" />
        </label>
        <button type="button" class="mlp-regenerate-button" @click="regenerateData">{{ copy.regenerate }}</button>
      </article>

      <article>
        <header><span>{{ copy.advancedOptimization }}</span><strong>{{ copy.activation }}</strong></header>
        <label class="mlp-top-select">
          <span>{{ copy.activation }}</span>
          <select :value="state.activation" @change="onSelectInput('activation', $event, true)">
            <option v-for="activation in activations" :key="activation" :value="activation">{{ activation }}</option>
          </select>
        </label>
        <label class="mlp-top-select">
          <span>{{ copy.learningRate }}</span>
          <select :value="state.learningRate" @change="onSelectInput('learningRate', $event)">
            <option v-for="rate in learningRates" :key="rate" :value="rate">{{ rate }}</option>
          </select>
        </label>
        <label class="mlp-top-select">
          <span>{{ copy.regularization }}</span>
          <select :value="state.regularizationType" @change="onSelectInput('regularizationType', $event)">
            <option v-for="regularization in regularizations" :key="regularization" :value="regularization">{{ regularization }}</option>
          </select>
        </label>
        <label class="mlp-top-select">
          <span>{{ copy.regularizationRate }}</span>
          <select :value="state.regularizationRate" @change="onSelectInput('regularizationRate', $event)">
            <option v-for="rate in regularizationRates" :key="rate" :value="rate">{{ rate }}</option>
          </select>
        </label>
        <label class="mlp-slider-control">
          <span>{{ copy.batchSize }} <strong>{{ state.batchSize }}</strong></span>
          <input type="range" min="1" max="50" step="1" :value="state.batchSize" @input="onRangeInput('batchSize', $event)" />
        </label>
      </article>

      <article class="mlp-explore-panel__diagnostics">
        <header><span>{{ copy.advancedDiagnostics }}</span><strong>{{ copy.lossCurve }}</strong></header>
        <MlpTrainingTimeline :snapshot="snapshot" :train-label="copy.trainLoss" :test-label="copy.testLoss" />
        <div class="mlp-explore-metrics">
          <div v-for="metric in metricCards" :key="metric.id">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </div>
        </div>
        <div class="mlp-output-checks">
          <label>
            <input type="checkbox" :checked="state.showTestData" @change="onCheckboxInput('showTestData', $event)" />
            <span>{{ copy.showTestData }}</span>
          </label>
          <label>
            <input type="checkbox" :checked="state.discretize" @change="onCheckboxInput('discretize', $event)" />
            <span>{{ copy.discretize }}</span>
          </label>
        </div>
      </article>

      <article class="mlp-fit-advice" aria-live="polite">
        <span>{{ fitAdviceLabels.heading }}</span>
        <strong>{{ currentFitAdvice.title }}</strong>
        <p>{{ currentFitAdvice.summary }}</p>
        <div class="mlp-fit-advice__chips">
          <small v-for="chip in currentFitAdvice.chips" :key="chip">{{ chip }}</small>
        </div>
        <button type="button" @click="applyFitAdvice">{{ fitAdviceLabels.apply }}</button>
      </article>
    </section>
  </section>
</template>
