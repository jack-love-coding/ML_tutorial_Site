<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMarkdownWithMath } from '../utils/markdownMath'

const props = defineProps<{
  source: string
}>()

const { locale } = useI18n()
const rootRef = ref<HTMLElement>()
const rendered = computed(() => renderMarkdownWithMath(props.source))
const copy = computed(() => locale.value === 'zh-CN'
  ? { idle: '复制代码', copied: '已复制', failed: '复制失败' }
  : { idle: 'Copy code', copied: 'Copied', failed: 'Copy failed' })
let feedbackTimer: number | undefined
let feedbackButton: HTMLButtonElement | undefined

function resetButton(button: HTMLButtonElement) {
  button.textContent = copy.value.idle
  button.setAttribute('aria-label', copy.value.idle)
  button.dataset.copyState = 'idle'
}

function enhanceCodeBlocks() {
  const root = rootRef.value
  if (!root) return
  root.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
    if (!pre.querySelector(':scope > code')) return
    let button = pre.querySelector<HTMLButtonElement>(':scope > .markdown-code-copy')
    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'markdown-code-copy'
      pre.prepend(button)
    }
    resetButton(button)
  })
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('clipboard unavailable')
}

async function onClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const button = target.closest<HTMLButtonElement>('.markdown-code-copy')
  if (!button || !rootRef.value?.contains(button)) return
  const code = button.parentElement?.querySelector('code')?.textContent ?? ''

  if (feedbackTimer) window.clearTimeout(feedbackTimer)
  if (feedbackButton && feedbackButton !== button) resetButton(feedbackButton)
  feedbackButton = button
  try {
    await copyText(code)
    button.textContent = copy.value.copied
    button.setAttribute('aria-label', copy.value.copied)
    button.dataset.copyState = 'copied'
  } catch {
    button.textContent = copy.value.failed
    button.setAttribute('aria-label', copy.value.failed)
    button.dataset.copyState = 'failed'
  }
  feedbackTimer = window.setTimeout(() => {
    resetButton(button)
    if (feedbackButton === button) feedbackButton = undefined
    feedbackTimer = undefined
  }, 1600)
}

onMounted(enhanceCodeBlocks)
watch([rendered, copy], () => nextTick(enhanceCodeBlocks))
onBeforeUnmount(() => {
  if (feedbackTimer) window.clearTimeout(feedbackTimer)
  feedbackButton = undefined
})
</script>

<template>
  <div ref="rootRef" class="markdown-math" @click="onClick" v-html="rendered" />
</template>
