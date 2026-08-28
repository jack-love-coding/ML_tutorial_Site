import type { LocalizedCopy } from '../../../types/ml.ts'
import type {
  CourseAcceptanceCriterion,
  CourseDefinition,
  CourseDifficulty,
  CoursePublicationStatus,
  CourseResourceRef,
  CourseStage,
  CourseUnit,
} from '../types.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })
const same = (value: string): LocalizedCopy => copy(value, value)

interface UnitSeed {
  id: string
  order: number
  stageId: string
  title: LocalizedCopy
  coreQuestion: LocalizedCopy
  knowledgeAndMethods: LocalizedCopy
  teachingFocus: LocalizedCopy
  practice: LocalizedCopy
  datasets: LocalizedCopy
  tools: LocalizedCopy
  deliverables: LocalizedCopy
  criteria: LocalizedCopy[]
  prerequisites: string[]
  difficulty: CourseDifficulty
  resources?: CourseResourceRef[]
  notebookRefs?: CourseResourceRef[]
  code: string
  misconception: LocalizedCopy
  checkpoint: {
    question: LocalizedCopy
    correct: LocalizedCopy
    distractors: [LocalizedCopy, LocalizedCopy]
    feedback: LocalizedCopy
  }
  referenceLinks: string[]
}

function criterion(unitId: string, value: LocalizedCopy, index: number): CourseAcceptanceCriterion {
  return { id: `${unitId}-criterion-${index + 1}`, label: value }
}

function createUnit(seed: UnitSeed): CourseUnit {
  const publicationStatus: CoursePublicationStatus = seed.order <= 6 ? 'published' : 'planned'
  const acceptanceCriteria = seed.criteria.map((value, index) => criterion(seed.id, value, index))
  const resourceStep = seed.resources?.length
    ? [{
        id: `${seed.id}-resources`,
        kind: 'resource' as const,
        title: copy('进入现有深度资源', 'Open the existing deep-dive resources'),
        description: copy(
          '带着本单元的问题进入既有讲解或实验；资源完成后回到本页继续整理证据。',
          'Open the existing lesson or lab with this unit question in mind, then return here to organize the evidence.',
        ),
        required: true,
        resourceRefs: seed.resources,
      }]
    : []

  return {
    id: seed.id,
    order: seed.order,
    syllabusIndex: seed.order,
    stageId: seed.stageId,
    title: seed.title,
    coreQuestion: seed.coreQuestion,
    summary: seed.knowledgeAndMethods,
    outcomes: acceptanceCriteria.map(({ label }) => label),
    prerequisiteUnitIds: seed.prerequisites,
    difficulty: seed.difficulty,
    estimatedHours: 2,
    knowledgeAndMethods: seed.knowledgeAndMethods,
    teachingFocus: seed.teachingFocus,
    practice: seed.practice,
    datasets: seed.datasets,
    tools: seed.tools,
    deliverables: seed.deliverables,
    acceptanceCriteria,
    referenceLinks: seed.referenceLinks,
    publicationStatus,
    steps: [
      {
        id: `${seed.id}-explanation`,
        kind: 'explanation',
        title: copy('建立概念地图', 'Build the concept map'),
        description: seed.coreQuestion,
        content: seed.knowledgeAndMethods,
        required: true,
      },
      {
        id: `${seed.id}-code`,
        kind: 'code',
        title: copy('把概念落到代码', 'Translate the idea into code'),
        description: copy(
          '先说明输入、输出和不变量，再运行或改写这段最小代码。',
          'Name the inputs, outputs, and invariants before running or adapting this minimal code.',
        ),
        code: { language: 'python', source: same(seed.code) },
        required: true,
      },
      ...resourceStep,
      {
        id: `${seed.id}-practice`,
        kind: seed.notebookRefs?.length ? 'notebook' : 'lab',
        title: copy('完成实践并保存证据', 'Complete the practice and retain evidence'),
        description: seed.practice,
        required: true,
        resourceRefs: seed.notebookRefs,
      },
      {
        id: `${seed.id}-misconception`,
        kind: 'misconception',
        title: copy('检查常见误区', 'Check the common misconception'),
        description: seed.misconception,
        content: seed.teachingFocus,
        required: true,
      },
      {
        id: `${seed.id}-checkpoint`,
        kind: 'checkpoint',
        title: copy('Checkpoint：说明理由', 'Checkpoint: explain the reason'),
        description: seed.checkpoint.question,
        required: true,
        checkpoint: {
          question: seed.checkpoint.question,
          options: [
            { id: 'correct', label: seed.checkpoint.correct },
            { id: 'distractor-1', label: seed.checkpoint.distractors[0] },
            { id: 'distractor-2', label: seed.checkpoint.distractors[1] },
          ],
          correctOptionId: 'correct',
          correctFeedback: seed.checkpoint.feedback,
          incorrectFeedback: copy(
            '再对照本单元的输入、计算边界和验收标准；答案需要能由证据复算。',
            'Recheck the unit inputs, computation boundary, and acceptance criteria; the answer must be reproducible from evidence.',
          ),
        },
      },
      {
        id: `${seed.id}-deliverable`,
        kind: 'deliverable',
        title: copy('整理课后产出', 'Package the learning artifact'),
        description: seed.deliverables,
        content: copy(
          '逐项对照页面末尾的验收清单。勾选只表示自检完成，不会锁定其他单元。',
          'Check the acceptance list at the end of the page. Confirmation is a self-check and never locks other units.',
        ),
        required: true,
      },
    ],
  }
}

const pythonNotebook = (label: LocalizedCopy): CourseResourceRef => ({
  kind: 'asset',
  path: '/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb',
  label,
  download: true,
})

interface PlannedUnitSeed {
  id: string
  order: number
  stageId: string
  title: LocalizedCopy
  coreQuestion: LocalizedCopy
  knowledgeAndMethods: LocalizedCopy
  practice: LocalizedCopy
  datasets: LocalizedCopy
  tools: LocalizedCopy
  deliverables: LocalizedCopy
  code: string
  resources?: CourseResourceRef[]
}

function createPlannedUnit(seed: PlannedUnitSeed): CourseUnit {
  return createUnit({
    ...seed,
    difficulty: seed.order < 15 ? 'intermediate' : 'advanced',
    prerequisites: [String(seed.order - 1).padStart(2, '0') + '-' + plannedPrerequisiteSlugs[seed.order - 1]],
    teachingFocus: copy(
      '先定义任务、数据边界和评价协议，再比较方法；所有结论都要能回到可复算的验证证据。',
      'Define the task, data boundary, and evaluation protocol before comparing methods; every claim must trace to reproducible validation evidence.',
    ),
    misconception: copy(
      '更复杂或更新的模型不必然更好；如果划分、指标或基线不一致，分数差异不能支持方法结论。',
      'A newer or more complex model is not automatically better; score differences cannot support a method claim when splits, metrics, or baselines differ.',
    ),
    criteria: [
      copy('能从干净环境复现基线、主要结果和评价指标。', 'Can reproduce the baseline, main result, and metric from a clean environment.'),
      copy('能用实验或数值证据解释至少一个成功条件和一个失败模式。', 'Can explain at least one success condition and one failure mode using experimental or numerical evidence.'),
      copy('成果包含数据边界、验证协议、限制与下一步。', 'The artifact states its data boundary, validation protocol, limitations, and next step.'),
    ],
    checkpoint: {
      question: copy('哪一种证据最能支持本单元的方法结论？', 'Which evidence best supports a method claim in this unit?'),
      correct: copy('在相同数据划分和指标下复现的对照实验，并记录限制', 'A reproduced controlled comparison on the same split and metric, with limitations recorded'),
      distractors: [
        copy('只引用一次最高分且不保存配置', 'Quote only the single highest score without saving configuration'),
        copy('更换模型、划分和指标后直接比较数字', 'Change model, split, and metric, then compare the numbers directly'),
      ],
      feedback: copy(
        '固定比较协议才能把差异归因于方法；复现记录和限制说明让结论可审计。',
        'A fixed comparison protocol makes attribution possible, while reproduction records and limitations make the claim auditable.',
      ),
    },
    referenceLinks: [],
  })
}

const plannedPrerequisiteSlugs: Record<number, string> = {
  6: 'eda-visual-evidence',
  7: 'ml-experiment-design',
  8: 'linear-regression-optimization',
  9: 'logistic-regression-thresholds',
  10: 'classic-classifiers',
  11: 'decision-trees',
  12: 'bagging-random-forests',
  13: 'gradient-boosting',
  14: 'tabular-pipeline',
  15: 'mlp-backpropagation',
  16: 'pytorch-training-engineering',
  17: 'cnn-image-classification',
  18: 'transfer-learning-vit',
  19: 'detection-segmentation',
  20: 'nlp-tfidf-baseline',
  21: 'rnn-lstm-attention-bridge',
  22: 'attention-transformer',
  23: 'pretrained-transformers',
  24: 'llm-training-adaptation',
}

