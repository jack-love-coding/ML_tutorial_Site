<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  linearRegressionAssetById,
  parseLinearRegressionSummary,
  type LinearRegressionLockedSummary,
} from '../data/linearRegressionAssets'
import type { StorySection, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'
import { withPublicBase } from '../utils/publicPath'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  section?: StorySection
}>()

type SummaryLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly summary: LinearRegressionLockedSummary }
  | { readonly status: 'invalid' }

interface MethodAgreementShape {
  readonly agrees: boolean
  readonly tolerance: number
  readonly maxCoefficientDelta: number
  readonly maxPredictionDelta: number
  readonly byMethod: Readonly<
    Record<
      'numpyBatchGradientDescent' | 'numpyLstsq' | 'sklearnLinearRegression',
      { readonly maxCoefficientDelta: number; readonly maxPredictionDelta: number }
    >
  >
}

interface OptimizationShape {
  readonly config: {
    readonly learningRate: number
    readonly gradientTolerance: number
    readonly maxUpdates: number
  }
  readonly result: {
    readonly gradientNorm: number
    readonly mse: number
    readonly reason: string
    readonly updates: number
  }
}

interface CoefficientShape {
  readonly modelSpace: {
    readonly featureOrder: readonly string[]
    readonly intercept: number
    readonly weights: readonly number[]
  }
  readonly originalDatasetUnits: {
    readonly featureOrder: readonly string[]
    readonly intercept: number
    readonly interpretation: string
    readonly weights: readonly number[]
  }
}

interface CollinearityShape {
  readonly addedFeature: 'atemp'
  readonly conditionNumber: number
  readonly tempAtempTrainingCorrelation: number
  readonly ols: {
    readonly objective: 'mse'
    readonly tempCoefficient: number
    readonly atempCoefficient: number
    readonly perturbationL2: number
    readonly testMetrics: { readonly mse: number }
  }
  readonly ridge: {
    readonly alpha: number
    readonly objective: 'mse-plus-l2'
    readonly perturbationL2: number
    readonly testMetrics: { readonly mse: number }
  }
  readonly lasso: {
    readonly alpha: number
    readonly objective: 'mse-plus-l1'
    readonly sameObjectiveAsOls: false
    readonly testMetrics: { readonly mse: number }
  }
}

interface Log1pShape {
  readonly coefficientScale: string
  readonly targetTransform: 'log1p'
  readonly inverseTransform: 'expm1'
  readonly rawTargetObjectiveComparable: false
  readonly inverseTransformedCountMetrics: {
    readonly mse: number
    readonly mae: number
    readonly r2: number
  }
  readonly logSpaceMetrics: {
    readonly mse: number
    readonly mae: number
    readonly r2: number
  }
}

interface RepresentativeRowShape {
  readonly instant: number
  readonly actual: number
  readonly prediction: number
  readonly residual: number
  readonly lossContribution: number
  readonly unaveragedWeightGradientContribution: readonly number[]
}

const teachingFixture = Object.freeze({
  instant: 0,
  actual: 4,
  prediction: 3,
  residual: -1,
  lossContribution: 1,
  unaveragedWeightGradientContribution: Object.freeze([-2, -4]),
})

