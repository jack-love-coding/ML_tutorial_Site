<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Config, Data, Layout, PlotlyHTMLElement } from 'plotly.js'
import type { AppLocale } from '../types/ml.ts'
import type { PythonDataToolsResultPresentationBlock } from '../types/pythonDataToolsRuntime.ts'
import type { PythonDataToolsPlotlyOutputViewModel } from '../utils/pythonDataToolsOutputs.ts'
import MarkdownMathContent from './MarkdownMathContent.vue'

type PlotlyApi = typeof import('plotly.js')

interface PlotlyGroupOption {
  id: '0' | '1'
  traceIndex: number
  sourceName: string
}

const props = defineProps<{
  result: PythonDataToolsPlotlyOutputViewModel
  presentation: PythonDataToolsResultPresentationBlock
  locale: AppLocale
}>()

const emit = defineEmits<{
  'render-error': [failed: boolean]
}>()

const graphElement = ref<HTMLDivElement>()
const startHour = ref(0)
const endHour = ref(23)
const visibleGroupIds = ref<PlotlyGroupOption['id'][]>(['0', '1'])
const renderStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')

let Plotly: PlotlyApi | undefined
let resizeObserver: ResizeObserver | undefined
let renderQueue = Promise.resolve()
let renderRequestId = 0
let mounted = false

const allowedWorkingDayValues = new Set([0, 1])

function clampHour(value: unknown, fallback: number) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.min(23, Math.round(numeric)))
}

function defaultHours() {
  const source = props.result.defaultFilterState.hours
  if (!Array.isArray(source) || source.length !== 2) return [0, 23] as const
  const start = clampHour(source[0], 0)
  const end = clampHour(source[1], 23)
  return [Math.min(start, end), Math.max(start, end)] as const
}

const groupOptions = computed<PlotlyGroupOption[]>(() => {
  const sourceValues = props.result.defaultFilterState.workingday_values
  const values = Array.isArray(sourceValues)
    ? sourceValues.filter((value): value is 0 | 1 => (
      typeof value === 'number' && allowedWorkingDayValues.has(value)
    ))
    : []

  return values.flatMap((value, index) => {
    const trace = props.result.figure.data[index]
    if (!trace) return []
    const sourceName = typeof trace.name === 'string' && trace.name.trim()
      ? trace.name
      : String(value)
    return [{ id: String(value) as PlotlyGroupOption['id'], traceIndex: index, sourceName }]
  })
})

