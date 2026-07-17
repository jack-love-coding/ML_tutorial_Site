<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { curriculumRouteManifestById } from '../curriculum/routeManifest.ts'
import {
  createDefaultLearningProgressV2,
  learningProgressV2MigrationKey,
  learningProgressV2StorageKey,
  migrateLearningProgressV2,
  selectContinueLearning,
  type LearningProgressV2,
} from '../curriculum/progress.ts'
import { curriculumSpineStages } from '../curriculum/spine.ts'
import { curriculumNavigationMenus, type SiteNavigationMenuId } from '../data/navigationMenus'
import { dataLabProgressStorageKey } from '../modules/data-lab/utils/progress'
import { mathLabProgressStorageKey } from '../modules/math-lab/utils/progress'
import type { LocalizedCopy } from '../types/ml'
import { algorithmProgressStorageKey } from '../utils/algorithmProgress'

const { t, locale } = useI18n()

interface BeginnerRoadmapStage {
  id: string
  route: string
  duration: string
  title: string
  summary: string
  focus: string
  practice: string
  outcome: string
  concepts: string[]
  action: string
}

interface ReadinessCheck {
  title: LocalizedCopy
  description: LocalizedCopy
}

interface HomeDecisionCardSource {
  id: string
  route: string
  menuId?: SiteNavigationMenuId
  title: LocalizedCopy
  body: LocalizedCopy
  meta: LocalizedCopy
  action: LocalizedCopy
}

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function localizedText(value: LocalizedCopy) {
  return locale.value === 'zh-CN' ? value['zh-CN'] : value.en
}

function stageNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function scrollToRoadmap(event: MouseEvent) {
  event.preventDefault()
  document.getElementById('beginner-roadmap')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', '#beginner-roadmap')
}

const startRoute = '/learn/ai-overview'
const learningProgress = ref<LearningProgressV2>(createDefaultLearningProgressV2())
const progressStorageKeys = new Set([
  learningProgressV2StorageKey,
  learningProgressV2MigrationKey,
  algorithmProgressStorageKey,
  mathLabProgressStorageKey,
  dataLabProgressStorageKey,
])

function refreshLearningProgress() {
  learningProgress.value = migrateLearningProgressV2()
}

function handleProgressVisibilityChange() {
  if (document.visibilityState === 'visible') refreshLearningProgress()
}

function handleProgressStorageEvent(event: StorageEvent) {
  if (event.key && !progressStorageKeys.has(event.key)) return
  refreshLearningProgress()
}

onMounted(() => {
  refreshLearningProgress()
  window.addEventListener('focus', refreshLearningProgress)
  document.addEventListener('visibilitychange', handleProgressVisibilityChange)
  window.addEventListener('storage', handleProgressStorageEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshLearningProgress)
  document.removeEventListener('visibilitychange', handleProgressVisibilityChange)
  window.removeEventListener('storage', handleProgressStorageEvent)
})

const progressLabels = computed(() =>
  locale.value === 'zh-CN'
    ? {
        continueEyebrow: '继续学习',
        startTitle: '从 AI 入门总览开始',
        lastVisitedBody: '回到你上次停下的位置，继续把概念、实验和讲解串起来。',
        firstIncompleteBody: '下一步推荐沿核心路线继续阅读。',
        noProgressBody: '还没有学习记录时，先用 AI 总览建立地图，再进入数学、数据和模型实验。',
        visited: '浏览过的模块',
        records: '实验记录',
        routes: '主线阶段',
        continueAction: '继续学习',
        startAction: '开始学习',
      }
    : {
        continueEyebrow: 'Continue learning',
        startTitle: 'Start with AI Overview',
        lastVisitedBody: 'Return to the place you last touched and keep connecting concepts, labs, and explanations.',
        firstIncompleteBody: 'Continue reading along the core path.',
        noProgressBody: 'With no saved progress yet, begin with AI Overview before moving into math, data, and model labs.',
        visited: 'Modules visited',
        records: 'Lab records',
        routes: 'Spine stages',
        continueAction: 'Continue learning',
        startAction: 'Start learning',
      },
)

