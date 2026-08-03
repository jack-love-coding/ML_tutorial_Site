<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../../types/ml'
import { cnnLessonFocusByChapter, cnnLessonFocusConfigs } from '../../lessons/neuralGuided'
import { useCnnGuidedController } from '../../composables/useCnnGuidedController'
import CnnArchitectureTrack from './CnnArchitectureTrack.vue'
import CnnGuidedInputPanel from './CnnGuidedInputPanel.vue'
import CnnLayerInspector from './CnnLayerInspector.vue'

const props = defineProps<{
  section: StorySection
}>()

const { locale } = useI18n()
const fileInputRef = ref<HTMLInputElement>()
const lessonFocus = computed(() =>
  cnnLessonFocusByChapter.get(props.section.id) ?? cnnLessonFocusConfigs[0],
)
const controller = useCnnGuidedController(
  lessonFocus.value.stage,
  lessonFocus.value.initialSampleId,
)
const {
  status,
  statusMessage,
  fileError,
  layers,
  scores,
  sortedScores,
  topPrediction,
  selectedLayerIndex,
  selectedLayer,
  selectedDetail,
  selectedImageUrl,
  selectedImageName,
  pendingImageName,
  inputShape,
  samples,
  isPlaying,
  reducedMotion,
  selectLayer,
  selectStage,
  stepForward,
  togglePlayback,
  resetSelection,
  selectSample,
  selectScore,
  uploadFile,
} = controller

const copy = computed(() => locale.value === 'zh-CN'
  ? {
      title: 'Tiny VGG 引导实验',
      status: { idle: '准备中', loading: '正在计算真实激活', ready: '前向传播就绪', error: '模型加载失败' },
      play: '播放', pause: '暂停', step: '单步', reset: '重置',
      watch: '观察重点', result: '观察结果', score: '分类输出', prediction: 'Top-3 真实概率',
      reduced: '已关闭连续动画；仍可使用单步、选层和样本切换。',
      invalidType: '只支持 PNG、JPG 和 WebP 图片。',
      invalidSize: '图片不能超过 5MB。',
      fallback: '模型不可用时，仍可沿页面正文阅读 shape、公式与参数说明。',
      currentShape: '实际输入', params: '可学习参数', output: '输出 shape',
    }
  : {
      title: 'Tiny VGG guided lab',
      status: { idle: 'Preparing', loading: 'Computing real activations', ready: 'Forward pass ready', error: 'Model unavailable' },
      play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset',
      watch: 'What to watch', result: 'What changed', score: 'Class output', prediction: 'Real top-3 probabilities',
      reduced: 'Continuous animation is off; step, layer selection, and sample switching remain available.',
      invalidType: 'Choose a PNG, JPG, or WebP image.',
      invalidSize: 'The image must be 5MB or smaller.',
      fallback: 'If the model is unavailable, the lesson still explains shapes, formulas, and parameter counts.',
      currentShape: 'Runtime input', params: 'Trainable parameters', output: 'Output shape',
    })

