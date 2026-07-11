<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab.ts'
import { evaluatePredictionTask } from '../utils/mathToCode.ts'

const props = withDefaults(defineProps<{ locale?: MathLabLocale }>(), { locale: 'zh-CN' })

type InputKey = 'x00' | 'x01' | 'x10' | 'x11' | 'w0' | 'w1' | 'bias' | 'y0' | 'y1'
type StudioInputs = Record<InputKey, number>

const INITIAL_INPUTS: StudioInputs = {
  x00: 2, x01: 3, x10: 1, x11: 4,
  w0: 4, w1: -1, bias: 5, y0: 9, y1: 7,
}
const values = ref<StudioInputs>({ ...INITIAL_INPUTS })
const invalidKey = ref<InputKey | undefined>()

const text = computed(() => props.locale === 'zh-CN' ? {
  eyebrow: '引导式 notebook 实验台',
  title: '逐层检查公式到代码的数据流',
  description: '修改有限数值后，保留每一层中间值。目标只在预测完成后进入残差。',
  matrix: '输入矩阵 X', targets: '目标 y', weights: '权重 w', bias: '偏置 b',
  reset: '重置输入', error: '所有输入必须是有限数值。请修复标出的输入或重置。',
  results: '中间结果文本表', predictions: '预测 y_hat', residuals: '残差',
  squares: '平方误差', mse: 'MSE', derivatives: '参数导数',
  weightDerivatives: '权重导数', biasDerivative: '偏置导数', shape: 'shape',
  inputName: '输入', value: '值', role: '角色',
  sampleFeature: '样本特征', parameter: '模型参数', targetRole: '预测后比较目标',
  observation: '诊断顺序：输入合同 → 点积 → 预测 → 残差 → 平方 → 平均。中央差分只读取局部敏感度，不更新参数。',
} : {
  eyebrow: 'Guided notebook studio',
  title: 'Inspect the formula-to-code dataflow layer by layer',
  description: 'Change finite values while preserving every intermediate. Targets enter residuals only after prediction.',
  matrix: 'Input matrix X', targets: 'Targets y', weights: 'Weights w', bias: 'Bias b',
  reset: 'Reset inputs', error: 'All inputs must be finite. Enter a finite number in the marked field or reset.',
  results: 'Intermediate-result text table', predictions: 'Predictions y_hat', residuals: 'Residuals',
  squares: 'Squared errors', mse: 'MSE', derivatives: 'Parameter derivatives',
  weightDerivatives: 'Weight derivatives', biasDerivative: 'Bias derivative', shape: 'shape',
  inputName: 'Input', value: 'Value', role: 'Role',
  sampleFeature: 'Sample feature', parameter: 'Model parameter', targetRole: 'Post-prediction comparison target',
  observation: 'Diagnostic order: input contract → dot product → prediction → residual → square → mean. Central difference reads local sensitivity and does not update parameters.',
})

const fields = computed(() => [
  { key: 'x00' as const, label: 'X[0,0]', role: text.value.sampleFeature },
  { key: 'x01' as const, label: 'X[0,1]', role: text.value.sampleFeature },
  { key: 'x10' as const, label: 'X[1,0]', role: text.value.sampleFeature },
  { key: 'x11' as const, label: 'X[1,1]', role: text.value.sampleFeature },
  { key: 'w0' as const, label: 'w[0]', role: text.value.parameter },
  { key: 'w1' as const, label: 'w[1]', role: text.value.parameter },
  { key: 'bias' as const, label: 'b', role: text.value.parameter },
  { key: 'y0' as const, label: 'y[0]', role: text.value.targetRole },
  { key: 'y1' as const, label: 'y[1]', role: text.value.targetRole },
])

function setInput(key: InputKey, event: Event) {
  const candidate = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(candidate)) {
    invalidKey.value = key
    return
  }
  invalidKey.value = undefined
  values.value = { ...values.value, [key]: candidate }
}

function reset() {
  values.value = { ...INITIAL_INPUTS }
  invalidKey.value = undefined
}

const calculation = computed(() => {
  if (invalidKey.value) return undefined
  const input = values.value
  const evaluation = evaluatePredictionTask({
    samples: [
      { features: [input.x00, input.x01], target: input.y0 },
      { features: [input.x10, input.x11], target: input.y1 },
    ],
    parameters: { weights: [input.w0, input.w1], bias: input.bias },
  })
  const residuals = evaluation.predictions.map((prediction, index) => prediction - evaluation.targets[index]!)
  const squaredErrors = residuals.map((residual) => residual * residual)
  return { evaluation, residuals, squaredErrors }
})

function number(value: number): string {
  const normalized = Math.abs(value) < 1e-9 ? 0 : value
  return Number(normalized.toFixed(6)).toString()
}

