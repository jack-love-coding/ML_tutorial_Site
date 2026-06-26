import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('home page uses Curriculum Progress V2 for global continue-learning state', () => {
  const homeSource = read('src/views/HomeView.vue')

  assert.match(homeSource, /migrateLearningProgressV2/)
  assert.match(homeSource, /selectContinueLearning/)
  assert.match(homeSource, /createDefaultLearningProgressV2/)
  assert.match(homeSource, /learningProgressV2StorageKey/)
  assert.match(homeSource, /algorithmProgressStorageKey/)
  assert.match(homeSource, /mathLabProgressStorageKey/)
  assert.match(homeSource, /dataLabProgressStorageKey/)
  assert.match(homeSource, /const learningProgress = ref<LearningProgressV2>\(createDefaultLearningProgressV2\(\)\)/)
  assert.match(homeSource, /const continueTarget = computed\(\(\) => selectContinueLearning\(learningProgress\.value\)\)/)
  assert.match(homeSource, /function refreshLearningProgress\(\)/)
  assert.match(homeSource, /window\.addEventListener\('focus', refreshLearningProgress\)/)
  assert.match(homeSource, /document\.addEventListener\('visibilitychange', handleProgressVisibilityChange\)/)
  assert.match(homeSource, /window\.addEventListener\('storage', handleProgressStorageEvent\)/)
  assert.match(homeSource, /window\.removeEventListener\('focus', refreshLearningProgress\)/)

  assert.doesNotMatch(homeSource, /loadMathLabProgress/)
  assert.doesNotMatch(homeSource, /LearningRouteSummary/)
  assert.doesNotMatch(homeSource, /learningRoutes/)
  assert.doesNotMatch(homeSource, /learningRouteSummaryModules/)
})

test('home page first screen is a curriculum decision surface rather than a full module gallery', () => {
  const homeSource = read('src/views/HomeView.vue')

  assert.match(homeSource, /curriculumNavigationMenus/)
  assert.match(homeSource, /curriculumRouteManifestById/)
  assert.match(homeSource, /curriculumSpineStages/)
  assert.match(homeSource, /spineRoadmap/)
  assert.match(homeSource, /homeDecisionCards/)
  assert.match(homeSource, /home-progress-panel/)
  assert.match(homeSource, /home-decision-section/)
  assert.match(homeSource, /home-decision-grid/)
  assert.match(homeSource, /home-spine-roadmap/)
  assert.match(homeSource, /默认学习主线/)
  assert.match(homeSource, /Default Spine/)
  assert.match(homeSource, /\/tracks\/core-learning-path/)
  assert.match(homeSource, /\/library\/math/)
  assert.match(homeSource, /\/tracks\/project-practice/)
  assert.match(homeSource, /\/progress/)
  assert.match(homeSource, /\/learn\/ai-overview/)

  assert.doesNotMatch(homeSource, /moduleOrder/)
  assert.doesNotMatch(homeSource, /module-gallery/)
  assert.doesNotMatch(homeSource, /module-teaser/)
  assert.doesNotMatch(homeSource, /const learningPath = computed/)
  assert.doesNotMatch(homeSource, /path-section/)
})

test('home page keeps the beginner roadmap but removes duplicated catalog responsibilities', () => {
  const homeSource = read('src/views/HomeView.vue')
  const homeStyles = read('src/styles/views/home.css')

  assert.match(homeSource, /beginnerRoadmap/)
  assert.match(homeSource, /moduleTitle/)
  assert.match(homeSource, /moduleRoute/)
  assert.match(homeSource, /readinessChecks/)
  assert.match(homeSource, /scrollToRoadmap/)
  assert.match(homeSource, /history\.replaceState/)
  assert.match(homeSource, /roadmap-stage__body/)
  assert.match(homeSource, /roadmapStage\.route/)

  assert.match(homeStyles, /\.home-progress-panel/)
  assert.match(homeStyles, /\.home-decision-section/)
  assert.match(homeStyles, /\.home-decision-card/)
  assert.match(homeStyles, /\.home-spine-roadmap/)
  assert.doesNotMatch(homeSource, /const beginnerRoadmapSource/)
  assert.doesNotMatch(homeStyles, /\.module-gallery/)
  assert.doesNotMatch(homeStyles, /\.module-teaser/)
})
