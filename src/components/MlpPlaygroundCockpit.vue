<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
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
import { round } from '../utils/math'
import MlpNodeHeatmap from './MlpNodeHeatmap.vue'

const props = defineProps<{
  accent: string
  section?: StorySection
}>()

const { locale } = useI18n()
const outputCanvasRef = ref<HTMLCanvasElement>()
const state = ref<MlpPlaygroundState>(normalizeMlpPlaygroundState(DEFAULT_MLP_PLAYGROUND_STATE))
const session = shallowRef(createMlpPlaygroundSession(state.value))
const snapshot = shallowRef<MlpPlaygroundSnapshot>(session.value.snapshot())
const isPlaying = ref(false)
let timer: number | undefined

const networkWidth = 680
const classificationDatasets: MlpClassificationDataset[] = ['circle', 'xor', 'gauss', 'spiral']
const regressionDatasets: MlpRegressionDataset[] = ['plane', 'gaussian']
const activations: MlpActivationKind[] = ['tanh', 'relu', 'sigmoid', 'linear']
const regularizations: MlpRegularizationType[] = ['none', 'l1', 'l2']
const learningRates = [0.00001, 0.0001, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10]
const regularizationRates = [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'MLP Playground',
        subtitle: '保留 TensorFlow Playground 的原版工作台风格',
        task: '当前章节任务',
        play: '播放',
        pause: '暂停',
        step: '单步',
        reset: '重置',
        regenerate: '重新生成',
        problem: 'Problem type',
        classification: 'Classification',
        regression: 'Regression',
        data: 'DATA',
        dataQuestion: 'Which dataset do you want to use?',
        features: 'FEATURES',
        featureQuestion: 'Which properties do you want to feed in?',
        output: 'OUTPUT',
        hiddenLayers: 'HIDDEN LAYERS',
        activation: 'Activation',
        regularization: 'Regularization',
        learningRate: 'Learning rate',
        regularizationRate: 'Regularization rate',
        batchSize: 'Batch size',
        noise: 'Noise',
        trainRatio: 'Ratio of training to test data',
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
        colorLegend: 'Colors show data, neuron and weight values.',
        datasets: {
          circle: 'Circle',
          xor: 'XOR',
          gauss: 'Gaussian',
          spiral: 'Spiral',
          plane: 'Plane',
          gaussian: 'Gaussian field',
        },
        focus: {
          dataset: '观察数据分布与输出区域是否匹配。',
          features: '先看输入节点热力图，再看隐藏层如何组合这些特征。',
          network: '读取节点热力图和权重线，理解输出如何被组合出来。',
          activations: '只切换激活函数，比较节点响应形状和 loss 曲线。',
          loss: '单步训练，观察 loss、权重、bias 和输出热力图是否同步变化。',
          regularization: '切换 L1/L2，观察权重线是否变细或被剪掉。',
          generalization: '同时读训练 loss 与测试 loss，判断是否正在记住噪声。',
        },
      }
    : {
        title: 'MLP Playground',
        subtitle: 'TensorFlow Playground style neural-network workbench',
        task: 'Current chapter task',
        play: 'Play',
        pause: 'Pause',
        step: 'Step',
        reset: 'Reset',
        regenerate: 'Regenerate',
        problem: 'Problem type',
        classification: 'Classification',
        regression: 'Regression',
        data: 'DATA',
        dataQuestion: 'Which dataset do you want to use?',
        features: 'FEATURES',
        featureQuestion: 'Which properties do you want to feed in?',
        output: 'OUTPUT',
        hiddenLayers: 'HIDDEN LAYERS',
        activation: 'Activation',
        regularization: 'Regularization',
        learningRate: 'Learning rate',
        regularizationRate: 'Regularization rate',
        batchSize: 'Batch size',
        noise: 'Noise',
        trainRatio: 'Ratio of training to test data',
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
        colorLegend: 'Colors show data, neuron and weight values.',
        datasets: {
          circle: 'Circle',
          xor: 'XOR',
          gauss: 'Gaussian',
          spiral: 'Spiral',
          plane: 'Plane',
          gaussian: 'Gaussian field',
        },
        focus: {
          dataset: 'Compare data distribution with the output regions.',
          features: 'Read input-node heatmaps first, then see how hidden layers combine those signals.',
          network: 'Read every node heatmap and weight link to understand how the output is composed.',
          activations: 'Change only the activation and compare node response shapes plus loss curves.',
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

function sync(nextSnapshot: MlpPlaygroundSnapshot) {
  snapshot.value = nextSnapshot
  state.value = nextSnapshot.state
  void nextTick(drawOutput)
}

function resetWith(partial: Partial<MlpPlaygroundState> = {}) {
  stopPlayback()
  sync(session.value.reset({ ...state.value, ...partial }))
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
  sync(session.value.regenerateData())
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

function colorForValue(rawValue: number) {
  const value = state.value.discretize ? (rawValue >= 0 ? 1 : -1) : Math.max(-1, Math.min(1, rawValue))
  const t = (value + 1) / 2
  const red = Math.round(244 - t * 172)
  const green = Math.round(148 + t * 34)
  const blue = Math.round(34 + t * 154)
  return `rgb(${red}, ${green}, ${blue})`
}

function drawOutput() {
  const canvas = outputCanvasRef.value
  const context = canvas?.getContext('2d')
  const current = snapshot.value
  if (!canvas || !context || !current.outputGrid.length) return

  const size = Math.max(300, Math.round(canvas.clientWidth || 420))
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }

  context.clearRect(0, 0, size, size)
  const cell = size / current.gridSize

  for (let row = 0; row < current.gridSize; row += 1) {
    for (let column = 0; column < current.gridSize; column += 1) {
      context.fillStyle = colorForValue(current.outputGrid[row * current.gridSize + column] ?? 0)
      context.fillRect(column * cell, row * cell, Math.ceil(cell), Math.ceil(cell))
    }
  }

  context.strokeStyle = 'rgba(0, 0, 0, 0.18)'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(size / 2, 0)
  context.lineTo(size / 2, size)
  context.moveTo(0, size / 2)
  context.lineTo(size, size / 2)
  context.stroke()
}

function mapX(x: number) {
  const [min, max] = snapshot.value.xDomain
  return ((x - min) / (max - min)) * 100
}

function mapY(y: number) {
  const [min, max] = snapshot.value.yDomain
  return 100 - ((y - min) / (max - min)) * 100
}

const visiblePoints = computed(() =>
  state.value.showTestData ? [...snapshot.value.trainData, ...snapshot.value.testData] : snapshot.value.trainData,
)

const datasetOptions = computed(() =>
  state.value.problemType === 'classification' ? classificationDatasets : regressionDatasets,
)

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
    { id: 'gradientNorm', label: copy.value.gradientNorm, value: round(current.gradientNorm, 4) },
  ]
})

