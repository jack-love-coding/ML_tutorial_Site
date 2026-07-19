<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code?: string
  output?: string
  title: string
  label?: string
  copyLabel?: string
  copiedLabel?: string
  outputLabel?: string
}>()

const copied = ref(false)

async function copyCode() {
  if (!props.code) return
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}
</script>

<template>
  <section class="math-code-lab">
    <header>
      <span>{{ label ?? 'Code Lab' }}</span>
      <strong>{{ title }}</strong>
      <button v-if="code" type="button" class="math-code-lab__copy" @click="copyCode">
        {{ copied ? (copiedLabel ?? 'Copied') : (copyLabel ?? 'Copy code') }}
      </button>
    </header>
    <pre><code>{{ code }}</code></pre>
    <div v-if="output" class="math-code-lab__output">
      <span>{{ outputLabel ?? 'Output' }}</span>
      <pre><code>{{ output }}</code></pre>
    </div>
  </section>
</template>
