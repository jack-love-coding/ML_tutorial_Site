<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RidgeSelectionAsset } from '../../types/housingProjectLesson'

const props = defineProps<{ asset: RidgeSelectionAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const alphaIndex = ref(0)
const metric = ref<'rmse' | 'mae' | 'r2'>('rmse')
const candidate = computed(() => props.asset.ridgePath[Math.max(0, Math.min(alphaIndex.value, props.asset.ridgePath.length - 1))])
const points = computed(() => props.asset.ridgePath.map((item, index) => ({ x: 70 + index * 135, y: item[metric.value] })))
const values = computed(() => [props.asset.baseline[metric.value], ...props.asset.ridgePath.map((item) => item[metric.value])])
const minValue = computed(() => Math.min(...values.value))
const maxValue = computed(() => Math.max(...values.value))
const py = (value: number) => 290 - ((value - minValue.value) / Math.max(maxValue.value - minValue.value, 1e-9)) * 210
const relative = computed(() => (props.asset.baseline.rmse - candidate.value.rmse) / props.asset.baseline.rmse)
</script>

<template>
  <div class="housing-scene">
    <div class="housing-scene__controls">
      <label>alpha<select v-model.number="alphaIndex"><option v-for="(item, index) in asset.ridgePath" :key="item.alpha" :value="index">{{ item.alpha }}</option></select></label>
      <label>{{ zh ? '指标' : 'Metric' }}<select v-model="metric"><option value="rmse">RMSE</option><option value="mae">MAE</option><option value="r2">R²</option></select></label>
    </div>
    <div class="housing-scene__stats"><article><span>{{ zh ? '基线验证值' : 'Baseline validation' }}</span><strong>{{ asset.baseline[metric].toFixed(6) }}</strong></article><article><span>Ridge α={{ candidate.alpha }}</span><strong>{{ candidate[metric].toFixed(6) }}</strong></article><article class="is-locked"><span>{{ zh ? '最终测试' : 'Final test' }}</span><strong>🔒 {{ zh ? '锁定' : 'Locked' }}</strong></article></div>
    <svg viewBox="0 0 740 350" role="img" :aria-label="zh ? 'Ridge 正则强度与验证指标路径' : 'Ridge regularization path over validation metrics'">
      <path d="M54 36 V298 H704" class="scene-axis" />
      <line x1="54" :y1="py(asset.baseline[metric])" x2="704" :y2="py(asset.baseline[metric])" class="scene-baseline" />
      <polyline :points="points.map((p) => `${p.x},${py(p.y)}`).join(' ')" class="scene-line" />
      <g v-for="(point, index) in points" :key="asset.ridgePath[index].alpha"><circle :cx="point.x" :cy="py(point.y)" :r="index === alphaIndex ? 10 : 6" :class="index === alphaIndex ? 'scene-point is-selected' : 'scene-point'" /><text :x="point.x" y="325" text-anchor="middle" class="scene-small">{{ asset.ridgePath[index].alpha }}</text></g>
      <text x="690" :y="py(asset.baseline[metric]) - 8" text-anchor="end" class="scene-small">LinearRegression</text>
    </svg>
    <div class="housing-scene__decision" :class="{ 'is-pass': relative >= asset.selectionThreshold }"><span>{{ zh ? '相对 RMSE 改善' : 'Relative RMSE improvement' }}</span><strong>{{ (relative * 100).toFixed(5) }}%</strong><small>{{ zh ? `采用门槛 ${(asset.selectionThreshold * 100).toFixed(0)}%` : `Adoption threshold ${(asset.selectionThreshold * 100).toFixed(0)}%` }}</small></div>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ zh ? `当前候选没有越过门槛，冻结 ${asset.selectedModel}；不打开测试集来寻找更好看的一组参数。` : `The candidate does not clear the threshold, so ${asset.selectedModel} is frozen without opening test to hunt for a better-looking result.` }}</p>
    <details><summary>{{ zh ? '查看完整验证表' : 'View full validation table' }}</summary><table><thead><tr><th>model</th><th>alpha</th><th>RMSE</th><th>MAE</th><th>R²</th></tr></thead><tbody><tr><td>{{ asset.baseline.model }}</td><td>—</td><td>{{ asset.baseline.rmse.toFixed(6) }}</td><td>{{ asset.baseline.mae.toFixed(6) }}</td><td>{{ asset.baseline.r2.toFixed(6) }}</td></tr><tr v-for="row in asset.ridgePath" :key="row.alpha"><td>Ridge</td><td>{{ row.alpha }}</td><td>{{ row.rmse.toFixed(6) }}</td><td>{{ row.mae.toFixed(6) }}</td><td>{{ row.r2.toFixed(6) }}</td></tr></tbody></table></details>
  </div>
</template>
