<script setup lang="ts">
import { computed } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import { withPublicBase } from '../../../utils/publicPath.ts'
import type { DataLabLocale, DataVisualAsset } from '../types/dataLab'

const props = withDefaults(defineProps<{
  asset: DataVisualAsset
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

const src = computed(() => withPublicBase(props.asset.assetPath))
</script>

<template>
  <figure class="data-visual-figure">
    <div class="data-visual-figure__media">
      <img :src="src" :alt="asset.alt[locale]" loading="lazy" />
      <span
        v-for="label in asset.labels ?? []"
        :key="label.id"
        class="data-visual-figure__label"
        :style="{ left: `${label.x}%`, top: `${label.y}%` }"
      >
        {{ label.label[locale] }}
      </span>
    </div>
    <figcaption>
      <strong>{{ asset.title[locale] }}</strong>
      <MarkdownMathContent :source="asset.caption[locale]" />
    </figcaption>
  </figure>
</template>