function vector(valuesToFormat: readonly number[]): string {
  return `[${valuesToFormat.map(number).join(', ')}]`
}

function matrix(rows: readonly (readonly number[])[]): string {
  return `[${rows.map(vector).join(', ')}]`
}
</script>

<template>
  <section class="math-lab-card math-to-code-studio-lab">
    <header>
      <span>{{ text.eyebrow }}</span>
      <h3>{{ text.title }}</h3>
      <p>{{ text.description }}</p>
    </header>

    <div class="math-to-code-studio-lab__layout">
      <div class="math-to-code-studio-lab__controls">
        <table>
          <caption>{{ text.inputName }}</caption>
          <thead><tr><th>{{ text.inputName }}</th><th>{{ text.value }}</th><th>{{ text.role }}</th></tr></thead>
          <tbody>
            <tr v-for="field in fields" :key="field.key">
              <th scope="row"><label :for="`studio-${field.key}`">{{ field.label }}</label></th>
              <td>
                <input
                  :id="`studio-${field.key}`"
                  type="number"
                  step="any"
                  :value="values[field.key]"
                  :aria-invalid="invalidKey === field.key ? 'true' : undefined"
                  @input="setInput(field.key, $event)"
                >
              </td>
              <td>{{ field.role }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="invalidKey" class="math-to-code-studio-lab__error" role="alert">{{ text.error }}</p>
        <button type="button" @click="reset">{{ text.reset }}</button>
      </div>

      <div class="math-to-code-studio-lab__results" aria-live="polite">
        <table data-motion-fallback="prefers-reduced-motion">
          <caption>{{ text.results }}</caption>
          <tbody v-if="calculation">
            <tr><th scope="row">{{ text.matrix }}</th><td>{{ matrix(calculation.evaluation.matrix) }}</td><td>{{ text.shape }} (2, 2)</td></tr>
            <tr><th scope="row">{{ text.weights }}</th><td>{{ vector(values ? [values.w0, values.w1] : []) }}</td><td>{{ text.shape }} (2,)</td></tr>
            <tr><th scope="row">{{ text.bias }}</th><td>{{ number(values.bias) }}</td><td>{{ text.shape }} scalar</td></tr>
            <tr><th scope="row">{{ text.targets }}</th><td>{{ vector(calculation.evaluation.targets) }}</td><td>{{ text.shape }} (2,)</td></tr>
            <tr><th scope="row">{{ text.predictions }}</th><td>{{ vector(calculation.evaluation.predictions) }}</td><td>{{ text.shape }} (2,)</td></tr>
            <tr><th scope="row">{{ text.residuals }}</th><td>{{ vector(calculation.residuals) }}</td><td>{{ text.shape }} (2,)</td></tr>
            <tr><th scope="row">{{ text.squares }}</th><td>{{ vector(calculation.squaredErrors) }}</td><td>{{ text.shape }} (2,)</td></tr>
            <tr><th scope="row">{{ text.mse }}</th><td>{{ number(calculation.evaluation.mse) }}</td><td>{{ text.shape }} scalar</td></tr>
            <tr>
              <th scope="row">{{ text.derivatives }}</th>
              <td>
                {{ text.weightDerivatives }} {{ vector(calculation.evaluation.parameterDerivatives.weights) }};
                {{ text.biasDerivative }} {{ number(calculation.evaluation.parameterDerivatives.bias) }}
              </td>
              <td>{{ text.shape }} (2,) + scalar</td>
            </tr>
          </tbody>
        </table>
        <p>{{ text.observation }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.math-to-code-studio-lab { display: grid; gap: 1rem; }
.math-to-code-studio-lab__layout { display: grid; grid-template-columns: minmax(19rem, .9fr) minmax(22rem, 1.1fr); gap: 1rem; align-items: start; }
.math-to-code-studio-lab__controls, .math-to-code-studio-lab__results { min-width: 0; overflow-x: auto; }
.math-to-code-studio-lab table { width: 100%; border-collapse: collapse; }
.math-to-code-studio-lab caption { padding: .4rem; font-weight: 700; text-align: left; }
.math-to-code-studio-lab th, .math-to-code-studio-lab td { padding: .45rem; border-bottom: 1px solid var(--border-subtle, #cbd5e1); text-align: left; vertical-align: top; }
.math-to-code-studio-lab input { width: 6.5rem; min-height: 2.5rem; }
.math-to-code-studio-lab input[aria-invalid="true"] { outline: 2px solid #b91c1c; }
.math-to-code-studio-lab__error { color: #991b1b; font-weight: 700; }
@media (max-width: 820px) { .math-to-code-studio-lab__layout { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .math-to-code-studio-lab * { animation: none !important; scroll-behavior: auto; transition: none !important; } }
</style>
