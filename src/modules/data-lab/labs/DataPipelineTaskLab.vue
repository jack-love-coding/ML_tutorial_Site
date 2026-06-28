<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTableView from '../components/DataTableView.vue'
import type { DataLabLocale, DataTable, LocalizedCopy } from '../types/dataLab'
import {
  buildDataPipelineTaskSnapshot,
  dataPipelineTeachingRows,
  type PipelineFitSource,
  type PipelineScenarioId,
} from '../utils/pipelineTask'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

const scenarioId = ref<PipelineScenarioId>('safe')
const includeRooms = ref(true)
const includePrice = ref(true)
const includeDistrict = ref(true)

const pipelineTable: DataTable = {
  columns: [
    { key: 'id', label: copy('记录', 'record'), semanticType: 'identifier' },
    { key: 'split', label: copy('划分', 'split'), semanticType: 'categorical' },
    { key: 'rooms', label: copy('房间数', 'rooms'), semanticType: 'numeric' },
    { key: 'price', label: copy('价格', 'price'), semanticType: 'numeric' },
    { key: 'district', label: copy('街区', 'district'), semanticType: 'categorical' },
  ],
  rows: dataPipelineTeachingRows.map((row) => ({ ...row })),
}

const scenarioOptions: Array<{
  id: PipelineScenarioId
  label: LocalizedCopy
  description: LocalizedCopy
}> = [
  {
    id: 'safe',
    label: copy('先划分，再只 fit 训练集', 'Split first, fit train only'),
    description: copy('验证集和测试集只参与 transform。', 'Validation and test only go through transform.'),
  },
  {
    id: 'fit-before-split',
    label: copy('先 fit 全表，再划分', 'Fit all rows before split'),
    description: copy('缩放器看见了验证/测试统计量。', 'The scaler sees validation/test statistics.'),
  },
  {
    id: 'vocab-on-all',
    label: copy('类别词表从全表学习', 'Learn vocabulary on all rows'),
    description: copy('词表提前知道未知街区。', 'The vocabulary already knows held-out districts.'),
  },
]

const copyText = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '任务实验',
        title: 'split / fit / transform 泄漏排查',
        subtitle: '判断预处理参数从哪里学来，再观察特征列数和 [B,F] 矩阵形状怎样变化。',
        scenario: '流水线顺序',
        features: '进入模型的列',
        matrix: '矩阵形状',
        fitSource: 'fit 来源',
        scaler: '缩放器',
        vocabulary: '类别词表',
        status: '判定',
        safe: '无泄漏',
        unsafe: '有泄漏',
        reset: '重置',
        noLeakage: '预处理只在训练集 fit，验证和测试保持未知样本身份。',
        noFeature: '当前没有任何输入特征，模型矩阵会退化为 0 列。',
        reflection: '复查顺序：split 先发生，fit 只能看训练集，transform 才能应用到每个划分。',
      }
    : {
        eyebrow: 'Task lab',
        title: 'split / fit / transform leakage check',
        subtitle: 'Decide where preprocessing parameters are learned, then inspect feature count and [B,F] matrix shapes.',
        scenario: 'pipeline order',
        features: 'model input columns',
        matrix: 'matrix shapes',
        fitSource: 'fit source',
        scaler: 'scaler',
        vocabulary: 'vocabulary',
        status: 'decision',
        safe: 'no leakage',
        unsafe: 'leakage',
        reset: 'reset',
        noLeakage: 'Preprocessing is fit on training data only; validation and test stay unseen.',
        noFeature: 'No input feature is selected, so the model matrix collapses to 0 columns.',
        reflection: 'Audit the order: split happens first, fit can only see train, transform applies to each split.',
      },
)

const snapshot = computed(() =>
  buildDataPipelineTaskSnapshot({
    scenarioId: scenarioId.value,
    includeRooms: includeRooms.value,
    includePrice: includePrice.value,
    includeDistrict: includeDistrict.value,
  }),
)

const selectedFeatureCount = computed(() => snapshot.value.featureCounts.total)
const code = computed(() => snapshot.value.codeLines.join('\n'))
const leakageReasons = computed(() => {
  const reasons: LocalizedCopy[] = []

  if (snapshot.value.fitSources.scaler === 'all') {
    reasons.push(
      copy(
        '缩放器在划分前 fit，验证/测试集的均值和尺度进入了训练协议。',
        'The scaler is fit before splitting, so validation/test scale statistics enter the training protocol.',
      ),
    )
  }

  if (snapshot.value.fitSources.vocabulary === 'all') {
    reasons.push(
      copy(
        '类别词表从全表 fit，模型提前知道了验证/测试中才出现的类别。',
        'The vocabulary is fit on all rows, so the model knows categories that should be held out.',
      ),
    )
  }

  return reasons
})

