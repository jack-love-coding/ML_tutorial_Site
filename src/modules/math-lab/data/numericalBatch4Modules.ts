import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  MathLabTocItem,
  VisualAsset,
} from '../types/mathLab.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function tocFor(item: MathLabSection): MathLabTocItem {
  return { id: item.id, level: item.level, title: item.title }
}

function insertAfterOpening<T>(items: readonly T[], additions: readonly T[]): T[] {
  if (!items.length) return [...additions]
  return [items[0]!, ...additions, ...items.slice(1)]
}

function keepFirstLabPlacement(sections: readonly MathLabSection[]): MathLabSection[] {
  const seen = new Set<string>()
  return sections.map((item) => {
    if (!item.labIds?.length) return item
    const labIds = item.labIds.filter((labId) => {
      if (seen.has(labId)) return false
      seen.add(labId)
      return true
    })
    return labIds.length ? { ...item, labIds } : { ...item, labIds: undefined }
  })
}

const banknoteOptimizationDiagnosticsVisual: VisualAsset = {
  id: 'banknote-optimization-diagnostics-illustration',
  type: 'image',
  title: copy('尺度、步长与诊断：同一批 Banknote 运行', 'Scale, step size, and diagnosis across the same Banknote runs'),
  assetPath: '/math-lab/numerical-methods/banknote-optimization-diagnostics.png',
  transcript: copy(
    '三栏图的全部数字来自锁定输出。左栏对比原始四特征与仅用 960 行训练集拟合的标准化：均值为 [0.469, 1.978, 1.320, -1.142]，population scale 为 [2.805, 5.814, 4.235, 2.073]。两条路径都用固定步长 4；raw-fixed 用虚线和方形终点表示第 112 次因 validation-patience 停止，standardized-stable 用实线和圆形终点表示第 484 次因 gradient-norm 数学收敛。中栏在标准化数据上比较固定 32 与 Armijo：固定路径的菱形最佳点是第 13 次、validation BCE 0.058853，方形终点是第 73 次 validation-patience；Armijo 拒绝第一次 32 试探，回溯 1 次后接受 16，并在第 48 次以 validation BCE 0.068247、梯度范数 7.017e-6 到达与最佳点重合的圆形数学收敛终点。右栏分别画出训练 BCE、验证 BCE 与梯度范数；固定 32 的终点读数为 train 0.054023、validation 0.082850、梯度范数 0.034620，Armijo 的终点读数为 train 0.044635、validation 0.068247、梯度范数 7.017e-6。菱形表示最佳 validation，方形表示模型选择终点，圆形表示数学收敛终点，因此不依赖颜色也能读图。',
    'All numbers in the three panels come from the locked outputs. The left panel compares four raw features with standardization fitted only on the 960 training rows: means [0.469, 1.978, 1.320, -1.142] and population scales [2.805, 5.814, 4.235, 2.073]. Both paths use fixed step 4. The dashed raw-fixed path ends with a square at iteration 112 for validation-patience, while the solid standardized-stable path ends with a circle at iteration 484 for mathematical gradient-norm convergence. The middle panel compares fixed 32 with Armijo on standardized data. The fixed path has a diamond best point at iteration 13 with validation BCE 0.058853 and a square validation-patience terminal at iteration 73. Armijo rejects the first trial at 32, accepts 16 after one backtrack, and reaches a combined best/terminal circle at iteration 48 with validation BCE 0.068247 and gradient norm 7.017e-6. The right panel separates training BCE, validation BCE, and gradient norm. Fixed 32 ends at train 0.054023, validation 0.082850, and gradient norm 0.034620; Armijo ends at train 0.044635, validation 0.068247, and gradient norm 7.017e-6. Diamonds mean best validation, squares mean model-selection terminals, and circles mean mathematical-convergence terminals, so the diagram remains readable without color.',
  ),
  learningPurpose: copy(
    '把 train-only 标准化、固定步长与 Armijo 的接受规则，以及最佳 validation 与终止原因放进同一条可核对的数值链。',
    'Connect train-only standardization, fixed and Armijo step acceptance, best validation, and terminal reasons in one auditable numerical chain.',
  ),
  alt: copy(
    '三栏深色教学图：左栏以虚线方形和实线圆形比较原始特征与训练集标准化，中央比较固定 32 与 Armijo 32→16，右栏用训练 BCE、验证 BCE、梯度范数及菱形、方形、圆形标记区分最佳点、模型选择终点和数学收敛终点。',
    'Three-panel dark teaching diagram: the left compares raw and train-only standardized features with dashed-square and solid-circle routes; the middle compares fixed 32 with Armijo 32→16; the right separates train BCE, validation BCE, and gradient norm, using diamonds, squares, and circles for best-validation, model-selection, and mathematical-convergence markers.',
  ),
  caption: copy(
    '同一批锁定运行同时说明尺度为何改变固定步长的可用性、Armijo 为何拒绝 32 后接受 16，以及最佳 validation checkpoint 为什么不等于数学收敛。',
    'The same locked runs show why scale changes fixed-step usability, why Armijo rejects 32 and accepts 16, and why a best-validation checkpoint is not the same as mathematical convergence.',
  ),
}

