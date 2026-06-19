import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
export const routeNavigating = ref(false)
export const pendingRoutePath = ref('/')

let navigationTimer: number | undefined

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
      path: '/learn/cnn-visualization/:chapterId',
      name: 'cnn-visualization-chapter',
      component: () => import('../views/AlgorithmView.vue'),
    },
    {
      path: '/learn/:slug',
      name: 'algorithm',
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
