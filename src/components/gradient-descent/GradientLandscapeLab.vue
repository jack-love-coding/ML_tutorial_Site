<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GradientDescentInteractionPayload } from '../../types/gradientDescentLesson'
import GradientLabFrame from './GradientLabFrame.vue'

type Payload = Extract<GradientDescentInteractionPayload, { scene: 'landscape' }>
const props = defineProps<{ payload: Payload }>()
const { locale } = useI18n()
const canvas = ref<HTMLCanvasElement>()
const contour = ref<SVGSVGElement>()
const weight = ref(props.payload.start.weight)
const bias = ref(props.payload.start.bias)
const zh = computed(() => locale.value === 'zh-CN')
const flatLoss = computed(() => props.payload.lossGrid.flat())
const minLoss = computed(() => Math.min(...flatLoss.value))
const maxLoss = computed(() => Math.max(...flatLoss.value))
const wMin = props.payload.weightValues[0]
const wMax = props.payload.weightValues.at(-1)!
const bMin = props.payload.biasValues[0]
const bMax = props.payload.biasValues.at(-1)!
const wToX = (value: number) => 45 + ((value - wMin) / (wMax - wMin)) * 420
const bToY = (value: number) => 245 - ((value - bMin) / (bMax - bMin)) * 205
const currentLoss = computed(() => {
  const wIndex = Math.round(((weight.value - wMin) / (wMax - wMin)) * (props.payload.weightValues.length - 1))
  const bIndex = Math.round(((bias.value - bMin) / (bMax - bMin)) * (props.payload.biasValues.length - 1))
  return props.payload.lossGrid[Math.max(0, Math.min(bIndex, props.payload.lossGrid.length - 1))][Math.max(0, Math.min(wIndex, props.payload.weightValues.length - 1))]
})
const cells = computed(() => {
  const width = 420 / props.payload.weightValues.length
  const height = 205 / props.payload.biasValues.length
  return props.payload.lossGrid.flatMap((row, rowIndex) => row.map((loss, columnIndex) => ({
    id: `${rowIndex}-${columnIndex}`,
    x: 45 + columnIndex * width,
    y: 40 + (props.payload.biasValues.length - rowIndex - 1) * height,
    width: width + 0.5,
    height: height + 0.5,
    fill: `hsl(${210 - ((loss - minLoss.value) / (maxLoss.value - minLoss.value)) * 175} 72% ${82 - ((loss - minLoss.value) / (maxLoss.value - minLoss.value)) * 30}%)`,
  })))
})

let resizeObserver: ResizeObserver | undefined
function drawSurface() {
  const target = canvas.value
  if (!target) return
  const width = Math.max(320, target.clientWidth)
  const height = 285
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  target.width = width * dpr; target.height = height * dpr
  const context = target.getContext('2d')
  if (!context) return
  context.scale(dpr, dpr); context.clearRect(0, 0, width, height)
  context.fillStyle = '#f7faf9'; context.fillRect(0, 0, width, height)
  const rows = props.payload.lossGrid
  const rowStep = 4; const columnStep = 4
  const logMin = Math.log1p(minLoss.value); const logMax = Math.log1p(maxLoss.value)
  const project = (column: number, row: number, loss: number) => {
    const u = column / (props.payload.weightValues.length - 1) - 0.5
    const v = row / (props.payload.biasValues.length - 1) - 0.5
    const z = (Math.log1p(loss) - logMin) / Math.max(logMax - logMin, 1e-6)
    return { x: width / 2 + (u - v) * width * 0.42, y: height * 0.8 + (u + v) * height * 0.22 - z * height * 0.58 }
  }
  context.lineWidth = 1
  for (let row = 0; row < rows.length; row += rowStep) {
    context.beginPath()
    for (let column = 0; column < rows[row].length; column += 1) {
      const point = project(column, row, rows[row][column])
      column ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)
    }
    context.strokeStyle = 'rgba(36, 104, 118, .3)'; context.stroke()
  }
  for (let column = 0; column < rows[0].length; column += columnStep) {
    context.beginPath()
    for (let row = 0; row < rows.length; row += 1) {
      const point = project(column, row, rows[row][column])
      row ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)
    }
    context.strokeStyle = 'rgba(219, 108, 58, .25)'; context.stroke()
  }
}
function updateFromPointer(event: PointerEvent) {
  if (!contour.value) return
  const rect = contour.value.getBoundingClientRect()
  const localX = Math.max(45, Math.min(465, ((event.clientX - rect.left) / rect.width) * 510))
  const localY = Math.max(40, Math.min(245, ((event.clientY - rect.top) / rect.height) * 285))
  weight.value = wMin + ((localX - 45) / 420) * (wMax - wMin)
  bias.value = bMin + ((245 - localY) / 205) * (bMax - bMin)
}
function onPointerDown(event: PointerEvent) { contour.value?.setPointerCapture(event.pointerId); updateFromPointer(event) }
function onKeydown(event: KeyboardEvent) {
  const stepW = 0.1; const stepB = 0.25
  if (event.key === 'ArrowLeft') weight.value = Math.max(wMin, weight.value - stepW)
  else if (event.key === 'ArrowRight') weight.value = Math.min(wMax, weight.value + stepW)
  else if (event.key === 'ArrowDown') bias.value = Math.max(bMin, bias.value - stepB)
  else if (event.key === 'ArrowUp') bias.value = Math.min(bMax, bias.value + stepB)
  else return
  event.preventDefault()
}
function reset() { weight.value = props.payload.start.weight; bias.value = props.payload.start.bias }
onMounted(async () => { await nextTick(); drawSurface(); if (canvas.value) { resizeObserver = new ResizeObserver(drawSurface); resizeObserver.observe(canvas.value) } })
onBeforeUnmount(() => resizeObserver?.disconnect())
watch(() => props.payload, drawSurface)
</script>

