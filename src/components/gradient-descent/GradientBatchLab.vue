<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GradientDescentInteractionPayload } from '../../types/gradientDescentLesson'
import GradientLabFrame from './GradientLabFrame.vue'

type Payload = Extract<GradientDescentInteractionPayload, { scene: 'noise-and-batch' }>
const props = defineProps<{ payload: Payload }>()
const { locale } = useI18n()
const mode = ref<'full' | 'mini-batch' | 'stochastic'>('mini-batch')
const stepIndex = ref(0)
const playing = ref(false)
let timer: number | undefined
const zh = computed(() => locale.value === 'zh-CN')
const path = computed(() => props.payload.paths.find((item) => item.mode === mode.value)!)
const frame = computed(() => path.value.trajectory.updates[Math.min(stepIndex.value, path.value.trajectory.updates.length - 1)])
const visible = computed(() => path.value.trajectory.updates.slice(0, stepIndex.value + 1))
const extent = computed(() => {
  const weights = path.value.trajectory.updates.map((item) => item.after.weight)
  const biases = path.value.trajectory.updates.map((item) => item.after.bias)
  return { wMin: Math.min(...weights), wMax: Math.max(...weights), bMin: Math.min(...biases), bMax: Math.max(...biases) }
})
const points = computed(() => visible.value.map((item) => {
  const x = 45 + ((item.after.weight - extent.value.wMin) / Math.max(extent.value.wMax - extent.value.wMin, 1e-9)) * 420
  const y = 240 - ((item.after.bias - extent.value.bMin) / Math.max(extent.value.bMax - extent.value.bMin, 1e-9)) * 195
  return `${x},${y}`
}).join(' '))
const bikeLossPoints = computed(() => {
  const preview = props.payload.bikeTrace.preview
  const logs = preview.map((item) => Math.log10(item.mse))
  const low = Math.min(...logs); const high = Math.max(...logs)
  return preview.map((item, index) => `${45 + (index / Math.max(preview.length - 1, 1)) * 420},${240 - ((Math.log10(item.mse) - low) / Math.max(high - low, 1e-9)) * 195}`).join(' ')
})
function stop() { playing.value = false; if (timer) window.clearInterval(timer); timer = undefined }
function step() { if (stepIndex.value < path.value.trajectory.updates.length - 1) stepIndex.value += 1; else stop() }
function toggle() { if (playing.value) { stop(); return }; if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { step(); return }; playing.value = true; timer = window.setInterval(step, mode.value === 'stochastic' ? 90 : 180) }
function reset() { stop(); stepIndex.value = 0 }
watch(mode, reset)
onBeforeUnmount(stop)
</script>

<template>
  <GradientLabFrame :title="zh ? '每次看多少真实样本，会改变路径的抖动方式' : 'How many real samples each update sees changes the path'" :description="zh ? '三种模式使用同一五行数据和固定种子。路径差异来自梯度估计的数据量，不是额外添加的随机噪声。' : 'All three modes use the same five rows and fixed seed. Path differences come from the gradient estimate, not injected noise.'" :status="`seed ${payload.seed} · ${mode}`">
    <template #controls><div class="gradient-lab-controls"><label>{{ zh ? '梯度模式' : 'Gradient mode' }}<select v-model="mode"><option value="full">full batch</option><option value="mini-batch">mini-batch · {{ payload.miniBatchSize }}</option><option value="stochastic">stochastic · 1</option></select></label><div class="gradient-lab-actions"><button type="button" @click="toggle">{{ playing ? (zh ? '暂停' : 'Pause') : (zh ? '播放' : 'Play') }}</button><button type="button" @click="step">{{ zh ? '单步' : 'Step' }}</button><button type="button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button></div></div></template>
    <div class="gradient-lab-grid"><figure><figcaption>{{ zh ? '参数路径：full 更平滑，局部 batch 更曲折' : 'Parameter path: full is smoother, partial batches are more jagged' }}</figcaption><svg viewBox="0 0 520 285" role="img" :aria-label="zh ? '所选 batch 模式的参数更新轨迹' : 'Parameter-update path for the selected batch mode'"><line x1="45" y1="240" x2="475" y2="240" class="gd-axis"/><line x1="45" y1="35" x2="45" y2="240" class="gd-axis"/><polyline :points="points" class="gd-batch-path"/><text x="435" y="268">w</text><text x="12" y="34">b</text></svg></figure><section class="gd-batch-samples"><span>{{ zh ? '本次真正参与梯度计算的样本' : 'Samples actually used in this gradient' }}</span><div><strong v-for="sampleId in frame.sampleIds" :key="sampleId">{{ sampleId }}</strong></div><p>{{ zh ? `本轮已累计处理 ${frame.processedSamples} 条样本记录；全量 MSE 仍使用全部五行数据复算。` : `${frame.processedSamples} sample records have been processed; full MSE is still recomputed on all five rows.` }}</p></section></div>
    <figure class="gd-bike-transfer"><figcaption>{{ zh ? '迁移到真实 Bike Sharing 训练轨迹' : 'Transfer to a real Bike Sharing training trace' }}</figcaption><svg viewBox="0 0 520 285" role="img" :aria-label="zh ? '真实 Bike Sharing 数据训练时的均方误差轨迹' : 'MSE trajectory from training on real Bike Sharing data'"><line x1="45" y1="240" x2="475" y2="240" class="gd-axis"/><line x1="45" y1="35" x2="45" y2="240" class="gd-axis"/><polyline :points="bikeLossPoints" class="gd-loss-path"/><text x="390" y="268">update</text><text x="6" y="30">log MSE</text></svg><p>{{ zh ? '这条曲线来自线性回归课程发布的真实 Bike Sharing 梯度轨迹；实验台上先用五行数据看清机制，再用真实数据确认同一种训练行为。' : 'This curve comes from the published real Bike Sharing gradient trace. The five-row lab isolates the mechanism; the real-data trace confirms the same training behavior.' }}</p></figure>
    <template #readout><article><span>update</span><strong>{{ frame.update }}/{{ path.trajectory.updates.length }}</strong></article><article><span>batch</span><strong>{{ frame.sampleIds.length }}</strong></article><article><span>dw</span><strong>{{ frame.gradient.weight.toFixed(4) }}</strong></article><article><span>MSE</span><strong>{{ frame.fullMse.toFixed(4) }}</strong></article></template>
    <template #fallback-label>{{ zh ? '查看当前更新记录' : 'View current update record' }}</template><template #fallback><div class="gradient-table-scroll" tabindex="0"><table><tbody><tr><th>mode</th><td>{{ mode }}</td></tr><tr><th>sample IDs</th><td>{{ frame.sampleIds.join(', ') }}</td></tr><tr><th>gradient</th><td>({{ frame.gradient.weight }}, {{ frame.gradient.bias }})</td></tr><tr><th>after</th><td>({{ frame.after.weight }}, {{ frame.after.bias }})</td></tr><tr><th>full MSE</th><td>{{ frame.fullMse }}</td></tr></tbody></table></div></template>
  </GradientLabFrame>
</template>
