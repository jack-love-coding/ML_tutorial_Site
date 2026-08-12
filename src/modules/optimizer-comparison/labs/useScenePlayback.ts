import { onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'

export interface ScenePlaybackOptions {
  value: Ref<number>
  initial: number
  maximum: number
  cadence?: number
}

/**
 * Shared bounded playback for optimizer teaching scenes. The timer owns no
 * model state: each scene remains a pure render of its integer cursor.
 */
export function useScenePlayback({ value, initial, maximum, cadence = 360 }: ScenePlaybackOptions) {
  const playing = ref(false)
  const reducedMotion = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function pause() {
    playing.value = false
    if (timer) clearInterval(timer)
    timer = undefined
  }

  function advance() {
    const next = Math.min(maximum, value.value + 1)
    value.value = next
    if (next >= maximum) pause()
  }

  function step() {
    pause()
    advance()
  }

  function play() {
    if (reducedMotion.value || playing.value) return
    if (value.value >= maximum) value.value = initial
    playing.value = true
    timer = setInterval(advance, cadence)
  }

  function reset() {
    pause()
    value.value = initial
  }

  onMounted(() => {
    reducedMotion.value = globalThis.window?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  })
  onBeforeUnmount(pause)

  return reactive({ playing, reducedMotion, play, pause, step, reset })
}
