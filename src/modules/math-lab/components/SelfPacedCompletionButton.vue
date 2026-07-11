<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MathLabLocale } from '../types/mathLab.ts'

const props = defineProps<{ locale: MathLabLocale, completed: boolean, reviewVersion?: string }>()
const emit = defineEmits<{ review: [] }>()
const reviewed = ref(props.completed)
watch(() => props.completed, (completed) => { reviewed.value = completed })
const text = computed(() => props.locale === 'zh-CN' ? {
  action: '标记已学习', reviewed: '已在本地标记学习',
  note: props.reviewVersion
    ? `这是路线复核版本 ${props.reviewVersion} 的本地导航状态，不是评分或正式验收。`
    : '这是自定进度的本地导航状态，不是评分或正式验收。',
} : {
  action: 'Mark as reviewed', reviewed: 'Reviewed locally',
  note: props.reviewVersion
    ? `This is local navigation state for reviewed version ${props.reviewVersion}, not grading or formal acceptance.`
    : 'This is a self-paced local navigation state, not a graded or formal acceptance.',
})

function markReviewed() {
  reviewed.value = true
  emit('review')
}
</script>

<template>
  <section class="self-paced-completion" :aria-label="text.action">
    <button type="button" @click="markReviewed">
      {{ reviewed ? text.reviewed : text.action }}
    </button>
    <p aria-live="polite">
      <strong v-if="reviewed">{{ text.reviewed }}。</strong>
      {{ text.note }}
    </p>
  </section>
</template>