const continueTarget = computed(() => selectContinueLearning(learningProgress.value))
const continueRoute = computed(() => continueTarget.value?.route ?? startRoute)
const continueModuleTitle = computed(() => {
  const moduleId = continueTarget.value?.moduleId
  if (!moduleId) return progressLabels.value.startTitle
  return localizedText(curriculumRouteManifestById.get(moduleId)?.title ?? loc(moduleId, moduleId))
})
const continueBody = computed(() => {
  if (!continueTarget.value) return progressLabels.value.noProgressBody
  return continueTarget.value.reason === 'last-visited'
    ? progressLabels.value.lastVisitedBody
    : progressLabels.value.firstIncompleteBody
})
const continueActionLabel = computed(() =>
  continueTarget.value ? progressLabels.value.continueAction : progressLabels.value.startAction,
)
const visitedModuleCount = computed(() =>
  Object.values(learningProgress.value.modules).filter((moduleProgress) => moduleProgress.lastVisitedAt).length,
)
const savedLabRecordCount = computed(() => learningProgress.value.labEvidence.length)
const progressMetrics = computed(() => [
  {
    label: progressLabels.value.visited,
    value: String(visitedModuleCount.value),
  },
  {
    label: progressLabels.value.records,
    value: String(savedLabRecordCount.value),
  },
  {
    label: progressLabels.value.routes,
    value: String(curriculumSpineStages.length),
  },
])

const navigationMenuLabels = computed(
  () => new Map(curriculumNavigationMenus.map((menuDefinition) => [menuDefinition.id, localizedText(menuDefinition.label)])),
)

const homeDecisionCardSource: HomeDecisionCardSource[] = [
  {
    id: 'core-learning-path',
    route: '/spine',
    menuId: 'learning-path',
    title: loc('默认学习主线', 'Default Spine'),
    body: loc(
      '按 data first 主线推进：AI 总览、Python、原始数据、特征、损失、训练、泛化、神经网络、CNN 和 Transformer 入门。',
      'Follow the data-first spine through AI Overview, Python, raw data, features, loss, training, generalization, neural networks, CNNs, and Transformer basics.',
    ),
    meta: loc('第一入口', 'First entry'),
    action: loc('打开主线', 'Open spine'),
  },
  {
    id: 'topic-library',
    route: '/library/math',
    menuId: 'topic-library',
    title: loc('辅助内容', 'Supporting Topics'),
    body: loc(
      '按 Math Lab、Data Lab、ML Models 和 Deep Learning Lens 查找概念、实验与复盘材料；它们服务主线，不再抢起点。',
      'Browse Math Lab, Data Lab, ML Models, and Deep Learning Lens as support material for the spine instead of parallel starting points.',
    ),
    meta: loc('按主题补课', 'Review by topic'),
    action: loc('打开主题库', 'Open library'),
  },
  {
    id: 'project-practice',
    route: '/tracks/project-practice',
    menuId: 'projects',
    title: loc('项目实战', 'Project practice'),
    body: loc(
      '把数据清洗、特征、模型选择和指标复盘放进房价预测、分类筛查等可复现实验。',
      'Put cleaning, features, model selection, and metric review into reproducible housing and classification projects.',
    ),
    meta: loc('从任务倒推概念', 'Learn from tasks'),
    action: loc('进入项目', 'Open projects'),
  },
  {
    id: 'progress',
    route: '/progress',
    menuId: 'progress',
    title: loc('学习进度', 'Learning progress'),
    body: loc(
      '查看最近浏览位置、实验记录和下一步建议，避免在多个实验室之间迷路。',
      'Review recent locations, lab notes, and the next recommendation across every lab.',
    ),
    meta: loc('复盘与下一步', 'Review and next step'),
    action: loc('查看进度', 'Open progress'),
  },
]

const homeDecisionCards = computed(() =>
  homeDecisionCardSource.map((card) => ({
    id: card.id,
    route: card.route,
    title: card.menuId ? navigationMenuLabels.value.get(card.menuId) ?? localizedText(card.title) : localizedText(card.title),
    body: localizedText(card.body),
    meta: localizedText(card.meta),
    action: localizedText(card.action),
  })),
)