const banknoteFeatureScalingAnimation: VisualAsset = {
  id: 'banknote-feature-scaling-video',
  type: 'manim-video',
  title: copy('特征尺度如何改变固定步长的可用性', 'How feature scale changes fixed-step usability'),
  assetPath: '/manim/numerical-methods/banknote-feature-scaling.mp4',
  posterPath: '/manim/numerical-methods/banknote-feature-scaling-poster.png',
  transcript: copy(
    '动画使用锁定的 1,372 行 Banknote 数据和 960/206/206 划分。它先比较四个原始特征的不同尺度，再展示只用训练集拟合的均值 [0.469, 1.978, 1.320, -1.142] 与 population scale [2.805, 5.814, 4.235, 2.073]。raw-fixed 与 standardized-stable 都使用固定步长 4.0：raw 路径在第 52 次达到最佳 validation 后，于第 112 次因 validation-patience 停止；标准化路径在第 484 次以 gradient-norm 数学收敛。虚线与方形表示 raw 的模型选择终点，实线与圆形表示标准化后的数学收敛，因此关闭动画或不看颜色仍能读出差异。',
    'The animation uses the locked 1,372-row Banknote data and 960/206/206 split. It first compares the unequal raw feature scales, then shows train-only means [0.469, 1.978, 1.320, -1.142] and population scales [2.805, 5.814, 4.235, 2.073]. raw-fixed and standardized-stable both use fixed step 4.0: the raw route reaches its best validation point at iteration 52 and stops for validation-patience at 112, while the standardized route reaches mathematical gradient-norm convergence at 484. Dashed lines and a square mark the raw model-selection terminal; a solid line and circle mark standardized mathematical convergence, so the distinction remains readable without motion or color.',
  ),
  learningPurpose: copy(
    '用同一步长的两条锁定轨迹说明 train-only 标准化改变的是更新条件，而不是替换教学数据。',
    'Use two locked traces with the same step to show that train-only standardization changes update conditioning without replacing the teaching data.',
  ),
  alt: copy(
    '原始尺度的虚线路径以方形 validation-patience 终点结束，训练集标准化后的实线路径以圆形 gradient-norm 终点结束。',
    'A dashed raw-scale route ends at a square validation-patience terminal, while a solid train-standardized route ends at a circular gradient-norm terminal.',
  ),
  caption: copy(
    '同样的固定步长 4.0，在原始尺度上失衡，在训练集标准化后可达到数学收敛。',
    'The same fixed step 4.0 is poorly conditioned on raw features but reaches mathematical convergence after train-only standardization.',
  ),
}

const banknoteFixedVsArmijoAnimation: VisualAsset = {
  id: 'banknote-fixed-vs-armijo-video',
  type: 'manim-video',
  title: copy('固定 32 与 Armijo 32→16', 'Fixed 32 versus Armijo 32→16'),
  assetPath: '/manim/numerical-methods/banknote-fixed-vs-armijo.mp4',
  posterPath: '/manim/numerical-methods/banknote-fixed-vs-armijo-poster.png',
  transcript: copy(
    '动画在同一标准化起点比较固定步长与 Armijo。固定 32 的第一次更新会被直接接受，但之后过冲；最佳 validation 是第 13 次的 0.0588531562，最终在第 73 次因 validation-patience 停止。Armijo 先检查 penalized training objective，拒绝第一次 alpha=32 试探，回溯一次后接受 alpha=16；所有接受行都满足 sufficient decrease，并在第 48 次以 gradient-norm 数学收敛。固定路径使用虚线和方形终点，Armijo 使用实线和圆形终点，拒绝试探用叉号和文字标注。',
    'The animation compares a fixed step with Armijo from the same standardized start. Fixed 32 accepts its first update directly but later overshoots; its best validation value is 0.0588531562 at iteration 13, and it stops for validation-patience at 73. Armijo checks the penalized training objective, rejects the first alpha=32 trial, accepts alpha=16 after one backtrack, and every accepted row satisfies sufficient decrease before mathematical gradient-norm convergence at iteration 48. The fixed route uses a dashed line and square terminal, Armijo uses a solid line and circular terminal, and the rejected trial is marked with a cross and written label.',
  ),
  learningPurpose: copy(
    '把 sufficient decrease、回溯次数、最佳 validation 与终止原因放到同一条可核对的更新路径。',
    'Place sufficient decrease, backtrack count, best validation, and terminal reason on one auditable update path.',
  ),
  alt: copy(
    '固定 32 的虚线路径越过最佳点并以方形停止；Armijo 用叉号拒绝 32、接受 16，并以圆形收敛。',
    'The dashed fixed-32 route overshoots its best point and stops at a square; Armijo rejects 32 with a cross, accepts 16, and converges at a circle.',
  ),
  caption: copy(
    'Armijo 不偷看 validation：它只用训练目标拒绝 32、接受 16，并保留数学收敛资格。',
    'Armijo does not inspect validation: it uses only the training objective to reject 32, accept 16, and retain mathematical-convergence eligibility.',
  ),
}

