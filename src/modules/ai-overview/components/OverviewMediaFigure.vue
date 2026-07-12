<script setup lang="ts">
import { computed } from 'vue'
import type { AppLocale } from '../../../types/ml'
import { withPublicBase } from '../../../utils/publicPath'
import type { Localized } from '../types'

export interface AiOverviewMediaAsset {
  kind: 'image' | 'video'
  assetPath: string
  posterPath?: string
  alt: Localized<string>
  caption: Localized<string>
}

const props = defineProps<{ asset: AiOverviewMediaAsset; locale: AppLocale }>()
const source = computed(() => withPublicBase(props.asset.assetPath))
const poster = computed(() => props.asset.posterPath ? withPublicBase(props.asset.posterPath) : undefined)
</script>

<template>
  <figure class="overview-media-figure">
    <img v-if="asset.kind === 'image'" :src="source" :alt="asset.alt[locale]" loading="lazy" />
    <video v-else controls preload="metadata" :poster="poster" :aria-label="asset.alt[locale]">
      <source :src="source" />
    </video>
    <figcaption>{{ asset.caption[locale] }}</figcaption>
  </figure>
</template>

<style scoped>
.overview-media-figure { margin: 0; }
img, video { display: block; width: 100%; height: auto; border-radius: .6rem; }
figcaption { margin-top: .55rem; }
</style>
