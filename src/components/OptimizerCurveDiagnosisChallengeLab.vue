<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import {
  evaluateOptimizerCurveDiagnosisChallenge,
  optimizerCurveDiagnosisScenarios,
  type OptimizerCurveExperiment,
  type OptimizerCurveIssue,
  type OptimizerCurvePrediction,
  type OptimizerCurveScenarioId,
} from '../simulations/optimizerCurveDiagnosisChallenge'

interface ScenarioCopy {
  id: OptimizerCurveScenarioId
  title: LocalizedCopy
  summary: LocalizedCopy
  setupNote: LocalizedCopy
  defaultPrediction: OptimizerCurvePrediction
}

const { locale } = useI18n()

function loc<T>(zhCN: T, en: T): { 'zh-CN': T; en: T } {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return locale.value === 'zh-CN' ? '非有限' : 'non-finite'
  if (value >= 10) return value.toFixed(1)
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

const scenarioCopy: ScenarioCopy[] = [
  {
    id: 'lr-divergence',
    title: loc('学习率发散', 'Learning-rate divergence'),
    summary: loc('loss 上冲并出现非有限值，先怀疑步长过大。', 'Loss spikes and becomes non-finite; suspect the step size first.'),
    setupNote: loc('同一个模型、同一个 seed，只把学习率设得很激进。', 'Same model and seed; only the learning rate is aggressive.'),
    defaultPrediction: {
      issue: 'batch-noise-too-high',
      nextExperiment: 'increase-batch-size',
    },
  },
  {
    id: 'small-batch-noise',
    title: loc('小 batch 抖动', 'Small-batch jitter'),
    summary: loc('训练曲线很抖，但整体趋势仍在下降。', 'The training curve jitters, but the trend still falls.'),
    setupNote: loc('学习率不变，但 batch size 很小。', 'Same learning rate, very small batch.'),
    defaultPrediction: {
      issue: 'learning-rate-too-high',
      nextExperiment: 'lower-learning-rate',
    },
  },
  {
    id: 'ravine-zigzag',
    title: loc('狭长谷震荡', 'Ravine zig-zag'),
    summary: loc('SGD 来回摆动，下一步应比较动量或自适应状态。', 'SGD zig-zags; compare momentum or adaptive state next.'),
    setupNote: loc('同一任务落在狭长曲面里，当前 SGD 没有动量。', 'Same task in a narrow valley; current SGD has no momentum.'),
    defaultPrediction: {
      issue: 'schedule-needed',
      nextExperiment: 'add-or-move-lr-decay',
    },
  },
  {
    id: 'schedule-plateau',
    title: loc('平台期无衰减', 'Plateau without decay'),
    summary: loc('早期下降后进入平台，学习率始终不变。', 'After early progress, the curve plateaus while learning rate stays constant.'),
    setupNote: loc('优化器不变，早期下降之后继续使用固定学习率。', 'Same optimizer; constant learning rate after early progress.'),
    defaultPrediction: {
      issue: 'momentum-or-adaptive-needed',
      nextExperiment: 'add-momentum-or-adam',
    },
  },
]

const issueOptions: Array<{ id: OptimizerCurveIssue; label: LocalizedCopy; detail: LocalizedCopy }> = [
  {
    id: 'learning-rate-too-high',
    label: loc('学习率过高', 'Learning rate too high'),
    detail: loc('步长太大，loss 可能震荡、上冲或 NaN。', 'The step is too large, so loss can oscillate, spike, or become NaN.'),
  },
  {
    id: 'batch-noise-too-high',
    label: loc('batch 噪声过高', 'Batch noise too high'),
    detail: loc('小 batch 让单步梯度很吵，但平滑趋势可能仍下降。', 'Small batches make steps noisy, even when the smoothed trend falls.'),
  },
  {
    id: 'momentum-or-adaptive-needed',
    label: loc('需要动量/自适应', 'Momentum/adaptive needed'),
    detail: loc('狭长曲面里，历史状态能减少来回摆动。', 'In a ravine, update history can reduce zig-zagging.'),
  },
  {
    id: 'schedule-needed',
    label: loc('需要学习率计划', 'Schedule needed'),
    detail: loc('平台期常需要随时间改变步长，而不是换模型。', 'A plateau often needs time-varying step size, not a different model.'),
  },
]

const experimentOptions: Array<{ id: OptimizerCurveExperiment; label: LocalizedCopy; detail: LocalizedCopy }> = [
  {
    id: 'lower-learning-rate',
    label: loc('只降低 lr', 'Lower only lr'),
    detail: loc('保持 optimizer、batch 和 seed 不变。', 'Keep optimizer, batch, and seed fixed.'),
  },
  {
    id: 'increase-batch-size',
    label: loc('只增大 batch', 'Increase only batch'),
    detail: loc('或用梯度累积比较噪声。', 'Or compare gradient accumulation for noise.'),
  },
  {
    id: 'add-momentum-or-adam',
    label: loc('只加动量/Adam', 'Add only momentum/Adam'),
    detail: loc('比较更新历史，不同时改学习率计划。', 'Compare update history without also changing the schedule.'),
  },
  {
    id: 'add-or-move-lr-decay',
    label: loc('只加/提前衰减', 'Add/move lr decay'),
    detail: loc('同一 optimizer 下调整步长时间表。', 'Adjust the step-size timeline under the same optimizer.'),
  },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'Optimizer curve 挑战',
        title: '先诊断曲线，再选择下一步实验',
        reset: '重置预测',
        scenario: '曲线场景',
        setup: '实验设置',
        train: 'train loss',
        validation: 'validation loss',
        learningRate: 'lr',
        prediction: '你的诊断',
        issue: '最可能的问题',
        experiment: '下一步单变量实验',
        evidence: '证据指标',
        checkEvidence: '查看证据',
        beforeEvidence: '先选原因和下一步实验，再查看计算证据和反馈。',
        feedback: '反馈',
        correct: '诊断和实验都正确',
        partial: '还有判断需要修正',
        issueCheck: '原因判断',
        experimentCheck: '实验判断',
        yes: '正确',
        no: '待修正',
        present: '有',
        absent: '无',
        finalTrainLoss: '最终 train loss',
        finalValidationLoss: '最终 validation loss',
        trainVolatility: 'train 抖动',
        validationVolatility: 'validation 抖动',
        plateauDelta: '末段变化',
        nonFinite: '非有限 loss',
        lrChanges: '学习率变化次数',
        why: '一次只改一个旋钮，才能把曲线现象和原因连起来；否则 optimizer、batch、lr schedule 的影响会混在一起。',
      }
    : {
        eyebrow: 'Optimizer curve challenge',
        title: 'Diagnose the curve before choosing the next experiment',
        reset: 'Reset prediction',
        scenario: 'Curve scenario',
        setup: 'Experiment setup',
        train: 'train loss',
        validation: 'validation loss',
        learningRate: 'lr',
        prediction: 'Your diagnosis',
        issue: 'Most likely issue',
        experiment: 'Next one-variable experiment',
        evidence: 'Evidence metrics',
        checkEvidence: 'Check evidence',
        beforeEvidence: 'Choose the issue and next experiment before checking computed evidence and feedback.',
        feedback: 'Feedback',
        correct: 'Diagnosis and experiment are both correct',
        partial: 'Some checks still need revision',
        issueCheck: 'Issue check',
        experimentCheck: 'Experiment check',
        yes: 'Correct',
        no: 'Revise',
        present: 'yes',
        absent: 'no',
        finalTrainLoss: 'Final train loss',
        finalValidationLoss: 'Final validation loss',
        trainVolatility: 'Train jitter',
        validationVolatility: 'Validation jitter',
        plateauDelta: 'Tail movement',
        nonFinite: 'Non-finite loss',
        lrChanges: 'Learning-rate changes',
        why: 'Change one knob at a time so the curve pattern can be tied to a cause; otherwise optimizer, batch, and schedule effects blur together.',
      },
)

