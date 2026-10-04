<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { readingContext, readingLocation } from '../curriculum/reading.ts'
import type { AppLocale } from '../types/ml.ts'
const route = useRoute()
const { locale } = useI18n()
const lang = computed(() => locale.value as AppLocale)
const context = computed(() => readingContext(route.query.route, route.path, route.hash))
</script>
<template>
  <nav v-if="context" class="reading-navigation" aria-label="Reading sequence" data-testid="reading-navigation">
    <router-link :to="{ path: '/spine', hash: `#${context.unit.id}` }">{{ context.unit.title[lang] }}</router-link>
    <span>{{ context.lesson.title[lang] }}</span>
    <div class="reading-navigation__links">
      <router-link v-if="context.previous" :to="readingLocation(context.previous)" data-testid="reading-previous">← {{ lang === 'zh-CN' ? '上一节' : 'Previous' }} · {{ context.previous.title[lang] }}</router-link>
      <router-link v-if="context.next" :to="readingLocation(context.next)" data-testid="reading-next">{{ lang === 'zh-CN' ? '下一节' : 'Next' }} · {{ context.next.title[lang] }} →</router-link>
      <router-link v-else to="/spine">{{ lang === 'zh-CN' ? '回到学习路线' : 'Return to the learning route' }}</router-link>
    </div>
  </nav>
</template>
