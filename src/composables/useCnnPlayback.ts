import { onBeforeUnmount, onMounted, ref } from 'vue'

const DEFAULT_PLAYBACK_MS = 1300

export function useCnnPlayback(onStep: () => void, canPlay: () => boolean) {
  const isPlaying = ref(false)
  const reducedMotion = ref(false)
  let timer: number | undefined

  function stopPlayback() {
    if (timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
    isPlaying.value = false
  }

  function togglePlayback(intervalMs = DEFAULT_PLAYBACK_MS) {
    if (isPlaying.value) {
      stopPlayback()
      return
    }
    if (reducedMotion.value || !canPlay()) return
    const safeInterval = Number.isFinite(intervalMs)
      ? Math.min(4000, Math.max(400, Math.round(intervalMs)))
      : DEFAULT_PLAYBACK_MS
    isPlaying.value = true
    timer = window.setInterval(onStep, safeInterval)
  }

  function dispose() {
    stopPlayback()
  }

  onMounted(() => {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  onBeforeUnmount(dispose)

  return { isPlaying, reducedMotion, togglePlayback, stopPlayback, dispose }
}
