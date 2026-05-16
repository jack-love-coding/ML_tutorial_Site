<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'
import LanguageToggle from './LanguageToggle.vue'

const route = useRoute()
const { t } = useI18n()
const isMenuOpen = ref(false)
const isModuleMenuOpen = ref(false)

const isLearningRoute = computed(() => route.path.startsWith('/learn'))

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function toggleModuleMenu() {
  isModuleMenuOpen.value = !isModuleMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function closeModuleMenu() {
  isModuleMenuOpen.value = false
}

function closeNavigation() {
  closeMenu()
  closeModuleMenu()
}

function isModuleRoute(moduleRoute: string) {
  return route.path === moduleRoute || route.path.startsWith(`${moduleRoute}/`)
}

watch(
  () => route.fullPath,
  () => {
    closeNavigation()
  },
)
</script>

<template>
  <div class="app-shell">
    <header class="site-header" :class="{ 'is-menu-open': isMenuOpen }">
      <router-link to="/" class="site-header__brand" @click="closeNavigation">
        <span class="site-header__mark">ML</span>
        <span>
          <strong>{{ t('nav.brand') }}</strong>
          <small>{{ t('nav.subtitle') }}</small>
        </span>
      </router-link>

      <nav class="site-header__nav site-header__nav--desktop" :aria-label="t('nav.primaryLabel')">
        <router-link class="site-header__link" to="/" @click="closeNavigation">
          {{ t('nav.home') }}
        </router-link>
        <router-link
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/math-lab') }"
          to="/math-lab"
          @click="closeNavigation"
        >
          {{ t('nav.mathLab') }}
        </router-link>
        <router-link
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/data-lab') }"
          to="/data-lab"
          @click="closeNavigation"
        >
          {{ t('nav.dataLab') }}
        </router-link>
        <div
          class="site-header__more"
          :class="{ 'is-open': isModuleMenuOpen, 'is-current': isLearningRoute }"
          @keydown.esc="closeModuleMenu"
        >
          <button
            class="site-header__link site-header__more-button"
            type="button"
            aria-controls="site-module-navigation"
            :aria-expanded="isModuleMenuOpen"
            @click="toggleModuleMenu"
          >
            <span>{{ t('nav.modules') }}</span>
            <span class="site-header__more-caret" aria-hidden="true" />
          </button>
          <div id="site-module-navigation" class="site-header__more-menu">
            <router-link
              v-for="moduleDefinition in moduleOrder"
              :key="moduleDefinition.slug"
              class="site-header__link"
              :class="{ 'is-current': isModuleRoute(moduleDefinition.route) }"
              :to="moduleDefinition.route"
              @click="closeNavigation"
            >
              {{ t(moduleDefinition.titleKey) }}
            </router-link>
          </div>
        </div>
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
        <router-link class="site-header__link" to="/" @click="closeNavigation">
          {{ t('nav.home') }}
        </router-link>
        <router-link
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/math-lab') }"
          to="/math-lab"
          @click="closeNavigation"
        >
          {{ t('nav.mathLab') }}
        </router-link>
        <router-link
          class="site-header__link"
          :class="{ 'is-current': route.path.startsWith('/data-lab') }"
          to="/data-lab"
          @click="closeNavigation"
        >
          {{ t('nav.dataLab') }}
        </router-link>
        <router-link
          v-for="moduleDefinition in moduleOrder"
          :key="moduleDefinition.slug"
          class="site-header__link"
          :class="{ 'is-current': isModuleRoute(moduleDefinition.route) }"
          :to="moduleDefinition.route"
          @click="closeNavigation"
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
