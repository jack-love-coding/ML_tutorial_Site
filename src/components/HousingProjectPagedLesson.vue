<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { housingProjectLessonFor } from '../data/housingProjectLesson'
import type { AlgorithmModuleDefinition, AppLocale, LocalizedCopy, StorySection } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import HousingProjectLessonBlock from './HousingProjectLessonBlock.vue'
import HousingProjectObservationLab from './HousingProjectObservationLab.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{ moduleDefinition: AlgorithmModuleDefinition; section: StorySection }>()
const { t, locale } = useI18n()
const menuOpen = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const lesson = computed(() => housingProjectLessonFor(props.section.id))
const currentIndex = computed(() => Math.max(0, props.moduleDefinition.chapters.findIndex((item) => item.id === props.section.id)))
const previous = computed(() => props.moduleDefinition.chapters[currentIndex.value - 1])
const next = computed(() => props.moduleDefinition.chapters[currentIndex.value + 1])
const progress = computed(() => Math.round((currentIndex.value + 1) / props.moduleDefinition.chapters.length * 100))
const localized = (copy?: LocalizedCopy) => copy?.[activeLocale.value] ?? ''
const title = (section: StorySection) => localized(section.title) || t(section.titleKey)
const routeFor = (section: StorySection) => `/learn/housing-price-project/${section.id}`
const number = (index: number) => String(index + 1).padStart(2, '0')
const copy = computed(() => zh.value ? {
  toc: '六章项目路线', open: '展开项目目录', close: '收起项目目录', chapter: '章节', current: '正在学习', minutes: '分钟', previous: '上一章', next: '下一章', unavailable: '暂无', lab: '本章观察台', watch: '观察重点', references: '参考资料', referenceNote: '正文为本站重新编写；公开资料、数据归属和许可范围集中列在这里，不打断前面的项目阅读流。', downloads: '下载并复现实验', downloadNote: 'CSV、双语 Notebook、指标、残差和图表来自同一个已执行资产包。',
} : {
  toc: 'Six-chapter project', open: 'Open project contents', close: 'Close project contents', chapter: 'Chapter', current: 'Current', minutes: 'min', previous: 'Previous chapter', next: 'Next chapter', unavailable: 'Unavailable', lab: 'Chapter observation lab', watch: 'What to watch', references: 'References', referenceNote: 'The lesson is original to this site. Public sources, attribution, and license scope are centralized here to keep the project flow uninterrupted.', downloads: 'Download and reproduce', downloadNote: 'The CSV, bilingual notebooks, metrics, residuals, and figures come from one executed asset package.',
})
watch(() => props.section.id, () => { menuOpen.value = false })
</script>

<template>
  <section class="housing-course-page" data-testid="housing-course-page" :style="{ '--housing-accent': moduleDefinition.accent }">
    <button type="button" class="housing-course-page__mobile-toggle" :aria-expanded="menuOpen" aria-controls="housing-course-toc" @click="menuOpen = !menuOpen"><span>{{ menuOpen ? copy.close : copy.open }}</span><strong>{{ title(section) }}</strong></button>
    <div class="housing-course-page__grid">
      <aside id="housing-course-toc" class="housing-course-page__sidebar" :class="{ 'is-open': menuOpen }">
        <header><span>{{ copy.chapter }}</span><strong>{{ copy.toc }}</strong></header>
        <nav :aria-label="copy.toc"><router-link v-for="(item, index) in moduleDefinition.chapters" :key="item.id" :to="routeFor(item)" :class="{ 'is-active': item.id === section.id }" @click="menuOpen = false"><span>{{ number(index) }}</span><span><strong>{{ title(item) }}</strong><small>{{ item.id === section.id ? copy.current : `${item.estimatedMinutes} ${copy.minutes}` }}</small></span></router-link></nav>
      </aside>
      <main>
        <article data-testid="housing-current-chapter" :data-section-id="section.id">
          <header class="housing-course-page__header"><div><span>{{ copy.chapter }} {{ number(currentIndex) }}</span><strong>{{ progress }}%</strong></div><h2>{{ title(section) }}</h2><MarkdownMathContent :source="localized(section.pageSummary)" /></header>
          <div class="housing-course-page__flow" data-testid="housing-lesson-flow">
            <template v-for="block in lesson.blocks" :key="block.id">
              <section v-if="block.kind === 'observation-lab'" class="housing-course-page__lab" data-testid="housing-course-lab" :data-scene-id="block.sceneId"><header><span>{{ copy.lab }}</span><h3>{{ localized(block.title) }}</h3><MarkdownMathContent :source="localized(block.prompt)" /><small>{{ copy.watch }} · Notebook {{ block.sceneId }}</small></header><HousingProjectObservationLab :scene-id="block.sceneId" /></section>
              <HousingProjectLessonBlock v-else :block="block" />
            </template>
          </div>
          <section v-if="lesson.references?.length" class="housing-course-page__references"><span>{{ copy.references }}</span><h3>{{ copy.references }}</h3><p>{{ copy.referenceNote }}</p><ol><li v-for="reference in lesson.references" :key="reference.href"><a :href="reference.href" target="_blank" rel="noopener noreferrer">{{ localized(reference.label) }}</a><small>{{ localized(reference.note) }}</small></li></ol></section>
          <section v-if="lesson.downloads?.length" class="housing-course-page__downloads"><span>{{ copy.downloads }}</span><h3>{{ copy.downloads }}</h3><p>{{ copy.downloadNote }}</p><div><a v-for="download in lesson.downloads" :key="download.publicPath" :href="withPublicBase(download.publicPath)" download><small>{{ download.kind }}</small><strong>{{ localized(download.label) }}</strong></a></div></section>
          <nav class="housing-course-page__pager"><router-link v-if="previous" :to="routeFor(previous)"><span>{{ copy.previous }}</span><strong>{{ title(previous) }}</strong></router-link><span v-else class="is-disabled" aria-hidden="true"><span>{{ copy.previous }}</span><strong>{{ copy.unavailable }}</strong></span><router-link v-if="next" class="is-next" :to="routeFor(next)"><span>{{ copy.next }}</span><strong>{{ title(next) }}</strong></router-link><span v-else class="is-disabled is-next" aria-hidden="true"><span>{{ copy.next }}</span><strong>{{ copy.unavailable }}</strong></span></nav>
        </article>
      </main>
    </div>
  </section>
</template>