const { locale } = useI18n()
const lockedSummaryState = ref<SummaryLoadState>({ status: 'loading' })
let requestController: AbortController | undefined

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: '运行结果与诊断',
        loading: '正在读取经过严格校验的本地运行结果。',
        invalid: '本地运行结果无法读取；显示内置教学样例，不展示完整数据指标。',
        fixture: '内置教学样例',
        fixtureNote: 'ŷ = 3，y = 4，所以 prediction - actual = -1，单行平方损失为 1。',
        locked: '固定 Bike 运行结果',
        optimization: '优化完成门',
        pass: '通过：损失、梯度范数和三种 OLS 方法一致',
        wait: '等待严格结果；暂不解释模型局限',
        gradientNorm: '梯度范数',
        methodDelta: '方法最大差异',
        predictionDelta: '预测最大差异',
        tolerance: '容差',
        updates: 'GD 更新数',
        train: '训练集',
        heldout: '时间留出集',
        mse: 'MSE',
        mae: 'MAE',
        r2: 'R²',
        row: '固定代表行',
        actual: '真实值',
        prediction: '预测值',
        residual: '残差',
        loss: '单行平方损失',
        gradientContribution: '未平均梯度贡献',
        methods: '三种 OLS 方法对照',
        coefficients: '系数解释',
        modelSpace: '模型空间',
        originalUnit: '原始数据单位',
        conditional: '保持其他建模特征固定时的条件关联，不是因果效应。',
        diagnostics: '留出诊断',
        hourly: '小时残差曲线',
        spread: '预测分箱离散程度',
        named: '命名留出记录',
        coefficientStability: 'atemp 系数稳定性',
        regularization: 'Ridge / Lasso 目标边界',
        objectivesDiffer: 'Ridge 与 Lasso 的目标函数不同于 OLS，因此系数不要求与 OLS 一致。',
        log1p: 'log1p 补充',
        log1pNote: 'log1p 改变目标尺度与系数含义；计数尺度指标必须先用 expm1 逆变换。',
        combinedReview: '综合复盘：优化已完成，但小时形状、需求增大后的离散程度和 atemp 不稳定仍然存在。',
        namedSummary: '展开查看四条真实留出记录',
        caseRole: '诊断角色',
        hour: '小时',
        instant: 'instant',
        resultStatus: '结果状态',
      }
    : {
        title: 'Run results and diagnosis',
        loading: 'Loading the strictly validated local run results.',
        invalid: 'Local run results are unavailable; showing a built-in teaching fixture without full-data metrics.',
        fixture: 'Built-in teaching fixture',
        fixtureNote: 'ŷ = 3 and y = 4, so prediction - actual = -1 and the one-row squared loss is 1.',
        locked: 'Locked Bike run result',
        optimization: 'Optimization completion gate',
        pass: 'Pass: loss, gradient norm, and all three OLS methods agree',
        wait: 'Waiting for a strict result; model limitations remain gated',
        gradientNorm: 'Gradient norm',
        methodDelta: 'Maximum method delta',
        predictionDelta: 'Maximum prediction delta',
        tolerance: 'Tolerance',
        updates: 'GD updates',
        train: 'Training split',
        heldout: 'Chronological holdout',
        mse: 'MSE',
        mae: 'MAE',
        r2: 'R²',
        row: 'Locked representative row',
        actual: 'Actual',
        prediction: 'Prediction',
        residual: 'Residual',
        loss: 'One-row squared loss',
        gradientContribution: 'Unaveraged gradient contribution',
        methods: 'Three-method OLS comparison',
        coefficients: 'Coefficient interpretation',
        modelSpace: 'Model space',
        originalUnit: 'Original data units',
        conditional: 'Conditional association holding modeled features fixed; not a causal effect.',
        diagnostics: 'Held-out diagnosis',
        hourly: 'Hourly residual curve',
        spread: 'Prediction-bin spread',
        named: 'Named held-out records',
        coefficientStability: 'atemp coefficient stability',
        regularization: 'Ridge / Lasso objective boundary',
        objectivesDiffer: 'Ridge and Lasso objectives differ from OLS, so their coefficients are not expected to match OLS.',
        log1p: 'log1p supplement',
        log1pNote: 'log1p changes the target scale and coefficient meaning; count-scale metrics require expm1 first.',
        combinedReview: 'Combined review: optimization is complete, yet hour shape, demand-dependent spread, and atemp instability persist.',
        namedSummary: 'Expand four real held-out records',
        caseRole: 'Diagnostic role',
        hour: 'Hour',
        instant: 'instant',
        resultStatus: 'Result status',
      },
)

const summary = computed(() =>
  lockedSummaryState.value.status === 'ready'
    ? lockedSummaryState.value.summary
    : undefined,
)
const agreement = computed(() =>
  summary.value?.methods.agreement as MethodAgreementShape | undefined,
)
const optimization = computed(() =>
  summary.value?.optimization as unknown as OptimizationShape | undefined,
)
const optimizationGate = computed(() =>
  Boolean(
    agreement.value?.agrees
      && optimization.value?.result.reason === 'gradient-tolerance'
      && Number.isFinite(optimization.value.result.gradientNorm),
  ),
)
const diagnosticStage = computed(() =>
  optimizationGate.value ? summary.value?.diagnostics.stagedOrder ?? [] : [],
)

const methodComparisonRows = computed(() => {
  if (!agreement.value) return []
  return [
    ['gradient-descent', agreement.value.byMethod.numpyBatchGradientDescent],
    ['normal-equation', agreement.value.byMethod.numpyLstsq],
    ['scikit-learn', agreement.value.byMethod.sklearnLinearRegression],
  ] as const
})

const coefficientRows = computed(() => {
  const coefficients = summary.value?.coefficients as unknown as CoefficientShape | undefined
  if (!coefficients) return []
  const rows = []
  for (const space of ['model-space', 'original-unit'] as const) {
    const values =
      space === 'model-space'
        ? coefficients.modelSpace
        : coefficients.originalDatasetUnits
    rows.push({
      space,
      feature: 'intercept',
      value: values.intercept,
    })
    values.featureOrder.forEach((feature, index) => {
      rows.push({ space, feature, value: values.weights[index] ?? 0 })
    })
  }
  return rows
})