const beginnerRoadmapIntro = {
  eyebrow: loc('默认学习主线', 'Default Spine'),
  title: loc('Data First：从原始数据走到 Transformer 入门', 'Data First: From Raw Data to Transformer Basics'),
  body: loc(
    '这条主线把 Math Lab 和 Data Lab 放回合适的位置：先让学习者看懂表格、特征和反馈信号，再逐步进入线性模型、训练动态、泛化、非线性模型、CNN 和 Attention。',
    'This spine puts Math Lab and Data Lab back into the right places: learners first understand tables, features, and feedback signals, then move through linear models, training dynamics, generalization, nonlinear models, CNNs, and Attention.',
  ),
  note: loc(
    '首页只预览前四个阶段，完整阶段地图、辅助内容和项目实践放在主线页里继续展开。',
    'The homepage previews the first four stages only; the full stage map, supporting topics, and project practice continue on the spine page.',
  ),
  action: loc('查看完整阶段地图', 'View full stage map'),
}

const roadmapLabels = computed(() =>
  locale.value === 'zh-CN'
    ? {
        concepts: '关键概念',
        focus: '必修模块',
        practice: '辅助内容',
        outcome: '完成标准',
        required: '必修',
        support: '支持',
        project: '项目验证',
        noSupport: '直接阅读本阶段模块，并用实验对照讲解。',
        checksTitle: '进入下一轮前的自检',
        checksBody: '每学完一个阶段，先确认自己能把公式、图像、代码和模型行为对应起来，再继续推进。',
      }
    : {
        concepts: 'Key concepts',
        focus: 'Required modules',
        practice: 'Support lenses',
        outcome: 'Completion standard',
        required: 'Required',
        support: 'Support',
        project: 'Project validation',
        noSupport: 'Read this stage’s modules and compare the labs with their explanations.',
        checksTitle: 'Readiness checks before the next pass',
        checksBody: 'After each stage, verify that formulas, visuals, code, and model behavior point to the same idea before moving on.',
      },
)

function moduleTitle(moduleId: string) {
  return localizedText(curriculumRouteManifestById.get(moduleId)?.title ?? loc(moduleId, moduleId))
}

function moduleRoute(moduleId: string) {
  return curriculumRouteManifestById.get(moduleId)?.route ?? `/learn/${moduleId}`
}

function joinedModuleTitles(moduleIds: string[]) {
  return moduleIds.map(moduleTitle).join(locale.value === 'zh-CN' ? '、' : ', ')
}

function stageDuration(index: number) {
  return locale.value === 'zh-CN' ? `第 ${index} 阶段` : `Stage ${index}`
}

function stagePracticeText(supportModuleIds: string[], projectModuleIds: string[]) {
  const parts: string[] = []

  if (supportModuleIds.length > 0) {
    parts.push(`${roadmapLabels.value.support}: ${joinedModuleTitles(supportModuleIds)}`)
  }
  if (projectModuleIds.length > 0) {
    parts.push(`${roadmapLabels.value.project}: ${joinedModuleTitles(projectModuleIds)}`)
  }

  return parts.length > 0 ? parts.join(locale.value === 'zh-CN' ? '；' : '; ') : roadmapLabels.value.noSupport
}

function spineStageActionText(firstModuleId: string) {
  const title = moduleTitle(firstModuleId)
  return locale.value === 'zh-CN' ? `进入 ${title}` : `Open ${title}`
}

const spinePreviewRoadmap = computed<BeginnerRoadmapStage[]>(() =>
  curriculumSpineStages.slice(0, 4).map((spineStage, index) => {
    const projectModuleIds = spineStage.projectModuleIds ?? []
    const conceptModuleIds = [
      ...spineStage.requiredModuleIds,
      ...spineStage.supportModuleIds,
      ...projectModuleIds,
    ]
    const firstModuleId = spineStage.requiredModuleIds[0]

    return {
      id: spineStage.id,
      route: moduleRoute(firstModuleId),
      duration: stageDuration(index),
      title: localizedText(spineStage.title),
      summary: localizedText(spineStage.learnerQuestion),
      focus: `${roadmapLabels.value.required}: ${joinedModuleTitles(spineStage.requiredModuleIds)}`,
      practice: stagePracticeText(spineStage.supportModuleIds, projectModuleIds),
      outcome: localizedText(spineStage.outcomes[0] ?? loc(spineStage.id, spineStage.id)),
      concepts: conceptModuleIds.map(moduleTitle),
      action: spineStageActionText(firstModuleId),
    }
  }),
)

