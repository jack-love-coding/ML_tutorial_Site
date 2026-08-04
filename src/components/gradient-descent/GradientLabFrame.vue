<script setup lang="ts">
defineProps<{ title: string; description: string; status?: string }>()
</script>

<template>
  <section class="gradient-lab-frame">
    <header class="gradient-lab-frame__header">
      <div><span>{{ status }}</span><h4>{{ title }}</h4><p>{{ description }}</p></div>
      <slot name="controls" />
    </header>
    <div class="gradient-lab-frame__visual"><slot /></div>
    <div class="gradient-lab-frame__readout"><slot name="readout" /></div>
    <details class="gradient-lab-frame__fallback">
      <summary><slot name="fallback-label">Data table</slot></summary>
      <slot name="fallback" />
    </details>
  </section>
</template>