function quotedTargets(source: string) {
  const entry = props.presentation.axisLegendTranslations.find((candidate) => candidate.source === source)
  const copy = entry?.label[props.locale] ?? ''
  const target = copy.split('→').at(-1) ?? copy
  return [...target.matchAll(/[“"]([^”"]+)[”"]/g)].map((match) => match[1]!).filter(Boolean)
}

function translatedAxisLabel(source: 'x-axis' | 'y-axis', fallback: string) {
  return quotedTargets(source)[0] ?? fallback
}

function translatedGroupLabel(group: PlotlyGroupOption) {
  if (props.locale === 'zh-CN') return group.sourceName
  const labels = quotedTargets('legend')
  return (group.id === '1' ? labels[1] : labels[2]) ?? group.sourceName
}

const legendTitle = computed(() => {
  if (props.locale === 'zh-CN') {
    const layout = props.result.figure.layout as { legend?: { title?: { text?: unknown } } }
    return typeof layout.legend?.title?.text === 'string' ? layout.legend.title.text : '日期类型'
  }
  return quotedTargets('legend')[0] ?? 'Date type'
})

const hoverLabels = computed(() => {
  const labels = quotedTargets('hover')
  if (props.locale === 'zh-CN') {
    return ['日期类型', '小时', '平均每小时租车次数', '中位数', '小时记录数'] as const
  }
  return [legendTitle.value, labels[0] ?? 'Hour', labels[1] ?? 'Mean rentals per hour', labels[2] ?? 'Median', labels[3] ?? 'Hourly record count'] as const
})

const uiCopy = computed(() => props.locale === 'zh-CN'
  ? {
      controls: '交互图筛选',
      startHour: '起始小时',
      endHour: '结束小时',
      groups: '显示日期类型',
      reset: '恢复默认视图',
      loading: '正在加载交互图。',
      unavailable: '交互图暂时无法显示，当前筛选说明、结果解读和等价数据表仍然可用。',
      current: '当前视图',
      hours: '小时范围',
      metric: '平均每小时租车次数',
      noGroups: '未显示日期类型',
    }
  : {
      controls: 'Interactive chart filters',
      startHour: 'Start hour',
      endHour: 'End hour',
      groups: 'Show date types',
      reset: 'Reset default view',
      loading: 'Loading the interactive chart.',
      unavailable: 'The interactive chart is unavailable. The current-filter explanation, result interpretation, and equivalent data table remain available.',
      current: 'Current view',
      hours: 'hour range',
      metric: 'mean rentals per hour',
      noGroups: 'no date types shown',
    })

const selectedGroups = computed(() => groupOptions.value.filter(({ id }) => visibleGroupIds.value.includes(id)))
const currentFilterSummary = computed(() => {
  const groups = selectedGroups.value.map(translatedGroupLabel).join('、') || uiCopy.value.noGroups
  return `${uiCopy.value.current}: ${uiCopy.value.hours} ${startHour.value}–${endHour.value}; ${uiCopy.value.groups}: ${groups}; ${uiCopy.value.metric}.`
})

function resetFilters() {
  const [defaultStart, defaultEnd] = defaultHours()
  const hidden = props.result.defaultFilterState.hidden_groups
  const hiddenIds = Array.isArray(hidden)
    ? hidden.map(String).filter((value): value is PlotlyGroupOption['id'] => value === '0' || value === '1')
    : []
  startHour.value = defaultStart
  endHour.value = defaultEnd
  visibleGroupIds.value = groupOptions.value
    .map(({ id }) => id)
    .filter((id) => !hiddenIds.includes(id))
}

function setStartHour(event: Event) {
  const next = clampHour((event.target as HTMLInputElement).value, startHour.value)
  startHour.value = Math.min(next, endHour.value)
}

function setEndHour(event: Event) {
  const next = clampHour((event.target as HTMLInputElement).value, endHour.value)
  endHour.value = Math.max(next, startHour.value)
}

function toggleGroup(id: PlotlyGroupOption['id'], event: Event) {
  if (!groupOptions.value.some((group) => group.id === id)) return
  const checked = (event.target as HTMLInputElement).checked
  const next = new Set(visibleGroupIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  visibleGroupIds.value = groupOptions.value.map(({ id: allowedId }) => allowedId).filter((allowedId) => next.has(allowedId))
}

function localizedFigure() {
  // Loader output is immutable JSON, but Vue wraps nested props in reactive
  // proxies. structuredClone rejects those proxies in browsers, so derive the
  // localized data and layout without mutating or cloning the prop container.
  const figure = props.result.figure
  const [groupLabel, hourLabel, meanLabel, medianLabel, observationsLabel] = hoverLabels.value
  const data = groupOptions.value.map((group) => {
    const trace = figure.data[group.traceIndex] ?? {}
    return {
      ...trace,
      name: translatedGroupLabel(group),
      legendgroup: group.id,
      visible: visibleGroupIds.value.includes(group.id) ? true : 'legendonly',
      hovertemplate: `${groupLabel}=%{fullData.name}<br>${hourLabel}=%{x:.0f}<br>${meanLabel}=%{y:.1f}<br>${observationsLabel}=%{customdata[1]:,.0f}<br>${medianLabel}=%{customdata[2]:.1f}<extra></extra>`,
    }
  }) as Data[]
  const sourceLayout = figure.layout as Partial<Layout>
  const sourceXAxis = sourceLayout.xaxis ?? {}
  const sourceYAxis = sourceLayout.yaxis ?? {}
  const sourceXTitle = typeof sourceXAxis.title === 'object' && sourceXAxis.title && 'text' in sourceXAxis.title
    ? String(sourceXAxis.title.text ?? '')
    : ''
  const sourceYTitle = typeof sourceYAxis.title === 'object' && sourceYAxis.title && 'text' in sourceYAxis.title
    ? String(sourceYAxis.title.text ?? '')
    : ''
  const layout: Partial<Layout> = {
    ...sourceLayout,
    autosize: true,
    dragmode: 'zoom',
    hovermode: 'x unified',
    showlegend: true,
    title: { ...sourceLayout.title, text: props.presentation.title[props.locale] },
    legend: { ...sourceLayout.legend, title: { text: legendTitle.value } },
    xaxis: {
      ...sourceXAxis,
      range: [startHour.value, endHour.value],
      title: { ...sourceXAxis.title, text: translatedAxisLabel('x-axis', sourceXTitle) },
    },
    yaxis: {
      ...sourceYAxis,
      title: { ...sourceYAxis.title, text: translatedAxisLabel('y-axis', sourceYTitle) },
    },
    transition: { duration: 0, easing: 'linear' },
    uirevision: `${startHour.value}-${endHour.value}-${visibleGroupIds.value.join(',')}`,
  }
  return { data, layout }
}

const plotlyConfig: Partial<Config> = {
  responsive: true,
  displaylogo: false,
  displayModeBar: true,
  modeBarButtons: [['zoom2d', 'resetScale2d']],
  scrollZoom: false,
  doubleClick: 'reset',
  showLink: false,
  sendData: false,
  showSendToCloud: false,
  showEditInChartStudio: false,
}

async function loadPlotly() {
  const module = await import('plotly.js-basic-dist-min')
  return module.default
}

async function renderFigure(requestId: number) {
  const target = graphElement.value
  if (!target || !mounted || requestId !== renderRequestId) return
  renderStatus.value = 'loading'
  try {
    Plotly ??= await loadPlotly()
    if (!mounted || requestId !== renderRequestId) return
    const figure = localizedFigure()
    const rendered = await Plotly.react(target, figure.data, figure.layout, plotlyConfig)
    if (!mounted || requestId !== renderRequestId) {
      Plotly.purge(target)
      return
    }
    const graph = rendered as PlotlyHTMLElement
    graph.removeAllListeners('plotly_legendclick')
    graph.removeAllListeners('plotly_legenddoubleclick')
    graph.on('plotly_legendclick', () => false)
    graph.on('plotly_legenddoubleclick', () => false)
    renderStatus.value = 'ready'
    emit('render-error', false)
  } catch {
    if (!mounted || requestId !== renderRequestId) return
    renderStatus.value = 'error'
    emit('render-error', true)
  }
}

function queueRender() {
  const requestId = ++renderRequestId
  renderQueue = renderQueue.catch(() => undefined).then(() => renderFigure(requestId))
}

function resizePlot() {
  if (!Plotly || !graphElement.value || renderStatus.value !== 'ready') return
  try {
    Plotly.Plots.resize(graphElement.value)
  } catch {
    renderStatus.value = 'error'
    emit('render-error', true)
  }
}

watch(() => props.result.id, resetFilters, { immediate: true })
watch([() => props.locale, startHour, endHour, visibleGroupIds], queueRender, { flush: 'post' })

onMounted(() => {
  mounted = true
  if (typeof ResizeObserver !== 'undefined' && graphElement.value) {
    resizeObserver = new ResizeObserver(resizePlot)
    resizeObserver.observe(graphElement.value)
  } else {
    window.addEventListener('resize', resizePlot)
  }
  queueRender()
})

onBeforeUnmount(() => {
  mounted = false
  renderRequestId += 1
  resizeObserver?.disconnect()
  resizeObserver = undefined
  window.removeEventListener('resize', resizePlot)
  if (Plotly && graphElement.value) Plotly.purge(graphElement.value)
})
</script>

<template>
  <section class="python-data-tools-plotly" :aria-label="presentation.title[locale]">
    <fieldset class="python-data-tools-plotly__controls">
      <legend>{{ uiCopy.controls }}</legend>
      <label>
        <span>{{ uiCopy.startHour }}: {{ startHour }}</span>
        <input type="range" min="0" max="23" step="1" :value="startHour" @input="setStartHour" />
      </label>
      <label>
        <span>{{ uiCopy.endHour }}: {{ endHour }}</span>
        <input type="range" min="0" max="23" step="1" :value="endHour" @input="setEndHour" />
      </label>
      <div class="python-data-tools-plotly__groups" role="group" :aria-label="uiCopy.groups">
        <label v-for="group in groupOptions" :key="group.id">
          <input
            type="checkbox"
            :checked="visibleGroupIds.includes(group.id)"
            @change="toggleGroup(group.id, $event)"
          />
          <span>{{ translatedGroupLabel(group) }}</span>
        </label>
      </div>
      <button type="button" @click="resetFilters">{{ uiCopy.reset }}</button>
    </fieldset>

    <p class="python-data-tools-plotly__summary" aria-live="polite">{{ currentFilterSummary }}</p>
    <p v-if="renderStatus === 'loading'" class="python-data-tools-plotly__status" role="status">{{ uiCopy.loading }}</p>
    <div
      ref="graphElement"
      class="python-data-tools-plotly__graph"
      :class="{ 'is-hidden': renderStatus === 'error' }"
      role="img"
      :aria-label="presentation.alt[locale]"
    />
    <div v-if="renderStatus === 'error'" class="python-data-tools-result__fallback" role="status">
      <p>{{ uiCopy.unavailable }}</p>
      <MarkdownMathContent :source="presentation.alt[locale]" />
      <MarkdownMathContent :source="presentation.fallbackSummary[locale]" />
    </div>
  </section>
</template>

<style scoped>
.python-data-tools-plotly {
  display: grid;
  gap: 0.85rem;
}

.python-data-tools-plotly__controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
  margin: 0;
  padding: 0.9rem;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 0.75rem;
}

.python-data-tools-plotly__controls > label,
.python-data-tools-plotly__groups label {
  display: grid;
  gap: 0.35rem;
}

.python-data-tools-plotly__controls input[type='range'] {
  width: 100%;
}

.python-data-tools-plotly__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.python-data-tools-plotly__groups label {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.python-data-tools-plotly__controls button {
  justify-self: start;
  min-height: 2.5rem;
}

.python-data-tools-plotly__summary,
.python-data-tools-plotly__status {
  margin: 0;
}

.python-data-tools-plotly__graph {
  min-width: 0;
  min-height: 26rem;
}

.python-data-tools-plotly__graph.is-hidden {
  display: none;
}

@media (max-width: 680px) {
  .python-data-tools-plotly__controls {
    grid-template-columns: 1fr;
  }

  .python-data-tools-plotly__graph {
    min-height: 22rem;
  }
}
</style>
