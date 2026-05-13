<script setup lang="ts">
import * as d3 from 'd3'
import * as THREE from 'three'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DataLabLocale } from '../types/dataLab'
import { housingTeachingTable, oneHotDimension, profileColumns } from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

type ColumnRole = 'numeric' | 'categorical' | 'ignore' | 'label'

const roleByColumn = ref<Record<string, ColumnRole>>({
  id: 'ignore',
  district: 'categorical',
  rooms: 'numeric',
  price: 'label',
  listed_at: 'ignore',
  has_school: 'categorical',
})

const sceneTarget = ref<HTMLElement | null>(null)
let renderer: THREE.WebGLRenderer | undefined
let animationFrame = 0

const profiles = computed(() => profileColumns(housingTeachingTable))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '交互实验',
        title: '列类型分拣器',
        subtitle: '给每一列选择角色，观察模型最终读到的特征向量如何变化。',
        numeric: '数值',
        categorical: '类别',
        ignore: '忽略',
        label: '目标',
        inferred: '推断类型',
        missing: '缺失',
        unique: '唯一值',
        vector: '特征向量宽度',
        oneHot: 'one-hot 维度',
        warning: '把 ID 当数值会制造没有语义的距离。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Column Type Sorter',
        subtitle: 'Choose each column role and watch the model-facing feature vector change.',
        numeric: 'numeric',
        categorical: 'categorical',
        ignore: 'ignore',
        label: 'label',
        inferred: 'inferred type',
        missing: 'missing',
        unique: 'unique',
        vector: 'feature vector width',
        oneHot: 'one-hot dimensions',
        warning: 'Treating IDs as numbers creates meaningless distances.',
      },
)

const roleLabels = computed<Record<ColumnRole, string>>(() => ({
  numeric: copy.value.numeric,
  categorical: copy.value.categorical,
  ignore: copy.value.ignore,
  label: copy.value.label,
}))

const vectorSegments = computed(() =>
  housingTeachingTable.columns
    .map((column) => {
      const role = roleByColumn.value[column.key] ?? 'ignore'
      const width = role === 'numeric' ? 1 : role === 'categorical' ? oneHotDimension(housingTeachingTable, column.key) : 0
      return {
        key: column.key,
        label: column.label[props.locale],
        role,
        width,
      }
    })
    .filter((segment) => segment.width > 0),
)

const vectorWidth = computed(() => vectorSegments.value.reduce((sum, segment) => sum + segment.width, 0))
const oneHotWidth = computed(() =>
  vectorSegments.value
    .filter((segment) => segment.role === 'categorical')
    .reduce((sum, segment) => sum + segment.width, 0),
)
const vectorSlots = computed(() =>
  vectorSegments.value.flatMap((segment) =>
    Array.from({ length: segment.width }, (_, offset) => ({
      key: `${segment.key}-${offset}`,
      role: segment.role,
    })),
  ),
)

const idMisused = computed(() => roleByColumn.value.id === 'numeric')

const segmentRects = computed(() => {
  const x = d3.scaleLinear().domain([0, Math.max(1, vectorWidth.value)]).range([24, 500])
  let cursor = 0
  return vectorSegments.value.map((segment, index) => {
    const start = cursor
    cursor += segment.width
    return {
      ...segment,
      index,
      x: x(start),
      dimension: segment.width,
      width: Math.max(20, x(cursor) - x(start) - 6),
      fill: segment.role === 'numeric' ? '#d8f6ff' : '#fff2ad',
    }
  })
})

function roleButtonClass(columnKey: string, role: ColumnRole) {
  return {
    'is-active': roleByColumn.value[columnKey] === role,
  }
}

function setRole(columnKey: string, role: ColumnRole) {
  roleByColumn.value = { ...roleByColumn.value, [columnKey]: role }
}

function mountThreeScene(el: HTMLElement) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0c1628')
  const camera = new THREE.PerspectiveCamera(42, el.clientWidth / 220, 0.1, 100)
  camera.position.set(0, 1.5, 6)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, 220)
  el.appendChild(renderer.domElement)

  const light = new THREE.DirectionalLight('#ffffff', 2)
  light.position.set(2, 4, 5)
  scene.add(light)
  scene.add(new THREE.AmbientLight('#ffffff', 0.7))

  const group = new THREE.Group()
  scene.add(group)

  const rebuild = () => {
    group.clear()
    const slots = vectorSlots.value
    const total = Math.max(1, slots.length)
    for (let index = 0; index < total; index += 1) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.34, 0.34),
        new THREE.MeshStandardMaterial({
          color: slots[index]?.role === 'categorical' ? '#f8c84a' : '#56c7dd',
          roughness: 0.45,
        }),
      )
      box.position.x = (index - (total - 1) / 2) * 0.42
      box.position.y = Math.sin(index * 0.7) * 0.08
      group.add(box)
    }
  }

  const animate = () => {
    animationFrame = requestAnimationFrame(animate)
    group.rotation.y += 0.008
    renderer?.render(scene, camera)
  }

  watch(vectorSlots, rebuild, { immediate: true })
  animate()
}

onMounted(() => {
  if (sceneTarget.value) mountThreeScene(sceneTarget.value)
})

onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  renderer?.dispose()
})
</script>

<template>
  <section class="data-lab-card column-type-lab">
    <div class="data-lab-card__visual">
      <svg viewBox="0 0 540 250" role="img" :aria-label="copy.vector">
        <rect x="16" y="28" width="508" height="74" rx="14" class="data-lab-track" />
        <g v-for="rect in segmentRects" :key="rect.key">
          <rect :x="rect.x" y="48" :width="rect.width" height="34" rx="8" :fill="rect.fill" />
          <title>{{ rect.label }} ×{{ rect.dimension }}</title>
          <text v-if="rect.width > 44" :x="rect.x + rect.width / 2" y="128">{{ rect.label }}</text>
          <text :x="rect.x + rect.width / 2" y="150">×{{ rect.dimension }}</text>
        </g>
        <text x="24" y="210">{{ copy.vector }}: {{ vectorWidth }} | {{ copy.oneHot }}: {{ oneHotWidth }}</text>
      </svg>
      <div ref="sceneTarget" class="data-three-strip" aria-hidden="true" />
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="column-type-lab__columns">
        <article v-for="profile in profiles" :key="profile.key">
          <header>
            <strong>{{ profile.label[locale] }}</strong>
            <span>{{ copy.inferred }}: {{ profile.inferredType }}</span>
          </header>
          <p>{{ copy.missing }} {{ profile.missingCount }} · {{ copy.unique }} {{ profile.uniqueCount }}</p>
          <div>
            <button
              v-for="role in (['numeric', 'categorical', 'ignore', 'label'] as ColumnRole[])"
              :key="role"
              type="button"
              :class="roleButtonClass(profile.key, role)"
              @click="setRole(profile.key, role)"
            >
              {{ roleLabels[role] }}
            </button>
          </div>
        </article>
      </div>

      <p class="data-lab-note" :class="{ 'is-warning': idMisused }">
        {{ idMisused ? copy.warning : locale === 'zh-CN' ? '当前配置把 ID 排除在模型输入之外。' : 'The current setup keeps IDs out of model inputs.' }}
      </p>
    </div>
  </section>
</template>
