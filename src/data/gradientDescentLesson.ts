import type { LocalizedCopy, StorySection } from '../types/ml'
import type {
  GradientDescentChapterLesson,
  GradientDescentLessonBlock,
  GradientDescentSceneId,
} from '../types/gradientDescentLesson'
import { gradientDescentModule } from './gradientDescentModule'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

interface ChapterSupplement {
  code: string
  output: string
  codeTitle: LocalizedCopy
  codeNote: LocalizedCopy
  outputTitle: LocalizedCopy
  outputInterpretation: LocalizedCopy
  prediction: LocalizedCopy
  labPrompt: LocalizedCopy
  observation: LocalizedCopy
}

const supplements: Record<GradientDescentSceneId, ChapterSupplement> = {
  'loss-function': {
    codeTitle: loc('用同一条直线计算五个样本的 MSE', 'Compute MSE for five samples with one line'),
    code: `import numpy as np

x = np.array([1., 2., 3., 4., 5.])
y = np.array([52., 59., 65., 72., 78.])
w, b = 6.0, 47.0

y_hat = w * x + b
residual = y - y_hat
mse = np.mean(residual ** 2)
print(y_hat)
print(residual)
print(f"MSE = {mse:.6f}")`,
    codeNote: loc('残差在整门课中统一定义为 `真实值 - 预测值`。', 'Residual is consistently defined as `target - prediction` throughout this course.'),
    outputTitle: loc('当前参数的真实运行输出', 'Runtime output for the current parameters'),
    output: `[53. 59. 65. 71. 77.]
[-1.  0.  0.  1.  1.]
MSE = 0.600000`,
    outputInterpretation: loc('五个残差平方后取平均得到 `0.6`。这个单一数字把一整组预测压缩成可比较的评分。', 'Squaring and averaging the five residuals gives `0.6`. This single value turns a full set of predictions into a comparable score.'),
    prediction: loc('如果只把斜率从 `6` 调大，你预计左端样本还是右端样本的残差变化更明显？MSE 会先下降还是上升？', 'If only the slope increases from `6`, which residuals should change more: samples on the left or right? Will MSE fall or rise first?'),
    labPrompt: loc('先单独移动斜率，再单独移动截距；比较“旋转直线”和“整体平移直线”对五条残差的不同影响。', 'Move slope alone, then intercept alone. Compare rotating the line with shifting the whole line and watch how the five residuals respond.'),
    observation: loc('改变斜率或截距后，先看直线怎样移动，再看残差线和 MSE 怎样同步变化。最低 MSE 不一定对应“穿过最多点”的直线。', 'Change slope or intercept, then watch the line, residual segments, and MSE move together. The lowest MSE is not necessarily the line that passes through the most points.'),
  },
  landscape: {
    codeTitle: loc('把两个参数铺成损失网格', 'Evaluate loss over a two-parameter grid'),
    code: `w_values = np.linspace(4.0, 9.0, 31)
b_values = np.linspace(38.0, 54.0, 33)
loss_grid = np.array([
    [np.mean((y - (w * x + b)) ** 2) for w in w_values]
    for b in b_values
])
best_b_index, best_w_index = np.unravel_index(loss_grid.argmin(), loss_grid.shape)
print(w_values[best_w_index], b_values[best_b_index])`,
    codeNote: loc('网格是观察地形的离散近似；精确最小二乘解不必正好落在网格点上。', 'The grid is a discrete view of the landscape; the exact least-squares solution need not land on a grid point.'),
    outputTitle: loc('网格搜索与精确解', 'Grid search and exact solution'),
    output: `grid best: w = 6.500000, b = 45.500000
exact least squares: w = 6.500000, b = 45.700000, MSE = 0.060000`,
    outputInterpretation: loc('等高线越密，沿该方向移动时损失变化越快。长而窄的谷地说明两个参数方向的尺度不同。', 'Tightly packed contours mean loss changes quickly in that direction. A long narrow valley reveals different parameter scales.'),
    prediction: loc('把参数点从稀疏等高线区域拖到密集区域时，你预计相同的参数位移会造成更大还是更小的损失变化？', 'When moving from sparse contours into a dense region, should the same parameter displacement create a larger or smaller loss change?'),
    labPrompt: loc('拖动等高线上的参数点，并同时观察曲面高度、当前位置 MSE 与精确最小二乘参考点。', 'Drag the parameter point on the contour map while comparing surface height, current MSE, and the exact least-squares reference.'),
    observation: loc('拖动参数点时，把上方曲面高度、等高线位置和右侧数值同时对应起来；三者描述的是同一个损失函数。', 'While moving the parameter point, align the surface height, contour position, and numeric readout. All three describe the same loss function.'),
  },
  'gradient-rule': {
    codeTitle: loc('手写一次解析梯度更新', 'Write one analytic gradient update'),
    code: `n = len(x)
y_hat = w * x + b
residual = y - y_hat

dw = -(2 / n) * np.sum(x * residual)
db = -(2 / n) * np.sum(residual)
eta = 0.02
w_next = w - eta * dw
b_next = b - eta * db
next_mse = np.mean((y - (w_next * x + b_next)) ** 2)
print(dw, db)
print(w_next, b_next, next_mse)`,
    codeNote: loc('负号来自残差定义 `r=y-ŷ`。先求导，再由更新式中的另一个负号决定下降方向。', 'The derivative sign follows from `r=y-ŷ`; the update rule then uses its own minus sign to choose descent.'),
    outputTitle: loc('一次更新前后', 'Before and after one update'),
    output: `dw = -3.200000, db = -0.400000
w_next = 6.064000, b_next = 47.008000
MSE: 0.600000 -> 0.440192`,
    outputInterpretation: loc('梯度为负，所以减去梯度会增大两个参数。方向由梯度决定，移动距离由学习率缩放。', 'The gradient is negative, so subtracting it increases both parameters. The gradient chooses direction; the learning rate scales distance.'),
    prediction: loc('当前 `dw=-3.2`、`db=-0.4`。代入 `参数 -= η × 梯度` 后，两个参数会增大还是减小？', 'Here `dw=-3.2` and `db=-0.4`. After `parameter -= η × gradient`, will each parameter increase or decrease?'),
    labPrompt: loc('逐行查看样本贡献，再按“前向 → 梯度 → 缩放 → 更新”单步推进，确认每个符号都对应一次具体计算。', 'Inspect sample contributions, then step through forward, gradient, scaling, and update so every symbol maps to a concrete computation.'),
    observation: loc('逐行查看每个样本对 `dw` 和 `db` 的贡献，再单步执行“计算梯度 → 缩放 → 更新 → 重新计算损失”。', 'Inspect each sample contribution to `dw` and `db`, then step through gradient, scaling, update, and loss recomputation.'),
  },
  'learning-rate': {
    codeTitle: loc('只改变学习率，保持起点与数据不变', 'Change only the learning rate'),
    code: `for eta in [0.002, 0.02, 0.08, 0.30]:
    w_run, b_run = 0.0, 0.0
    losses = []
    for step in range(60):
        residual = y - (w_run * x + b_run)
        dw = -(2 / len(x)) * np.sum(x * residual)
        db = -(2 / len(x)) * np.sum(residual)
        w_run -= eta * dw
        b_run -= eta * db
        losses.append(np.mean((y - (w_run * x + b_run)) ** 2))
        if not np.isfinite(losses[-1]) or losses[-1] > 1e12:
            break
    print(eta, len(losses), losses[-1])`,
    codeNote: loc('代码不隐藏发散，也不把参数强行夹回安全范围。', 'The code exposes divergence instead of clamping parameters back into a safe range.'),
    outputTitle: loc('原始尺度下的四种速度', 'Four rates on the raw scale'),
    output: `eta=0.002  updates=60  final_MSE=291.039091  status=max-updates
eta=0.020  updates=60  final_MSE=134.099215  status=max-updates
eta=0.080  updates=60  final_MSE=11.332237   status=max-updates
eta=0.300  updates=6   final_MSE=1.067485e13 status=diverged-threshold`,
    outputInterpretation: loc('学习率不是越大越快。它必须与地形曲率和特征尺度配合；标准化后，同一个数值可能产生完全不同的行为。', 'A larger learning rate is not automatically faster. It interacts with curvature and feature scale; after standardization, the same value can behave very differently.'),
    prediction: loc('在原始输入尺度上，把学习率从 `0.02` 提高到 `0.30`，路径会更快到达低点，还是越过低点并发散？', 'On raw inputs, when the rate rises from `0.02` to `0.30`, will the path reach the bottom faster or overshoot and diverge?'),
    labPrompt: loc('保持起点不变，比较四个学习率；再切换标准化输入，观察为什么相同数值不再产生相同有效步长。', 'Keep the start fixed and compare four rates; then standardize the input and see why the same numeric rate no longer produces the same effective step.'),
    observation: loc('固定“原始尺度”，比较四条路径；再切到“标准化”，观察相同学习率为何不再代表相同步长。', 'Compare all four paths on the raw scale, then switch to standardized inputs and see why the same numeric rate no longer means the same effective step.'),
  },
  'saddle-local-minima': {
    codeTitle: loc('用中心差分检查局部方向', 'Check a local direction with central differences'),
    code: `def central_difference(f, point, axis, eps=1e-5):
    plus = point.copy(); plus[axis] += eps
    minus = point.copy(); minus[axis] -= eps
    return (f(*plus) - f(*minus)) / (2 * eps)

point = np.array([0.2, -0.1])
gx = central_difference(loss_fn, point, 0)
gy = central_difference(loss_fn, point, 1)
print(np.array([gx, gy]))`,
    codeNote: loc('梯度很小只描述当前位置；它不能单独证明这是全局最优点。', 'A small gradient describes only the current neighborhood; it does not prove global optimality.'),
    outputTitle: loc('不同地形，不同困难', 'Different terrain, different difficulty'),
    output: `tilted-ravine: narrow valley, anisotropic curvature
rosenbrock: curved valley
saddle: uphill in one direction, downhill in another
multi-well: several locally low regions`,
    outputInterpretation: loc('鞍点、弯曲峡谷和多井地形的失败原因不同，不能用“梯度小”这一条规则全部解释。', 'Saddles, curved ravines, and multi-well terrain fail for different reasons; a single “small gradient” rule cannot explain them all.'),
    prediction: loc('如果当前位置的梯度范数接近零，你能否只凭这个数值判断已经找到全局最低点？换成鞍点地形后再验证。', 'If the gradient norm is near zero, can that number alone prove a global minimum? Test the claim on the saddle terrain.'),
    labPrompt: loc('切换峡谷、Rosenbrock、鞍点和多井地形；改变起点并单步下降，区分局部方向与整张地图。', 'Switch among ravine, Rosenbrock, saddle, and multi-well terrains; change the start and step downhill to separate local direction from the full map.'),
    observation: loc('切换四种地形并移动探针。重点比较：当前位置的高度、邻域方向和整张地图中的最低区域是否一致。', 'Switch among four terrains and move the probe. Compare local height and directions with the lowest region on the full map.'),
  },
  'noise-and-batch': {
    codeTitle: loc('固定随机种子生成真实 mini-batch', 'Build real mini-batches with a fixed seed'),
    code: `rng = np.random.default_rng(2801)
order = rng.permutation(len(x))
batches = [order[i:i + 2] for i in range(0, len(x), 2)]

for batch_index, ids in enumerate(batches):
    print(batch_index, ids.tolist(), x[ids].tolist(), y[ids].tolist())`,
    codeNote: loc('五个样本按 batch size 2 切分时，最后一个 batch 只有一个样本；页面不会补造第六条数据。', 'With five samples and batch size two, the final batch has one sample; the lesson does not invent a sixth row.'),
    outputTitle: loc('种子 2801 的首轮样本分组', 'First-epoch groups for seed 2801'),
    output: `batch 0: ['s4', 's1']
batch 1: ['s3', 's5']
batch 2: ['s2']
full / mini-batch / stochastic paths use the same five-row dataset`,
    outputInterpretation: loc('mini-batch 与 SGD 的“抖动”来自每次只看到部分真实样本。它不是为了画面好看而添加的随机噪声。', 'Mini-batch and SGD jitter comes from seeing only part of the real dataset at each update. It is not decorative random noise.'),
    prediction: loc('在相同数据与种子下，full batch、batch size 2 和 SGD 的路径中，哪一条最平滑？哪一条每轮更新次数最多？', 'With the same data and seed, which path should be smoothest, and which mode should perform the most updates per epoch?'),
    labPrompt: loc('切换三种 batch 模式并单步查看本次样本 ID。注意最后一个 mini-batch 只有一条真实样本。', 'Switch batch modes and step through the actual sample IDs. Notice that the final mini-batch contains one real sample.'),
    observation: loc('切换 full、mini-batch 与 stochastic，并逐步查看本次使用的样本 ID、梯度与全量 MSE。', 'Switch among full, mini-batch, and stochastic updates; step through the actual sample IDs, gradient, and full-data MSE.'),
  },
}

