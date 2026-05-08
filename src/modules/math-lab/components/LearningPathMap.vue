<script setup lang="ts">
import type { MathLabLocale, MathLabModule, MathLabModuleId } from '../types/mathLab'

defineProps<{
  modules: MathLabModule[]
  completedModuleIds?: MathLabModuleId[]
  locale: MathLabLocale
}>()
</script>

<template>
  <div class="math-path-map">
    <router-link
      v-for="moduleDefinition in modules"
      :key="moduleDefinition.id"
      class="math-path-node"
      :class="{ 'is-complete': completedModuleIds?.includes(moduleDefinition.id) }"
      :style="{ '--math-accent': moduleDefinition.accent, '--math-theme': moduleDefinition.theme }"
      :to="`/math-lab/modules/${moduleDefinition.id}`"
    >
      <span>{{ `${String(moduleDefinition.order).padStart(2, '0')}` }}</span>
      <strong>{{ moduleDefinition.title[locale] }}</strong>
      <p>{{ moduleDefinition.subtitle[locale] }}</p>
      <small>
        {{
          completedModuleIds?.includes(moduleDefinition.id)
            ? locale === 'zh-CN'
              ? '已完成'
              : 'Completed'
            : locale === 'zh-CN'
              ? '打开章节'
              : 'Open chapter'
        }}
      </small>
    </router-link>
  </div>
</template>
