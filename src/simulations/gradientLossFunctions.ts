import type {
  GradientLossFunctionDefinition,
  GradientReferencePoint,
  PlotPoint,
} from '../types/ml'
import { clamp, magnitude } from '../utils/math'

const sharedDomain = { xMin: -3.2, xMax: 3.2, yMin: -3.2, yMax: 3.2 }

function makeTraits(...traits: Array<[string, string]>) {
  return traits.map(([zhCN, en]) => ({ 'zh-CN': zhCN, en }))
}

function referenceDistance(point: PlotPoint, references: GradientReferencePoint[]) {
  if (!references.length) return undefined
  return Math.min(...references.map((reference) => magnitude(point.x - reference.point.x, point.y - reference.point.y)))
}

export const gradientLossFunctions: GradientLossFunctionDefinition[] = [
  {
    id: 'quadratic-bowl',
    label: { 'zh-CN': '凸二次碗', en: 'Quadratic bowl' },
    description: {
      'zh-CN': '最标准的凸损失地形，适合讲全局最优、平滑收敛和稳定步长。',
      en: 'A clean convex bowl for teaching global optima, smooth descent, and stable step sizes.',
    },
    teachingGoal: {
      'zh-CN': '用最简单的损失地形建立“会往低处走”的第一直觉。',
      en: 'Build the first intuition that optimization keeps moving toward lower terrain.',
    },
    formula: 'L(x, y)=0.45(x-0.3)^2+0.85(y+0.45)^2',
    domain: sharedDomain,
    defaultStart: { x: 2.4, y: -1.8 },
    recommendedLearningRate: 0.18,
    traits: makeTraits(['凸函数', 'Convex'], ['单一全局最优', 'Single global optimum'], ['收敛稳定', 'Stable descent']),
    referencePoints: [
      {
        id: 'quadratic-min',
        kind: 'global-minimum',
        point: { x: 0.3, y: -0.45 },
        label: { 'zh-CN': '全局最优', en: 'Global minimum' },
      },
    ],
    loss: (x, y) => 0.45 * (x - 0.3) ** 2 + 0.85 * (y + 0.45) ** 2,
    gradient: (x, y) => ({ x: 0.9 * (x - 0.3), y: 1.7 * (y + 0.45) }),
  },
  {
    id: 'tilted-ravine',
    label: { 'zh-CN': '倾斜峡谷', en: 'Tilted ravine' },
    description: {
      'zh-CN': '细长、倾斜、条件数很差的谷地，最适合演示锯齿形下降。',
      en: 'A narrow tilted valley with poor conditioning, ideal for zig-zag trajectories.',
    },
    teachingGoal: {
      'zh-CN': '让学生看到“能下降”不等于“好下降”，病态方向会拖慢训练。',
      en: 'Show that descending is not the same as descending efficiently when the landscape is ill-conditioned.',
    },
    formula: 'L(x, y)=2.6(x-0.6y-0.2)^2+0.06(y+0.15x+0.4)^2',
    domain: sharedDomain,
    defaultStart: { x: 2.2, y: 2.1 },
    recommendedLearningRate: 0.26,
    traits: makeTraits(['狭长谷地', 'Narrow valley'], ['病态条件数', 'Ill-conditioned'], ['容易锯齿', 'Zig-zag path']),
    referencePoints: [
      {
        id: 'ravine-min',
        kind: 'global-minimum',
        point: { x: -0.036697, y: -0.394495 },
        label: { 'zh-CN': '谷底', en: 'Valley minimum' },
      },
    ],
    loss: (x, y) => 2.6 * (x - 0.6 * y - 0.2) ** 2 + 0.06 * (y + 0.15 * x + 0.4) ** 2,
    gradient: (x, y) => {
      const u = x - 0.6 * y - 0.2
      const v = y + 0.15 * x + 0.4
      return {
        x: 5.2 * u + 0.018 * v,
        y: -3.12 * u + 0.12 * v,
      }
    },
  },
  {
    id: 'rosenbrock',
    label: { 'zh-CN': '香蕉谷', en: 'Rosenbrock valley' },
    description: {
      'zh-CN': '弯曲谷底会让路径很难直接贴着最优方向走，适合讲优化困难。',
      en: 'The curved valley makes it hard to stay aligned with the true route to the optimum.',
    },
    teachingGoal: {
      'zh-CN': '让学生看到“非线性谷底”如何让简单梯度下降变得缓慢。',
      en: 'Show how a curved valley can make plain gradient descent feel surprisingly slow.',
    },
    formula: 'L(x, y)=0.12(1-x)^2+1.8(y-x^2)^2',
    domain: { xMin: -2, xMax: 2, yMin: -1.2, yMax: 3 },
    defaultStart: { x: -1.5, y: 1.8 },
    recommendedLearningRate: 0.045,
    traits: makeTraits(['弯曲谷底', 'Curved valley'], ['优化困难', 'Hard to optimize'], ['路径弯折', 'Curving trajectory']),
    referencePoints: [
      {
        id: 'rosenbrock-min',
        kind: 'global-minimum',
        point: { x: 1, y: 1 },
        label: { 'zh-CN': '全局最优', en: 'Global minimum' },
      },
    ],
    loss: (x, y) => 0.12 * (1 - x) ** 2 + 1.8 * (y - x * x) ** 2,
    gradient: (x, y) => ({
      x: 0.24 * (x - 1) - 7.2 * x * (y - x * x),
      y: 3.6 * (y - x * x),
    }),
  },
  {
    id: 'saddle',
    label: { 'zh-CN': '鞍点曲面', en: 'Saddle surface' },
    description: {
      'zh-CN': '一个方向向下、另一个方向向上，适合讲“梯度变小不代表找到最优”。',
      en: 'One direction descends while another rises, so small gradients do not imply an optimum.',
    },
    teachingGoal: {
      'zh-CN': '帮助学生区分“平坦”与“最优”，理解鞍点为什么会误导观察。',
      en: 'Help students separate flat-looking regions from true optima and understand saddle behavior.',
    },
    formula: 'L(x, y)=0.5x^2-0.5y^2+0.15xy',
    domain: sharedDomain,
    defaultStart: { x: 0.45, y: 0.55 },
    recommendedLearningRate: 0.14,
    traits: makeTraits(['鞍点', 'Saddle point'], ['梯度可很小', 'Small gradients'], ['不是最优', 'Not an optimum']),
    referencePoints: [
      {
        id: 'saddle-origin',
        kind: 'saddle',
        point: { x: 0, y: 0 },
        label: { 'zh-CN': '鞍点', en: 'Saddle point' },
      },
    ],
    loss: (x, y) => 0.5 * x * x - 0.5 * y * y + 0.15 * x * y,
    gradient: (x, y) => ({ x: x + 0.15 * y, y: -y + 0.15 * x }),
  },
  {
    id: 'multi-well',
    label: { 'zh-CN': '多井非凸面', en: 'Multi-well surface' },
    description: {
      'zh-CN': '多个低谷会让起点直接影响最后落入哪一个局部最小值。',
      en: 'Multiple wells make the final destination depend strongly on the initial point.',
    },
    teachingGoal: {
      'zh-CN': '让学生观察局部最小值、起点依赖和非凸优化的探索感。',
      en: 'Let students observe local minima, start-point dependence, and the exploratory feel of non-convex optimization.',
    },
    formula: 'L(x, y)=0.08(x^4+y^4)-0.6(x^2+y^2)+0.15xy+2',
    domain: sharedDomain,
    defaultStart: { x: 2.1, y: -1.9 },
    recommendedLearningRate: 0.11,
    traits: makeTraits(['非凸', 'Non-convex'], ['局部极小值', 'Local minima'], ['起点敏感', 'Start-point sensitive']),
    referencePoints: [
      {
        id: 'multiwell-a',
        kind: 'local-minimum',
        point: { x: -1.85, y: -1.85 },
        label: { 'zh-CN': '局部谷地 A', en: 'Local basin A' },
      },
      {
        id: 'multiwell-b',
        kind: 'local-minimum',
        point: { x: 1.85, y: 1.85 },
        label: { 'zh-CN': '局部谷地 B', en: 'Local basin B' },
      },
      {
        id: 'multiwell-c',
        kind: 'local-minimum',
        point: { x: 1.85, y: -1.7 },
        label: { 'zh-CN': '局部谷地 C', en: 'Local basin C' },
      },
    ],
    loss: (x, y) => 0.08 * (x ** 4 + y ** 4) - 0.6 * (x * x + y * y) + 0.15 * x * y + 2,
    gradient: (x, y) => ({
      x: 0.32 * x ** 3 - 1.2 * x + 0.15 * y,
      y: 0.32 * y ** 3 - 1.2 * y + 0.15 * x,
    }),
  },
]

export const defaultGradientLossFunctionId = 'quadratic-bowl'

export const gradientLossFunctionRegistry = Object.fromEntries(
  gradientLossFunctions.map((definition) => [definition.id, definition]),
) as Record<string, GradientLossFunctionDefinition>

export function getGradientLossFunctionDefinition(id?: string) {
  return gradientLossFunctionRegistry[id ?? defaultGradientLossFunctionId] ?? gradientLossFunctionRegistry[defaultGradientLossFunctionId]
}

export function clampPointToLossDomain(
  definition: GradientLossFunctionDefinition,
  point: PlotPoint,
) {
  return {
    x: clamp(point.x, definition.domain.xMin, definition.domain.xMax),
    y: clamp(point.y, definition.domain.yMin, definition.domain.yMax),
  }
}

export function getNearestReferenceDistance(
  definition: GradientLossFunctionDefinition,
  point: PlotPoint,
) {
  return definition.referencePoints?.length ? referenceDistance(point, definition.referencePoints) : undefined
}