const banknoteTrainingDiagnosticsAnimation: VisualAsset = {
  id: 'banknote-training-diagnostics-video',
  type: 'manim-video',
  title: copy('从训练轨迹到下一次单变量实验', 'From training traces to the next one-variable experiment'),
  assetPath: '/manim/numerical-methods/banknote-training-diagnostics.mp4',
  posterPath: '/manim/numerical-methods/banknote-training-diagnostics-poster.png',
  transcript: copy(
    '动画读取五条锁定的真实 Banknote trace，并重点比较 standardized-too-small 与 standardized-stable、standardized-too-large 与 standardized-armijo。它分别标出 train BCE、validation BCE、gradient norm、菱形最佳 validation、方形模型选择终点和圆形数学收敛终点。too-small 在第 500 次仍以 gradient norm 0.110062 达到 max-iterations；只把 step 从 0.02 改为 4.0，stable 在第 484 次达到 gradient-norm。固定 32 在第 13 次出现短暂最佳点后于第 73 次 validation-patience；只把方法改为 Armijo 后，先拒绝 32、接受 16，并在第 48 次收敛。最终合格的 Armijo 模型报告 test BCE 0.0551101232、accuracy 0.9805825243、ROC-AUC 0.9994279176 和 confusion matrix [[110,4],[0,92]]。',
    'The animation reads all five locked real Banknote traces and focuses on standardized-too-small versus standardized-stable, then standardized-too-large versus standardized-armijo. It separately labels train BCE, validation BCE, gradient norm, diamond best-validation points, square model-selection terminals, and circular mathematical-convergence terminals. too-small reaches max-iterations at 500 with gradient norm 0.110062; changing only the step from 0.02 to 4.0 lets stable reach gradient-norm at iteration 484. Fixed 32 has a transient best point at 13 and stops for validation-patience at 73; changing only the method to Armijo rejects 32, accepts 16, and converges at 48. The eligible final Armijo model reports test BCE 0.0551101232, accuracy 0.9805825243, ROC-AUC 0.9994279176, and confusion matrix [[110,4],[0,92]].',
  ),
  learningPurpose: copy(
    '把可见现象、可能原因、一个变量变化与预期下一次运行连接到真实终止记录。',
    'Connect visible symptoms, plausible causes, one-variable changes, and expected next runs to real terminal records.',
  ),
  alt: copy(
    '两组真实训练曲线用菱形、方形和圆形区分最佳 validation、模型选择停止与数学收敛，并列出下一次只改一个变量。',
    'Two real trace comparisons use diamonds, squares, and circles for best validation, model-selection stops, and mathematical convergence, with one variable named for the next run.',
  ),
  caption: copy(
    '诊断不是给曲线贴标签，而是保留终止原因并提出下一次可检验的单变量改变。',
    'Diagnosis does not end with labeling a curve; it keeps the terminal reason and proposes one testable variable change for the next run.',
  ),
}

const stableBceConcept: MathConcept = {
  id: 'banknote-stable-bce-objective',
  name: copy('logit 域稳定 BCE 与固定 L2', 'Stable logit-domain BCE with fixed L2'),
  formulaLatex: 'J(w,b)=\\frac1n\\sum_i[\\log(1+e^{z_i})-y_i z_i]+\\frac{\\lambda}{2}\\lVert w\\rVert_2^2',
  variables: [
    { symbol: 'z_i', description: copy('第 i 行的 logit，等于 x_i^T w+b。', 'Logit for row i, equal to x_i^T w+b.') },
    { symbol: 'y_i', description: copy('第 i 行的 0/1 类别。', 'The 0/1 class for row i.') },
    { symbol: '\\lambda', description: copy('固定为 1e-3 的 L2 强度；截距 b 不正则化。', 'L2 strength fixed at 1e-3; intercept b is not regularized.') },
  ],
  plainExplanation: copy(
    '直接在 logit 域计算 softplus(z)-y·z，不先取概率再做 log，因此极端 logit 也不会把权威损失变成 NaN 或 Infinity。',
    'Compute softplus(z)-y·z directly in logit space instead of taking probability logs, so extreme logits do not turn the authoritative loss into NaN or Infinity.',
  ),
  geometricIntuition: copy(
    'BCE 给出地形高度，梯度给出下降方向；特征尺度改变同一固定步长在各个参数方向上的实际移动。',
    'BCE gives landscape height and the gradient gives descent direction; feature scale changes how far the same fixed step moves in each parameter direction.',
  ),
  numericalExample: copy(
    '错误分类的 z=1000 或 z=-1000 都得到稳定 BCE=1000；五条训练轨迹都从 BCE=0.6931471806 开始。',
    'A wrongly classified z=1000 or z=-1000 gives stable BCE=1000; all five training traces start at BCE=0.6931471806.',
  ),
  codeExample: `def stable_bce(logits, targets):
    return np.mean(np.logaddexp(0.0, logits) - targets * logits)`,
  codeOutput: copy('stable_bce([1000], [0]) = 1000.0', 'stable_bce([1000], [0]) = 1000.0'),
  modelConnection: copy(
    '逻辑回归、二分类神经网络和负对数似然训练都需要同样的稳定 logit 域写法。',
    'Logistic regression, binary neural networks, and negative-log-likelihood training need the same stable logit-domain formulation.',
  ),
}

