<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { gradientDescentLessonFor } from '../data/gradientDescentLesson'
import type { AlgorithmModuleDefinition, AppLocale, StorySection } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import GradientLessonBlock from './gradient-descent/GradientLessonBlock.vue'
import GradientLessonLab from './gradient-descent/GradientLessonLab.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{ moduleDefinition: AlgorithmModuleDefinition; section: StorySection }>()
const { locale, t } = useI18n()
const menuOpen = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const lesson = computed(() => gradientDescentLessonFor(props.section.id))
const currentIndex = computed(() => Math.max(0, props.moduleDefinition.chapters.findIndex((item) => item.id === props.section.id)))
const previous = computed(() => props.moduleDefinition.chapters[currentIndex.value - 1])
const next = computed(() => props.moduleDefinition.chapters[currentIndex.value + 1])
const localized = (copy?: { 'zh-CN': string; en: string }) => copy?.[activeLocale.value] ?? ''
const title = (section: StorySection) => localized(section.title) || t(section.titleKey)
const routeFor = (section: StorySection) => `/learn/gradient-descent/${section.id}`

watch(() => props.section.id, () => { menuOpen.value = false })
</script>

<template>
  <section class="gradient-course" data-testid="gradient-course-page">
    <button
      type="button"
      class="gradient-course__toc-toggle"
      :aria-expanded="menuOpen"
      aria-controls="gradient-course-toc"
      @click="menuOpen = !menuOpen"
    >
      <span>{{ menuOpen ? (zh ? '收起目录' : 'Close contents') : (zh ? '展开目录' : 'Open contents') }}</span>
      <strong>{{ title(section) }}</strong>
    </button>

    <div class="gradient-course__layout">
      <aside id="gradient-course-toc" class="gradient-course__sidebar" :class="{ 'is-open': menuOpen }">
        <span>{{ zh ? '六章学习路线' : 'Six-chapter path' }}</span>
        <nav :aria-label="zh ? '梯度下降课程目录' : 'Gradient descent course contents'">
          <router-link
            v-for="(chapter, index) in moduleDefinition.chapters"
            :key="chapter.id"
            :to="routeFor(chapter)"
            :class="{ 'is-active': chapter.id === section.id }"
            @click="menuOpen = false"
          >
            <small>{{ String(index + 1).padStart(2, '0') }}</small>
            <span>{{ title(chapter) }}</span>
          </router-link>
        </nav>
      </aside>

      <main class="gradient-course__main">
        <article data-testid="gradient-current-chapter" :data-section-id="section.id">
          <header class="gradient-course__header">
            <div><span>{{ zh ? '章节' : 'Chapter' }} {{ currentIndex + 1 }}/{{ moduleDefinition.chapters.length }}</span><strong>{{ Math.round(((currentIndex + 1) / moduleDefinition.chapters.length) * 100) }}%</strong></div>
            <h2>{{ title(section) }}</h2>
            <MarkdownMathContent :source="localized(section.markdown)" />
          </header>

          <div class="gradient-course__flow" data-testid="gradient-lesson-flow">
            <template v-for="block in lesson.blocks" :key="block.id">
              <section v-if="block.kind === 'observation-lab'" class="gradient-course__lab" data-testid="gradient-course-lab">
                <header>
                  <span>{{ zh ? '互动观察台' : 'Interactive observation lab' }}</span>
                  <h3>{{ localized(block.title) }}</h3>
                  <MarkdownMathContent :source="localized(block.prompt)" />
                </header>
                <GradientLessonLab :scene-id="block.sceneId" />
              </section>
              <GradientLessonBlock v-else :block="block" />
            </template>
          </div>

          <section v-if="lesson.references?.length" class="gradient-course__resources">
            <span>{{ zh ? '参考资料' : 'References' }}</span>
            <h3>{{ zh ? '继续深入' : 'Continue learning' }}</h3>
            <p>{{ zh ? '正文为本站重新编写，公开资料集中放在课程末尾，不打断学习流程。' : 'The lesson is original to this site; public references are collected here to keep the reading flow intact.' }}</p>
            <ol><li v-for="item in lesson.references" :key="item.href"><a :href="item.href" target="_blank" rel="noopener noreferrer">{{ localized(item.label) }}</a><small>{{ localized(item.note) }}</small></li></ol>
          </section>

          <section v-if="lesson.downloads?.length" class="gradient-course__resources">
            <span>{{ zh ? '下载并复现' : 'Download and reproduce' }}</span>
            <h3>{{ zh ? '真实数据、Notebook 与动画' : 'Data, notebooks, and animation' }}</h3>
            <div class="gradient-course__downloads"><a v-for="item in lesson.downloads" :key="item.publicPath" :href="withPublicBase(item.publicPath)" download><small>{{ item.kind }}</small><strong>{{ localized(item.label) }}</strong></a></div>
          </section>

          <nav class="gradient-course__pager">
            <router-link v-if="previous" :to="routeFor(previous)"><span>{{ zh ? '上一章' : 'Previous' }}</span><strong>{{ title(previous) }}</strong></router-link><span v-else />
            <router-link v-if="next" :to="routeFor(next)"><span>{{ zh ? '下一章' : 'Next' }}</span><strong>{{ title(next) }}</strong></router-link>
          </nav>
        </article>
      </main>
    </div>
  </section>
</template>
