<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSceneWidth } from './useSceneWidth'

const { width } = useSceneWidth()
import type { BaselineContributionsAsset } from '../../types/housingProjectLesson'

const props = defineProps<{ asset: BaselineContributionsAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const sampleIndex = ref(0)
const sample = computed(() => props.asset.samples[Math.max(0, Math.min(sampleIndex.value, props.asset.samples.length - 1))])
const entries = computed(() => Object.entries(sample.value.contributions).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])))
const maxAbs = computed(() => Math.max(...entries.value.map(([, value]) => Math.abs(value)), 0.1))
const barWidth = (value: number) => Math.abs(value) / maxAbs.value * (width.value / 2 - 20)
const barX = (value: number) => value >= 0 ? width.value / 2 : width.value / 2 - barWidth(value)
</script>

<template>
  <div class="housing-scene">
    <div class="housing-scene__controls"><label>{{ zh ? '验证样本' : 'Validation row' }}<select v-model.number="sampleIndex"><option v-for="(item, index) in asset.samples" :key="item.rowId" :value="index">{{ item.rowId }}</option></select></label></div>
    <div class="housing-scene__stats"><article><span>{{ zh ? '真实值' : 'Actual' }}</span><strong>{{ sample.actual.toFixed(3) }}</strong></article><article><span>{{ zh ? '预测值' : 'Prediction' }}</span><strong>{{ sample.prediction.toFixed(3) }}</strong></article><article><span>{{ zh ? '残差 y-ŷ' : 'Residual y-ŷ' }}</span><strong>{{ (sample.actual - sample.prediction).toFixed(3) }}</strong></article></div>
    <svg ref="housingChart" :viewBox="`0 0 ${width} 550`" role="img" :aria-label="zh ? '所选样本八项特征贡献条形图' : 'Eight feature contributions for the selected row'">
      <line :x1="width / 2" y1="20" :x2="width / 2" y2="505" class="scene-axis" />
      <g v-for="([name, value], index) in entries" :key="name" :transform="`translate(0 ${20 + index * 61})`">
        <text x="16" y="16" text-anchor="start" class="scene-label">{{ name }}</text>
        <rect :x="barX(value)" y="24" :width="barWidth(value)" height="22" rx="5" :class="value >= 0 ? 'scene-bar is-positive' : 'scene-bar is-negative'" />
        <text :x="width - 16" y="16" text-anchor="end" class="scene-small">{{ value >= 0 ? '+' : '' }}{{ value.toFixed(3) }}</text>
      </g>
      <text :x="width / 2" y="535" text-anchor="middle" class="scene-small">{{ zh ? '负贡献 ← 0 → 正贡献' : 'negative ← 0 → positive' }}</text>
    </svg>
    <p class="housing-scene__equation">{{ sample.intercept.toFixed(3) }} {{ entries.map(([, value]) => `${value >= 0 ? '+' : '−'} ${Math.abs(value).toFixed(3)}`).join(' ') }} = <strong>{{ sample.prediction.toFixed(3) }}</strong></p>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ zh ? '切换样本时，模型参数不变，变化的是该行标准化特征值及其贡献。贡献解释计算过程，不解释因果。' : 'Parameters stay fixed across rows; standardized values and their contributions change. Contributions explain arithmetic, not causality.' }}</p>
    <details><summary>{{ zh ? '查看当前贡献表' : 'View contribution table' }}</summary><table><thead><tr><th>{{ zh ? '特征' : 'Feature' }}</th><th>{{ zh ? '贡献' : 'Contribution' }}</th></tr></thead><tbody><tr v-for="([name, value]) in entries" :key="name"><td>{{ name }}</td><td>{{ value.toFixed(6) }}</td></tr><tr><td>{{ zh ? '截距' : 'Intercept' }}</td><td>{{ sample.intercept.toFixed(6) }}</td></tr></tbody></table></details>
  </div>
</template>
