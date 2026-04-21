<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as THREE from 'three'
import type { TrainingSnapshot } from '../types/ml'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  accent: string
}>()

const { locale } = useI18n()
const canvasRef = ref<HTMLCanvasElement>()

const stateWidth = 360
const stateHeight = 220
const statePadding = 28

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let frame = 0

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        plane: '3D 回归平面',
        state: '训练状态',
        area: '面积',
        age: '房龄',
        price: '房价',
        lossCurve: 'MSE 曲线',
        errorCurve: '平均误差',
      }
    : {
        plane: '3D regression plane',
        state: 'Training state',
        area: 'Area',
        age: 'Age',
        price: 'Price',
        lossCurve: 'MSE curve',
        errorCurve: 'Mean error',
      },
)

const samples = computed(() => props.snapshot?.multivariateSamples ?? [])
const plane = computed(() => props.snapshot?.multivariatePlane ?? { weights: [1.4, -3], intercept: 58 })
const residuals = computed(() => props.snapshot?.multivariateResiduals ?? [])
const lossValues = computed(() => props.snapshots.map((snapshot) => snapshot.loss))
const errorValues = computed(() =>
  props.snapshots.map((snapshot) => Number(snapshot.derivedMetrics?.mae ?? 0)),
)
const lossPath = computed(() => buildStatePolyline(lossValues.value))
const errorPath = computed(() => buildStatePolyline(errorValues.value))
const lossDot = computed(() => pointOnStateLine(lossValues.value, props.currentStep))

function scaleDomain(value: number, min: number, max: number, size = 6) {
  return ((value - min) / (max - min || 1) - 0.5) * size
}

function scaleHeight(value: number, min: number, max: number) {
  return ((value - min) / (max - min || 1) - 0.5) * 4.2
}

function createTextSprite(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(15, 23, 40, 0.88)'
  context.font = '24px sans-serif'
  context.fillText(text, 12, 42)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(1.8, 0.45, 1)
  return sprite
}

function renderScene() {
  const canvas = canvasRef.value
  if (!canvas || !renderer || !scene || !camera) return
  renderer.render(scene, camera)
}

function drawThreeScene() {
  const canvas = canvasRef.value
  if (!canvas) return

  const width = canvas.clientWidth || 640
  const height = canvas.clientHeight || 360
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  renderer.setSize(width, height, false)
  renderer.setClearColor(0xf6fbfa, 1)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(42, width / Math.max(height, 1), 0.1, 100)
  camera.position.set(6.5, 4.8, 8.5)
  camera.lookAt(0, 0, 0)

  const light = new THREE.DirectionalLight(0xffffff, 2.4)
  light.position.set(5, 8, 7)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0xffffff, 1.25))

  const grid = new THREE.GridHelper(8, 8, 0x8aa0a7, 0xd7e1df)
  grid.position.y = -2.2
  scene.add(grid)

  const axisMaterial = new THREE.LineBasicMaterial({ color: 0x22313a, linewidth: 2 })
  const axes = [
    [new THREE.Vector3(-3.8, -2.2, 0), new THREE.Vector3(3.8, -2.2, 0)],
    [new THREE.Vector3(-3.8, -2.2, -3.8), new THREE.Vector3(-3.8, -2.2, 3.8)],
    [new THREE.Vector3(-3.8, -2.2, -3.8), new THREE.Vector3(-3.8, 2.4, -3.8)],
  ]
  axes.forEach((points) => {
    scene?.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), axisMaterial))
  })

  const areaValues = samples.value.map((sample) => sample.area)
  const ageValues = samples.value.map((sample) => sample.age)
  const priceValues = [
    ...samples.value.map((sample) => sample.price),
    ...residuals.value.map((segment) => segment.predictedPrice),
  ]
  const minArea = Math.min(...areaValues, 50)
  const maxArea = Math.max(...areaValues, 170)
  const minAge = Math.min(...ageValues, 3)
  const maxAge = Math.max(...ageValues, 24)
  const minPrice = Math.min(...priceValues, 105)
  const maxPrice = Math.max(...priceValues, 280)

  const pointGeometry = new THREE.SphereGeometry(0.17, 24, 24)
  const projectionGeometry = new THREE.SphereGeometry(0.075, 16, 16)
  const pointMaterial = new THREE.MeshStandardMaterial({
    color: 0x102d36,
    emissive: 0x0b1a20,
    emissiveIntensity: 0.25,
    roughness: 0.38,
    depthTest: true,
  })
  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: props.accent,
    emissive: new THREE.Color(props.accent),
    emissiveIntensity: 0.32,
    roughness: 0.34,
    depthTest: true,
  })
  const projectionMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.18,
    roughness: 0.5,
    depthTest: false,
  })
  const residualMaterial = new THREE.LineBasicMaterial({
    color: 0xd85d3f,
    transparent: true,
    opacity: 0.82,
    depthTest: false,
  })
  samples.value.forEach((sample, index) => {
    const point = new THREE.Mesh(
      pointGeometry,
      index === props.currentStep % samples.value.length ? highlightMaterial : pointMaterial,
    )
    point.position.set(
      scaleDomain(sample.area, minArea, maxArea),
      scaleHeight(sample.price, minPrice, maxPrice),
      scaleDomain(sample.age, minAge, maxAge),
    )
    point.renderOrder = 4
    scene?.add(point)
  })

  residuals.value.forEach((segment, index) => {
    const x = scaleDomain(segment.area, minArea, maxArea)
    const z = scaleDomain(segment.age, minAge, maxAge)
    const actualY = scaleHeight(segment.actualPrice, minPrice, maxPrice)
    const predictedY = scaleHeight(segment.predictedPrice, minPrice, maxPrice)
    const residualLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, actualY, z),
        new THREE.Vector3(x, predictedY, z),
      ]),
      residualMaterial,
    )
    residualLine.renderOrder = 3
    scene?.add(residualLine)

    if (index === props.currentStep % residuals.value.length) {
      const projectionPoint = new THREE.Mesh(projectionGeometry, projectionMaterial)
      projectionPoint.position.set(x, predictedY, z)
      projectionPoint.renderOrder = 5
      scene?.add(projectionPoint)
    }
  })

  const planeGeometry = new THREE.PlaneGeometry(6.4, 6.4, 1, 1)
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(props.accent),
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    roughness: 0.55,
    depthWrite: false,
  })
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
  const areaCenter = (minArea + maxArea) / 2
  const ageCenter = (minAge + maxAge) / 2
  const priceCenter =
    areaCenter * (plane.value.weights[0] ?? 0) + ageCenter * (plane.value.weights[1] ?? 0) + plane.value.intercept
  planeMesh.position.set(0, scaleHeight(priceCenter, minPrice, maxPrice), 0)
  planeMesh.rotation.x = -Math.PI / 2 + 0.18
  planeMesh.rotation.z = -0.08
  planeMesh.renderOrder = 1
  scene.add(planeMesh)

  const labels = [
    { text: copy.value.area, position: [3.8, -2.05, 0] },
    { text: copy.value.age, position: [-3.6, -2.05, 3.8] },
    { text: copy.value.price, position: [-3.6, 2.3, -3.6] },
  ] as const
  labels.forEach((label) => {
    const sprite = createTextSprite(label.text)
    sprite.position.set(label.position[0], label.position[1], label.position[2])
    scene?.add(sprite)
  })

  renderScene()
}

