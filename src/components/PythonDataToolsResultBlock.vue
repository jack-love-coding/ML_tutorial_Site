<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AppLocale } from '../types/ml.ts'
import type { PythonDataToolsResultPresentationBlock } from '../types/pythonDataToolsRuntime.ts'
import type {
  PythonDataToolsJsonOutputViewModel,
  PythonDataToolsLoadState,
  PythonDataToolsOutputViewModel,
  PythonDataToolsTeachingTable,
} from '../utils/pythonDataToolsOutputs.ts'
import MarkdownMathContent from './MarkdownMathContent.vue'
import PythonDataToolsPlotlyFigure from './PythonDataToolsPlotlyFigure.vue'

const props = withDefaults(defineProps<{
  presentation: PythonDataToolsResultPresentationBlock
  state: PythonDataToolsLoadState<PythonDataToolsOutputViewModel>
  locale: AppLocale
  fallbackResults?: readonly PythonDataToolsJsonOutputViewModel[]
}>(), {
  fallbackResults: () => [],
})
const emit = defineEmits<{
  'fallback-needed': []
}>()

const imageFailed = ref(false)
const plotlyFailed = ref(false)
const jsonResult = computed(() => (
  props.state.status === 'ready' && props.state.data.kind === 'json'
    ? props.state.data
    : undefined
))
const pngResult = computed(() => (
  props.state.status === 'ready' && props.state.data.kind === 'png'
    ? props.state.data
    : undefined
))
const plotlyResult = computed(() => (
  props.state.status === 'ready' && props.state.data.kind === 'plotly-json'
    ? props.state.data
    : undefined
))
const fallbackTables = computed(() => props.fallbackResults.flatMap(({ tables }) => tables))
const rawJson = computed(() => jsonResult.value ? JSON.stringify(jsonResult.value.raw, null, 2) : '')

watch(() => pngResult.value?.imageUrl, () => {
  imageFailed.value = false
})

watch(() => plotlyResult.value?.id, () => {
  plotlyFailed.value = false
})

watch(
  [() => props.state.status, imageFailed, plotlyFailed],
  ([status, failedImage, failedPlotly]) => {
    if (status === 'error' || failedImage || failedPlotly) emit('fallback-needed')
  },
)

function localizedLabel(source: string) {
  return props.presentation.axisLegendTranslations.find((entry) => entry.source === source)?.label[props.locale]
    ?? source
}

function displayValue(value: string | number | boolean | null) {
  if (value === null) return props.locale === 'zh-CN' ? '空值' : 'null'
  if (typeof value === 'boolean') {
    if (props.locale === 'zh-CN') return value ? '是' : '否'
    return value ? 'true' : 'false'
  }
  return String(value)
}

function tableLabel(table: PythonDataToolsTeachingTable) {
  return `${props.presentation.title[props.locale]} · ${localizedLabel(table.id)}`
}
</script>

