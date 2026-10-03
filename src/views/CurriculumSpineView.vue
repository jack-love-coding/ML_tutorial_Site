<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { teachingUnits, textbookReadings, expandReadingStep, readingLocation, legacySpineUnitIds } from '../curriculum/reading.ts'
import { curriculumMetadataById } from '../curriculum/catalogMetadata.ts'
import type { AppLocale } from '../types/ml.ts'
const route = useRoute()
const { locale } = useI18n()
const lang = computed(() => locale.value as AppLocale)
const activeUnitId = computed(() => {
  const hash = route.hash.slice(1).replace(/^stage-/, '')
  return teachingUnits.some(unit => unit.id === hash) ? hash : legacySpineUnitIds[hash] ?? teachingUnits[0]!.id
})
const statusLabels = { preview: { 'zh-CN': '预览', en: 'Preview' }, pilot: { 'zh-CN': '小班试用', en: 'Pilot' }, published: { 'zh-CN': '已开放', en: 'Published' } }
</script>
<template>
  <div class="curriculum-page textbook-route">
    <header class="curriculum-hero"><div><span class="eyebrow">ML Atlas</span><h1>{{ lang === 'zh-CN' ? '六单元学习路线' : 'A six-unit learning route' }}</h1><p>{{ lang === 'zh-CN' ? '按顺序理解数据与模型。数学在需要时补充，所有资源均可自由查阅。' : 'Understand data and models in order, with mathematics introduced when needed. Every resource remains open.' }}</p><router-link to="/tracks/core-learning-path">{{ lang === 'zh-CN' ? '查看全部阅读章节' : 'View every reading chapter' }}</router-link></div></header>
    <nav class="textbook-unit-tabs" :aria-label="lang === 'zh-CN' ? '教学单元' : 'Teaching units'"><router-link v-for="(unit, index) in teachingUnits" :key="unit.id" :to="{ path: '/spine', hash: `#${unit.id}` }" :aria-current="unit.id === activeUnitId ? 'page' : undefined">{{ index + 1 }} · {{ unit.title[lang] }}</router-link></nav>
    <template v-for="unit in teachingUnits" :key="unit.id">
      <span v-for="alias in Object.keys(legacySpineUnitIds).filter(key => legacySpineUnitIds[key] === unit.id)" :id="`stage-${alias}`" :key="alias" />
      <section v-if="unit.id === activeUnitId" :id="unit.id" class="textbook-unit">
        <header><span class="textbook-status">{{ statusLabels[unit.publicationStatus][lang] }}</span><h2>{{ unit.title[lang] }}</h2></header>
        <dl class="textbook-guide"><div><dt>{{ lang === 'zh-CN' ? '本节问题' : 'Guiding question' }}</dt><dd>{{ unit.question[lang] }}</dd></div><div><dt>{{ lang === 'zh-CN' ? '前置知识' : 'Prerequisites' }}</dt><dd>{{ unit.prerequisites[lang] }}</dd></div><div><dt>{{ lang === 'zh-CN' ? '操作步骤' : 'Steps to explore' }}</dt><dd>{{ unit.instructions[lang] }}</dd></div><div><dt>{{ lang === 'zh-CN' ? '现象解释' : 'What the results mean' }}</dt><dd>{{ unit.explanation[lang] }}</dd></div></dl>
        <ol class="textbook-reading-list"><li v-for="(step, index) in unit.readings" :key="`${step.moduleId}-${index}`"><h3>{{ curriculumMetadataById.get(step.moduleId)?.title[lang] }}</h3><ol><li v-for="lesson in expandReadingStep(step, unit.id)" :key="lesson.lessonId"><router-link :to="readingLocation(lesson)">{{ lesson.title[lang] }}</router-link></li></ol></li></ol>
        <aside v-if="unit.optional"><h3>{{ lang === 'zh-CN' ? '选读与分析示例' : 'Optional reading and worked analysis' }}</h3><ul><li v-for="lesson in unit.optional.flatMap(step => expandReadingStep(step, unit.id))" :key="lesson.lessonId"><router-link :to="{ path: lesson.path, hash: lesson.hash }">{{ lesson.title[lang] }}</router-link></li></ul></aside>
        <p><strong>{{ lang === 'zh-CN' ? '下一步' : 'Next step' }}</strong> · <router-link :to="readingLocation(textbookReadings.find(lesson => lesson.unitId === unit.id)!)">{{ lang === 'zh-CN' ? '开始阅读本单元' : 'Start this unit' }}</router-link></p>
      </section>
    </template>
  </div>
</template>