function sourceLabel(source: PipelineFitSource) {
  if (props.locale === 'zh-CN') {
    if (source === 'train') return '训练集'
    if (source === 'all') return '全表'
    return '未使用'
  }
  if (source === 'train') return 'train'
  if (source === 'all') return 'all rows'
  return 'not used'
}

function rowLabel(count: number) {
  if (props.locale === 'zh-CN') return '行'
  return count === 1 ? 'row' : 'rows'
}

function resetLab() {
  scenarioId.value = 'safe'
  includeRooms.value = true
  includePrice.value = true
  includeDistrict.value = true
}
</script>

<template>
  <section class="data-lab-card data-pipeline-task-lab">
    <div class="data-lab-card__visual data-pipeline-task-lab__visual">
      <DataTableView :table="pipelineTable" :locale="locale" :max-rows="6" />

      <div class="data-pipeline-task-lab__readouts" :aria-label="copyText.matrix">
        <article>
          <span>train</span>
          <strong>{{ snapshot.matrixShapes.train }}</strong>
          <small>{{ snapshot.splitCounts.train }} {{ rowLabel(snapshot.splitCounts.train) }}</small>
        </article>
        <article>
          <span>validation</span>
          <strong>{{ snapshot.matrixShapes.validation }}</strong>
          <small>{{ snapshot.splitCounts.validation }} {{ rowLabel(snapshot.splitCounts.validation) }}</small>
        </article>
        <article>
          <span>test</span>
          <strong>{{ snapshot.matrixShapes.test }}</strong>
          <small>{{ snapshot.splitCounts.test }} {{ rowLabel(snapshot.splitCounts.test) }}</small>
        </article>
      </div>

      <div class="data-pipeline-task-lab__fit">
        <article :class="{ 'is-warning': snapshot.fitSources.scaler === 'all' }">
          <span>{{ copyText.scaler }}</span>
          <strong>{{ sourceLabel(snapshot.fitSources.scaler) }}</strong>
        </article>
        <article :class="{ 'is-warning': snapshot.fitSources.vocabulary === 'all' }">
          <span>{{ copyText.vocabulary }}</span>
          <strong>{{ sourceLabel(snapshot.fitSources.vocabulary) }}</strong>
        </article>
      </div>
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copyText.eyebrow }}</span>
        <strong>{{ copyText.title }}</strong>
        <p>{{ copyText.subtitle }}</p>
      </header>

      <div class="data-pipeline-task-lab__section">
        <div class="data-pipeline-task-lab__heading">
          <strong>{{ copyText.scenario }}</strong>
          <button type="button" @click="resetLab">{{ copyText.reset }}</button>
        </div>
        <div class="data-pipeline-task-lab__scenarios">
          <button
            v-for="option in scenarioOptions"
            :key="option.id"
            type="button"
            :class="{ 'is-active': option.id === scenarioId }"
            :aria-pressed="option.id === scenarioId"
            @click="scenarioId = option.id"
          >
            <strong>{{ option.label[locale] }}</strong>
            <small>{{ option.description[locale] }}</small>
          </button>
        </div>
      </div>

      <fieldset class="data-pipeline-task-lab__features">
        <legend>{{ copyText.features }}</legend>
        <label>
          <input v-model="includeRooms" type="checkbox" />
          <span>rooms</span>
        </label>
        <label>
          <input v-model="includePrice" type="checkbox" />
          <span>price</span>
        </label>
        <label>
          <input v-model="includeDistrict" type="checkbox" />
          <span>district</span>
        </label>
      </fieldset>

      <div class="data-pipeline-task-lab__status" :class="{ 'is-safe': snapshot.safe, 'is-warning': !snapshot.safe }">
        <span>{{ copyText.status }}</span>
        <strong>{{ snapshot.safe ? copyText.safe : copyText.unsafe }}</strong>
        <p>{{ snapshot.safe ? copyText.noLeakage : leakageReasons.map((reason) => reason[locale]).join(' ') }}</p>
      </div>

      <div v-if="selectedFeatureCount === 0" class="data-lab-note is-warning">
        {{ copyText.noFeature }}
      </div>

      <pre class="data-code-block"><code>{{ code }}</code></pre>

      <p class="data-lab-note">
        {{ copyText.reflection }}
      </p>
    </div>
  </section>
</template>
