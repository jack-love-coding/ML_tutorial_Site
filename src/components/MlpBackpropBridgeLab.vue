<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import { evaluateMlpBackpropBridge, type MlpBackpropBridgeDirection, type MlpBackpropBridgeInput, type MlpBackpropBridgeParameter } from '../simulations/mlpBackpropBridge'
import { round } from '../utils/math'

const props = defineProps<{
  accent: string
}>()

type ScenarioConfig = Omit<MlpBackpropBridgeInput, 'inspectedParameter' | 'predictedDirection'>

interface BridgeScenario {
  id: string
  title: LocalizedCopy
  summary: LocalizedCopy
  values: ScenarioConfig
  defaultParameter: MlpBackpropBridgeParameter
  defaultDirection: MlpBackpropBridgeDirection
}

interface ChainEvidence {
  formula: string
  value: number
  body: LocalizedCopy
}

const { locale } = useI18n()

function loc<T>(zhCN: T, en: T): { 'zh-CN': T; en: T } {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

function formatNumber(value: number, digits = 4) {
  const rounded = round(value, digits)
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

const scenarios: BridgeScenario[] = [
  {
    id: 'too-high',
    title: loc('预测偏高', 'Prediction too high'),
    summary: loc(
      '输出比目标高，正误差信号会让相关参数朝降低输出的方向更新。',
      'The output is above the target, so the positive error pushes related parameters toward a lower output.',
    ),
    values: {
      x: 1.2,
      target: 0.4,
      w1: 0.7,
      b1: -0.2,
      w2: 1.1,
      b2: 0.05,
      learningRate: 0.1,
    },
    defaultParameter: 'w1',
    defaultDirection: 'decrease',
  },
  {
    id: 'too-low',
    title: loc('预测偏低', 'Prediction too low'),
    summary: loc(
      '输出低于目标，负误差信号会让部分参数朝提高输出的方向更新。',
      'The output is below the target, so the negative error makes some parameters raise the output.',
    ),
    values: {
      x: 1,
      target: 1.1,
      w1: 0.4,
      b1: -0.1,
      w2: 0.9,
      b2: 0.05,
      learningRate: 0.1,
    },
    defaultParameter: 'w2',
    defaultDirection: 'increase',
  },
  {
    id: 'saturated-hidden',
    title: loc('隐藏单元饱和', 'Saturated hidden unit'),
    summary: loc(
      'tanh 已接近平台区，隐藏层前面的局部导数很小，早期参数几乎不动。',
      'The tanh unit sits near its plateau, so the local derivative before the hidden unit is tiny.',
    ),
    values: {
      x: 3,
      target: 0.6,
      w1: 4,
      b1: 2,
      w2: 0.7,
      b2: 0.1,
      learningRate: 0.1,
    },
    defaultParameter: 'w1',
    defaultDirection: 'flat',
  },
]

const parameterOptions: Array<{ id: MlpBackpropBridgeParameter; label: string; detail: LocalizedCopy }> = [
  { id: 'w1', label: 'w1', detail: loc('输入到隐藏单元的权重', 'Input-to-hidden weight') },
  { id: 'b1', label: 'b1', detail: loc('隐藏单元偏置', 'Hidden-unit bias') },
  { id: 'w2', label: 'w2', detail: loc('隐藏输出到预测的权重', 'Hidden-to-output weight') },
  { id: 'b2', label: 'b2', detail: loc('输出偏置', 'Output bias') },
]

const directionOptions: Array<{ id: MlpBackpropBridgeDirection; label: LocalizedCopy }> = [
  { id: 'increase', label: loc('增加', 'Increase') },
  { id: 'decrease', label: loc('减少', 'Decrease') },
  { id: 'flat', label: loc('几乎不变', 'Nearly flat') },
]

const selectedScenarioId = ref(scenarios[0].id)
const inspectedParameter = ref<MlpBackpropBridgeParameter>(scenarios[0].defaultParameter)
const predictedDirection = ref<MlpBackpropBridgeDirection>(scenarios[0].defaultDirection)

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'MLP 反向传播桥接',
        title: '从 loss 追到一个参数更新',
        scenario: '固定场景',
        parameter: '检查参数',
        prediction: '你的预测',
        reset: '重置场景',
        forward: '前向数值',
        backward: '局部导数链',
        feedback: '预测反馈',
        correct: '方向判断正确',
        incorrect: '方向判断需要修正',
        predicted: '预测方向',
        actual: '实际更新方向',
        before: '更新前',
        after: '更新后',
        gradient: '梯度',
        update: '更新',
        errorSignal: '误差信号',
        localGate: '局部门控',
        selectedGradient: '选中参数梯度',
        selectedUpdate: '参数更新结果',
      }
    : {
        eyebrow: 'MLP backprop bridge',
        title: 'Trace one loss into one parameter update',
        scenario: 'Fixed scenario',
        parameter: 'Inspect parameter',
        prediction: 'Your prediction',
        reset: 'Reset scenario',
        forward: 'Forward values',
        backward: 'Local derivative chain',
        feedback: 'Prediction feedback',
        correct: 'Direction prediction is correct',
        incorrect: 'Direction prediction needs revision',
        predicted: 'Predicted direction',
        actual: 'Actual update direction',
        before: 'Before',
        after: 'After',
        gradient: 'Gradient',
        update: 'Update',
        errorSignal: 'Error signal',
        localGate: 'Local gate',
        selectedGradient: 'Selected gradient',
        selectedUpdate: 'Parameter update',
      },
)

