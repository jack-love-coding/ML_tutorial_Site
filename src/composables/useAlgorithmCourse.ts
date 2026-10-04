import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { loadAlgorithmModule } from '../data/moduleCatalog'
import { registerExperimentModule, useExperimentStore } from '../stores/experiments'
import { selectedReadingLessonIds } from '../curriculum/reading'
import type { AlgorithmModuleDefinition, ModuleSlug } from '../types/ml'

export function useAlgorithmCourse(
  route: RouteLocationNormalizedLoaded,
  router: Router,
  experimentStore: ReturnType<typeof useExperimentStore>,
  onChapterReady: (chapterId: string, explicit: boolean) => void,
) {
  const moduleDefinition = shallowRef<AlgorithmModuleDefinition>()
  const loadFailed = ref(false)
  const slug = computed(() => {
    const routeSlug = route.params.slug ?? route.params.moduleId
    if (typeof routeSlug === 'string') return routeSlug as ModuleSlug
    return (route.path.split('/')[2] || 'linear-regression') as ModuleSlug
  })
  const requestedChapterId = computed(() => {
    const chapterId = route.params.chapterId ?? route.params.lessonId
    return typeof chapterId === 'string' ? chapterId : ''
  })

  let moduleLoadRequest = 0
  async function loadCourse() {
    const requestId = ++moduleLoadRequest
    const nextSlug = slug.value
    const nextChapterId = requestedChapterId.value
    moduleDefinition.value = undefined
    loadFailed.value = false
    try {
      const nextModuleDefinition = await loadAlgorithmModule(nextSlug)
      if (requestId !== moduleLoadRequest) return
      if (!nextModuleDefinition) {
        await router.replace('/')
        return
      }
      const lessonIds = selectedReadingLessonIds(route.query.route, nextSlug, nextChapterId)
      moduleDefinition.value = lessonIds
        ? { ...nextModuleDefinition, chapters: nextModuleDefinition.chapters.filter(chapter => lessonIds.includes(chapter.id)) }
        : nextModuleDefinition
      registerExperimentModule(nextModuleDefinition)
      experimentStore.ensureExperiment(nextSlug)
      const firstChapterId = nextModuleDefinition.chapters[0]?.id ?? ''
      if (nextChapterId && !nextModuleDefinition.chapters.some(chapter => chapter.id === nextChapterId)) {
        await router.replace({ path: `/learn/${nextSlug}/${firstChapterId}`, query: route.query })
        return
      }
      onChapterReady(nextChapterId || firstChapterId, Boolean(nextChapterId))
    } catch {
      if (requestId === moduleLoadRequest) loadFailed.value = true
    }
  }

  watch(() => [slug.value, requestedChapterId.value, route.query.route], loadCourse, { immediate: true })
  onBeforeUnmount(() => { moduleLoadRequest += 1 })
  return { moduleDefinition, slug, loadFailed, retry: loadCourse }
}
