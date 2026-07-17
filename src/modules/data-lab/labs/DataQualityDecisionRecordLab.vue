<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTableView from '../components/DataTableView.vue'
import type { DataLabLocale, LocalizedCopy } from '../types/dataLab'
import {
  buildDataQualityDecisionSnapshot,
  dataQualityIssueTypes,
  dataQualityRiskLevels,
  dataQualityTreatments,
  type DataQualityDecisionScenarioId,
  type DataQualityIssueType,
  type DataQualityRiskLevel,
  type DataQualityTreatment,
} from '../utils/dataQualityDecisionTask'
import { housingTeachingTable } from '../utils/tableTransforms'

const props = withDefaults(defineProps<{
  locale?: DataLabLocale
}>(), {
  locale: 'zh-CN',
})

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

const scenarioDefaults: Record<DataQualityDecisionScenarioId, {
  issue: DataQualityIssueType
  treatment: DataQualityTreatment
  risk: DataQualityRiskLevel
}> = {
  'missing-rooms': { issue: 'missingness', treatment: 'impute', risk: 'medium' },
  'duplicate-listing': { issue: 'duplicate', treatment: 'deduplicate', risk: 'medium' },
  'price-outlier': { issue: 'outlier', treatment: 'clip-or-flag', risk: 'high' },
  'label-timing': { issue: 'label-timing', treatment: 'remove-leaky-signal', risk: 'high' },
  'imbalance-baseline': { issue: 'imbalance', treatment: 'use-baseline-and-metrics', risk: 'medium' },
}

const scenarioId = ref<DataQualityDecisionScenarioId>('missing-rooms')
const selectedIssue = ref<DataQualityIssueType>('missingness')
const selectedTreatment = ref<DataQualityTreatment>('impute')
const selectedRisk = ref<DataQualityRiskLevel>('medium')

const scenarioOptions: Array<{
  id: DataQualityDecisionScenarioId
  label: LocalizedCopy
  description: LocalizedCopy
}> = [
  {
    id: 'missing-rooms',
    label: copy('缺失房间数', 'Missing rooms'),
    description: copy('判断缺失值是否能直接删除。', 'Decide whether missing values can be dropped directly.'),
  },
  {
    id: 'duplicate-listing',
    label: copy('重复记录', 'Duplicate listing'),
    description: copy('记录去重规则和样本数影响。', 'Record deduplication rules and row-count impact.'),
  },
  {
    id: 'price-outlier',
    label: copy('价格离群点', 'Price outlier'),
    description: copy('先解释离群点，再决定裁剪或保留。', 'Interpret the outlier before clipping or keeping it.'),
  },
  {
    id: 'label-timing',
    label: copy('标签时点', 'Label timing'),
    description: copy('检查特征是否在预测时刻可用。', 'Check whether a feature exists at prediction time.'),
  },
  {
    id: 'imbalance-baseline',
    label: copy('不平衡基线', 'Imbalance baseline'),
    description: copy('记录多数类基线和指标风险。', 'Record the majority baseline and metric risk.'),
  },
]

const issueLabels: Record<DataQualityIssueType, LocalizedCopy> = {
  missingness: copy('缺失机制', 'missingness'),
  duplicate: copy('重复记录', 'duplicate'),
  outlier: copy('离群点', 'outlier'),
  'label-timing': copy('标签时点', 'label timing'),
  imbalance: copy('类别不平衡', 'imbalance'),
}

const treatmentLabels: Record<DataQualityTreatment, LocalizedCopy> = {
  impute: copy('补值并记录来源', 'impute'),
  deduplicate: copy('按稳定 ID 去重', 'deduplicate'),
  'clip-or-flag': copy('标记或审计后裁剪', 'clip or flag'),
  'remove-leaky-signal': copy('移除泄漏信号', 'remove leaky signal'),
  'use-baseline-and-metrics': copy('记录基线和指标', 'use baseline and metrics'),
  'collect-more-data': copy('补采或复核数据', 'collect more data'),
}

const riskLabels: Record<DataQualityRiskLevel, LocalizedCopy> = {
  low: copy('低', 'low'),
  medium: copy('中', 'medium'),
  high: copy('高', 'high'),
}

const copyText = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '任务实验',
        title: '数据质量决策记录',
        englishTitle: 'Data Quality Decision Record',
        subtitle: '把一个 EDA 发现整理成检查、发现、处理建议、风险等级和项目影响。',
        evidence: '检查结果',
        decision: '决策',
        issue: '问题类型',
        treatment: '处理建议',
        risk: '风险等级',
        status: '判定',
        ready: '可以记录',
        needsReview: '需要复核',
        shape: 'shape 影响',
        projectImpact: '项目影响',
        record: '决策记录',
        check: '检查',
        finding: '发现',
        affected: '影响范围',
      }
    : {
        eyebrow: 'Task lab',
        title: 'Data Quality Decision Record',
        englishTitle: 'Data Quality Decision Record',
        subtitle: 'Turn one EDA finding into a check, finding, treatment, risk level, and project impact.',
        evidence: 'evidence',
        decision: 'decision',
        issue: 'issue type',
        treatment: 'treatment',
        risk: 'risk level',
        status: 'status',
        ready: 'ready to record',
        needsReview: 'needs review',
        shape: 'shape impact',
        projectImpact: 'project impact',
        record: 'decision record',
        check: 'check',
        finding: 'finding',
        affected: 'affected scope',
      },
)

const snapshot = computed(() =>
  buildDataQualityDecisionSnapshot({
    scenarioId: scenarioId.value,
    selectedIssue: selectedIssue.value,
    selectedTreatment: selectedTreatment.value,
    selectedRisk: selectedRisk.value,
  }),
)

