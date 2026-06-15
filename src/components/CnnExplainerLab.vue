<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { interpolateBrBG, interpolateGreys, interpolateOranges, interpolateRdBu } from 'd3'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../types/ml'
import MarkdownMathContent from './MarkdownMathContent.vue'
import {
  buildCnnOperationDetail,
  roundCnnValue,
  runTinyVggForwardPass,
  summarizeLayerShape,
  type CnnClassScore,
  type CnnLayerSnapshot,
  type CnnNodeSnapshot,
} from '../utils/cnnExplainer'

const props = defineProps<{
  section: StorySection
}>()

const { locale } = useI18n()

type CnnLabStatus = 'idle' | 'loading' | 'ready' | 'error'
type CnnColorMode = 'activation' | 'weights' | 'logits'

const maxUploadBytes = 5 * 1024 * 1024
const acceptedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])

const status = ref<CnnLabStatus>('idle')
const statusMessage = ref('')
const layers = ref<CnnLayerSnapshot[]>([])
const scores = ref<CnnClassScore[]>([])
const topPrediction = ref<CnnClassScore | undefined>()
const selectedLayerIndex = ref(0)
const selectedNodeIndex = ref(0)
const selectedRow = ref(0)
const selectedCol = ref(0)
const selectedImageUrl = ref('')
const selectedImageName = ref('')
const userObjectUrl = ref<string | undefined>()
const fileError = ref('')
const isPlaying = ref(false)
const reducedMotion = ref(false)
const showDetails = ref(true)
const colorMode = ref<CnnColorMode>('activation')
const fileInputRef = ref<HTMLInputElement | null>(null)

let playbackTimer: number | undefined

