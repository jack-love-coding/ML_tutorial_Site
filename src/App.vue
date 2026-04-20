<script setup lang="ts">
import AppShell from './components/AppShell.vue'
import RouteSkeleton from './components/RouteSkeleton.vue'
import { pendingRoutePath, routeNavigating } from './router'
</script>

<template>
  <AppShell>
    <div class="route-stage">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <transition name="loading-layer">
        <div v-if="routeNavigating" class="route-loading-layer">
          <RouteSkeleton :kind="pendingRoutePath === '/' ? 'home' : 'lesson'" />
        </div>
      </transition>
    </div>
  </AppShell>
</template>
