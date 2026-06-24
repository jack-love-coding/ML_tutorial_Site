<script setup lang="ts">
export interface LabReadoutItem {
  id: string
  label: string
  value: string | number
  tone?: 'default' | 'good' | 'warn'
}

defineProps<{
  items: LabReadoutItem[]
}>()
</script>

<template>
  <div class="math-readout-grid lab-readout">
    <article
      v-for="item in items"
      :key="item.id"
      :class="[`lab-readout__item--${item.tone ?? 'default'}`]"
    >
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
    </article>
  </div>
</template>

<style scoped>
.lab-readout__item--good strong {
  color: #0f7a5b;
}

.lab-readout__item--warn strong {
  color: #9a4f00;
}
</style>
