<script setup lang="ts">
import { computed } from 'vue'
import { curveBasis, line, scalePoint } from 'd3'
import type { MlpLinkSnapshot, MlpNodeSnapshot, MlpPlaygroundSnapshot, MlpPlaygroundState } from '../types/ml'
import { round } from '../utils/math'
import MlpNodeHeatmap from './MlpNodeHeatmap.vue'

const props = defineProps<{
  snapshot: MlpPlaygroundSnapshot
  previousSnapshot?: MlpPlaygroundSnapshot
  state: MlpPlaygroundState
}>()

type PositionedNode = MlpNodeSnapshot & {
  x: number
  y: number
}

const networkWidth = 760

const networkHeight = computed(() => {
  const maxNodes = Math.max(...props.snapshot.layers.map((layer) => layer.length), 1)
  return Math.max(340, maxNodes * 58 + 72)
})

const positionedLayers = computed(() => {
  const layerIndexes = props.snapshot.layers.map((_layer, index) => index)
  const xScale = scalePoint<number>()
    .domain(layerIndexes)
    .range([46, networkWidth - 46])
    .padding(0.25)

  return props.snapshot.layers.map((layer, layerIndex) => {
    const yScale = scalePoint<number>()
      .domain(layer.map((_node, nodeIndex) => nodeIndex))
      .range([46, networkHeight.value - 58])
      .padding(layer.length === 1 ? 0.5 : 0.16)

    return layer.map<PositionedNode>((node, nodeIndex) => ({
      ...node,
      x: xScale(layerIndex) ?? 0,
      y: yScale(nodeIndex) ?? networkHeight.value / 2,
    }))
  })
})

const positionedNodes = computed(() => positionedLayers.value.flat())
const positionedNodeMap = computed(() => new Map(positionedNodes.value.map((node) => [node.id, node])))
const previousLinkMap = computed(
  () => new Map((props.previousSnapshot?.links ?? []).map((link) => [link.id, link.weight])),
)

const linkLine = line<{ x: number; y: number }>()
  .x((point) => point.x)
  .y((point) => point.y)
  .curve(curveBasis)

function linkDelta(link: MlpLinkSnapshot) {
  return Math.abs(link.weight - (previousLinkMap.value.get(link.id) ?? link.weight))
}

const linkPaths = computed(() =>
  props.snapshot.links.flatMap((link) => {
    const source = positionedNodeMap.value.get(link.sourceId)
    const target = positionedNodeMap.value.get(link.targetId)
    if (!source || !target) return []

    const bend = Math.max(36, Math.abs(target.x - source.x) * 0.34)
    const path = linkLine([
      { x: source.x + 22, y: source.y },
      { x: source.x + bend, y: source.y },
      { x: target.x - bend, y: target.y },
      { x: target.x - 22, y: target.y },
    ])

    return [{
      ...link,
      path: path ?? '',
      width: Math.min(6.2, 0.7 + Math.abs(link.weight) * 1.85),
      color: link.weight >= 0 ? '#256bd9' : '#e26d3d',
      opacity: link.isDead ? 0.08 : 0.18 + Math.min(0.52, Math.abs(link.weight) / 2.6),
      pulse: Math.min(1, linkDelta(link) * 12),
    }]
  }),
)

const layerLabels = computed(() =>
  props.snapshot.layers.map((layer, index) => ({
    id: `layer-${index}`,
    x: positionedLayers.value[index]?.[0]?.x ?? 0,
    label:
      index === 0
        ? 'input'
        : index === props.snapshot.layers.length - 1
          ? 'output'
          : `hidden ${index}`,
    count: layer.length,
  })),
)

function colorForValue(rawValue: number) {
  const value = props.state.discretize ? (rawValue >= 0 ? 1 : -1) : Math.max(-1, Math.min(1, rawValue))
  const t = (value + 1) / 2
  const red = Math.round(241 - t * 176)
  const green = Math.round(130 + t * 58)
  const blue = Math.round(74 + t * 145)
  return `rgb(${red}, ${green}, ${blue})`
}
</script>

<template>
  <div
    class="mlp-network"
    :style="{ '--network-height': `${networkHeight}px` }"
    data-testid="mlp-network-graph"
  >
    <svg
      class="mlp-network__links"
      :viewBox="`0 0 ${networkWidth} ${networkHeight}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g class="mlp-network__columns">
        <line
          v-for="layer in layerLabels"
          :key="layer.id"
          :x1="layer.x"
          :x2="layer.x"
          y1="24"
          :y2="networkHeight - 28"
        />
      </g>
      <path
        v-for="link in linkPaths"
        :key="link.id"
        :d="link.path"
        :stroke="link.color"
        :stroke-width="link.width"
        :opacity="link.opacity"
        class="mlp-network__link"
        :style="{ '--link-pulse': link.pulse }"
      />
    </svg>

    <div
      v-for="layer in layerLabels"
      :key="`${layer.id}-label`"
      class="mlp-network__layer-label"
      :style="{ left: `${(layer.x / networkWidth) * 100}%` }"
    >
      <span>{{ layer.label }}</span>
      <strong>{{ layer.count }}</strong>
    </div>

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
</template>
