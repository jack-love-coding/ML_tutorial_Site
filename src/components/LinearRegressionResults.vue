<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StorySection, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  section?: StorySection
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: '训练回放结果',
        subtitle: '当前直线',
        startLoss: '初始 MSE',
        currentLoss: '当前 MSE',
        trainMse: '训练 MSE',
        validationMse: '验证 MSE',
        slope: '斜率',
        intercept: '截距',
        degree: '阶数',
        weightNorm: '权重范数',
        activeWeights: '有效权重',
        areaWeight: '面积权重',
        ageWeight: '房龄权重',
        progress: '训练进度',
        note:
          props.section?.id === 'regularization'
            ? '正则化不会单纯追求训练误差最低，而是让权重更克制，让验证误差更稳定。'
            : props.section?.id === 'overfitting'
              ? '如果训练误差继续下降但验证误差停滞或升高，就说明模型正在记住训练噪声。'
              : props.section?.id === 'multivariate'
                ? '多元回归里，每个权重都对应一个特征贡献；平面移动就是这些贡献被同步调整。'
                : props.section?.id === 'model-limits'
            ? '如果损失不再明显下降，但残差仍呈现结构性偏差，就说明问题更可能来自模型表达能力。'
            : '读数和实验卡同步更新；播放时优先观察损失下降是否和左侧直线移动一致。',
      }
    : {
        title: 'Training playback results',
        subtitle: 'Current line',
        startLoss: 'Initial MSE',
        currentLoss: 'Current MSE',
        trainMse: 'Train MSE',
        validationMse: 'Validation MSE',
        slope: 'Slope',
        intercept: 'Intercept',
        degree: 'Degree',
        weightNorm: 'Weight norm',
        activeWeights: 'Active weights',
        areaWeight: 'Area weight',
        ageWeight: 'Age weight',
        progress: 'Progress',
        note:
          props.section?.id === 'regularization'
            ? 'Regularization does not chase the lowest training error alone; it restrains weights so validation behavior is steadier.'
            : props.section?.id === 'overfitting'
              ? 'If training error keeps falling while validation error stalls or rises, the model is memorizing training noise.'
              : props.section?.id === 'multivariate'
                ? 'In multivariate regression, each weight maps to one feature contribution; plane movement is those contributions changing together.'
                : props.section?.id === 'model-limits'
            ? 'If loss stops falling while residuals keep a pattern, the problem is more likely model expressivity.'
            : 'These readings update with the main lab; while playing, connect loss decrease to the moving line.',
      },
)

const firstSnapshot = computed(() => props.snapshots[0])
const progress = computed(() =>
  Math.round((props.currentStep / Math.max(props.snapshots.length - 1, 1)) * 100),
)

const resultCards = computed(() => [
  ...(props.section?.id === 'multivariate'
    ? [
        {
          id: 'train-loss',
          label: copy.value.trainMse,
          value: round(Number(props.snapshot?.derivedMetrics?.trainMse ?? props.snapshot?.loss ?? 0), 2),
        },
        {
          id: 'area-weight',
          label: copy.value.areaWeight,
          value: round(Number((props.snapshot?.derivedMetrics?.weights as number[] | undefined)?.[0] ?? 0), 3),
        },
        {
          id: 'age-weight',
          label: copy.value.ageWeight,
          value: round(Number((props.snapshot?.derivedMetrics?.weights as number[] | undefined)?.[1] ?? 0), 3),
        },
      ]
    : props.section?.id === 'polynomial' ||
        props.section?.id === 'overfitting' ||
        props.section?.id === 'regularization'
      ? [
          {
            id: 'train-loss',
            label: copy.value.trainMse,
            value: round(Number(props.snapshot?.derivedMetrics?.trainMse ?? 0), 2),
          },
          {
            id: 'validation-loss',
            label: copy.value.validationMse,
            value: round(Number(props.snapshot?.derivedMetrics?.validationMse ?? 0), 2),
          },
          {
            id: 'degree',
            label: copy.value.degree,
            value: Number(props.snapshot?.derivedMetrics?.polynomialDegree ?? 1),
          },
          {
            id: 'weight-norm',
            label: copy.value.weightNorm,
            value: round(Number(props.snapshot?.derivedMetrics?.weightNorm ?? 0), 3),
          },
          {
            id: 'active',
            label: copy.value.activeWeights,
            value: Number(props.snapshot?.derivedMetrics?.activeWeights ?? 0),
          },
        ]
      : [
          {
            id: 'start-loss',
            label: copy.value.startLoss,
            value: round(firstSnapshot.value?.loss ?? 0, 2),
          },
          {
            id: 'current-loss',
            label: copy.value.currentLoss,
            value: round(props.snapshot?.loss ?? 0, 2),
          },
          {
            id: 'slope',
            label: copy.value.slope,
            value: round(Number(props.snapshot?.derivedMetrics?.slope ?? 0), 3),
          },
          {
            id: 'intercept',
            label: copy.value.intercept,
            value: round(Number(props.snapshot?.derivedMetrics?.intercept ?? 0), 2),
          },
        ]),
  {
    id: 'progress',
    label: copy.value.progress,
    value: `${progress.value}%`,
  },
])
</script>

<template>
  <section class="panel linear-results">
    <div class="panel__heading">
      <span>{{ copy.title }}</span>
      <strong>{{ copy.subtitle }}</strong>
    </div>

    <div class="linear-results__grid">
      <article v-for="card in resultCards" :key="card.id" class="chart-summary__item">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </div>

    <p>{{ copy.note }}</p>
  </section>
</template>
