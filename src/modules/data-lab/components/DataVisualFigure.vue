<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const failed = ref(false)
watch(src, () => { failed.value = false })
</script>

<template>
  <figure class="data-visual-figure" :class="{ 'data-visual-figure--compact': asset.layout === 'compact' }">
    <div class="data-visual-figure__media">
      <img v-if="!failed" :src="src" :alt="asset.alt[locale]" loading="lazy" @error="failed = true" />
      <p v-else class="data-visual-figure__fallback" role="status">{{ locale === 'zh-CN' ? '插图暂时无法加载，请阅读下方图注与操作说明。' : 'The figure could not load. Use the caption and instructions below.' }}</p>
      <span
        v-for="(label, index) in failed ? [] : asset.labels ?? []"
        :key="label.id"
        class="data-visual-figure__label"
        aria-hidden="true"
        :style="{ left: `${label.x}%`, top: `${label.y}%` }"
      >
        {{ index + 1 }}
      </span>
    </div>
    <ol v-if="asset.labels?.length" class="data-visual-figure__legend">
      <li v-for="label in asset.labels" :key="label.id">{{ label.label[locale] }}</li>
    </ol>
    <figcaption>
      <strong>{{ asset.title[locale] }}</strong>
      <MarkdownMathContent :source="asset.caption[locale]" />
    </figcaption>
  </figure>
</template>
