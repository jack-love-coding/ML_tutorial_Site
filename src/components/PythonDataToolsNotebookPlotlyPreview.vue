<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Config, Data, Layout } from 'plotly.js'
import type { AppLocale } from '../types/ml.ts'
import type { PythonDataToolsCellPlotlyOutput } from '../utils/pythonDataToolsOutputs.ts'
import { withPublicBase } from '../utils/publicPath.ts'

type PlotlyApi = typeof import('plotly.js')

const props = defineProps<{
  output: PythonDataToolsCellPlotlyOutput
  locale: AppLocale
}>()

const graphElement = ref<HTMLDivElement>()
const status = ref<'loading' | 'ready' | 'error'>('loading')

let Plotly: PlotlyApi | undefined
let controller: AbortController | undefined
let resizeObserver: ResizeObserver | undefined
let mounted = false
let requestId = 0

const plotlyConfig: Partial<Config> = {
  responsive: true,
  displaylogo: false,
  displayModeBar: true,
  modeBarButtons: [['zoom2d', 'resetScale2d']],
  scrollZoom: false,
  showLink: false,
  sendData: false,
  showSendToCloud: false,
  showEditInChartStudio: false,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function loadPlotly() {
  const module = await import('plotly.js-basic-dist-min')
  return module.default
}

async function renderPreview() {
  const currentRequest = ++requestId
  controller?.abort()
  controller = new AbortController()
  status.value = 'loading'
  try {
    const response = await fetch(withPublicBase(props.output.publicPath), { signal: controller.signal })
    if (!response.ok) throw new Error('Plotly preview unavailable')
    const figure: unknown = await response.json()
    if (!isRecord(figure) || !Array.isArray(figure.data) || !isRecord(figure.layout)) {
      throw new Error('Invalid Plotly preview')
    }
    Plotly ??= await loadPlotly()
    if (!mounted || currentRequest !== requestId || !graphElement.value) return
    await Plotly.react(
      graphElement.value,
      figure.data as Data[],
      { ...(figure.layout as Partial<Layout>), autosize: true },
      plotlyConfig,
    )
    if (!mounted || currentRequest !== requestId) return
    status.value = 'ready'
  } catch (error) {
    if (!mounted || currentRequest !== requestId || controller.signal.aborted) return
    status.value = 'error'
  }
}

function resizePlot() {
  if (!Plotly || !graphElement.value || status.value !== 'ready') return
  try {
    Plotly.Plots.resize(graphElement.value)
  } catch {
    status.value = 'error'
  }
}

watch(() => props.output.publicPath, () => {
  if (mounted) void renderPreview()
})

onMounted(() => {
  mounted = true
  if (typeof ResizeObserver !== 'undefined' && graphElement.value) {
    resizeObserver = new ResizeObserver(resizePlot)
    resizeObserver.observe(graphElement.value)
  } else {
    window.addEventListener('resize', resizePlot)
  }
  void renderPreview()
})

onBeforeUnmount(() => {
  mounted = false
  requestId += 1
  controller?.abort()
  resizeObserver?.disconnect()
  window.removeEventListener('resize', resizePlot)
  if (Plotly && graphElement.value) Plotly.purge(graphElement.value)
})
</script>

<template>
  <div class="python-data-tools-cell-output__plotly">
    <p v-if="status === 'loading'" role="status">
      {{ locale === 'zh-CN' ? '正在加载图表输出。' : 'Loading chart output.' }}
    </p>
    <div
      ref="graphElement"
      class="python-data-tools-cell-output__plotly-graph"
      :class="{ 'is-hidden': status === 'error' }"
      role="img"
      :aria-label="output.description[locale]"
    />
    <p v-if="status === 'error'" role="status">
      {{ locale === 'zh-CN' ? '图表输出暂时无法显示。' : 'The chart output is temporarily unavailable.' }}
      {{ output.description[locale] }}
    </p>
  </div>
</template>
