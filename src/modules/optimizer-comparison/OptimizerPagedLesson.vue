<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AlgorithmCheckpointQuiz from '../../components/AlgorithmCheckpointQuiz.vue'
import ChapteredMediaPlayer from '../../components/ChapteredMediaPlayer.vue'
import MarkdownMathContent from '../../components/MarkdownMathContent.vue'
import type { AlgorithmModuleDefinition, AppLocale, StorySection } from '../../types/ml'
import { withPublicBase } from '../../utils/publicPath'
import { optimizerCourseChapters, optimizerCourseDownloads, optimizerCourseReferences } from './data/course'

const TrainingLedgerScene = defineAsyncComponent(() => import('./labs/TrainingLedgerScene.vue'))
const BatchNoiseScene = defineAsyncComponent(() => import('./labs/BatchNoiseScene.vue'))
const MomentumRmspropScene = defineAsyncComponent(() => import('./labs/MomentumRmspropScene.vue'))
const AdamDecayScene = defineAsyncComponent(() => import('./labs/AdamDecayScene.vue'))
const ScheduleCadenceScene = defineAsyncComponent(() => import('./labs/ScheduleCadenceScene.vue'))
const CurveDiagnosisScene = defineAsyncComponent(() => import('./labs/CurveDiagnosisScene.vue'))

const props = defineProps<{ moduleDefinition: AlgorithmModuleDefinition; section: StorySection }>()
const { locale } = useI18n()
const menuOpen = ref(false)
const copied = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const chapter = computed(() => optimizerCourseChapters.find((item) => item.id === props.section.id) ?? optimizerCourseChapters[0]!)
const index = computed(() => optimizerCourseChapters.findIndex((item) => item.id === chapter.value.id))
const previous = computed(() => optimizerCourseChapters[index.value - 1])
const next = computed(() => optimizerCourseChapters[index.value + 1])
const localized = (value: { 'zh-CN': string; en: string }) => value[activeLocale.value]
const routeFor = (id: string) => `/learn/optimizer-comparison/${id}`
const labs = { 'training-loop': TrainingLedgerScene, 'sgd-batch-noise': BatchNoiseScene, 'momentum-rmsprop': MomentumRmspropScene, 'adam-weight-decay': AdamDecayScene, 'learning-rate-schedules': ScheduleCadenceScene, 'curve-diagnosis': CurveDiagnosisScene } as const
const media = {
  sgd: { assetPath: '/manim/optimizer-comparison/sgd-state.mp4', posterPath: '/manim/optimizer-comparison/sgd-state.svg', title: { 'zh-CN': 'SGD 状态动画', en: 'SGD state animation' } },
  momentum: { assetPath: '/manim/optimizer-comparison/momentum-state.mp4', posterPath: '/manim/optimizer-comparison/momentum-state.svg', title: { 'zh-CN': 'Momentum 状态动画', en: 'Momentum state animation' } },
  rmsprop: { assetPath: '/manim/optimizer-comparison/rmsprop-state.mp4', posterPath: '/manim/optimizer-comparison/rmsprop-state.svg', title: { 'zh-CN': 'RMSProp 状态动画', en: 'RMSProp state animation' } },
  adam: { assetPath: '/manim/optimizer-comparison/adam-state.mp4', posterPath: '/manim/optimizer-comparison/adam-state.svg', title: { 'zh-CN': 'Adam 状态动画', en: 'Adam state animation' } },
} as const
const mediaConfigs = computed(() => (chapter.value.media ?? []).map((kind) => media[kind]))

function copyCode(value?: string) {
  if (!value || !navigator.clipboard) return
  void navigator.clipboard.writeText(value).then(() => { copied.value = true; window.setTimeout(() => { copied.value = false }, 1600) })
}
watch(() => props.section.id, () => { menuOpen.value = false; copied.value = false })
</script>

