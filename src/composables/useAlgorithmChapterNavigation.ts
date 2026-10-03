import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { ModuleSlug } from '../types/ml'

export function useAlgorithmChapterNavigation(options: {
  route: RouteLocationNormalizedLoaded
  router: Router
  slug: Readonly<Ref<ModuleSlug>>
  isNeuralGuidedPage: Readonly<Ref<boolean>>
  activeChapter: Ref<string>
  syncChapterPreset: (chapterId: string) => void
}) {
  const { route, router, slug, isNeuralGuidedPage, activeChapter, syncChapterPreset } = options
  const routeChapterLock = ref('')
  let routeChapterScrollFrame = 0
  let routeChapterUnlockTimer: number | undefined
  let generation = 0

  function stopRouteChapterSync() {
    generation += 1
    if (routeChapterScrollFrame) window.cancelAnimationFrame(routeChapterScrollFrame)
    if (routeChapterUnlockTimer) window.clearTimeout(routeChapterUnlockTimer)
    routeChapterScrollFrame = 0
    routeChapterUnlockTimer = undefined
  }

  function syncRouteChapterIntoView(chapterId: string) {
    stopRouteChapterSync()
    const request = generation
    routeChapterLock.value = chapterId
    const scroll = () => {
      activeChapter.value = chapterId
      const target = isNeuralGuidedPage.value
        ? document.querySelector<HTMLElement>('.neural-guided-lesson')
        : document.getElementById(chapterId)
      target?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    nextTick(() => {
      if (request !== generation) return
      routeChapterScrollFrame = window.requestAnimationFrame(() => {
        scroll()
        routeChapterScrollFrame = window.requestAnimationFrame(() => {
          routeChapterScrollFrame = 0
          scroll()
          routeChapterUnlockTimer = window.setTimeout(() => {
            if (routeChapterLock.value === chapterId) {
              scroll()
              routeChapterLock.value = ''
            }
            routeChapterUnlockTimer = undefined
          }, 1200)
        })
      })
    })
  }

  function onChapterChange(nextChapter: string) {
    if (routeChapterLock.value && nextChapter !== routeChapterLock.value) return
    activeChapter.value = nextChapter
    if (routeChapterLock.value === nextChapter) routeChapterLock.value = ''
    syncChapterPreset(nextChapter)
  }

  function onNeuralChapterChange(nextChapter: string) {
    if (nextChapter === activeChapter.value) return
    activeChapter.value = nextChapter
    syncChapterPreset(nextChapter)
    const targetPath = `/learn/${slug.value}/${nextChapter}`
    if (route.path !== targetPath) void router.push({ path: targetPath, query: route.query })
  }

  onBeforeUnmount(stopRouteChapterSync)
  return { syncRouteChapterIntoView, onChapterChange, onNeuralChapterChange }
}
