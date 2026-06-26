<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { curriculumModuleById } from '../curriculum/catalog.ts'
import { resolveCanonicalLearnRoute } from '../curriculum/routes.ts'
import { curriculumSpineStages } from '../curriculum/spine.ts'
import type { CurriculumModule } from '../curriculum/types.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value as AppLocale)

function localizedText(value: LocalizedCopy) {
  return value[currentLocale.value]
}

function moduleDefinition(moduleId: string) {
  return curriculumModuleById.get(moduleId)
}

function moduleList(moduleIds: string[]) {
  return moduleIds
    .map(moduleDefinition)
    .filter((module): module is CurriculumModule => Boolean(module))
}

function moduleRoute(moduleId: string) {
  const module = moduleDefinition(moduleId)
  return resolveCanonicalLearnRoute(moduleId) ?? module?.route ?? `/learn/${moduleId}`
}

function stageElementId(stageId: string) {
  return `stage-${stageId}`
}

function stageAnchor(stageId: string) {
  return `#${stageElementId(stageId)}`
}

function stageNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

const labels = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: '默认学习主线',
        title: '按阶段走完 Data First 主线',
        body: '这页把 Curriculum Spine V1 展开成 11 个阶段：每个阶段说明核心问题、必修模块、支持镜头、推荐项目验证和已知覆盖缺口。旧的平铺模块列表仍保留，方便快速跳转。',
        stages: '阶段',
        requiredModules: '必修模块',
        supportLenses: '支持镜头',
        projectValidation: '项目验证',
        knownGaps: '已知缺口',
        outcomes: '完成标准',
        stageNav: '主线阶段导航',
        stageList: 'Curriculum Spine V1 阶段列表',
        openModule: '进入模块',
        start: '从第一阶段开始',
        flatList: '查看平铺模块列表',
        supportNote: '这些模块用于补足当前阶段需要的数学、数据或模型直觉。',
        projectNote: '项目是推荐验证，不是继续学习的硬阻塞。',
      }
    : {
        eyebrow: 'Default Spine',
        title: 'Move Through the Data-First Spine by Stage',
        body: 'This page expands Curriculum Spine V1 into 11 stages: each stage shows the guiding question, required modules, support lenses, recommended project validation, and known coverage gaps. The existing flat module list stays available for quick jumping.',
        stages: 'Stages',
        requiredModules: 'Required Modules',
        supportLenses: 'Support Lenses',
        projectValidation: 'Project Validation',
        knownGaps: 'Known Gaps',
        outcomes: 'Completion Standard',
        stageNav: 'Spine stage navigation',
        stageList: 'Curriculum Spine V1 stage list',
        openModule: 'Open Module',
        start: 'Start Stage One',
        flatList: 'View Flat Module List',
        supportNote: 'Use these modules to fill the math, data, or model intuition needed for this stage.',
        projectNote: 'Projects are recommended validation, not hard blockers for continuing.',
      },
)

const stageCards = computed(() =>
  curriculumSpineStages.map((stage, index) => ({
    ...stage,
    index,
    requiredModules: moduleList(stage.requiredModuleIds),
    supportModules: moduleList(stage.supportModuleIds),
    projectModules: moduleList(stage.projectModuleIds ?? []),
  })),
)

const requiredModuleCount = computed(() =>
  curriculumSpineStages.reduce((total, stage) => total + stage.requiredModuleIds.length, 0),
)
const supportModuleCount = computed(() => {
  const moduleIds = new Set(curriculumSpineStages.flatMap((stage) => stage.supportModuleIds))
  return moduleIds.size
})
const projectModuleCount = computed(() => {
  const moduleIds = new Set(curriculumSpineStages.flatMap((stage) => stage.projectModuleIds ?? []))
  return moduleIds.size
})
const firstRequiredModuleId = computed(() => curriculumSpineStages[0]?.requiredModuleIds[0] ?? 'ai-overview')
</script>