const beginnerRoadmap = computed(() => spinePreviewRoadmap.value)

const roadmapIntro = computed(() => ({
  eyebrow: localizedText(beginnerRoadmapIntro.eyebrow),
  title: localizedText(beginnerRoadmapIntro.title),
  body: localizedText(beginnerRoadmapIntro.body),
  note: localizedText(beginnerRoadmapIntro.note),
  action: localizedText(beginnerRoadmapIntro.action),
}))

const readinessCheckSource: ReadinessCheck[] = [
  {
    title: loc('符号一致', 'Symbol consistency'),
    description: loc(
      '看到 x、w、b、ŷ、loss 时，能说出它们在公式、代码、图像和实验控件中的对应位置。',
      'When you see x, w, b, ŷ, and loss, you can point to the matching formula, code, visual, and control.',
    ),
  },
  {
    title: loc('实验可复现', 'Reproducible lab work'),
    description: loc(
      '能从默认 preset 开始，改变一个变量，记录结果，并通过重置再次得到同类现象。',
      'You can start from a preset, change one variable, record the result, and reproduce the same kind of behavior after reset.',
    ),
  },
  {
    title: loc('指标能解释', 'Metric explanation'),
    description: loc(
      'accuracy、precision、recall、loss 或 validation gap 变化时，能说清楚是数据、阈值还是模型能力导致。',
      'When accuracy, precision, recall, loss, or validation gap changes, you can explain whether data, threshold, or capacity caused it.',
    ),
  },
  {
    title: loc('双语能对齐', 'Bilingual alignment'),
    description: loc(
      '切换中英文后，仍能把同一个概念、变量和误区反馈对应起来，而不是重新背一套术语。',
      'After switching languages, you can still connect the same concept, variable, and misconception feedback instead of memorizing a second vocabulary.',
    ),
  },
]

const readinessChecks = computed(() =>
  readinessCheckSource.map((check) => ({
    title: localizedText(check.title),
    description: localizedText(check.description),
  })),
)

const footerText = computed(() =>
  locale.value === 'zh-CN'
    ? '从默认学习主线开始，再按需要接入数学、数据和模型实验等辅助内容。'
    : 'Start with the Default Spine, then add supporting math, data, and model labs when needed.',
)
</script>