function loc<T>(zhCN: T, en: T) {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

const copy = computed(() =>
  localized(
    loc(
      {
        title: 'CNN 结构与传播实验台',
        subtitle: 'Tiny VGG 在浏览器中真实前向传播；点击层或节点查看低层计算。',
        upload: '上传图片',
        uploadHint: 'PNG / JPG / WebP，不超过 5MB；图片只在本机浏览器处理。',
        play: '播放传播',
        pause: '暂停',
        step: '单步',
        reset: '重置',
        details: '层详情',
        color: '颜色',
        activation: '激活',
        weights: '权重',
        logits: 'logit',
        loading: '加载模型与激活',
        ready: '已就绪',
        error: '无法运行',
        idle: '准备中',
        input: '输入',
        score: '类别分数',
        prediction: '当前预测',
        overview: '网络概览',
        selected: '选中层',
        shape: 'shape / 参数',
        operation: '公式视图',
        map: '激活图',
        row: '行',
        col: '列',
        channel: 'channel',
        patch: 'patch',
        kernel: 'kernel',
        product: '乘积和',
        bias: 'bias',
        weightedSum: '加权和',
        reluValue: 'ReLU 后',
        maxValue: '最大值',
        source: '来源',
        probability: '概率',
        defaultImage: '合成演示图',
        reducedMotion: '系统开启 reduced motion，自动播放已关闭。',
        invalidType: '请上传 PNG、JPG 或 WebP 图片。',
        invalidSize: '图片不能超过 5MB。',
        fallback: '模型或浏览器图像能力不可用时，仍可阅读结构、shape 和公式说明。',
      },
      {
        title: 'CNN structure and propagation lab',
        subtitle: 'Tiny VGG runs a real browser-side forward pass; click a layer or node for low-level math.',
        upload: 'Upload image',
        uploadHint: 'PNG / JPG / WebP, up to 5MB; images stay in your local browser.',
        play: 'Play flow',
        pause: 'Pause',
        step: 'Step',
        reset: 'Reset',
        details: 'Layer details',
        color: 'Color',
        activation: 'Activation',
        weights: 'Weights',
        logits: 'Logit',
        loading: 'Loading model and activations',
        ready: 'Ready',
        error: 'Cannot run',
        idle: 'Preparing',
        input: 'Input',
        score: 'Class scores',
        prediction: 'Current prediction',
        overview: 'Network overview',
        selected: 'Selected layer',
        shape: 'shape / parameters',
        operation: 'Formula view',
        map: 'Activation map',
        row: 'row',
        col: 'col',
        channel: 'channel',
        patch: 'patch',
        kernel: 'kernel',
        product: 'product sum',
        bias: 'bias',
        weightedSum: 'weighted sum',
        reluValue: 'after ReLU',
        maxValue: 'max value',
        source: 'source',
        probability: 'probability',
        defaultImage: 'Synthetic demo image',
        reducedMotion: 'Reduced motion is enabled, so autoplay is disabled.',
        invalidType: 'Upload a PNG, JPG, or WebP image.',
        invalidSize: 'Images must be 5MB or smaller.',
        fallback: 'If the model or browser image APIs are unavailable, the structure, shape, and formula explanations remain readable.',
      },
    ),
  ),
)

const sectionHint = computed(() => {
  const hints: Record<string, string> = localized(
    loc(
      {
        'image-volume': '先看 input 的 64×64×3，再观察每个 channel 如何流向第一层卷积。',
        'kernel-convolution': '点击第一个 Conv 层，移动 row/col，手算 patch 与 kernel 的点乘。',
        'padding-stride-shape': '沿着层序前进，比较 valid conv 和 max pool 怎样改变空间尺寸。',
        'channels-feature-maps': '切换不同 filter，观察每个输出 channel 都有自己的 kernel 与 bias。',
        'pooling-classifier-head': '从 MaxPool 到 Flatten 再到 Softmax，看空间图如何变成类别概率。',
        'transfer-learning-review': '上传一张自己的图片，复盘预训练 backbone 和新任务分类头之间的关系。',
      },
      {
        'image-volume': 'Start with the 64x64x3 input and watch each channel feed the first convolution.',
        'kernel-convolution': 'Click the first Conv layer, move row/col, and calculate the patch-kernel dot product.',
        'padding-stride-shape': 'Step through layers and compare how valid convolution and max pooling change spatial size.',
        'channels-feature-maps': 'Switch filters and see that each output channel has its own kernels and bias.',
        'pooling-classifier-head': 'Move from MaxPool to Flatten to Softmax to see spatial maps become probabilities.',
        'transfer-learning-review': 'Upload your own image and review the bridge between a pretrained backbone and a task head.',
      },
    ),
  )

  return hints[props.section.id] ?? copy.value.subtitle
})

const statusLabel = computed(() => {
  if (status.value === 'loading') return copy.value.loading
  if (status.value === 'ready') return copy.value.ready
  if (status.value === 'error') return copy.value.error
  return copy.value.idle
})

const selectedLayer = computed(() => layers.value[selectedLayerIndex.value])
const selectedNode = computed(() => selectedLayer.value?.nodes[selectedNodeIndex.value])
const layerSummary = computed(() => (selectedLayer.value ? summarizeLayerShape(selectedLayer.value) : copy.value.fallback))
const selectedDetail = computed(() =>
  buildCnnOperationDetail(layers.value, selectedLayerIndex.value, selectedNodeIndex.value, selectedRow.value, selectedCol.value),
)
const selectedMatrix = computed(() => (isMatrix(selectedNode.value?.output) ? selectedNode.value.output : undefined))
const sampledActivationGrid = computed(() => sampleMatrix(selectedMatrix.value, 14, 14))
const selectedLayerRange = computed(() => layerRange(selectedLayer.value))
const rowMax = computed(() => Math.max(0, (selectedLayer.value?.outputShape[0] ?? 1) - 1))
const colMax = computed(() => Math.max(0, (selectedLayer.value?.outputShape[1] ?? 1) - 1))
const hasSpatialSelection = computed(() => Boolean(selectedMatrix.value && selectedLayer.value?.outputShape.length === 3))
const sortedScores = computed(() => [...scores.value].sort((left, right) => right.probability - left.probability))
const svgWidth = computed(() => Math.max(1040, layers.value.length * 92 + 120))

const formulaMarkdown = computed(() => {
  const detail = selectedDetail.value
  if (!detail) return ''

  if (detail.kind === 'conv') {
    return `$$${detail.formula}$$

${copy.value.weightedSum}: $${formatNumber(detail.weightedSum)}$  
${copy.value.reluValue}: $${formatNumber(detail.reluValue)}$`
  }

  if (detail.kind === 'relu') {
    return `$$${detail.formula}$$

$z=${formatNumber(detail.weightedSum)} \\Rightarrow a=${formatNumber(detail.reluValue)}$`
  }

  if (detail.kind === 'pool') {
    return `$$${detail.formula}$$

${copy.value.maxValue}: $${formatNumber(detail.poolMax)}$`
  }

  if (detail.kind === 'flatten') {
    return `$$${detail.formula}$$

$(${detail.flattenSource?.channelIndex}, ${detail.flattenSource?.row}, ${detail.flattenSource?.col}) \\rightarrow v_{${detail.flattenIndex}}$`
  }

  if (detail.kind === 'dense') {
    return `$$${detail.formula}$$

${copy.value.prediction}: **${topPrediction.value?.label ?? ''}**`
  }

  return `$$${detail.formula}$$`
})

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  void runInference(createDefaultInputImage(), copy.value.defaultImage)
})

