<script setup lang="ts">
import { computed } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import { withPublicBase } from '../../../utils/publicPath.ts'
import type { DataLabLocale, DataVisualAsset } from '../types/dataLab'

const props = withDefaults(defineProps<{
  asset: DataVisualAsset
  accent?: string
  locale?: DataLabLocale
}>(), {
  accent: '#2563eb',
  locale: 'zh-CN',
})

const videoSrc = computed(() => withPublicBase(props.asset.assetPath))
const posterSrc = computed(() => withPublicBase(props.asset.posterPath))
</script>

<template>
  <section class="data-manim-player" :style="{ '--data-accent': accent }">
    <div class="data-manim-player__media">
      <video
        controls
        preload="metadata"
        playsinline
        :poster="posterSrc"
        :aria-label="asset.title[locale]"
        :data-asset-path="videoSrc"
      >
        <source :src="videoSrc" type="video/mp4" />
      </video>
    </div>
    <div class="data-manim-player__copy">
      <span>{{ locale === 'zh-CN' ? '过程动画' : 'Process animation' }}</span>
      <strong>{{ asset.title[locale] }}</strong>
      <MarkdownMathContent :source="asset.caption[locale]" />
    </div>
  </section>
</template>
