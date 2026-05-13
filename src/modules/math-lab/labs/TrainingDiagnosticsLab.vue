<script setup lang="ts">
import * as d3 from 'd3'
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateTrainingScenario, type TrainingScenario } from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const scenario = ref<TrainingScenario>('healthy')
const evaluation = computed(() => evaluateTrainingScenario(scenario.value, 42))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '训练曲线诊断',
        subtitle: '把 train/validation loss、gradient norm 和 validation gap 读成训练状态。',
        scenario: '诊断场景',
        healthy: '健康收敛',
        high: '学习率过大',
        overfit: '过拟合',
        vanishing: '梯度消失',
        exploding: '梯度爆炸',
        train: 'train loss',
        val: 'val loss',
        grad: 'gradient norm',
        gap: 'validation gap',
        finalTrain: '最终训练 loss',
        finalVal: '最终验证 loss',
        bestVal: '最低验证 loss',
        finalGrad: '最终梯度范数',
        intervention: '建议干预',
        note: {
          healthy: '训练和验证 loss 同步下降，梯度范数逐步变小，是较健康的收敛形态。',
          'high-learning-rate': 'loss 震荡且梯度范数偏大，通常先降低学习率或使用更稳定的 schedule。',
          overfitting: '训练 loss 继续下降而验证 loss 回升，应考虑早停、正则化、数据增强或降低容量。',
          'vanishing-gradient': '梯度范数快速接近 0 但 loss 仍高，可检查激活函数、残差连接、normalization 和初始化。',
          'exploding-gradient': 'loss 和梯度范数一起抬升，优先降低学习率、启用梯度裁剪并检查初始化。',
        } as Record<TrainingScenario, string>,
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Training Curve Diagnostics',
        subtitle: 'Read train/validation loss, gradient norm, and validation gap as training state.',
        scenario: 'diagnosis scenario',
        healthy: 'healthy convergence',
        high: 'learning rate too high',
        overfit: 'overfitting',
        vanishing: 'vanishing gradient',
        exploding: 'exploding gradient',
        train: 'train loss',
        val: 'val loss',
        grad: 'gradient norm',
        gap: 'validation gap',
        finalTrain: 'final train loss',
        finalVal: 'final val loss',
        bestVal: 'best val loss',
        finalGrad: 'final grad norm',
        intervention: 'suggested intervention',
        note: {
          healthy: 'Training and validation loss fall together while gradient norm shrinks: a healthy convergence pattern.',
          'high-learning-rate': 'Loss oscillates and gradient norm stays large; lower the learning rate or use a more stable schedule.',
          overfitting: 'Training loss keeps falling while validation loss rises; consider early stopping, regularization, augmentation, or lower capacity.',
          'vanishing-gradient': 'Gradient norm quickly approaches zero while loss remains high; inspect activations, residuals, normalization, and initialization.',
          'exploding-gradient': 'Loss and gradient norm rise together; lower learning rate, use gradient clipping, and check initialization.',
        } as Record<TrainingScenario, string>,
      },
)

const scenarioOptions = computed(() => [
  { id: 'healthy' as const, label: copy.value.healthy },
  { id: 'high-learning-rate' as const, label: copy.value.high },
  { id: 'overfitting' as const, label: copy.value.overfit },
  { id: 'vanishing-gradient' as const, label: copy.value.vanishing },
  { id: 'exploding-gradient' as const, label: copy.value.exploding },
])

const plot = computed(() => {
  const width = 420
  const height = 300
  const margin = { top: 34, right: 24, bottom: 44, left: 46 }
  const series = evaluation.value.series
  const maxValue = d3.max(series.flatMap((point) => [point.trainLoss, point.valLoss, point.gradientNorm])) ?? 1
  const x = d3.scaleLinear().domain([0, series.length - 1]).range([margin.left, width - margin.right])
  const y = d3.scaleLinear().domain([0, maxValue * 1.08]).range([height - margin.bottom, margin.top])
  const line = d3.line<(typeof series)[number]>()
    .x((point) => x(point.step))
    .curve(d3.curveMonotoneX)

  return {
    width,
    height,
    margin,
    trainPath: line.y((point) => y(point.trainLoss))(series) ?? '',
    valPath: line.y((point) => y(point.valLoss))(series) ?? '',
    gradPath: line.y((point) => y(point.gradientNorm))(series) ?? '',
    gapRibbon: series
      .map((point) => {
        const top = Math.min(y(point.trainLoss), y(point.valLoss))
        const bottom = Math.max(y(point.trainLoss), y(point.valLoss))
        return {
          x: x(point.step) - 2,
          y: top,
          height: Math.max(0, bottom - top),
        }
      })
      .filter((_, index) => index % 3 === 0),
    bestValPoint: {
      x: x(evaluation.value.bestVal.step),
      y: y(evaluation.value.bestVal.valLoss),
    },
    xAxisY: y(0),
    yAxisX: margin.left,
  }
})

