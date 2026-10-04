import type { MathLabModule } from '../types/mathLab.ts'

/** Cache successful courses and concurrent requests; a failed request can be retried. */
export function createMathModuleLoader(loaders: Record<string, () => Promise<MathLabModule>>) {
  const cache = new Map<string, Promise<MathLabModule>>()
  return function load(id: string): Promise<MathLabModule | undefined> {
    if (!Object.hasOwn(loaders, id)) return Promise.resolve(undefined)
    const cached = cache.get(id)
    if (cached) return cached
    const request = Promise.resolve().then(() => loaders[id]!()).then(module => {
      if (module.id !== id) throw new Error(`Math course mismatch: ${id} / ${module.id}`)
      return module
    }).catch((error: unknown) => {
      cache.delete(id)
      throw error
    })
    cache.set(id, request)
    return request
  }
}