const code = computed(() => snapshot.value.codeLines.join('\n'))
const warningMessage = computed(() => {
  const warnings = snapshot.value.warnings
  if (props.locale !== 'zh-CN') return warnings.join(' ')

  const messages: string[] = []
  if (warnings.some((warning) => warning.includes('expected'))) {
    messages.push(`问题类型应为 ${issueLabels[snapshot.value.expectedIssue]['zh-CN']}。`)
  }
  if (warnings.some((warning) => warning.includes('recommended treatment'))) {
    messages.push(
      `建议处理应为 ${snapshot.value.recommendedTreatments
        .map((treatment) => treatmentLabels[treatment]['zh-CN'])
        .join(' / ')}。`,
    )
  }
  if (warnings.some((warning) => warning.includes('risk is understated'))) {
    messages.push(`风险等级低估，应至少为 ${riskLabels[snapshot.value.recommendedRisk]['zh-CN']}。`)
  }
  return messages.join(' ')
})

function chooseScenario(nextScenarioId: DataQualityDecisionScenarioId) {
  const defaults = scenarioDefaults[nextScenarioId]
  scenarioId.value = nextScenarioId
  selectedIssue.value = defaults.issue
  selectedTreatment.value = defaults.treatment
  selectedRisk.value = defaults.risk
}
</script>

<template>
  <section class="data-lab-card data-quality-decision-record-lab">
    <div class="data-lab-card__visual data-quality-decision-record-lab__visual">
      <DataTableView :table="housingTeachingTable" :locale="locale" :max-rows="6" />

      <div class="data-quality-decision-record-lab__evidence">
        <header>
          <span>{{ copyText.evidence }}</span>
          <strong>{{ snapshot.evidence.metric }}</strong>
        </header>
        <article>
          <span>{{ copyText.check }}</span>
          <code>{{ snapshot.evidence.check }}</code>
        </article>
        <article>
          <span>{{ copyText.finding }}</span>
          <p>{{ snapshot.evidence.finding }}</p>
        </article>
        <article>
          <span>{{ copyText.affected }}</span>
          <strong>{{ snapshot.evidence.affectedRows }} rows · {{ snapshot.evidence.affectedColumns.join(', ') }}</strong>
        </article>
      </div>

      <div class="data-quality-decision-record-lab__impact">
        <article>
          <span>{{ copyText.shape }}</span>
          <strong>{{ snapshot.impact.beforeShape }} → {{ snapshot.impact.afterShape }}</strong>
        </article>
        <article>
          <span>{{ copyText.projectImpact }}</span>
          <p>{{ snapshot.impact.projectRisk }}</p>
        </article>
      </div>
    </div>

    <div class="data-lab-card__controls">
      <header>
        <span>{{ copyText.eyebrow }}</span>
        <strong>{{ copyText.title }}</strong>
        <p>{{ copyText.subtitle }}</p>
      </header>

      <div class="data-quality-decision-record-lab__scenarios">
        <button
          v-for="option in scenarioOptions"
          :key="option.id"
          type="button"
          :class="{ 'is-active': option.id === scenarioId }"
          :aria-pressed="option.id === scenarioId"
          @click="chooseScenario(option.id)"
        >
          <strong>{{ option.label[locale] }}</strong>
          <small>{{ option.description[locale] }}</small>
        </button>
      </div>

      <div class="data-quality-decision-record-lab__decision">
        <label>
          <span>{{ copyText.issue }}</span>
          <select v-model="selectedIssue">
            <option v-for="issue in dataQualityIssueTypes" :key="issue" :value="issue">
              {{ issueLabels[issue][locale] }}
            </option>
          </select>
        </label>
        <label>
          <span>{{ copyText.treatment }}</span>
          <select v-model="selectedTreatment">
            <option v-for="treatment in dataQualityTreatments" :key="treatment" :value="treatment">
              {{ treatmentLabels[treatment][locale] }}
            </option>
          </select>
        </label>
        <label>
          <span>{{ copyText.risk }}</span>
          <select v-model="selectedRisk">
            <option v-for="risk in dataQualityRiskLevels" :key="risk" :value="risk">
              {{ riskLabels[risk][locale] }}
            </option>
          </select>
        </label>
      </div>

      <div class="data-quality-decision-record-lab__status" :class="{ 'is-safe': snapshot.safe, 'is-warning': !snapshot.safe }">
        <span>{{ copyText.status }}</span>
        <strong>{{ snapshot.safe ? copyText.ready : copyText.needsReview }}</strong>
        <p>{{ snapshot.safe ? snapshot.decisionRecord.projectImpact : warningMessage }}</p>
      </div>

      <div class="data-quality-decision-record-lab__record">
        <strong>{{ copyText.record }}</strong>
        <dl>
          <div>
            <dt>{{ copyText.issue }}</dt>
            <dd>{{ issueLabels[snapshot.decisionRecord.issue as DataQualityIssueType][locale] }}</dd>
          </div>
          <div>
            <dt>{{ copyText.evidence }}</dt>
            <dd>{{ snapshot.decisionRecord.evidence }}</dd>
          </div>
          <div>
            <dt>{{ copyText.treatment }}</dt>
            <dd>{{ treatmentLabels[snapshot.decisionRecord.treatment as DataQualityTreatment][locale] }}</dd>
          </div>
          <div>
            <dt>{{ copyText.risk }}</dt>
            <dd>{{ riskLabels[snapshot.decisionRecord.risk as DataQualityRiskLevel][locale] }}</dd>
          </div>
        </dl>
      </div>

      <pre class="data-code-block"><code>{{ code }}</code></pre>
    </div>
  </section>
</template>
