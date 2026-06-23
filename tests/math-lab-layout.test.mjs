import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createRenderer, createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'

const root = new URL('../', import.meta.url)
const require = createRequire(import.meta.url)
const vueRuntimeUrl = pathToFileURL(require.resolve('vue/dist/vue.runtime.esm-bundler.js')).href
const exportHelperUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(`
export default function exportSfc(component, props) {
  for (const [key, value] of props) component[key] = value
  return component
}
`)}`
const emptyModuleUrl = 'data:text/javascript;charset=utf-8,export default {}'

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function createMemoryStorage(initialEntries = []) {
  const values = new Map(initialEntries)
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
    clear() {
      values.clear()
    },
  }
}

async function renderSfcWithVite(path, propsOrLoader, setupApp) {
  const server = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    root: new URL('.', root).pathname,
    server: { middlewareMode: true },
  })

  try {
    const props = typeof propsOrLoader === 'function' ? await propsOrLoader(server) : propsOrLoader
    const module = await server.ssrLoadModule(path)
    const app = createSSRApp({
      render: () => h(module.default, props),
    })

    app.component('RouterLink', {
      props: ['to'],
      setup(linkProps, { slots }) {
        return () => h('a', { href: String(linkProps.to) }, slots.default?.())
      },
    })

    setupApp?.(app, server)
    return await renderToString(app)
  } finally {
    await server.close()
  }
}

function createMemoryRenderer() {
  return createRenderer({
    patchProp(el, key, previousValue, nextValue) {
      el.props[key] = nextValue
    },
    insert(el, parent) {
      el.parent = parent
      parent.children.push(el)
    },
    remove(el) {
      if (!el.parent) return
      el.parent.children = el.parent.children.filter((child) => child !== el)
      el.parent = null
    },
    createElement(type) {
      const el = {
        type,
        props: {},
        children: [],
        eventListeners: {},
        parent: null,
        addEventListener(eventName, handler) {
          this.eventListeners[eventName] = this.eventListeners[eventName] ?? []
          this.eventListeners[eventName].push(handler)
        },
        removeEventListener(eventName, handler) {
          this.eventListeners[eventName] = (this.eventListeners[eventName] ?? []).filter((item) => item !== handler)
        },
      }
      return el
    },
    createText(text) {
      return { type: '#text', text, props: {}, children: [], parent: null }
    },
    createComment(text) {
      return { type: '#comment', text, props: {}, children: [], parent: null }
    },
    setText(node, text) {
      node.text = text
    },
    setElementText(node, text) {
      node.text = text
      node.children = []
    },
    parentNode(node) {
      return node.parent
    },
    nextSibling() {
      return null
    },
  })
}

function flattenRenderedNodes(node, nodes = []) {
  nodes.push(node)
  for (const child of node.children ?? []) {
    flattenRenderedNodes(child, nodes)
  }
  return nodes
}

async function loadClientModuleWithVite(server, path, cache = new Map()) {
  if (cache.has(path)) return cache.get(path)

  const transformed = await server.transformRequest(path)
  assert.ok(transformed?.code, `${path} should transform`)
  let code = transformed.code
    .replace(/import\s+\{\s*createHotContext[\s\S]*?;\s*/, '')
    .replace(/import\.meta\.hot\s*=\s*__vite__createHotContext\([^;]+;\s*/, '')
    .replace(/\n_sfc_main\.__hmrId[\s\S]*?import _export_sfc/, '\nimport _export_sfc')

  const specifiers = new Set()
  for (const match of code.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)) {
    specifiers.add(match[1])
  }

  const replacements = new Map()
  for (const specifier of specifiers) {
    if (specifier.startsWith('/node_modules/.vite/deps/vue.js')) {
      replacements.set(specifier, vueRuntimeUrl)
    } else if (specifier.startsWith('/@id/__x00__plugin-vue:export-helper')) {
      replacements.set(specifier, exportHelperUrl)
    } else if (specifier.startsWith('/@vite/client') || specifier.includes('type=style')) {
      replacements.set(specifier, emptyModuleUrl)
    } else if (specifier.startsWith('/src/')) {
      replacements.set(specifier, await loadClientModuleWithVite(server, specifier, cache))
    }
  }

  for (const [specifier, replacement] of replacements) {
    code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(replacement))
    code = code.replaceAll(`'${specifier}'`, `'${replacement}'`)
  }

  const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`
  cache.set(path, moduleUrl)
  return moduleUrl
}

async function mountClientSfc(path, props) {
  const server = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    root: new URL('.', root).pathname,
    server: { middlewareMode: true },
  })
  const container = { type: 'root', props: {}, children: [], parent: null }
  const renderer = createMemoryRenderer()

  try {
    const moduleUrl = await loadClientModuleWithVite(server, path)
    const module = await import(moduleUrl)
    const app = renderer.createApp({
      render: () => h(module.default, props),
    })
    app.mount(container)
    await nextTick()
    return {
      container,
      async update() {
        await nextTick()
        await nextTick()
      },
      async unmount() {
        app.unmount()
        await server.close()
      },
    }
  } catch (error) {
    await server.close()
    throw error
  }
}

async function collectSsrEvidence(path, props) {
  const evidenceEvents = []
  const html = await renderSfcWithVite(path, {
    ...props,
    onEvidenceChange: (evidence) => evidenceEvents.push(evidence),
  })
  assert.ok(html.length > 0)
  return evidenceEvents
}

function metricValue(evidence, englishLabel) {
  const metric = evidence.metrics.find((item) => item.label.en === englishLabel)
  assert.ok(metric, `expected ${englishLabel} metric`)
  return metric.value
}

function dispatchNodeEvent(node, eventName, event) {
  const handlers = node.eventListeners?.[eventName] ?? []
  assert.ok(handlers.length > 0, `expected ${eventName} listener on ${node.type}`)
  for (const handler of handlers) {
    handler(event)
  }
}

