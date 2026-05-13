<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTableView from '../components/DataTableView.vue'
import type { DataLabLocale, DataTable, PipelineStep } from '../types/dataLab'
import {
  castColumn,
  clipColumn,
  dropDuplicates,
  fillMissing,
  housingTeachingTable,
  profileColumns,
  tableShape,
} from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

const activeStepIds = ref(['fill-rooms', 'clip-price', 'dedupe', 'parse-date'])

function copy(zh: string, en: string) {
  return { 'zh-CN': zh, en }
}

const steps: PipelineStep[] = [
  {
    id: 'fill-rooms',
    label: copy('填充缺失房间数', 'Fill missing rooms'),
    pandasCode: "df['rooms'] = df['rooms'].fillna(df['rooms'].median())",
    description: copy('用训练集中位数填充缺失房间数。', 'Fill missing room counts with the training median.'),
  },
  {
    id: 'clip-price',
    label: copy('裁剪价格离群点', 'Clip price outlier'),
    pandasCode: "df['price'] = df['price'].clip(lower=100, upper=1200)",
    description: copy('把明显越界的价格限制到审计后的合理范围。', 'Limit extreme prices to an audited plausible range.'),
  },
  {
    id: 'dedupe',
    label: copy('按记录 ID 去重', 'Deduplicate by id'),
    pandasCode: "df = df.drop_duplicates(subset=['id'])",
    description: copy('防止同一记录重复影响统计和训练。', 'Prevent repeated records from affecting statistics and training.'),
  },
  {
    id: 'parse-date',
    label: copy('解析日期', 'Parse dates'),
    pandasCode: "df['listed_at'] = pd.to_datetime(df['listed_at'], errors='coerce')",
    description: copy('无法解析的日期变成缺失值，方便后续检查。', 'Unparseable dates become missing values for later inspection.'),
  },
]

const copyText = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '交互实验',
        title: '清洗流水线实验',
        subtitle: '切换清洗步骤，观察表格形状、缺失值和 pandas 代码怎样一起变化。',
        input: '输入表',
        output: '输出表',
        shape: '形状',
        profile: '列质量',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Cleaning Pipeline Lab',
        subtitle: 'Toggle cleaning steps and watch table shape, missingness, and pandas code change together.',
        input: 'input table',
        output: 'output table',
        shape: 'shape',
        profile: 'column quality',
      },
)

const activeSteps = computed(() => steps.filter((step) => activeStepIds.value.includes(step.id)))

function applyStep(table: DataTable, stepId: string) {
  if (stepId === 'fill-rooms') return fillMissing(table, 'rooms', 3)
  if (stepId === 'clip-price') return clipColumn(table, 'price', 100, 1200)
  if (stepId === 'dedupe') return dropDuplicates(table, ['id'])
  if (stepId === 'parse-date') return castColumn(table, 'listed_at', 'datetime')
  return table
}

const outputTable = computed(() =>
  activeSteps.value.reduce((table, step) => applyStep(table, step.id), housingTeachingTable),
)

const outputProfile = computed(() => profileColumns(outputTable.value))
const inputShape = computed(() => tableShape(housingTeachingTable))
const outputShape = computed(() => tableShape(outputTable.value))
</script>

<template>
  <section class="data-lab-card cleaning-pipeline-lab">
    <div class="data-lab-card__visual data-table-comparison">
      <article>
        <strong>{{ copyText.input }} · {{ copyText.shape }} {{ inputShape.rows }}×{{ inputShape.columns }}</strong>
        <DataTableView :table="housingTeachingTable" :locale="locale" :max-rows="6" />
      </article>
      <article>
        <strong>{{ copyText.output }} · {{ copyText.shape }} {{ outputShape.rows }}×{{ outputShape.columns }}</strong>
        <DataTableView :table="outputTable" :locale="locale" :max-rows="6" />
      </article>
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copyText.eyebrow }}</span>
        <strong>{{ copyText.title }}</strong>
        <p>{{ copyText.subtitle }}</p>
      </header>

      <div class="data-step-list">
        <label v-for="step in steps" :key="step.id">
          <input v-model="activeStepIds" type="checkbox" :value="step.id" />
          <span>
            <strong>{{ step.label[locale] }}</strong>
            <small>{{ step.description[locale] }}</small>
          </span>
        </label>
      </div>

      <pre class="data-code-block"><code>{{ activeSteps.map((step) => step.pandasCode).join('\n') }}</code></pre>

      <div class="data-quality-list">
        <article v-for="profile in outputProfile" :key="profile.key">
          <span>{{ profile.label[locale] }}</span>
          <strong>{{ profile.missingCount }} NA</strong>
        </article>
      </div>
    </div>
  </section>
</template>
