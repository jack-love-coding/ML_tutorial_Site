<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CnnLayerSnapshot } from '../../utils/cnnExplainer'

interface SemanticStage {
  id: string
  label: string
  kind: string
  layerIndices: number[]
  representativeIndex: number
  shape: number[]
  parameterCount: number
  zone: 'backbone' | 'head'
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
        title: '一条架构主线',
        hint: '选择任一阶段，下方只展开这一个检查器。',
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
      }
    : {
        title: 'One architecture path',
        hint: 'Choose a stage to open only one inspector below.',
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
  return {
    id,
    label,
    kind,
    layerIndices: layers.map((layer) => layer.index),
    representativeIndex: layers[0].index,
    shape: last.outputShape,
    parameterCount: layers.reduce((sum, layer) => sum + layer.parameterCount, 0),
    zone,
  }
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
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ stage.label }}</strong>
            <em>{{ stage.kind }}</em>
            <b>{{ stage.shape.join(' × ') }}</b>
            <small>{{ stageParameterLabel(stage) }}</small>
          </button>
          <i v-if="index < stages.length - 1" aria-hidden="true">→</i>
        </li>
      </ol>
    </div>
  </section>
</template>
