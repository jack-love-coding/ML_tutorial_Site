<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  curriculumNavigationMenus,
  type NavigationGroup,
  type NavigationLink,
  type SiteNavigationMenuId,
} from '../data/navigationMenus'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import LanguageToggle from './LanguageToggle.vue'

const route = useRoute()
const { t, locale } = useI18n()
const isMenuOpen = ref(false)
const openNavigationMenuId = ref<SiteNavigationMenuId | null>(null)

const currentLocale = computed(() => locale.value as AppLocale)

interface RenderedNavigationItem {
  id: string
  route: string
  label: string
}

interface RenderedNavigationGroup {
  id: string
  label: string
  items: RenderedNavigationItem[]
}

interface SiteNavigationMenu {
  id: SiteNavigationMenuId
  label: string
  controlsId: string
  active: boolean
  overviewLink?: RenderedNavigationItem
  utilityLinks: RenderedNavigationItem[]
  groups: RenderedNavigationGroup[]
}

function localizedText(copy: LocalizedCopy) {
  return copy[currentLocale.value]
}

function renderNavigationLink(link: NavigationLink): RenderedNavigationItem {
  return {
    id: link.id,
    route: link.route,
    label: localizedText(link.label),
  }
}

function renderNavigationGroups(groups: NavigationGroup[]): RenderedNavigationGroup[] {
  return groups.map((group) => ({
    id: group.id,
    label: localizedText(group.label),
    items: group.items.map(renderNavigationLink),
  }))
}

function isMenuActive(activePrefixes: string[]) {
  return activePrefixes.some((prefix) => route.path === prefix || route.path.startsWith(`${prefix}/`))
}

const navigationMenus = computed<SiteNavigationMenu[]>(() =>
  curriculumNavigationMenus.map((menuDefinition) => ({
    id: menuDefinition.id,
    label: localizedText(menuDefinition.label),
    controlsId: `site-${menuDefinition.id}-navigation`,
    active: isMenuActive(menuDefinition.activePrefixes),
    overviewLink: menuDefinition.overviewLink
      ? renderNavigationLink(menuDefinition.overviewLink)
      : undefined,
    utilityLinks: menuDefinition.utilityLinks.map(renderNavigationLink),
    groups: renderNavigationGroups(menuDefinition.groups),
  })),
)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value

  if (!isMenuOpen.value) {
    closeNavigationMenus()
  }
}

function toggleNavigationMenu(menuId: SiteNavigationMenuId) {
  openNavigationMenuId.value = openNavigationMenuId.value === menuId ? null : menuId
}

function closeMenu() {
  isMenuOpen.value = false
}

function closeNavigationMenus() {
  openNavigationMenuId.value = null
}

function closeNavigation() {
  closeMenu()
  closeNavigationMenus()
}

function isNavigationMenuOpen(menuId: SiteNavigationMenuId) {
  return openNavigationMenuId.value === menuId
}

function isRouteActive(routePath: string) {
  return route.path === routePath || route.path.startsWith(`${routePath}/`)
}