const diagnosisChainConcept: MathConcept = {
  id: 'banknote-four-step-diagnosis',
  name: copy('四步训练诊断', 'Four-step training diagnosis'),
  formulaLatex: '\\text{visible}\\rightarrow\\text{cause}\\rightarrow\\text{one change}\\rightarrow\\text{expected next run}',
  variables: [
    { symbol: 'visible', description: copy('当前曲线和终止记录直接显示的现象。', 'What the current curves and terminal record directly show.') },
    { symbol: 'one change', description: copy('下一次只改变的一个变量。', 'The single variable changed in the next run.') },
  ],
  plainExplanation: copy(
    '先描述可见现象，再提出可检验原因；下一次只改一个变量，并提前写出预期曲线，而不是给图形贴完标签就结束。',
    'Describe the visible symptom first, then state a testable cause; change one variable and predict the next curve instead of stopping after labeling a plot.',
  ),
  geometricIntuition: copy(
    '两条运行曲线像一次受控实验：相同部分保持不变，唯一差异负责检验原因。',
    'Two run curves form a controlled experiment: shared settings stay fixed and one difference tests the cause.',
  ),
  numericalExample: copy(
    'standardized-too-small 在 500 次更新后梯度范数仍为 0.110062；只把步长从 0.02 改成 4.0，standardized-stable 在第 484 次达到梯度阈值。',
    'standardized-too-small still has gradient norm 0.110062 after 500 updates; changing only the step from 0.02 to 4.0 lets standardized-stable reach the gradient tolerance at iteration 484.',
  ),
  codeExample: `comparison = compare_runs(primary="standardized-too-small", comparison="standardized-stable")`,
  codeOutput: copy('单变量变化：step 0.02 → 4.0', 'one-variable change: step 0.02 → 4.0'),
  modelConnection: copy(
    '学习率、特征处理、正则化与模型容量都应通过这种受控运行比较，而不是同时改动。',
    'Learning rate, feature processing, regularization, and capacity should be investigated through controlled run comparisons instead of changing them together.',
  ),
}