test('math lab lazy routes are wired outside AlgorithmView', () => {
  const routerSource = read('src/router/index.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(routerSource, /path: '\/math-lab'/)
  assert.match(routerSource, /path: '\/math-lab\/diagnostic'/)
  assert.match(routerSource, /path: '\/math-lab\/modules\/:moduleId'/)
  assert.match(routerSource, /modules\/math-lab\/pages\/MathLabHome\.vue/)
  assert.doesNotMatch(algorithmViewSource, /MathLabModulePage/)
})

test('app shell exposes a math lab navigation menu without importing full course data', () => {
  const appShellSource = read('src/components/AppShell.vue')
  const messagesSource = read('src/i18n/messages.ts')
  const navigationSource = read('src/data/navigationMenus.ts')

  assert.match(appShellSource, /site-math-lab-navigation/)
  assert.match(appShellSource, /mathLabNavigationGroups/)
  assert.match(appShellSource, /mathLabUtilityLinks/)
  assert.doesNotMatch(appShellSource, /mathLabModules/)
  assert.match(navigationSource, /route: '\/math-lab'/)
  assert.match(navigationSource, /\/math-lab\/diagnostic/)
  assert.match(navigationSource, /mathModule\('beginner-linear-algebra'/)
  assert.match(appShellSource, /t\('nav\.mathLab'\)/)
  assert.match(messagesSource, /mathLab: '数学直觉实验室'/)
  assert.match(messagesSource, /mathLab: 'Math Lab'/)
})

test('math lab components and labs exist with expected contracts', () => {
  const componentPaths = [
    'src/modules/math-lab/pages/MathLabHome.vue',
    'src/modules/math-lab/pages/DiagnosticPage.vue',
    'src/modules/math-lab/pages/MathLabModulePage.vue',
    'src/modules/math-lab/components/LearningPathMap.vue',
    'src/modules/math-lab/components/ManimPlayer.vue',
    'src/modules/math-lab/components/CheckpointQuiz.vue',
    'src/modules/math-lab/components/CodeLab.vue',
    'src/modules/math-lab/components/SkillRadarChart.vue',
    'src/modules/math-lab/components/MisconceptionCard.vue',
    'src/modules/math-lab/components/ThreeSceneShell.vue',
    'src/modules/math-lab/components/LearningRouteSummary.vue',
    'src/modules/math-lab/components/LearningRouteDashboard.vue',
    'src/modules/math-lab/components/CheckpointReportCard.vue',
    'src/modules/math-lab/components/ObservationPrompt.vue',
    'src/modules/math-lab/labs/VectorDotProductLab.vue',
    'src/modules/math-lab/labs/VectorSimilarityLab.vue',
    'src/modules/math-lab/labs/TensorShapeLab.vue',
    'src/modules/math-lab/labs/AutodiffGraphLab.vue',
    'src/modules/math-lab/labs/ProbabilityEntropyLab.vue',
    'src/modules/math-lab/labs/TrainingDiagnosticsLab.vue',
    'src/modules/math-lab/labs/ArchitectureMathLab.vue',
    'src/modules/math-lab/labs/MatrixTransformLab.vue',
    'src/modules/math-lab/labs/MathGradientLab.vue',
    'src/modules/math-lab/labs/MonteCarloLab.vue',
    'src/modules/math-lab/labs/LuDecompositionLab.vue',
    'src/modules/math-lab/labs/ConditionNumbersLab.vue',
    'src/modules/math-lab/labs/MarkovChainLab.vue',
    'src/modules/math-lab/labs/NumericalMiniLab.vue',
    'src/modules/math-lab/labs/PcaProjectionLab.vue',
    'src/modules/math-lab/labs/TaylorSeriesLab.vue',
    'src/modules/math-lab/labs/FeatureVectorStoryLab.vue',
    'src/modules/math-lab/labs/LocalChangeStoryLab.vue',
    'src/modules/math-lab/labs/BackpropBlockLab.vue',
    'src/modules/math-lab/labs/DistributionBuilderLab.vue',
    'src/modules/math-lab/labs/ConditionalBayesLab.vue',
    'src/modules/math-lab/labs/MatrixColumnSpaceLab.vue',
  ]

  for (const path of componentPaths) {
    assert.ok(existsSync(new URL(path, root)), `${path} should exist`)
  }

  for (const labPath of [
    'src/modules/math-lab/labs/FeatureVectorStoryLab.vue',
    'src/modules/math-lab/labs/VectorSimilarityLab.vue',
    'src/modules/math-lab/labs/MatrixTransformLab.vue',
    'src/modules/math-lab/labs/MatrixColumnSpaceLab.vue',
    'src/modules/math-lab/labs/NumericalMiniLab.vue',
    'src/modules/math-lab/labs/PcaProjectionLab.vue',
  ]) {
    const labSource = read(labPath)
    assert.match(labSource, /defineEmits/)
    assert.match(labSource, /evidence-change/)
    assert.match(labSource, /ExperimentEvidence/)
  }

  const numericalMiniLabSource = read('src/modules/math-lab/labs/NumericalMiniLab.vue')
  assert.match(numericalMiniLabSource, /retainedEnergy/)
  assert.match(numericalMiniLabSource, /spectralError/)
  assert.match(numericalMiniLabSource, /rayleighQuotient/)
  assert.match(numericalMiniLabSource, /residualNorm/)

  const pcaProjectionLabSource = read('src/modules/math-lab/labs/PcaProjectionLab.vue')
  assert.match(pcaProjectionLabSource, /retainedVariance/)
  assert.match(pcaProjectionLabSource, /reconstructionRmse/)

  const shellSource = read('src/modules/math-lab/components/ThreeSceneShell.vue')
  assert.match(shellSource, /onBeforeUnmount/)
  assert.match(shellSource, /controller\.dispose\(\)/)

  const playerSource = read('src/modules/math-lab/components/ManimPlayer.vue')
  assert.match(playerSource, /<video/)
  assert.match(playerSource, /data-asset-path/)

  const homeViewSource = read('src/views/HomeView.vue')
  const mathLabHomeSource = read('src/modules/math-lab/pages/MathLabHome.vue')
  const routeSummarySource = read('src/modules/math-lab/components/LearningRouteSummary.vue')
  const routeDashboardSource = read('src/modules/math-lab/components/LearningRouteDashboard.vue')

  assert.match(homeViewSource, /LearningRouteSummary/)
  assert.match(homeViewSource, /learningRoutes/)
  assert.match(homeViewSource, /import type \{ LearningRouteId \} from '\.\.\/modules\/math-lab\/types\/mathLab'/)
  assert.match(homeViewSource, /const highlightedLearningRouteIds: readonly LearningRouteId\[\]/)
  assert.match(homeViewSource, /const mathLabProgress = ref\(loadMathLabProgress\(\)\)/)
  assert.match(homeViewSource, /function refreshMathLabProgress\(\)/)
  assert.match(homeViewSource, /window\.addEventListener\('focus', refreshMathLabProgress\)/)
  assert.match(homeViewSource, /document\.addEventListener\('visibilitychange', handleProgressVisibilityChange\)/)
  assert.match(homeViewSource, /window\.addEventListener\('storage', handleProgressStorageEvent\)/)
  assert.match(homeViewSource, /onBeforeUnmount\(\(\) =>/)
  assert.match(homeViewSource, /window\.removeEventListener\('focus', refreshMathLabProgress\)/)
  assert.match(homeViewSource, /document\.removeEventListener\('visibilitychange', handleProgressVisibilityChange\)/)
  assert.match(homeViewSource, /window\.removeEventListener\('storage', handleProgressStorageEvent\)/)
  assert.match(mathLabHomeSource, /LearningRouteDashboard/)
  assert.match(mathLabHomeSource, /linear-algebra-route/)
  assert.match(routeSummarySource, /completedCount/)
  assert.match(routeSummarySource, /nextModuleId/)
  assert.match(routeDashboardSource, /reportStatus/)
  assert.match(routeDashboardSource, /checkpointReportForModule/)
  assert.match(routeDashboardSource, /type ReportStatus = 'complete' \| 'draft' \| 'not-started' \| 'unavailable'/)
  assert.match(routeDashboardSource, /const checkpointReportStates = ref/)
  assert.match(routeDashboardSource, /function refreshCheckpointReports\(\)/)
  assert.match(routeDashboardSource, /loadCheckpointReport\(moduleDefinition\.id\)/)
  assert.match(routeDashboardSource, /function exportRouteMarkdown\(\)/)
  assert.match(routeDashboardSource, /buildCheckpointReportMarkdown/)
  assert.match(routeDashboardSource, /createDefaultCheckpointReport/)
  assert.match(routeDashboardSource, /Export route report/)
  assert.match(routeDashboardSource, /window\.addEventListener\('focus', refreshCheckpointReports\)/)
  assert.match(routeDashboardSource, /document\.addEventListener\('visibilitychange', handleReportVisibilityChange\)/)
  assert.match(routeDashboardSource, /window\.addEventListener\('storage', handleReportStorageEvent\)/)
  assert.match(routeDashboardSource, /onBeforeUnmount\(\(\) =>/)
  assert.match(routeDashboardSource, /window\.removeEventListener\('focus', refreshCheckpointReports\)/)
  assert.match(routeDashboardSource, /document\.removeEventListener\('visibilitychange', handleReportVisibilityChange\)/)
  assert.match(routeDashboardSource, /window\.removeEventListener\('storage', handleReportStorageEvent\)/)
  assert.match(routeDashboardSource, /报告完成/)
  assert.match(routeDashboardSource, /Report complete/)
  assert.match(routeDashboardSource, /报告草稿/)
  assert.match(routeDashboardSource, /Report draft/)
  assert.match(routeDashboardSource, /待填写/)
  assert.match(routeDashboardSource, /Not started/)

  const reportStatusBody = routeDashboardSource.match(/function reportStatus\(moduleId: MathLabModuleId\) \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.doesNotMatch(reportStatusBody, /loadCheckpointReport/)

  const modulePageSource = read('src/modules/math-lab/pages/MathLabModulePage.vue')
  assert.match(modulePageSource, /asset\.type === 'image'/)
  assert.match(modulePageSource, /math-visual-asset/)
  assert.match(modulePageSource, /defineAsyncComponent/)
  assert.match(modulePageSource, /labComponentRegistry/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/VectorDotProductLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/VectorSimilarityLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/FeatureVectorStoryLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/LocalChangeStoryLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/BackpropBlockLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/DistributionBuilderLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/ConditionalBayesLab\.vue'\)/)
  assert.match(modulePageSource, /import\('\.\.\/labs\/MatrixColumnSpaceLab\.vue'\)/)
  assert.match(modulePageSource, /CheckpointReportCard/)
  assert.match(modulePageSource, /ObservationPrompt/)
  assert.match(modulePageSource, /checkpointReportForModule/)
  assert.match(modulePageSource, /observationPromptForModule/)
  assert.match(modulePageSource, /onExperimentEvidence/)
  assert.match(modulePageSource, /function onExperimentEvidence\(evidence: ExperimentEvidence \| undefined\)/)
  assert.match(modulePageSource, /delete nextEvidence\[prompt\.moduleId\]/)
  assert.match(modulePageSource, /@evidence-change="onExperimentEvidence"/)
  assert.doesNotMatch(modulePageSource, /import VectorDotProductLab from/)
  assert.doesNotMatch(modulePageSource, /sourceReferences/)

  const reportCardSource = read('src/modules/math-lab/components/CheckpointReportCard.vue')
  const mathLabStyles = read('src/styles/modules/math-lab.css')
  const observationPromptSource = read('src/modules/math-lab/components/ObservationPrompt.vue')
  assert.match(reportCardSource, /saveCheckpointReport/)
  assert.match(reportCardSource, /buildCheckpointReportMarkdown/)
  assert.match(reportCardSource, /textarea/)
  assert.match(reportCardSource, /download/)
  assert.match(reportCardSource, /watch\(\s*\(\) => props\.prompt\.moduleId/)
  assert.match(reportCardSource, /const liveEvidence = ref<ExperimentEvidence \| undefined>/)
  assert.match(reportCardSource, /liveEvidence\.value \?\? report\.evidence \?\? props\.prompt\.staticEvidence/)
  assert.match(reportCardSource, /evidence\.moduleId !== props\.prompt\.moduleId/)
  assert.match(reportCardSource, /document\.body\.appendChild\(link\)/)
  assert.match(reportCardSource, /queueMicrotask/)
  assert.match(reportCardSource, /role="status"/)
  assert.match(reportCardSource, /aria-live/)
  assert.match(reportCardSource, /type="button"/)
  assert.match(reportCardSource, /:id="textareaId\(field\.key\)"/)
  assert.match(reportCardSource, /:name="textareaName\(field\.key\)"/)
  assert.match(routeDashboardSource, /aria-label/)
  assert.match(mathLabStyles, /grid-template-columns:\s*repeat\(auto-fit/)
  assert.match(mathLabStyles, /@media \(max-width: 720px\)/)
  assert.match(observationPromptSource, /targetLabId/)

  const matrixColumnSpaceSource = read('src/modules/math-lab/labs/MatrixColumnSpaceLab.vue')
  assert.match(matrixColumnSpaceSource, /matrixColumns2x2/)
  assert.match(matrixColumnSpaceSource, /rank2x2/)
  assert.match(matrixColumnSpaceSource, /columnSpaceKind2x2/)
  assert.match(matrixColumnSpaceSource, /nullDirection2x2/)
  assert.match(matrixColumnSpaceSource, /matrixVectorMultiply/)
  assert.match(matrixColumnSpaceSource, /x1/)
  assert.match(matrixColumnSpaceSource, /x2/)
  assert.match(matrixColumnSpaceSource, /rank/i)
  assert.match(matrixColumnSpaceSource, /column space/i)
  assert.match(matrixColumnSpaceSource, /列空间/)
  assert.match(matrixColumnSpaceSource, /useId\(\)/)
  assert.match(matrixColumnSpaceSource, /markerIds/)
  assert.match(matrixColumnSpaceSource, /:id="markerIds\.a1"/)
  assert.match(matrixColumnSpaceSource, /:marker-end="`url\(#\$\{markerIds\.a1\}\)`"/)
  assert.match(matrixColumnSpaceSource, /controlDrafts/)
  assert.match(matrixColumnSpaceSource, /function updateControlDraft/)
  assert.match(matrixColumnSpaceSource, /controlDrafts\[key\] = rawValue/)
  assert.match(matrixColumnSpaceSource, /function commitControlDraft/)
  assert.match(matrixColumnSpaceSource, /const parsedValue = Number\(draftValue\)/)
  assert.match(matrixColumnSpaceSource, /if \(!Number\.isFinite\(parsedValue\)\) return/)
  assert.match(matrixColumnSpaceSource, /function restoreControlDraft/)
  assert.match(matrixColumnSpaceSource, /restoreControlDraft\(key\)/)
  assert.match(matrixColumnSpaceSource, /type="text"/)
  assert.match(matrixColumnSpaceSource, /inputmode="decimal"/)
  assert.match(matrixColumnSpaceSource, /:value="control\.draft"/)
  assert.match(matrixColumnSpaceSource, /@input="updateControlDraft\(control\.key, \$event\)"/)
  assert.match(matrixColumnSpaceSource, /@blur="commitControlDraft\(control\.key\)"/)
  assert.match(matrixColumnSpaceSource, /@keyup\.enter="commitControlDraft\(control\.key\)"/)
  assert.doesNotMatch(matrixColumnSpaceSource, /commitControlInput/)
  assert.doesNotMatch(matrixColumnSpaceSource, /function updateControlDraft[\s\S]*target\.value = formatNumber/)

  const vectorSimilaritySource = read('src/modules/math-lab/labs/VectorSimilarityLab.vue')
  assert.match(vectorSimilaritySource, /const objectVectors/)
  assert.match(vectorSimilaritySource, /id: 'cat'/)
  assert.match(vectorSimilaritySource, /id: 'dog'/)
  assert.match(vectorSimilaritySource, /id: 'car'/)
  assert.match(vectorSimilaritySource, /selectedLeftId/)
  assert.match(vectorSimilaritySource, /selectedRightId/)
  assert.match(vectorSimilaritySource, /weightControls/)
  assert.match(vectorSimilaritySource, /type="range"/)
  assert.match(vectorSimilaritySource, /weightedDistance/)
  assert.match(vectorSimilaritySource, /weightedDot/)
  assert.match(vectorSimilaritySource, /weightedCosine/)
  assert.match(vectorSimilaritySource, /zeroVectorNote/)
  assert.match(vectorSimilaritySource, /hasActiveWeights/)
  assert.match(vectorSimilaritySource, /unavailablePairLabel/)
  assert.match(vectorSimilaritySource, /v-if="hasActiveWeights"/)
  assert.match(vectorSimilaritySource, /studentAnswer/)
  assert.match(vectorSimilaritySource, /referenceAnswer/)
  assert.match(vectorSimilaritySource, /scorePercent/)
  assert.match(vectorSimilaritySource, /hasActiveRubricWeights/)
  assert.match(vectorSimilaritySource, /unavailableRubricLabel/)
  assert.match(vectorSimilaritySource, /v-if="hasActiveRubricWeights"/)

  const homeSource = read('src/modules/math-lab/pages/MathLabHome.vue')
  assert.match(homeSource, /math-beginner-bridge/)
  assert.match(homeSource, /beginner-linear-algebra-story\.png/)
  assert.match(homeSource, /beginner-calculus-story\.png/)
  assert.match(homeSource, /beginner-probability-story\.png/)
  assert.match(homeSource, /\/math-lab\/modules\/beginner-linear-algebra/)
  assert.match(homeSource, /\/math-lab\/modules\/calculus-functions-rate-change/)
  assert.doesNotMatch(homeSource, /\/math-lab\/modules\/beginner-calculus/)
  assert.match(homeSource, /\/math-lab\/modules\/beginner-probability-distributions/)
  assert.match(homeSource, /withPublicBase/)
})

test('learning route summary renders progress, next module, and action link', async () => {
  let expectedNextTitle = ''
  let expectedNextRoute = ''
  const html = await renderSfcWithVite(
    '/src/modules/math-lab/components/LearningRouteSummary.vue',
    async (server) => {
      const { learningRouteById } = await server.ssrLoadModule('/src/modules/math-lab/data/learningRoutes.ts')
      const { mathLabModules } = await server.ssrLoadModule('/src/modules/math-lab/data/modules.ts')
      const route = learningRouteById['linear-algebra-route']
      const nextModule = mathLabModules.find((moduleDefinition) => moduleDefinition.id === route.chapterModuleIds[1])
      expectedNextTitle = nextModule.title.en
      expectedNextRoute = `/math-lab/modules/${route.chapterModuleIds[1]}`
      return {
        route,
        modules: mathLabModules,
        completedModuleIds: [route.chapterModuleIds[0]],
        locale: 'en',
      }
    },
  )

  assert.match(html, /Linear Algebra Route/)
  assert.match(html, /1 \/ 7/)
  assert.match(html, new RegExp(expectedNextTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(html, new RegExp(`href="${expectedNextRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
})

test('learning route dashboard renders checkpoint report states from storage', async () => {
  const storage = createMemoryStorage()
  const previousWindow = globalThis.window

  const html = await renderSfcWithVite(
    '/src/modules/math-lab/components/LearningRouteDashboard.vue',
    async (server) => {
      const { learningRouteById } = await server.ssrLoadModule('/src/modules/math-lab/data/learningRoutes.ts')
      const { mathLabModules } = await server.ssrLoadModule('/src/modules/math-lab/data/modules.ts')
      const {
        checkpointReportStorageKey,
        createDefaultCheckpointReport,
        saveCheckpointReport,
      } = await server.ssrLoadModule('/src/modules/math-lab/utils/checkpointReports.ts')
      const route = learningRouteById['linear-algebra-route']
      const draftModuleId = route.chapterModuleIds[1]
      const completeModuleId = route.chapterModuleIds[2]

      const draftReport = createDefaultCheckpointReport(route.id, draftModuleId)
      saveCheckpointReport({ ...draftReport, answers: { ...draftReport.answers, setup: 'short draft setup' } }, storage)

      const completeReport = createDefaultCheckpointReport(route.id, completeModuleId)
      saveCheckpointReport({
        ...completeReport,
        answers: {
          setup: 'This setup is long enough for the checkpoint report.',
          observation: 'This observation is long enough for the checkpoint report.',
          explanation: 'This explanation connects the visual evidence to the math concept clearly.',
          nextStep: 'This next step is long enough for the checkpoint report.',
        },
        completed: true,
      }, storage)

      assert.ok(storage.getItem(checkpointReportStorageKey(draftModuleId)))
      assert.ok(storage.getItem(checkpointReportStorageKey(completeModuleId)))

      return {
        route,
        modules: mathLabModules,
        completedModuleIds: [],
        locale: 'en',
      }
    },
    () => {
      globalThis.window = { localStorage: storage }
    },
  ).finally(() => {
    if (previousWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = previousWindow
    }
  })

  assert.match(html, /Not started/)
  assert.match(html, /Report draft/)
  assert.match(html, /Report complete/)
})

test('checkpoint report card renders static evidence and four answer fields', async () => {
  const html = await renderSfcWithVite(
    '/src/modules/math-lab/components/CheckpointReportCard.vue',
    async (server) => {
      const { checkpointReportForModule } = await server.ssrLoadModule('/src/modules/math-lab/data/checkpointReports.ts')
      const { mathLabModules } = await server.ssrLoadModule('/src/modules/math-lab/data/modules.ts')
      return {
        prompt: checkpointReportForModule('linear-algebra-feature-space'),
        modules: mathLabModules,
        locale: 'en',
      }
    },
  )

  assert.match(html, /The same object becomes an ordered set of feature coordinates/)
  assert.equal([...html.matchAll(/<textarea/g)].length, 4)
  assert.match(html, /id="linear-algebra-feature-space-setup-report-answer"/)
  assert.match(html, /name="linear-algebra-feature-space-setup"/)
})

test('checkpoint report card renders dynamic evidence over static evidence', async () => {
  const html = await renderSfcWithVite(
    '/src/modules/math-lab/components/CheckpointReportCard.vue',
    async (server) => {
      const { checkpointReportForModule } = await server.ssrLoadModule('/src/modules/math-lab/data/checkpointReports.ts')
      const { mathLabModules } = await server.ssrLoadModule('/src/modules/math-lab/data/modules.ts')
      return {
        prompt: checkpointReportForModule('linear-algebra-feature-space'),
        evidence: {
          moduleId: 'linear-algebra-feature-space',
          sourceId: 'feature-vector-story-lab',
          summary: {
            'zh-CN': '动态证据摘要',
            en: 'Dynamic feature evidence summary',
          },
          metrics: [
            {
              label: { 'zh-CN': '动态指标', en: 'Dynamic metric' },
              value: 42,
              unit: { 'zh-CN': '次', en: 'trials' },
            },
          ],
          prompt: {
            'zh-CN': '解释动态证据。',
            en: 'Explain the dynamic evidence.',
          },
        },
        modules: mathLabModules,
        locale: 'en',
      }
    },
  )

  assert.match(html, /Dynamic feature evidence summary/)
  assert.match(html, /Dynamic metric/)
  assert.match(html, /42 trials/)
  assert.doesNotMatch(html, /The same object becomes an ordered set of feature coordinates/)
})

test('checkpoint report card renders saved draft answers from storage', async () => {
  const previousWindow = globalThis.window
  try {
    const storageKey = 'ml-atlas:checkpoint-report:linear-algebra-feature-space'
    globalThis.window = {
      localStorage: createMemoryStorage([
        [
          storageKey,
          JSON.stringify({
            routeId: 'linear-algebra-route',
            moduleId: 'linear-algebra-feature-space',
            answers: {
              setup: 'Saved setup answer',
              observation: 'Saved observation answer',
              explanation: 'Saved explanation answer',
              nextStep: 'Saved next step answer',
            },
            completed: true,
            updatedAt: '2026-06-24T00:00:00.000Z',
          }),
        ],
      ]),
    }

    const html = await renderSfcWithVite(
      '/src/modules/math-lab/components/CheckpointReportCard.vue',
      async (server) => {
        const { checkpointReportForModule } = await server.ssrLoadModule('/src/modules/math-lab/data/checkpointReports.ts')
        const { mathLabModules } = await server.ssrLoadModule('/src/modules/math-lab/data/modules.ts')
        return {
          prompt: checkpointReportForModule('linear-algebra-feature-space'),
          modules: mathLabModules,
          locale: 'en',
        }
      },
    )

    assert.match(html, /Saved setup answer/)
    assert.match(html, /Saved observation answer/)
    assert.match(html, /Saved explanation answer/)
    assert.match(html, /Saved next step answer/)
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = previousWindow
    }
  }
})

test('checkpoint report card preserves saved evidence when no live evidence is provided', async () => {
  const previousWindow = globalThis.window
  try {
    const storageKey = 'ml-atlas:checkpoint-report:linear-algebra-feature-space'
    globalThis.window = {
      localStorage: createMemoryStorage([
        [
          storageKey,
          JSON.stringify({
            routeId: 'linear-algebra-route',
            moduleId: 'linear-algebra-feature-space',
            answers: {
              setup: 'Saved setup answer',
              observation: 'Saved observation answer',
              explanation: 'Saved explanation answer',
              nextStep: 'Saved next step answer',
            },
            evidence: {
              moduleId: 'linear-algebra-feature-space',
              sourceId: 'saved-feature-vector-story-lab',
              summary: {
                'zh-CN': '已保存证据摘要',
                en: 'Saved evidence summary from draft',
              },
              metrics: [
                {
                  label: { 'zh-CN': '已保存指标', en: 'Saved evidence metric' },
                  value: 'saved-value',
                },
              ],
              prompt: {
                'zh-CN': '解释已保存证据。',
                en: 'Explain the saved evidence.',
              },
            },
            completed: true,
            updatedAt: '2026-06-24T00:00:00.000Z',
          }),
        ],
      ]),
    }

    const html = await renderSfcWithVite(
      '/src/modules/math-lab/components/CheckpointReportCard.vue',
      async (server) => {
        const { checkpointReportForModule } = await server.ssrLoadModule('/src/modules/math-lab/data/checkpointReports.ts')
        const { mathLabModules } = await server.ssrLoadModule('/src/modules/math-lab/data/modules.ts')
        return {
          prompt: checkpointReportForModule('linear-algebra-feature-space'),
          modules: mathLabModules,
          locale: 'en',
        }
      },
    )

    assert.match(html, /Saved evidence summary from draft/)
    assert.match(html, /Saved evidence metric/)
    assert.match(html, /saved-value/)
    assert.doesNotMatch(html, /The same object becomes an ordered set of feature coordinates/)
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = previousWindow
    }
  }
})

test('matrix transform lab emits initial and updated dynamic checkpoint evidence', async () => {
  const evidenceEvents = []
  const mounted = await mountClientSfc('/src/modules/math-lab/labs/MatrixTransformLab.vue', {
    locale: 'en',
    onEvidenceChange: (evidence) => evidenceEvents.push(evidence),
  })

  try {
    assert.ok(evidenceEvents.length >= 1)
    const initialEvidence = evidenceEvents.at(-1)
    assert.equal(initialEvidence.moduleId, 'linear-algebra-matrix-transformations')
    assert.equal(initialEvidence.sourceId, 'matrix-transform-lab')
    assert.match(String(metricValue(initialEvidence, 'Matrix W')), /\[1\.2, 0\.6\]/)

    const firstMatrixInput = flattenRenderedNodes(mounted.container).find((node) => node.type === 'input')
    assert.ok(firstMatrixInput, 'expected a matrix control input')
    firstMatrixInput.value = '2'
    dispatchNodeEvent(firstMatrixInput, 'input', { target: firstMatrixInput })
    await mounted.update()

    const updatedEvidence = evidenceEvents.at(-1)
    assert.notEqual(metricValue(updatedEvidence, 'Matrix W'), metricValue(initialEvidence, 'Matrix W'))
    assert.equal(metricValue(updatedEvidence, 'Probe x'), '(1.5, -0.5)')
    assert.equal(metricValue(updatedEvidence, 'W x'), '(2.7, -0.95)')
    assert.match(String(metricValue(updatedEvidence, 'column combination')), /1\.5 W e1 \+ -0\.5 W e2/)
  } finally {
    await mounted.unmount()
  }
})

test('vector similarity lab evidence includes distance and similarity ranking readouts', async () => {
  const evidenceEvents = await collectSsrEvidence('/src/modules/math-lab/labs/VectorSimilarityLab.vue', {
    locale: 'en',
  })

  assert.equal(evidenceEvents.length, 1)
  assert.equal(evidenceEvents[0].moduleId, 'linear-algebra-distance-similarity')
  assert.equal(evidenceEvents[0].sourceId, 'vector-similarity-lab')
  assert.ok(metricValue(evidenceEvents[0], 'Closest pair'))
  assert.ok(metricValue(evidenceEvents[0], 'Most similar pair'))
})

test('numerical mini lab emits evidence only for power iteration and svd modules', async () => {
  const powerEvidenceEvents = await collectSsrEvidence('/src/modules/math-lab/labs/NumericalMiniLab.vue', {
    moduleId: 'eigenvalues-eigenvectors',
    locale: 'en',
  })
  assert.equal(powerEvidenceEvents.length, 1)
  assert.equal(powerEvidenceEvents[0].moduleId, 'eigenvalues-eigenvectors')
  assert.equal(powerEvidenceEvents[0].sourceId, 'eigen-power-iteration-lab')
  assert.ok(metricValue(powerEvidenceEvents[0], 'Rayleigh quotient'))
  assert.ok(metricValue(powerEvidenceEvents[0], 'residual'))

  const svdEvidenceEvents = await collectSsrEvidence('/src/modules/math-lab/labs/NumericalMiniLab.vue', {
    moduleId: 'svd',
    locale: 'zh-CN',
  })
  assert.equal(svdEvidenceEvents.length, 1)
  assert.equal(svdEvidenceEvents[0].moduleId, 'svd')
  assert.equal(svdEvidenceEvents[0].sourceId, 'svd-low-rank-lab')
  assert.ok(svdEvidenceEvents[0].metrics.some((metric) => metric.label['zh-CN'] === '保留能量'))
  assert.ok(svdEvidenceEvents[0].metrics.some((metric) => metric.label['zh-CN'] === '谱误差'))
  assert.ok(svdEvidenceEvents[0].metrics.some((metric) => metric.label['zh-CN'] === 'Frobenius 误差'))

  const taylorEvidenceEvents = await collectSsrEvidence('/src/modules/math-lab/labs/NumericalMiniLab.vue', {
    moduleId: 'taylor-series',
    locale: 'en',
  })
  assert.equal(taylorEvidenceEvents.length, 0)
})

test('pca projection lab emits localized evidence labels for projection metrics', async () => {
  const evidenceEvents = await collectSsrEvidence('/src/modules/math-lab/labs/PcaProjectionLab.vue', {
    locale: 'zh-CN',
  })

  assert.equal(evidenceEvents.length, 1)
  assert.equal(evidenceEvents[0].moduleId, 'pca')
  assert.equal(evidenceEvents[0].sourceId, 'pca-projection-lab')
  assert.ok(evidenceEvents[0].metrics.some((metric) => metric.label['zh-CN'] === '解释方差'))
  assert.ok(evidenceEvents[0].metrics.some((metric) => metric.label['zh-CN'] === '重建误差'))
})

test('math lab uses generated imported notes and local migrated assets', () => {
  assert.ok(existsSync(new URL('src/modules/math-lab/data/mathFoundationsModules.ts', root)))
  assert.ok(existsSync(new URL('src/modules/math-lab/data/beginnerFoundationModules.ts', root)))
  assert.ok(existsSync(new URL('src/modules/math-lab/data/aiBridgeModules.ts', root)))
  assert.ok(existsSync(new URL('src/modules/math-lab/data/calculusRouteModules.ts', root)))
  assert.ok(existsSync(new URL('scripts/import-cs357-notes.mjs', root)))
  assert.ok(existsSync(new URL('src/modules/math-lab/data/importedMathNotes.generated.ts', root)))
  assert.ok(existsSync(new URL('docs/math-lab-linear-algebra-route-sources.md', root)))
  assert.ok(existsSync(new URL('docs/math-lab-calculus-route-sources.md', root)))
  assert.ok(existsSync(new URL('public/math-lab/cs357-assets/figs', root)))

  const modulesSource = read('src/modules/math-lab/data/modules.ts')
  assert.match(modulesSource, /importedMathNotes/)
  assert.match(modulesSource, /beginnerFoundationModules/)
  assert.match(modulesSource, /linearAlgebraRouteModules/)
  assert.match(modulesSource, /calculusRouteModules/)
  assert.match(modulesSource, /mathFoundationsModules/)
  assert.match(modulesSource, /aiBridgeModules/)

  const generatedSource = read('src/modules/math-lab/data/importedMathNotes.generated.ts')
  assert.match(generatedSource, /Taylor Series/)
  assert.match(generatedSource, /Principal Component Analysis/)
  assert.match(generatedSource, /\/math-lab\/cs357-assets\/figs\/pca_center_combined\.png/)
  assert.doesNotMatch(generatedSource, /CS\s*357|Course Staff|changelog|site\.baseurl/)
})

test('migrated note figures are stored locally', () => {
  const keyAssets = [
    'public/math-lab/cs357-assets/figs/vector_example.png',
    'public/math-lab/cs357-assets/figs/lu_2x2.png',
    'public/math-lab/cs357-assets/figs/page_rank.png',
    'public/math-lab/cs357-assets/figs/finite_diff_errors.png',
    'public/math-lab/cs357-assets/figs/steepest_contour_map_1.png',
    'public/math-lab/cs357-assets/figs/svd_graph.png',
    'public/math-lab/cs357-assets/figs/reduced_svd.svg',
    'public/math-lab/cs357-assets/figs/pca_center_combined.png',
    'public/math-lab/cs357-assets/figs/pca_covar_diag.png',
    'public/math-lab/generated/monte-carlo-sampling-illustration.png',
    'public/math-lab/generated/vector-matrix-norms-illustration.png',
    'public/math-lab/generated/beginner-linear-algebra-story.png',
    'public/math-lab/generated/beginner-calculus-story.png',
    'public/math-lab/generated/beginner-probability-story.png',
    'public/math-lab/generated/beginner-derivative-window-longform.png',
    'public/math-lab/generated/beginner-partial-gradient-longform.png',
    'public/math-lab/generated/beginner-chain-rule-backprop-longform.png',
    'public/math-lab/generated/beginner-learning-rate-behavior-longform.png',
    'public/math-lab/generated/beginner-probability-why-longform.png',
    'public/math-lab/generated/beginner-conditional-probability-longform.png',
    'public/math-lab/generated/beginner-bayes-update-longform.png',
    'public/math-lab/generated/beginner-calibration-confidence-longform.png',
    'public/math-lab/generated/linear-algebra-feature-cards.png',
    'public/math-lab/generated/vector-distance-norm-intuition.png',
    'public/math-lab/generated/cosine-vs-distance-intuition.png',
    'public/math-lab/generated/high-dimensional-embedding-search.png',
    'public/math-lab/generated/matrix-column-combination.png',
    'public/math-lab/generated/column-space-rank-intuition.png',
    'public/math-lab/generated/null-space-invisible-direction.png',
  ]

  for (const assetPath of keyAssets) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }

  const beginnerSource = read('src/modules/math-lab/data/beginnerFoundationModules.ts')
  const vectorNormsSource = read('src/modules/math-lab/data/vectorMatrixNormsModule.ts')
  const linearAlgebraRouteSource = read('src/modules/math-lab/data/linearAlgebraRouteModules.ts')
  const beginnerSourcesDoc = read('docs/math-lab-beginner-bridge-sources.md')
  const linearAlgebraRouteDoc = read('docs/math-lab-linear-algebra-route-sources.md')
  for (const assetPath of [
    'linear-algebra-feature-cards.png',
    'vector-distance-norm-intuition.png',
    'cosine-vs-distance-intuition.png',
    'high-dimensional-embedding-search.png',
  ]) {
    assert.match(beginnerSource, new RegExp(assetPath.replace('.', '\\.')))
    assert.match(beginnerSourcesDoc, new RegExp(assetPath.replace('.', '\\.')))
  }

  for (const assetPath of [
    'matrix-column-combination.png',
    'column-space-rank-intuition.png',
    'null-space-invisible-direction.png',
  ]) {
    assert.match(vectorNormsSource, new RegExp(assetPath.replace('.', '\\.')))
    assert.match(beginnerSourcesDoc, new RegExp(assetPath.replace('.', '\\.')))
  }

  for (const assetPath of [
    'linear-algebra-feature-cards.png',
    'vector-distance-norm-intuition.png',
    'cosine-vs-distance-intuition.png',
    'high-dimensional-embedding-search.png',
    'matrix-column-combination.png',
    'column-space-rank-intuition.png',
    'null-space-invisible-direction.png',
  ]) {
    assert.match(linearAlgebraRouteSource, new RegExp(assetPath.replace('.', '\\.')))
    assert.match(linearAlgebraRouteDoc, new RegExp(assetPath.replace('.', '\\.')))
  }
})

test('manim pipeline and existing math lab video assets remain present', () => {
  assert.ok(existsSync(new URL('scripts/manim/scenes/math_lab_basics.py', root)))
  assert.ok(existsSync(new URL('scripts/manim/render_math_lab.py', root)))

  const metadata = JSON.parse(read('public/manim/math-lab/metadata.json'))
  assert.equal(metadata.scenes.length, 19)
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'VectorSpanNormScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'TaylorPolynomialScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'MonteCarloSamplingScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'BeginnerDerivativeWindowScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'BeginnerChainRuleBackpropScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'BeginnerLearningRateBehaviorScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'BeginnerProbabilityFrequencyScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'BeginnerConditionalBayesScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'BeginnerCalibrationCrossEntropyScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'SvdLowRankReconstructionScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'PcaCenteringProjectionScene'))

  for (const scene of metadata.scenes) {
    const assetPath = scene.assetPath.replace(/^\//, 'public/')
    const posterPath = scene.posterPath.replace(/^\//, 'public/')
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
    assert.ok(existsSync(new URL(posterPath, root)), `${posterPath} should exist`)
  }
})

test('linear algebra route Manim scenes are registered', () => {
  const sceneSource = read('scripts/manim/scenes/math_lab_basics.py')
  const renderSource = read('scripts/manim/render_math_lab.py')
  const metadata = JSON.parse(read('public/manim/math-lab/metadata.json'))

  for (const sceneName of [
    'VectorDistanceNormScene',
    'CosineSimilarityAngleScene',
    'MatrixColumnCombinationScene',
    'RankFlatteningScene',
    'NullSpaceCollapseScene',
    'SvdLowRankReconstructionScene',
    'PcaCenteringProjectionScene',
  ]) {
    assert.match(sceneSource, new RegExp(`class ${sceneName}`))
    assert.match(renderSource, new RegExp(sceneName))
    assert.ok(metadata.scenes.some((scene) => scene.scene === sceneName), `${sceneName} should be in metadata`)
  }

  for (const assetPath of [
    'public/manim/math-lab/vector-distance-norm.mp4',
    'public/manim/math-lab/vector-distance-norm.svg',
    'public/manim/math-lab/cosine-similarity-angle.mp4',
    'public/manim/math-lab/cosine-similarity-angle.svg',
    'public/manim/math-lab/matrix-column-combination.mp4',
    'public/manim/math-lab/matrix-column-combination.svg',
    'public/manim/math-lab/rank-flattening.mp4',
    'public/manim/math-lab/rank-flattening.svg',
    'public/manim/math-lab/null-space-collapse.mp4',
    'public/manim/math-lab/null-space-collapse.svg',
    'public/manim/math-lab/svd-low-rank-reconstruction.mp4',
    'public/manim/math-lab/svd-low-rank-reconstruction.svg',
    'public/manim/math-lab/pca-centering-projection.mp4',
    'public/manim/math-lab/pca-centering-projection.svg',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }
})

test('beginner calculus Manim labels avoid code-like gradient variable names', () => {
  const sceneSource = read('scripts/manim/scenes/math_lab_basics.py')
  const renderSource = read('scripts/manim/render_math_lab.py')
  const chainPoster = read('public/manim/math-lab/beginner-chain-rule-backprop.svg')
  const learningRatePoster = read('public/manim/math-lab/beginner-learning-rate-behavior.svg')
  const checkedSources = [sceneSource, renderSource, chainPoster, learningRatePoster]

  for (const source of checkedSources) {
    assert.doesNotMatch(source, /dyhat|dL\/dyhat|dyhat\/dz|dL\/dw|dL\/db|small eta|steady eta|large eta/)
  }

  assert.match(sceneSource, /∂L\/∂ŷ/)
  assert.match(sceneSource, /∂ŷ\/∂z/)
  assert.match(sceneSource, /∂z\/∂w/)
  assert.match(sceneSource, /small η/)
})

test('beginner probability Manim assets and labels are registered', () => {
  const sceneSource = read('scripts/manim/scenes/math_lab_basics.py')
  const renderSource = read('scripts/manim/render_math_lab.py')

  for (const sceneName of [
    'BeginnerProbabilityFrequencyScene',
    'BeginnerConditionalBayesScene',
    'BeginnerCalibrationCrossEntropyScene',
  ]) {
    assert.match(sceneSource, new RegExp(`class ${sceneName}`))
    assert.match(renderSource, new RegExp(sceneName))
  }

  for (const assetPath of [
    'public/manim/math-lab/beginner-probability-frequency.mp4',
    'public/manim/math-lab/beginner-probability-frequency.svg',
    'public/manim/math-lab/beginner-conditional-bayes.mp4',
    'public/manim/math-lab/beginner-conditional-bayes.svg',
    'public/manim/math-lab/beginner-calibration-cross-entropy.mp4',
    'public/manim/math-lab/beginner-calibration-cross-entropy.svg',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }

  assert.match(sceneSource, /posterior = prior × likelihood \/ evidence/)
  assert.match(sceneSource, /loss = -log\(p_true\)/)
  assert.doesNotMatch(sceneSource, /ptrue|baseRate|falseAlarm/)
})

test('AI bridge generated images, source record, and Manim assets are complete', () => {
  assert.ok(existsSync(new URL('docs/math-lab-ai-foundation-sources.md', root)))
  assert.ok(existsSync(new URL('scripts/manim/scenes/ai_bridge_math.py', root)))
  assert.ok(existsSync(new URL('scripts/manim/render_ai_bridge.py', root)))

  const sourceRecord = read('docs/math-lab-ai-foundation-sources.md')
  for (const moduleId of [
    'tensor-shapes-vectorization',
    'matrix-calculus-autodiff',
    'probability-likelihood-entropy',
    'training-diagnostics',
    'deep-architecture-math',
  ]) {
    assert.match(sourceRecord, new RegExp(moduleId))
  }

  for (const assetPath of [
    'public/math-lab/ai-bridge/generated/tensor-shape-pipeline.png',
    'public/math-lab/ai-bridge/generated/autodiff-local-linearization.png',
    'public/math-lab/ai-bridge/generated/probability-simplex.png',
    'public/math-lab/ai-bridge/generated/training-diagnostics-dashboard.png',
    'public/math-lab/ai-bridge/generated/architecture-stack.png',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }

  const metadata = JSON.parse(read('public/manim/math-ai/metadata.json'))
  assert.equal(metadata.generatedBy, 'scripts/manim/render_ai_bridge.py')
  assert.equal(metadata.scenes.length, 5)
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'TensorBroadcastingScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'AutodiffVjpFlowScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'SoftmaxCrossEntropyScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'TrainingLossDiagnosticsScene'))
  assert.ok(metadata.scenes.some((scene) => scene.scene === 'AttentionConvResidualScene'))

  for (const scene of metadata.scenes) {
    const assetPath = scene.assetPath.replace(/^\//, 'public/')
    const posterPath = scene.posterPath.replace(/^\//, 'public/')
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
    assert.ok(existsSync(new URL(posterPath, root)), `${posterPath} should exist`)
  }
})

test('AI bridge labs use deterministic D3 and Three.js upgrades', () => {
  const labSources = {
    tensor: read('src/modules/math-lab/labs/TensorShapeLab.vue'),
    autodiff: read('src/modules/math-lab/labs/AutodiffGraphLab.vue'),
    probability: read('src/modules/math-lab/labs/ProbabilityEntropyLab.vue'),
    diagnostics: read('src/modules/math-lab/labs/TrainingDiagnosticsLab.vue'),
    architecture: read('src/modules/math-lab/labs/ArchitectureMathLab.vue'),
  }

  assert.match(labSources.tensor, /import \* as d3 from 'd3'/)
  assert.match(labSources.autodiff, /import \* as d3 from 'd3'/)
  assert.match(labSources.autodiff, /import \* as THREE from 'three'/)
  assert.match(labSources.autodiff, /ThreeSceneShell/)
  assert.match(labSources.probability, /import \* as d3 from 'd3'/)
  assert.match(labSources.probability, /calibrationBins/)
  assert.match(labSources.diagnostics, /import \* as d3 from 'd3'/)
  assert.match(labSources.architecture, /import \* as d3 from 'd3'/)
  assert.match(labSources.architecture, /import \* as THREE from 'three'/)
  assert.match(labSources.architecture, /evaluateAttentionShape/)
  assert.match(labSources.architecture, /ThreeSceneShell/)
})