const chapterMarkerTitles: Record<string, LocalizedCopy> = {
  'data-model': loc('数据与模型', 'Data and model'),
  'prediction-error': loc('预测、残差与损失', 'Prediction, residual, and loss'),
  'loss-slice': loc('一维损失切片', 'One-dimensional loss slice'),
  'uphill-gradient': loc('上坡梯度', 'Uphill gradient'),
  'negative-direction': loc('负梯度方向', 'Negative-gradient direction'),
  'learning-rate': loc('学习率缩放', 'Learning-rate scaling'),
  'update-verify': loc('更新并重新验证', 'Update and verify'),
}

const transcript = loc(
  '动画从五条学习时长与分数数据出发，依次展示预测、残差、MSE、损失切片、上坡梯度、负梯度、学习率缩放，以及参数更新后重新计算损失的完整过程。当前参数 `(6,47)` 的 MSE 为 `0.6`；以学习率 `0.02` 更新到 `(6.064,47.008)` 后，MSE 变为 `0.440192`。',
  'The animation follows five study-hour and score samples through prediction, residuals, MSE, a loss slice, the uphill gradient, negative-gradient direction, learning-rate scaling, and a complete parameter update. MSE moves from `0.6` at `(6,47)` to `0.440192` at `(6.064,47.008)`.',
)

