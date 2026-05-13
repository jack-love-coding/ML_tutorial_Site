<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTableView from '../components/DataTableView.vue'
import type { DataLabLocale, DataTable, PipelineStep } from '../types/dataLab'
import {
  deriveColumn,
  dropMissingRows,
  filterRows,
  groupByAggregate,
  housingTeachingTable,
  mergeLookup,
  selectColumns,
  sortBy,
  tableShape,
} from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

function copy(zh: string, en: string) {
  return { 'zh-CN': zh, en }
}

const currentStage = ref(3)

const lookupTable: DataTable = {
  columns: [
    { key: 'district', label: copy('街区', 'district'), semanticType: 'categorical' },
    { key: 'region', label: copy('区域', 'region'), semanticType: 'categorical' },
  ],
  rows: [
    { district: 'north', region: 'urban' },
    { district: 'west', region: 'suburban' },
    { district: 'east', region: 'urban' },
  ],
}

const steps: PipelineStep[] = [
  {
    id: 'select',
    label: copy('选择列', 'Select columns'),
    pandasCode: "df = df[['district', 'rooms', 'price']]",
    description: copy('只保留当前分析需要的列。', 'Keep only columns needed for the current analysis.'),
  },
  {
    id: 'filter',
    label: copy('过滤有效价格', 'Filter valid prices'),
    pandasCode: "df = df[df['price'].notna() & (df['price'] < 2000)]",
    description: copy('去掉缺失和明显越界价格。', 'Remove missing and clearly out-of-range prices.'),
  },
  {
    id: 'assign',
    label: copy('新增派生列', 'Add derived column'),
    pandasCode: "df = df.assign(price_per_room=lambda d: d['price'] / d['rooms'])",
    description: copy('把价格除以房间数，得到新的解释列。', 'Divide price by room count to create a new explanatory column.'),
  },
  {
    id: 'groupby',
    label: copy('按街区聚合', 'Group by district'),
    pandasCode: "df = df.groupby('district')['price_per_room'].mean().reset_index()",
    description: copy('用 split-apply-combine 得到每个街区的均值。', 'Use split-apply-combine to compute one mean per district.'),
  },
  {
    id: 'merge',
    label: copy('连接查找表', 'Merge lookup table'),
    pandasCode: "df = df.merge(district_lookup, on='district', how='left')",
    description: copy('把街区映射到更高层级区域。', 'Map each district to a higher-level region.'),
  },
  {
    id: 'sort',
    label: copy('排序输出', 'Sort output'),
    pandasCode: "df = df.sort_values('price_per_room_mean', ascending=False)",
    description: copy('把最需要解释的组放到前面。', 'Put the groups needing attention first.'),
  },
]

const copyText = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '交互实验',
        title: 'pandas Pipeline 模拟器',
        subtitle: '推进 method chain，观察表格和等价 pandas 代码同步变化。',
        shape: '形状',
        stage: '当前步骤',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'pandas Pipeline Simulator',
        subtitle: 'Advance a method chain and watch the table and equivalent pandas code move together.',
        shape: 'shape',
        stage: 'current step',
      },
)

function applyStep(table: DataTable, stepId: string): DataTable {
  if (stepId === 'select') return selectColumns(table, ['district', 'rooms', 'price'])
  if (stepId === 'filter') return filterRows(table, (row) => Number(row.price) < 2000 && row.price !== null && row.rooms !== null)
  if (stepId === 'assign') {
    return deriveColumn(
      table,
      { key: 'price_per_room', label: copy('每房价格', 'price per room'), semanticType: 'numeric' },
      (row) => Number((Number(row.price) / Number(row.rooms)).toFixed(2)),
    )
  }
  if (stepId === 'groupby') return groupByAggregate(table, 'district', 'price_per_room', 'mean')
  if (stepId === 'merge') return mergeLookup(table, lookupTable, 'district')
  if (stepId === 'sort') return sortBy(table, 'price_per_room_mean', 'desc')
  return table
}

const visibleSteps = computed(() => steps.slice(0, currentStage.value + 1))
const currentTable = computed(() =>
  visibleSteps.value.reduce((table, step) => applyStep(table, step.id), dropMissingRows(housingTeachingTable, 'district')),
)
const shape = computed(() => tableShape(currentTable.value))
const code = computed(() => visibleSteps.value.map((step) => step.pandasCode).join('\n'))
</script>

<template>
  <section class="data-lab-card pandas-pipeline-lab">
    <div class="data-lab-card__visual">
      <DataTableView :table="currentTable" :locale="locale" :max-rows="7" />
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copyText.eyebrow }}</span>
        <strong>{{ copyText.title }}</strong>
        <p>{{ copyText.subtitle }}</p>
      </header>

      <label class="data-range-control">
        {{ copyText.stage }}: {{ visibleSteps.at(-1)?.label[locale] }}
        <input v-model.number="currentStage" type="range" min="0" :max="steps.length - 1" step="1" />
      </label>

      <div class="data-pipeline-steps">
        <article v-for="(step, index) in steps" :key="step.id" :class="{ 'is-active': index <= currentStage }">
          <strong>{{ step.label[locale] }}</strong>
          <span>{{ step.description[locale] }}</span>
        </article>
      </div>

      <div class="data-readout-grid">
        <article><span>{{ copyText.shape }}</span><strong>{{ shape.rows }}×{{ shape.columns }}</strong></article>
      </div>

      <pre class="data-code-block"><code>{{ code }}</code></pre>
    </div>
  </section>
</template>