const networkHeight = computed(() => {
  const maxNodes = Math.max(...snapshot.value.layers.map((layer) => layer.length), 1)
  return Math.max(300, maxNodes * 46 + 54)
})

const positionedNodes = computed(() => {
  const layers = snapshot.value.layers
  const xStep = (networkWidth - 78) / Math.max(layers.length - 1, 1)
  return layers.flatMap((layer, layerIndex) => {
    const yStep = (networkHeight.value - 64) / Math.max(layer.length - 1, 1)
    return layer.map((node, nodeIndex) => ({
      ...node,
      x: 39 + layerIndex * xStep,
      y: layer.length === 1 ? networkHeight.value / 2 : 32 + nodeIndex * yStep,
    }))
  })
})

const positionedNodeMap = computed(() => new Map(positionedNodes.value.map((node) => [node.id, node])))

const linkPaths = computed(() =>
  snapshot.value.links.flatMap((link) => {
    const source = positionedNodeMap.value.get(link.sourceId)
    const target = positionedNodeMap.value.get(link.targetId)
    if (!source || !target) return []
    const mid = (source.x + target.x) / 2
    return [{
      ...link,
      path: `M ${source.x + 23} ${source.y} C ${mid} ${source.y}, ${mid} ${target.y}, ${target.x - 23} ${target.y}`,
      width: Math.min(5, 0.6 + Math.abs(link.weight) * 1.9),
      color: link.weight >= 0 ? '#1f87c9' : '#f59322',
      opacity: link.isDead ? 0.14 : 0.22 + Math.min(0.56, Math.abs(link.weight) / 2.6),
    }]
  }),
)

