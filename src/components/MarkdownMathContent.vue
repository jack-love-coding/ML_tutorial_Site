<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdownWithMath } from '../utils/markdownMath'

const props = defineProps<{
  source: string
}>()

const rendered = computed(() => renderMarkdownWithMath(props.source))
</script>

<template>
  <div class="markdown-math" v-html="rendered" />
</template>
