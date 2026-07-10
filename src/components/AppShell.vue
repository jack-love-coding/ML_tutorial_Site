<script setup lang="ts">
import SiteHeader from './navigation/SiteHeader.vue'
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <main class="site-main"><slot /></main>
  </div>
</template>
