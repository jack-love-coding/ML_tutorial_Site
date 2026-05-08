<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'
import LanguageToggle from './LanguageToggle.vue'

const route = useRoute()
const { t } = useI18n()
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <router-link to="/" class="site-header__brand">
        <span class="site-header__mark">ML</span>
        <span>
          <strong>{{ t('nav.brand') }}</strong>
          <small>{{ t('nav.subtitle') }}</small>
        </span>
      </router-link>

      <nav class="site-header__nav">
        <router-link class="site-header__link" to="/">
          {{ t('nav.home') }}
        </router-link>
        <router-link
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/math-lab') }"
          to="/math-lab"
        >
          {{ t('nav.mathLab') }}
        </router-link>
        <router-link
          v-for="moduleDefinition in moduleOrder"
          :key="moduleDefinition.slug"
          class="site-header__link"
          :class="{ 'is-current': route.path === moduleDefinition.route }"
          :to="moduleDefinition.route"
        >
          {{ t(moduleDefinition.titleKey) }}
        </router-link>
      </nav>

      <LanguageToggle />
    </header>

    <main class="site-main">
      <slot />
    </main>
  </div>
</template>
