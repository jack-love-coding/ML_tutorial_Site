<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { readingContext } from './curriculum/reading.ts'
import ReadingNavigation from './components/ReadingNavigation.vue'
import AppShell from './components/AppShell.vue'
import RouteSkeleton from './components/RouteSkeleton.vue'
import { pendingRoutePath, routeNavigating } from './router'
const route = useRoute()
const reading = computed(() => readingContext(route.query.route, route.path, route.hash))
</script>

<template>
  <AppShell>
    <div class="route-stage" :data-reading-context="reading ? reading.unit.id : undefined">
      <ReadingNavigation />
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <ReadingNavigation />

      <transition name="loading-layer">
        <div v-if="routeNavigating" class="route-loading-layer">
          <RouteSkeleton :kind="pendingRoutePath === '/' ? 'home' : 'lesson'" />
        </div>
      </transition>
    </div>
  </AppShell>
</template>