const validationGap = computed(() => evaluation.value.last.valLoss - evaluation.value.last.trainLoss)

function format(value: number) {
  return value.toFixed(3)
}
</script>

<template>
  <section class="math-lab-card training-diagnostics-lab">
    <div class="math-lab-card__visual training-diagnostics-lab__visual">
      <svg :viewBox="`0 0 ${plot.width} ${plot.height}`" role="img" :aria-label="copy.title">
        <line :x1="plot.margin.left" :y1="plot.xAxisY" :x2="plot.width - plot.margin.right" :y2="plot.xAxisY" class="training-diagnostics-lab__axis" />
        <line :x1="plot.yAxisX" :y1="plot.margin.top" :x2="plot.yAxisX" :y2="plot.xAxisY" class="training-diagnostics-lab__axis" />
        <rect
          v-for="(bar, index) in plot.gapRibbon"
          :key="index"
          :x="bar.x"
          :y="bar.y"
          width="4"
          :height="bar.height"
          class="training-diagnostics-lab__gap"
        />
        <path :d="plot.trainPath" class="training-diagnostics-lab__line training-diagnostics-lab__line--train" />
        <path :d="plot.valPath" class="training-diagnostics-lab__line training-diagnostics-lab__line--val" />
        <path :d="plot.gradPath" class="training-diagnostics-lab__line training-diagnostics-lab__line--grad" />
        <circle :cx="plot.bestValPoint.x" :cy="plot.bestValPoint.y" r="6" class="training-diagnostics-lab__best" />
      </svg>
      <div class="training-diagnostics-lab__legend">
        <span><i class="is-train" />{{ copy.train }}</span>
        <span><i class="is-val" />{{ copy.val }}</span>
        <span><i class="is-grad" />{{ copy.grad }}</span>
        <span><i class="is-gap" />{{ copy.gap }}</span>
      </div>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls">
        <label>
          {{ copy.scenario }}
          <select v-model="scenario">
            <option v-for="option in scenarioOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.finalTrain }}</span><strong>{{ format(evaluation.last.trainLoss) }}</strong></article>
        <article><span>{{ copy.finalVal }}</span><strong>{{ format(evaluation.last.valLoss) }}</strong></article>
        <article><span>{{ copy.bestVal }}</span><strong>{{ format(evaluation.bestVal.valLoss) }}</strong></article>
        <article><span>{{ copy.finalGrad }}</span><strong>{{ format(evaluation.last.gradientNorm) }}</strong></article>
        <article><span>{{ copy.gap }}</span><strong>{{ format(validationGap) }}</strong></article>
      </div>

      <p class="math-lab-note"><strong>{{ copy.intervention }}:</strong> {{ copy.note[scenario] }}</p>
    </div>
  </section>
</template>

<style scoped>
.training-diagnostics-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background:
    linear-gradient(rgba(16, 22, 47, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 22, 47, 0.08) 1px, transparent 1px),
    #fffef7;
  background-size: 26px 26px, 26px 26px, auto;
}

.training-diagnostics-lab__axis {
  stroke: #10162f;
  stroke-width: 2;
}

.training-diagnostics-lab__gap {
  fill: rgba(214, 90, 49, 0.18);
}

.training-diagnostics-lab__line {
  fill: none;
  stroke-width: 4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.training-diagnostics-lab__line--train {
  stroke: #3868ff;
}

.training-diagnostics-lab__line--val {
  stroke: #d65a31;
}

.training-diagnostics-lab__line--grad {
  stroke: #0f9f7a;
}

.training-diagnostics-lab__best {
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 2;
}

.training-diagnostics-lab__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  color: var(--pixel-ink, #10162f);
  font-weight: 800;
}

.training-diagnostics-lab__legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.training-diagnostics-lab__legend i {
  width: 12px;
  height: 12px;
  border: 2px solid #10162f;
}

.training-diagnostics-lab__legend .is-train {
  background: #3868ff;
}

.training-diagnostics-lab__legend .is-val {
  background: #d65a31;
}

.training-diagnostics-lab__legend .is-grad {
  background: #0f9f7a;
}

.training-diagnostics-lab__legend .is-gap {
  background: rgba(214, 90, 49, 0.25);
}
</style>
