<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ExperimentConfig, ExperimentConfigValue, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'
import LossCurvePlot from './LossCurvePlot.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'update-config': [key: string, value: ExperimentConfigValue]
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        distribution: '分布假设',
        parameters: '参数',
        likelihood: 'Likelihood',
        negativeLogLikelihood: 'Negative log-likelihood',
        equivalentLoss: '对应 loss',
        observation: '观测值',
        mean: '均值 / 参数',
        sigma: '标准差',
        probability: 'Bernoulli 概率',
        assumption: '生成假设',
        chain: '分布假设 -> 似然 -> 负对数 -> loss',
        bridge:
          '这一步真正解释的是：为什么不同任务会自然地长出不同的损失函数，而不是所有任务都套同一个公式。',
      }
    : {
        distribution: 'Distribution',
        parameters: 'Parameters',
        likelihood: 'Likelihood',
        negativeLogLikelihood: 'Negative log-likelihood',
        equivalentLoss: 'Equivalent loss',
        observation: 'Observation',
        mean: 'Mean / parameter',
        sigma: 'Standard deviation',
        probability: 'Bernoulli probability',
        assumption: 'Generative assumption',
        chain: 'Assumption -> likelihood -> negative log -> loss',
        bridge:
          'This step explains why different tasks naturally produce different loss functions instead of forcing every task into the same formula.',
      },
)

const distributionKind = computed(() => String(props.config.distributionKind ?? 'gaussian'))
const targetValue = computed(() => Number(props.config.targetValue ?? 1.2))
const mean = computed(() => Number(props.config.mean ?? 0.8))
const sigma = computed(() => Number(props.config.sigma ?? 0.85))
const probability = computed(() => Number(props.config.probability ?? 0.76))
const classificationLabel = computed(() => Number(props.config.classificationLabel ?? 1))

const distributionLabel = computed(() => {
  if (distributionKind.value === 'gaussian') {
    return locale.value === 'zh-CN' ? 'Gaussian / 高斯' : 'Gaussian'
  }
  if (distributionKind.value === 'laplace') {
    return locale.value === 'zh-CN' ? 'Laplace / 拉普拉斯' : 'Laplace'
  }
  return locale.value === 'zh-CN' ? 'Bernoulli / 伯努利' : 'Bernoulli'
})

const assumptionCopy = computed(() => {
  if (distributionKind.value === 'gaussian') {
    return locale.value === 'zh-CN'
      ? '误差大多较小、偶尔较大，而且正负方向大致对称。'
      : 'Errors are usually small, occasionally larger, and roughly symmetric around zero.'
  }
  if (distributionKind.value === 'laplace') {
    return locale.value === 'zh-CN'
      ? '相比 Gaussian，它更愿意容忍少数较大的偏差。'
      : 'Compared with Gaussian, it is more willing to tolerate a few larger deviations.'
  }
  return locale.value === 'zh-CN'
    ? '输出本来就是 0 或 1 的事件，例如是否录取、是否为垃圾邮件。'
    : 'The output is inherently a 0-or-1 event, such as admission or spam detection.'
})

const formulas = computed(() => {
  if (distributionKind.value === 'gaussian') {
    return locale.value === 'zh-CN'
      ? `Gaussian 假设下：

$$p(y\\mid \\mu,\\sigma)=\\frac{1}{\\sqrt{2\\pi}\\sigma}\\exp\\left(-\\frac{(y-\\mu)^2}{2\\sigma^2}\\right)$$

取负对数后，和参数无关的常数可以先放在一边，剩下的核心惩罚项会和平方误差同形，所以它自然导向 **MSE**。`
      : `Under a Gaussian assumption:

$$p(y\\mid \\mu,\\sigma)=\\frac{1}{\\sqrt{2\\pi}\\sigma}\\exp\\left(-\\frac{(y-\\mu)^2}{2\\sigma^2}\\right)$$

After taking the negative log, the parameter-independent constants can be set aside and the main penalty has the same shape as squared error, so it naturally leads to **MSE**.`
  }

  if (distributionKind.value === 'laplace') {
    return locale.value === 'zh-CN'
      ? `Laplace 假设下：

$$p(y\\mid \\mu,b)=\\frac{1}{2b}\\exp\\left(-\\frac{|y-\\mu|}{b}\\right)$$

取负对数后，最核心的项和绝对误差成正比，因此它自然导向 **MAE**。`
      : `Under a Laplace assumption:

$$p(y\\mid \\mu,b)=\\frac{1}{2b}\\exp\\left(-\\frac{|y-\\mu|}{b}\\right)$$

After taking the negative log, the main term is proportional to absolute error, so it naturally leads to **MAE**.`
  }

  return locale.value === 'zh-CN'
    ? `Bernoulli 假设下：

$$p(y\\mid p)=p^y(1-p)^{1-y}$$

当标签只能取 0 或 1 时，负对数似然正好就是我们熟悉的 **BCE**。`
    : `Under a Bernoulli assumption:

$$p(y\\mid p)=p^y(1-p)^{1-y}$$

When the label can only be 0 or 1, the negative log-likelihood becomes the familiar **BCE**.`
})

const likelihoodCurve = computed(() => [
  {
    id: 'likelihood',
    label: copy.value.likelihood,
    color: '#1ea67a',
    points: props.snapshot?.lossCurves?.mleLikelihood ?? [],
  },
])

const nllCurve = computed(() => [
  {
    id: 'nll',
    label: copy.value.negativeLogLikelihood,
    color: '#3f6dff',
    points: props.snapshot?.lossCurves?.mleNll ?? [],
  },
])

