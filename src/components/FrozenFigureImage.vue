<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { AppLocale } from '../types/ml'
import '../styles/shared/frozen-figure.css'

const props = defineProps<{ src: string; alt: string; locale: AppLocale }>()
const emit = defineEmits<{ load: []; error: [] }>()
const dialog = ref<HTMLDialogElement>()
const viewport = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const naturalWidth = ref(0)
const zoom = ref(1)
const opened = ref(false)
const failed = ref(false)
const zh = computed(() => props.locale === 'zh-CN')
let previousOverflow = ''
function loaded(event: Event) {
  naturalWidth.value = (event.target as HTMLImageElement).naturalWidth
  emit('load')
}
async function reset() {
  zoom.value = 1
  await nextTick()
  // Cancel any arrow-key scrolling after the image has returned to its original size.
  viewport.value?.scrollTo({ left: 0, top: 0, behavior: 'instant' })
}
function open() {
  reset()
  failed.value = false
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  opened.value = true
  dialog.value?.showModal()
}
function restore() {
  if (!opened.value) return
  opened.value = false
  document.body.style.overflow = previousOverflow
  trigger.value?.focus()
}
function close() { dialog.value?.close(); restore() }
function containFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const items = dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')
  if (!items?.length) return
  const first = items[0]!, last = items[items.length - 1]!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
watch(() => props.src, () => { close(); naturalWidth.value = 0 })
onBeforeUnmount(restore)
</script>

<template>
  <img :src="src" :alt="alt" loading="lazy" decoding="async" @load="loaded" @error="emit('error')" />
  <button ref="trigger" type="button" class="frozen-figure-open" :disabled="!naturalWidth" @click="open">
    {{ zh ? '放大查看图表' : 'Inspect figure details' }}
  </button>
  <Teleport to="body">
    <dialog ref="dialog" class="frozen-figure-dialog" :aria-label="zh ? '图表细节' : 'Figure details'" @close="restore" @cancel.prevent="close" @keydown="containFocus">
      <div class="frozen-figure-toolbar">
        <button type="button" autofocus @click="close">{{ zh ? '关闭' : 'Close' }}</button>
        <button type="button" :disabled="zoom <= 0.5" @click="zoom = Math.max(0.5, zoom - 0.25)">{{ zh ? '缩小' : 'Zoom out' }}</button>
        <output aria-live="polite">{{ Math.round(zoom * 100) }}%</output>
        <button type="button" :disabled="zoom >= 3" @click="zoom = Math.min(3, zoom + 0.25)">{{ zh ? '放大' : 'Zoom in' }}</button>
        <button type="button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button>
      </div>
      <p>{{ zh ? '按原图尺寸查看；滑动或用方向键移动图表。放大不会增加原图细节。按 Esc 关闭。' : 'View at original size; swipe or use arrow keys to move around. Zoom does not add detail to the source image. Press Esc to close.' }}</p>
      <div ref="viewport" class="frozen-figure-viewport" tabindex="0" role="region" :aria-label="zh ? '可滚动图表' : 'Scrollable figure'">
        <img v-if="opened && !failed" :src="src" :alt="alt" :style="{ width: `${naturalWidth * zoom}px` }" @error="failed = true" />
        <p v-if="failed" role="status">{{ zh ? '图片无法显示，请关闭此窗口查看正文中的文字说明。' : 'Image unavailable. Close this view to read the text alternative in the lesson.' }}</p>
      </div>
    </dialog>
  </Teleport>
</template>