const optimizationSections = [
  section(
    'v3-banknote-optimization-question',
    copy('连续案例：为什么同一个步长会失败或成功？', 'Continuous case: Why can the same step fail or succeed?'),
    copy(
      md`本章沿用本地 UCI Banknote Authentication 快照：1,372 行、四个连续特征、0/1 类别，固定分成 train/validation/test = 960/206/206。类别含义只写“class 0 / class 1”，不猜测来源页没有定义的语义。

我们训练带截距的小型逻辑回归。所有运行从五个零参数与 BCE 0.6931471806 开始，L2 固定为 1e-3，截距不正则化。核心问题不是哪条曲线更漂亮，而是：**特征尺度、步长接受规则和停止语义怎样共同决定一条可解释的训练轨迹？** 页面和实验台都使用本地 CSV 与同一套确定性 TypeScript 公式，不启动浏览器 Python。`,
      md`This lesson continues with the local UCI Banknote Authentication snapshot: 1,372 rows, four continuous features, 0/1 classes, and a fixed train/validation/test split of 960/206/206. Labels remain “class 0 / class 1”; the source page does not define semantic class names.

We train a small logistic regression with an intercept. Every run begins at five zero parameters and BCE 0.6931471806, with L2 fixed at 1e-3 and the intercept excluded from regularization. The central question is not which curve looks nicest, but: **how do feature scale, step acceptance, and stopping semantics jointly determine an interpretable training trace?** The page and lab use the local CSV and the same deterministic TypeScript formulas, with no browser Python.`,
    ),
  ),
  section(
    'v3-banknote-optimization-stable-bce-scale',
    copy('先稳定计算损失，再处理尺度', 'Stabilize the loss first, then handle scale'),
    copy(
      md`对 $z=Xw+b$，权威 BCE 使用 $\operatorname{softplus}(z)-yz$。在极端探针 $z=\pm1000$ 上，先算 sigmoid 再取 log 的朴素公式会出现 Infinity 或 NaN，而 logit 域公式仍给出有限的 1000 或 0。稳定计算不能修复坏步长，但它确保失败原因来自优化而不是损失实现溢出。

随后只比较早期轨迹和更新条件：raw-fixed 与 standardized-stable 都使用固定步长 4.0。raw 特征尺度不同，使更新在参数方向上失衡，并在第 52 次出现最佳 validation 后继续恶化；标准化用 train 均值与 population scale，使同一步长可在第 484 次达到 gradient-norm。由于特征换单位也改变固定系数 L2 的几何，不能用两者最终 BCE 单独宣称模型质量高低。`,
      md`For $z=Xw+b$, the authoritative BCE uses $\operatorname{softplus}(z)-yz$. At extreme probes $z=\pm1000$, the naive sigmoid-then-log formula produces Infinity or NaN, while the logit-domain formula remains finite at 1000 or 0. Stable arithmetic does not repair a bad step, but it ensures a failure comes from optimization rather than loss overflow.

Then compare early trajectories and update conditioning only: raw-fixed and standardized-stable both use fixed step 4.0. Unequal raw feature scales unbalance parameter updates; validation is best at iteration 52 and then deteriorates. Train-only standardization makes the same step usable and reaches gradient-norm at iteration 484. Because changing feature units also changes the geometry of coefficient-space L2, their final BCE values alone must not rank model quality.`,
    ),
    { visualIds: [banknoteOptimizationDiagnosticsVisual.id, banknoteFeatureScalingAnimation.id] },
  ),
  section(
    'v3-banknote-optimization-five-runs',
    copy('五条锁定运行：起点、最佳点与终点要分开', 'Five locked runs: Separate start, best point, and terminal'),
    copy(
      md`| run ID | 配置 | 最佳 validation | 终止记录 |
| --- | --- | ---: | --- |
| raw-fixed | raw · fixed · 4.0 | iter 52 · 0.0319089202 | iter 112 · model-selection / validation-patience |
| standardized-too-small | standardized · fixed · 0.02 | iter 500 · 0.2883435687 | iter 500 · safety / max-iterations |
| standardized-stable | standardized · fixed · 4.0 | iter 484 · 0.0682559267 | iter 484 · mathematical-convergence / gradient-norm |
| standardized-too-large | standardized · fixed · 32.0 | iter 13 · 0.0588531562 | iter 73 · model-selection / validation-patience |
| standardized-armijo | standardized · Armijo · 32.0 initial | iter 48 · 0.0682469929 | iter 48 · mathematical-convergence / gradient-norm |

最佳 validation checkpoint 用来选参数；它不自动证明数学收敛。` + '`validation-patience`' + md` 是模型选择停止，` + '`max-iterations`' + md`、` + '`non-finite`' + md` 和 ` + '`line-search-failed`' + md` 是安全出口。只有 ` + '`gradient-norm`' + md` 或 loss-and-step 联合阈值属于数学收敛。`,
      md`| run ID | Configuration | Best validation | Terminal record |
| --- | --- | ---: | --- |
| raw-fixed | raw · fixed · 4.0 | iter 52 · 0.0319089202 | iter 112 · model-selection / validation-patience |
| standardized-too-small | standardized · fixed · 0.02 | iter 500 · 0.2883435687 | iter 500 · safety / max-iterations |
| standardized-stable | standardized · fixed · 4.0 | iter 484 · 0.0682559267 | iter 484 · mathematical-convergence / gradient-norm |
| standardized-too-large | standardized · fixed · 32.0 | iter 13 · 0.0588531562 | iter 73 · model-selection / validation-patience |
| standardized-armijo | standardized · Armijo · 32.0 initial | iter 48 · 0.0682469929 | iter 48 · mathematical-convergence / gradient-norm |

The best-validation checkpoint selects parameters; it does not prove mathematical convergence. ` + '`validation-patience`' + md` is a model-selection stop, while ` + '`max-iterations`' + md`, ` + '`non-finite`' + md`, and ` + '`line-search-failed`' + md` are safety exits. Only ` + '`gradient-norm`' + md` or the joint loss-and-step threshold represents mathematical convergence.`,
    ),
  ),
  section(
    'v3-banknote-optimization-code-chain',
    copy('可复制实现：BCE → 梯度 → Armijo → 停止 → 训练', 'Copyable implementation: BCE → gradient → Armijo → stopping → training'),
    copy(
      md`Notebook 按同一顺序定义五层函数：` + '`stable_bce`' + md`、` + '`loss_and_grad`' + md`、` + '`armijo_step`' + md`、` + '`should_stop`' + md`、` + '`train_logistic`' + md`。` + '`loss_and_grad`' + md` 只在训练目标上加入 L2；validation/test BCE 不加罚项。Armijo 也只检查 penalized training objective，不能偷看 validation。

第一次 Armijo 更新先试 $\alpha=32$，不满足 sufficient decrease；收缩一次后接受 $\alpha=16$。每次有限更新被接受后，先记录 trace 和更新最佳 validation，再依次检查 gradient-norm、loss-and-step、validation-patience，最后才是 max-iterations。拒绝或非有限候选不进入 trace。`,
      md`The Notebook defines five layers in the same order: ` + '`stable_bce`' + md`, ` + '`loss_and_grad`' + md`, ` + '`armijo_step`' + md`, ` + '`should_stop`' + md`, and ` + '`train_logistic`' + md`. ` + '`loss_and_grad`' + md` adds L2 only to the training objective; validation/test BCE has no penalty. Armijo also checks only the penalized training objective and must not inspect validation.

The first Armijo update tries $\alpha=32$, which fails sufficient decrease; one contraction accepts $\alpha=16$. After each finite update is accepted, the trainer records the trace and updates best validation, then checks gradient-norm, loss-and-step, validation-patience, and finally max-iterations. Rejected or non-finite candidates never enter the trace.`,
    ),
    { visualIds: [banknoteFixedVsArmijoAnimation.id] },
  ),
  section(
    'v3-banknote-optimization-primary-lab',
    copy('主实验：先改草稿，再明确运行', 'Primary lab: Edit a draft, then run explicitly'),
    copy(
      md`先选一个锁定 preset，它只把配置载入草稿；曲线和读数保持上一条已提交运行，直到按下“运行”。比较 raw-fixed 与 standardized-stable，再比较 standardized-too-large 与 standardized-armijo。观察起点、第一次回溯、最佳 validation、终点、最后有限状态和单变量建议。

高级控件只开放 feature space、fixed/Armijo、learning rate、gradient tolerance 与 maximum iterations。L2、Armijo c/rho 和 validation patience 保持锁定。输入不合法时页面明确拒绝，不会偷偷替换。重置回到 standardized-stable。`,
      md`Choose a locked preset first; it loads configuration into the draft only. Curves and readouts keep the previous committed run until Run is pressed. Compare raw-fixed with standardized-stable, then standardized-too-large with standardized-armijo. Inspect the start, first backtrack, best validation, terminal, last finite state, and one-variable suggestion.

Advanced controls expose only feature space, fixed/Armijo, learning rate, gradient tolerance, and maximum iterations. L2, Armijo c/rho, and validation patience stay locked. Invalid input is rejected explicitly and never silently replaced. Reset returns to standardized-stable.`,
    ),
    { labIds: ['optimization-gradient-lab'] },
  ),
  section(
    'v3-banknote-optimization-next',
    copy('下一步：把数值机制交给曲线诊断', 'Next: Hand numerical mechanisms to curve diagnosis'),
    copy(
      md`本章拥有五条运行的数值比较；下一章 ` + '`training-diagnostics`' + md` 会读取同一批 trace，用“可见现象 → 可能原因 → 只改一个变量 → 预期下一次运行”形成诊断。SGD、Momentum、RMSProp 与 Adam 的家族比较不在这里重复，请前往 [optimizer-comparison](/learn/optimizer-comparison)。`,
      md`This lesson owns the numerical comparison of the five runs. The next ` + '`training-diagnostics`' + md` lesson reads the same traces through “visible symptom → plausible cause → one variable change → expected next run.” The SGD, Momentum, RMSProp, and Adam family comparison is not repeated here; continue to [optimizer-comparison](/learn/optimizer-comparison).`,
    ),
  ),
]

