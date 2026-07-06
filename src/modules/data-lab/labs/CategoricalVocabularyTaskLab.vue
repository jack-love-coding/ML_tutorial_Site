<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTableView from '../components/DataTableView.vue'
import type { DataLabLocale, DataTable, LocalizedCopy } from '../types/dataLab'
import {
  buildCategoricalVocabularyTaskSnapshot,
  categoricalVocabularyTeachingRows,
  type CategoricalVocabularyScenarioId,
} from '../utils/categoricalVocabularyTask'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

const scenarioId = ref<CategoricalVocabularyScenarioId>('safe-train-vocab')
const includeDistrict = ref(true)
const includePropertyType = ref(false)
const includeRecordId = ref(false)
const rareThreshold = ref(2)

const vocabularyTable: DataTable = {
  columns: [
    { key: 'id', label: copy('记录', 'record'), semanticType: 'identifier' },
    { key: 'split', label: copy('划分', 'split'), semanticType: 'categorical' },
    { key: 'district', label: copy('街区', 'district'), semanticType: 'categorical' },
    { key: 'propertyType', label: copy('房源类型', 'property type'), semanticType: 'categorical' },
    { key: 'recordId', label: copy('记录 ID', 'record id'), semanticType: 'identifier' },
  ],
  rows: categoricalVocabularyTeachingRows.map((row) => ({ ...row })),
}

const scenarioOptions: Array<{
  id: CategoricalVocabularyScenarioId
  label: LocalizedCopy
  description: LocalizedCopy
}> = [
  {
    id: 'safe-train-vocab',
    label: copy('训练词表复用', 'Reuse train vocabulary'),
    description: copy('验证、测试和线上样本只 transform。', 'Validation, test, and serving only transform.'),
  },
  {
    id: 'validation-recomputed',
    label: copy('验证集重新建列', 'Validation recomputes columns'),
    description: copy('验证集自己决定 one-hot 槽位。', 'Validation decides one-hot slots by itself.'),
  },
  {
    id: 'all-data-vocab',
    label: copy('全数据 fit 词表', 'Fit vocabulary on all data'),
    description: copy('词表提前看见验证/测试类别。', 'The vocabulary sees validation/test categories early.'),
  },
  {
    id: 'id-high-cardinality',
    label: copy('记录 ID 展开', 'Expand record IDs'),
    description: copy('高基数 ID 让向量变宽并诱发记忆。', 'High-cardinality IDs widen vectors and invite memorization.'),
  },
]

const copyText = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '任务实验',
        title: '词表契约任务实验',
        englishTitle: 'Vocabulary Contract Task Lab',
        subtitle: '先预测词表从哪里来，再检查 OOV、RARE、槽位对齐和最终 [B,F]。',
        scenario: '场景',
        features: '类别输入',
        rareThreshold: '低频阈值',
        reset: '重置',
        status: '判定',
        safe: '契约稳定',
        unsafe: '契约有风险',
        fitSource: '词表来源',
        slots: '槽位总数',
        matrix: '矩阵形状',
        slotMap: '槽位对齐',
        vocabulary: '训练协议词表',
        mappedRows: '映射结果',
        reflection: '验证、测试和线上样本可以被 transform，但不能重新定义训练时学到的槽位含义。',
      }
    : {
        eyebrow: 'Task lab',
        title: 'Vocabulary Contract Task Lab',
        englishTitle: 'Vocabulary Contract Task Lab',
        subtitle: 'Predict where the vocabulary comes from, then inspect OOV, RARE, slot alignment, and final [B,F].',
        scenario: 'scenario',
        features: 'categorical inputs',
        rareThreshold: 'rare threshold',
        reset: 'reset',
        status: 'decision',
        safe: 'stable contract',
        unsafe: 'contract risk',
        fitSource: 'vocabulary source',
        slots: 'total slots',
        matrix: 'matrix shapes',
        slotMap: 'slot alignment',
        vocabulary: 'training protocol vocabulary',
        mappedRows: 'mapped rows',
        reflection: 'Validation, test, and serving examples may be transformed, but they must not redefine trained slot meaning.',
      },
)

const snapshot = computed(() =>
  buildCategoricalVocabularyTaskSnapshot({
    scenarioId: scenarioId.value,
    includeDistrict: includeDistrict.value,
    includePropertyType: includePropertyType.value,
    includeRecordId: includeRecordId.value,
    rareThreshold: rareThreshold.value,
  }),
)

const code = computed(() => snapshot.value.codeLines.join('\n'))
const visibleAlignment = computed(() => snapshot.value.slotAlignment.slice(0, 8))
const visibleRows = computed(() => snapshot.value.transformRows.slice(0, 6))

