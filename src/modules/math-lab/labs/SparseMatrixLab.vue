<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  denseToCoo,
  denseToCsr,
  estimateSparseStorage,
  generateBandedSparseMatrix,
} from '../utils/sparseMatrix'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const matrixSize = ref(2000)
const nonzerosPerRow = ref(5)
const storageFormat = ref<'coo' | 'csr'>('csr')
const highlightRow = ref(4)

const previewSize = 12

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? '稀疏存储与 CSR 乘法实验' : 'Sparse Storage and CSR Matvec Lab',
    subtitle: zh
      ? '调节矩阵规模和每行非零数，观察 dense、COO、CSR 的存储差距，以及 CSR 如何只扫描当前行的非零项。'
      : 'Adjust matrix size and nonzeros per row to compare dense, COO, and CSR storage, and see how CSR scans only the nonzeros in one row.',
    matrixSize: zh ? '方阵维度 n' : 'Square size n',
    nonzerosPerRow: zh ? '每行非零数' : 'Nonzeros per row',
    storageFormat: zh ? '观察格式' : 'Viewed format',
    highlightedRow: zh ? '高亮行' : 'Highlighted row',
    denseStorage: zh ? 'dense 存储' : 'dense storage',
    sparseStorage: zh ? '当前稀疏存储' : 'current sparse storage',
    density: zh ? '密度' : 'density',
    compression: zh ? '压缩倍数' : 'compression',
    matvecWork: zh ? 'matvec 工作量' : 'matvec work',
    nnz: zh ? '非零元素' : 'nonzeros',
    rowWindow: zh ? 'CSR 行窗口' : 'CSR row window',
    rowData: zh ? '该行 data' : 'row data',
    rowColumns: zh ? '该行 col' : 'row col',
    coo: zh ? 'COO: row, col, data 三个数组' : 'COO: row, col, data arrays',
    csr: zh ? 'CSR: rowptr, col, data 三个数组' : 'CSR: rowptr, col, data arrays',
    visualLabel: zh ? '12 x 12 预览矩阵，彩色方格表示非零项' : '12 by 12 preview matrix; colored cells are nonzeros',
    lowDensityNote: zh
      ? '当前矩阵很稀疏。CSR 的矩阵向量乘法只访问 rowptr 给出的非零区间，dense 扫描的大量零项被跳过。'
      : 'The current matrix is very sparse. CSR matrix-vector multiplication visits only the nonzero interval given by rowptr, skipping the many zeros that dense storage would scan.',
    mediumDensityNote: zh
      ? '稀疏格式仍节省空间，但密度已经升高。真实系统还要考虑排序、重复索引、缓存局部性和构造成本。'
      : 'The sparse format still saves space, but density is rising. Real systems also consider sorting, duplicate indices, cache locality, and construction cost.',
    highDensityNote: zh
      ? '密度较高时，索引开销可能抵消稀疏收益。稀疏矩阵不是自动更快，关键是 nnz 是否足够小、访问模式是否匹配格式。'
      : 'At higher density, index overhead can erase the sparse advantage. Sparse matrices are not automatically faster; nnz must be small enough and the access pattern must match the format.',
  }
})

const estimate = computed(() =>
  estimateSparseStorage({
    size: matrixSize.value,
    nonzerosPerRow: nonzerosPerRow.value,
  }),
)

const previewMatrix = computed(() => generateBandedSparseMatrix(previewSize, nonzerosPerRow.value))
const previewCoo = computed(() => denseToCoo(previewMatrix.value))
const previewCsr = computed(() => denseToCsr(previewMatrix.value))

const selectedStorageBytes = computed(() =>
  storageFormat.value === 'coo' ? estimate.value.cooBytes : estimate.value.csrBytes,
)

const compressionRatio = computed(() => estimate.value.denseBytes / selectedStorageBytes.value)
const matvecRatio = computed(() => estimate.value.denseMatVecOps / estimate.value.sparseMatVecOps)

const selectedRowInterval = computed(() => {
  const row = Math.min(previewSize - 1, Math.max(0, highlightRow.value))
  return [previewCsr.value.rowptr[row], previewCsr.value.rowptr[row + 1]] as const
})

const selectedRowValues = computed(() => {
  const [start, end] = selectedRowInterval.value
  return previewCsr.value.data.slice(start, end)
})

const selectedRowColumns = computed(() => {
  const [start, end] = selectedRowInterval.value
  return previewCsr.value.col.slice(start, end)
})

