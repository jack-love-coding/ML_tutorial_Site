<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createOptimizerState, learningRateForStep, stepOptimizer, type OptimizerConfig, type OptimizerKind } from '../../../simulations/optimizers'
import type { AppLocale } from '../../../types/ml'
import { withPublicBase } from '../../../utils/publicPath'

type SceneKind = 'training-loop' | 'sgd-batch-noise' | 'momentum-rmsprop' | 'adam-weight-decay' | 'learning-rate-schedules' | 'curve-diagnosis'
const props = defineProps<{ scene: SceneKind }>()
const { locale } = useI18n()
const step = ref(0)
const playing = ref(false)
const batch = ref('64')
const mode = ref<'matched' | 'practical'>('matched')
const optimizer = ref<OptimizerKind>('momentum')
const schedule = ref<'constant' | 'step' | 'warmup-cosine'>('constant')
const reducedMotion = ref(false)
const trajectory = ref<{ optimizer: string; update: number; trainLoss: number; updateNorm: number; comparison: string }[]>([])
let timer: number | undefined
let motionQuery: MediaQueryList | undefined

const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const copy = computed(() => zh.value ? {
  title: '互动观察台', play: '播放', pause: '暂停', step: '单步', reset: '重置', keyboard: '键盘：空格播放/暂停，右箭头单步，R 重置。', reduced: '已减少动态效果：使用静态状态表。', group: '场景选项', state: '当前状态', fallback: '文本与表格替代图形。', batch: '批量', optimizer: '状态规则', schedule: '学习率计划', view: '比较视图', update: '更新', lr: '学习率', loss: '训练损失', transfer: 'Banknote 迁移边界', noWinner: '这些受控结果不宣布通用赢家。',
} : {
  title: 'Interactive observation lab', play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset', keyboard: 'Keyboard: Space play/pause, Right Arrow step, R reset.', reduced: 'Reduced motion is on: a static state table is used.', group: 'Scene options', state: 'Current state', fallback: 'Text and tables provide a graphic alternative.', batch: 'Batch', optimizer: 'State rule', schedule: 'Learning-rate plan', view: 'Comparison view', update: 'Update', lr: 'Learning rate', loss: 'Training loss', transfer: 'Banknote transfer boundary', noWinner: 'These controlled results do not name a universal winner.',
})

const sceneLabel = computed(() => ({
  'training-loop': zh.value ? '训练账本' : 'Training ledger',
  'sgd-batch-noise': zh.value ? '批量噪声' : 'Batch noise',
  'momentum-rmsprop': zh.value ? '状态记忆' : 'State memory',
  'adam-weight-decay': zh.value ? 'Adam 与衰减' : 'Adam and decay',
  'learning-rate-schedules': zh.value ? '学习率节奏' : 'Learning-rate cadence',
  'curve-diagnosis': zh.value ? '受控比较与迁移' : 'Controlled comparison and transfer',
}[props.scene]))

const maxSteps = computed(() => props.scene === 'training-loop' ? 5 : props.scene === 'curve-diagnosis' ? 40 : 12)
const loopStages = ['forward', 'loss', 'zero_grad', 'backward', 'optimizer.step']
const config = computed<OptimizerConfig>(() => optimizer.value === 'momentum'
  ? { kind: 'momentum', learningRate: 0.08, momentum: 0.9 }
  : optimizer.value === 'rmsprop'
    ? { kind: 'rmsprop', learningRate: 0.02, alpha: 0.95, epsilon: 1e-8 }
    : optimizer.value === 'adam'
      ? { kind: 'adam', learningRate: 0.02, beta1: 0.9, beta2: 0.999, epsilon: 1e-8, weightDecay: { kind: 'adamw', coefficient: 0.01 } }
      : { kind: 'sgd', learningRate: 0.08 })
const engineTrace = computed(() => {
  let params = [1, -0.7]
  let state = createOptimizerState(config.value, params.length)
  const traces = []
  for (let index = 0; index < Math.max(1, step.value); index += 1) {
    const current = stepOptimizer(params, [0.6 - index * 0.03, -0.35 + index * 0.02], config.value, state)
    params = current.parametersAfter
    state = current.state
    traces.push(current)
  }
  return traces.at(-1)
})
const learningRate = computed(() => learningRateForStep(0.08, schedule.value === 'constant'
  ? { kind: 'constant' }
  : schedule.value === 'step'
    ? { kind: 'step', stepSize: 4, gamma: 0.5 }
    : { kind: 'warmup-cosine', warmupSteps: 3, totalSteps: 12, minScale: 0.1 }, Math.min(step.value, 11)))
const rows = computed(() => Array.from({ length: 12 }, (_, index) => {
  const offset = props.scene === 'sgd-batch-noise' ? ((index % 3) - 1) * (batch.value === '16' ? 10 : batch.value === '64' ? 5 : 1) : 0
  const slope = props.scene === 'learning-rate-schedules' ? learningRateForStep(0.08, schedule.value === 'constant' ? { kind: 'constant' } : schedule.value === 'step' ? { kind: 'step', stepSize: 4, gamma: 0.5 } : { kind: 'warmup-cosine', warmupSteps: 3, totalSteps: 12, minScale: 0.1 }, index) * 250 : 7
  return { x: 18 + index * 22, y: Math.max(18, 180 - index * slope + offset) }
}))
const publishedRows = computed(() => trajectory.value.filter((row) => row.comparison === (mode.value === 'matched' ? 'first-step-norm-matched' : 'predeclared-practical') && row.update === Math.min(40, Math.max(1, step.value))))

