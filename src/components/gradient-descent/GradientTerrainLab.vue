<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GradientDescentInteractionPayload } from '../../types/gradientDescentLesson'
import GradientLabFrame from './GradientLabFrame.vue'

type Payload = Extract<GradientDescentInteractionPayload, { scene: 'saddle-local-minima' }>
const props = defineProps<{ payload: Payload }>()
const { locale } = useI18n()
const terrainId = ref('tilted-ravine')
const point = ref({ x: -1.8, y: 1.8 })
const history = ref<Array<{ x: number; y: number }>>([])
const playing = ref(false)
let timer: number | undefined
const zh = computed(() => locale.value === 'zh-CN')
const terrain = computed(() => props.payload.terrains.find((item) => item.id === terrainId.value)!)
const xToSvg = (value: number) => 45 + ((value - terrain.value.domain[0]) / (terrain.value.domain[1] - terrain.value.domain[0])) * 420
const yToSvg = (value: number) => 245 - ((value - terrain.value.domain[2]) / (terrain.value.domain[3] - terrain.value.domain[2])) * 205
function indexFor(values: number[], value: number) { return Math.max(0, Math.min(values.length - 1, Math.round(((value - values[0]) / (values.at(-1)! - values[0])) * (values.length - 1)))) }
const indices = computed(() => ({ x: indexFor(terrain.value.x, point.value.x), y: indexFor(terrain.value.y, point.value.y) }))
const loss = computed(() => terrain.value.loss[indices.value.y][indices.value.x])
const gradient = computed(() => {
  const xi = indices.value.x; const yi = indices.value.y
  const left = Math.max(0, xi - 1); const right = Math.min(terrain.value.x.length - 1, xi + 1)
  const down = Math.max(0, yi - 1); const up = Math.min(terrain.value.y.length - 1, yi + 1)
  return {
    x: (terrain.value.loss[yi][right] - terrain.value.loss[yi][left]) / Math.max(terrain.value.x[right] - terrain.value.x[left], 1e-9),
    y: (terrain.value.loss[up][xi] - terrain.value.loss[down][xi]) / Math.max(terrain.value.y[up] - terrain.value.y[down], 1e-9),
  }
})
const cells = computed(() => {
  const all = terrain.value.loss.flat(); const low = Math.min(...all); const high = Math.max(...all)
  const width = 420 / terrain.value.x.length; const height = 205 / terrain.value.y.length
  return terrain.value.loss.flatMap((row, yi) => row.map((value, xi) => ({ id: `${yi}-${xi}`, x: 45 + xi * width, y: 40 + (terrain.value.y.length - yi - 1) * height, width: width + .5, height: height + .5, fill: `hsl(${205 - ((value-low)/Math.max(high-low,1e-9))*170} 68% ${84-((value-low)/Math.max(high-low,1e-9))*34}%)` })))
})
const pathPoints = computed(() => history.value.concat(point.value).map((item) => `${xToSvg(item.x)},${yToSvg(item.y)}`).join(' '))
function stop() { playing.value = false; if (timer) window.clearInterval(timer); timer = undefined }
function step() {
  const norm = Math.hypot(gradient.value.x, gradient.value.y)
  if (norm < 1e-5) { stop(); return }
  history.value.push({ ...point.value })
  const distance = (terrain.value.domain[1] - terrain.value.domain[0]) * 0.035
  point.value = {
    x: Math.max(terrain.value.domain[0], Math.min(terrain.value.domain[1], point.value.x - distance * gradient.value.x / norm)),
    y: Math.max(terrain.value.domain[2], Math.min(terrain.value.domain[3], point.value.y - distance * gradient.value.y / norm)),
  }
  if (history.value.length >= 60) stop()
}
function toggle() { if (playing.value) { stop(); return }; if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { step(); return }; playing.value = true; timer = window.setInterval(step, 260) }
function reset() { stop(); const domain = terrain.value.domain; point.value = { x: domain[0] * .6, y: domain[3] * .6 }; history.value = [] }
watch(terrainId, reset)
onBeforeUnmount(stop)
</script>

<template>
  <GradientLabFrame :title="zh ? '局部方向与全局地形并不等价' : 'Local direction is not the global landscape'" :description="zh ? '探针只使用当前位置附近的有限差分方向。切换地形与起点，观察小梯度可能对应谷底、鞍点或平坦区域。' : 'The probe uses only a local finite-difference direction. Change terrain and start to see how a small gradient can mean a basin, saddle, or flat region.'" :status="`Notebook · ${payload.notebookCellId}`">
    <template #controls><div class="gradient-lab-controls"><label>{{ zh ? '地形' : 'Terrain' }}<select v-model="terrainId"><option v-for="item in payload.terrains" :key="item.id" :value="item.id">{{ item.id }}</option></select></label><div class="gradient-lab-coordinate"><label>x <output>{{ point.x.toFixed(2) }}</output><input v-model.number="point.x" type="range" :min="terrain.domain[0]" :max="terrain.domain[1]" step="0.05" @input="history=[]" /></label><label>y <output>{{ point.y.toFixed(2) }}</output><input v-model.number="point.y" type="range" :min="terrain.domain[2]" :max="terrain.domain[3]" step="0.05" @input="history=[]" /></label></div><div class="gradient-lab-actions"><button type="button" @click="toggle">{{ playing ? (zh ? '暂停' : 'Pause') : (zh ? '播放' : 'Play') }}</button><button type="button" @click="step">{{ zh ? '单步' : 'Step' }}</button><button type="button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button></div></div></template>
    <figure class="gd-terrain-map"><figcaption>{{ zh ? '颜色表示损失高度；白线是局部下降轨迹' : 'Color shows loss height; the white line is the local descent path' }}</figcaption><svg viewBox="0 0 510 285" role="img" :aria-label="zh ? `当前 ${terrainId} 地形和下降轨迹` : `Current ${terrainId} terrain and descent path`"><rect v-for="cell in cells" :key="cell.id" v-bind="cell"/><polyline :points="pathPoints" class="gd-terrain-path"/><circle :cx="xToSvg(point.x)" :cy="yToSvg(point.y)" r="9" class="gd-current"/><text x="435" y="272">x</text><text x="18" y="34">y</text></svg></figure>
    <template #readout><article><span>{{ zh ? '地形' : 'Terrain' }}</span><strong>{{ terrainId }}</strong></article><article><span>{{ zh ? '局部损失' : 'Local loss' }}</span><strong>{{ loss.toFixed(5) }}</strong></article><article><span>|∇L|</span><strong>{{ Math.hypot(gradient.x, gradient.y).toFixed(5) }}</strong></article><article><span>{{ zh ? '更新次数' : 'Updates' }}</span><strong>{{ history.length }}</strong></article></template>
    <template #fallback-label>{{ zh ? '查看当前探针数据' : 'View probe data' }}</template><template #fallback><p>{{ terrainId }} · x={{ point.x.toFixed(3) }}, y={{ point.y.toFixed(3) }}, loss≈{{ loss.toFixed(6) }}, gradient≈({{ gradient.x.toFixed(5) }}, {{ gradient.y.toFixed(5) }}).</p></template>
  </GradientLabFrame>
</template>
