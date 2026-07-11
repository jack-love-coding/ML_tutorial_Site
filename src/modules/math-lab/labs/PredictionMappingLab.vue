<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab.ts'
import { evaluatePredictionTask } from '../utils/mathToCode.ts'

const props = withDefaults(defineProps<{ locale?: MathLabLocale }>(), { locale: 'zh-CN' })
const INITIAL_W1 = 4
const MIN_W1 = 2
const MAX_W1 = 6
const STEP_W1 = 0.5
const w1 = ref(INITIAL_W1)

const text = computed(() => props.locale === 'zh-CN' ? {
  eyebrow: '控制变量实验', title: '只改变第一个权重 w1',
  fixed: '固定：x = [2, 3]，w2 = -1，bias = 5，target = 9',
  control: '第一个权重 w1', current: '当前值', reset: '重置为 w1 = 4',
  prediction: '预测 prediction', residual: '残差 residual', mse: '均方误差 MSE',
  tableTitle: '静态结果表（无动画也保留完整信息）', squared: '平方误差',
  currentRow: '当前设置',
  observation: '只改变 w1 后，prediction 每次随 x1 = 2 成比例变化；MSE 读的是离 target 的距离。',
  prompt: '比较当前行与相邻行：为什么 prediction 变大时，MSE 可能先减小再增大？',
} : {
  eyebrow: 'Controlled experiment', title: 'Change only the first weight w1',
  fixed: 'Fixed: x = [2, 3], w2 = -1, bias = 5, target = 9',
  control: 'First weight w1', current: 'Current value', reset: 'Reset to w1 = 4',
  prediction: 'Prediction', residual: 'Residual', mse: 'MSE',
  tableTitle: 'Static result table (all information remains without animation)', squared: 'Squared error',
  currentRow: 'Current setting',
  observation: 'With only w1 changing, prediction changes in proportion to x1 = 2; MSE reads distance from the target.',
  prompt: 'Compare the current row with its neighbours: why can MSE decrease and then increase as prediction grows?',
})

function normalizeW1(value: number): number {
  if (!Number.isFinite(value)) return INITIAL_W1
  const bounded = Math.min(MAX_W1, Math.max(MIN_W1, value))
  return Math.round(bounded / STEP_W1) * STEP_W1
}

function setW1(event: Event) {
  w1.value = normalizeW1(Number((event.target as HTMLInputElement).value))
}

function reset() {
  w1.value = INITIAL_W1
}

function evaluate(candidateW1: number) {
  return evaluatePredictionTask({
    samples: [{ features: [2, 3], target: 9 }],
    parameters: { weights: [normalizeW1(candidateW1), -1], bias: 5 },
  })
}

const current = computed(() => {
  const result = evaluate(w1.value)
  const prediction = result.predictions[0]!
  return { prediction, residual: prediction - result.targets[0]!, mse: result.mse }
})

const rows = [2, 3, 3.5, 4, 5, 6].map((candidateW1) => {
  const result = evaluate(candidateW1)
  const prediction = result.predictions[0]!
  const residual = prediction - result.targets[0]!
  return { w1: candidateW1, prediction, residual, squaredError: result.mse }
})

</script>

<template>
  <section class="math-lab-card prediction-mapping-lab">
    <div class="prediction-mapping-lab__summary">
      <header>
        <span>{{ text.eyebrow }}</span>
        <h3>{{ text.title }}</h3>
        <p>{{ text.fixed }}</p>
      </header>

      <label for="prediction-w1">
        <strong>{{ text.control }}</strong>
        <span>{{ text.current }}: {{ w1 }}</span>
      </label>
      <input
        id="prediction-w1"
        :value="w1"
        type="range"
        min="2"
        max="6"
        step="0.5"
        :aria-valuetext="`${text.control}: ${w1}`"
        @input="setW1"
      >
      <button type="button" @click="reset">{{ text.reset }}</button>

      <dl class="prediction-mapping-lab__readouts" aria-live="polite">
        <div><dt>{{ text.prediction }}</dt><dd>{{ current.prediction }}</dd></div>
        <div><dt>{{ text.residual }}</dt><dd>{{ current.residual }}</dd></div>
        <div><dt>{{ text.mse }}</dt><dd>{{ current.mse }}</dd></div>
      </dl>
      <p>{{ text.observation }}</p>
      <p><strong>{{ text.prompt }}</strong></p>
    </div>

    <div class="prediction-mapping-lab__fallback">
      <h4>{{ text.tableTitle }}</h4>
      <table aria-describedby="prediction-mapping-caption">
        <caption id="prediction-mapping-caption">{{ text.tableTitle }}</caption>
        <thead>
          <tr><th>w1</th><th>{{ text.prediction }}</th><th>{{ text.residual }}</th><th>{{ text.squared }}</th></tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.w1"
            :class="{ 'is-current': row.w1 === w1 }"
            :aria-current="row.w1 === w1 ? 'true' : undefined"
          >
            <th scope="row">
              {{ row.w1 }}
              <span v-if="row.w1 === w1" class="prediction-mapping-lab__current-label">{{ text.currentRow }}</span>
            </th>
            <td>{{ row.prediction }}</td>
            <td>{{ row.residual }}</td>
            <td>{{ row.squaredError }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.prediction-mapping-lab { display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr); gap: 1.25rem; }
.prediction-mapping-lab__summary { display: grid; align-content: start; gap: .8rem; }
.prediction-mapping-lab__summary label { display: flex; justify-content: space-between; gap: 1rem; }
.prediction-mapping-lab__readouts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .65rem; margin: 0; }
.prediction-mapping-lab__readouts div { padding: .7rem; border: 1px solid var(--border-subtle, #cbd5e1); border-radius: .7rem; }
.prediction-mapping-lab__readouts dd { margin: .25rem 0 0; font-size: 1.2rem; font-weight: 700; }
.prediction-mapping-lab table { width: 100%; border-collapse: collapse; }
.prediction-mapping-lab th, .prediction-mapping-lab td { padding: .5rem; border-bottom: 1px solid var(--border-subtle, #cbd5e1); text-align: right; }
.prediction-mapping-lab th:first-child { text-align: left; }
.prediction-mapping-lab tr.is-current { outline: 2px solid var(--math-accent, #d65a31); outline-offset: -2px; }
.prediction-mapping-lab__current-label { display: block; font-size: .75rem; font-weight: 700; }
@media (max-width: 760px) { .prediction-mapping-lab { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .prediction-mapping-lab * { scroll-behavior: auto; transition: none !important; animation: none !important; } }
</style>