function resetLab() {
  scenarioId.value = 'safe-train-vocab'
  includeDistrict.value = true
  includePropertyType.value = false
  includeRecordId.value = false
  rareThreshold.value = 2
}

function sourceLabel(source: string) {
  if (props.locale === 'zh-CN') {
    if (source === 'train') return '训练集'
    if (source === 'validation') return '验证集'
    return '训练+验证+测试'
  }
  if (source === 'train') return 'train'
  if (source === 'validation') return 'validation'
  return 'train + validation + test'
}
</script>

<template>
  <section class="data-lab-card categorical-vocabulary-task-lab">
    <div class="data-lab-card__visual categorical-vocabulary-task-lab__visual">
      <DataTableView :table="vocabularyTable" :locale="locale" :max-rows="8" />

      <div class="categorical-vocabulary-task-lab__matrix" :aria-label="copyText.matrix">
        <article>
          <span>train</span>
          <strong>{{ snapshot.matrixShapes.train }}</strong>
        </article>
        <article>
          <span>validation</span>
          <strong>{{ snapshot.matrixShapes.validation }}</strong>
        </article>
        <article>
          <span>test</span>
          <strong>{{ snapshot.matrixShapes.test }}</strong>
        </article>
        <article>
          <span>serving</span>
          <strong>{{ snapshot.matrixShapes.serving }}</strong>
        </article>
      </div>

      <div class="categorical-vocabulary-task-lab__slot-map">
        <header>
          <strong>{{ copyText.slotMap }}</strong>
          <span>{{ copyText.fitSource }}: {{ sourceLabel(snapshot.fitSource) }}</span>
        </header>
        <div
          v-for="slot in visibleAlignment"
          :key="slot.index"
          class="categorical-vocabulary-task-lab__slot-row"
          :class="{ 'is-drift': !slot.aligned }"
        >
          <span>#{{ slot.index }}</span>
          <strong>{{ slot.trainSlot }}</strong>
          <em>{{ slot.validationSlot }}</em>
        </div>
      </div>
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copyText.eyebrow }}</span>
        <strong>{{ copyText.title }}</strong>
        <p>{{ copyText.subtitle }}</p>
      </header>

      <div class="categorical-vocabulary-task-lab__section">
        <div class="categorical-vocabulary-task-lab__heading">
          <strong>{{ copyText.scenario }}</strong>
          <button type="button" @click="resetLab">{{ copyText.reset }}</button>
        </div>
        <div class="categorical-vocabulary-task-lab__scenarios">
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

      <fieldset class="categorical-vocabulary-task-lab__features">
        <legend>{{ copyText.features }}</legend>
        <label>
          <input v-model="includeDistrict" type="checkbox" />
          <span>district</span>
        </label>
        <label>
          <input v-model="includePropertyType" type="checkbox" />
          <span>property_type</span>
        </label>
        <label>
          <input v-model="includeRecordId" type="checkbox" />
          <span>record_id</span>
        </label>
      </fieldset>

      <label class="data-range-control">
        {{ copyText.rareThreshold }}: {{ rareThreshold }}
        <input v-model.number="rareThreshold" type="range" min="1" max="3" step="1" />
      </label>

      <div class="categorical-vocabulary-task-lab__status" :class="{ 'is-safe': snapshot.safe, 'is-warning': !snapshot.safe }">
        <span>{{ copyText.status }}</span>
        <strong>{{ snapshot.safe ? copyText.safe : copyText.unsafe }}</strong>
        <p>{{ snapshot.safe ? copyText.reflection : snapshot.warnings.join(' ') }}</p>
      </div>

      <div class="categorical-vocabulary-task-lab__vocabulary">
        <article v-for="vocabulary in snapshot.trainVocabulary" :key="vocabulary.feature">
          <span>{{ vocabulary.feature }}</span>
          <strong>{{ vocabulary.tokens.join(' | ') }}</strong>
          <small v-if="vocabulary.rareValues.length">RARE: {{ vocabulary.rareValues.join(', ') }}</small>
        </article>
      </div>

      <div class="categorical-vocabulary-task-lab__mapped">
        <strong>{{ copyText.mappedRows }}</strong>
        <div v-for="row in visibleRows" :key="`${row.split}-${Object.values(row.raw).join('-')}`">
          <span>{{ row.split }}</span>
          <code>{{ row.activeSlots.join(', ') || '{}' }}</code>
        </div>
      </div>

      <pre class="data-code-block"><code>{{ code }}</code></pre>

      <p class="data-lab-note">
        {{ copyText.reflection }}
      </p>
    </div>
  </section>
</template>