onBeforeUnmount(() => {
  stopPlayback()
  revokeUserObjectUrl()
})

watch(isPlaying, (playing) => {
  stopPlayback()
  if (!playing || reducedMotion.value) return
  playbackTimer = window.setInterval(stepForward, 1300)
})

watch([rowMax, colMax], () => {
  selectedRow.value = Math.min(selectedRow.value, rowMax.value)
  selectedCol.value = Math.min(selectedCol.value, colMax.value)
})

async function runInference(imageUrl: string, imageName: string) {
  stopPlayback()
  isPlaying.value = false
  status.value = 'loading'
  statusMessage.value = ''
  fileError.value = ''

  try {
    const result = await runTinyVggForwardPass(imageUrl)
    layers.value = result.layers
    scores.value = result.scores
    topPrediction.value = result.topPrediction
    selectedImageUrl.value = imageUrl
    selectedImageName.value = imageName
    status.value = 'ready'
    selectLayer(0, 0)
  } catch (error) {
    status.value = 'error'
    statusMessage.value = error instanceof Error ? error.message : copy.value.fallback
  }
}

function onUploadClick() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!acceptedImageTypes.has(file.type)) {
    fileError.value = copy.value.invalidType
    return
  }

  if (file.size > maxUploadBytes) {
    fileError.value = copy.value.invalidSize
    return
  }

  revokeUserObjectUrl()
  const objectUrl = URL.createObjectURL(file)
  userObjectUrl.value = objectUrl
  void runInference(objectUrl, file.name)
}

function selectLayer(layerIndex: number, nodeIndex = 0) {
  const layer = layers.value[layerIndex]
  if (!layer) return
  selectedLayerIndex.value = layerIndex
  selectedNodeIndex.value = Math.min(Math.max(0, nodeIndex), Math.max(0, layer.nodes.length - 1))

  if (layer.outputShape.length === 3) {
    selectedRow.value = Math.floor((layer.outputShape[0] ?? 1) / 2)
    selectedCol.value = Math.floor((layer.outputShape[1] ?? 1) / 2)
  } else {
    selectedRow.value = 0
    selectedCol.value = 0
  }
}

function selectScore(score: CnnClassScore) {
  const denseLayerIndex = layers.value.findIndex((layer) => layer.kind === 'dense')
  const scoreIndex = scores.value.findIndex((item) => item.id === score.id)
  if (denseLayerIndex >= 0 && scoreIndex >= 0) selectLayer(denseLayerIndex, scoreIndex)
}

function togglePlayback() {
  if (reducedMotion.value || status.value !== 'ready') return
  isPlaying.value = !isPlaying.value
}

function stepForward() {
  if (!layers.value.length) return
  const nextLayerIndex = (selectedLayerIndex.value + 1) % layers.value.length
  selectLayer(nextLayerIndex, 0)
}

function resetSelection() {
  stopPlayback()
  isPlaying.value = false
  selectLayer(0, 0)
}

function stopPlayback() {
  if (playbackTimer !== undefined) {
    window.clearInterval(playbackTimer)
    playbackTimer = undefined
  }
}

function revokeUserObjectUrl() {
  if (userObjectUrl.value) {
    URL.revokeObjectURL(userObjectUrl.value)
    userObjectUrl.value = undefined
  }
}

function visibleNodes(layer: CnnLayerSnapshot) {
  if (layer.kind === 'flatten') return layer.nodes.slice(0, 12)
  return layer.nodes.slice(0, 10)
}

function hiddenNodeCount(layer: CnnLayerSnapshot) {
  return Math.max(0, layer.nodes.length - visibleNodes(layer).length)
}

function layerX(index: number) {
  return 60 + index * 92
}

function nodeY(nodeIndex: number, totalNodes: number) {
  const top = 52
  const bottom = 230
  if (totalNodes <= 1) return (top + bottom) / 2
  return top + (nodeIndex / (totalNodes - 1)) * (bottom - top)
}

function nodeRadius(layer: CnnLayerSnapshot) {
  if (layer.kind === 'flatten') return 5
  if (layer.kind === 'dense') return 8
  return 9
}

