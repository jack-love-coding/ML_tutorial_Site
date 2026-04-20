<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, ExperimentConfig, StorySection, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  activeSection?: StorySection
  snapshot?: TrainingSnapshot
  config: ExperimentConfig
}>()

const { locale } = useI18n()

function localizedText(copy: { 'zh-CN': string; en: string }) {
  return copy[locale.value as AppLocale]
}

const activeSectionId = computed(() => props.activeSection?.id ?? 'why-loss')
const regressionLossKind = computed(() => String(props.config.regressionLossKind ?? 'mse'))
const distributionKind = computed(() => String(props.config.distributionKind ?? 'gaussian'))

const sectionSummary = computed(() =>
  localizedText(props.activeSection?.callout ?? { 'zh-CN': '', en: '' }),
)

const panelCopy = computed(() => {
  const shared =
    locale.value === 'zh-CN'
      ? {
          eyebrow: '本章读后你应该能回答',
          noteLabel: '一句话复习',
        }
      : {
          eyebrow: 'After this chapter, you should be able to answer',
          noteLabel: 'One-line review',
        }

  if (activeSectionId.value === 'regression-losses') {
    return {
      ...shared,
      title: locale.value === 'zh-CN' ? 'MSE 和 MAE 到底差在哪里？' : 'What really separates MSE from MAE?',
      note:
        locale.value === 'zh-CN'
          ? '关键不在于公式长得不同，而在于它们会不会把大误差额外放大。'
          : 'The key is not cosmetic formula differences, but whether large errors get amplified.',
      cards: [
        {
          id: 'residual',
          label: locale.value === 'zh-CN' ? '当前残差是多少？' : 'What is the current residual?',
          value: round(Number(props.snapshot?.selectedObservation?.residual ?? 0)),
        },
        {
          id: 'rule',
          label: locale.value === 'zh-CN' ? '现在采用哪种规则？' : 'Which rule is active now?',
          value: regressionLossKind.value === 'mse' ? 'MSE' : 'MAE',
        },
        {
          id: 'dataset-loss',
          label: locale.value === 'zh-CN' ? '离群点会不会拉偏拟合？' : 'Does the outlier pull the fit?',
          value: round(Number(props.snapshot?.selectedObservation?.totalRegressionLoss ?? 0)),
        },
      ],
    }
  }

  if (activeSectionId.value === 'classification-losses') {
    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? 'BCE 为什么会扩展成 Softmax？'
          : 'Why does BCE expand into softmax?',
      note:
        locale.value === 'zh-CN'
          ? '二分类里只需要一个概率，因为另一类自动是 1-p；多分类里必须把所有类别一起归一化。只剩两类时，softmax 会退化成 sigmoid，所以 BCE 就是 softmax cross-entropy 的二分类特例。'
          : 'Binary classification only needs one probability because the other class is automatically 1 - p. Multiclass classification must normalize all classes together. When only two classes remain, softmax collapses into sigmoid, so BCE is the binary special case of softmax cross-entropy.',
      cards: [
        {
          id: 'bce',
          label: locale.value === 'zh-CN' ? '当前 BCE 有多大？' : 'How large is the current BCE?',
          value: round(Number(props.snapshot?.selectedObservation?.bce ?? 0)),
        },
        {
          id: 'softmax',
          label: locale.value === 'zh-CN' ? '当前 Softmax CE 有多大？' : 'How large is the current softmax CE?',
          value: round(Number(props.snapshot?.selectedObservation?.multiclassCrossEntropy ?? 0)),
        },
        {
          id: 'binary-margin',
          label: locale.value === 'zh-CN' ? '二分类所需 logit 差是多少？' : 'What binary logit gap is needed?',
          value: round(Number(props.snapshot?.selectedObservation?.binaryMargin ?? 0), 2),
        },
        {
          id: 'softmax-margin',
          label: locale.value === 'zh-CN' ? '三分类所需领先分数是多少？' : 'What three-class lead score is needed?',
          value: round(Number(props.snapshot?.selectedObservation?.softmaxMargin ?? 0), 2),
        },
      ],
    }
  }

  if (activeSectionId.value === 'likelihood-intuition') {
    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? '似然到底在给谁打分？'
          : 'Who is likelihood actually scoring?',
      note:
        locale.value === 'zh-CN'
          ? '似然不是给数据打分，而是在比较“哪个参数更能解释这批数据”。'
          : 'Likelihood is not scoring the data itself. It is comparing which parameter explains that data better.',
      cards: [
        {
          id: 'trial-count',
          label: locale.value === 'zh-CN' ? '观测了多少次？' : 'How many trials were observed?',
          value: Number(props.snapshot?.selectedObservation?.trialCount ?? 0),
        },
        {
          id: 'successes',
          label: locale.value === 'zh-CN' ? '其中有多少次成功？' : 'How many successes were observed?',
          value: Number(props.snapshot?.selectedObservation?.observedSuccesses ?? 0),
        },
        {
          id: 'candidate',
          label: locale.value === 'zh-CN' ? '当前正在测试哪个参数？' : 'Which parameter is being tested now?',
          value: round(Number(props.snapshot?.selectedObservation?.candidateProbability ?? 0), 2),
        },
      ],
    }
  }

  if (activeSectionId.value === 'negative-log') {
    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? '为什么要取对数并加负号？'
          : 'Why take the log and add a minus sign?',
      note:
        locale.value === 'zh-CN'
          ? '对数把连乘变成连加，负号把最大化似然改写成最小化损失。'
          : 'The log turns products into sums, and the minus sign turns likelihood maximization into loss minimization.',
      cards: [
        {
          id: 'joint',
          label: locale.value === 'zh-CN' ? '联合似然现在有多小？' : 'How small is the joint likelihood now?',
          value: formatNumber(Number(props.snapshot?.jointLikelihood ?? 0)),
        },
        {
          id: 'log',
          label: locale.value === 'zh-CN' ? '对数似然是多少？' : 'What is the log-likelihood?',
          value: round(Number(props.snapshot?.jointLogLikelihood ?? 0)),
        },
        {
          id: 'nll',
          label: locale.value === 'zh-CN' ? '翻译成损失后是多少？' : 'What does it become as a loss?',
          value: round(Number(props.snapshot?.selectedObservation?.coinNll ?? 0)),
        },
      ],
    }
  }

  if (activeSectionId.value === 'mle-bridge') {
    const distributionLabel =
      distributionKind.value === 'gaussian'
        ? 'Gaussian'
        : distributionKind.value === 'laplace'
          ? 'Laplace'
          : 'Bernoulli'

    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? 'MLE 如何解释常见 loss？'
          : 'How does MLE explain familiar losses?',
      note:
        locale.value === 'zh-CN'
          ? '一旦先写下数据生成假设，负对数似然往往就自然变成了我们熟悉的损失函数。'
          : 'Once a data-generation assumption is written down, the negative log-likelihood often turns naturally into a familiar loss.',
      cards: [
        {
          id: 'distribution',
          label: locale.value === 'zh-CN' ? '当前分布假设是什么？' : 'What is the current distribution assumption?',
          value: distributionLabel,
        },
        {
          id: 'nll',
          label: locale.value === 'zh-CN' ? '当前负对数似然是多少？' : 'What is the current negative log-likelihood?',
          value: round(Number(props.snapshot?.selectedObservation?.nll ?? 0)),
        },
        {
          id: 'equivalence',
          label: locale.value === 'zh-CN' ? '它对应哪种 loss？' : 'Which loss does it match?',
          value: String(props.snapshot?.selectedObservation?.equivalence ?? 'MSE'),
        },
      ],
    }
  }

  const sampleObjective = props.snapshot?.sampleLossBreakdown?.length
    ? round(
        props.snapshot.sampleLossBreakdown.reduce((sum, sample) => sum + sample.loss, 0) /
          props.snapshot.sampleLossBreakdown.length,
      )
    : 0

  return {
    ...shared,
    title:
      locale.value === 'zh-CN'
        ? '为什么训练前要先定义 loss？'
        : 'Why define the loss before training?',
    note:
      locale.value === 'zh-CN'
        ? '误差只是差了多少；loss 才是训练真正要最小化的评分规则。'
        : 'Error only measures the gap. Loss is the scoring rule training actually minimizes.',
    cards: [
      {
        id: 'residual',
        label: locale.value === 'zh-CN' ? '当前误差是多少？' : 'What is the current error?',
        value: round(Number(props.snapshot?.selectedObservation?.residual ?? 0)),
      },
      {
        id: 'penalty',
        label: locale.value === 'zh-CN' ? '这个误差被记成多少损失？' : 'How much loss does that error become?',
        value: round(
          Number(
            props.snapshot?.selectedObservation?.[
              regressionLossKind.value === 'mse' ? 'mse' : 'mae'
            ] ?? 0,
          ),
        ),
      },
      {
        id: 'objective',
        label: locale.value === 'zh-CN' ? '多个样本合并后的目标是多少？' : 'What is the combined objective over samples?',
        value: sampleObjective,
      },
    ],
  }
})

function formatNumber(value: number) {
  if (value >= 0.001) return round(value)
  return value.toExponential(2)
}
</script>

<template>
  <section class="panel loss-reading-panel">
    <div class="panel__heading">
      <span>{{ panelCopy.eyebrow }}</span>
      <strong>{{ panelCopy.title }}</strong>
    </div>

    <p class="loss-reading-panel__lead">{{ sectionSummary }}</p>

    <div class="loss-reading-grid">
      <article
        v-for="card in panelCopy.cards"
        :key="card.id"
        class="loss-reading-card"
      >
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </div>

    <div class="loss-reading-panel__note">
      <span>{{ panelCopy.noteLabel }}</span>
      <p>{{ panelCopy.note }}</p>
    </div>
  </section>
</template>
