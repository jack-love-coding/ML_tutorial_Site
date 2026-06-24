import type { Vector2 } from '../utils/math'

export interface KeyboardNudgeOptions {
  step?: number
  shiftStep?: number
  onNudge: (delta: Vector2) => void
}

export function useKeyboardNudge(options: KeyboardNudgeOptions) {
  const step = options.step ?? 0.1
  const shiftStep = options.shiftStep ?? 0.5

  function onKeydown(event: KeyboardEvent) {
    const amount = event.shiftKey ? shiftStep : step
    const deltaByKey: Record<string, Vector2 | undefined> = {
      ArrowLeft: { x: -amount, y: 0 },
      ArrowRight: { x: amount, y: 0 },
      ArrowDown: { x: 0, y: -amount },
      ArrowUp: { x: 0, y: amount },
    }
    const delta = deltaByKey[event.key]
    if (!delta) return
    event.preventDefault()
    options.onNudge(delta)
  }

  return { onKeydown }
}