const sampleCards = computed(() => samples.map((sample) => {
  const score = scores.value.find((item) => item.label === sample.label)
  return {
    ...sample,
    probabilityLabel: score ? formatPercent(score.probability) : '—',
    isSelected: sample.label === selectedImageName.value,
    isPending: sample.label === pendingImageName.value,
    isTopPrediction: sample.label === topPrediction.value?.label,
  }
}))
const topScores = computed(() => sortedScores.value.slice(0, 3))
const fileErrorText = computed(() => {
  if (fileError.value === 'invalid-type') return copy.value.invalidType
  if (fileError.value === 'invalid-size') return copy.value.invalidSize
  return ''
})
const resultText = computed(() => {
  const layer = selectedLayer.value
  if (!layer) return copy.value.fallback
  return locale.value === 'zh-CN'
    ? `${layer.name} 把 ${layer.inputShape.join(' × ') || '—'} 变为 ${layer.outputShape.join(' × ')}，包含 ${layer.parameterCount.toLocaleString()} 个可学习参数。`
    : `${layer.name} maps ${layer.inputShape.join(' × ') || '—'} to ${layer.outputShape.join(' × ')} with ${layer.parameterCount.toLocaleString()} trainable parameters.`
})

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`
}

function openUpload() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  uploadFile(file)
}

watch(
  () => props.section.id,
  () => {
    selectStage(lessonFocus.value.stage)
    const sample = samples.find((item) => item.id === lessonFocus.value.initialSampleId)
    if (sample && sample.label !== selectedImageName.value) selectSample(sample.id)
  },
)
</script>

<template>
  <section class="cnn-explainer-lab cnn-guided-workbench" :data-status="status">
    <header class="cnn-guided-workbench__header">
      <div>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.currentShape }} · {{ inputShape.join(' × ') }}</strong>
      </div>
      <div class="cnn-guided-workbench__actions" :aria-label="copy.title">
        <p :class="`is-${status}`"><i aria-hidden="true" />{{ copy.status[status] }}</p>
        <button
          v-if="lessonFocus.guidedControls.includes('playback')"
          type="button"
          :disabled="status !== 'ready' || reducedMotion"
          @click="togglePlayback()"
        >
          <span aria-hidden="true">{{ isPlaying ? 'Ⅱ' : '▶' }}</span>{{ isPlaying ? copy.pause : copy.play }}
        </button>
        <button v-if="lessonFocus.guidedControls.includes('playback')" type="button" :disabled="status !== 'ready'" @click="stepForward">
          <span aria-hidden="true">→</span>{{ copy.step }}
        </button>
        <button v-if="lessonFocus.guidedControls.includes('playback')" type="button" :disabled="status !== 'ready'" @click="resetSelection">
          <span aria-hidden="true">↺</span>{{ copy.reset }}
        </button>
      </div>
    </header>

    <input
      ref="fileInputRef"
      class="cnn-explainer-lab__file"
      type="file"
      tabindex="-1"
      aria-hidden="true"
      accept="image/png,image/jpeg,image/webp"
      @change="onFileChange"
    />

    <p v-if="reducedMotion" class="cnn-explainer-lab__notice">{{ copy.reduced }}</p>
    <p v-if="fileErrorText" class="cnn-explainer-lab__notice is-error">{{ fileErrorText }}</p>
    <p v-if="status === 'error'" class="cnn-explainer-lab__notice is-error">{{ statusMessage || copy.fallback }}</p>

    <p class="cnn-guided-workbench__observation">
      <span>{{ copy.watch }}</span>
      <strong>{{ lessonFocus.observation[locale as AppLocale] }}</strong>
    </p>

    <div class="cnn-guided-workbench__flow">
      <CnnGuidedInputPanel
        :image-url="selectedImageUrl"
        :image-name="selectedImageName"
        :samples="sampleCards"
        :disabled="status === 'loading'"
        :show-upload="lessonFocus.guidedControls.includes('upload')"
        :show-samples="lessonFocus.guidedControls.includes('sample')"
        @upload="openUpload"
        @select="selectSample"
      />

      <CnnArchitectureTrack
        :layers="layers"
        :selected-layer-index="selectedLayerIndex"
        :section-id="props.section.id"
        @select="selectLayer"
      >
        <template #mobile-detail="{ stage }">
          <dl class="cnn-guided-track__mobile-detail">
            <div><dt>{{ copy.output }}</dt><dd>{{ stage.shape.join(' × ') }}</dd></div>
            <div><dt>{{ copy.params }}</dt><dd>{{ stage.parameterCount.toLocaleString() }}</dd></div>
          </dl>
        </template>
      </CnnArchitectureTrack>

      <section class="cnn-guided-output" :aria-label="copy.score">
        <header><span>{{ copy.score }}</span><strong>{{ copy.prediction }}</strong></header>
        <button v-for="(score, index) in topScores" :key="score.id" type="button" :class="{ 'is-top': index === 0 }" @click="selectScore(score)">
          <span>{{ index + 1 }}</span><strong>{{ score.label }}</strong><em>{{ formatPercent(score.probability) }}</em>
          <i><b :style="{ width: formatPercent(score.probability) }" /></i>
        </button>
        <p v-if="topPrediction"><span aria-hidden="true">✓</span>top-1 · {{ topPrediction.label }}</p>
      </section>

      <CnnLayerInspector
        :layer="selectedLayer"
        :detail="selectedDetail"
        :scores="scores"
        :default-view="lessonFocus.inspectorView"
        :section-id="props.section.id"
      />
    </div>

    <p class="cnn-guided-workbench__result" aria-live="polite">
      <span>{{ copy.result }}</span><strong>{{ resultText }}</strong>
    </p>
  </section>
</template>
