import type { DataVisualAsset, LocalizedCopy } from '../types/dataLab.ts'
import { buildDataPipelineTaskSnapshot, dataPipelineTeachingRows } from '../utils/pipelineTask.ts'
import { cleaningExampleOutput, cleaningPriceBounds, observedTrainingRooms, trainingRoomsMedian } from '../utils/cleaningTeachingExample.ts'
import { housingTeachingTable } from '../utils/tableTransforms.ts'

const copy = (zh: string, en: string): LocalizedCopy => ({ 'zh-CN': zh, en })
export const scalingReadingExample = buildDataPipelineTaskSnapshot({ scenarioId: 'safe', includeRooms: true, includePrice: false, includeDistrict: false }).scalerStats[0]!
export const scalingTrainingRooms = dataPipelineTeachingRows.filter(row => row.split === 'train').map(row => row.rooms)
const s = scalingReadingExample
export const scalingVariance = (s.standardDeviation ** 2).toFixed(2)
export const clippingBefore = housingTeachingTable.rows.find(row => row.id === 'C-04')!.price
export const clippingAfter = cleaningExampleOutput.rows.find(row => row.id === 'C-04')!.price
const scalingCaption = copy(
  `这张图使用后面 split / fit / transform 实验的独立教学表。训练房间数为 [${scalingTrainingRooms.join(', ')}]，均值 μ=${s.mean}，总体标准差 σ=√${scalingVariance}≈${s.standardDeviation.toFixed(6)}。验证样本为 ${s.validationValue}，只复用训练参数：(${s.validationValue}−${s.mean})/√${scalingVariance}≈${s.transformedValidation.toFixed(6)}。标准化保留行数和列数，也不会自动删除离群点。这里使用 ddof=0，与 StandardScaler 一致；pandas 对照要写 std(ddof=0)。`,
  `This figure uses the separate teaching table in the later split / fit / transform lab. Training room counts are [${scalingTrainingRooms.join(', ')}], with mean μ=${s.mean} and population standard deviation σ=√${scalingVariance}≈${s.standardDeviation.toFixed(6)}. Validation value ${s.validationValue} only reuses training parameters: (${s.validationValue}−${s.mean})/√${scalingVariance}≈${s.transformedValidation.toFixed(6)}. Standardization preserves rows and columns and does not automatically delete outliers. This uses ddof=0, matching StandardScaler; the pandas counterpart is std(ddof=0).`,
)
const cleaningCaption = copy(
  `四个动作分别解决四种问题，图按实验执行顺序排列。把这 ${housingTeachingTable.rows.length} 行看作已划分出的训练片段，补值只由原始训练片段估计。\n\n1. 缺失房间数：有效值排序为 [${observedTrainingRooms.join(', ')}]，中位数 (3+4)/2=${trainingRoomsMedian}；两处 NA 用它插补。3.5 是统计替代值，不表示观察到半间房。\n2. 极端价格：示例预先规定 [${cleaningPriceBounds.lower},${cleaningPriceBounds.upper}]，${clippingBefore} 裁剪为 ${clippingAfter}；这项可关闭，真实极端值不必删除。\n3. 重复记录：按 id 保留第一条 B-03，行数从 ${housingTeachingTable.rows.length} 变为 ${cleaningExampleOutput.rows.length}。\n4. 坏日期：bad-date 解析为 NA，保留该行等待检查。\n\n四项全开时仍有空街区和无效日期，不能说数据已完全干净。这是操作演示，独立于后面的缩放实验表和冻结房价项目。`,
  `The four actions address different problems, in the lab’s execution order. Treat these ${housingTeachingTable.rows.length} rows as an already separated training fragment; estimate the fill value from that original fragment only.\n\n1. Missing rooms: observed values sort to [${observedTrainingRooms.join(', ')}], so median (3+4)/2=${trainingRoomsMedian} fills two NAs. A value of 3.5 is statistical imputation, not an observation of half a room.\n2. Extreme price: this example predeclares [${cleaningPriceBounds.lower},${cleaningPriceBounds.upper}], clipping ${clippingBefore} to ${clippingAfter}. The step can be disabled; real extremes need not be deleted.\n3. Duplicate record: keep the first B-03 by id, reducing ${housingTeachingTable.rows.length} rows to ${cleaningExampleOutput.rows.length}.\n4. Invalid date: parse bad-date as NA and retain the row for inspection.\n\nWith all four steps on, a missing district and invalid date remain; the data is not fully clean. This is an operation demonstration, separate from the scaling lab’s table and the frozen housing project.`,
)
export const scalingReadingVisual: DataVisualAsset = {
  id: 'cleaning-policy-map', type: 'image', layout: 'compact', labels: [], assetPath: '/data-lab/diagrams/scaling/fit-and-transform.svg',
  title: copy('缩放：训练拟合，验证复用', 'Scaling: Fit on Train, Reuse on Validation'), alt: scalingCaption, caption: scalingCaption,
}
export const cleaningReadingVisual: DataVisualAsset = {
  id: 'cleaning-flow', type: 'image', layout: 'compact', labels: [], assetPath: '/data-lab/diagrams/cleaning/four-policies.svg',
  title: copy('四种问题，四个可检查的动作', 'Four Problems, Four Inspectable Actions'), alt: cleaningCaption, caption: cleaningCaption,
}
