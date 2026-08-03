<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LeakageBoundaryAsset } from '../../types/housingProjectLesson'

const props = defineProps<{ asset: LeakageBoundaryAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const featureIndex = ref(0)
const statistic = ref<'mean' | 'scale'>('mean')
const feature = computed(() => props.asset.features[Math.max(0, Math.min(featureIndex.value, props.asset.features.length - 1))])
const trainValue = computed(() => statistic.value === 'mean' ? feature.value.trainMean : feature.value.trainScale)
const invalidValue = computed(() => statistic.value === 'mean' ? feature.value.invalidFullMean : feature.value.invalidFullScale)
const difference = computed(() => invalidValue.value - trainValue.value)
</script>

<template>
  <div class="housing-scene">
    <div class="housing-scene__controls">
      <label>{{ zh ? '特征' : 'Feature' }}<select v-model.number="featureIndex"><option v-for="(item, index) in asset.features" :key="item.feature" :value="index">{{ item.feature }}</option></select></label>
      <fieldset><legend>{{ zh ? '统计量' : 'Statistic' }}</legend><button type="button" :class="{ 'is-active': statistic === 'mean' }" @click="statistic = 'mean'">{{ zh ? '均值' : 'Mean' }}</button><button type="button" :class="{ 'is-active': statistic === 'scale' }" @click="statistic = 'scale'">{{ zh ? '尺度' : 'Scale' }}</button></fieldset>
    </div>
    <div class="housing-scene__stats"><article><span>{{ zh ? '正确：仅训练集' : 'Valid: train only' }}</span><strong>{{ trainValue.toFixed(6) }}</strong></article><article><span>{{ zh ? '错误：全量拟合' : 'Invalid: full fit' }}</span><strong>{{ invalidValue.toFixed(6) }}</strong></article><article><span>{{ zh ? '差值' : 'Difference' }}</span><strong>{{ difference.toExponential(2) }}</strong></article></div>
    <svg viewBox="0 0 760 260" role="img" :aria-label="zh ? '训练集拟合与全量拟合的数据边界对照' : 'Data-boundary comparison between train-only and full-data fitting'">
      <defs><marker id="leak-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>
      <rect x="24" y="76" width="158" height="96" rx="12" class="scene-panel is-train" /><text x="103" y="110" text-anchor="middle" class="scene-label">TRAIN</text><text x="103" y="145" text-anchor="middle" class="scene-value">12,384</text>
      <path d="M182 124 H280" class="scene-arrow" marker-end="url(#leak-arrow)" />
      <rect x="290" y="60" width="190" height="128" rx="12" class="scene-panel is-active" /><text x="385" y="102" text-anchor="middle" class="scene-label">StandardScaler.fit</text><text x="385" y="140" text-anchor="middle" class="scene-value">{{ feature.feature }}</text><text x="385" y="168" text-anchor="middle" class="scene-small">{{ statistic }} = {{ trainValue.toFixed(4) }}</text>
      <path d="M480 124 H578" class="scene-arrow" marker-end="url(#leak-arrow)" />
      <rect x="588" y="76" width="148" height="96" rx="12" class="scene-panel" /><text x="662" y="110" text-anchor="middle" class="scene-label">VAL / TEST</text><text x="662" y="145" text-anchor="middle" class="scene-value">transform</text>
      <path d="M103 200 C220 238 540 238 662 200" class="scene-blocked" /><text x="385" y="238" text-anchor="middle" class="scene-small">{{ zh ? '禁止回流到 fit' : 'No feedback into fit' }}</text>
    </svg>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ zh ? '数值差得小不代表规则可以放松；全量统计量含有验证与测试分布信息。' : 'A small numerical gap does not relax the rule; full-data statistics contain validation and test distribution information.' }}</p>
    <details><summary>{{ zh ? '查看四步边界' : 'View four-step boundary' }}</summary><ol><li v-for="rule in asset.rules" :key="rule">{{ rule }}</li></ol></details>
  </div>
</template>
