import type { LocalizedCopy, VisualAsset } from '../types/mathLab.ts'
import { calibrationExample, observedFrequency, softmaxExample, spreadExamples } from '../utils/probabilityReadingExamples.ts'

const copy = (zh: string, en: string): LocalizedCopy => ({ 'zh-CN': zh, en })
function figure(id: string, filename: string, title: LocalizedCopy, description: LocalizedCopy, legacyAnchorIds?: string[]): VisualAsset {
  return { id, type: 'image', assetPath: `/math-lab/diagrams/probability/${filename}`, layout: 'compact', title,
    alt: description, caption: description, transcript: description, legacyAnchorIds,
    learningPurpose: copy('先读图中的一个问题，再用原生文字和数值核对；图片不可用时仍可完整阅读。', 'Read one question per diagram and verify it with native text and numbers, including when the image is unavailable.') }
}
const s = softmaxExample, c = calibrationExample
export const probabilityReadingVisuals: VisualAsset[] = [
  figure('beginner-probability-story', 'outcome-distribution.svg', copy('概率分给哪些结果？', 'Which outcomes receive probability?'), copy(
    '本章只看“按时完成”这一个事件。Z=0 表示未按时，Z=1 表示按时。两条使用相同的 0—1 长度刻度：P(Z=0)=0.30，P(Z=1)=0.70。它们是模型的假设分布，总和为 1；一次真实观察只能得到 0 或 1。',
    'This chapter follows one event: finishing on time. Z=0 means not on time; Z=1 means on time. Both bars use the same 0–1 length scale: P(Z=0)=0.30 and P(Z=1)=0.70. This is the model’s assumed distribution, summing to 1; a single observation can only be 0 or 1.'),
    ['beginner-probability-story--beginner-probability-sample-space', 'beginner-probability-why-longform']),
  figure('beginner-sample-space-random-variable-longform', 'event-indicator.svg', copy('把事件映射成 0 或 1', 'Map an event to zero or one'), copy(
    'A 是“按时完成”。先观察结果，再按同一规则得到 Z：A 发生取 1，否则取 0。图中的 0.70 和 0.30 是概率，框的大小不代表概率。这里的 0/1 是事件指示量，因此样本平均值等于事件频率；任意类别编号没有这种解释。',
    'A is “finishes on time.” Observe the outcome, then apply one rule: Z=1 if A occurs, otherwise Z=0. The values 0.70 and 0.30 are probabilities; box sizes do not encode them. These zeros and ones are event indicators, so their sample average equals event frequency. Arbitrary category IDs do not have that interpretation.'),
    ['beginner-sample-space-random-variable-longform--beginner-probability-sample-space']),
  figure('beginner-distribution-frequency-longform', 'sample-frequency.svg', copy('12 次样本与模型概率', 'Twelve samples and the model probability'), copy(
    `圆圈按 NumPy 参考输出的顺序排列：种子 7，12 次中 9 次为 1。蓝条是经验频率 9/12=${observedFrequency.toFixed(2)}；棕条是生成这些样本的模型概率 0.70，两条都用 0—1 刻度。频率来自有限样本，不必等于概率；增加样本也不保证每一步误差都减小。`,
    `The circles follow the NumPy reference output in order: seed 7 gives nine ones in twelve trials. The blue bar is empirical frequency 9/12=${observedFrequency.toFixed(2)}; the brown bar is the generating model probability 0.70, both on a 0–1 scale. Finite-sample frequency need not equal probability; adding samples does not guarantee smaller error at every step.`),
    ['beginner-distribution-frequency-longform--minimum-probability-numpy-output']),
  figure('beginner-expectation-variance-longform', 'same-mean-spread.svg', copy('同一均值，不同方差', 'Same mean, different variance'), copy(
    `这是两个假设的离散分布，圆点是可能值、各有一半概率，两行共用 0—4 刻度。上行 X∈{1,3}，E[X]=${spreadExamples[0]!.mean}、Var(X)=${spreadExamples[0]!.variance}；下行 X∈{0,4}，E[X]=${spreadExamples[1]!.mean}、Var(X)=${spreadExamples[1]!.variance}。虚线标记相同的均值 2。均值相同而偏离均值的平方不同；这并不能单独证明哪个模型更准确。`,
    `These are two hypothetical discrete distributions. Dots mark possible values, each with probability one half; both rows use the same 0–4 scale. Above, X∈{1,3} gives E[X]=${spreadExamples[0]!.mean} and Var(X)=${spreadExamples[0]!.variance}; below, X∈{0,4} gives E[X]=${spreadExamples[1]!.mean} and Var(X)=${spreadExamples[1]!.variance}. Dashed lines mark the shared mean 2. Squared deviations differ despite equal means; this alone does not establish model accuracy.`)),
  figure('beginner-calibration-confidence-longform', 'calibration-cohort.svg', copy('90% 把握，实际对了多少？', '90% confidence: how many were correct?'), copy(
    `假设 ${c.count} 条有标签记录都以 90% 把握预测“按时完成”，其中 ${c.correct} 条确实按时。横轴是平均置信度 0.90，纵轴是实际正确率 ${c.correct}/${c.count}=0.60；点 (0.90,0.60) 低于理想线 y=x，说明这组预测过度自信。这里比较一组记录，不能凭一次结果判断校准；10 条也不足以证明总体校准质量。`,
    `Suppose ${c.count} labelled records are all predicted “on time” with 90% confidence, and ${c.correct} actually finish on time. The x-axis is mean confidence 0.90 and the y-axis is observed accuracy ${c.correct}/${c.count}=0.60. Point (0.90,0.60) lies below ideal line y=x: this group is overconfident. Calibration compares groups, not a single outcome; ten records also do not establish population-wide calibration quality.`)),
  figure('beginner-softmax-cross-entropy-longform', 'softmax-target.svg', copy('同一组分数，复算概率与损失', 'Recompute probabilities and loss from one score vector'), copy(
    `固定温度 T=1，三类 C0/C1/C2 的 logits 为 [${s.logits.join(', ')}]。图中各条共用 0—1 长度刻度。真实标签为 C2，虚线框标记它；q 是模型分给真实类别的概率，不是“真实概率”。\n\n| 类别 | logit | softmax 概率 |\n| --- | ---: | ---: |\n${s.logits.map((z, i) => `| C${i} | ${z} | ${s.probabilities[i]!.toFixed(6)} |`).join('\n')}\n\nq=${s.targetProbability.toFixed(6)}，−ln(q)≈${s.loss.toFixed(6)}。使用自然对数和未舍入的 q；四舍五入后的三项概率之和可能略偏离 1。损失目标的完整推导留到后续分类损失课。`,
    `At fixed temperature T=1, classes C0/C1/C2 have logits [${s.logits.join(', ')}]. Every bar uses the same 0–1 length scale. The true label is C2, marked by the dashed outline. q is the model probability assigned to the true class, not a “true probability.”\n\n| Class | Logit | Softmax probability |\n| --- | ---: | ---: |\n${s.logits.map((z, i) => `| C${i} | ${z} | ${s.probabilities[i]!.toFixed(6)} |`).join('\n')}\n\nq=${s.targetProbability.toFixed(6)} and −ln(q)≈${s.loss.toFixed(6)}. Use natural logarithms and the unrounded q; displayed rounded probabilities can sum slightly above or below 1. The full objective derivation belongs to the later classification-loss lesson.`)),
]
