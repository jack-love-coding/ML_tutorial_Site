<script setup lang="ts">
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
        subtitle: '把 loss 曲线和梯度范数读成训练状态。',
        scenario: '诊断场景',
        healthy: '健康收敛',
        high: '学习率过大',
        overfit: '过拟合',
        vanishing: '梯度消失',
        exploding: '梯度爆炸',
        train: 'train loss',
        val: 'val loss',
        grad: 'gradient norm',
        finalTrain: '最终训练 loss',
        finalVal: '最终验证 loss',
        bestVal: '最低验证 loss',
        finalGrad: '最终梯度范数',
        note: {
          healthy: '训练和验证 loss 同步下降，梯度范数逐步变小，是较健康的收敛形态。',
          'high-learning-rate': 'loss 震荡并且梯度范数偏大，通常要降低学习率或使用更稳定的调度。',
          overfitting: '训练 loss 继续下降而验证 loss 回升，说明模型开始记住训练集细节。',
          'vanishing-gradient': '梯度范数快速接近 0 但 loss 仍高，深层链式法则可能把信号压没。',
          'exploding-gradient': 'loss 和梯度范数一起抬升，常见处理是降低学习率、梯度裁剪或改初始化。',
        } as Record<TrainingScenario, string>,
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Training Curve Diagnostics',
        subtitle: 'Read loss curves and gradient norms as training state.',
        scenario: 'diagnosis scenario',
        healthy: 'healthy convergence',
        high: 'learning rate too high',
        overfit: 'overfitting',
        vanishing: 'vanishing gradient',
        exploding: 'exploding gradient',
        train: 'train loss',
        val: 'val loss',
        grad: 'gradient norm',
        finalTrain: 'final train loss',
        finalVal: 'final val loss',
        bestVal: 'best val loss',
        finalGrad: 'final grad norm',
        note: {
          healthy: 'Training and validation loss fall together while gradient norm shrinks: a healthy convergence pattern.',
          'high-learning-rate': 'Loss oscillates and gradient norm stays large; lower the learning rate or use a more stable schedule.',
          overfitting: 'Training loss keeps falling while validation loss rises, meaning the model starts memorizing training details.',
          'vanishing-gradient': 'Gradient norm quickly approaches zero while loss remains high; a deep chain rule may be suppressing signal.',
          'exploding-gradient': 'Loss and gradient norm rise together; common responses are lower learning rate, clipping, or better initialization.',
        } as Record<TrainingScenario, string>,
      },
)

function pointsFor(metric: 'trainLoss' | 'valLoss' | 'gradientNorm') {
  const series = evaluation.value.series
  const maxValue = Math.max(...series.map((point) => point[metric]))
  const minValue = Math.min(...series.map((point) => point[metric]))
  const range = Math.max(0.001, maxValue - minValue)
  return series
    .map((point, index) => {
      const x = 42 + (index / (series.length - 1)) * 316
      const y = 242 - ((point[metric] - minValue) / range) * 178
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function format(value: number) {
  return value.toFixed(3)
}
</script>

<template>
  <section class="math-lab-card training-diagnostics-lab">
    <div class="math-lab-card__visual training-diagnostics-lab__visual">
      <svg viewBox="0 0 420 300" role="img" :aria-label="copy.title">
        <line x1="36" y1="242" x2="372" y2="242" class="training-diagnostics-lab__axis" />
        <line x1="42" y1="48" x2="42" y2="250" class="training-diagnostics-lab__axis" />
        <polyline :points="pointsFor('trainLoss')" class="training-diagnostics-lab__line training-diagnostics-lab__line--train" />
        <polyline :points="pointsFor('valLoss')" class="training-diagnostics-lab__line training-diagnostics-lab__line--val" />
        <polyline :points="pointsFor('gradientNorm')" class="training-diagnostics-lab__line training-diagnostics-lab__line--grad" />
      </svg>
      <div class="training-diagnostics-lab__legend">
        <span><i class="is-train" />{{ copy.train }}</span>
        <span><i class="is-val" />{{ copy.val }}</span>
        <span><i class="is-grad" />{{ copy.grad }}</span>
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
            <option value="healthy">{{ copy.healthy }}</option>
            <option value="high-learning-rate">{{ copy.high }}</option>
            <option value="overfitting">{{ copy.overfit }}</option>
            <option value="vanishing-gradient">{{ copy.vanishing }}</option>
            <option value="exploding-gradient">{{ copy.exploding }}</option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.finalTrain }}</span><strong>{{ format(evaluation.last.trainLoss) }}</strong></article>
        <article><span>{{ copy.finalVal }}</span><strong>{{ format(evaluation.last.valLoss) }}</strong></article>
        <article><span>{{ copy.bestVal }}</span><strong>{{ format(evaluation.bestVal.valLoss) }}</strong></article>
        <article><span>{{ copy.finalGrad }}</span><strong>{{ format(evaluation.last.gradientNorm) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note[scenario] }}</p>
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
</style>
