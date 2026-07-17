import { ref } from 'vue'
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { isCurriculumLibraryDomain } from '../curriculum/library.ts'
import { resolveCanonicalLearnRedirect, resolveCanonicalLearnRoute } from '../curriculum/routes.ts'
import { resolvePythonDataToolsChapter } from '../utils/pythonDataToolsRoutes.ts'

export const routeNavigating = ref(false)
export const pendingRoutePath = ref('/')

let navigationTimer: number | undefined

function routeParamValue(value: unknown) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

function redirectCanonicalLearnRoute(to: RouteLocationNormalized) {
  const moduleId = routeParamValue(to.params.moduleId)
  const lessonId = routeParamValue(to.params.lessonId)
  const canonicalRoute = resolveCanonicalLearnRoute(moduleId, lessonId)
  const redirectRoute = resolveCanonicalLearnRedirect(moduleId, lessonId)

  if (redirectRoute && redirectRoute !== to.path) return { path: redirectRoute }
  if (!canonicalRoute) return { path: '/' }
  return true
}

function redirectInvalidLibraryDomain(to: RouteLocationNormalized) {
  const domain = routeParamValue(to.params.domain)
  return isCurriculumLibraryDomain(domain) ? true : { path: '/library/math' }
}

function resolvePythonDataToolsRoute(to: RouteLocationNormalized, routeBase: string) {
  const resolution = resolvePythonDataToolsChapter(routeParamValue(to.params.chapterId))
  if (resolution.kind === 'current') return true

  return {
    path: `${routeBase}/${resolution.id}`,
    query: to.query,
    hash: to.hash,
    replace: true,
  }
}

function redirectPythonDataToolsChapter(to: RouteLocationNormalized) {
  return resolvePythonDataToolsRoute(to, '/learn/python-notebook')
}

function redirectShortPythonDataToolsChapter(to: RouteLocationNormalized) {
  return resolvePythonDataToolsRoute(to, '/python')
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/math-lab',
      name: 'math-lab',
      component: () => import('../modules/math-lab/pages/MathLabHome.vue'),
    },
    {
      path: '/math-lab/diagnostic',
      name: 'math-lab-diagnostic',
      component: () => import('../modules/math-lab/pages/DiagnosticPage.vue'),
    },
    {
      path: '/math-lab/modules/:moduleId',
      name: 'math-lab-module',
      component: () => import('../modules/math-lab/pages/MathLabModulePage.vue'),
    },
    {
      path: '/data-lab',
      name: 'data-lab',
      component: () => import('../modules/data-lab/pages/DataLabHome.vue'),
    },
    {
      path: '/data-lab/modules/:moduleId',
      name: 'data-lab-module',
      component: () => import('../modules/data-lab/pages/DataLabModulePage.vue'),
    },
    {
      path: '/spine',
      name: 'curriculum-spine',
      component: () => import('../views/CurriculumSpineView.vue'),
    },
    {
      path: '/tracks/:trackId',
      name: 'curriculum-track',
      component: () => import('../views/CurriculumTrackView.vue'),
    },
    {
      path: '/library/:domain',
      name: 'curriculum-library',
      beforeEnter: redirectInvalidLibraryDomain,
      component: () => import('../views/CurriculumLibraryView.vue'),
    },
    {
      path: '/projects',
      redirect: '/tracks/project-practice',
    },
    {
      path: '/progress',
      name: 'curriculum-progress',
      component: () => import('../views/CurriculumProgressView.vue'),
    },
    {
      path: '/python',
      name: 'python-data-tools-short-root',
      beforeEnter: redirectShortPythonDataToolsChapter,
      component: () => import('../views/PythonDataToolsCourseView.vue'),
    },
    {
      path: '/python/:chapterId',
      name: 'python-data-tools-short-chapter',
      beforeEnter: redirectShortPythonDataToolsChapter,
      component: () => import('../views/PythonDataToolsCourseView.vue'),
    },
    {
      path: '/learn/linear-regression',
      redirect: '/learn/linear-regression/fit-line',
    },
    {
      path: '/learn/linear-regression/:chapterId',
      name: 'linear-regression-chapter',
      component: () => import('../views/AlgorithmView.vue'),
    },
    {
      path: '/learn/logistic-regression',
      redirect: '/learn/logistic-regression/linear-score',
    },
    {
      path: '/learn/logistic-regression/:chapterId',
      name: 'logistic-regression-chapter',
      component: () => import('../views/AlgorithmView.vue'),
    },
    {
      path: '/learn/python-notebook',
      name: 'python-data-tools-root',
      beforeEnter: redirectPythonDataToolsChapter,
      component: () => import('../views/PythonDataToolsCourseView.vue'),
    },
    {
      path: '/learn/python-notebook/:chapterId',
      name: 'python-data-tools-chapter',
      beforeEnter: redirectPythonDataToolsChapter,
      component: () => import('../views/PythonDataToolsCourseView.vue'),
    },
    {
      path: '/learn/cnn-visualization/:chapterId',
      name: 'cnn-visualization-chapter',
      component: () => import('../views/AlgorithmView.vue'),
    },
    {
      path: '/learn/:moduleId/:lessonId',
      name: 'canonical-lesson',
      beforeEnter: redirectCanonicalLearnRoute,
      component: () => import('../views/AlgorithmView.vue'),
    },
    {
      path: '/learn/:moduleId',
      name: 'algorithm',
      beforeEnter: redirectCanonicalLearnRoute,
      component: () => import('../views/AlgorithmView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  pendingRoutePath.value = to.path
  routeNavigating.value = true
  if (navigationTimer) {
    window.clearTimeout(navigationTimer)
    navigationTimer = undefined
  }
  return true
})

router.afterEach((to) => {
  pendingRoutePath.value = to.path
  navigationTimer = window.setTimeout(() => {
    routeNavigating.value = false
    navigationTimer = undefined
  }, 140)
})

router.onError(() => {
  routeNavigating.value = false
  if (navigationTimer) {
    window.clearTimeout(navigationTimer)
    navigationTimer = undefined
  }
})