function curvePoints(kind: 'train' | 'test') {
  const history = snapshot.value.lossHistory
  if (!history.length) return ''
  const values = history.map((entry) => (kind === 'train' ? entry.trainLoss : entry.testLoss))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 320
  const height = 96
  const pad = 10
  return values
    .map((value, index) => {
      const x = pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2)
      const y = height - pad - ((value - min) / range) * (height - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
}

const trainLossPoints = computed(() => curvePoints('train'))
const testLossPoints = computed(() => curvePoints('test'))
const focusText = computed(() => copy.value.focus[props.section?.playgroundFocus ?? 'network'])
const epochDisplay = computed(() =>
  String(snapshot.value.iteration).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ','),
)
const networkSummary = computed(() =>
  state.value.networkShape.length ? `${state.value.networkShape.length}` : copy.value.noHiddenLayers,
)

onMounted(drawOutput)
onBeforeUnmount(stopPlayback)
watch(snapshot, drawOutput, { deep: true })
watch(() => state.value.discretize, drawOutput)
</script>

<template>
  <section class="mlp-playground-cockpit" :style="{ '--mlp-accent': props.accent }">
    <header class="mlp-playground-toolbar">
      <div class="mlp-run-controls" aria-label="MLP training controls">
        <button type="button" class="mlp-icon-button" :title="copy.reset" @click="resetWith()">↻</button>
        <button type="button" class="mlp-icon-button mlp-icon-button--play" :title="isPlaying ? copy.pause : copy.play" @click="togglePlayback">
          {{ isPlaying ? 'Ⅱ' : '▶' }}
        </button>
        <button type="button" class="mlp-icon-button" :title="copy.step" @click="step(1)">▶▏</button>
      </div>

      <div class="mlp-epoch-readout">
        <span>{{ copy.iteration }}</span>
        <strong>{{ epochDisplay }}</strong>
      </div>

      <label class="mlp-top-select">
        <span>{{ copy.learningRate }}</span>
        <select :value="state.learningRate" @change="onSelectInput('learningRate', $event)">
          <option v-for="rate in learningRates" :key="rate" :value="rate">{{ rate }}</option>
        </select>
      </label>

      <label class="mlp-top-select">
        <span>{{ copy.activation }}</span>
        <select :value="state.activation" @change="onSelectInput('activation', $event, true)">
          <option v-for="activation in activations" :key="activation" :value="activation">
            {{ activation }}
          </option>
        </select>
      </label>

      <label class="mlp-top-select">
        <span>{{ copy.regularization }}</span>
        <select :value="state.regularizationType" @change="onSelectInput('regularizationType', $event)">
          <option v-for="regularization in regularizations" :key="regularization" :value="regularization">
            {{ regularization }}
          </option>
        </select>
      </label>

      <label class="mlp-top-select">
        <span>{{ copy.regularizationRate }}</span>
        <select :value="state.regularizationRate" @change="onSelectInput('regularizationRate', $event)">
          <option v-for="rate in regularizationRates" :key="rate" :value="rate">{{ rate }}</option>
        </select>
      </label>

      <label class="mlp-top-select">
        <span>{{ copy.problem }}</span>
        <select :value="state.problemType" @change="onSelectInput('problemType', $event, true)">
          <option value="classification">{{ copy.classification }}</option>
          <option value="regression">{{ copy.regression }}</option>
        </select>
      </label>
    </header>

    <section class="mlp-playground-lesson-strip">
      <span>{{ copy.task }}</span>
      <strong>{{ localizedText(props.section?.title) }}</strong>
      <p>{{ localizedText(props.section?.experimentPrompt) || focusText }}</p>
    </section>

    <div class="mlp-playground-workspace">
      <aside class="mlp-data-panel">
        <h3>{{ copy.data }}</h3>
        <p>{{ copy.dataQuestion }}</p>

        <div class="mlp-dataset-list">
          <button
            v-for="dataset in datasetOptions"
            :key="dataset"
            type="button"
            class="mlp-dataset-choice"
            :class="[`mlp-dataset-choice--${dataset}`, { 'is-active': isDatasetActive(dataset) }]"
            :title="copy.datasets[dataset]"
            @click="chooseDataset(dataset)"
          >
            <span aria-hidden="true" />
          </button>
        </div>

        <label class="mlp-slider-control">
          <span>{{ copy.trainRatio }} <strong>{{ Math.round(state.trainRatio * 100) }}%</strong></span>
          <input type="range" min="0.1" max="0.9" step="0.05" :value="state.trainRatio" @input="onRangeInput('trainRatio', $event, true)" />
        </label>

        <label class="mlp-slider-control">
          <span>{{ copy.noise }} <strong>{{ round(state.noise, 2) }}</strong></span>
          <input type="range" min="0" max="0.5" step="0.01" :value="state.noise" @input="onRangeInput('noise', $event, true)" />
        </label>

        <label class="mlp-slider-control">
          <span>{{ copy.batchSize }} <strong>{{ state.batchSize }}</strong></span>
          <input type="range" min="1" max="50" step="1" :value="state.batchSize" @input="onRangeInput('batchSize', $event)" />
        </label>

        <button type="button" class="mlp-regenerate-button" @click="regenerateData">{{ copy.regenerate }}</button>
      </aside>

      <aside class="mlp-features-panel">
        <h3>{{ copy.features }}</h3>
        <p>{{ copy.featureQuestion }}</p>
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
      </aside>

      <section class="mlp-network-panel">
        <div class="mlp-network-header">
          <button type="button" class="mlp-layer-button" :disabled="state.networkShape.length >= 6" @click="addLayer">+</button>
          <button type="button" class="mlp-layer-button" :disabled="!state.networkShape.length" @click="removeLayer">−</button>
          <strong>{{ networkSummary }}</strong>
          <span>{{ copy.hiddenLayers }}</span>
        </div>

        <div class="mlp-network__editors">
          <div
            v-for="(count, index) in state.networkShape"
            :key="`layer-${index}`"
            class="mlp-layer-stepper"
          >
            <div>
              <button type="button" @click="resizeLayer(index, 1)">+</button>
              <button type="button" @click="resizeLayer(index, -1)">−</button>
            </div>
            <strong>{{ count }} {{ copy.neurons }}</strong>
          </div>
        </div>

        <div
          class="mlp-network"
          :style="{ '--network-height': `${networkHeight}px` }"
          data-testid="mlp-network-graph"
        >
          <svg
            class="mlp-network__links"
            :viewBox="`0 0 ${networkWidth} ${networkHeight}`"
            preserveAspectRatio="none"
          >
            <path
              v-for="link in linkPaths"
              :key="link.id"
              :d="link.path"
              :stroke="link.color"
              :stroke-width="link.width"
              :opacity="link.opacity"
              class="mlp-network__link"
            />
          </svg>

          <div
            v-for="node in positionedNodes"
            :key="node.id"
            class="mlp-network__node"
            :class="`mlp-network__node--${node.layerKind}`"
            :style="{ left: `${(node.x / networkWidth) * 100}%`, top: `${(node.y / networkHeight) * 100}%` }"
          >
            <MlpNodeHeatmap
              :values="node.outputGrid"
              :grid-size="snapshot.gridSize"
              :discretize="state.discretize"
              compact
            />
            <span>{{ node.label }}</span>
            <i
              v-if="node.layerKind !== 'input'"
              class="mlp-network__bias"
              :style="{ backgroundColor: colorForValue(node.bias) }"
              :title="`bias ${round(node.bias, 2)}`"
            />
          </div>
        </div>
      </section>

      <aside class="mlp-output-panel">
        <h3>{{ copy.output }}</h3>
        <div class="mlp-output-losses">
          <strong>{{ copy.testLoss }} {{ round(snapshot.testLoss, 3) }}</strong>
          <span>{{ copy.trainLoss }} {{ round(snapshot.trainLoss, 3) }}</span>
        </div>

        <div class="mlp-loss-chart">
          <div class="mlp-panel-heading">
            <span>{{ copy.lossCurve }}</span>
            <strong>{{ snapshot.lossHistory.length }}</strong>
          </div>
          <svg viewBox="0 0 320 96" role="img" aria-label="MLP train and test loss curves">
            <polyline :points="trainLossPoints" class="mlp-loss-chart__line mlp-loss-chart__line--train" />
            <polyline :points="testLossPoints" class="mlp-loss-chart__line mlp-loss-chart__line--test" />
          </svg>
        </div>

        <div class="mlp-output-map">
          <canvas ref="outputCanvasRef" class="mlp-output-map__canvas" data-testid="mlp-output-heatmap" />
          <svg viewBox="0 0 100 100" class="mlp-output-map__points" aria-hidden="true">
            <circle
              v-for="(point, index) in visiblePoints"
              :key="`${point.split}-${index}-${point.x}-${point.y}`"
              :cx="mapX(point.x)"
              :cy="mapY(point.y)"
              :r="point.split === 'test' ? 1.25 : 1.05"
              :class="[
                point.label >= 0 ? 'mlp-data-point mlp-data-point--positive' : 'mlp-data-point mlp-data-point--negative',
                point.split === 'test' ? 'mlp-data-point--test' : '',
              ]"
            />
          </svg>
        </div>

        <div class="mlp-output-legend">
          <span>{{ copy.colorLegend }}</span>
          <div>
            <i>-1</i>
            <b />
            <i>0</i>
            <b />
            <i>1</i>
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
      </aside>
    </div>

    <section class="mlp-metrics-panel">
      <article v-for="metric in metricCards" :key="metric.id" class="mlp-metric">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
      </article>
      <div class="mlp-preset-strip">
        <button type="button" @click="quickPreset('xor')">XOR</button>
        <button type="button" @click="quickPreset('circle')">{{ copy.datasets.circle }}</button>
        <button type="button" @click="quickPreset('regression')">{{ copy.regression }}</button>
      </div>
    </section>
  </section>
</template>
