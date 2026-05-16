<script setup lang="ts">
import * as d3 from 'd3'
import * as THREE from 'three'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DataCell, DataLabLocale } from '../types/dataLab'
import {
  activeSparseIndices,
  buildCategoryVocabulary,
  encodeMultiHot,
  encodeOneHot,
  featureCrossDimension,
  featureCrossToken,
  hashCategoryToBucket,
  resolveCategoryToken,
} from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

type EncodingMode = 'one-hot' | 'multi-hot' | 'cross' | 'hash'

const mode = ref<EncodingMode>('one-hot')
const minFrequency = ref(2)
const maxCategories = ref(4)
const bucketCount = ref(8)
const selectedDistrict = ref<DataCell>('south')
const selectedPropertyType = ref<DataCell>('condo')
const selectedTags = ref<DataCell[]>(['subway', 'school'])
const sceneTarget = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer | undefined
let animationFrame = 0
let disposeThreeScene: (() => void) | undefined

const districtTrain = ['north', 'south', 'west', 'north', 'south', 'south', 'east', 'harbor', 'west', 'north']
const districtPredict = ['south', 'harbor', 'airport', 'north']
const propertyTypeTrain = ['apartment', 'house', 'condo', 'apartment', 'loft', 'house', 'condo']
const tagTrain = ['subway', 'school', 'park', 'school', 'parking', 'pet', 'subway', 'gym', 'park', 'school']

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '交互实验',
        title: '类别编码实验室',
        subtitle: '调节词表、低频合并、OOV、交叉与哈希，观察模型最终读到的稀疏向量。',
        oneHot: 'one-hot',
        multiHot: 'multi-hot',
        cross: '特征交叉',
        hash: '哈希桶',
        minFrequency: '最低频次',
        maxCategories: '最多保留类别',
        bucketCount: '哈希桶数',
        sample: '预测样本',
        vocabulary: '训练词表',
        vectorWidth: '向量宽度',
        activeSlots: '激活槽位',
        rare: '低频合并',
        oov: '未知类别',
        sparse: '稀疏表示',
        district: '街区',
        propertyType: '房源类型',
        tags: '标签集合',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Categorical Encoding Lab',
        subtitle: 'Adjust vocabulary, rare buckets, OOV, crosses, and hashing to see the sparse vector a model receives.',
        oneHot: 'one-hot',
        multiHot: 'multi-hot',
        cross: 'feature cross',
        hash: 'hash buckets',
        minFrequency: 'min frequency',
        maxCategories: 'max categories',
        bucketCount: 'hash buckets',
        sample: 'prediction sample',
        vocabulary: 'train vocabulary',
        vectorWidth: 'vector width',
        activeSlots: 'active slots',
        rare: 'rare bucket',
        oov: 'unknown category',
        sparse: 'sparse representation',
        district: 'district',
        propertyType: 'property type',
        tags: 'tag set',
      },
)

const modeLabels = computed<Record<EncodingMode, string>>(() => ({
  'one-hot': copy.value.oneHot,
  'multi-hot': copy.value.multiHot,
  cross: copy.value.cross,
  hash: copy.value.hash,
}))

const districtVocabulary = computed(() =>
  buildCategoryVocabulary(districtTrain, {
    minFrequency: minFrequency.value,
    maxCategories: maxCategories.value,
    includeOov: true,
  }),
)

const tagVocabulary = computed(() =>
  buildCategoryVocabulary(tagTrain, {
    minFrequency: 1,
    maxCategories: 7,
    includeOov: true,
  }),
)

const propertyVocabulary = computed(() =>
  buildCategoryVocabulary(propertyTypeTrain, {
    minFrequency: 1,
    maxCategories: 5,
    includeOov: true,
  }),
)

