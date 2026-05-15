<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as THREE from 'three'
import type { TrainingSnapshot } from '../types/ml'
import { sigmoid } from '../utils/math'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  accent: string
}>()

const { locale } = useI18n()
const canvasRef = ref<HTMLCanvasElement>()

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let animationFrame = 0

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'BCE loss 曲面',
        subtitle: '固定 bias，观察 w1 / w2 如何走向低损失区域',
      }
    : {
        title: 'BCE loss surface',
        subtitle: 'Hold bias fixed and watch w1 / w2 move toward lower loss',
      },
)

function lossAt(w1: number, w2: number) {
  const dataset = props.snapshot?.dataset ?? []
  const bias = props.snapshot?.params?.bias ?? 0
  const regularization = Number(props.snapshot?.derivedMetrics?.regularizationPenalty ?? 0)
  if (!dataset.length) return 0
  let total = 0
  for (const point of dataset) {
    const probability = Math.min(1 - 1e-6, Math.max(1e-6, sigmoid(w1 * point.x + w2 * point.y + bias)))
    const label = point.label ?? 0
    total += -(label * Math.log(probability) + (1 - label) * Math.log(1 - probability))
  }
  return total / dataset.length + regularization
}

function makeTextSprite(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 420
  canvas.height = 80
  const context = canvas.getContext('2d')!
  context.fillStyle = 'rgba(255,255,255,0)'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = 'rgba(15, 23, 40, 0.86)'
  context.font = '28px sans-serif'
  context.fillText(text, 12, 48)
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(2.8, 0.55, 1)
  return sprite
}

function drawScene() {
  const canvas = canvasRef.value
  if (!canvas) return
  const width = canvas.clientWidth || 720
  const height = canvas.clientHeight || 380

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  renderer.setSize(width, height, false)
  renderer.setClearColor(0xf6fbfa, 1)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(42, width / Math.max(height, 1), 0.1, 100)
  camera.position.set(6.8, 5.1, 7.2)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 1.35))
  const light = new THREE.DirectionalLight(0xffffff, 2)
  light.position.set(4, 8, 6)
  scene.add(light)
  const grid = new THREE.GridHelper(7.2, 8, 0x7a9290, 0xdce7e4)
  grid.position.y = -1.45
  scene.add(grid)

  const segments = 32
  const geometry = new THREE.PlaneGeometry(7, 7, segments, segments)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  const losses: number[] = []
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const z = position.getZ(index)
    const loss = lossAt(x / 1.35, z / 1.35)
    losses.push(loss)
  }
  const minLoss = Math.min(...losses)
  const maxLoss = Math.max(...losses)
  for (let index = 0; index < position.count; index += 1) {
    const normalized = (losses[index] - minLoss) / Math.max(maxLoss - minLoss, 1e-6)
    position.setY(index, -1.35 + normalized * 2.7)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(props.accent),
    transparent: true,
    opacity: 0.42,
    roughness: 0.48,
    metalness: 0.04,
    side: THREE.DoubleSide,
  })
  scene.add(new THREE.Mesh(geometry, material))

  const pathPoints = props.snapshots
    .filter((snapshot) => snapshot.params)
    .map((snapshot) => {
      const [w1, w2] = snapshot.params!.weights
      const x = Math.max(-3.4, Math.min(3.4, w1 * 1.35))
      const z = Math.max(-3.4, Math.min(3.4, w2 * 1.35))
      const loss = lossAt(w1, w2)
      const y = -1.35 + ((loss - minLoss) / Math.max(maxLoss - minLoss, 1e-6)) * 2.7 + 0.06
      return new THREE.Vector3(x, y, z)
    })
  if (pathPoints.length > 1) {
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pathPoints),
        new THREE.LineBasicMaterial({ color: 0xe35f45, linewidth: 3 }),
      ),
    )
  }

  const current = props.snapshot?.params
  if (current) {
    const [w1, w2] = current.weights
    const currentLoss = lossAt(w1, w2)
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xe35f45, emissive: 0xe35f45, emissiveIntensity: 0.2 }),
    )
    marker.position.set(
      Math.max(-3.4, Math.min(3.4, w1 * 1.35)),
      -1.35 + ((currentLoss - minLoss) / Math.max(maxLoss - minLoss, 1e-6)) * 2.7 + 0.16,
      Math.max(-3.4, Math.min(3.4, w2 * 1.35)),
    )
    scene.add(marker)
  }

  const title = makeTextSprite(copy.value.subtitle)
  title.position.set(0, 2.35, -3.4)
  scene.add(title)

  render()
}

function render() {
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function animate() {
  if (scene) {
    scene.rotation.y = Math.sin(Date.now() / 3000) * 0.12
    render()
  }
  animationFrame = window.requestAnimationFrame(animate)
}

onMounted(() => {
  drawScene()
  animate()
  window.addEventListener('resize', drawScene)
})

watch(
  () => [props.snapshot, props.snapshots.length, locale.value],
  () => drawScene(),
  { deep: true },
)

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', drawScene)
  renderer?.dispose()
})
</script>

<template>
  <figure class="logistic-three-surface">
    <figcaption>
      <span>{{ copy.title }}</span>
      <strong>{{ copy.subtitle }}</strong>
    </figcaption>
    <canvas ref="canvasRef" class="logistic-three-surface__canvas" aria-label="logistic regression loss surface"></canvas>
  </figure>
</template>