function nodeLabel(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (layer.kind === 'dense') return scores.value[node.index]?.label ?? `${node.index}`
  return `${node.index}`
}

function isSelectedNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  return selectedLayerIndex.value === layer.index && selectedNodeIndex.value === node.index
}

function colorForNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (colorMode.value === 'weights') {
    const weights = node.inputLinks.flatMap((link) => flattenWeight(link.weight))
    if (!weights.length) return '#f8fafc'
    return interpolateBrBG(normalize(weights.reduce((sum, value) => sum + value, 0) / weights.length, -0.4, 0.4))
  }

  const value = colorMode.value === 'logits' ? (node.logit ?? numberOutput(node.output)) : nodeRepresentativeValue(node)
  const [min, max] = layerRange(layer)
  if (layer.kind === 'dense' || colorMode.value === 'logits') return interpolateOranges(normalize(value, min, max))
  if (layer.kind === 'input') return interpolateGreys(normalize(value, min, max))
  return interpolateRdBu(1 - normalize(value, min, max))
}

function colorForValue(value: number, range = selectedLayerRange.value) {
  if (selectedLayer.value?.kind === 'input') return interpolateGreys(normalize(value, range[0], range[1]))
  return interpolateRdBu(1 - normalize(value, range[0], range[1]))
}

function layerRange(layer: CnnLayerSnapshot | undefined): [number, number] {
  const values = layer?.nodes.flatMap((node) => flattenOutput(node.output)) ?? []
  if (!values.length) return [0, 1]
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? [min - 1, max + 1] : [min, max]
}

function normalize(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return 0.5
  return Math.min(1, Math.max(0, (value - min) / Math.max(1e-8, max - min)))
}

function flattenOutput(output: number | number[][]) {
  return typeof output === 'number' ? [output] : output.flat()
}

function flattenWeight(weight: number | number[] | number[][] | undefined): number[] {
  if (typeof weight === 'number') return [weight]
  if (!Array.isArray(weight)) return []
  if (Array.isArray(weight[0])) return (weight as number[][]).flat()
  return weight as number[]
}

function numberOutput(output: number | number[][]) {
  return typeof output === 'number' ? output : 0
}

function nodeRepresentativeValue(node: CnnNodeSnapshot) {
  const values = flattenOutput(node.output)
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
}

function sampleMatrix(matrix: number[][] | undefined, maxRows: number, maxCols: number) {
  if (!matrix?.length || !matrix[0]?.length) return []
  const rowStep = Math.max(1, Math.floor(matrix.length / maxRows))
  const colStep = Math.max(1, Math.floor(matrix[0].length / maxCols))
  const rows: { value: number; row: number; col: number }[][] = []

  for (let row = 0; row < matrix.length; row += rowStep) {
    const cells: { value: number; row: number; col: number }[] = []
    for (let col = 0; col < matrix[row]!.length; col += colStep) {
      cells.push({ value: matrix[row]![col]!, row, col })
      if (cells.length >= maxCols) break
    }
    rows.push(cells)
    if (rows.length >= maxRows) break
  }

  return rows
}

