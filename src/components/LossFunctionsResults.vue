<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  lossFunctionsAssetById,
  lossFunctionsChapterBindings,
  lossFunctionsChapterIds,
  lossFunctionsTopics,
  parseLossFunctionsOutput,
  type BceGradientSummary,
  type LossFunctionsChapterId,
  type LossFunctionsSummaryOutputId,
  type RegressionLossSummary,
} from '../data/lossFunctionsAssets'
import type { AppLocale, ExperimentConfig, StorySection, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'
import { withPublicBase } from '../utils/publicPath'
import CodeLab from '../modules/math-lab/components/CodeLab.vue'

const props = defineProps<{
  activeSection?: StorySection
  snapshot?: TrainingSnapshot
  config: ExperimentConfig
}>()

const { locale } = useI18n()

function localizedText(copy: { 'zh-CN': string; en: string }) {
  return copy[locale.value as AppLocale]
}

const activeSectionId = computed(() => props.activeSection?.id ?? 'why-loss')
const regressionLossKind = computed(() => String(props.config.regressionLossKind ?? 'mse'))
const distributionKind = computed(() => String(props.config.distributionKind ?? 'gaussian'))

const sectionSummary = computed(() =>
  localizedText(props.activeSection?.callout ?? { 'zh-CN': '', en: '' }),
)

const regressionSummary = ref<RegressionLossSummary>()
const bceSummary = ref<BceGradientSummary>()
const summaryLoading = ref(false)
const summaryError = ref(false)
let resultController: AbortController | undefined

function isKnownChapter(value: string): value is LossFunctionsChapterId {
  return lossFunctionsChapterIds.includes(value as LossFunctionsChapterId)
}

function summaryIdsForChapter(chapterId: LossFunctionsChapterId) {
  return lossFunctionsChapterBindings[chapterId].assetIds.filter(
    (assetId): assetId is LossFunctionsSummaryOutputId =>
      assetId === 'regression-loss-summary' || assetId === 'bce-gradient-summary',
  )
}

async function loadLockedResults(chapterId: string) {
  resultController?.abort()
  const requestController = new AbortController()
  resultController = requestController
  regressionSummary.value = undefined
  bceSummary.value = undefined
  summaryError.value = false

  if (!isKnownChapter(chapterId)) {
    summaryLoading.value = false
    return
  }

  const outputIds = summaryIdsForChapter(chapterId)
  summaryLoading.value = outputIds.length > 0

  try {
    const loaded = await Promise.all(
      outputIds.map(async (outputId) => {
        const asset = lossFunctionsAssetById.get(outputId)
        if (!asset || asset.kind !== 'locked-summary') {
          throw new TypeError(`Missing locked summary descriptor: ${outputId}`)
        }
        const response = await fetch(withPublicBase(asset.publicPath), {
          signal: requestController.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) {
          throw new Error(`Unable to load ${outputId}: ${response.status}`)
        }
        return [outputId, parseLossFunctionsOutput(outputId, await response.json())] as const
      }),
    )

    if (requestController.signal.aborted) return
    for (const [outputId, output] of loaded) {
      if (outputId === 'regression-loss-summary') {
        regressionSummary.value = output as RegressionLossSummary
      } else {
        bceSummary.value = output as BceGradientSummary
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    if (!requestController.signal.aborted) summaryError.value = true
  } finally {
    if (!requestController.signal.aborted) summaryLoading.value = false
  }
}

watch(activeSectionId, loadLockedResults, { immediate: true })

onBeforeUnmount(() => {
  resultController?.abort()
})

const resultCopy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    eyebrow: zh ? '本地固定运行结果' : 'Locked local run results',
    loading: zh
      ? '正在读取本章的小型 JSON 汇总；上面的公式与页面内计算仍可使用。'
      : 'Loading this chapter’s small JSON summary; the formulas and built-in calculation above remain available.',
    error: zh
      ? '本地结果暂时无法读取；上面的公式、示例和实验仍然可用。'
      : 'Local results are unavailable; the formulas, worked example, and lab above still work.',
    aggregate: zh ? '完整数据汇总' : 'Full-data summary',
    realRows: zh ? '代表真实行' : 'Representative real rows',
    highRows: zh ? '高贡献真实行' : 'High-contribution real rows',
    confident: zh ? '真实高置信错误行' : 'Real confident-error row',
    fixed: zh ? '固定数值稳定性表（合成探针）' : 'Fixed numerical-stability table (synthetic probes)',
    gradients: zh ? '固定有限差分结果' : 'Locked finite-difference results',
    rowId: zh ? '行 ID' : 'Row ID',
    target: zh ? '目标' : 'Target',
    prediction: zh ? '预测' : 'Prediction',
    residual: zh ? '残差' : 'Residual',
    mse: 'MSE',
    mae: 'MAE',
    label: zh ? '标签' : 'Label',
    logit: 'logit',
    probability: zh ? '概率' : 'Probability',
    bce: 'stable BCE',
    gradient: zh ? '逐元素梯度' : 'Per-element gradient',
    meanGradient: zh ? '均值目标梯度' : 'Mean-objective gradient',
    source: zh ? '来源' : 'Source',
    naive: zh ? '朴素概率 BCE' : 'Naive probability BCE',
    clipped: zh ? '裁剪概率 BCE' : 'Clipped probability BCE',
    stable: zh ? '稳定 logit BCE' : 'Stable logit BCE',
    status: zh ? '状态' : 'Status',
    objectiveChanged: zh ? '目标已改变' : 'objective changed',
    step: 'h',
    analytic: zh ? '解析梯度' : 'Analytic gradient',
    numerical: zh ? '中心差分' : 'Central difference',
    errorValue: zh ? '绝对误差' : 'Absolute error',
    copy: zh ? '复制 NumPy 代码' : 'Copy NumPy code',
    copied: zh ? '已复制' : 'Copied',
    output: zh ? '对应运行输出' : 'Matching run output',
    codeTitle: zh ? '本章 NumPy 对照' : 'Chapter NumPy reference',
    plotAlt: zh
      ? '本地固定运行结果图；图中的线型、形状和文字共同表达差异。'
      : 'Locked local run-result plot; line style, shape, and text jointly encode the comparison.',
  }
})

const regressionRows = computed(() => {
  if (!regressionSummary.value) return []
  return activeSectionId.value === 'regression-losses'
    ? regressionSummary.value.highContributionRows.slice(0, 5)
    : regressionSummary.value.representativeRows
})

const bceRows = computed(() => bceSummary.value?.highContributionRows.slice(0, 5) ?? [])
const fixedProbes = computed(() => bceSummary.value?.fixedProbes ?? [])
const gradientSummaryRows = computed(() => {
  const sweeps = bceSummary.value?.finiteDifferenceSweeps
  if (!sweeps) return []
  return (['mse', 'mae', 'mae-kink', 'bce'] as const).map((kind) => {
    const rows = sweeps[kind]
    return {
      kind,
      row: rows.find(({ step }) => step === 1e-5) ?? rows[0]!,
    }
  })
})

const resultPlot = computed(() => {
  if (activeSectionId.value === 'regression-losses') {
    return lossFunctionsTopics['delivery-losses'].plot
  }
  if (
    activeSectionId.value === 'classification-losses'
    || activeSectionId.value === 'gradient-verification'
  ) {
    return lossFunctionsTopics['manufacturing-bce-gradients'].plot
  }
  return undefined
})

const codePresentation = computed(() => {
  if (activeSectionId.value === 'why-loss' || activeSectionId.value === 'regression-losses') {
    return {
      code: [
        'residual = y_pred - y_true',
        'per_row_mse = residual ** 2',
        'per_row_mae = np.abs(residual)',
        'mse = np.mean(per_row_mse)',
        'mae = np.mean(per_row_mae)',
      ].join('\n'),
      output: regressionSummary.value
        ? `MSE=${formatNumber(regressionSummary.value.aggregate.mse)}\nMAE=${formatNumber(regressionSummary.value.aggregate.mae)}\nn=${regressionSummary.value.aggregate.rowCount}`
        : '',
    }
  }
  if (
    activeSectionId.value === 'classification-losses'
    || activeSectionId.value === 'likelihood-intuition'
    || activeSectionId.value === 'negative-log'
  ) {
    return {
      code: [
        'loss = np.logaddexp(0.0, logits) - labels * logits',
        'probability = np.exp(-np.logaddexp(0.0, -logits))',
        'gradient = (probability - labels) / labels.size',
      ].join('\n'),
      output: bceSummary.value
        ? `mean stable BCE=${formatNumber(bceSummary.value.aggregate.meanStableBce)}\nn=${bceSummary.value.aggregate.rowCount}`
        : '',
    }
  }
  if (activeSectionId.value === 'gradient-verification') {
    return {
      code: [
        'plus[index] += h',
        'minus[index] -= h',
        'numeric = (loss_fn(plus) - loss_fn(minus)) / (2.0 * h)',
        'absolute_error = abs(analytic - numeric)',
      ].join('\n'),
      output: gradientSummaryRows.value
        .map(({ kind, row }) => `${kind}: ${row.status}, error=${formatNumber(row.absoluteError)}`)
        .join('\n'),
    }
  }
  return undefined
})

const panelCopy = computed(() => {
  const shared =
    locale.value === 'zh-CN'
      ? {
          eyebrow: '本章读后你应该能回答',
          noteLabel: '一句话复习',
        }
      : {
          eyebrow: 'After this chapter, you should be able to answer',
          noteLabel: 'One-line review',
        }

  if (activeSectionId.value === 'regression-losses') {
    return {
      ...shared,
      title: locale.value === 'zh-CN' ? 'MSE 和 MAE 到底差在哪里？' : 'What really separates MSE from MAE?',
      note:
        locale.value === 'zh-CN'
          ? '关键不在于公式长得不同，而在于它们会不会把大误差额外放大。'
          : 'The key is not cosmetic formula differences, but whether large errors get amplified.',
      cards: [
        {
          id: 'residual',
          label: locale.value === 'zh-CN' ? '当前残差是多少？' : 'What is the current residual?',
          value: round(Number(props.snapshot?.selectedObservation?.residual ?? 0)),
        },
        {
          id: 'rule',
          label: locale.value === 'zh-CN' ? '现在采用哪种规则？' : 'Which rule is active now?',
          value: regressionLossKind.value === 'mse' ? 'MSE' : 'MAE',
        },
        {
          id: 'dataset-loss',
          label: locale.value === 'zh-CN' ? '离群点会不会拉偏拟合？' : 'Does the outlier pull the fit?',
          value: round(Number(props.snapshot?.selectedObservation?.totalRegressionLoss ?? 0)),
        },
      ],
    }
  }

  if (activeSectionId.value === 'classification-losses') {
    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? 'BCE 为什么会扩展成 Softmax？'
          : 'Why does BCE expand into softmax?',
      note:
        locale.value === 'zh-CN'
          ? '二分类里只需要一个概率，因为另一类自动是 1-p；多分类里必须把所有类别一起归一化。只剩两类时，softmax 会退化成 sigmoid，所以 BCE 就是 softmax cross-entropy 的二分类特例。'
          : 'Binary classification only needs one probability because the other class is automatically 1 - p. Multiclass classification must normalize all classes together. When only two classes remain, softmax collapses into sigmoid, so BCE is the binary special case of softmax cross-entropy.',
      cards: [
        {
          id: 'bce',
          label: locale.value === 'zh-CN' ? '当前 BCE 有多大？' : 'How large is the current BCE?',
          value: round(Number(props.snapshot?.selectedObservation?.bce ?? 0)),
        },
        {
          id: 'softmax',
          label: locale.value === 'zh-CN' ? '当前 Softmax CE 有多大？' : 'How large is the current softmax CE?',
          value: round(Number(props.snapshot?.selectedObservation?.multiclassCrossEntropy ?? 0)),
        },
        {
          id: 'binary-margin',
          label: locale.value === 'zh-CN' ? '二分类所需 logit 差是多少？' : 'What binary logit gap is needed?',
          value: round(Number(props.snapshot?.selectedObservation?.binaryMargin ?? 0), 2),
        },
        {
          id: 'softmax-margin',
          label: locale.value === 'zh-CN' ? '三分类所需领先分数是多少？' : 'What three-class lead score is needed?',
          value: round(Number(props.snapshot?.selectedObservation?.softmaxMargin ?? 0), 2),
        },
      ],
    }
  }

  if (activeSectionId.value === 'likelihood-intuition') {
    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? '似然到底在给谁打分？'
          : 'Who is likelihood actually scoring?',
      note:
        locale.value === 'zh-CN'
          ? '似然不是给数据打分，而是在比较“哪个参数更能解释这批数据”。'
          : 'Likelihood is not scoring the data itself. It is comparing which parameter explains that data better.',
      cards: [
        {
          id: 'trial-count',
          label: locale.value === 'zh-CN' ? '观测了多少次？' : 'How many trials were observed?',
          value: Number(props.snapshot?.selectedObservation?.trialCount ?? 0),
        },
        {
          id: 'successes',
          label: locale.value === 'zh-CN' ? '其中有多少次成功？' : 'How many successes were observed?',
          value: Number(props.snapshot?.selectedObservation?.observedSuccesses ?? 0),
        },
        {
          id: 'candidate',
          label: locale.value === 'zh-CN' ? '当前正在测试哪个参数？' : 'Which parameter is being tested now?',
          value: round(Number(props.snapshot?.selectedObservation?.candidateProbability ?? 0), 2),
        },
      ],
    }
  }

  if (activeSectionId.value === 'negative-log') {
    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? '为什么要取对数并加负号？'
          : 'Why take the log and add a minus sign?',
      note:
        locale.value === 'zh-CN'
          ? '对数把连乘变成连加，负号把最大化似然改写成最小化损失。'
          : 'The log turns products into sums, and the minus sign turns likelihood maximization into loss minimization.',
      cards: [
        {
          id: 'joint',
          label: locale.value === 'zh-CN' ? '联合似然现在有多小？' : 'How small is the joint likelihood now?',
          value: formatNumber(Number(props.snapshot?.jointLikelihood ?? 0)),
        },
        {
          id: 'log',
          label: locale.value === 'zh-CN' ? '对数似然是多少？' : 'What is the log-likelihood?',
          value: round(Number(props.snapshot?.jointLogLikelihood ?? 0)),
        },
        {
          id: 'nll',
          label: locale.value === 'zh-CN' ? '翻译成损失后是多少？' : 'What does it become as a loss?',
          value: round(Number(props.snapshot?.selectedObservation?.coinNll ?? 0)),
        },
      ],
    }
  }

  if (activeSectionId.value === 'mle-bridge') {
    const distributionLabel =
      distributionKind.value === 'gaussian'
        ? 'Gaussian'
        : distributionKind.value === 'laplace'
          ? 'Laplace'
          : 'Bernoulli'

    return {
      ...shared,
      title:
        locale.value === 'zh-CN'
          ? 'MLE 如何解释常见 loss？'
          : 'How does MLE explain familiar losses?',
      note:
        locale.value === 'zh-CN'
          ? '一旦先写下数据生成假设，负对数似然往往就自然变成了我们熟悉的损失函数。'
          : 'Once a data-generation assumption is written down, the negative log-likelihood often turns naturally into a familiar loss.',
      cards: [
        {
          id: 'distribution',
          label: locale.value === 'zh-CN' ? '当前分布假设是什么？' : 'What is the current distribution assumption?',
          value: distributionLabel,
        },
        {
          id: 'nll',
          label: locale.value === 'zh-CN' ? '当前负对数似然是多少？' : 'What is the current negative log-likelihood?',
          value: round(Number(props.snapshot?.selectedObservation?.nll ?? 0)),
        },
        {
          id: 'equivalence',
          label: locale.value === 'zh-CN' ? '它对应哪种 loss？' : 'Which loss does it match?',
          value: String(props.snapshot?.selectedObservation?.equivalence ?? 'MSE'),
        },
      ],
    }
  }

  const sampleObjective = props.snapshot?.sampleLossBreakdown?.length
    ? round(
        props.snapshot.sampleLossBreakdown.reduce((sum, sample) => sum + sample.loss, 0) /
          props.snapshot.sampleLossBreakdown.length,
      )
    : 0

  return {
    ...shared,
    title:
      locale.value === 'zh-CN'
        ? '为什么训练前要先定义 loss？'
        : 'Why define the loss before training?',
    note:
      locale.value === 'zh-CN'
        ? '误差只是差了多少；loss 才是训练真正要最小化的评分规则。'
        : 'Error only measures the gap. Loss is the scoring rule training actually minimizes.',
    cards: [
      {
        id: 'residual',
        label: locale.value === 'zh-CN' ? '当前误差是多少？' : 'What is the current error?',
        value: round(Number(props.snapshot?.selectedObservation?.residual ?? 0)),
      },
      {
        id: 'penalty',
        label: locale.value === 'zh-CN' ? '这个误差被记成多少损失？' : 'How much loss does that error become?',
        value: round(
          Number(
            props.snapshot?.selectedObservation?.[
              regressionLossKind.value === 'mse' ? 'mse' : 'mae'
            ] ?? 0,
          ),
        ),
      },
      {
        id: 'objective',
        label: locale.value === 'zh-CN' ? '多个样本合并后的目标是多少？' : 'What is the combined objective over samples?',
        value: sampleObjective,
      },
    ],
  }
})

