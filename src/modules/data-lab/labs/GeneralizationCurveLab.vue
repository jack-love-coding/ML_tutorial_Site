<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DataLabLocale } from '../types/dataLab'
import { curveEpochs, generalizationCurveSnapshot, type GeneralizationScenario } from '../utils/generalizationCurves'

const props = withDefaults(defineProps<{ locale?: DataLabLocale }>(), { locale: 'zh-CN' })
const scenario = ref<GeneralizationScenario>('overfit')
const index = ref(3)
const snapshot = computed(() => generalizationCurveSnapshot(scenario.value, index.value))
const zh = computed(() => props.locale === 'zh-CN')
const scenarios = ['underfit', 'balanced', 'overfit'] as const
const labels = {
  underfit: { 'zh-CN': '两条曲线都高', en: 'Both curves stay high' },
  balanced: { 'zh-CN': '一起下降并接近', en: 'Both fall and stay close' },
  overfit: { 'zh-CN': '训练降，验证升', en: 'Train falls, validation rises' },
}
const explanations = {
  underfit: { 'zh-CN': '先检查特征信息、模型容量和优化是否充分；两条曲线都高不能单独证明欠拟合。', en: 'Check feature information, model capacity, and optimization. Two high curves alone do not prove underfitting.' },
  balanced: { 'zh-CN': '在同一损失尺度上，两者一起下降且差距较小。它支持模型有一定泛化能力，但还需要独立测试集作最后评估。', en: 'On the same loss scale, both fall with a small gap. This supports some generalization, but final evaluation still needs an independent test set.' },
  overfit: { 'zh-CN': '第 30 轮以后，训练 MSE 继续下降，验证 MSE 却上升。本组已显示轮次中，验证 MSE 最低在第 30 轮；可以保留该轮参数。真实训练通常配合 patience 等预先约定的停止规则。', en: 'After epoch 30, training MSE keeps falling while validation MSE rises. Among the displayed epochs, validation MSE is lowest at epoch 30; retain those parameters. Real training usually uses a predefined stopping rule such as patience.' },
}
const x = (i: number) => 44 + i * 48
const y = (value: number) => 224 - value / 1.2 * 192
const points = (values: number[]) => values.map((value, i) => `${x(i)},${y(value)}`).join(' ')
function reset() { scenario.value = 'overfit'; index.value = 3 }
</script>

<template>
  <section class="data-lab-card generalization-curve-lab" data-testid="generalization-curve-lab">
    <header class="generalization-curve-lab__intro">
      <h3>{{ zh ? '把训练与验证曲线放在同一张图上' : 'Compare train and validation on one chart' }}</h3>
      <p>{{ zh ? '教学示意数据，不是项目模型的实测结果。先选择场景，再移动轮次；观察实线和虚线是否朝同一方向变化。' : 'Illustrative teaching data, not measured project results. Select a scenario, then move the epoch control; compare the solid and dashed lines.' }}</p>
    </header>
    <figure class="generalization-curve-lab__plot">
      <svg viewBox="0 0 320 268" role="img" :aria-label="labels[scenario][locale]">
        <title>{{ zh ? '训练与验证 MSE 随轮次变化' : 'Training and validation MSE over epochs' }}</title>
        <g v-for="tick in [0, .4, .8, 1.2]" :key="tick">
          <line x1="44" x2="292" :y1="y(tick)" :y2="y(tick)" class="generalization-curve-lab__grid" />
          <text x="35" :y="y(tick) + 4" text-anchor="end">{{ tick }}</text>
        </g>
        <line x1="44" x2="44" y1="32" y2="224" stroke="currentColor" />
        <line x1="44" x2="292" y1="224" y2="224" stroke="currentColor" />
        <text x="44" y="18">MSE</text>
        <text v-for="(epoch, i) in curveEpochs" :key="epoch" :x="x(i)" y="243" text-anchor="middle">{{ epoch }}</text>
        <text x="284" y="263" text-anchor="end">{{ zh ? '轮次' : 'Epoch' }}</text>
        <polyline :points="points(snapshot.series.train)" class="generalization-curve-lab__train" />
        <polyline :points="points(snapshot.series.validation)" class="generalization-curve-lab__validation" />
        <line :x1="x(snapshot.index)" :x2="x(snapshot.index)" y1="32" y2="224" class="generalization-curve-lab__cursor" />
        <circle :cx="x(snapshot.index)" :cy="y(snapshot.train)" r="5" class="generalization-curve-lab__train" />
        <rect :x="x(snapshot.index) - 5" :y="y(snapshot.validation) - 5" width="10" height="10" class="generalization-curve-lab__validation" />
      </svg>
      <figcaption>{{ zh ? '实线／圆点：训练；虚线／方块：验证。纵轴范围固定，MSE 越低越好。' : 'Solid line / circle: train. Dashed line / square: validation. The vertical scale is fixed; lower MSE is better.' }}</figcaption>
    </figure>
    <div class="data-lab-card__controls">
      <div class="data-segmented-control">
        <button v-for="candidate in scenarios" :key="candidate" type="button" :aria-pressed="scenario === candidate" :class="{ 'is-active': scenario === candidate }" @click="scenario = candidate">{{ labels[candidate][locale] }}</button>
      </div>
      <label class="data-range-control">
        {{ zh ? '观察轮次' : 'Inspect epoch' }}: {{ snapshot.epoch }}
        <input v-model.number="index" type="range" min="0" :max="curveEpochs.length - 1" step="1" :aria-valuetext="String(snapshot.epoch)" />
      </label>
      <p data-testid="curve-values">{{ zh ? '训练' : 'Train' }} MSE = {{ snapshot.train.toFixed(2) }} · {{ zh ? '验证' : 'Validation' }} MSE = {{ snapshot.validation.toFixed(2) }}</p>
      <p>{{ explanations[scenario][locale] }}</p>
      <button type="button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button>
      <details>
        <summary>{{ zh ? '查看图中全部数值' : 'Read all chart values' }}</summary>
        <table class="generalization-curve-lab__table">
          <thead><tr><th scope="col">{{ zh ? '轮次' : 'Epoch' }}</th><th scope="col">train MSE</th><th scope="col">validation MSE</th></tr></thead>
          <tbody><tr v-for="(epoch, i) in curveEpochs" :key="epoch"><th scope="row">{{ epoch }}</th><td>{{ snapshot.series.train[i] }}</td><td>{{ snapshot.series.validation[i] }}</td></tr></tbody>
        </table>
      </details>
    </div>
  </section>
</template>