<template>
  <div class="home-view">
    <section class="hero home-hero">
      <div class="hero__copy">
        <span class="eyebrow">{{ t('home.eyebrow') }}</span>
        <h1>{{ t('home.title') }}</h1>
        <p>{{ t('home.subtitle') }}</p>
        <div class="hero__actions">
          <router-link class="action-button action-button--primary" :to="continueRoute">
            {{ continueActionLabel }}
          </router-link>
          <a class="action-button" href="#beginner-roadmap" @click="scrollToRoadmap">
            {{ t('home.ctaSecondary') }}
          </a>
        </div>
      </div>

      <div class="hero__visual">
        <aside class="home-progress-panel" aria-labelledby="home-progress-title">
          <span class="eyebrow">{{ progressLabels.continueEyebrow }}</span>
          <h2 id="home-progress-title">{{ continueModuleTitle }}</h2>
          <p>{{ continueBody }}</p>

          <router-link class="action-button action-button--primary" :to="continueRoute">
            {{ continueActionLabel }}
          </router-link>

          <div class="home-progress-panel__metrics">
            <div v-for="metric in progressMetrics" :key="metric.label" class="home-progress-metric">
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </div>
          </div>
        </aside>

        <router-link
          v-for="card in homeDecisionCards.slice(0, 2)"
          :key="`hero-${card.id}`"
          class="home-route-chip"
          :to="card.route"
        >
          <span>{{ card.meta }}</span>
          <strong>{{ card.title }}</strong>
        </router-link>
      </div>
    </section>

    <section class="home-decision-section" aria-labelledby="home-decision-title">
      <header class="section-header">
        <span class="eyebrow">{{ locale === 'zh-CN' ? '路线入口' : 'Route entries' }}</span>
        <h2 id="home-decision-title">
          {{ locale === 'zh-CN' ? '先决定怎么学，再进入具体章节' : 'Choose how to learn before opening chapters' }}
        </h2>
        <p>
          {{
            locale === 'zh-CN'
              ? '默认主线、辅助内容、项目和进度页分别承担不同任务：首页只保留决策入口，完整目录交给专门页面。'
              : 'The default spine, supporting topics, projects, and progress pages each have a separate job. The homepage keeps the decision entry points and leaves full catalogs to dedicated pages.'
          }}
        </p>
      </header>

      <div class="home-decision-grid">
        <router-link v-for="card in homeDecisionCards" :key="card.id" class="home-decision-card" :to="card.route">
          <span>{{ card.meta }}</span>
          <strong>{{ card.title }}</strong>
          <p>{{ card.body }}</p>
          <small>{{ card.action }}</small>
        </router-link>
      </div>
    </section>

    <section
      id="beginner-roadmap"
      class="beginner-roadmap home-spine-roadmap"
      aria-labelledby="beginner-roadmap-title"
    >
      <div class="beginner-roadmap__intro">
        <header class="section-header">
          <span class="eyebrow">{{ roadmapIntro.eyebrow }}</span>
          <h2 id="beginner-roadmap-title">{{ roadmapIntro.title }}</h2>
          <p>{{ roadmapIntro.body }}</p>
        </header>
        <div class="beginner-roadmap__aside">
          <p class="beginner-roadmap__note">{{ roadmapIntro.note }}</p>
          <router-link class="action-button" to="/spine">
            {{ roadmapIntro.action }}
          </router-link>
        </div>
      </div>

      <div class="roadmap-timeline">
        <article
          v-for="(roadmapStage, index) in beginnerRoadmap"
          :key="roadmapStage.id"
          class="roadmap-stage"
        >
          <div class="roadmap-stage__marker" aria-hidden="true">
            <span>{{ stageNumber(index) }}</span>
          </div>

          <div class="roadmap-stage__body">
            <div class="roadmap-stage__heading">
              <span>{{ roadmapStage.duration }}</span>
              <h3>{{ roadmapStage.title }}</h3>
              <p>{{ roadmapStage.summary }}</p>
            </div>

            <ul class="roadmap-stage__concepts" :aria-label="roadmapLabels.concepts">
              <li v-for="concept in roadmapStage.concepts" :key="concept">
                {{ concept }}
              </li>
            </ul>

            <dl class="roadmap-stage__details">
              <div>
                <dt>{{ roadmapLabels.focus }}</dt>
                <dd>{{ roadmapStage.focus }}</dd>
              </div>
              <div>
                <dt>{{ roadmapLabels.practice }}</dt>
                <dd>{{ roadmapStage.practice }}</dd>
              </div>
              <div>
                <dt>{{ roadmapLabels.outcome }}</dt>
                <dd>{{ roadmapStage.outcome }}</dd>
              </div>
            </dl>

            <router-link class="roadmap-stage__link" :to="roadmapStage.route">
              {{ roadmapStage.action }}
            </router-link>
          </div>
        </article>
      </div>

      <aside class="roadmap-checklist" aria-labelledby="roadmap-checklist-title">
        <div>
          <span class="eyebrow">{{ roadmapLabels.outcome }}</span>
          <h3 id="roadmap-checklist-title">{{ roadmapLabels.checksTitle }}</h3>
          <p>{{ roadmapLabels.checksBody }}</p>
        </div>

        <div class="roadmap-checklist__list">
          <article v-for="check in readinessChecks" :key="check.title" class="roadmap-check">
            <strong>{{ check.title }}</strong>
            <p>{{ check.description }}</p>
          </article>
        </div>
      </aside>
    </section>

    <footer class="home-footer">
      <p>{{ footerText }}</p>
      <router-link class="action-button" :to="continueRoute">
        {{ continueActionLabel }}
      </router-link>
    </footer>
  </div>
</template>
