<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CnnLayerSnapshot, CnnNodeSnapshot } from '../../utils/cnnExplainer'

interface PreviewCell {
  id: string
  x: number
  y: number
  size: number
  value: number
}

interface SemanticStage {
  id: string
  label: string
  kind: string
  layerIndices: number[]
  representativeIndex: number
  shape: number[]
  parameterCount: number
  zone: 'backbone' | 'head'
  previewLayer: CnnLayerSnapshot
  previewNodes: CnnNodeSnapshot[]
  previewMin: number
  previewMax: number
}

const props = defineProps<{
  layers: CnnLayerSnapshot[]
  selectedLayerIndex: number
  sectionId: string
}>()

const emit = defineEmits<{
  select: [layerIndex: number]
}>()

const { locale } = useI18n()
const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: '真实网络结构与激活流',
        hint: '每组小图都来自当前图片的真实前向激活；选择阶段会同步下方检查器。',
        input: '输入',
        conv1: '卷积块 1',
        pool1: '池化 1',
        conv2: '卷积块 2',
        pool2: '池化 2',
        head: '分类头',
        backbone: '可冻结 backbone',
        classifier: '可替换 classifier head',
        params: '参数',
        noParams: '无可学习参数',
        maps: '张真实激活图',
        channels: '个输入通道',
        classes: '个类别分数',
      }
    : {
        title: 'Live network structure and activations',
        hint: 'Every tile is a real forward activation for the current image; choosing a stage syncs the inspector.',
        input: 'Input',
        conv1: 'Conv block 1',
        pool1: 'Pooling 1',
        conv2: 'Conv block 2',
        pool2: 'Pooling 2',
        head: 'Classifier',
        backbone: 'Freezable backbone',
        classifier: 'Replaceable classifier head',
        params: 'parameters',
        noParams: 'No trainable parameters',
        maps: 'real activation maps',
        channels: 'input channels',
        classes: 'class scores',
      },
)

function layerByKind(kind: CnnLayerSnapshot['kind'], occurrence = 0) {
  return props.layers.filter((layer) => layer.kind === kind)[occurrence]
}

function adjacentRelu(layer?: CnnLayerSnapshot) {
  if (!layer) return undefined
  const next = props.layers[layer.index + 1]
  return next?.kind === 'relu' ? next : undefined
}

function makeStage(
  id: string,
  label: string,
  kind: string,
  members: Array<CnnLayerSnapshot | undefined>,
  zone: SemanticStage['zone'] = 'backbone',
): SemanticStage | undefined {
  const layers = members.filter((layer): layer is CnnLayerSnapshot => Boolean(layer))
  if (!layers.length) return undefined
  const last = layers.at(-1) ?? layers[0]
  const previewLayer = [...layers].reverse().find((layer) => layer.nodes.length) ?? last
  const previewNodes = representativeNodes(previewLayer)
  const previewValues = previewNodes.flatMap((node) => valuesFromNode(node))
  const previewMin = previewValues.length ? Math.min(...previewValues) : 0
  const previewMax = previewValues.length ? Math.max(...previewValues) : 1
  return {
    id,
    label,
    kind,
    layerIndices: layers.map((layer) => layer.index),
    representativeIndex: layers[0].index,
    shape: last.outputShape,
    parameterCount: layers.reduce((sum, layer) => sum + layer.parameterCount, 0),
    zone,
    previewLayer,
    previewNodes,
    previewMin,
    previewMax,
  }
}

function isMatrixOutput(output: CnnNodeSnapshot['output']): output is number[][] {
  return Array.isArray(output) && Array.isArray(output[0])
}

function representativeNodes(layer: CnnLayerSnapshot) {
  const count = layer.kind === 'dense' ? 6 : 3
  if (layer.nodes.length <= count) return layer.nodes
  const indices = Array.from({ length: count }, (_, index) =>
    Math.round((index * (layer.nodes.length - 1)) / Math.max(1, count - 1)),
  )
  return indices.map((index) => layer.nodes[index]!).filter(Boolean)
}

function valuesFromNode(node: CnnNodeSnapshot) {
  if (!isMatrixOutput(node.output)) return [Number(node.output) || 0]
  const rowStep = Math.max(1, Math.floor(node.output.length / 12))
  const colStep = Math.max(1, Math.floor((node.output[0]?.length ?? 1) / 12))
  const values: number[] = []
  for (let row = 0; row < node.output.length; row += rowStep) {
    for (let col = 0; col < (node.output[row]?.length ?? 0); col += colStep) {
      values.push(node.output[row]?.[col] ?? 0)
    }
  }
  return values
}

function previewCells(node: CnnNodeSnapshot): PreviewCell[] {
  if (!isMatrixOutput(node.output) || !node.output.length) return []
  const target = 8
  const rows = node.output.length
  const cols = node.output[0]?.length ?? 1
  const cells: PreviewCell[] = []
  for (let row = 0; row < target; row += 1) {
    for (let col = 0; col < target; col += 1) {
      const sourceRow = Math.min(rows - 1, Math.floor((row / target) * rows))
      const sourceCol = Math.min(cols - 1, Math.floor((col / target) * cols))
      cells.push({
        id: `${node.id}-${row}-${col}`,
        x: col * (56 / target),
        y: row * (56 / target),
        size: 56 / target + 0.15,
        value: node.output[sourceRow]?.[sourceCol] ?? 0,
      })
    }
  }
  return cells
}