const diagnosticsSections = [
  section(
    'v3-banknote-diagnostics-question',
    copy('同一批运行：如何把曲线变成下一次实验？', 'The same runs: How do curves become the next experiment?'),
    copy(
      md`本章不重新训练另一份案例，也不把诊断变成计分题。它读取上一章同一份 Banknote 本地数据与五条确定性 trace，选择一条 primary run 和一条 comparison run，回答四个问题：**看到了什么？可能原因是什么？下一次只改哪个变量？如果原因成立，预期下一次运行（expected next run）的曲线应怎样变化？**`,
      md`This lesson does not train a different case or turn diagnosis into a scored quiz. It reads the same local Banknote data and five deterministic traces from the previous lesson, selects one primary and one comparison run, and asks four questions: **What is visible? What is a plausible cause? Which one variable changes next? What should the expected next run show if the cause is right?**`,
    ),
  ),
  section(
    'v3-banknote-diagnostics-five-chains',
    copy('五条四步诊断链', 'Five four-step diagnostic chains'),
    copy(
      md`- **raw-fixed**：validation 先改善后恶化且步长仍大 → raw 尺度使固定步长条件不良 → 只做标准化、保持 step=4.0 → 预期更平滑并达到数学收敛。
- **standardized-too-small**：loss 安全下降但第 500 次梯度仍大 → step=0.02 太小 → 只改为 4.0 → 预期在 500 次内达到梯度阈值。
- **standardized-stable**：train/validation 稳定且梯度很小 → 标准化使固定步长可用 → 只把方法改成 Armijo、initial step=32 → 预期拒绝危险试探并用更少接受步收敛。
- **standardized-too-large**：第 13 次短暂低点后 validation 恶化 → 固定 32.0 过冲 → 只改为 Armijo → 预期先拒绝 32、接受 16，并保留收敛资格。
- **standardized-armijo**：首次试探被拒绝且第 48 次达到梯度阈值 → sufficient decrease 调整了可用步长 → 保持方法并检查最终测试端点 → 预期与库基准接近。`,
      md`- **raw-fixed**: validation improves then degrades while steps remain large → raw scales make the fixed step poorly conditioned → standardize only, keeping step=4.0 → expect smoother descent and mathematical convergence.
- **standardized-too-small**: loss falls safely but the gradient is still large at iteration 500 → step=0.02 is too small → change only to 4.0 → expect the gradient tolerance within 500 updates.
- **standardized-stable**: train/validation settle with a small gradient → standardization makes the fixed step usable → change only the method to Armijo with initial step 32 → expect unsafe trials to be rejected and fewer accepted updates.
- **standardized-too-large**: a transient low point at iteration 13 is followed by validation deterioration → fixed 32.0 overshoots → change only to Armijo → expect 32 to be rejected, 16 accepted, and convergence eligibility retained.
- **standardized-armijo**: the first trial is rejected and gradient tolerance is reached at iteration 48 → sufficient decrease adapts the usable step → keep the method and inspect the final test endpoint → expect close agreement with the library baseline.`,
    ),
    { visualIds: [banknoteOptimizationDiagnosticsVisual.id, banknoteTrainingDiagnosticsAnimation.id] },
  ),
  section(
    'v3-banknote-diagnostics-primary-lab',
    copy('主实验：真实运行比较与曲线开关', 'Primary lab: Real-run comparison and curve toggles'),
    copy(
      md`实验台只从已计算的真实 trace 生成路径。选择 primary/comparison 后，可分别显示 train BCE、validation BCE 与 gradient norm；文字表同时保留 best-validation 菱形标记、terminal 形状、kind/reason 和精确迭代，所以颜色或动画关闭后信息仍完整。

建议先比较 standardized-too-small 与 standardized-stable，再比较 standardized-too-large 与 standardized-armijo。切换曲线只改变可见层，不会重新训练，也不会改变原始参数。`,
      md`The lab derives paths only from already-computed real traces. After choosing primary/comparison runs, toggle train BCE, validation BCE, and gradient norm. A text table retains the best-validation diamond, terminal shape, kind/reason, and exact iteration, so information remains complete without color or motion.

First compare standardized-too-small with standardized-stable, then standardized-too-large with standardized-armijo. Curve toggles change visibility only; they do not retrain or alter the original parameters.`,
    ),
    { labIds: ['training-diagnostics-lab'] },
  ),
  section(
    'v3-banknote-diagnostics-final-report',
    copy('最终报告只属于预先合格的 Armijo 运行', 'The final report belongs only to the pre-eligible Armijo run'),
    copy(
      md`最终模型先限定为 mathematical-convergence 运行，再按最佳 validation BCE 选择，因此是 standardized-armijo，而不是有更低短暂 validation 点但未收敛的 too-large 运行。固定 threshold=0.5 的测试端点为：test BCE 0.0551101232、accuracy 0.9805825243、ROC-AUC 0.9994279176、confusion matrix [[110,4],[0,92]]。

scikit-learn 1.9.0 的 ` + '`LogisticRegression`' + md` 只作为端点检查：test BCE 0.0550980756、预测一致率 1.0、最大概率差 0.0001508618。它的 17 次 LBFGS 迭代不能与手写 GD/Armijo 逐步对齐。这里不扩展阈值调优、PR-AUC 或校准课程。`,
      md`The final model is first restricted to mathematical-convergence runs and then selected by best validation BCE. That chooses standardized-armijo, not the too-large run with a lower transient validation point but no convergence. At fixed threshold 0.5, the test endpoint is: test BCE 0.0551101232, accuracy 0.9805825243, ROC-AUC 0.9994279176, and confusion matrix [[110,4],[0,92]].

scikit-learn 1.9.0 ` + '`LogisticRegression`' + md` is an endpoint check only: test BCE 0.0550980756, prediction agreement 1.0, and maximum probability difference 0.0001508618. Its 17 LBFGS iterations must not be aligned step by step with manual GD/Armijo. Threshold tuning, PR-AUC, and calibration lessons remain out of scope.`,
    ),
  ),
  section(
    'v3-banknote-diagnostics-synthetic-support',
    copy('单独保留：确定性合成支持示例', 'Kept separately: deterministic synthetic support examples'),
    copy(
      md`下面原有的 healthy、high-learning-rate、overfitting、vanishing-gradient 与 exploding-gradient 五种模式是 **deterministic synthetic support examples（确定性合成支持示例）**。它们用于补充 Banknote 五条真实运行未覆盖的深层网络现象，尤其是过拟合、梯度消失与梯度爆炸；这些曲线不是 Banknote 结果，也不与真实 run selector 混用。`,
      md`The existing healthy, high-learning-rate, overfitting, vanishing-gradient, and exploding-gradient modes are **deterministic synthetic support examples**. They supplement deep-network behaviors not covered by the five real Banknote runs, especially overfitting, vanishing gradients, and exploding gradients. These curves are not Banknote results and never share the real-run selector.`,
    ),
  ),
  section(
    'v3-banknote-diagnostics-next',
    copy('带着一条可检验的改变继续', 'Continue with one testable change'),
    copy(
      md`完成本章时，不要只留下“这条曲线不好”。请保留 primary/comparison、终止原因、一个变量变化和预期下一条曲线。若下一步要比较优化器家族，再进入 [optimizer-comparison](/learn/optimizer-comparison)；本章不重复实现 Momentum、RMSProp 或 Adam。`,
      md`Do not finish with only “this curve is bad.” Keep the primary/comparison runs, terminal reason, one variable change, and expected next curve. If the next question is optimizer-family comparison, continue to [optimizer-comparison](/learn/optimizer-comparison); this lesson does not reimplement Momentum, RMSProp, or Adam.`,
    ),
  ),
]

