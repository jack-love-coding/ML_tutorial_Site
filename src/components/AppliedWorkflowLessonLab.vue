<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OptimizerCurveDiagnosisChallengeLab from './OptimizerCurveDiagnosisChallengeLab.vue'
import SequenceBridgeShapeLab from './SequenceBridgeShapeLab.vue'
import type { AppLocale, ModuleSlug, StorySection } from '../types/ml'

const props = defineProps<{
  moduleSlug: ModuleSlug
  section: StorySection
}>()

const { locale } = useI18n()
const selectedCell = ref('question')
const selectedStage = ref('csv')
const selectedClassificationStage = ref('text')
const selectedModelSelectionStage = ref('split')
const selectedTreeForestStage = ref('tree')
const selectedCnnStage = ref('volume')
const selectedAttentionStage = ref('token')
const selectedOptimizerStage = ref('loop')
const selectedRagStage = ref('token')

function loc<T>(zhCN: T, en: T) {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

const activeWorkflow = computed(() => {
  if (props.moduleSlug === 'housing-price-project') return 'housing'
  if (props.moduleSlug === 'classification-project') return 'classification'
  if (props.moduleSlug === 'model-selection') return 'model-selection'
  if (props.moduleSlug === 'tree-forest') return 'tree-forest'
  if (props.moduleSlug === 'cnn-visualization') return 'cnn'
  if (props.moduleSlug === 'sequence-embedding-bridge') return 'sequence-bridge'
  if (props.moduleSlug === 'attention-transformer') return 'attention'
  if (props.moduleSlug === 'optimizer-comparison') return 'optimizer'
  if (props.moduleSlug === 'llm-rag') return 'rag'
  return 'python'
})

const notebookCells = computed(() =>
  localized(
    loc(
      [
        { id: 'question', label: '问题', title: '这个 cell 要回答什么？', body: '先写一句话，再写代码。没有问题的 cell 很容易变成无意义试跑。' },
        { id: 'numpy', label: 'NumPy', title: '数组和 shape', body: '用 np.array、reshape 和 mean 把向量、矩阵、MSE 变成可运行代码。' },
        { id: 'pandas', label: 'pandas', title: '表格和列名', body: '用 DataFrame、read_csv、head、describe、isna 把 CSV 看成建模材料。' },
        { id: 'split', label: 'split', title: '训练和测试分开', body: 'train_test_split 先发生，后面的 fit 只允许看训练数据。' },
        { id: 'model', label: 'sklearn', title: 'fit、predict、metric', body: 'LinearRegression 负责拟合，mean_absolute_error 负责把错误翻译成业务单位。' },
      ],
      [
        { id: 'question', label: 'Question', title: 'What does this cell answer?', body: 'Write one sentence before code. A cell without a question often becomes a random trial.' },
        { id: 'numpy', label: 'NumPy', title: 'Array and shape', body: 'Use np.array, reshape, and mean to make vectors, matrices, and MSE runnable.' },
        { id: 'pandas', label: 'pandas', title: 'Table and columns', body: 'Use DataFrame, read_csv, head, describe, and isna to read CSV as modeling material.' },
        { id: 'split', label: 'split', title: 'Separate train and test', body: 'train_test_split happens first; later fit should only see training data.' },
        { id: 'model', label: 'sklearn', title: 'fit, predict, metric', body: 'LinearRegression fits, and mean_absolute_error translates errors into business units.' },
      ],
    ),
  ),
)

const housingStages = computed(() =>
  localized(
    loc(
      [
        { id: 'csv', label: 'CSV', title: '读入文件', body: '确认行数、列名、目标列，以及每一行代表什么样本。' },
        { id: 'eda', label: 'EDA', title: '先看数据', body: '看 describe、缺失值、目标分布、收入和房价的关系。' },
        { id: 'clean', label: '清洗', title: '先切分再学习规则', body: '训练集 fit_transform，测试集只 transform，避免数据泄漏。' },
        { id: 'linear', label: '线性回归', title: '建立 baseline', body: '用 Pipeline 绑定预处理和 LinearRegression，先得到诚实基线。' },
        { id: 'eval', label: '评估', title: '看 MAE、R² 和错误样本', body: '一个分数不够，必须检查最大误差和系统性偏差。' },
        { id: 'review', label: '复盘', title: '推出下一轮实验', body: '把下一步分成数据、预处理、模型和评估，不要一次全改。' },
      ],
      [
        { id: 'csv', label: 'CSV', title: 'Read the file', body: 'Check rows, columns, target, and what each row represents.' },
        { id: 'eda', label: 'EDA', title: 'Inspect before modeling', body: 'Read describe, missing values, target distribution, and income-value relation.' },
        { id: 'clean', label: 'Cleaning', title: 'Split before learning rules', body: 'Training uses fit_transform; test only uses transform to avoid leakage.' },
        { id: 'linear', label: 'Linear', title: 'Build a baseline', body: 'Use Pipeline to bind preprocessing and LinearRegression into an honest baseline.' },
        { id: 'eval', label: 'Evaluate', title: 'Read MAE, R², and errors', body: 'One score is not enough. Inspect largest errors and systematic bias.' },
        { id: 'review', label: 'Review', title: 'Choose the next experiment', body: 'Separate next changes into data, preprocessing, model, and evaluation.' },
      ],
    ),
  ),
)

const classificationStages = computed(() =>
  localized(
    loc(
      [
        { id: 'text', label: '文本', title: '定义正类和错误成本', body: '先明确 spam 是正类，false positive 和 false negative 分别会造成什么后果。' },
        { id: 'vector', label: '向量', title: '把文本变成 sparse features', body: '用 token、词表和 TF-IDF 把邮件文本变成模型能读的数值矩阵。' },
        { id: 'pipeline', label: 'Pipeline', title: '向量化和分类器绑在一起', body: 'train_test_split 先发生，TfidfVectorizer 和 LogisticRegression 都在 Pipeline 内部 fit。' },
        { id: 'score', label: 'score', title: '先读概率，再做决策', body: 'predict_proba 给出正类分数，阈值把同一批分数改写成 spam 或 ham。' },
        { id: 'metric', label: '指标', title: 'precision / recall / AUC', body: '混淆矩阵解释错误类型，precision 和 recall 连接业务成本。' },
        { id: 'review', label: '复盘', title: '检查误拦和漏拦样本', body: '把 false positives 和 false negatives 拆开看，再决定下一轮改阈值、特征还是模型。' },
      ],
      [
        { id: 'text', label: 'Text', title: 'Define positive class and costs', body: 'Name spam as the positive class and state the cost of false positives and false negatives.' },
        { id: 'vector', label: 'Vector', title: 'Turn text into sparse features', body: 'Use tokens, vocabulary, and TF-IDF to turn email text into a numeric matrix.' },
        { id: 'pipeline', label: 'Pipeline', title: 'Bind vectorizer and classifier', body: 'train_test_split happens first; TfidfVectorizer and LogisticRegression fit inside the Pipeline.' },
        { id: 'score', label: 'Score', title: 'Read probability before decision', body: 'predict_proba gives positive-class scores, and the threshold rewrites the same scores as spam or ham.' },
        { id: 'metric', label: 'Metrics', title: 'precision / recall / AUC', body: 'The confusion matrix explains error types, while precision and recall connect to business cost.' },
        { id: 'review', label: 'Review', title: 'Inspect blocked and missed examples', body: 'Separate false positives and false negatives, then decide whether to adjust threshold, features, or model.' },
      ],
    ),
  ),
)

const modelSelectionStages = computed(() =>
  localized(
    loc(
      [
        { id: 'split', label: 'split', title: '一次切分会有运气', body: '同一模型换 random_state，验证样本变了，MAE 或 accuracy 也可能跟着变。' },
        { id: 'valid', label: 'valid', title: 'validation 用来做选择', body: '训练集学参数，validation 比较方案，test 最后只打开一次。' },
        { id: 'cv', label: 'CV', title: 'K-fold 看平均和稳定性', body: '每一折轮流做验证，最后同时读 mean 和 std。' },
        { id: 'leak', label: 'leak', title: '预处理不能提前看验证折', body: 'StandardScaler、PCA、特征选择都应在 Pipeline 内部按折 fit。' },
        { id: 'grid', label: 'grid', title: 'GridSearchCV 搜候选参数', body: 'param_grid 定义候选，mean_test_score 排名，best_params_ 记录选择。' },
        { id: 'final', label: 'final', title: '选完后才做最终测试', body: '用 best_estimator_ 在 test set 上评估一次，再写复盘和下一轮计划。' },
      ],
      [
        { id: 'split', label: 'split', title: 'One split contains luck', body: 'Change random_state and the validation examples change, so MAE or accuracy can move too.' },
        { id: 'valid', label: 'valid', title: 'Validation is for choices', body: 'Training learns parameters, validation compares plans, and test opens once at the end.' },
        { id: 'cv', label: 'CV', title: 'K-fold shows average and stability', body: 'Each fold validates in turn, then you read both mean and std.' },
        { id: 'leak', label: 'leak', title: 'Preprocessing must not see validation early', body: 'StandardScaler, PCA, and feature selection should fit fold-by-fold inside Pipeline.' },
        { id: 'grid', label: 'grid', title: 'GridSearchCV searches candidates', body: 'param_grid defines candidates, mean_test_score ranks them, and best_params_ records the choice.' },
        { id: 'final', label: 'final', title: 'Final test comes after selection', body: 'Evaluate best_estimator_ on the test set once, then write review and next experiment.' },
      ],
    ),
  ),
)

const treeForestStages = computed(() =>
  localized(
    loc(
      [
        { id: 'tree', label: 'tree', title: 'if-then split 规则', body: '树不是沿梯度走，而是反复问一个特征是否小于某个阈值。' },
        { id: 'split', label: 'split', title: '二维平面切成矩形', body: '每一刀沿一个特征轴切开，最后形成分段矩形预测区域。' },
        { id: 'criterion', label: 'criterion', title: 'Gini / entropy / MSE', body: '分类 split 追求更纯的子节点，回归 split 追求更低的节点内误差。' },
        { id: 'depth', label: 'depth', title: '树深度控制复杂度', body: '浅树可能欠拟合，深树可能把噪声切成很多小叶子。' },
        { id: 'forest', label: 'forest', title: 'bagging 与随机特征', body: '随机森林让很多差异化树投票，降低单棵深树的高方差。' },
        { id: 'importance', label: 'importance', title: '重要性不等于因果', body: 'feature importance 说明模型依赖，不说明改变特征会造成目标变化。' },
      ],
      [
        { id: 'tree', label: 'tree', title: 'if-then split rules', body: 'A tree does not follow gradients; it repeatedly asks whether one feature is below a threshold.' },
        { id: 'split', label: 'split', title: '2D planes become rectangles', body: 'Each cut follows one feature axis, producing piecewise rectangular prediction regions.' },
        { id: 'criterion', label: 'criterion', title: 'Gini / entropy / MSE', body: 'Classification splits seek purer child nodes; regression splits seek lower within-node error.' },
        { id: 'depth', label: 'depth', title: 'Tree depth controls complexity', body: 'Shallow trees can underfit, while deep trees can carve noise into many tiny leaves.' },
        { id: 'forest', label: 'forest', title: 'Bagging and random features', body: 'A random forest lets many different trees vote, reducing the high variance of one deep tree.' },
        { id: 'importance', label: 'importance', title: 'Importance is not causality', body: 'Feature importance shows model reliance; it does not show that changing a feature causes the target.' },
      ],
    ),
  ),
)

const cnnStages = computed(() =>
  localized(
    loc(
      [
        { id: 'volume', label: 'volume', title: '图片是 H×W×C 数值体', body: '先把图片读成高度、宽度和 channel，而不是直接读成物体。' },
        { id: 'kernel', label: 'kernel', title: '局部窗口点乘', body: '一个 kernel 在图上滑动，每个位置产生一个 feature map 数值。' },
        { id: 'shape', label: 'shape', title: 'padding / stride 算尺寸', body: '输出空间尺寸由输入、padding、kernel size 和 stride 一起决定。' },
        { id: 'feature', label: 'feature', title: 'filter 生成 channel', body: '多个 filter 生成多个 feature map，参数量来自 kernel 和 channel。' },
        { id: 'head', label: 'head', title: 'pooling 到分类头', body: '卷积主干提取表示，pooling 控制空间尺寸，Linear 输出类别分数。' },
        { id: 'transfer', label: 'transfer', title: '迁移学习复盘', body: '预训练 backbone 提供视觉起点，新分类头适配当前任务。' },
      ],
      [
        { id: 'volume', label: 'volume', title: 'Image as H×W×C volume', body: 'Read images as height, width, and channels before treating them as objects.' },
        { id: 'kernel', label: 'kernel', title: 'Local-window dot product', body: 'A kernel slides over the image and produces one feature-map value per position.' },
        { id: 'shape', label: 'shape', title: 'Padding / stride sizes', body: 'Output spatial size depends on input, padding, kernel size, and stride.' },
        { id: 'feature', label: 'feature', title: 'Filters create channels', body: 'Multiple filters create multiple feature maps; parameter count comes from kernel and channels.' },
        { id: 'head', label: 'head', title: 'Pooling to classifier head', body: 'The backbone extracts representation, pooling controls space, and Linear outputs class scores.' },
        { id: 'transfer', label: 'transfer', title: 'Transfer-learning review', body: 'A pretrained backbone gives a visual starting point, and a new head adapts to the task.' },
      ],
    ),
  ),
)

const attentionStages = computed(() =>
  localized(
    loc(
      [
        { id: 'token', label: 'token', title: 'token 到 embedding', body: '文本先变成 token id，再查表成 [B,T,H] 表示。' },
        { id: 'qkv', label: 'qkv', title: 'Q/K/V 投影', body: 'Q 和 K 生成 score matrix，V 是后面被加权汇总的内容。' },
        { id: 'softmax', label: 'softmax', title: '每个 query 分配权重', body: 'softmax 通常按每一行做，让每个 query 对所有 key 分配注意力。' },
        { id: 'heads', label: 'heads', title: 'multi-head shape 拆分', body: '[B,T,H] 拆成 [B,heads,T,d_head]，不同 head 学不同关系。' },
        { id: 'block', label: 'block', title: '完整 Transformer block', body: 'attention、residual、LayerNorm 和 position-wise FFN 一起构成 block。' },
        { id: 'tools', label: 'tools', title: '接到 LLM 工具链', body: 'tokenizer、attention mask 和 logits 都能对应回前面的形状。' },
      ],
      [
        { id: 'token', label: 'token', title: 'Tokens to embeddings', body: 'Text becomes token ids, then embedding lookup creates [B,T,H] representation.' },
        { id: 'qkv', label: 'qkv', title: 'Q/K/V projections', body: 'Q and K create the score matrix; V is the content later combined by weights.' },
        { id: 'softmax', label: 'softmax', title: 'Each query allocates weights', body: 'Softmax is usually row-wise so each query attends across all keys.' },
        { id: 'heads', label: 'heads', title: 'Multi-head shape split', body: '[B,T,H] becomes [B,heads,T,d_head], letting heads learn different relations.' },
        { id: 'block', label: 'block', title: 'Full Transformer block', body: 'Attention, residual, LayerNorm, and position-wise FFN form the block together.' },
        { id: 'tools', label: 'tools', title: 'Bridge to LLM tooling', body: 'Tokenizer, attention mask, and logits map back to the shapes above.' },
      ],
    ),
  ),
)

const optimizerStages = computed(() =>
  localized(
    loc(
      [
        { id: 'loop', label: 'loop', title: '训练循环顺序', body: 'forward、loss、zero_grad、backward、step 是优化器工作的最小节奏。' },
        { id: 'sgd', label: 'sgd', title: 'mini-batch 噪声', body: 'batch size 改变梯度噪声、更新频率和 loss 曲线抖动。' },
        { id: 'momentum', label: 'momentum', title: '动量与自适应步长', body: 'Momentum 减少来回震荡，RMSProp 按参数调相对步长。' },
        { id: 'adam', label: 'adam', title: 'AdamW 与 weight decay', body: 'Adam 结合一阶和二阶历史，AdamW 常把权重衰减解耦。' },
        { id: 'schedule', label: 'schedule', title: '学习率计划', body: '曲线太慢、震荡或平台期，通常提示要调整 learning rate schedule。' },
        { id: 'diagnose', label: 'diagnose', title: '曲线诊断复盘', body: '记录现象、可能原因和下一步实验，而不是背 optimizer 口号。' },
      ],
      [
        { id: 'loop', label: 'loop', title: 'Training-loop order', body: 'forward, loss, zero_grad, backward, and step are the optimizer rhythm.' },
        { id: 'sgd', label: 'sgd', title: 'Mini-batch noise', body: 'Batch size changes gradient noise, update frequency, and loss-curve jitter.' },
        { id: 'momentum', label: 'momentum', title: 'Momentum and adaptive steps', body: 'Momentum reduces zig-zagging; RMSProp tunes relative steps per parameter.' },
        { id: 'adam', label: 'adam', title: 'AdamW and weight decay', body: 'Adam combines first and second moment history; AdamW often decouples decay.' },
        { id: 'schedule', label: 'schedule', title: 'Learning-rate schedule', body: 'Slow, oscillating, or plateauing curves often point to learning-rate changes.' },
        { id: 'diagnose', label: 'diagnose', title: 'Curve diagnosis review', body: 'Record pattern, likely cause, and next experiment instead of memorizing optimizer slogans.' },
      ],
    ),
  ),
)

const ragStages = computed(() =>
  localized(
    loc(
      [
        { id: 'token', label: 'token', title: 'token 与上下文预算', body: '系统指令、问题、资料和答案都共享 context window。' },
        { id: 'embed', label: 'embed', title: 'embedding 检索', body: 'query 和 chunk 都变成向量，再用相似度找 top_k 候选。' },
        { id: 'chunk', label: 'chunk', title: 'chunk size / overlap', body: '切块大小和重叠决定事实是否完整、片段是否可检索。' },
        { id: 'prompt', label: 'prompt', title: 'prompt assembly', body: '把问题、context、格式和引用规则组织成可审计输入。' },
        { id: 'eval', label: 'eval', title: 'RAG 失败定位', body: '失败可能来自 retrieval、prompt、generation 或 evaluation。' },
        { id: 'review', label: 'review', title: 'RAG 不等于训练', body: 'RAG 在回答时提供上下文，不是把新知识写进参数。' },
      ],
      [
        { id: 'token', label: 'token', title: 'Tokens and context budget', body: 'System instruction, question, material, and answer share the context window.' },
        { id: 'embed', label: 'embed', title: 'Embedding retrieval', body: 'Query and chunks become vectors, then similarity search retrieves top_k candidates.' },
        { id: 'chunk', label: 'chunk', title: 'Chunk size / overlap', body: 'Chunk size and overlap decide whether facts stay complete and retrievable.' },
        { id: 'prompt', label: 'prompt', title: 'Prompt assembly', body: 'Question, context, format, and citation rules become auditable input.' },
        { id: 'eval', label: 'eval', title: 'RAG failure diagnosis', body: 'Failure can come from retrieval, prompt, generation, or evaluation.' },
        { id: 'review', label: 'review', title: 'RAG is not training', body: 'RAG provides context at answer time; it does not write new knowledge into parameters.' },
      ],
    ),
  ),
)

const activeNotebookCell = computed(
  () => notebookCells.value.find((cell) => cell.id === selectedCell.value) ?? notebookCells.value[0],
)

const activeHousingStage = computed(
  () => housingStages.value.find((stage) => stage.id === selectedStage.value) ?? housingStages.value[0],
)

const activeClassificationStage = computed(
  () =>
    classificationStages.value.find((stage) => stage.id === selectedClassificationStage.value) ??
    classificationStages.value[0],
)

const activeModelSelectionStage = computed(
  () =>
    modelSelectionStages.value.find((stage) => stage.id === selectedModelSelectionStage.value) ??
    modelSelectionStages.value[0],
)

const activeTreeForestStage = computed(
  () =>
    treeForestStages.value.find((stage) => stage.id === selectedTreeForestStage.value) ??
    treeForestStages.value[0],
)

const activeCnnStage = computed(
  () => cnnStages.value.find((stage) => stage.id === selectedCnnStage.value) ?? cnnStages.value[0],
)

const activeAttentionStage = computed(
  () =>
    attentionStages.value.find((stage) => stage.id === selectedAttentionStage.value) ??
    attentionStages.value[0],
)

const activeOptimizerStage = computed(
  () =>
    optimizerStages.value.find((stage) => stage.id === selectedOptimizerStage.value) ??
    optimizerStages.value[0],
)

const activeRagStage = computed(
  () => ragStages.value.find((stage) => stage.id === selectedRagStage.value) ?? ragStages.value[0],
)

const sectionHint = computed(() => {
  if (activeWorkflow.value === 'python') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'notebook-rhythm': loc('先给每个 cell 写目的。', 'Give each cell a purpose first.'),
      'numpy-arrays': loc('重点检查 shape。', 'Focus on shape.'),
      'pandas-tables': loc('重点检查列名、缺失和分布。', 'Focus on columns, missing values, and distributions.'),
      'sklearn-small-model': loc('重点检查 split、fit、predict、metric。', 'Focus on split, fit, predict, and metric.'),
      'reproducible-handoff': loc('重点检查能否从头运行。', 'Focus on whether it runs top to bottom.'),
    }
    return localized(hints[props.section.id] ?? loc('把代码和问题绑在一起。', 'Tie code to a question.'))
  }

  if (activeWorkflow.value === 'classification') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'problem-and-costs': loc('先定义正类和错误成本。', 'Define positive class and error costs first.'),
      'text-to-features': loc('重点检查词表是否只从训练集学习。', 'Check whether vocabulary is learned from training data only.'),
      'pipeline-baseline': loc('Pipeline 是防泄漏的项目骨架。', 'Pipeline is the leakage-safe project skeleton.'),
      'scores-thresholds': loc('阈值改变决策，不改变分数。', 'Threshold changes decisions, not scores.'),
      'metrics-tradeoffs': loc('指标要接到错误成本。', 'Connect metrics to error costs.'),
      'error-review': loc('复盘必须看错误样本。', 'Review must inspect error examples.'),
    }
    return localized(hints[props.section.id] ?? loc('把分类指标接回业务后果。', 'Connect classification metrics back to business consequences.'))
  }

  if (activeWorkflow.value === 'model-selection') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'one-split-risk': loc('先看同一模型在不同 split 下的波动。', 'Start with score movement across splits.'),
      'validation-role': loc('validation 做选择，test 做最终估计。', 'Validation chooses; test estimates at the end.'),
      'cross-validation': loc('CV 要同时看 mean 和 std。', 'CV needs both mean and std.'),
      'pipeline-leakage': loc('每一折的预处理都要隔离。', 'Preprocessing must stay isolated inside each fold.'),
      'grid-search': loc('参数搜索要写清候选、CV 和 scoring。', 'Parameter search should state candidates, CV, and scoring.'),
      'final-refit': loc('最终测试不能再变成调参。', 'Final testing must not become another tuning loop.'),
    }
    return localized(hints[props.section.id] ?? loc('把选择流程和最终评估分开。', 'Separate selection workflow from final evaluation.'))
  }

  if (activeWorkflow.value === 'tree-forest') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'non-gradient-model': loc('先把树读成 if-then 规则。', 'Read the tree as if-then rules first.'),
      'rectangular-splits': loc('重点看二维空间如何被切成矩形。', 'Focus on how 2D space becomes rectangles.'),
      'split-criteria': loc('split 标准是在比较切完是否更纯。', 'Split criteria compare whether children become purer.'),
      'depth-overfitting': loc('树深度就是容量旋钮。', 'Tree depth is the capacity knob.'),
      'random-forest': loc('森林靠差异化树投票降方差。', 'Forests reduce variance by voting across different trees.'),
      'feature-importance': loc('重要性是依赖线索，不是因果证据。', 'Importance is reliance evidence, not causal proof.'),
    }
    return localized(hints[props.section.id] ?? loc('把局部规则、复杂度和泛化放在一起看。', 'Read local rules, complexity, and generalization together.'))
  }

  if (activeWorkflow.value === 'cnn') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'image-volume': loc('先把图片读成 H×W×C 数值体。', 'Read the image as an H×W×C numeric volume first.'),
      'kernel-convolution': loc('重点手算一个 patch 和 kernel 的点乘。', 'Manually compute one patch-kernel dot product.'),
      'padding-stride-shape': loc('输出尺寸先算空间，再看 channel。', 'Compute spatial size first, then channels.'),
      'channels-feature-maps': loc('参数共享解释为什么卷积比全连接省参数。', 'Use weight sharing to explain why convolution uses fewer parameters than dense layers.'),
      'pooling-classifier-head': loc('追踪主干、pooling 和分类头的分工。', 'Trace the roles of backbone, pooling, and classifier head.'),
      'transfer-learning-review': loc('迁移学习要检查数据划分、增强和错误样本。', 'Transfer learning still needs split, augmentation, and error review checks.'),
    }
    return localized(hints[props.section.id] ?? loc('把图像、shape、代码和参数量对齐。', 'Align image, shape, code, and parameter count.'))
  }

  if (activeWorkflow.value === 'sequence-bridge') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'why-sequences': loc('先区分表格列、图像空间和 token 位置轴。', 'First separate table columns, image space, and token position axis.'),
      'token-ids': loc('token id 是词表索引，不是连续特征。', 'A token id is a vocabulary index, not a continuous feature.'),
      'embedding-lookup': loc('重点追踪 [B,T] 怎样查表成 [B,T,H]。', 'Track how [B,T] becomes [B,T,H] by lookup.'),
      'positions-and-masks': loc('position 管顺序，mask 管可见性。', 'Position handles order; mask handles visibility.'),
      'shape-handoff': loc('把 hidden states 接到 Q/K/V 前再进入 attention。', 'Connect hidden states to Q/K/V before entering attention.'),
    }
    return localized(hints[props.section.id] ?? loc('把 token、embedding、position、mask 和 shape 连成一条线。', 'Connect tokens, embeddings, position, mask, and shape into one chain.'))
  }

  if (activeWorkflow.value === 'attention') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'tokens-embeddings': loc('先把文本转成 token 和 [B,T,H]。', 'Start by turning text into tokens and [B,T,H].'),
      'qkv-scores': loc('Q/K 生成分数，V 提供内容。', 'Q/K create scores; V provides content.'),
      'softmax-weighted-sum': loc('softmax 通常按 query 行分配预算。', 'Softmax usually allocates budget row-wise per query.'),
      'multi-head-shapes': loc('重点追踪 heads 和 d_head 的形状。', 'Track heads and d_head shapes.'),
      'transformer-block': loc('block 不是只有 attention，还要 residual/norm/FFN。', 'A block is not only attention; it also needs residual/norm/FFN.'),
      'architecture-to-tools': loc('把 tokenizer、mask、logits 接回架构形状。', 'Map tokenizer, mask, and logits back to architecture shapes.'),
    }
    return localized(hints[props.section.id] ?? loc('把 token 关系、矩阵形状和 block 结构对齐。', 'Align token relations, matrix shapes, and block structure.'))
  }

  if (activeWorkflow.value === 'optimizer') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'training-loop': loc('先把 backward 和 step 的顺序说清楚。', 'Clarify the order of backward and step first.'),
      'sgd-batch-noise': loc('batch size 是噪声和更新频率旋钮。', 'Batch size controls noise and update frequency.'),
      'momentum-rmsprop': loc('Momentum 减震，RMSProp 调相对步长。', 'Momentum damps oscillation; RMSProp tunes relative steps.'),
      'adam-weight-decay': loc('AdamW 的 lr、betas、weight_decay 是不同旋钮。', 'AdamW lr, betas, and weight_decay are different knobs.'),
      'learning-rate-schedules': loc('根据 loss 曲线判断学习率问题。', 'Diagnose learning-rate issues from loss curves.'),
      'curve-diagnosis': loc('控制变量做优化器对比。', 'Use controlled variables for optimizer comparison.'),
    }
    return localized(hints[props.section.id] ?? loc('从曲线现象推断下一步调参。', 'Infer the next tuning step from curve patterns.'))
  }

  if (activeWorkflow.value === 'rag') {
    const hints: Record<string, { 'zh-CN': string; en: string }> = {
      'tokenization-context': loc('先算 token 和 context window 预算。', 'Budget tokens and context window first.'),
      'embeddings-similarity': loc('embedding 检索只是候选召回。', 'Embedding retrieval only recalls candidates.'),
      'chunking-retrieval': loc('chunk size 和 overlap 会决定召回质量。', 'Chunk size and overlap shape retrieval quality.'),
      'prompt-assembly': loc('prompt assembly 要能审计来源。', 'Prompt assembly should make sources auditable.'),
      'rag-evaluation': loc('失败要拆成 retrieval/prompt/generation/evaluation。', 'Split failures into retrieval/prompt/generation/evaluation.'),
      'rag-is-not-training': loc('RAG 是回答时给上下文，不是写进参数。', 'RAG supplies context at answer time; it does not write knowledge into parameters.'),
    }
    return localized(hints[props.section.id] ?? loc('把检索、上下文和回答证据分开检查。', 'Check retrieval, context, and answer evidence separately.'))
  }

  const hints: Record<string, { 'zh-CN': string; en: string }> = {
    'csv-to-frame': loc('先确认行、列、目标。', 'Confirm rows, columns, and target first.'),
    'eda-first-pass': loc('每张图都要变成建模判断。', 'Each chart should become a modeling decision.'),
    'cleaning-splits': loc('训练集 fit，测试集只 transform。', 'Fit on training data; only transform test data.'),
    'linear-baseline': loc('baseline 要诚实，不一定要强。', 'A baseline should be honest, not necessarily strong.'),
    evaluation: loc('同时看指标和错误样本。', 'Read metrics and error cases together.'),
    'review-next-iteration': loc('复盘要推出下一轮实验。', 'A review should lead to the next experiment.'),
  }
  return localized(hints[props.section.id] ?? loc('按端到端顺序复盘。', 'Review in end-to-end order.'))
})
</script>