const statusNote = computed(() => {
  if (estimate.value.density > 0.22) return labels.value.highDensityNote
  if (estimate.value.density > 0.06) return labels.value.mediumDensityNote
  return labels.value.lowDensityNote
})

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GiB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MiB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KiB`
  return `${bytes.toFixed(0)} B`
}

function formatCount(value: number) {
  return value.toLocaleString('en-US')
}

function formatArray(values: number[]) {
  if (!values.length) return '[]'
  const shown = values.slice(0, 18).map((value) => Number(value.toFixed(2)))
  const suffix = values.length > shown.length ? ', ...' : ''
  return `[${shown.join(', ')}${suffix}]`
}
</script>

<template>
  <section class="math-lab-card sparse-matrix-lab">
    <div class="math-lab-card__visual sparse-matrix-lab__visual">
      <svg class="sparse-matrix-lab__grid" viewBox="0 0 340 340" role="img" :aria-label="labels.visualLabel">
        <title>{{ labels.visualLabel }}</title>
        <g transform="translate(26 26)">
          <rect x="0" y="0" width="288" height="288" rx="12" class="sparse-matrix-lab__frame" />
          <template v-for="(row, rowIndex) in previewMatrix" :key="rowIndex">
            <rect
              :x="0"
              :y="rowIndex * 24"
              width="288"
              height="24"
              class="sparse-matrix-lab__row"
              :class="{ 'is-highlighted-row': rowIndex === highlightRow }"
            />
            <rect
              v-for="(value, columnIndex) in row"
              :key="`${rowIndex}-${columnIndex}`"
              :x="columnIndex * 24 + 3"
              :y="rowIndex * 24 + 3"
              width="18"
              height="18"
              rx="4"
              class="sparse-matrix-lab__cell"
              :class="{
                'is-nonzero': value !== 0,
                'is-highlighted-entry': value !== 0 && rowIndex === highlightRow,
              }"
            />
          </template>
        </g>
      </svg>

      <div class="sparse-matrix-lab__arrays">
        <article>
          <span>{{ storageFormat === 'coo' ? labels.coo : labels.csr }}</span>
          <strong v-if="storageFormat === 'csr'">rowptr = {{ formatArray(previewCsr.rowptr) }}</strong>
          <strong v-else>row = {{ formatArray(previewCoo.row) }}</strong>
        </article>
        <article>
          <span>{{ labels.rowWindow }}</span>
          <strong>[{{ selectedRowInterval[0] }}, {{ selectedRowInterval[1] }})</strong>
        </article>
        <article>
          <span>{{ labels.rowColumns }}</span>
          <strong>{{ formatArray(selectedRowColumns) }}</strong>
        </article>
        <article>
          <span>{{ labels.rowData }}</span>
          <strong>{{ formatArray(selectedRowValues) }}</strong>
        </article>
      </div>
    </div>

    <div class="math-lab-card__controls sparse-matrix-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls sparse-matrix-lab__control-grid">
        <label>
          {{ labels.matrixSize }}: {{ formatCount(matrixSize) }}
          <input v-model.number="matrixSize" type="range" min="200" max="12000" step="200" />
        </label>
        <label>
          {{ labels.nonzerosPerRow }}: {{ nonzerosPerRow }}
          <input v-model.number="nonzerosPerRow" type="range" min="1" max="9" step="1" />
        </label>
        <label>
          {{ labels.highlightedRow }}: {{ highlightRow }}
          <input v-model.number="highlightRow" type="range" min="0" max="11" step="1" />
        </label>
        <label>
          {{ labels.storageFormat }}
          <select v-model="storageFormat">
            <option value="csr">CSR</option>
            <option value="coo">COO</option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.nnz }}</span>
          <strong>{{ formatCount(estimate.nnz) }}</strong>
        </article>
        <article>
          <span>{{ labels.density }}</span>
          <strong>{{ (estimate.density * 100).toFixed(3) }}%</strong>
        </article>
        <article>
          <span>{{ labels.denseStorage }}</span>
          <strong>{{ formatBytes(estimate.denseBytes) }}</strong>
        </article>
        <article>
          <span>{{ labels.sparseStorage }}</span>
          <strong>{{ formatBytes(selectedStorageBytes) }}</strong>
        </article>
        <article>
          <span>{{ labels.compression }}</span>
          <strong>{{ compressionRatio.toFixed(1) }}x</strong>
        </article>
        <article>
          <span>{{ labels.matvecWork }}</span>
          <strong>{{ matvecRatio.toFixed(1) }}x</strong>
        </article>
      </div>

      <p class="math-lab-note sparse-matrix-lab__status">
        {{ statusNote }}
      </p>
    </div>
  </section>
</template>