function requireTeaching(section: StorySection) {
  if (!section.teachingBlocks) throw new Error(`Missing gradient teaching blocks: ${section.id}`)
  return section.teachingBlocks
}

function buildLesson(section: StorySection): GradientDescentChapterLesson {
  const id = section.id as GradientDescentSceneId
  const teaching = requireTeaching(section)
  const extra = supplements[id]
  const blocks: GradientDescentLessonBlock[] = [
    { id: `${id}-question`, kind: 'explanation', role: 'question', title: loc('本章问题', 'Chapter question'), body: section.markdown ?? section.callout! },
    { id: `${id}-concept`, kind: 'explanation', role: 'concept', title: loc('先建立直觉', 'Build the intuition'), body: teaching.concept },
    { id: `${id}-example`, kind: 'explanation', role: 'example', title: loc('跟随同一组数据', 'Follow the shared dataset'), body: teaching.workedExample },
    { id: `${id}-formula`, kind: 'formula', title: loc('把直觉写成数学', 'Connect the intuition to math'), formula: teaching.formula, explanation: loc('公式中的符号与下面 Python 代码、运行输出和实验台保持一致。', 'The symbols stay consistent across the Python code, runtime output, and lab below.') },
    { id: `${id}-code`, kind: 'code', title: extra.codeTitle, code: extra.code, note: extra.codeNote },
    { id: `${id}-output`, kind: 'runtime-output', title: extra.outputTitle, output: extra.output, interpretation: extra.outputInterpretation },
    { id: `${id}-prediction`, kind: 'explanation', role: 'prediction', title: loc('实验前先预测', 'Predict before experimenting'), body: extra.prediction },
  ]

  if (id === 'gradient-rule') {
    blocks.push({
      id: 'gradient-rule-animation',
      kind: 'media',
      title: loc('一次梯度更新：从数据到重新验证', 'One gradient update: data to verification'),
      assetPath: '/manim/gradient-descent/gradient-rule.mp4',
      posterPath: '/manim/gradient-descent/gradient-rule.svg',
      transcript,
      chapterMarkers: [0, 12, 24, 36, 48, 60, 72].map((startSeconds, index) => {
        const markerIds = ['data-model', 'prediction-error', 'loss-slice', 'uphill-gradient', 'negative-direction', 'learning-rate', 'update-verify']
        const markerId = markerIds[index]
        return { id: markerId, startSeconds, title: chapterMarkerTitles[markerId] }
      }),
    })
  }

  blocks.push(
    { id: `${id}-lab`, kind: 'observation-lab', title: loc('引导实验台', 'Guided lab'), prompt: extra.labPrompt, sceneId: id },
    { id: `${id}-observation`, kind: 'explanation', role: 'observation', title: loc('观察结果', 'What changed'), body: extra.observation },
    { id: `${id}-mistake`, kind: 'explanation', role: 'misconception', title: loc('常见误区', 'Common misconception'), body: teaching.commonMistake },
    { id: `${id}-conclusion`, kind: 'explanation', role: 'conclusion', title: loc('本章结论', 'Chapter conclusion'), body: teaching.rememberThis },
  )

  if (id !== 'noise-and-batch') return { id, blocks }
  return {
    id,
    blocks,
    references: [
      { label: loc('Dive into Deep Learning：线性回归与优化', 'Dive into Deep Learning: Linear Regression and Optimization'), href: 'https://d2l.ai/chapter_linear-regression/linear-regression.html', note: loc('用于继续理解梯度下降与线性模型的联系。', 'For further study of gradient descent and linear models.') },
      { label: loc('Stanford CS231n：优化笔记', 'Stanford CS231n: Optimization notes'), href: 'https://cs231n.github.io/optimization-1/', note: loc('用于继续理解梯度、学习率与 mini-batch。', 'For further study of gradients, learning rates, and mini-batches.') },
      { label: loc('scikit-learn：随机梯度下降', 'scikit-learn: Stochastic Gradient Descent'), href: 'https://scikit-learn.org/stable/modules/sgd.html', note: loc('用于了解工程实现中的 SGD 接口与注意事项。', 'For the engineering interface and practical considerations around SGD.') },
    ],
    downloads: [
      { label: loc('中文可执行 Notebook', 'Executed Chinese notebook'), publicPath: '/gradient-descent/v1/notebooks/gradient-descent-from-scratch.zh-CN.ipynb', kind: 'notebook' },
      { label: loc('英文可执行 Notebook', 'Executed English notebook'), publicPath: '/gradient-descent/v1/notebooks/gradient-descent-from-scratch.en.ipynb', kind: 'notebook' },
      { label: loc('五条共享回归数据', 'Five-row shared regression data'), publicPath: '/gradient-descent/v1/data/study-hours-scores.csv', kind: 'csv' },
      { label: loc('互动资产清单', 'Interaction asset manifest'), publicPath: '/gradient-descent/v1/interaction-manifest.json', kind: 'json' },
      { label: loc('梯度更新动画', 'Gradient-update animation'), publicPath: '/manim/gradient-descent/gradient-rule.mp4', kind: 'video' },
    ],
  }
}

export const gradientDescentLessons = Object.fromEntries(
  gradientDescentModule.chapters.map((section) => [section.id, buildLesson(section)]),
) as Record<GradientDescentSceneId, GradientDescentChapterLesson>

export function gradientDescentLessonFor(id: string) {
  return gradientDescentLessons[id as GradientDescentSceneId] ?? gradientDescentLessons['loss-function']
}
