<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { beginnerLocalLoss, evaluateLocalChangeStory } from '../utils/beginnerFoundations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const x = ref(1.35)
const h = ref(0.45)
const learningRate = ref(0.75)

const evaluation = computed(() =>
  evaluateLocalChangeStory({
    x: x.value,
    h: h.value,
    learningRate: learningRate.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '局部变化训练台',
        subtitle: '同一条 loss 曲线同时解释割线、切线、导数和一次参数更新。',
        x: '当前位置 theta',
        h: '窗口 h',
        lr: '学习率 eta',
        secant: '平均变化率',
        derivative: '导数 / 梯度',
        error: '割线差距',
        nextX: '下一步 theta',
        loss: 'loss 变化',
        hTable: '窗口缩小时',
        scenarios: '学习率轨迹',
        variables: '变量词典',
        small: '小步',
        steady: '合适',
        large: '过大',
        presetSmall: '小步',
        presetSteady: '合适',
        presetLarge: '过大',
        note: '这里的曲线、导数、更新和 loss 数字都来自同一个函数。局部信息只适合走一小步，走太远就要重新计算。',
        thetaHelp: '当前参数位置',
        hHelp: '比较 theta 与 theta+h 的观察窗口',
        etaHelp: '沿负梯度移动的步长',
        gradHelp: '当前点附近 loss 对参数的变化率',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Local Change Workbench',
        subtitle: 'One loss curve explains secants, tangents, derivatives, and one parameter update.',
        x: 'current theta',
        h: 'window h',
        lr: 'learning rate eta',
        secant: 'average change',
        derivative: 'derivative / gradient',
        error: 'secant gap',
        nextX: 'next theta',
        loss: 'loss change',
        hTable: 'As the window shrinks',
        scenarios: 'Learning-rate paths',
        variables: 'Variable dictionary',
        small: 'small',
        steady: 'steady',
        large: 'too large',
        presetSmall: 'small',
        presetSteady: 'steady',
        presetLarge: 'large',
        note: 'The curve, derivative, update, and loss readout all come from the same function. Local information should be used for a small step, then recomputed.',
        thetaHelp: 'current parameter position',
        hHelp: 'observation window from theta to theta+h',
        etaHelp: 'step size along the negative gradient',
        gradHelp: 'local rate of loss change at this point',
      },
)

const plot = {
  width: 460,
  height: 300,
  xMin: -3.6,
  xMax: 3.6,
  yMin: -0.15,
  yMax: 6.8,
}

const curvePoints = computed(() =>
  Array.from({ length: 151 }, (_, index) => {
    const value = plot.xMin + (index / 150) * (plot.xMax - plot.xMin)
    return `${mapX(value).toFixed(1)},${mapY(beginnerLocalLoss(value)).toFixed(1)}`
  }).join(' '),
)

const xPoint = computed(() => ({ x: mapX(evaluation.value.x), y: mapY(evaluation.value.y) }))
const hPoint = computed(() => ({ x: mapX(evaluation.value.x + evaluation.value.h), y: mapY(evaluation.value.nextY) }))
const nextPoint = computed(() => ({ x: mapX(evaluation.value.nextX), y: mapY(evaluation.value.nextLoss) }))
const tangent = computed(() => {
  const left = evaluation.value.x - 0.8
  const right = evaluation.value.x + 0.8
  return {
    x1: mapX(left),
    y1: mapY(evaluation.value.y + evaluation.value.derivative * (left - evaluation.value.x)),
    x2: mapX(right),
    y2: mapY(evaluation.value.y + evaluation.value.derivative * (right - evaluation.value.x)),
  }
})

function mapX(value: number) {
  return ((value - plot.xMin) / (plot.xMax - plot.xMin)) * plot.width
}

function mapY(value: number) {
  return plot.height - ((value - plot.yMin) / (plot.yMax - plot.yMin)) * plot.height
}

function format(value: number) {
  return value.toFixed(3)
}

function setPreset(kind: 'small' | 'steady' | 'large') {
  learningRate.value = kind === 'small' ? 0.15 : kind === 'steady' ? 0.75 : 2.1
}

function scenarioPath(points: Array<{ x: number; loss: number }>) {
  return points.map((point) => `${mapX(point.x).toFixed(1)},${mapY(point.loss).toFixed(1)}`).join(' ')
}

function scenarioLabel(id: string) {
  if (id === 'small') return copy.value.small
  if (id === 'large') return copy.value.large
  return copy.value.steady
}
</script>

<template>
  <section class="math-lab-card local-change-story-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 460 300" role="img" :aria-label="copy.title">
        <line x1="0" :y1="mapY(0)" x2="460" :y2="mapY(0)" class="local-change-story-lab__axis" />
        <line :x1="mapX(0)" y1="0" :x2="mapX(0)" y2="300" class="local-change-story-lab__axis" />
        <polyline :points="curvePoints" class="local-change-story-lab__curve" />
        <polyline
          v-for="scenario in evaluation.learningRateScenarios"
          :key="scenario.id"
          :points="scenarioPath(scenario.points)"
          :class="`local-change-story-lab__scenario is-${scenario.id}`"
        />
        <line :x1="xPoint.x" :y1="xPoint.y" :x2="hPoint.x" :y2="hPoint.y" class="local-change-story-lab__secant" />
        <line :x1="tangent.x1" :y1="tangent.y1" :x2="tangent.x2" :y2="tangent.y2" class="local-change-story-lab__tangent" />
        <path
          :d="`M ${xPoint.x} ${xPoint.y} C ${xPoint.x - 32} ${xPoint.y + 42}, ${nextPoint.x + 34} ${nextPoint.y + 42}, ${nextPoint.x} ${nextPoint.y}`"
          class="local-change-story-lab__step"
        />
        <circle :cx="xPoint.x" :cy="xPoint.y" r="7" class="local-change-story-lab__point" />
        <circle :cx="hPoint.x" :cy="hPoint.y" r="6" class="local-change-story-lab__window-point" />
        <circle :cx="nextPoint.x" :cy="nextPoint.y" r="6" class="local-change-story-lab__next-point" />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls local-change-story-lab__controls">
        <label>
          {{ copy.x }}: {{ x.toFixed(2) }}
          <input v-model.number="x" type="range" min="-2" max="2" step="0.05" />
        </label>
        <label>
          {{ copy.h }}: {{ h.toFixed(2) }}
          <input v-model.number="h" type="range" min="0.05" max="1" step="0.05" />
        </label>
        <label>
          {{ copy.lr }}: {{ learningRate.toFixed(2) }}
          <input v-model.number="learningRate" type="range" min="0.05" max="2.3" step="0.05" />
        </label>
      </div>

      <div class="local-change-story-lab__preset-row">
        <button type="button" class="action-button" @click="setPreset('small')">{{ copy.presetSmall }}</button>
        <button type="button" class="action-button" @click="setPreset('steady')">{{ copy.presetSteady }}</button>
        <button type="button" class="action-button" @click="setPreset('large')">{{ copy.presetLarge }}</button>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.secant }}</span><strong>{{ format(evaluation.secantSlope) }}</strong></article>
        <article><span>{{ copy.derivative }}</span><strong>{{ format(evaluation.derivative) }}</strong></article>
        <article><span>{{ copy.error }}</span><strong>{{ format(evaluation.secantError) }}</strong></article>
        <article><span>{{ copy.nextX }}</span><strong>{{ format(evaluation.nextX) }}</strong></article>
        <article><span>{{ copy.loss }}</span><strong>{{ format(evaluation.currentLoss) }} -> {{ format(evaluation.nextLoss) }}</strong></article>
      </div>

      <section class="local-change-story-lab__tables">
        <article>
          <span>{{ copy.hTable }}</span>
          <table>
            <thead>
              <tr><th>h</th><th>slope</th><th>gap</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in evaluation.hRows" :key="row.h">
                <td>{{ row.h }}</td>
                <td>{{ format(row.secantSlope) }}</td>
                <td>{{ format(row.error) }}</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article>
          <span>{{ copy.scenarios }}</span>
          <dl class="local-change-story-lab__scenario-list">
            <template v-for="scenario in evaluation.learningRateScenarios" :key="scenario.id">
              <dt>{{ scenarioLabel(scenario.id) }}</dt>
              <dd>eta={{ scenario.learningRate.toFixed(2) }}, loss={{ format(scenario.points.at(-1)?.loss ?? 0) }}</dd>
            </template>
          </dl>
        </article>
      </section>

      <dl class="local-change-story-lab__dictionary" :aria-label="copy.variables">
        <div><dt>theta</dt><dd>{{ copy.thetaHelp }}</dd></div>
        <div><dt>h</dt><dd>{{ copy.hHelp }}</dd></div>
        <div><dt>eta</dt><dd>{{ copy.etaHelp }}</dd></div>
        <div><dt>grad</dt><dd>{{ copy.gradHelp }}</dd></div>
      </dl>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.local-change-story-lab svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.local-change-story-lab__axis {
  stroke: rgba(16, 22, 47, 0.22);
  stroke-width: 2;
}