function enhanceOptimization(moduleDefinition: MathLabModule): MathLabModule {
  const insertedSections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, optimizationSections))
  return {
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 90),
    learningObjectives: [
      copy('从稳定 BCE、特征尺度、固定步长与 Armijo 串起同一条 Banknote 训练链。', 'Connect stable BCE, feature scale, fixed steps, and Armijo in one Banknote training chain.'),
      copy('区分数学收敛、validation checkpoint 和安全出口，并保留最后有限状态。', 'Distinguish mathematical convergence, validation checkpoints, and safety exits while retaining the last finite state.'),
      ...moduleDefinition.learningObjectives,
    ],
    aiModelConnections: [
      copy('真实训练需要稳定目标、可审计步长和明确终止原因，而不只是最后一个 loss。', 'Real training needs a stable objective, auditable steps, and explicit terminal reasons—not only the last loss.'),
      ...moduleDefinition.aiModelConnections,
    ],
    concepts: [stableBceConcept, ...moduleDefinition.concepts],
    sections: insertedSections,
    toc: insertAfterOpening(moduleDefinition.toc, optimizationSections.map(tocFor)),
    visuals: [
      banknoteOptimizationDiagnosticsVisual,
      banknoteFeatureScalingAnimation,
      banknoteFixedVsArmijoAnimation,
      ...moduleDefinition.visuals,
    ],
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      banknoteOptimizationDiagnosticsVisual.assetPath!,
      banknoteFeatureScalingAnimation.assetPath!,
      banknoteFeatureScalingAnimation.posterPath!,
      banknoteFixedVsArmijoAnimation.assetPath!,
      banknoteFixedVsArmijoAnimation.posterPath!,
    ],
  }
}