<template>
  <section class="workflow-lab">
    <header class="workflow-lab__header">
      <span>{{ locale === 'zh-CN' ? '复现实验台' : 'Reproducible lab' }}</span>
      <strong>{{ sectionHint }}</strong>
    </header>

    <section v-if="activeWorkflow === 'python'" class="workflow-lab__notebook">
      <div class="workflow-lab__tabs" role="list">
        <button
          v-for="cell in notebookCells"
          :key="cell.id"
          type="button"
          class="workflow-lab__tab"
          :class="{ 'is-active': selectedCell === cell.id }"
          @click="selectedCell = cell.id"
        >
          {{ cell.label }}
        </button>
      </div>

      <article class="workflow-lab__focus">
        <span>{{ activeNotebookCell?.label }}</span>
        <strong>{{ activeNotebookCell?.title }}</strong>
        <p>{{ activeNotebookCell?.body }}</p>
      </article>

      <div class="workflow-lab__cell-stack">
        <article
          v-for="cell in notebookCells"
          :key="cell.id"
          class="workflow-lab__cell"
          :class="{ 'is-active': selectedCell === cell.id }"
        >
          <span>{{ cell.label }}</span>
          <p>{{ cell.body }}</p>
        </article>
      </div>
    </section>

    <section v-else-if="activeWorkflow === 'housing'" class="workflow-lab__pipeline">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in housingStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedStage === stage.id }"
          @click="selectedStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--housing">
        <span>{{ activeHousingStage?.label }}</span>
        <strong>{{ activeHousingStage?.title }}</strong>
        <p>{{ activeHousingStage?.body }}</p>
      </article>
    </section>

    <section v-else-if="activeWorkflow === 'classification'" class="workflow-lab__pipeline workflow-lab__pipeline--classification">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in classificationStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedClassificationStage === stage.id }"
          @click="selectedClassificationStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--classification">
        <span>{{ activeClassificationStage?.label }}</span>
        <strong>{{ activeClassificationStage?.title }}</strong>
        <p>{{ activeClassificationStage?.body }}</p>
      </article>
    </section>

    <section v-else-if="activeWorkflow === 'model-selection'" class="workflow-lab__pipeline workflow-lab__pipeline--model-selection">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in modelSelectionStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedModelSelectionStage === stage.id }"
          @click="selectedModelSelectionStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--model-selection">
        <span>{{ activeModelSelectionStage?.label }}</span>
        <strong>{{ activeModelSelectionStage?.title }}</strong>
        <p>{{ activeModelSelectionStage?.body }}</p>
      </article>
    </section>

    <section v-else-if="activeWorkflow === 'tree-forest'" class="workflow-lab__pipeline workflow-lab__pipeline--tree-forest">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in treeForestStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedTreeForestStage === stage.id }"
          @click="selectedTreeForestStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--tree-forest">
        <span>{{ activeTreeForestStage?.label }}</span>
        <strong>{{ activeTreeForestStage?.title }}</strong>
        <p>{{ activeTreeForestStage?.body }}</p>
      </article>
    </section>

    <section v-else-if="activeWorkflow === 'cnn'" class="workflow-lab__pipeline workflow-lab__pipeline--cnn">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in cnnStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedCnnStage === stage.id }"
          @click="selectedCnnStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--cnn">
        <span>{{ activeCnnStage?.label }}</span>
        <strong>{{ activeCnnStage?.title }}</strong>
        <p>{{ activeCnnStage?.body }}</p>
      </article>
    </section>

    <section v-else-if="activeWorkflow === 'sequence-bridge'" class="workflow-lab__pipeline workflow-lab__pipeline--sequence-bridge">
      <SequenceBridgeShapeLab />
    </section>

    <section v-else-if="activeWorkflow === 'attention'" class="workflow-lab__pipeline workflow-lab__pipeline--attention">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in attentionStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedAttentionStage === stage.id }"
          @click="selectedAttentionStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--attention">
        <span>{{ activeAttentionStage?.label }}</span>
        <strong>{{ activeAttentionStage?.title }}</strong>
        <p>{{ activeAttentionStage?.body }}</p>
      </article>
    </section>

    <section v-else-if="activeWorkflow === 'optimizer'" class="workflow-lab__pipeline workflow-lab__pipeline--optimizer">
      <OptimizerCurveDiagnosisChallengeLab
        v-if="props.moduleSlug === 'optimizer-comparison' && props.section.id === 'curve-diagnosis'"
      />

      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in optimizerStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedOptimizerStage === stage.id }"
          @click="selectedOptimizerStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--optimizer">
        <span>{{ activeOptimizerStage?.label }}</span>
        <strong>{{ activeOptimizerStage?.title }}</strong>
        <p>{{ activeOptimizerStage?.body }}</p>
      </article>
    </section>

    <section v-else class="workflow-lab__pipeline workflow-lab__pipeline--rag">
      <div class="workflow-lab__stage-list">
        <button
          v-for="stage in ragStages"
          :key="stage.id"
          type="button"
          class="workflow-lab__stage"
          :class="{ 'is-active': selectedRagStage === stage.id }"
          @click="selectedRagStage = stage.id"
        >
          <span>{{ stage.label }}</span>
          <strong>{{ stage.title }}</strong>
        </button>
      </div>

      <article class="workflow-lab__focus workflow-lab__focus--rag">
        <span>{{ activeRagStage?.label }}</span>
        <strong>{{ activeRagStage?.title }}</strong>
        <p>{{ activeRagStage?.body }}</p>
      </article>
    </section>
  </section>
</template>