const markerX = computed(() =>
  distributionKind.value === 'bernoulli' ? probability.value : mean.value,
)

const markerPoints = computed(() => [
  {
    id: 'likelihood-point',
    x: markerX.value,
    y: Number(props.snapshot?.selectedObservation?.likelihood ?? 0),
    color: '#1ea67a',
  },
])

const nllMarkerPoints = computed(() => [
  {
    id: 'nll-point',
    x: markerX.value,
    y: Number(props.snapshot?.selectedObservation?.nll ?? 0),
    color: '#3f6dff',
  },
])

const bridgeSteps = computed(() => [
  {
    id: 'assumption',
    label: copy.value.assumption,
    value: distributionLabel.value,
  },
  {
    id: 'likelihood',
    label: copy.value.likelihood,
    value: round(Number(props.snapshot?.selectedObservation?.likelihood ?? 0)),
  },
  {
    id: 'nll',
    label: copy.value.negativeLogLikelihood,
    value: round(Number(props.snapshot?.selectedObservation?.nll ?? 0)),
  },
  {
    id: 'loss',
    label: copy.value.equivalentLoss,
    value: String(props.snapshot?.selectedObservation?.equivalence ?? 'MSE'),
  },
])

function setDistribution(kind: 'gaussian' | 'laplace' | 'bernoulli') {
  emit('patch-config', {
    lossFamily: 'mle',
    distributionKind: kind,
  })
}

function onNumericInput(
  key: 'mean' | 'sigma' | 'probability' | 'targetValue',
  event: Event,
) {
  const target = event.target as HTMLInputElement
  emit('patch-config', {
    lossFamily: 'mle',
    [key]: Number(target.value),
  })
}

function setLabel(nextLabel: 0 | 1) {
  emit('patch-config', {
    lossFamily: 'mle',
    classificationLabel: nextLabel,
  })
}
</script>

<template>
  <section class="lesson-lab lesson-lab--mle">
    <div class="lesson-lab__controls">
      <div class="lesson-lab__heading">
        <span>{{ copy.distribution }}</span>
        <strong>{{ distributionLabel }}</strong>
      </div>

      <div class="toggle-strip">
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': distributionKind === 'gaussian' }"
          @click="setDistribution('gaussian')"
        >
          Gaussian
        </button>
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': distributionKind === 'laplace' }"
          @click="setDistribution('laplace')"
        >
          Laplace
        </button>
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': distributionKind === 'bernoulli' }"
          @click="setDistribution('bernoulli')"
        >
          Bernoulli
        </button>
      </div>

      <div class="control-group__grid">
        <label v-if="distributionKind !== 'bernoulli'" class="control">
          <span class="control__row">
            <span>{{ copy.observation }}</span>
            <strong>{{ round(targetValue) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="-2.5"
            max="2.5"
            step="0.05"
            :value="targetValue"
            @input="onNumericInput('targetValue', $event)"
          />
        </label>

        <label v-if="distributionKind !== 'bernoulli'" class="control">
          <span class="control__row">
            <span>{{ copy.mean }}</span>
            <strong>{{ round(mean) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="-2.5"
            max="2.5"
            step="0.05"
            :value="mean"
            @input="onNumericInput('mean', $event)"
          />
        </label>

        <label v-if="distributionKind === 'gaussian'" class="control">
          <span class="control__row">
            <span>{{ copy.sigma }}</span>
            <strong>{{ round(sigma) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="0.18"
            max="1.8"
            step="0.02"
            :value="sigma"
            @input="onNumericInput('sigma', $event)"
          />
        </label>

        <label v-if="distributionKind === 'bernoulli'" class="control">
          <span class="control__row">
            <span>{{ copy.probability }}</span>
            <strong>{{ round(probability) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            :value="probability"
            @input="onNumericInput('probability', $event)"
          />
        </label>

        <label v-if="distributionKind === 'bernoulli'" class="control">
          <span class="control__row">
            <span>{{ copy.observation }}</span>
          </span>
          <div class="toggle-strip">
            <button
              type="button"
              class="toggle-strip__button"
              :class="{ 'is-active': classificationLabel === 0 }"
              @click="setLabel(0)"
            >
              y = 0
            </button>
            <button
              type="button"
              class="toggle-strip__button"
              :class="{ 'is-active': classificationLabel === 1 }"
              @click="setLabel(1)"
            >
              y = 1
            </button>
          </div>
        </label>
      </div>
    </div>

    <div class="lesson-lab__visual lesson-lab__visual--stacked">
      <LossCurvePlot :curves="likelihoodCurve" :marker-x="markerX" :marker-points="markerPoints" />
      <LossCurvePlot :curves="nllCurve" :marker-x="markerX" :marker-points="nllMarkerPoints" />
    </div>

    <div class="lesson-lab__summary">
      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.assumption }}</span>
          <strong>{{ distributionLabel }}</strong>
        </div>
        <div class="assumption-card">
          <span>{{ copy.chain }}</span>
          <strong>{{ distributionLabel }}</strong>
          <p>{{ assumptionCopy }}</p>
        </div>
        <MarkdownMathContent :source="formulas" />
      </section>

      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.chain }}</span>
          <strong>{{ props.snapshot?.selectedObservation?.equivalence }}</strong>
        </div>
        <div class="process-chain">
          <article v-for="step in bridgeSteps" :key="step.id" class="process-chain__step">
            <span>{{ step.label }}</span>
            <strong>{{ step.value }}</strong>
          </article>
        </div>
        <p class="lesson-lab__note">{{ copy.bridge }}</p>
      </section>
    </div>
  </section>
</template>