function isExactRoute(routePath: string) {
  return route.path === routePath
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
        <div
          v-for="menuDefinition in navigationMenus"
          :key="menuDefinition.id"
          class="site-header__more"
          :class="{
            'is-open': isNavigationMenuOpen(menuDefinition.id),
            'is-current': menuDefinition.active,
          }"
          @keydown.esc="closeNavigationMenus"
        >
          <button
            class="site-header__link site-header__more-button"
            type="button"
            :aria-controls="menuDefinition.controlsId"
            :aria-expanded="isNavigationMenuOpen(menuDefinition.id)"
            @click="toggleNavigationMenu(menuDefinition.id)"
          >
            <span>{{ menuDefinition.label }}</span>
            <span class="site-header__more-caret" aria-hidden="true" />
          </button>
          <div
            :id="menuDefinition.controlsId"
            class="site-header__more-menu"
            :class="[
              `site-header__more-menu--${menuDefinition.id}`,
              { 'site-header__more-menu--wide': menuDefinition.groups.length > 3 },
            ]"
          >
            <router-link
              v-if="menuDefinition.overviewLink"
              class="site-header__link site-header__menu-overview"
              active-class=""
              exact-active-class=""
              :class="{ 'is-current': isExactRoute(menuDefinition.overviewLink.route) }"
              :to="menuDefinition.overviewLink.route"
              @click="closeNavigation"
            >
              {{ menuDefinition.overviewLink.label }}
            </router-link>
            <router-link
              v-for="utilityLink in menuDefinition.utilityLinks"
              :key="utilityLink.id"
              class="site-header__link site-header__menu-overview"
              :class="{ 'is-current': isRouteActive(utilityLink.route) }"
              :to="utilityLink.route"
              @click="closeNavigation"
            >
              {{ utilityLink.label }}
            </router-link>
            <div class="site-header__menu-sections">
              <section
                v-for="navigationGroup in menuDefinition.groups"
                :key="navigationGroup.id"
                class="site-header__menu-group"
              >
                <span class="site-header__menu-heading">{{ navigationGroup.label }}</span>
                <div class="site-header__menu-items">
                  <router-link
                    v-for="navigationItem in navigationGroup.items"
                    :key="navigationItem.id"
                    class="site-header__link site-header__menu-link"
                    :class="{ 'is-current': isRouteActive(navigationItem.route) }"
                    :to="navigationItem.route"
                    @click="closeNavigation"
                  >
                    <span class="site-header__menu-link-label">{{ navigationItem.label }}</span>
                  </router-link>
                </div>
              </section>
            </div>
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
        <div
          v-for="menuDefinition in navigationMenus"
          :key="`${menuDefinition.id}-mobile`"
          class="site-header__mobile-menu"
          :class="{
            'is-open': isNavigationMenuOpen(menuDefinition.id),
            'is-current': menuDefinition.active,
          }"
        >
          <button
            class="site-header__link site-header__mobile-toggle"
            :class="{ 'is-current': menuDefinition.active }"
            type="button"
            :aria-controls="`${menuDefinition.controlsId}-mobile`"
            :aria-expanded="isNavigationMenuOpen(menuDefinition.id)"
            @click="toggleNavigationMenu(menuDefinition.id)"
          >
            <span>{{ menuDefinition.label }}</span>
            <span class="site-header__more-caret" aria-hidden="true" />
          </button>
          <div :id="`${menuDefinition.controlsId}-mobile`" class="site-header__mobile-panel">
            <router-link
              v-if="menuDefinition.overviewLink"
              class="site-header__link site-header__mobile-link"
              active-class=""
              exact-active-class=""
              :class="{ 'is-current': isExactRoute(menuDefinition.overviewLink.route) }"
              :to="menuDefinition.overviewLink.route"
              @click="closeNavigation"
            >
              {{ menuDefinition.overviewLink.label }}
            </router-link>
            <router-link
              v-for="utilityLink in menuDefinition.utilityLinks"
              :key="utilityLink.id"
              class="site-header__link site-header__mobile-link"
              :class="{ 'is-current': isRouteActive(utilityLink.route) }"
              :to="utilityLink.route"
              @click="closeNavigation"
            >
              {{ utilityLink.label }}
            </router-link>
            <section
              v-for="navigationGroup in menuDefinition.groups"
              :key="navigationGroup.id"
              class="site-header__mobile-section"
            >
              <span class="site-header__mobile-heading">{{ navigationGroup.label }}</span>
              <div class="site-header__mobile-items">
                <router-link
                  v-for="navigationItem in navigationGroup.items"
                  :key="navigationItem.id"
                  class="site-header__link site-header__mobile-link"
                  :class="{ 'is-current': isRouteActive(navigationItem.route) }"
                  :to="navigationItem.route"
                  @click="closeNavigation"
                >
                  {{ navigationItem.label }}
                </router-link>
              </div>
            </section>
          </div>
        </div>
      </nav>
    </header>

    <main class="site-main">
      <slot />
    </main>
  </div>
</template>
