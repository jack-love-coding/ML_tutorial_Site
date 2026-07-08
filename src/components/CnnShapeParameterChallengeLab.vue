<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import {
  cnnShapeParameterScenarios,
  evaluateCnnShapeParameterChallenge,
  type CnnParameterComparison,
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

const comparisonOptions: Array<{ id: CnnParameterComparison; label: LocalizedCopy; detail: LocalizedCopy }> = [
  {
    id: 'conv-fewer',
    label: loc('卷积更少', 'Conv fewer'),
    detail: loc('局部连接和共享权重胜出。', 'Local connectivity and shared weights win.'),
  },
  {
    id: 'dense-fewer',
    label: loc('全连接更少', 'Dense fewer'),
    detail: loc('整图连接反而更省参数。', 'Whole-image connections use fewer parameters.'),
  },
  {
    id: 'same',
    label: loc('一样多', 'Same'),
    detail: loc('两种层参数量相同。', 'The two layers use the same number of parameters.'),
  },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'CNN shape 挑战',
        title: '先预测 Conv2d 的输出和参数量',
        reset: '重置预测',
        scenario: '场景',
        code: '代码线索',
        inputTensor: '输入 tensor',
        prediction: '你的预测',
        outputHeight: '输出高',
        outputWidth: '输出宽',
        outputChannels: '输出 channel',
        convParameterCount: 'Conv 参数量',
        comparison: '谁的参数更少？',
        evidence: '公式证据',
        checkEvidence: '查看证据',
        beforeEvidence: '先完成预测，再查看公式证据和反馈。',
        feedback: '反馈',
        correct: '全部关键判断正确',
        partial: '还有判断需要修正',
        shape: '输出 shape',
        convParams: '卷积参数',
        denseParams: 'dense 对比',
        ratio: 'dense / conv',
        resultShape: 'shape 判断',
        resultChannels: 'channel 判断',
        resultParams: '参数量判断',
        resultComparison: '对比判断',
        yes: '正确',
        no: '待修正',
        why: '卷积参数只跟 kernel、输入 channel 和 filter 数有关；dense 要把每个输入像素连到每个输出位置。',
      }
    : {
        eyebrow: 'CNN shape challenge',
        title: 'Predict Conv2d output and parameters first',
        reset: 'Reset prediction',
        scenario: 'Scenario',
        code: 'Code clue',
        inputTensor: 'Input tensor',
        prediction: 'Your prediction',
        outputHeight: 'Output height',
        outputWidth: 'Output width',
        outputChannels: 'Output channels',
        convParameterCount: 'Conv parameters',
        comparison: 'Which has fewer parameters?',
        evidence: 'Formula evidence',
        checkEvidence: 'Check evidence',
        beforeEvidence: 'Finish your prediction first, then check formula evidence and feedback.',
        feedback: 'Feedback',
        correct: 'All key checks are correct',
        partial: 'Some checks still need revision',
        shape: 'Output shape',
        convParams: 'Convolution params',
        denseParams: 'Dense comparison',
        ratio: 'dense / conv',
        resultShape: 'Shape check',
        resultChannels: 'Channel check',
        resultParams: 'Parameter check',
        resultComparison: 'Comparison check',
        yes: 'Correct',
        no: 'Revise',
        why: 'Convolution parameters depend on kernel size, input channels, and filters; dense connects every input pixel to every output position.',
      },
)

const selectedScenarioId = ref<CnnShapeParameterScenarioId>('same-padding-rgb')
const prediction = ref<CnnShapeParameterPrediction>({ ...scenarioCopy[0].defaultPrediction })
const hasChecked = ref(false)

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

const predictionFields = computed(() => [
  { id: 'outputHeight', label: copy.value.outputHeight, value: 'outputHeight' as const },
  { id: 'outputWidth', label: copy.value.outputWidth, value: 'outputWidth' as const },
  { id: 'outputChannels', label: copy.value.outputChannels, value: 'outputChannels' as const },
  { id: 'convParameterCount', label: copy.value.convParameterCount, value: 'convParameterCount' as const },
])

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

const resultRows = computed(() => [
  { id: 'shape', label: copy.value.resultShape, correct: snapshot.value.result.outputShapeCorrect },
  { id: 'channels', label: copy.value.resultChannels, correct: snapshot.value.result.outputChannelsCorrect },
  { id: 'params', label: copy.value.resultParams, correct: snapshot.value.result.convParameterCountCorrect },
  { id: 'comparison', label: copy.value.resultComparison, correct: snapshot.value.result.comparisonCorrect },
])

function chooseScenario(scenario: ScenarioCopy) {
  selectedScenarioId.value = scenario.id
  prediction.value = { ...scenario.defaultPrediction }
  hasChecked.value = false
}

function resetPrediction() {
  prediction.value = { ...activeScenarioCopy.value.defaultPrediction }
  hasChecked.value = false
}

function revealEvidence() {
  hasChecked.value = true
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

    <section class="cnn-shape-challenge__prediction" :aria-label="copy.prediction">
      <label v-for="field in predictionFields" :key="field.id">
        <span>{{ field.label }}</span>
        <input
          v-model.number="prediction[field.value]"
          type="number"
          min="0"
          step="1"
          inputmode="numeric"
        >
      </label>
    </section>

    <fieldset class="cnn-shape-challenge__comparison">
      <legend>{{ copy.comparison }}</legend>
      <label
        v-for="option in comparisonOptions"
        :key="option.id"
        :class="{ 'is-active': prediction.comparison === option.id }"
      >
        <input v-model="prediction.comparison" type="radio" name="cnn-parameter-comparison" :value="option.id">
        <span>
          <strong>{{ localized(option.label) }}</strong>
          <small>{{ localized(option.detail) }}</small>
        </span>
      </label>
    </fieldset>

    <section v-if="!hasChecked" class="cnn-shape-challenge__gate">
      <span>{{ copy.beforeEvidence }}</span>
      <button type="button" class="cnn-shape-challenge__reset" @click="revealEvidence">
        {{ copy.checkEvidence }}
      </button>
    </section>

    <section v-if="hasChecked" class="cnn-shape-challenge__evidence" :aria-label="copy.evidence">
      <article v-for="card in evidenceCards" :key="card.id">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <code>{{ card.formula }}</code>
        <small>{{ card.detail }}</small>
      </article>
    </section>

    <section
      v-if="hasChecked"
      class="cnn-shape-challenge__feedback"
      :class="{ 'is-correct': snapshot.result.allCorrect }"
      :aria-label="copy.feedback"
    >
      <div>
        <span>{{ snapshot.result.allCorrect ? copy.correct : copy.partial }}</span>
        <strong>{{ snapshot.expected.outputHeight }} x {{ snapshot.expected.outputWidth }} x {{ snapshot.expected.outputChannels }}</strong>
      </div>
      <dl>
        <div v-for="row in resultRows" :key="row.id">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.correct ? copy.yes : copy.no }}</dd>
        </div>
      </dl>
      <p>{{ copy.why }}</p>
    </section>
  </section>
</template>
