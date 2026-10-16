<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataContractAsset } from '../../types/housingProjectLesson'

const props = defineProps<{ asset: DataContractAsset }>()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const fieldIndex = ref(1)
const rowIndex = ref(0)
const field = computed(() => props.asset.schema[Math.max(0, Math.min(fieldIndex.value, props.asset.schema.length - 1))])
const row = computed(() => props.asset.sampleRows[Math.max(0, Math.min(rowIndex.value, props.asset.sampleRows.length - 1))])
const value = computed(() => row.value?.[field.value?.name ?? ''])
const roleLabel = computed(() => ({ feature: zh.value ? '模型输入' : 'Model input', target: zh.value ? '预测目标' : 'Prediction target', identifier: zh.value ? '仅用于追踪' : 'Trace only', partition: zh.value ? '仅用于分区' : 'Partition only' }[field.value?.role ?? ''] ?? field.value?.role))
</script>

<template>
  <div class="housing-scene">
    <div class="housing-scene__controls">
      <label>{{ zh ? '检查字段' : 'Inspect field' }}<select v-model.number="fieldIndex"><option v-for="(item, index) in asset.schema" :key="item.name" :value="index">{{ item.name }}</option></select></label>
      <label>{{ zh ? '真实样本' : 'Real sample' }}<select v-model.number="rowIndex"><option v-for="(item, index) in asset.sampleRows" :key="String(item.row_id)" :value="index">{{ item.row_id }}</option></select></label>
    </div>
    <div class="housing-scene__stats">
      <article><span>{{ zh ? '总行数' : 'Rows' }}</span><strong>{{ asset.rowCount.toLocaleString() }}</strong></article>
      <article><span>{{ zh ? '特征数' : 'Features' }}</span><strong>{{ asset.featureCount }}</strong></article>
      <article><span>{{ zh ? '当前角色' : 'Current role' }}</span><strong>{{ roleLabel }}</strong></article>
    </div>
    <ol class="housing-scene__flow" :aria-label="zh ? '数据字段到模型输入与目标的流程' : 'Dataset field to model input and target'">
      <li><strong>1 · {{ zh ? '本地 CSV' : 'Local CSV' }}</strong><span>{{ row?.row_id }}</span><span>{{ field?.name }} = {{ typeof value === 'number' ? value.toFixed(3) : value }}</span></li>
      <li><strong>2 · {{ field?.name }}</strong><span>{{ roleLabel }}</span></li>
      <li><strong>3 · {{ field?.role === 'feature' ? 'X' : field?.role === 'target' ? 'y' : (zh ? '不进入模型' : 'Outside the model') }}</strong><span>{{ field?.unit }}</span></li>
    </ol>
    <p class="housing-scene__watch"><strong>{{ zh ? '观察结果：' : 'What changed: ' }}</strong>{{ zh ? `字段 ${field?.name} 的角色是“${roleLabel}”，单位为 ${field?.unit}。` : `${field?.name} is “${roleLabel}” and uses ${field?.unit}.` }}</p>
    <details><summary>{{ zh ? '查看文字数据表' : 'View text data table' }}</summary><table><tbody><tr><th>{{ zh ? '字段' : 'Field' }}</th><td>{{ field?.name }}</td></tr><tr><th>{{ zh ? '角色' : 'Role' }}</th><td>{{ roleLabel }}</td></tr><tr><th>{{ zh ? '单位' : 'Unit' }}</th><td>{{ field?.unit }}</td></tr><tr><th>{{ zh ? '当前值' : 'Current value' }}</th><td>{{ value }}</td></tr></tbody></table></details>
  </div>
</template>