const residualChartData = computed(() => ({
  hourlyResiduals: summary.value?.diagnostics.hourlyResiduals ?? [],
  predictionBins: summary.value?.diagnostics.predictionBins ?? [],
}))
const namedCases = computed(() => summary.value?.diagnostics.namedCases ?? [])
const collinearity = computed(() =>
  summary.value?.diagnostics.collinearity as unknown as CollinearityShape | undefined,
)
const log1p = computed(() =>
  summary.value?.diagnostics.log1p as unknown as Log1pShape | undefined,
)

const metricRows = computed(() => {
  if (!summary.value) return []
  return [
    { split: copy.value.train, ...summary.value.metrics.train },
    { split: copy.value.heldout, ...summary.value.metrics.test },
  ]
})

const representativeRow = computed(() =>
  (summary.value?.representativeTrainingRow as unknown as RepresentativeRowShape | undefined)
    ?? teachingFixture,
)
const progress = computed(() =>
  Math.round((props.currentStep / Math.max(props.snapshots.length - 1, 1)) * 100),
)

async function loadSummary(): Promise<void> {
  requestController?.abort()
  const controller = new AbortController()
  requestController = controller
  lockedSummaryState.value = { status: 'loading' }

  try {
    const descriptor = linearRegressionAssetById.get('linear-regression-summary')
    if (!descriptor || descriptor.kind !== 'locked-summary') {
      throw new TypeError('Missing registered linear-regression summary descriptor')
    }
    const response = await fetch(withPublicBase(descriptor.publicPath), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`Unable to load linear-regression summary: ${response.status}`)
    }
    const parsed = parseLinearRegressionSummary(await response.json())
    if (!controller.signal.aborted) {
      lockedSummaryState.value = { status: 'ready', summary: parsed }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    if (!controller.signal.aborted) lockedSummaryState.value = { status: 'invalid' }
  }
}

watch(() => props.section?.id, () => void loadSummary(), { immediate: true })

onBeforeUnmount(() => {
  requestController?.abort()
})
</script>