const activeVector = computed(() => {
  if (mode.value === 'multi-hot') return encodeMultiHot(selectedTags.value, tagVocabulary.value)
  if (mode.value === 'cross') {
    const width = featureCrossDimension(districtVocabulary.value, propertyVocabulary.value)
    const vector = Array.from({ length: width }, () => 0)
    const districtToken = resolveCategoryToken(selectedDistrict.value, districtVocabulary.value)
    const propertyToken = resolveCategoryToken(selectedPropertyType.value, propertyVocabulary.value)
    const districtIndex = districtToken ? districtVocabulary.value.tokenToIndex[districtToken] : undefined
    const propertyIndex = propertyToken ? propertyVocabulary.value.tokenToIndex[propertyToken] : undefined
    if (districtIndex !== undefined && propertyIndex !== undefined) {
      vector[districtIndex * propertyVocabulary.value.tokens.length + propertyIndex] = 1
    }
    return vector
  }
  if (mode.value === 'hash') {
    const vector = Array.from({ length: bucketCount.value }, () => 0)
    const { bucket } = hashCategoryToBucket(selectedDistrict.value, bucketCount.value)
    vector[bucket] = 1
    return vector
  }
  return encodeOneHot(selectedDistrict.value, districtVocabulary.value)
})

const activeIndices = computed(() => activeSparseIndices(activeVector.value))
const currentVocabulary = computed(() => {
  if (mode.value === 'multi-hot') return tagVocabulary.value.tokens
  if (mode.value === 'cross') {
    return districtVocabulary.value.tokens.flatMap((district) =>
      propertyVocabulary.value.tokens.map((property) => `${district}×${property}`),
    )
  }
  if (mode.value === 'hash') return Array.from({ length: bucketCount.value }, (_, index) => `bucket_${index}`)
  return districtVocabulary.value.tokens
})

const vectorCells = computed(() => {
  const width = activeVector.value.length
  const x = d3.scaleBand<number>().domain(d3.range(width)).range([24, 516]).padding(0.12)
  return activeVector.value.map((value, index) => ({
    index,
    x: x(index) ?? 24,
    y: 78,
    width: Math.max(8, x.bandwidth()),
    active: value === 1,
    label: currentVocabulary.value[index] ?? String(index),
  }))
})

const vocabularyRows = computed(() =>
  currentVocabulary.value.slice(0, 12).map((token, index) => ({
    token,
    index,
    active: activeIndices.value.includes(index),
  })),
)

const readout = computed(() => ({
  width: activeVector.value.length,
  active: activeIndices.value.join(', ') || 'none',
  sparse: activeIndices.value.map((index) => `${index}:1`).join(', ') || '{}',
  rareCount: districtVocabulary.value.rareValues.length,
}))

const equivalentCode = computed(() => {
  if (mode.value === 'multi-hot') return "MultiLabelBinarizer().fit(train_tags).transform([tags])"
  if (mode.value === 'cross') return "df['district_x_type'] = df['district'] + '_' + df['property_type']"
  if (mode.value === 'hash') return 'FeatureHasher(n_features=bucket_count).transform(categories)'
  return "OneHotEncoder(handle_unknown='ignore').fit(train[['district']]).transform(new)"
})

function setMode(nextMode: EncodingMode) {
  mode.value = nextMode
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose())
  } else {
    material.dispose()
  }
}

function disposeGroupMeshes(group: THREE.Group) {
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      disposeMaterial(object.material)
    }
  })
  group.clear()
}

function mountThreeScene(el: HTMLElement) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0b1224')
  const camera = new THREE.PerspectiveCamera(42, el.clientWidth / 220, 0.1, 100)
  camera.position.set(0, 1.8, 7)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, 220)
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight('#ffffff', 0.72))
  const light = new THREE.DirectionalLight('#ffffff', 1.8)
  light.position.set(3, 4, 5)
  scene.add(light)

  const group = new THREE.Group()
  scene.add(group)

  const rebuild = () => {
    disposeGroupMeshes(group)
    const vector = activeVector.value
    const total = Math.max(1, vector.length)
    const active = new Set(activeIndices.value)
    for (let index = 0; index < total; index += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: active.has(index) ? '#f6b73c' : '#24435c',
        emissive: active.has(index) ? '#4a2800' : '#000000',
        roughness: 0.5,
      })
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.26, active.has(index) ? 0.62 : 0.28, 0.26), material)
      box.position.x = (index - (total - 1) / 2) * Math.min(0.36, 5.8 / total)
      box.position.y = active.has(index) ? 0.16 : -0.06
      group.add(box)
    }
  }

  const animate = () => {
    animationFrame = requestAnimationFrame(animate)
    group.rotation.y += 0.006
    renderer?.render(scene, camera)
  }

  const stopRebuild = watch([activeVector, activeIndices], rebuild, { immediate: true })
  disposeThreeScene = () => {
    stopRebuild()
    disposeGroupMeshes(group)
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = undefined
  }
  animate()
}