const selectedScenarioId = ref<OptimizerCurveScenarioId>('lr-divergence')
const prediction = ref<OptimizerCurvePrediction>({ ...scenarioCopy[0].defaultPrediction })
const hasChecked = ref(false)

const activeScenario = computed(
  () =>
    optimizerCurveDiagnosisScenarios.find((scenario) => scenario.id === selectedScenarioId.value) ??
    optimizerCurveDiagnosisScenarios[0],
)

const activeScenarioCopy = computed(
  () => scenarioCopy.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarioCopy[0],
)

const snapshot = computed(() =>
  evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

const chart = computed(() => {
  const width = 420
  const height = 220
  const padding = { top: 24, right: 26, bottom: 32, left: 38 }
  const points = activeScenario.value.points
  const finiteLosses = points
    .flatMap((point) => [point.trainLoss, point.validationLoss])
    .filter(Number.isFinite)
  const minLoss = Math.min(...finiteLosses, 0)
  const maxFiniteLoss = Math.max(...finiteLosses, 1)
  const maxLoss = maxFiniteLoss + (snapshot.value.evidence.hasNonFiniteLoss ? 0.35 : 0.08)
  const xStep = (width - padding.left - padding.right) / Math.max(1, points.length - 1)
  const yScale = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : maxLoss
    const ratio = (safeValue - minLoss) / Math.max(0.01, maxLoss - minLoss)
    return height - padding.bottom - ratio * (height - padding.top - padding.bottom)
  }
  const toPath = (key: 'trainLoss' | 'validationLoss') =>
    points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${padding.left + index * xStep} ${yScale(point[key])}`)
      .join(' ')
  const lrPath = points
    .map((point, index) => {
      const x = padding.left + index * xStep
      const y = height - 16 - point.learningRate * 28
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return {
    width,
    height,
    trainPath: toPath('trainLoss'),
    validationPath: toPath('validationLoss'),
    lrPath,
    nonFinitePoints: points
      .map((point, index) => ({ point, x: padding.left + index * xStep, y: yScale(Number.POSITIVE_INFINITY) }))
      .filter(({ point }) => !Number.isFinite(point.trainLoss) || !Number.isFinite(point.validationLoss)),
  }
})

const evidenceCards = computed(() => [
  { id: 'final-train', label: copy.value.finalTrainLoss, value: formatNumber(snapshot.value.evidence.finalTrainLoss) },
  {
    id: 'final-validation',
    label: copy.value.finalValidationLoss,
    value: formatNumber(snapshot.value.evidence.finalValidationLoss),
  },
  { id: 'train-volatility', label: copy.value.trainVolatility, value: formatNumber(snapshot.value.evidence.trainVolatility) },
  {
    id: 'validation-volatility',
    label: copy.value.validationVolatility,
    value: formatNumber(snapshot.value.evidence.validationVolatility),
  },
  { id: 'plateau', label: copy.value.plateauDelta, value: formatNumber(snapshot.value.evidence.plateauDelta) },
  {
    id: 'non-finite',
    label: copy.value.nonFinite,
    value: snapshot.value.evidence.hasNonFiniteLoss ? copy.value.present : copy.value.absent,
  },
  { id: 'lr-changes', label: copy.value.lrChanges, value: String(snapshot.value.evidence.learningRateChanges) },
])

const resultRows = computed(() => [
  { id: 'issue', label: copy.value.issueCheck, correct: snapshot.value.result.issueCorrect },
  { id: 'experiment', label: copy.value.experimentCheck, correct: snapshot.value.result.experimentCorrect },
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
  <section class="optimizer-curve-challenge">
    <header class="optimizer-curve-challenge__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h4>{{ copy.title }}</h4>
      </div>
      <button type="button" class="optimizer-curve-challenge__reset" @click="resetPrediction">
        {{ copy.reset }}
      </button>
    </header>

    <section class="optimizer-curve-challenge__scenarios" :aria-label="copy.scenario">
      <button
        v-for="scenario in scenarioCopy"
        :key="scenario.id"
        type="button"
        :class="{ 'is-active': selectedScenarioId === scenario.id }"
        @click="chooseScenario(scenario)"
      >
        <strong>{{ localized(scenario.title) }}</strong>
        <span>{{ localized(scenario.summary) }}</span>
      </button>
    </section>

    <section class="optimizer-curve-challenge__workspace">
      <article class="optimizer-curve-challenge__chart" :aria-label="copy.setup">
        <div>
          <span>{{ copy.setup }}</span>
          <strong>
            {{ activeScenario.optimizer }} · batch {{ activeScenario.batchSize }} · lr
            {{ formatNumber(activeScenario.learningRate) }}
          </strong>
          <p>{{ localized(activeScenarioCopy.setupNote) }}</p>
        </div>
        <svg :viewBox="`0 0 ${chart.width} ${chart.height}`" role="img" :aria-label="`${copy.train}, ${copy.validation}, ${copy.learningRate}`">
          <path class="optimizer-curve-challenge__grid" d="M 38 24 V 188 H 394" />
          <path class="optimizer-curve-challenge__train" :d="chart.trainPath" />
          <path class="optimizer-curve-challenge__validation" :d="chart.validationPath" />
          <path class="optimizer-curve-challenge__lr" :d="chart.lrPath" />
          <circle
            v-for="marker in chart.nonFinitePoints"
            :key="marker.point.step"
            class="optimizer-curve-challenge__nonfinite"
            :cx="marker.x"
            :cy="marker.y"
            r="5"
          />
        </svg>
        <div class="optimizer-curve-challenge__legend">
          <span><i class="is-train"></i>{{ copy.train }}</span>
          <span><i class="is-validation"></i>{{ copy.validation }}</span>
          <span><i class="is-lr"></i>{{ copy.learningRate }}</span>
        </div>
      </article>

      <article class="optimizer-curve-challenge__prediction">
        <span>{{ copy.prediction }}</span>
        <fieldset>
          <legend>{{ copy.issue }}</legend>
          <label v-for="option in issueOptions" :key="option.id">
            <input v-model="prediction.issue" type="radio" name="optimizer-curve-issue" :value="option.id" />
            <span>
              <strong>{{ localized(option.label) }}</strong>
              <small>{{ localized(option.detail) }}</small>
            </span>
          </label>
        </fieldset>

        <fieldset>
          <legend>{{ copy.experiment }}</legend>
          <label v-for="option in experimentOptions" :key="option.id">
            <input
              v-model="prediction.nextExperiment"
              type="radio"
              name="optimizer-curve-experiment"
              :value="option.id"
            />
            <span>
              <strong>{{ localized(option.label) }}</strong>
              <small>{{ localized(option.detail) }}</small>
            </span>
          </label>
        </fieldset>
      </article>
    </section>

    <section v-if="!hasChecked" class="optimizer-curve-challenge__gate">
      <span>{{ copy.beforeEvidence }}</span>
      <button type="button" class="optimizer-curve-challenge__reset" @click="revealEvidence">
        {{ copy.checkEvidence }}
      </button>
    </section>

    <section v-if="hasChecked" class="optimizer-curve-challenge__evidence" :aria-label="copy.evidence">
      <article v-for="card in evidenceCards" :key="card.id">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </section>

    <section
      v-if="hasChecked"
      class="optimizer-curve-challenge__feedback"
      :class="{ 'is-correct': snapshot.result.allCorrect }"
      :aria-label="copy.feedback"
    >
      <div>
        <span>{{ copy.feedback }}</span>
        <strong>{{ snapshot.result.allCorrect ? copy.correct : copy.partial }}</strong>
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
