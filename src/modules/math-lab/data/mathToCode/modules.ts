import type {
  LabConfig,
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  Misconception,
  QuizItem,
} from '../../types/mathLab.ts'
import { runtimeLessonContent, type RuntimeLessonSection } from './runtimeLessonContent.generated.ts'
import { calculusFunctionsModule as functionsAndMappingsModule } from '../calculusFunctionsModule.ts'
import { calculusDerivativesModule as derivativesModule } from '../calculusDerivativesModule.ts'

const copy = (zh: string, en: string): LocalizedCopy => ({ 'zh-CN': zh, en })
const variable = (symbol: string, zh: string, en: string) => ({ symbol, description: copy(zh, en) })

const quiz = (id: string, zhPrompt: string, enPrompt: string, answer: string, choices: Array<[string, string, string]>, zhExplanation: string, enExplanation: string, tag: string, revisitVisualId: string): QuizItem => ({
  id, type: 'single-choice', prompt: copy(zhPrompt, enPrompt), answer,
  choices: choices.map(([choiceId, zh, en]) => ({ id: choiceId, label: copy(zh, en) })),
  explanation: copy(zhExplanation, enExplanation), misconceptionTags: [tag], revisitVisualId,
})

const misconception = (id: string, zhStatement: string, enStatement: string, zhCorrection: string, enCorrection: string, zhExample: string, enExample: string): Misconception => ({
  id, statement: copy(zhStatement, enStatement), correction: copy(zhCorrection, enCorrection), example: copy(zhExample, enExample),
})

type RuntimeLessonKey = keyof typeof runtimeLessonContent

function runtimeSections(key: RuntimeLessonKey, labId?: string): MathLabSection[] {
  return runtimeLessonContent[key].map((item: RuntimeLessonSection, index) => ({
    id: item.originalId,
    level: 2,
    title: copy(item.title, item.enTitle),
    content: copy(item.content, item.en),
    ...(labId && index === 8 ? { labIds: [labId] } : {}),
  }))
}