function normalizedPreviewValue(stage: SemanticStage, value: number) {
  const span = stage.previewMax - stage.previewMin
  if (!Number.isFinite(value) || !Number.isFinite(span) || span === 0) return 0.5
  return Math.min(1, Math.max(0, (value - stage.previewMin) / span))
}

function previewColor(stage: SemanticStage, node: CnnNodeSnapshot, value: number) {
  const normalized = normalizedPreviewValue(stage, value)
  if (stage.id === 'input') {
    const low = 18
    const high = Math.round(42 + normalized * 213)
    if (node.index === 0) return `rgb(${high}, ${low}, ${low})`
    if (node.index === 1) return `rgb(${low}, ${high}, ${low})`
    return `rgb(${low}, ${low}, ${high})`
  }
  const red = Math.round(246 - normalized * 176)
  const green = Math.round(248 - normalized * 94)
  const blue = Math.round(251 - normalized * 24)
  return `rgb(${red}, ${green}, ${blue})`
}

function denseBarHeight(stage: SemanticStage, node: CnnNodeSnapshot) {
  return `${Math.round(18 + normalizedPreviewValue(stage, Number(node.output) || 0) * 70)}%`
}

function stageMapLabel(stage: SemanticStage) {
  if (stage.id === 'input') return `${stage.previewLayer.nodes.length} ${copy.value.channels}`
  if (stage.id === 'classifier') return `${stage.previewLayer.nodes.length} ${copy.value.classes}`
  return `${stage.previewLayer.nodes.length} ${copy.value.maps}`
}

const stages = computed<SemanticStage[]>(() => {
  const input = layerByKind('input')
  const conv1a = layerByKind('conv', 0)
  const conv1b = layerByKind('conv', 1)
  const pool1 = layerByKind('pool', 0)
  const conv2a = layerByKind('conv', 2)
  const conv2b = layerByKind('conv', 3)
  const pool2 = layerByKind('pool', 1)
  const flatten = layerByKind('flatten')
  const dense = layerByKind('dense')

  return [
    makeStage('input', copy.value.input, 'RGB', [input]),
    makeStage('conv-block-1', copy.value.conv1, '2 × Conv + ReLU', [conv1a, adjacentRelu(conv1a), conv1b, adjacentRelu(conv1b)]),
    makeStage('pool-1', copy.value.pool1, 'MaxPool', [pool1]),
    makeStage('conv-block-2', copy.value.conv2, '2 × Conv + ReLU', [conv2a, adjacentRelu(conv2a), conv2b, adjacentRelu(conv2b)]),
    makeStage('pool-2', copy.value.pool2, 'MaxPool', [pool2]),
    makeStage('classifier', copy.value.head, 'Flatten + Softmax', [flatten, dense], 'head'),
  ].filter((stage): stage is SemanticStage => Boolean(stage))
})

function isSelected(stage: SemanticStage) {
  return stage.layerIndices.includes(props.selectedLayerIndex)
}

function stageParameterLabel(stage: SemanticStage) {
  return stage.parameterCount > 0
    ? `${stage.parameterCount.toLocaleString()} ${copy.value.params}`
    : copy.value.noParams
}
</script>

<template>
  <section class="cnn-guided-track" :aria-label="copy.title">
    <header>
      <div>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.hint }}</strong>
      </div>
      <div v-if="sectionId === 'transfer-learning-review'" class="cnn-guided-track__zones">
        <span>{{ copy.backbone }}</span>
        <span>{{ copy.classifier }}</span>
      </div>
    </header>

    <div class="cnn-guided-track__scroll">
      <ol>
        <li v-for="(stage, index) in stages" :key="stage.id" :class="[`is-${stage.zone}`, { 'is-selected': isSelected(stage) }]">
          <button
            type="button"
            :aria-current="isSelected(stage) ? 'step' : undefined"
            @click="emit('select', stage.representativeIndex)"
          >
            <div class="cnn-guided-track__stage-heading">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <strong>{{ stage.label }}</strong>
                <em>{{ stage.kind }}</em>
              </div>
            </div>

            <div
              v-if="stage.previewLayer.kind !== 'dense'"
              class="cnn-guided-track__feature-stack"
              aria-hidden="true"
            >
              <svg
                v-for="(node, nodeIndex) in stage.previewNodes"
                :key="node.id"
                viewBox="0 0 56 56"
                :style="{ '--map-index': nodeIndex }"
              >
                <rect
                  v-for="cell in previewCells(node)"
                  :key="cell.id"
                  :x="cell.x"
                  :y="cell.y"
                  :width="cell.size"
                  :height="cell.size"
                  :fill="previewColor(stage, node, cell.value)"
                />
              </svg>
            </div>
            <div v-else class="cnn-guided-track__logits" aria-hidden="true">
              <i
                v-for="node in stage.previewNodes"
                :key="node.id"
                :style="{ height: denseBarHeight(stage, node) }"
              />
            </div>

            <small class="cnn-guided-track__map-count">{{ stageMapLabel(stage) }}</small>
            <div class="cnn-guided-track__stage-meta">
              <b>{{ stage.shape.join(' × ') }}</b>
              <small>{{ stageParameterLabel(stage) }}</small>
            </div>
          </button>
          <i v-if="index < stages.length - 1" aria-hidden="true">→</i>
        </li>
      </ol>
    </div>
  </section>
</template>
