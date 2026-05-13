<script setup lang="ts">
import * as d3 from 'd3'
import * as THREE from 'three'
import { computed, ref } from 'vue'
import ThreeSceneShell from '../components/ThreeSceneShell.vue'
import type { MathLabLocale, ThreeSceneController } from '../types/mathLab'
import {
  convolutionOutputSize,
  evaluateAttention,
  evaluateAttentionMatrix,
  evaluateAttentionShape,
  normalizeVector,
} from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

type TabId = 'cnn' | 'attention' | 'normalization'

const tabs: TabId[] = ['attention', 'cnn', 'normalization']
const activeTab = ref<TabId>('attention')
const inputSize = ref(32)
const kernelSize = ref(3)
const stride = ref(1)
const padding = ref(1)
const queryX = ref(1)
const queryY = ref(0.4)
const hiddenDim = ref(12)
const heads = ref(3)
const residualScale = ref(0.8)

const tokenVectors = [
  [1, 0.2],
  [0.2, 1],
  [-0.8, 0.3],
  [0.1, -0.7],
]

const attention = computed(() => evaluateAttention([queryX.value, queryY.value], tokenVectors))
const attentionMatrix = computed(() => evaluateAttentionMatrix(tokenVectors))
const attentionShape = computed(() =>
  evaluateAttentionShape({
    batchSize: 2,
    tokens: tokenVectors.length,
    hiddenDim: hiddenDim.value,
    heads: heads.value,
  }),
)
const normalized = computed(() => normalizeVector([2.2, -0.4, 1.1, 3.2].map((value) => value * residualScale.value)))
const convOut = computed(() => convolutionOutputSize(inputSize.value, kernelSize.value, stride.value, padding.value))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '结构里的数学',
        subtitle: '在 CNN 尺寸、attention heatmap、multi-head shape 和 residual/normalization 之间切换。',
        tabs: {
          cnn: 'CNN 尺寸',
          attention: 'Attention heatmap',
          normalization: '残差与归一化',
        } as Record<TabId, string>,
        input: '输入尺寸',
        kernel: 'kernel',
        stride: 'stride',
        padding: 'padding',
        output: '输出尺寸',
        queryX: 'query x',
        queryY: 'query y',
        hidden: 'hidden width',
        heads: 'heads',
        perHead: '每个 head 宽度',
        scoreShape: 'score shape',
        scale: '残差分支尺度',
        attentionNote: 'attention 先用点积打分，再用 softmax 变成对 token 的加权汇聚；multi-head 拆的是 hidden width，不是 batch 或 token 数。',
        cnnNote: '卷积输出尺寸由输入、padding、kernel 和 stride 决定；局部窗口共享同一组权重。',
        normNote: '残差保留原信号，normalization 把尺度拉回稳定范围，减少深层堆叠中的数值漂移。',
        mean: '均值',
        std: '标准差',
        maxWeight: '最大 attention 权重',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Math Inside Architectures',
        subtitle: 'Switch between CNN size, attention heatmaps, multi-head shape, and residual/normalization.',
        tabs: {
          cnn: 'CNN size',
          attention: 'attention heatmap',
          normalization: 'residual + norm',
        } as Record<TabId, string>,
        input: 'input size',
        kernel: 'kernel',
        stride: 'stride',
        padding: 'padding',
        output: 'output size',
        queryX: 'query x',
        queryY: 'query y',
        hidden: 'hidden width',
        heads: 'heads',
        perHead: 'per-head width',
        scoreShape: 'score shape',
        scale: 'residual branch scale',
        attentionNote: 'Attention scores tokens with dot products, then softmax forms a weighted aggregation; multi-head splits hidden width, not batch or token count.',
        cnnNote: 'Convolution output size depends on input, padding, kernel, and stride; local windows share one weight set.',
        normNote: 'Residual paths preserve signal, while normalization brings scale back into a stable range for deep stacks.',
        mean: 'mean',
        std: 'std',
        maxWeight: 'max attention weight',
      },
)

const heatmapCells = computed(() => {
  const cell = 42
  return attentionMatrix.value.flatMap((row, rowIndex) =>
    row.map((weight, columnIndex) => ({
      id: `${rowIndex}-${columnIndex}`,
      x: 72 + columnIndex * cell,
      y: 54 + rowIndex * cell,
      size: cell - 5,
      fill: d3.interpolateRgb('#eff6ff', '#0f9f7a')(weight),
      weight,
    })),
  )
})