function promotedModule(input: {
  id: string
  key: RuntimeLessonKey
  zhTitle: string
  enTitle: string
  zhSubtitle: string
  enSubtitle: string
  prerequisites: string[]
  next?: string
  concepts: MathConcept[]
  objectives: Array<[string, string]>
  connections: Array<[string, string]>
  misconceptions: Misconception[]
  quizzes: QuizItem[]
  lab?: LabConfig
  sourceNoteFile: string
  sourceReferences?: MathLabModule['sourceReferences']
  accent: string
  theme: string
  completionMode?: MathLabModule['completionMode']
}): MathLabModule {
  const sections = runtimeSections(input.key, input.lab?.id)
  return {
    id: input.id, enhancementTier: input.lab ? 'interactive' : 'core', order: 0,
    ...(input.completionMode ? { completionMode: input.completionMode } : {}),
    title: copy(input.zhTitle, input.enTitle), subtitle: copy(input.zhSubtitle, input.enSubtitle),
    difficulty: 'foundation', estimatedMinutes: 80, prerequisites: input.prerequisites,
    aiModelConnections: input.connections.map(([zh, en]) => copy(zh, en)),
    learningObjectives: input.objectives.map(([zh, en]) => copy(zh, en)),
    concepts: input.concepts, sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [], labs: input.lab ? [input.lab] : [], quizzes: input.quizzes,
    misconceptions: input.misconceptions, nextModuleIds: input.next ? [input.next] : [],
    accent: input.accent, theme: input.theme, sourceNoteFile: input.sourceNoteFile,
    sourceReferences: input.sourceReferences ?? [
      { label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'), href: 'https://mml-book.github.io/', license: 'CC BY-NC-SA 4.0', usage: copy('用于核对数学定义、shape 与机器学习连接。', 'Used to verify mathematical definitions, shape contracts, and machine-learning connections.') },
      { label: copy('NumPy 官方文档', 'NumPy Documentation'), href: 'https://numpy.org/doc/stable/', usage: copy('用于核对数组、矩阵乘法、广播、轴与有限值 API。', 'Used to verify array, matrix multiplication, broadcasting, axis, and finite-value APIs.') },
    ],
  }
}

function simpleConcept(
  id: string, zhName: string, enName: string, formulaLatex: string,
  variables: Array<[string, string, string]>, zhPlain: string, enPlain: string,
  zhGeometry: string, enGeometry: string, zhExample: string, enExample: string,
  zhConnection: string, enConnection: string, codeExample?: string,
): MathConcept {
  return {
    id, name: copy(zhName, enName), formulaLatex,
    variables: variables.map(([symbol, zh, en]) => variable(symbol, zh, en)),
    plainExplanation: copy(zhPlain, enPlain), geometricIntuition: copy(zhGeometry, enGeometry),
    numericalExample: copy(zhExample, enExample), modelConnection: copy(zhConnection, enConnection),
    ...(codeExample ? { codeExample } : {}),
  }
}

function formativeQuiz(
  id: string, zhPrompt: string, enPrompt: string, answer: string,
  zhCorrect: string, enCorrect: string, zhWrong: string, enWrong: string,
  zhExplanation: string, enExplanation: string, tag: string, revisit: string,
): QuizItem {
  return quiz(id, zhPrompt, enPrompt, answer, [[answer, zhCorrect, enCorrect], ['distractor', zhWrong, enWrong]], zhExplanation, enExplanation, tag, revisit)
}

const vectorsModule = promotedModule({
  id: 'linear-algebra-feature-space', key: 'vectors',
  zhTitle: '向量与样本表示：一次预测如何读懂多个特征', enTitle: 'Vectors and Sample Representation: Reading Multiple Features in One Prediction',
  zhSubtitle: '把有序特征、带单位线性泛函、独立几何投影与可检查代码接成一条链。', enSubtitle: 'Connect ordered features, a unit-bearing linear functional, independent geometric projection, and checked code.',
  prerequisites: ['beginner-linear-algebra'], next: 'linear-algebra-distance-similarity', sourceNoteFile: 'math-lab-linear-algebra-route-sources.md', accent: '#2457d6', theme: '#edf3ff',
  objectives: [
    ['用顺序、语义和 shape 定义一个样本向量。', 'Define one sample vector through order, meaning, and shape.'],
    ['把 w 严格解释为带单位线性泛函并手算 w^T x。', 'Interpret w strictly as a unit-bearing linear functional and calculate w^T x.'],
    ['只在无量纲同尺度 u,v 例中解释长度、夹角与投影。', 'Use length, angle, and projection only in the dimensionless same-scale u,v example.'],
    ['用检查过的循环与 NumPy 复现 prediction=10 和 L=1。', 'Use a checked loop and NumPy to reproduce prediction=10 and L=1.'],
  ],
  connections: [
    ['模型输入把同一对象的多个特征绑定为有序向量。', 'Model inputs bind several features of one object into an ordered vector.'],
    ['线性层先用带单位系数读取特征贡献，再加偏置。', 'A linear layer first reads feature contributions through unit-bearing coefficients, then adds bias.'],
  ],
  concepts: [
    simpleConcept('unit-bearing-linear-functional', '带单位线性泛函', 'Unit-Bearing Linear Functional', '\\hat y=w^\\mathsf T x+b', [['x', '按特征协议排列的样本向量。', 'The sample vector ordered by the feature schema.'], ['w', '把各特征换算为输出单位的线性泛函。', 'The linear functional converting features into output units.']], 'w 逐坐标读取 x，汇总兼容单位的贡献。', 'w reads x coordinate by coordinate and aggregates contributions with compatible units.', '主线不把 w 解释为空间箭头。', 'The main task does not interpret w as a spatial arrow.', '4×2+(-1)×3=5；加 b=5 得预测 10。', '4×2+(-1)×3=5; adding b=5 gives prediction 10.', '仿射神经元和线性模型都使用同一向量到标量合同。', 'Affine neurons and linear models use the same vector-to-scalar contract.', `import numpy as np\nx = np.array([2.0, 3.0])\nw = np.array([4.0, -1.0])\nassert x.shape == w.shape == (2,)\ncontributions = w * x\nprediction = w @ x + 5.0\nprint(contributions, prediction)  # [8. -3.] 10.0`),
    simpleConcept('dimensionless-projection', '无量纲几何投影', 'Dimensionless Geometric Projection', '\\operatorname{proj}_v(u)=\\frac{u^\\mathsf T v}{v^\\mathsf T v}v', [['u,v', '同一无量纲、同尺度空间中的位移与参考方向。', 'A displacement and reference direction in one dimensionless same-scale space.']], '投影把 u 分解为沿 v 与垂直 v 的部分。', 'Projection splits u into parts parallel and perpendicular to v.', '单位与尺度兼容是欧氏几何解释的前提。', 'Compatible units and scale are prerequisites for Euclidean geometry.', 'u=[3,4], v=[4,0] 时投影为 [3,0]。', 'For u=[3,4] and v=[4,0], the projection is [3,0].', 'Embedding 几何也必须先说明尺度和相似度合同。', 'Embedding geometry also requires an explicit scale and similarity contract.'),
  ],
  misconceptions: [
    misconception('vector-dimension-is-norm', '维度就是几何长度。', 'Dimension is the geometric norm.', '维度计坐标数，范数计兼容几何中的大小。', 'Dimension counts coordinates; norm measures magnitude in compatible geometry.', 'u=[3,4] 的维度是 2、范数是 5。', 'u=[3,4] has dimension 2 and norm 5.'),
    misconception('vector-elementwise-is-dot', 'w*x 已经是标量预测。', 'w*x is already the scalar prediction.', '它只产生贡献向量，还需汇总并加偏置。', 'It only produces a contribution vector, which must be reduced and biased.', '[8,-3] 求和为 5，加偏置才为 10。', '[8,-3] sums to 5; adding bias gives 10.'),
    misconception('vector-w-is-arrow', '主线 w 是可直接做欧氏投影的箭头。', 'Main-task w is an arrow for direct Euclidean projection.', 'w 坐标带不同单位，是线性泛函；几何只用独立 u,v。', 'w has coordinate-specific units and is a linear functional; geometry uses separate u,v.', '分钟/任务与分钟/提示不能当作同尺度空间坐标。', 'Minutes/task and minutes/hint are not same-scale spatial coordinates.'),
    misconception('vector-shape-is-semantics', 'shape 相同就代表特征语义对齐。', 'Matching shape proves feature semantics align.', 'shape 只检查数量，列协议检查含义。', 'Shape checks counts; the column schema checks meaning.', '只交换 x 会在合法 shape 下得到错误配对。', 'Swapping only x creates wrong pairing under a legal shape.'),
  ],
  quizzes: [
    formativeQuiz('vector-role-check', '主线 w 的严格角色是什么？', 'What is the strict role of w in the main task?', 'functional', '带单位线性泛函', 'A unit-bearing linear functional', '无量纲位移箭头', 'A dimensionless displacement arrow', 'w 把特征换算成分钟贡献；回看主线连接。', 'w converts features into minute contributions; revisit the shared task.', 'vector-w-is-arrow', 'vectors-shared-task'),
    formativeQuiz('vector-output-check', 'w*x=[8,-3] 后还缺什么？', 'What remains after w*x=[8,-3]?', 'reduce', '求和并加偏置', 'Sum and add bias', '直接与 target 比较', 'Compare directly with target', '贡献向量不是标量预测；回看代码节。', 'A contribution vector is not a scalar prediction; revisit the code section.', 'vector-elementwise-is-dot', 'vectors-code'),
    formativeQuiz('vector-geometry-check', '何时可直接解释欧氏投影？', 'When is a direct Euclidean projection meaningful?', 'compatible', 'u,v 各轴无量纲、同尺度且语义兼容', 'u,v have dimensionless, same-scale, compatible axes', '只要都是二维数组', 'Whenever both arrays are 2D', '几何需要单位与尺度合同；回看辅助例。', 'Geometry needs a unit and scale contract; revisit the auxiliary example.', 'vector-shape-is-semantics', 'vectors-worked-auxiliary'),
    formativeQuiz('vector-dimension-check', 'u=[3,4] 的维度是多少？', 'What is the dimension of u=[3,4]?', 'two', '2', '2', '5', '5', '维度是坐标数；5 是范数。', 'Dimension counts coordinates; 5 is the norm.', 'vector-dimension-is-norm', 'vectors-formal'),
  ],
})

const matrixLab: LabConfig = {
  id: 'matrix-transform-lab', title: copy('独立网格矩阵变换实验', 'Independent Grid Matrix Transformation Lab'), type: 'interactive-visual', componentName: 'MathToCodeMatrixLab',
  successCriteria: [
    copy('能说明实验矩阵 A 的列如何移动无量纲基向量。', 'Explain how the experiment matrix A moves dimensionless basis vectors.'),
    copy('能区分几何变换矩阵 A 与样本矩阵 X 的角色。', 'Distinguish geometric transform A from sample matrix X.'),
  ],
}

const matricesModule = promotedModule({
  id: 'linear-algebra-matrix-transformations', key: 'matrices',
  zhTitle: '矩阵与批量计算：从一个样本到一批预测', enTitle: 'Matrices and Batch Computation: From One Sample to Many Predictions',
  zhSubtitle: '用逐 shape 账本连接 Xw+b、批量 MSE、广播失败与独立网格变换。', enSubtitle: 'Connect Xw+b, batch MSE, broadcasting failures, and an independent grid transform through a shape ledger.',
  prerequisites: ['beginner-linear-algebra'], next: 'linear-algebra-rank-null-space', sourceNoteFile: 'math-lab-linear-algebra-route-sources.md', accent: '#0f766e', theme: '#ecfdf5', lab: matrixLab,
  objectives: [
    ['为 X、w、b、prediction、target 写出完整 shape 账本。', 'Write the complete shape ledger for X, w, b, prediction, and target.'],
    ['逐行与向量化复现 predictions=[10,5] 和 MSE=2.5。', 'Reproduce predictions=[10,5] and MSE=2.5 by row and by vectorization.'],
    ['诊断转置、广播与行/目标错位。', 'Diagnose transposition, broadcasting, and row/target misalignment.'],
    ['区分样本矩阵 X 与几何变换矩阵 A。', 'Distinguish sample matrix X from geometric transform A.'],
  ],
  connections: [
    ['批量线性层保留样本轴并收缩特征轴。', 'A batched linear layer preserves the sample axis and contracts the feature axis.'],
    ['shape 检查阻止静默广播把监督关系改成成对比较。', 'Shape checks stop silent broadcasting from replacing aligned supervision with pairwise comparisons.'],
  ],
  concepts: [
    simpleConcept('batch-affine-map', '批量仿射映射', 'Batched Affine Map', '\\hat y=Xw+b', [['X', 'shape (n,d) 的样本矩阵。', 'The sample matrix with shape (n,d).'], ['w', 'shape (d,) 的系数向量。', 'The coefficient vector with shape (d,).']], '特征轴被收缩，样本轴保留。', 'The feature axis is contracted and the sample axis remains.', '每一行独立通过同一个线性规则。', 'Every row independently passes through the same linear rule.', '(2,2) @ (2,) -> (2,)，输出 [10,5]。', '(2,2) @ (2,) -> (2,), producing [10,5].', '神经网络批量前向传播依赖相同轴合同。', 'Neural-network batch forward passes use the same axis contract.', `import numpy as np\nX = np.array([[2., 3.], [1., 4.]])\nw = np.array([4., -1.])\npredictions = X @ w + 5.0\nassert predictions.shape == (2,)\nprint(predictions)  # [10.  5.]`),
    simpleConcept('batch-mse', '批量均方误差', 'Batch Mean Squared Error', 'L=\\frac1n\\sum_i(\\hat y_i-y_i)^2', [['n', '样本数。', 'The number of samples.'], ['i', '保留下来的样本索引。', 'The preserved sample index.']], '先逐样本对齐残差，再对平方误差求平均。', 'Align residuals sample by sample, then average squared errors.', '错误广播会把一一对应改成成对差值。', 'Bad broadcasting replaces alignment with pairwise differences.', '残差 [1,-2]、平方 [1,4]、MSE=2.5。', 'Residuals [1,-2], squares [1,4], MSE=2.5.', '训练 loss 必须保留预测与目标的一一对应。', 'Training loss must preserve one-to-one alignment between predictions and targets.'),
  ],
  misconceptions: [
    misconception('matrix-transpose-same', '方阵转置后 shape 相同，所以语义不变。', 'A square transpose keeps shape, so semantics are unchanged.', '转置交换轴角色；方阵只会隐藏错误。', 'Transpose swaps axis roles; a square matrix merely hides the error.', '用 (3,2) 反例可暴露误转置。', 'A (3,2) counterexample exposes an accidental transpose.'),
    misconception('matrix-elementwise-prediction', 'X*w 就是整批预测。', 'X*w is the whole batch prediction.', '它是贡献矩阵，仍需沿特征轴汇总并加偏置。', 'It is a contribution matrix that still needs feature-axis reduction and bias.', '[[8,-3],[4,-4]] 汇总为 [5,0]。', '[[8,-3],[4,-4]] reduces to [5,0].'),
    misconception('matrix-broadcast-safe', '能广播就代表残差对齐。', 'Broadcastable means residuals are aligned.', '广播只看尾轴大小，不懂样本含义。', 'Broadcasting sees trailing sizes, not sample meaning.', '(2,1)-(2,) 会得到 (2,2)。', '(2,1)-(2,) produces (2,2).'),
    misconception('matrix-row-target-independent', '交换 X 的行不必交换 targets。', 'Rows of X can be reordered without targets.', '监督目标必须跟随同一样本。', 'A target must move with its sample.', '否则 shape 合法但 MSE 语义错误。', 'Otherwise shapes remain legal while MSE semantics break.'),
  ],
  quizzes: [
    formativeQuiz('matrix-shape-check', '(2,2)@(2,) 的输出 shape？', 'What is the output shape of (2,2)@(2,)?', 'vector', '(2,)', '(2,)', '(2,2)', '(2,2)', '特征轴收缩，样本轴保留。', 'The feature axis contracts and the sample axis remains.', 'matrix-elementwise-prediction', 'matrices-formal'),
    formativeQuiz('matrix-axis-check', 'X 的 axis 0 表示什么？', 'What does axis 0 of X represent?', 'samples', '样本', 'Samples', '特征', 'Features', '行沿样本轴排列；回看 shape 账本。', 'Rows lie along the sample axis; revisit the shape ledger.', 'matrix-transpose-same', 'matrices-shared-task'),
    formativeQuiz('matrix-broadcast-check', '(n,1)-(n,) 的主要风险？', 'What is the main risk of (n,1)-(n,)?', 'pairwise', '广播成 (n,n) 成对差值', 'Broadcasting to an (n,n) pairwise matrix', '自动得到正确残差', 'Automatically obtaining aligned residuals', 'NumPy 不理解监督配对。', 'NumPy does not understand supervisory alignment.', 'matrix-broadcast-safe', 'matrices-code'),
    formativeQuiz('matrix-row-check', '交换样本行时还需交换什么？', 'What must move when sample rows are reordered?', 'targets', '对应 targets', 'The corresponding targets', 'w 的特征顺序', 'The feature order in w', '目标随同一样本移动。', 'Targets move with their samples.', 'matrix-row-target-independent', 'matrices-experiment'),
  ],
})

const numpyModule = promotedModule({
  id: 'numpy-mathematics-implementation', key: 'numpy',
  zhTitle: 'NumPy 数学实现：让公式、shape 与失败一致', enTitle: 'NumPy Mathematics Implementation: Align Formulas, Shapes, and Failures',
  zhSubtitle: '用真实输出、循环 oracle、广播诊断与安全失败复现完整预测任务。', enSubtitle: 'Reproduce the full prediction task with real outputs, a loop oracle, broadcasting diagnostics, and safe failures.',
  prerequisites: ['calculus-derivatives-local-change'], next: 'math-to-code-guided-studio', sourceNoteFile: 'math-to-code-numpy-sources.md', accent: '#6d28d9', theme: '#f5f3ff',
  sourceReferences: [
    { label: copy('NumPy 广播', 'NumPy Broadcasting'), href: 'https://numpy.org/doc/stable/user/basics.broadcasting.html', usage: copy('核对末轴对齐、标量复用与合法但语义错误的广播结果。', 'Verify trailing-axis alignment, scalar reuse, and legal but semantically wrong broadcast results.') },
    { label: copy('NumPy 矩阵乘法', 'NumPy Matrix Multiplication'), href: 'https://numpy.org/doc/stable/reference/generated/numpy.matmul.html', usage: copy('核对 @ 的内维收缩与批量输出 shape。', 'Verify inner-dimension contraction and batched output shape for @.') },
    { label: copy('NumPy 有限值检查', 'NumPy Finite-Value Checking'), href: 'https://numpy.org/doc/stable/reference/generated/numpy.isfinite.html', usage: copy('核对 NaN 与 Infinity 的显式失败边界。', 'Verify explicit failure boundaries for NaN and Infinity.') },
    { label: copy('NumPy 数组转换', 'NumPy Array Conversion'), href: 'https://numpy.org/doc/stable/reference/generated/numpy.asarray.html', usage: copy('核对 list/ndarray 到 float 数组的转换合同。', 'Verify the conversion contract from lists or ndarrays to floating arrays.') },
  ],
  objectives: [
    ['把每个 NumPy 变量、shape 与数学角色逐项对齐。', 'Align every NumPy variable and shape with its mathematical role.'],
    ['复现 predictions=[10,5]、MSE=2.5 与敏感度 [0,-5,-1]。', 'Reproduce predictions=[10,5], MSE=2.5, and sensitivities [0,-5,-1].'],
    ['诊断广播、dtype、view mutation 与非有限值。', 'Diagnose broadcasting, dtype, view mutation, and non-finite values.'],
    ['证明循环与向量化实现输出相同。', 'Demonstrate that loop and vectorized implementations produce equal outputs.'],
  ],
  connections: [
    ['NumPy shape 合同是进入 PyTorch/JAX 张量代码的直接准备。', 'NumPy shape contracts directly prepare learners for PyTorch/JAX tensor code.'],
    ['安全失败让模型训练前的数据与数值问题可定位。', 'Safe failures localize data and numerical problems before model training.'],
  ],
  concepts: [
    simpleConcept('checked-numpy-batch', '检查过的 NumPy 批量预测', 'Checked NumPy Batch Prediction', '\\hat y=Xw+b', [['X', '有限 float 二维数组，shape (n,d)。', 'A finite 2D float array with shape (n,d).'], ['w', '有限 float 一维数组，shape (d,)。', 'A finite 1D float array with shape (d,).']], '先验证维度、轴、有限值，再执行矩阵乘法。', 'Validate dimensions, axes, and finite values before matrix multiplication.', 'shape 是类型说明，已知值 oracle 验证语义。', 'Shape is a type description; a known-value oracle verifies semantics.', 'predictions = [10.0, 5.0]，MSE = 2.5。', 'predictions = [10.0, 5.0], MSE = 2.5.', '同一模式扩展到批量神经网络计算。', 'The same pattern extends to batched neural-network computation.', `import numpy as np\nX = np.asarray([[2., 3.], [1., 4.]], dtype=float)\nw = np.asarray([4., -1.], dtype=float)\ntargets = np.asarray([9., 7.], dtype=float)\nif X.ndim != 2 or w.ndim != 1 or X.shape[1] != w.shape[0]:\n    raise ValueError("X and w shapes are incompatible")\nif not np.isfinite(X).all() or not np.isfinite(w).all():\n    raise ValueError("inputs must be finite")\npredictions = X @ w + 5.0\nMSE = np.mean((predictions - targets) ** 2)\nprint(predictions.tolist())  # [10.0, 5.0]\nprint(float(MSE))            # 2.5`),
    simpleConcept('numpy-broadcast-contract', '广播与轴合同', 'Broadcasting and Axis Contracts', '(n,)+(n,)\\to(n,)', [['axis 0', '样本轴。', 'The sample axis.'], ['axis 1', '特征轴。', 'The feature axis.']], '广播只按尾轴大小执行，不理解监督语义。', 'Broadcasting follows trailing sizes and does not understand supervisory semantics.', '(n,1) 与 (n,) 会扩成 (n,n)，不是对齐残差。', '(n,1) with (n,) expands to (n,n), not aligned residuals.', '二维预测列减一维 target 会产生错误成对矩阵。', 'A 2D prediction column minus a 1D target produces a wrong pairwise matrix.', '显式 shape 断言保护训练 loss 的样本对齐。', 'Explicit shape assertions protect sample alignment in training loss.'),
  ],
  misconceptions: [
    misconception('numpy-broadcast-means-correct', 'NumPy 能广播就说明数学正确。', 'If NumPy broadcasts, the mathematics is correct.', '广播只验证尺寸规则，不验证轴语义。', 'Broadcasting validates size rules, not axis semantics.', '(2,1)-(2,) 合法得到 (2,2)，却不是残差。', '(2,1)-(2,) legally gives (2,2), but not residuals.'),
    misconception('numpy-int-safe', '整数数组可安全接收浮点原地结果。', 'Integer arrays safely accept floating in-place results.', 'dtype 可能报错或截断，需要显式 float 合同。', 'Dtype may error or truncate; require an explicit float contract.', '用 np.asarray(..., dtype=float) 建立数值接口。', 'Use np.asarray(..., dtype=float) to establish the numeric interface.'),
    misconception('numpy-view-independent', '切片 view 是独立参数副本。', 'A slice view is an independent parameter copy.', 'view 可能修改父数组，扰动必须显式 copy。', 'A view may mutate its parent; perturbations require explicit copies.', 'plus 探测污染 baseline 会破坏 minus 结果。', 'A plus probe that contaminates baseline breaks the minus result.'),
    misconception('numpy-nan-will-raise', 'NaN 会自动抛错。', 'NaN automatically raises an error.', 'NaN 常会静默传播，必须显式检查。', 'NaN often propagates silently and must be checked explicitly.', 'np.isfinite(...).all() 在计算前后建立失败边界。', 'np.isfinite(...).all() establishes failure boundaries before and after computation.'),
    misconception('numpy-missing-bias', 'X@w 得到 [5,0]，所以这已经是最终预测。', 'X@w gives [5,0], so it is already the final prediction.', '加权和仍缺少共享偏置 b=5；完整预测必须执行 X@w+b。', 'The weighted sums still miss shared bias b=5; complete prediction must execute X@w+b.', '给 [5,0] 加 bias=5 才得到 predictions=[10,5]。', 'Adding bias=5 to [5,0] produces predictions=[10,5].'),
    misconception('numpy-sensor-axis', '列校准量必须改成 (3,1) 才能沿传感器轴相加。', 'Column calibration must be reshaped to (3,1) to add along the sensor axis.', '传感器列位于 shape (2,3) 的末轴，column_bias 应保持 (3,)；NumPy 会把它复用到每一行。', 'Sensor columns are the trailing axis of shape (2,3), so column_bias stays (3,) and NumPy reuses it across rows.', '单行 (3,) 加 wrong_column_bias (3,1) 会广播成错误的 (3,3)，而 (2,3)+(3,) 保持 (2,3)。', 'A row (3,) plus wrong_column_bias (3,1) broadcasts to a wrong (3,3), while (2,3)+(3,) remains (2,3).'),
  ],
  quizzes: [
    formativeQuiz('numpy-output-check', '安全实现的 predictions 是什么？', 'What are predictions from the safe implementation?', 'ten-five', '[10.0, 5.0]', '[10.0, 5.0]', '[5.0, 0.0]', '[5.0, 0.0]', 'X@w 的加权和 [5,0] 仍缺少 bias=5；加偏置后才得到 [10,5]。', 'Weighted sums X@w=[5,0] still miss bias=5; adding bias produces [10,5].', 'numpy-missing-bias', 'numpy-worked-shared'),
    formativeQuiz('numpy-axis-check', '给 shape (2,3) 的 sensor_grid 每列加 [1,2,3]，column_bias 应是什么 shape？', 'To add [1,2,3] to sensor columns of a (2,3) sensor_grid, what shape should column_bias have?', 'column-vector', '(3,)', '(3,)', '(3,1)', '(3,1)', '传感器列是末轴；(3,) 会复用到两行，而 (3,1) 与单行相加会错误广播为 (3,3)。', 'The sensor axis is trailing: (3,) is reused across rows, while (3,1) with one row wrongly broadcasts to (3,3).', 'numpy-sensor-axis', 'numpy-worked-auxiliary'),
    formativeQuiz('numpy-copy-check', '中央差分扰动前必须做什么？', 'What is required before central-difference perturbation?', 'copy', '复制参数数组', 'Copy the parameter array', '创建共享 view', 'Create a shared view', '副本阻止相邻探测互相污染。', 'Copies stop neighboring probes from contaminating one another.', 'numpy-view-independent', 'numpy-code'),
    formativeQuiz('numpy-finite-check', '哪个 API 建立非有限值失败边界？', 'Which API establishes the non-finite failure boundary?', 'finite', 'np.isfinite', 'np.isfinite', 'np.reshape', 'np.reshape', 'shape 操作不会检测 NaN/Infinity。', 'Shape operations do not detect NaN/Infinity.', 'numpy-nan-will-raise', 'numpy-code'),
  ],
})

const studioLab: LabConfig = {
  id: 'math-to-code-studio-lab',
  title: copy('公式到代码中间值实验台', 'Formula-to-Code Intermediate-Value Studio'),
  type: 'hybrid',
  componentName: 'MathToCodeStudioLab',
  successCriteria: [
    copy('能从 X、w、b 逐层解释预测、残差、平方误差、MSE 与数值敏感度。', 'Explain predictions, residuals, squared errors, MSE, and numerical sensitivities from X, w, and b layer by layer.'),
    copy('能用 shape 与有限值反馈定位无效输入，并恢复共同起点。', 'Use shape and finite-value feedback to locate invalid input and restore the shared baseline.'),
  ],
}

const studioModule = promotedModule({
  id: 'math-to-code-guided-studio', key: 'studio',
  zhTitle: '引导式实践：从数学到可复现代码', enTitle: 'Guided Studio: From Mathematics to Reproducible Code',
  zhSubtitle: '按同一 notebook 顺序重建标量、向量、批量预测、MSE、数值敏感度、概率预告与失败诊断。',
  enSubtitle: 'Rebuild scalar, vector, batch, MSE, numerical-sensitivity, probability-preview, and failure-diagnosis evidence in one ordered notebook.',
  prerequisites: ['numpy-mathematics-implementation'], sourceNoteFile: 'math-to-code-guided-studio-sources.md',
  accent: '#0f766e', theme: '#ecfdf5', lab: studioLab, completionMode: 'self-attested',
  objectives: [
    ['用同一组 X、w、b、targets 重建完整预测与误差链。', 'Rebuild the complete prediction and error chain from one X, w, b, and targets contract.'],
    ['保留矩阵、目标、预测、残差、平方误差、MSE 与导数中间值。', 'Preserve matrix, target, prediction, residual, squared-error, MSE, and derivative intermediates.'],
    ['用 shape、有限值与循环 oracle 诊断静默错误。', 'Diagnose silent errors with shapes, finite checks, and a loop oracle.'],
    ['区分局部数值敏感度、概率预告与后续正式项目。', 'Separate local numerical sensitivity, the probability preview, and the later formal project.'],
  ],
  connections: [
    ['可审计中间值是把数学定义迁移到张量框架和训练代码的基础。', 'Auditable intermediates are the basis for moving mathematical definitions into tensor frameworks and training code.'],
    ['固定种子预告可复现随机实验，但不替代后续 Monte Carlo 课程。', 'The fixed-seed preview demonstrates reproducible randomness without replacing the later Monte Carlo lesson.'],
  ],
  concepts: [
    simpleConcept('studio-forward-error-chain', '前向预测与误差链', 'Forward Prediction and Error Chain', '\\hat y=Xw+b,\\quad L=\\frac1n\\sum_i(\\hat y_i-y_i)^2', [['X', 'shape (n,d) 的有限样本矩阵。', 'A finite sample matrix with shape (n,d).'], ['w', 'shape (d,) 的有限权重向量。', 'A finite weight vector with shape (d,).'], ['y', '预测后才进入比较的 shape (n,) 目标。', 'Shape-(n,) targets that enter only after prediction.']], '每一层保留名字与 shape，便于从 MSE 逆向定位。', 'Preserve names and shapes at each layer so a surprising MSE can be traced upstream.', '样本轴保留到逐行误差，特征轴在点积时消去。', 'The sample axis survives through row errors while the feature axis is contracted by the dot product.', 'predictions=[10,5]，residuals=[1,-2]，squares=[1,4]，MSE=2.5。', 'predictions=[10,5], residuals=[1,-2], squares=[1,4], and MSE=2.5.', '同一账本可迁移到批量神经网络前向计算与损失诊断。', 'The same ledger transfers to batched neural-network forward passes and loss diagnosis.'),
    simpleConcept('studio-local-sensitivity', '局部数值敏感度', 'Local Numerical Sensitivity', '\\frac{L(\\theta+h)-L(\\theta-h)}{2h}', [['theta', '一次只探测的当前参数。', 'The current parameter probed one at a time.'], ['h', '有限、为正的局部扰动。', 'A finite positive local perturbation.']], '中央差分读取当前点附近的损失变化率，不更新参数。', 'Central difference reads a local loss rate near the current point and does not update parameters.', '左右探测必须从同一中心的独立副本出发。', 'Left and right probes must start from independent copies of the same center.', '敏感度约为 w=[0,-5]、b=-1。', 'Sensitivities are approximately w=[0,-5] and b=-1.', '后续梯度下降还需要学习率、更新规则与迭代证据。', 'Later gradient descent still requires a learning rate, update rule, and iteration evidence.'),
  ],
  misconceptions: [
    misconception('studio-broadcast-is-alignment', '只要广播成功，预测与目标就已逐行对齐。', 'Successful broadcasting proves predictions and targets are row-aligned.', '广播只检查尾轴尺寸；损失前必须要求一维 shape 完全相同。', 'Broadcasting checks trailing sizes only; loss requires identical one-dimensional shapes.', '(2,) 减 (2,1) 会静默产生 (2,2) 交叉残差。', '(2,) minus (2,1) silently creates (2,2) cross residuals.'),
    misconception('studio-mse-is-enough', '只保留 MSE 足以诊断所有错误。', 'MSE alone is enough to diagnose every error.', '聚合会丢失样本方向与贡献，必须保留残差和平方误差。', 'Aggregation loses sample direction and contribution, so residuals and squared errors must remain visible.', '2.5 不能反推出 [1,-2] 与 [1,4]。', 'The scalar 2.5 cannot reconstruct [1,-2] and [1,4].'),
    misconception('studio-sensitivity-is-training', '数值敏感度计算已经训练了模型。', 'Computing numerical sensitivity has trained the model.', '敏感度只估计局部斜率；这里没有学习率、赋值或迭代。', 'Sensitivity only estimates local slope; no learning rate, assignment, or iteration occurs here.', '返回 -5 不会把 w2 改成任何新值。', 'Returning -5 does not change w2 to a new value.'),
    misconception('studio-seed-removes-randomness', '固定种子消除了随机现象。', 'A fixed seed removes randomness from the phenomenon.', '固定种子只复现同一伪随机序列，不回答完整概率问题。', 'A fixed seed only reproduces one pseudorandom sequence; it does not answer the full probability questions.', '重新创建 seed=2026 可核对表格，但不同种子通常给出不同频率。', 'Recreating seed=2026 verifies the table, while different seeds usually produce different frequencies.'),
  ],
  quizzes: [],
})

export const mathToCodeModules: MathLabModule[] = [
  functionsAndMappingsModule,
  vectorsModule,
  matricesModule,
  derivativesModule,
  numpyModule,
  studioModule,
]
