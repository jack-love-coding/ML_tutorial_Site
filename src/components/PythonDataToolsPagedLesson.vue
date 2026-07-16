<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePythonDataToolsOutputSession } from '../composables/usePythonDataToolsOutputSession.ts'
import { pythonDataToolsRuntimeChapters } from '../data/generated/pythonDataToolsRuntime.generated.ts'
import { pythonDataToolsContract, type PythonDataToolsOutputId } from '../data/pythonNotebookContract.ts'
import type { AppLocale } from '../types/ml.ts'
import type { PythonDataToolsRuntimeChapter } from '../types/pythonDataToolsRuntime.ts'
import {
  pythonDataToolsOutputRegistry,
  type PythonDataToolsJsonOutputViewModel,
} from '../utils/pythonDataToolsOutputs.ts'
import { withPublicBase } from '../utils/publicPath.ts'
import MarkdownMathContent from './MarkdownMathContent.vue'
import PythonDataToolsResultBlock from './PythonDataToolsResultBlock.vue'
import PythonDataToolsTeachingPrompt from './PythonDataToolsTeachingPrompt.vue'

const props = defineProps<{
  chapter: PythonDataToolsRuntimeChapter
  locale: AppLocale
}>()

const mobileMenuOpen = ref(false)
const outputSession = usePythonDataToolsOutputSession()

const copy = computed(() => props.locale === 'zh-CN'
  ? {
      toc: '章节目录',
      mobileToc: '目录',
      current: '当前章节',
      previous: '上一章',
      next: '下一章',
      unavailable: '暂无',
      question: '本章问题',
      code: '课程代码',
      download: '下载完整中文 Notebook',
      downloadDisclosure: 'Notebook 已执行并包含运行结果；请下载后在本地 Python 环境中打开。',
      environment: '查看本地环境依赖',
      reload: '重新加载运行结果',
      reloadHint: '课程正文仍可继续阅读；你可以再尝试读取一次运行结果。',
    }
  : {
      toc: 'Chapter contents',
      mobileToc: 'Contents',
      current: 'Current chapter',
      previous: 'Previous chapter',
      next: 'Next chapter',
      unavailable: 'Unavailable',
      question: 'Chapter question',
      code: 'Course code',
      download: 'Download the complete Chinese Notebook',
      downloadDisclosure: 'The Notebook is executed and contains its runtime results; download it to open in a local Python environment.',
      environment: 'View local environment dependencies',
      reload: 'Reload runtime results',
      reloadHint: 'The lesson remains readable. You can try reading the runtime results one more time.',
    })

const currentIndex = computed(() => {
  const index = pythonDataToolsRuntimeChapters.findIndex(({ id }) => id === props.chapter.id)
  return index >= 0 ? index : 0
})
const previousChapter = computed(() => pythonDataToolsRuntimeChapters[currentIndex.value - 1])
const nextChapter = computed(() => pythonDataToolsRuntimeChapters[currentIndex.value + 1])
const notebookDownloadUrl = computed(() => {
  const manifest = outputSession.manifest.value
  return manifest ? withPublicBase(manifest.notebook.publicPath) : undefined
})
const environmentUrl = computed(() => {
  const manifest = outputSession.manifest.value
  return manifest ? withPublicBase(manifest.environment.path) : undefined
})

