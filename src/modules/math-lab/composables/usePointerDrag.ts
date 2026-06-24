import { ref } from 'vue'

export interface PointerDragOptions {
  onDrag: (event: PointerEvent) => void
  onStart?: (event: PointerEvent) => void
  onEnd?: (event: PointerEvent) => void
}

export function usePointerDrag(options: PointerDragOptions) {
  const dragging = ref(false)
  const activePointerId = ref<number | null>(null)

  function onPointerDown(event: PointerEvent) {
    event.preventDefault()
    dragging.value = true
    activePointerId.value = event.pointerId
    const target = event.currentTarget as Element | null
    target?.setPointerCapture?.(event.pointerId)
    options.onStart?.(event)
    options.onDrag(event)
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging.value || activePointerId.value !== event.pointerId) return
    event.preventDefault()
    options.onDrag(event)
  }

  function finish(event: PointerEvent) {
    if (!dragging.value || activePointerId.value !== event.pointerId) return
    const target = event.currentTarget as Element | null
    target?.releasePointerCapture?.(event.pointerId)
    dragging.value = false
    activePointerId.value = null
    options.onEnd?.(event)
  }

  return {
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel: finish,
  }
}
