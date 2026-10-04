import { ref, shallowRef } from 'vue'
import type { MathLabModule } from '../types/mathLab.ts'

/** One active course per page. Late responses cannot replace a more recent route. */
export function createMathCourseRequest(load: (id: string) => Promise<MathLabModule | undefined>) {
  const module = shallowRef<MathLabModule>()
  const failed = ref(false)
  let generation = 0
  async function request(id: string) {
    const current = ++generation
    module.value = undefined
    failed.value = false
    try {
      const result = await load(id)
      if (current !== generation) return
      if (!result) throw new Error(`Unknown math course: ${id}`)
      module.value = result
    } catch {
      if (current === generation) failed.value = true
    }
  }
  function dispose() {
    generation += 1
    module.value = undefined
  }
  return { module, failed, request, dispose }
}