function formatNumber(value: number) {
  if (value >= 0.001) return round(value)
  return value.toExponential(2)
}
</script>

<template>
  <section class="panel loss-reading-panel">
    <div class="panel__heading">
      <span>{{ panelCopy.eyebrow }}</span>
      <strong>{{ panelCopy.title }}</strong>
    </div>

    <p class="loss-reading-panel__lead">{{ sectionSummary }}</p>

    <div class="loss-reading-grid">
      <article
        v-for="card in panelCopy.cards"
        :key="card.id"
        class="loss-reading-card"
      >
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </div>

    <div class="loss-reading-panel__note">
      <span>{{ panelCopy.noteLabel }}</span>
      <p>{{ panelCopy.note }}</p>
    </div>

    <div class="loss-locked-results">
      <div class="panel__heading">
        <span>{{ resultCopy.eyebrow }}</span>
        <strong>{{ resultCopy.aggregate }}</strong>
      </div>

      <p
        v-if="summaryLoading || summaryError"
        class="loss-results__fallback"
        :class="{ 'is-error': summaryError }"
        role="status"
        aria-live="polite"
      >
        {{ summaryLoading ? resultCopy.loading : resultCopy.error }}
      </p>

      <template v-if="regressionSummary">
        <div class="loss-reading-grid loss-reading-grid--locked">
          <article class="loss-reading-card">
            <span>MSE · n={{ regressionSummary.aggregate.rowCount }}</span>
            <strong>{{ formatNumber(regressionSummary.aggregate.mse) }}</strong>
          </article>
          <article class="loss-reading-card">
            <span>MAE · n={{ regressionSummary.aggregate.rowCount }}</span>
            <strong>{{ formatNumber(regressionSummary.aggregate.mae) }}</strong>
          </article>
          <article class="loss-reading-card">
            <span>{{ resultCopy.prediction }}</span>
            <strong>{{ formatNumber(regressionSummary.referencePredictionMinutes) }} min</strong>
          </article>
        </div>

        <div class="loss-table-scroll">
          <table class="loss-locked-table">
            <caption>
              {{
                activeSectionId === 'regression-losses'
                  ? resultCopy.highRows
                  : resultCopy.realRows
              }}
            </caption>
            <thead>
              <tr>
                <th scope="col">{{ resultCopy.rowId }}</th>
                <th scope="col">{{ resultCopy.target }}</th>
                <th scope="col">{{ resultCopy.prediction }}</th>
                <th scope="col">{{ resultCopy.residual }}</th>
                <th scope="col">{{ resultCopy.mse }}</th>
                <th scope="col">{{ resultCopy.mae }}</th>
                <th scope="col">{{ resultCopy.gradient }}</th>
                <th scope="col">{{ resultCopy.meanGradient }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in regressionRows" :key="row.courseRowId">
                <th scope="row">{{ row.courseRowId }}</th>
                <td>{{ formatNumber(row.targetMinutes) }}</td>
                <td>{{ formatNumber(row.predictionMinutes) }}</td>
                <td>{{ formatNumber(row.residualMinutes) }}</td>
                <td>{{ formatNumber(row.mseLoss) }}</td>
                <td>{{ formatNumber(row.maeLoss) }}</td>
                <td>
                  MSE {{ formatNumber(row.msePerElementGradient) }}
                  / MAE {{ formatNumber(row.maePerElementSubgradient) }}
                </td>
                <td>
                  MSE {{ formatNumber(row.mseMeanObjectiveGradient) }}
                  / MAE {{ formatNumber(row.maeMeanObjectiveSubgradient) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-if="bceSummary">
        <div class="loss-reading-grid loss-reading-grid--locked">
          <article class="loss-reading-card">
            <span>mean stable BCE · n={{ bceSummary.aggregate.rowCount }}</span>
            <strong>{{ formatNumber(bceSummary.aggregate.meanStableBce) }}</strong>
          </article>
          <article class="loss-reading-card">
            <span>SECOM</span>
            <strong>
              {{ bceSummary.dataset.observedFeatureCount }}
              /
              {{ bceSummary.dataset.declaredFeatureCount }}
            </strong>
          </article>
        </div>

        <article
          v-if="activeSectionId === 'classification-losses'"
          class="loss-confident-row"
        >
          <span>● {{ resultCopy.confident }} · {{ bceSummary.confidentError.source }}</span>
          <strong>{{ bceSummary.confidentError.courseRowId }}</strong>
          <p>
            y={{ bceSummary.confidentError.label }},
            z={{ formatNumber(bceSummary.confidentError.logit) }},
            p={{ formatNumber(bceSummary.confidentError.probability) }},
            BCE={{ formatNumber(bceSummary.confidentError.stableBce) }},
            ∂L/∂z={{ formatNumber(bceSummary.confidentError.perLogitGradient) }}
          </p>
        </article>

        <div
          v-if="activeSectionId === 'classification-losses'"
          class="loss-table-scroll"
        >
          <table class="loss-locked-table">
            <caption>{{ resultCopy.highRows }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ resultCopy.rowId }}</th>
                <th scope="col">{{ resultCopy.label }}</th>
                <th scope="col">{{ resultCopy.logit }}</th>
                <th scope="col">{{ resultCopy.probability }}</th>
                <th scope="col">{{ resultCopy.bce }}</th>
                <th scope="col">{{ resultCopy.gradient }}</th>
                <th scope="col">{{ resultCopy.meanGradient }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in bceRows" :key="row.courseRowId">
                <th scope="row">{{ row.courseRowId }}</th>
                <td>{{ row.label }}</td>
                <td>{{ formatNumber(row.logit) }}</td>
                <td>{{ formatNumber(row.probability) }}</td>
                <td>{{ formatNumber(row.stableBce) }}</td>
                <td>{{ formatNumber(row.perLogitGradient) }}</td>
                <td>{{ formatNumber(row.meanObjectiveGradient) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="activeSectionId === 'classification-losses' || activeSectionId === 'negative-log'"
          class="loss-table-scroll"
        >
          <table class="loss-locked-table loss-locked-table--probes">
            <caption>{{ resultCopy.fixed }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ resultCopy.logit }}</th>
                <th scope="col">{{ resultCopy.label }}</th>
                <th scope="col">{{ resultCopy.naive }}</th>
                <th scope="col">{{ resultCopy.clipped }}</th>
                <th scope="col">{{ resultCopy.stable }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in fixedProbes" :key="`${row.logit}-${row.label}`">
                <th scope="row">{{ row.logit }}</th>
                <td>{{ row.label }}</td>
                <td>
                  {{ row.naive.status }}
                  <span v-if="row.naive.value !== null">
                    · {{ formatNumber(row.naive.value) }}
                  </span>
                </td>
                <td>
                  {{ formatNumber(row.clipped.value) }}
                  <span v-if="row.clipped.objectiveChanged">
                    · ▲ {{ resultCopy.objectiveChanged }}
                  </span>
                </td>
                <td>● {{ row.stable.status }} · {{ formatNumber(row.stable.value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="activeSectionId === 'gradient-verification'"
          class="loss-table-scroll"
        >
          <table class="loss-locked-table">
            <caption>{{ resultCopy.gradients }} · h=1e-5</caption>
            <thead>
              <tr>
                <th scope="col">loss</th>
                <th scope="col">{{ resultCopy.step }}</th>
                <th scope="col">{{ resultCopy.analytic }}</th>
                <th scope="col">{{ resultCopy.numerical }}</th>
                <th scope="col">{{ resultCopy.errorValue }}</th>
                <th scope="col">{{ resultCopy.status }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="{ kind, row } in gradientSummaryRows" :key="kind">
                <th scope="row">{{ kind }}</th>
                <td>{{ row.step.toExponential(0) }}</td>
                <td>{{ formatNumber(row.analyticValue) }}</td>
                <td>{{ formatNumber(row.numericalValue) }}</td>
                <td>{{ formatNumber(row.absoluteError) }}</td>
                <td>
                  {{ row.status === 'pass' ? '●' : row.status === 'kink' ? '◆' : '▲' }}
                  {{ row.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <figure v-if="resultPlot" class="loss-result-plot">
        <img
          :src="withPublicBase(resultPlot.publicPath)"
          :alt="resultCopy.plotAlt"
          width="960"
          height="540"
          loading="lazy"
        />
        <figcaption>{{ localizedText(resultPlot.description) }}</figcaption>
      </figure>

      <CodeLab
        v-if="codePresentation"
        :title="resultCopy.codeTitle"
        :label="resultCopy.eyebrow"
        :code="codePresentation.code"
        :output="codePresentation.output"
        :copy-label="resultCopy.copy"
        :copied-label="resultCopy.copied"
        :output-label="resultCopy.output"
      />
    </div>
  </section>
</template>