const directionLabels = computed<Record<MlpBackpropBridgeDirection, string>>(() => ({
  increase: locale.value === 'zh-CN' ? '增加' : 'increase',
  decrease: locale.value === 'zh-CN' ? '减少' : 'decrease',
  flat: locale.value === 'zh-CN' ? '几乎不变' : 'nearly flat',
}))

const activeScenario = computed(
  () => scenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarios[0],
)

const snapshot = computed(() =>
  evaluateMlpBackpropBridge({
    ...activeScenario.value.values,
    inspectedParameter: inspectedParameter.value,
    predictedDirection: predictedDirection.value,
  }),
)

const activeUpdate = computed(() => snapshot.value.updates[inspectedParameter.value])
const actualDirection = computed(() => snapshot.value.inspected.actualDirection)

const forwardCards = computed(() => [
  { id: 'z1', label: 'z1', value: formatNumber(snapshot.value.forward.z1), detail: 'w1 * x + b1' },
  { id: 'h', label: 'h', value: formatNumber(snapshot.value.forward.h), detail: 'tanh(z1)' },
  { id: 'yHat', label: 'yHat', value: formatNumber(snapshot.value.forward.yHat), detail: 'w2 * h + b2' },
  { id: 'loss', label: 'loss', value: formatNumber(snapshot.value.forward.loss), detail: '0.5 * error²' },
])

const chainEvidence = computed<ChainEvidence>(() => {
  const local = snapshot.value.localDerivatives

  if (inspectedParameter.value === 'w2') {
    return {
      formula: 'dYHat/dW2 = h',
      value: local.dYHatDW2,
      body: loc('输出权重直接接收隐藏激活 h。', 'The output weight directly receives the hidden activation h.'),
    }
  }

  if (inspectedParameter.value === 'b2') {
    return {
      formula: 'dYHat/dB2 = 1',
      value: local.dYHatDB2,
      body: loc('输出偏置的局部导数是 1。', 'The output bias has a local derivative of 1.'),
    }
  }

  if (inspectedParameter.value === 'w1') {
    return {
      formula: 'dYHat/dH * dH/dZ1 * dZ1/dW1',
      value: local.dYHatDH * local.dHDZ1 * local.dZ1DW1,
      body: loc('早期权重必须经过输出权重、tanh 导数和输入 x。', 'The early weight passes through the output weight, tanh derivative, and input x.'),
    }
  }

  return {
    formula: 'dYHat/dH * dH/dZ1 * dZ1/dB1',
    value: local.dYHatDH * local.dHDZ1 * local.dZ1DB1,
    body: loc('隐藏偏置也要经过输出权重和 tanh 导数。', 'The hidden bias also passes through the output weight and tanh derivative.'),
  }
})

const chainCards = computed(() => [
  {
    id: 'error',
    label: copy.value.errorSignal,
    formula: 'dLoss/dYHat',
    value: formatNumber(snapshot.value.localDerivatives.dLossDYHat),
    body: loc('误差的正负决定下游梯度的起点。', 'The error sign is the starting point for downstream gradients.'),
  },
  {
    id: 'local',
    label: copy.value.localGate,
    formula: chainEvidence.value.formula,
    value: formatNumber(chainEvidence.value.value),
    body: chainEvidence.value.body,
  },
  {
    id: 'gradient',
    label: copy.value.selectedGradient,
    formula: `dLoss/d${inspectedParameter.value.toUpperCase()}`,
    value: formatNumber(activeUpdate.value.gradient),
    body: loc('梯度为正会让参数减少，梯度为负会让参数增加。', 'A positive gradient decreases the parameter; a negative gradient increases it.'),
  },
  {
    id: 'update',
    label: copy.value.selectedUpdate,
    formula: `${inspectedParameter.value} - learningRate * gradient`,
    value: directionLabels.value[activeUpdate.value.direction],
    body: loc('最终方向来自参数更新后的差值。', 'The final direction comes from the delta after the parameter update.'),
  },
])

