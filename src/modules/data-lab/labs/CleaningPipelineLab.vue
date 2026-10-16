<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTableView from '../components/DataTableView.vue'
import type { DataLabLocale, PipelineStep } from '../types/dataLab'
import { applyCleaningTeachingSteps, cleaningPriceBounds, cleaningStepIds, trainingRoomsMedian } from '../utils/cleaningTeachingExample.ts'
import {
  housingTeachingTable,
  profileColumns,
  tableShape,
} from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

const activeStepIds = ref<string[]>([...cleaningStepIds])

function copy(zh: string, en: string) {
  return { 'zh-CN': zh, en }
}

const steps: PipelineStep[] = [
  {
    id: 'fill-rooms',
    label: copy('填充缺失房间数', 'Fill missing rooms'),
    pandasCode: "rooms_fill = train_df['rooms'].median()\ndf['rooms'] = df['rooms'].fillna(rooms_fill)",
    description: copy(`用原始训练片段的中位数 ${trainingRoomsMedian} 填补；这是插补值。`, `Use the original training fragment’s median ${trainingRoomsMedian}; this is an imputed value.`),
  },
  {
    id: 'clip-price',
    label: copy('裁剪价格离群点', 'Clip price outlier'),
    pandasCode: `df['price'] = df['price'].clip(lower=${cleaningPriceBounds.lower}, upper=${cleaningPriceBounds.upper})`,
    description: copy('演示预先指定的 [100,1200] 裁剪规则；极端值不一定是错误。', 'Demonstrate predeclared [100,1200] clipping bounds; an extreme value need not be an error.'),
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
        subtitle: '这六行仅作训练片段。切换步骤，观察 shape、缺失与代码；真实任务先划分，再拟合填充值。',
        reset: '重置',
        input: '输入表',
        output: '输出表',
        shape: '形状',
        profile: '列质量',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Cleaning Pipeline Lab',
        subtitle: 'These six rows are a training-only fragment. Toggle steps and compare shape, missingness, and code. In a real task, split before fitting fill values.',
        reset: 'Reset',
        input: 'input table',
        output: 'output table',
        shape: 'shape',
        profile: 'column quality',
      },
)

const activeSteps = computed(() => steps.filter((step) => activeStepIds.value.includes(step.id)))

const outputTable = computed(() => applyCleaningTeachingSteps(activeStepIds.value))

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

      <button type="button" class="data-lab-reset" @click="activeStepIds = [...cleaningStepIds]">{{ copyText.reset }}</button>

      <pre class="data-code-block"><code>{{ 'df = train_df.copy()  # training-only teaching fragment\n' + activeSteps.map((step) => step.pandasCode).join('\n') }}</code></pre>

      <div class="data-quality-list">
        <article v-for="profile in outputProfile" :key="profile.key">
          <span>{{ profile.label[locale] }}</span>
          <strong>{{ profile.missingCount }} NA</strong>
        </article>
      </div>
    </div>
  </section>
</template>
