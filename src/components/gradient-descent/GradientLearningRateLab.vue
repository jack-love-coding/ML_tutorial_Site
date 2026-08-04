<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GradientDescentInteractionPayload } from '../../types/gradientDescentLesson'
import GradientLabFrame from './GradientLabFrame.vue'

type Payload = Extract<GradientDescentInteractionPayload, { scene: 'learning-rate' }>
const props = defineProps<{ payload: Payload }>()
const { locale } = useI18n()
const scale = ref<'raw' | 'standardized'>('raw')
const pathId = ref<'slow' | 'stable' | 'oscillating' | 'divergent'>('stable')
const stepIndex = ref(0)
const playing = ref(false)
let timer: number | undefined
const zh = computed(() => locale.value === 'zh-CN')
const path = computed(() => props.payload.paths.find((item) => item.scale === scale.value && item.id === pathId.value)!)
const frame = computed(() => path.value.trajectory.updates[Math.min(stepIndex.value, path.value.trajectory.updates.length - 1)])
const visible = computed(() => path.value.trajectory.updates.slice(0, stepIndex.value + 1))
const values = computed(() => path.value.trajectory.updates.map((item) => Math.log10(Math.max(item.fullMse, 1e-12))))
const minLog = computed(() => Math.min(...values.value)); const maxLog = computed(() => Math.max(...values.value))
const points = computed(() => visible.value.map((item, index) => {
  const x = 45 + (index / Math.max(path.value.trajectory.updates.length - 1, 1)) * 420
  const log = Math.log10(Math.max(item.fullMse, 1e-12))
  const y = 240 - ((log - minLog.value) / Math.max(maxLog.value - minLog.value, 1e-9)) * 195
  return `${x},${y}`
}).join(' '))
function stop() { playing.value = false; if (timer) window.clearInterval(timer); timer = undefined }
function step() { if (stepIndex.value < path.value.trajectory.updates.length - 1) stepIndex.value += 1; else stop() }
function toggle() { if (playing.value) { stop(); return }; if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { step(); return }; playing.value = true; timer = window.setInterval(step, 240) }
function reset() { stop(); stepIndex.value = 0 }
watch([scale, pathId], reset)
onBeforeUnmount(stop)
</script>

<template>
  <GradientLabFrame :title="zh ? '同一学习率，在不同尺度上走出不同路径' : 'The same rate behaves differently across scales'" :description="zh ? '纵轴使用 log10(MSE)，因此慢速下降、震荡和快速发散可以放在同一张图里诚实比较。' : 'The vertical axis uses log10(MSE), so slow descent, oscillation, and divergence can be compared honestly.'" :status="`η=${path.rate} · ${path.trajectory.status}`">
    <template #controls><div class="gradient-lab-controls"><label>{{ zh ? '输入尺度' : 'Input scale' }}<select v-model="scale"><option value="raw">{{ zh ? '原始 x' : 'Raw x' }}</option><option value="standardized">{{ zh ? '标准化 x' : 'Standardized x' }}</option></select></label><label>{{ zh ? '学习率预设' : 'Learning-rate preset' }}<select v-model="pathId"><option value="slow">slow · 0.002</option><option value="stable">stable · 0.02</option><option value="oscillating">oscillating · 0.08</option><option value="divergent">divergent · 0.30</option></select></label><div class="gradient-lab-actions"><button type="button" @click="toggle">{{ playing ? (zh ? '暂停' : 'Pause') : (zh ? '播放' : 'Play') }}</button><button type="button" @click="step">{{ zh ? '单步' : 'Step' }}</button><button type="button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button></div></div></template>
    <div class="gradient-lab-grid"><figure><figcaption>{{ zh ? '损失轨迹（对数纵轴）' : 'Loss trajectory (log vertical axis)' }}</figcaption><svg viewBox="0 0 520 285" role="img" :aria-label="zh ? '当前学习率的均方误差变化' : 'MSE changes for the selected learning rate'"><line x1="45" y1="240" x2="475" y2="240" class="gd-axis"/><line x1="45" y1="35" x2="45" y2="240" class="gd-axis"/><polyline :points="points" class="gd-loss-path"/><circle v-if="points" :cx="Number(points.split(' ').at(-1)?.split(',')[0])" :cy="Number(points.split(' ').at(-1)?.split(',')[1])" r="7" class="gd-current"/><text x="390" y="268">update</text><text x="6" y="30">log MSE</text></svg></figure><figure><figcaption>{{ zh ? '参数更新向量' : 'Parameter update vector' }}</figcaption><svg viewBox="0 0 520 285" role="img" :aria-label="zh ? '当前一步更新前后参数' : 'Parameters before and after the current update'"><defs><marker id="gd-rate-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor"/></marker></defs><line x1="55" y1="235" x2="470" y2="235" class="gd-axis"/><line x1="90" y1="35" x2="90" y2="235" class="gd-axis"/><circle cx="205" cy="145" r="8" class="gd-current"/><line x1="205" y1="145" :x2="205 + Math.max(-130, Math.min(130, (frame.after.weight-frame.before.weight)*35))" :y2="145 - Math.max(-80, Math.min(80, (frame.after.bias-frame.before.bias)*12))" class="gd-update-arrow" marker-end="url(#gd-rate-arrow)"/><text x="185" y="175">before</text></svg></figure></div>
    <template #readout><article><span>update</span><strong>{{ frame.update }}/{{ path.trajectory.updates.length }}</strong></article><article><span>MSE</span><strong>{{ Number.isFinite(frame.fullMse) ? frame.fullMse.toExponential(3) : 'diverged' }}</strong></article><article><span>w</span><strong>{{ frame.after.weight.toFixed(4) }}</strong></article><article><span>b</span><strong>{{ frame.after.bias.toFixed(4) }}</strong></article></template>
    <template #fallback-label>{{ zh ? '查看当前一步文字版' : 'View the current update' }}</template><template #fallback><p>η={{ path.rate }}, {{ scale }}, update={{ frame.update }}, MSE={{ frame.fullMse }}, status={{ frame.status }}.</p></template>
  </GradientLabFrame>
</template>