const stages: CourseStage[] = [
  {
    id: 'data-programming',
    code: 'A',
    order: 1,
    title: copy('数据与编程基础', 'Data and Programming Foundations'),
    description: copy(
      '用可复现 Notebook、NumPy、Pandas 和解释型图表，把原始数据变成可审计的分析证据。',
      'Use reproducible notebooks, NumPy, pandas, and explanatory charts to turn raw data into auditable evidence.',
    ),
    outcomes: [
      copy('能从干净环境运行分析，并说明每一步输入、输出与限制。', 'Run an analysis from a clean environment and explain each input, output, and limitation.'),
      copy('能完成数据质量审计、清洗、聚合和小型 EDA 报告。', 'Complete a data-quality audit, cleaning workflow, aggregation, and a compact EDA report.'),
    ],
    unitIds: [
      '01-ai-map-python',
      '02-python-functions-debugging',
      '03-numpy-shapes-vectorization',
      '04-pandas-inspection',
      '05-pandas-cleaning-joins',
      '06-eda-visual-evidence',
    ],
    publicationStatus: 'published',
  },
  {
    id: 'ml-core',
    code: 'B',
    order: 2,
    title: copy('机器学习核心', 'Machine Learning Core'),
    description: copy(
      '从验证设计出发，连接线性模型、分类、树模型、集成学习和无泄漏表格 Pipeline。',
      'Start with validation design and connect linear models, classification, trees, ensembles, and leakage-safe tabular pipelines.',
    ),
    outcomes: [copy('能建立、比较并解释一个可复现的表格模型基线。', 'Build, compare, and explain a reproducible tabular-model baseline.')],
    unitIds: [
      '07-ml-experiment-design',
      '08-linear-regression-optimization',
      '09-logistic-regression-thresholds',
      '10-classic-classifiers',
      '11-decision-trees',
      '12-bagging-random-forests',
      '13-gradient-boosting',
      '14-tabular-pipeline',
    ],
    publicationStatus: 'planned',
  },
  {
    id: 'deep-learning-cv-nlp',
    code: 'C',
    order: 3,
    title: copy('深度学习、CV 与 NLP', 'Deep Learning, Computer Vision, and NLP'),
    description: copy(
      '把反向传播、PyTorch 训练工程、视觉任务和文本基线连接成可诊断的深度学习工作流。',
      'Connect backpropagation, PyTorch training engineering, vision tasks, and text baselines into a diagnosable deep-learning workflow.',
    ),
    outcomes: [copy('能训练、保存、复现并诊断一个深度学习基线。', 'Train, save, reproduce, and diagnose a deep-learning baseline.')],
    unitIds: [
      '15-mlp-backpropagation',
      '16-pytorch-training-engineering',
      '17-cnn-image-classification',
      '18-transfer-learning-vit',
      '19-detection-segmentation',
      '20-nlp-tfidf-baseline',
      '21-rnn-lstm-attention-bridge',
    ],
    publicationStatus: 'planned',
  },
  {
    id: 'transformer-llm',
    code: 'D',
    order: 4,
    title: copy('Transformer 与现代大模型', 'Transformers and Modern Language Models'),
    description: copy(
      '从 QKV 和 Transformer Block 走到预训练模型、参数高效微调、RAG、工具调用和可靠性评估。',
      'Move from QKV and Transformer blocks to pretrained models, parameter-efficient adaptation, RAG, tool use, and reliability evaluation.',
    ),
    outcomes: [copy('能交付一个带评测、来源与失败分析的 LLM 应用。', 'Deliver an LLM application with evaluation, sources, and failure analysis.')],
    unitIds: [
      '22-attention-transformer',
      '23-pretrained-transformers',
      '24-llm-training-adaptation',
      '25-llm-applications-capstone',
    ],
    publicationStatus: 'planned',
  },
]