function formatNumber(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return '0'
  return `${roundCnnValue(value, 4)}`
}

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`
}

function isMatrix(output: CnnNodeSnapshot['output'] | undefined): output is number[][] {
  return Array.isArray(output) && Array.isArray(output[0])
}

function createDefaultInputImage() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 96
  canvas.height = 96

  if (!context) return ''

  const gradient = context.createLinearGradient(0, 0, 96, 96)
  gradient.addColorStop(0, '#f97316')
  gradient.addColorStop(0.5, '#fef3c7')
  gradient.addColorStop(1, '#0f766e')
  context.fillStyle = gradient
  context.fillRect(0, 0, 96, 96)
  context.fillStyle = '#111827'
  context.fillRect(16, 58, 64, 10)
  context.fillStyle = '#2563eb'
  context.beginPath()
  context.arc(48, 38, 18, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 5
  context.strokeRect(22, 22, 52, 52)

  return canvas.toDataURL('image/png')
}
</script>

<template>
  <section class="cnn-explainer-lab" :data-status="status">
    <header class="cnn-explainer-lab__header">
      <div>
        <span>{{ copy.title }}</span>
        <strong>{{ sectionHint }}</strong>
      </div>
      <p class="cnn-explainer-lab__status" :class="`is-${status}`">{{ statusLabel }}</p>
    </header>

    <div class="cnn-explainer-lab__controls" aria-label="CNN explainer controls">
      <button type="button" class="action-button action-button--primary" @click="onUploadClick">
        {{ copy.upload }}
      </button>
      <input
        ref="fileInputRef"
        class="cnn-explainer-lab__file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="onFileChange"
      />
      <button type="button" class="action-button" :disabled="status !== 'ready' || reducedMotion" @click="togglePlayback">
        {{ isPlaying ? copy.pause : copy.play }}
      </button>
      <button type="button" class="action-button" :disabled="status !== 'ready'" @click="stepForward">
        {{ copy.step }}
      </button>
      <button type="button" class="action-button" :disabled="status !== 'ready'" @click="resetSelection">
        {{ copy.reset }}
      </button>

      <label class="cnn-explainer-lab__toggle">
        <input v-model="showDetails" type="checkbox" />
        <span>{{ copy.details }}</span>
      </label>

      <label class="cnn-explainer-lab__select">
        <span>{{ copy.color }}</span>
        <select v-model="colorMode">
          <option value="activation">{{ copy.activation }}</option>
          <option value="weights">{{ copy.weights }}</option>
          <option value="logits">{{ copy.logits }}</option>
        </select>
      </label>
    </div>

    <p class="cnn-explainer-lab__upload-hint">{{ copy.uploadHint }}</p>
    <p v-if="reducedMotion" class="cnn-explainer-lab__notice">{{ copy.reducedMotion }}</p>
    <p v-if="fileError" class="cnn-explainer-lab__notice is-error">{{ fileError }}</p>
    <p v-if="status === 'error'" class="cnn-explainer-lab__notice is-error">{{ statusMessage || copy.fallback }}</p>

    <div class="cnn-explainer-lab__workspace">
      <aside class="cnn-explainer-lab__side">
        <section class="cnn-explainer-lab__input">
          <span>{{ copy.input }}</span>
          <img v-if="selectedImageUrl" :src="selectedImageUrl" :alt="selectedImageName" />
          <strong>{{ selectedImageName || copy.defaultImage }}</strong>
        </section>

        <section class="cnn-score-panel">
          <span>{{ copy.score }}</span>
          <strong v-if="topPrediction">{{ topPrediction.label }} · {{ formatPercent(topPrediction.probability) }}</strong>
          <button
            v-for="score in sortedScores"
            :key="score.id"
            type="button"
            class="cnn-score-panel__row"
            :class="{ 'is-top': score.id === topPrediction?.id }"
            @click="selectScore(score)"
          >
            <span>{{ score.label }}</span>
            <em>{{ formatPercent(score.probability) }}</em>
            <i :style="{ width: formatPercent(score.probability) }" />
          </button>
        </section>
      </aside>

      <section class="cnn-explainer-lab__main">
        <div class="cnn-overview" role="region" :aria-label="copy.overview">
          <svg :viewBox="`0 0 ${svgWidth} 300`" role="img" :aria-label="copy.overview">
            <line
              v-for="layer in layers.slice(1)"
              :key="`edge-${layer.id}`"
              class="cnn-overview__edge"
              :x1="layerX(layer.index - 1) + 16"
              y1="150"
              :x2="layerX(layer.index) - 16"
              y2="150"
            />

            <g
              v-for="layer in layers"
              :key="layer.id"
              class="cnn-overview__layer"
              :class="{ 'is-selected': selectedLayerIndex === layer.index }"
            >
              <text class="cnn-overview__label" :x="layerX(layer.index)" y="24" text-anchor="middle">
                {{ layer.kind }}
              </text>
              <text class="cnn-overview__shape" :x="layerX(layer.index)" y="42" text-anchor="middle">
                {{ layer.outputShape.join('×') }}
              </text>
              <g
                v-for="(node, nodeDisplayIndex) in visibleNodes(layer)"
                :key="node.id"
                class="cnn-overview__node"
                :class="{ 'is-selected': isSelectedNode(layer, node) }"
                role="button"
                tabindex="0"
                :aria-label="`${layer.name} ${node.index}`"
                @click="selectLayer(layer.index, node.index)"
                @keydown.enter.prevent="selectLayer(layer.index, node.index)"
                @keydown.space.prevent="selectLayer(layer.index, node.index)"
              >
                <circle
                  :cx="layerX(layer.index)"
                  :cy="nodeY(nodeDisplayIndex, visibleNodes(layer).length)"
                  :r="nodeRadius(layer)"
                  :fill="colorForNode(layer, node)"
                />
                <text
                  v-if="layer.kind === 'dense'"
                  class="cnn-overview__node-label"
                  :x="layerX(layer.index) + 13"
                  :y="nodeY(nodeDisplayIndex, visibleNodes(layer).length) + 4"
                >
                  {{ nodeLabel(layer, node) }}
                </text>
              </g>
              <text v-if="hiddenNodeCount(layer)" class="cnn-overview__more" :x="layerX(layer.index)" y="272" text-anchor="middle">
                +{{ hiddenNodeCount(layer) }}
              </text>
            </g>
          </svg>
        </div>

        <section v-if="selectedLayer" class="cnn-layer-readout">
          <div>
            <span>{{ copy.selected }}</span>
            <strong>{{ selectedLayer.name }} · {{ selectedLayer.kind }}</strong>
          </div>
          <p>{{ layerSummary }}</p>
        </section>

        <section v-if="showDetails" class="cnn-detail-panel">
          <div class="cnn-detail-panel__header">
            <div>
              <span>{{ copy.operation }}</span>
              <strong>{{ selectedNode ? `${selectedNode.layerName}[${selectedNode.index}]` : copy.fallback }}</strong>
            </div>
            <div v-if="hasSpatialSelection" class="cnn-detail-panel__sliders">
              <label>
                <span>{{ copy.row }} {{ selectedRow }}</span>
                <input v-model.number="selectedRow" type="range" min="0" :max="rowMax" />
              </label>
              <label>
                <span>{{ copy.col }} {{ selectedCol }}</span>
                <input v-model.number="selectedCol" type="range" min="0" :max="colMax" />
              </label>
            </div>
          </div>

          <div class="cnn-detail-panel__body">
            <div class="cnn-activation-map">
              <span>{{ copy.map }}</span>
              <div v-if="sampledActivationGrid.length" class="cnn-activation-map__grid">
                <button
                  v-for="row in sampledActivationGrid"
                  :key="`row-${row[0]?.row}`"
                  type="button"
                  class="cnn-activation-map__row"
                  tabindex="-1"
                >
                  <i
                    v-for="cell in row"
                    :key="`${cell.row}-${cell.col}`"
                    :class="{ 'is-selected': cell.row === selectedRow && cell.col === selectedCol }"
                    :style="{ background: colorForValue(cell.value) }"
                    @click="selectedRow = cell.row; selectedCol = cell.col"
                  />
                </button>
              </div>
              <p v-else>{{ layerSummary }}</p>
            </div>

            <article class="cnn-formula-view">
              <MarkdownMathContent :source="formulaMarkdown" />

              <div v-if="selectedDetail?.kind === 'conv'" class="cnn-conv-detail">
                <article
                  v-for="contribution in selectedDetail.channelContributions?.slice(0, 3)"
                  :key="contribution.channelIndex"
                >
                  <span>{{ copy.channel }} {{ contribution.channelIndex }}</span>
                  <div class="cnn-conv-detail__matrix">
                    <strong>{{ copy.patch }}</strong>
                    <code>{{ contribution.patch.map((row) => row.map(formatNumber).join(' ')).join(' / ') }}</code>
                    <strong>{{ copy.kernel }}</strong>
                    <code>{{ contribution.kernel.map((row) => row.map(formatNumber).join(' ')).join(' / ') }}</code>
                    <strong>{{ copy.product }}</strong>
                    <code>{{ formatNumber(contribution.sum) }}</code>
                  </div>
                </article>
                <p>
                  {{ copy.bias }} {{ formatNumber(selectedDetail.bias) }} ·
                  {{ copy.weightedSum }} {{ formatNumber(selectedDetail.weightedSum) }}
                </p>
              </div>

              <div v-else-if="selectedDetail?.kind === 'pool'" class="cnn-pool-detail">
                <span>{{ copy.source }} {{ selectedDetail.poolMaxPosition?.row }}, {{ selectedDetail.poolMaxPosition?.col }}</span>
                <code>{{ selectedDetail.poolWindow?.map((row) => row.map(formatNumber).join(' ')).join(' / ') }}</code>
              </div>

              <div v-else-if="selectedDetail?.kind === 'dense'" class="cnn-softmax-detail">
                <article v-for="score in scores" :key="`softmax-${score.id}`">
                  <span>{{ score.label }}</span>
                  <strong>{{ formatNumber(score.logit) }}</strong>
                  <em>{{ formatPercent(score.probability) }}</em>
                </article>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  </section>
</template>
