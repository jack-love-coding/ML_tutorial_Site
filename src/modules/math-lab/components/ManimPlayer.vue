<script setup lang="ts">
import { computed } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import { withPublicBase } from '../../../utils/publicPath.ts'
import type { MathLabLocale, VisualAsset } from '../types/mathLab'

const props = withDefaults(defineProps<{
  asset?: VisualAsset
  accent?: string
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const fallbackTitle = computed(() => (props.locale === 'zh-CN' ? 'Manim 动画' : 'Manim animation'))
const fallbackTranscript = computed(() =>
  props.locale === 'zh-CN'
    ? '这个动画提供静态降级内容，确保视频不可用时仍能学习。'
    : 'This animation has a static fallback for accessibility.',
)
const videoSrc = computed(() => withPublicBase(props.asset?.assetPath))
const posterSrc = computed(() => withPublicBase(props.asset?.posterPath))
</script>

<template>
  <section class="math-manim-player" :style="{ '--math-accent': accent ?? '#3868ff' }">
    <div class="math-manim-player__media">
      <video
        v-if="asset?.assetPath"
        controls
        preload="metadata"
        playsinline
        :poster="posterSrc"
        :aria-label="asset.title[locale]"
        :data-asset-path="videoSrc"
      >
        <source :src="videoSrc" type="video/mp4" />
      </video>
      <div v-else class="math-manim-player__fallback">
        <span>Manim</span>
        <strong>Visual fallback</strong>
      </div>
    </div>

    <div class="math-manim-player__copy">
      <span>{{ asset?.title[locale] ?? fallbackTitle }}</span>
      <MarkdownMathContent :source="asset?.transcript[locale] ?? fallbackTranscript" />
    </div>
  </section>
</template>