function enhanceTrainingDiagnostics(moduleDefinition: MathLabModule): MathLabModule {
  const insertedSections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, diagnosticsSections))
  return {
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 75),
    learningObjectives: [
      copy('用同一批 Banknote trace 完成可见现象、原因、单变量变化和预期下一次运行。', 'Use the same Banknote traces to state a visible symptom, cause, one-variable change, and expected next run.'),
      copy('区分真实 Banknote 比较与确定性合成支持示例的来源。', 'Distinguish real Banknote comparisons from deterministic synthetic support examples.'),
      ...moduleDefinition.learningObjectives,
    ],
    aiModelConnections: [
      copy('曲线诊断把数值终止记录转成下一次受控训练实验。', 'Curve diagnosis turns numerical terminal records into the next controlled training experiment.'),
      ...moduleDefinition.aiModelConnections,
    ],
    concepts: [diagnosisChainConcept, ...moduleDefinition.concepts],
    sections: insertedSections,
    toc: insertAfterOpening(moduleDefinition.toc, diagnosticsSections.map(tocFor)),
    visuals: [
      banknoteOptimizationDiagnosticsVisual,
      banknoteTrainingDiagnosticsAnimation,
      ...moduleDefinition.visuals,
    ],
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      banknoteOptimizationDiagnosticsVisual.assetPath!,
      banknoteTrainingDiagnosticsAnimation.assetPath!,
      banknoteTrainingDiagnosticsAnimation.posterPath!,
    ],
  }
}

export function enhanceNumericalBatch4Module(moduleDefinition: MathLabModule): MathLabModule {
  if (moduleDefinition.id === 'optimization') return enhanceOptimization(moduleDefinition)
  if (moduleDefinition.id === 'training-diagnostics') return enhanceTrainingDiagnostics(moduleDefinition)
  return moduleDefinition
}