<template>
  <section class="optimizer-course" data-testid="optimizer-course-page">
    <button type="button" class="optimizer-course__toc-toggle" :aria-expanded="menuOpen" aria-controls="optimizer-course-toc" @click="menuOpen = !menuOpen"><span>{{ menuOpen ? (zh ? '收起目录' : 'Close contents') : (zh ? '展开目录' : 'Open contents') }}</span><strong>{{ localized(chapter.title) }}</strong></button>
    <div class="optimizer-course__layout">
      <aside id="optimizer-course-toc" class="optimizer-course__sidebar" :class="{ 'is-open': menuOpen }"><span>{{ zh ? '六章优化器路线' : 'Six-chapter optimizer path' }}</span><nav :aria-label="zh ? '优化器课程目录' : 'Optimizer course contents'"><router-link v-for="(item, chapterIndex) in optimizerCourseChapters" :key="item.id" :to="routeFor(item.id)" :class="{ 'is-active': item.id === chapter.id }" @click="menuOpen = false"><small>{{ String(chapterIndex + 1).padStart(2, '0') }}</small><span>{{ localized(item.title) }}</span></router-link></nav></aside>
      <main class="optimizer-course__main"><article data-testid="optimizer-current-chapter" :data-section-id="chapter.id"><header class="optimizer-course__header"><div><span>{{ zh ? '章节' : 'Chapter' }} {{ index + 1 }}/6</span><strong>{{ Math.round(((index + 1) / 6) * 100) }}%</strong></div><h2>{{ localized(chapter.title) }}</h2><p>{{ zh ? '从更新顺序走到受控迁移：每一步都可以暂停、预测和复查。' : 'From update order to controlled transfer: pause, predict, and review every step.' }}</p></header>
        <div class="optimizer-course__flow" data-testid="optimizer-lesson-flow"><template v-for="item in chapter.blocks" :key="item.kind"><section v-if="item.kind === 'interaction'" class="optimizer-course__lab"><header><span>{{ localized(item.title) }}</span><MarkdownMathContent :source="localized(item.body)" /></header><component :is="labs[chapter.id]" /></section><section v-else-if="item.kind === 'animation' && mediaConfigs.length" class="optimizer-course__block optimizer-course__block--media"><header><span>{{ localized(item.title) }}</span><MarkdownMathContent :source="localized(item.body)" /></header><ChapteredMediaPlayer v-for="mediaConfig in mediaConfigs" :key="mediaConfig.assetPath" v-bind="mediaConfig" /></section><section v-else-if="item.kind === 'numpy-code'" class="optimizer-course__block optimizer-course__block--code"><header><div><span>{{ localized(item.title) }}</span><MarkdownMathContent :source="localized(item.body)" /></div><button type="button" :aria-label="zh ? '复制 NumPy 代码' : 'Copy NumPy code'" @click="copyCode(item.code)">{{ copied ? (zh ? '已复制' : 'Copied') : (zh ? '复制代码' : 'Copy code') }}</button></header><pre><code>{{ item.code }}</code></pre></section><section v-else class="optimizer-course__block" :class="`optimizer-course__block--${item.kind}`"><span>{{ localized(item.title) }}</span><MarkdownMathContent :source="localized(item.body)" /></section></template></div>
        <section v-if="chapter.id === 'curve-diagnosis'" class="optimizer-course__resources"><span>{{ zh ? '继续深入' : 'Continue learning' }}</span><h3>{{ zh ? '参考与复现下载' : 'References and reproducible downloads' }}</h3><ol><li v-for="item in optimizerCourseReferences" :key="item.href"><a :href="item.href" target="_blank" rel="noopener noreferrer">{{ localized(item.label) }}</a></li></ol><div class="optimizer-course__downloads"><a v-for="item in optimizerCourseDownloads" :key="item.path" :href="withPublicBase(item.path)" download><small>{{ item.kind }}</small><strong>{{ localized(item.label) }}</strong></a></div></section>
        <AlgorithmCheckpointQuiz v-if="chapter.id === 'curve-diagnosis'" module-slug="optimizer-comparison" module-route="/learn/optimizer-comparison" :checkpoints="moduleDefinition.checkpoints" :locale="activeLocale" />
        <nav class="optimizer-course__pager"><router-link v-if="previous" :to="routeFor(previous.id)"><span>{{ zh ? '上一章' : 'Previous' }}</span><strong>{{ localized(previous.title) }}</strong></router-link><span v-else /><router-link v-if="next" :to="routeFor(next.id)"><span>{{ zh ? '下一章' : 'Next' }}</span><strong>{{ localized(next.title) }}</strong></router-link><router-link v-else to="/learn/cnn-visualization/channels-feature-maps"><span>{{ zh ? '下一步' : 'Next' }}</span><strong>{{ zh ? '进入 CNN 形状与参数' : 'Enter CNN shapes and parameters' }}</strong></router-link></nav>
      </article></main>
    </div>
  </section>
</template>