const units: CourseUnit[] = [
  createUnit({
    id: '01-ai-map-python', order: 1, stageId: 'data-programming', difficulty: 'beginner', prerequisites: [],
    title: copy('AI 学习地图、Notebook 环境与 Python 核心语法', 'AI Learning Map, Notebook Setup, and Core Python'),
    coreQuestion: copy('一个可复现的 AI 实验由哪些对象和执行步骤组成？', 'Which objects and execution steps make an AI experiment reproducible?'),
    knowledgeAndMethods: copy('分类、回归与生成任务；样本、特征、标签、模型和指标；Notebook 内核；变量、数值、字符串、条件、循环与基础容器。', 'Classification, regression, and generation; samples, features, labels, models, and metrics; notebook kernels; variables, values, strings, conditions, loops, and core containers.'),
    teachingFocus: copy('先区分任务与评价，再写代码；变量必须在使用前创建；Restart & Run All 才是 Notebook 可复现性的最低标准。', 'Separate task definition from evaluation before coding; create variables before use; Restart & Run All is the minimum reproducibility check.'),
    practice: copy('从干净内核运行一份 Notebook，完成 8—10 个短练习，并画出一个 AI 任务的输入—模型—输出—评价结构。', 'Run a notebook from a clean kernel, complete 8–10 short exercises, and diagram the input–model–output–evaluation structure of an AI task.'),
    datasets: copy('教师提供的小型成绩、鸢尾花或房价样例', 'A small teacher-provided scores, Iris, or housing sample'),
    tools: copy('Python、JupyterLab 或 Google Colab', 'Python, JupyterLab, or Google Colab'),
    deliverables: copy('可从头运行的 Notebook、短练习答案和 AI 任务结构说明卡。', 'A restartable notebook, short-exercise answers, and an AI-task structure card.'),
    criteria: [copy('重启环境后可一次运行。', 'Runs once from a restarted environment.'), copy('基础练习正确率不少于 80%。', 'At least 80% of the foundation exercises are correct.'), copy('能区分分类、回归与生成任务。', 'Can distinguish classification, regression, and generation.')],
    resources: [
      { kind: 'curriculum', moduleId: 'ai-overview', lessonId: 'what-is-ml', label: copy('AI 入门总览', 'AI Overview') },
      { kind: 'route', route: '/python/notebook-workflow', label: copy('Notebook 可复现执行', 'Reproducible Notebook Workflow') },
    ],
    notebookRefs: [pythonNotebook(copy('下载 Python 数据工具 Notebook', 'Download the Python Data Tools notebook'))],
    code: `task = {\n    "input": "feature rows",\n    "target": "label or value",\n    "model": "learned mapping",\n    "metric": "evidence of quality",\n}\nassert set(task) == {"input", "target", "model", "metric"}`,
    misconception: copy('“单元格曾经显示过结果”不等于任何人都能复现；旧内核可能隐藏了执行顺序错误。', 'A cell having shown output once does not make it reproducible; stale kernel state can hide an invalid execution order.'),
    checkpoint: { question: copy('怎样证明 Notebook 不依赖隐藏状态？', 'How do you show that a notebook does not depend on hidden state?'), correct: copy('重启内核并按顺序一次运行全部单元格', 'Restart the kernel and run all cells in order'), distractors: [copy('只重新运行最后一个单元格', 'Rerun only the final cell'), copy('保留所有旧输出但不执行', 'Keep old outputs without executing')], feedback: copy('干净内核只保留当前文档按顺序建立的状态，因此能暴露缺失依赖。', 'A clean kernel contains only state created in document order, exposing missing dependencies.') },
    referenceLinks: ['https://docs.python.org/3/tutorial/', 'https://jupyter.org/try'],
  }),
  createUnit({
    id: '02-python-functions-debugging', order: 2, stageId: 'data-programming', difficulty: 'beginner', prerequisites: ['01-ai-map-python'],
    title: copy('容器、函数、文件处理与调试', 'Containers, Functions, Files, and Debugging'),
    coreQuestion: copy('怎样把一次性 Notebook 代码整理成可测试、可定位错误的小程序？', 'How do you turn one-off notebook code into a small testable and debuggable program?'),
    knowledgeAndMethods: copy('list、tuple、dict、set；函数参数与返回值；Path 与相对路径；CSV/JSON；异常处理、断言、traceback 和最小测试样例。', 'Lists, tuples, dictionaries, and sets; function parameters and returns; Path and relative paths; CSV/JSON; exceptions, assertions, tracebacks, and minimal test cases.'),
    teachingFocus: copy('函数只承担一个职责；不要硬编码本机路径；异常消息要说明失败对象和修复方向；先复现错误再修改。', 'Keep one responsibility per function; avoid machine-specific paths; error messages should name the failed object and recovery direction; reproduce before fixing.'),
    practice: copy('编写 4—6 个函数读取小型 CSV，验证列名和数值范围，输出摘要，并为缺文件、坏字段和非法数值准备测试样例。', 'Write 4–6 functions that load a small CSV, validate columns and ranges, return a summary, and test missing files, bad fields, and invalid values.'),
    datasets: copy('教师提供的小型脏 CSV 与 JSON 配置', 'A small teacher-provided dirty CSV and JSON configuration'),
    tools: copy('Python 标准库、pathlib、csv、json', 'Python standard library, pathlib, csv, and json'),
    deliverables: copy('小型数据处理脚本、测试样例和异常说明。', 'A small data-processing script, test cases, and exception notes.'),
    criteria: [copy('函数职责清晰且返回值稳定。', 'Functions have clear responsibilities and stable returns.'), copy('异常信息可读并能定位具体输入。', 'Errors are readable and identify the failing input.'), copy('代码不依赖手工修改绝对路径。', 'Code does not require manual absolute-path edits.')],
    resources: [{ kind: 'route', route: '/python/notebook-workflow', label: copy('相对路径与尽早失败', 'Relative paths and fail-fast checks') }],
    notebookRefs: [pythonNotebook(copy('下载共享单车 Notebook 作为文件工作流范例', 'Download the bike-sharing notebook as a file-workflow example'))],
    code: `from pathlib import Path\n\ndef require_file(path: Path) -> Path:\n    if not path.is_file():\n        raise FileNotFoundError(f"missing data file: {path}")\n    return path\n\nDATA_PATH = require_file(Path("data/sample.csv"))`,
    misconception: copy('捕获所有异常然后返回空结果会掩盖真正错误；异常处理不是让程序“看起来没报错”。', 'Catching every exception and returning an empty result hides the real failure; exception handling is not about making errors disappear.'),
    checkpoint: { question: copy('读取文件函数最有价值的失败行为是什么？', 'What is the most useful failure behavior for a file-loading function?'), correct: copy('尽早抛出包含文件路径和失败原因的异常', 'Fail early with an exception containing the path and reason'), distractors: [copy('返回空表并继续运行', 'Return an empty table and continue'), copy('自动改成本机绝对路径', 'Switch automatically to a machine-specific absolute path')], feedback: copy('尽早、具体的错误让调用者在错误源头修复问题，而不是追踪下游空结果。', 'Early, specific errors let callers fix the source instead of tracing empty downstream results.') },
    referenceLinks: ['https://docs.python.org/3/tutorial/controlflow.html#defining-functions', 'https://docs.python.org/3/library/pathlib.html'],
  }),
  createUnit({
    id: '03-numpy-shapes-vectorization', order: 3, stageId: 'data-programming', difficulty: 'beginner', prerequisites: ['02-python-functions-debugging'],
    title: copy('数组、形状、广播与向量化', 'Arrays, Shapes, Broadcasting, and Vectorization'),
    coreQuestion: copy('数组的 shape、axis 和广播规则怎样决定计算结果？', 'How do array shape, axes, and broadcasting determine a computation result?'),
    knowledgeAndMethods: copy('ndarray、dtype、shape、ndim；索引、切片、布尔掩码；reshape、transpose；axis 聚合；广播规则；向量化与矩阵乘法。', 'ndarray, dtype, shape, and ndim; indexing, slicing, masks; reshape and transpose; axis reductions; broadcasting; vectorization and matrix multiplication.'),
    teachingFocus: copy('每次运算前先写输入和输出形状；axis 表示被压缩的轴；广播兼容不代表业务语义正确。', 'Write input and output shapes before each operation; axis names the reduced dimension; broadcast compatibility does not guarantee semantic correctness.'),
    practice: copy('完成数组操作、axis 与广播练习，对比循环和向量化运行时间，并解释至少 5 个 shape 变化。', 'Complete array, axis, and broadcasting exercises; compare loop and vectorized runtimes; explain at least five shape changes.'),
    datasets: copy('MNIST 小样本、共享单车数值列或合成矩阵', 'A small MNIST sample, bike-sharing numeric columns, or synthetic matrices'),
    tools: copy('NumPy、Matplotlib', 'NumPy and Matplotlib'),
    deliverables: copy('数组操作练习、运行时间对比图和 shape 解释表。', 'Array exercises, a runtime comparison chart, and a shape explanation table.'),
    criteria: [copy('向量化结果与循环一致。', 'Vectorized results match the loop.'), copy('能正确选择 axis。', 'Can select the correct axis.'), copy('能预测常见矩阵运算的输出形状。', 'Can predict common matrix-operation output shapes.')],
    resources: [
      { kind: 'route', route: '/python/numpy-foundations', label: copy('NumPy 数组与向量化统计', 'NumPy Arrays and Vectorized Statistics') },
      { kind: 'curriculum', moduleId: 'tensor-shapes-vectorization', label: copy('张量 shape 与向量化实验', 'Tensor Shape and Vectorization Lab') },
    ],
    notebookRefs: [pythonNotebook(copy('下载带真实数组输出的 Notebook', 'Download the notebook with real array outputs'))],
    code: `import numpy as np\n\nx = np.array([[1., 2., 3.], [4., 5., 6.]])\ncolumn_mean = x.mean(axis=0)\ncentered = x - column_mean\nassert centered.shape == x.shape\nassert np.allclose(centered.mean(axis=0), 0.0)`,
    misconception: copy('把 axis=0 记成“横着算”很容易出错；应理解为压缩第 0 轴、保留列位置。', 'Memorizing axis=0 as “horizontal” is fragile; understand it as reducing axis 0 while retaining column positions.'),
    checkpoint: { question: copy('形状为 (n, d) 的特征矩阵按列标准化时应沿哪条轴计算均值？', 'For an (n, d) feature matrix, which axis computes per-column means?'), correct: copy('axis=0，得到形状 (d,)', 'axis=0, producing shape (d,)'), distractors: [copy('axis=1，得到形状 (n,)', 'axis=1, producing shape (n,)'), copy('不指定 axis，得到原形状', 'Omit axis to retain the original shape')], feedback: copy('压缩样本轴会为每个特征留下一个统计量，随后可广播回 (n, d)。', 'Reducing the sample axis leaves one statistic per feature, which can broadcast back to (n, d).') },
    referenceLinks: ['https://numpy.org/doc/stable/user/quickstart.html'],
  }),
  createUnit({
    id: '04-pandas-inspection', order: 4, stageId: 'data-programming', difficulty: 'beginner', prerequisites: ['03-numpy-shapes-vectorization'],
    title: copy('读取、检查、索引与筛选', 'Loading, Inspecting, Indexing, and Filtering'),
    coreQuestion: copy('怎样在建模前确认一张表的规模、类型、语义和基本质量？', 'How do you verify a table’s size, types, semantics, and basic quality before modeling?'),
    knowledgeAndMethods: copy('Series 与 DataFrame；read_csv；head、shape、columns、dtypes、info、describe；loc/iloc；布尔筛选；缺失、重复和目标分布审计。', 'Series and DataFrame; read_csv; head, shape, columns, dtypes, info, and describe; loc/iloc; boolean filtering; missingness, duplicates, and target audits.'),
    teachingFocus: copy('先读数据字典再解释 dtype；区分标签索引和位置索引；筛选掩码必须与行对齐；不要在不懂字段语义时直接建模。', 'Read the data dictionary before interpreting dtypes; distinguish labels from positions; filters must align with rows; do not model fields you do not understand.'),
    practice: copy('完成规模、字段、类型、缺失、重复和目标分布审计，并回答不少于 8 个筛选、排序与条件统计问题。', 'Audit size, fields, types, missingness, duplicates, and target distribution, then answer at least eight filtering, sorting, and conditional-statistics questions.'),
    datasets: copy('Titanic、Palmer Penguins 或共享单车', 'Titanic, Palmer Penguins, or bike sharing'),
    tools: copy('pandas、数据字典', 'pandas and a data dictionary'),
    deliverables: copy('数据字典、基础质量报告和筛选问题答案。', 'A data dictionary, basic quality report, and filtering answers.'),
    criteria: [copy('能准确提取指定行列。', 'Can retrieve specified rows and columns accurately.'), copy('能发现类型异常、缺失和重复。', 'Can detect type issues, missing values, and duplicates.'), copy('结果可由代码复现。', 'Results are reproducible from code.')],
    resources: [
      { kind: 'route', route: '/python/pandas-structures', label: copy('Pandas 表格结构', 'Pandas Table Structures') },
      { kind: 'curriculum', moduleId: 'numerical-data', label: copy('数值列到特征向量', 'Numeric Columns to Feature Vectors') },
      { kind: 'curriculum', moduleId: 'dataset-quality', label: copy('数据质量实验', 'Dataset Quality Lab') },
    ],
    notebookRefs: [pythonNotebook(copy('下载带 schema 审计的 Notebook', 'Download the notebook with a schema audit'))],
    code: `import pandas as pd\n\nframe = pd.read_csv("data/sample.csv")\naudit = {\n    "shape": frame.shape,\n    "dtypes": frame.dtypes.astype(str).to_dict(),\n    "missing": frame.isna().sum().to_dict(),\n    "duplicate_rows": int(frame.duplicated().sum()),\n}\nassert audit["shape"][0] > 0`,
    misconception: copy('整数 dtype 不会自动把编码列变成连续测量；字段含义必须来自数据字典。', 'An integer dtype does not turn an encoded category into a continuous measurement; meaning comes from the data dictionary.'),
    checkpoint: { question: copy('为什么 `season` 是整数也不应直接计算平均季节？', 'Why should an integer season code not be averaged directly?'), correct: copy('数字是类别编码，间距没有连续量语义', 'The numbers encode categories and their spacing has no continuous meaning'), distractors: [copy('因为 pandas 不能对整数求均值', 'Because pandas cannot average integers'), copy('因为任何类别列都必须删除', 'Because every categorical column must be dropped')], feedback: copy('存储类型和变量语义是两件事；统计方法必须匹配变量角色。', 'Storage type and variable meaning are different; the statistic must match the variable role.') },
    referenceLinks: ['https://pandas.pydata.org/docs/getting_started/intro_tutorials/'],
  }),
  createUnit({
    id: '05-pandas-cleaning-joins', order: 5, stageId: 'data-programming', difficulty: 'beginner', prerequisites: ['04-pandas-inspection'],
    title: copy('清洗、变换、聚合与多表合并', 'Cleaning, Transforming, Aggregating, and Joining Tables'),
    coreQuestion: copy('怎样证明清洗和合并没有悄悄改变样本含义？', 'How do you prove that cleaning and joins did not silently change sample meaning?'),
    knowledgeAndMethods: copy('缺失与重复；astype；字符串和日期；创建与重命名列；groupby/agg、pivot_table；merge/join/concat；主键、重复键和 unmatched rows。', 'Missingness and duplicates; astype; strings and dates; creating and renaming columns; groupby/agg and pivot tables; merge/join/concat; keys, duplicate keys, and unmatched rows.'),
    teachingFocus: copy('使用显式 .loc；清洗策略必须有理由；合并前后检查行数、键唯一性和未匹配记录；区分业务缺失与随机缺失。', 'Use explicit .loc; justify cleaning; check row counts, key uniqueness, and unmatched records before and after joins; distinguish business missingness from random missingness.'),
    practice: copy('清洗脏订单数据，构造日期和金额特征，按类别聚合，再合并订单、客户和商品表并输出未匹配记录。', 'Clean dirty order data, derive date and amount features, aggregate by category, join order, customer, and product tables, and report unmatched records.'),
    datasets: copy('Online Retail 子集或订单—客户—商品三表', 'An Online Retail subset or order–customer–product tables'),
    tools: copy('pandas', 'pandas'),
    deliverables: copy('clean.csv、清洗日志、聚合结果表和合并质量检查。', 'clean.csv, a cleaning log, aggregation output, and join-quality checks.'),
    criteria: [copy('字段类型正确且缺失处理可解释。', 'Field types are correct and missing-value handling is justified.'), copy('合并行数符合预期。', 'Join row counts match expectations.'), copy('不存在意外重复主键。', 'No unexpected duplicate primary keys remain.')],
    resources: [
      { kind: 'route', route: '/python/pandas-analysis', label: copy('Pandas 分组分析', 'Pandas Grouped Analysis') },
      { kind: 'curriculum', moduleId: 'categorical-data', label: copy('类别词表与未知值', 'Categorical Vocabularies and Unknown Values') },
      { kind: 'curriculum', moduleId: 'dataset-quality', label: copy('缺失与标签审计', 'Missingness and Label Audits') },
    ],
    notebookRefs: [pythonNotebook(copy('下载分组分析 Notebook', 'Download the grouped-analysis notebook'))],
    code: `orders = orders.merge(\n    customers,\n    on="customer_id",\n    how="left",\n    validate="many_to_one",\n    indicator=True,\n)\nunmatched = orders.loc[orders["_merge"] != "both"]\nassert orders["order_id"].is_unique`,
    misconception: copy('合并语句成功执行不代表关系正确；错误的重复键会让行数成倍增长。', 'A successful merge call does not prove the relationship is correct; duplicate keys can multiply rows.'),
    checkpoint: { question: copy('多笔订单对应一个客户时应使用哪种合并验证？', 'Which merge validation fits many orders belonging to one customer?'), correct: copy('many_to_one，并检查未匹配记录', 'many_to_one, followed by unmatched-row checks'), distractors: [copy('many_to_many，不检查行数', 'many_to_many without row-count checks'), copy('one_to_one，删除重复订单', 'one_to_one after dropping repeated orders')], feedback: copy('关系约束把业务键假设变成可执行检查，indicator 则暴露未匹配记录。', 'Relationship validation turns a key assumption into an executable check, while indicator exposes unmatched rows.') },
    referenceLinks: ['https://pandas.pydata.org/docs/user_guide/merging.html', 'https://pandas.pydata.org/docs/user_guide/groupby.html'],
  }),
  createUnit({
    id: '06-eda-visual-evidence', order: 6, stageId: 'data-programming', difficulty: 'beginner', prerequisites: ['05-pandas-cleaning-joins'],
    title: copy('从数据问题到图表证据', 'From Data Questions to Visual Evidence'),
    coreQuestion: copy('怎样让每张图回答一个问题，而不是只展示“漂亮的数据”？', 'How does each chart answer a question instead of merely displaying attractive data?'),
    knowledgeAndMethods: copy('描述统计；分布、偏态、异常值和缺失模式；类别频数与双变量关系；相关与因果；直方图、箱线图、柱状图、散点图和折线图。', 'Descriptive statistics; distributions, skew, outliers, and missingness patterns; category counts and bivariate relationships; correlation versus causation; histograms, box plots, bars, scatter plots, and lines.'),
    teachingFocus: copy('问题决定图表，变量类型决定编码；标题、轴、图例和样本量必须可读；结论应同时写证据、限制和下一步假设。', 'Questions determine charts and variable types determine encodings; titles, axes, legends, and sample sizes must be readable; conclusions should state evidence, limitations, and next hypotheses.'),
    practice: copy('提出 5 个 EDA 问题，制作不少于 4 类图表，并为每张图写出发现、证据、限制与下一步建模假设。', 'Pose five EDA questions, build at least four chart types, and write the finding, evidence, limitation, and next modeling hypothesis for each.'),
    datasets: copy('Palmer Penguins、Titanic、Gapminder 或共享单车', 'Palmer Penguins, Titanic, Gapminder, or bike sharing'),
    tools: copy('pandas、Matplotlib、Seaborn', 'pandas, Matplotlib, and Seaborn'),
    deliverables: copy('一份“问题—图表—结论—限制”迷你 EDA 报告。', 'A compact question–chart–conclusion–limitation EDA report.'),
    criteria: [copy('标题、坐标轴和图例完整。', 'Titles, axes, and legends are complete.'), copy('图形匹配变量类型和问题。', 'Charts match the variable types and questions.'), copy('至少三条结论有数据证据且不过度推断。', 'At least three conclusions have evidence without overclaiming.')],
    resources: [
      { kind: 'route', route: '/python/matplotlib-visualization', label: copy('Matplotlib 解释型图表', 'Explanatory Charts with Matplotlib') },
      { kind: 'route', route: '/python/seaborn-statistics', label: copy('分布、关系与相关', 'Distributions, Relationships, and Correlation') },
      { kind: 'route', route: '/python/analysis-report', label: copy('完整分析报告', 'Complete Analysis Report') },
    ],
    notebookRefs: [
      pythonNotebook(copy('下载可复现 EDA Notebook', 'Download the reproducible EDA notebook')),
      { kind: 'asset', path: '/notebooks/python-data-tools/outputs/hourly-demand-profile.png', label: copy('查看解释型图表输出', 'Open an explanatory chart output') },
    ],
    code: `questions = [\n    {"question": "How does demand vary by hour?", "chart": "line", "evidence": "group mean + count"},\n    {"question": "How does demand spread by season?", "chart": "box", "evidence": "median + IQR + n"},\n]\nassert all({"question", "chart", "evidence"} <= item.keys() for item in questions)`,
    misconception: copy('相关热力图不能证明因果，也不能替代对样本选择、时间结构和异常值的检查。', 'A correlation heatmap proves neither causation nor freedom from sample-selection, temporal, or outlier effects.'),
    checkpoint: { question: copy('展示 0—23 时需求变化时，为什么折线图通常优于无序柱状图？', 'Why is a line chart usually better than unordered bars for demand across hours 0–23?'), correct: copy('小时有自然顺序，连线用于追踪相邻时段变化', 'Hours have a natural order, and the line tracks change across adjacent periods'), distractors: [copy('折线图总是比其他图更准确', 'Line charts are always more accurate'), copy('因为折线图能证明时间造成需求变化', 'Because a line chart proves time causes demand')], feedback: copy('图形选择来自变量结构和问题；顺序适合折线，但仍不能自动产生因果结论。', 'The variable structure and question determine the chart; order supports a line but does not create a causal conclusion.') },
    referenceLinks: ['https://matplotlib.org/stable/tutorials/index.html', 'https://seaborn.pydata.org/tutorial.html'],
  }),
  createPlannedUnit({
    id: '07-ml-experiment-design', order: 7, stageId: 'ml-core',
    title: copy('任务定义、验证设计、指标与数据泄漏', 'Task Definition, Validation Design, Metrics, and Leakage'),
    coreQuestion: copy('怎样设计一个不会把测试信息泄漏给模型的可信实验？', 'How do you design a trustworthy experiment that does not leak test information to the model?'),
    knowledgeAndMethods: copy('监督学习流程；训练、验证、测试划分；交叉验证；指标选择；数据泄漏；偏差—方差；可复现实验日志。', 'Supervised-learning workflow; train, validation, and test splits; cross-validation; metric choice; leakage; bias–variance; reproducible experiment logs.'),
    practice: copy('为分类和回归各设计一个验证协议，制造一次泄漏并比较虚高分数，最后提交实验卡。', 'Design one classification and one regression protocol, induce one leakage case, compare the inflated score, and submit an experiment card.'),
    datasets: copy('Titanic 与 California Housing 小样本', 'Small Titanic and California Housing samples'), tools: copy('scikit-learn、pandas', 'scikit-learn and pandas'),
    deliverables: copy('数据划分图、指标理由、泄漏对照和实验日志模板。', 'A split diagram, metric rationale, leakage comparison, and experiment-log template.'),
    resources: [{ kind: 'curriculum', moduleId: 'splits-generalization', label: copy('数据划分与泛化', 'Splits and Generalization') }, { kind: 'curriculum', moduleId: 'model-selection', label: copy('模型选择', 'Model Selection') }],
    code: `from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)\nassert set(X_train.index).isdisjoint(X_test.index)`,
  }),
  createPlannedUnit({
    id: '08-linear-regression-optimization', order: 8, stageId: 'ml-core',
    title: copy('线性回归与梯度下降', 'Linear Regression and Gradient Descent'),
    coreQuestion: copy('损失曲面、梯度和学习率怎样共同决定线性模型的训练轨迹？', 'How do the loss surface, gradient, and learning rate jointly determine a linear model’s training trajectory?'),
    knowledgeAndMethods: copy('线性函数、残差、MSE、最小二乘；梯度推导；批量梯度下降；标准化；学习率和收敛诊断。', 'Linear functions, residuals, MSE, least squares; gradient derivation; batch gradient descent; standardization; learning-rate and convergence diagnostics.'),
    practice: copy('用 NumPy 实现线性回归梯度下降，与解析解和 sklearn 对照，并解释三种学习率曲线。', 'Implement linear-regression gradient descent in NumPy, compare it with the closed form and sklearn, and explain three learning-rate curves.'),
    datasets: copy('合成直线与 California Housing', 'Synthetic lines and California Housing'), tools: copy('NumPy、scikit-learn、Matplotlib', 'NumPy, scikit-learn, and Matplotlib'),
    deliverables: copy('梯度校验、训练曲线、参数对照与误差分析。', 'A gradient check, training curves, parameter comparison, and error analysis.'),
    resources: [{ kind: 'curriculum', moduleId: 'linear-regression', label: copy('线性回归', 'Linear Regression') }, { kind: 'curriculum', moduleId: 'gradient-descent', label: copy('梯度下降', 'Gradient Descent') }, { kind: 'curriculum', moduleId: 'loss-functions', label: copy('损失函数', 'Loss Functions') }],
    code: `prediction = X @ weights + bias\nerror = prediction - y\ngrad_w = (2 / len(X)) * X.T @ error\nweights -= learning_rate * grad_w`,
  }),
  createPlannedUnit({
    id: '09-logistic-regression-thresholds', order: 9, stageId: 'ml-core',
    title: copy('逻辑回归、交叉熵与分类阈值', 'Logistic Regression, Cross-Entropy, and Thresholds'),
    coreQuestion: copy('概率模型的排序质量和最终决策阈值为什么是两件事？', 'Why are a probabilistic model’s ranking quality and its final decision threshold different concerns?'),
    knowledgeAndMethods: copy('sigmoid、logit、二元交叉熵；概率与类别；混淆矩阵；precision、recall、F1、ROC-AUC；阈值和类别不平衡。', 'Sigmoid, logits, binary cross-entropy; probabilities versus classes; confusion matrices; precision, recall, F1, ROC-AUC; thresholds and imbalance.'),
    practice: copy('训练逻辑回归，绘制阈值—指标曲线，并按业务成本选择和解释阈值。', 'Train logistic regression, plot threshold–metric curves, and choose and justify a threshold from business costs.'),
    datasets: copy('乳腺癌诊断或 Titanic', 'Breast Cancer Wisconsin or Titanic'), tools: copy('scikit-learn、NumPy、Matplotlib', 'scikit-learn, NumPy, and Matplotlib'),
    deliverables: copy('概率分布、混淆矩阵、阈值选择备忘录和失败样本表。', 'Probability distributions, a confusion matrix, a threshold memo, and a failure-case table.'),
    resources: [{ kind: 'curriculum', moduleId: 'logistic-regression', label: copy('逻辑回归', 'Logistic Regression') }, { kind: 'curriculum', moduleId: 'classification', label: copy('分类指标与阈值', 'Classification Metrics and Thresholds') }],
    code: `probability = model.predict_proba(X_valid)[:, 1]\nprediction = (probability >= threshold).astype(int)\nassert prediction.shape == y_valid.shape`,
  }),
  createPlannedUnit({
    id: '10-classic-classifiers', order: 10, stageId: 'ml-core',
    title: copy('KNN、朴素贝叶斯与 SVM 的归纳偏置', 'Inductive Biases of KNN, Naive Bayes, and SVM'),
    coreQuestion: copy('同一份数据为什么会让距离、概率和最大间隔方法产生不同边界？', 'Why does the same data produce different boundaries for distance, probability, and maximum-margin methods?'),
    knowledgeAndMethods: copy('KNN 距离与 k；Gaussian/Multinomial Naive Bayes；线性与核 SVM；特征尺度；超参数和计算代价。', 'KNN distance and k; Gaussian/Multinomial Naive Bayes; linear and kernel SVM; feature scaling; hyperparameters and computational cost.'),
    practice: copy('在固定划分上比较 KNN、NB、线性 SVM 和 RBF SVM，绘制边界并分析缩放影响。', 'Compare KNN, NB, linear SVM, and RBF SVM on a fixed split, plot boundaries, and analyze scaling effects.'),
    datasets: copy('Iris、Moons 与短文本子集', 'Iris, Moons, and a short-text subset'), tools: copy('scikit-learn', 'scikit-learn'),
    deliverables: copy('四模型对照表、决策边界图和归纳偏置说明。', 'A four-model comparison, decision-boundary plots, and an inductive-bias note.'),
    resources: [{ kind: 'curriculum', moduleId: 'classification-project', label: copy('分类项目工作流', 'Classification Project Workflow') }],
    code: `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nmodel = make_pipeline(StandardScaler(), SVC(kernel="rbf"))\nmodel.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '11-decision-trees', order: 11, stageId: 'ml-core',
    title: copy('决策树、非线性规则与过拟合', 'Decision Trees, Nonlinear Rules, and Overfitting'),
    coreQuestion: copy('一棵树如何选择切分，又为什么容易记住训练噪声？', 'How does a tree choose splits, and why can it memorize training noise?'),
    knowledgeAndMethods: copy('递归切分；Gini、entropy 与信息增益；深度、叶节点样本数、剪枝；非线性与特征重要性局限。', 'Recursive splitting; Gini, entropy, and information gain; depth, minimum leaf size, pruning; nonlinearity and limits of feature importance.'),
    practice: copy('手算一次候选切分，训练不同深度的树并对照训练/验证曲线和决策路径。', 'Compute one split by hand, train trees at several depths, and compare train/validation curves and decision paths.'),
    datasets: copy('Moons 与 Titanic', 'Moons and Titanic'), tools: copy('scikit-learn、Graphviz 可选', 'scikit-learn, optionally Graphviz'),
    deliverables: copy('切分计算、复杂度曲线、树图和过拟合诊断。', 'A split calculation, complexity curve, tree diagram, and overfitting diagnosis.'),
    resources: [{ kind: 'curriculum', moduleId: 'tree-forest', label: copy('树模型与森林', 'Trees and Forests') }, { kind: 'curriculum', moduleId: 'complexity-regularization', label: copy('复杂度与正则化', 'Complexity and Regularization') }],
    code: `from sklearn.tree import DecisionTreeClassifier\ntree = DecisionTreeClassifier(max_depth=4, min_samples_leaf=12, random_state=42)\ntree.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '12-bagging-random-forests', order: 12, stageId: 'ml-core',
    title: copy('Bagging、随机森林与 Extra Trees', 'Bagging, Random Forests, and Extra Trees'),
    coreQuestion: copy('多个有差异的树为什么能比一棵深树更稳定？', 'Why can a diverse collection of trees be more stable than one deep tree?'),
    knowledgeAndMethods: copy('Bootstrap、方差降低、特征子采样、OOB；随机森林与 Extra Trees；排列重要性；并行与复现。', 'Bootstrap sampling, variance reduction, feature subsampling, OOB; random forests and Extra Trees; permutation importance; parallelism and reproducibility.'),
    practice: copy('比较单树、Bagging、随机森林和 Extra Trees 的验证分数、波动、时间与重要性。', 'Compare a single tree, Bagging, random forest, and Extra Trees on validation score, variance, runtime, and importance.'),
    datasets: copy('Adult Income 或 Porto Seguro 小样本', 'Adult Income or a small Porto Seguro sample'), tools: copy('scikit-learn', 'scikit-learn'),
    deliverables: copy('集成对照表、稳定性图和特征重要性审计。', 'An ensemble comparison table, stability plot, and feature-importance audit.'),
    resources: [{ kind: 'curriculum', moduleId: 'tree-forest', label: copy('随机森林交互讲解', 'Interactive Random Forest Lesson') }],
    code: `from sklearn.ensemble import RandomForestClassifier\nforest = RandomForestClassifier(\n    n_estimators=400, max_features="sqrt", oob_score=True, random_state=42, n_jobs=-1\n)\nforest.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '13-gradient-boosting', order: 13, stageId: 'ml-core',
    title: copy('Gradient Boosting、XGBoost、LightGBM 与 CatBoost', 'Gradient Boosting, XGBoost, LightGBM, and CatBoost'),
    coreQuestion: copy('逐轮拟合残差为什么有效，学习率与树数量如何协同？', 'Why does stage-wise residual fitting work, and how do learning rate and tree count interact?'),
    knowledgeAndMethods: copy('Boosting 加法模型；弱学习器；learning rate、estimators、depth；early stopping；XGBoost、LightGBM、CatBoost 和 sklearn HistGradientBoosting。', 'Boosting as an additive model; weak learners; learning rate, estimators, and depth; early stopping; XGBoost, LightGBM, CatBoost, and sklearn HistGradientBoosting.'),
    practice: copy('用统一划分、指标和预算比较四个 Boosting 实现，记录类别特征、缺失值、速度与性能。', 'Compare four boosting implementations under one split, metric, and budget, recording categorical handling, missing values, speed, and quality.'),
    datasets: copy('House Prices 或 Adult Income', 'House Prices or Adult Income'), tools: copy('scikit-learn、XGBoost、LightGBM、CatBoost', 'scikit-learn, XGBoost, LightGBM, and CatBoost'),
    deliverables: copy('四库实验矩阵、早停曲线和选型说明。', 'A four-library experiment matrix, early-stopping curves, and a model-choice memo.'),
    resources: [{ kind: 'curriculum', moduleId: 'housing-price-project', label: copy('房价回归项目', 'Housing Regression Project') }],
    code: `from sklearn.ensemble import HistGradientBoostingRegressor\nmodel = HistGradientBoostingRegressor(\n    learning_rate=0.05, max_iter=500, early_stopping=True, random_state=42\n)\nmodel.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '14-tabular-pipeline', order: 14, stageId: 'ml-core',
    title: copy('特征工程、Pipeline、交叉验证、调参与解释', 'Feature Engineering, Pipelines, Cross-Validation, Tuning, and Interpretation'),
    coreQuestion: copy('怎样把清洗、特征工程、交叉验证、调参和解释组合成无泄漏系统？', 'How do you combine cleaning, feature engineering, cross-validation, tuning, and explanation into a leakage-safe system?'),
    knowledgeAndMethods: copy('ColumnTransformer、Pipeline；缺失与编码；特征工程；交叉验证与随机搜索；OOF；解释、序列化与推理契约。', 'ColumnTransformer and Pipeline; missingness and encoding; feature engineering; cross-validation and randomized search; OOF; explanation, serialization, and inference contracts.'),
    practice: copy('完成一个表格项目：建立基线、Pipeline、调参、误差分析、模型卡和可复现推理。', 'Complete a tabular project with a baseline, pipeline, tuning, error analysis, model card, and reproducible inference.'),
    datasets: copy('House Prices、Titanic 或 Home Credit 子集', 'House Prices, Titanic, or a Home Credit subset'), tools: copy('pandas、scikit-learn、joblib', 'pandas, scikit-learn, and joblib'),
    deliverables: copy('可运行 Pipeline、OOF 结果、模型卡、README 和预测文件。', 'A runnable pipeline, OOF results, model card, README, and prediction file.'),
    resources: [{ kind: 'curriculum', moduleId: 'housing-price-project', label: copy('房价项目', 'Housing Project') }, { kind: 'curriculum', moduleId: 'classification-project', label: copy('分类项目', 'Classification Project') }],
    code: `pipeline = Pipeline([\n    ("prepare", preprocessor),\n    ("model", estimator),\n])\nscores = cross_validate(pipeline, X, y, cv=folds, scoring=metric)`,
  }),
  createPlannedUnit({
    id: '15-mlp-backpropagation', order: 15, stageId: 'deep-learning-cv-nlp',
    title: copy('MLP、损失函数与反向传播', 'MLPs, Loss Functions, and Backpropagation'),
    coreQuestion: copy('链式法则怎样把输出误差分配到每一层参数？', 'How does the chain rule assign output error to every layer parameter?'),
    knowledgeAndMethods: copy('神经元、层、激活；前向传播；计算图；链式法则与反向传播；初始化、梯度消失/爆炸和梯度校验。', 'Neurons, layers, and activations; forward propagation; computation graphs; chain rule and backpropagation; initialization, vanishing/exploding gradients, and gradient checks.'),
    practice: copy('用 NumPy 实现两层 MLP，对一个参数做数值梯度校验，并诊断一次失败训练。', 'Implement a two-layer MLP in NumPy, numerically check one parameter gradient, and diagnose one failed training run.'),
    datasets: copy('Moons、XOR 或 Fashion-MNIST 小样本', 'Moons, XOR, or a small Fashion-MNIST sample'), tools: copy('NumPy、Matplotlib', 'NumPy and Matplotlib'),
    deliverables: copy('计算图、梯度校验表、训练曲线和诊断记录。', 'A computation graph, gradient-check table, training curves, and diagnosis notes.'),
    resources: [{ kind: 'curriculum', moduleId: 'mlp', label: copy('MLP 交互模块', 'Interactive MLP Module') }, { kind: 'curriculum', moduleId: 'matrix-calculus-autodiff', label: copy('矩阵微积分与自动微分', 'Matrix Calculus and Autodiff') }],
    code: `hidden = np.maximum(0, X @ W1 + b1)\nlogits = hidden @ W2 + b2\nloss = cross_entropy(logits, y)\n# Backward must preserve every parameter shape.`,
  }),
  createPlannedUnit({
    id: '16-pytorch-training-engineering', order: 16, stageId: 'deep-learning-cv-nlp',
    title: copy('Tensor、Dataset、DataLoader 与完整训练闭环', 'Tensors, Datasets, DataLoaders, and a Complete Training Loop'),
    coreQuestion: copy('怎样让训练、验证、保存、恢复和推理成为同一个可复现工程？', 'How do training, validation, saving, resuming, and inference become one reproducible system?'),
    knowledgeAndMethods: copy('Tensor 与 device；Dataset/DataLoader；nn.Module；训练/验证模式；optimizer；checkpoint；seed；混合精度；日志和错误处理。', 'Tensors and devices; Dataset/DataLoader; nn.Module; train/eval modes; optimizers; checkpoints; seeds; mixed precision; logging and error handling.'),
    practice: copy('实现通用训练循环，保存 best/last checkpoint，从中断处恢复，并用独立推理函数复算验证结果。', 'Implement a reusable training loop, save best/last checkpoints, resume after interruption, and reproduce validation with a separate inference function.'),
    datasets: copy('Fashion-MNIST', 'Fashion-MNIST'), tools: copy('PyTorch、TensorBoard 可选', 'PyTorch, optionally TensorBoard'),
    deliverables: copy('训练脚本、配置、checkpoint、曲线、推理脚本和复现说明。', 'A training script, config, checkpoint, curves, inference script, and reproduction notes.'),
    resources: [{ kind: 'curriculum', moduleId: 'optimizer-comparison', label: copy('优化器比较', 'Optimizer Comparison') }, { kind: 'curriculum', moduleId: 'tensor-shapes-vectorization', label: copy('张量 shape', 'Tensor Shapes') }],
    code: `model.train()\nfor features, targets in train_loader:\n    optimizer.zero_grad(set_to_none=True)\n    loss = criterion(model(features.to(device)), targets.to(device))\n    loss.backward()\n    optimizer.step()`,
  }),
  createPlannedUnit({
    id: '17-cnn-image-classification', order: 17, stageId: 'deep-learning-cv-nlp',
    title: copy('CNN、图像分类与数据增强', 'CNNs, Image Classification, and Augmentation'),
    coreQuestion: copy('卷积怎样利用局部连接和共享权重学习空间模式？', 'How does convolution use local connectivity and shared weights to learn spatial patterns?'),
    knowledgeAndMethods: copy('卷积核、stride、padding、pooling、感受野、通道与 shape；增强；归一化；分类指标和混淆矩阵。', 'Kernels, stride, padding, pooling, receptive fields, channels, and shapes; augmentation; normalization; classification metrics and confusion matrices.'),
    practice: copy('训练小型 CNN，追踪每层 shape，对照无增强与有增强结果，并分析混淆类别。', 'Train a small CNN, trace every layer shape, compare with and without augmentation, and analyze confused classes.'),
    datasets: copy('CIFAR-10 或 Intel Image 子集', 'CIFAR-10 or an Intel Image subset'), tools: copy('PyTorch、torchvision', 'PyTorch and torchvision'),
    deliverables: copy('模型结构表、增强对照、训练曲线和混淆矩阵。', 'A model-shape table, augmentation comparison, training curves, and confusion matrix.'),
    resources: [{ kind: 'curriculum', moduleId: 'cnn-visualization', label: copy('CNN 可视化', 'CNN Visualization') }, { kind: 'curriculum', moduleId: 'deep-architecture-math', label: copy('深度结构数学', 'Deep Architecture Mathematics') }],
    code: `model = nn.Sequential(\n    nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(),\n    nn.MaxPool2d(2), nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(),\n)`,
  }),
  createPlannedUnit({
    id: '18-transfer-learning-vit', order: 18, stageId: 'deep-learning-cv-nlp',
    title: copy('迁移学习、现代视觉骨干与 ViT 概览', 'Transfer Learning, Modern Vision Backbones, and a ViT Overview'),
    coreQuestion: copy('何时冻结预训练特征，何时逐步微调，ViT 又改变了什么？', 'When should pretrained features be frozen or progressively fine-tuned, and what changes with a ViT?'),
    knowledgeAndMethods: copy('预训练权重；特征提取与微调；学习率分组；ResNet/EfficientNet；patch embedding、位置编码与 ViT 概览；域偏移。', 'Pretrained weights; feature extraction and fine-tuning; learning-rate groups; ResNet/EfficientNet; patch embeddings, positional encoding, and a ViT overview; domain shift.'),
    practice: copy('用同一小数据集比较从头训练、冻结骨干和逐步解冻，并记录精度、时间和过拟合。', 'Compare training from scratch, a frozen backbone, and progressive unfreezing on one small dataset, recording quality, time, and overfitting.'),
    datasets: copy('Flowers-102 子集或自建小型图像集', 'A Flowers-102 subset or a small custom image set'), tools: copy('PyTorch、torchvision 或 timm', 'PyTorch with torchvision or timm'),
    deliverables: copy('三种策略对照、学习率配置、错误图库和选型说明。', 'A three-strategy comparison, learning-rate config, error gallery, and selection memo.'),
    resources: [{ kind: 'curriculum', moduleId: 'cnn-visualization', label: copy('CNN 表征基础', 'CNN Representation Foundations') }, { kind: 'curriculum', moduleId: 'attention-transformer', label: copy('Attention 与 Transformer', 'Attention and Transformers') }],
    code: `for parameter in model.backbone.parameters():\n    parameter.requires_grad = False\nmodel.head = nn.Linear(model.head.in_features, class_count)`,
  }),
  createPlannedUnit({
    id: '19-detection-segmentation', order: 19, stageId: 'deep-learning-cv-nlp',
    title: copy('目标检测与图像分割任务地图', 'A Task Map for Object Detection and Segmentation'),
    coreQuestion: copy('分类、检测和分割的标签、输出与指标为什么不能互换？', 'Why are labels, outputs, and metrics not interchangeable across classification, detection, and segmentation?'),
    knowledgeAndMethods: copy('边界框、IoU、NMS、mAP；语义/实例分割；U-Net；pixel loss、Dice 与 mask IoU；增强时标签同步。', 'Bounding boxes, IoU, NMS, and mAP; semantic/instance segmentation; U-Net; pixel loss, Dice, and mask IoU; synchronized label augmentation.'),
    practice: copy('手算 IoU 与 Dice，运行检测和分割基线各一份，并建立错误类型图库。', 'Compute IoU and Dice by hand, run one detection and one segmentation baseline, and build an error-type gallery.'),
    datasets: copy('Penn-Fudan、Oxford-IIIT Pet 或 Contrails 小样本', 'Penn-Fudan, Oxford-IIIT Pet, or a small Contrails sample'), tools: copy('PyTorch、torchvision、Albumentations', 'PyTorch, torchvision, and Albumentations'),
    deliverables: copy('任务契约、指标复算、可视化预测和错误分类表。', 'A task contract, recomputed metrics, visual predictions, and an error taxonomy.'),
    code: `intersection = (prediction & target).sum()\nunion = (prediction | target).sum()\niou = intersection / max(union, 1)`,
  }),
  createPlannedUnit({
    id: '20-nlp-tfidf-baseline', order: 20, stageId: 'deep-learning-cv-nlp',
    title: copy('文本表示、TF-IDF 与强基线', 'Text Representation, TF-IDF, and Strong Baselines'),
    coreQuestion: copy('怎样把可变长度文本变成能被线性模型可靠比较的特征？', 'How do you turn variable-length text into features a linear model can compare reliably?'),
    knowledgeAndMethods: copy('清洗边界；token、n-gram、词表；Bag of Words、TF-IDF；稀疏矩阵；逻辑回归/线性 SVM；宏平均指标与错误分析。', 'Cleaning boundaries; tokens, n-grams, vocabularies; bag of words and TF-IDF; sparse matrices; logistic regression/linear SVM; macro metrics and error analysis.'),
    practice: copy('建立多数类、TF-IDF+逻辑回归和字符 n-gram 三个基线，比较词表、速度和长尾类别。', 'Build majority, TF-IDF plus logistic regression, and character n-gram baselines, comparing vocabularies, speed, and tail classes.'),
    datasets: copy('IMDb 子集、SMS Spam 或新闻分类', 'An IMDb subset, SMS Spam, or news classification'), tools: copy('scikit-learn、pandas', 'scikit-learn and pandas'),
    deliverables: copy('文本 Pipeline、词项分析、指标表和误判样本。', 'A text pipeline, term analysis, metric table, and misclassified examples.'),
    resources: [{ kind: 'curriculum', moduleId: 'classification-project', label: copy('分类评价工作流', 'Classification Evaluation Workflow') }],
    code: `text_model = make_pipeline(\n    TfidfVectorizer(ngram_range=(1, 2), min_df=3),\n    LogisticRegression(max_iter=1000),\n)\ntext_model.fit(train_text, train_labels)`,
  }),
  createPlannedUnit({
    id: '21-rnn-lstm-attention-bridge', order: 21, stageId: 'deep-learning-cv-nlp',
    title: copy('RNN、LSTM、双向结构与 Attention 动机', 'RNNs, LSTMs, Bidirectionality, and the Motivation for Attention'),
    coreQuestion: copy('顺序递归怎样保存上下文，又为什么长距离依赖推动了 Attention？', 'How does recurrence preserve context, and why did long-range dependency motivate attention?'),
    knowledgeAndMethods: copy('序列、padding、mask、embedding；RNN 状态；BPTT；梯度问题；LSTM 门；双向结构；从固定状态到动态加权上下文。', 'Sequences, padding, masks, and embeddings; RNN state; BPTT; gradient issues; LSTM gates; bidirectionality; from fixed state to dynamically weighted context.'),
    practice: copy('在短序列任务比较 RNN、LSTM 与双向 LSTM，并可视化长度分桶误差和隐藏状态。', 'Compare RNN, LSTM, and bidirectional LSTM on a short-sequence task, visualizing length-bucket errors and hidden states.'),
    datasets: copy('IMDb 子集或合成序列任务', 'An IMDb subset or a synthetic sequence task'), tools: copy('PyTorch', 'PyTorch'),
    deliverables: copy('shape 表、三模型对照、长度误差图和 Attention 动机说明。', 'A shape table, three-model comparison, length-error plot, and attention motivation note.'),
    resources: [{ kind: 'curriculum', moduleId: 'sequence-embedding-bridge', label: copy('序列与嵌入桥梁', 'Sequence and Embedding Bridge') }],
    code: `packed = pack_padded_sequence(embedded, lengths.cpu(), batch_first=True, enforce_sorted=False)\n_, (hidden, cell) = lstm(packed)\nrepresentation = torch.cat([hidden[-2], hidden[-1]], dim=-1)`,
  }),
  createPlannedUnit({
    id: '22-attention-transformer', order: 22, stageId: 'transformer-llm',
    title: copy('QKV、自注意力、多头机制与 Transformer Block', 'QKV, Self-Attention, Multi-Head Attention, and Transformer Blocks'),
    coreQuestion: copy('每个 token 怎样用 Q、K、V 动态选择上下文？', 'How does each token use Q, K, and V to select context dynamically?'),
    knowledgeAndMethods: copy('Q/K/V、缩放点积注意力、mask、softmax；多头；位置编码；残差、LayerNorm、FFN；复杂度与并行。', 'Q/K/V, scaled dot-product attention, masks, and softmax; multi-head attention; positional encoding; residuals, LayerNorm, FFN; complexity and parallelism.'),
    practice: copy('手算一个三 token 注意力矩阵，用 NumPy 实现 masked attention，并追踪 Block shape。', 'Calculate a three-token attention matrix by hand, implement masked attention in NumPy, and trace Transformer-block shapes.'),
    datasets: copy('合成 token 序列', 'Synthetic token sequences'), tools: copy('NumPy、PyTorch', 'NumPy and PyTorch'),
    deliverables: copy('QKV shape 图、注意力热力图、mask 测试和复杂度说明。', 'A QKV shape diagram, attention heatmap, mask tests, and complexity note.'),
    resources: [{ kind: 'curriculum', moduleId: 'attention-transformer', label: copy('Attention 与 Transformer 实验', 'Attention and Transformer Lab') }],
    code: `scores = (queries @ keys.transpose(-2, -1)) / math.sqrt(head_dim)\nscores = scores.masked_fill(~mask, float("-inf"))\nweights = scores.softmax(dim=-1)\ncontext = weights @ values`,
  }),
  createPlannedUnit({
    id: '23-pretrained-transformers', order: 23, stageId: 'transformer-llm',
    title: copy('BERT、GPT、Encoder-Decoder 与 Hugging Face 工作流', 'BERT, GPT, Encoder–Decoder Models, and the Hugging Face Workflow'),
    coreQuestion: copy('Encoder、Decoder 与 Encoder-Decoder 预训练模型分别适合什么输入输出契约？', 'Which input/output contracts suit encoder, decoder, and encoder–decoder pretrained models?'),
    knowledgeAndMethods: copy('BERT、GPT、T5；tokenizer、special tokens、attention mask；Auto 类；Datasets；Trainer 与自定义循环；模型卡、许可与缓存。', 'BERT, GPT, and T5; tokenizers, special tokens, and attention masks; Auto classes; Datasets; Trainer and custom loops; model cards, licenses, and caching.'),
    practice: copy('为分类和生成各运行一个预训练基线，检查截断、padding、输出解码、速度和模型卡。', 'Run one pretrained baseline each for classification and generation, checking truncation, padding, decoding, speed, and model cards.'),
    datasets: copy('AG News 子集与摘要小样本', 'An AG News subset and a small summarization sample'), tools: copy('Transformers、Datasets、Evaluate', 'Transformers, Datasets, and Evaluate'),
    deliverables: copy('两种任务契约、可复现推理脚本、模型卡摘要和失败样本。', 'Two task contracts, reproducible inference scripts, a model-card summary, and failure cases.'),
    resources: [{ kind: 'curriculum', moduleId: 'attention-transformer', label: copy('Transformer 前置', 'Transformer Prerequisite') }],
    code: `tokens = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")\nwith torch.inference_mode():\n    outputs = model(**tokens)\nassert outputs.logits.shape[0] == len(texts)`,
  }),
  createPlannedUnit({
    id: '24-llm-training-adaptation', order: 24, stageId: 'transformer-llm',
    title: copy('预训练、SFT、LoRA/QLoRA、量化与评估', 'Pretraining, SFT, LoRA/QLoRA, Quantization, and Evaluation'),
    coreQuestion: copy('怎样在算力、数据、质量和风险约束下选择大模型适配方法？', 'How do you choose an LLM adaptation method under compute, data, quality, and risk constraints?'),
    knowledgeAndMethods: copy('预训练目标；指令数据；SFT；LoRA rank/target modules；QLoRA 与量化；数据清洗；自动与人工评估；基线和消融。', 'Pretraining objectives; instruction data; SFT; LoRA rank and target modules; QLoRA and quantization; data cleaning; automated and human evaluation; baselines and ablations.'),
    practice: copy('为一个小型指令任务设计数据 schema、基线、LoRA 配置和评估集，并完成小规模适配或干跑验证。', 'Design a data schema, baseline, LoRA configuration, and evaluation set for a small instruction task, then run a small adaptation or dry-run validation.'),
    datasets: copy('教师审核的短指令数据与固定评估集', 'A teacher-reviewed short instruction dataset and fixed evaluation set'), tools: copy('Transformers、PEFT、TRL、bitsandbytes 可选', 'Transformers, PEFT, TRL, optionally bitsandbytes'),
    deliverables: copy('数据卡、训练配置、显存预算、基线/适配评估和风险记录。', 'A data card, training config, memory budget, baseline/adapted evaluation, and risk log.'),
    resources: [{ kind: 'curriculum', moduleId: 'attention-transformer', label: copy('Transformer 结构复习', 'Transformer Architecture Review') }],
    code: `lora = LoraConfig(\n    r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"],\n    lora_dropout=0.05, task_type="CAUSAL_LM",\n)\nmodel = get_peft_model(model, lora)`,
  }),
  createPlannedUnit({
    id: '25-llm-applications-capstone', order: 25, stageId: 'transformer-llm',
    title: copy('RAG、工具调用、Agent、评估、安全与部署闭环', 'RAG, Tool Use, Agents, Evaluation, Safety, and Deployment'),
    coreQuestion: copy('怎样交付一个有来源、可评测、能安全失败的 LLM 应用？', 'How do you deliver an LLM application that is sourced, evaluable, and safe when it fails?'),
    knowledgeAndMethods: copy('RAG 切块、嵌入、检索与引用；结构化工具调用；Agent 状态与终止；提示注入；质量/延迟/成本评估；监控、回退与部署。', 'RAG chunking, embeddings, retrieval, and citations; structured tool calls; agent state and termination; prompt injection; quality, latency, and cost evaluation; monitoring, fallback, and deployment.'),
    practice: copy('完成一个本地知识助手或数据分析 Agent：建立固定评测集、来源展示、工具 schema、攻击测试与失败回退。', 'Complete a local knowledge assistant or data-analysis agent with a fixed evaluation set, source display, tool schemas, attack tests, and failure fallback.'),
    datasets: copy('课程资料、公开许可文档或自建结构化数据', 'Course materials, openly licensed documents, or a custom structured dataset'), tools: copy('Transformers 或 API、向量检索、结构化日志', 'Transformers or an API, vector retrieval, and structured logging'),
    deliverables: copy('可运行应用、架构图、评测报告、威胁模型、演示和项目答辩。', 'A runnable application, architecture diagram, evaluation report, threat model, demo, and project defense.'),
    resources: [{ kind: 'curriculum', moduleId: 'llm-rag', label: copy('LLM 与 RAG 实验', 'LLM and RAG Lab') }],
    code: `answer = assistant.ask(question)\nassert answer.sources\nassert answer.evaluation is not None\nassert answer.fallback_reason is None or answer.text == SAFE_FALLBACK`,
  }),
]

export const aiFoundationCourse: CourseDefinition = {
  id: 'ai-foundation',
  title: copy('AI 基础参考教材', 'AI Foundations Reference Course'),
  subtitle: copy('从可复现数据分析到可靠 LLM 应用', 'From Reproducible Data Analysis to Reliable LLM Applications'),
  description: copy(
    '以教学大纲的 25 个主题作为覆盖单元，用导学、代码、实验、Notebook、误区与成果自检连接 ML Atlas 现有内容。参考学时用于规划，不限制自学节奏。',
    'Use the syllabus’s 25 topics as coverage units, connecting ML Atlas material through guidance, code, labs, notebooks, misconceptions, and evidence checks. Reference hours guide planning without constraining self-study pace.',
  ),
  totalHours: 50,
  totalUnits: 25,
  stageIds: stages.map((stage) => stage.id),
  stages,
  units,
}
