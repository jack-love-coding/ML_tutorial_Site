<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'
import LanguageToggle from './LanguageToggle.vue'

const route = useRoute()
const { t } = useI18n()
const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)
</script>

<template>
  <div class="app-shell">
    <header class="site-header" :class="{ 'is-menu-open': isMenuOpen }">
      <router-link to="/" class="site-header__brand" @click="closeMenu">
        <span class="site-header__mark">ML</span>
        <span>
          <strong>{{ t('nav.brand') }}</strong>
          <small>{{ t('nav.subtitle') }}</small>
        </span>
      </router-link>

      <nav class="site-header__nav site-header__nav--desktop" :aria-label="t('nav.primaryLabel')">
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
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/data-lab') }"
          to="/data-lab"
        >
          {{ t('nav.dataLab') }}
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

      <div class="site-header__actions">
        <LanguageToggle />
        <button
          class="site-header__menu"
          type="button"
          :aria-expanded="isMenuOpen"
          aria-controls="site-mobile-navigation"
          :aria-label="isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          @click="toggleMenu"
        >
          <span class="site-header__menu-icon" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="site-mobile-navigation"
        class="site-header__nav site-header__nav--mobile"
        :aria-label="t('nav.primaryLabel')"
      >
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
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/data-lab') }"
          to="/data-lab"
        >
          {{ t('nav.dataLab') }}
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
    </header>

    <main class="site-main">
      <slot />
    </main>
  </div>
</template>
