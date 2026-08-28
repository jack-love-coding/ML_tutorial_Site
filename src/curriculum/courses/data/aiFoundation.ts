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
  const publicationStatus: CoursePublicationStatus = seed.order <= 14 ? 'published' : 'planned'
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
  notebookRefs?: CourseResourceRef[]
  teachingFocus?: LocalizedCopy
  misconception?: LocalizedCopy
  criteria?: LocalizedCopy[]
  checkpoint?: UnitSeed['checkpoint']
  referenceLinks?: string[]
}

function createPlannedUnit(seed: PlannedUnitSeed): CourseUnit {
  return createUnit({
    ...seed,
    difficulty: seed.order < 15 ? 'intermediate' : 'advanced',
    prerequisites: [String(seed.order - 1).padStart(2, '0') + '-' + plannedPrerequisiteSlugs[seed.order - 1]],
    teachingFocus: seed.teachingFocus ?? copy(
      '先定义任务、数据边界和评价协议，再比较方法；所有结论都要能回到可复算的验证证据。',
      'Define the task, data boundary, and evaluation protocol before comparing methods; every claim must trace to reproducible validation evidence.',
    ),
    misconception: seed.misconception ?? copy(
      '更复杂或更新的模型不必然更好；如果划分、指标或基线不一致，分数差异不能支持方法结论。',
      'A newer or more complex model is not automatically better; score differences cannot support a method claim when splits, metrics, or baselines differ.',
    ),
    criteria: seed.criteria ?? [
      copy('能从干净环境复现基线、主要结果和评价指标。', 'Can reproduce the baseline, main result, and metric from a clean environment.'),
      copy('能用实验或数值证据解释至少一个成功条件和一个失败模式。', 'Can explain at least one success condition and one failure mode using experimental or numerical evidence.'),
      copy('成果包含数据边界、验证协议、限制与下一步。', 'The artifact states its data boundary, validation protocol, limitations, and next step.'),
    ],
    checkpoint: seed.checkpoint ?? {
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
    referenceLinks: seed.referenceLinks ?? [],
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
    publicationStatus: 'published',
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
    knowledgeAndMethods: copy(
      `监督学习实验先固定任务单位、标签可用时点和评价对象，再把数据分为 train、validation、test。train 负责拟合，validation 负责选择特征、模型和阈值，test 只在方案锁定后使用一次。随机划分适合近似独立同分布样本；时间、用户或设备相关数据必须按时间或 group 划分。任何从 validation/test 学到的填补值、词表、标准化参数或特征选择都会造成泄漏。交叉验证报告均值与离散程度，不能把每一折当成独立的最终测试。实验卡至少记录数据版本、split ID、随机种子、Pipeline、指标方向、配置和失败说明。`,
      `A supervised experiment first fixes the unit of observation, label-availability time, and evaluation target, then separates train, validation, and test. Train fits parameters; validation selects features, models, and thresholds; test is used once after the policy is frozen. Random splits suit approximately IID rows, while time-, user-, or device-linked data needs temporal or grouped splits. Imputation values, vocabularies, scaling statistics, or feature selection learned from validation/test are leakage. Cross-validation reports center and variation; its folds are not independent final tests. An experiment card records the data version, split IDs, seed, pipeline, metric direction, configuration, and failures.`,
    ),
    practice: copy('为分类和回归各设计一个验证协议，制造一次泄漏并比较虚高分数，最后提交实验卡。', 'Design one classification and one regression protocol, induce one leakage case, compare the inflated score, and submit an experiment card.'),
    datasets: copy('Titanic 与 California Housing 小样本', 'Small Titanic and California Housing samples'), tools: copy('scikit-learn、pandas', 'scikit-learn and pandas'),
    deliverables: copy('数据划分图、指标理由、泄漏对照和实验日志模板。', 'A split diagram, metric rationale, leakage comparison, and experiment-log template.'),
    resources: [
      { kind: 'curriculum', moduleId: 'splits-generalization', lessonId: 'split-contract', label: copy('先写数据划分契约', 'Write the split contract first') },
      { kind: 'curriculum', moduleId: 'splits-generalization', lessonId: 'fit-transform-rule', label: copy('只在训练集 fit', 'Fit preprocessing on train only') },
      { kind: 'curriculum', moduleId: 'model-selection', lessonId: 'pipeline-leakage', label: copy('Pipeline 泄漏检查', 'Pipeline leakage check') },
    ],
    notebookRefs: [
      { kind: 'asset', path: '/notebooks/tabular-regression/california-housing-project.zh-CN.ipynb', label: copy('下载中文表格实验 Notebook', 'Download the Chinese tabular experiment notebook'), download: true },
      { kind: 'asset', path: '/notebooks/tabular-regression/california-housing-project.en.ipynb', label: copy('下载英文表格实验 Notebook', 'Download the English tabular experiment notebook'), download: true },
    ],
    teachingFocus: copy('先画数据边界与信息时间线，再写代码；预处理必须位于 Pipeline 内并在每一折训练部分重新 fit。比较结果同时报告中心、波动和失败折。', 'Draw the data boundary and information timeline before coding; preprocessing stays inside the pipeline and is refit on each training fold. Report center, variation, and failed folds together.'),
    misconception: copy('“删除标签列”不能自动消除泄漏。未来信息、同一实体跨集合、全数据预处理和选择后反复查看 test 都会让分数失真。', 'Dropping the target column does not automatically remove leakage. Future information, the same entity crossing splits, all-data preprocessing, and repeated test inspection all distort scores.'),
    criteria: [copy('实验卡写明任务单位、标签时点、划分理由和一次性 test 规则。', 'The experiment card states the observation unit, label timing, split rationale, and one-time test rule.'), copy('安全 Pipeline 与故意泄漏版本在同一划分和指标下可复算。', 'The safe pipeline and induced-leakage version are reproducible on the same split and metric.'), copy('交叉验证同时报告均值、离散程度和失败折，不只报最高分。', 'Cross-validation reports mean, variation, and failed folds rather than only the best score.')],
    checkpoint: { question: copy('标准化器应该在什么时候计算均值和方差？', 'When should the scaler compute its mean and variance?'), correct: copy('在每一折的训练部分 fit，再只 transform 该折 validation', 'Fit on each fold’s training partition, then only transform that fold’s validation partition'), distractors: [copy('先对全部数据标准化再做交叉验证', 'Scale all rows before cross-validation'), copy('用 test 统计量让部署输入更稳定', 'Use test statistics to stabilize deployment inputs')], feedback: copy('把预处理放入 Pipeline，交叉验证会在每折训练数据上重新 fit，从结构上阻断这类泄漏。', 'Putting preprocessing inside the pipeline refits it on each fold’s training data and structurally blocks this leakage.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/cross_validation.html', 'https://scikit-learn.org/stable/common_pitfalls.html'],
    code: `from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)\nassert set(X_train.index).isdisjoint(X_test.index)`,
  }),
  createPlannedUnit({
    id: '08-linear-regression-optimization', order: 8, stageId: 'ml-core',
    title: copy('线性回归与梯度下降', 'Linear Regression and Gradient Descent'),
    coreQuestion: copy('损失曲面、梯度和学习率怎样共同决定线性模型的训练轨迹？', 'How do the loss surface, gradient, and learning rate jointly determine a linear model’s training trajectory?'),
    knowledgeAndMethods: copy(
      String.raw`线性回归用 $\hat y=Xw+b$ 表示特征的加权和，残差固定为 $r=\hat y-y$，均方误差为 $L=\frac{1}{n}\sum r_i^2$。因此 $\nabla_wL=\frac{2}{n}X^Tr$，更新规则是 $w\leftarrow w-\eta\nabla_wL$。解析最小二乘、批量梯度下降与 sklearn 只有在特征顺序、截距、标准化和正则化设置一致时才能比较。学习率太小表现为缓慢下降，过大表现为震荡或发散；先用中心差分校验梯度，再诊断轨迹。模型结论来自验证/测试残差，不来自训练 loss 最低。`,
      String.raw`Linear regression writes a weighted feature sum as $\hat y=Xw+b$, fixes the residual sign as $r=\hat y-y$, and uses $L=\frac{1}{n}\sum r_i^2$. Thus $\nabla_wL=\frac{2}{n}X^Tr$ and $w\leftarrow w-\eta\nabla_wL$. Least squares, batch gradient descent, and sklearn are comparable only when feature order, intercept, scaling, and regularization agree. A tiny learning rate descends slowly; an oversized one oscillates or diverges. Check the gradient with central differences before diagnosing the trajectory. Model conclusions come from validation/test residuals, not the lowest training loss.`,
    ),
    practice: copy('用 NumPy 实现线性回归梯度下降，与解析解和 sklearn 对照，并解释三种学习率曲线。', 'Implement linear-regression gradient descent in NumPy, compare it with the closed form and sklearn, and explain three learning-rate curves.'),
    datasets: copy('合成直线与 California Housing', 'Synthetic lines and California Housing'), tools: copy('NumPy、scikit-learn、Matplotlib', 'NumPy, scikit-learn, and Matplotlib'),
    deliverables: copy('梯度校验、训练曲线、参数对照与误差分析。', 'A gradient check, training curves, parameter comparison, and error analysis.'),
    resources: [
      { kind: 'curriculum', moduleId: 'linear-regression', lessonId: 'residual-loss', label: copy('残差与损失', 'Residuals and loss') },
      { kind: 'curriculum', moduleId: 'gradient-descent', lessonId: 'gradient-rule', label: copy('梯度更新规则', 'Gradient update rule') },
      { kind: 'curriculum', moduleId: 'gradient-descent', lessonId: 'learning-rate', label: copy('学习率诊断', 'Learning-rate diagnosis') },
      { kind: 'curriculum', moduleId: 'loss-functions', lessonId: 'regression-losses', label: copy('回归损失选择', 'Regression loss choices') },
    ],
    notebookRefs: [
      { kind: 'asset', path: '/linear-regression/phase-27a/bike-linear-regression-course.zh-CN.ipynb', label: copy('下载中文线性回归 Notebook', 'Download the Chinese linear-regression notebook'), download: true },
      { kind: 'asset', path: '/linear-regression/phase-27a/bike-linear-regression-course.en.ipynb', label: copy('下载英文线性回归 Notebook', 'Download the English linear-regression notebook'), download: true },
    ],
    teachingFocus: copy('始终保持 feature order、残差符号和 MSE 分母一致；先校验单步数值，再比较完整训练。训练、验证和最终测试的职责不得混用。', 'Keep feature order, residual sign, and the MSE divisor consistent. Verify one numerical step before comparing full training, and do not mix train, validation, and final-test roles.'),
    misconception: copy('loss 下降只说明优化器在当前目标上移动，不说明模型已经泛化；GD 与 sklearn 参数不同也可能来自预处理、截距或正则化契约不同。', 'A falling loss only shows movement on the current objective; it does not prove generalization. GD and sklearn coefficients may differ because preprocessing, intercept, or regularization contracts differ.'),
    criteria: [copy('中心差分与解析梯度在预先声明的容差内一致。', 'Central differences and analytic gradients agree within a declared tolerance.'), copy('解析解、GD 与 sklearn 使用同一特征顺序、截距和预处理契约。', 'Least squares, GD, and sklearn share one feature order, intercept, and preprocessing contract.'), copy('能用训练曲线区分缓慢、稳定、震荡和发散，并用留出残差说明泛化限制。', 'Can distinguish slow, stable, oscillating, and divergent curves and use held-out residuals to state generalization limits.')],
    checkpoint: { question: copy('梯度下降 loss 稳定下降后，下一条最有价值的证据是什么？', 'After gradient-descent loss falls steadily, what is the most useful next evidence?'), correct: copy('在未参与拟合的样本上复算残差和指标，并与对齐契约的基线比较', 'Recompute residuals and metrics on unseen rows and compare with a contract-aligned baseline'), distractors: [copy('继续训练直到训练 loss 完全为零', 'Keep training until train loss is exactly zero'), copy('只看最后一组权重比第一组更大', 'Only check that final weights are larger than initial weights')], feedback: copy('优化收敛和泛化是两层问题；留出残差与对齐基线把二者分开。', 'Optimization convergence and generalization are separate questions; held-out residuals and an aligned baseline distinguish them.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares'],
    code: `prediction = X @ weights + bias\nerror = prediction - y\ngrad_w = (2 / len(X)) * X.T @ error\nweights -= learning_rate * grad_w`,
  }),
  createPlannedUnit({
    id: '09-logistic-regression-thresholds', order: 9, stageId: 'ml-core',
    title: copy('逻辑回归、交叉熵与分类阈值', 'Logistic Regression, Cross-Entropy, and Thresholds'),
    coreQuestion: copy('概率模型的排序质量和最终决策阈值为什么是两件事？', 'Why are a probabilistic model’s ranking quality and its final decision threshold different concerns?'),
    knowledgeAndMethods: copy(
      String.raw`逻辑回归先计算 score $z=w^Tx+b$，再用 $p=\sigma(z)$ 映射为概率；BCE 惩罚自信但错误的概率。模型输出的概率不会自动成为类别，操作阈值 $t$ 决定 $\hat y=\mathbf{1}[p\ge t]$，因此阈值改变 confusion matrix、precision、recall、F1 和成本，却不改变概率排序与 ROC-AUC。本单元复用 Phase 29 的固定 Banknote validation 概率：FP 成本 1、FN 成本 5 时，validation 选择 $t=0.09$，五个确定性折的选择范围是 0.01–0.50；策略锁定后只汇总一次 test，绝不依据 test 重选阈值。`,
      String.raw`Logistic regression computes a score $z=w^Tx+b$ and maps it to probability with $p=\sigma(z)$; BCE penalizes confident wrong probabilities. A probability does not automatically become a class: the operating threshold $t$ defines $\hat y=\mathbf{1}[p\ge t]$. Changing it alters the confusion matrix, precision, recall, F1, and cost without changing probability ranking or ROC-AUC. This unit reuses Phase 29's frozen Banknote validation probabilities. With FP cost 1 and FN cost 5, validation selects $t=0.09$; five deterministic folds select across 0.01–0.50. After the policy is frozen, test is summarized once and never used for reselection.`,
    ),
    practice: copy('沿用固定 Banknote 概率，绘制 validation 阈值—指标曲线，按 FP/FN 成本锁定阈值，检查折间波动后只汇总一次 test。', 'Reuse frozen Banknote probabilities, plot validation threshold–metric curves, freeze a threshold from FP/FN cost, inspect fold variation, then summarize test once.'),
    datasets: copy('UCI Banknote Authentication 固定划分', 'A fixed UCI Banknote Authentication split'), tools: copy('scikit-learn、NumPy、Matplotlib', 'scikit-learn, NumPy, and Matplotlib'),
    deliverables: copy('概率分布、混淆矩阵、阈值选择备忘录、折间波动和具名 validation 失败样本表。', 'Probability distributions, a confusion matrix, a threshold memo, fold variation, and a table of named validation failures.'),
    resources: [
      { kind: 'curriculum', moduleId: 'logistic-regression', lessonId: 'linear-score', label: copy('Phase 29：分数与 sigmoid', 'Phase 29: score and sigmoid') },
      { kind: 'curriculum', moduleId: 'logistic-regression', lessonId: 'log-loss', label: copy('Phase 29：BCE 与梯度', 'Phase 29: BCE and gradients') },
      { kind: 'curriculum', moduleId: 'classification', lessonId: 'scores', label: copy('Phase 30：固定分数决策链', 'Phase 30: frozen-score decision chain') },
      { kind: 'curriculum', moduleId: 'classification', lessonId: 'costTradeoff', label: copy('Phase 30：成本阈值选择', 'Phase 30: cost-aware threshold selection') },
      { kind: 'curriculum', moduleId: 'classification', lessonId: 'biasCalibration', label: copy('Phase 30：子组与具名错例', 'Phase 30: slices and named errors') },
    ],
    notebookRefs: [
      { kind: 'asset', path: '/logistic-regression/phase-29/banknote-logistic-regression.zh-CN.ipynb', label: copy('下载中文逻辑回归 Notebook', 'Download the Chinese logistic-regression notebook'), download: true },
      { kind: 'asset', path: '/classification/phase-30/notebooks/classification-decisions.zh-CN.ipynb', label: copy('下载中文分类决策 Notebook', 'Download the Chinese classification-decisions notebook'), download: true },
      { kind: 'asset', path: '/classification/phase-30/notebooks/classification-decisions.en.ipynb', label: copy('下载英文分类决策 Notebook', 'Download the English classification-decisions notebook'), download: true },
    ],
    teachingFocus: copy('把 score、probability、threshold、predicted class 和 actual label 逐列分开；所有阈值比较只看 validation，ROC-AUC 只评价排序，锁定 test 面板永不随交互变化。', 'Keep score, probability, threshold, predicted class, and actual label in separate columns. All threshold comparisons use validation; ROC-AUC evaluates ranking only, and the locked-test panel never changes with interaction.'),
    misconception: copy('AUC 高不等于自动得到最佳阈值；在 test 上尝试多个阈值再挑最高结果，会把 test 变成 validation 并夸大泛化表现。', 'High AUC does not automatically provide the best threshold. Trying several test thresholds and keeping the best turns test into validation and inflates generalization evidence.'),
    criteria: [copy('能从固定 validation 行复算任一阈值的 TP、FP、TN、FN 与 precision/recall/F1。', 'Can recompute TP, FP, TN, FN, and precision/recall/F1 at any threshold from frozen validation rows.'), copy('阈值备忘录写明 FP/FN 成本、tie-break、折间波动和选择局限。', 'The threshold memo states FP/FN costs, tie-break, fold variation, and selection limitations.'), copy('test 只出现一次汇总，页面和成果都不包含 test 行级记录或重选。', 'Test appears as one aggregate summary only, with no test-row disclosure or reselection in the page or artifact.')],
    checkpoint: { question: copy('validation 选好阈值后看到 test 漏报偏多，下一步应该怎么做？', 'After validation selects a threshold, test shows more false negatives than hoped. What should happen next?'), correct: copy('保留这次 test 结果作为最终证据；下一轮先定义新假设和新的未使用评估数据', 'Keep this test result as final evidence; a new iteration needs a new hypothesis and untouched evaluation data'), distractors: [copy('继续在同一 test 上降低阈值直到满意', 'Keep lowering the threshold on the same test until satisfied'), copy('只删除 test 中的漏报样本再汇报', 'Delete false negatives from test before reporting')], feedback: copy('一次性 test 的价值来自“未参与选择”；看到结果后再调参会破坏这个边界。', 'The one-time test is valuable because it did not participate in selection; tuning after inspection breaks that boundary.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics'],
    code: `probability = model.predict_proba(X_valid)[:, 1]\nprediction = (probability >= threshold).astype(int)\nassert prediction.shape == y_valid.shape`,
  }),
  createPlannedUnit({
    id: '10-classic-classifiers', order: 10, stageId: 'ml-core',
    title: copy('KNN、朴素贝叶斯与 SVM 的归纳偏置', 'Inductive Biases of KNN, Naive Bayes, and SVM'),
    coreQuestion: copy('同一份数据为什么会让距离、概率和最大间隔方法产生不同边界？', 'Why does the same data produce different boundaries for distance, probability, and maximum-margin methods?'),
    knowledgeAndMethods: copy(
      String.raw`KNN 不拟合显式边界，而是按距离让邻居投票；$k$ 小时容易追随噪声，$k$ 大时边界更平滑。朴素贝叶斯比较 $P(y)\prod_jP(x_j\mid y)$，条件独立假设虽然简化，但在稀疏文本中常是强基线。线性 SVM 最大化间隔，RBF SVM 通过核相似度形成非线性边界。距离和间隔方法对尺度敏感，StandardScaler 必须位于 Pipeline 内；树方法不共享这个需求。公平比较固定 split、metric 和搜索预算，并同时记录 fit/predict 时间、内存、概率需求与失败区域。`,
      String.raw`KNN fits no explicit boundary; neighbors vote by distance. Small $k$ follows noise while large $k$ smooths the boundary. Naive Bayes compares $P(y)\prod_jP(x_j\mid y)$; its conditional-independence assumption is simplifying yet often provides a strong sparse-text baseline. A linear SVM maximizes margin, while an RBF SVM uses kernel similarity for nonlinear boundaries. Distance- and margin-based methods are scale-sensitive, so StandardScaler belongs inside the pipeline; trees do not share that requirement. A fair comparison fixes split, metric, and search budget and records fit/predict time, memory, probability needs, and failure regions.`,
    ),
    practice: copy('在固定划分上比较 KNN、NB、线性 SVM 和 RBF SVM，绘制边界并分析缩放影响。', 'Compare KNN, NB, linear SVM, and RBF SVM on a fixed split, plot boundaries, and analyze scaling effects.'),
    datasets: copy('Iris、Moons 与短文本子集', 'Iris, Moons, and a short-text subset'), tools: copy('scikit-learn', 'scikit-learn'),
    deliverables: copy('四模型对照表、决策边界图和归纳偏置说明。', 'A four-model comparison, decision-boundary plots, and an inductive-bias note.'),
    resources: [
      { kind: 'curriculum', moduleId: 'linear-algebra-distance-similarity', lessonId: 'distance-norm-ruler', label: copy('距离与尺度', 'Distance and scale') },
      { kind: 'curriculum', moduleId: 'beginner-probability-distributions', lessonId: 'beginner-probability-bayes', label: copy('Bayes 规则基础', 'Bayes-rule foundation') },
      { kind: 'curriculum', moduleId: 'classification-project', lessonId: 'pipeline-baseline', label: copy('统一分类 Pipeline', 'Shared classification pipeline') },
      { kind: 'curriculum', moduleId: 'classification-project', lessonId: 'error-review', label: copy('模型错误复盘', 'Model error review') },
    ],
    teachingFocus: copy('方法比较必须解释归纳偏置：KNN 的局部相似、NB 的分布假设、SVM 的间隔与核。缩放只能在训练折 fit，概率输出也不能假定所有分类器原生可比。', 'Explain inductive bias in every comparison: local similarity for KNN, distributional assumptions for NB, and margin/kernel geometry for SVM. Fit scaling on training folds only, and do not assume every classifier emits comparable native probabilities.'),
    misconception: copy('把所有模型套同一超参数网格并不公平；不同方法的容量旋钮、计算成本和概率语义不同。边界图也只是二维教学切片，不代表高维真实决策面。', 'One shared hyperparameter grid is not automatically fair: capacity controls, computational cost, and probability semantics differ by method. A boundary plot is also a two-dimensional teaching slice, not the full high-dimensional decision surface.'),
    criteria: [copy('四个模型使用同一 split、metric、预处理边界和声明的搜索预算。', 'All four models use the same split, metric, preprocessing boundary, and declared search budget.'), copy('对每个模型说明一个归纳偏置、一个适用条件和一个失败模式。', 'States one inductive bias, one suitable condition, and one failure mode for each model.'), copy('对照表同时包含质量、训练/推理成本和是否需要概率校准。', 'The comparison includes quality, train/inference cost, and whether probability calibration is needed.')],
    checkpoint: { question: copy('为什么 KNN 和 RBF SVM 通常需要在 Pipeline 内标准化？', 'Why do KNN and RBF SVM usually need scaling inside the pipeline?'), correct: copy('特征尺度直接改变距离或核相似度；在 Pipeline 内 fit 可避免 validation 泄漏', 'Feature scale directly changes distances or kernel similarity, and fitting inside the pipeline prevents validation leakage'), distractors: [copy('标准化会让所有分类器自动变成线性模型', 'Scaling makes every classifier linear'), copy('因为标准化能保证 validation 分数一定提高', 'Because scaling guarantees a higher validation score')], feedback: copy('尺度是距离几何的一部分；Pipeline 同时固定几何和数据边界。', 'Scale is part of distance geometry; the pipeline fixes both geometry and the data boundary.') },
    referenceLinks: ['https://scikit-learn.org/stable/supervised_learning.html'],
    code: `from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\nmodel = make_pipeline(StandardScaler(), SVC(kernel="rbf"))\nmodel.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '11-decision-trees', order: 11, stageId: 'ml-core',
    title: copy('决策树、非线性规则与过拟合', 'Decision Trees, Nonlinear Rules, and Overfitting'),
    coreQuestion: copy('一棵树如何选择切分，又为什么容易记住训练噪声？', 'How does a tree choose splits, and why can it memorize training noise?'),
    knowledgeAndMethods: copy(
      `决策树在每个节点枚举特征与阈值，用 impurity decrease 选择切分。二分类 Gini 为 $1-p^2-(1-p)^2$；加权子节点 impurity 越低，切分越能分离标签。递归分裂能表达非线性和交互，却也会把小样本噪声记成规则。max_depth、min_samples_leaf 与 cost-complexity pruning 控制容量；应画 train/validation 曲线而不是凭树图挑深度。单棵树的 impurity importance 偏爱高基数或多候选切分特征，解释时要结合 permutation importance、决策路径和失败样本。`,
      `A decision tree enumerates features and thresholds at each node and chooses an impurity decrease. Binary Gini is $1-p^2-(1-p)^2$; lower weighted child impurity means stronger label separation. Recursive splits express nonlinearities and interactions but can memorize small-sample noise. max_depth, min_samples_leaf, and cost-complexity pruning control capacity; choose them from train/validation curves rather than the appearance of a tree diagram. A single tree's impurity importance favors high-cardinality features or those with many candidate splits, so interpretation needs permutation importance, decision paths, and failure examples.`,
    ),
    practice: copy('手算一次候选切分，训练不同深度的树并对照训练/验证曲线和决策路径。', 'Compute one split by hand, train trees at several depths, and compare train/validation curves and decision paths.'),
    datasets: copy('Moons 与 Titanic', 'Moons and Titanic'), tools: copy('scikit-learn、Graphviz 可选', 'scikit-learn, optionally Graphviz'),
    deliverables: copy('切分计算、复杂度曲线、树图和过拟合诊断。', 'A split calculation, complexity curve, tree diagram, and overfitting diagnosis.'),
    resources: [
      { kind: 'curriculum', moduleId: 'tree-forest', lessonId: 'split-criteria', label: copy('切分准则手算', 'Compute split criteria') },
      { kind: 'curriculum', moduleId: 'tree-forest', lessonId: 'depth-overfitting', label: copy('深度与过拟合', 'Depth and overfitting') },
      { kind: 'curriculum', moduleId: 'tree-forest', lessonId: 'feature-importance', label: copy('重要性解释边界', 'Feature-importance limits') },
      { kind: 'curriculum', moduleId: 'complexity-regularization', lessonId: 'overfit-underfit-curves', label: copy('训练/验证复杂度曲线', 'Train/validation complexity curves') },
    ],
    teachingFocus: copy('先手算一个节点的候选切分，再让库训练完整树；容量选择只看训练/验证证据。每条解释都应能落到具体决策路径和样本，而不是把重要性当因果。', 'Compute one candidate split by hand before fitting a full library tree. Select capacity from train/validation evidence, and ground explanations in decision paths and examples rather than treating importance as causal.'),
    misconception: copy('一棵树可视化清楚，不代表它稳定或真实揭示数据生成机制。相近样本、随机扰动或新的时间段都可能改变上层切分。', 'A readable tree is not necessarily stable and does not reveal the data-generating mechanism. Nearby samples, random perturbations, or a new period can change upper-level splits.'),
    criteria: [copy('能复算至少两个候选切分的父/子 impurity 和加权下降。', 'Can recompute parent/child impurity and weighted decrease for at least two candidate splits.'), copy('深度或叶节点曲线同时显示 train 与 validation，并据此选择容量。', 'A depth or leaf-size curve shows both train and validation and supports the capacity choice.'), copy('解释包含一条真实决策路径、一个错例和对 feature importance 的限制说明。', 'Interpretation includes one actual decision path, one error, and a limitation of feature importance.')],
    checkpoint: { question: copy('深树训练分数继续上升、validation 分数开始下降，最合理的解释是什么？', 'A deeper tree keeps improving train score while validation declines. What is the best explanation?'), correct: copy('树开始用更细的叶节点记忆训练噪声，方差上升', 'The tree is using finer leaves to memorize training noise, increasing variance'), distractors: [copy('说明 Gini 公式计算错误', 'The Gini formula must be wrong'), copy('说明 validation 应该并入训练集', 'Validation should be merged into training')], feedback: copy('训练/验证分叉是容量过高的直接诊断；剪枝或更大叶节点可以控制方差。', 'Diverging train and validation curves directly diagnose excess capacity; pruning or larger leaves can control variance.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/tree.html'],
    code: `from sklearn.tree import DecisionTreeClassifier\ntree = DecisionTreeClassifier(max_depth=4, min_samples_leaf=12, random_state=42)\ntree.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '12-bagging-random-forests', order: 12, stageId: 'ml-core',
    title: copy('Bagging、随机森林与 Extra Trees', 'Bagging, Random Forests, and Extra Trees'),
    coreQuestion: copy('多个有差异的树为什么能比一棵深树更稳定？', 'Why can a diverse collection of trees be more stable than one deep tree?'),
    knowledgeAndMethods: copy(
      `Bagging 对训练集做 bootstrap，训练多棵高方差树并平均预测；只要树的错误不完全相关，平均就能降低方差。随机森林再对每个节点随机抽取候选特征，主动降低树间相关性；Extra Trees 进一步随机化切分阈值，通常用更多偏差换更低方差和速度。OOB 样本可提供训练期内部诊断，但不能替代最终留出集。比较单树、Bagging、Random Forest、Extra Trees 时固定折与预算，报告折间波动、训练/推理耗时、OOB 与 validation 的差异。排列重要性必须在未参与拟合的数据上计算，并检查相关特征分摊重要性的现象。`,
      `Bagging bootstraps the training rows, fits many high-variance trees, and averages predictions. When tree errors are not perfectly correlated, averaging reduces variance. Random forests also sample candidate features at each node to reduce correlation; Extra Trees further randomizes split thresholds, often trading extra bias for lower variance and speed. Out-of-bag rows provide an internal training-time diagnostic but do not replace a final holdout. Compare a single tree, Bagging, Random Forest, and Extra Trees on fixed folds and budget, reporting fold variation, train/inference time, and OOB-versus-validation differences. Compute permutation importance on unseen data and inspect how correlated features share importance.`,
    ),
    practice: copy('比较单树、Bagging、随机森林和 Extra Trees 的验证分数、波动、时间与重要性。', 'Compare a single tree, Bagging, random forest, and Extra Trees on validation score, variance, runtime, and importance.'),
    datasets: copy('Adult Income 或 Porto Seguro 小样本', 'Adult Income or a small Porto Seguro sample'), tools: copy('scikit-learn', 'scikit-learn'),
    deliverables: copy('集成对照表、稳定性图和特征重要性审计。', 'An ensemble comparison table, stability plot, and feature-importance audit.'),
    resources: [
      { kind: 'curriculum', moduleId: 'tree-forest', lessonId: 'random-forest', label: copy('随机森林机制', 'Random-forest mechanism') },
      { kind: 'curriculum', moduleId: 'tree-forest', lessonId: 'feature-importance', label: copy('重要性与稳定性', 'Importance and stability') },
      { kind: 'curriculum', moduleId: 'model-selection', lessonId: 'cross-validation', label: copy('折间波动', 'Fold variation') },
    ],
    teachingFocus: copy('每次只改变一个集成机制：先 bootstrap，再 feature subsampling，再随机阈值。比较应同时看中心分数、折间波动、耗时和重要性稳定性。', 'Change one ensemble mechanism at a time: bootstrap, then feature subsampling, then randomized thresholds. Compare center score, fold variation, runtime, and importance stability together.'),
    misconception: copy('树越多只会让当前集成估计趋于稳定，不会自动修复泄漏、错误标签、分布偏移或系统性偏差；OOB 也不是额外的秘密 test。', 'More trees only stabilize the current ensemble estimate; they do not repair leakage, bad labels, distribution shift, or systematic bias. OOB is not a secret extra test set.'),
    criteria: [copy('单树、Bagging、随机森林和 Extra Trees 在同一 folds 与预算下完成对照。', 'Single tree, Bagging, Random Forest, and Extra Trees are compared on identical folds and budget.'), copy('报告均值、标准差、fit/predict 时间，并解释树间差异怎样影响方差。', 'Reports mean, standard deviation, fit/predict time, and explains how tree diversity affects variance.'), copy('至少用 validation permutation importance 复核一次 impurity importance，并记录相关特征限制。', 'Checks impurity importance once with validation permutation importance and records the correlated-feature limitation.')],
    checkpoint: { question: copy('随机森林为什么通常比一棵完全生长的树稳定？', 'Why is a random forest often more stable than one fully grown tree?'), correct: copy('Bootstrap 与特征子采样制造不完全相关的树，平均后降低方差', 'Bootstrap and feature subsampling create imperfectly correlated trees whose average has lower variance'), distractors: [copy('每棵树都使用完全相同的数据和特征', 'Every tree uses exactly the same rows and features'), copy('因为森林保证消除所有偏差', 'Because a forest guarantees removal of all bias')], feedback: copy('关键不是“树多”，而是“有差异的误差被平均”；高度相关的树带来的方差降低有限。', 'The key is not merely many trees but averaging diverse errors; highly correlated trees provide limited variance reduction.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/ensemble.html#forest'],
    code: `from sklearn.ensemble import RandomForestClassifier\nforest = RandomForestClassifier(\n    n_estimators=400, max_features="sqrt", oob_score=True, random_state=42, n_jobs=-1\n)\nforest.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '13-gradient-boosting', order: 13, stageId: 'ml-core',
    title: copy('Gradient Boosting、XGBoost、LightGBM 与 CatBoost', 'Gradient Boosting, XGBoost, LightGBM, and CatBoost'),
    coreQuestion: copy('逐轮拟合残差为什么有效，学习率与树数量如何协同？', 'Why does stage-wise residual fitting work, and how do learning rate and tree count interact?'),
    knowledgeAndMethods: copy(
      String.raw`Gradient Boosting 构造加法模型 $F_m(x)=F_{m-1}(x)+\eta h_m(x)$，每一轮让浅树拟合当前损失的负梯度，而不是并行平均独立树。learning rate、树数与叶子复杂度共同决定容量：更小的 $\eta$ 通常需要更多轮。early stopping 只能观察 validation，不能观察 test。sklearn HistGradientBoosting 提供稳定基线；XGBoost、LightGBM、CatBoost 在正则化、直方图、叶生长、类别特征与缺失值处理上各有契约。四库比较必须固定数据划分、指标、线程/时间预算和类别特征策略；原生类别支持与 one-hot 不能被当成同一输入。`,
      String.raw`Gradient Boosting builds an additive model $F_m(x)=F_{m-1}(x)+\eta h_m(x)$, with each shallow tree fitting the current loss's negative gradient rather than averaging independent trees in parallel. Learning rate, tree count, and leaf complexity jointly determine capacity; smaller $\eta$ usually needs more rounds. Early stopping may observe validation, never test. sklearn HistGradientBoosting provides a stable baseline, while XGBoost, LightGBM, and CatBoost differ in regularization, histograms, leaf growth, categorical features, and missing-value contracts. A four-library comparison fixes split, metric, thread/time budget, and categorical strategy; native categories and one-hot inputs are not the same experiment.`,
    ),
    practice: copy('用统一划分、指标和预算比较四个 Boosting 实现，记录类别特征、缺失值、速度与性能。', 'Compare four boosting implementations under one split, metric, and budget, recording categorical handling, missing values, speed, and quality.'),
    datasets: copy('House Prices 或 Adult Income', 'House Prices or Adult Income'), tools: copy('scikit-learn、XGBoost、LightGBM、CatBoost', 'scikit-learn, XGBoost, LightGBM, and CatBoost'),
    deliverables: copy('四库实验矩阵、早停曲线和选型说明。', 'A four-library experiment matrix, early-stopping curves, and a model-choice memo.'),
    resources: [
      { kind: 'curriculum', moduleId: 'housing-price-project', lessonId: 'cleaning-splits', label: copy('表格数据与划分边界', 'Tabular data and split boundary') },
      { kind: 'curriculum', moduleId: 'housing-price-project', lessonId: 'evaluation', label: copy('固定评价与错误样本', 'Frozen evaluation and error examples') },
      { kind: 'curriculum', moduleId: 'tree-forest', lessonId: 'depth-overfitting', label: copy('树容量前置', 'Tree-capacity prerequisite') },
      { kind: 'curriculum', moduleId: 'model-selection', lessonId: 'final-refit', label: copy('选择后重训与 test 边界', 'Post-selection refit and test boundary') },
    ],
    notebookRefs: [
      { kind: 'asset', path: '/notebooks/tabular-regression/california-housing-project.zh-CN.ipynb', label: copy('下载中文表格基线 Notebook', 'Download the Chinese tabular-baseline notebook'), download: true },
      { kind: 'asset', path: '/notebooks/tabular-regression/california-housing-project.en.ipynb', label: copy('下载英文表格基线 Notebook', 'Download the English tabular-baseline notebook'), download: true },
    ],
    teachingFocus: copy('先用 sklearn HistGradientBoosting 建立可复现下界，再在完全相同的 folds、指标和预算下接入三种外部库。保存 best_iteration、validation 曲线和实际耗时。', 'Establish a reproducible lower bound with sklearn HistGradientBoosting, then add the three external libraries under identical folds, metric, and budget. Save best_iteration, validation curves, and wall-clock time.'),
    misconception: copy('四个库的默认值、类别处理、缺失值方向和 early-stopping 语义不同；直接运行默认配置并比较单个最高分，不能说明算法优劣。', 'The four libraries differ in defaults, categorical handling, missing-value direction, and early-stopping semantics. Comparing one best default score does not establish algorithm superiority.'),
    criteria: [copy('四库实验矩阵明确记录版本、输入编码、folds、metric、种子、线程和时间预算。', 'The four-library matrix records versions, input encoding, folds, metric, seed, threads, and time budget.'), copy('每个模型保存 validation 曲线、best iteration、均值/波动和实际耗时。', 'Each model saves its validation curve, best iteration, mean/variation, and elapsed time.'), copy('选型说明分别讨论质量、速度、缺失值/类别支持、部署体积与失败样本。', 'The choice memo separately discusses quality, speed, missing/categorical support, deployment size, and failure examples.')],
    checkpoint: { question: copy('为什么不能让 early stopping 直接观察最终 test？', 'Why must early stopping not observe the final test set?'), correct: copy('停止轮数本身是模型选择；观察 test 会把最终评估信息反馈进训练', 'The stopping round is a model-selection decision, so observing test feeds final-evaluation information into training'), distractors: [copy('因为 test 数据永远不能计算 loss', 'Because loss can never be computed on test data'), copy('因为 early stopping 只适用于随机森林', 'Because early stopping only applies to random forests')], feedback: copy('任何依据某集合做出的配置决定都会消耗该集合的评估独立性。', 'Any configuration decision based on a dataset consumes that dataset’s evaluation independence.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/ensemble.html#histogram-based-gradient-boosting'],
    code: `from sklearn.ensemble import HistGradientBoostingRegressor\nmodel = HistGradientBoostingRegressor(\n    learning_rate=0.05, max_iter=500, early_stopping=True, random_state=42\n)\nmodel.fit(X_train, y_train)`,
  }),
  createPlannedUnit({
    id: '14-tabular-pipeline', order: 14, stageId: 'ml-core',
    title: copy('特征工程、Pipeline、交叉验证、调参与解释', 'Feature Engineering, Pipelines, Cross-Validation, Tuning, and Interpretation'),
    coreQuestion: copy('怎样把清洗、特征工程、交叉验证、调参和解释组合成无泄漏系统？', 'How do you combine cleaning, feature engineering, cross-validation, tuning, and explanation into a leakage-safe system?'),
    knowledgeAndMethods: copy(
      `端到端表格系统把 schema 检查、数值/类别预处理、模型和输出契约封装为一个 Pipeline。ColumnTransformer 让 imputer、scaler、encoder 只在训练折 fit；交叉验证或 RandomizedSearchCV 必须包住整条 Pipeline。OOF 预测为每个训练样本提供一次“未由该样本参与拟合”的预测，可用于误差分析和融合，但不能代替真正 test。特征工程先写可用时点与推理可得性，禁止用未来聚合或目标统计穿越边界。选择后在 train+validation 重训一次，再对锁定 test 评估；同时保存模型、schema、版本、输入样例、指标、错误切片和回退说明。`,
      `An end-to-end tabular system packages schema checks, numeric/categorical preprocessing, the estimator, and the output contract into one pipeline. ColumnTransformer keeps imputers, scalers, and encoders fitted on training folds only; cross-validation or RandomizedSearchCV must wrap the entire pipeline. OOF predictions give every training row one prediction from a model that did not fit that row, which supports error analysis and blending but does not replace a true test set. Feature engineering records availability time and inference feasibility, forbidding future aggregates or target statistics across boundaries. After selection, refit once on train plus validation and evaluate the locked test. Save the model, schema, versions, input example, metrics, error slices, and fallback notes.`,
    ),
    practice: copy('完成一个表格项目：建立基线、Pipeline、调参、误差分析、模型卡和可复现推理。', 'Complete a tabular project with a baseline, pipeline, tuning, error analysis, model card, and reproducible inference.'),
    datasets: copy('House Prices、Titanic 或 Home Credit 子集', 'House Prices, Titanic, or a Home Credit subset'), tools: copy('pandas、scikit-learn、joblib', 'pandas, scikit-learn, and joblib'),
    deliverables: copy('可运行 Pipeline、OOF 结果、模型卡、README 和预测文件。', 'A runnable pipeline, OOF results, model card, README, and prediction file.'),
    resources: [
      { kind: 'curriculum', moduleId: 'housing-price-project', lessonId: 'csv-to-frame', label: copy('项目数据契约', 'Project data contract') },
      { kind: 'curriculum', moduleId: 'housing-price-project', lessonId: 'review-next-iteration', label: copy('回归项目复盘', 'Regression project review') },
      { kind: 'curriculum', moduleId: 'classification-project', lessonId: 'pipeline-baseline', label: copy('分类 Pipeline 基线', 'Classification pipeline baseline') },
      { kind: 'curriculum', moduleId: 'classification-project', lessonId: 'error-review', label: copy('分类错误复盘', 'Classification error review') },
      { kind: 'curriculum', moduleId: 'model-selection', lessonId: 'grid-search', label: copy('调参与 Pipeline 边界', 'Search and pipeline boundary') },
    ],
    notebookRefs: [
      { kind: 'asset', path: '/notebooks/tabular-regression/california-housing-project.zh-CN.ipynb', label: copy('下载中文结业 Pipeline Notebook', 'Download the Chinese capstone pipeline notebook'), download: true },
      { kind: 'asset', path: '/notebooks/tabular-regression/california-housing-project.en.ipynb', label: copy('下载英文结业 Pipeline Notebook', 'Download the English capstone pipeline notebook'), download: true },
    ],
    teachingFocus: copy('先冻结 schema、split 与 metric，再把所有可学习预处理放入 Pipeline。成果必须能在干净环境 load 后对一条原始输入推理，并对缺列、未知类别和非法数值安全失败。', 'Freeze schema, split, and metric first, then put every learned preprocessing step inside the pipeline. A clean environment must load the artifact and infer on one raw row, failing safely on missing columns, unknown categories, and invalid numbers.'),
    misconception: copy('“交叉验证分数很高”不是可交付系统。若预处理在 Pipeline 外、OOF 行错位、特征部署时不可得或序列化后 schema 漂移，离线分数不能支持上线。', 'A high cross-validation score is not a deliverable system. If preprocessing sits outside the pipeline, OOF rows are misaligned, features are unavailable at inference, or serialization drifts from the schema, offline scores do not support deployment.'),
    criteria: [copy('从原始表到预测的完整 Pipeline 可在干净环境重载并复现固定样例。', 'The full raw-table-to-prediction pipeline reloads in a clean environment and reproduces a fixed example.'), copy('OOF 行与原始 ID 一一对应，调参只使用训练/验证证据，test 只评估一次。', 'OOF rows align one-to-one with source IDs; tuning uses train/validation evidence and test is evaluated once.'), copy('模型卡包含 schema、数据边界、指标、错误切片、依赖版本、限制和安全失败行为。', 'The model card contains schema, data boundary, metrics, error slices, dependency versions, limitations, and safe-failure behavior.')],
    checkpoint: { question: copy('为什么 cross_validate 应该接收整条 Pipeline，而不是预处理后的全数据矩阵？', 'Why should cross_validate receive the whole pipeline rather than a matrix preprocessed on all rows?'), correct: copy('这样每一折的 imputer、encoder 和 scaler 只从该折训练部分学习', 'So each fold’s imputer, encoder, and scaler learn only from that fold’s training partition'), distractors: [copy('这样模型一定比所有单算法更准确', 'So the model is guaranteed to beat every standalone algorithm'), copy('这样可以让 test 参与选择但不显示出来', 'So test may participate in selection without being shown')], feedback: copy('Pipeline 不只是代码整洁，它把可学习转换的 fit 边界交给交叉验证正确管理。', 'A pipeline is not merely code organization; it lets cross-validation manage the fit boundary of every learned transform.') },
    referenceLinks: ['https://scikit-learn.org/stable/modules/compose.html', 'https://scikit-learn.org/stable/modules/generated/sklearn.pipeline.Pipeline.html'],
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
