<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FinalReviewAsset } from '../../types/housingProjectLesson'

const props = defineProps<{ asset: FinalReviewAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const group = ref('largest-error')
const failureIndex = ref(0)
const groupMetric = computed(() => props.asset.groupMetrics.find((item) => item.group === group.value) ?? props.asset.groupMetrics[0])
const failures = computed(() => group.value === 'largest-error' ? props.asset.namedFailures : props.asset.residualSample.filter((item) => item.failure_group === group.value))
const selected = computed(() => failures.value[Math.max(0, Math.min(failureIndex.value, failures.value.length - 1))] ?? props.asset.namedFailures[0])
const plotRows = computed(() => props.asset.residualSample.filter((row) => group.value === 'all' || row.failure_group === group.value).slice(0, 260))
const px = (prediction: number) => 58 + Math.max(0, Math.min(1, prediction / 5.4)) * 640
const py = (residual: number) => 174 - Math.max(-1, Math.min(1, residual / 3.8)) * 125
function changeGroup() { failureIndex.value = 0 }
</script>

<template>
  <div class="housing-scene">
    <div class="housing-scene__controls">
      <label>{{ zh ? '失败分组' : 'Failure group' }}<select v-model="group" @change="changeGroup"><option value="all">{{ zh ? '全部抽样残差' : 'All sampled residuals' }}</option><option v-for="item in asset.groupMetrics" :key="item.group" :value="item.group">{{ item.group }}</option></select></label>
      <label>{{ zh ? '具名样本' : 'Named row' }}<select v-model.number="failureIndex"><option v-for="(item, index) in failures" :key="item.row_id" :value="index">{{ item.row_id }}</option></select></label>
    </div>
    <div class="housing-scene__stats"><article><span>{{ zh ? '最终测试 RMSE' : 'Final test RMSE' }}</span><strong>{{ asset.testMetrics.rmse.toFixed(6) }}</strong></article><article><span>{{ zh ? '最终测试 MAE' : 'Final test MAE' }}</span><strong>{{ asset.testMetrics.mae.toFixed(6) }}</strong></article><article><span>{{ zh ? '最终测试 R²' : 'Final test R²' }}</span><strong>{{ asset.testMetrics.r2.toFixed(6) }}</strong></article></div>
    <svg viewBox="0 0 740 350" role="img" :aria-label="zh ? '最终测试预测值与残差交互图' : 'Interactive final-test prediction and residual plot'">
      <path d="M54 34 V300 H704" class="scene-axis" /><line x1="54" y1="174" x2="704" y2="174" class="scene-baseline" />
      <circle v-for="row in plotRows" :key="row.row_id" :cx="px(row.prediction)" :cy="py(row.residual)" r="4" class="scene-point is-muted"><title>{{ row.row_id }} · residual={{ row.residual.toFixed(3) }}</title></circle>
      <circle v-if="selected" :cx="px(selected.prediction)" :cy="py(selected.residual)" r="11" class="scene-point is-selected"><title>{{ selected.row_id }}</title></circle>
      <text x="380" y="330" text-anchor="middle" class="scene-small">{{ zh ? '预测值' : 'Prediction' }}</text><text x="14" y="174" text-anchor="middle" transform="rotate(-90 14 174)" class="scene-small">residual</text>
    </svg>
    <div v-if="selected" class="housing-scene__selected"><strong>{{ selected.row_id }}</strong><span>{{ zh ? '真实' : 'actual' }} {{ selected.MedHouseVal.toFixed(3) }}</span><span>{{ zh ? '预测' : 'prediction' }} {{ selected.prediction.toFixed(3) }}</span><span>{{ zh ? '残差' : 'residual' }} {{ selected.residual >= 0 ? '+' : '' }}{{ selected.residual.toFixed(3) }}</span></div>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ groupMetric ? (zh ? `${groupMetric.group} 组共有 ${groupMetric.count} 行，MAE=${groupMetric.mae.toFixed(3)}，平均残差=${groupMetric.meanResidual.toFixed(3)}。` : `${groupMetric.group} has ${groupMetric.count} rows, MAE=${groupMetric.mae.toFixed(3)}, mean residual=${groupMetric.meanResidual.toFixed(3)}.`) : (zh ? '当前显示测试残差抽样。' : 'A sample of final test residuals is shown.') }}</p>
    <details><summary>{{ zh ? '查看数据限制与文字结果' : 'View limitations and text results' }}</summary><ul><li v-for="item in asset.limitations" :key="item">{{ item }}</li></ul><table><thead><tr><th>row_id</th><th>actual</th><th>prediction</th><th>residual</th></tr></thead><tbody><tr v-for="item in asset.namedFailures" :key="item.row_id"><td>{{ item.row_id }}</td><td>{{ item.MedHouseVal.toFixed(3) }}</td><td>{{ item.prediction.toFixed(3) }}</td><td>{{ item.residual.toFixed(3) }}</td></tr></tbody></table></details>
  </div>
</template>
