<script setup lang="ts">
import { nextTick } from 'vue'
import type { SiteNavigationMenuId } from '../../data/navigationMenus.ts'
import { getNavigationAriaCurrent, type RenderedNavigationItem } from './types.ts'

const props = defineProps<{
  items: RenderedNavigationItem[]
  mobile: boolean
  openItemId: SiteNavigationMenuId | null
}>()

const emit = defineEmits<{
  toggle: [itemId: SiteNavigationMenuId]
  close: [mobile: boolean]
  navigate: [mobile: boolean]
}>()

const toggleButtons = new Map<SiteNavigationMenuId, HTMLButtonElement>()

function controlsId(itemId: SiteNavigationMenuId) {
  return `site-${itemId}-navigation${props.mobile ? '-mobile' : ''}`
}

function setToggleButton(itemId: SiteNavigationMenuId, element: unknown) {
  if (element instanceof HTMLButtonElement) toggleButtons.set(itemId, element)
  else toggleButtons.delete(itemId)
}

function closeAndRestoreFocus() {
  const openItemId = props.openItemId
  emit('close', props.mobile)

  if (!props.mobile && openItemId) {
    nextTick(() => toggleButtons.get(openItemId)?.focus())
  }
}

function navigateAndRestoreFocus() {
  const openItemId = props.openItemId
  emit('navigate', props.mobile)

  if (!props.mobile && openItemId) {
    nextTick(() => toggleButtons.get(openItemId)?.focus())
  }
}
</script>

<template>
  <nav
    :id="props.mobile ? 'site-mobile-navigation' : undefined"
    class="site-header__nav"
    :class="props.mobile ? 'site-header__nav--mobile' : 'site-header__nav--desktop'"
    @keydown.esc.stop="closeAndRestoreFocus"
  >
    <slot />

    <template v-for="item in props.items" :key="`${item.id}-${props.mobile ? 'mobile' : 'desktop'}`">
      <router-link
        v-if="item.route"
        class="site-header__link"
        :class="{
          'is-current': item.active,
          'site-header__link--secondary': item.id === 'progress',
        }"
        :to="item.route"
        :aria-current="getNavigationAriaCurrent(item.exact, item.active)"
        @click="navigateAndRestoreFocus"
      >
        {{ item.label }}
      </router-link>

      <div
        v-else
        :class="[
          props.mobile ? 'site-header__mobile-menu' : 'site-header__more',
          { 'is-open': props.openItemId === item.id, 'is-current': item.active },
        ]"
      >
        <button
          :ref="(element) => setToggleButton(item.id, element)"
          type="button"
          class="site-header__link"
          :class="props.mobile ? 'site-header__mobile-toggle' : 'site-header__more-button'"
          :aria-controls="controlsId(item.id)"
          :aria-expanded="props.openItemId === item.id"
          :aria-current="getNavigationAriaCurrent(item.exact, item.active)"
          @click="emit('toggle', item.id)"
        >
          <span>{{ item.label }}</span>
          <span class="site-header__more-caret" aria-hidden="true" />
        </button>

        <div
          :id="controlsId(item.id)"
          :class="[
            props.mobile ? 'site-header__mobile-panel' : 'site-header__more-menu',
            !props.mobile && `site-header__more-menu--${item.id}`,
            { 'site-header__more-menu--wide': !props.mobile && item.groups.length > 3 },
          ]"
        >
          <div v-if="!props.mobile" class="site-header__menu-sections">
            <section v-for="group in item.groups" :key="group.id" class="site-header__menu-group">
              <span class="site-header__menu-heading">{{ group.label }}</span>
              <div class="site-header__menu-items">
                <router-link
                  v-for="link in group.items"
                  :key="link.id"
                  class="site-header__link site-header__menu-link"
                  :class="{ 'is-current': link.active }"
                  :to="link.route"
                  :aria-current="getNavigationAriaCurrent(link.exact, link.active)"
                  @click="navigateAndRestoreFocus"
                >
                  <span class="site-header__menu-link-label">{{ link.label }}</span>
                </router-link>
              </div>
            </section>
          </div>

          <section
            v-for="group in props.mobile ? item.groups : []"
            :key="group.id"
            class="site-header__mobile-section"
          >
            <span class="site-header__mobile-heading">{{ group.label }}</span>
            <div class="site-header__mobile-items">
              <router-link
                v-for="link in group.items"
                :key="link.id"
                class="site-header__link site-header__mobile-link"
                :class="{ 'is-current': link.active }"
                :to="link.route"
                :aria-current="getNavigationAriaCurrent(link.exact, link.active)"
                @click="navigateAndRestoreFocus"
              >
                {{ link.label }}
              </router-link>
            </div>
          </section>
        </div>
      </div>
    </template>
  </nav>
</template>