<template>
  <section
    class="python-data-tools-result"
    :class="`is-${state.status}`"
    :data-output-id="presentation.outputId"
    :aria-labelledby="`${presentation.id}-title`"
  >
    <header class="python-data-tools-result__header">
      <p class="python-data-tools-result__eyebrow">
        {{ locale === 'zh-CN' ? '运行结果' : 'Runtime result' }}
      </p>
      <h3 :id="`${presentation.id}-title`">{{ presentation.title[locale] }}</h3>
    </header>

    <p v-if="state.status === 'idle'" class="python-data-tools-result__status" role="status">
      {{ locale === 'zh-CN' ? '等待读取这项结果。' : 'Waiting to read this result.' }}
    </p>
    <p v-else-if="state.status === 'loading'" class="python-data-tools-result__status" role="status">
      {{ locale === 'zh-CN' ? '正在读取这项结果。' : 'Reading this result.' }}
    </p>

    <div v-else-if="state.status === 'error'" class="python-data-tools-result__fallback" role="status">
      <p>{{ state.message[locale] }}</p>
      <MarkdownMathContent :source="presentation.alt[locale]" />
      <MarkdownMathContent :source="presentation.fallbackSummary[locale]" />
    </div>

    <template v-else>
      <div v-if="jsonResult" class="python-data-tools-result__structured">
        <dl v-if="jsonResult.keyValues.length" class="python-data-tools-result__key-values">
          <div v-for="item in jsonResult.keyValues" :key="item.key">
            <dt>{{ localizedLabel(item.key) }}</dt>
            <dd>{{ displayValue(item.value) }}</dd>
          </div>
        </dl>

        <div
          v-for="table in jsonResult.tables"
          :key="table.id"
          class="python-data-tools-result__table-wrap"
          tabindex="0"
          role="region"
          :aria-label="tableLabel(table)"
        >
          <table>
            <thead>
              <tr>
                <th v-for="column in table.columns" :key="column" scope="col">
                  {{ localizedLabel(column) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex">
                <td v-for="(value, columnIndex) in row" :key="columnIndex">
                  {{ displayValue(value) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <details class="python-data-tools-result__raw">
          <summary>{{ locale === 'zh-CN' ? '查看原始只读数据' : 'View raw read-only data' }}</summary>
          <pre><code>{{ rawJson }}</code></pre>
        </details>
      </div>

      <figure v-else-if="pngResult" class="python-data-tools-result__figure">
        <img
          v-if="!imageFailed"
          :src="pngResult.imageUrl"
          :alt="presentation.alt[locale]"
          loading="lazy"
          @load="imageFailed = false"
          @error="imageFailed = true"
        />
        <div v-else class="python-data-tools-result__fallback" role="status">
          <p>{{ locale === 'zh-CN' ? '图表暂时无法显示，下面保留文字说明和等价数据表。' : 'The chart is unavailable; its description and equivalent data table remain below.' }}</p>
          <MarkdownMathContent :source="presentation.alt[locale]" />
          <MarkdownMathContent :source="presentation.fallbackSummary[locale]" />
        </div>
        <figcaption>{{ presentation.title[locale] }}</figcaption>
      </figure>

      <div v-else-if="plotlyResult" class="python-data-tools-result__interactive">
        <PythonDataToolsPlotlyFigure
          :key="plotlyResult.id"
          :result="plotlyResult"
          :presentation="presentation"
          :locale="locale"
          @render-error="plotlyFailed = $event"
        />
      </div>
    </template>

    <section v-if="presentation.axisLegendTranslations.length" class="python-data-tools-result__translations">
      <h4>{{ locale === 'zh-CN' ? '图中标注' : 'Labels in the figure' }}</h4>
      <div class="python-data-tools-result__table-wrap" tabindex="0">
        <table>
          <thead>
            <tr>
              <th scope="col">{{ locale === 'zh-CN' ? '原图标注' : 'Chinese label in the figure' }}</th>
              <th scope="col">{{ locale === 'zh-CN' ? '页面含义' : 'English meaning' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in presentation.axisLegendTranslations" :key="entry.source">
              <td lang="zh-CN">{{ entry.source }}</td>
              <td>{{ entry.label[locale] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="fallbackTables.length && (state.status === 'error' || imageFailed || plotlyFailed)" class="python-data-tools-result__equivalent-data">
      <h4>{{ locale === 'zh-CN' ? '等价数据表' : 'Equivalent data table' }}</h4>
      <div
        v-for="table in fallbackTables"
        :key="table.id"
        class="python-data-tools-result__table-wrap"
        tabindex="0"
        role="region"
        :aria-label="tableLabel(table)"
      >
        <table>
          <thead>
            <tr>
              <th v-for="column in table.columns" :key="column" scope="col">
                {{ localizedLabel(column) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex">
              <td v-for="(value, columnIndex) in row" :key="columnIndex">
                {{ displayValue(value) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="python-data-tools-result__reading">
      <h4>{{ locale === 'zh-CN' ? '图表解读' : 'How to read it' }}</h4>
      <MarkdownMathContent :source="presentation.interpretation[locale]" />
      <h4>{{ locale === 'zh-CN' ? '需要注意' : 'What to keep in mind' }}</h4>
      <MarkdownMathContent :source="presentation.limitation[locale]" />
    </section>
  </section>
</template>
