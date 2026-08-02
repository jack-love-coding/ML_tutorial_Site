<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface GuidedSample {
  id: string
  label: string
  url: string
  probabilityLabel: string
  isSelected: boolean
  isPending: boolean
  isTopPrediction: boolean
}

defineProps<{
  imageUrl: string
  imageName: string
  samples: GuidedSample[]
  disabled?: boolean
  showUpload: boolean
  showSamples: boolean
}>()

const emit = defineEmits<{
  upload: []
  select: [sampleId: string]
}>()

const { locale } = useI18n()
const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: '输入样本',
        fallback: '正在准备图片',
        upload: '上传图片',
        hint: 'PNG / JPG / WebP · 最大 5MB · 仅本地处理',
        samples: '换一个样本',
        selected: '当前样本',
      }
    : {
        eyebrow: 'Input sample',
        fallback: 'Preparing image',
        upload: 'Upload image',
        hint: 'PNG / JPG / WebP · 5MB max · processed locally',
        samples: 'Try another sample',
        selected: 'Current sample',
      },
)
</script>

<template>
  <section class="cnn-guided-input" :aria-label="copy.eyebrow">
    <header>
      <span>{{ copy.eyebrow }}</span>
      <strong>{{ imageName || copy.fallback }}</strong>
    </header>

    <div class="cnn-guided-input__preview">
      <img v-if="imageUrl" :src="imageUrl" :alt="imageName" />
      <span v-else aria-hidden="true">64 × 64 × 3</span>
    </div>

    <button v-if="showUpload" type="button" class="cnn-guided-input__upload" :disabled="disabled" @click="emit('upload')">
      <span aria-hidden="true">↑</span>
      {{ copy.upload }}
    </button>
    <small v-if="showUpload">{{ copy.hint }}</small>

    <div v-if="showSamples" class="cnn-guided-input__samples">
      <span>{{ copy.samples }}</span>
      <div role="list">
        <button
          v-for="sample in samples"
          :key="sample.id"
          type="button"
          role="listitem"
          :disabled="sample.isPending"
          :class="{ 'is-selected': sample.isSelected, 'is-top': sample.isTopPrediction }"
          :aria-label="`${sample.label}, ${sample.probabilityLabel}${sample.isSelected ? `, ${copy.selected}` : ''}`"
          :aria-pressed="sample.isSelected"
          @click="emit('select', sample.id)"
        >
          <img :src="sample.url" :alt="sample.label" />
          <span>{{ sample.label }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
