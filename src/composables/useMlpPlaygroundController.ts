import { onBeforeUnmount, ref, shallowRef } from 'vue'
import type { MlpPlaygroundSnapshot, MlpPlaygroundState } from '../types/ml'
import {
  DEFAULT_MLP_PLAYGROUND_STATE,
  createMlpPlaygroundSession,
  normalizeMlpPlaygroundState,
} from '../simulations/mlpPlayground'

const MAX_CONTOUR_HISTORY = 6
const DEFAULT_PLAYBACK_MS = 90

export function useMlpPlaygroundController(
  initialState: Partial<MlpPlaygroundState> = DEFAULT_MLP_PLAYGROUND_STATE,
) {
  const normalizedInitialState = normalizeMlpPlaygroundState({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    ...initialState,
  })
  const state = ref<MlpPlaygroundState>(normalizedInitialState)
  const session = shallowRef(createMlpPlaygroundSession(normalizedInitialState))
  const snapshot = shallowRef<MlpPlaygroundSnapshot>(session.value.snapshot())
  const previousSnapshot = shallowRef<MlpPlaygroundSnapshot>()
  const contourHistory = shallowRef<MlpPlaygroundSnapshot[]>([snapshot.value])
  const isPlaying = ref(false)
  let timer: number | undefined

  function stopPlayback() {
    if (timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
    isPlaying.value = false
  }

  function sync(nextSnapshot: MlpPlaygroundSnapshot, clearHistory = false) {
    previousSnapshot.value = clearHistory ? undefined : snapshot.value
    snapshot.value = nextSnapshot
    state.value = nextSnapshot.state

    if (clearHistory) {
      contourHistory.value = [nextSnapshot]
      return
    }

    const last = contourHistory.value.at(-1)
    contourHistory.value = !last || last.iteration !== nextSnapshot.iteration
      ? [...contourHistory.value, nextSnapshot].slice(-MAX_CONTOUR_HISTORY)
      : [...contourHistory.value.slice(0, -1), nextSnapshot]
  }

  function replaceInitialState(partial: Partial<MlpPlaygroundState>) {
    stopPlayback()
    const nextState = normalizeMlpPlaygroundState({ ...DEFAULT_MLP_PLAYGROUND_STATE, ...partial })
    session.value = createMlpPlaygroundSession(nextState)
    sync(session.value.snapshot(), true)
  }

  function resetWith(partial: Partial<MlpPlaygroundState> = {}) {
    stopPlayback()
    const nextState = normalizeMlpPlaygroundState({ ...state.value, ...partial, iteration: 0 })
    sync(session.value.reset(nextState), true)
  }

  function updateWithoutReset(partial: Partial<MlpPlaygroundState>) {
    const nextState = normalizeMlpPlaygroundState({ ...state.value, ...partial })
    sync(session.value.updateState(nextState))
  }

  function step(count = 1) {
    const safeCount = Number.isFinite(count) ? Math.min(50, Math.max(1, Math.round(count))) : 1
    sync(session.value.step(safeCount))
  }

  function togglePlayback(intervalMs = DEFAULT_PLAYBACK_MS) {
    if (isPlaying.value) {
      stopPlayback()
      return
    }

    const safeInterval = Number.isFinite(intervalMs)
      ? Math.min(2000, Math.max(40, Math.round(intervalMs)))
      : DEFAULT_PLAYBACK_MS
    isPlaying.value = true
    timer = window.setInterval(() => step(1), safeInterval)
  }

  function regenerateData() {
    stopPlayback()
    sync(session.value.regenerateData(), true)
  }

  function dispose() {
    stopPlayback()
  }

  onBeforeUnmount(dispose)

  return {
    state,
    snapshot,
    previousSnapshot,
    contourHistory,
    isPlaying,
    replaceInitialState,
    resetWith,
    updateWithoutReset,
    step,
    togglePlayback,
    stopPlayback,
    regenerateData,
    dispose,
  }
}
