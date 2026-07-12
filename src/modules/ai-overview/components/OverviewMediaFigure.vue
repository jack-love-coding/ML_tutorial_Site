<script setup lang="ts">
import { computed } from 'vue'
import type { AppLocale } from '../../../types/ml'
import { withPublicBase } from '../../../utils/publicPath'
import type { AiOverviewMediaAsset } from '../types'

const props = defineProps<{ asset: AiOverviewMediaAsset; locale: AppLocale }>()
const source = computed(() => withPublicBase(props.asset.publicPath))
const poster = computed(() => props.asset.posterPath ? withPublicBase(props.asset.posterPath) : undefined)
</script>

<template>
  <figure class="overview-media-figure">
    <img v-if="asset.kind === 'imagegen'" :src="source" :alt="asset.title[locale]" loading="lazy" />
    <video v-else controls preload="metadata" :poster="poster" :aria-label="asset.title[locale]">
      <source :src="source" />
    </video>
    <figcaption><strong>{{ asset.title[locale] }}</strong> — {{ asset.caption[locale] }}</figcaption>
    <p lang="en">{{ asset.englishSummary }}</p>
    <ul v-if="asset.bilingualLabels.length">
      <li v-for="label in asset.bilingualLabels" :key="label.en">{{ label[locale] }}</li>
    </ul>
  </figure>
</template>

<style scoped>
.overview-media-figure { margin: 0; }
img, video { display: block; width: 100%; height: auto; border-radius: .6rem; }
figcaption { margin-top: .55rem; }
ul { display: flex; flex-wrap: wrap; gap: .4rem; padding: 0; list-style: none; }
li { border: 1px solid currentColor; border-radius: 999px; padding: .25rem .55rem; }
</style>
