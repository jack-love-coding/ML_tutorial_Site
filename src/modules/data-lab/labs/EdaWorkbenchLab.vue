<script setup lang="ts">
import * as d3 from 'd3'
import { computed, ref } from 'vue'
import type { DataLabLocale } from '../types/dataLab'
import { groupByAggregate, housingTeachingTable } from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

type ViewMode = 'histogram' | 'box' | 'scatter' | 'groupby'

const mode = ref<ViewMode>('histogram')

const priceValues = computed(() =>
  housingTeachingTable.rows
    .map((row) => Number(row.price))
    .filter((value) => Number.isFinite(value)),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '交互实验',
        title: 'EDA 工作台',
        subtitle: '切换图形，观察同一列数据在不同视角下暴露出的风险。',
        histogram: '直方图',
        box: '箱线图',
        scatter: '散点图',
        groupby: '分组均值',
        mean: '均值',
        median: '中位数',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'EDA Workbench',
        subtitle: 'Switch plots and see how the same data exposes different risks.',
        histogram: 'histogram',
        box: 'box plot',
        scatter: 'scatter',
        groupby: 'group mean',
        mean: 'mean',
        median: 'median',
      },
)

const modeLabels = computed<Record<ViewMode, string>>(() => ({
  histogram: copy.value.histogram,
  box: copy.value.box,
  scatter: copy.value.scatter,
  groupby: copy.value.groupby,
}))

const histogramBars = computed(() => {
  const x = d3.scaleLinear().domain([0, 1200]).range([48, 500])
  const bins = d3.bin().domain([0, 1200]).thresholds([0, 300, 600, 900, 1200])(priceValues.value.map((value) => Math.min(value, 1200)))
  const y = d3.scaleLinear().domain([0, Math.max(1, ...bins.map((bin) => bin.length))]).range([180, 42])
  return bins.map((bin) => ({
    x: x(bin.x0 ?? 0),
    y: y(bin.length),
    width: Math.max(1, x(bin.x1 ?? 0) - x(bin.x0 ?? 0) - 5),
    height: 180 - y(bin.length),
  }))
})

const boxPlot = computed(() => {
  const sorted = [...priceValues.value].sort((a, b) => a - b)
  const scale = d3.scaleLinear().domain([0, 1200]).range([54, 500])
  return {
    min: scale(sorted[0] ?? 0),
    q1: scale(d3.quantileSorted(sorted, 0.25) ?? 0),
    median: scale(d3.quantileSorted(sorted, 0.5) ?? 0),
    q3: scale(d3.quantileSorted(sorted, 0.75) ?? 0),
    max: scale(Math.min(1200, sorted.at(-1) ?? 0)),
    outlier: scale(1200),
  }
})

const scatterPoints = computed(() => {
  const x = d3.scaleLinear().domain([0, 10]).range([56, 500])
  const y = d3.scaleLinear().domain([0, 1200]).range([184, 38])
  return housingTeachingTable.rows
    .filter((row) => Number.isFinite(Number(row.rooms)) && Number.isFinite(Number(row.price)))
    .map((row) => ({
      x: x(Number(row.rooms)),
      y: y(Math.min(Number(row.price), 1200)),
      outlier: Number(row.price) > 1200,
    }))
})

const groupedBars = computed(() => {
  const grouped = groupByAggregate(housingTeachingTable, 'district', 'price', 'mean')
  const x = d3.scaleBand<string>().domain(grouped.rows.map((row) => String(row.district))).range([52, 500]).padding(0.22)
  const y = d3.scaleLinear().domain([0, 1200]).range([184, 42])
  return grouped.rows.map((row) => ({
    key: String(row.district),
    x: x(String(row.district)) ?? 52,
    width: x.bandwidth(),
    y: y(Math.min(Number(row.price_mean), 1200)),
    height: 184 - y(Math.min(Number(row.price_mean), 1200)),
  }))
})

const mean = computed(() => d3.mean(priceValues.value) ?? 0)
const median = computed(() => d3.median(priceValues.value) ?? 0)
</script>

<template>
  <section class="data-lab-card eda-workbench-lab">
    <div class="data-lab-card__visual">
      <svg viewBox="0 0 540 230" role="img" :aria-label="copy.title">
        <line x1="42" y1="184" x2="510" y2="184" class="data-axis" />
        <line x1="42" y1="184" x2="42" y2="32" class="data-axis" />

        <g v-if="mode === 'histogram'">
          <rect v-for="bar in histogramBars" :key="bar.x" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" class="data-bar" />
        </g>
        <g v-else-if="mode === 'box'">
          <line :x1="boxPlot.min" y1="112" :x2="boxPlot.max" y2="112" class="data-box-line" />
          <rect :x="boxPlot.q1" y="76" :width="boxPlot.q3 - boxPlot.q1" height="72" class="data-box" />
          <line :x1="boxPlot.median" y1="70" :x2="boxPlot.median" y2="154" class="data-box-line is-median" />
          <circle :cx="boxPlot.outlier" cy="112" r="7" class="data-outlier" />
        </g>
        <g v-else-if="mode === 'scatter'">
          <circle v-for="point in scatterPoints" :key="`${point.x}-${point.y}`" :cx="point.x" :cy="point.y" r="8" :class="{ 'data-outlier': point.outlier, 'data-point': !point.outlier }" />
        </g>
        <g v-else>
          <rect v-for="bar in groupedBars" :key="bar.key" :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" class="data-bar is-grouped" />
          <text v-for="bar in groupedBars" :key="`${bar.key}-label`" :x="bar.x + bar.width / 2" y="206">{{ bar.key || 'NA' }}</text>
        </g>
      </svg>
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="data-segmented-control">
        <button
          v-for="candidate in (['histogram', 'box', 'scatter', 'groupby'] as ViewMode[])"
          :key="candidate"
          type="button"
          :class="{ 'is-active': mode === candidate }"
          @click="mode = candidate"
        >
          {{ modeLabels[candidate] }}
        </button>
      </div>

      <div class="data-readout-grid">
        <article><span>{{ copy.mean }}</span><strong>{{ mean.toFixed(1) }}</strong></article>
        <article><span>{{ copy.median }}</span><strong>{{ median.toFixed(1) }}</strong></article>
      </div>

      <pre class="data-code-block"><code>{{ mode === 'histogram'
        ? "df['price'].plot.hist()"
        : mode === 'box'
          ? "df['price'].plot.box()"
          : mode === 'scatter'
            ? "df.plot.scatter(x='rooms', y='price')"
            : "df.groupby('district')['price'].mean()" }}</code></pre>
    </div>
  </section>
</template>