<template>
  <div class="curriculum-page curriculum-spine-page">
    <section class="curriculum-hero curriculum-spine-hero">
      <div>
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h1>{{ labels.title }}</h1>
        <p>{{ labels.body }}</p>
        <div class="curriculum-actions curriculum-spine-hero__actions">
          <router-link :to="moduleRoute(firstRequiredModuleId)">
            {{ labels.start }}
          </router-link>
          <router-link to="/tracks/core-learning-path">
            {{ labels.flatList }}
          </router-link>
        </div>
      </div>
      <div class="curriculum-hero__metrics">
        <article>
          <span>{{ labels.stages }}</span>
          <strong>{{ curriculumSpineStages.length }}</strong>
        </article>
        <article>
          <span>{{ labels.requiredModules }}</span>
          <strong>{{ requiredModuleCount }}</strong>
        </article>
        <article>
          <span>{{ labels.supportLenses }}</span>
          <strong>{{ supportModuleCount }}</strong>
        </article>
        <article>
          <span>{{ labels.projectValidation }}</span>
          <strong>{{ projectModuleCount }}</strong>
        </article>
      </div>
    </section>

    <nav class="spine-stage-nav" :aria-label="labels.stageNav">
      <a v-for="stage in stageCards" :key="stage.id" :href="stageAnchor(stage.id)">
        <span>{{ stageNumber(stage.index) }}</span>
        <strong>{{ localizedText(stage.title) }}</strong>
      </a>
    </nav>

    <section class="spine-stage-list" :aria-label="labels.stageList">
      <article
        v-for="stage in stageCards"
        :id="stageElementId(stage.id)"
        :key="stage.id"
        class="spine-stage-card"
      >
        <header class="spine-stage-card__header">
          <span>{{ stageNumber(stage.index) }}</span>
          <div>
            <p>{{ labels.stages }} {{ stage.index }}</p>
            <h2>{{ localizedText(stage.title) }}</h2>
            <strong>{{ localizedText(stage.learnerQuestion) }}</strong>
          </div>
        </header>

        <div class="spine-stage-card__modules">
          <section>
            <h3>{{ labels.requiredModules }}</h3>
            <ul>
              <li v-for="module in stage.requiredModules" :key="module.id">
                <router-link :to="moduleRoute(module.id)">
                  {{ localizedText(module.title) }}
                </router-link>
                <p>{{ localizedText(module.summary) }}</p>
              </li>
            </ul>
          </section>

          <section v-if="stage.supportModules.length">
            <h3>{{ labels.supportLenses }}</h3>
            <p>{{ labels.supportNote }}</p>
            <ul>
              <li v-for="module in stage.supportModules" :key="module.id">
                <router-link :to="moduleRoute(module.id)">
                  {{ localizedText(module.title) }}
                </router-link>
              </li>
            </ul>
          </section>

          <section v-if="stage.projectModules.length">
            <h3>{{ labels.projectValidation }}</h3>
            <p>{{ labels.projectNote }}</p>
            <ul>
              <li v-for="module in stage.projectModules" :key="module.id">
                <router-link :to="moduleRoute(module.id)">
                  {{ localizedText(module.title) }}
                </router-link>
              </li>
            </ul>
          </section>
        </div>

        <section class="spine-stage-card__outcomes">
          <h3>{{ labels.outcomes }}</h3>
          <ul>
            <li v-for="outcome in stage.outcomes" :key="localizedText(outcome)">
              {{ localizedText(outcome) }}
            </li>
          </ul>
        </section>

        <section v-if="stage.knownGaps?.length" class="spine-stage-card__gap">
          <h3>{{ labels.knownGaps }}</h3>
          <ul>
            <li v-for="gap in stage.knownGaps" :key="localizedText(gap)">
              {{ localizedText(gap) }}
            </li>
          </ul>
        </section>
      </article>
    </section>
  </div>
</template>
