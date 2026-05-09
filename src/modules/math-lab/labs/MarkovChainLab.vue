<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  buildPageRankTransition,
  iterateMarkovChain,
  l1Distance,
  maxColumnSumError,
  multiplyMatrixVector,
  pageRankLectureAdjacency,
  stationaryDistributionPower,
} from '../utils/markovChains'

const props = defineProps<{
  locale: MathLabLocale
}>()

type PageId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

interface PageNode {
  id: PageId
  x: number
  y: number
}

interface PageEdge {
  source: PageNode
  target: PageNode
  weight: number
}

const damping = ref(0.85)
const iterations = ref(8)
const initialPage = ref<PageId>('A')

const pageNodes: PageNode[] = [
  { id: 'A', x: 72, y: 80 },
  { id: 'B', x: 216, y: 58 },
  { id: 'C', x: 354, y: 88 },
  { id: 'D', x: 92, y: 232 },
  { id: 'E', x: 246, y: 252 },
  { id: 'F', x: 368, y: 218 },
]

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? 'PageRank 随机游走实验' : 'PageRank Random-Walk Lab',
    subtitle: zh
      ? '调节阻尼因子、初始网页和迭代次数，观察概率质量如何被转移矩阵重分配并靠近稳定分布。'
      : 'Adjust damping, initial page, and iteration count to watch probability mass move through a transition matrix and approach a stationary distribution.',
    damping: zh ? '阻尼因子 d' : 'Damping factor d',
    iterations: zh ? '迭代次数 k' : 'Iterations k',
    initialPage: zh ? '初始网页' : 'Initial page',
    currentTop: zh ? '当前最高排名' : 'current top rank',
    stationaryTop: zh ? '稳定最高排名' : 'stationary top rank',
    topMass: zh ? '最高概率' : 'top probability',
    distance: zh ? '距稳定分布' : 'distance to stationary',
    residual: zh ? '稳定残差' : 'stationary residual',
    columnError: zh ? '列和误差' : 'column-sum error',
    matrix: zh ? '转移矩阵前两行' : 'first two transition rows',
    lowDampingNote: zh
      ? '阻尼较小时，随机跳转占主导，各网页概率更接近均匀分布，图结构的影响被冲淡。'
      : 'With low damping, random jumps dominate, page probabilities become flatter, and graph structure matters less.',
    balancedNote: zh
      ? '这是 PageRank 常用的平衡区间：大部分时间沿链接走，少量时间随机跳转，从而避免被局部陷阱锁住。'
      : 'This is the usual PageRank balance: mostly follow links, sometimes jump randomly, and avoid getting trapped in local components.',
    highDampingNote: zh
      ? '阻尼接近 1 时，链接结构几乎完全决定排名；如果图有陷阱或周期，收敛会更慢。'
      : 'When damping is near 1, links almost fully determine rank; traps or cycles in the graph can slow convergence.',
  }
})

const transition = computed(() => buildPageRankTransition(damping.value, pageRankLectureAdjacency))

const edges = computed<PageEdge[]>(() => {
  const result: PageEdge[] = []
  pageRankLectureAdjacency.forEach((row, targetIndex) => {
    row.forEach((value, sourceIndex) => {
      if (value <= 0) return
      result.push({
        source: pageNodes[sourceIndex]!,
        target: pageNodes[targetIndex]!,
        weight: transition.value.linkMatrix[targetIndex]![sourceIndex]!,
      })
    })
  })
  return result
})

const initialVector = computed(() =>
  pageNodes.map((node) => (node.id === initialPage.value ? 1 : 0)),
)

const history = computed(() => iterateMarkovChain(transition.value.transitionMatrix, initialVector.value, iterations.value))
const currentDistribution = computed(() => history.value[history.value.length - 1]!)
const stationary = computed(() => stationaryDistributionPower(transition.value.transitionMatrix))
const nextDistribution = computed(() => multiplyMatrixVector(transition.value.transitionMatrix, currentDistribution.value))
const stationarityGap = computed(() => l1Distance(nextDistribution.value, currentDistribution.value))
const distanceToStationary = computed(() => l1Distance(currentDistribution.value, stationary.value.vector))
const columnError = computed(() => maxColumnSumError(transition.value.transitionMatrix))

const rankedPages = computed(() =>
  pageNodes
    .map((node, index) => ({
      id: node.id,
      probability: currentDistribution.value[index] ?? 0,
      stationaryProbability: stationary.value.vector[index] ?? 0,
    }))
    .sort((a, b) => b.probability - a.probability),
)