<template>
  <section class="panel linear-results" aria-live="polite">
    <div class="panel__heading">
      <span>{{ copy.title }}</span>
      <strong>{{ copy.resultStatus }} · {{ progress }}%</strong>
    </div>

    <p v-if="lockedSummaryState.status === 'loading'" role="status">{{ copy.loading }}</p>
    <section v-else-if="lockedSummaryState.status === 'invalid'" class="linear-results__fallback" role="status">
      <strong>{{ copy.fixture }}</strong>
      <p>{{ copy.invalid }}</p>
      <p>{{ copy.fixtureNote }}</p>
    </section>

    <template v-else>
      <section class="linear-results__gate" :class="{ 'is-pass': optimizationGate }">
        <span>{{ copy.optimization }}</span>
        <strong>{{ optimizationGate ? copy.pass : copy.wait }}</strong>
        <dl v-if="optimization && agreement" class="linear-results__inline-list">
          <div>
            <dt>{{ copy.gradientNorm }}</dt>
            <dd>{{ optimization.result.gradientNorm.toExponential(2) }}</dd>
          </div>
          <div>
            <dt>{{ copy.updates }}</dt>
            <dd>{{ optimization.result.updates }}</dd>
          </div>
          <div>
            <dt>{{ copy.methodDelta }}</dt>
            <dd>{{ agreement.maxCoefficientDelta.toExponential(2) }}</dd>
          </div>
          <div>
            <dt>{{ copy.tolerance }}</dt>
            <dd>{{ agreement.tolerance.toExponential(1) }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="summary" class="linear-results__section">
        <h3>{{ copy.row }} · #{{ representativeRow.instant }}</h3>
        <div class="linear-results__grid">
          <article class="chart-summary__item">
            <span>{{ copy.actual }}</span>
            <strong>{{ round(Number(representativeRow.actual), 3) }}</strong>
          </article>
          <article class="chart-summary__item">
            <span>{{ copy.prediction }}</span>
            <strong>{{ round(Number(representativeRow.prediction), 3) }}</strong>
          </article>
          <article class="chart-summary__item">
            <span>{{ copy.residual }} (prediction - actual)</span>
            <strong>{{ round(Number(representativeRow.residual), 6) }}</strong>
          </article>
          <article class="chart-summary__item">
            <span>{{ copy.loss }}</span>
            <strong>{{ Number(representativeRow.lossContribution).toExponential(3) }}</strong>
          </article>
        </div>
        <p>
          {{ copy.gradientContribution }}:
          {{ representativeRow.unaveragedWeightGradientContribution.map((value) => round(value, 5)).join(', ') }}
        </p>
      </section>

      <section v-if="metricRows.length" class="linear-results__section">
        <h3>{{ copy.locked }}</h3>
        <div class="linear-results__table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Split</th>
                <th scope="col">{{ copy.mse }}</th>
                <th scope="col">{{ copy.mae }}</th>
                <th scope="col">{{ copy.r2 }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in metricRows" :key="row.split">
                <th scope="row">{{ row.split }}</th>
                <td>{{ round(row.mse, 3) }}</td>
                <td>{{ round(row.mae, 3) }}</td>
                <td>{{ round(row.r2, 4) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        v-if="props.section?.id === 'training-motion' || props.section?.id === 'polynomial'"
        class="linear-results__section"
      >
        <h3>{{ copy.methods }}</h3>
        <div class="linear-results__table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">{{ copy.methodDelta }}</th>
                <th scope="col">{{ copy.predictionDelta }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[method, result] in methodComparisonRows" :key="method">
                <th scope="row">{{ method }}</th>
                <td>{{ result.maxCoefficientDelta.toExponential(2) }}</td>
                <td>{{ result.maxPredictionDelta.toExponential(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="props.section?.id === 'model-limits'" class="linear-results__section">
        <h3>{{ copy.coefficients }}</h3>
        <p>{{ copy.conditional }}</p>
        <div class="linear-results__table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{{ copy.coefficients }}</th>
                <th scope="col">{{ copy.modelSpace }} / {{ copy.originalUnit }}</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in coefficientRows" :key="`${row.space}-${row.feature}`">
                <th scope="row">{{ row.feature }}</th>
                <td>{{ row.space === 'model-space' ? copy.modelSpace : copy.originalUnit }}</td>
                <td>{{ round(row.value, 5) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>workingday: {{ copy.conditional }}</p>
      </section>

      <section
        v-if="optimizationGate && (props.section?.id === 'overfitting' || props.section?.id === 'regularization')"
        class="linear-results__section"
      >
        <h3>{{ copy.diagnostics }}</h3>
        <p>{{ diagnosticStage.join(' → ') }}</p>

        <section>
          <h4>{{ copy.hourly }}</h4>
          <p>
            {{ residualChartData.hourlyResiduals.map((row) => `${row.hour}h:${round(row.meanResidual, 1)}`).join(' · ') }}
          </p>
        </section>

        <section>
          <h4>{{ copy.spread }}</h4>
          <p>
            {{ residualChartData.predictionBins.map((row) => `Q${row.bin} σ=${round(row.residualStdDev, 1)}, MAE=${round(row.mae, 1)}`).join(' · ') }}
          </p>
        </section>

        <details v-if="namedCases.length">
          <summary>{{ copy.namedSummary }}</summary>
          <div class="linear-results__table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{{ copy.caseRole }}</th>
                  <th scope="col">{{ copy.instant }}</th>
                  <th scope="col">{{ copy.hour }}</th>
                  <th scope="col">{{ copy.prediction }}</th>
                  <th scope="col">{{ copy.actual }}</th>
                  <th scope="col">{{ copy.residual }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="namedCase in namedCases" :key="namedCase.role">
                  <th scope="row">{{ namedCase.role }}</th>
                  <td>{{ namedCase.instant }}</td>
                  <td>{{ namedCase.hour }}</td>
                  <td>{{ round(namedCase.prediction, 2) }}</td>
                  <td>{{ round(namedCase.actual, 2) }}</td>
                  <td>{{ round(namedCase.residual, 2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Residual convention: prediction - actual / 预测值减真实值。</p>
        </details>

        <section v-if="collinearity">
          <h4>{{ copy.coefficientStability }} · atemp</h4>
          <p>
            OLS temp={{ round(collinearity.ols.tempCoefficient, 3) }},
            atemp={{ round(collinearity.ols.atempCoefficient, 3) }};
            Ridge α={{ collinearity.ridge.alpha }},
            Lasso α={{ collinearity.lasso.alpha }}.
          </p>
          <p>{{ copy.objectivesDiffer }}</p>
        </section>

        <section v-if="log1p">
          <h4>{{ copy.log1p }} · log1p / expm1</h4>
          <p>{{ copy.log1pNote }}</p>
          <p>
            Count-scale MSE:
            {{ round(log1p.inverseTransformedCountMetrics.mse, 2) }}.
          </p>
        </section>

        <p>{{ copy.combinedReview }}</p>
      </section>
    </template>
  </section>
</template>
