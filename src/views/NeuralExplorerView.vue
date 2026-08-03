<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { loadAlgorithmModule } from '../data/moduleCatalog'
import type { AlgorithmModuleDefinition, AppLocale, LocalizedCopy, ModuleSlug } from '../types/ml'

const MlpPlaygroundCockpit = defineAsyncComponent(
  () => import('../components/MlpPlaygroundCockpit.vue'),
)
const CnnExplainerLab = defineAsyncComponent(() => import('../components/CnnExplainerLab.vue'))

const props = defineProps<{
  variant: Extract<ModuleSlug, 'mlp' | 'cnn-visualization'>
}>()

const route = useRoute()
const { locale, t } = useI18n()
const moduleDefinition = shallowRef<AlgorithmModuleDefinition>()

const copy = computed(() => locale.value === 'zh-CN'
  ? {
      eyebrow: '独立探索实验台',
      title: '自由调整全部参数',
      intro: '这里的操作不会改变课程进度。完成探索后，可以返回来源章节继续学习。',
      back: '返回课程章节',
      fallback: '第一章',
    }
  : {
      eyebrow: 'Standalone playground',
      title: 'Explore every parameter',
      intro: 'Actions here do not change course progress. Return to the source chapter when you are ready.',
      back: 'Return to the lesson',
      fallback: 'First chapter',
    })

const requestedChapterId = computed(() => {
  const value = route.query.chapter
  return typeof value === 'string' ? value : ''
})
const activeSection = computed(() => {
  const chapters = moduleDefinition.value?.chapters ?? []
  return chapters.find((section) => section.id === requestedChapterId.value) ?? chapters[0]
})
const backPath = computed(() => {
  const chapterId = activeSection.value?.id ?? ''
  return chapterId ? `/learn/${props.variant}/${chapterId}` : `/learn/${props.variant}`
})

function localizedText(value?: LocalizedCopy) {
  if (!value) return ''
  return value[locale.value as AppLocale]
}

function sectionTitle() {
  const section = activeSection.value
  if (!section) return copy.value.fallback
  return localizedText(section.title) || t(section.titleKey)
}

watch(
  () => props.variant,
  async (variant) => {
    moduleDefinition.value = await loadAlgorithmModule(variant)
  },
  { immediate: true },
)
</script>

<template>
  <main
    v-if="moduleDefinition && activeSection"
    class="algorithm-view algorithm-view--neural neural-explorer-page"
    :class="`algorithm-view--${props.variant === 'mlp' ? 'mlp' : 'cnn'}`"
    :style="{ '--module-accent': moduleDefinition.accent, '--module-theme': moduleDefinition.theme }"
  >
    <header class="neural-explorer-page__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.intro }}</p>
      </div>
      <RouterLink :to="backPath">
        <span>{{ copy.back }}</span>
        <strong>{{ sectionTitle() }}</strong>
      </RouterLink>
    </header>

    <section class="neural-explorer-page__workbench">
      <MlpPlaygroundCockpit
        v-if="props.variant === 'mlp'"
        :accent="moduleDefinition.accent"
        :section="activeSection"
        mode="explore"
      />
      <CnnExplainerLab
        v-else
        :section="activeSection"
        mode="explore"
      />
    </section>
  </main>
</template>