.local-change-story-lab__curve,
.local-change-story-lab__secant,
.local-change-story-lab__tangent,
.local-change-story-lab__step,
.local-change-story-lab__scenario {
  fill: none;
  stroke-width: 3;
}

.local-change-story-lab__curve {
  stroke: #3868ff;
}

.local-change-story-lab__secant {
  stroke: #ef6f6c;
  stroke-dasharray: 7 6;
}

.local-change-story-lab__tangent {
  stroke: #0f9f7a;
}

.local-change-story-lab__step {
  stroke: #d65a31;
}

.local-change-story-lab__scenario {
  opacity: 0.32;
  stroke-width: 4;
}

.local-change-story-lab__scenario.is-small {
  stroke: #f2b84b;
}

.local-change-story-lab__scenario.is-steady {
  stroke: #0f9f7a;
}

.local-change-story-lab__scenario.is-large {
  stroke: #d9463f;
}

.local-change-story-lab__point,
.local-change-story-lab__window-point,
.local-change-story-lab__next-point {
  stroke: #10162f;
  stroke-width: 2;
}

.local-change-story-lab__point {
  fill: #ffd84d;
}

.local-change-story-lab__window-point {
  fill: #9ee6ff;
}

.local-change-story-lab__next-point {
  fill: #b6f2d2;
}

