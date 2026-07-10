<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { curriculumNavigationMenus, type SiteNavigationMenuId } from '../../data/navigationMenus.ts'
import type { AppLocale, LocalizedCopy } from '../../types/ml.ts'
import LanguageToggle from '../LanguageToggle.vue'
import SiteNavigation from './SiteNavigation.vue'
import type { RenderedNavigationItem, RenderedNavigationLink } from './types.ts'

const route = useRoute()
const { t, locale } = useI18n()
const isMenuOpen = ref(false)
const openItemId = ref<SiteNavigationMenuId | null>(null)
const mobileMenuTrigger = ref<HTMLButtonElement | null>(null)
const currentLocale = computed(() => locale.value as AppLocale)

function localizedText(copy: LocalizedCopy) {
  return copy[currentLocale.value]
}

function isRouteActive(routePath: string) {
  return route.path === routePath || route.path.startsWith(`${routePath}/`)
}

function isRouteExact(routePath: string) {
  return route.path === routePath
}

function renderLink(link: { id: string; route: string; label: LocalizedCopy }): RenderedNavigationLink {
  return {
    ...link,
    label: localizedText(link.label),
    active: isRouteActive(link.route),
    exact: isRouteExact(link.route),
  }
}

const renderedItems = computed<RenderedNavigationItem[]>(() =>
  curriculumNavigationMenus.map((item) => ({
    id: item.id,
    label: localizedText(item.label),
    route: item.route,
    active: item.activePrefixes.some((prefix) => isRouteActive(prefix)),
    exact: item.route ? isRouteExact(item.route) : false,
    groups: item.groups.map((group) => ({
      id: group.id,
      label: localizedText(group.label),
      items: group.items.map(renderLink),
    })),
  })),
)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  if (!isMenuOpen.value) openItemId.value = null
}

function toggleNavigationItem(itemId: SiteNavigationMenuId) {
  openItemId.value = openItemId.value === itemId ? null : itemId
}

function closeNavigation(restoreMobileFocus = false) {
  isMenuOpen.value = false
  openItemId.value = null

  if (restoreMobileFocus) {
    nextTick(() => mobileMenuTrigger.value?.focus())
  }
}

watch(
  () => route.fullPath,
  () => closeNavigation(isMenuOpen.value),
)
</script>

<template>
  <header class="site-header" :class="{ 'is-menu-open': isMenuOpen }">
    <router-link to="/" class="site-header__brand" @click="closeNavigation">
      <span class="site-header__mark">ML</span>
      <span>
        <strong>{{ t('nav.brand') }}</strong>
        <small>{{ t('nav.subtitle') }}</small>
      </span>
    </router-link>

    <SiteNavigation
      :items="renderedItems"
      :mobile="false"
      :open-item-id="openItemId"
      :aria-label="t('nav.primaryLabel')"
      @toggle="toggleNavigationItem"
      @close="closeNavigation"
      @navigate="closeNavigation"
    >
      <router-link class="site-header__link" to="/" @click="closeNavigation">
        {{ t('nav.home') }}
      </router-link>
    </SiteNavigation>

    <div class="site-header__actions">
      <LanguageToggle />
      <button
        ref="mobileMenuTrigger"
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

    <SiteNavigation
      :items="renderedItems"
      :mobile="true"
      :open-item-id="openItemId"
      :aria-label="t('nav.primaryLabel')"
      @toggle="toggleNavigationItem"
      @close="closeNavigation"
      @navigate="closeNavigation"
    >
      <router-link class="site-header__link" to="/" @click="closeNavigation(true)">
        {{ t('nav.home') }}
      </router-link>
    </SiteNavigation>
  </header>
</template>
