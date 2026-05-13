<script setup lang="ts">
import * as d3 from 'd3'
import * as THREE from 'three'
import { computed, ref } from 'vue'
import ThreeSceneShell from '../components/ThreeSceneShell.vue'
import type { MathLabLocale, ThreeSceneController } from '../types/mathLab'
import { evaluateAutodiffGraph, evaluateJacobianProducts } from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const w = ref(1.4)
const x = ref(2)
const b = ref(-0.5)
const y = ref(1.2)

const evaluation = computed(() =>
  evaluateAutodiffGraph({
    w: w.value,
    x: x.value,
    b: b.value,
    y: y.value,
  }),
)

const jacobianProducts = computed(() =>
  evaluateJacobianProducts({
    x: w.value,
    y: x.value,
    upstream: [evaluation.value.dLossDPrediction, 1],
    tangent: [0.7, -0.4],
  }),
)

type AutodiffSurfaceParams = {
  w: number
  x: number
  b: number
  y: number
}

const surfaceParams = computed<AutodiffSurfaceParams>(() => ({
  w: w.value,
  x: x.value,
  b: b.value,
  y: y.value,
}))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '计算图与局部线性化',
        subtitle: '在 L=(wx+b-y)^2 中观察前向值、局部导数、反向梯度和 3D 切平面。',
        prediction: '预测值',
        residual: '残差',
        loss: 'loss',
        upstream: '上游梯度',
        gradW: 'dL/dw',
        gradB: 'dL/db',
        gradX: 'dL/dx',
        finite: '有限差分 dL/dw',
        error: '检查误差',
        vjp: 'VJP',
        jvp: 'JVP',
        surface: '局部线性化 3D 曲面',
        note: '自动微分保存前向中的局部关系，反向时把上游梯度按链式法则传回每个输入；有限差分只用来检查小例子的梯度。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Computation Graph and Local Linearization',
        subtitle: 'Watch forward values, local derivatives, reverse gradients, and a 3D tangent plane for L=(wx+b-y)^2.',
        prediction: 'prediction',
        residual: 'residual',
        loss: 'loss',
        upstream: 'upstream grad',
        gradW: 'dL/dw',
        gradB: 'dL/db',
        gradX: 'dL/dx',
        finite: 'finite diff dL/dw',
        error: 'check error',
        vjp: 'VJP',
        jvp: 'JVP',
        surface: 'local-linearization 3D surface',
        note: 'Autodiff stores local forward relationships, then sends upstream gradients backward by the chain rule; finite differences only check small examples.',
      },
)

const graphNodes = computed(() => [
  { id: 'w', label: 'w', value: w.value, x: 54, y: 64, kind: 'input' },
  { id: 'x', label: 'x', value: x.value, x: 54, y: 166, kind: 'input' },
  { id: 'b', label: 'b', value: b.value, x: 54, y: 268, kind: 'input' },
  { id: 'mul', label: 'wx', value: w.value * x.value, x: 178, y: 116, kind: 'op' },
  { id: 'pred', label: 'ŷ', value: evaluation.value.prediction, x: 302, y: 166, kind: 'op' },
  { id: 'res', label: 'r', value: evaluation.value.residual, x: 424, y: 166, kind: 'op' },
  { id: 'loss', label: 'L', value: evaluation.value.loss, x: 532, y: 166, kind: 'loss' },
])

const graphLinks = computed(() => {
  const nodes = Object.fromEntries(graphNodes.value.map((node) => [node.id, node]))
  const line = d3.line<[number, number]>().curve(d3.curveBumpX)
  const link = (id: string, source: string, target: string, label: string) => ({
    id,
    label,
    x: (nodes[source].x + nodes[target].x) / 2,
    y: (nodes[source].y + nodes[target].y) / 2 - 10,
    path: line([
      [nodes[source].x + 27, nodes[source].y],
      [nodes[target].x - 31, nodes[target].y],
    ]) ?? '',
  })
  return [
    link('w-mul', 'w', 'mul', `×${format(x.value, 1)}`),
    link('x-mul', 'x', 'mul', `×${format(w.value, 1)}`),
    link('mul-pred', 'mul', 'pred', '+b'),
    link('b-pred', 'b', 'pred', '+1'),
    link('pred-res', 'pred', 'res', '-y'),
    link('res-loss', 'res', 'loss', '2r'),
  ]
})