const attentionBars = computed(() => {
  const width = d3.scaleLinear().domain([0, 1]).range([0, 112])
  return attention.value.weights.map((weight, index) => ({
    id: `a${index}`,
    x: 304,
    y: 58 + index * 40,
    width: width(weight),
    weight,
  }))
})

const cnnGrid = computed(() => {
  const inputPixels = Math.min(168, inputSize.value * 3.8)
  const outputPixels = Math.max(40, Math.min(116, convOut.value * 3))
  const kernelPixels = Math.max(20, kernelSize.value * 15)
  return {
    inputPixels,
    outputPixels,
    kernelPixels,
    strideOffset: Math.min(72, stride.value * 18),
  }
})

const normalizedBars = computed(() => {
  const scale = d3.scaleLinear().domain([-2, 2]).range([42, 154])
  return normalized.value.normalized.map((value, index) => ({
    id: index,
    x: 86 + index * 56,
    y: Math.min(scale(0), scale(value)),
    height: Math.abs(scale(value) - scale(0)),
    positive: value >= 0,
    value,
  }))
})

const architectureParams = computed(() => ({
  activeTab: activeTab.value,
  queryX: queryX.value,
  queryY: queryY.value,
  residualScale: residualScale.value,
  heads: heads.value,
}))

const architectureController = createArchitectureFlowController()

function createArchitectureFlowController(): ThreeSceneController<{
  activeTab: TabId
  queryX: number
  queryY: number
  residualScale: number
  heads: number
}> {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let frameId = 0
  let resizeObserver: ResizeObserver | undefined
  let container: HTMLElement | undefined
  let group: THREE.Group | undefined
  let query: THREE.Mesh | undefined
  let normBox: THREE.Mesh | undefined
  let latestParams: { activeTab: TabId; queryX: number; queryY: number; residualScale: number; heads: number } | undefined

  function render() {
    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  function resize() {
    if (!renderer || !camera || !container) return
    const width = Math.max(260, container.clientWidth)
    const height = 320
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
  }

  function lineBetween(start: THREE.Vector3, end: THREE.Vector3, color: number, opacity = 0.58) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    return new THREE.Line(geometry, material)
  }

  function updateScene(params: NonNullable<typeof latestParams>) {
    latestParams = params
    if (!query || !normBox || !group) return
    query.position.set(1.8 + params.queryX * 0.18, 0.45 + params.queryY * 0.18, 0.2)
    normBox.scale.setScalar(0.85 + params.residualScale * 0.18)
    group.rotation.y = params.activeTab === 'cnn' ? -0.42 : params.activeTab === 'normalization' ? 0.38 : 0
    group.rotation.x = params.activeTab === 'normalization' ? 0.12 : 0
    render()
  }

  return {
    mount(el: HTMLElement) {
      container = el
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0b1725)
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.set(3.6, 2.7, 5.4)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      el.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0x9fb4d8, 0.72))
      const light = new THREE.DirectionalLight(0xffffff, 1.1)
      light.position.set(4, 5, 3)
      scene.add(light)

      group = new THREE.Group()
      const inputGrid = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 1.25, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 }),
      )
      inputGrid.position.set(-2.1, 0.45, 0)
      const kernel = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.56, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xffd84d, transparent: true, opacity: 0.72 }),
      )
      kernel.position.set(-2.1, 0.45, 0.12)

      const tokens = [
        new THREE.Vector3(-0.35, 1.08, -0.55),
        new THREE.Vector3(0.25, 1.24, 0.2),
        new THREE.Vector3(0.65, 0.72, -0.2),
        new THREE.Vector3(0.0, 0.36, 0.56),
      ]
      const tokenMeshes = tokens.map((position, index) => {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 20, 14),
          new THREE.MeshStandardMaterial({ color: index % 2 ? 0x0f9f7a : 0x86efac, roughness: 0.35 }),
        )
        sphere.position.copy(position)
        return sphere
      })
      query = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 24, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd84d, roughness: 0.3 }),
      )
      query.position.set(1.9, 0.55, 0.2)

      const attentionLines = tokens.map((position, index) => lineBetween(position, query!.position, index === 1 ? 0xffd84d : 0x0f9f7a, 0.36 + index * 0.1))
      const residual = lineBetween(new THREE.Vector3(-2.35, -0.9, 0), new THREE.Vector3(1.7, -0.9, 0), 0xffd84d, 0.85)
      const branch = lineBetween(new THREE.Vector3(-2.35, -0.9, 0), new THREE.Vector3(1.7, -0.18, 0), 0xffffff, 0.38)
      normBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.72, 0.52),
        new THREE.MeshStandardMaterial({ color: 0xe7ddff, transparent: true, opacity: 0.62 }),
      )
      normBox.position.set(2.18, -0.58, 0)

      group.add(inputGrid, kernel, ...tokenMeshes, query, ...attentionLines, residual, branch, normBox)
      scene.add(group)

      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(el)
      resize()
      if (latestParams) updateScene(latestParams)

      const animate = () => {
        frameId = window.requestAnimationFrame(animate)
        if (group) group.rotation.y += 0.0015
        render()
      }
      animate()
    },
    update: updateScene,
    dispose() {
      if (frameId) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      renderer?.dispose()
      renderer?.domElement.remove()
      scene?.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) material.forEach((item) => item.dispose())
          else material.dispose()
        }
      })
      renderer = undefined
      scene = undefined
      camera = undefined
      container = undefined
    },
  }
}

