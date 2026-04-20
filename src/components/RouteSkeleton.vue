<script setup lang="ts">
const props = defineProps<{
  kind?: 'home' | 'lesson'
}>()
</script>

<template>
  <section class="route-skeleton" :class="`route-skeleton--${props.kind ?? 'lesson'}`" aria-hidden="true">
    <template v-if="props.kind === 'home'">
      <div class="route-skeleton__hero">
        <div class="route-skeleton__copy">
          <span class="route-skeleton__line route-skeleton__line--eyebrow" />
          <span class="route-skeleton__line route-skeleton__line--title route-skeleton__line--xl" />
          <span class="route-skeleton__line route-skeleton__line--title route-skeleton__line--lg" />
          <span class="route-skeleton__line route-skeleton__line--body" />
          <span class="route-skeleton__line route-skeleton__line--body route-skeleton__line--medium" />
          <div class="route-skeleton__actions">
            <span class="route-skeleton__pill" />
            <span class="route-skeleton__pill route-skeleton__pill--soft" />
          </div>
        </div>
        <div class="route-skeleton__poster">
          <div class="route-skeleton__poster-card" />
          <div class="route-skeleton__poster-grid">
            <span class="route-skeleton__mini" />
            <span class="route-skeleton__mini" />
            <span class="route-skeleton__mini" />
          </div>
        </div>
      </div>
      <div class="route-skeleton__grid">
        <div class="route-skeleton__panel route-skeleton__panel--tall" />
        <div class="route-skeleton__stack">
          <div class="route-skeleton__panel" />
          <div class="route-skeleton__panel" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="route-skeleton__lesson-hero">
        <div class="route-skeleton__copy">
          <span class="route-skeleton__line route-skeleton__line--eyebrow" />
          <span class="route-skeleton__line route-skeleton__line--title route-skeleton__line--lg" />
          <span class="route-skeleton__line route-skeleton__line--body route-skeleton__line--medium" />
        </div>
        <div class="route-skeleton__summary">
          <span class="route-skeleton__line route-skeleton__line--body" />
          <div class="route-skeleton__summary-grid">
            <span class="route-skeleton__mini" />
            <span class="route-skeleton__mini" />
            <span class="route-skeleton__mini" />
          </div>
        </div>
      </div>

      <div class="route-skeleton__lesson-layout">
        <div class="route-skeleton__story">
          <span class="route-skeleton__rail" />
          <div class="route-skeleton__stack">
            <div class="route-skeleton__panel route-skeleton__panel--story" />
            <div class="route-skeleton__panel route-skeleton__panel--story route-skeleton__panel--soft" />
          </div>
        </div>

        <div class="route-skeleton__stack">
          <div class="route-skeleton__panel route-skeleton__panel--viz" />
          <div class="route-skeleton__panel route-skeleton__panel--dashboard" />
        </div>
      </div>
    </template>
  </section>
</template>
