<script setup lang="ts">
import { computed } from 'vue'
import type { AppLocale } from '../../../types/ml'
import { withPublicBase } from '../../../utils/publicPath'
import type { AiOverviewMediaAsset } from '../types'

const props = defineProps<{ asset: AiOverviewMediaAsset; locale: AppLocale }>()
const source = computed(() => props.asset.availability === 'available' ? withPublicBase(props.asset.publicPath) : undefined)
const poster = computed(() => props.asset.posterPath ? withPublicBase(props.asset.posterPath) : undefined)
</script>

<template>
  <figure class="overview-media-figure">
    <img v-if="asset.availability === 'available' && asset.kind === 'imagegen'" :src="source" :alt="asset.title[locale]" loading="lazy" />
    <video v-else-if="asset.availability === 'available'" controls preload="metadata" :poster="poster" :aria-label="asset.title[locale]">
      <source :src="source" />
    </video>
    <p v-else class="overview-media-figure__deferred" role="status">{{ locale === 'zh-CN' ? '插图稍后补充。' : 'Illustration deferred.' }}</p>
    <figcaption><strong>{{ asset.title[locale] }}</strong> — {{ asset.caption[locale] }}</figcaption>
    <div v-if="locale === 'en'" class="overview-media-figure__english-support" lang="en">
      <p>{{ asset.englishSummary }}</p>
      <div v-if="asset.bilingualLabels.length" class="overview-media-figure__table-wrap" tabindex="0" aria-label="Chinese labels and English translations">
        <table>
          <thead><tr><th scope="col">Chinese label in media</th><th scope="col">English meaning</th></tr></thead>
          <tbody><tr v-for="label in asset.bilingualLabels" :key="label.en"><td lang="zh-CN">{{ label['zh-CN'] }}</td><td>{{ label.en }}</td></tr></tbody>
        </table>
      </div>
    </div>
    <details v-if="asset.kind === 'manim-video'" class="overview-media-figure__transcript">
      <summary>{{ locale === 'zh-CN' ? '中文字幕稿' : 'Chinese transcript' }}</summary>
      <div class="overview-media-figure__transcript-body" lang="zh-CN">{{ asset.transcriptZhCN }}</div>
      <p class="overview-media-figure__transcript-source">
        {{ locale === 'zh-CN' ? '完整分段稿来源：' : 'Auditable timed transcript source:' }}
        <code>{{ asset.transcriptPath }}</code>
      </p>
    </details>
  </figure>
</template>

<style scoped>
.overview-media-figure { margin: 0; }
img, video { display: block; width: 100%; height: auto; border-radius: .6rem; }
figcaption { margin-top: .55rem; }
.overview-media-figure__table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid currentColor; padding: .55rem; text-align: start; vertical-align: top; }
details { margin-top: .75rem; }
.overview-media-figure__transcript-body { white-space: pre-wrap; }
code { overflow-wrap: anywhere; }
</style>
