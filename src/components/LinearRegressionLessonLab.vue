<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  linearRegressionAssetById,
  linearRegressionChapterIds,
  parseLinearRegressionOutput,
  type LinearRegressionChapterId,
  type LinearRegressionNamedCaseRole,
} from '../data/linearRegressionAssets'
import { simulateLinearRegression } from '../simulations/linearRegression'
import {
  LINEAR_REGRESSION_PUBLISHED_BASELINE,
  createLinearRegressionWorkbenchPackage,
  selectAtempComparison,
  selectCoefficientResult,
  selectGradientTracePoint,
  selectHeldoutCase,
  selectMethodResult,
  selectRowBatchResult,
  type LinearRegressionMethodId,
  type LinearRegressionWorkbenchPackage,
} from '../simulations/linearRegressionWorkbench'
import type {
  ExperimentConfig,
  ExperimentPreset,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import LinearRegressionMultivariateView from './LinearRegressionMultivariateView.vue'
import LinearRegressionUnivariateView from './LinearRegressionUnivariateView.vue'
import LessonWorkbench from './LessonWorkbench.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
  accent: string
  section: StorySection
  presets: ExperimentPreset[]
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
}>()

type WorkbenchMode =
  | 'row-prediction'
  | 'batch-prediction'
  | 'residual-gradient'
  | 'gradient-descent'
  | 'method-comparison'
  | 'coefficient-meaning'
  | 'heldout-diagnosis'
  | 'combined-review'
type LinearScenario = 'linear' | 'multivariate' | 'polynomial' | 'overfit' | 'regularized'
type RowBatchMode = 'row' | 'batch'
type MethodFocus = 'gradient-descent' | 'normal-equation' | 'scikit-learn'
type CoefficientSpace = 'model-space' | 'original-unit'
type DiagnosticStage =
  | 'optimization-complete'
  | 'hourly-residual-shape'
  | 'prediction-bin-spread'
  | 'named-heldout-cases'
  | 'coefficient-stability'
  | 'log1p-comparison'
  | 'combined-review'

interface ChapterWorkbenchState {
  readonly mode: WorkbenchMode
  readonly scenario: LinearScenario
  readonly defaultRowBatchMode: RowBatchMode
  readonly defaultDiagnosticStage: DiagnosticStage
}

type WorkbenchLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly workbench: LinearRegressionWorkbenchPackage }
  | { readonly status: 'invalid'; readonly reason: 'load-failed' | 'unknown-chapter' }

const chapterStates = {
  'fit-line': {
    mode: 'row-prediction',
    scenario: 'linear',
    defaultRowBatchMode: 'row',
    defaultDiagnosticStage: 'optimization-complete',
  },
  multivariate: {
    mode: 'batch-prediction',
    scenario: 'multivariate',
    defaultRowBatchMode: 'batch',
    defaultDiagnosticStage: 'optimization-complete',
  },
  'residual-loss': {
    mode: 'residual-gradient',
    scenario: 'linear',
    defaultRowBatchMode: 'row',
    defaultDiagnosticStage: 'optimization-complete',
  },
  'training-motion': {
    mode: 'gradient-descent',
    scenario: 'linear',
    defaultRowBatchMode: 'batch',
    defaultDiagnosticStage: 'optimization-complete',
  },
  polynomial: {
    mode: 'method-comparison',
    scenario: 'polynomial',
    defaultRowBatchMode: 'batch',
    defaultDiagnosticStage: 'optimization-complete',
  },
  'model-limits': {
    mode: 'coefficient-meaning',
    scenario: 'linear',
    defaultRowBatchMode: 'batch',
    defaultDiagnosticStage: 'optimization-complete',
  },
  overfitting: {
    mode: 'heldout-diagnosis',
    scenario: 'overfit',
    defaultRowBatchMode: 'batch',
    defaultDiagnosticStage: 'hourly-residual-shape',
  },
  regularization: {
    mode: 'combined-review',
    scenario: 'regularized',
    defaultRowBatchMode: 'batch',
    defaultDiagnosticStage: 'combined-review',
  },
} satisfies Record<LinearRegressionChapterId, ChapterWorkbenchState>

const safeChapterFallback = Object.freeze({
  mode: 'row-prediction',
  scenario: 'linear',
  defaultRowBatchMode: 'row',
  defaultDiagnosticStage: 'optimization-complete',
}) satisfies ChapterWorkbenchState

const methodOptions = [
  'gradient-descent',
  'normal-equation',
  'scikit-learn',
] as const satisfies readonly MethodFocus[]
const coefficientSpaces = [
  'model-space',
  'original-unit',
] as const satisfies readonly CoefficientSpace[]
const diagnosticStages = [
  'optimization-complete',
  'hourly-residual-shape',
  'prediction-bin-spread',
  'named-heldout-cases',
  'coefficient-stability',
  'log1p-comparison',
  'combined-review',
] as const satisfies readonly DiagnosticStage[]
const namedCaseRoles = [
  'negative-prediction',
  'morning-peak-underprediction',
  'evening-peak-underprediction',
  'large-residual',
] as const satisfies readonly LinearRegressionNamedCaseRole[]

