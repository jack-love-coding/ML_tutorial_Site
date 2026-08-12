<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../types/ml'
import type { GradientDescentLessonBlock } from '../../types/gradientDescentLesson'
import CodeLab from '../../modules/math-lab/components/CodeLab.vue'
import ChapteredMediaPlayer from '../ChapteredMediaPlayer.vue'
import MarkdownMathContent from '../MarkdownMathContent.vue'

const props = defineProps<{ block: Exclude<GradientDescentLessonBlock, { kind: 'observation-lab' }> }>()
const { locale } = useI18n()
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const localized = (copy: { 'zh-CN': string; en: string }) => copy[activeLocale.value]

</script>

<template>
  <section
    v-if="block.kind === 'explanation'"
    class="gradient-lesson-block gradient-lesson-block--explanation"
    :class="`is-${block.role}`"
    :data-block-id="block.id"
  >
    <span>{{ localized(block.title) }}</span>
    <MarkdownMathContent :source="localized(block.body)" />
  </section>

  <section
    v-else-if="block.kind === 'formula'"
    class="gradient-lesson-block gradient-lesson-block--formula"
    :data-block-id="block.id"
  >
    <span>{{ zh ? '数学连接' : 'Mathematical connection' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <MarkdownMathContent :source="localized(block.formula)" />
    <MarkdownMathContent :source="localized(block.explanation)" />
  </section>

  <section
    v-else-if="block.kind === 'code'"
    class="gradient-lesson-block gradient-lesson-block--code"
    :data-block-id="block.id"
  >
    <CodeLab
      :title="localized(block.title)"
      :label="zh ? 'Python 代码' : 'Python code'"
      :code="block.code"
      :copy-label="zh ? '复制代码' : 'Copy code'"
      :copied-label="zh ? '已复制' : 'Copied'"
    />
    <MarkdownMathContent :source="localized(block.note)" />
  </section>

  <section
    v-else-if="block.kind === 'runtime-output'"
    class="gradient-lesson-block gradient-lesson-block--runtime"
    :data-block-id="block.id"
  >
    <span>{{ zh ? '真实运行输出' : 'Runtime output' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <pre><code>{{ block.output }}</code></pre>
    <MarkdownMathContent :source="localized(block.interpretation)" />
  </section>

  <figure
    v-else-if="block.kind === 'media'"
    class="gradient-lesson-block gradient-lesson-block--media"
    :data-block-id="block.id"
  >
    <div class="gradient-lesson-block__media-heading">
      <div>
        <span>{{ zh ? '分段动画' : 'Chaptered animation' }}</span>
        <h3>{{ localized(block.title) }}</h3>
      </div>
      <small>84 s · 1080p · 30 fps</small>
    </div>
    <ChapteredMediaPlayer
      :asset-path="block.assetPath"
      :poster-path="block.posterPath"
      :title="block.title"
      :transcript="block.transcript"
      :chapter-markers="block.chapterMarkers"
    />
  </figure>
</template>
