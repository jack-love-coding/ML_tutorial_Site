<script setup lang="ts">
const props = defineProps<{
  accent?: string
  sectionId?: string
  variant?: 'standard' | 'cockpit'
}>()
</script>

<template>
  <section
    class="lesson-workbench"
    :class="[
      props.sectionId ? `lesson-workbench--${props.sectionId}` : '',
      `lesson-workbench--${props.variant ?? 'standard'}`,
    ]"
    :style="{ '--lesson-accent': props.accent ?? '#4d63ff' }"
  >
    <div v-if="$slots.task" class="lesson-workbench__task">
      <slot name="task" />
    </div>

    <div class="lesson-workbench__grid">
      <div class="lesson-workbench__visual">
        <slot name="visual" />
      </div>

      <aside class="lesson-workbench__side">
        <div v-if="$slots.controls" class="lesson-workbench__controls">
          <slot name="controls" />
        </div>

        <div v-if="$slots.metrics" class="lesson-workbench__metrics">
          <slot name="metrics" />
        </div>
      </aside>
    </div>

    <div v-if="$slots.presets || $slots.timeline" class="lesson-workbench__lower">
      <div v-if="$slots.presets" class="lesson-workbench__presets">
        <slot name="presets" />
      </div>

      <div v-if="$slots.timeline" class="lesson-workbench__timeline">
        <slot name="timeline" />
      </div>
    </div>
  </section>
</template>