const { t, locale } = useI18n()
const workbenchState = ref<WorkbenchLoadState>({ status: 'loading' })
const rowBatchMode = ref<RowBatchMode>('row')
const gdTraceStep = ref(0)
const methodFocus = ref<MethodFocus>('gradient-descent')
const coefficientSpace = ref<CoefficientSpace>('model-space')
const diagnosticStage = ref<DiagnosticStage>('optimization-complete')
const selectedHeldoutCase = ref<LinearRegressionNamedCaseRole>('negative-prediction')
const atempComparison = ref(false)
let activeController: AbortController | undefined

function isKnownLinearRegressionChapter(value: string): value is LinearRegressionChapterId {
  return linearRegressionChapterIds.includes(value as LinearRegressionChapterId)
}

const activeChapterId = computed<LinearRegressionChapterId | 'unknown-chapter'>(() =>
  isKnownLinearRegressionChapter(props.section.id) ? props.section.id : 'unknown-chapter',
)
const activeChapterState = computed<ChapterWorkbenchState>(() =>
  activeChapterId.value === 'unknown-chapter'
    ? safeChapterFallback
    : chapterStates[activeChapterId.value],
)
const activeScenario = computed(() =>
  activeChapterId.value === 'unknown-chapter'
    ? 'audited-compact-fallback'
    : activeChapterState.value.scenario,
)

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'Bike 线性回归工作台',
        controls: '本章控制',
        current: '当前值',
        reset: '重置本章',
        rowMode: '单行',
        batchMode: '批量',
        rowBatch: '计算范围',
        gdStep: '梯度下降轨迹步',
        method: '方法焦点',
        coefficientSpace: '系数空间',
        diagnosticStage: '诊断阶段',
        heldoutCase: '留出记录',
        atemp: '加入 atemp 对照',
        atempOff: '关闭',
        atempOn: '开启',
        ready: '严格校验的四文件本地运行结果已就绪',
        loading: '正在读取四个本地运行结果文件；暂时只显示审计过的精简基线。',
        invalid: '四文件运行结果无法完整校验；控件已停用，只显示审计过的精简基线，不会在页面中重算拟合。',
        unknown: '未知章节：控件已停用，只显示审计过的精简基线。',
        fixture: '审计过的精简基线',
        lockedRow: '固定代表行 #11_550',
        formula: '单行：ŷ = xᵀw + b；残差：r = ŷ − y；批量：ŷ = Xw + b1。',
        staticMeaning: '静态说明：先确认优化收敛与三种 OLS 方法一致，再解读留出残差和系数稳定性。',
        teachingSummary: '展开静态教学图：从单行残差到优化路径',
        teachingDiagram: 'Bike 线性回归静态教学图：虚线表示残差，折线表示已发布优化检查点',
        outputRow: '单行运行结果',
        outputBatch: '批量运行结果',
        outputGd: '梯度下降运行结果',
        outputMethod: '方法对照结果',
        outputCoefficients: '系数表结果',
        outputHeldout: '命名留出记录结果',
        outputAtemp: 'atemp 受控对照结果',
        featureValues: '特征值',
        featureOrder: '特征顺序',
        trainRows: '训练行数',
        testRows: '留出行数',
        trainMetrics: '训练指标',
        testMetrics: '留出指标',
        instant: 'instant',
        timestamp: '时间',
        hour: '小时',
        actual: '实际值',
        prediction: '预测值',
        residual: '残差',
        lossContribution: '损失贡献',
        update: '更新步',
        mse: 'MSE',
        gradientNorm: '梯度范数',
        intercept: '截距',
        coefficients: '系数',
        role: '方法角色',
        coefficientDelta: '最大系数差',
        predictionDelta: '最大预测差',
        correlation: 'temp/atemp 训练相关系数',
        conditionNumber: '条件数',
        tempCoefficient: 'temp 系数',
        atempCoefficient: 'atemp 系数',
        perturbation: '目标扰动下系数变化 L2',
        unavailableRows: '完整记录尚不可用；以下精简值来自已交叉校验的发布基线。',
        baseStability: '基础模型未加入 atemp；temp 独自承担温度方向的线性关联。',
        addedStability: '只加入 atemp 后，temp 与 atemp 分摊系数；Ridge 在已发布扰动对照中更稳定。',
        chapterFocus: {
          'fit-line': '先锁定一行真实记录，读出预测、残差和损失贡献。',
          multivariate: '把同一行扩展成固定特征顺序，再切换到批量矩阵。',
          'residual-loss': '从一行的梯度贡献过渡到批量平均梯度。',
          'training-motion': '沿真实 GD 轨迹查看停止条件，而不是在组件内重新拟合。',
          polynomial: '比较 GD、正规方程参考和 scikit-learn 的一致性。',
          'model-limits': '区分模型空间系数与原始数据单位下的条件关联。',
          overfitting: '先通过优化门，再依次查看小时残差、预测分箱和命名记录。',
          regularization: '只增加 atemp，比较 OLS 分配与 Ridge/Lasso 的不同目标。',
          'unknown-chapter': '当前章节不在发布清单中。',
        },
        methodLabels: {
          'gradient-descent': 'NumPy 批量梯度下降',
          'normal-equation': '正规方程 / lstsq 参考',
          'scikit-learn': 'scikit-learn',
        },
        spaceLabels: {
          'model-space': '模型空间',
          'original-unit': '原始数据单位',
        },
        stageLabels: {
          'optimization-complete': '1. 优化完成',
          'hourly-residual-shape': '2. 小时残差形状',
          'prediction-bin-spread': '3. 预测分箱离散程度',
          'named-heldout-cases': '4. 命名留出记录',
          'coefficient-stability': '5. 系数稳定性',
          'log1p-comparison': '6. log1p 补充',
          'combined-review': '7. 综合复盘',
        },
        caseLabels: {
          'negative-prediction': '负预测',
          'morning-peak-underprediction': '早高峰低估',
          'evening-peak-underprediction': '晚高峰低估',
          'large-residual': '大残差',
        },
      }
    : {
        title: 'Bike linear-regression workbench',
        controls: 'Chapter controls',
        current: 'Current value',
        reset: 'Reset chapter',
        rowMode: 'One row',
        batchMode: 'Batch',
        rowBatch: 'Calculation scope',
        gdStep: 'Gradient-descent trace step',
        method: 'Method focus',
        coefficientSpace: 'Coefficient space',
        diagnosticStage: 'Diagnostic stage',
        heldoutCase: 'Held-out record',
        atemp: 'Add atemp comparison',
        atempOff: 'Off',
        atempOn: 'On',
        ready: 'The strictly validated four-file local run is ready',
        loading: 'Loading all four local result files; only the audited compact baseline is shown for now.',
        invalid: 'The four-file result package could not be validated. Controls are disabled and only the audited compact baseline is shown; the page does not refit the model.',
        unknown: 'Unknown chapter: controls are disabled and only the audited compact baseline is shown.',
        fixture: 'Audited compact baseline',
        lockedRow: 'Locked representative row #11_550',
        formula: 'One row: ŷ = xᵀw + b; residual: r = ŷ − y; batch: ŷ = Xw + b1.',
        staticMeaning: 'Static explanation: prove convergence and three-method OLS agreement before interpreting held-out residuals or coefficient stability.',
        teachingSummary: 'Open the static teaching diagram: row residual to optimizer path',
        teachingDiagram: 'Static Bike linear-regression diagram: dashed residual and published optimizer checkpoints',
        outputRow: 'One-row run result',
        outputBatch: 'Batch run result',
        outputGd: 'Gradient-descent run result',
        outputMethod: 'Method comparison result',
        outputCoefficients: 'Coefficient-table result',
        outputHeldout: 'Named held-out record result',
        outputAtemp: 'Controlled atemp comparison result',
        featureValues: 'Feature values',
        featureOrder: 'Feature order',
        trainRows: 'Training rows',
        testRows: 'Held-out rows',
        trainMetrics: 'Training metrics',
        testMetrics: 'Held-out metrics',
        instant: 'instant',
        timestamp: 'Timestamp',
        hour: 'Hour',
        actual: 'Actual',
        prediction: 'Prediction',
        residual: 'Residual',
        lossContribution: 'Loss contribution',
        update: 'Update',
        mse: 'MSE',
        gradientNorm: 'Gradient norm',
        intercept: 'Intercept',
        coefficients: 'Coefficients',
        role: 'Method role',
        coefficientDelta: 'Maximum coefficient delta',
        predictionDelta: 'Maximum prediction delta',
        correlation: 'temp/atemp training correlation',
        conditionNumber: 'Condition number',
        tempCoefficient: 'temp coefficient',
        atempCoefficient: 'atemp coefficient',
        perturbation: 'Coefficient-change L2 under target perturbation',
        unavailableRows: 'Complete rows are unavailable; these compact values come from the cross-authority-audited published baseline.',
        baseStability: 'The base model excludes atemp, so temp carries the modeled temperature association alone.',
        addedStability: 'Adding only atemp splits the coefficients; Ridge is more stable in the published perturbation comparison.',
        chapterFocus: {
          'fit-line': 'Lock one real row, then read its prediction, residual, and loss contribution.',
          multivariate: 'Expand the same row in the fixed feature order, then switch to the batch matrix.',
          'residual-loss': 'Move from one row’s gradient contribution to the batch mean gradient.',
          'training-motion': 'Replay the real GD trace and stop condition without fitting inside the component.',
          polynomial: 'Compare GD, the normal-equation reference, and scikit-learn agreement.',
          'model-limits': 'Separate model-space coefficients from conditional associations in original data units.',
          overfitting: 'Pass the optimization gate, then inspect hour shape, prediction bins, and named records.',
          regularization: 'Add only atemp, then contrast OLS allocation with the different Ridge/Lasso objectives.',
          'unknown-chapter': 'This chapter is not in the published registry.',
        },
        methodLabels: {
          'gradient-descent': 'NumPy batch gradient descent',
          'normal-equation': 'Normal equation / lstsq reference',
          'scikit-learn': 'scikit-learn',
        },
        spaceLabels: {
          'model-space': 'Model space',
          'original-unit': 'Original data units',
        },
        stageLabels: {
          'optimization-complete': '1. Optimization complete',
          'hourly-residual-shape': '2. Hourly residual shape',
          'prediction-bin-spread': '3. Prediction-bin spread',
          'named-heldout-cases': '4. Named held-out records',
          'coefficient-stability': '5. Coefficient stability',
          'log1p-comparison': '6. log1p supplement',
          'combined-review': '7. Combined review',
        },
        caseLabels: {
          'negative-prediction': 'Negative prediction',
          'morning-peak-underprediction': 'Morning peak underprediction',
          'evening-peak-underprediction': 'Evening peak underprediction',
          'large-residual': 'Large residual',
        },
      },
)

