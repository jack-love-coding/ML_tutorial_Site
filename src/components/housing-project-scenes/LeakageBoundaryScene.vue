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
    <ol class="housing-scene__flow" :aria-label="zh ? '仅训练集拟合的处理顺序' : 'Train-only fitting sequence'">
      <li><strong>1 · TRAIN</strong><span>12,384</span></li>
      <li><strong>2 · StandardScaler.fit</strong><span>{{ feature.feature }}</span><span>{{ statistic }} = {{ trainValue.toFixed(4) }}</span></li>
      <li><strong>3 · VAL / TEST</strong><span>transform</span></li>
    </ol>
    <p class="housing-scene__boundary">{{ zh ? '禁止验证集与测试集回流到 fit；只使用训练集统计量进行 transform。' : 'Validation and test must not feed back into fit; transform uses training statistics only.' }}</p>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ zh ? '数值差得小不代表规则可以放松；全量统计量含有验证与测试分布信息。' : 'A small numerical gap does not relax the rule; full-data statistics contain validation and test distribution information.' }}</p>
    <details><summary>{{ zh ? '查看四步边界' : 'View four-step boundary' }}</summary><ol><li v-for="rule in asset.rules" :key="rule">{{ rule }}</li></ol></details>
  </div>
</template>