const stationaryTopPage = computed(() =>
  pageNodes
    .map((node, index) => ({ id: node.id, probability: stationary.value.vector[index] ?? 0 }))
    .sort((a, b) => b.probability - a.probability)[0]!,
)

const matrixPreviewRows = computed(() =>
  transition.value.transitionMatrix.slice(0, 2).map((row) => row.map((value) => value.toFixed(2))),
)

const statusNote = computed(() => {
  if (damping.value < 0.55) return labels.value.lowDampingNote
  if (damping.value > 0.92) return labels.value.highDampingNote
  return labels.value.balancedNote
})

function pageProbability(pageId: PageId) {
  const index = pageNodes.findIndex((node) => node.id === pageId)
  return currentDistribution.value[index] ?? 0
}

function nodeRadius(pageId: PageId) {
  return 22 + pageProbability(pageId) * 46
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}
</script>

<template>
  <section class="math-lab-card markov-chain-lab">
    <div class="math-lab-card__visual markov-chain-lab__visual">
      <svg class="markov-chain-lab__graph" viewBox="0 0 440 320" role="img" :aria-label="labels.title">
        <title>{{ labels.title }}</title>
        <defs>
          <marker id="markov-lab-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L9,3 L0,6 Z" />
          </marker>
        </defs>

        <line
          v-for="edge in edges"
          :key="`${edge.source.id}-${edge.target.id}`"
          :x1="edge.source.x"
          :y1="edge.source.y"
          :x2="edge.target.x"
          :y2="edge.target.y"
          :stroke-width="1.8 + edge.weight * 5"
          :opacity="0.26 + edge.weight * 0.62"
          marker-end="url(#markov-lab-arrow)"
        />

        <g v-for="node in pageNodes" :key="node.id" class="markov-chain-lab__node">
          <circle
            :cx="node.x"
            :cy="node.y"
            :r="nodeRadius(node.id)"
            :class="{ 'is-initial': node.id === initialPage }"
          />
          <text :x="node.x" :y="node.y - 4" text-anchor="middle">{{ node.id }}</text>
          <text :x="node.x" :y="node.y + 17" text-anchor="middle" class="markov-chain-lab__node-value">
            {{ formatPercent(pageProbability(node.id)) }}
          </text>
        </g>
      </svg>

      <div class="markov-chain-lab__rank-bars">
        <article v-for="page in rankedPages" :key="page.id">
          <span>{{ page.id }}</span>
          <div>
            <i :style="{ width: `${Math.max(2, page.probability * 100)}%` }"></i>
          </div>
          <strong>{{ formatPercent(page.probability) }}</strong>
        </article>
      </div>

      <div class="markov-chain-lab__matrix">
        <article v-for="(row, index) in matrixPreviewRows" :key="index">
          <span>{{ labels.matrix }} {{ index + 1 }}</span>
          <strong>[{{ row.join(', ') }}]</strong>
        </article>
      </div>
    </div>

    <div class="math-lab-card__controls markov-chain-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls markov-chain-lab__control-grid">
        <label>
          {{ labels.damping }}: {{ damping.toFixed(2) }}
          <input v-model.number="damping" type="range" min="0.2" max="0.98" step="0.01" />
        </label>

        <label>
          {{ labels.iterations }}: {{ iterations }}
          <input v-model.number="iterations" type="range" min="0" max="30" step="1" />
        </label>

        <label>
          {{ labels.initialPage }}
          <select v-model="initialPage">
            <option v-for="node in pageNodes" :key="node.id" :value="node.id">
              {{ node.id }}
            </option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.currentTop }}</span>
          <strong>{{ rankedPages[0]?.id }}</strong>
        </article>
        <article>
          <span>{{ labels.topMass }}</span>
          <strong>{{ formatPercent(rankedPages[0]?.probability ?? 0) }}</strong>
        </article>
        <article>
          <span>{{ labels.stationaryTop }}</span>
          <strong>{{ stationaryTopPage.id }} · {{ formatPercent(stationaryTopPage.probability) }}</strong>
        </article>
        <article>
          <span>{{ labels.distance }}</span>
          <strong>{{ distanceToStationary.toExponential(2) }}</strong>
        </article>
        <article>
          <span>{{ labels.residual }}</span>
          <strong>{{ stationarityGap.toExponential(2) }}</strong>
        </article>
        <article>
          <span>{{ labels.columnError }}</span>
          <strong>{{ columnError.toExponential(1) }}</strong>
        </article>
      </div>

      <p class="math-lab-note markov-chain-lab__status">{{ statusNote }}</p>
    </div>
  </section>
</template>
