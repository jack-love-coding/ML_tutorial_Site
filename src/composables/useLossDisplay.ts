import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { lossFunctionsChapterBindings, lossFunctionsChapterIds, parseLossFunctionsOutput, type LossFunctionsChapterId, type RegressionLossSummary, type BceGradientSummary } from '../data/lossFunctionsAssets.ts'
import { withPublicBase } from '../utils/publicPath.ts'

export function useLossDisplay(chapter: Ref<string>) {
  const regressionSummary = ref<RegressionLossSummary>()
  const bceSummary = ref<BceGradientSummary>()
  const summaryLoading = ref(false)
  const summaryError = ref(false)
  let controller: AbortController | undefined
  watch(chapter, async chapterId => {
    controller?.abort()
    const request = new AbortController()
    controller = request
    regressionSummary.value = undefined
    bceSummary.value = undefined
    summaryError.value = false
    summaryLoading.value = false
    if (!lossFunctionsChapterIds.includes(chapterId as LossFunctionsChapterId)) return
    summaryLoading.value = true
    try {
      const response = await fetch(withPublicBase(`/notebooks/loss-functions/display/${chapterId}.json`), { signal: request.signal, headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`Display data unavailable: ${response.status}`)
      const data = await response.json()
      if (data?.schemaVersion !== 1 || data.chapterId !== chapterId || !data.summaries || typeof data.summaries !== 'object') throw new TypeError('Invalid loss display data')
      const outputs: readonly string[] = lossFunctionsChapterBindings[chapterId as LossFunctionsChapterId].assetIds
      const regression = outputs.includes('regression-loss-summary') ? parseLossFunctionsOutput('regression-loss-summary', data.summaries['regression-loss-summary']) : undefined
      const bce = outputs.includes('bce-gradient-summary') ? parseLossFunctionsOutput('bce-gradient-summary', data.summaries['bce-gradient-summary']) : undefined
      if (request.signal.aborted) return
      regressionSummary.value = regression
      bceSummary.value = bce
    } catch {
      if (!request.signal.aborted) summaryError.value = true
    } finally {
      if (!request.signal.aborted) summaryLoading.value = false
    }
  }, { immediate: true })
  onBeforeUnmount(() => controller?.abort())
  return { regressionSummary, bceSummary, summaryLoading, summaryError }
}
