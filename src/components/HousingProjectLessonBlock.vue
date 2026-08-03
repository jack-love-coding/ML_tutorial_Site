<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { housingProjectFigures } from '../data/housingProjectLesson'
import type { HousingProjectLessonBlock } from '../types/housingProjectLesson'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import CodeLab from '../modules/math-lab/components/CodeLab.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{ block: HousingProjectLessonBlock }>()
const { locale } = useI18n()
const imageUnavailable = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const figure = computed(() => props.block.kind === 'figure' ? housingProjectFigures[props.block.figureId] : undefined)
const localized = (copy: LocalizedCopy) => copy[activeLocale.value]

watch(() => props.block.id, () => { imageUnavailable.value = false })
</script>

<template>
  <section v-if="block.kind === 'explanation'" class="housing-block housing-block--explanation" :class="`is-${block.tone ?? 'default'}`" :data-block-id="block.id">
    <span class="housing-block__eyebrow">{{ localized(block.eyebrow) }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <MarkdownMathContent :source="localized(block.body)" />
  </section>

  <section v-else-if="block.kind === 'formula'" class="housing-block housing-block--formula" :data-block-id="block.id">
    <span class="housing-block__eyebrow">{{ zh ? '数学连接' : 'Mathematical connection' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <MarkdownMathContent :source="block.formula" />
    <MarkdownMathContent :source="localized(block.explanation)" />
    <dl class="housing-block__variables">
      <div v-for="variable in block.variables" :key="variable.symbol">
        <dt><MarkdownMathContent :source="variable.symbol" /></dt>
        <dd><MarkdownMathContent :source="localized(variable.meaning)" /></dd>
      </div>
    </dl>
  </section>

  <section v-else-if="block.kind === 'code'" class="housing-block housing-block--code" :data-block-id="block.id">
    <CodeLab :title="localized(block.title)" :label="zh ? 'Python 代码' : 'Python code'" :code="block.code" :copy-label="zh ? '复制代码' : 'Copy code'" :copied-label="zh ? '已复制' : 'Copied'" />
    <MarkdownMathContent v-if="block.note" class="housing-block__note" :source="localized(block.note)" />
  </section>

  <section v-else-if="block.kind === 'runtime-output'" class="housing-block housing-block--runtime" :data-block-id="block.id">
    <span class="housing-block__eyebrow">{{ zh ? '运行结果' : 'Runtime output' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <pre><code>{{ block.output }}</code></pre>
    <MarkdownMathContent :source="localized(block.interpretation)" />
  </section>

  <figure v-else-if="block.kind === 'figure' && figure" class="housing-block housing-block--figure" :data-block-id="block.id">
    <header>
      <div><span class="housing-block__eyebrow">{{ zh ? '真实数据图表' : 'Real-data figure' }}</span><h3>{{ localized(figure.title) }}</h3></div>
      <small>Notebook cell · {{ figure.sourceCellId }}</small>
    </header>
    <img v-if="!imageUnavailable" :src="withPublicBase(figure.publicPath)" :alt="localized(figure.alt)" loading="lazy" decoding="async" @error="imageUnavailable = true" />
    <div v-else class="housing-block__figure-fallback" role="img" :aria-label="localized(figure.alt)"><strong>{{ zh ? '图表文字版' : 'Text alternative' }}</strong><p>{{ localized(figure.fallback) }}</p></div>
    <figcaption>{{ localized(figure.caption) }}</figcaption>
    <p class="housing-block__reading-hint"><strong>{{ zh ? '阅读提示：' : 'Reading hint: ' }}</strong>{{ localized(figure.readingHint) }}</p>
    <details><summary>{{ zh ? '查看图表文字版' : 'View text alternative' }}</summary><p>{{ localized(figure.fallback) }}</p></details>
  </figure>

  <section v-else-if="block.kind === 'table'" class="housing-block housing-block--table" :data-block-id="block.id">
    <span class="housing-block__eyebrow">{{ zh ? '数据表' : 'Data table' }}</span>
    <h3>{{ localized(block.title) }}</h3>
    <div class="housing-block__table-scroll" tabindex="0">
      <table><thead><tr><th v-for="(column, index) in block.columns" :key="index" scope="col">{{ localized(column) }}</th></tr></thead>
        <tbody><tr v-for="row in block.rows" :key="row.id"><td v-for="(cell, index) in row.cells" :key="index">{{ localized(cell) }}</td></tr></tbody></table>
    </div>
    <MarkdownMathContent class="housing-block__note" :source="localized(block.caption)" />
  </section>
</template>