const methodIdByFocus = {
  'gradient-descent': 'numpy-batch-gradient-descent',
  'normal-equation': 'numpy-lstsq',
  'scikit-learn': 'sklearn-linear-regression',
} as const satisfies Record<MethodFocus, LinearRegressionMethodId>

const activeWorkbench = computed(() =>
  workbenchState.value.status === 'ready'
    ? workbenchState.value.workbench
    : undefined,
)
const selectedTeachingRow = computed(() =>
  activeWorkbench.value
    ? selectRowBatchResult(activeWorkbench.value, 'row').row
    : LINEAR_REGRESSION_PUBLISHED_BASELINE.representativeRow,
)
const selectedRowBatchResult = computed(() => {
  if (!activeWorkbench.value) return undefined
  return rowBatchMode.value === 'row'
    ? selectRowBatchResult(activeWorkbench.value, 'row')
    : selectRowBatchResult(activeWorkbench.value, 'batch')
})
const selectedGradientTracePoint = computed(() =>
  activeWorkbench.value
    ? selectGradientTracePoint(activeWorkbench.value, gdTraceStep.value)
    : undefined,
)
const selectedMethodResult = computed(() =>
  activeWorkbench.value
    ? selectMethodResult(
        activeWorkbench.value,
        methodIdByFocus[methodFocus.value],
      )
    : undefined,
)
const selectedCoefficientResult = computed(() => {
  if (!activeWorkbench.value) return undefined
  return selectCoefficientResult(
    activeWorkbench.value,
    'numpy-lstsq',
    coefficientSpace.value === 'model-space'
      ? 'model'
      : 'original-dataset-unit',
  )
})
const selectedHeldoutResult = computed(() =>
  activeWorkbench.value
    ? selectHeldoutCase(activeWorkbench.value, selectedHeldoutCase.value)
    : undefined,
)
const selectedAtempResult = computed(() =>
  activeWorkbench.value
    ? selectAtempComparison(activeWorkbench.value)
    : undefined,
)
const optimizationGate = computed(() => {
  if (!activeWorkbench.value) return false
  const result = selectMethodResult(
    activeWorkbench.value,
    'numpy-batch-gradient-descent',
  )
  return (
    result.updates === 772
    && typeof result.gradientNorm === 'number'
    && Number.isFinite(result.gradientNorm)
  )
})
const scenarioSimulation = computed(() =>
  activeChapterId.value === 'unknown-chapter'
    ? undefined
    : simulateLinearRegression({
        ...props.config,
        scenario: activeChapterState.value.scenario,
      }),
)
const visualSnapshots = computed(() =>
  scenarioSimulation.value?.snapshots.length
    ? scenarioSimulation.value.snapshots
    : props.snapshots,
)
const visualSnapshot = computed(() => {
  const snapshots = visualSnapshots.value
  if (!snapshots.length) return props.snapshot
  const stageIndex =
    activeChapterState.value.mode === 'heldout-diagnosis'
      || activeChapterState.value.mode === 'combined-review'
      ? diagnosticStages.indexOf(diagnosticStage.value)
      : Math.min(props.currentStep, snapshots.length - 1)
  return snapshots[Math.max(0, stageIndex)] ?? snapshots[0]
})
const isMultivariate = computed(() => activeChapterState.value.scenario === 'multivariate')

