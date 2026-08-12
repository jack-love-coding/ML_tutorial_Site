<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import MarkdownMathContent from './MarkdownMathContent.vue'

type ChapterMarker = { id: string; startSeconds: number; title: LocalizedCopy }

const props = defineProps<{
  assetPath: string
  posterPath: string
  title: LocalizedCopy
  alt?: LocalizedCopy
  transcript?: LocalizedCopy
  chapterMarkers?: readonly ChapterMarker[]
}>()

const { locale } = useI18n()
const video = ref<HTMLVideoElement>()
const failed = ref(false)
const reducedMotion = ref(false)
let motionQuery: MediaQueryList | undefined

const activeLocale = computed(() => locale.value as AppLocale)
const localized = (value: LocalizedCopy) => value[activeLocale.value]
const showVideo = computed(() => !failed.value && !reducedMotion.value)
const copy = computed(() => activeLocale.value === 'zh-CN'
  ? { chapters: '动画章节', transcript: '展开字幕稿', fallback: '视频暂时不可用，显示静态教学图。', reduced: '已为减少动态效果显示海报。播放视频', unavailable: '动画章节在视频不可用时仍可通过字幕稿查看。' }
  : { chapters: 'Animation chapters', transcript: 'Open transcript', fallback: 'The video is unavailable, so the static teaching visual is shown.', reduced: 'Poster shown to reduce motion. Play video', unavailable: 'When the video is unavailable, use the transcript to review each chapter.' })

function formatTimestamp(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function seek(seconds: number) {
  if (!showVideo.value || !video.value || !Number.isFinite(seconds)) return
  video.value.currentTime = Math.max(0, seconds)
  video.value.focus()
}

async function enableVideo() {
  reducedMotion.value = false
  await nextTick()
  video.value?.focus()
}

function updateMotionPreference() {
  reducedMotion.value = motionQuery?.matches ?? false
}

watch(() => props.assetPath, () => {
  failed.value = false
  video.value?.pause()
})

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotionPreference()
  motionQuery.addEventListener('change', updateMotionPreference)
})

onBeforeUnmount(() => {
  video.value?.pause()
  motionQuery?.removeEventListener('change', updateMotionPreference)
})
</script>

<template>
  <div class="chaptered-media-player" :data-media-path="assetPath">
    <video
      v-if="showVideo"
      ref="video"
      controls
      playsinline
      preload="metadata"
      :poster="withPublicBase(posterPath)"
      :aria-label="localized(alt ?? title)"
      @error="failed = true"
    >
      <source :src="withPublicBase(assetPath)" type="video/mp4" />
    </video>
    <img
      v-else
      :src="withPublicBase(posterPath)"
      :alt="localized(alt ?? title)"
      loading="lazy"
      decoding="async"
    />
    <p v-if="failed" class="chaptered-media-player__notice" role="status">{{ copy.fallback }}</p>
    <button v-else-if="reducedMotion" type="button" class="chaptered-media-player__play" @click="enableVideo">
      {{ copy.reduced }}
    </button>

    <nav v-if="chapterMarkers?.length" class="chaptered-media-player__markers" :aria-label="copy.chapters">
      <button
        v-for="marker in chapterMarkers"
        :key="marker.id"
        type="button"
        :disabled="!showVideo"
        @click="seek(marker.startSeconds)"
      >
        <span>{{ formatTimestamp(marker.startSeconds) }}</span>
        <strong>{{ localized(marker.title) }}</strong>
      </button>
    </nav>
    <p v-if="chapterMarkers?.length && !showVideo" class="chaptered-media-player__hint">{{ copy.unavailable }}</p>

    <details v-if="transcript" class="chaptered-media-player__transcript">
      <summary>{{ copy.transcript }}</summary>
      <MarkdownMathContent :source="localized(transcript)" />
    </details>
  </div>
</template>

<style scoped>
.chaptered-media-player { display: grid; gap: 10px; }
.chaptered-media-player video, .chaptered-media-player img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px; background: #101828; }
.chaptered-media-player__notice, .chaptered-media-player__hint { margin: 0; color: #6b3f29; font-size: .86rem; line-height: 1.45; }
.chaptered-media-player__hint { color: #50617c; }
.chaptered-media-player__play { justify-self: start; padding: 8px 11px; border: 1px solid #b8c6da; border-radius: 8px; background: #f3f6fb; color: #142033; font: inherit; font-weight: 750; }
.chaptered-media-player__markers { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
.chaptered-media-player__markers button { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px; align-items: center; min-height: 42px; padding: 8px 10px; border: 1px solid #d8dfeb; border-radius: 8px; background: #f3f6fb; color: #142033; text-align: left; cursor: pointer; }
.chaptered-media-player__markers button:disabled { cursor: not-allowed; opacity: .6; }
.chaptered-media-player__markers span { color: #607089; font-size: .75rem; font-variant-numeric: tabular-nums; font-weight: 800; }
.chaptered-media-player__markers strong { font-size: .78rem; line-height: 1.3; }
.chaptered-media-player__transcript { padding: 11px 13px; border: 1px solid #d8dfeb; border-radius: 9px; background: #f3f6fb; }
.chaptered-media-player__transcript summary { cursor: pointer; font-weight: 850; }
.chaptered-media-player__transcript :deep(.markdown-math) { margin-top: 12px; font-size: .9rem; }
@media (prefers-reduced-motion: reduce) { .chaptered-media-player video { animation: none !important; } }
</style>