onMounted(() => {
  if (sceneTarget.value) mountThreeScene(sceneTarget.value)
})

onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  disposeThreeScene?.()
})
</script>

<template>
  <section class="data-lab-card categorical-encoding-lab">
    <div class="data-lab-card__visual">
      <svg viewBox="0 0 540 260" role="img" :aria-label="copy.title">
        <rect x="18" y="28" width="504" height="44" rx="16" class="data-lab-track" />
        <text x="28" y="55">{{ copy.vectorWidth }}: {{ readout.width }} | {{ copy.activeSlots }}: {{ readout.active }}</text>

        <g v-for="cell in vectorCells" :key="cell.index">
          <rect
            :x="cell.x"
            :y="cell.y"
            :width="cell.width"
            height="42"
            rx="8"
            :class="{ 'categorical-vector-cell': true, 'is-active': cell.active }"
          />
          <text v-if="cell.width > 22" :x="cell.x + cell.width / 2" y="106">{{ cell.active ? 1 : 0 }}</text>
        </g>

        <g v-for="row in vocabularyRows" :key="row.token">
          <circle :cx="34 + (row.index % 6) * 82" :cy="162 + Math.floor(row.index / 6) * 42" r="8" :class="{ 'data-point': row.active, 'data-outlier': row.token.includes('<') }" />
          <text :x="50 + (row.index % 6) * 82" :y="166 + Math.floor(row.index / 6) * 42" class="categorical-token-label">{{ row.token }}</text>
        </g>
      </svg>
      <div ref="sceneTarget" class="data-three-strip" aria-hidden="true" />
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="data-segmented-control">
        <button
          v-for="candidate in (['one-hot', 'multi-hot', 'cross', 'hash'] as EncodingMode[])"
          :key="candidate"
          type="button"
          :class="{ 'is-active': mode === candidate }"
          @click="setMode(candidate)"
        >
          {{ modeLabels[candidate] }}
        </button>
      </div>

      <label class="data-range-control">
        {{ copy.minFrequency }}: {{ minFrequency }}
        <input v-model.number="minFrequency" type="range" min="1" max="3" step="1" />
      </label>
      <label class="data-range-control">
        {{ copy.maxCategories }}: {{ maxCategories }}
        <input v-model.number="maxCategories" type="range" min="2" max="6" step="1" />
      </label>
      <label v-if="mode === 'hash'" class="data-range-control">
        {{ copy.bucketCount }}: {{ bucketCount }}
        <input v-model.number="bucketCount" type="range" min="4" max="16" step="1" />
      </label>

      <div class="data-readout-grid">
        <article><span>{{ copy.sample }}</span><strong>{{ selectedDistrict }} / {{ selectedPropertyType }}</strong></article>
        <article><span>{{ copy.sparse }}</span><strong>{{ readout.sparse }}</strong></article>
        <article><span>{{ copy.rare }}</span><strong>{{ readout.rareCount }}</strong></article>
        <article><span>{{ copy.oov }}</span><strong>{{ districtPredict.at(-1) }}</strong></article>
      </div>

      <pre class="data-code-block"><code>{{ equivalentCode }}</code></pre>
      <p class="data-lab-note">
        {{
          mode === 'cross'
            ? `${copy.cross}: ${featureCrossToken(selectedDistrict, selectedPropertyType)}`
            : props.locale === 'zh-CN'
              ? '词表必须来自训练集，并在验证、测试和线上预测阶段复用。'
              : 'The vocabulary must be learned from training data and reused for validation, test, and serving.'
        }}
      </p>
    </div>
  </section>
</template>