function chapterRoute(chapterEntry: PythonDataToolsRuntimeChapter) {
  return `${pythonDataToolsContract.route}/${chapterEntry.id}`
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function fallbackResultsFor(outputId: PythonDataToolsOutputId): readonly PythonDataToolsJsonOutputViewModel[] {
  const entry = pythonDataToolsOutputRegistry.find(({ id }) => id === outputId)
  if (!entry) return []
  return entry.fallbackSourceIds.flatMap((fallbackId) => {
    const state = outputSession.stateFor(fallbackId)
    return state.status === 'ready' && state.data.kind === 'json' ? [state.data] : []
  })
}

watch(() => props.chapter.id, closeMobileMenu)
</script>

<template>
  <section class="python-data-tools-page" data-testid="python-data-tools-page">
    <button
      type="button"
      class="python-data-tools-page__mobile-toggle"
      :aria-expanded="mobileMenuOpen"
      :aria-controls="'python-data-tools-toc'"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <span>{{ copy.mobileToc }}</span>
      <strong>{{ chapter.title[locale] }}</strong>
    </button>

    <div class="python-data-tools-page__grid">
      <aside
        id="python-data-tools-toc"
        class="python-data-tools-page__sidebar"
        :class="{ 'is-open': mobileMenuOpen }"
      >
        <header class="python-data-tools-page__toc-heading">
          <span>{{ copy.current }}</span>
          <strong>{{ copy.toc }}</strong>
        </header>
        <nav class="python-data-tools-page__nav" :aria-label="copy.toc">
          <router-link
            v-for="(chapterEntry, index) in pythonDataToolsRuntimeChapters"
            :key="chapterEntry.id"
            class="python-data-tools-page__nav-item"
            :class="{ 'is-active': chapterEntry.id === chapter.id }"
            :aria-current="chapterEntry.id === chapter.id ? 'page' : undefined"
            :to="chapterRoute(chapterEntry)"
            @click="closeMobileMenu"
          >
            <span class="python-data-tools-page__nav-index">{{ formatIndex(index) }}</span>
            <span>{{ chapterEntry.title[locale] }}</span>
          </router-link>
        </nav>
      </aside>

      <main class="python-data-tools-page__main">
        <article
          class="python-data-tools-page__article"
          data-testid="python-data-tools-current-chapter"
          :data-section-id="chapter.id"
        >
          <header class="python-data-tools-page__header">
            <div class="python-data-tools-page__location">
              {{ locale === 'zh-CN' ? `第 ${currentIndex + 1} / ${pythonDataToolsRuntimeChapters.length} 章` : `Chapter ${currentIndex + 1} / ${pythonDataToolsRuntimeChapters.length}` }}
            </div>
            <h2>{{ chapter.title[locale] }}</h2>
            <div class="python-data-tools-page__question">
              <strong>{{ copy.question }}</strong>
              <p>{{ chapter.question[locale] }}</p>
            </div>

            <a
              v-if="notebookDownloadUrl"
              class="python-data-tools-page__download"
              :href="notebookDownloadUrl"
              download
            >
              <strong>{{ copy.download }}</strong>
              <span>{{ copy.downloadDisclosure }}</span>
            </a>
            <span v-else class="python-data-tools-page__download is-unavailable" aria-disabled="true">
              <strong>{{ copy.download }}</strong>
              <span>{{ copy.downloadDisclosure }}</span>
            </span>
            <a v-if="environmentUrl" class="python-data-tools-page__environment" :href="environmentUrl">
              {{ copy.environment }}
            </a>
          </header>

          <section
            v-if="outputSession.manualReloadAvailable.value"
            class="python-data-tools-page__reload"
            role="status"
          >
            <p>{{ copy.reloadHint }}</p>
            <button type="button" @click="outputSession.reloadRuntimeResults">
              {{ copy.reload }}
            </button>
          </section>

          <div class="python-data-tools-page__blocks">
            <template v-for="block in chapter.blocks" :key="block.id">
              <MarkdownMathContent
                v-if="block.kind === 'markdown'"
                class="python-data-tools-page__prose"
                :source="block.markdown[locale]"
              />

              <section v-else-if="block.kind === 'code'" class="python-data-tools-page__code">
                <header>
                  <span>{{ copy.code }}</span>
                  <code>{{ block.id }}</code>
                </header>
                <pre tabindex="0"><code>{{ block.code }}</code></pre>
              </section>

              <PythonDataToolsResultBlock
                v-else-if="block.kind === 'result-presentation'"
                :presentation="block"
                :state="outputSession.stateFor(block.outputId)"
                :fallback-results="fallbackResultsFor(block.outputId)"
                :locale="locale"
              />

              <PythonDataToolsTeachingPrompt
                v-else-if="block.kind === 'teaching-prompt'"
                :prompt="block"
                :locale="locale"
              />
            </template>
          </div>

          <section v-if="chapter.id === 'analysis-report'" class="python-data-tools-page__final-download">
            <a
              v-if="notebookDownloadUrl"
              class="python-data-tools-page__download"
              :href="notebookDownloadUrl"
              download
            >
              <strong>{{ copy.download }}</strong>
              <span>{{ copy.downloadDisclosure }}</span>
            </a>
            <span v-else class="python-data-tools-page__download is-unavailable" aria-disabled="true">
              <strong>{{ copy.download }}</strong>
              <span>{{ copy.downloadDisclosure }}</span>
            </span>
            <a v-if="environmentUrl" class="python-data-tools-page__environment" :href="environmentUrl">
              {{ copy.environment }}
            </a>
          </section>

          <nav class="python-data-tools-page__pager" :aria-label="copy.toc">
            <router-link
              v-if="previousChapter"
              class="python-data-tools-page__pager-link"
              :to="chapterRoute(previousChapter)"
            >
              <span>{{ copy.previous }}</span>
              <strong>{{ previousChapter.title[locale] }}</strong>
            </router-link>
            <span v-else class="python-data-tools-page__pager-link is-disabled" aria-disabled="true">
              <span>{{ copy.previous }}</span>
              <strong>{{ copy.unavailable }}</strong>
            </span>

            <router-link
              v-if="nextChapter"
              class="python-data-tools-page__pager-link python-data-tools-page__pager-link--next"
              :to="chapterRoute(nextChapter)"
            >
              <span>{{ copy.next }}</span>
              <strong>{{ nextChapter.title[locale] }}</strong>
            </router-link>
            <span v-else class="python-data-tools-page__pager-link python-data-tools-page__pager-link--next is-disabled" aria-disabled="true">
              <span>{{ copy.next }}</span>
              <strong>{{ copy.unavailable }}</strong>
            </span>
          </nav>
        </article>
      </main>
    </div>
  </section>
</template>
