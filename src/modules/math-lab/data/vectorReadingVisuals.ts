import type { LocalizedCopy, VisualAsset } from '../types/mathLab.ts'
import { MATH_TO_CODE_SAMPLES } from './mathToCode/sharedTask.ts'
const copy = (zh: string, en: string): LocalizedCopy => ({ 'zh-CN': zh, en })
const [a, b] = MATH_TO_CODE_SAMPLES.map(sample => sample.features)
const vectorCaption = copy(
  `两条轴的顺序固定：横轴 x₁ 是基础任务数，纵轴 x₂ 是提示请求数。圆点 A=[${a!.join(', ')}] 与方点 B=[${b!.join(', ')}] 是两条不同记录。蓝箭头从原点到 A，虚线连接 A 到 B；逐项相减 B−A=[${b!.map((value, i) => value - a![i]!).join(', ')}]，表示基础任务少 1、提示多 1。点形和字母也区分记录。箭头长度不表示学习能力，目标得分 y 不在输入向量里。`,
  `The axis order is fixed: horizontal x₁ counts base tasks; vertical x₂ counts hint requests. Circle A=[${a!.join(', ')}] and square B=[${b!.join(', ')}] are different records. The blue arrow runs from the origin to A; the dashed segment connects A to B. Elementwise difference B−A=[${b!.map((value, i) => value - a![i]!).join(', ')}] means one fewer base task and one more hint. Shape and letter distinguish records too. Arrow length does not measure learner ability; target score y is separate from the input vector.`,
)
const shapeCaption = copy(
  `把上图同样的 A、B 按行叠放：第一行 [${a!.join(', ')}]，第二行 [${b!.join(', ')}]。axis 0 数样本，axis 1 按固定顺序数特征，所以 X.shape=(2,2)。取出一行后 shape=(2,)，它不是 (1,2) 的二维表。两个轴刚好都长 2 不代表含义相同；转置仍是 (2,2)，却交换了样本轴和特征轴。目标 y 单独存放。后面的批量预测图加入权重和偏置，得到每行一个预测。`,
  `Stack the same A and B by row: first [${a!.join(', ')}], then [${b!.join(', ')}]. Axis 0 counts samples; axis 1 counts features in their fixed order, so X.shape=(2,2). Selecting one row gives shape (2,), not a two-dimensional (1,2) table. Equal axis lengths do not imply equal meaning: transposing still yields (2,2) but exchanges sample and feature axes. Store target y separately. The later batch-prediction diagram adds weights and bias to produce one prediction per row.`,
)
function visual(id: string, filename: string, title: LocalizedCopy, caption: LocalizedCopy, legacyAnchorIds: string[]): VisualAsset {
  return { id, type: 'image', assetPath: '/math-lab/diagrams/matrices/' + filename, layout: 'compact', title, caption, alt: caption, transcript: caption, learningPurpose: title, legacyAnchorIds }
}
export const vectorReadingVisuals: VisualAsset[] = [
  visual('beginner-linear-algebra-story', 'ordered-features.svg', copy('同一顺序，两个样本', 'One Feature Order, Two Samples'), vectorCaption,
    ['linear-algebra-feature-cards', 'beginner-vector-feature-space-longform']),
  visual('beginner-linear-shape-ledger', 'sample-feature-axes.svg', copy('行是样本，列是特征', 'Rows Are Samples, Columns Are Features'), shapeCaption,
    ['beginner-vector-feature-space-longform--minimum-linear-shape-ledger']),
]