function animate() {
  if (scene) {
    scene.rotation.y = Math.sin(Date.now() / 2400) * 0.08
    renderScene()
  }
  frame = window.requestAnimationFrame(animate)
}

function scaleState(value: number, min: number, max: number, size = stateWidth - statePadding * 2) {
  return statePadding + ((value - min) / (max - min || 1)) * size
}

function buildStatePolyline(values: number[]) {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  return values
    .map((value, index) => {
      const x = statePadding + (index / Math.max(values.length - 1, 1)) * (stateWidth - statePadding * 2)
      const y = stateHeight - statePadding - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function pointOnStateLine(values: number[], index: number) {
  if (!values.length) return { x: statePadding, y: stateHeight - statePadding }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const safeIndex = Math.min(index, values.length - 1)
  const value = values[safeIndex] ?? values[0]!
  return {
    x: scaleState(safeIndex, 0, Math.max(values.length - 1, 1)),
    y: stateHeight - statePadding - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2),
  }
}

onMounted(() => {
  drawThreeScene()
  animate()
  window.addEventListener('resize', drawThreeScene)
})

watch(
  () => [props.snapshot, props.currentStep, locale.value],
  () => drawThreeScene(),
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', drawThreeScene)
  window.cancelAnimationFrame(frame)
  renderer?.dispose()
})
</script>

<template>
  <div class="linear-regression-lab__viz linear-regression-lab__viz--multivariate">
    <section class="linear-regression-lab__panel linear-regression-lab__panel--data">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.plane }}</span>
        <strong>{{ copy.area }} + {{ copy.age }} -> {{ copy.price }}</strong>
      </div>
      <canvas
        ref="canvasRef"
        class="linear-regression-lab__three-canvas"
        aria-label="multivariate regression 3D plane"
      ></canvas>
    </section>

    <section class="linear-regression-lab__panel linear-regression-lab__panel--state">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.state }}</span>
        <strong>{{ copy.lossCurve }} / {{ copy.errorCurve }}</strong>
      </div>
      <svg
        :viewBox="`0 0 ${stateWidth} ${stateHeight}`"
        class="linear-regression-lab__state-svg"
        role="img"
        aria-label="multivariate regression training state"
      >
        <line
          :x1="statePadding"
          :x2="stateWidth - statePadding"
          :y1="stateHeight - statePadding"
          :y2="stateHeight - statePadding"
          class="linear-axis"
        />
        <line
          :x1="statePadding"
          :x2="statePadding"
          :y1="statePadding"
          :y2="stateHeight - statePadding"
          class="linear-axis"
        />
        <polyline :points="lossPath" class="linear-state-line" />
        <polyline :points="errorPath" class="linear-state-line linear-state-line--error" />
        <circle :cx="lossDot.x" :cy="lossDot.y" r="6" class="linear-state-dot" />
      </svg>
      <div class="linear-state-legend">
        <span><i class="legend-dot legend-dot--train"></i>{{ copy.lossCurve }}</span>
        <span><i class="legend-dot legend-dot--error"></i>{{ copy.errorCurve }}</span>
      </div>
    </section>
  </div>
</template>

