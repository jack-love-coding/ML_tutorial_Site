<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TrainingEdaAsset } from '../../types/housingProjectLesson'

const props = defineProps<{ asset: TrainingEdaAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const feature = ref('MedInc')
const view = ref<'relation' | 'geography'>('relation')
const relation = computed(() => props.asset.relations[feature.value] ?? [])
const stats = computed(() => props.asset.trainingStats.find((item) => item.feature === feature.value))
const xDomain = computed(() => { const xs = relation.value.map((p) => p.x); return [Math.min(...xs), Math.max(...xs)] })
const yDomain = computed(() => { const ys = relation.value.map((p) => p.y); return [Math.min(...ys) - 0.1, Math.max(...ys) + 0.1] })
const px = (x: number) => 54 + ((x - xDomain.value[0]) / Math.max(xDomain.value[1] - xDomain.value[0], 1e-9)) * 636
const py = (y: number) => 310 - ((y - yDomain.value[0]) / Math.max(yDomain.value[1] - yDomain.value[0], 1e-9)) * 250
const gx = (longitude: number) => 54 + ((longitude + 124.5) / 10.5) * 636
const gy = (latitude: number) => 310 - ((latitude - 32.3) / 10) * 250
const pointColor = (target: number) => `hsl(${32 - Math.min(1, target / 5) * 24} 78% ${68 - Math.min(1, target / 5) * 24}%)`
</script>

<template>
  <div class="housing-scene">
    <div class="housing-scene__controls">
      <label>{{ zh ? '特征' : 'Feature' }}<select v-model="feature"><option v-for="name in Object.keys(asset.relations)" :key="name">{{ name }}</option></select></label>
      <fieldset><legend>{{ zh ? '视图' : 'View' }}</legend><button type="button" :class="{ 'is-active': view === 'relation' }" @click="view = 'relation'">{{ zh ? '分箱关系' : 'Binned relation' }}</button><button type="button" :class="{ 'is-active': view === 'geography' }" @click="view = 'geography'">{{ zh ? '地理结构' : 'Geography' }}</button></fieldset>
    </div>
    <div class="housing-scene__stats">
      <article><span>{{ zh ? '训练样本' : 'Training rows' }}</span><strong>12,384</strong></article>
      <article><span>{{ zh ? '目标上限样本' : 'Capped targets' }}</span><strong>{{ asset.targetCapCount }}</strong></article>
      <article><span>{{ zh ? '与目标相关系数' : 'Target correlation' }}</span><strong>{{ stats?.correlationWithTarget.toFixed(3) }}</strong></article>
    </div>
    <svg viewBox="0 0 740 350" role="img" :aria-label="view === 'relation' ? (zh ? `${feature} 与目标的训练集分箱关系` : `Training binned relation between ${feature} and target`) : (zh ? '训练集经纬度与房价结构' : 'Training geography and target structure')">
      <path d="M54 40 V310 H704" class="scene-axis" />
      <template v-if="view === 'relation'">
        <polyline :points="relation.map((point) => `${px(point.x)},${py(point.y)}`).join(' ')" class="scene-line" />
        <g v-for="point in relation" :key="point.x"><circle :cx="px(point.x)" :cy="py(point.y)" r="7" class="scene-point" /><title>{{ feature }}={{ point.x.toFixed(3) }}, y={{ point.y.toFixed(3) }}, n={{ point.count }}</title></g>
        <text x="380" y="340" text-anchor="middle" class="scene-small">{{ feature }}</text><text x="14" y="172" text-anchor="middle" transform="rotate(-90 14 172)" class="scene-small">MedHouseVal</text>
      </template>
      <template v-else>
        <circle v-for="point in asset.scatter" :key="String(point.row_id)" :cx="gx(Number(point.Longitude))" :cy="gy(Number(point.Latitude))" r="4.5" :fill="pointColor(Number(point.MedHouseVal))" opacity="0.72"><title>{{ point.row_id }} · {{ Number(point.MedHouseVal).toFixed(3) }}</title></circle>
        <text x="380" y="340" text-anchor="middle" class="scene-small">Longitude</text><text x="14" y="172" text-anchor="middle" transform="rotate(-90 14 172)" class="scene-small">Latitude</text>
      </template>
    </svg>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ view === 'relation' ? (zh ? `${feature} 的分箱趋势与相关系数必须结合离散程度阅读。` : `Read ${feature}'s binned trend together with its spread and correlation.`) : (zh ? '房价在地图上形成区域团簇，原始经纬度的线性项无法完整表达。' : 'Targets form regional clusters that raw linear coordinates cannot fully represent.') }}</p>
    <details><summary>{{ zh ? '查看当前统计量' : 'View current statistics' }}</summary><table><tbody><tr><th>min</th><td>{{ stats?.min.toFixed(3) }}</td></tr><tr><th>median</th><td>{{ stats?.median.toFixed(3) }}</td></tr><tr><th>mean</th><td>{{ stats?.mean.toFixed(3) }}</td></tr><tr><th>max</th><td>{{ stats?.max.toFixed(3) }}</td></tr></tbody></table></details>
  </div>
</template>