function format(value: number, digits = 3) {
  return value.toFixed(digits)
}

function shapeText(shape: readonly number[] | undefined) {
  return shape ? `[${shape.join(', ')}]` : 'invalid'
}
</script>

<template>
  <section class="math-lab-card architecture-math-lab">
    <div class="math-lab-card__visual architecture-math-lab__visual">
      <div class="architecture-math-lab__visual-grid">
        <svg v-if="activeTab === 'attention'" viewBox="0 0 520 300" role="img" :aria-label="copy.tabs.attention">
          <g v-for="cell in heatmapCells" :key="cell.id">
            <rect :x="cell.x" :y="cell.y" :width="cell.size" :height="cell.size" :fill="cell.fill" />
            <text :x="cell.x + cell.size / 2" :y="cell.y + cell.size / 2 + 4">{{ format(cell.weight, 2) }}</text>
          </g>
          <g v-for="bar in attentionBars" :key="bar.id">
            <rect :x="bar.x" :y="bar.y" width="112" height="20" class="architecture-math-lab__track" />
            <rect :x="bar.x" :y="bar.y" :width="bar.width" height="20" class="architecture-math-lab__attention-bar" />
            <text :x="bar.x - 18" :y="bar.y + 15">{{ bar.id }}</text>
            <text :x="bar.x + 132" :y="bar.y + 15">{{ format(bar.weight, 2) }}</text>
          </g>
        </svg>

        <svg v-else-if="activeTab === 'cnn'" viewBox="0 0 520 300" role="img" :aria-label="copy.tabs.cnn">
          <rect x="62" y="58" :width="cnnGrid.inputPixels" :height="cnnGrid.inputPixels" class="architecture-math-lab__image" />
          <rect
            :x="86 + cnnGrid.strideOffset"
            :y="82 + cnnGrid.strideOffset / 2"
            :width="cnnGrid.kernelPixels"
            :height="cnnGrid.kernelPixels"
            class="architecture-math-lab__kernel"
          />
          <line x1="260" y1="150" x2="328" y2="150" class="architecture-math-lab__attention-link" />
          <rect x="354" y="92" :width="cnnGrid.outputPixels" :height="cnnGrid.outputPixels" class="architecture-math-lab__output" />
          <text x="144" y="258">{{ inputSize }} x {{ inputSize }}</text>
          <text x="410" y="238">{{ convOut }} x {{ convOut }}</text>
        </svg>

        <svg v-else viewBox="0 0 520 300" role="img" :aria-label="copy.tabs.normalization">
          <line x1="64" y1="212" x2="330" y2="212" class="architecture-math-lab__attention-link" />
          <path d="M64 212 C152 88 248 88 330 212" class="architecture-math-lab__residual-path" />
          <rect x="354" y="76" width="98" height="154" class="architecture-math-lab__query" />
          <line x1="70" y1="154" x2="300" y2="154" class="architecture-math-lab__norm-axis" />
          <rect
            v-for="bar in normalizedBars"
            :key="bar.id"
            :x="bar.x"
            :y="bar.y"
            width="32"
            :height="bar.height"
            :class="bar.positive ? 'is-positive' : 'is-negative'"
          />
          <text x="404" y="158">norm</text>
        </svg>

        <ThreeSceneShell :controller="architectureController" :params="architectureParams" :label="copy.title" />
      </div>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="architecture-math-lab__tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          :class="{ 'is-active': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ copy.tabs[tab] }}
        </button>
      </div>

      <div v-if="activeTab === 'attention'" class="math-mini-controls architecture-math-lab__controls">
        <label>{{ copy.queryX }}: {{ queryX.toFixed(1) }}<input v-model.number="queryX" type="range" min="-2" max="2" step="0.1" /></label>
        <label>{{ copy.queryY }}: {{ queryY.toFixed(1) }}<input v-model.number="queryY" type="range" min="-2" max="2" step="0.1" /></label>
        <label>{{ copy.hidden }}: {{ hiddenDim }}<input v-model.number="hiddenDim" type="range" min="6" max="24" step="1" /></label>
        <label>{{ copy.heads }}: {{ heads }}<input v-model.number="heads" type="range" min="1" max="8" step="1" /></label>
      </div>

      <div v-else-if="activeTab === 'cnn'" class="math-mini-controls architecture-math-lab__controls">
        <label>{{ copy.input }}: {{ inputSize }}<input v-model.number="inputSize" type="range" min="16" max="64" step="1" /></label>
        <label>{{ copy.kernel }}: {{ kernelSize }}<input v-model.number="kernelSize" type="range" min="1" max="7" step="2" /></label>
        <label>{{ copy.stride }}: {{ stride }}<input v-model.number="stride" type="range" min="1" max="4" step="1" /></label>
        <label>{{ copy.padding }}: {{ padding }}<input v-model.number="padding" type="range" min="0" max="4" step="1" /></label>
      </div>

      <div v-else class="math-mini-controls architecture-math-lab__controls">
        <label>{{ copy.scale }}: {{ residualScale.toFixed(1) }}<input v-model.number="residualScale" type="range" min="0.2" max="2" step="0.1" /></label>
      </div>

      <div class="math-readout-grid">
        <template v-if="activeTab === 'attention'">
          <article><span>{{ copy.maxWeight }}</span><strong>{{ format(Math.max(...attention.weights)) }}</strong></article>
          <article><span>{{ copy.perHead }}</span><strong>{{ attentionShape.valid ? attentionShape.perHeadDim : 'invalid' }}</strong></article>
          <article><span>{{ copy.scoreShape }}</span><strong>{{ shapeText(attentionShape.scoreShape) }}</strong></article>
        </template>
        <template v-else-if="activeTab === 'cnn'">
          <article><span>{{ copy.output }}</span><strong>{{ convOut }} x {{ convOut }}</strong></article>
          <article><span>formula</span><strong>floor((n+2p-k)/s)+1</strong></article>
        </template>
        <template v-else>
          <article><span>{{ copy.mean }}</span><strong>{{ format(normalized.mean) }}</strong></article>
          <article><span>{{ copy.std }}</span><strong>{{ format(normalized.std) }}</strong></article>
        </template>
      </div>

      <p class="math-lab-note">
        {{ activeTab === 'attention' ? copy.attentionNote : activeTab === 'cnn' ? copy.cnnNote : copy.normNote }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.architecture-math-lab__visual-grid {
  display: grid;
  gap: 12px;
}

.architecture-math-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.architecture-math-lab__attention-link,
.architecture-math-lab__residual-path,
.architecture-math-lab__norm-axis {
  fill: none;
  stroke: #10162f;
  stroke-width: 2.5;
}

.architecture-math-lab__residual-path {
  stroke: #ffd84d;
  stroke-width: 5;
}

.architecture-math-lab__norm-axis {
  stroke: rgba(16, 22, 47, 0.35);
}

.architecture-math-lab__track {
  fill: rgba(16, 22, 47, 0.08);
  stroke: #10162f;
  stroke-width: 1.5;
}

.architecture-math-lab__attention-bar {
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 1.5;
}

.architecture-math-lab__image {
  fill: #d8f6ff;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab__query {
  fill: #e7ddff;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab__kernel,
.architecture-math-lab rect.is-positive {
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab__output,
.architecture-math-lab rect.is-negative {
  fill: #dffbe9;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-size: 11px;
  font-weight: 900;
  text-anchor: middle;
}

.architecture-math-lab__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.architecture-math-lab__tabs button {
  padding: 9px 12px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 5px;
  background: #ffffff;
  color: var(--pixel-ink, #10162f);
  box-shadow: 2px 2px 0 rgba(16, 22, 47, 0.65);
  font-weight: 900;
}

.architecture-math-lab__tabs button.is-active {
  background: #ffd84d;
}

.architecture-math-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .architecture-math-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