function stop() { if (timer) window.clearInterval(timer); timer = undefined; playing.value = false }
function advance() { step.value = step.value >= maxSteps.value ? maxSteps.value : step.value + 1 }
function toggle() { if (playing.value) return stop(); playing.value = true; timer = window.setInterval(() => { if (step.value >= maxSteps.value) stop(); else advance() }, reducedMotion.value ? 900 : 450) }
function reset() { stop(); step.value = 0 }
function onKeydown(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); toggle() }
  if (event.key === 'ArrowRight') { event.preventDefault(); advance() }
  if (event.key.toLowerCase() === 'r') { event.preventDefault(); reset() }
}
function updateMotion() { reducedMotion.value = motionQuery?.matches ?? false; if (reducedMotion.value) stop() }

watch(() => [props.scene, batch.value, mode.value, optimizer.value, schedule.value], reset)
onMounted(async () => {
  if (window.matchMedia) { motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'); updateMotion(); motionQuery.addEventListener('change', updateMotion) }
  try {
    const response = await fetch(withPublicBase('/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json'))
    const payload = await response.json() as { rows?: typeof trajectory.value }
    trajectory.value = Array.isArray(payload.rows) ? payload.rows.filter((row) => Number.isFinite(row.trainLoss) && Number.isFinite(row.updateNorm)) : []
  } catch { trajectory.value = [] }
})
onBeforeUnmount(() => { stop(); motionQuery?.removeEventListener('change', updateMotion) })
</script>

<template>
  <section class="optimizer-scene" tabindex="0" :aria-label="sceneLabel" @keydown="onKeydown">
    <header class="optimizer-scene__header"><div><span>{{ copy.title }}</span><h4>{{ sceneLabel }}</h4></div><p>{{ copy.keyboard }}</p></header>
    <p v-if="reducedMotion" class="optimizer-scene__notice" role="status">{{ copy.reduced }}</p>
    <div class="optimizer-scene__controls" :aria-label="copy.group">
      <div class="optimizer-scene__actions"><button type="button" @click="toggle">{{ playing ? copy.pause : copy.play }}</button><button type="button" @click="advance">{{ copy.step }}</button><button type="button" @click="reset">{{ copy.reset }}</button></div>
      <label v-if="scene === 'sgd-batch-noise'">{{ copy.batch }}<select v-model="batch"><option value="16">16</option><option value="64">64</option><option value="512">512</option></select></label>
      <label v-else-if="scene === 'momentum-rmsprop' || scene === 'adam-weight-decay'">{{ copy.optimizer }}<select v-model="optimizer"><option value="momentum">Momentum</option><option value="rmsprop">RMSProp</option><option value="adam">AdamW</option></select></label>
      <label v-else-if="scene === 'learning-rate-schedules'">{{ copy.schedule }}<select v-model="schedule"><option value="constant">constant</option><option value="step">step</option><option value="warmup-cosine">warmup + cosine</option></select></label>
      <label v-else-if="scene === 'curve-diagnosis'">{{ copy.view }}<select v-model="mode"><option value="matched">matched</option><option value="practical">practical</option></select></label>
    </div>
    <div class="optimizer-scene__canvas" :class="{ 'is-static': reducedMotion }">
      <svg viewBox="0 0 280 200" role="img" :aria-label="`${sceneLabel}: ${copy.fallback}`"><path d="M18 182H270 M18 182V18"/><polyline :points="rows.map((row) => `${row.x},${row.y}`).join(' ')"/><circle :cx="rows[Math.min(rows.length - 1, step)]?.x" :cy="rows[Math.min(rows.length - 1, step)]?.y" r="7"/></svg>
      <div class="optimizer-scene__state"><span>{{ copy.state }}</span><strong>{{ scene === 'training-loop' ? loopStages[Math.min(4, step)] : `${copy.update} ${step}` }}</strong><small v-if="scene === 'learning-rate-schedules'">{{ copy.lr }} = {{ learningRate.toFixed(4) }}</small><small v-else-if="engineTrace">{{ engineTrace.state.kind }} · t={{ engineTrace.state.step }} · θ₀={{ engineTrace.parametersAfter[0]?.toFixed(3) }}</small><small v-else>{{ copy.fallback }}</small></div>
    </div>
    <div v-if="scene === 'curve-diagnosis'" class="optimizer-scene__transfer"><strong>{{ copy.transfer }}</strong><p>{{ zh ? '训练/验证/测试为 960/206/206；标准化只在训练集拟合，配置冻结后才允许一次测试评估。' : 'Train/validation/test is 960/206/206; standardization fits train only, and one test evaluation is allowed only after configuration freeze.' }}</p><table v-if="publishedRows.length"><thead><tr><th>optimizer</th><th>{{ copy.loss }}</th><th>‖Δθ‖</th></tr></thead><tbody><tr v-for="row in publishedRows" :key="row.optimizer"><td>{{ row.optimizer }}</td><td>{{ row.trainLoss.toFixed(5) }}</td><td>{{ row.updateNorm.toFixed(5) }}</td></tr></tbody></table><p>{{ copy.noWinner }}</p></div>
  </section>
</template>