.local-change-story-lab__controls {
  grid-template-columns: 1fr;
}

.local-change-story-lab__preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.local-change-story-lab__preset-row .action-button {
  min-height: 36px;
  padding: 0 12px;
  font-size: 0.82rem;
}

.local-change-story-lab__tables {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 12px;
}

.local-change-story-lab__tables article,
.local-change-story-lab__dictionary {
  border: 1px solid rgba(16, 22, 47, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.68);
  padding: 12px;
}

.local-change-story-lab__tables span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.local-change-story-lab table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.local-change-story-lab th,
.local-change-story-lab td {
  padding: 5px 4px;
  border-bottom: 1px solid rgba(16, 22, 47, 0.1);
  text-align: right;
}

.local-change-story-lab th:first-child,
.local-change-story-lab td:first-child {
  text-align: left;
}

.local-change-story-lab__scenario-list,
.local-change-story-lab__dictionary {
  display: grid;
  gap: 8px;
  margin: 0;
}

.local-change-story-lab__scenario-list {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
}

.local-change-story-lab__dictionary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.local-change-story-lab__dictionary div {
  min-width: 0;
}

.local-change-story-lab dt {
  color: #10162f;
  font-weight: 900;
}

.local-change-story-lab dd {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.86rem;
}

@media (max-width: 760px) {
  .local-change-story-lab__tables,
  .local-change-story-lab__dictionary {
    grid-template-columns: 1fr;
  }
}
</style>