async function loadWorkbenchPackage(chapterId: string): Promise<void> {
  activeController?.abort()
  const requestController = new AbortController()
  activeController = requestController

  if (!isKnownLinearRegressionChapter(chapterId)) {
    workbenchState.value = { status: 'invalid', reason: 'unknown-chapter' }
    return
  }

  workbenchState.value = { status: 'loading' }
  try {
    const summaryDescriptor = linearRegressionAssetById.get(
      'linear-regression-summary',
    )
    const traceDescriptor = linearRegressionAssetById.get(
      'linear-regression-gradient-descent-trace',
    )
    const coefficientDescriptor = linearRegressionAssetById.get(
      'linear-regression-coefficients',
    )
    const residualDescriptor = linearRegressionAssetById.get(
      'linear-regression-heldout-residuals',
    )
    if (
      !summaryDescriptor
      || summaryDescriptor.kind !== 'locked-summary'
      || !traceDescriptor
      || traceDescriptor.kind !== 'complete-gradient-trace'
      || !coefficientDescriptor
      || coefficientDescriptor.kind !== 'complete-coefficient-table'
      || !residualDescriptor
      || residualDescriptor.kind !== 'complete-heldout-residuals'
    ) {
      throw new TypeError('Missing registered linear-regression workbench descriptors')
    }

    const responses = await Promise.all([
      fetch(withPublicBase(summaryDescriptor.publicPath), {
        signal: requestController.signal,
        headers: { Accept: 'application/json' },
      }),
      fetch(withPublicBase(traceDescriptor.publicPath), {
        signal: requestController.signal,
        headers: { Accept: 'text/csv' },
      }),
      fetch(withPublicBase(coefficientDescriptor.publicPath), {
        signal: requestController.signal,
        headers: { Accept: 'text/csv' },
      }),
      fetch(withPublicBase(residualDescriptor.publicPath), {
        signal: requestController.signal,
        headers: { Accept: 'text/csv' },
      }),
    ])
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(
          `Unable to load linear-regression workbench output: ${response.status}`,
        )
      }
    }

    const [summaryPayload, traceCsv, coefficientCsv, residualCsv] =
      await Promise.all([
        responses[0]!.json(),
        responses[1]!.text(),
        responses[2]!.text(),
        responses[3]!.text(),
      ])
    const workbench = createLinearRegressionWorkbenchPackage({
      summary: parseLinearRegressionOutput(
        'linear-regression-summary',
        summaryPayload,
      ),
      gradientTrace: parseLinearRegressionOutput(
        'linear-regression-gradient-descent-trace',
        traceCsv,
      ),
      coefficients: parseLinearRegressionOutput(
        'linear-regression-coefficients',
        coefficientCsv,
      ),
      heldoutResiduals: parseLinearRegressionOutput(
        'linear-regression-heldout-residuals',
        residualCsv,
      ),
    })
    if (!requestController.signal.aborted) {
      workbenchState.value = { status: 'ready', workbench }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    if (!requestController.signal.aborted) {
      workbenchState.value = { status: 'invalid', reason: 'load-failed' }
    }
  }
}

function boundedInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(maximum, Math.max(minimum, Math.round(numeric)))
}

function publishedField(
  value: Readonly<Record<string, unknown>>,
  key: string,
): unknown {
  return Reflect.get(value, key)
}

function publishedNestedField(
  value: Readonly<Record<string, unknown>>,
  key: string,
  nestedKey: string,
): unknown {
  const nested = Reflect.get(value, key)
  if (typeof nested !== 'object' || nested === null) return ''
  return Reflect.get(nested, nestedKey)
}

function onGdTraceInput(event: Event): void {
  const target = event.target as HTMLInputElement
  gdTraceStep.value = boundedInteger(target.value, 0, 772, 0)
}

function setDiagnosticStage(stage: DiagnosticStage): void {
  const requestedIndex = diagnosticStages.indexOf(stage)
  const optimizationIndex = diagnosticStages.indexOf('optimization-complete')
  if (!optimizationGate.value && requestedIndex > optimizationIndex) {
    diagnosticStage.value = 'optimization-complete'
    return
  }
  diagnosticStage.value = stage
}

function onDiagnosticSelect(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  if (diagnosticStages.includes(value as DiagnosticStage)) {
    setDiagnosticStage(value as DiagnosticStage)
  }
}

function handleDiagnosticKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  setDiagnosticStage(event.key === 'Home' ? diagnosticStages[0] : diagnosticStages.at(-1)!)
}

function resetActiveLab(): void {
  const defaults = activeChapterState.value
  rowBatchMode.value = defaults.defaultRowBatchMode
  gdTraceStep.value = 0
  methodFocus.value = 'gradient-descent'
  coefficientSpace.value = 'model-space'
  diagnosticStage.value = defaults.defaultDiagnosticStage
  selectedHeldoutCase.value = 'negative-prediction'
  atempComparison.value = false
  emit('reset')
}

watch(
  () => props.section.id,
  (chapterId) => {
    const state = isKnownLinearRegressionChapter(chapterId)
      ? chapterStates[chapterId]
      : safeChapterFallback
    rowBatchMode.value = state.defaultRowBatchMode
    diagnosticStage.value = state.defaultDiagnosticStage
    void loadWorkbenchPackage(chapterId)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  activeController?.abort()
})
</script>