<template>
  <GradientLabFrame :title="zh ? '同一损失的曲面与等高线' : 'One loss, two views'" :description="zh ? '曲面负责呈现高度，等高线负责呈现方向。拖动参数点，把两个视角对应起来。' : 'The surface shows height; the contour map shows direction. Drag the parameter point to connect both views.'" :status="`Notebook · ${payload.notebookCellId}`">
    <template #controls><div class="gradient-lab-controls"><label>w <output>{{ weight.toFixed(2) }}</output><input v-model.number="weight" type="range" :min="wMin" :max="wMax" step="0.1" /></label><label>b <output>{{ bias.toFixed(2) }}</output><input v-model.number="bias" type="range" :min="bMin" :max="bMax" step="0.25" /></label><button type="button" @click="reset">{{ zh ? '恢复起点' : 'Reset start' }}</button></div></template>
    <div class="gradient-lab-grid"><figure><figcaption>{{ zh ? '只读 3D 曲面：损失高度' : 'Read-only 3D surface: loss height' }}</figcaption><canvas ref="canvas" class="gd-surface-canvas" role="img" :aria-label="zh ? '斜率和截距构成的三维损失曲面' : 'Three-dimensional loss surface over slope and intercept'" /></figure><figure><figcaption>{{ zh ? '可操作 2D 等高地图' : 'Interactive 2D contour map' }}</figcaption><svg ref="contour" viewBox="0 0 510 285" role="application" tabindex="0" :aria-label="zh ? '可拖动的参数损失地图，方向键也可移动' : 'Draggable parameter loss map; arrow keys also move the point'" @pointerdown="onPointerDown" @pointermove="(event) => event.buttons === 1 && updateFromPointer(event)" @keydown="onKeydown"><rect v-for="cell in cells" :key="cell.id" v-bind="cell"/><circle :cx="wToX(weight)" :cy="bToY(bias)" r="9" class="gd-current"/><circle :cx="wToX(payload.optimum.weight)" :cy="bToY(payload.optimum.bias)" r="6" class="gd-optimum"/><text x="440" y="272">w</text><text x="15" y="35">b</text></svg></figure></div>
    <template #readout><article><span>w</span><strong>{{ weight.toFixed(3) }}</strong></article><article><span>b</span><strong>{{ bias.toFixed(3) }}</strong></article><article><span>MSE</span><strong>{{ currentLoss.toFixed(4) }}</strong></article><article><span>{{ zh ? '精确参考解' : 'Exact reference' }}</span><strong>({{ payload.optimum.weight }}, {{ payload.optimum.bias }})</strong></article></template>
    <template #fallback-label>{{ zh ? '查看当前参数文字版' : 'View current values' }}</template><template #fallback><p>w={{ weight.toFixed(3) }}, b={{ bias.toFixed(3) }}, MSE≈{{ currentLoss.toFixed(6) }}. {{ zh ? '精确最小二乘 MSE' : 'Exact least-squares MSE' }}={{ payload.optimum.mse }}.</p></template>
  </GradientLabFrame>
</template>
