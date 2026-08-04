<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GradientDescentInteractionPayload } from '../../types/gradientDescentLesson'
import GradientLabFrame from './GradientLabFrame.vue'

type Payload = Extract<GradientDescentInteractionPayload, { scene: 'gradient-rule' }>
const props = defineProps<{ payload: Payload }>()
const { locale } = useI18n()
const phase = ref(0)
const selectedId = ref(props.payload.rowContributions[0].id)
const playing = ref(false)
let timer: number | undefined
const zh = computed(() => locale.value === 'zh-CN')
const selected = computed(() => props.payload.rowContributions.find((row) => row.id === selectedId.value)!)
const current = computed(() => phase.value >= 3 ? props.payload.updated : props.payload.anchor)
const phaseLabel = computed(() => (zh.value
  ? ['前向计算', '汇总梯度', '学习率缩放', '更新并重算'][phase.value]
  : ['Forward pass', 'Sum gradients', 'Scale by learning rate', 'Update and recompute'][phase.value]))
function stop() { playing.value = false; if (timer) window.clearInterval(timer); timer = undefined }
function step() { phase.value = (phase.value + 1) % 4 }
function toggle() {
  if (playing.value) { stop(); return }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { step(); return }
  playing.value = true
  timer = window.setInterval(() => { if (phase.value === 3) stop(); else phase.value += 1 }, 850)
}
function reset() { stop(); phase.value = 0; selectedId.value = props.payload.rowContributions[0].id }
onBeforeUnmount(stop)
</script>

<template>
  <GradientLabFrame :title="zh ? '一次更新的四个连续动作' : 'Four connected actions in one update'" :description="zh ? '样本贡献先求和成梯度，再乘学习率，最后才更新参数并重新验证损失。' : 'Sample contributions sum into a gradient, the learning rate scales it, and only then are parameters updated and loss recomputed.'" :status="`${phase + 1}/4 · ${phaseLabel}`">
    <template #controls><div class="gradient-lab-controls"><label>{{ zh ? '查看样本贡献' : 'Inspect sample contribution' }}<select v-model="selectedId"><option v-for="row in payload.rowContributions" :key="row.id" :value="row.id">{{ row.id }} · x={{ row.x }}, y={{ row.y }}</option></select></label><div class="gradient-lab-actions"><button type="button" @click="toggle">{{ playing ? (zh ? '暂停' : 'Pause') : (zh ? '播放' : 'Play') }}</button><button type="button" @click="step">{{ zh ? '单步' : 'Step' }}</button><button type="button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button></div></div></template>
    <div class="gd-rule-flow" role="img" :aria-label="zh ? '一次梯度更新的计算流程' : 'Computation flow for one gradient update'">
      <article :class="{ 'is-active': phase === 0 }"><span>1</span><strong>ŷ = wx+b</strong><small>r = y-ŷ</small></article><i>→</i><article :class="{ 'is-active': phase === 1 }"><span>2</span><strong>∇L = (dw, db)</strong><small>({{ payload.anchor.gradient.weight }}, {{ payload.anchor.gradient.bias }})</small></article><i>→</i><article :class="{ 'is-active': phase === 2 }"><span>3</span><strong>−η∇L</strong><small>({{ (-payload.learningRate * payload.anchor.gradient.weight).toFixed(3) }}, {{ (-payload.learningRate * payload.anchor.gradient.bias).toFixed(3) }})</small></article><i>→</i><article :class="{ 'is-active': phase === 3 }"><span>4</span><strong>(w', b')</strong><small>({{ payload.updated.weight }}, {{ payload.updated.bias }})</small></article>
    </div>
    <div class="gradient-lab-grid"><figure><figcaption>{{ zh ? `样本 ${selected.id} 的局部贡献` : `Local contribution from ${selected.id}` }}</figcaption><svg viewBox="0 0 520 250" role="img" :aria-label="zh ? '选中样本的预测残差和梯度贡献' : 'Prediction, residual, and gradient contribution for the selected sample'"><line x1="55" y1="205" x2="470" y2="205" class="gd-axis"/><line x1="90" y1="40" x2="90" y2="205" class="gd-axis"/><line x1="120" :y1="190 - selected.y" x2="390" :y2="190 - selected.prediction" class="gd-fit"/><line x1="330" :y1="190 - selected.y" x2="330" :y2="190 - selected.prediction" class="gd-residual"/><circle cx="330" :cy="190 - selected.y" r="7" class="gd-target"/><circle cx="330" :cy="190 - selected.prediction" r="5" class="gd-prediction"/><text x="110" y="232">x={{ selected.x }}</text><text x="250" y="232">r={{ selected.residual }}</text></svg></figure><figure><figcaption>{{ zh ? '参数平面中的更新方向' : 'Update direction in parameter space' }}</figcaption><svg viewBox="0 0 520 250" role="img" :aria-label="zh ? '梯度和负梯度更新箭头' : 'Gradient and negative-gradient update arrows'"><defs><marker id="gd-rule-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor"/></marker></defs><line x1="55" y1="205" x2="470" y2="205" class="gd-axis"/><line x1="90" y1="35" x2="90" y2="205" class="gd-axis"/><circle cx="245" cy="130" r="8" class="gd-current"/><line v-if="phase >= 1" x1="245" y1="130" x2="180" y2="105" class="gd-gradient-arrow" marker-end="url(#gd-rule-arrow)"/><line v-if="phase >= 2" x1="245" y1="130" x2="340" y2="166" class="gd-update-arrow" marker-end="url(#gd-rule-arrow)"/><circle v-if="phase >= 3" cx="340" cy="166" r="8" class="gd-optimum"/><text x="170" y="88">∇L</text><text x="345" y="188">−η∇L</text></svg></figure></div>
    <template #readout><article><span>{{ zh ? '当前阶段' : 'Current phase' }}</span><strong>{{ phaseLabel }}</strong></article><article><span>MSE</span><strong>{{ current.mse.toFixed(6) }}</strong></article><article><span>w</span><strong>{{ current.weight.toFixed(3) }}</strong></article><article><span>b</span><strong>{{ current.bias.toFixed(3) }}</strong></article></template>
    <template #fallback-label>{{ zh ? '查看样本梯度贡献表' : 'View sample gradient contributions' }}</template><template #fallback><div class="gradient-table-scroll" tabindex="0"><table><thead><tr><th>ID</th><th>r</th><th>dw contribution</th><th>db contribution</th></tr></thead><tbody><tr v-for="row in payload.rowContributions" :key="row.id"><td>{{ row.id }}</td><td>{{ row.residual }}</td><td>{{ row.weightGradientContribution }}</td><td>{{ row.biasGradientContribution }}</td></tr></tbody></table></div></template>
  </GradientLabFrame>
</template>
