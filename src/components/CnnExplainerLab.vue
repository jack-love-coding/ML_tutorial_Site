<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { interpolateBrBG, interpolateGreys, interpolateOranges, interpolateRdBu, rgb } from 'd3'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../types/ml'
import MarkdownMathContent from './MarkdownMathContent.vue'
import {
  buildCnnHyperparameterSnapshot,
  buildCnnOperationDetail,
  calculateReceptiveField,
  roundCnnValue,
  runTinyVggForwardPass,
  summarizeLayerShape,
  type CnnClassScore,
  type CnnChannelContribution,
  type CnnLayerSnapshot,
  type CnnLinkSnapshot,
  type CnnNodeSnapshot,
  type CnnReceptiveFieldSnapshot,
} from '../utils/cnnExplainer'
import { withPublicBase } from '../utils/publicPath'

const props = defineProps<{
  section: StorySection
}>()

const { locale } = useI18n()

type CnnLabStatus = 'idle' | 'loading' | 'ready' | 'error'
type CnnColorMode = 'activation' | 'weights' | 'logits'
type CnnScaleMode = 'local' | 'module' | 'global'

interface CnnSampleImage {
  id: string
  label: string
  url: string
}

interface CnnSampleClassCard extends CnnSampleImage {
  probability: number
  probabilityLabel: string
  isSelected: boolean
  isTopPrediction: boolean
  isExpectedPrediction: boolean
}

interface CnnSampleDefinition {
  label: string
  path: string
}

interface CnnBridgePreviewOrigin {
  layerIndex: number
  nodeIndex: number
  row: number
  col: number
  wasPlaying: boolean
}

interface CnnConvAnimatorAnchor {
  layerIndex: number
  nodeIndex: number
  row: number
  col: number
}

interface CnnOverviewEdge {
  id: string
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
  selected: boolean
  incoming: boolean
  outgoing: boolean
  traceBackward: boolean
  traceForward: boolean
}

interface CnnOverviewFlowPacket {
  id: string
  path: string
  x: number
  y: number
  tone: 'incoming' | 'outgoing' | 'trace'
}

interface CnnOverviewPoint {
  x: number
  y: number
}

interface CnnOverviewPlate {
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

interface CnnOverviewLocalWindow {
  id: string
  kind: 'source' | 'output'
  x: number
  y: number
  width: number
  height: number
  row: number
  col: number
  rowSpan: number
  colSpan: number
  value: number
  layerIndex: number
  nodeIndex: number
  layerName: string
  targetLayerName: string
  targetNodeIndex: number
}

interface CnnOverviewWindowFocus {
  kind: 'source' | 'output'
  layerIndex: number
  nodeIndex: number
}

interface CnnOverviewNodeFocus {
  layerIndex: number
  nodeIndex: number
}

interface CnnOverviewTraceStep {
  id: string
  label: string
  detail: string
  layerIndex: number
  nodeIndex: number
  tone: 'input' | 'current' | 'output'
}

interface CnnLayerFunctionGuide {
  chapterId: string
  title: string
  body: string
  route: string
  isCurrentChapter: boolean
}

interface CnnOverviewTraceSummary {
  title: string
  body: string
  inputCount: number
  outputCount: number
  steps: CnnOverviewTraceStep[]
}

interface CnnPipelineStep {
  id: string
  index: number
  name: string
  kind: CnnLayerKindLabel
  shapeText: string
  parameterText: string
  state: 'done' | 'current' | 'pending'
}

interface CnnForwardStoryStep {
  id: string
  index: number
  title: string
  kind: CnnLayerKindLabel
  operator: string
  body: string
  inputText: string
  outputText: string
  valueLabel: string
  value: string
  state: 'done' | 'current' | 'pending'
  stateLabel: string
}

interface CnnKernelPreview {
  channelIndex: number
  kernel: number[][]
}

interface CnnDenseWeightPreview {
  sourceIndex: number
  value: number
}

interface CnnMatrixCell {
  value: number
  row: number
  col: number
  isSelected?: boolean
  isWindow?: boolean
  isMax?: boolean
}

interface CnnInputChannelPreview {
  channelIndex: number
  label: string
  tone: 'red' | 'green' | 'blue'
  grid: CnnMatrixCell[][]
  selectedValue: number
  rawValue: number
}

interface CnnInputPixelPreview {
  row: number
  col: number
  rgb: [number, number, number]
  normalized: [number, number, number]
  color: string
}

interface CnnInputPreprocessStep {
  id: string
  kind: 'source' | 'crop' | 'resize' | 'normalize'
  title: string
  body: string
  valueLabel: string
  value: string
}

interface CnnConvAnimatorDetail {
  channelIndex: number
  inputLabel: string
  outputLabel: string
  inputShape: string
  outputShape: string
  inputWindow: CnnMatrixCell[][]
  outputWindow: CnnMatrixCell[][]
  inputMatrix: number[][]
  outputMatrix: number[][]
  contribution: CnnChannelContribution
}

interface CnnConvIntermediateCard {
  channelIndex: number
  patch: number[][]
  kernel: number[][]
  products: number[][]
  sum: number
  formattedSum: string
  isFocused: boolean
}

interface CnnReluMaskCell extends CnnMatrixCell {
  outputValue: number
  wasClipped: boolean
}

interface CnnReluMaskSummary {
  clippedCount: number
  retainedCount: number
  totalCount: number
  clippedRatio: number
  retainedRatio: number
  selectedWasClipped: boolean
  maskWindow: CnnReluMaskCell[][]
}

interface CnnDetailScanCell {
  id: string
  row: number
  col: number
  stepIndex: number
  value: number
  formattedValue: string
  state: 'done' | 'current' | 'pending'
  label: string
}

interface CnnInspectorMetric {
  label: string
  value: string
}

interface CnnConnectionSummary {
  id: string
  label: string
  detail: string
  layerIndex: number
  nodeIndex: number
}

interface CnnLayerInspector {
  title: string
  role: string
  parameterFormula: string
  metrics: CnnInspectorMetric[]
  incoming: CnnConnectionSummary[]
  outgoing: CnnConnectionSummary[]
  incomingHiddenCount: number
  outgoingHiddenCount: number
}

interface CnnOverviewLens {
  eyebrow: string
  title: string
  role: string
  operator: string
  inputSummary: string
  outputSummary: string
  valueLabel: string
  value: string
  focus: string
  incoming: CnnConnectionSummary[]
  outgoing: CnnConnectionSummary[]
  incomingHiddenCount: number
  outgoingHiddenCount: number
}

interface CnnOverviewLayerStripItem {
  id: string
  label: string
  valueLabel: string
  node: CnnNodeSnapshot
  value: number
  isMatrix: boolean
  isSelected: boolean
  color: string
  cellStyle?: Record<string, string>
}

interface CnnOverviewLayerStrip {
  title: string
  description: string
  layer: CnnLayerSnapshot
  items: CnnOverviewLayerStripItem[]
  startIndex: number
  endIndex: number
  totalCount: number
  hiddenBeforeCount: number
  hiddenAfterCount: number
}

interface CnnConvMathFocus {
  channelIndex: number
  row: number
  col: number
}

interface CnnConvMathTerm {
  channelIndex: number
  row: number
  col: number
  patchValue: number
  kernelValue: number
  productValue: number
  channelSum: number
}

interface CnnConvLedgerItem {
  id: string
  label: string
  value: number
  formattedValue: string
  barWidth: string
  tone: 'positive' | 'negative' | 'neutral'
  kind: 'channel' | 'bias' | 'weighted' | 'relu'
  channelIndex?: number
}

interface CnnPoolFocusedCell {
  row: number
  col: number
}

interface CnnPoolOperatorCell extends CnnMatrixCell {
  relativeRow: number
  relativeCol: number
}

interface CnnPoolRetentionCell extends CnnMatrixCell {
  outputRow: number
  outputCol: number
  outputValue: number
  isWinner: boolean
  isSuppressed: boolean
}

interface CnnPoolRetentionSummary {
  winnerCount: number
  suppressedCount: number
  totalWindowCells: number
  retentionRatio: number
  downsampleRatio: number
  selectedWinner: { row: number; col: number; value: number } | undefined
  maskWindow: CnnPoolRetentionCell[][]
}

interface CnnPoolLedgerItem {
  id: string
  label: string
  row: number
  col: number
  relativeRow: number
  relativeCol: number
  value: number
  formattedValue: string
  isWinner: boolean
  isSelected: boolean
  barWidth: string
  tone: 'candidate' | 'winner'
}

interface CnnFlattenLedgerItem {
  id: string
  label: string
  formula: string
  value: number
  formattedValue: string
  description: string
  kind: 'channel' | 'row' | 'col' | 'index'
}

interface CnnDenseLedgerItem {
  id: string
  label: string
  formula: string
  value: number
  formattedValue: string
  description: string
  barWidth: string
  sourceIndex?: number
  activation?: number
  weight?: number
  kind: 'positive' | 'negative' | 'bias' | 'logit'
}

interface CnnDenseWaterfallStep {
  id: string
  label: string
  formula: string
  delta: number
  formattedDelta: string
  end: number
  formattedEnd: string
  description: string
  kind: 'positive' | 'negative' | 'bias' | 'hidden'
  barStyle: Record<string, string>
  markerStyle: Record<string, string>
  sourceIndex?: number
}

interface CnnDenseWaterfall {
  steps: CnnDenseWaterfallStep[]
  axisPosition: string
  minLabel: string
  maxLabel: string
  formattedFinalLogit: string
}

interface CnnDenseSourceLocator {
  sourceIndex: number
  sourceLabel: string
  vectorLabel: string
  cellLabel: string
  activation: number
  weight: number
  product: number
  formattedActivation: string
  formattedWeight: string
  formattedProduct: string
  sourceWindow: CnnMatrixCell[][]
  sourceMatrix: number[][]
  narration: string
}

interface CnnDenseContributionAtlasCell extends CnnMatrixCell {
  sourceIndex?: number
  activation: number
  weight: number
  contribution: number
  formattedActivation: string
  formattedWeight: string
  formattedContribution: string
  isFocused: boolean
}

interface CnnDenseContributionAtlasMap {
  id: string
  sourceLabel: string
  sourceNodeIndex: number
  totalContribution: number
  absoluteContribution: number
  formattedTotalContribution: string
  formattedAbsoluteContribution: string
  topSourceIndex: number
  topContribution: number
  formattedTopContribution: string
  maxMagnitude: number
  grid: CnnDenseContributionAtlasCell[][]
  isFocused: boolean
  narration: string
}

type CnnReluOperatorTerm = 'zero' | 'input' | 'output'

interface CnnSoftmaxContributionRow extends CnnClassScore {
  classIndex: number
  expScore: number
  probability: number
  expShare: number
  selected: boolean
  highlighted: boolean
}

interface CnnSoftmaxCompetitionRow extends CnnSoftmaxContributionRow {
  rank: number
  isTop: boolean
  isActive: boolean
  logitGapFromTop: number
  probabilityGapFromTop: number
  expWidth: string
  probabilityWidth: string
  narration: string
}

interface CnnHoverReadout {
  eyebrow: string
  title: string
  body: string
  value?: string
  tone?: 'activation' | 'weight' | 'logit' | 'positive' | 'negative' | 'neutral'
}

interface CnnColorLegend {
  title: string
  body: string
  minLabel: string
  midLabel: string
  maxLabel: string
  selectedLabel: string
  selectedValue: string
  gradient: string
  markerPosition: string
  stops: CnnLegendStop[]
}

interface CnnLegendStop {
  offset: string
  color: string
}

interface CnnPropagationChip {
  label: string
  value: string
}

interface CnnPropagationBridge {
  title: string
  inputLabel: string
  outputLabel: string
  inputShape: string
  outputShape: string
  operator: string
  explanation: string
  formulaMarkdown: string
  valueLabel: string
  value: string
  chips: CnnPropagationChip[]
}

type CnnFormulaTraceTarget =
  | 'input-normalize'
  | 'conv-product'
  | 'conv-ledger'
  | 'relu-term'
  | 'pool-window'
  | 'pool-winner'
  | 'flatten-ledger'
  | 'dense-ledger'
  | 'softmax-term'

interface CnnFormulaTraceTerm {
  id: string
  label: string
  formula: string
  value: string
  body: string
  target: CnnFormulaTraceTarget
  tone: CnnHoverReadout['tone']
  ledgerId?: string
  reluTerm?: CnnReluOperatorTerm
  scoreIndex?: number
}

const maxUploadBytes = 5 * 1024 * 1024
const acceptedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])
type CnnLayerKindLabel = CnnLayerSnapshot['kind']
const preloadedSampleDefinitions: CnnSampleDefinition[] = [
  { label: 'lifeboat', path: '/cnn-explainer/samples/lifeboat.png' },
  { label: 'ladybug', path: '/cnn-explainer/samples/ladybug.png' },
  { label: 'pizza', path: '/cnn-explainer/samples/pizza.png' },
  { label: 'bell pepper', path: '/cnn-explainer/samples/bell-pepper.png' },
  { label: 'school bus', path: '/cnn-explainer/samples/school-bus.png' },
  { label: 'koala', path: '/cnn-explainer/samples/koala.png' },
  { label: 'espresso', path: '/cnn-explainer/samples/espresso.png' },
  { label: 'red panda', path: '/cnn-explainer/samples/red-panda.png' },
  { label: 'orange', path: '/cnn-explainer/samples/orange.png' },
  { label: 'sport car', path: '/cnn-explainer/samples/sport-car.png' },
]

const status = ref<CnnLabStatus>('idle')
const statusMessage = ref('')
const layers = ref<CnnLayerSnapshot[]>([])
const scores = ref<CnnClassScore[]>([])
const topPrediction = ref<CnnClassScore | undefined>()
const selectedLayerIndex = ref(0)
const selectedNodeIndex = ref(0)
const selectedRow = ref(0)
const selectedCol = ref(0)
const selectedImageUrl = ref('')
const selectedImageName = ref('')
const userObjectUrl = ref<string | undefined>()
const fileError = ref('')
const isPlaying = ref(false)
const isDetailPlaying = ref(false)
const reducedMotion = ref(false)
const showDetails = ref(true)
const colorMode = ref<CnnColorMode>('activation')
const scaleMode = ref<CnnScaleMode>('local')
const sampleImages = ref<CnnSampleImage[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const bridgePreviewOrigin = ref<CnnBridgePreviewOrigin | undefined>()
const convAnimatorAnchor = ref<CnnConvAnimatorAnchor | undefined>()
const focusedOverviewWindow = ref<CnnOverviewWindowFocus | undefined>()
const focusedOverviewNode = ref<CnnOverviewNodeFocus | undefined>()
const expandedOverviewLayerIndex = ref<number | undefined>()
const convMathFocus = ref<CnnConvMathFocus | undefined>()
const reluFocusedTerm = ref<CnnReluOperatorTerm | undefined>()
const poolFocusedCell = ref<CnnPoolFocusedCell | undefined>()
const highlightedSoftmaxIndex = ref<number | undefined>()
const focusedDenseSourceIndex = ref<number | undefined>()
const hoverReadout = ref<CnnHoverReadout | undefined>()
const hyperInputSize = ref(5)
const hyperPadding = ref(0)
const hyperKernelSize = ref(2)
const hyperStride = ref(1)
const hyperOutputRow = ref(0)
const hyperOutputCol = ref(0)

let playbackTimer: number | undefined
let detailPlaybackTimer: number | undefined
const overviewThumbnailCache = new Map<string, string>()
const overviewCollapsedNodeCount = 10
const overviewExpandedNodeCount = 18
const overviewFlattenCollapsedNodeCount = 12
const overviewFlattenExpandedNodeCount = 24
const overviewLayerStripNodeCount = 48

function loc<T>(zhCN: T, en: T) {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

const copy = computed(() =>
  localized(
    loc(
      {
        title: 'CNN 结构与传播实验台',
        subtitle: 'Tiny VGG 在浏览器中真实前向传播；点击层或节点查看低层计算。',
        upload: '上传图片',
        uploadHint: 'PNG / JPG / WebP，不超过 5MB；图片只在本机浏览器处理。',
        play: '播放传播',
        pause: '暂停',
        step: '单步',
        reset: '重置',
        details: '层详情',
        detailStep: '细节步进',
        previousDetail: '上一个细节位置',
        nextDetail: '下一个细节位置',
        playDetail: '播放本层动画',
        pauseDetail: '暂停本层动画',
        closeDetail: '关闭细节视图',
        detailAutoplayHint: '本层动画会在当前层内逐格扫描；悬停矩阵会暂停在该计算位置。',
        scanMap: '扫描网格',
        scanPathHint: '从左到右、从上到下遍历输出 cell；每个点都会把当前层的窗口、公式和激活读数同步到同一个位置。',
        scanDone: '已计算',
        scanCurrent: '当前',
        scanPending: '待计算',
        scanCell: '扫描 cell',
        color: '颜色',
        scale: '尺度',
        colorLegend: '颜色图例',
        colorLegendActivation: '激活越强，颜色越偏向高值端；接近 0 的 cell 会落在中间区域。',
        colorLegendWeight: '权重图例使用正负发散色：一端代表负权重，另一端代表正权重。',
        colorLegendLogit: 'logit 图例显示当前类别分数范围；颜色越深通常表示 logit 越高。',
        lowValue: '低值',
        zeroValue: '0',
        highValue: '高值',
        currentSample: '当前样本',
        activation: '激活',
        weights: '权重',
        logits: 'logit',
        local: '单层',
        module: '模块',
        global: '全局',
        loading: '加载模型与激活',
        ready: '已就绪',
        error: '无法运行',
        idle: '准备中',
        input: '输入',
        score: '类别分数',
        prediction: '当前预测',
        overview: '网络概览',
        overviewLens: '概览镜头',
        overviewTraceTitle: '主路径追踪',
        overviewTraceHint: '高亮路径不是解释结论，而是按当前焦点选择一条代表性传播链：输入侧追到主要来源，输出侧追到最相关类别。',
        inputTrace: '输入侧',
        outputTrace: '输出侧',
        currentTrace: '当前焦点',
        expandLayer: '展开层节点',
        collapseLayer: '收起层节点',
        hiddenFeatureMaps: '隐藏 feature maps',
        overviewExpandHint: '点击 +N 查看这一层更多 feature maps；再次点击收回总览。',
        intermediateLayerView: '中间层展开视图',
        stripWindow: '可见窗口',
        hiddenBefore: '前方隐藏',
        hiddenAfter: '后方隐藏',
        stripHint: '这条展开带把当前层的 feature maps 横向铺开；点击任一小图会同步选中对应节点、公式和连接。',
        graphFocus: '当前图节点',
        feedsThisNode: '谁输入到这里',
        passesToNext: '再传给哪里',
        focusPosition: '聚焦位置',
        hoverInfo: '悬停读数',
        hoverInfoIdleTitle: '当前选中元素',
        hoverInfoIdleBody: '悬停网络节点、矩阵 cell、权重或 softmax 项，查看它在传播里的具体数值。',
        hoverLayerNode: '层节点',
        hoverMatrixCell: '矩阵 cell',
        hoverKernelWeight: 'kernel 权重',
        hoverDenseWeight: '分类头权重',
        hoverSoftmaxTerm: 'softmax 项',
        hoverOverviewWindow: '局部窗口',
        pipeline: '传播路径',
        currentStage: '当前阶段',
        forwardStoryboard: '传播讲解时间线',
        forwardStoryboardHint: '播放或单步时，沿着这条脚本看每一层用了什么算子、把什么输入变成什么输出。',
        forwardStoryboardCurrent: '正在计算',
        forwardStoryboardDone: '已经过',
        forwardStoryboardNext: '下一步',
        propagationBridge: '传播说明',
        inputSide: '输入侧',
        outputSide: '输出侧',
        operatorLabel: '算子',
        currentValue: '当前值',
        params: '参数',
        noParams: '0 参数',
        inputDataView: '输入数据视图',
        inputPreprocessTitle: '浏览器输入预处理',
        inputPreprocessHint: 'Tiny VGG 读取的不是图片文件本身，而是这条本地预处理流水线输出的 64×64×3 tensor。',
        inputPreprocessSource: '素材图',
        inputPreprocessCrop: '中心裁剪',
        inputPreprocessResize: '缩放成 tensor',
        inputPreprocessNormalize: '像素归一化',
        inputPreprocessCropBody: '先取原图中心的正方形区域；非正方形图片会裁掉较长边的两侧或上下边。',
        inputPreprocessResizeBody: '中心方形会被画到 64×64 canvas，得到模型实际读取的空间网格。',
        inputPreprocessNormalizeBody: '每个 RGB 通道从 0-255 除以 255，变成 [0,1] 浮点数。',
        rgbChannels: 'RGB 三通道',
        channelRed: '红色通道',
        channelGreen: '绿色通道',
        channelBlue: '蓝色通道',
        normalizedValue: '归一化值',
        rawPixelValue: '原始像素',
        compositePixel: '合成像素',
        centerCropResize: '中心裁剪 / 64×64 缩放 / 除以 255',
        inputDataHint: '模型不会直接读取图片文件；浏览器先把图片变成三个 64×64 数值矩阵，每个像素值从 0-255 变成 0-1。',
        receptiveField: '输入感受野',
        receptiveFieldHint: '这个框表示当前选中激活最终能看到的原图区域；越深层，框通常越大。',
        receptiveFieldRegion: '原图区域',
        sourcePixels: '源像素',
        sourceChannels: '源通道',
        sourceMapCell: '来源 cell',
        selected: '选中层',
        layerInspector: '层检查器',
        hyperparameterLab: '超参数形状实验',
        hyperparameterLabTitle: '卷积 / 池化窗口如何落到输出网格',
        hyperparameterLabHint: '这里不重新训练模型；只演示 Conv 或 Pool 层在给定 input、padding、kernel 和 stride 时，窗口怎样从输入网格扫到输出 cell。',
        inputSize: '输入尺寸',
        padding: 'padding',
        stride: 'stride',
        outputSize: '输出尺寸',
        paddedInput: 'padding 后输入',
        kernelFootprint: 'kernel 覆盖区',
        outputGrid: '输出网格',
        shapeFormula: '形状公式',
        selectedWindowStart: '窗口起点',
        hoverOutputCell: '悬停或点击输出 cell 改变 kernel 位置。',
        validStride: '当前 stride 能整齐覆盖最后一个完整窗口。',
        invalidStride: '当前 stride 不能整齐覆盖输入，输出网格只显示可落下的完整窗口。',
        shapeLayerNote: 'Conv/Pool 层先决定窗口从哪里取数，再把每个落点变成一个输出 cell；padding 给边缘补 0，stride 决定每次跳几格。',
        layerRole: '层作用',
        inputShapeLabel: '输入 shape',
        outputShapeLabel: '输出 shape',
        featureMaps: '特征图',
        channels: '通道',
        classes: '类别',
        downsample: '下采样',
        indexRemap: '索引重排',
        pointwise: '逐点',
        selectedNodeLabel: '选中节点',
        parameterFormula: '参数 / 形状公式',
        incomingConnections: '输入连接',
        outgoingConnections: '输出连接',
        noConnections: '没有连接',
        hiddenConnections: '更多连接',
        kernelSize: 'kernel',
        windowStride: 'window / stride',
        shape: 'shape / 参数',
        operation: '公式视图',
        stepExplanation: '这一步在做什么',
        layerFunctionEyebrow: '层功能说明',
        layerFunctionOpenChapter: '打开对应章节',
        layerFunctionCurrent: '正在读这一章',
        formulaTrace: '公式变量映射',
        formulaTraceHint: '悬停或聚焦任一变量，查看它在当前传播步骤里对应的局部窗口、权重或分数。',
        map: '激活图',
        kernelBank: '卷积核权重',
        denseWeightMap: '分类头权重',
        logitMap: 'logits / 概率',
        noWeightView: '这一层没有可视化权重；切回“激活”可继续查看输出值。',
        sourceVector: '来源向量',
        row: '行',
        col: '列',
        channel: 'channel',
        allChannels: '全部输入通道',
        convChannelSummary: '每个通道都取同一空间位置的 patch，与该通道 kernel 相乘求和；所有通道结果再一起加 bias，得到当前输出 cell。',
        convIntermediateStack: '输入通道中间结果',
        convIntermediateHint: '每张卡都是一个输入 channel：左边取 patch，中间乘对应 kernel，右边得到该 channel 的 product sum；这些 sum 再进入下面的总账本。',
        intermediateResult: '中间结果',
        convLedgerTitle: 'channel 累加账本',
        convLedgerHint: '每个输入 channel 先把 3×3 逐格乘积加成一个 sum；所有 channel sum 与 bias 相加得到 ReLU 前的 z，再通过 ReLU 变成输出激活。',
        convLedgerEquation: '跨 channel 求和',
        channelSum: 'channel sum',
        convAnimatorTitle: '卷积局部动画',
        convInputMatrix: '输入 feature map',
        convOutputMatrix: '输出 feature map',
        convAnimatorHint: '悬停输入或输出矩阵会移动 kernel 位置；悬停中央乘法项会锁定 patch × kernel 的一项乘积。',
        kernelMath: '单项乘法',
        inputValue: '输入值',
        weightValue: '权重',
        productValue: '乘积',
        contributesToChannel: '进入 channel 求和',
        inspectMathCell: '检查乘法项',
        patch: 'patch',
        kernel: 'kernel',
        product: '乘积和',
        products: '逐格乘积',
        bias: 'bias',
        sum: '求和',
        weightedSum: '加权和',
        beforeRelu: 'ReLU 前',
        reluValue: 'ReLU 后',
        reluInputMatrix: '输入矩阵',
        reluOutputMatrix: '输出矩阵',
        reluMatrixHint: '悬停或聚焦任一矩阵 cell，同步更新 ReLU 公式里的 z 与 a。',
        reluOperatorTitle: 'ReLU 运算',
        reluOperatorHint: 'ReLU 层没有可训练参数；它逐格比较 0 和输入 z，负值输出 0，正值原样传到右侧输出 cell。',
        reluMaskTitle: 'ReLU 截断 mask',
        reluMaskHint: '红色代表这个位置的 z<0，被 ReLU 写成 0；绿色代表 z>=0，数值继续传到下一层。',
        reluClippedCells: '截断 cell',
        reluRetainedCells: '保留 cell',
        reluClippedRatio: '截断比例',
        reluCandidate: '候选项',
        reluSelectedInput: '选中输入',
        zeroThreshold: '零阈值',
        clipped: '负值截断',
        retained: '正值保留',
        maxValue: '最大值',
        poolInputMatrix: '输入矩阵',
        poolOutputMatrix: '池化输出',
        poolWindow: '2×2 池化窗口',
        poolOperatorTitle: 'MaxPool 运算',
        poolOperatorHint: 'MaxPool 层没有可训练参数；它只在当前 2×2 window 里找最大激活，并把这个值写入右侧输出 cell。',
        poolLedgerTitle: '候选值竞争',
        poolLedgerHint: 'MaxPool 不平均，也不学习权重；它只比较当前 2×2 window 的 4 个候选值，把最大值复制到输出 cell。',
        poolLedgerEquation: 'max 候选账本',
        poolCandidate: '候选值',
        poolWinner: '最大值来源',
        poolRetentionTitle: 'MaxPool 保留 mask',
        poolRetentionHint: '绿色是每个 2×2 window 里被复制到输出的最大激活；灰色候选参与比较，但不会进入下一张特征图。',
        poolKeptCells: '保留最大值',
        poolSuppressedCells: '丢弃候选',
        poolRetentionRatio: '保留比例',
        poolDownsampleRatio: '空间缩小',
        poolKept: '被保留',
        poolSuppressed: '被丢弃',
        poolMatrixHint: '悬停或聚焦输入矩阵会移动 2×2 pooling window；悬停输出矩阵会直接选择对应输出 cell。',
        source: '来源',
        sourceMap: '来源 feature map',
        inputWindow: '输入窗口',
        outputCell: '输出 cell',
        inspectSourceCell: '预览来源位置',
        inspectOutputCell: '预览输出位置',
        vectorIndex: '向量索引',
        flattenLedgerTitle: '展开索引账本',
        flattenLedgerHint: 'Flatten 不改变数值，只改变地址：先算 channel 的整张图偏移，再加 row 偏移和 col 偏移，得到 Dense 层要读取的一维位置。',
        flattenLedgerEquation: '索引分解',
        channelOffset: 'channel 偏移',
        rowOffset: 'row 偏移',
        colOffset: 'col 偏移',
        sourceValue: '来源值',
        denseLedgerTitle: 'Dense 加权账本',
        denseLedgerHint: 'Dense 层读取 Flatten 向量：每个向量值乘上通往当前类别的权重，所有乘积与 bias 相加得到 logit，再交给 Softmax。',
        denseLedgerEquation: 'logit 分解',
        denseWaterfallTitle: '贡献瀑布',
        denseWaterfallHint: '从 0 开始，依次加入贡献最大的 flatten×weight 项、其余项和 bias；条形向右推高 logit，向左压低 logit。',
        denseTopTerms: '贡献最大的向量项',
        denseContribution: '贡献',
        denseRemainingTerms: '其余向量项',
        denseBiasTerm: 'bias 项',
        denseLogitTerm: '当前 logit',
        runningSum: '累计和',
        hiddenTerms: '其余项',
        denseSourceLocatorTitle: 'Flatten 来源定位',
        denseSourceLocatorHint: '选中任一贡献项后，反查它来自上一层哪张 feature map、哪个 cell，以及这个值怎样通过权重连到当前 logit。',
        sourceFeatureCell: '来源 cell',
        selectedContribution: '当前贡献',
        inspectSourceVector: '查看这个向量位置',
        denseContributionAtlasTitle: '分类贡献地图',
        denseContributionAtlasHint: '把 Dense 的 v_i×w_i 按 Flatten 前的 feature map 还原成 2D 小图：绿色 cell 推高当前 logit，红色 cell 压低当前 logit。',
        netContribution: '净贡献',
        absoluteContribution: '绝对贡献',
        topCellContribution: '最强 cell',
        denominator: '分母',
        numerator: '分子',
        denominatorShare: '分母占比',
        softmaxFraction: 'Softmax 分式',
        softmaxExpTerms: '分母逐项贡献',
        stabilizedExp: 'exp(logit - max)',
        normalized: '归一化',
        softmaxCompetition: 'Softmax 竞争',
        softmaxRankingTitle: '类别竞争排名',
        softmaxRankingHint: 'Softmax 不单独看一个类别；所有 exp(logit) 先一起组成分母，再按各自占比分到概率。',
        softmaxRank: '排名',
        softmaxTopGap: '距 top logit',
        probabilityGap: '概率差距',
        probabilityMass: '概率质量',
        hoverLogitTerm: '悬停任一 exp(logit) 项，会同步高亮公式、类别卡和左侧分数条。',
        selectedCell: '当前 cell',
        windowStep: '窗口',
        classTerm: '类别项',
        nodeStep: '节点',
        probability: '概率',
        defaultImage: '合成演示图',
        examples: '样例',
        classGallery: '类别图库',
        expectedClass: '目标类别',
        predictedClass: '预测类别',
        samplePredictionMatch: '当前 top-1 与样例标签一致',
        samplePredictionMiss: '当前 top-1 与样例标签不一致',
        topClass: 'top-1',
        notTopClass: '非 top-1',
        reducedMotion: '系统开启 reduced motion，自动播放已关闭。',
        invalidType: '请上传 PNG、JPG 或 WebP 图片。',
        invalidSize: '图片不能超过 5MB。',
        fallback: '模型或浏览器图像能力不可用时，仍可阅读结构、shape 和公式说明。',
      },
      {
        title: 'CNN structure and propagation lab',
        subtitle: 'Tiny VGG runs a real browser-side forward pass; click a layer or node for low-level math.',
        upload: 'Upload image',
        uploadHint: 'PNG / JPG / WebP, up to 5MB; images stay in your local browser.',
        play: 'Play flow',
        pause: 'Pause',
        step: 'Step',
        reset: 'Reset',
        details: 'Layer details',
        detailStep: 'Detail step',
        previousDetail: 'Previous detail position',
        nextDetail: 'Next detail position',
        playDetail: 'Play layer animation',
        pauseDetail: 'Pause layer animation',
        closeDetail: 'Close detail view',
        detailAutoplayHint: 'The layer animation scans cells inside the current layer; hovering a matrix pauses at that calculation.',
        scanMap: 'Scan grid',
        scanPathHint: 'Cells are visited left-to-right, top-to-bottom; each dot syncs the layer window, formula, and activation readout to the same position.',
        scanDone: 'computed',
        scanCurrent: 'current',
        scanPending: 'pending',
        scanCell: 'scan cell',
        color: 'Color',
        scale: 'Scale',
        colorLegend: 'Color legend',
        colorLegendActivation: 'Stronger activations move toward the high-value end; cells near 0 sit near the middle of the scale.',
        colorLegendWeight: 'The weight legend uses a diverging positive/negative scale: one end is negative and the other is positive.',
        colorLegendLogit: 'The logit legend shows the current class-score range; darker orange usually means a higher logit.',
        lowValue: 'low',
        zeroValue: '0',
        highValue: 'high',
        currentSample: 'current',
        activation: 'Activation',
        weights: 'Weights',
        logits: 'Logit',
        local: 'Local',
        module: 'Module',
        global: 'Global',
        loading: 'Loading model and activations',
        ready: 'Ready',
        error: 'Cannot run',
        idle: 'Preparing',
        input: 'Input',
        score: 'Class scores',
        prediction: 'Current prediction',
        overview: 'Network overview',
        overviewLens: 'Overview lens',
        overviewTraceTitle: 'Main path trace',
        overviewTraceHint: 'The highlighted path is not an explanation claim; it is one representative propagation chain for the current focus: trace back to a main source and forward to the most related class.',
        inputTrace: 'input side',
        outputTrace: 'output side',
        currentTrace: 'current focus',
        expandLayer: 'Expand layer nodes',
        collapseLayer: 'Collapse layer nodes',
        hiddenFeatureMaps: 'hidden feature maps',
        overviewExpandHint: 'Click +N to reveal more feature maps for this layer; click again to collapse the overview.',
        intermediateLayerView: 'Intermediate layer view',
        stripWindow: 'visible window',
        hiddenBefore: 'hidden before',
        hiddenAfter: 'hidden after',
        stripHint: 'This strip lays out feature maps from the current layer; click any tile to sync the selected node, formula, and links.',
        graphFocus: 'Current graph node',
        feedsThisNode: 'What feeds it',
        passesToNext: 'Where it goes next',
        focusPosition: 'Focus position',
        hoverInfo: 'Hover readout',
        hoverInfoIdleTitle: 'Current selected element',
        hoverInfoIdleBody: 'Hover a network node, matrix cell, weight, or softmax term to inspect its exact value in the forward pass.',
        hoverLayerNode: 'Layer node',
        hoverMatrixCell: 'Matrix cell',
        hoverKernelWeight: 'Kernel weight',
        hoverDenseWeight: 'Classifier weight',
        hoverSoftmaxTerm: 'softmax term',
        hoverOverviewWindow: 'Local window',
        pipeline: 'Propagation path',
        currentStage: 'Current stage',
        forwardStoryboard: 'Forward-pass teaching timeline',
        forwardStoryboardHint: 'During play or step, follow this script to see which operator each layer uses and how its input becomes output.',
        forwardStoryboardCurrent: 'computing now',
        forwardStoryboardDone: 'already passed',
        forwardStoryboardNext: 'next up',
        propagationBridge: 'Propagation note',
        inputSide: 'Input side',
        outputSide: 'Output side',
        operatorLabel: 'Operator',
        currentValue: 'Current value',
        params: 'params',
        noParams: '0 params',
        inputDataView: 'Input data view',
        inputPreprocessTitle: 'Browser input preprocessing',
        inputPreprocessHint: 'Tiny VGG does not read the image file itself; it reads the 64x64x3 tensor produced by this local preprocessing pipeline.',
        inputPreprocessSource: 'Source image',
        inputPreprocessCrop: 'Center crop',
        inputPreprocessResize: 'Resize to tensor',
        inputPreprocessNormalize: 'Normalize pixels',
        inputPreprocessCropBody: 'First take the centered square region; non-square images lose the extra width or height around the edges.',
        inputPreprocessResizeBody: 'The centered square is drawn onto a 64x64 canvas, creating the spatial grid the model reads.',
        inputPreprocessNormalizeBody: 'Each RGB channel is divided by 255, changing 0-255 pixels into [0,1] floats.',
        rgbChannels: 'RGB channels',
        channelRed: 'red channel',
        channelGreen: 'green channel',
        channelBlue: 'blue channel',
        normalizedValue: 'normalized value',
        rawPixelValue: 'raw pixel',
        compositePixel: 'composite pixel',
        centerCropResize: 'center crop / 64x64 resize / divide by 255',
        inputDataHint: 'The model does not read the image file directly; the browser turns it into three 64x64 numeric matrices and maps each pixel from 0-255 into 0-1.',
        receptiveField: 'Input receptive field',
        receptiveFieldHint: 'This box shows the image region the selected activation can ultimately see; deeper layers usually cover a larger area.',
        receptiveFieldRegion: 'image region',
        sourcePixels: 'source pixels',
        sourceChannels: 'source channels',
        sourceMapCell: 'source cell',
        selected: 'Selected layer',
        layerInspector: 'Layer inspector',
        hyperparameterLab: 'Hyperparameter shape lab',
        hyperparameterLabTitle: 'How Conv / Pool windows land on the output grid',
        hyperparameterLabHint: 'This does not retrain the model; it shows how a Conv or Pool layer maps input, padding, kernel size, and stride into output cells.',
        inputSize: 'Input size',
        padding: 'padding',
        stride: 'stride',
        outputSize: 'Output size',
        paddedInput: 'Padded input',
        kernelFootprint: 'Kernel footprint',
        outputGrid: 'Output grid',
        shapeFormula: 'Shape formula',
        selectedWindowStart: 'Window start',
        hoverOutputCell: 'Hover or click an output cell to move the kernel position.',
        validStride: 'The current stride reaches the last full window exactly.',
        invalidStride: 'The current stride does not reach the end evenly, so the output grid shows only full valid windows.',
        shapeLayerNote: 'A Conv/Pool layer first chooses where each window reads from, then turns every landing spot into one output cell; padding adds border zeros and stride controls the jump size.',
        layerRole: 'Layer role',
        inputShapeLabel: 'Input shape',
        outputShapeLabel: 'Output shape',
        featureMaps: 'feature maps',
        channels: 'channels',
        classes: 'classes',
        downsample: 'downsample',
        indexRemap: 'index remap',
        pointwise: 'pointwise',
        selectedNodeLabel: 'Selected node',
        parameterFormula: 'Parameters / shape formula',
        incomingConnections: 'Incoming links',
        outgoingConnections: 'Outgoing links',
        noConnections: 'No links',
        hiddenConnections: 'more links',
        kernelSize: 'kernel',
        windowStride: 'window / stride',
        shape: 'shape / parameters',
        operation: 'Formula view',
        stepExplanation: 'What this step does',
        layerFunctionEyebrow: 'Layer function',
        layerFunctionOpenChapter: 'Open chapter',
        layerFunctionCurrent: 'Current chapter',
        formulaTrace: 'Formula variable map',
        formulaTraceHint: 'Hover or focus a variable to connect it with the current local window, weight, or score.',
        map: 'Activation map',
        kernelBank: 'Kernel weights',
        denseWeightMap: 'Classifier weights',
        logitMap: 'logits / probabilities',
        noWeightView: 'This layer has no visualized weights; switch back to Activation to inspect outputs.',
        sourceVector: 'source vector',
        row: 'row',
        col: 'col',
        channel: 'channel',
        allChannels: 'All input channels',
        convChannelSummary: 'Each channel takes the patch at the same spatial position, multiplies it by that channel kernel, then all channel sums are added with bias for the current output cell.',
        convIntermediateStack: 'Input-channel intermediate results',
        convIntermediateHint: 'Each card is one input channel: read the patch, multiply by the matching kernel, and produce that channel product sum; those sums feed the ledger below.',
        intermediateResult: 'intermediate result',
        convLedgerTitle: 'Channel accumulation ledger',
        convLedgerHint: 'Each input channel first sums its 3x3 cell products; all channel sums plus bias produce pre-ReLU z, then ReLU turns it into the output activation.',
        convLedgerEquation: 'cross-channel sum',
        channelSum: 'channel sum',
        convAnimatorTitle: 'Convolution local animation',
        convInputMatrix: 'Input feature map',
        convOutputMatrix: 'Output feature map',
        convAnimatorHint: 'Hover the input or output matrix to move the kernel; hover the center multiplication terms to lock one patch x kernel product.',
        kernelMath: 'Single multiplication',
        inputValue: 'input value',
        weightValue: 'weight',
        productValue: 'product',
        contributesToChannel: 'contributes to channel sum',
        inspectMathCell: 'Inspect multiplication term',
        patch: 'patch',
        kernel: 'kernel',
        product: 'product sum',
        products: 'cell products',
        bias: 'bias',
        sum: 'sum',
        weightedSum: 'weighted sum',
        beforeRelu: 'before ReLU',
        reluValue: 'after ReLU',
        reluInputMatrix: 'Input matrix',
        reluOutputMatrix: 'Output matrix',
        reluMatrixHint: 'Hover or focus any matrix cell to update z and a in the ReLU formula.',
        reluOperatorTitle: 'ReLU operation',
        reluOperatorHint: 'A ReLU layer has no trainable parameters; each cell compares 0 with input z, outputs 0 for negatives, and passes positives through to the output cell.',
        reluMaskTitle: 'ReLU clipping mask',
        reluMaskHint: 'Red cells have z<0 and are written as 0 by ReLU; green cells have z>=0 and keep flowing to the next layer.',
        reluClippedCells: 'clipped cells',
        reluRetainedCells: 'retained cells',
        reluClippedRatio: 'clipped ratio',
        reluCandidate: 'candidate',
        reluSelectedInput: 'selected input',
        zeroThreshold: 'zero threshold',
        clipped: 'clipped at zero',
        retained: 'kept positive',
        maxValue: 'max value',
        poolInputMatrix: 'Input matrix',
        poolOutputMatrix: 'Pooled output',
        poolWindow: '2x2 pooling window',
        poolOperatorTitle: 'MaxPool operation',
        poolOperatorHint: 'A MaxPool layer has no trainable parameters; it finds the largest activation inside the current 2x2 window and writes that value into the output cell.',
        poolLedgerTitle: 'Candidate competition',
        poolLedgerHint: 'MaxPool does not average or learn weights; it compares the four candidates in the current 2x2 window and copies the largest one to the output cell.',
        poolLedgerEquation: 'max candidate ledger',
        poolCandidate: 'candidate',
        poolWinner: 'max source',
        poolRetentionTitle: 'MaxPool retention mask',
        poolRetentionHint: 'Green cells are the largest activations copied from each 2x2 window; muted candidates take part in the comparison but do not enter the next feature map.',
        poolKeptCells: 'kept maxima',
        poolSuppressedCells: 'suppressed candidates',
        poolRetentionRatio: 'retention ratio',
        poolDownsampleRatio: 'spatial shrink',
        poolKept: 'kept',
        poolSuppressed: 'suppressed',
        poolMatrixHint: 'Hover or focus the input matrix to move the 2x2 pooling window; hover the output matrix to select the output cell directly.',
        source: 'source',
        sourceMap: 'source feature map',
        inputWindow: 'input window',
        outputCell: 'output cell',
        inspectSourceCell: 'Inspect source position',
        inspectOutputCell: 'Inspect output position',
        vectorIndex: 'vector index',
        flattenLedgerTitle: 'Flatten index ledger',
        flattenLedgerHint: 'Flatten keeps the value and changes only the address: add the channel-map offset, row offset, and column offset to get the one-dimensional position read by Dense.',
        flattenLedgerEquation: 'index breakdown',
        channelOffset: 'channel offset',
        rowOffset: 'row offset',
        colOffset: 'col offset',
        sourceValue: 'source value',
        denseLedgerTitle: 'Dense weighted ledger',
        denseLedgerHint: 'The Dense layer reads the Flatten vector: each vector value is multiplied by the weight into the current class, then all products plus bias form the logit before Softmax.',
        denseLedgerEquation: 'logit breakdown',
        denseWaterfallTitle: 'Contribution waterfall',
        denseWaterfallHint: 'Start at 0, add the largest flatten×weight terms, the remaining terms, and bias; bars pushing right raise the logit and bars pushing left lower it.',
        denseTopTerms: 'largest vector terms',
        denseContribution: 'contribution',
        denseRemainingTerms: 'remaining vector terms',
        denseBiasTerm: 'bias term',
        denseLogitTerm: 'current logit',
        runningSum: 'running sum',
        hiddenTerms: 'remaining terms',
        denseSourceLocatorTitle: 'Flatten source locator',
        denseSourceLocatorHint: 'Pick any contribution term to trace which previous feature map and cell produced it, then see how that value connects through the weight into the current logit.',
        sourceFeatureCell: 'source cell',
        selectedContribution: 'selected contribution',
        inspectSourceVector: 'Inspect this vector position',
        denseContributionAtlasTitle: 'Classifier contribution atlas',
        denseContributionAtlasHint: 'Restore Dense v_i×w_i terms back onto their pre-Flatten feature maps: green cells raise the current logit, red cells lower it.',
        netContribution: 'net contribution',
        absoluteContribution: 'absolute contribution',
        topCellContribution: 'strongest cell',
        denominator: 'denominator',
        numerator: 'numerator',
        denominatorShare: 'denominator share',
        softmaxFraction: 'Softmax fraction',
        softmaxExpTerms: 'denominator contributions',
        stabilizedExp: 'exp(logit - max)',
        normalized: 'normalized',
        softmaxCompetition: 'Softmax competition',
        softmaxRankingTitle: 'Class competition ranking',
        softmaxRankingHint: 'Softmax never scores a class alone; every exp(logit) first joins the denominator, then each class receives probability by its share.',
        softmaxRank: 'rank',
        softmaxTopGap: 'gap to top logit',
        probabilityGap: 'probability gap',
        probabilityMass: 'probability mass',
        hoverLogitTerm: 'Hover any exp(logit) term to link the formula, class card, and score bar.',
        selectedCell: 'current cell',
        windowStep: 'window',
        classTerm: 'class term',
        nodeStep: 'node',
        probability: 'probability',
        defaultImage: 'Synthetic demo image',
        examples: 'Examples',
        classGallery: 'Class gallery',
        expectedClass: 'Expected class',
        predictedClass: 'Predicted class',
        samplePredictionMatch: 'The current top-1 matches this demo label',
        samplePredictionMiss: 'The current top-1 differs from this demo label',
        topClass: 'top-1',
        notTopClass: 'not top-1',
        reducedMotion: 'Reduced motion is enabled, so autoplay is disabled.',
        invalidType: 'Upload a PNG, JPG, or WebP image.',
        invalidSize: 'Images must be 5MB or smaller.',
        fallback: 'If the model or browser image APIs are unavailable, the structure, shape, and formula explanations remain readable.',
      },
    ),
  ),
)

const sectionHint = computed(() => {
  const hints: Record<string, string> = localized(
    loc(
      {
        'image-volume': '先看 input 的 64×64×3，再观察每个 channel 如何流向第一层卷积。',
        'kernel-convolution': '点击第一个 Conv 层，移动 row/col，手算 patch 与 kernel 的点乘。',
        'padding-stride-shape': '沿着层序前进，比较 valid conv 和 max pool 怎样改变空间尺寸。',
        'channels-feature-maps': '切换不同 filter，观察每个输出 channel 都有自己的 kernel 与 bias。',
        'pooling-classifier-head': '从 MaxPool 到 Flatten 再到 Softmax，看空间图如何变成类别概率。',
        'transfer-learning-review': '上传一张自己的图片，复盘预训练 backbone 和新任务分类头之间的关系。',
      },
      {
        'image-volume': 'Start with the 64x64x3 input and watch each channel feed the first convolution.',
        'kernel-convolution': 'Click the first Conv layer, move row/col, and calculate the patch-kernel dot product.',
        'padding-stride-shape': 'Step through layers and compare how valid convolution and max pooling change spatial size.',
        'channels-feature-maps': 'Switch filters and see that each output channel has its own kernels and bias.',
        'pooling-classifier-head': 'Move from MaxPool to Flatten to Softmax to see spatial maps become probabilities.',
        'transfer-learning-review': 'Upload your own image and review the bridge between a pretrained backbone and a task head.',
      },
    ),
  )

  return hints[props.section.id] ?? copy.value.subtitle
})

const statusLabel = computed(() => {
  if (status.value === 'loading') return copy.value.loading
  if (status.value === 'ready') return copy.value.ready
  if (status.value === 'error') return copy.value.error
  return copy.value.idle
})

const selectedLayer = computed(() => layers.value[selectedLayerIndex.value])
const selectedNode = computed(() => selectedLayer.value?.nodes[selectedNodeIndex.value])
const layerSummary = computed(() => (selectedLayer.value ? summarizeLayerShape(selectedLayer.value) : copy.value.fallback))
const defaultHoverReadout = computed<CnnHoverReadout>(() => {
  const layer = selectedLayer.value
  const node = selectedNode.value
  if (!layer || !node) {
    return {
      eyebrow: copy.value.hoverInfo,
      title: copy.value.hoverInfoIdleTitle,
      body: copy.value.hoverInfoIdleBody,
      tone: 'neutral',
    }
  }

  return {
    eyebrow: copy.value.hoverInfo,
    title: `${layer.name}[${node.index}] · ${layer.kind}`,
    body: layerSummary.value,
    value: `${copy.value.outputShapeLabel}: ${formatShape(layer.outputShape)}`,
    tone: layer.kind === 'dense' ? 'logit' : layer.parameterCount > 0 ? 'weight' : 'activation',
  }
})
const activeHoverReadout = computed(() => hoverReadout.value ?? defaultHoverReadout.value)
const selectedDetail = computed(() =>
  buildCnnOperationDetail(layers.value, selectedLayerIndex.value, selectedNodeIndex.value, selectedRow.value, selectedCol.value),
)
const selectedMatrix = computed(() => (isMatrix(selectedNode.value?.output) ? selectedNode.value.output : undefined))
const sampledActivationGrid = computed(() => sampleMatrix(selectedMatrix.value, 14, 14))
const inputChannelPreviews = computed<CnnInputChannelPreview[]>(() => {
  const layer = selectedLayer.value
  if (layer?.kind !== 'input') return []

  return layer.nodes
    .filter((node) => isMatrix(node.output))
    .slice(0, 3)
    .map((node) => {
      const matrix = node.output as number[][]
      const row = Math.min(Math.max(0, selectedRow.value), Math.max(0, matrix.length - 1))
      const col = Math.min(Math.max(0, selectedCol.value), Math.max(0, (matrix[0]?.length ?? 1) - 1))
      const selectedValue = matrix[row]?.[col] ?? 0
      return {
        channelIndex: node.index,
        label: inputChannelLabel(node.index),
        tone: inputChannelTone(node.index),
        grid: sampleMatrixWithSelected(matrix, 10, 10, row, col),
        selectedValue,
        rawValue: normalizedToRawPixel(selectedValue),
      }
    })
})
const selectedInputPixel = computed<CnnInputPixelPreview | undefined>(() => {
  if (selectedLayer.value?.kind !== 'input' || !inputChannelPreviews.value.length) return undefined
  const normalized = [0, 1, 2].map((index) => inputChannelPreviews.value[index]?.selectedValue ?? 0) as [number, number, number]
  const rgbValues = normalized.map(normalizedToRawPixel) as [number, number, number]
  return {
    row: selectedRow.value,
    col: selectedCol.value,
    rgb: rgbValues,
    normalized,
    color: `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`,
  }
})
const inputPreprocessSteps = computed<CnnInputPreprocessStep[]>(() => {
  const pixel = selectedInputPixel.value
  const imageName = selectedImageName.value || copy.value.defaultImage
  const pixelPosition = pixel ? `(${pixel.row}, ${pixel.col})` : '(0, 0)'
  const rgbValue = pixel ? `rgb(${pixel.rgb[0]}, ${pixel.rgb[1]}, ${pixel.rgb[2]})` : 'rgb(0, 0, 0)'
  const normalizedValue = pixel
    ? `R ${formatNumber(pixel.normalized[0])} · G ${formatNumber(pixel.normalized[1])} · B ${formatNumber(pixel.normalized[2])}`
    : copy.value.fallback

  return [
    {
      id: 'input-preprocess-source',
      kind: 'source',
      title: copy.value.inputPreprocessSource,
      body: localized(
        loc(
          `当前素材是 ${imageName}；图片只在浏览器本地解码，不会上传到服务器。`,
          `The current source is ${imageName}; it is decoded locally in the browser and is not uploaded to a server.`,
        ),
      ),
      valueLabel: copy.value.input,
      value: imageName,
    },
    {
      id: 'input-preprocess-crop',
      kind: 'crop',
      title: copy.value.inputPreprocessCrop,
      body: copy.value.inputPreprocessCropBody,
      valueLabel: copy.value.receptiveFieldRegion,
      value: 'center square',
    },
    {
      id: 'input-preprocess-resize',
      kind: 'resize',
      title: copy.value.inputPreprocessResize,
      body: copy.value.inputPreprocessResizeBody,
      valueLabel: copy.value.outputShapeLabel,
      value: '64×64×3',
    },
    {
      id: 'input-preprocess-normalize',
      kind: 'normalize',
      title: copy.value.inputPreprocessNormalize,
      body: copy.value.inputPreprocessNormalizeBody,
      valueLabel: `${copy.value.selectedCell} ${pixelPosition}`,
      value: `${rgbValue} → ${normalizedValue}`,
    },
  ]
})
const selectedLayerRange = computed(() => layerRange(selectedLayer.value))
const mapPanelTitle = computed(() => {
  if (colorMode.value === 'weights' && selectedLayer.value?.kind === 'conv') return copy.value.kernelBank
  if (colorMode.value === 'weights' && selectedLayer.value?.kind === 'dense') return copy.value.denseWeightMap
  if (colorMode.value === 'logits') return copy.value.logitMap
  return copy.value.map
})
const rowMax = computed(() => Math.max(0, (selectedLayer.value?.outputShape[0] ?? 1) - 1))
const colMax = computed(() => Math.max(0, (selectedLayer.value?.outputShape[1] ?? 1) - 1))
const hasSpatialSelection = computed(() => Boolean(selectedMatrix.value && selectedLayer.value?.outputShape.length === 3))
const sortedScores = computed(() => [...scores.value].sort((left, right) => right.probability - left.probability))
const selectedSample = computed(() => sampleImages.value.find((sample) => sample.label === selectedImageName.value))
const selectedSampleScore = computed(() => scores.value.find((score) => score.label === selectedSample.value?.label))
const selectedSamplePredictionMatches = computed(() =>
  Boolean(selectedSample.value && topPrediction.value && selectedSample.value.label === topPrediction.value.label),
)
const sampleClassCards = computed<CnnSampleClassCard[]>(() =>
  sampleImages.value.map((sample) => {
    const score = scores.value.find((item) => item.label === sample.label)
    const probability = score?.probability ?? 0
    return {
      ...sample,
      probability,
      probabilityLabel: formatPercent(probability),
      isSelected: sample.label === selectedImageName.value,
      isTopPrediction: sample.label === topPrediction.value?.label,
      isExpectedPrediction: sample.label === selectedSample.value?.label,
    }
  }),
)
const layerColorRanges = computed(() => buildScaleRanges(layers.value))
const spatialBridge = computed(() => {
  const detail = selectedDetail.value
  const node = selectedNode.value
  const outputMatrix = selectedMatrix.value
  if (!detail || !node || !outputMatrix || !['conv', 'relu', 'pool'].includes(detail.kind)) return undefined

  const sourceLink = node.inputLinks[0]
  const sourceNode = sourceLink ? layers.value[sourceLink.sourceLayerIndex]?.nodes[sourceLink.sourceNodeIndex] : undefined
  const sourceMatrix = isMatrix(sourceNode?.output) ? sourceNode.output : undefined
  if (!sourceMatrix) return undefined

  const windowSize = detail.kind === 'conv' ? (detail.channelContributions?.[0]?.patch.length ?? 3) : detail.kind === 'pool' ? (detail.poolWindow?.length ?? 2) : 1
  const sourceRow = detail.kind === 'pool' ? selectedRow.value * 2 : selectedRow.value
  const sourceCol = detail.kind === 'pool' ? selectedCol.value * 2 : selectedCol.value

  return {
    kind: detail.kind,
    sourceLabel: `${sourceNode?.layerName ?? copy.value.sourceMap}[${sourceNode?.index ?? 0}]`,
    outputLabel: `${node.layerName}[${node.index}]`,
    sourceMatrix,
    outputMatrix,
    sourceSample: sampleMatrix(sourceMatrix, 18, 18),
    outputSample: sampleMatrix(outputMatrix, 18, 18),
    sourceWindow: {
      row: Math.min(Math.max(0, sourceRow), Math.max(0, sourceMatrix.length - 1)),
      col: Math.min(Math.max(0, sourceCol), Math.max(0, (sourceMatrix[0]?.length ?? 1) - 1)),
      size: Math.max(1, windowSize),
    },
    outputCell: {
      row: selectedRow.value,
      col: selectedCol.value,
    },
  }
})
const reluMatrixPair = computed(() => {
  if (selectedDetail.value?.kind !== 'relu') return undefined
  const link = selectedNode.value?.inputLinks[0]
  const sourceNode = link ? layers.value[link.sourceLayerIndex]?.nodes[link.sourceNodeIndex] : undefined
  const sourceMatrix = isMatrix(sourceNode?.output) ? sourceNode.output : undefined
  const outputMatrix = selectedMatrix.value
  if (!sourceMatrix || !outputMatrix) return undefined

  return {
    inputLabel: `${sourceNode?.layerName ?? copy.value.sourceMap}[${sourceNode?.index ?? 0}]`,
    outputLabel: `${selectedNode.value?.layerName ?? selectedLayer.value?.name ?? copy.value.reluValue}[${selectedNode.value?.index ?? 0}]`,
    inputShape: `${sourceMatrix.length}×${sourceMatrix[0]?.length ?? 0}`,
    outputShape: `${outputMatrix.length}×${outputMatrix[0]?.length ?? 0}`,
    inputWindow: matrixWindowAround(sourceMatrix, selectedRow.value, selectedCol.value, 2),
    outputWindow: matrixWindowAround(outputMatrix, selectedRow.value, selectedCol.value, 2),
    inputMatrix: sourceMatrix,
    outputMatrix,
  }
})
const reluMaskSummary = computed<CnnReluMaskSummary | undefined>(() => {
  const pair = reluMatrixPair.value
  if (!pair) return undefined

  let clippedCount = 0
  let retainedCount = 0
  pair.inputMatrix.forEach((row) => {
    row.forEach((value) => {
      if (!Number.isFinite(value)) return
      if (value < 0) clippedCount += 1
      else retainedCount += 1
    })
  })

  const totalCount = Math.max(1, clippedCount + retainedCount)
  const inputWindow = matrixWindowAround(pair.inputMatrix, selectedRow.value, selectedCol.value, 2)
  const maskWindow = inputWindow.map((row) =>
    row.map((cell) => ({
      ...cell,
      outputValue: pair.outputMatrix[cell.row]?.[cell.col] ?? Math.max(0, cell.value),
      wasClipped: cell.value < 0,
    })),
  )
  const selectedInputValue = pair.inputMatrix[selectedRow.value]?.[selectedCol.value] ?? 0

  return {
    clippedCount,
    retainedCount,
    totalCount,
    clippedRatio: clippedCount / totalCount,
    retainedRatio: retainedCount / totalCount,
    selectedWasClipped: selectedInputValue < 0,
    maskWindow,
  }
})
const activeReluOperatorTerm = computed<CnnReluOperatorTerm>(() => {
  if (reluFocusedTerm.value) return reluFocusedTerm.value
  return (selectedDetail.value?.weightedSum ?? 0) < 0 ? 'zero' : 'input'
})
const reluOperatorNarration = computed(() => {
  const detail = selectedDetail.value
  if (detail?.kind !== 'relu') return ''
  const inputValue = detail.weightedSum ?? 0
  const outputValue = detail.reluValue ?? Math.max(0, inputValue)
  const activeTerm = activeReluOperatorTerm.value

  if (activeTerm === 'zero') {
    return localized(
      loc(
        `零阈值参与比较：max(0, ${formatNumber(inputValue)}) 会在输入为负时选择 0。`,
        `The zero threshold is part of the comparison: max(0, ${formatNumber(inputValue)}) selects 0 when the input is negative.`,
      ),
    )
  }

  if (activeTerm === 'input') {
    return localized(
      loc(
        `当前输入 z=${formatNumber(inputValue)}；如果它大于 0，就会原样成为输出 a=${formatNumber(outputValue)}。`,
        `The current input is z=${formatNumber(inputValue)}; if it is above 0, it passes through as output a=${formatNumber(outputValue)}.`,
      ),
    )
  }

  return localized(
    loc(
      `右侧输出 cell 是 ReLU 的结果 a=${formatNumber(outputValue)}，等于 0 和输入 z 中较大的那个。`,
      `The output cell is the ReLU result a=${formatNumber(outputValue)}, the larger value between 0 and input z.`,
    ),
  )
})
const poolMatrixPair = computed(() => {
  const detail = selectedDetail.value
  if (detail?.kind !== 'pool') return undefined
  const link = selectedNode.value?.inputLinks[0]
  const sourceNode = link ? layers.value[link.sourceLayerIndex]?.nodes[link.sourceNodeIndex] : undefined
  const sourceMatrix = isMatrix(sourceNode?.output) ? sourceNode.output : undefined
  const outputMatrix = selectedMatrix.value
  if (!sourceMatrix || !outputMatrix) return undefined

  const sourceRow = selectedRow.value * 2
  const sourceCol = selectedCol.value * 2

  return {
    inputLabel: `${sourceNode?.layerName ?? copy.value.sourceMap}[${sourceNode?.index ?? 0}]`,
    outputLabel: `${selectedNode.value?.layerName ?? selectedLayer.value?.name ?? copy.value.poolOutputMatrix}[${selectedNode.value?.index ?? 0}]`,
    inputShape: `${sourceMatrix.length}×${sourceMatrix[0]?.length ?? 0}`,
    outputShape: `${outputMatrix.length}×${outputMatrix[0]?.length ?? 0}`,
    inputWindow: poolInputWindowAround(sourceMatrix, sourceRow, sourceCol, detail.poolMaxPosition, 2, 2),
    outputWindow: matrixWindowAround(outputMatrix, selectedRow.value, selectedCol.value, 2),
    inputMatrix: sourceMatrix,
    outputMatrix,
  }
})
const poolOperatorCells = computed<CnnPoolOperatorCell[][]>(() => {
  const detail = selectedDetail.value
  if (detail?.kind !== 'pool') return []
  const sourceRow = selectedRow.value * 2
  const sourceCol = selectedCol.value * 2
  const focused = poolFocusedCell.value

  return (detail.poolWindow ?? []).map((row, rowIndex) =>
    row.map((value, colIndex) => {
      const absoluteRow = sourceRow + rowIndex
      const absoluteCol = sourceCol + colIndex
      return {
        value,
        row: absoluteRow,
        col: absoluteCol,
        relativeRow: rowIndex,
        relativeCol: colIndex,
        isMax: isPoolMaxCell(rowIndex, colIndex),
        isSelected: focused ? focused.row === absoluteRow && focused.col === absoluteCol : detail.poolMaxPosition?.row === absoluteRow && detail.poolMaxPosition.col === absoluteCol,
      }
    }),
  )
})
const activePoolOperatorCell = computed(() => {
  const cells = poolOperatorCells.value.flat()
  if (!cells.length) return undefined
  const focused = poolFocusedCell.value
  return cells.find((cell) => focused && cell.row === focused.row && cell.col === focused.col) ?? cells.find((cell) => cell.isMax) ?? cells[0]
})
const poolLedgerItems = computed<CnnPoolLedgerItem[]>(() => {
  const cells = poolOperatorCells.value.flat()
  if (!cells.length) return []
  const finiteValues = cells.map((cell) => cell.value).filter(Number.isFinite)
  const [min, max] = rangeFromValues(finiteValues)
  return cells.map((cell) => ({
    id: `pool-${cell.row}-${cell.col}`,
    label: `${copy.value.row} ${cell.row} · ${copy.value.col} ${cell.col}`,
    row: cell.row,
    col: cell.col,
    relativeRow: cell.relativeRow,
    relativeCol: cell.relativeCol,
    value: cell.value,
    formattedValue: formatNumber(cell.value),
    isWinner: Boolean(cell.isMax),
    isSelected: Boolean(cell.isSelected),
    barWidth: `${Math.round(normalize(cell.value, min, max) * 100)}%`,
    tone: cell.isMax ? 'winner' : 'candidate',
  }))
})
const poolLedgerEquation = computed(() => {
  const items = poolLedgerItems.value
  if (!items.length) return ''
  const values = items.map((item) => item.formattedValue).join(', ')
  const winner = items.find((item) => item.isWinner)
  return `max(${values}) = ${winner?.formattedValue ?? formatNumber(selectedDetail.value?.poolMax)}`
})
const poolRetentionSummary = computed<CnnPoolRetentionSummary | undefined>(() => {
  const pair = poolMatrixPair.value
  if (!pair) return undefined

  const inputRows = pair.inputMatrix.length
  const inputCols = pair.inputMatrix[0]?.length ?? 0
  const outputRows = pair.outputMatrix.length
  const outputCols = pair.outputMatrix[0]?.length ?? 0
  if (!inputRows || !inputCols || !outputRows || !outputCols) return undefined

  let winnerCount = 0
  let totalWindowCells = 0
  for (let outputRow = 0; outputRow < outputRows; outputRow += 1) {
    for (let outputCol = 0; outputCol < outputCols; outputCol += 1) {
      const winner = poolWindowWinner(pair.inputMatrix, outputRow, outputCol)
      if (!winner) continue
      winnerCount += 1
      totalWindowCells += poolWindowCellCount(pair.inputMatrix, outputRow, outputCol)
    }
  }

  const sourceRow = selectedRow.value * 2
  const sourceCol = selectedCol.value * 2
  const selectedWinner = poolWindowWinner(pair.inputMatrix, selectedRow.value, selectedCol.value)
  const maskWindow = matrixWindowAround(pair.inputMatrix, sourceRow, sourceCol, 3, sourceRow, sourceCol).map((row) =>
    row.map((cell) => {
      const outputRow = Math.min(outputRows - 1, Math.max(0, Math.floor(cell.row / 2)))
      const outputCol = Math.min(outputCols - 1, Math.max(0, Math.floor(cell.col / 2)))
      const winner = poolWindowWinner(pair.inputMatrix, outputRow, outputCol)
      const isWinner = winner?.row === cell.row && winner.col === cell.col
      return {
        ...cell,
        outputRow,
        outputCol,
        outputValue: pair.outputMatrix[outputRow]?.[outputCol] ?? winner?.value ?? cell.value,
        isWinner,
        isSuppressed: !isWinner,
        isSelected: cell.row >= sourceRow && cell.row < sourceRow + 2 && cell.col >= sourceCol && cell.col < sourceCol + 2,
      }
    }),
  )

  const totalCells = Math.max(1, totalWindowCells)
  const inputCellCount = Math.max(1, inputRows * inputCols)

  return {
    winnerCount,
    suppressedCount: Math.max(0, totalWindowCells - winnerCount),
    totalWindowCells: totalCells,
    retentionRatio: winnerCount / totalCells,
    downsampleRatio: (outputRows * outputCols) / inputCellCount,
    selectedWinner,
    maskWindow,
  }
})
const flattenSourceMatrix = computed(() => {
  if (selectedDetail.value?.kind !== 'flatten') return undefined
  const link = selectedNode.value?.inputLinks[0]
  const sourceNode = link ? layers.value[link.sourceLayerIndex]?.nodes[link.sourceNodeIndex] : undefined
  return isMatrix(sourceNode?.output) ? sourceNode.output : undefined
})
const flattenVectorWindow = computed(() => {
  if (selectedLayer.value?.kind !== 'flatten') return []
  const center = selectedNodeIndex.value
  const start = Math.max(0, Math.min(center - 4, selectedLayer.value.nodes.length - 9))
  return selectedLayer.value.nodes.slice(start, start + 9).map((node) => ({
    index: node.realIndex ?? node.index,
    displayIndex: node.index,
    value: numberFromOutput(node.output),
    selected: node.index === center,
  }))
})
const flattenLedgerItems = computed<CnnFlattenLedgerItem[]>(() => {
  const detail = selectedDetail.value
  const layer = selectedLayer.value
  const node = selectedNode.value
  if (detail?.kind !== 'flatten' || !layer || !node) return []

  const source = detail.flattenSource
  const inputHeight = layer.inputShape[0] ?? flattenSourceMatrix.value?.length ?? 0
  const inputWidth = layer.inputShape[1] ?? flattenSourceMatrix.value?.[0]?.length ?? 0
  if (!source || inputHeight <= 0 || inputWidth <= 0) return []

  const channelStride = inputHeight * inputWidth
  const channelOffset = source.channelIndex * channelStride
  const rowOffset = source.row * inputWidth
  const colOffset = source.col
  const flattenedIndex = channelOffset + rowOffset + colOffset
  const sourceValue = numberFromOutput(node.output)

  return [
    {
      id: 'flatten-channel-offset',
      label: copy.value.channelOffset,
      formula: `${source.channelIndex} × (${inputHeight} × ${inputWidth})`,
      value: channelOffset,
      formattedValue: `${channelOffset}`,
      description: localized(
        loc(
          `先跳过前面 ${source.channelIndex} 个完整 feature map，每张图有 ${inputHeight}×${inputWidth} 个位置。`,
          `First skip ${source.channelIndex} full feature map(s), each with ${inputHeight}x${inputWidth} positions.`,
        ),
      ),
      kind: 'channel',
    },
    {
      id: 'flatten-row-offset',
      label: copy.value.rowOffset,
      formula: `${source.row} × ${inputWidth}`,
      value: rowOffset,
      formattedValue: `${rowOffset}`,
      description: localized(
        loc(
          `在当前 feature map 内跳过前面 ${source.row} 行，每行有 ${inputWidth} 个 cell。`,
          `Inside the current feature map, skip ${source.row} row(s), each with ${inputWidth} cells.`,
        ),
      ),
      kind: 'row',
    },
    {
      id: 'flatten-col-offset',
      label: copy.value.colOffset,
      formula: `${source.col}`,
      value: colOffset,
      formattedValue: `${colOffset}`,
      description: localized(
        loc(
          `最后加上当前列号 ${source.col}，定位到这一行里的具体 cell。`,
          `Finally add column ${source.col} to land on the exact cell within that row.`,
        ),
      ),
      kind: 'col',
    },
    {
      id: 'flatten-final-index',
      label: copy.value.vectorIndex,
      formula: `${channelOffset} + ${rowOffset} + ${colOffset}`,
      value: flattenedIndex,
      formattedValue: `${detail.flattenIndex ?? flattenedIndex}`,
      description: localized(
        loc(
          `该位置的数值 ${formatNumber(sourceValue)} 会原样写到向量 v${detail.flattenIndex ?? flattenedIndex}，供 Dense 层读取。`,
          `The value ${formatNumber(sourceValue)} is copied unchanged into vector entry v${detail.flattenIndex ?? flattenedIndex} for the Dense layer.`,
        ),
      ),
      kind: 'index',
    },
  ]
})
const flattenLedgerEquation = computed(() => {
  const detail = selectedDetail.value
  const source = detail?.kind === 'flatten' ? detail.flattenSource : undefined
  const items = flattenLedgerItems.value
  if (!source || items.length < 4) return ''

  const channelOffset = items[0]?.formattedValue ?? '0'
  const rowOffset = items[1]?.formattedValue ?? '0'
  const colOffset = items[2]?.formattedValue ?? '0'
  const finalIndex = items[3]?.formattedValue ?? `${detail?.flattenIndex ?? 0}`
  return `i = ${source.channelIndex}×H×W + ${source.row}×W + ${source.col} = ${channelOffset} + ${rowOffset} + ${colOffset} = ${finalIndex}`
})
const activeSoftmaxIndex = computed(() => {
  if (highlightedSoftmaxIndex.value !== undefined) return highlightedSoftmaxIndex.value
  if (selectedLayer.value?.kind === 'dense') return selectedNodeIndex.value
  return undefined
})
const softmaxRows = computed(() => {
  const expScores = selectedDetail.value?.kind === 'dense' ? selectedDetail.value.expScores ?? [] : []
  const probabilities = selectedDetail.value?.kind === 'dense' ? selectedDetail.value.probabilities ?? [] : []
  const activeIndex = activeSoftmaxIndex.value

  return scores.value.map((score, index) => ({
    ...score,
    classIndex: index,
    expScore: expScores[index] ?? 0,
    probability: probabilities[index] ?? score.probability,
    selected: selectedLayer.value?.kind === 'dense' && selectedNodeIndex.value === index,
    highlighted: activeIndex === index,
  }))
})
const softmaxDenominator = computed(() => softmaxRows.value.reduce((sum, score) => sum + score.expScore, 0))
const softmaxContributionRows = computed<CnnSoftmaxContributionRow[]>(() => {
  const denominator = softmaxDenominator.value
  return softmaxRows.value.map((score) => ({
    ...score,
    expShare: denominator > 0 ? score.expScore / denominator : 0,
  }))
})
const softmaxCompetitionRows = computed<CnnSoftmaxCompetitionRow[]>(() => {
  const rows = [...softmaxContributionRows.value].sort((left, right) => right.probability - left.probability)
  const top = rows[0]
  const maxExp = Math.max(1e-8, ...rows.map((row) => row.expScore))

  return rows.map((row, index) => {
    const logitGapFromTop = (top?.logit ?? row.logit) - row.logit
    const probabilityGapFromTop = (top?.probability ?? row.probability) - row.probability
    return {
      ...row,
      rank: index + 1,
      isTop: index === 0,
      isActive: row.selected || row.highlighted,
      logitGapFromTop,
      probabilityGapFromTop,
      expWidth: `${Math.max(3, Math.round((row.expScore / maxExp) * 100))}%`,
      probabilityWidth: formatPercent(row.probability),
      narration: localized(
        loc(
          index === 0
            ? `${row.label} 当前排第 1：它的 exp(logit) 在分母中占 ${formatPercent(row.expShare)}，归一化后得到 ${formatPercent(row.probability)}。`
            : `${row.label} 比 top logit 低 ${formatNumber(logitGapFromTop)}，它仍参与分母，但概率比 top 少 ${formatPercent(probabilityGapFromTop)}。`,
          index === 0
            ? `${row.label} is ranked first: its exp(logit) takes ${formatPercent(row.expShare)} of the denominator and normalizes to ${formatPercent(row.probability)}.`
            : `${row.label} is ${formatNumber(logitGapFromTop)} logit below the top class; it still joins the denominator, but its probability is ${formatPercent(probabilityGapFromTop)} lower than top.`,
        ),
      ),
    }
  })
})
const activeSoftmaxRow = computed(() => {
  const index = activeSoftmaxIndex.value
  return index === undefined ? undefined : softmaxContributionRows.value[index]
})
const selectedKernelChannels = computed<CnnKernelPreview[]>(() => {
  if (selectedLayer.value?.kind !== 'conv') return []
  return (selectedNode.value?.inputLinks ?? [])
    .map((link) => ({
      channelIndex: link.sourceNodeIndex,
      kernel: isMatrix(link.weight) ? link.weight : [],
    }))
    .filter((preview) => preview.kernel.length > 0)
})
const activeColorLegend = computed<CnnColorLegend | undefined>(() => {
  const layer = selectedLayer.value
  const node = selectedNode.value
  if (!layer || !node) return undefined

  if (colorMode.value === 'logits' || layer.kind === 'dense') {
    const selectedScore = scores.value[selectedNodeIndex.value]
    const range = logitRange.value
    const selectedLogit = selectedScore?.logit ?? node.logit ?? numberFromOutput(node.output)

    return {
      title: copy.value.logitMap,
      body: copy.value.colorLegendLogit,
      minLabel: formatNumber(range[0]),
      midLabel: formatNumber((range[0] + range[1]) / 2),
      maxLabel: formatNumber(range[1]),
      selectedLabel: selectedScore?.label ?? copy.value.currentSample,
      selectedValue: formatNumber(selectedLogit),
      gradient: legendGradient(range, (value) => interpolateOranges(normalize(value, range[0], range[1]))),
      markerPosition: legendMarkerPosition(selectedLogit, range),
      stops: legendStops(range, (value) => interpolateOranges(normalize(value, range[0], range[1]))),
    }
  }

  if (colorMode.value === 'weights') {
    const values =
      layer.kind === 'conv'
        ? selectedKernelChannels.value.flatMap((preview) => preview.kernel.flat())
        : node.inputLinks.flatMap((link) => (typeof link.weight === 'number' ? [link.weight] : []))
    if (!values.length) return undefined

    const range = rangeFromValues(values)
    const selectedWeight = focusedConvMathTerm.value?.kernelValue ?? values[0] ?? 0

    return {
      title: layer.kind === 'conv' ? copy.value.kernelBank : copy.value.denseWeightMap,
      body: copy.value.colorLegendWeight,
      minLabel: formatNumber(range[0]),
      midLabel: copy.value.zeroValue,
      maxLabel: formatNumber(range[1]),
      selectedLabel: copy.value.currentSample,
      selectedValue: formatNumber(selectedWeight),
      gradient: legendGradient(range, (value) => interpolateBrBG(normalize(value, range[0], range[1]) * 0.72 + 0.14)),
      markerPosition: legendMarkerPosition(0, range),
      stops: legendStops(range, (value) => interpolateBrBG(normalize(value, range[0], range[1]) * 0.72 + 0.14)),
    }
  }

  const activationValue = selectedMatrix.value
    ? selectedMatrix.value[Math.min(selectedRow.value, rowMax.value)]?.[Math.min(selectedCol.value, colMax.value)]
    : numberFromOutput(node.output)
  const range = selectedLayerRange.value

  return {
    title: copy.value.map,
    body: copy.value.colorLegendActivation,
    minLabel: formatNumber(range[0]),
    midLabel: layer.kind === 'input' ? formatNumber((range[0] + range[1]) / 2) : copy.value.zeroValue,
    maxLabel: formatNumber(range[1]),
    selectedLabel: copy.value.currentSample,
    selectedValue: formatNumber(activationValue),
    gradient: legendGradient(range, (value) =>
      layer.kind === 'input' ? interpolateGreys(normalize(value, range[0], range[1])) : interpolateRdBu(1 - normalize(value, range[0], range[1])),
    ),
    markerPosition: legendMarkerPosition(layer.kind === 'input' ? (range[0] + range[1]) / 2 : 0, range),
    stops: legendStops(range, (value) =>
      layer.kind === 'input' ? interpolateGreys(normalize(value, range[0], range[1])) : interpolateRdBu(1 - normalize(value, range[0], range[1])),
    ),
  }
})
const overviewColorLegend = computed<CnnColorLegend | undefined>(() => {
  const layer = selectedLayer.value
  const node = selectedNode.value
  if (!layer || !node) return undefined

  const range = scaledLayerRange(layer)
  const matrixValue = selectedMatrix.value
    ? selectedMatrix.value[Math.min(selectedRow.value, rowMax.value)]?.[Math.min(selectedCol.value, colMax.value)]
    : undefined
  const selectedValue = matrixValue ?? numberFromOutput(node.output)
  const midValue = (range[0] + range[1]) / 2
  const colorForRangeValue = (value: number) => colorForOverviewValue(layer, value)

  return {
    title: `${copy.value.overview} · ${scaleMode.value}`,
    body: layer.kind === 'input' ? copy.value.colorLegendActivation : copy.value.colorLegendActivation,
    minLabel: formatNumber(range[0]),
    midLabel: layer.kind === 'input' || layer.kind === 'dense' ? formatNumber(midValue) : copy.value.zeroValue,
    maxLabel: formatNumber(range[1]),
    selectedLabel: layer.name,
    selectedValue: formatNumber(selectedValue),
    gradient: legendGradient(range, colorForRangeValue),
    markerPosition: legendMarkerPosition(selectedValue, range),
    stops: legendStops(range, colorForRangeValue),
  }
})
const activeOverviewWindow = computed(() => {
  const focus = focusedOverviewWindow.value
  if (!focus) return undefined
  const layer = layers.value[focus.layerIndex]
  const node = layer?.nodes[focus.nodeIndex]
  if (!layer || !node) return undefined
  return overviewLocalWindows(layer, node).find((window) => window.kind === focus.kind)
})
const focusedOverviewChannel = computed(() => (activeOverviewWindow.value?.kind === 'source' ? activeOverviewWindow.value.nodeIndex : undefined))
const convContributions = computed(() => {
  if (selectedDetail.value?.kind !== 'conv') return []
  const contributions = selectedDetail.value.channelContributions ?? []
  const focusedChannel = focusedOverviewChannel.value
  if (focusedChannel === undefined) return contributions

  return [...contributions].sort((left, right) => {
    if (left.channelIndex === focusedChannel) return -1
    if (right.channelIndex === focusedChannel) return 1
    return left.channelIndex - right.channelIndex
  })
})
const convIntermediateCards = computed<CnnConvIntermediateCard[]>(() => {
  const focusedChannel = focusedConvMathTerm.value?.channelIndex ?? focusedOverviewChannel.value
  return convContributions.value.map((contribution) => ({
    channelIndex: contribution.channelIndex,
    patch: contribution.patch,
    kernel: contribution.kernel,
    products: contribution.products,
    sum: contribution.sum,
    formattedSum: formatNumber(contribution.sum),
    isFocused: focusedChannel === contribution.channelIndex,
  }))
})
const convLedgerItems = computed<CnnConvLedgerItem[]>(() => {
  const detail = selectedDetail.value
  if (detail?.kind !== 'conv') return []
  const channelItems = (detail.channelContributions ?? []).map((contribution) => ({
    id: `channel-${contribution.channelIndex}`,
    label: `${copy.value.channel} ${contribution.channelIndex}`,
    value: contribution.sum,
    formattedValue: formatNumber(contribution.sum),
    barWidth: '0%',
    tone: ledgerTone(contribution.sum),
    kind: 'channel' as const,
    channelIndex: contribution.channelIndex,
  }))
  const items = [
    ...channelItems,
    {
      id: 'bias',
      label: copy.value.bias,
      value: detail.bias ?? 0,
      formattedValue: formatNumber(detail.bias),
      barWidth: '0%',
      tone: ledgerTone(detail.bias ?? 0),
      kind: 'bias' as const,
    },
    {
      id: 'weighted',
      label: copy.value.beforeRelu,
      value: detail.weightedSum ?? 0,
      formattedValue: formatNumber(detail.weightedSum),
      barWidth: '0%',
      tone: ledgerTone(detail.weightedSum ?? 0),
      kind: 'weighted' as const,
    },
    {
      id: 'relu',
      label: copy.value.reluValue,
      value: detail.reluValue ?? 0,
      formattedValue: formatNumber(detail.reluValue),
      barWidth: '0%',
      tone: ledgerTone(detail.reluValue ?? 0),
      kind: 'relu' as const,
    },
  ]
  const maxAbs = Math.max(...items.map((item) => Math.abs(item.value)), 1e-8)

  return items.map((item) => ({
    ...item,
    barWidth: `${Math.round((Math.abs(item.value) / maxAbs) * 100)}%`,
  }))
})
const convLedgerEquation = computed(() => {
  const detail = selectedDetail.value
  if (detail?.kind !== 'conv') return ''
  const channelText = (detail.channelContributions ?? [])
    .map((contribution) => formatNumber(contribution.sum))
    .join(' + ')
  return `${channelText} + ${copy.value.bias} ${formatNumber(detail.bias)} = ${copy.value.beforeRelu} ${formatNumber(detail.weightedSum)} → ${copy.value.reluValue} ${formatNumber(detail.reluValue)}`
})
const focusedConvMathTerm = computed<CnnConvMathTerm | undefined>(() => {
  if (selectedDetail.value?.kind !== 'conv') return undefined
  const contributions = selectedDetail.value.channelContributions ?? []
  if (!contributions.length) return undefined
  const channelIndex = convMathFocus.value?.channelIndex ?? focusedOverviewChannel.value ?? contributions[0]?.channelIndex ?? 0
  const contribution = contributions.find((item) => item.channelIndex === channelIndex) ?? contributions[0]
  if (!contribution) return undefined
  const row = Math.min(Math.max(0, convMathFocus.value?.row ?? 0), Math.max(0, contribution.patch.length - 1))
  const col = Math.min(Math.max(0, convMathFocus.value?.col ?? 0), Math.max(0, (contribution.patch[row]?.length ?? 1) - 1))

  return {
    channelIndex: contribution.channelIndex,
    row,
    col,
    patchValue: contribution.patch[row]?.[col] ?? 0,
    kernelValue: contribution.kernel[row]?.[col] ?? 0,
    productValue: contribution.products[row]?.[col] ?? 0,
    channelSum: contribution.sum,
  }
})
const activeConvContribution = computed<CnnChannelContribution | undefined>(() => {
  if (selectedDetail.value?.kind !== 'conv') return undefined
  const contributions = selectedDetail.value.channelContributions ?? []
  if (!contributions.length) return undefined
  const channelIndex = focusedConvMathTerm.value?.channelIndex ?? focusedOverviewChannel.value ?? contributions[0]?.channelIndex
  return contributions.find((contribution) => contribution.channelIndex === channelIndex) ?? contributions[0]
})
const convAnimatorWindowCenter = computed(() => {
  const anchor = convAnimatorAnchor.value
  if (anchor && anchor.layerIndex === selectedLayerIndex.value && anchor.nodeIndex === selectedNodeIndex.value) {
    return { row: anchor.row, col: anchor.col }
  }
  return { row: selectedRow.value, col: selectedCol.value }
})
const convAnimatorDetail = computed<CnnConvAnimatorDetail | undefined>(() => {
  const detail = selectedDetail.value
  const contribution = activeConvContribution.value
  const node = selectedNode.value
  const outputMatrix = selectedMatrix.value
  if (detail?.kind !== 'conv' || !contribution || !node || !outputMatrix) return undefined

  const sourceLink =
    node.inputLinks.find((link) => link.sourceNodeIndex === contribution.channelIndex) ??
    node.inputLinks[contribution.channelIndex]
  const sourceNode = sourceLink ? layers.value[sourceLink.sourceLayerIndex]?.nodes[sourceLink.sourceNodeIndex] : undefined
  const sourceMatrix = isMatrix(sourceNode?.output) ? sourceNode.output : undefined
  if (!sourceMatrix) return undefined

  const kernelSize = Math.max(1, contribution.kernel.length || contribution.patch.length || 3)
  const windowCenter = convAnimatorWindowCenter.value

  return {
    channelIndex: contribution.channelIndex,
    inputLabel: `${sourceNode?.layerName ?? copy.value.sourceMap}[${sourceNode?.index ?? contribution.channelIndex}]`,
    outputLabel: `${node.layerName}[${node.index}]`,
    inputShape: `${sourceMatrix.length}×${sourceMatrix[0]?.length ?? 0}`,
    outputShape: `${outputMatrix.length}×${outputMatrix[0]?.length ?? 0}`,
    inputWindow: convInputWindowAround(sourceMatrix, windowCenter.row, windowCenter.col, kernelSize, 2, selectedRow.value, selectedCol.value),
    outputWindow: matrixWindowAround(outputMatrix, windowCenter.row, windowCenter.col, 2, selectedRow.value, selectedCol.value),
    inputMatrix: sourceMatrix,
    outputMatrix,
    contribution,
  }
})
const convMathNarration = computed(() => {
  const term = focusedConvMathTerm.value
  if (!term) return ''
  return localized(
    loc(
      `channel ${term.channelIndex} 的 (${term.row}, ${term.col}) 项：${formatNumber(term.patchValue)} × ${formatNumber(term.kernelValue)} = ${formatNumber(term.productValue)}；这个乘积会和同一通道的其他 8 个乘积一起累加为 ${formatNumber(term.channelSum)}。`,
      `Channel ${term.channelIndex} term (${term.row}, ${term.col}): ${formatNumber(term.patchValue)} x ${formatNumber(term.kernelValue)} = ${formatNumber(term.productValue)}; this product is added with the other 8 products in the same channel to make ${formatNumber(term.channelSum)}.`,
    ),
  )
})
const denseWeightPreview = computed<CnnDenseWeightPreview[]>(() => {
  if (selectedLayer.value?.kind !== 'dense') return []
  return (selectedNode.value?.inputLinks ?? [])
    .map((link) => ({
      sourceIndex: link.sourceNodeIndex,
      value: typeof link.weight === 'number' ? link.weight : 0,
    }))
    .filter((preview) => Number.isFinite(preview.value) && Math.abs(preview.value) > 1e-8)
    .sort((left, right) => Math.abs(right.value) - Math.abs(left.value))
    .slice(0, 18)
})
const denseWeightMagnitudeMax = computed(() => Math.max(...denseWeightPreview.value.map((preview) => Math.abs(preview.value)), 1e-8))
const denseContributionTerms = computed(() => {
  if (selectedLayer.value?.kind !== 'dense') return []
  return (selectedNode.value?.inputLinks ?? [])
    .map((link) => {
      const sourceNode = layers.value[link.sourceLayerIndex]?.nodes[link.sourceNodeIndex]
      const activation = numberFromOutput(sourceNode?.output ?? 0)
      const weight = typeof link.weight === 'number' ? link.weight : 0
      const product = activation * weight
      return {
        sourceIndex: link.sourceNodeIndex,
        activation,
        weight,
        product,
      }
    })
    .filter((term) => Number.isFinite(term.activation) && Number.isFinite(term.weight) && Number.isFinite(term.product))
})
const denseContributionMagnitudeMax = computed(() => Math.max(...denseContributionTerms.value.map((term) => Math.abs(term.product)), Math.abs(selectedNode.value?.bias ?? 0), 1e-8))
const denseVisibleContributionCount = 8
const denseWaterfallContributionCount = 6
const denseContributionAtlasMapCount = 6
const denseLedgerHiddenCount = computed(() => Math.max(0, denseContributionTerms.value.length - denseVisibleContributionCount))
const denseLedgerItems = computed<CnnDenseLedgerItem[]>(() => {
  const detail = selectedDetail.value
  const node = selectedNode.value
  const score = scores.value[selectedNodeIndex.value]
  if (detail?.kind !== 'dense' || selectedLayer.value?.kind !== 'dense' || !node) return []

  const maxMagnitude = denseContributionMagnitudeMax.value
  const contributionItems = [...denseContributionTerms.value]
    .sort((left, right) => Math.abs(right.product) - Math.abs(left.product))
    .slice(0, denseVisibleContributionCount)
    .map<CnnDenseLedgerItem>((term) => ({
      id: `dense-term-${term.sourceIndex}`,
      label: `v${term.sourceIndex} × w`,
      formula: `${formatNumber(term.activation)} × ${formatNumber(term.weight)}`,
      value: term.product,
      formattedValue: formatNumber(term.product),
      description: localized(
        loc(
          `Flatten 向量 v${term.sourceIndex} 的值乘上当前类别权重；乘积为 ${formatNumber(term.product)}，会进入 logit 求和。`,
          `Flatten vector v${term.sourceIndex} is multiplied by the current class weight; the product ${formatNumber(term.product)} contributes to the logit sum.`,
        ),
      ),
      barWidth: `${Math.round((Math.abs(term.product) / maxMagnitude) * 100)}%`,
      sourceIndex: term.sourceIndex,
      activation: term.activation,
      weight: term.weight,
      kind: term.product >= 0 ? 'positive' : 'negative',
    }))

  const bias = node.bias ?? 0
  const logit = score?.logit ?? node.logit ?? detail.logits?.[node.index] ?? numberFromOutput(node.output)
  const biasItem: CnnDenseLedgerItem = {
    id: 'dense-bias',
    label: copy.value.denseBiasTerm,
    formula: 'b',
    value: bias,
    formattedValue: formatNumber(bias),
    description: localized(
      loc(
        `bias 是当前类别 logit 的可学习平移项，会和所有向量乘积一起相加。`,
        `The bias is a learned shift for the current class logit and is added with all vector products.`,
      ),
    ),
    barWidth: `${Math.round((Math.abs(bias) / maxMagnitude) * 100)}%`,
    kind: 'bias',
  }
  const logitItem: CnnDenseLedgerItem = {
    id: 'dense-logit',
    label: copy.value.denseLogitTerm,
    formula: 'Σ(v_i × w_i) + b',
    value: logit,
    formattedValue: formatNumber(logit),
    description: localized(
      loc(
        `当前类别的 logit 是所有 ${denseContributionTerms.value.length} 个向量项与 bias 的总和；Softmax 会把它和其他类别 logit 放在一起归一化。`,
        `The current class logit is the sum of all ${denseContributionTerms.value.length} vector terms plus bias; Softmax normalizes it with the other class logits.`,
      ),
    ),
    barWidth: `${Math.round((Math.abs(logit) / Math.max(maxMagnitude, Math.abs(logit), 1e-8)) * 100)}%`,
    kind: 'logit',
  }

  return [...contributionItems, biasItem, logitItem]
})
const denseWaterfall = computed<CnnDenseWaterfall | undefined>(() => {
  const detail = selectedDetail.value
  const node = selectedNode.value
  const score = scores.value[selectedNodeIndex.value]
  if (detail?.kind !== 'dense' || selectedLayer.value?.kind !== 'dense' || !node) return undefined

  const sortedTerms = [...denseContributionTerms.value].sort((left, right) => Math.abs(right.product) - Math.abs(left.product))
  if (!sortedTerms.length) return undefined

  const visibleTerms = sortedTerms.slice(0, denseWaterfallContributionCount)
  const visibleIndexes = new Set(visibleTerms.map((term) => term.sourceIndex))
  const hiddenTerms = sortedTerms.filter((term) => !visibleIndexes.has(term.sourceIndex))
  const hiddenDelta = hiddenTerms.reduce((sum, term) => sum + term.product, 0)
  const bias = node.bias ?? 0
  const logit = score?.logit ?? node.logit ?? detail.logits?.[node.index] ?? numberFromOutput(node.output)
  const rawSteps: Array<{
    id: string
    label: string
    formula: string
    delta: number
    kind: CnnDenseWaterfallStep['kind']
    description: string
    sourceIndex?: number
  }> = visibleTerms.map((term) => ({
    id: `waterfall-term-${term.sourceIndex}`,
    label: `v${term.sourceIndex} × w`,
    formula: `${formatNumber(term.activation)} × ${formatNumber(term.weight)}`,
    delta: term.product,
    kind: term.product >= 0 ? 'positive' : 'negative',
    sourceIndex: term.sourceIndex,
    description: localized(
      loc(
        `先把 flatten 向量 v${term.sourceIndex} 的值 ${formatNumber(term.activation)} 乘上权重 ${formatNumber(term.weight)}，得到 ${formatNumber(term.product)}，累计和随之移动。`,
        `Multiply flatten vector v${term.sourceIndex} value ${formatNumber(term.activation)} by weight ${formatNumber(term.weight)} to get ${formatNumber(term.product)}, moving the running sum.`,
      ),
    ),
  }))

  if (hiddenTerms.length) {
    rawSteps.push({
      id: 'waterfall-hidden',
      label: `${copy.value.denseRemainingTerms} (${hiddenTerms.length})`,
      formula: `Σ ${hiddenTerms.length} ${copy.value.hiddenTerms}`,
      delta: hiddenDelta,
      kind: hiddenDelta >= 0 ? 'positive' : 'negative',
      description: localized(
        loc(
          `为了保持图面可读，剩下 ${hiddenTerms.length} 个较小向量项合并成一个净贡献 ${formatNumber(hiddenDelta)}。`,
          `To keep the view readable, the remaining ${hiddenTerms.length} smaller vector terms are grouped into one net contribution of ${formatNumber(hiddenDelta)}.`,
        ),
      ),
    })
  }

  rawSteps.push({
    id: 'waterfall-bias',
    label: copy.value.denseBiasTerm,
    formula: 'b',
    delta: bias,
    kind: 'bias',
    description: localized(
      loc(
        `最后加入 bias ${formatNumber(bias)}；它会整体平移当前类别 logit。`,
        `Finally add bias ${formatNumber(bias)}; it shifts the current class logit as a whole.`,
      ),
    ),
  })

  const cumulativeValues = [0]
  let runningSum = 0
  for (const step of rawSteps) {
    runningSum += step.delta
    cumulativeValues.push(runningSum)
  }
  cumulativeValues.push(logit)
  const [rangeMin, rangeMax] = rangeFromValues(cumulativeValues)
  const padding = Math.max(0.05, (rangeMax - rangeMin) * 0.12)
  const min = rangeMin - padding
  const max = rangeMax + padding
  const toPercent = (value: number) => `${normalize(value, min, max) * 100}%`

  let cumulative = 0
  const steps = rawSteps.map<CnnDenseWaterfallStep>((step) => {
    const start = cumulative
    const end = start + step.delta
    cumulative = end
    const left = Math.min(start, end)
    const right = Math.max(start, end)

    return {
      id: step.id,
      label: step.label,
      formula: step.formula,
      delta: step.delta,
      formattedDelta: formatNumber(step.delta),
      end,
      formattedEnd: formatNumber(end),
      description: step.description,
      kind: step.kind,
      barStyle: {
        left: toPercent(left),
        width: `${Math.max(0.8, (normalize(right, min, max) - normalize(left, min, max)) * 100)}%`,
      },
      markerStyle: {
        left: toPercent(end),
      },
      sourceIndex: step.sourceIndex,
    }
  })

  return {
    steps,
    axisPosition: toPercent(0),
    minLabel: formatNumber(min),
    maxLabel: formatNumber(max),
    formattedFinalLogit: formatNumber(logit),
  }
})
const firstDenseContributionSourceIndex = computed(() => {
  if (selectedLayer.value?.kind !== 'dense') return undefined
  return [...denseContributionTerms.value].sort((left, right) => Math.abs(right.product) - Math.abs(left.product))[0]?.sourceIndex
})
const activeDenseSourceIndex = computed(() => {
  if (selectedLayer.value?.kind !== 'dense') return undefined
  return focusedDenseSourceIndex.value ?? firstDenseContributionSourceIndex.value
})
const receptiveField = computed<CnnReceptiveFieldSnapshot | undefined>(() =>
  calculateReceptiveField(layers.value, selectedLayerIndex.value, selectedNodeIndex.value, selectedRow.value, selectedCol.value, {
    denseSourceIndex: activeDenseSourceIndex.value,
  }),
)
const receptiveFieldOverlayStyle = computed(() => {
  const field = receptiveField.value
  if (!field) return {}
  return {
    top: `${(field.bounds.rowStart / field.inputRows) * 100}%`,
    left: `${(field.bounds.colStart / field.inputCols) * 100}%`,
    height: `${(field.bounds.rowSpan / field.inputRows) * 100}%`,
    width: `${(field.bounds.colSpan / field.inputCols) * 100}%`,
  }
})
const receptiveFieldRegionLabel = computed(() => {
  const field = receptiveField.value
  if (!field) return copy.value.fallback
  return `r${field.bounds.rowStart}-${field.bounds.rowEnd - 1} · c${field.bounds.colStart}-${field.bounds.colEnd - 1}`
})
const receptiveFieldChannelLabel = computed(() => {
  const channels = receptiveField.value?.channels ?? []
  if (!channels.length) return copy.value.fallback
  if (channels.length === 3 && channels.every((channel, index) => channel === index)) return 'RGB'
  return channels.map((channel) => inputChannelLabel(channel)).join(' / ')
})
const receptiveFieldNarration = computed(() => {
  const field = receptiveField.value
  const layer = selectedLayer.value
  if (!field || !layer) return copy.value.receptiveFieldHint
  const region = receptiveFieldRegionLabel.value
  const kindCopy = localized(
    loc(
      {
        input: `Input 层直接读取原图像素，当前点就是 ${region}。`,
        conv: `Conv 层把 kernel 覆盖过的上一层区域继续追回输入图，所以当前输出 cell 依赖 ${region}。`,
        relu: `ReLU 不移动位置，只把负值截断；它的输入来源区域仍是 ${region}。`,
        pool: `MaxPool 从上一层 2×2 window 取最大值；追回原图后，对应区域是 ${region}。`,
        flatten: `Flatten 只改地址，不改数值；这个向量项来自原图 ${region}。`,
        dense: `Dense/Softmax 通过一个 flatten 来源项连接到分类分数；当前高亮来源可追回原图 ${region}。`,
      },
      {
        input: `The Input layer reads image pixels directly, so the current point is ${region}.`,
        conv: `The Conv layer traces the kernel-covered previous-layer window back to the input image; this output cell depends on ${region}.`,
        relu: `ReLU does not move the position; it clips negative values, so its source region remains ${region}.`,
        pool: `MaxPool picks the maximum from a 2x2 previous-layer window; traced back to the image, that is ${region}.`,
        flatten: `Flatten changes the address, not the value; this vector entry comes from image region ${region}.`,
        dense: `Dense/Softmax connects a flatten source term to the class score; the highlighted source traces back to ${region}.`,
      },
    ),
  )
  return kindCopy[layer.kind]
})
const denseContributorLocator = computed<CnnDenseSourceLocator | undefined>(() => {
  if (selectedLayer.value?.kind !== 'dense') return undefined
  const node = selectedNode.value
  const sourceIndex = activeDenseSourceIndex.value
  if (!node || sourceIndex === undefined) return undefined

  const denseLink = node.inputLinks.find((link) => link.sourceNodeIndex === sourceIndex)
  const flattenNode = denseLink ? layers.value[denseLink.sourceLayerIndex]?.nodes[denseLink.sourceNodeIndex] : undefined
  const flattenInputLink = flattenNode?.inputLinks[0]
  const sourceNode = flattenInputLink ? layers.value[flattenInputLink.sourceLayerIndex]?.nodes[flattenInputLink.sourceNodeIndex] : undefined
  const sourceMatrix = isMatrix(sourceNode?.output) ? sourceNode.output : undefined
  if (!denseLink || !flattenNode || !flattenInputLink || !sourceNode || !sourceMatrix?.length) return undefined

  const rowCount = sourceMatrix.length
  const colCount = sourceMatrix[0]?.length ?? 0
  if (!colCount) return undefined

  const sourceRow = Math.min(Math.max(0, flattenInputLink.sourcePosition?.row ?? 0), rowCount - 1)
  const sourceCol = Math.min(Math.max(0, flattenInputLink.sourcePosition?.col ?? 0), colCount - 1)
  const activation = numberFromOutput(flattenNode.output)
  const weight = typeof denseLink.weight === 'number' ? denseLink.weight : 0
  const product = activation * weight
  const classLabel = scores.value[selectedNodeIndex.value]?.label ?? `${copy.value.classTerm} ${selectedNodeIndex.value}`

  return {
    sourceIndex,
    sourceLabel: `${sourceNode.layerName}[${sourceNode.index}]`,
    vectorLabel: `v${sourceIndex}`,
    cellLabel: `(${sourceRow}, ${sourceCol})`,
    activation,
    weight,
    product,
    formattedActivation: formatNumber(activation),
    formattedWeight: formatNumber(weight),
    formattedProduct: formatNumber(product),
    sourceWindow: matrixWindowAround(sourceMatrix, sourceRow, sourceCol, 2, sourceRow, sourceCol),
    sourceMatrix,
    narration: localized(
      loc(
        `Dense 层把这个来源 cell 展平成 ${`v${sourceIndex}`}，再乘上通往 ${classLabel} 的权重；这个乘积会作为一个加数进入当前 logit。`,
        `The Dense layer reads this source cell as ${`v${sourceIndex}`}, multiplies it by the weight into ${classLabel}, and adds the product into the current logit.`,
      ),
    ),
  }
})
const denseContributionAtlasAllMaps = computed<CnnDenseContributionAtlasMap[]>(() => {
  if (selectedLayer.value?.kind !== 'dense') return []
  const node = selectedNode.value
  if (!node) return []

  const activeSourceIndex = activeDenseSourceIndex.value
  const records = new Map<
    string,
    {
      id: string
      sourceLabel: string
      sourceNodeIndex: number
      sourceMatrix: number[][]
      grid: CnnDenseContributionAtlasCell[][]
    }
  >()

  for (const denseLink of node.inputLinks) {
    const flattenNode = layers.value[denseLink.sourceLayerIndex]?.nodes[denseLink.sourceNodeIndex]
    const flattenInputLink = flattenNode?.inputLinks[0]
    const sourceNode = flattenInputLink ? layers.value[flattenInputLink.sourceLayerIndex]?.nodes[flattenInputLink.sourceNodeIndex] : undefined
    const sourceMatrix = isMatrix(sourceNode?.output) ? sourceNode.output : undefined
    if (!flattenNode || !flattenInputLink || !sourceNode || !sourceMatrix?.length) continue

    const rowCount = sourceMatrix.length
    const colCount = sourceMatrix[0]?.length ?? 0
    if (!colCount) continue

    const recordId = `${flattenInputLink.sourceLayerIndex}-${sourceNode.index}`
    let record = records.get(recordId)
    if (!record) {
      record = {
        id: recordId,
        sourceLabel: `${sourceNode.layerName}[${sourceNode.index}]`,
        sourceNodeIndex: sourceNode.index,
        sourceMatrix,
        grid: sourceMatrix.map((row, rowIndex) =>
          row.map((activation, colIndex) => ({
            value: 0,
            row: rowIndex,
            col: colIndex,
            activation,
            weight: 0,
            contribution: 0,
            formattedActivation: formatNumber(activation),
            formattedWeight: formatNumber(0),
            formattedContribution: formatNumber(0),
            isFocused: false,
          })),
        ),
      }
      records.set(recordId, record)
    }

    const sourceRow = Math.min(Math.max(0, flattenInputLink.sourcePosition?.row ?? 0), rowCount - 1)
    const sourceCol = Math.min(Math.max(0, flattenInputLink.sourcePosition?.col ?? 0), colCount - 1)
    const activation = numberFromOutput(flattenNode.output)
    const weight = typeof denseLink.weight === 'number' ? denseLink.weight : 0
    const contribution = activation * weight
    record.grid[sourceRow][sourceCol] = {
      value: contribution,
      row: sourceRow,
      col: sourceCol,
      sourceIndex: denseLink.sourceNodeIndex,
      activation,
      weight,
      contribution,
      formattedActivation: formatNumber(activation),
      formattedWeight: formatNumber(weight),
      formattedContribution: formatNumber(contribution),
      isFocused: activeSourceIndex === denseLink.sourceNodeIndex,
    }
  }

  return [...records.values()]
    .map<CnnDenseContributionAtlasMap>((record) => {
      const cells = record.grid.flat()
      const totalContribution = cells.reduce((sum, cell) => sum + cell.contribution, 0)
      const absoluteContribution = cells.reduce((sum, cell) => sum + Math.abs(cell.contribution), 0)
      const topCell =
        [...cells].sort((left, right) => Math.abs(right.contribution) - Math.abs(left.contribution))[0] ?? cells[0]
      const maxMagnitude = Math.max(...cells.map((cell) => Math.abs(cell.contribution)), 1e-8)
      const classLabel = scores.value[selectedNodeIndex.value]?.label ?? `${copy.value.classTerm} ${selectedNodeIndex.value}`

      return {
        id: record.id,
        sourceLabel: record.sourceLabel,
        sourceNodeIndex: record.sourceNodeIndex,
        totalContribution,
        absoluteContribution,
        formattedTotalContribution: formatNumber(totalContribution),
        formattedAbsoluteContribution: formatNumber(absoluteContribution),
        topSourceIndex: topCell?.sourceIndex ?? -1,
        topContribution: topCell?.contribution ?? 0,
        formattedTopContribution: formatNumber(topCell?.contribution ?? 0),
        maxMagnitude,
        grid: record.grid,
        isFocused: cells.some((cell) => cell.isFocused),
        narration: localized(
          loc(
            `${record.sourceLabel} 中所有 cell 展平后分别乘 Dense 权重；这些乘积的净和是 ${formatNumber(totalContribution)}，会并入 ${classLabel} 的 logit。`,
            `Every cell in ${record.sourceLabel} is flattened and multiplied by a Dense weight; their net sum is ${formatNumber(totalContribution)} before joining the ${classLabel} logit.`,
          ),
        ),
      }
    })
    .sort((left, right) => right.absoluteContribution - left.absoluteContribution)
})
const denseContributionAtlasMaps = computed(() => denseContributionAtlasAllMaps.value.slice(0, denseContributionAtlasMapCount))
const denseContributionAtlasHiddenCount = computed(() => Math.max(0, denseContributionAtlasAllMaps.value.length - denseContributionAtlasMaps.value.length))
const denseLedgerEquation = computed(() => {
  const detail = selectedDetail.value
  const node = selectedNode.value
  const score = scores.value[selectedNodeIndex.value]
  if (detail?.kind !== 'dense' || !node) return ''

  const logit = score?.logit ?? node.logit ?? detail.logits?.[node.index] ?? numberFromOutput(node.output)
  const hidden = denseLedgerHiddenCount.value
  return `z_${node.index} = Σ_i v_i w_{i,${node.index}} + b_${node.index} = ${formatNumber(logit)}${hidden ? ` (${copy.value.denseTopTerms}: ${denseVisibleContributionCount}, ${copy.value.hiddenTerms}: ${hidden})` : ''}`
})
const logitPreviewRows = computed(() =>
  sortedScores.value.map((score) => ({
    ...score,
    selected: selectedLayer.value?.kind === 'dense' && scores.value[selectedNodeIndex.value]?.id === score.id,
    highlighted: isScoreHighlighted(score),
  })),
)
const logitRange = computed(() => rangeFromValues(scores.value.map((score) => score.logit)))
const layerInspector = computed<CnnLayerInspector | undefined>(() => {
  const layer = selectedLayer.value
  const node = selectedNode.value
  if (!layer || !node) return undefined

  const incoming = connectionSummaries(node.inputLinks, 'incoming')
  const outgoing = connectionSummaries(node.outputLinks, 'outgoing')
  const kernel = kernelSizeForNode(node)
  const metrics: CnnInspectorMetric[] = [
    { label: copy.value.inputShapeLabel, value: formatShape(layer.inputShape) },
    { label: copy.value.outputShapeLabel, value: formatShape(layer.outputShape) },
    { label: copy.value.featureMaps, value: `${layer.nodes.length}` },
    { label: copy.value.params, value: layer.parameterCount > 0 ? `${layer.parameterCount}` : copy.value.noParams },
    { label: copy.value.selectedNodeLabel, value: `${node.layerName}[${node.index}]` },
  ]

  if (layer.kind === 'conv' && kernel) {
    metrics.splice(3, 0, { label: copy.value.kernelSize, value: `${kernel.rows}×${kernel.cols}` })
  }

  if (layer.kind === 'pool') {
    metrics.splice(3, 0, { label: copy.value.windowStride, value: '2×2 / 2' })
  }

  return {
    title: `${layer.name} · ${layer.kind}`,
    role: layerRoleDescription(layer, node),
    parameterFormula: layerParameterFormula(layer, node),
    metrics,
    incoming: incoming.visible,
    outgoing: outgoing.visible,
    incomingHiddenCount: incoming.hiddenCount,
    outgoingHiddenCount: outgoing.hiddenCount,
  }
})
const overviewLens = computed<CnnOverviewLens | undefined>(() => {
  const layer = selectedLayer.value
  const node = selectedNode.value
  if (!layer || !node) return undefined

  const detail = selectedDetail.value
  const incoming = connectionSummaries(node.inputLinks, 'incoming')
  const outgoing = connectionSummaries(node.outputLinks, 'outgoing')
  const matrixValue = selectedMatrix.value?.[Math.min(selectedRow.value, rowMax.value)]?.[Math.min(selectedCol.value, colMax.value)]
  const selectedCell = `(${selectedRow.value}, ${selectedCol.value})`
  const connectionInputSummary = node.inputLinks.length
    ? `${node.inputLinks.length} ${copy.value.incomingConnections} · ${formatShape(layer.inputShape)}`
    : `${copy.value.currentSample} · ${formatShape(layer.inputShape)}`
  const connectionOutputSummary = node.outputLinks.length
    ? `${node.outputLinks.length} ${copy.value.outgoingConnections} · ${formatShape(layer.outputShape)}`
    : `${copy.value.prediction} · ${formatShape(layer.outputShape)}`

  let operator: string = layer.kind
  let valueLabel = copy.value.currentValue
  let value = formatNumber(matrixValue ?? numberFromOutput(node.output))
  let focus = selectedCell

  if (layer.kind === 'input') {
    operator = localized(loc('裁剪 / 缩放 / 归一化', 'crop / resize / normalize'))
    focus = `${copy.value.channel} ${node.index} · ${selectedCell}`
  } else if (detail?.kind === 'conv') {
    operator = localized(loc('输入 patch × kernel，加 bias，再过 ReLU', 'input patch x kernel, plus bias, then ReLU'))
    valueLabel = copy.value.reluValue
    value = formatNumber(detail.reluValue)
    focus = `${copy.value.channel} ${node.index} · ${copy.value.outputCell} ${selectedCell}`
  } else if (detail?.kind === 'relu') {
    operator = 'max(0, z)'
    valueLabel = copy.value.reluValue
    value = formatNumber(detail.reluValue)
    focus = `${copy.value.outputCell} ${selectedCell}`
  } else if (detail?.kind === 'pool') {
    operator = localized(loc('2×2 window 取最大值', '2x2 window maximum'))
    valueLabel = copy.value.maxValue
    value = formatNumber(detail.poolMax)
    focus = `${copy.value.poolWindow} (${selectedRow.value * 2}, ${selectedCol.value * 2}) → ${selectedCell}`
  } else if (detail?.kind === 'flatten') {
    operator = '(channel,row,col) → vector'
    valueLabel = copy.value.vectorIndex
    value = `${detail.flattenIndex ?? node.realIndex ?? node.index}`
    focus = `${copy.value.sourceMap} ${detail.flattenSource?.channelIndex ?? 0} · (${detail.flattenSource?.row ?? 0}, ${detail.flattenSource?.col ?? 0})`
  } else if (detail?.kind === 'dense') {
    const score = scores.value[node.index]
    operator = 'Σ(v_i × w_i) + b → softmax'
    valueLabel = copy.value.probability
    value = formatPercent(score?.probability ?? detail.probabilities?.[node.index] ?? 0)
    focus = `${copy.value.classTerm} ${score?.label ?? node.index}`
  }

  return {
    eyebrow: copy.value.overviewLens,
    title: `${layer.name}[${node.index}] · ${layer.kind}`,
    role: layerRoleDescription(layer, node),
    operator,
    inputSummary: connectionInputSummary,
    outputSummary: connectionOutputSummary,
    valueLabel,
    value,
    focus,
    incoming: incoming.visible.slice(0, 4),
    outgoing: outgoing.visible.slice(0, 4),
    incomingHiddenCount: incoming.hiddenCount,
    outgoingHiddenCount: outgoing.hiddenCount,
  }
})
const overviewLayerStrip = computed<CnnOverviewLayerStrip | undefined>(() => {
  const layer = selectedLayer.value
  if (!layer || !layer.nodes.length) return undefined

  const totalCount = layer.nodes.length
  const visibleCount = Math.min(totalCount, overviewLayerStripNodeCount)
  const selectedIndex = Math.min(Math.max(0, selectedNodeIndex.value), totalCount - 1)
  const startIndex = Math.min(Math.max(0, selectedIndex - Math.floor(visibleCount / 2)), Math.max(0, totalCount - visibleCount))
  const nodes = layer.nodes.slice(startIndex, startIndex + visibleCount)
  const endIndex = startIndex + nodes.length

  return {
    title: `${layer.name} · ${overviewLayerRecipe(layer)}`,
    description: overviewLayerStripDescription(startIndex, endIndex, totalCount),
    layer,
    startIndex,
    endIndex,
    totalCount,
    hiddenBeforeCount: startIndex,
    hiddenAfterCount: Math.max(0, totalCount - endIndex),
    items: nodes.map((node) => {
      const value = overviewLayerStripNodeValue(layer, node)
      return {
        id: `strip-${layer.id}-${node.id}`,
        label: overviewLayerStripNodeLabel(layer, node),
        valueLabel: overviewLayerStripNodeValueLabel(layer, node, value),
        node,
        value,
        isMatrix: isMatrix(node.output),
        isSelected: selectedLayerIndex.value === layer.index && selectedNodeIndex.value === node.index,
        color: colorForOverviewValue(layer, value),
        cellStyle: overviewLayerStripCellStyle(node),
      }
    }),
  }
})
const hyperPaddedSize = computed(() => hyperInputSize.value + hyperPadding.value * 2)
const hyperKernelMax = computed(() => Math.max(1, hyperPaddedSize.value))
const hyperStrideMax = computed(() => Math.max(1, hyperPaddedSize.value - hyperKernelSize.value + 1))
const hyperparameterSnapshot = computed(() =>
  buildCnnHyperparameterSnapshot({
    inputSize: hyperInputSize.value,
    padding: hyperPadding.value,
    kernelSize: hyperKernelSize.value,
    stride: hyperStride.value,
    selectedRow: hyperOutputRow.value,
    selectedCol: hyperOutputCol.value,
  }),
)
const hyperOutputSize = computed(() => hyperparameterSnapshot.value.outputSize)
const hyperInputCells = computed(() => hyperparameterSnapshot.value.inputCells)
const hyperKernelCells = computed(() => hyperparameterSnapshot.value.kernelCells)
const hyperOutputCells = computed(() => hyperparameterSnapshot.value.outputCells)
const hyperStrideValid = computed(() => hyperparameterSnapshot.value.strideFits)
const hyperFormulaMarkdown = computed(() => {
  const snapshot = hyperparameterSnapshot.value
  return `$$O = \\left\\lfloor \\frac{N + 2P - K}{S} \\right\\rfloor + 1 = \\left\\lfloor \\frac{${snapshot.inputSize} + 2\\times${snapshot.padding} - ${snapshot.kernelSize}}{${snapshot.stride}} \\right\\rfloor + 1 = ${snapshot.outputSize}$$`
})
const hyperWindowNarration = computed(() => {
  const snapshot = hyperparameterSnapshot.value
  return localized(
    loc(
      `当前选中 output (${snapshot.selectedRow}, ${snapshot.selectedCol})，所以 ${snapshot.kernelSize}×${snapshot.kernelSize} 窗口从 padding 后输入的 (${snapshot.selectedStartRow}, ${snapshot.selectedStartCol}) 开始读取。`,
      `Output (${snapshot.selectedRow}, ${snapshot.selectedCol}) is selected, so the ${snapshot.kernelSize}x${snapshot.kernelSize} window starts reading at (${snapshot.selectedStartRow}, ${snapshot.selectedStartCol}) on the padded input.`,
    ),
  )
})
const detailStepCount = computed(() => {
  const layer = selectedLayer.value
  if (!layer) return 0
  if (layer.outputShape.length === 3 && selectedMatrix.value) return (rowMax.value + 1) * (colMax.value + 1)
  if (layer.kind === 'flatten' || layer.kind === 'dense') return layer.nodes.length
  return layers.value.length
})
const detailStepIndex = computed(() => {
  const layer = selectedLayer.value
  if (!layer) return 0
  if (layer.outputShape.length === 3 && selectedMatrix.value) return selectedRow.value * (colMax.value + 1) + selectedCol.value
  if (layer.kind === 'flatten' || layer.kind === 'dense') return selectedNodeIndex.value
  return selectedLayerIndex.value
})
const detailStepLabel = computed(() => {
  const layer = selectedLayer.value
  if (!layer || detailStepCount.value <= 0) return ''
  const stepText = `${detailStepIndex.value + 1}/${detailStepCount.value}`
  if (layer.kind === 'dense') return `${copy.value.classTerm} ${selectedNodeIndex.value} · ${stepText}`
  if (layer.kind === 'flatten') return `${copy.value.nodeStep} ${selectedNodeIndex.value} · ${stepText}`
  if (layer.outputShape.length === 3) return `${copy.value.windowStep} (${selectedRow.value}, ${selectedCol.value}) · ${stepText}`
  return `${copy.value.detailStep} ${stepText}`
})
const detailProgress = computed(() => {
  if (detailStepCount.value <= 0) return 0
  return (detailStepIndex.value + 1) / detailStepCount.value
})
const overviewLayerStripCellLabel = computed(() => {
  const layer = selectedLayer.value
  if (!layer || layer.outputShape.length !== 3 || !selectedMatrix.value) return ''
  return `${copy.value.outputCell} (${selectedRow.value}, ${selectedCol.value}) · ${copy.value.detailStep} ${detailStepIndex.value + 1}/${detailStepCount.value}`
})
const overviewLayerStripProgressStyle = computed(() => ({ width: formatPercent(detailProgress.value) }))
const detailScanRows = computed<CnnDetailScanCell[][]>(() => {
  const layer = selectedLayer.value
  const matrix = selectedMatrix.value
  if (!layer || layer.kind === 'input' || layer.outputShape.length !== 3 || !matrix?.length) return []

  const width = Math.max(1, matrix[0]?.length ?? 1)
  const currentStep = detailStepIndex.value
  const totalSteps = Math.max(1, detailStepCount.value)

  return matrix.map((row, rowIndex) =>
    row.map((value, colIndex) => {
      const stepIndex = rowIndex * width + colIndex
      const state = stepIndex < currentStep ? 'done' : stepIndex === currentStep ? 'current' : 'pending'
      const cellTitle = `${copy.value.scanCell} (${rowIndex}, ${colIndex})`
      return {
        id: `scan-${layer.id}-${rowIndex}-${colIndex}`,
        row: rowIndex,
        col: colIndex,
        stepIndex,
        value,
        formattedValue: formatNumber(value),
        state,
        label: `${cellTitle} · ${copy.value.detailStep} ${stepIndex + 1}/${totalSteps} · ${copy.value.currentValue} ${formatNumber(value)}`,
      }
    }),
  )
})
const detailAutoplayActive = computed(() =>
  showDetails.value &&
  isDetailPlaying.value &&
  status.value === 'ready' &&
  !reducedMotion.value &&
  detailStepCount.value > 1,
)
const pipelineSteps = computed<CnnPipelineStep[]>(() =>
  layers.value.map((layer) => ({
    id: `pipeline-${layer.id}`,
    index: layer.index,
    name: layer.name,
    kind: layer.kind,
    shapeText: layer.outputShape.join('×'),
    parameterText: layer.parameterCount > 0 ? `${layer.parameterCount} ${copy.value.params}` : copy.value.noParams,
    state: layer.index < selectedLayerIndex.value ? 'done' : layer.index === selectedLayerIndex.value ? 'current' : 'pending',
  })),
)
const pipelineProgress = computed(() => {
  if (layers.value.length <= 1) return layers.value.length ? 1 : 0
  return selectedLayerIndex.value / (layers.value.length - 1)
})
const currentPipelineLabel = computed(() => {
  const layer = selectedLayer.value
  if (!layer) return copy.value.fallback
  return `${layer.name} · ${layer.kind} · ${layer.outputShape.join('×')}`
})
const forwardStorySteps = computed<CnnForwardStoryStep[]>(() =>
  layers.value.map((layer) => {
    const node = forwardStoryNode(layer)
    const state = layer.index < selectedLayerIndex.value ? 'done' : layer.index === selectedLayerIndex.value ? 'current' : 'pending'
    return {
      id: `story-${layer.id}`,
      index: layer.index,
      title: `${layer.name} · ${layer.kind}`,
      kind: layer.kind,
      operator: overviewLayerRecipe(layer),
      body: node ? layerRoleDescription(layer, node) : copy.value.fallback,
      inputText: formatShape(layer.inputShape),
      outputText: formatShape(layer.outputShape),
      valueLabel: forwardStoryValueLabel(layer),
      value: node ? forwardStoryValue(layer, node) : copy.value.fallback,
      state,
      stateLabel: forwardStoryStateLabel(state),
    }
  }),
)
const currentForwardStoryStep = computed(() => forwardStorySteps.value.find((step) => step.state === 'current'))
const overviewInteractionHint = computed(() => {
  const focusedWindow = activeOverviewWindow.value
  if (focusedWindow) {
    return {
      eyebrow: localized(loc('局部联动', 'Local lens')),
      title: overviewWindowTitle(focusedWindow),
      body: overviewWindowDescription(focusedWindow),
    }
  }

  if (!spatialBridge.value) return undefined

  return {
    eyebrow: localized(loc('局部联动', 'Local lens')),
    title: localized(loc('橙色框追踪输入窗口，黑色框追踪输出 cell', 'Orange frames trace input windows; black frames trace output cells')),
    body: localized(
      loc(
        '点击概览中的橙色 source window，会把对应输入 channel 的 patch × kernel 分解卡片提到前面；点击黑色 output cell 会回到当前输出位置。',
        'Click an orange source window in the overview to bring that input channel patch x kernel card forward; click the black output cell to refocus the current output position.',
      ),
    ),
  }
})
const selectedOverviewNodeKey = computed(() => overviewNodeKey(selectedLayerIndex.value, selectedNodeIndex.value))
function overviewNodeFromFocus(focus: CnnOverviewNodeFocus) {
  return layers.value[focus.layerIndex]?.nodes.find((node) => node.index === focus.nodeIndex)
}

const activeOverviewNodeFocus = computed<CnnOverviewNodeFocus>(() => {
  const focus = focusedOverviewNode.value
  if (focus && overviewNodeFromFocus(focus)) return focus
  return {
    layerIndex: selectedLayerIndex.value,
    nodeIndex: selectedNodeIndex.value,
  }
})
const activeOverviewNodeKey = computed(() => overviewNodeKey(activeOverviewNodeFocus.value.layerIndex, activeOverviewNodeFocus.value.nodeIndex))
const activeOverviewNode = computed(() => overviewNodeFromFocus(activeOverviewNodeFocus.value))
const overviewTraceLinks = computed(() => {
  const focus = activeOverviewNodeFocus.value
  const current = activeOverviewNode.value
  const backward: CnnLinkSnapshot[] = []
  const forward: CnnLinkSnapshot[] = []
  if (!current) return { backward, forward }

  let backwardNode: CnnNodeSnapshot | undefined = current
  const backwardSeen = new Set<string>()
  while (backwardNode && backwardNode.layerIndex > 0) {
    const link = preferredTraceInputLink(backwardNode, focus)
    if (!link) break
    const key = overviewEdgeKey(link.sourceLayerIndex, link.sourceNodeIndex, link.targetLayerIndex, link.targetNodeIndex)
    if (backwardSeen.has(key)) break
    backwardSeen.add(key)
    backward.unshift(link)
    backwardNode = layers.value[link.sourceLayerIndex]?.nodes.find((node) => node.index === link.sourceNodeIndex)
  }

  let forwardNode: CnnNodeSnapshot | undefined = current
  const forwardSeen = new Set<string>()
  while (forwardNode && forwardNode.layerIndex < layers.value.length - 1) {
    const link = preferredTraceOutputLink(forwardNode, focus)
    if (!link) break
    const key = overviewEdgeKey(link.sourceLayerIndex, link.sourceNodeIndex, link.targetLayerIndex, link.targetNodeIndex)
    if (forwardSeen.has(key)) break
    forwardSeen.add(key)
    forward.push(link)
    forwardNode = layers.value[link.targetLayerIndex]?.nodes.find((node) => node.index === link.targetNodeIndex)
  }

  return { backward, forward }
})
const overviewTraceNodeKeys = computed(() => {
  const keys = new Set<string>([activeOverviewNodeKey.value])
  for (const link of overviewTraceLinks.value.backward) {
    keys.add(overviewNodeKey(link.sourceLayerIndex, link.sourceNodeIndex))
    keys.add(overviewNodeKey(link.targetLayerIndex, link.targetNodeIndex))
  }
  for (const link of overviewTraceLinks.value.forward) {
    keys.add(overviewNodeKey(link.sourceLayerIndex, link.sourceNodeIndex))
    keys.add(overviewNodeKey(link.targetLayerIndex, link.targetNodeIndex))
  }
  return keys
})
const overviewTraceBackwardEdgeKeys = computed(() => new Set(overviewTraceLinks.value.backward.map((link) => overviewEdgeKey(link.sourceLayerIndex, link.sourceNodeIndex, link.targetLayerIndex, link.targetNodeIndex))))
const overviewTraceForwardEdgeKeys = computed(() => new Set(overviewTraceLinks.value.forward.map((link) => overviewEdgeKey(link.sourceLayerIndex, link.sourceNodeIndex, link.targetLayerIndex, link.targetNodeIndex))))
const relatedOverviewNodeKeys = computed(() => {
  const focus = activeOverviewNodeFocus.value
  const related = new Set<string>(overviewTraceNodeKeys.value)
  const node = activeOverviewNode.value
  if (!node) return related

  for (const link of node.inputLinks) {
    related.add(overviewNodeKey(link.sourceLayerIndex, link.sourceNodeIndex))
  }

  for (const layer of layers.value) {
    for (const target of layer.nodes) {
      if (target.inputLinks.some((link) => link.sourceLayerIndex === focus.layerIndex && link.sourceNodeIndex === focus.nodeIndex)) {
        related.add(overviewNodeKey(layer.index, target.index))
      }
    }
  }

  return related
})
const overviewTraceSummary = computed<CnnOverviewTraceSummary | undefined>(() => {
  const focus = activeOverviewNodeFocus.value
  const currentLayer = layers.value[focus.layerIndex]
  const currentNode = activeOverviewNode.value
  if (!currentLayer || !currentNode) return undefined

  const orderedNodes: Array<{ layerIndex: number; nodeIndex: number; tone: CnnOverviewTraceStep['tone'] }> = []
  for (const link of overviewTraceLinks.value.backward) {
    orderedNodes.push({ layerIndex: link.sourceLayerIndex, nodeIndex: link.sourceNodeIndex, tone: 'input' })
  }
  orderedNodes.push({ layerIndex: focus.layerIndex, nodeIndex: focus.nodeIndex, tone: 'current' })
  for (const link of overviewTraceLinks.value.forward) {
    orderedNodes.push({ layerIndex: link.targetLayerIndex, nodeIndex: link.targetNodeIndex, tone: 'output' })
  }

  const deduped = orderedNodes.filter((step, index, steps) => index === 0 || overviewNodeKey(step.layerIndex, step.nodeIndex) !== overviewNodeKey(steps[index - 1].layerIndex, steps[index - 1].nodeIndex))
  const steps = deduped.map<CnnOverviewTraceStep>((step) => {
    const layer = layers.value[step.layerIndex]
    const node = layer?.nodes.find((item) => item.index === step.nodeIndex)
    return {
      id: overviewNodeKey(step.layerIndex, step.nodeIndex),
      label: `${layer?.name ?? `layer ${step.layerIndex}`}[${node?.realIndex ?? step.nodeIndex}]`,
      detail: `${layer?.kind ?? ''} · ${formatShape(layer?.outputShape ?? [])}`,
      layerIndex: step.layerIndex,
      nodeIndex: step.nodeIndex,
      tone: step.tone,
    }
  })

  return {
    title: `${copy.value.overviewTraceTitle} · ${currentLayer.name}[${currentNode.realIndex ?? currentNode.index}]`,
    body: copy.value.overviewTraceHint,
    inputCount: overviewTraceLinks.value.backward.length,
    outputCount: overviewTraceLinks.value.forward.length,
    steps,
  }
})
const overviewEdges = computed(() => {
  const edges: CnnOverviewEdge[] = []

  for (const layer of layers.value.slice(1)) {
    const previousLayer = layers.value[layer.index - 1]
    if (!previousLayer) continue
    const sourceNodes = visibleNodes(previousLayer)
    const targetNodes = visibleNodes(layer)
    const maxEdgesPerLayer = layer.kind === 'conv' ? 18 : 14
    let edgeCount = 0

    for (const target of targetNodes) {
      const links = target.inputLinks.length
        ? target.inputLinks.filter((link) => sourceNodes.some((source) => source.index === link.sourceNodeIndex))
        : sourceNodes.map((source) => ({
            sourceLayerIndex: previousLayer.index,
            sourceNodeIndex: source.index,
            targetLayerIndex: layer.index,
            targetNodeIndex: target.index,
          }))

      for (const link of links) {
        const sourceDisplayIndex = sourceNodes.findIndex((node) => node.index === link.sourceNodeIndex)
        const targetDisplayIndex = targetNodes.findIndex((node) => node.index === target.index)
        if (sourceDisplayIndex < 0 || targetDisplayIndex < 0) continue
        if (edgeCount >= maxEdgesPerLayer) break
        const sourceKey = overviewNodeKey(previousLayer.index, link.sourceNodeIndex)
        const targetKey = overviewNodeKey(layer.index, target.index)
        const edgeKey = overviewEdgeKey(previousLayer.index, link.sourceNodeIndex, layer.index, target.index)
        const incoming = targetKey === activeOverviewNodeKey.value
        const outgoing = sourceKey === activeOverviewNodeKey.value
        const traceBackward = overviewTraceBackwardEdgeKeys.value.has(edgeKey)
        const traceForward = overviewTraceForwardEdgeKeys.value.has(edgeKey)
        const sourceAnchor = overviewNodeAnchor(previousLayer, sourceDisplayIndex, sourceNodes.length, 'out')
        const targetAnchor = overviewNodeAnchor(layer, targetDisplayIndex, targetNodes.length, 'in')
        edges.push({
          id: `${previousLayer.id}-${link.sourceNodeIndex}-${layer.id}-${target.index}-${edgeCount}`,
          key: edgeKey,
          x1: sourceAnchor.x,
          y1: sourceAnchor.y,
          x2: targetAnchor.x,
          y2: targetAnchor.y,
          selected: incoming || outgoing || traceBackward || traceForward,
          incoming,
          outgoing,
          traceBackward,
          traceForward,
        })
        edgeCount += 1
      }
    }
  }

  return edges
})
const overviewFlowPackets = computed<CnnOverviewFlowPacket[]>(() =>
  overviewEdges.value
    .filter((edge) => edge.selected)
    .slice(0, 18)
    .map((edge) => {
      const midX = (edge.x1 + edge.x2) / 2
      const midY = (edge.y1 + edge.y2) / 2
      const bend = edge.outgoing || edge.traceForward ? 16 : -16
      return {
        id: `packet-${edge.id}`,
        path: `M ${edge.x1} ${edge.y1} Q ${midX} ${midY + bend} ${edge.x2} ${edge.y2}`,
        x: midX,
        y: midY + bend / 2,
        tone: edge.incoming || edge.outgoing ? (edge.outgoing ? 'outgoing' : 'incoming') : 'trace',
      }
    }),
)
const svgWidth = computed(() => Math.max(1320, layers.value.length * 118 + 190))
const nodeLength = 24
const denseOverviewBarWidth = 62
const denseOverviewBarHeight = 4
const heatmapGridSize = 5
const heatmapCellSize = nodeLength / heatmapGridSize
const overviewLegendX = 112
const overviewLegendY = -12
const overviewLegendWidth = 278
const overviewLegendHeight = 9

const formulaMarkdown = computed(() => {
  const detail = selectedDetail.value
  if (!detail) return ''

  if (detail.kind === 'conv') {
    return `$$${detail.formula}$$

${copy.value.weightedSum}: $${formatNumber(detail.weightedSum)}$
${copy.value.reluValue}: $${formatNumber(detail.reluValue)}$`
  }

  if (detail.kind === 'relu') {
    return `$$${detail.formula}$$

$z=${formatNumber(detail.weightedSum)} \\Rightarrow a=${formatNumber(detail.reluValue)}$`
  }

  if (detail.kind === 'pool') {
    return `$$${detail.formula}$$

${copy.value.maxValue}: $${formatNumber(detail.poolMax)}$`
  }

  if (detail.kind === 'flatten') {
    return `$$${detail.formula}$$

$(${detail.flattenSource?.channelIndex}, ${detail.flattenSource?.row}, ${detail.flattenSource?.col}) \\rightarrow v_{${detail.flattenIndex}}$`
  }

  if (detail.kind === 'dense') {
    return `$$${detail.formula}$$

${copy.value.prediction}: **${topPrediction.value?.label ?? ''}**`
  }

  return `$$${detail.formula}$$`
})

const formulaTraceTerms = computed<CnnFormulaTraceTerm[]>(() => {
  const detail = selectedDetail.value
  if (!detail) return []

  if (detail.kind === 'input') {
    const value = selectedMatrix.value?.[selectedRow.value]?.[selectedCol.value] ?? 0
    const raw = normalizedToRawPixel(value)
    return [
      {
        id: 'formula-input-normalize',
        label: copy.value.normalizedValue,
        formula: 'pixel / 255',
        value: `${raw}/255 → ${formatNumber(value)}`,
        body: localized(
          loc(
            `当前 channel ${selectedNodeIndex.value} 的原始像素会除以 255，成为输入张量里的归一化值。`,
            `The raw pixel in channel ${selectedNodeIndex.value} is divided by 255 to become the normalized tensor value.`,
          ),
        ),
        target: 'input-normalize',
        tone: 'activation',
      },
    ]
  }

  if (detail.kind === 'conv') {
    const term = focusedConvMathTerm.value
    const channelLedger = convLedgerItems.value.find((item) => item.kind === 'channel')
    const biasLedger = convLedgerItems.value.find((item) => item.kind === 'bias')
    const weightedLedger = convLedgerItems.value.find((item) => item.kind === 'weighted')
    const reluLedger = convLedgerItems.value.find((item) => item.kind === 'relu')
    const traceTerms: CnnFormulaTraceTerm[] = []

    if (term) {
      traceTerms.push({
        id: 'formula-conv-product',
        label: `${copy.value.patch} × ${copy.value.kernel}`,
        formula: 'x · k',
        value: `${formatNumber(term.patchValue)} × ${formatNumber(term.kernelValue)} = ${formatNumber(term.productValue)}`,
        body: localized(
          loc(
            `定位到 channel ${term.channelIndex} 的一个乘法项；它会进入该 channel 的 product sum。`,
            `This locates one multiplication term in channel ${term.channelIndex}; it feeds that channel product sum.`,
          ),
        ),
        target: 'conv-product',
        tone: valueTone(term.productValue),
      })
    }

    if (channelLedger) {
      traceTerms.push({
        id: 'formula-conv-channel-sum',
        label: copy.value.channelSum,
        formula: 'Σ(x · k)',
        value: channelLedger.formattedValue,
        body: convLedgerItemDescription(channelLedger),
        target: 'conv-ledger',
        tone: channelLedger.tone,
        ledgerId: channelLedger.id,
      })
    }

    if (biasLedger) {
      traceTerms.push({
        id: 'formula-conv-bias',
        label: copy.value.bias,
        formula: '+ b',
        value: biasLedger.formattedValue,
        body: convLedgerItemDescription(biasLedger),
        target: 'conv-ledger',
        tone: biasLedger.tone,
        ledgerId: biasLedger.id,
      })
    }

    if (weightedLedger) {
      traceTerms.push({
        id: 'formula-conv-weighted',
        label: copy.value.beforeRelu,
        formula: 'z',
        value: weightedLedger.formattedValue,
        body: convLedgerItemDescription(weightedLedger),
        target: 'conv-ledger',
        tone: weightedLedger.tone,
        ledgerId: weightedLedger.id,
      })
    }

    if (reluLedger) {
      traceTerms.push({
        id: 'formula-conv-relu',
        label: copy.value.reluValue,
        formula: 'max(0,z)',
        value: reluLedger.formattedValue,
        body: convLedgerItemDescription(reluLedger),
        target: 'conv-ledger',
        tone: reluLedger.tone,
        ledgerId: reluLedger.id,
      })
    }

    return traceTerms
  }

  if (detail.kind === 'relu') {
    return [
      {
        id: 'formula-relu-zero',
        label: copy.value.zeroThreshold,
        formula: '0',
        value: '0',
        body: localized(loc('ReLU 总是把 0 作为候选值参与比较。', 'ReLU always includes 0 as one comparison candidate.')),
        target: 'relu-term',
        tone: 'neutral',
        reluTerm: 'zero',
      },
      {
        id: 'formula-relu-input',
        label: copy.value.reluSelectedInput,
        formula: 'z',
        value: formatNumber(detail.weightedSum),
        body: localized(loc('上一层传来的 z 如果为正，就会原样通过。', 'If the incoming z is positive, it passes through unchanged.')),
        target: 'relu-term',
        tone: valueTone(detail.weightedSum ?? 0),
        reluTerm: 'input',
      },
      {
        id: 'formula-relu-output',
        label: copy.value.reluValue,
        formula: 'a=max(0,z)',
        value: formatNumber(detail.reluValue),
        body: localized(loc('输出 a 是 0 和 z 中较大的那个。', 'Output a is whichever is larger: 0 or z.')),
        target: 'relu-term',
        tone: valueTone(detail.reluValue ?? 0),
        reluTerm: 'output',
      },
    ]
  }

  if (detail.kind === 'pool') {
    const winner = activePoolOperatorCell.value
    return [
      {
        id: 'formula-pool-window',
        label: copy.value.poolWindow,
        formula: '2×2 window',
        value: `${copy.value.row} ${selectedRow.value * 2}, ${copy.value.col} ${selectedCol.value * 2}`,
        body: localized(
          loc(
            'MaxPool 只查看当前 2×2 输入窗口里的候选激活。',
            'MaxPool only inspects the candidate activations in the current 2x2 input window.',
          ),
        ),
        target: 'pool-window',
        tone: 'activation',
      },
      {
        id: 'formula-pool-winner',
        label: copy.value.poolWinner,
        formula: 'max(window)',
        value: formatNumber(detail.poolMax),
        body: localized(
          loc(
            `最大候选来自 row ${winner?.row ?? detail.poolMaxPosition?.row ?? 0}, col ${winner?.col ?? detail.poolMaxPosition?.col ?? 0}。`,
            `The winning candidate comes from row ${winner?.row ?? detail.poolMaxPosition?.row ?? 0}, col ${winner?.col ?? detail.poolMaxPosition?.col ?? 0}.`,
          ),
        ),
        target: 'pool-winner',
        tone: valueTone(detail.poolMax ?? 0),
      },
    ]
  }

  if (detail.kind === 'flatten') {
    return flattenLedgerItems.value.map((item) => ({
      id: `formula-${item.id}`,
      label: item.label,
      formula: item.formula,
      value: item.formattedValue,
      body: item.description,
      target: 'flatten-ledger',
      tone: item.kind === 'index' ? 'activation' : 'neutral',
      ledgerId: item.id,
    }))
  }

  if (detail.kind === 'dense') {
    const sourceTerm = denseLedgerItems.value.find((item) => item.sourceIndex !== undefined)
    const biasTerm = denseLedgerItems.value.find((item) => item.kind === 'bias')
    const logitTerm = denseLedgerItems.value.find((item) => item.kind === 'logit')
    const activeRow = activeSoftmaxRow.value
    const terms: CnnFormulaTraceTerm[] = []

    if (sourceTerm) {
      terms.push({
        id: 'formula-dense-source-term',
        label: sourceTerm.label,
        formula: sourceTerm.formula,
        value: sourceTerm.formattedValue,
        body: sourceTerm.description,
        target: 'dense-ledger',
        tone: sourceTerm.kind === 'negative' ? 'negative' : 'positive',
        ledgerId: sourceTerm.id,
      })
    }

    if (biasTerm) {
      terms.push({
        id: 'formula-dense-bias',
        label: copy.value.bias,
        formula: '+ b',
        value: biasTerm.formattedValue,
        body: biasTerm.description,
        target: 'dense-ledger',
        tone: 'weight',
        ledgerId: biasTerm.id,
      })
    }

    if (logitTerm) {
      terms.push({
        id: 'formula-dense-logit',
        label: 'logit',
        formula: 'z',
        value: logitTerm.formattedValue,
        body: logitTerm.description,
        target: 'dense-ledger',
        tone: 'logit',
        ledgerId: logitTerm.id,
      })
    }

    if (activeRow) {
      terms.push({
        id: 'formula-softmax-active',
        label: copy.value.softmaxFraction,
        formula: 'exp(z_i) / Σ exp(z_j)',
        value: formatPercent(activeRow.probability),
        body: localized(
          loc(
            `${activeRow.label} 的 exp(logit) 占分母 ${formatPercent(activeRow.expShare)}，归一化后得到当前概率。`,
            `${activeRow.label}'s exp(logit) takes ${formatPercent(activeRow.expShare)} of the denominator, then normalizes to the current probability.`,
          ),
        ),
        target: 'softmax-term',
        tone: 'logit',
        scoreIndex: activeRow.classIndex,
      })
    }

    return terms
  }

  return []
})
const operationNarration = computed(() => {
  const kind = selectedDetail.value?.kind ?? selectedLayer.value?.kind ?? 'input'
  const narrations = localized(
    loc(
      {
        input: 'Input 层：把当前图片中心裁剪并缩放到 64×64×3，再把 RGB 像素归一化到 [0,1]，后续层只处理这些数值。',
        conv: `Conv 层：当前 filter 在输出 cell (${selectedRow.value}, ${selectedCol.value}) 对应的输入窗口上滑动；每个输入 channel 的 patch 与 kernel 逐格相乘，累加后再加 bias。`,
        relu: 'ReLU 层：读取上一层同一位置的卷积结果，把负值截断为 0，正值原样保留，让激活图突出“这个特征出现了多强”。',
        pool: `MaxPool 层：查看当前输出 cell 对应的 2×2 输入窗口，只把其中最大激活传到下一层，同时把空间尺寸缩小。`,
        flatten: 'Flatten 层：把上一层的 (channel,row,col) 三维位置按固定顺序展开成一维向量，方便后面的分类头做加权求和。',
        dense: 'Dense/Softmax 层：分类头把展开向量加权求和得到各类 logits，再用 softmax 归一化成概率；最高概率是当前预测，不等同于解释。',
      },
      {
        input: 'Input layer: center-crop and resize the current image to 64x64x3, then normalize RGB pixels to [0,1]; every later layer sees only these numbers.',
        conv: `Conv layer: the selected filter slides over the input window for output cell (${selectedRow.value}, ${selectedCol.value}); each input-channel patch is multiplied by its kernel, summed, then shifted by bias.`,
        relu: 'ReLU layer: read the previous value at the same position, clip negative values to 0, and keep positive values so the map emphasizes how strongly a feature appeared.',
        pool: 'MaxPool layer: inspect the 2x2 input window for the current output cell, pass forward only the largest activation, and reduce the spatial size.',
        flatten: 'Flatten layer: map a three-dimensional (channel,row,col) position into a fixed one-dimensional vector index for the classifier head.',
        dense: 'Dense/Softmax layer: the classifier head turns the vector into logits with weighted sums, then softmax normalizes them into probabilities; the top probability is a prediction, not an explanation.',
      },
    ),
  )

  return narrations[kind]
})

const layerFunctionGuide = computed<CnnLayerFunctionGuide | undefined>(() => {
  const kind = selectedDetail.value?.kind ?? selectedLayer.value?.kind
  if (!kind) return undefined

  const isLaterConv = kind === 'conv' && (selectedLayer.value?.index ?? 0) > 2
  const guides: Record<CnnLayerKindLabel, { chapterId: string; title: string; body: string }> = localized(
    loc(
      {
        input: {
          chapterId: 'image-volume',
          title: 'Input 层：图片先变成数值体',
          body: '演示 PNG 或上传图片会在浏览器本地中心裁剪、缩放到 64×64×3，并归一化成后续层能读取的 RGB 数值矩阵。',
        },
        conv: isLaterConv
          ? {
              chapterId: 'channels-feature-maps',
              title: 'Conv 层：多个 filter 生成 feature maps',
              body: '这一层不只做一次卷积；每个输出 channel 都有自己的 kernel bank 与 bias，生成一张独立的 feature map。',
            }
          : {
              chapterId: 'kernel-convolution',
              title: 'Conv 层：patch 与 kernel 做局部点乘',
              body: '当前输出 cell 来自一个局部输入窗口：逐 channel 做 patch×kernel，累加 bias 后再交给 ReLU。',
            },
        relu: {
          chapterId: 'kernel-convolution',
          title: 'ReLU 层：负值截断，正值保留',
          body: '它没有可训练参数，只把上一层的 z 逐格变成 max(0,z)，让激活图更突出“有响应”的位置。',
        },
        pool: {
          chapterId: 'pooling-classifier-head',
          title: 'MaxPool 层：保留局部最大激活',
          body: '当前 2×2 window 里只有最大值被复制到下一层；空间尺寸变小，但强响应可以继续传播。',
        },
        flatten: {
          chapterId: 'pooling-classifier-head',
          title: 'Flatten 层：把空间地址改写成向量地址',
          body: 'Flatten 不改数值，只把 (channel,row,col) 映射成一维 vector index，供 Dense 分类头读取。',
        },
        dense: {
          chapterId: 'pooling-classifier-head',
          title: 'Dense / Softmax：从表示变成类别概率',
          body: 'Dense 用 flatten 向量与权重做加权和得到 logits，Softmax 再把所有 logits 一起归一化为概率。',
        },
      },
      {
        input: {
          chapterId: 'image-volume',
          title: 'Input layer: the image becomes a volume',
          body: 'A demo PNG or uploaded image is center-cropped, resized to 64x64x3, and normalized locally in the browser into RGB matrices for later layers.',
        },
        conv: isLaterConv
          ? {
              chapterId: 'channels-feature-maps',
              title: 'Conv layer: many filters create feature maps',
              body: 'This layer does more than one convolution; each output channel owns a kernel bank and bias, producing its own feature map.',
            }
          : {
              chapterId: 'kernel-convolution',
              title: 'Conv layer: local patch-kernel dot products',
              body: 'The selected output cell comes from a local input window: each channel computes patch x kernel, then bias and ReLU complete the step.',
            },
        relu: {
          chapterId: 'kernel-convolution',
          title: 'ReLU layer: clip negatives, keep positives',
          body: 'It has no trainable parameters; each z becomes max(0,z), making the activation map emphasize where a feature responded.',
        },
        pool: {
          chapterId: 'pooling-classifier-head',
          title: 'MaxPool layer: keep the local maximum',
          body: 'Only the largest value in the current 2x2 window is copied forward; spatial size shrinks while strong responses keep flowing.',
        },
        flatten: {
          chapterId: 'pooling-classifier-head',
          title: 'Flatten layer: rewrite spatial addresses as vector addresses',
          body: 'Flatten does not change values; it maps (channel,row,col) into one vector index for the Dense classifier head.',
        },
        dense: {
          chapterId: 'pooling-classifier-head',
          title: 'Dense / Softmax: representation becomes class probability',
          body: 'Dense turns the flatten vector into logits with weighted sums, then Softmax normalizes all logits together into probabilities.',
        },
      },
    ),
  )
  const guide = guides[kind]
  if (!guide) return undefined

  return {
    ...guide,
    route: `/learn/cnn-visualization/${guide.chapterId}`,
    isCurrentChapter: props.section.id === guide.chapterId,
  }
})
const propagationBridge = computed<CnnPropagationBridge | undefined>(() => {
  const layer = selectedLayer.value
  const node = selectedNode.value
  const detail = selectedDetail.value
  if (!layer || !node || !detail) return undefined

  const inputShape = formatShape(layer.inputShape)
  const outputShape = formatShape(layer.outputShape)
  const nodeLabel = `${node.layerName}[${node.index}]`
  const selectedCell = `(${selectedRow.value}, ${selectedCol.value})`
  const matrixValue = selectedMatrix.value?.[Math.min(selectedRow.value, rowMax.value)]?.[Math.min(selectedCol.value, colMax.value)]
  const formulaMarkdown = `$$${detail.formula}$$`
  const bridgeBase = {
    title: `${layer.name} · ${layer.kind}`,
    inputLabel: copy.value.inputSide,
    outputLabel: nodeLabel,
    inputShape,
    outputShape,
    explanation: operationNarration.value,
    formulaMarkdown,
  }

  if (layer.kind === 'input') {
    return {
      ...bridgeBase,
      operator: localized(loc('中心裁剪 / 缩放 / 归一化', 'center crop / resize / normalize')),
      valueLabel: copy.value.currentValue,
      value: formatNumber(matrixValue),
      formulaMarkdown: '$$x_{r,c,ch}=\\frac{pixel_{r,c,ch}}{255}$$',
      chips: [
        { label: copy.value.channel, value: `${node.index}` },
        { label: copy.value.selectedCell, value: selectedCell },
        { label: copy.value.outputShapeLabel, value: outputShape },
      ],
    }
  }

  if (detail.kind === 'conv') {
    return {
      ...bridgeBase,
      operator: localized(loc('patch × kernel + bias', 'patch x kernel + bias')),
      valueLabel: copy.value.beforeRelu,
      value: formatNumber(detail.weightedSum),
      chips: [
        { label: copy.value.channel, value: `${node.index}` },
        { label: copy.value.selectedCell, value: selectedCell },
        { label: copy.value.bias, value: formatNumber(detail.bias) },
        { label: copy.value.reluValue, value: formatNumber(detail.reluValue) },
      ],
    }
  }

  if (detail.kind === 'relu') {
    return {
      ...bridgeBase,
      operator: 'max(0, z)',
      valueLabel: copy.value.reluValue,
      value: formatNumber(detail.reluValue),
      chips: [
        { label: copy.value.selectedCell, value: selectedCell },
        { label: copy.value.beforeRelu, value: formatNumber(detail.weightedSum) },
        { label: copy.value.reluValue, value: formatNumber(detail.reluValue) },
        { label: copy.value.params, value: copy.value.noParams },
      ],
    }
  }

  if (detail.kind === 'pool') {
    return {
      ...bridgeBase,
      operator: 'max(2×2)',
      valueLabel: copy.value.maxValue,
      value: formatNumber(detail.poolMax),
      chips: [
        { label: copy.value.poolWindow, value: `${selectedRow.value * 2}, ${selectedCol.value * 2}` },
        { label: copy.value.poolWinner, value: `(${detail.poolMaxPosition?.row ?? 0}, ${detail.poolMaxPosition?.col ?? 0})` },
        { label: copy.value.outputCell, value: selectedCell },
        { label: copy.value.params, value: copy.value.noParams },
      ],
    }
  }

  if (detail.kind === 'flatten') {
    return {
      ...bridgeBase,
      operator: '(channel,row,col) → vector',
      valueLabel: copy.value.vectorIndex,
      value: `${detail.flattenIndex ?? node.realIndex ?? node.index}`,
      chips: [
        { label: copy.value.sourceMap, value: `${detail.flattenSource?.channelIndex ?? 0}` },
        { label: copy.value.selectedCell, value: `(${detail.flattenSource?.row ?? 0}, ${detail.flattenSource?.col ?? 0})` },
        { label: copy.value.currentValue, value: formatNumber(numberFromOutput(node.output)) },
        { label: copy.value.params, value: copy.value.noParams },
      ],
    }
  }

  if (detail.kind === 'dense') {
    const score = scores.value[node.index]
    const expScore = detail.expScores?.[node.index]
    return {
      ...bridgeBase,
      operator: 'dense logits → softmax',
      valueLabel: copy.value.probability,
      value: formatPercent(score?.probability ?? detail.probabilities?.[node.index] ?? 0),
      chips: [
        { label: copy.value.classTerm, value: score?.label ?? `${node.index}` },
        { label: 'logit', value: formatNumber(score?.logit ?? node.logit) },
        { label: copy.value.stabilizedExp, value: formatNumber(expScore) },
        { label: copy.value.prediction, value: topPrediction.value?.label ?? copy.value.fallback },
      ],
    }
  }

  return {
    ...bridgeBase,
    operator: layer.kind,
    valueLabel: copy.value.currentValue,
    value: formatNumber(numberFromOutput(node.output)),
    chips: [
      { label: copy.value.selectedNodeLabel, value: `${node.index}` },
      { label: copy.value.outputShapeLabel, value: outputShape },
    ],
  }
})

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  sampleImages.value = createSampleImages()
  const firstSample = sampleImages.value[0]
  void runInference(firstSample?.url ?? createDefaultInputImage(), firstSample?.label ?? copy.value.defaultImage)
})

onBeforeUnmount(() => {
  stopPlayback()
  stopDetailPlayback()
  revokeUserObjectUrl()
})

watch(isPlaying, (playing) => {
  stopPlayback()
  if (!playing || reducedMotion.value) return
  startPlaybackTimer()
})

watch(detailAutoplayActive, (active) => {
  stopDetailPlayback()
  if (!active) return
  startDetailPlaybackTimer()
})

watch([showDetails, reducedMotion], () => {
  if (!showDetails.value || reducedMotion.value) isDetailPlaying.value = false
})

watch([layers, colorMode, scaleMode], () => {
  overviewThumbnailCache.clear()
})

watch([rowMax, colMax], () => {
  selectedRow.value = Math.min(selectedRow.value, rowMax.value)
  selectedCol.value = Math.min(selectedCol.value, colMax.value)
})

watch([hyperInputSize, hyperPadding, hyperKernelSize, hyperStride, hyperOutputRow, hyperOutputCol], () => {
  clampHyperparameterControls()
})

async function runInference(imageUrl: string, imageName: string) {
  stopPlayback()
  stopDetailPlayback()
  isPlaying.value = false
  isDetailPlaying.value = false
  status.value = 'loading'
  statusMessage.value = ''
  fileError.value = ''
  expandedOverviewLayerIndex.value = undefined

  try {
    const result = await runTinyVggForwardPass(imageUrl)
    overviewThumbnailCache.clear()
    layers.value = result.layers
    scores.value = result.scores
    topPrediction.value = result.topPrediction
    selectedImageUrl.value = imageUrl
    selectedImageName.value = imageName
    status.value = 'ready'
    selectLayer(preferredLayerIndexForSection(), preferredNodeIndexForSection())
  } catch (error) {
    status.value = 'error'
    statusMessage.value = error instanceof Error ? error.message : copy.value.fallback
  }
}

function preferredLayerIndexForSection(sectionId = props.section.id) {
  if (sectionId === 'image-volume') return 0
  if (sectionId === 'kernel-convolution') {
    const firstConvIndex = layers.value.findIndex((layer) => layer.kind === 'conv')
    return firstConvIndex >= 0 ? firstConvIndex : 0
  }
  if (sectionId === 'padding-stride-shape') {
    const firstPoolIndex = layers.value.findIndex((layer) => layer.kind === 'pool')
    return firstPoolIndex >= 0 ? firstPoolIndex : 0
  }
  if (sectionId === 'channels-feature-maps') {
    const laterConvIndex = layers.value.findIndex((layer) => layer.kind === 'conv' && layer.index > 2)
    if (laterConvIndex >= 0) return laterConvIndex
    const firstConvIndex = layers.value.findIndex((layer) => layer.kind === 'conv')
    return firstConvIndex >= 0 ? firstConvIndex : 0
  }
  if (sectionId === 'pooling-classifier-head') {
    const firstPoolIndex = layers.value.findIndex((layer) => layer.kind === 'pool')
    return firstPoolIndex >= 0 ? firstPoolIndex : 0
  }
  if (sectionId === 'transfer-learning-review') {
    const denseIndex = layers.value.findIndex((layer) => layer.kind === 'dense')
    return denseIndex >= 0 ? denseIndex : 0
  }
  return 0
}

function preferredNodeIndexForSection(sectionId = props.section.id) {
  if (sectionId === 'transfer-learning-review') {
    const topIndex = scores.value.findIndex((score) => score.id === topPrediction.value?.id)
    return topIndex >= 0 ? topIndex : 0
  }
  return 0
}

function onUploadClick() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!acceptedImageTypes.has(file.type)) {
    fileError.value = copy.value.invalidType
    return
  }

  if (file.size > maxUploadBytes) {
    fileError.value = copy.value.invalidSize
    return
  }

  revokeUserObjectUrl()
  const objectUrl = URL.createObjectURL(file)
  userObjectUrl.value = objectUrl
  void runInference(objectUrl, file.name)
}

function selectLayer(layerIndex: number, nodeIndex = 0) {
  const layer = layers.value[layerIndex]
  if (!layer) return
  convAnimatorAnchor.value = undefined
  focusedOverviewWindow.value = undefined
  focusedOverviewNode.value = undefined
  convMathFocus.value = undefined
  reluFocusedTerm.value = undefined
  poolFocusedCell.value = undefined
  highlightedSoftmaxIndex.value = undefined
  focusedDenseSourceIndex.value = undefined
  selectedLayerIndex.value = layerIndex
  selectedNodeIndex.value = Math.min(Math.max(0, nodeIndex), Math.max(0, layer.nodes.length - 1))

  if (layer.outputShape.length === 3) {
    selectedRow.value = Math.floor((layer.outputShape[0] ?? 1) / 2)
    selectedCol.value = Math.floor((layer.outputShape[1] ?? 1) / 2)
  } else {
    selectedRow.value = 0
    selectedCol.value = 0
  }
}

function selectScore(score: CnnClassScore) {
  const denseLayerIndex = layers.value.findIndex((layer) => layer.kind === 'dense')
  const scoreIndex = scores.value.findIndex((item) => item.id === score.id)
  if (denseLayerIndex >= 0 && scoreIndex >= 0) {
    selectLayer(denseLayerIndex, scoreIndex)
    focusSoftmaxReadout(score, scoreIndex)
  }
}

function focusSoftmaxClass(classIndex: number) {
  highlightedSoftmaxIndex.value = Math.min(Math.max(0, classIndex), Math.max(0, scores.value.length - 1))
  const score = scores.value[highlightedSoftmaxIndex.value]
  if (score) focusSoftmaxReadout(score, highlightedSoftmaxIndex.value)
}

function focusSoftmaxCompetitionRow(row: CnnSoftmaxCompetitionRow) {
  highlightedSoftmaxIndex.value = row.classIndex
  setHoverReadout({
    eyebrow: copy.value.softmaxRankingTitle,
    title: `#${row.rank} ${row.label}`,
    body: row.narration,
    value: `${copy.value.probability}: ${formatPercent(row.probability)} · ${copy.value.denominatorShare} ${formatPercent(row.expShare)}`,
    tone: row.isTop ? 'positive' : 'logit',
  })
}

function selectSoftmaxCompetitionRow(row: CnnSoftmaxCompetitionRow) {
  selectLayer(selectedLayerIndex.value, row.classIndex)
  focusSoftmaxCompetitionRow(row)
}

function clearSoftmaxFocus() {
  highlightedSoftmaxIndex.value = undefined
  clearHoverReadout()
}

function clearDenseSourceFocus() {
  focusedDenseSourceIndex.value = undefined
  clearHoverReadout()
}

function focusScore(score: CnnClassScore) {
  const scoreIndex = scores.value.findIndex((item) => item.id === score.id)
  if (scoreIndex >= 0) focusSoftmaxClass(scoreIndex)
}

function selectPipelineStep(layerIndex: number) {
  clearHoverReadout()
  selectLayer(layerIndex, 0)
}

function forwardStoryStateLabel(state: CnnForwardStoryStep['state']) {
  if (state === 'done') return copy.value.forwardStoryboardDone
  if (state === 'current') return copy.value.forwardStoryboardCurrent
  return copy.value.forwardStoryboardNext
}

function forwardStoryNode(layer: CnnLayerSnapshot) {
  if (layer.index === selectedLayerIndex.value && selectedNode.value) return selectedNode.value
  if (layer.kind === 'dense') {
    const topScoreIndex = scores.value.findIndex((score) => score.id === topPrediction.value?.id)
    return layer.nodes[topScoreIndex >= 0 ? topScoreIndex : 0]
  }
  return layer.nodes[0]
}

function forwardStoryValueLabel(layer: CnnLayerSnapshot) {
  if (layer.kind === 'dense') return copy.value.probability
  if (layer.kind === 'flatten') return copy.value.vectorIndex
  return copy.value.currentValue
}

function forwardStoryNumericValue(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (layer.kind === 'dense') return scores.value[node.index]?.probability ?? numberFromOutput(node.output)
  if (isMatrix(node.output)) {
    const row = Math.min(Math.max(0, selectedRow.value), Math.max(0, node.output.length - 1))
    const col = Math.min(Math.max(0, selectedCol.value), Math.max(0, (node.output[0]?.length ?? 1) - 1))
    return node.output[row]?.[col] ?? 0
  }
  return numberFromOutput(node.output)
}

function forwardStoryValue(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (layer.kind === 'dense') return formatPercent(forwardStoryNumericValue(layer, node))
  if (layer.kind === 'flatten') return `v${node.realIndex ?? node.index} = ${formatNumber(numberFromOutput(node.output))}`
  return formatNumber(forwardStoryNumericValue(layer, node))
}

function focusForwardStoryStep(step: CnnForwardStoryStep) {
  const layer = layers.value[step.index]
  const node = layer ? forwardStoryNode(layer) : undefined
  const liveState = layer
    ? layer.index < selectedLayerIndex.value
      ? 'done'
      : layer.index === selectedLayerIndex.value
        ? 'current'
        : 'pending'
    : step.state
  setHoverReadout({
    eyebrow: copy.value.forwardStoryboard,
    title: step.title,
    body: step.body,
    value: `${forwardStoryStateLabel(liveState)} · ${step.valueLabel}: ${step.value}`,
    tone: layer?.kind === 'dense' ? 'logit' : valueTone(node && layer ? forwardStoryNumericValue(layer, node) : 0),
  })
}

function selectForwardStoryStep(step: CnnForwardStoryStep) {
  const layer = layers.value[step.index]
  if (!layer) return
  const node = forwardStoryNode(layer)
  selectLayer(step.index, node?.index ?? 0)
  focusForwardStoryStep(step)
}

function selectConnectionNode(connection: CnnConnectionSummary) {
  selectLayer(connection.layerIndex, connection.nodeIndex)
}

function selectHyperOutputCell(row: number, col: number) {
  hyperOutputRow.value = row
  hyperOutputCol.value = col
  setHoverReadout({
    eyebrow: copy.value.outputGrid,
    title: `${copy.value.outputCell} (${row}, ${col})`,
    body: hyperWindowNarration.value,
    value: `${copy.value.selectedWindowStart}: (${hyperparameterSnapshot.value.selectedStartRow}, ${hyperparameterSnapshot.value.selectedStartCol})`,
    tone: 'activation',
  })
}

function setHoverReadout(readout: CnnHoverReadout) {
  hoverReadout.value = readout
}

function clearHoverReadout() {
  hoverReadout.value = undefined
}

function setFormulaTraceReadout(term: CnnFormulaTraceTerm) {
  setHoverReadout({
    eyebrow: copy.value.formulaTrace,
    title: term.label,
    body: term.body,
    value: `${term.formula} = ${term.value}`,
    tone: term.tone,
  })
}

function focusFormulaTraceTerm(term: CnnFormulaTraceTerm) {
  if (term.target === 'input-normalize') {
    setFormulaTraceReadout(term)
    return
  }

  if (term.target === 'conv-product') {
    const contribution = activeConvContribution.value
    const mathTerm = focusedConvMathTerm.value
    if (contribution && mathTerm) {
      focusConvMathCell(contribution, mathTerm.row, mathTerm.col)
      return
    }
  }

  if (term.target === 'conv-ledger') {
    const item = convLedgerItems.value.find((ledgerItem) => ledgerItem.id === term.ledgerId)
    if (item) {
      focusConvLedgerItem(item)
      return
    }
  }

  if (term.target === 'relu-term' && term.reluTerm) {
    focusReluOperatorTerm(term.reluTerm)
    return
  }

  if (term.target === 'pool-window') {
    const cell = poolOperatorCells.value.flat()[0]
    if (cell) {
      focusPoolOperatorCell(cell)
      return
    }
  }

  if (term.target === 'pool-winner') {
    const winner = poolOperatorCells.value.flat().find((cell) => cell.isMax) ?? activePoolOperatorCell.value
    if (winner) {
      focusPoolOperatorCell(winner)
      return
    }
  }

  if (term.target === 'flatten-ledger') {
    const item = flattenLedgerItems.value.find((ledgerItem) => ledgerItem.id === term.ledgerId)
    if (item) {
      focusFlattenLedgerItem(item)
      return
    }
  }

  if (term.target === 'dense-ledger') {
    const item = denseLedgerItems.value.find((ledgerItem) => ledgerItem.id === term.ledgerId)
    if (item) {
      focusDenseLedgerItem(item)
      return
    }
  }

  if (term.target === 'softmax-term' && term.scoreIndex !== undefined) {
    focusSoftmaxClass(term.scoreIndex)
    return
  }

  setFormulaTraceReadout(term)
}

function clearFormulaTraceFocus() {
  reluFocusedTerm.value = undefined
  poolFocusedCell.value = undefined
  highlightedSoftmaxIndex.value = undefined
  focusedDenseSourceIndex.value = undefined
  clearHoverReadout()
}

function clearFocusedOverviewNode() {
  focusedOverviewNode.value = undefined
}

function clearOverviewNodeHover() {
  clearFocusedOverviewNode()
  clearHoverReadout()
}

function valueTone(value: number): CnnHoverReadout['tone'] {
  if (!Number.isFinite(value) || value === 0) return 'neutral'
  return value > 0 ? 'positive' : 'negative'
}

function ledgerTone(value: number): CnnConvLedgerItem['tone'] {
  if (!Number.isFinite(value) || value === 0) return 'neutral'
  return value > 0 ? 'positive' : 'negative'
}

function focusOverviewNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  focusedOverviewNode.value = {
    layerIndex: layer.index,
    nodeIndex: node.index,
  }

  const value = isMatrix(node.output)
    ? node.output[Math.min(selectedRow.value, node.output.length - 1)]?.[Math.min(selectedCol.value, (node.output[0]?.length ?? 1) - 1)]
    : numberFromOutput(node.output)

  setHoverReadout({
    eyebrow: copy.value.hoverLayerNode,
    title: `${layer.name}[${node.index}] · ${layer.kind}`,
    body: layerRoleDescription(layer, node),
    value: `${copy.value.selectedCell}: ${formatNumber(value)}`,
    tone: layer.kind === 'dense' ? 'logit' : valueTone(value ?? 0),
  })
}

function selectOverviewNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  focusOverviewNode(layer, node)
  selectLayer(layer.index, node.index)
}

function focusMatrixCellReadout(label: string, cell: CnnMatrixCell, valueLabel = copy.value.inputValue) {
  setHoverReadout({
    eyebrow: copy.value.hoverMatrixCell,
    title: `${label} · (${cell.row}, ${cell.col})`,
    body: `${valueLabel}: ${formatNumber(cell.value)}`,
    value: formatNumber(cell.value),
    tone: valueTone(cell.value),
  })
}

function focusKernelWeightReadout(channelIndex: number, row: number, col: number, value: number) {
  setHoverReadout({
    eyebrow: copy.value.hoverKernelWeight,
    title: `${copy.value.channel} ${channelIndex} · (${row}, ${col})`,
    body: `${copy.value.weightValue}: ${formatNumber(value)}`,
    value: formatNumber(value),
    tone: 'weight',
  })
}

function focusDenseWeightReadout(weight: CnnDenseWeightPreview) {
  focusedDenseSourceIndex.value = weight.sourceIndex
  setHoverReadout({
    eyebrow: copy.value.hoverDenseWeight,
    title: `${copy.value.sourceVector} v${weight.sourceIndex}`,
    body: localized(
      loc(
        `这个权重把 flatten 向量 v${weight.sourceIndex} 连接到当前类别 logit。`,
        `This weight connects flatten vector v${weight.sourceIndex} to the current class logit.`,
      ),
    ),
    value: formatNumber(weight.value),
    tone: 'weight',
  })
}

function focusDenseLedgerItem(item: CnnDenseLedgerItem) {
  focusedDenseSourceIndex.value = item.sourceIndex
  setHoverReadout({
    eyebrow: copy.value.denseLedgerTitle,
    title: item.label,
    body: item.description,
    value: `${item.formula} = ${item.formattedValue}`,
    tone: item.kind === 'negative' ? 'negative' : item.kind === 'logit' ? 'logit' : item.kind === 'bias' ? 'weight' : 'positive',
  })
}

function focusDenseWaterfallStep(step: CnnDenseWaterfallStep) {
  focusedDenseSourceIndex.value = step.sourceIndex
  setHoverReadout({
    eyebrow: copy.value.denseWaterfallTitle,
    title: step.label,
    body: step.description,
    value: `${copy.value.runningSum}: ${step.formattedEnd}`,
    tone: step.kind === 'negative' ? 'negative' : step.kind === 'bias' ? 'weight' : 'positive',
  })
}

function focusDenseAtlasCell(map: CnnDenseContributionAtlasMap, cell: CnnDenseContributionAtlasCell) {
  if (cell.sourceIndex !== undefined) focusedDenseSourceIndex.value = cell.sourceIndex
  setHoverReadout({
    eyebrow: copy.value.denseContributionAtlasTitle,
    title: `${map.sourceLabel} · (${cell.row}, ${cell.col})`,
    body: localized(
      loc(
        `Dense 分类头读取这个 Flatten 位置：激活 ${cell.formattedActivation} × 权重 ${cell.formattedWeight} = 贡献 ${cell.formattedContribution}。`,
        `The Dense classifier reads this Flatten position: activation ${cell.formattedActivation} × weight ${cell.formattedWeight} = contribution ${cell.formattedContribution}.`,
      ),
    ),
    value: `${cell.sourceIndex !== undefined ? `v${cell.sourceIndex} · ` : ''}${copy.value.denseContribution}: ${cell.formattedContribution}`,
    tone: cell.contribution < 0 ? 'negative' : 'positive',
  })
}

function selectDenseAtlasCell(cell: CnnDenseContributionAtlasCell) {
  focusedDenseSourceIndex.value = cell.sourceIndex
}

function focusSoftmaxReadout(score: CnnClassScore, classIndex: number) {
  const detail = selectedDetail.value
  const expScore = detail?.kind === 'dense' ? detail.expScores?.[classIndex] : undefined
  const probability = detail?.kind === 'dense' ? (detail.probabilities?.[classIndex] ?? score.probability) : score.probability
  const denominator = detail?.kind === 'dense' ? detail.expScores?.reduce((sum, value) => sum + value, 0) : undefined
  const expShare = denominator && expScore !== undefined ? expScore / denominator : probability

  setHoverReadout({
    eyebrow: copy.value.hoverSoftmaxTerm,
    title: `${score.label} · ${copy.value.classTerm} ${classIndex}`,
    body: `logit ${formatNumber(score.logit)} · ${copy.value.stabilizedExp} ${formatNumber(expScore)} · ${copy.value.denominatorShare} ${formatPercent(expShare)}`,
    value: `${copy.value.probability}: ${formatPercent(probability)}`,
    tone: 'logit',
  })
}

function focusActivationCellReadout(cell: CnnMatrixCell) {
  const layerName = selectedLayer.value?.name ?? copy.value.map
  focusMatrixCellReadout(layerName, cell, copy.value.reluValue)
}

function focusInputPreprocessStep(step: CnnInputPreprocessStep) {
  setHoverReadout({
    eyebrow: copy.value.inputPreprocessTitle,
    title: step.title,
    body: step.body,
    value: `${step.valueLabel}: ${step.value}`,
    tone: step.kind === 'normalize' ? 'activation' : 'neutral',
  })
}

function focusInputChannelCellReadout(preview: CnnInputChannelPreview, cell: CnnMatrixCell) {
  selectedNodeIndex.value = preview.channelIndex
  selectedRow.value = Math.min(Math.max(0, cell.row), rowMax.value)
  selectedCol.value = Math.min(Math.max(0, cell.col), colMax.value)
  const rawValue = normalizedToRawPixel(cell.value)
  setHoverReadout({
    eyebrow: copy.value.rgbChannels,
    title: `${preview.label} · ${copy.value.row} ${cell.row}, ${copy.value.col} ${cell.col}`,
    body: localized(
      loc(
        `浏览器把原始像素 ${rawValue} 除以 255，得到模型输入张量里的 ${formatNumber(cell.value)}。`,
        `The browser divides raw pixel ${rawValue} by 255, producing ${formatNumber(cell.value)} inside the model input tensor.`,
      ),
    ),
    value: `${copy.value.rawPixelValue} ${rawValue}/255 → ${copy.value.normalizedValue} ${formatNumber(cell.value)}`,
    tone: 'activation',
  })
}

function focusFlattenSourceReadout(row: number, col: number, value: number) {
  setHoverReadout({
    eyebrow: copy.value.sourceMap,
    title: `${copy.value.row} ${row} · ${copy.value.col} ${col}`,
    body: localized(
      loc(
        `Flatten 会按 channel、row、col 的顺序把这个空间位置排进一维向量。`,
        `Flatten places this spatial position into the one-dimensional vector by channel, row, then col.`,
      ),
    ),
    value: formatNumber(value),
    tone: valueTone(value),
  })
}

function focusFlattenVectorReadout(index: number, value: number) {
  setHoverReadout({
    eyebrow: copy.value.vectorIndex,
    title: `v${index}`,
    body: localized(
      loc(
        `这个向量项会连接到 Dense/Softmax 分类头的每个类别 logit。`,
        `This vector entry connects to every class logit in the Dense/Softmax head.`,
      ),
    ),
    value: formatNumber(value),
    tone: valueTone(value),
  })
}

function focusFlattenLedgerItem(item: CnnFlattenLedgerItem) {
  setHoverReadout({
    eyebrow: copy.value.flattenLedgerTitle,
    title: item.label,
    body: item.description,
    value: `${item.formula} = ${item.formattedValue}`,
    tone: item.kind === 'index' ? 'activation' : 'neutral',
  })
}

function clampHyperparameterControls() {
  hyperInputSize.value = clampUiInteger(hyperInputSize.value, 3, 7)
  hyperPadding.value = clampUiInteger(hyperPadding.value, 0, 3)
  hyperKernelSize.value = clampUiInteger(hyperKernelSize.value, 1, hyperKernelMax.value)
  hyperStride.value = clampUiInteger(hyperStride.value, 1, hyperStrideMax.value)
  hyperOutputRow.value = clampUiInteger(hyperOutputRow.value, 0, Math.max(0, hyperOutputSize.value - 1))
  hyperOutputCol.value = clampUiInteger(hyperOutputCol.value, 0, Math.max(0, hyperOutputSize.value - 1))
}

function clampUiInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(Math.round(value), min), Math.max(min, max))
}

function focusConvMathCell(contribution: CnnChannelContribution, row: number, col: number) {
  pauseDetailPlaybackFromInteraction()
  convMathFocus.value = {
    channelIndex: contribution.channelIndex,
    row,
    col,
  }
  const patchValue = contribution.patch[row]?.[col] ?? 0
  const kernelValue = contribution.kernel[row]?.[col] ?? 0
  const productValue = contribution.products[row]?.[col] ?? 0
  setHoverReadout({
    eyebrow: copy.value.kernelMath,
    title: `${copy.value.channel} ${contribution.channelIndex} · (${row}, ${col})`,
    body: `${formatNumber(patchValue)} × ${formatNumber(kernelValue)} = ${formatNumber(productValue)}`,
    value: `${copy.value.sum}: ${formatNumber(contribution.sum)}`,
    tone: valueTone(productValue),
  })

  const link = selectedNode.value?.inputLinks.find((inputLink) => inputLink.sourceNodeIndex === contribution.channelIndex)
  if (link) {
    focusedOverviewWindow.value = {
      kind: 'source',
      layerIndex: link.sourceLayerIndex,
      nodeIndex: link.sourceNodeIndex,
    }
  }
}

function focusConvAnimatorMathCell(row: number, col: number) {
  const contribution = activeConvContribution.value
  if (!contribution) return
  focusConvMathCell(contribution, row, col)
}

function focusConvLedgerItem(item: CnnConvLedgerItem) {
  const detail = selectedDetail.value
  if (detail?.kind !== 'conv') return
  if (item.channelIndex !== undefined) {
    const link = selectedNode.value?.inputLinks.find((inputLink) => inputLink.sourceNodeIndex === item.channelIndex)
    if (link) {
      focusedOverviewWindow.value = {
        kind: 'source',
        layerIndex: link.sourceLayerIndex,
        nodeIndex: link.sourceNodeIndex,
      }
    }
  }

  setHoverReadout({
    eyebrow: copy.value.convLedgerTitle,
    title: item.label,
    body: convLedgerItemDescription(item),
    value: item.formattedValue,
    tone: item.tone,
  })
}

function focusConvIntermediateCard(card: CnnConvIntermediateCard) {
  const contribution = convContributions.value.find((item) => item.channelIndex === card.channelIndex)
  if (!contribution) return
  const centerRow = Math.max(0, Math.floor((contribution.patch.length - 1) / 2))
  const centerCol = Math.max(0, Math.floor(((contribution.patch[centerRow]?.length ?? 1) - 1) / 2))
  focusConvMathCell(contribution, centerRow, centerCol)
  setHoverReadout({
    eyebrow: copy.value.convIntermediateStack,
    title: `${copy.value.channel} ${card.channelIndex}`,
    body: localized(
      loc(
        `该通道的 patch × kernel 先汇总为 ${card.formattedSum}，再和其他 channel sum 以及 bias 一起进入当前输出 cell。`,
        `This channel's patch x kernel first sums to ${card.formattedSum}, then joins the other channel sums and bias for the current output cell.`,
      ),
    ),
    value: card.formattedSum,
    tone: ledgerTone(card.sum),
  })
}

function convLedgerItemDescription(item: CnnConvLedgerItem) {
  if (item.kind === 'channel') {
    return localized(
      loc(
        `${item.label} 是该输入 channel 的 3×3 patch × kernel 全部乘积之和，会进入跨 channel 求和。`,
        `${item.label} is the sum of every 3x3 patch x kernel product for this input channel; it enters the cross-channel sum.`,
      ),
    )
  }

  if (item.kind === 'bias') {
    return localized(
      loc(
        'bias 是当前 filter 的可训练偏移量，会在所有 channel sum 之后加上。',
        'The bias is the trainable offset for the current filter; it is added after all channel sums.',
      ),
    )
  }

  if (item.kind === 'weighted') {
    return localized(
      loc(
        'ReLU 前的 z 等于所有 channel sum 加 bias，是当前输出 cell 的线性响应。',
        'Pre-ReLU z equals all channel sums plus bias; it is the linear response of the current output cell.',
      ),
    )
  }

  return localized(
    loc(
      'ReLU 后激活是 max(0,z)，负响应会被截断为 0，正响应继续传播。',
      'The post-ReLU activation is max(0,z): negative responses are clipped to 0 and positive responses continue forward.',
    ),
  )
}

function focusOverviewWindow(window: CnnOverviewLocalWindow) {
  focusedOverviewWindow.value = {
    kind: window.kind,
    layerIndex: window.layerIndex,
    nodeIndex: window.nodeIndex,
  }
  setHoverReadout({
    eyebrow: copy.value.hoverOverviewWindow,
    title: overviewWindowTitle(window),
    body: overviewWindowDescription(window),
    value: `${copy.value.inputValue}: ${formatNumber(window.value)}`,
    tone: valueTone(window.value),
  })
}

function commitOverviewWindow(window: CnnOverviewLocalWindow) {
  focusOverviewWindow(window)

  if (window.kind === 'output') {
    setSpatialSelection(window.row, window.col)
    return
  }

  if (selectedDetail.value?.kind === 'pool') {
    setSpatialSelection(Math.floor(window.row / 2), Math.floor(window.col / 2))
    return
  }

  setSpatialSelection(window.row, window.col)
}

function selectDenseWeightSource(sourceIndex: number) {
  const flattenLayerIndex = layers.value.findIndex((layer) => layer.kind === 'flatten')
  if (flattenLayerIndex >= 0) selectLayer(flattenLayerIndex, sourceIndex)
}

function togglePlayback() {
  if (reducedMotion.value || status.value !== 'ready') return
  isPlaying.value = !isPlaying.value
}

function toggleDetailPlayback() {
  if (reducedMotion.value || status.value !== 'ready' || detailStepCount.value <= 1) return
  isDetailPlaying.value = !isDetailPlaying.value
}

function pauseDetailPlaybackFromInteraction() {
  if (!isDetailPlaying.value) return
  isDetailPlaying.value = false
}

function closeDetailPanel() {
  isDetailPlaying.value = false
  showDetails.value = false
}

function stepForward() {
  if (!layers.value.length) return
  const nextLayerIndex = (selectedLayerIndex.value + 1) % layers.value.length
  clearHoverReadout()
  selectLayer(nextLayerIndex, 0)
}

function stepDetailBackward() {
  if (!selectedLayer.value || detailStepCount.value <= 1) return
  const previousStep = detailStepIndex.value - 1
  setDetailStep(previousStep < 0 ? detailStepCount.value - 1 : previousStep)
}

function stepDetailForward() {
  if (!selectedLayer.value || detailStepCount.value <= 1) return
  if (stepDetailWithinLayer()) return
  setDetailStep(0)
}

function stepDetailWithinLayer() {
  const layer = selectedLayer.value
  if (!layer || detailStepCount.value <= 1) return false
  const nextStep = detailStepIndex.value + 1
  if (nextStep >= detailStepCount.value) return false
  setDetailStep(nextStep)
  return true
}

function setDetailStep(stepIndex: number) {
  const layer = selectedLayer.value
  if (!layer) return
  const boundedStep = Math.min(Math.max(0, stepIndex), Math.max(0, detailStepCount.value - 1))

  if (layer.outputShape.length === 3 && selectedMatrix.value) {
    const width = colMax.value + 1
    selectedRow.value = Math.floor(boundedStep / width)
    selectedCol.value = boundedStep % width
    return
  }

  if (layer.kind === 'flatten' || layer.kind === 'dense') {
    selectLayer(selectedLayerIndex.value, boundedStep)
  }
}

function onDetailScrub(event: Event) {
  const input = event.target as HTMLInputElement
  const nextStep = Number(input.value)
  if (!Number.isFinite(nextStep)) return
  setDetailStep(nextStep)
}

function focusDetailScanCell(cell: CnnDetailScanCell) {
  pauseDetailPlaybackFromInteraction()
  setDetailStep(cell.stepIndex)
  setHoverReadout({
    eyebrow: copy.value.scanMap,
    title: `${copy.value.scanCell} (${cell.row}, ${cell.col})`,
    body: copy.value.scanPathHint,
    value: `${copy.value.currentValue}: ${cell.formattedValue}`,
    tone: valueTone(cell.value),
  })
}

function previewBridgeSourceCell(row: number, col: number) {
  pauseDetailPlaybackFromInteraction()
  const bridge = spatialBridge.value
  const value = bridge?.sourceMatrix[row]?.[col] ?? 0
  focusMatrixCellReadout(bridge?.sourceLabel ?? copy.value.inputWindow, { row, col, value })
  beginBridgePreview()
  selectBridgeSourceCell(row, col)
}

function previewBridgeOutputCell(row: number, col: number) {
  pauseDetailPlaybackFromInteraction()
  const bridge = spatialBridge.value
  const value = bridge?.outputMatrix[row]?.[col] ?? 0
  focusMatrixCellReadout(bridge?.outputLabel ?? copy.value.outputCell, { row, col, value }, copy.value.outputCell)
  beginBridgePreview()
  selectBridgeOutputCell(row, col)
}

function commitBridgeSourceCell(row: number, col: number) {
  bridgePreviewOrigin.value = undefined
  isPlaying.value = false
  selectBridgeSourceCell(row, col)
}

function commitBridgeOutputCell(row: number, col: number) {
  bridgePreviewOrigin.value = undefined
  isPlaying.value = false
  selectBridgeOutputCell(row, col)
}

function beginBridgePreview() {
  if (!bridgePreviewOrigin.value) {
    bridgePreviewOrigin.value = {
      layerIndex: selectedLayerIndex.value,
      nodeIndex: selectedNodeIndex.value,
      row: selectedRow.value,
      col: selectedCol.value,
      wasPlaying: isPlaying.value,
    }
  }
  if (bridgePreviewOrigin.value.wasPlaying) stopPlayback()
}

function endBridgePreview() {
  const origin = bridgePreviewOrigin.value
  clearHoverReadout()
  if (!origin) return
  bridgePreviewOrigin.value = undefined

  selectedLayerIndex.value = origin.layerIndex
  selectedNodeIndex.value = origin.nodeIndex
  selectedRow.value = origin.row
  selectedCol.value = origin.col

  if (origin.wasPlaying && isPlaying.value && !reducedMotion.value) startPlaybackTimer()
}

function endBridgePreviewIfFocusLeaves(event: FocusEvent) {
  const nextTarget = event.relatedTarget
  if (nextTarget instanceof Node && event.currentTarget instanceof HTMLElement && event.currentTarget.contains(nextTarget)) return
  endBridgePreview()
}

function selectBridgeSourceCell(row: number, col: number) {
  const detail = selectedDetail.value
  if (!detail || !['conv', 'relu', 'pool'].includes(detail.kind)) return
  const nextRow = detail.kind === 'pool' ? Math.floor(row / 2) : row
  const nextCol = detail.kind === 'pool' ? Math.floor(col / 2) : col
  setSpatialSelection(nextRow, nextCol)
}

function selectBridgeOutputCell(row: number, col: number) {
  setSpatialSelection(row, col)
}

function pinConvAnimatorWindow() {
  const anchor = convAnimatorAnchor.value
  if (anchor && anchor.layerIndex === selectedLayerIndex.value && anchor.nodeIndex === selectedNodeIndex.value) return
  convAnimatorAnchor.value = {
    layerIndex: selectedLayerIndex.value,
    nodeIndex: selectedNodeIndex.value,
    row: selectedRow.value,
    col: selectedCol.value,
  }
}

function clearConvAnimatorWindowAnchor() {
  convAnimatorAnchor.value = undefined
  clearHoverReadout()
}

function clearConvAnimatorWindowAnchorIfFocusLeaves(event: FocusEvent) {
  const nextTarget = event.relatedTarget
  if (nextTarget instanceof Node && event.currentTarget instanceof HTMLElement && event.currentTarget.contains(nextTarget)) return
  clearConvAnimatorWindowAnchor()
}

function selectConvInputMatrixCell(cell: CnnMatrixCell) {
  pauseDetailPlaybackFromInteraction()
  pinConvAnimatorWindow()
  focusMatrixCellReadout(copy.value.convInputMatrix, cell)
  setSpatialSelection(cell.row, cell.col)
}

function selectConvOutputMatrixCell(cell: CnnMatrixCell) {
  pauseDetailPlaybackFromInteraction()
  pinConvAnimatorWindow()
  focusMatrixCellReadout(copy.value.convOutputMatrix, cell, copy.value.outputCell)
  setSpatialSelection(cell.row, cell.col)
}

function selectReluMatrixCell(cell: CnnMatrixCell, label = copy.value.reluInputMatrix) {
  pauseDetailPlaybackFromInteraction()
  reluFocusedTerm.value = undefined
  focusMatrixCellReadout(label, cell, label === copy.value.reluOutputMatrix ? copy.value.reluValue : copy.value.inputValue)
  setSpatialSelection(cell.row, cell.col)
}

function focusReluMaskCell(cell: CnnReluMaskCell) {
  pauseDetailPlaybackFromInteraction()
  reluFocusedTerm.value = cell.wasClipped ? 'zero' : 'input'
  setSpatialSelection(cell.row, cell.col)
  setHoverReadout({
    eyebrow: copy.value.reluMaskTitle,
    title: `${copy.value.row} ${cell.row}, ${copy.value.col} ${cell.col}`,
    body: localized(
      loc(
        cell.wasClipped
          ? `这个位置的 z=${formatNumber(cell.value)} 小于 0，ReLU 把它截断成 ${formatNumber(cell.outputValue)}。`
          : `这个位置的 z=${formatNumber(cell.value)} 大于等于 0，ReLU 保留为 ${formatNumber(cell.outputValue)}。`,
        cell.wasClipped
          ? `This position has z=${formatNumber(cell.value)} below 0, so ReLU clips it to ${formatNumber(cell.outputValue)}.`
          : `This position has z=${formatNumber(cell.value)} at or above 0, so ReLU keeps it as ${formatNumber(cell.outputValue)}.`,
      ),
    ),
    value: cell.wasClipped ? copy.value.clipped : copy.value.retained,
    tone: cell.wasClipped ? 'negative' : 'positive',
  })
}

function focusReluOperatorTerm(term: CnnReluOperatorTerm) {
  pauseDetailPlaybackFromInteraction()
  reluFocusedTerm.value = term
  const detail = selectedDetail.value
  if (detail?.kind !== 'relu') return
  const inputValue = detail.weightedSum ?? 0
  const outputValue = detail.reluValue ?? Math.max(0, inputValue)
  const title =
    term === 'zero'
      ? `${copy.value.reluCandidate}: ${copy.value.zeroThreshold}`
      : term === 'input'
        ? `${copy.value.reluSelectedInput}: z`
        : copy.value.outputCell
  setHoverReadout({
    eyebrow: copy.value.reluOperatorTitle,
    title,
    body: reluOperatorNarration.value,
    value: formatNumber(term === 'output' ? outputValue : term === 'input' ? inputValue : 0),
    tone: valueTone(term === 'output' ? outputValue : term === 'input' ? inputValue : 0),
  })
}

function clearReluOperatorFocus() {
  reluFocusedTerm.value = undefined
  clearHoverReadout()
}

function selectPoolInputMatrixCell(cell: CnnMatrixCell) {
  pauseDetailPlaybackFromInteraction()
  poolFocusedCell.value = { row: cell.row, col: cell.col }
  focusMatrixCellReadout(copy.value.poolInputMatrix, cell)
  setSpatialSelection(Math.floor(cell.row / 2), Math.floor(cell.col / 2))
}

function selectPoolOutputMatrixCell(cell: CnnMatrixCell) {
  pauseDetailPlaybackFromInteraction()
  poolFocusedCell.value = undefined
  focusMatrixCellReadout(copy.value.poolOutputMatrix, cell, copy.value.maxValue)
  setSpatialSelection(cell.row, cell.col)
}

function focusPoolOperatorCell(cell: CnnPoolOperatorCell) {
  pauseDetailPlaybackFromInteraction()
  poolFocusedCell.value = {
    row: cell.row,
    col: cell.col,
  }
  setHoverReadout({
    eyebrow: copy.value.poolWindow,
    title: `${copy.value.row} ${cell.row} · ${copy.value.col} ${cell.col}`,
    body: cell.isMax ? copy.value.poolWinner : copy.value.poolCandidate,
    value: formatNumber(cell.value),
    tone: valueTone(cell.value),
  })
}

function focusPoolLedgerItem(item: CnnPoolLedgerItem) {
  focusPoolOperatorCell({
    value: item.value,
    row: item.row,
    col: item.col,
    relativeRow: item.relativeRow,
    relativeCol: item.relativeCol,
    isMax: item.isWinner,
    isSelected: item.isSelected,
  })
}

function focusPoolRetentionCell(cell: CnnPoolRetentionCell) {
  pauseDetailPlaybackFromInteraction()
  poolFocusedCell.value = {
    row: cell.row,
    col: cell.col,
  }
  setSpatialSelection(cell.outputRow, cell.outputCol)
  setHoverReadout({
    eyebrow: copy.value.poolRetentionTitle,
    title: `${copy.value.row} ${cell.row} · ${copy.value.col} ${cell.col} → ${copy.value.outputCell} ${cell.outputRow}, ${cell.outputCol}`,
    body: localized(
      loc(
        cell.isWinner
          ? `这个输入值是它所在 2×2 window 的最大激活，所以 MaxPool 把 ${formatNumber(cell.value)} 复制成输出 ${formatNumber(cell.outputValue)}。`
          : `这个输入值参与了 2×2 window 的比较，但不是最大值；输出 cell 会采用窗口里的 ${formatNumber(cell.outputValue)}。`,
        cell.isWinner
          ? `This input value is the largest activation in its 2x2 window, so MaxPool copies ${formatNumber(cell.value)} into output ${formatNumber(cell.outputValue)}.`
          : `This input value takes part in the 2x2 comparison, but it is not the maximum; the output cell uses ${formatNumber(cell.outputValue)} from the window.`,
      ),
    ),
    value: `${formatNumber(cell.value)} → ${formatNumber(cell.outputValue)}`,
    tone: cell.isWinner ? 'positive' : 'neutral',
  })
}

function clearPoolOperatorFocus() {
  poolFocusedCell.value = undefined
  clearHoverReadout()
}

function selectActivationCell(row: number, col: number) {
  pauseDetailPlaybackFromInteraction()
  const matrix = selectedMatrix.value
  const value = matrix?.[row]?.[col] ?? 0
  focusActivationCellReadout({ row, col, value, isSelected: row === selectedRow.value && col === selectedCol.value })
  setSpatialSelection(row, col)
}

function setSpatialSelection(row: number, col: number) {
  selectedRow.value = Math.min(Math.max(0, row), rowMax.value)
  selectedCol.value = Math.min(Math.max(0, col), colMax.value)
}

function resetSelection() {
  stopPlayback()
  stopDetailPlayback()
  bridgePreviewOrigin.value = undefined
  focusedOverviewNode.value = undefined
  expandedOverviewLayerIndex.value = undefined
  isPlaying.value = false
  isDetailPlaying.value = false
  hoverReadout.value = undefined
  selectLayer(0, 0)
}

function selectSampleImage(sample: CnnSampleImage) {
  revokeUserObjectUrl()
  void runInference(sample.url, sample.label)
}

function sampleClassAriaLabel(sample: CnnSampleClassCard) {
  return `${copy.value.expectedClass} ${sample.label}, ${copy.value.probability} ${sample.probabilityLabel}, ${sample.isTopPrediction ? copy.value.topClass : copy.value.notTopClass}`
}

function focusSampleClassCard(sample: CnnSampleClassCard) {
  setHoverReadout({
    eyebrow: copy.value.classGallery,
    title: `${sample.label} · ${sample.probabilityLabel}`,
    body: localized(
      loc(
        `这张内置 PNG 的目标类别是 ${sample.label}；当前 Softmax 给这个类别 ${sample.probabilityLabel}，${sample.isTopPrediction ? '它也是 top-1 预测。' : `top-1 预测是 ${topPrediction.value?.label ?? copy.value.fallback}。`}`,
        `This built-in PNG is labeled ${sample.label}; the current Softmax assigns ${sample.probabilityLabel} to this class, ${sample.isTopPrediction ? 'and it is the top-1 prediction.' : `while the top-1 prediction is ${topPrediction.value?.label ?? copy.value.fallback}.`}`,
      ),
    ),
    value: sample.isTopPrediction ? copy.value.topClass : copy.value.notTopClass,
    tone: sample.isTopPrediction ? 'logit' : 'activation',
  })
}

function stopPlayback() {
  if (playbackTimer !== undefined) {
    window.clearInterval(playbackTimer)
    playbackTimer = undefined
  }
}

function startPlaybackTimer() {
  stopPlayback()
  playbackTimer = window.setInterval(stepForward, 1300)
}

function stopDetailPlayback() {
  if (detailPlaybackTimer !== undefined) {
    window.clearInterval(detailPlaybackTimer)
    detailPlaybackTimer = undefined
  }
}

function startDetailPlaybackTimer() {
  stopDetailPlayback()
  detailPlaybackTimer = window.setInterval(stepDetailForward, 250)
}

function revokeUserObjectUrl() {
  if (userObjectUrl.value) {
    URL.revokeObjectURL(userObjectUrl.value)
    userObjectUrl.value = undefined
  }
}

function overviewCollapsedVisibleLimit(layer: CnnLayerSnapshot) {
  return layer.kind === 'flatten' ? overviewFlattenCollapsedNodeCount : overviewCollapsedNodeCount
}

function overviewExpandedVisibleLimit(layer: CnnLayerSnapshot) {
  return layer.kind === 'flatten' ? overviewFlattenExpandedNodeCount : overviewExpandedNodeCount
}

function isOverviewLayerExpanded(layer: CnnLayerSnapshot) {
  return expandedOverviewLayerIndex.value === layer.index
}

function overviewVisibleLimit(layer: CnnLayerSnapshot) {
  return isOverviewLayerExpanded(layer) ? overviewExpandedVisibleLimit(layer) : overviewCollapsedVisibleLimit(layer)
}

function visibleNodes(layer: CnnLayerSnapshot) {
  return layer.nodes.slice(0, Math.min(layer.nodes.length, overviewVisibleLimit(layer)))
}

function hiddenNodeCount(layer: CnnLayerSnapshot) {
  return Math.max(0, layer.nodes.length - visibleNodes(layer).length)
}

function overviewCollapsedHiddenNodeCount(layer: CnnLayerSnapshot) {
  return Math.max(0, layer.nodes.length - overviewCollapsedVisibleLimit(layer))
}

function overviewHasExpandableNodes(layer: CnnLayerSnapshot) {
  return overviewCollapsedHiddenNodeCount(layer) > 0
}

function overviewLayerExpansionTitle(layer: CnnLayerSnapshot) {
  if (isOverviewLayerExpanded(layer)) return `${copy.value.collapseLayer}: ${layer.name}`
  return `${copy.value.expandLayer}: ${layer.name} (+${overviewCollapsedHiddenNodeCount(layer)} ${copy.value.hiddenFeatureMaps})`
}

function overviewLayerExpansionGlyph(layer: CnnLayerSnapshot) {
  return isOverviewLayerExpanded(layer) ? '-' : `+${overviewCollapsedHiddenNodeCount(layer)}`
}

function overviewLayerExpansionAriaLabel(layer: CnnLayerSnapshot) {
  return `${overviewLayerExpansionTitle(layer)}. ${copy.value.overviewExpandHint}`
}

function focusOverviewLayerExpansion(layer: CnnLayerSnapshot) {
  const expanded = isOverviewLayerExpanded(layer)
  const collapsedLimit = overviewCollapsedVisibleLimit(layer)
  const expandedLimit = Math.min(layer.nodes.length, overviewExpandedVisibleLimit(layer))

  setHoverReadout({
    eyebrow: copy.value.overview,
    title: overviewLayerExpansionTitle(layer),
    body: localized(
      loc(
        expanded
          ? `这一层已显示 ${visibleNodes(layer).length}/${layer.nodes.length} 个 feature maps；点击可收回到 ${collapsedLimit} 个，保持全局结构更紧凑。`
          : `这一层共有 ${layer.nodes.length} 个 feature maps；点击 +${overviewCollapsedHiddenNodeCount(layer)} 会展开到 ${expandedLimit} 个，便于观察更多通道。`,
        expanded
          ? `This layer is showing ${visibleNodes(layer).length}/${layer.nodes.length} feature maps; click to collapse back to ${collapsedLimit} for a denser overview.`
          : `This layer has ${layer.nodes.length} feature maps; click +${overviewCollapsedHiddenNodeCount(layer)} to reveal ${expandedLimit} of them for a wider channel view.`,
      ),
    ),
    value: expanded ? `${visibleNodes(layer).length}/${layer.nodes.length}` : `+${overviewCollapsedHiddenNodeCount(layer)}`,
    tone: 'activation',
  })
}

function toggleOverviewLayerExpansion(layer: CnnLayerSnapshot) {
  if (!overviewHasExpandableNodes(layer)) return

  const wasExpanded = isOverviewLayerExpanded(layer)
  expandedOverviewLayerIndex.value = wasExpanded ? undefined : layer.index

  if (wasExpanded && selectedLayerIndex.value === layer.index && selectedNodeIndex.value >= overviewCollapsedVisibleLimit(layer)) {
    selectLayer(layer.index, Math.max(0, overviewCollapsedVisibleLimit(layer) - 1))
  }

  focusOverviewLayerExpansion(layer)
}

function overviewLayerStripDescription(startIndex: number, endIndex: number, totalCount: number) {
  const windowText = `${startIndex + 1}-${endIndex}/${totalCount}`
  return localized(
    loc(
      `${copy.value.stripWindow} ${windowText}；${copy.value.stripHint}`,
      `${copy.value.stripWindow} ${windowText}; ${copy.value.stripHint}`,
    ),
  )
}

function overviewLayerStripNodeLabel(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (layer.kind === 'dense') return scores.value[node.index]?.label ?? `${copy.value.classTerm} ${node.index}`
  if (layer.kind === 'flatten') return `v${node.realIndex ?? node.index}`
  return `${copy.value.channel} ${node.index}`
}

function overviewLayerStripNodeValue(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (layer.kind === 'dense') return scores.value[node.index]?.probability ?? numberFromOutput(node.output)
  if (isMatrix(node.output)) {
    const row = Math.min(Math.max(0, selectedRow.value), Math.max(0, node.output.length - 1))
    const col = Math.min(Math.max(0, selectedCol.value), Math.max(0, (node.output[0]?.length ?? 1) - 1))
    return node.output[row]?.[col] ?? 0
  }
  return numberFromOutput(node.output)
}

function overviewLayerStripNodeValueLabel(layer: CnnLayerSnapshot, node: CnnNodeSnapshot, value: number) {
  if (layer.kind === 'dense') return `${copy.value.probability} ${formatPercent(value)}`
  if (layer.kind === 'flatten') return `${copy.value.vectorIndex} ${node.realIndex ?? node.index} · ${formatNumber(value)}`
  return `${copy.value.currentValue} ${formatNumber(value)}`
}

function overviewLayerStripCellStyle(node: CnnNodeSnapshot) {
  if (!isMatrix(node.output)) return undefined

  const rowCount = node.output.length
  const colCount = node.output[0]?.length ?? 0
  if (!rowCount || !colCount) return undefined

  const row = Math.min(Math.max(0, selectedRow.value), rowCount - 1)
  const col = Math.min(Math.max(0, selectedCol.value), colCount - 1)
  const width = 100 / colCount
  const height = 100 / rowCount

  return {
    left: `${col * width}%`,
    top: `${row * height}%`,
    width: `max(${width}%, 3px)`,
    height: `max(${height}%, 3px)`,
  }
}

function overviewLayerStripItemAriaLabel(item: CnnOverviewLayerStripItem, layer: CnnLayerSnapshot) {
  return `${layer.name} ${item.label}, ${item.valueLabel}`
}

function focusOverviewLayerStripItem(item: CnnOverviewLayerStripItem, layer: CnnLayerSnapshot) {
  setHoverReadout({
    eyebrow: copy.value.intermediateLayerView,
    title: `${layer.name}[${item.node.index}] · ${item.label}`,
    body: layerRoleDescription(layer, item.node),
    value: item.valueLabel,
    tone: layer.kind === 'dense' ? 'logit' : valueTone(item.value),
  })
}

function selectOverviewLayerStripItem(item: CnnOverviewLayerStripItem, layer: CnnLayerSnapshot) {
  focusOverviewLayerStripItem(item, layer)
  selectLayer(layer.index, item.node.index)
}

function overviewNodeKey(layerIndex: number, nodeIndex: number) {
  return `${layerIndex}:${nodeIndex}`
}

function overviewEdgeKey(sourceLayerIndex: number, sourceNodeIndex: number, targetLayerIndex: number, targetNodeIndex: number) {
  return `${sourceLayerIndex}:${sourceNodeIndex}->${targetLayerIndex}:${targetNodeIndex}`
}

function layerX(index: number) {
  return 72 + index * 118
}

function nodeY(nodeIndex: number, totalNodes: number) {
  const top = 82
  const bottom = 242
  if (totalNodes <= 1) return (top + bottom) / 2
  return top + (nodeIndex / (totalNodes - 1)) * (bottom - top)
}

function overviewNodePoint(layer: CnnLayerSnapshot, nodeDisplayIndex: number, totalNodes: number): CnnOverviewPoint {
  const y = nodeY(nodeDisplayIndex, totalNodes) - nodeLength / 2

  if (layer.kind === 'dense') {
    return {
      x: layerX(layer.index) - nodeLength / 2,
      y,
    }
  }

  const centeredIndex = nodeDisplayIndex - (Math.max(1, totalNodes) - 1) / 2
  const depthOffset = Math.max(-7, Math.min(7, centeredIndex * 2.2))
  return {
    x: layerX(layer.index) - nodeLength / 2 + depthOffset,
    y,
  }
}

function overviewNodeTransform(layer: CnnLayerSnapshot, nodeDisplayIndex: number, totalNodes: number) {
  const point = overviewNodePoint(layer, nodeDisplayIndex, totalNodes)
  return `translate(${point.x}, ${point.y})`
}

function overviewNodeAnchor(
  layer: CnnLayerSnapshot,
  nodeDisplayIndex: number,
  totalNodes: number,
  side: 'in' | 'out',
): CnnOverviewPoint {
  const point = overviewNodePoint(layer, nodeDisplayIndex, totalNodes)
  const denseLabelPadding = layer.kind === 'dense' && side === 'out' ? 112 : 0
  return {
    x: point.x + (side === 'out' ? nodeLength + denseLabelPadding : 0),
    y: point.y + nodeLength / 2,
  }
}

function overviewStackPlates(layer: CnnLayerSnapshot, nodeDisplayIndex: number): CnnOverviewPlate[] {
  if (layer.kind === 'dense') return []
  const visibleDepth = Math.min(3, Math.max(1, hiddenNodeCount(layer) ? 3 : Math.ceil(layer.nodes.length / 6)))
  const selectedBoost = selectedLayerIndex.value === layer.index && selectedNodeIndex.value === nodeDisplayIndex ? 1 : 0
  return Array.from({ length: visibleDepth }, (_, index) => {
    const depth = visibleDepth - index
    return {
      x: -depth * 2.2,
      y: -depth * 2.2,
      width: nodeLength,
      height: nodeLength,
      opacity: 0.18 + index * 0.07 + selectedBoost * 0.05,
    }
  })
}

function overviewLayerTrackPath(layer: CnnLayerSnapshot) {
  const nodes = visibleNodes(layer)
  if (nodes.length <= 1) return ''
  const first = overviewNodeAnchor(layer, 0, nodes.length, 'in')
  const last = overviewNodeAnchor(layer, nodes.length - 1, nodes.length, 'in')
  return `M ${first.x - 8} ${first.y} L ${last.x - 8} ${last.y}`
}

function outputNodeLabel(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (layer.kind !== 'dense') return ''
  const label = scores.value[node.index]?.label ?? `${node.index}`
  return label.length > 10 ? `${label.slice(0, 10)}…` : label
}

function inputChannelLabel(channelIndex: number) {
  if (channelIndex === 0) return copy.value.channelRed
  if (channelIndex === 1) return copy.value.channelGreen
  if (channelIndex === 2) return copy.value.channelBlue
  return `${copy.value.channel} ${channelIndex}`
}

function inputChannelTone(channelIndex: number): CnnInputChannelPreview['tone'] {
  if (channelIndex === 0) return 'red'
  if (channelIndex === 1) return 'green'
  return 'blue'
}

function normalizedToRawPixel(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.round(Math.min(1, Math.max(0, value)) * 255)
}

function overviewLayerRecipe(layer: CnnLayerSnapshot) {
  const node = layer.nodes[0]
  const outputChannels = Math.max(1, layer.nodes.length)

  if (layer.kind === 'input') return `RGB · ${formatShape(layer.outputShape)}`

  if (layer.kind === 'conv') {
    const kernel = node ? kernelSizeForNode(node) : undefined
    const kernelText = kernel ? `${kernel.rows}×${kernel.cols}` : '3×3'
    return `${kernelText} conv · ${outputChannels} ${copy.value.featureMaps}`
  }

  if (layer.kind === 'relu') return `ReLU · ${formatShape(layer.outputShape)}`
  if (layer.kind === 'pool') return `2×2 max · stride 2`
  if (layer.kind === 'flatten') return `Flatten · ${formatShape(layer.outputShape)}`
  return `Dense · ${outputChannels} ${copy.value.classes}`
}

function overviewLayerParameterLabel(layer: CnnLayerSnapshot) {
  const params = layer.parameterCount > 0 ? `${layer.parameterCount} ${copy.value.params}` : copy.value.noParams
  const inputChannels = layer.inputShape[layer.inputShape.length - 1]
  const outputChannels = layer.outputShape[layer.outputShape.length - 1]

  if (layer.kind === 'conv' && inputChannels && outputChannels) return `${params} · ${inputChannels}→${outputChannels} ${copy.value.channels}`
  if (layer.kind === 'dense') return `${params} · softmax`
  if (layer.kind === 'pool') return `${params} · ${copy.value.downsample}`
  if (layer.kind === 'flatten') return `${params} · ${copy.value.indexRemap}`
  if (layer.kind === 'relu') return `${params} · ${copy.value.pointwise}`
  return params
}

function overviewLayerAriaLabel(layer: CnnLayerSnapshot) {
  return `${layer.name}: ${overviewLayerRecipe(layer)}, ${copy.value.outputShapeLabel} ${formatShape(layer.outputShape)}, ${overviewLayerParameterLabel(layer)}`
}

function denseOverviewProbability(node: CnnNodeSnapshot) {
  const probability = scores.value[node.index]?.probability ?? numberFromOutput(node.output)
  if (!Number.isFinite(probability)) return 0
  return Math.min(1, Math.max(0, probability))
}

function denseOverviewBarWidthValue(node: CnnNodeSnapshot) {
  return Math.max(2, denseOverviewProbability(node) * denseOverviewBarWidth)
}

function denseOverviewProbabilityLabel(node: CnnNodeSnapshot) {
  return formatPercent(denseOverviewProbability(node))
}

function isTopOverviewScore(node: CnnNodeSnapshot) {
  const score = scores.value[node.index]
  return !!score && score.id === topPrediction.value?.id
}

function formatShape(shape: number[]) {
  return shape.length ? shape.join('×') : 'scalar'
}

function kernelSizeForNode(node: CnnNodeSnapshot) {
  const kernel = node.inputLinks.map((link) => link.weight).find(isMatrix)
  if (!kernel) return undefined
  return {
    rows: kernel.length,
    cols: kernel[0]?.length ?? 0,
  }
}

function layerRoleDescription(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  const kernel = kernelSizeForNode(node)

  if (layer.kind === 'input') {
    return localized(
      loc(
        'Input 层把图片变成 64×64×3 的 RGB 数值体，后续所有 feature map 都从这三个 channel 开始。',
        'The Input layer turns the image into a 64x64x3 RGB volume; every later feature map starts from these three channels.',
      ),
    )
  }

  if (layer.kind === 'conv') {
    const kernelText = kernel ? `${kernel.rows}×${kernel.cols}` : '3×3'
    return localized(
      loc(
        `Conv 层用 ${kernelText} kernel 在输入 maps 上滑动；每个输出 filter 汇总所有输入 channel，生成一个新的 feature map。`,
        `The Conv layer slides a ${kernelText} kernel over the input maps; each output filter combines every input channel into a new feature map.`,
      ),
    )
  }

  if (layer.kind === 'relu') {
    return localized(
      loc(
        'ReLU 层不改变 shape，只把上一层的负值截断为 0，让正激活继续向后传播。',
        'The ReLU layer keeps the same shape, clips negative values to 0, and lets positive activations continue forward.',
      ),
    )
  }

  if (layer.kind === 'pool') {
    return localized(
      loc(
        'MaxPool 层在每个 channel 内取 2×2 window 的最大值，保留强激活并缩小空间尺寸。',
        'The MaxPool layer takes the maximum in each 2x2 window per channel, preserving strong activations while shrinking spatial size.',
      ),
    )
  }

  if (layer.kind === 'flatten') {
    return localized(
      loc(
        'Flatten 层把三维 feature maps 排成长向量；它不学习参数，只改变分类头能读取的索引方式。',
        'The Flatten layer lines up the 3D feature maps into a long vector; it learns no parameters and only changes how the classifier reads indices.',
      ),
    )
  }

  return localized(
    loc(
      'Dense/Softmax 层把向量项加权求和成 logits，再归一化为类别概率。',
      'The Dense/Softmax layer turns vector entries into logits with weighted sums, then normalizes them into class probabilities.',
    ),
  )
}

function layerParameterFormula(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  const inputShape = formatShape(layer.inputShape)
  const outputShape = formatShape(layer.outputShape)

  if (layer.kind === 'conv') {
    const kernel = kernelSizeForNode(node)
    const kernelRows = kernel?.rows ?? 3
    const kernelCols = kernel?.cols ?? 3
    const inputChannels = Math.max(1, node.inputLinks.length)
    const outputChannels = Math.max(1, layer.nodes.length)
    const perFilter = kernelRows * kernelCols * inputChannels + 1
    return `(k_h×k_w×C_in + bias)×C_out = (${kernelRows}×${kernelCols}×${inputChannels}+1)×${outputChannels} = ${perFilter}×${outputChannels} = ${layer.parameterCount}`
  }

  if (layer.kind === 'dense') {
    const inputTerms = Math.max(1, node.inputLinks.length)
    const outputTerms = Math.max(1, layer.nodes.length)
    return `(inputs + bias)×classes = (${inputTerms}+1)×${outputTerms} = ${layer.parameterCount}; softmax(${outputTerms} logits)`
  }

  if (layer.kind === 'pool') return `${inputShape} → ${outputShape}; max over 2×2 windows, stride 2, ${copy.value.noParams}`
  if (layer.kind === 'flatten') return `${inputShape} → ${outputShape}; (channel,row,col) → vector index, ${copy.value.noParams}`
  if (layer.kind === 'relu') return `${inputShape} → ${outputShape}; y = max(0, x), ${copy.value.noParams}`
  return `${inputShape} → ${outputShape}; normalize RGB values, ${copy.value.noParams}`
}

function connectionSummaries(links: CnnLinkSnapshot[], direction: 'incoming' | 'outgoing') {
  const maxVisible = 8
  const orderedLinks = [...links].sort((left, right) => {
    const leftWeight = typeof left.weight === 'number' ? Math.abs(left.weight) : 0
    const rightWeight = typeof right.weight === 'number' ? Math.abs(right.weight) : 0
    return rightWeight - leftWeight
  })

  return {
    visible: orderedLinks.slice(0, maxVisible).map((link, index) => connectionSummary(link, direction, index)),
    hiddenCount: Math.max(0, links.length - maxVisible),
  }
}

function connectionSummary(link: CnnLinkSnapshot, direction: 'incoming' | 'outgoing', index: number): CnnConnectionSummary {
  const layerIndex = direction === 'incoming' ? link.sourceLayerIndex : link.targetLayerIndex
  const nodeIndex = direction === 'incoming' ? link.sourceNodeIndex : link.targetNodeIndex
  const layerName = layers.value[layerIndex]?.name ?? `layer ${layerIndex}`
  const weightText = connectionWeightText(link)
  const positionText = link.sourcePosition
    ? `${copy.value.row} ${link.sourcePosition.row}, ${copy.value.col} ${link.sourcePosition.col}`
    : ''
  const detail = [weightText, positionText].filter(Boolean).join(' · ') || localized(loc('同一 channel', 'same channel'))

  return {
    id: `${direction}-${link.sourceLayerIndex}-${link.sourceNodeIndex}-${link.targetLayerIndex}-${link.targetNodeIndex}-${index}`,
    label: `${layerName}[${nodeIndex}]`,
    detail,
    layerIndex,
    nodeIndex,
  }
}

function connectionWeightText(link: CnnLinkSnapshot) {
  if (typeof link.weight === 'number') return `w ${formatNumber(link.weight)}`
  if (isMatrix(link.weight)) return `${copy.value.kernel} ${link.weight.length}×${link.weight[0]?.length ?? 0}`
  return ''
}

function preferredTraceInputLink(node: CnnNodeSnapshot, focus: CnnOverviewNodeFocus) {
  if (!node.inputLinks.length) return undefined

  if (node.kind === 'dense' && activeDenseSourceIndex.value !== undefined) {
    const focusedLink = node.inputLinks.find((link) => link.sourceNodeIndex === activeDenseSourceIndex.value)
    if (focusedLink) return focusedLink
  }

  if (node.kind === 'conv' && node.layerIndex === focus.layerIndex && node.index === focus.nodeIndex) {
    const focusedChannel = activeConvContribution.value?.channelIndex ?? focusedOverviewChannel.value
    const focusedLink = node.inputLinks.find((link) => link.sourceNodeIndex === focusedChannel)
    if (focusedLink) return focusedLink
  }

  const sameIndexLink = node.inputLinks.find((link) => link.sourceNodeIndex === node.index)
  if (sameIndexLink && (node.kind === 'relu' || node.kind === 'pool')) return sameIndexLink

  return strongestLink(node.inputLinks, 'input')
}

function preferredTraceOutputLink(node: CnnNodeSnapshot, focus: CnnOverviewNodeFocus) {
  if (!node.outputLinks.length) return undefined

  const nextLayer = layers.value[node.outputLinks[0]?.targetLayerIndex]
  if (nextLayer?.kind === 'dense') {
    const targetIndex = activeSoftmaxIndex.value ?? selectedNodeIndex.value
    const classLink = node.outputLinks.find((link) => link.targetNodeIndex === targetIndex)
    if (classLink) return classLink
  }

  const sameIndexLink = node.outputLinks.find((link) => link.targetNodeIndex === node.index)
  if (sameIndexLink && nextLayer && (nextLayer.kind === 'relu' || nextLayer.kind === 'pool' || nextLayer.kind === 'flatten')) return sameIndexLink

  if (node.layerIndex === focus.layerIndex && node.index === focus.nodeIndex) {
    const selectedTarget = node.outputLinks.find((link) => link.targetLayerIndex === selectedLayerIndex.value && link.targetNodeIndex === selectedNodeIndex.value)
    if (selectedTarget) return selectedTarget
  }

  return strongestLink(node.outputLinks, 'output')
}

function strongestLink(links: CnnLinkSnapshot[], direction: 'input' | 'output') {
  return [...links].sort((left, right) => linkStrength(right, direction) - linkStrength(left, direction))[0]
}

function linkStrength(link: CnnLinkSnapshot, direction: 'input' | 'output') {
  const sourceNode = layers.value[link.sourceLayerIndex]?.nodes.find((node) => node.index === link.sourceNodeIndex)
  const targetNode = layers.value[link.targetLayerIndex]?.nodes.find((node) => node.index === link.targetNodeIndex)
  const weighted = weightMagnitude(link.weight)
  const sourceValue = Math.abs(numberFromOutput(sourceNode?.output ?? 0))
  const targetValue = Math.abs(numberFromOutput(targetNode?.output ?? 0))
  const value = direction === 'input' ? sourceValue : targetValue
  return Math.max(1e-8, weighted) * Math.max(1e-4, value)
}

function weightMagnitude(weight: CnnLinkSnapshot['weight']) {
  if (typeof weight === 'number') return Math.abs(weight)
  if (Array.isArray(weight)) {
    const values = weight.flat(Number.POSITIVE_INFINITY) as number[]
    const finite = values.filter((value) => Number.isFinite(value))
    if (!finite.length) return 1
    return finite.reduce((sum, value) => sum + Math.abs(value), 0) / finite.length
  }
  return 1
}

function isSelectedNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  return selectedOverviewNodeKey.value === overviewNodeKey(layer.index, node.index)
}

function isFocusedOverviewNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  return focusedOverviewNode.value?.layerIndex === layer.index && focusedOverviewNode.value.nodeIndex === node.index
}

function isRelatedOverviewNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  return relatedOverviewNodeKeys.value.has(overviewNodeKey(layer.index, node.index))
}

function isTraceOverviewNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  return overviewTraceNodeKeys.value.has(overviewNodeKey(layer.index, node.index))
}

function isMutedOverviewNode(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  return Boolean(activeOverviewNode.value) && !isRelatedOverviewNode(layer, node)
}

function overviewTraceStepToneLabel(tone: CnnOverviewTraceStep['tone']) {
  if (tone === 'input') return copy.value.inputTrace
  if (tone === 'output') return copy.value.outputTrace
  return copy.value.currentTrace
}

function focusOverviewTraceStep(step: CnnOverviewTraceStep) {
  const layer = layers.value[step.layerIndex]
  const node = layer?.nodes.find((item) => item.index === step.nodeIndex)
  if (!layer || !node) return
  focusOverviewNode(layer, node)
}

function selectOverviewTraceStep(step: CnnOverviewTraceStep) {
  selectLayer(step.layerIndex, step.nodeIndex)
  focusOverviewTraceStep(step)
}

function colorForValue(value: number, range = selectedLayerRange.value) {
  if (selectedLayer.value?.kind === 'input') return interpolateGreys(normalize(value, range[0], range[1]))
  return interpolateRdBu(1 - normalize(value, range[0], range[1]))
}

function colorForOverviewValue(layer: CnnLayerSnapshot, value: number) {
  const [min, max] = scaledLayerRange(layer)
  if (layer.kind === 'dense' || colorMode.value === 'logits') return interpolateOranges(normalize(value, min, max))
  if (layer.kind === 'input') return interpolateGreys(normalize(value, min, max))
  return interpolateRdBu(1 - normalize(value, min, max))
}

function overviewThumbnailHref(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  if (!isMatrix(node.output) || typeof document === 'undefined') return ''
  const cacheKey = `${layer.id}:${node.id}:${colorMode.value}:${scaleMode.value}`
  const cached = overviewThumbnailCache.get(cacheKey)
  if (cached) return cached

  const href = renderOverviewThumbnailPng(layer, node.output)
  if (href) overviewThumbnailCache.set(cacheKey, href)
  return href
}

function renderOverviewThumbnailPng(layer: CnnLayerSnapshot, matrix: number[][]) {
  const rowCount = matrix.length
  const colCount = matrix[0]?.length ?? 0
  if (!rowCount || !colCount) return ''

  const canvas = document.createElement('canvas')
  const size = nodeLength * 3
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return ''

  const image = context.createImageData(size, size)
  const pixels = image.data
  for (let y = 0; y < size; y += 1) {
    const sourceRow = Math.min(rowCount - 1, Math.floor((y / size) * rowCount))
    for (let x = 0; x < size; x += 1) {
      const sourceCol = Math.min(colCount - 1, Math.floor((x / size) * colCount))
      const color = rgb(colorForOverviewValue(layer, matrix[sourceRow]?.[sourceCol] ?? 0))
      const offset = (y * size + x) * 4
      pixels[offset] = color.r
      pixels[offset + 1] = color.g
      pixels[offset + 2] = color.b
      pixels[offset + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

function colorForPatchValue(value: number, matrix: number[][] | undefined) {
  const [min, max] = rangeFromMatrix(matrix)
  return interpolateRdBu(1 - normalize(value, min, max))
}

function colorForInputChannelValue(value: number, tone: CnnInputChannelPreview['tone']) {
  const intensity = normalizedToRawPixel(value)
  if (tone === 'red') return `rgb(${intensity}, 24, 24)`
  if (tone === 'green') return `rgb(24, ${intensity}, 86)`
  return `rgb(30, 84, ${intensity})`
}

function colorForKernelValue(value: number, matrix: number[][] | undefined) {
  const [min, max] = rangeFromMatrix(matrix)
  return interpolateBrBG(normalize(value, min, max) * 0.72 + 0.14)
}

function colorForLogitValue(value: number) {
  return interpolateOranges(normalize(value, logitRange.value[0], logitRange.value[1]))
}

function colorForProductValue(value: number, matrix: number[][] | undefined) {
  const [min, max] = rangeFromMatrix(matrix)
  return interpolateRdBu(1 - normalize(value, min, max))
}

function colorForDenseContributionValue(value: number, maxMagnitude: number) {
  const alpha = Math.min(0.86, 0.14 + normalize(Math.abs(value), 0, maxMagnitude) * 0.72)
  if (value < 0) return `rgba(185, 28, 28, ${alpha})`
  return `rgba(15, 118, 110, ${alpha})`
}

function legendGradient(range: [number, number], colorForRangeValue: (value: number) => string) {
  const [min, max] = range
  const middle = (min + max) / 2
  return `linear-gradient(90deg, ${colorForRangeValue(min)} 0%, ${colorForRangeValue(middle)} 50%, ${colorForRangeValue(max)} 100%)`
}

function legendStops(range: [number, number], colorForRangeValue: (value: number) => string): CnnLegendStop[] {
  const [min, max] = range
  return [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    offset: `${Math.round(ratio * 100)}%`,
    color: colorForRangeValue(min + (max - min) * ratio),
  }))
}

function legendMarkerPosition(value: number, range: [number, number]) {
  return `${Math.round(normalize(value, range[0], range[1]) * 100)}%`
}

function overviewLegendMarkerX(legend: CnnColorLegend) {
  const percent = Number.parseFloat(legend.markerPosition)
  const ratio = Number.isFinite(percent) ? Math.min(1, Math.max(0, percent / 100)) : 0.5
  return overviewLegendX + ratio * overviewLegendWidth
}

function denseWeightBarWidth(value: number) {
  return `${Math.round((Math.abs(value) / denseWeightMagnitudeMax.value) * 100)}%`
}

function matrixGridStyle(matrix: number[][] | undefined) {
  return {
    gridTemplateColumns: `repeat(${matrix?.[0]?.length ?? 1}, minmax(0, 1fr))`,
  }
}

function hyperGridStyle(size: number) {
  return {
    gridTemplateColumns: `repeat(${Math.max(1, size)}, minmax(0, 1fr))`,
  }
}

function sampleGridStyle(rows: { value: number; row: number; col: number }[][] | undefined) {
  return {
    gridTemplateColumns: `repeat(${rows?.[0]?.length ?? 1}, minmax(0, 1fr))`,
  }
}

function scanGridStyle(rows: CnnDetailScanCell[][]) {
  const colCount = rows[0]?.length ?? 1
  const cellSize = colCount > 48 ? '0.34rem' : colCount > 28 ? '0.42rem' : '0.55rem'
  return {
    gridTemplateColumns: `repeat(${colCount}, ${cellSize})`,
  }
}

function bridgeOverlayStyle(row: number, col: number, rowSpan: number, colSpan: number, matrix: number[][]) {
  const rowCount = Math.max(1, matrix.length)
  const colCount = Math.max(1, matrix[0]?.length ?? 1)
  const boundedRow = Math.min(Math.max(0, row), rowCount - 1)
  const boundedCol = Math.min(Math.max(0, col), colCount - 1)
  const boundedRowSpan = Math.min(Math.max(1, rowSpan), rowCount - boundedRow)
  const boundedColSpan = Math.min(Math.max(1, colSpan), colCount - boundedCol)

  return {
    top: `${(boundedRow / rowCount) * 100}%`,
    left: `${(boundedCol / colCount) * 100}%`,
    height: `${(boundedRowSpan / rowCount) * 100}%`,
    width: `${(boundedColSpan / colCount) * 100}%`,
  }
}

function isBridgeSourceSampleSelected(row: number, col: number) {
  const bridge = spatialBridge.value
  if (!bridge) return false
  const rowStart = bridge.sourceWindow.row
  const colStart = bridge.sourceWindow.col
  return row >= rowStart && row < rowStart + bridge.sourceWindow.size && col >= colStart && col < colStart + bridge.sourceWindow.size
}

function isBridgeOutputSampleSelected(row: number, col: number) {
  return spatialBridge.value?.outputCell.row === row && spatialBridge.value.outputCell.col === col
}

function rangeFromMatrix(matrix: number[][] | undefined): [number, number] {
  return rangeFromValues(matrix?.flat() ?? [])
}

function isFlattenSourceCell(rowIndex: number, colIndex: number) {
  const source = selectedDetail.value?.flattenSource
  return source?.row === rowIndex && source.col === colIndex
}

function isPoolMaxCell(rowIndex: number, colIndex: number) {
  const detail = selectedDetail.value
  if (detail?.kind !== 'pool') return false
  return detail.poolMaxPosition?.row === selectedRow.value * 2 + rowIndex && detail.poolMaxPosition.col === selectedCol.value * 2 + colIndex
}

function poolWindowWinner(matrix: number[][], outputRow: number, outputCol: number, poolSize = 2, stride = 2) {
  const rowStart = outputRow * stride
  const colStart = outputCol * stride
  let winner: { row: number; col: number; value: number } | undefined

  for (let rowOffset = 0; rowOffset < poolSize; rowOffset += 1) {
    for (let colOffset = 0; colOffset < poolSize; colOffset += 1) {
      const row = rowStart + rowOffset
      const col = colStart + colOffset
      const value = matrix[row]?.[col]
      if (value === undefined || !Number.isFinite(value)) continue
      if (!winner || value > winner.value) {
        winner = { row, col, value }
      }
    }
  }

  return winner
}

function poolWindowCellCount(matrix: number[][], outputRow: number, outputCol: number, poolSize = 2, stride = 2) {
  const rowStart = outputRow * stride
  const colStart = outputCol * stride
  let count = 0

  for (let rowOffset = 0; rowOffset < poolSize; rowOffset += 1) {
    for (let colOffset = 0; colOffset < poolSize; colOffset += 1) {
      const value = matrix[rowStart + rowOffset]?.[colStart + colOffset]
      if (value !== undefined && Number.isFinite(value)) count += 1
    }
  }

  return count
}

function scaledLayerRange(layer: CnnLayerSnapshot): [number, number] {
  return layerColorRanges.value[scaleMode.value][layer.index] ?? layerRange(layer)
}

function layerRange(layer: CnnLayerSnapshot | undefined): [number, number] {
  const values = layer?.nodes.flatMap((node) => flattenOutput(node.output)) ?? []
  return rangeFromValues(values)
}

function normalize(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return 0.5
  return Math.min(1, Math.max(0, (value - min) / Math.max(1e-8, max - min)))
}

function flattenOutput(output: number | number[][]) {
  return typeof output === 'number' ? [output] : output.flat()
}

function numberFromOutput(output: number | number[][]) {
  return typeof output === 'number' ? output : 0
}

function overviewCells(layer: CnnLayerSnapshot, node: CnnNodeSnapshot) {
  const output = node.output
  if (typeof output === 'number') {
    const normalizedWidth = normalize(output, ...scaledLayerRange(layer)) * nodeLength
    return [
      {
        x: 0,
        y: 0,
        width: Math.max(2, normalizedWidth),
        height: nodeLength,
        value: output,
      },
    ]
  }

  const rowStep = Math.max(1, Math.floor(output.length / heatmapGridSize))
  const colStep = Math.max(1, Math.floor((output[0]?.length ?? 1) / heatmapGridSize))
  const cells: { x: number; y: number; width: number; height: number; value: number }[] = []

  for (let rowIndex = 0; rowIndex < heatmapGridSize; rowIndex += 1) {
    for (let colIndex = 0; colIndex < heatmapGridSize; colIndex += 1) {
      const sourceRow = Math.min(output.length - 1, rowIndex * rowStep)
      const sourceCol = Math.min((output[sourceRow]?.length ?? 1) - 1, colIndex * colStep)
      cells.push({
        x: colIndex * heatmapCellSize,
        y: rowIndex * heatmapCellSize,
        width: heatmapCellSize,
        height: heatmapCellSize,
        value: output[sourceRow]?.[sourceCol] ?? 0,
      })
    }
  }

  return cells
}

function overviewLocalWindows(layer: CnnLayerSnapshot, node: CnnNodeSnapshot): CnnOverviewLocalWindow[] {
  if (!isMatrix(node.output)) return []
  const windows: CnnOverviewLocalWindow[] = []
  const sourceWindow = overviewSourceWindow(layer, node)
  const outputWindow = overviewOutputWindow(layer, node)
  if (sourceWindow) windows.push(sourceWindow)
  if (outputWindow) windows.push(outputWindow)
  return windows
}

function overviewOutputWindow(layer: CnnLayerSnapshot, node: CnnNodeSnapshot): CnnOverviewLocalWindow | undefined {
  if (selectedLayerIndex.value !== layer.index || selectedNodeIndex.value !== node.index) return undefined
  if (!isMatrix(node.output)) return undefined
  return overviewWindowBox(`overview-output-${node.id}`, 'output', selectedRow.value, selectedCol.value, 1, 1, node.output, {
    layer,
    node,
    targetLayerName: layer.name,
    targetNodeIndex: node.index,
  })
}

function overviewSourceWindow(layer: CnnLayerSnapshot, node: CnnNodeSnapshot): CnnOverviewLocalWindow | undefined {
  const detail = selectedDetail.value
  const targetNode = selectedNode.value
  if (!detail || !targetNode || !isMatrix(node.output) || !['conv', 'relu', 'pool'].includes(detail.kind)) return undefined

  const link = targetNode.inputLinks.find((inputLink) => inputLink.sourceLayerIndex === layer.index && inputLink.sourceNodeIndex === node.index)
  if (!link) return undefined

  const span = detail.kind === 'conv'
    ? (detail.channelContributions?.[0]?.patch.length ?? 3)
    : detail.kind === 'pool'
      ? (detail.poolWindow?.length ?? 2)
      : 1
  const sourceRow = detail.kind === 'pool' ? selectedRow.value * 2 : selectedRow.value
  const sourceCol = detail.kind === 'pool' ? selectedCol.value * 2 : selectedCol.value

  return overviewWindowBox(`overview-source-${node.id}`, 'source', sourceRow, sourceCol, span, span, node.output, {
    layer,
    node,
    targetLayerName: targetNode.layerName,
    targetNodeIndex: targetNode.index,
  })
}

function overviewWindowBox(
  id: string,
  kind: CnnOverviewLocalWindow['kind'],
  row: number,
  col: number,
  rowSpan: number,
  colSpan: number,
  matrix: number[][],
  meta: {
    layer: CnnLayerSnapshot
    node: CnnNodeSnapshot
    targetLayerName: string
    targetNodeIndex: number
  },
): CnnOverviewLocalWindow {
  const rowCount = Math.max(1, matrix.length)
  const colCount = Math.max(1, matrix[0]?.length ?? 1)
  const boundedRow = Math.min(Math.max(0, row), rowCount - 1)
  const boundedCol = Math.min(Math.max(0, col), colCount - 1)
  const boundedRowSpan = Math.min(Math.max(1, rowSpan), rowCount - boundedRow)
  const boundedColSpan = Math.min(Math.max(1, colSpan), colCount - boundedCol)
  const rawHeight = (boundedRowSpan / rowCount) * nodeLength
  const rawWidth = (boundedColSpan / colCount) * nodeLength
  const height = Math.min(nodeLength, Math.max(3, rawHeight))
  const width = Math.min(nodeLength, Math.max(3, rawWidth))
  const y = Math.min(nodeLength - height, (boundedRow / rowCount) * nodeLength)
  const x = Math.min(nodeLength - width, (boundedCol / colCount) * nodeLength)

  return {
    id,
    kind,
    x,
    y,
    width,
    height,
    row: boundedRow,
    col: boundedCol,
    rowSpan: boundedRowSpan,
    colSpan: boundedColSpan,
    value: matrix[boundedRow]?.[boundedCol] ?? 0,
    layerIndex: meta.layer.index,
    nodeIndex: meta.node.index,
    layerName: meta.layer.name,
    targetLayerName: meta.targetLayerName,
    targetNodeIndex: meta.targetNodeIndex,
  }
}

function overviewWindowTitle(window: CnnOverviewLocalWindow) {
  const label = window.kind === 'source' ? copy.value.inputWindow : copy.value.outputCell
  return `${label} · ${window.layerName}[${window.nodeIndex}]`
}

function overviewWindowAriaLabel(window: CnnOverviewLocalWindow) {
  return `${overviewWindowTitle(window)} · ${copy.value.row} ${window.row}, ${copy.value.col} ${window.col}`
}

function overviewWindowDescription(window: CnnOverviewLocalWindow) {
  const selectedKind = selectedDetail.value?.kind ?? selectedLayer.value?.kind
  const rowCol = `${copy.value.row} ${window.row}, ${copy.value.col} ${window.col}`
  const valueText = formatNumber(window.value)
  const spanText = `${window.rowSpan}×${window.colSpan}`

  if (window.kind === 'source' && selectedKind === 'conv') {
    return localized(
      loc(
        `${window.layerName}[${window.nodeIndex}] 的 ${spanText} patch 从 ${rowCol} 开始，和 ${window.targetLayerName}[${window.targetNodeIndex}] 对应 channel 的 kernel 逐格相乘；左上值为 ${valueText}。`,
        `${window.layerName}[${window.nodeIndex}] provides the ${spanText} patch starting at ${rowCol}; it is multiplied cell-by-cell with the matching channel kernel for ${window.targetLayerName}[${window.targetNodeIndex}]. The top-left value is ${valueText}.`,
      ),
    )
  }

  if (window.kind === 'source' && selectedKind === 'pool') {
    return localized(
      loc(
        `${window.layerName}[${window.nodeIndex}] 的 ${spanText} window 从 ${rowCol} 开始，MaxPool 只把这个窗口中的最大值传给 ${window.targetLayerName}[${window.targetNodeIndex}]。`,
        `${window.layerName}[${window.nodeIndex}] provides the ${spanText} window starting at ${rowCol}; MaxPool forwards only the largest value to ${window.targetLayerName}[${window.targetNodeIndex}].`,
      ),
    )
  }

  if (window.kind === 'source' && selectedKind === 'relu') {
    return localized(
      loc(
        `${window.layerName}[${window.nodeIndex}] 在 ${rowCol} 的值是 ${valueText}，ReLU 会判断它小于 0 还是大于 0，再决定截断或保留。`,
        `${window.layerName}[${window.nodeIndex}] has value ${valueText} at ${rowCol}; ReLU checks whether it is below or above zero before clipping or keeping it.`,
      ),
    )
  }

  if (window.kind === 'output' && selectedKind === 'conv') {
    return localized(
      loc(
        `黑框是 ${window.targetLayerName}[${window.targetNodeIndex}] 在 ${rowCol} 的输出 cell，值为 ${valueText}；它来自所有输入 channel 的 patch 求和再加 bias。`,
        `The black frame is the output cell of ${window.targetLayerName}[${window.targetNodeIndex}] at ${rowCol}, value ${valueText}; it comes from all input-channel patch sums plus bias.`,
      ),
    )
  }

  if (window.kind === 'output' && selectedKind === 'pool') {
    return localized(
      loc(
        `黑框是 ${window.targetLayerName}[${window.targetNodeIndex}] 在 ${rowCol} 的池化输出，值为 ${valueText}；它对应左侧 2×2 window 的最大值。`,
        `The black frame is the pooled output of ${window.targetLayerName}[${window.targetNodeIndex}] at ${rowCol}, value ${valueText}; it equals the maximum from the 2x2 source window.`,
      ),
    )
  }

  if (window.kind === 'output' && selectedKind === 'relu') {
    return localized(
      loc(
        `黑框是 ${window.targetLayerName}[${window.targetNodeIndex}] 在 ${rowCol} 的 ReLU 输出，值为 ${valueText}；负输入会变成 0，正输入保持原值。`,
        `The black frame is the ReLU output of ${window.targetLayerName}[${window.targetNodeIndex}] at ${rowCol}, value ${valueText}; negative inputs become 0 and positive inputs stay unchanged.`,
      ),
    )
  }

  return localized(
    loc(
      `${window.layerName}[${window.nodeIndex}] 在 ${rowCol} 的当前值为 ${valueText}。`,
      `${window.layerName}[${window.nodeIndex}] has current value ${valueText} at ${rowCol}.`,
    ),
  )
}

function isFocusedOverviewWindow(window: CnnOverviewLocalWindow) {
  const focus = focusedOverviewWindow.value
  return focus?.kind === window.kind && focus.layerIndex === window.layerIndex && focus.nodeIndex === window.nodeIndex
}

function isFocusedContribution(channelIndex: number) {
  return focusedOverviewChannel.value === channelIndex
}

function isScoreHighlighted(score: CnnClassScore) {
  const index = activeSoftmaxIndex.value
  return index !== undefined && scores.value[index]?.id === score.id
}

function isFocusedConvMathCell(channelIndex: number, row: number, col: number) {
  const term = focusedConvMathTerm.value
  return term?.channelIndex === channelIndex && term.row === row && term.col === col
}

function sampleMatrix(matrix: number[][] | undefined, maxRows: number, maxCols: number) {
  if (!matrix?.length || !matrix[0]?.length) return []
  const rowStep = Math.max(1, Math.floor(matrix.length / maxRows))
  const colStep = Math.max(1, Math.floor(matrix[0].length / maxCols))
  const rows: CnnMatrixCell[][] = []

  for (let row = 0; row < matrix.length; row += rowStep) {
    const cells: CnnMatrixCell[] = []
    for (let col = 0; col < matrix[row]!.length; col += colStep) {
      cells.push({ value: matrix[row]![col]!, row, col })
      if (cells.length >= maxCols) break
    }
    rows.push(cells)
    if (rows.length >= maxRows) break
  }

  return rows
}

function sampleMatrixWithSelected(matrix: number[][], maxRows: number, maxCols: number, selectedRowIndex: number, selectedColIndex: number) {
  const rows = sampleMatrix(matrix, maxRows, maxCols)
  if (!rows.length) return rows
  const targetRow = Math.min(Math.max(0, selectedRowIndex), Math.max(0, matrix.length - 1))
  const targetCol = Math.min(Math.max(0, selectedColIndex), Math.max(0, (matrix[0]?.length ?? 1) - 1))
  if (rows.some((row) => row.some((cell) => cell.row === targetRow && cell.col === targetCol))) return rows

  let nearestRowIndex = 0
  let nearestRowDistance = Number.POSITIVE_INFINITY
  rows.forEach((row, rowIndex) => {
    const distance = Math.abs((row[0]?.row ?? 0) - targetRow)
    if (distance < nearestRowDistance) {
      nearestRowDistance = distance
      nearestRowIndex = rowIndex
    }
  })

  const targetSampleRow = rows[nearestRowIndex]
  if (!targetSampleRow?.length) return rows
  let nearestColIndex = 0
  let nearestColDistance = Number.POSITIVE_INFINITY
  targetSampleRow.forEach((cell, colIndex) => {
    const distance = Math.abs(cell.col - targetCol)
    if (distance < nearestColDistance) {
      nearestColDistance = distance
      nearestColIndex = colIndex
    }
  })
  targetSampleRow[nearestColIndex] = { value: matrix[targetRow]?.[targetCol] ?? 0, row: targetRow, col: targetCol }
  return rows
}

function matrixWindowAround(
  matrix: number[][],
  centerRow: number,
  centerCol: number,
  radius: number,
  selectedCellRow = centerRow,
  selectedCellCol = centerCol,
): CnnMatrixCell[][] {
  const rowCount = matrix.length
  const colCount = matrix[0]?.length ?? 0
  if (!rowCount || !colCount) return []

  const boundedRow = Math.min(Math.max(0, centerRow), rowCount - 1)
  const boundedCol = Math.min(Math.max(0, centerCol), colCount - 1)
  const boundedSelectedRow = Math.min(Math.max(0, selectedCellRow), rowCount - 1)
  const boundedSelectedCol = Math.min(Math.max(0, selectedCellCol), colCount - 1)
  const maxRows = Math.min(rowCount, radius * 2 + 1)
  const maxCols = Math.min(colCount, radius * 2 + 1)
  const startRow = Math.min(Math.max(0, boundedRow - radius), Math.max(0, rowCount - maxRows))
  const startCol = Math.min(Math.max(0, boundedCol - radius), Math.max(0, colCount - maxCols))

  return Array.from({ length: maxRows }, (_rowValue, rowOffset) =>
    Array.from({ length: maxCols }, (_colValue, colOffset) => {
      const row = startRow + rowOffset
      const col = startCol + colOffset
      return {
        value: matrix[row]?.[col] ?? 0,
        row,
        col,
        isSelected: row === boundedSelectedRow && col === boundedSelectedCol,
      }
    }),
  )
}

function convInputWindowAround(
  matrix: number[][],
  sourceRow: number,
  sourceCol: number,
  kernelSize: number,
  radius: number,
  selectedSourceRow = sourceRow,
  selectedSourceCol = sourceCol,
): CnnMatrixCell[][] {
  const rowCount = matrix.length
  const colCount = matrix[0]?.length ?? 0
  if (!rowCount || !colCount) return []

  const boundedSourceRow = Math.min(Math.max(0, sourceRow), rowCount - 1)
  const boundedSourceCol = Math.min(Math.max(0, sourceCol), colCount - 1)
  const boundedSelectedRow = Math.min(Math.max(0, selectedSourceRow), rowCount - 1)
  const boundedSelectedCol = Math.min(Math.max(0, selectedSourceCol), colCount - 1)
  const boundedKernelSize = Math.min(Math.max(1, kernelSize), Math.max(rowCount, colCount))
  const maxRows = Math.min(rowCount, radius * 2 + boundedKernelSize)
  const maxCols = Math.min(colCount, radius * 2 + boundedKernelSize)
  const startRow = Math.min(Math.max(0, boundedSourceRow - radius), Math.max(0, rowCount - maxRows))
  const startCol = Math.min(Math.max(0, boundedSourceCol - radius), Math.max(0, colCount - maxCols))

  return Array.from({ length: maxRows }, (_rowValue, rowOffset) =>
    Array.from({ length: maxCols }, (_colValue, colOffset) => {
      const row = startRow + rowOffset
      const col = startCol + colOffset
      return {
        value: matrix[row]?.[col] ?? 0,
        row,
        col,
        isSelected: row === boundedSelectedRow && col === boundedSelectedCol,
        isWindow:
          row >= boundedSelectedRow &&
          row < boundedSelectedRow + boundedKernelSize &&
          col >= boundedSelectedCol &&
          col < boundedSelectedCol + boundedKernelSize,
      }
    }),
  )
}

function poolInputWindowAround(
  matrix: number[][],
  sourceRow: number,
  sourceCol: number,
  maxPosition: { row: number; col: number } | undefined,
  poolSize: number,
  radius: number,
): CnnMatrixCell[][] {
  const rowCount = matrix.length
  const colCount = matrix[0]?.length ?? 0
  if (!rowCount || !colCount) return []

  const boundedSourceRow = Math.min(Math.max(0, sourceRow), rowCount - 1)
  const boundedSourceCol = Math.min(Math.max(0, sourceCol), colCount - 1)
  const maxRows = Math.min(rowCount, radius * 2 + poolSize)
  const maxCols = Math.min(colCount, radius * 2 + poolSize)
  const startRow = Math.min(Math.max(0, boundedSourceRow - radius), Math.max(0, rowCount - maxRows))
  const startCol = Math.min(Math.max(0, boundedSourceCol - radius), Math.max(0, colCount - maxCols))

  return Array.from({ length: maxRows }, (_rowValue, rowOffset) =>
    Array.from({ length: maxCols }, (_colValue, colOffset) => {
      const row = startRow + rowOffset
      const col = startCol + colOffset
      return {
        value: matrix[row]?.[col] ?? 0,
        row,
        col,
        isWindow: row >= boundedSourceRow && row < boundedSourceRow + poolSize && col >= boundedSourceCol && col < boundedSourceCol + poolSize,
        isMax: maxPosition?.row === row && maxPosition.col === col,
      }
    }),
  )
}

function formatNumber(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return '0'
  return `${roundCnnValue(value, 4)}`
}

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`
}

function isMatrix(output: unknown): output is number[][] {
  return Array.isArray(output) && Array.isArray(output[0])
}

function createDefaultInputImage() {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 96
  canvas.height = 96

  if (!context) return ''

  const gradient = context.createLinearGradient(0, 0, 96, 96)
  gradient.addColorStop(0, '#f97316')
  gradient.addColorStop(0.5, '#fef3c7')
  gradient.addColorStop(1, '#0f766e')
  context.fillStyle = gradient
  context.fillRect(0, 0, 96, 96)
  context.fillStyle = '#111827'
  context.fillRect(16, 58, 64, 10)
  context.fillStyle = '#2563eb'
  context.beginPath()
  context.arc(48, 38, 18, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 5
  context.strokeRect(22, 22, 52, 52)

  return canvas.toDataURL('image/png')
}

function createSampleImages() {
  return preloadedSampleDefinitions.map((sample, index) => ({
    id: `sample-${index}`,
    label: sample.label,
    url: withPublicBase(sample.path),
  }))
}

function buildScaleRanges(layerSnapshots: CnnLayerSnapshot[]) {
  const local = layerSnapshots.map(layerRange)
  const module = layerSnapshots.map((layer) => {
    if (layer.kind === 'input' || layer.kind === 'dense' || layer.kind === 'flatten') return layerRange(layer)
    const blockStart = layer.index <= 5 ? 1 : 6
    const blockEnd = layer.index <= 5 ? 5 : 10
    return combinedLayerRange(layerSnapshots.filter((item) => item.index >= blockStart && item.index <= blockEnd))
  })
  const globalHiddenRange = combinedLayerRange(
    layerSnapshots.filter((layer) => layer.kind === 'conv' || layer.kind === 'relu' || layer.kind === 'pool'),
  )
  const global = layerSnapshots.map((layer) =>
    layer.kind === 'conv' || layer.kind === 'relu' || layer.kind === 'pool' ? globalHiddenRange : layerRange(layer),
  )

  return { local, module, global }
}

function combinedLayerRange(layerSnapshots: CnnLayerSnapshot[]): [number, number] {
  const values = layerSnapshots.flatMap((layer) => layer.nodes.flatMap((node) => flattenOutput(node.output)))
  return rangeFromValues(values)
}

function rangeFromValues(values: number[]): [number, number] {
  if (!values.length) return [0, 1]
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }

  return min === max ? [min - 1, max + 1] : [min, max]
}
</script>

<template>
  <section class="cnn-explainer-lab" :data-status="status">
    <header class="cnn-explainer-lab__header">
      <div>
        <span>{{ copy.title }}</span>
        <strong>{{ sectionHint }}</strong>
      </div>
      <p class="cnn-explainer-lab__status" :class="`is-${status}`">{{ statusLabel }}</p>
    </header>

    <div class="cnn-explainer-lab__controls" aria-label="CNN explainer controls">
      <button type="button" class="action-button action-button--primary" @click="onUploadClick">
        {{ copy.upload }}
      </button>
      <input
        ref="fileInputRef"
        class="cnn-explainer-lab__file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="onFileChange"
      />
      <button type="button" class="action-button" :disabled="status !== 'ready' || reducedMotion" @click="togglePlayback">
        {{ isPlaying ? copy.pause : copy.play }}
      </button>
      <button type="button" class="action-button" :disabled="status !== 'ready'" @click="stepForward">
        {{ copy.step }}
      </button>
      <button type="button" class="action-button" :disabled="status !== 'ready'" @click="resetSelection">
        {{ copy.reset }}
      </button>

      <label class="cnn-explainer-lab__toggle">
        <input v-model="showDetails" type="checkbox" />
        <span>{{ copy.details }}</span>
      </label>

      <label class="cnn-explainer-lab__select">
        <span>{{ copy.color }}</span>
        <select v-model="colorMode">
          <option value="activation">{{ copy.activation }}</option>
          <option value="weights">{{ copy.weights }}</option>
          <option value="logits">{{ copy.logits }}</option>
        </select>
      </label>

      <label class="cnn-explainer-lab__select">
        <span>{{ copy.scale }}</span>
        <select v-model="scaleMode">
          <option value="local">{{ copy.local }}</option>
          <option value="module">{{ copy.module }}</option>
          <option value="global">{{ copy.global }}</option>
        </select>
      </label>
    </div>

    <p class="cnn-explainer-lab__upload-hint">{{ copy.uploadHint }}</p>
    <p v-if="reducedMotion" class="cnn-explainer-lab__notice">{{ copy.reducedMotion }}</p>
    <p v-if="fileError" class="cnn-explainer-lab__notice is-error">{{ fileError }}</p>
    <p v-if="status === 'error'" class="cnn-explainer-lab__notice is-error">{{ statusMessage || copy.fallback }}</p>

    <div class="cnn-explainer-lab__workspace">
      <aside class="cnn-explainer-lab__side">
        <section class="cnn-explainer-lab__input">
          <span>{{ copy.input }}</span>
          <div v-if="selectedImageUrl" class="cnn-input-preview">
            <img :src="selectedImageUrl" :alt="selectedImageName" />
            <b
              v-if="receptiveField"
              class="cnn-input-preview__receptive-field"
              :style="receptiveFieldOverlayStyle"
              aria-hidden="true"
            />
          </div>
          <strong>{{ selectedImageName || copy.defaultImage }}</strong>
          <div v-if="receptiveField" class="cnn-receptive-field" aria-live="polite">
            <span>{{ copy.receptiveField }}</span>
            <strong>{{ receptiveFieldRegionLabel }}</strong>
            <p>{{ receptiveFieldNarration }}</p>
            <div class="cnn-receptive-field__chips">
              <span>{{ copy.sourceChannels }} {{ receptiveFieldChannelLabel }}</span>
              <span>{{ copy.sourcePixels }} {{ receptiveField.sourceCellCount }}</span>
              <span v-if="receptiveField.sourceMapIndex !== undefined">
                {{ copy.sourceMapCell }} {{ receptiveField.sourceMapIndex }} ·
                ({{ receptiveField.sourceRow }}, {{ receptiveField.sourceCol }})
              </span>
              <span v-if="receptiveField.selectedDenseSourceIndex !== undefined">
                {{ copy.sourceVector }} v{{ receptiveField.selectedDenseSourceIndex }}
              </span>
            </div>
          </div>
          <div class="cnn-sample-strip" :aria-label="copy.classGallery">
            <button
              v-for="sample in sampleClassCards"
              :key="sample.id"
              type="button"
              :title="sample.label"
              :aria-label="sampleClassAriaLabel(sample)"
              :class="{ 'is-selected': sample.isSelected, 'is-top': sample.isTopPrediction, 'is-expected': sample.isExpectedPrediction }"
              @mouseenter="focusSampleClassCard(sample)"
              @mouseleave="clearHoverReadout"
              @focus="focusSampleClassCard(sample)"
              @blur="clearHoverReadout"
              @click="selectSampleImage(sample)"
            >
              <img :src="sample.url" :alt="sample.label" loading="eager" decoding="async" />
              <span>{{ sample.label }}</span>
              <em>{{ sample.probabilityLabel }}</em>
              <b v-if="sample.isTopPrediction">{{ copy.topClass }}</b>
            </button>
          </div>
        </section>

        <section class="cnn-score-panel">
          <span>{{ copy.score }}</span>
          <strong v-if="topPrediction">{{ topPrediction.label }} · {{ formatPercent(topPrediction.probability) }}</strong>
          <div
            v-if="selectedSample"
            class="cnn-score-panel__match"
            :class="{ 'is-match': selectedSamplePredictionMatches, 'is-miss': !selectedSamplePredictionMatches }"
          >
            <span>
              {{ copy.expectedClass }}
              <strong>{{ selectedSample.label }}</strong>
            </span>
            <span>
              {{ copy.predictedClass }}
              <strong>{{ topPrediction?.label ?? copy.fallback }}</strong>
            </span>
            <em>
              {{ selectedSamplePredictionMatches ? copy.samplePredictionMatch : copy.samplePredictionMiss }}
              <small v-if="selectedSampleScore">· {{ formatPercent(selectedSampleScore.probability) }}</small>
            </em>
          </div>
          <button
            v-for="score in sortedScores"
            :key="score.id"
            type="button"
            class="cnn-score-panel__row"
            :class="{ 'is-top': score.id === topPrediction?.id, 'is-softmax-highlighted': isScoreHighlighted(score) }"
            @mouseenter="focusScore(score)"
            @mouseleave="clearSoftmaxFocus"
            @focus="focusScore(score)"
            @blur="clearSoftmaxFocus"
            @click="selectScore(score)"
          >
            <span>{{ score.label }}</span>
            <em>{{ formatPercent(score.probability) }}</em>
            <i :style="{ width: formatPercent(score.probability) }" />
          </button>
        </section>
      </aside>

      <section class="cnn-explainer-lab__main">
        <section v-if="pipelineSteps.length" class="cnn-pipeline-rail" :aria-label="copy.pipeline">
          <div class="cnn-pipeline-rail__header">
            <span>{{ copy.pipeline }}</span>
            <strong>{{ copy.currentStage }} · {{ currentPipelineLabel }}</strong>
            <i aria-hidden="true">
              <b :style="{ width: formatPercent(pipelineProgress) }" />
            </i>
          </div>

          <div class="cnn-pipeline-rail__steps">
            <button
              v-for="step in pipelineSteps"
              :key="step.id"
              type="button"
              class="cnn-pipeline-rail__step"
              :class="[`is-${step.kind}`, `is-${step.state}`]"
              :aria-current="step.state === 'current' ? 'step' : undefined"
              @click="selectPipelineStep(step.index)"
            >
              <span>{{ step.index + 1 }}</span>
              <strong>{{ step.name }}</strong>
              <em>{{ step.kind }} · {{ step.shapeText }}</em>
              <small>{{ step.parameterText }}</small>
            </button>
          </div>
        </section>

        <section v-if="forwardStorySteps.length" class="cnn-forward-storyboard" :aria-label="copy.forwardStoryboard">
          <header>
            <div>
              <span>{{ copy.forwardStoryboard }}</span>
              <strong>{{ currentForwardStoryStep?.title ?? copy.fallback }}</strong>
            </div>
            <p>{{ copy.forwardStoryboardHint }}</p>
          </header>

          <div class="cnn-forward-storyboard__steps">
            <button
              v-for="step in forwardStorySteps"
              :key="step.id"
              type="button"
              class="cnn-forward-storyboard__step"
              :class="[`is-${step.kind}`, `is-${step.state}`]"
              :aria-current="step.state === 'current' ? 'step' : undefined"
              @mouseenter="focusForwardStoryStep(step)"
              @mouseleave="clearHoverReadout"
              @focus="focusForwardStoryStep(step)"
              @blur="clearHoverReadout"
              @click="selectForwardStoryStep(step)"
            >
              <b>{{ step.index + 1 }}</b>
              <span>{{ step.stateLabel }}</span>
              <strong>{{ step.title }}</strong>
              <em>{{ step.operator }}</em>
              <p>{{ step.body }}</p>
              <small>{{ step.inputText }} → {{ step.outputText }}</small>
              <i>
                {{ step.valueLabel }}
                <strong>{{ step.value }}</strong>
              </i>
            </button>
          </div>
        </section>

        <div class="cnn-overview" role="region" :aria-label="copy.overview" @mouseleave="clearOverviewNodeHover">
          <svg :width="svgWidth" height="318" :viewBox="`0 0 ${svgWidth} 318`" role="img" :aria-label="copy.overview">
            <g class="cnn-overview__edges">
              <line
                v-for="edge in overviewEdges"
                :key="edge.id"
                class="cnn-overview__edge"
                :class="{
                  'is-selected': edge.selected,
                  'is-incoming': edge.incoming,
                  'is-outgoing': edge.outgoing,
                  'is-trace-backward': edge.traceBackward,
                  'is-trace-forward': edge.traceForward,
                }"
                :x1="edge.x1"
                :y1="edge.y1"
                :x2="edge.x2"
                :y2="edge.y2"
              />
            </g>

            <g v-if="overviewFlowPackets.length" class="cnn-overview__flow-packets" aria-hidden="true">
              <circle
                v-for="packet in overviewFlowPackets"
                :key="packet.id"
                class="cnn-overview__flow-packet"
                :class="`is-${packet.tone}`"
                :cx="reducedMotion ? packet.x : 0"
                :cy="reducedMotion ? packet.y : 0"
                r="4"
              >
                <animateMotion
                  v-if="!reducedMotion"
                  dur="1300ms"
                  repeatCount="indefinite"
                  :path="packet.path"
                />
              </circle>
            </g>

            <g
              v-for="layer in layers"
              :key="layer.id"
              class="cnn-overview__layer"
              :class="{ 'is-selected': selectedLayerIndex === layer.index }"
              :aria-label="overviewLayerAriaLabel(layer)"
            >
              <title>{{ overviewLayerAriaLabel(layer) }}</title>
              <text class="cnn-overview__label" :x="layerX(layer.index)" y="19" text-anchor="middle">
                {{ layer.name }}
              </text>
              <text class="cnn-overview__shape" :x="layerX(layer.index)" y="35" text-anchor="middle">
                {{ layer.outputShape.join('×') }}
              </text>
              <text class="cnn-overview__recipe" :x="layerX(layer.index)" y="50" text-anchor="middle">
                {{ overviewLayerRecipe(layer) }}
              </text>
              <text class="cnn-overview__params" :x="layerX(layer.index)" y="64" text-anchor="middle">
                {{ overviewLayerParameterLabel(layer) }}
              </text>
              <path
                v-if="overviewLayerTrackPath(layer)"
                class="cnn-overview__layer-track"
                :d="overviewLayerTrackPath(layer)"
              />
              <g
                v-for="(node, nodeDisplayIndex) in visibleNodes(layer)"
                :key="node.id"
                class="cnn-overview__node"
                :class="{
                  'is-selected': isSelectedNode(layer, node),
                  'is-focused': isFocusedOverviewNode(layer, node),
                  'is-related': isRelatedOverviewNode(layer, node),
                  'is-trace': isTraceOverviewNode(layer, node),
                  'is-muted': isMutedOverviewNode(layer, node),
                  'is-dense': layer.kind === 'dense',
                  'is-top-output': layer.kind === 'dense' && isTopOverviewScore(node),
                }"
                role="button"
                tabindex="0"
                :aria-label="`${layer.name} ${node.index}`"
                :transform="overviewNodeTransform(layer, nodeDisplayIndex, visibleNodes(layer).length)"
                @mouseenter="focusOverviewNode(layer, node)"
                @mouseover="focusOverviewNode(layer, node)"
                @pointerenter="focusOverviewNode(layer, node)"
                @focus="focusOverviewNode(layer, node)"
                @focusin="focusOverviewNode(layer, node)"
                @mouseleave="clearOverviewNodeHover"
                @pointerleave="clearOverviewNodeHover"
                @blur="clearOverviewNodeHover"
                @focusout="clearOverviewNodeHover"
                @click="selectOverviewNode(layer, node)"
                @keydown.enter.prevent="selectOverviewNode(layer, node)"
                @keydown.space.prevent="selectOverviewNode(layer, node)"
              >
                <rect
                  v-for="(plate, plateIndex) in overviewStackPlates(layer, nodeDisplayIndex)"
                  :key="`${node.id}-plate-${plateIndex}`"
                  class="cnn-overview__tile-depth"
                  :x="plate.x"
                  :y="plate.y"
                  :width="plate.width"
                  :height="plate.height"
                  :opacity="plate.opacity"
                  rx="1.5"
                  ry="1.5"
                />
                <rect
                  class="cnn-overview__tile-frame"
                  :width="nodeLength"
                  :height="nodeLength"
                  rx="1.5"
                  ry="1.5"
                  :fill="layer.kind === 'dense' ? '#f8fafc' : '#ffffff'"
                />
                <image
                  v-if="isMatrix(node.output)"
                  class="cnn-overview__tile-image"
                  x="0"
                  y="0"
                  :width="nodeLength"
                  :height="nodeLength"
                  preserveAspectRatio="none"
                  :href="overviewThumbnailHref(layer, node)"
                />
                <template v-else>
                  <rect
                    v-for="(cell, cellIndex) in overviewCells(layer, node)"
                    :key="`${node.id}-cell-${cellIndex}`"
                    class="cnn-overview__tile-cell"
                    :x="cell.x"
                    :y="cell.y"
                    :width="cell.width"
                    :height="cell.height"
                    :fill="colorForOverviewValue(layer, cell.value)"
                  />
                </template>
                <rect
                  v-for="window in overviewLocalWindows(layer, node)"
                  :key="window.id"
                  class="cnn-overview__local-window"
                  :class="[`is-${window.kind}`, { 'is-focused': isFocusedOverviewWindow(window) }]"
                  :x="window.x"
                  :y="window.y"
                  :width="window.width"
                  :height="window.height"
                  rx="0.75"
                  ry="0.75"
                  role="button"
                  tabindex="0"
                  focusable="true"
                  :aria-label="overviewWindowAriaLabel(window)"
                  @mouseenter="focusOverviewWindow(window)"
                  @focus="focusOverviewWindow(window)"
                  @click.stop="commitOverviewWindow(window)"
                  @keydown.enter.stop.prevent="commitOverviewWindow(window)"
                  @keydown.space.stop.prevent="commitOverviewWindow(window)"
                >
                  <title>{{ overviewWindowTitle(window) }}</title>
                </rect>
                <rect
                  class="cnn-overview__tile-border"
                  :width="nodeLength"
                  :height="nodeLength"
                  rx="1.5"
                  ry="1.5"
                />
                <text
                  v-if="layer.kind === 'dense'"
                  class="cnn-overview__node-label"
                  :x="nodeLength + 8"
                  y="9"
                >
                  {{ outputNodeLabel(layer, node) }}
                </text>
                <g
                  v-if="layer.kind === 'dense'"
                  class="cnn-overview__dense-score"
                  :class="{ 'is-top': isTopOverviewScore(node) }"
                  :transform="`translate(${nodeLength + 8}, 13)`"
                >
                  <rect
                    class="cnn-overview__dense-rail"
                    :width="denseOverviewBarWidth"
                    :height="denseOverviewBarHeight"
                    rx="2"
                    ry="2"
                  />
                  <rect
                    class="cnn-overview__dense-bar"
                    :width="denseOverviewBarWidthValue(node)"
                    :height="denseOverviewBarHeight"
                    rx="2"
                    ry="2"
                  />
                  <text class="cnn-overview__dense-prob" :x="denseOverviewBarWidth + 6" y="5">
                    {{ denseOverviewProbabilityLabel(node) }}
                  </text>
                </g>
              </g>
              <g
                v-if="overviewHasExpandableNodes(layer)"
                class="cnn-overview__more"
                :class="{ 'is-expanded': isOverviewLayerExpanded(layer) }"
                role="button"
                tabindex="0"
                focusable="true"
                :aria-label="overviewLayerExpansionAriaLabel(layer)"
                :transform="`translate(${layerX(layer.index)}, 292)`"
                @mouseenter="focusOverviewLayerExpansion(layer)"
                @focus="focusOverviewLayerExpansion(layer)"
                @mouseleave="clearHoverReadout"
                @blur="clearHoverReadout"
                @click="toggleOverviewLayerExpansion(layer)"
                @keydown.enter.prevent="toggleOverviewLayerExpansion(layer)"
                @keydown.space.prevent="toggleOverviewLayerExpansion(layer)"
              >
                <title>{{ overviewLayerExpansionTitle(layer) }}</title>
                <circle r="13" />
                <text text-anchor="middle" dy="0.32em">{{ overviewLayerExpansionGlyph(layer) }}</text>
              </g>
            </g>

            <g v-if="showDetails && overviewColorLegend" class="cnn-overview__legend" :transform="`translate(48, 300)`">
              <defs>
                <linearGradient id="cnn-overview-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    v-for="stop in overviewColorLegend.stops"
                    :key="`overview-stop-${stop.offset}`"
                    :offset="stop.offset"
                    :stop-color="stop.color"
                  />
                </linearGradient>
              </defs>
              <text class="cnn-overview__legend-title" x="0" y="0">{{ overviewColorLegend.title }}</text>
              <rect
                class="cnn-overview__legend-ramp"
                :x="overviewLegendX"
                :y="overviewLegendY"
                :width="overviewLegendWidth"
                :height="overviewLegendHeight"
                fill="url(#cnn-overview-gradient)"
              />
              <line
                class="cnn-overview__legend-marker"
                :x1="overviewLegendMarkerX(overviewColorLegend)"
                :x2="overviewLegendMarkerX(overviewColorLegend)"
                :y1="overviewLegendY - 4"
                :y2="overviewLegendY + overviewLegendHeight + 4"
              />
              <text class="cnn-overview__legend-tick" :x="overviewLegendX" y="12" text-anchor="start">
                {{ overviewColorLegend.minLabel }}
              </text>
              <text class="cnn-overview__legend-tick" :x="overviewLegendX + overviewLegendWidth / 2" y="12" text-anchor="middle">
                {{ overviewColorLegend.midLabel }}
              </text>
              <text class="cnn-overview__legend-tick" :x="overviewLegendX + overviewLegendWidth" y="12" text-anchor="end">
                {{ overviewColorLegend.maxLabel }}
              </text>
              <text class="cnn-overview__legend-current" :x="overviewLegendX + overviewLegendWidth + 18" y="0">
                {{ overviewColorLegend.selectedLabel }} · {{ copy.currentValue }} {{ overviewColorLegend.selectedValue }}
              </text>
            </g>
          </svg>
        </div>

        <section
          v-if="overviewTraceSummary"
          class="cnn-overview-trace"
          aria-live="polite"
          @mouseleave="clearHoverReadout"
        >
          <header>
            <span>{{ copy.overviewTraceTitle }}</span>
            <strong>{{ overviewTraceSummary.title }}</strong>
            <p>{{ overviewTraceSummary.body }}</p>
          </header>
          <div class="cnn-overview-trace__counts">
            <span>{{ copy.inputTrace }} {{ overviewTraceSummary.inputCount }}</span>
            <span>{{ copy.outputTrace }} {{ overviewTraceSummary.outputCount }}</span>
          </div>
          <div class="cnn-overview-trace__steps">
            <button
              v-for="step in overviewTraceSummary.steps"
              :key="step.id"
              type="button"
              class="cnn-overview-trace__step"
              :class="`is-${step.tone}`"
              @mouseenter="focusOverviewTraceStep(step)"
              @focus="focusOverviewTraceStep(step)"
              @click="selectOverviewTraceStep(step)"
              @keydown.enter.prevent="selectOverviewTraceStep(step)"
              @keydown.space.prevent="selectOverviewTraceStep(step)"
            >
              <span>{{ overviewTraceStepToneLabel(step.tone) }}</span>
              <strong>{{ step.label }}</strong>
              <em>{{ step.detail }}</em>
            </button>
          </div>
        </section>

        <section
          v-if="overviewLayerStrip"
          class="cnn-overview-strip"
          :aria-label="copy.intermediateLayerView"
          @mouseleave="clearHoverReadout"
        >
          <header>
            <span>{{ copy.intermediateLayerView }}</span>
            <strong>{{ overviewLayerStrip.title }}</strong>
            <p>{{ overviewLayerStrip.description }}</p>
          </header>

          <div class="cnn-overview-strip__meta">
            <span>{{ copy.stripWindow }} {{ overviewLayerStrip.startIndex + 1 }}-{{ overviewLayerStrip.endIndex }} / {{ overviewLayerStrip.totalCount }}</span>
            <span v-if="overviewLayerStripCellLabel">{{ overviewLayerStripCellLabel }}</span>
            <span v-if="overviewLayerStrip.hiddenBeforeCount">+{{ overviewLayerStrip.hiddenBeforeCount }} {{ copy.hiddenBefore }}</span>
            <span v-if="overviewLayerStrip.hiddenAfterCount">+{{ overviewLayerStrip.hiddenAfterCount }} {{ copy.hiddenAfter }}</span>
          </div>

          <div class="cnn-overview-strip__items">
            <button
              v-for="item in overviewLayerStrip.items"
              :key="item.id"
              type="button"
              class="cnn-overview-strip__item"
              :class="{ 'is-selected': item.isSelected, 'is-matrix': item.isMatrix, 'has-cell-marker': item.cellStyle }"
              :aria-label="overviewLayerStripItemAriaLabel(item, overviewLayerStrip.layer)"
              @mouseenter="focusOverviewLayerStripItem(item, overviewLayerStrip.layer)"
              @mouseleave="clearHoverReadout"
              @focus="focusOverviewLayerStripItem(item, overviewLayerStrip.layer)"
              @blur="clearHoverReadout"
              @click="selectOverviewLayerStripItem(item, overviewLayerStrip.layer)"
            >
              <span>{{ item.label }}</span>
              <div class="cnn-overview-strip__media">
                <span v-if="item.cellStyle" class="cnn-overview-strip__scan-progress" aria-hidden="true">
                  <span :style="overviewLayerStripProgressStyle" />
                </span>
                <img
                  v-if="item.isMatrix"
                  :src="overviewThumbnailHref(overviewLayerStrip.layer, item.node)"
                  :alt="overviewLayerStripItemAriaLabel(item, overviewLayerStrip.layer)"
                  loading="lazy"
                  decoding="async"
                />
                <i v-else :style="{ background: item.color }" />
                <b v-if="item.cellStyle" class="cnn-overview-strip__cell-marker" :style="item.cellStyle" aria-hidden="true" />
              </div>
              <em>{{ item.valueLabel }}</em>
            </button>
          </div>
        </section>

        <section v-if="overviewLens" class="cnn-overview-node-lens" aria-live="polite">
          <header>
            <span>{{ overviewLens.eyebrow }}</span>
            <strong>{{ overviewLens.title }}</strong>
            <p>{{ overviewLens.role }}</p>
          </header>

          <div class="cnn-overview-node-lens__flow">
            <article>
              <span>{{ copy.feedsThisNode }}</span>
              <strong>{{ overviewLens.inputSummary }}</strong>
            </article>
            <div>
              <span>{{ copy.operatorLabel }}</span>
              <strong>{{ overviewLens.operator }}</strong>
            </div>
            <article>
              <span>{{ copy.passesToNext }}</span>
              <strong>{{ overviewLens.outputSummary }}</strong>
            </article>
          </div>

          <div class="cnn-overview-node-lens__facts">
            <span>
              <em>{{ copy.graphFocus }}</em>
              <strong>{{ overviewLens.title }}</strong>
            </span>
            <span>
              <em>{{ copy.focusPosition }}</em>
              <strong>{{ overviewLens.focus }}</strong>
            </span>
            <span>
              <em>{{ overviewLens.valueLabel }}</em>
              <strong>{{ overviewLens.value }}</strong>
            </span>
          </div>

          <div class="cnn-overview-node-lens__connections">
            <div>
              <span>{{ copy.incomingConnections }} · {{ selectedNode?.inputLinks.length ?? 0 }}</span>
              <div v-if="overviewLens.incoming.length">
                <button
                  v-for="connection in overviewLens.incoming"
                  :key="`lens-${connection.id}`"
                  type="button"
                  @click="selectConnectionNode(connection)"
                >
                  <strong>{{ connection.label }}</strong>
                  <small>{{ connection.detail }}</small>
                </button>
                <em v-if="overviewLens.incomingHiddenCount">+{{ overviewLens.incomingHiddenCount }} {{ copy.hiddenConnections }}</em>
              </div>
              <p v-else>{{ copy.noConnections }}</p>
            </div>

            <div>
              <span>{{ copy.outgoingConnections }} · {{ selectedNode?.outputLinks.length ?? 0 }}</span>
              <div v-if="overviewLens.outgoing.length">
                <button
                  v-for="connection in overviewLens.outgoing"
                  :key="`lens-${connection.id}`"
                  type="button"
                  @click="selectConnectionNode(connection)"
                >
                  <strong>{{ connection.label }}</strong>
                  <small>{{ connection.detail }}</small>
                </button>
                <em v-if="overviewLens.outgoingHiddenCount">+{{ overviewLens.outgoingHiddenCount }} {{ copy.hiddenConnections }}</em>
              </div>
              <p v-else>{{ copy.noConnections }}</p>
            </div>
          </div>
        </section>

        <section
          class="cnn-hover-readout"
          :class="activeHoverReadout.tone ? `is-${activeHoverReadout.tone}` : undefined"
          aria-live="polite"
        >
          <span>{{ activeHoverReadout.eyebrow }}</span>
          <strong>{{ activeHoverReadout.title }}</strong>
          <p>{{ activeHoverReadout.body }}</p>
          <em v-if="activeHoverReadout.value">{{ activeHoverReadout.value }}</em>
        </section>

        <section v-if="selectedLayer" class="cnn-layer-readout">
          <div>
            <span>{{ copy.selected }}</span>
            <strong>{{ selectedLayer.name }} · {{ selectedLayer.kind }}</strong>
          </div>
          <p>{{ layerSummary }}</p>
        </section>

        <section v-if="showDetails && propagationBridge" class="cnn-propagation-bridge">
          <header>
            <span>{{ copy.propagationBridge }}</span>
            <strong>{{ propagationBridge.title }}</strong>
            <p>{{ propagationBridge.explanation }}</p>
          </header>

          <div class="cnn-propagation-bridge__flow" :aria-label="copy.propagationBridge">
            <article>
              <span>{{ propagationBridge.inputLabel }}</span>
              <strong>{{ propagationBridge.inputShape }}</strong>
            </article>
            <div>
              <span>{{ copy.operatorLabel }}</span>
              <strong>{{ propagationBridge.operator }}</strong>
            </div>
            <article>
              <span>{{ propagationBridge.outputLabel }}</span>
              <strong>{{ propagationBridge.outputShape }}</strong>
            </article>
          </div>

          <div class="cnn-propagation-bridge__formula">
            <MarkdownMathContent :source="propagationBridge.formulaMarkdown" />
            <div>
              <span>{{ propagationBridge.valueLabel }}</span>
              <strong>{{ propagationBridge.value }}</strong>
            </div>
          </div>

          <div class="cnn-propagation-bridge__chips">
            <span v-for="chip in propagationBridge.chips" :key="`${chip.label}-${chip.value}`">
              <em>{{ chip.label }}</em>
              <strong>{{ chip.value }}</strong>
            </span>
          </div>
        </section>

        <section v-if="showDetails && layerInspector" class="cnn-layer-inspector">
          <header>
            <span>{{ copy.layerInspector }}</span>
            <strong>{{ layerInspector.title }}</strong>
            <p>{{ layerInspector.role }}</p>
          </header>

          <div class="cnn-layer-inspector__metrics">
            <div v-for="metric in layerInspector.metrics" :key="metric.label">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </div>
          </div>

          <div class="cnn-layer-inspector__formula">
            <span>{{ copy.parameterFormula }}</span>
            <code>{{ layerInspector.parameterFormula }}</code>
          </div>

          <div class="cnn-layer-inspector__connections">
            <div>
              <span>{{ copy.incomingConnections }} · {{ selectedNode?.inputLinks.length ?? 0 }}</span>
              <div v-if="layerInspector.incoming.length" class="cnn-layer-inspector__chips">
                <button
                  v-for="connection in layerInspector.incoming"
                  :key="connection.id"
                  type="button"
                  @click="selectConnectionNode(connection)"
                >
                  <strong>{{ connection.label }}</strong>
                  <small>{{ connection.detail }}</small>
                </button>
                <em v-if="layerInspector.incomingHiddenCount">+{{ layerInspector.incomingHiddenCount }} {{ copy.hiddenConnections }}</em>
              </div>
              <p v-else>{{ copy.noConnections }}</p>
            </div>

            <div>
              <span>{{ copy.outgoingConnections }} · {{ selectedNode?.outputLinks.length ?? 0 }}</span>
              <div v-if="layerInspector.outgoing.length" class="cnn-layer-inspector__chips">
                <button
                  v-for="connection in layerInspector.outgoing"
                  :key="connection.id"
                  type="button"
                  @click="selectConnectionNode(connection)"
                >
                  <strong>{{ connection.label }}</strong>
                  <small>{{ connection.detail }}</small>
                </button>
                <em v-if="layerInspector.outgoingHiddenCount">+{{ layerInspector.outgoingHiddenCount }} {{ copy.hiddenConnections }}</em>
              </div>
              <p v-else>{{ copy.noConnections }}</p>
            </div>
          </div>
        </section>

        <section v-if="showDetails" class="cnn-hyperparameter-lab">
          <header>
            <span>{{ copy.hyperparameterLab }}</span>
            <strong>{{ copy.hyperparameterLabTitle }}</strong>
            <p>{{ copy.hyperparameterLabHint }}</p>
          </header>

          <div class="cnn-hyperparameter-lab__controls">
            <label>
              <span>{{ copy.inputSize }}</span>
              <strong>{{ hyperInputSize }}×{{ hyperInputSize }}</strong>
              <input v-model.number="hyperInputSize" type="range" min="3" max="7" step="1" />
            </label>
            <label>
              <span>{{ copy.padding }}</span>
              <strong>{{ hyperPadding }}</strong>
              <input v-model.number="hyperPadding" type="range" min="0" max="3" step="1" />
            </label>
            <label>
              <span>{{ copy.kernelSize }}</span>
              <strong>{{ hyperKernelSize }}×{{ hyperKernelSize }}</strong>
              <input v-model.number="hyperKernelSize" type="range" min="1" :max="hyperKernelMax" step="1" />
            </label>
            <label>
              <span>{{ copy.stride }}</span>
              <strong>{{ hyperStride }}</strong>
              <input v-model.number="hyperStride" type="range" min="1" :max="hyperStrideMax" step="1" />
            </label>
          </div>

          <div class="cnn-hyperparameter-lab__stage" :aria-label="copy.hyperparameterLab">
            <article>
              <div>
                <span>{{ copy.paddedInput }}</span>
                <strong>{{ hyperparameterSnapshot.paddedSize }}×{{ hyperparameterSnapshot.paddedSize }}</strong>
              </div>
              <div
                class="cnn-hyper-grid cnn-hyper-grid--input"
                :style="hyperGridStyle(hyperparameterSnapshot.paddedSize)"
                :aria-label="copy.paddedInput"
              >
                <i
                  v-for="cell in hyperInputCells"
                  :key="cell.id"
                  :class="{ 'is-padding': cell.isPadding, 'is-kernel': cell.isKernel }"
                  :title="`${copy.row} ${cell.row}, ${copy.col} ${cell.col}`"
                >
                  {{ cell.label }}
                </i>
              </div>
            </article>

            <article>
              <div>
                <span>{{ copy.kernelFootprint }}</span>
                <strong>{{ hyperKernelSize }}×{{ hyperKernelSize }}</strong>
              </div>
              <div
                class="cnn-hyper-grid cnn-hyper-grid--kernel"
                :style="hyperGridStyle(hyperKernelSize)"
                :aria-label="copy.kernelFootprint"
              >
                <i v-for="cell in hyperKernelCells" :key="cell.id" class="is-kernel">
                  {{ cell.label }}
                </i>
              </div>
            </article>

            <article>
              <div>
                <span>{{ copy.outputGrid }}</span>
                <strong>{{ hyperOutputSize }}×{{ hyperOutputSize }}</strong>
              </div>
              <p>{{ copy.hoverOutputCell }}</p>
              <div
                class="cnn-hyper-grid cnn-hyper-grid--output"
                :style="hyperGridStyle(hyperOutputSize)"
                :aria-label="copy.outputGrid"
              >
                <button
                  v-for="cell in hyperOutputCells"
                  :key="cell.id"
                  type="button"
                  :class="{ 'is-selected': cell.isSelected }"
                  :aria-pressed="cell.isSelected"
                  @mouseenter="selectHyperOutputCell(cell.row, cell.col)"
                  @focus="selectHyperOutputCell(cell.row, cell.col)"
                  @click="selectHyperOutputCell(cell.row, cell.col)"
                >
                  {{ cell.label }}
                </button>
              </div>
            </article>
          </div>

          <div class="cnn-hyperparameter-lab__explain">
            <div class="cnn-hyperparameter-lab__formula">
              <span>{{ copy.shapeFormula }}</span>
              <MarkdownMathContent :source="hyperFormulaMarkdown" />
            </div>
            <div class="cnn-hyperparameter-lab__metrics">
              <div>
                <span>{{ copy.outputSize }}</span>
                <strong>{{ hyperOutputSize }}×{{ hyperOutputSize }}</strong>
              </div>
              <div>
                <span>{{ copy.selectedWindowStart }}</span>
                <strong>({{ hyperparameterSnapshot.selectedStartRow }}, {{ hyperparameterSnapshot.selectedStartCol }})</strong>
              </div>
              <div>
                <span>{{ copy.stride }}</span>
                <strong>{{ hyperStrideValid ? copy.validStride : copy.invalidStride }}</strong>
              </div>
            </div>
            <p>{{ copy.shapeLayerNote }}</p>
            <p>{{ hyperWindowNarration }}</p>
          </div>
        </section>

        <section v-if="showDetails && overviewInteractionHint" class="cnn-overview-lens">
          <span>{{ overviewInteractionHint.eyebrow }}</span>
          <strong>{{ overviewInteractionHint.title }}</strong>
          <p>{{ overviewInteractionHint.body }}</p>
        </section>

        <section
          v-if="showDetails"
          class="cnn-detail-panel"
          :class="{ 'is-playing': (isPlaying || isDetailPlaying) && !reducedMotion, 'is-detail-playing': isDetailPlaying && !reducedMotion }"
        >
          <div class="cnn-detail-panel__header">
            <div>
              <span>{{ copy.operation }}</span>
              <strong>{{ selectedNode ? `${selectedNode.layerName}[${selectedNode.index}]` : copy.fallback }}</strong>
              <em>{{ copy.detailAutoplayHint }}</em>
            </div>
            <div class="cnn-detail-panel__controls">
              <button
                type="button"
                :aria-label="isDetailPlaying ? copy.pauseDetail : copy.playDetail"
                :disabled="status !== 'ready' || reducedMotion || detailStepCount <= 1"
                @click="toggleDetailPlayback"
              >
                {{ isDetailPlaying ? 'Ⅱ' : '▶' }}
              </button>
              <button type="button" :aria-label="copy.closeDetail" @click="closeDetailPanel">×</button>
            </div>
            <div v-if="detailStepCount > 1" class="cnn-detail-panel__timeline" :aria-label="copy.detailStep">
              <span>{{ detailStepLabel }}</span>
              <div class="cnn-detail-panel__timeline-controls">
                <button type="button" :aria-label="copy.previousDetail" @click="stepDetailBackward">‹</button>
                <input
                  type="range"
                  min="0"
                  :max="Math.max(0, detailStepCount - 1)"
                  :value="detailStepIndex"
                  :aria-label="copy.detailStep"
                  @input="onDetailScrub"
                />
                <button type="button" :aria-label="copy.nextDetail" @click="stepDetailForward">›</button>
              </div>
              <i aria-hidden="true">
                <b :style="{ width: formatPercent(detailProgress) }" />
              </i>
              <div v-if="detailScanRows.length" class="cnn-detail-scan-map">
                <div class="cnn-detail-scan-map__legend">
                  <span>{{ copy.scanMap }}</span>
                  <em><i class="is-done" />{{ copy.scanDone }}</em>
                  <em><i class="is-current" />{{ copy.scanCurrent }}</em>
                  <em><i class="is-pending" />{{ copy.scanPending }}</em>
                </div>
                <div class="cnn-detail-scan-map__grid" :style="scanGridStyle(detailScanRows)">
                  <template v-for="row in detailScanRows" :key="`scan-row-${row[0]?.row ?? 0}`">
                    <button
                      v-for="cell in row"
                      :key="cell.id"
                      type="button"
                      :aria-label="cell.label"
                      :title="cell.label"
                      :class="[`is-${cell.state}`]"
                      :style="{ background: cell.state === 'current' ? colorForPatchValue(cell.value, selectedMatrix) : undefined }"
                      @mouseenter="focusDetailScanCell(cell)"
                      @focus="focusDetailScanCell(cell)"
                      @click="focusDetailScanCell(cell)"
                      @mouseleave="clearHoverReadout"
                      @blur="clearHoverReadout"
                    >
                      <span>{{ cell.label }}</span>
                    </button>
                  </template>
                </div>
                <p>{{ copy.scanPathHint }}</p>
              </div>
            </div>
            <div v-if="hasSpatialSelection" class="cnn-detail-panel__sliders">
              <label>
                <span>{{ copy.row }} {{ selectedRow }}</span>
                <input v-model.number="selectedRow" type="range" min="0" :max="rowMax" />
              </label>
              <label>
                <span>{{ copy.col }} {{ selectedCol }}</span>
                <input v-model.number="selectedCol" type="range" min="0" :max="colMax" />
              </label>
            </div>
          </div>

          <div class="cnn-detail-panel__body">
            <div class="cnn-activation-map">
              <span>{{ mapPanelTitle }}</span>

              <div v-if="colorMode === 'weights' && selectedKernelChannels.length" class="cnn-weight-kernel-bank">
                <article
                  v-for="kernelPreview in selectedKernelChannels"
                  :key="`kernel-preview-${kernelPreview.channelIndex}`"
                  class="cnn-weight-kernel-card"
                >
                  <strong>{{ copy.channel }} {{ kernelPreview.channelIndex }}</strong>
                  <div class="cnn-weight-kernel-grid" :style="matrixGridStyle(kernelPreview.kernel)">
                    <template v-for="(row, rowIndex) in kernelPreview.kernel" :key="`kernel-preview-row-${kernelPreview.channelIndex}-${rowIndex}`">
                      <i
                        v-for="(value, colIndex) in row"
                        :key="`kernel-preview-cell-${kernelPreview.channelIndex}-${rowIndex}-${colIndex}`"
                        :style="{ background: colorForKernelValue(value, kernelPreview.kernel) }"
                        @mouseenter="focusKernelWeightReadout(kernelPreview.channelIndex, rowIndex, colIndex, value)"
                        @mouseleave="clearHoverReadout"
                      >
                        {{ formatNumber(value) }}
                      </i>
                    </template>
                  </div>
                </article>
              </div>

              <div v-else-if="colorMode === 'weights' && denseWeightPreview.length" class="cnn-dense-weight-map">
                <button
                  v-for="weight in denseWeightPreview"
                  :key="`dense-weight-${weight.sourceIndex}`"
                  type="button"
                  :class="{ 'is-negative': weight.value < 0 }"
                  @mouseenter="focusDenseWeightReadout(weight)"
                  @mouseleave="clearDenseSourceFocus"
                  @focus="focusDenseWeightReadout(weight)"
                  @blur="clearDenseSourceFocus"
                  @click="selectDenseWeightSource(weight.sourceIndex)"
                >
                  <span>{{ copy.sourceVector }} v{{ weight.sourceIndex }}</span>
                  <strong>{{ formatNumber(weight.value) }}</strong>
                  <i :style="{ width: denseWeightBarWidth(weight.value) }" />
                </button>
              </div>

              <div v-else-if="colorMode === 'weights'" class="cnn-activation-map__empty">
                <p>{{ copy.noWeightView }}</p>
              </div>

              <div v-else-if="colorMode === 'logits'" class="cnn-logit-map">
                <button
                  v-for="score in logitPreviewRows"
                  :key="`logit-map-${score.id}`"
                  type="button"
                  :class="{ 'is-selected': score.selected, 'is-top': score.id === topPrediction?.id, 'is-highlighted': score.highlighted }"
                  @mouseenter="focusScore(score)"
                  @mouseleave="clearSoftmaxFocus"
                  @focus="focusScore(score)"
                  @blur="clearSoftmaxFocus"
                  @click="selectScore(score)"
                >
                  <span>{{ score.label }}</span>
                  <strong>{{ formatNumber(score.logit) }}</strong>
                  <em>{{ formatPercent(score.probability) }}</em>
                  <b :style="{ width: formatPercent(score.probability), background: colorForLogitValue(score.logit) }" />
                </button>
              </div>

              <div v-else-if="sampledActivationGrid.length" class="cnn-activation-map__grid">
                <button
                  v-for="row in sampledActivationGrid"
                  :key="`row-${row[0]?.row}`"
                  type="button"
                  class="cnn-activation-map__row"
                  tabindex="-1"
                >
                  <i
                    v-for="cell in row"
                    :key="`${cell.row}-${cell.col}`"
                    :class="{ 'is-selected': cell.row === selectedRow && cell.col === selectedCol }"
                    :style="{ background: colorForValue(cell.value) }"
                    @mouseenter="focusActivationCellReadout(cell)"
                    @mouseleave="clearHoverReadout"
                    @click="selectActivationCell(cell.row, cell.col)"
                  />
                </button>
              </div>
              <p v-else>{{ layerSummary }}</p>

              <section v-if="activeColorLegend" class="cnn-color-legend" :aria-label="copy.colorLegend">
                <div>
                  <span>{{ copy.colorLegend }}</span>
                  <strong>{{ activeColorLegend.title }}</strong>
                  <p>{{ activeColorLegend.body }}</p>
                </div>
                <div class="cnn-color-legend__scale">
                  <i :style="{ background: activeColorLegend.gradient }" aria-hidden="true">
                    <b :style="{ left: activeColorLegend.markerPosition }" />
                  </i>
                  <div>
                    <span>{{ activeColorLegend.minLabel }}</span>
                    <span>{{ activeColorLegend.midLabel }}</span>
                    <span>{{ activeColorLegend.maxLabel }}</span>
                  </div>
                </div>
                <em>
                  {{ activeColorLegend.selectedLabel }}
                  <strong>{{ activeColorLegend.selectedValue }}</strong>
                </em>
              </section>
            </div>

            <article class="cnn-formula-view">
              <div
                v-if="spatialBridge"
                class="cnn-spatial-bridge"
                @mouseleave="endBridgePreview"
                @focusout="endBridgePreviewIfFocusLeaves"
              >
                <article>
                  <span>{{ copy.inputWindow }}</span>
                  <strong>{{ spatialBridge.sourceLabel }}</strong>
                  <div class="cnn-spatial-bridge__map" :style="sampleGridStyle(spatialBridge.sourceSample)">
                    <template v-for="(row, rowIndex) in spatialBridge.sourceSample" :key="`bridge-source-row-${rowIndex}`">
                      <button
                        v-for="cell in row"
                        :key="`bridge-source-${cell.row}-${cell.col}`"
                        type="button"
                        :aria-label="`${copy.inspectSourceCell}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}`"
                        :class="{ 'is-window-source': isBridgeSourceSampleSelected(cell.row, cell.col) }"
                        :style="{ background: colorForPatchValue(cell.value, spatialBridge.sourceMatrix) }"
                        @mouseenter="previewBridgeSourceCell(cell.row, cell.col)"
                        @focus="previewBridgeSourceCell(cell.row, cell.col)"
                        @click="commitBridgeSourceCell(cell.row, cell.col)"
                      />
                    </template>
                    <b
                      class="cnn-spatial-bridge__window"
                      :style="bridgeOverlayStyle(
                        spatialBridge.sourceWindow.row,
                        spatialBridge.sourceWindow.col,
                        spatialBridge.sourceWindow.size,
                        spatialBridge.sourceWindow.size,
                        spatialBridge.sourceMatrix,
                      )"
                    />
                  </div>
                  <em>
                    {{ copy.row }} {{ spatialBridge.sourceWindow.row }} ·
                    {{ copy.col }} {{ spatialBridge.sourceWindow.col }} ·
                    {{ spatialBridge.sourceWindow.size }}×{{ spatialBridge.sourceWindow.size }}
                  </em>
                </article>

                <div class="cnn-spatial-bridge__arrow" aria-hidden="true">
                  <svg viewBox="0 0 88 54" role="img">
                    <path class="cnn-spatial-bridge__rail" d="M6 27 C 24 7, 64 7, 82 27" />
                    <path class="cnn-spatial-bridge__rail cnn-spatial-bridge__rail--return" d="M82 27 C 64 47, 24 47, 6 27" />
                    <circle class="cnn-spatial-bridge__pulse cnn-spatial-bridge__pulse--source" cx="6" cy="27" r="4" />
                    <circle class="cnn-spatial-bridge__pulse cnn-spatial-bridge__pulse--target" cx="82" cy="27" r="4" />
                    <circle class="cnn-spatial-bridge__packet" cx="6" cy="27" r="5" />
                    <path class="cnn-spatial-bridge__arrowhead" d="M77 20 L86 27 L77 34" />
                  </svg>
                </div>

                <article>
                  <span>{{ copy.outputCell }}</span>
                  <strong>{{ spatialBridge.outputLabel }}</strong>
                  <div class="cnn-spatial-bridge__map" :style="sampleGridStyle(spatialBridge.outputSample)">
                    <template v-for="(row, rowIndex) in spatialBridge.outputSample" :key="`bridge-output-row-${rowIndex}`">
                      <button
                        v-for="cell in row"
                        :key="`bridge-output-${cell.row}-${cell.col}`"
                        type="button"
                        :aria-label="`${copy.inspectOutputCell}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}`"
                        :class="{ 'is-output-cell': isBridgeOutputSampleSelected(cell.row, cell.col) }"
                        :style="{ background: colorForPatchValue(cell.value, spatialBridge.outputMatrix) }"
                        @mouseenter="previewBridgeOutputCell(cell.row, cell.col)"
                        @focus="previewBridgeOutputCell(cell.row, cell.col)"
                        @click="commitBridgeOutputCell(cell.row, cell.col)"
                      />
                    </template>
                    <b
                      class="cnn-spatial-bridge__cell"
                      :style="bridgeOverlayStyle(
                        spatialBridge.outputCell.row,
                        spatialBridge.outputCell.col,
                        1,
                        1,
                        spatialBridge.outputMatrix,
                      )"
                    />
                  </div>
                  <em>{{ copy.row }} {{ spatialBridge.outputCell.row }} · {{ copy.col }} {{ spatialBridge.outputCell.col }}</em>
                </article>
              </div>

              <section class="cnn-operation-narration">
                <span>{{ copy.stepExplanation }}</span>
                <strong>{{ selectedLayer ? `${selectedLayer.name} · ${selectedLayer.kind}` : copy.fallback }}</strong>
                <p>{{ operationNarration }}</p>
              </section>

              <section
                v-if="layerFunctionGuide"
                class="cnn-layer-function-guide"
                :class="{ 'is-current-chapter': layerFunctionGuide.isCurrentChapter }"
              >
                <div>
                  <span>{{ copy.layerFunctionEyebrow }}</span>
                  <strong>{{ layerFunctionGuide.title }}</strong>
                  <p>{{ layerFunctionGuide.body }}</p>
                </div>
                <router-link class="cnn-layer-function-guide__link" :to="layerFunctionGuide.route">
                  <span aria-hidden="true">i</span>
                  {{ layerFunctionGuide.isCurrentChapter ? copy.layerFunctionCurrent : copy.layerFunctionOpenChapter }}
                </router-link>
              </section>

              <MarkdownMathContent :source="formulaMarkdown" />

              <section v-if="formulaTraceTerms.length" class="cnn-formula-trace" :aria-label="copy.formulaTrace">
                <header>
                  <span>{{ copy.formulaTrace }}</span>
                  <p>{{ copy.formulaTraceHint }}</p>
                </header>

                <div class="cnn-formula-trace__terms">
                  <button
                    v-for="term in formulaTraceTerms"
                    :key="term.id"
                    type="button"
                    class="cnn-formula-trace__term"
                    :class="`is-${term.tone ?? 'neutral'}`"
                    :aria-label="`${term.label}: ${term.formula} = ${term.value}`"
                    @mouseenter="focusFormulaTraceTerm(term)"
                    @focus="focusFormulaTraceTerm(term)"
                    @click="focusFormulaTraceTerm(term)"
                    @mouseleave="clearFormulaTraceFocus"
                    @blur="clearFormulaTraceFocus"
                  >
                    <span>{{ term.label }}</span>
                    <code>{{ term.formula }}</code>
                    <strong>{{ term.value }}</strong>
                    <em>{{ term.body }}</em>
                  </button>
                </div>
              </section>

              <div v-if="selectedDetail?.kind === 'input'" class="cnn-input-data-view">
                <header>
                  <span>{{ copy.inputDataView }}</span>
                  <strong>{{ copy.rgbChannels }}</strong>
                  <p>{{ copy.inputDataHint }}</p>
                </header>

                <div class="cnn-input-data-view__channels">
                  <article
                    v-for="preview in inputChannelPreviews"
                    :key="`input-channel-${preview.channelIndex}`"
                    :class="[`is-${preview.tone}`, { 'is-selected': preview.channelIndex === selectedNodeIndex }]"
                  >
                    <div>
                      <span>{{ preview.label }}</span>
                      <strong>{{ copy.normalizedValue }} {{ formatNumber(preview.selectedValue) }}</strong>
                      <em>{{ copy.rawPixelValue }} {{ preview.rawValue }}</em>
                    </div>
                    <div class="cnn-input-data-view__grid" :style="sampleGridStyle(preview.grid)">
                      <template v-for="(row, rowIndex) in preview.grid" :key="`input-channel-row-${preview.channelIndex}-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`input-channel-cell-${preview.channelIndex}-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${preview.label}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.normalizedValue} ${formatNumber(cell.value)}`"
                          :class="{ 'is-selected': cell.row === selectedRow && cell.col === selectedCol }"
                          :style="{ background: colorForInputChannelValue(cell.value, preview.tone) }"
                          @mouseenter="focusInputChannelCellReadout(preview, cell)"
                          @focus="focusInputChannelCellReadout(preview, cell)"
                          @click="focusInputChannelCellReadout(preview, cell)"
                          @mouseleave="clearHoverReadout"
                          @blur="clearHoverReadout"
                        />
                      </template>
                    </div>
                  </article>
                </div>

                <aside v-if="selectedInputPixel" class="cnn-input-data-view__pixel">
                  <span>{{ copy.compositePixel }}</span>
                  <i :style="{ background: selectedInputPixel.color }" />
                  <strong>
                    rgb({{ selectedInputPixel.rgb[0] }}, {{ selectedInputPixel.rgb[1] }}, {{ selectedInputPixel.rgb[2] }})
                  </strong>
                  <em>
                    {{ copy.row }} {{ selectedInputPixel.row }} · {{ copy.col }} {{ selectedInputPixel.col }}
                  </em>
                  <p>
                    R {{ formatNumber(selectedInputPixel.normalized[0]) }} ·
                    G {{ formatNumber(selectedInputPixel.normalized[1]) }} ·
                    B {{ formatNumber(selectedInputPixel.normalized[2]) }}
                  </p>
                  <small>{{ copy.centerCropResize }}</small>
                </aside>
              </div>

              <div v-if="selectedDetail?.kind === 'conv'" class="cnn-conv-detail">
                <div class="cnn-conv-detail__intro">
                  <span>{{ copy.allChannels }} · {{ selectedDetail.channelContributions?.length ?? 0 }}</span>
                  <p>{{ copy.convChannelSummary }}</p>
                </div>

                <section v-if="convIntermediateCards.length" class="cnn-conv-intermediate-stack">
                  <header>
                    <span>{{ copy.convIntermediateStack }}</span>
                    <strong>{{ copy.patch }} × {{ copy.kernel }} → {{ copy.intermediateResult }}</strong>
                    <p>{{ copy.convIntermediateHint }}</p>
                  </header>

                  <div class="cnn-conv-intermediate-stack__cards">
                    <button
                      v-for="card in convIntermediateCards"
                      :key="`conv-intermediate-${card.channelIndex}`"
                      type="button"
                      :class="{ 'is-focused': card.isFocused }"
                      @mouseenter="focusConvIntermediateCard(card)"
                      @focus="focusConvIntermediateCard(card)"
                      @click="focusConvIntermediateCard(card)"
                      @mouseleave="clearHoverReadout"
                      @blur="clearHoverReadout"
                    >
                      <span>{{ copy.channel }} {{ card.channelIndex }}</span>
                      <div class="cnn-conv-intermediate-stack__equation">
                        <div class="cnn-conv-intermediate-stack__mini-grid" :style="matrixGridStyle(card.patch)">
                          <template v-for="(row, rowIndex) in card.patch" :key="`intermediate-patch-row-${card.channelIndex}-${rowIndex}`">
                            <i
                              v-for="(value, colIndex) in row"
                              :key="`intermediate-patch-${card.channelIndex}-${rowIndex}-${colIndex}`"
                              :style="{ background: colorForPatchValue(value, card.patch) }"
                            />
                          </template>
                        </div>
                        <em>×</em>
                        <div class="cnn-conv-intermediate-stack__mini-grid" :style="matrixGridStyle(card.kernel)">
                          <template v-for="(row, rowIndex) in card.kernel" :key="`intermediate-kernel-row-${card.channelIndex}-${rowIndex}`">
                            <i
                              v-for="(value, colIndex) in row"
                              :key="`intermediate-kernel-${card.channelIndex}-${rowIndex}-${colIndex}`"
                              :style="{ background: colorForKernelValue(value, card.kernel) }"
                            />
                          </template>
                        </div>
                        <em>=</em>
                        <div class="cnn-conv-intermediate-stack__mini-grid" :style="matrixGridStyle(card.products)">
                          <template v-for="(row, rowIndex) in card.products" :key="`intermediate-product-row-${card.channelIndex}-${rowIndex}`">
                            <i
                              v-for="(value, colIndex) in row"
                              :key="`intermediate-product-${card.channelIndex}-${rowIndex}-${colIndex}`"
                              :style="{ background: colorForProductValue(value, card.products) }"
                            />
                          </template>
                        </div>
                      </div>
                      <strong>{{ copy.sum }} {{ card.formattedSum }}</strong>
                    </button>
                  </div>
                </section>

                <section v-if="convLedgerItems.length" class="cnn-conv-ledger">
                  <header>
                    <span>{{ copy.convLedgerTitle }}</span>
                    <strong>{{ copy.convLedgerEquation }}</strong>
                    <p>{{ copy.convLedgerHint }}</p>
                    <code>{{ convLedgerEquation }}</code>
                  </header>

                  <div class="cnn-conv-ledger__items">
                    <button
                      v-for="item in convLedgerItems"
                      :key="item.id"
                      type="button"
                      :class="[
                        `is-${item.tone}`,
                        `is-${item.kind}`,
                        { 'is-focused': item.channelIndex !== undefined && focusedOverviewChannel === item.channelIndex },
                      ]"
                      @mouseenter="focusConvLedgerItem(item)"
                      @focus="focusConvLedgerItem(item)"
                      @mouseleave="clearHoverReadout"
                      @blur="clearHoverReadout"
                    >
                      <span>{{ item.label }}</span>
                      <strong>{{ item.formattedValue }}</strong>
                      <i :style="{ width: item.barWidth }" />
                    </button>
                  </div>
                </section>

                <section
                  v-if="convAnimatorDetail"
                  class="cnn-conv-animator"
                  @mouseleave="clearConvAnimatorWindowAnchor"
                  @focusout="clearConvAnimatorWindowAnchorIfFocusLeaves"
                >
                  <article>
                    <span>{{ copy.convInputMatrix }}</span>
                    <strong>{{ convAnimatorDetail.inputLabel }}</strong>
                    <em>{{ convAnimatorDetail.inputShape }}</em>
                    <div class="cnn-conv-animator__grid" :style="sampleGridStyle(convAnimatorDetail.inputWindow)">
                      <template v-for="(row, rowIndex) in convAnimatorDetail.inputWindow" :key="`conv-input-row-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`conv-input-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${copy.convInputMatrix}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.inputValue} ${formatNumber(cell.value)}`"
                          :class="{ 'is-selected': cell.isSelected, 'is-window-source': cell.isWindow }"
                          :style="{ background: colorForPatchValue(cell.value, convAnimatorDetail.inputMatrix) }"
                          @mouseenter="selectConvInputMatrixCell(cell)"
                          @focus="selectConvInputMatrixCell(cell)"
                          @click="selectConvInputMatrixCell(cell)"
                        >
                          {{ formatNumber(cell.value) }}
                        </button>
                      </template>
                    </div>
                  </article>

                  <div class="cnn-conv-animator__kernel-math">
                    <span>{{ copy.convAnimatorTitle }} · {{ copy.channel }} {{ convAnimatorDetail.channelIndex }}</span>
                    <strong>{{ copy.patch }} × {{ copy.kernel }} → {{ copy.products }}</strong>
                    <div class="cnn-conv-animator__math-grid" :style="matrixGridStyle(convAnimatorDetail.contribution.patch)">
                      <template v-for="(row, rowIndex) in convAnimatorDetail.contribution.patch" :key="`conv-animator-math-row-${rowIndex}`">
                        <button
                          v-for="(value, colIndex) in row"
                          :key="`conv-animator-math-${rowIndex}-${colIndex}`"
                          type="button"
                          :aria-label="`${copy.inspectMathCell}: ${copy.channel} ${convAnimatorDetail.channelIndex}, ${copy.row} ${rowIndex}, ${copy.col} ${colIndex}`"
                          :class="{ 'is-math-focused': isFocusedConvMathCell(convAnimatorDetail.channelIndex, rowIndex, colIndex) }"
                          :style="{ background: colorForProductValue(convAnimatorDetail.contribution.products[rowIndex]?.[colIndex] ?? 0, convAnimatorDetail.contribution.products) }"
                          @mouseenter="focusConvAnimatorMathCell(rowIndex, colIndex)"
                          @focus="focusConvAnimatorMathCell(rowIndex, colIndex)"
                          @click="focusConvAnimatorMathCell(rowIndex, colIndex)"
                        >
                          <span>{{ formatNumber(value) }}</span>
                          <em>× {{ formatNumber(convAnimatorDetail.contribution.kernel[rowIndex]?.[colIndex]) }}</em>
                          <strong>{{ formatNumber(convAnimatorDetail.contribution.products[rowIndex]?.[colIndex]) }}</strong>
                        </button>
                      </template>
                    </div>
                    <code>
                      {{ copy.sum }} {{ formatNumber(convAnimatorDetail.contribution.sum) }}
                      + {{ copy.bias }} {{ formatNumber(selectedDetail.bias) }}
                      = {{ copy.beforeRelu }} {{ formatNumber(selectedDetail.weightedSum) }}
                    </code>
                    <p>{{ copy.convAnimatorHint }}</p>
                  </div>

                  <article>
                    <span>{{ copy.convOutputMatrix }}</span>
                    <strong>{{ convAnimatorDetail.outputLabel }}</strong>
                    <em>{{ convAnimatorDetail.outputShape }}</em>
                    <div class="cnn-conv-animator__grid" :style="sampleGridStyle(convAnimatorDetail.outputWindow)">
                      <template v-for="(row, rowIndex) in convAnimatorDetail.outputWindow" :key="`conv-output-row-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`conv-output-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${copy.convOutputMatrix}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.outputCell} ${formatNumber(cell.value)}`"
                          :class="{ 'is-selected': cell.isSelected }"
                          :style="{ background: colorForPatchValue(cell.value, convAnimatorDetail.outputMatrix) }"
                          @mouseenter="selectConvOutputMatrixCell(cell)"
                          @focus="selectConvOutputMatrixCell(cell)"
                          @click="selectConvOutputMatrixCell(cell)"
                        >
                          {{ formatNumber(cell.value) }}
                        </button>
                      </template>
                    </div>
                  </article>
                </section>

                <section v-if="focusedConvMathTerm" class="cnn-conv-detail__math-lens">
                  <span>{{ copy.kernelMath }}</span>
                  <strong>
                    {{ copy.channel }} {{ focusedConvMathTerm.channelIndex }} ·
                    ({{ focusedConvMathTerm.row }}, {{ focusedConvMathTerm.col }})
                  </strong>
                  <code>
                    {{ copy.inputValue }} {{ formatNumber(focusedConvMathTerm.patchValue) }}
                    × {{ copy.weightValue }} {{ formatNumber(focusedConvMathTerm.kernelValue) }}
                    = {{ copy.productValue }} {{ formatNumber(focusedConvMathTerm.productValue) }}
                  </code>
                  <p>{{ convMathNarration }}</p>
                </section>

                <div class="cnn-conv-detail__channels">
                  <article
                    v-for="contribution in convContributions"
                    :key="contribution.channelIndex"
                    :class="{ 'is-focused': isFocusedContribution(contribution.channelIndex) }"
                  >
                    <span>{{ copy.channel }} {{ contribution.channelIndex }}</span>
                    <div class="cnn-conv-detail__flow">
                      <div class="cnn-matrix-block">
                        <strong>{{ copy.patch }}</strong>
                        <div class="cnn-matrix-grid" :style="matrixGridStyle(contribution.patch)">
                          <template v-for="(row, rowIndex) in contribution.patch" :key="`patch-row-${contribution.channelIndex}-${rowIndex}`">
                            <button
                              v-for="(value, colIndex) in row"
                              :key="`patch-${contribution.channelIndex}-${rowIndex}-${colIndex}`"
                              type="button"
                              class="cnn-matrix-cell"
                              :class="{ 'is-math-focused': isFocusedConvMathCell(contribution.channelIndex, rowIndex, colIndex) }"
                              :aria-label="`${copy.inspectMathCell}: ${copy.channel} ${contribution.channelIndex}, ${copy.row} ${rowIndex}, ${copy.col} ${colIndex}`"
                              :style="{ background: colorForPatchValue(value, contribution.patch) }"
                              @click="focusConvMathCell(contribution, rowIndex, colIndex)"
                              @focus="focusConvMathCell(contribution, rowIndex, colIndex)"
                            >
                              {{ formatNumber(value) }}
                            </button>
                          </template>
                        </div>
                      </div>

                      <strong class="cnn-detail-operator">×</strong>

                      <div class="cnn-matrix-block">
                        <strong>{{ copy.kernel }}</strong>
                        <div class="cnn-matrix-grid" :style="matrixGridStyle(contribution.kernel)">
                          <template v-for="(row, rowIndex) in contribution.kernel" :key="`kernel-row-${contribution.channelIndex}-${rowIndex}`">
                            <button
                              v-for="(value, colIndex) in row"
                              :key="`kernel-${contribution.channelIndex}-${rowIndex}-${colIndex}`"
                              type="button"
                              class="cnn-matrix-cell"
                              :class="{ 'is-math-focused': isFocusedConvMathCell(contribution.channelIndex, rowIndex, colIndex) }"
                              :aria-label="`${copy.inspectMathCell}: ${copy.channel} ${contribution.channelIndex}, ${copy.row} ${rowIndex}, ${copy.col} ${colIndex}`"
                              :style="{ background: colorForKernelValue(value, contribution.kernel) }"
                              @click="focusConvMathCell(contribution, rowIndex, colIndex)"
                              @focus="focusConvMathCell(contribution, rowIndex, colIndex)"
                            >
                              {{ formatNumber(value) }}
                            </button>
                          </template>
                        </div>
                      </div>

                      <strong class="cnn-detail-operator">=</strong>

                      <div class="cnn-matrix-block">
                        <strong>{{ copy.products }}</strong>
                        <div class="cnn-matrix-grid" :style="matrixGridStyle(contribution.products)">
                          <template v-for="(row, rowIndex) in contribution.products" :key="`product-row-${contribution.channelIndex}-${rowIndex}`">
                            <button
                              v-for="(value, colIndex) in row"
                              :key="`product-${contribution.channelIndex}-${rowIndex}-${colIndex}`"
                              type="button"
                              class="cnn-matrix-cell"
                              :class="{ 'is-math-focused': isFocusedConvMathCell(contribution.channelIndex, rowIndex, colIndex) }"
                              :aria-label="`${copy.inspectMathCell}: ${copy.channel} ${contribution.channelIndex}, ${copy.row} ${rowIndex}, ${copy.col} ${colIndex}`"
                              :style="{ background: colorForProductValue(value, contribution.products) }"
                              @click="focusConvMathCell(contribution, rowIndex, colIndex)"
                              @focus="focusConvMathCell(contribution, rowIndex, colIndex)"
                            >
                              {{ formatNumber(value) }}
                            </button>
                          </template>
                        </div>
                      </div>

                      <strong class="cnn-conv-detail__channel-sum">
                        {{ copy.sum }} {{ formatNumber(contribution.sum) }}
                      </strong>
                    </div>
                  </article>
                </div>

                <div class="cnn-conv-detail__total">
                  <span>{{ copy.bias }} {{ formatNumber(selectedDetail.bias) }}</span>
                  <strong>{{ copy.beforeRelu }} {{ formatNumber(selectedDetail.weightedSum) }}</strong>
                  <strong>{{ copy.reluValue }} {{ formatNumber(selectedDetail.reluValue) }}</strong>
                </div>
              </div>

              <div v-else-if="selectedDetail?.kind === 'relu'" class="cnn-relu-detail">
                <section v-if="reluMatrixPair" class="cnn-relu-detail__matrices">
                  <article>
                    <span>{{ copy.reluInputMatrix }}</span>
                    <strong>{{ reluMatrixPair.inputLabel }}</strong>
                    <em>{{ reluMatrixPair.inputShape }}</em>
                    <div class="cnn-relu-detail__grid" :style="sampleGridStyle(reluMatrixPair.inputWindow)">
                      <template v-for="(row, rowIndex) in reluMatrixPair.inputWindow" :key="`relu-input-row-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`relu-input-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${copy.reluInputMatrix}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.inputValue} ${formatNumber(cell.value)}`"
                          :class="{ 'is-selected': cell.isSelected, 'is-negative': cell.value < 0 }"
                          :style="{ background: colorForPatchValue(cell.value, reluMatrixPair.inputMatrix) }"
                          @mouseenter="selectReluMatrixCell(cell)"
                          @focus="selectReluMatrixCell(cell)"
                          @click="selectReluMatrixCell(cell)"
                          @keydown.enter.prevent="selectReluMatrixCell(cell)"
                          @keydown.space.prevent="selectReluMatrixCell(cell)"
                        >
                          {{ formatNumber(cell.value) }}
                        </button>
                      </template>
                    </div>
                  </article>

                  <div class="cnn-relu-detail__operator">
                    <span>{{ copy.reluOperatorTitle }}</span>
                    <div class="cnn-relu-detail__operator-flow">
                      <strong>max(</strong>
                      <button
                        type="button"
                        class="cnn-relu-detail__term"
                        :class="{ 'is-selected': activeReluOperatorTerm === 'zero', 'is-source': (selectedDetail.weightedSum ?? 0) < 0 }"
                        :aria-label="`${copy.reluCandidate}: ${copy.zeroThreshold} 0`"
                        @mouseenter="focusReluOperatorTerm('zero')"
                        @focus="focusReluOperatorTerm('zero')"
                        @click="focusReluOperatorTerm('zero')"
                        @mouseleave="clearReluOperatorFocus"
                        @blur="clearReluOperatorFocus"
                      >
                        0
                      </button>
                      <strong>,</strong>
                      <button
                        type="button"
                        class="cnn-relu-detail__term"
                        :class="{ 'is-selected': activeReluOperatorTerm === 'input', 'is-source': (selectedDetail.weightedSum ?? 0) >= 0, 'is-negative': (selectedDetail.weightedSum ?? 0) < 0 }"
                        :aria-label="`${copy.reluSelectedInput}: z ${formatNumber(selectedDetail.weightedSum)}`"
                        @mouseenter="focusReluOperatorTerm('input')"
                        @focus="focusReluOperatorTerm('input')"
                        @click="focusReluOperatorTerm('input')"
                        @mouseleave="clearReluOperatorFocus"
                        @blur="clearReluOperatorFocus"
                      >
                        z {{ formatNumber(selectedDetail.weightedSum) }}
                      </button>
                      <strong>) =</strong>
                      <button
                        type="button"
                        class="cnn-relu-detail__output-cell"
                        :class="{ 'is-selected': activeReluOperatorTerm === 'output', 'is-zero': selectedDetail.reluValue === 0 }"
                        :aria-label="`${copy.reluOutputMatrix}: ${copy.outputCell} ${formatNumber(selectedDetail.reluValue)}`"
                        :style="{ background: colorForPatchValue(selectedDetail.reluValue ?? 0, reluMatrixPair.outputMatrix) }"
                        @mouseenter="focusReluOperatorTerm('output')"
                        @focus="focusReluOperatorTerm('output')"
                        @click="focusReluOperatorTerm('output')"
                        @mouseleave="clearReluOperatorFocus"
                        @blur="clearReluOperatorFocus"
                      >
                        {{ formatNumber(selectedDetail.reluValue) }}
                      </button>
                    </div>
                    <p>
                      <strong>{{ (selectedDetail.weightedSum ?? 0) < 0 ? copy.clipped : copy.retained }}</strong>
                      <span>{{ reluOperatorNarration }}</span>
                    </p>
                    <em>
                      {{ copy.outputCell }} ({{ selectedRow }}, {{ selectedCol }}) =
                      {{ formatNumber(selectedDetail.reluValue) }}
                    </em>
                    <small>{{ copy.reluOperatorHint }}</small>
                  </div>

                  <article>
                    <span>{{ copy.reluOutputMatrix }}</span>
                    <strong>{{ reluMatrixPair.outputLabel }}</strong>
                    <em>{{ reluMatrixPair.outputShape }}</em>
                    <div class="cnn-relu-detail__grid" :style="sampleGridStyle(reluMatrixPair.outputWindow)">
                      <template v-for="(row, rowIndex) in reluMatrixPair.outputWindow" :key="`relu-output-row-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`relu-output-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${copy.reluOutputMatrix}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.reluValue} ${formatNumber(cell.value)}`"
                          :class="{ 'is-selected': cell.isSelected, 'is-zero': cell.value === 0 }"
                          :style="{ background: colorForPatchValue(cell.value, reluMatrixPair.outputMatrix) }"
                          @mouseenter="selectReluMatrixCell(cell, copy.reluOutputMatrix)"
                          @focus="selectReluMatrixCell(cell, copy.reluOutputMatrix)"
                          @click="selectReluMatrixCell(cell, copy.reluOutputMatrix)"
                          @keydown.enter.prevent="selectReluMatrixCell(cell, copy.reluOutputMatrix)"
                          @keydown.space.prevent="selectReluMatrixCell(cell, copy.reluOutputMatrix)"
                        >
                          {{ formatNumber(cell.value) }}
                        </button>
                      </template>
                    </div>
                  </article>
                </section>

                <p v-if="reluMatrixPair" class="cnn-relu-detail__hint">{{ copy.reluMatrixHint }}</p>

                <section v-if="reluMaskSummary" class="cnn-relu-mask-panel">
                  <header>
                    <span>{{ copy.reluMaskTitle }}</span>
                    <strong>{{ copy.reluClippedRatio }} {{ formatPercent(reluMaskSummary.clippedRatio) }}</strong>
                    <p>{{ copy.reluMaskHint }}</p>
                  </header>

                  <div class="cnn-relu-mask-panel__metrics">
                    <article class="is-clipped">
                      <span>{{ copy.reluClippedCells }}</span>
                      <strong>{{ reluMaskSummary.clippedCount }}/{{ reluMaskSummary.totalCount }}</strong>
                    </article>
                    <article class="is-retained">
                      <span>{{ copy.reluRetainedCells }}</span>
                      <strong>{{ reluMaskSummary.retainedCount }}/{{ reluMaskSummary.totalCount }}</strong>
                    </article>
                    <article :class="{ 'is-clipped': reluMaskSummary.selectedWasClipped, 'is-retained': !reluMaskSummary.selectedWasClipped }">
                      <span>{{ copy.selectedCell }}</span>
                      <strong>{{ reluMaskSummary.selectedWasClipped ? copy.clipped : copy.retained }}</strong>
                    </article>
                  </div>

                  <div class="cnn-relu-mask-panel__grid" :style="sampleGridStyle(reluMaskSummary.maskWindow)">
                    <template v-for="(row, rowIndex) in reluMaskSummary.maskWindow" :key="`relu-mask-row-${rowIndex}`">
                      <button
                        v-for="cell in row"
                        :key="`relu-mask-${cell.row}-${cell.col}`"
                        type="button"
                        :aria-label="`${copy.reluMaskTitle}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${cell.wasClipped ? copy.clipped : copy.retained}`"
                        :class="{ 'is-selected': cell.isSelected, 'is-clipped': cell.wasClipped, 'is-retained': !cell.wasClipped }"
                        @mouseenter="focusReluMaskCell(cell)"
                        @focus="focusReluMaskCell(cell)"
                        @click="focusReluMaskCell(cell)"
                        @mouseleave="clearReluOperatorFocus"
                        @blur="clearReluOperatorFocus"
                      >
                        <span>{{ formatNumber(cell.value) }}</span>
                        <strong>{{ formatNumber(cell.outputValue) }}</strong>
                      </button>
                    </template>
                  </div>
                </section>

                <section class="cnn-relu-detail__value-flow">
                  <article :class="{ 'is-negative': (selectedDetail.weightedSum ?? 0) < 0 }">
                    <span>{{ copy.beforeRelu }}</span>
                    <strong>{{ formatNumber(selectedDetail.weightedSum) }}</strong>
                  </article>
                  <strong class="cnn-detail-operator">max(0, z)</strong>
                  <article>
                    <span>{{ (selectedDetail.weightedSum ?? 0) < 0 ? copy.clipped : copy.retained }}</span>
                    <strong>{{ formatNumber(selectedDetail.reluValue) }}</strong>
                  </article>
                </section>
              </div>

              <div v-else-if="selectedDetail?.kind === 'pool'" class="cnn-pool-detail">
                <section v-if="poolMatrixPair" class="cnn-pool-detail__matrices">
                  <article>
                    <span>{{ copy.poolInputMatrix }}</span>
                    <strong>{{ poolMatrixPair.inputLabel }}</strong>
                    <em>{{ poolMatrixPair.inputShape }}</em>
                    <div class="cnn-pool-detail__grid" :style="sampleGridStyle(poolMatrixPair.inputWindow)">
                      <template v-for="(row, rowIndex) in poolMatrixPair.inputWindow" :key="`pool-input-row-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`pool-input-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${copy.poolInputMatrix}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.inputValue} ${formatNumber(cell.value)}`"
                          :class="{ 'is-window-source': cell.isWindow, 'is-source': cell.isMax }"
                          :style="{ background: colorForPatchValue(cell.value, poolMatrixPair.inputMatrix) }"
                          @mouseenter="selectPoolInputMatrixCell(cell)"
                          @focus="selectPoolInputMatrixCell(cell)"
                          @click="selectPoolInputMatrixCell(cell)"
                        >
                          {{ formatNumber(cell.value) }}
                        </button>
                      </template>
                    </div>
                  </article>

                  <div class="cnn-pool-detail__operator">
                    <span>{{ copy.poolOperatorTitle }}</span>
                    <div class="cnn-pool-detail__operator-flow">
                      <strong>max(</strong>
                      <div class="cnn-pool-detail__operator-grid" :style="sampleGridStyle(poolOperatorCells)">
                        <template v-for="(row, rowIndex) in poolOperatorCells" :key="`pool-operator-row-${rowIndex}`">
                          <button
                            v-for="cell in row"
                            :key="`pool-operator-${cell.row}-${cell.col}`"
                            type="button"
                            :aria-label="`${copy.poolWindow}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.poolCandidate} ${formatNumber(cell.value)}`"
                            :class="{ 'is-source': cell.isMax, 'is-selected': cell.isSelected }"
                            :style="{ background: colorForPatchValue(cell.value, selectedDetail.poolWindow) }"
                            @mouseenter="focusPoolOperatorCell(cell)"
                            @focus="focusPoolOperatorCell(cell)"
                            @click="focusPoolOperatorCell(cell)"
                            @mouseleave="clearPoolOperatorFocus"
                            @blur="clearPoolOperatorFocus"
                          >
                            {{ formatNumber(cell.value) }}
                          </button>
                        </template>
                      </div>
                      <strong>) =</strong>
                      <div
                        class="cnn-pool-detail__output-cell"
                        :style="{ background: colorForPatchValue(selectedDetail.poolMax ?? 0, poolMatrixPair.outputMatrix) }"
                      >
                        {{ formatNumber(selectedDetail.poolMax) }}
                      </div>
                    </div>
                    <p>
                      <strong>{{ activePoolOperatorCell?.isMax ? copy.poolWinner : copy.poolCandidate }}</strong>
                      <span>
                        ({{ activePoolOperatorCell?.row ?? selectedDetail.poolMaxPosition?.row }},
                        {{ activePoolOperatorCell?.col ?? selectedDetail.poolMaxPosition?.col }})
                        {{ copy.inputValue }} {{ formatNumber(activePoolOperatorCell?.value ?? selectedDetail.poolMax) }}
                      </span>
                    </p>
                    <em>
                      {{ copy.outputCell }} ({{ selectedRow }}, {{ selectedCol }}) =
                      {{ formatNumber(selectedDetail.poolMax) }}
                    </em>
                    <small>{{ copy.poolOperatorHint }}</small>
                  </div>

                  <article>
                    <span>{{ copy.poolOutputMatrix }}</span>
                    <strong>{{ poolMatrixPair.outputLabel }}</strong>
                    <em>{{ poolMatrixPair.outputShape }}</em>
                    <div class="cnn-pool-detail__grid" :style="sampleGridStyle(poolMatrixPair.outputWindow)">
                      <template v-for="(row, rowIndex) in poolMatrixPair.outputWindow" :key="`pool-output-row-${rowIndex}`">
                        <button
                          v-for="cell in row"
                          :key="`pool-output-${cell.row}-${cell.col}`"
                          type="button"
                          :aria-label="`${copy.poolOutputMatrix}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${copy.maxValue} ${formatNumber(cell.value)}`"
                          :class="{ 'is-selected': cell.isSelected }"
                          :style="{ background: colorForPatchValue(cell.value, poolMatrixPair.outputMatrix) }"
                          @mouseenter="selectPoolOutputMatrixCell(cell)"
                          @focus="selectPoolOutputMatrixCell(cell)"
                          @click="selectPoolOutputMatrixCell(cell)"
                        >
                          {{ formatNumber(cell.value) }}
                        </button>
                      </template>
                    </div>
                  </article>
                </section>

                <section v-if="poolLedgerItems.length" class="cnn-pool-ledger">
                  <header>
                    <span>{{ copy.poolLedgerTitle }}</span>
                    <strong>{{ copy.poolLedgerEquation }}</strong>
                    <p>{{ copy.poolLedgerHint }}</p>
                    <code>{{ poolLedgerEquation }}</code>
                  </header>

                  <div class="cnn-pool-ledger__items">
                    <button
                      v-for="item in poolLedgerItems"
                      :key="item.id"
                      type="button"
                      :class="{ 'is-winner': item.isWinner, 'is-selected': item.isSelected }"
                      @mouseenter="focusPoolLedgerItem(item)"
                      @focus="focusPoolLedgerItem(item)"
                      @click="focusPoolLedgerItem(item)"
                      @mouseleave="clearPoolOperatorFocus"
                      @blur="clearPoolOperatorFocus"
                    >
                      <span>{{ item.label }}</span>
                      <strong>{{ item.formattedValue }}</strong>
                      <em>{{ item.isWinner ? copy.poolWinner : copy.poolCandidate }}</em>
                      <i :style="{ width: item.barWidth }" />
                    </button>
                  </div>
                </section>

                <section v-if="poolRetentionSummary" class="cnn-pool-retention-panel">
                  <header>
                    <span>{{ copy.poolRetentionTitle }}</span>
                    <strong>{{ copy.poolRetentionRatio }} {{ formatPercent(poolRetentionSummary.retentionRatio) }}</strong>
                    <p>{{ copy.poolRetentionHint }}</p>
                    <code>
                      {{ copy.outputCell }} ({{ selectedRow }}, {{ selectedCol }}) =
                      max({{ copy.poolWindow }}) =
                      {{ formatNumber(poolRetentionSummary.selectedWinner?.value ?? selectedDetail.poolMax) }}
                    </code>
                  </header>

                  <div class="cnn-pool-retention-panel__metrics">
                    <article class="is-kept">
                      <span>{{ copy.poolKeptCells }}</span>
                      <strong>{{ poolRetentionSummary.winnerCount }}/{{ poolRetentionSummary.totalWindowCells }}</strong>
                    </article>
                    <article class="is-suppressed">
                      <span>{{ copy.poolSuppressedCells }}</span>
                      <strong>{{ poolRetentionSummary.suppressedCount }}/{{ poolRetentionSummary.totalWindowCells }}</strong>
                    </article>
                    <article>
                      <span>{{ copy.poolDownsampleRatio }}</span>
                      <strong>{{ formatPercent(poolRetentionSummary.downsampleRatio) }}</strong>
                    </article>
                  </div>

                  <div class="cnn-pool-retention-panel__grid" :style="sampleGridStyle(poolRetentionSummary.maskWindow)">
                    <template v-for="(row, rowIndex) in poolRetentionSummary.maskWindow" :key="`pool-retention-row-${rowIndex}`">
                      <button
                        v-for="cell in row"
                        :key="`pool-retention-${cell.row}-${cell.col}`"
                        type="button"
                        :aria-label="`${copy.poolRetentionTitle}: ${copy.row} ${cell.row}, ${copy.col} ${cell.col}, ${cell.isWinner ? copy.poolKept : copy.poolSuppressed}`"
                        :class="{ 'is-selected': cell.isSelected, 'is-winner': cell.isWinner, 'is-suppressed': cell.isSuppressed }"
                        @mouseenter="focusPoolRetentionCell(cell)"
                        @focus="focusPoolRetentionCell(cell)"
                        @click="focusPoolRetentionCell(cell)"
                        @keydown.enter.prevent="focusPoolRetentionCell(cell)"
                        @keydown.space.prevent="focusPoolRetentionCell(cell)"
                        @mouseleave="clearPoolOperatorFocus"
                        @blur="clearPoolOperatorFocus"
                      >
                        <span>{{ formatNumber(cell.value) }}</span>
                        <strong>{{ cell.isWinner ? `→ ${formatNumber(cell.outputValue)}` : copy.poolSuppressed }}</strong>
                        <em>{{ cell.outputRow }},{{ cell.outputCol }}</em>
                      </button>
                    </template>
                  </div>
                </section>

                <p v-if="poolMatrixPair" class="cnn-pool-detail__hint">{{ copy.poolMatrixHint }}</p>

                <section class="cnn-pool-detail__value-flow">
                  <article>
                    <span>{{ copy.source }} {{ selectedDetail.poolMaxPosition?.row }}, {{ selectedDetail.poolMaxPosition?.col }}</span>
                    <strong>{{ copy.maxValue }} {{ formatNumber(selectedDetail.poolMax) }}</strong>
                  </article>
                </section>
              </div>

              <div v-else-if="selectedDetail?.kind === 'flatten'" class="cnn-flatten-detail">
                <article v-if="flattenSourceMatrix">
                  <span>
                    {{ copy.sourceMap }}
                    {{ selectedDetail.flattenSource?.channelIndex }}
                  </span>
                  <div class="cnn-flatten-detail__map" :style="matrixGridStyle(flattenSourceMatrix)">
                    <template v-for="(row, rowIndex) in flattenSourceMatrix" :key="`flatten-map-row-${rowIndex}`">
                      <i
                        v-for="(value, colIndex) in row"
                        :key="`flatten-map-${rowIndex}-${colIndex}`"
                        :class="{ 'is-selected': isFlattenSourceCell(rowIndex, colIndex) }"
                        :style="{ background: colorForPatchValue(value, flattenSourceMatrix) }"
                        @mouseenter="focusFlattenSourceReadout(rowIndex, colIndex, value)"
                        @mouseleave="clearHoverReadout"
                      />
                    </template>
                  </div>
                </article>
                <strong class="cnn-detail-operator">→</strong>
                <article>
                  <span>{{ copy.vectorIndex }}</span>
                  <strong>{{ selectedDetail.flattenIndex }}</strong>
                  <div class="cnn-flatten-detail__vector">
                    <button
                      v-for="item in flattenVectorWindow"
                      :key="`flatten-vector-${item.displayIndex}`"
                      type="button"
                      :class="{ 'is-selected': item.selected }"
                      :style="{ background: colorForPatchValue(item.value, [flattenVectorWindow.map((node) => node.value)]) }"
                      @mouseenter="focusFlattenVectorReadout(item.index, item.value)"
                      @mouseleave="clearHoverReadout"
                      @focus="focusFlattenVectorReadout(item.index, item.value)"
                      @blur="clearHoverReadout"
                      @click="selectLayer(selectedLayerIndex, item.displayIndex)"
                    >
                      <span>{{ item.index }}</span>
                      <strong>{{ formatNumber(item.value) }}</strong>
                    </button>
                  </div>
                </article>

                <section v-if="flattenLedgerItems.length" class="cnn-flatten-ledger">
                  <header>
                    <span>{{ copy.flattenLedgerTitle }}</span>
                    <strong>{{ copy.flattenLedgerEquation }}</strong>
                    <p>{{ copy.flattenLedgerHint }}</p>
                    <code>{{ flattenLedgerEquation }}</code>
                  </header>

                  <div class="cnn-flatten-ledger__items">
                    <button
                      v-for="item in flattenLedgerItems"
                      :key="item.id"
                      type="button"
                      :class="`is-${item.kind}`"
                      :aria-label="`${item.label}: ${item.formula} = ${item.formattedValue}`"
                      @mouseenter="focusFlattenLedgerItem(item)"
                      @focus="focusFlattenLedgerItem(item)"
                      @click="focusFlattenLedgerItem(item)"
                      @mouseleave="clearHoverReadout"
                      @blur="clearHoverReadout"
                    >
                      <span>{{ item.label }}</span>
                      <strong>{{ item.formattedValue }}</strong>
                      <em>{{ item.formula }}</em>
                      <i />
                    </button>
                  </div>
                </section>
              </div>

              <div v-else-if="selectedDetail?.kind === 'dense'" class="cnn-softmax-detail">
                <section v-if="denseLedgerItems.length" class="cnn-dense-ledger">
                  <header>
                    <span>{{ copy.denseLedgerTitle }}</span>
                    <strong>{{ copy.denseLedgerEquation }}</strong>
                    <p>{{ copy.denseLedgerHint }}</p>
                    <code>{{ denseLedgerEquation }}</code>
                  </header>

                  <div class="cnn-dense-ledger__items">
                    <button
                      v-for="item in denseLedgerItems"
                      :key="item.id"
                      type="button"
                      :class="`is-${item.kind}`"
                      :aria-label="`${item.label}: ${item.formula} = ${item.formattedValue}`"
                      @mouseenter="focusDenseLedgerItem(item)"
                      @focus="focusDenseLedgerItem(item)"
                      @click="focusDenseLedgerItem(item)"
                      @mouseleave="clearDenseSourceFocus"
                      @blur="clearDenseSourceFocus"
                    >
                      <span>{{ item.label }}</span>
                      <strong>{{ item.formattedValue }}</strong>
                      <em>{{ item.formula }}</em>
                      <i :style="{ width: item.barWidth }" />
                    </button>
                  </div>

                  <div v-if="denseWaterfall" class="cnn-dense-waterfall">
                    <header>
                      <span>{{ copy.denseWaterfallTitle }}</span>
                      <strong>{{ copy.runningSum }} {{ denseWaterfall.formattedFinalLogit }}</strong>
                      <p>{{ copy.denseWaterfallHint }}</p>
                    </header>

                    <div class="cnn-dense-waterfall__steps" :style="{ '--axis-left': denseWaterfall.axisPosition }">
                      <button
                        v-for="step in denseWaterfall.steps"
                        :key="step.id"
                        type="button"
                        :class="`is-${step.kind}`"
                        :aria-label="`${step.label}: ${step.formula}, ${copy.denseContribution} ${step.formattedDelta}, ${copy.runningSum} ${step.formattedEnd}`"
                        @mouseenter="focusDenseWaterfallStep(step)"
                        @focus="focusDenseWaterfallStep(step)"
                        @click="focusDenseWaterfallStep(step)"
                        @mouseleave="clearDenseSourceFocus"
                        @blur="clearDenseSourceFocus"
                      >
                        <span>{{ step.label }}</span>
                        <em>{{ step.formula }}</em>
                        <b class="cnn-dense-waterfall__bar" aria-hidden="true">
                          <i :style="step.barStyle" />
                          <small :style="step.markerStyle" />
                        </b>
                        <strong>{{ step.formattedDelta }}</strong>
                        <small>{{ copy.runningSum }} {{ step.formattedEnd }}</small>
                      </button>
                    </div>

                    <div class="cnn-dense-waterfall__scale" aria-hidden="true">
                      <span>{{ denseWaterfall.minLabel }}</span>
                      <span>0</span>
                      <span>{{ denseWaterfall.maxLabel }}</span>
                    </div>
                  </div>
                </section>

                <section v-if="denseContributionAtlasMaps.length" class="cnn-dense-contribution-atlas">
                  <header>
                    <span>{{ copy.denseContributionAtlasTitle }}</span>
                    <strong>{{ copy.denseTopTerms }} · {{ denseContributionAtlasMaps.length }} {{ copy.featureMaps }}</strong>
                    <p>{{ copy.denseContributionAtlasHint }}</p>
                    <em v-if="denseContributionAtlasHiddenCount">+{{ denseContributionAtlasHiddenCount }} {{ copy.hiddenFeatureMaps }}</em>
                  </header>

                  <div class="cnn-dense-contribution-atlas__maps">
                    <article
                      v-for="map in denseContributionAtlasMaps"
                      :key="map.id"
                      :class="{ 'is-focused': map.isFocused }"
                    >
                      <div class="cnn-dense-contribution-atlas__meta">
                        <span>{{ map.sourceLabel }}</span>
                        <strong>{{ copy.netContribution }} {{ map.formattedTotalContribution }}</strong>
                        <em>{{ copy.absoluteContribution }} {{ map.formattedAbsoluteContribution }}</em>
                        <em>{{ copy.topCellContribution }} {{ map.formattedTopContribution }}</em>
                      </div>

                      <div class="cnn-dense-contribution-atlas__grid" :style="sampleGridStyle(map.grid)">
                        <template v-for="(row, rowIndex) in map.grid" :key="`dense-atlas-row-${map.id}-${rowIndex}`">
                          <button
                            v-for="cell in row"
                            :key="`dense-atlas-cell-${map.id}-${cell.row}-${cell.col}`"
                            type="button"
                            :class="{
                              'is-focused': cell.isFocused,
                              'is-negative': cell.contribution < 0,
                              'is-positive': cell.contribution >= 0,
                            }"
                            :aria-label="`${map.sourceLabel} ${copy.sourceFeatureCell} (${cell.row}, ${cell.col}), ${copy.denseContribution} ${cell.formattedContribution}`"
                            :style="{ background: colorForDenseContributionValue(cell.contribution, map.maxMagnitude) }"
                            @mouseenter="focusDenseAtlasCell(map, cell)"
                            @focus="focusDenseAtlasCell(map, cell)"
                            @click="selectDenseAtlasCell(cell)"
                            @mouseleave="clearHoverReadout"
                            @blur="clearHoverReadout"
                          >
                            <span>{{ cell.formattedContribution }}</span>
                          </button>
                        </template>
                      </div>

                      <p>{{ map.narration }}</p>
                    </article>
                  </div>
                </section>

                <section v-if="denseContributorLocator" class="cnn-dense-source-locator">
                  <header>
                    <span>{{ copy.denseSourceLocatorTitle }}</span>
                    <strong>{{ denseContributorLocator.vectorLabel }} → {{ scores[selectedNodeIndex]?.label ?? copy.denseLogitTerm }}</strong>
                    <p>{{ copy.denseSourceLocatorHint }}</p>
                  </header>

                  <div class="cnn-dense-source-locator__body">
                    <article class="cnn-dense-source-locator__map">
                      <span>{{ copy.sourceMap }}</span>
                      <strong>{{ denseContributorLocator.sourceLabel }}</strong>
                      <em>{{ copy.sourceFeatureCell }} {{ denseContributorLocator.cellLabel }}</em>
                      <div class="cnn-dense-source-locator__grid" :style="sampleGridStyle(denseContributorLocator.sourceWindow)">
                        <template v-for="(row, rowIndex) in denseContributorLocator.sourceWindow" :key="`dense-source-row-${rowIndex}`">
                          <button
                            v-for="cell in row"
                            :key="`dense-source-cell-${cell.row}-${cell.col}`"
                            type="button"
                            :class="{ 'is-selected': cell.isSelected }"
                            :aria-label="`${copy.sourceFeatureCell} (${cell.row}, ${cell.col}): ${formatNumber(cell.value)}`"
                            :style="{ background: colorForPatchValue(cell.value, denseContributorLocator.sourceMatrix) }"
                            @mouseenter="focusMatrixCellReadout(`${copy.sourceMap} ${denseContributorLocator.sourceLabel}`, cell, copy.sourceValue)"
                            @focus="focusMatrixCellReadout(`${copy.sourceMap} ${denseContributorLocator.sourceLabel}`, cell, copy.sourceValue)"
                            @click="selectDenseWeightSource(denseContributorLocator.sourceIndex)"
                            @mouseleave="clearHoverReadout"
                            @blur="clearHoverReadout"
                          >
                            <span>{{ formatNumber(cell.value) }}</span>
                          </button>
                        </template>
                      </div>
                    </article>

                    <article class="cnn-dense-source-locator__equation">
                      <span>{{ copy.selectedContribution }}</span>
                      <div class="cnn-dense-source-locator__factors">
                        <div>
                          <strong>{{ denseContributorLocator.formattedActivation }}</strong>
                          <em>{{ copy.activation }} {{ denseContributorLocator.vectorLabel }}</em>
                        </div>
                        <b>×</b>
                        <div>
                          <strong>{{ denseContributorLocator.formattedWeight }}</strong>
                          <em>{{ copy.weightValue }}</em>
                        </div>
                        <b>=</b>
                        <div>
                          <strong>{{ denseContributorLocator.formattedProduct }}</strong>
                          <em>{{ copy.denseContribution }}</em>
                        </div>
                      </div>
                      <p>{{ denseContributorLocator.narration }}</p>
                      <button type="button" @click="selectDenseWeightSource(denseContributorLocator.sourceIndex)">
                        {{ copy.inspectSourceVector }}
                      </button>
                    </article>
                  </div>
                </section>

                <article class="cnn-softmax-detail__denominator">
                  <span>{{ copy.softmaxCompetition }}</span>
                  <p>{{ copy.hoverLogitTerm }}</p>
                  <div class="cnn-softmax-detail__equation" :aria-label="copy.softmaxFraction">
                    <div>
                      <span>{{ copy.normalized }}</span>
                      <strong>{{ formatPercent(activeSoftmaxRow?.probability ?? 0) }}</strong>
                    </div>
                    <div class="cnn-softmax-detail__fraction-stack">
                      <button
                        v-if="activeSoftmaxRow"
                        type="button"
                        class="cnn-softmax-detail__numerator"
                        :aria-label="`${copy.numerator}: ${activeSoftmaxRow.label}`"
                        @mouseenter="focusSoftmaxClass(activeSoftmaxRow.classIndex)"
                        @focus="focusSoftmaxClass(activeSoftmaxRow.classIndex)"
                        @click="selectLayer(selectedLayerIndex, activeSoftmaxRow.classIndex)"
                      >
                        exp({{ formatNumber(activeSoftmaxRow.logit) }}) =
                        {{ formatNumber(activeSoftmaxRow.expScore) }}
                      </button>
                      <div class="cnn-softmax-detail__line" />
                      <strong>{{ copy.denominator }} {{ formatNumber(softmaxDenominator) }}</strong>
                    </div>
                  </div>
                  <div v-if="activeSoftmaxRow" class="cnn-softmax-detail__fraction">
                    <div class="cnn-softmax-detail__terms">
                      <button
                        v-for="score in softmaxContributionRows"
                        :key="`softmax-term-${score.id}`"
                        type="button"
                        :class="{ 'is-selected': score.selected, 'is-highlighted': score.highlighted }"
                        @mouseenter="focusSoftmaxClass(score.classIndex)"
                        @mouseleave="clearSoftmaxFocus"
                        @focus="focusSoftmaxClass(score.classIndex)"
                        @blur="clearSoftmaxFocus"
                        @click="selectLayer(selectedLayerIndex, score.classIndex)"
                      >
                        exp({{ formatNumber(score.logit) }})
                      </button>
                    </div>
                  </div>
                  <div class="cnn-softmax-detail__contributions">
                    <span>{{ copy.softmaxExpTerms }}</span>
                    <button
                      v-for="score in softmaxContributionRows"
                      :key="`softmax-contribution-${score.id}`"
                      type="button"
                      :class="{ 'is-selected': score.selected, 'is-highlighted': score.highlighted }"
                      @mouseenter="focusSoftmaxClass(score.classIndex)"
                      @mouseleave="clearSoftmaxFocus"
                      @focus="focusSoftmaxClass(score.classIndex)"
                      @blur="clearSoftmaxFocus"
                      @click="selectLayer(selectedLayerIndex, score.classIndex)"
                    >
                      <span>{{ score.label }}</span>
                      <strong>{{ formatNumber(score.expScore) }}</strong>
                      <em>{{ copy.denominatorShare }} {{ formatPercent(score.expShare) }}</em>
                      <i :style="{ width: formatPercent(score.expShare), background: colorForLogitValue(score.logit) }" />
                    </button>
                  </div>
                </article>

                <section v-if="softmaxCompetitionRows.length" class="cnn-softmax-rank-panel">
                  <header>
                    <span>{{ copy.softmaxRankingTitle }}</span>
                    <strong>{{ copy.probabilityMass }}</strong>
                    <p>{{ copy.softmaxRankingHint }}</p>
                  </header>

                  <div class="cnn-softmax-rank-panel__rows">
                    <button
                      v-for="row in softmaxCompetitionRows"
                      :key="`softmax-rank-${row.id}`"
                      type="button"
                      :class="{ 'is-top': row.isTop, 'is-active': row.isActive, 'is-highlighted': row.highlighted }"
                      :aria-label="`${copy.softmaxRank} ${row.rank}: ${row.label}, ${copy.probability} ${formatPercent(row.probability)}`"
                      @mouseenter="focusSoftmaxCompetitionRow(row)"
                      @mouseleave="clearSoftmaxFocus"
                      @focus="focusSoftmaxCompetitionRow(row)"
                      @blur="clearSoftmaxFocus"
                      @click="selectSoftmaxCompetitionRow(row)"
                      @keydown.enter.prevent="selectSoftmaxCompetitionRow(row)"
                      @keydown.space.prevent="selectSoftmaxCompetitionRow(row)"
                    >
                      <b>#{{ row.rank }}</b>
                      <span>{{ row.label }}</span>
                      <strong>{{ formatPercent(row.probability) }}</strong>
                      <em>
                        logit {{ formatNumber(row.logit) }} ·
                        {{ copy.denominatorShare }} {{ formatPercent(row.expShare) }}
                      </em>
                      <small>
                        {{ copy.softmaxTopGap }} {{ formatNumber(row.logitGapFromTop) }} ·
                        {{ copy.probabilityGap }} {{ formatPercent(row.probabilityGapFromTop) }}
                      </small>
                      <i>
                        <span :style="{ width: row.expWidth, background: colorForLogitValue(row.logit) }" />
                        <strong :style="{ width: row.probabilityWidth }" />
                      </i>
                    </button>
                  </div>
                </section>

                <article
                  v-for="score in softmaxContributionRows"
                  :key="`softmax-${score.id}`"
                  :class="{ 'is-selected': score.selected, 'is-highlighted': score.highlighted }"
                  role="button"
                  tabindex="0"
                  @mouseenter="focusSoftmaxClass(score.classIndex)"
                  @mouseleave="clearSoftmaxFocus"
                  @focus="focusSoftmaxClass(score.classIndex)"
                  @blur="clearSoftmaxFocus"
                  @click="selectLayer(selectedLayerIndex, score.classIndex)"
                  @keydown.enter.prevent="selectLayer(selectedLayerIndex, score.classIndex)"
                  @keydown.space.prevent="selectLayer(selectedLayerIndex, score.classIndex)"
                >
                  <span>{{ score.label }}</span>
                  <strong>logit {{ formatNumber(score.logit) }}</strong>
                  <em>{{ copy.stabilizedExp }} {{ formatNumber(score.expScore) }}</em>
                  <i :style="{ width: formatPercent(score.probability) }" />
                  <b>{{ copy.normalized }} {{ formatPercent(score.probability) }}</b>
                </article>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  </section>
</template>