<template>
  <LessonWorkbench
    class="linear-regression-lab"
    :accent="props.accent"
    :data-scenario="activeScenario"
    :section-id="props.section.id"
    variant="cockpit"
    :style="{ '--linear-accent': props.accent }"
  >
    <template #task>
      <section class="linear-regression-lab__focus linear-regression-lab__focus--task">
        <span>{{ copy.title }}</span>
        <p>{{ copy.chapterFocus[activeChapterId] }}</p>
        <p>{{ copy.formula }}</p>
      </section>
    </template>

    <template #visual>
      <div class="linear-regression-lab__workspace">
        <p class="linear-regression-lab__static-note">{{ copy.staticMeaning }}</p>
        <div
          class="linear-regression-lab__viz"
          :class="{ 'linear-regression-lab__viz-shell': true }"
        >
          <LinearRegressionMultivariateView
            v-if="isMultivariate"
            :snapshot="visualSnapshot"
            :snapshots="visualSnapshots"
            :current-step="props.currentStep"
            :accent="props.accent"
          />
          <LinearRegressionUnivariateView
            v-else
            :snapshot="visualSnapshot"
            :snapshots="visualSnapshots"
            :current-step="props.currentStep"
            :section-id="props.section.id"
          />
        </div>
      </div>
    </template>

    <template #controls>
      <section class="linear-regression-lab__controls" :aria-label="copy.controls">
        <div class="linear-regression-lab__actions">
          <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
            {{ props.isPlaying ? t('actions.pause') : t('actions.play') }}
          </button>
          <button type="button" class="action-button" @click="emit('step')">
            {{ t('actions.step') }}
          </button>
          <button type="button" class="action-button" @click="emit('replay')">
            {{ t('actions.replay') }}
          </button>
          <button type="button" class="action-button" @click="resetActiveLab">
            {{ copy.reset }}
          </button>
        </div>

        <div class="linear-regression-lab__control-grid linear-regression-lab__advanced-controls">
          <label class="control">
            <span class="control__row">
              <span>{{ copy.rowBatch }}</span>
              <strong>{{ rowBatchMode === 'row' ? copy.rowMode : copy.batchMode }}</strong>
            </span>
            <select
              v-model="rowBatchMode"
              :aria-label="copy.rowBatch"
              :disabled="workbenchState.status !== 'ready'"
            >
              <option value="row">{{ copy.rowMode }}</option>
              <option value="batch">{{ copy.batchMode }}</option>
            </select>
          </label>

          <label v-if="activeChapterState.mode === 'gradient-descent'" class="control">
            <span class="control__row">
              <span>{{ copy.gdStep }}</span>
              <strong>{{ gdTraceStep }} / 772</strong>
            </span>
            <input
              type="range"
              min="0"
              max="772"
              step="1"
              :value="gdTraceStep"
              :aria-label="copy.gdStep"
              :disabled="workbenchState.status !== 'ready'"
              @input="onGdTraceInput"
            />
          </label>

          <label v-if="activeChapterState.mode === 'method-comparison'" class="control">
            <span class="control__row">
              <span>{{ copy.method }}</span>
              <strong>{{ copy.methodLabels[methodFocus] }}</strong>
            </span>
            <select
              v-model="methodFocus"
              :aria-label="copy.method"
              :disabled="workbenchState.status !== 'ready'"
            >
              <option v-for="method in methodOptions" :key="method" :value="method">
                {{ copy.methodLabels[method] }}
              </option>
            </select>
          </label>

          <label v-if="activeChapterState.mode === 'coefficient-meaning'" class="control">
            <span class="control__row">
              <span>{{ copy.coefficientSpace }}</span>
              <strong>{{ copy.spaceLabels[coefficientSpace] }}</strong>
            </span>
            <select
              v-model="coefficientSpace"
              :aria-label="copy.coefficientSpace"
              :disabled="workbenchState.status !== 'ready'"
            >
              <option v-for="space in coefficientSpaces" :key="space" :value="space">
                {{ copy.spaceLabels[space] }}
              </option>
            </select>
          </label>

          <label
            v-if="activeChapterState.mode === 'heldout-diagnosis' || activeChapterState.mode === 'combined-review'"
            class="control"
            @keydown="handleDiagnosticKeydown"
          >
            <span class="control__row">
              <span>{{ copy.diagnosticStage }}</span>
              <strong>{{ copy.stageLabels[diagnosticStage] }}</strong>
            </span>
            <select
              :value="diagnosticStage"
              :aria-label="copy.diagnosticStage"
              :disabled="workbenchState.status !== 'ready'"
              @change="onDiagnosticSelect"
            >
              <option
                v-for="stage in diagnosticStages"
                :key="stage"
                :value="stage"
                :disabled="!optimizationGate && stage !== 'optimization-complete'"
              >
                {{ copy.stageLabels[stage] }}
              </option>
            </select>
          </label>

          <label v-if="diagnosticStage === 'named-heldout-cases'" class="control">
            <span class="control__row">
              <span>{{ copy.heldoutCase }}</span>
              <strong>{{ copy.caseLabels[selectedHeldoutCase] }}</strong>
            </span>
            <select
              v-model="selectedHeldoutCase"
              :aria-label="copy.heldoutCase"
              :disabled="workbenchState.status !== 'ready'"
            >
              <option v-for="role in namedCaseRoles" :key="role" :value="role">
                {{ copy.caseLabels[role] }}
              </option>
            </select>
          </label>

          <div v-if="diagnosticStage === 'coefficient-stability'" class="control control--toggle">
            <span class="control__row">
              <span>{{ copy.atemp }}</span>
              <strong>{{ atempComparison ? copy.atempOn : copy.atempOff }}</strong>
            </span>
            <button
              type="button"
              class="toggle-strip__button"
              :class="{ 'is-active': atempComparison }"
              :aria-pressed="atempComparison"
              :disabled="workbenchState.status !== 'ready'"
              @click="atempComparison = !atempComparison"
            >
              {{ atempComparison ? copy.atempOn : copy.atempOff }}
            </button>
          </div>
        </div>
      </section>
    </template>

    <template #metrics>
      <section class="linear-regression-lab__readout" aria-live="polite">
        <p v-if="workbenchState.status === 'loading'" role="status">
          {{ copy.loading }}
        </p>
        <p v-else-if="workbenchState.status === 'invalid'" role="status">
          {{ workbenchState.reason === 'unknown-chapter' ? copy.unknown : copy.invalid }}
        </p>
        <p v-else role="status">{{ copy.ready }}</p>

        <article
          class="linear-regression-lab__selected"
          data-testid="linear-output-row-batch"
          aria-live="polite"
        >
          <div class="linear-regression-lab__heading">
            <span>
              {{
                selectedRowBatchResult?.kind === 'batch'
                  ? copy.outputBatch
                  : copy.outputRow
              }}
            </span>
            <strong>{{ workbenchState.status === 'ready' ? copy.lockedRow : copy.fixture }}</strong>
          </div>
          <template v-if="selectedRowBatchResult?.kind === 'row'">
            <p>
              {{ copy.instant }} {{ selectedRowBatchResult.row.instant }}
              · {{ copy.timestamp }} {{ selectedRowBatchResult.row.timestamp }}
              · {{ copy.hour }} {{ selectedRowBatchResult.row.hour }}
            </p>
            <p>
              {{ copy.featureValues }}:
              {{ selectedRowBatchResult.row.rawFeatures }}
            </p>
            <p>
              {{ copy.prediction }} {{ selectedRowBatchResult.row.prediction }}
              · {{ copy.actual }} {{ selectedRowBatchResult.row.actual }}
              · {{ copy.residual }} {{ selectedRowBatchResult.row.residual }}
              · {{ copy.lossContribution }}
              {{ selectedRowBatchResult.row.lossContribution }}
            </p>
          </template>
          <template v-else-if="selectedRowBatchResult?.kind === 'batch'">
            <p>
              {{ copy.trainRows }} {{ selectedRowBatchResult.trainRows }}
              × {{ selectedRowBatchResult.featureOrder.length }}
              · {{ copy.testRows }} {{ selectedRowBatchResult.testRows }}
            </p>
            <p>
              {{ copy.featureOrder }}:
              {{ selectedRowBatchResult.featureOrder.join(' · ') }}
            </p>
            <p>
              {{ copy.trainMetrics }}:
              MSE {{ selectedRowBatchResult.trainMetrics.mse }}
              · MAE {{ selectedRowBatchResult.trainMetrics.mae }}
              · R² {{ selectedRowBatchResult.trainMetrics.r2 }}
            </p>
            <p>
              {{ copy.testMetrics }}:
              MSE {{ selectedRowBatchResult.testMetrics.mse }}
              · MAE {{ selectedRowBatchResult.testMetrics.mae }}
              · R² {{ selectedRowBatchResult.testMetrics.r2 }}
            </p>
          </template>
          <template v-else>
            <p>{{ copy.unavailableRows }}</p>
            <p>
              {{ copy.instant }} {{ selectedTeachingRow.instant }}
              · {{ copy.featureValues }} {{ selectedTeachingRow.rawFeatures }}
            </p>
            <p>
              {{ copy.prediction }} {{ selectedTeachingRow.prediction }}
              · {{ copy.actual }} {{ selectedTeachingRow.actual }}
              · {{ copy.residual }} {{ selectedTeachingRow.residual }}
            </p>
          </template>
        </article>

        <article
          v-if="activeChapterState.mode === 'gradient-descent'"
          class="linear-regression-lab__selected"
          data-testid="linear-output-gd-trace"
          aria-live="polite"
        >
          <div class="linear-regression-lab__heading">
            <span>{{ copy.outputGd }}</span>
            <strong>{{ copy.update }} {{ selectedGradientTracePoint?.update ?? gdTraceStep }}</strong>
          </div>
          <p v-if="selectedGradientTracePoint">
            {{ copy.mse }} {{ selectedGradientTracePoint.mse }}
            · {{ copy.gradientNorm }} {{ selectedGradientTracePoint.gradientNorm }}
            · {{ copy.intercept }} {{ selectedGradientTracePoint.intercept }}
          </p>
          <p v-if="selectedGradientTracePoint">
            {{ copy.coefficients }}:
            {{ selectedGradientTracePoint.weights.join(' · ') }}
          </p>
          <p v-else>{{ copy.unavailableRows }}</p>
        </article>

        <article
          v-if="activeChapterState.mode === 'method-comparison'"
          class="linear-regression-lab__selected"
          data-testid="linear-output-method"
          aria-live="polite"
        >
          <div class="linear-regression-lab__heading">
            <span>{{ copy.outputMethod }}</span>
            <strong>{{ selectedMethodResult?.method ?? copy.methodLabels[methodFocus] }}</strong>
          </div>
          <template v-if="selectedMethodResult">
            <p>
              {{ copy.role }}: {{ selectedMethodResult.role }}
              · {{ copy.intercept }} {{ selectedMethodResult.intercept }}
            </p>
            <p>
              {{ copy.testMetrics }}:
              MSE {{ selectedMethodResult.testMetrics.mse }}
              · MAE {{ selectedMethodResult.testMetrics.mae }}
              · R² {{ selectedMethodResult.testMetrics.r2 }}
            </p>
            <p>
              {{ copy.coefficientDelta }} {{ selectedMethodResult.maxCoefficientDelta }}
              · {{ copy.predictionDelta }} {{ selectedMethodResult.maxPredictionDelta }}
              <template v-if="selectedMethodResult.updates !== undefined">
                · {{ copy.update }} {{ selectedMethodResult.updates }}
                · {{ copy.gradientNorm }} {{ selectedMethodResult.gradientNorm }}
              </template>
            </p>
            <p>{{ copy.coefficients }}: {{ selectedMethodResult.weights.join(' · ') }}</p>
          </template>
          <p v-else>{{ copy.unavailableRows }}</p>
        </article>

        <article
          v-if="activeChapterState.mode === 'coefficient-meaning'"
          class="linear-regression-lab__selected"
          data-testid="linear-output-coefficient-space"
          aria-live="polite"
        >
          <div class="linear-regression-lab__heading">
            <span>{{ copy.outputCoefficients }}</span>
            <strong>{{ copy.spaceLabels[coefficientSpace] }}</strong>
          </div>
          <table v-if="selectedCoefficientResult">
            <thead>
              <tr>
                <th>{{ copy.featureValues }}</th>
                <th>{{ copy.coefficients }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in selectedCoefficientResult.rows" :key="row.feature">
                <th>{{ row.feature }}</th>
                <td>{{ row.coefficient }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>{{ copy.unavailableRows }}</p>
        </article>

        <article
          v-if="diagnosticStage === 'named-heldout-cases'"
          class="linear-regression-lab__selected"
          data-testid="linear-output-heldout-case"
          aria-live="polite"
        >
          <div class="linear-regression-lab__heading">
            <span>{{ copy.outputHeldout }}</span>
            <strong>{{ selectedHeldoutResult?.role ?? copy.caseLabels[selectedHeldoutCase] }}</strong>
          </div>
          <template v-if="selectedHeldoutResult">
            <p>
              {{ copy.instant }} {{ selectedHeldoutResult.row.instant }}
              · {{ copy.timestamp }} {{ selectedHeldoutResult.row.timestamp }}
              · {{ copy.hour }} {{ selectedHeldoutResult.row.hour }}
            </p>
            <p>
              {{ copy.actual }} {{ selectedHeldoutResult.row.actual }}
              · {{ copy.prediction }} {{ selectedHeldoutResult.row.prediction }}
              · {{ copy.residual }} {{ selectedHeldoutResult.row.residual }}
              · {{ copy.role }} {{ selectedHeldoutResult.summaryCase.role }}
            </p>
          </template>
          <p v-else>{{ copy.unavailableRows }}</p>
        </article>

        <article
          v-if="diagnosticStage === 'coefficient-stability'"
          class="linear-regression-lab__selected"
          data-testid="linear-output-atemp-comparison"
          aria-live="polite"
        >
          <div class="linear-regression-lab__heading">
            <span>{{ copy.outputAtemp }}</span>
            <strong>{{ atempComparison ? copy.atempOn : copy.atempOff }}</strong>
          </div>
          <template v-if="selectedAtempResult && !atempComparison">
            <p>{{ copy.baseStability }}</p>
            <p>
              {{ copy.tempCoefficient }}
              {{ selectedAtempResult.withoutAtemp.tempCoefficient }}
              · {{ copy.testMetrics }} MSE
              {{ selectedAtempResult.withoutAtemp.testMetrics.mse }}
            </p>
          </template>
          <template v-else-if="selectedAtempResult">
            <p>{{ copy.addedStability }}</p>
            <p>
              {{ copy.correlation }} {{ selectedAtempResult.correlation }}
              · {{ copy.conditionNumber }} {{ selectedAtempResult.conditionNumber }}
            </p>
            <p>
              {{ copy.tempCoefficient }}
              {{ publishedField(selectedAtempResult.withAtemp, 'tempCoefficient') }}
              · {{ copy.atempCoefficient }}
              {{ publishedField(selectedAtempResult.withAtemp, 'atempCoefficient') }}
              · {{ copy.testMetrics }} MSE
              {{ publishedNestedField(selectedAtempResult.withAtemp, 'testMetrics', 'mse') }}
            </p>
            <p>
              OLS {{ copy.perturbation }}
              {{ publishedField(selectedAtempResult.withAtemp, 'perturbationL2') }}
              · Ridge {{ copy.perturbation }}
              {{ publishedField(selectedAtempResult.ridge, 'perturbationL2') }}
            </p>
          </template>
          <p v-else>{{ copy.unavailableRows }}</p>
        </article>

        <details class="linear-regression-lab__details linear-regression-lab__details--teaching">
          <summary>{{ copy.teachingSummary }}</summary>
          <section class="linear-regression-lab__teaching-visual">
            <span>{{ copy.title }}</span>
            <svg
              viewBox="0 0 420 180"
              class="linear-regression-lab__teaching-svg"
              role="img"
              :aria-label="copy.teachingDiagram"
            >
              <line x1="34" x2="386" y1="148" y2="148" class="linear-visual-axis" />
              <line x1="34" x2="34" y1="24" y2="148" class="linear-visual-axis" />
              <line x1="96" x2="96" y1="118" y2="74" class="linear-visual-residual" />
              <circle cx="96" cy="118" r="7" class="linear-sample" />
              <circle cx="96" cy="74" r="5" class="linear-state-dot" />
              <polyline
                points="182,126 224,104 268,83 316,62 366,48"
                class="linear-visual-param-path"
              />
            </svg>
            <p>{{ copy.staticMeaning }}</p>
          </section>
        </details>
      </section>
    </template>

    <template #presets>
      <details class="linear-regression-lab__details linear-regression-lab__details--presets">
        <summary>{{ t('common.presets') }}</summary>
        <div class="linear-regression-lab__preset-list">
          <button
            v-for="preset in props.presets"
            :key="preset.id"
            type="button"
            class="preset-card"
            @click="emit('apply-preset', preset.config)"
          >
            <strong>{{ preset.label[locale as 'zh-CN' | 'en'] }}</strong>
            <p>{{ preset.description[locale as 'zh-CN' | 'en'] }}</p>
          </button>
        </div>
      </details>
    </template>
  </LessonWorkbench>
</template>