const surfaceController = createLocalLinearizationController()

function createLocalLinearizationController(): ThreeSceneController<AutodiffSurfaceParams> {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let frameId = 0
  let resizeObserver: ResizeObserver | undefined
  let container: HTMLElement | undefined
  let tangentPlane: THREE.Mesh | undefined
  let currentPoint: THREE.Mesh | undefined
  let gradientArrow: THREE.ArrowHelper | undefined
  let rotatingGroup: THREE.Group | undefined
  let latestParams: AutodiffSurfaceParams | undefined

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

  function updateScene(params: AutodiffSurfaceParams) {
    latestParams = params
    if (!tangentPlane || !currentPoint || !gradientArrow) return
    const residual = params.w * params.x + params.b - params.y
    const loss = residual * residual
    const gradW = 2 * residual * params.x
    const gradX = 2 * residual * params.w
    const px = Math.max(-2, Math.min(2, params.w / 1.7))
    const pz = Math.max(-2, Math.min(2, params.x / 1.7))
    const py = Math.min(1.45, loss / 3) - 0.45
    const direction = new THREE.Vector3(-gradW, 0.55, -gradX)
    if (direction.length() < 0.001) direction.set(0.2, 0.4, 0.2)

    currentPoint.position.set(px, py, pz)
    tangentPlane.position.copy(currentPoint.position)
    tangentPlane.rotation.set(-Math.PI / 2 + Math.atan2(gradX, 8), 0, -Math.atan2(gradW, 8))
    gradientArrow.position.copy(currentPoint.position)
    gradientArrow.setDirection(direction.normalize())
    gradientArrow.setLength(0.9, 0.18, 0.08)
    render()
  }

  return {
    mount(el: HTMLElement) {
      container = el
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x0c1628)
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.set(3.4, 3.1, 5.2)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      el.appendChild(renderer.domElement)

      const light = new THREE.DirectionalLight(0xffffff, 1.1)
      light.position.set(3, 4, 2)
      scene.add(light, new THREE.AmbientLight(0x94a3b8, 0.75))

      rotatingGroup = new THREE.Group()
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(4.4, 4.4, 18, 18),
        new THREE.MeshBasicMaterial({ color: 0x5b6f94, wireframe: true, transparent: true, opacity: 0.5 }),
      )
      surface.rotation.x = -Math.PI / 2
      rotatingGroup.add(surface)

      tangentPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.75, 1.05),
        new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
      )
      currentPoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 24, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.38 }),
      )
      gradientArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.9, 0xd65a31, 0.18, 0.08)
      rotatingGroup.add(tangentPlane, currentPoint, gradientArrow)
      scene.add(rotatingGroup)

      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(el)
      resize()
      if (latestParams) updateScene(latestParams)

      const animate = () => {
        frameId = window.requestAnimationFrame(animate)
        if (rotatingGroup) rotatingGroup.rotation.y += 0.002
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
        if (object instanceof THREE.Mesh) {
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
  return Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)
    ? value.toExponential(2)
    : value.toFixed(digits)
}

function formatTuple(values: readonly number[]) {
  return `[${values.map((value) => format(value, 2)).join(', ')}]`
}
</script>

