<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import {
  cnnShapeParameterScenarios,
  evaluateCnnShapeParameterChallenge,
  type CnnShapeParameterPrediction,
  type CnnShapeParameterScenario,
  type CnnShapeParameterScenarioId,
} from '../simulations/cnnShapeParameterChallenge'

const props = defineProps<{
  accent: string
}>()

interface ScenarioCopy {
  id: CnnShapeParameterScenarioId
  title: LocalizedCopy
  summary: LocalizedCopy
  defaultPrediction: CnnShapeParameterPrediction
}

const { locale } = useI18n()

function loc<T>(zhCN: T, en: T): { 'zh-CN': T; en: T } {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

function formatInteger(value: number) {
  return new Intl.NumberFormat(locale.value).format(Math.round(value))
}

function formatRatio(value: number) {
  if (!Number.isFinite(value)) return '0'
  if (value >= 1000) return formatInteger(value)
  return value.toFixed(1)
}

const scenarioCopy: ScenarioCopy[] = [
  {
    id: 'same-padding-rgb',
    title: loc('same padding RGB', 'Same-padding RGB'),
    summary: loc(
      'padding=1 让 3x3 kernel 在 32x32 RGB 图像上保留空间尺寸。',
      'Padding=1 lets a 3x3 kernel preserve spatial size on a 32x32 RGB image.',
    ),
    defaultPrediction: {
      outputHeight: 30,
      outputWidth: 30,
      outputChannels: 16,
      convParameterCount: 432,
      comparison: 'conv-fewer',
    },
  },
  {
    id: 'valid-grayscale',
    title: loc('valid 灰度图', 'Valid grayscale'),
    summary: loc(
      '没有 padding 时，5x5 kernel 会让 28x28 灰度输入缩小。',
      'Without padding, a 5x5 kernel shrinks a 28x28 grayscale input.',
    ),
    defaultPrediction: {
      outputHeight: 28,
      outputWidth: 28,
      outputChannels: 8,
      convParameterCount: 200,
      comparison: 'conv-fewer',
    },
  },
  {
    id: 'stride-downsample',
    title: loc('stride 下采样', 'Stride downsample'),
    summary: loc(
      'stride=2 让卷积窗口跳步移动，空间尺寸约减半。',
      'Stride=2 makes the kernel move in jumps, roughly halving spatial size.',
    ),
    defaultPrediction: {
      outputHeight: 64,
      outputWidth: 64,
      outputChannels: 32,
      convParameterCount: 864,
      comparison: 'conv-fewer',
    },
  },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'CNN shape 场景',
        title: '观察 Conv2d 的输出和参数量',
        reset: '重置场景',
        scenario: '场景',
        code: '代码线索',
        inputTensor: '输入 tensor',
        evidence: '公式计算结果',
        shape: '输出 shape',
        convParams: '卷积参数',
        denseParams: 'dense 对比',
        ratio: 'dense / conv',
        why: '卷积参数只跟 kernel、输入 channel 和 filter 数有关；dense 要把每个输入像素连到每个输出位置。',
      }
    : {
        eyebrow: 'CNN shape scenarios',
        title: 'Predict Conv2d output and parameters first',
        reset: 'Reset scenario',
        scenario: 'Scenario',
        code: 'Code clue',
        inputTensor: 'Input tensor',
        evidence: 'Formula evidence',
        shape: 'Output shape',
        convParams: 'Convolution params',
        denseParams: 'Dense comparison',
        ratio: 'dense / conv',
        why: 'Convolution parameters depend on kernel size, input channels, and filters; dense connects every input pixel to every output position.',
      },
)

const selectedScenarioId = ref<CnnShapeParameterScenarioId>('same-padding-rgb')
const prediction = ref<CnnShapeParameterPrediction>({ ...scenarioCopy[0].defaultPrediction })

const activeScenario = computed<CnnShapeParameterScenario>(
  () => cnnShapeParameterScenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? cnnShapeParameterScenarios[0],
)

const activeScenarioCopy = computed(
  () => scenarioCopy.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarioCopy[0],
)

const snapshot = computed(() =>
  evaluateCnnShapeParameterChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

const evidenceCards = computed(() => [
  {
    id: 'shape',
    label: copy.value.shape,
    formula: 'floor((input + 2 * padding - kernel) / stride) + 1',
    value: `${snapshot.value.expected.outputHeight} x ${snapshot.value.expected.outputWidth} x ${snapshot.value.expected.outputChannels}`,
    detail: `H numerator ${snapshot.value.evidence.heightNumerator}, W numerator ${snapshot.value.evidence.widthNumerator}`,
  },
  {
    id: 'conv',
    label: copy.value.convParams,
    formula: 'kernelH * kernelW * inputChannels * outputChannels + bias',
    value: formatInteger(snapshot.value.expected.convParameterCount),
    detail: `${formatInteger(snapshot.value.evidence.convWeights)} + ${formatInteger(snapshot.value.evidence.convBiases)}`,
  },
  {
    id: 'dense',
    label: copy.value.denseParams,
    formula: 'inputUnits * outputUnits + outputUnits',
    value: formatInteger(snapshot.value.expected.denseParameterCount),
    detail: `${formatInteger(snapshot.value.evidence.denseInputUnits)} -> ${formatInteger(snapshot.value.evidence.denseOutputUnits)}`,
  },
  {
    id: 'ratio',
    label: copy.value.ratio,
    formula: 'denseParameterCount / convParameterCount',
    value: `${formatRatio(snapshot.value.expected.denseToConvRatio)}x`,
    detail: localized(
      loc(
        '这就是参数共享带来的数量级差距。',
        'This is the order-of-magnitude gap from parameter sharing.',
      ),
    ),
  },
])

function chooseScenario(scenario: ScenarioCopy) {
  selectedScenarioId.value = scenario.id
  prediction.value = { ...scenario.defaultPrediction }
}

function resetPrediction() {
  selectedScenarioId.value = 'same-padding-rgb'
  prediction.value = { ...activeScenarioCopy.value.defaultPrediction }
}

</script>

<template>
  <section class="cnn-shape-challenge" :style="{ '--cnn-shape-accent': props.accent }">
    <header class="cnn-shape-challenge__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h3>{{ copy.title }}</h3>
      </div>

      <button type="button" class="cnn-shape-challenge__reset" @click="resetPrediction">
        {{ copy.reset }}
      </button>
    </header>

    <section class="cnn-shape-challenge__scenarios" :aria-label="copy.scenario">
      <button
        v-for="scenario in scenarioCopy"
        :key="scenario.id"
        type="button"
        class="cnn-shape-challenge__scenario"
        :class="{ 'is-active': selectedScenarioId === scenario.id }"
        :aria-pressed="selectedScenarioId === scenario.id"
        @click="chooseScenario(scenario)"
      >
        <strong>{{ localized(scenario.title) }}</strong>
        <span>{{ localized(scenario.summary) }}</span>
      </button>
    </section>

    <section class="cnn-shape-challenge__code" :aria-label="copy.code">
      <div>
        <span>{{ copy.inputTensor }}</span>
        <strong>{{ activeScenario.inputHeight }} x {{ activeScenario.inputWidth }} x {{ activeScenario.inputChannels }}</strong>
      </div>
      <code>{{ activeScenario.code }}</code>
    </section>

    <section class="cnn-shape-challenge__evidence" :aria-label="copy.evidence">
      <article v-for="card in evidenceCards" :key="card.id">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <code>{{ card.formula }}</code>
        <small>{{ card.detail }}</small>
      </article>
    </section>

    <p>{{ copy.why }}</p>
  </section>
</template>
