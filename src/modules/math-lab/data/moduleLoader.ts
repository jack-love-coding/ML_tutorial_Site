import type { MathLabModule } from '../types/mathLab.ts'
import { createMathModuleLoader } from '../utils/moduleLoader.ts'

// Eagerly include only asset URLs. The generated JSON body is fetched on demand.
// Fetch also allows retry after a network failure without a cached failed import.
const urls = import.meta.glob<string>('../../../curriculum/generated/mathCourses/*.json', {
  query: '?url', import: 'default', eager: true,
})
const loaders = Object.fromEntries(Object.entries(urls).map(([path, url]) => [
  path.split('/').pop()!.replace(/\.json$/, ''),
  async () => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Math course unavailable (${response.status})`)
    return await response.json() as MathLabModule
  },
]))

export const loadMathLabModule = createMathModuleLoader(loaders)
