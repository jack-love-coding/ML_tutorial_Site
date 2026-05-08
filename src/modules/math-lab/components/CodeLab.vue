<script setup lang="ts">
defineProps<{
  code?: string
  title: string
  label?: string
}>()
</script>

<template>
  <section class="math-code-lab">
    <header>
      <span>{{ label ?? 'Code Lab' }}</span>
      <strong>{{ title }}</strong>
    </header>
    <pre><code>{{ code }}</code></pre>
  </section>
</template>
