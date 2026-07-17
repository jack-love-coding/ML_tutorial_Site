<script setup lang="ts">
import { reactive } from 'vue'
import MarkdownMathContent from './MarkdownMathContent.vue'
import type { AlgorithmCheckpointItem, AppLocale, ModuleSlug } from '../types/ml'

const props = withDefaults(defineProps<{
  moduleSlug: ModuleSlug
  moduleRoute: string
  checkpoints: AlgorithmCheckpointItem[]
  locale: AppLocale
  variant?: 'lesson' | 'course-review'
  chapterRouteBase?: string
}>(), {
  variant: 'lesson',
})

const answers = reactive<Record<string, string>>({})

function revisitRoute(checkpoint: AlgorithmCheckpointItem) {
  if (
    props.moduleSlug === 'linear-regression'
    || props.moduleSlug === 'logistic-regression'
    || props.moduleSlug === 'python-notebook'
  ) {
    return `${props.chapterRouteBase ?? `/learn/${props.moduleSlug}`}/${checkpoint.revisitChapterId}`
  }

  return {
    path: props.moduleRoute,
    hash: `#${checkpoint.revisitChapterId}`,
  }
}
</script>

<template>
  <section class="algorithm-checkpoint">
    <header class="algorithm-checkpoint__header">
      <div>
        <span>
          {{
            variant === 'course-review'
              ? locale === 'zh-CN' ? '课程回顾 · 不计分' : 'Course Review · Not graded'
              : locale === 'zh-CN' ? '理解回顾 · 不计分' : 'Concept review · Not graded'
          }}
        </span>
        <h2>
          {{
            variant === 'course-review'
              ? locale === 'zh-CN' ? '选择后查看参考讲解' : 'Choose an answer to view the explanation'
              : locale === 'zh-CN' ? '用讲解检查自己的理解，不作为课程验收' : 'Use the explanation to review your thinking; this is not course assessment'
          }}
        </h2>
      </div>
      <strong>{{ locale === 'zh-CN' ? '选择后立即显示讲解' : 'Explanation appears after selection' }}</strong>
    </header>

    <div class="algorithm-checkpoint__list">
      <article v-for="checkpoint in checkpoints" :key="checkpoint.id" class="algorithm-checkpoint__item">
        <MarkdownMathContent :source="checkpoint.prompt[locale]" />

        <div class="algorithm-checkpoint__choices">
          <label v-for="choice in checkpoint.choices" :key="choice.id">
            <input v-model="answers[checkpoint.id]" type="radio" :name="checkpoint.id" :value="choice.id" />
            <MarkdownMathContent :source="choice.label[locale]" />
          </label>
        </div>

        <div v-if="answers[checkpoint.id]" class="algorithm-checkpoint__feedback">
          <div>
            <strong>{{ locale === 'zh-CN' ? '参考思路' : 'Reference explanation' }}</strong>
            <router-link :to="revisitRoute(checkpoint)">
              {{ locale === 'zh-CN' ? '回看相关章节' : 'Revisit section' }}
            </router-link>
          </div>
          <MarkdownMathContent :source="checkpoint.explanation[locale]" />
          <ul class="algorithm-checkpoint__misconception-tags" aria-label="Misconception tags">
            <li v-for="tag in checkpoint.misconceptionTags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