<template>
  <section class="math-lab-card autodiff-graph-lab">
    <div class="math-lab-card__visual autodiff-graph-lab__visual">
      <div class="autodiff-graph-lab__visual-grid">
        <svg viewBox="0 0 590 330" role="img" :aria-label="copy.title">
          <defs>
            <marker id="autodiff-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#10162f" />
            </marker>
          </defs>
          <path
            v-for="link in graphLinks"
            :key="link.id"
            :d="link.path"
            class="autodiff-graph-lab__edge"
            marker-end="url(#autodiff-arrow)"
          />
          <text v-for="link in graphLinks" :key="`${link.id}-label`" :x="link.x" :y="link.y" class="autodiff-graph-lab__edge-label">
            {{ link.label }}
          </text>
          <g
            v-for="node in graphNodes"
            :key="node.id"
            class="autodiff-graph-lab__node"
            :class="`is-${node.kind}`"
          >
            <circle :cx="node.x" :cy="node.y" r="31" />
            <text :x="node.x" :y="node.y - 3">{{ node.label }}</text>
            <text :x="node.x" :y="node.y + 18">{{ format(node.value, 2) }}</text>
          </g>
        </svg>
        <ThreeSceneShell :controller="surfaceController" :params="surfaceParams" :label="copy.surface" />
      </div>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls autodiff-graph-lab__controls">
        <label>w: {{ w.toFixed(1) }}<input v-model.number="w" type="range" min="-3" max="3" step="0.1" /></label>
        <label>x: {{ x.toFixed(1) }}<input v-model.number="x" type="range" min="-3" max="3" step="0.1" /></label>
        <label>b: {{ b.toFixed(1) }}<input v-model.number="b" type="range" min="-3" max="3" step="0.1" /></label>
        <label>y: {{ y.toFixed(1) }}<input v-model.number="y" type="range" min="-3" max="3" step="0.1" /></label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.prediction }}</span><strong>{{ format(evaluation.prediction) }}</strong></article>
        <article><span>{{ copy.residual }}</span><strong>{{ format(evaluation.residual) }}</strong></article>
        <article><span>{{ copy.loss }}</span><strong>{{ format(evaluation.loss) }}</strong></article>
        <article><span>{{ copy.upstream }}</span><strong>{{ format(evaluation.dLossDPrediction) }}</strong></article>
        <article><span>{{ copy.gradW }}</span><strong>{{ format(evaluation.gradients.w) }}</strong></article>
        <article><span>{{ copy.gradB }}</span><strong>{{ format(evaluation.gradients.b) }}</strong></article>
        <article><span>{{ copy.gradX }}</span><strong>{{ format(evaluation.gradients.x) }}</strong></article>
        <article><span>{{ copy.error }}</span><strong>{{ format(evaluation.gradientCheckError, 2) }}</strong></article>
        <article><span>{{ copy.vjp }}</span><strong>{{ formatTuple(jacobianProducts.vjp) }}</strong></article>
        <article><span>{{ copy.jvp }}</span><strong>{{ formatTuple(jacobianProducts.jvp) }}</strong></article>
      </div>

      <p class="math-lab-note">
        {{ copy.finite }} = {{ format(evaluation.finiteDifferenceW) }}. {{ copy.note }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.autodiff-graph-lab__visual-grid {
  display: grid;
  gap: 12px;
}

.autodiff-graph-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.autodiff-graph-lab__edge {
  fill: none;
  stroke: #10162f;
  stroke-width: 2.4;
}

.autodiff-graph-lab__edge-label,
.autodiff-graph-lab__node text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-weight: 900;
  text-anchor: middle;
}

.autodiff-graph-lab__edge-label {
  font-size: 11px;
}

.autodiff-graph-lab__node circle {
  fill: #ffffff;
  stroke: #10162f;
  stroke-width: 2;
}

.autodiff-graph-lab__node.is-input circle {
  fill: #d8f6ff;
}

.autodiff-graph-lab__node.is-op circle {
  fill: #e7ddff;
}

.autodiff-graph-lab__node.is-loss circle {
  fill: #ffd84d;
}

.autodiff-graph-lab__node text {
  font-size: 12px;
}

.autodiff-graph-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .autodiff-graph-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