const feedbackCopy = computed(() => {
  const explanations = localized(
    loc(
      {
        'output-weight': 'w2 直接乘上隐藏激活 h，所以它看到的是 error * h。',
        'output-bias': 'b2 的局部导数是 1，所以它跟随输出误差信号更新。',
        'hidden-weight': 'w1 要穿过 w2、tanh 的局部斜率和输入 x；其中任何一项变小，早期更新都会变弱。',
        'hidden-bias': 'b1 要穿过 w2 和 tanh 的局部斜率；饱和时这条链会接近 0。',
      },
      {
        'output-weight': 'w2 is multiplied by hidden activation h, so it sees error * h.',
        'output-bias': 'b2 has local derivative 1, so it follows the output error signal.',
        'hidden-weight': 'w1 must pass through w2, the local tanh slope, and input x; any small factor weakens the early update.',
        'hidden-bias': 'b1 must pass through w2 and the local tanh slope; saturation can make that chain nearly zero.',
      },
    ),
  )

  return explanations[snapshot.value.inspected.explanationKey]
})

function chooseScenario(scenario: BridgeScenario) {
  selectedScenarioId.value = scenario.id
  inspectedParameter.value = scenario.defaultParameter
  predictedDirection.value = scenario.defaultDirection
}

function resetScenario() {
  chooseScenario(activeScenario.value)
}
</script>

<template>
  <section class="mlp-backprop-bridge" :style="{ '--bridge-accent': props.accent }">
    <header class="mlp-backprop-bridge__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h3>{{ copy.title }}</h3>
      </div>

      <button type="button" class="mlp-backprop-bridge__reset" @click="resetScenario">
        {{ copy.reset }}
      </button>
    </header>

    <div class="mlp-backprop-bridge__controls" :aria-label="copy.scenario">
      <button
        v-for="scenario in scenarios"
        :key="scenario.id"
        type="button"
        class="mlp-backprop-bridge__choice"
        :class="{ 'is-active': selectedScenarioId === scenario.id }"
        :aria-pressed="selectedScenarioId === scenario.id"
        @click="chooseScenario(scenario)"
      >
        <strong>{{ localized(scenario.title) }}</strong>
        <span>{{ localized(scenario.summary) }}</span>
      </button>
    </div>

    <div class="mlp-backprop-bridge__selectors">
      <fieldset>
        <legend>{{ copy.parameter }}</legend>
        <label
          v-for="option in parameterOptions"
          :key="option.id"
          :class="{ 'is-active': inspectedParameter === option.id }"
        >
          <input v-model="inspectedParameter" type="radio" name="mlp-backprop-parameter" :value="option.id">
          <span>
            <strong>{{ option.label }}</strong>
            <small>{{ localized(option.detail) }}</small>
          </span>
        </label>
      </fieldset>

      <fieldset>
        <legend>{{ copy.prediction }}</legend>
        <label
          v-for="option in directionOptions"
          :key="option.id"
          :class="{ 'is-active': predictedDirection === option.id }"
        >
          <input v-model="predictedDirection" type="radio" name="mlp-backprop-direction" :value="option.id">
          <span>
            <strong>{{ localized(option.label) }}</strong>
          </span>
        </label>
      </fieldset>
    </div>

    <section class="mlp-backprop-bridge__cards" :aria-label="copy.forward">
      <article v-for="card in forwardCards" :key="card.id">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.detail }}</small>
      </article>
    </section>

    <section class="mlp-backprop-bridge__chain" :aria-label="copy.backward">
      <article v-for="card in chainCards" :key="card.id">
        <span>{{ card.label }}</span>
        <strong>{{ card.formula }}</strong>
        <em>{{ card.value }}</em>
        <p>{{ localized(card.body) }}</p>
      </article>
    </section>

    <section
      class="mlp-backprop-bridge__feedback"
      :class="{ 'is-correct': snapshot.inspected.correct }"
      :aria-label="copy.feedback"
    >
      <div>
        <span>{{ snapshot.inspected.correct ? copy.correct : copy.incorrect }}</span>
        <strong>{{ inspectedParameter }}</strong>
      </div>
      <dl>
        <div>
          <dt>{{ copy.predicted }}</dt>
          <dd>{{ directionLabels[predictedDirection] }}</dd>
        </div>
        <div>
          <dt>{{ copy.actual }}</dt>
          <dd>{{ directionLabels[actualDirection] }}</dd>
        </div>
        <div>
          <dt>{{ copy.gradient }}</dt>
          <dd>{{ formatNumber(activeUpdate.gradient) }}</dd>
        </div>
        <div>
          <dt>{{ copy.update }}</dt>
          <dd>{{ formatNumber(activeUpdate.before) }} -> {{ formatNumber(activeUpdate.after) }}</dd>
        </div>
      </dl>
      <p>{{ feedbackCopy }}</p>
    </section>
  </section>
</template>
