<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'
import LearningRouteSummary from '../modules/math-lab/components/LearningRouteSummary.vue'
import { learningRoutes } from '../modules/math-lab/data/learningRoutes'
import { mathLabModules } from '../modules/math-lab/data/modules'
import { loadMathLabProgress, mathLabProgressStorageKey } from '../modules/math-lab/utils/progress'
import type { LearningRouteId } from '../modules/math-lab/types/mathLab'
import type { LocalizedCopy } from '../types/ml'

const { t, locale } = useI18n()

interface BeginnerRoadmapStage {
  id: string
  route: string
  duration: LocalizedCopy
  title: LocalizedCopy
  summary: LocalizedCopy
  focus: LocalizedCopy
  practice: LocalizedCopy
  outcome: LocalizedCopy
  concepts: LocalizedCopy[]
  action: LocalizedCopy
}

interface ReadinessCheck {
  title: LocalizedCopy
  description: LocalizedCopy
}

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function localizedText(value: LocalizedCopy) {
  return locale.value === 'zh-CN' ? value['zh-CN'] : value.en
}

function scrollToRoadmap(event: MouseEvent) {
  event.preventDefault()
  document.getElementById('beginner-roadmap')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', '#beginner-roadmap')
}

const primaryRoute = computed(() => '/learn/ai-overview')
const mathLabProgress = ref(loadMathLabProgress())
const currentMathLocale = computed(() => locale.value === 'zh-CN' ? 'zh-CN' : 'en')
const highlightedLearningRouteIds: readonly LearningRouteId[] = [
  'ai-math-main-path',
  'linear-algebra-route',
  'numerical-deepening-path',
]
const highlightedLearningRoutes = computed(() =>
  learningRoutes.filter((route) => highlightedLearningRouteIds.includes(route.id)),
)

function refreshMathLabProgress() {
  mathLabProgress.value = loadMathLabProgress()
}

function handleProgressVisibilityChange() {
  if (document.visibilityState === 'visible') refreshMathLabProgress()
}

function handleProgressStorageEvent(event: StorageEvent) {
  if (event.key && event.key !== mathLabProgressStorageKey) return
  refreshMathLabProgress()
}

onMounted(() => {
  refreshMathLabProgress()
  window.addEventListener('focus', refreshMathLabProgress)
  document.addEventListener('visibilitychange', handleProgressVisibilityChange)
  window.addEventListener('storage', handleProgressStorageEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshMathLabProgress)
  document.removeEventListener('visibilitychange', handleProgressVisibilityChange)
  window.removeEventListener('storage', handleProgressStorageEvent)
})

const highlights = computed(() =>
  locale.value === 'zh-CN'
    ? ['Math Lab 建立数学直觉', 'Data Lab 连接表格和特征', 'ML Models 用实验理解训练行为']
    : [
        'Math Lab builds the math intuition',
        'Data Lab connects tables to features',
        'ML Models make training behavior visible',
      ],
)

const posterBody = computed(() =>
  locale.value === 'zh-CN'
    ? '先用 Math Lab 补数学直觉，再用 Data Lab 处理输入，之后进入可交互的 ML Models 和深度学习扩展。'
    : 'Start with Math Lab, move through Data Lab, then enter interactive ML Models and the deep-learning extension path.',
)

const modulesBody = computed(() =>
  locale.value === 'zh-CN'
    ? '站点主线不是单独堆章节，而是把 Math Lab、Data Lab、ML Models 和 Deep Learning 串成零基础学生能跟下去的学习闭环。'
    : 'The site connects Math Lab, Data Lab, ML Models, and Deep Learning into one beginner-friendly learning loop.',
)

const modulesNote = computed(() =>
  locale.value === 'zh-CN'
    ? '当前优先补齐自测、进度和继续学习入口，让学生每学完一章都能知道自己是否理解。'
    : 'The current priority is checkpoints, progress, and continue-learning entry points so students can verify understanding after each chapter.',
)

const pathBody = computed(() =>
  locale.value === 'zh-CN'
    ? '推荐顺序是数学直觉、数据处理、机器学习模型、深度学习扩展。每一段都保留可视化、互动实验和 checkpoint。'
    : 'The recommended order is math intuition, data processing, machine-learning models, and deep-learning extensions, each with visual labs and checkpoints.',
)

const learningPath = computed(() =>
  locale.value === 'zh-CN'
    ? [
        'Math Lab：向量、矩阵、Taylor、概率、优化、SVD/PCA、自动微分和深度结构数学',
        'Data Lab：数值特征、类别特征、清洗、EDA、划分、复杂度和正则化',
        'AI Overview：先看什么是 ML、任务类型和训练流程',
        'Python Notebook：用 NumPy、pandas 和 sklearn 复现第一个小实验',
        'Housing Project：房价预测端到端项目，从 CSV 到复盘',
        'Classification Project：垃圾邮件筛查，从文本向量化到阈值复盘',
        'Model Selection：用交叉验证和 GridSearchCV 做可靠调参与最终测试',
        'Tree & Forest：用 if-then split 和随机森林理解非梯度模型',
        'CNN Visualization：从图片 shape、kernel、padding/stride 到 feature map 和迁移学习',
        'Attention & Transformer：把 token、Q/K/V、softmax、multi-head 和 block 串起来',
        'Optimizer Comparison：比较 SGD、Momentum、RMSProp、AdamW、schedule 和 batch size',
        'LLM & RAG：理解 token、embedding、chunking、retrieval、prompt assembly 和 grounded answer',
        'ML Models：loss、gradient descent、linear/logistic regression、classification 和 MLP',
        'Deep Learning：以 MLP 为入口，把视觉、序列、优化和生成式应用串成复盘路径',
      ]
    : [
        'Math Lab: vectors, matrices, Taylor series, probability, optimization, SVD/PCA, autodiff, and architecture math',
        'Data Lab: numeric features, categorical features, cleaning, EDA, splits, complexity, and regularization',
        'AI Overview: start with what ML is, task types, and the training flow',
        'Python Notebook: reproduce the first small experiment with NumPy, pandas, and sklearn',
        'Housing Project: an end-to-end housing price project from CSV to review',
        'Classification Project: spam screening from text vectorization to threshold review',
        'Model Selection: use cross-validation and GridSearchCV for reliable tuning and final testing',
        'Tree & Forest: understand non-gradient models through if-then splits and random forests',
        'CNN Visualization: move from image shape, kernels, padding/stride to feature maps and transfer learning',
        'Attention & Transformer: connect tokens, Q/K/V, softmax, multi-head attention, and the block',
        'Optimizer Comparison: compare SGD, Momentum, RMSProp, AdamW, schedules, and batch size',
        'LLM & RAG: understand tokens, embeddings, chunking, retrieval, prompt assembly, and grounded answers',
        'ML Models: loss, gradient descent, linear/logistic regression, classification, and MLP',
        'Deep Learning: start with MLP, then connect vision, sequences, optimization, and generative applications',
      ],
)

const beginnerRoadmapIntro = {
  eyebrow: loc('零基础入门路线图', 'Beginner roadmap'),
  title: loc('从看懂符号到复现实验的完整学习路线', 'A complete route from symbols to reproducible experiments'),
  body: loc(
    '如果你刚开始学习机器学习，不要先背公式。先把符号、数据表、损失、指标和训练反馈放进同一条路线里：每一阶段都包含要理解的直觉、要完成的实验和进入下一阶段前的检查标准。',
    'If you are new to machine learning, do not start by memorizing formulas. Put symbols, tables, losses, metrics, and training feedback into one route: each stage has an intuition target, a lab task, and a checkpoint before moving on.',
  ),
  note: loc(
    '建议节奏：每阶段 2-4 个短学习块，先看解释，再做实验，最后用 checkpoint 复述变量和现象。',
    'Suggested pace: use 2-4 short study blocks per stage, read the explanation, run the lab, then use the checkpoint to explain the variables and behavior.',
  ),
}

const roadmapLabels = computed(() =>
  locale.value === 'zh-CN'
    ? {
        concepts: '关键概念',
        focus: '学习重点',
        practice: '动手练习',
        outcome: '完成标准',
        checksTitle: '进入下一轮前的自检',
        checksBody: '每学完一个阶段，先确认自己能把公式、图像、代码和模型行为对应起来，再继续推进。',
      }
    : {
        concepts: 'Key concepts',
        focus: 'Learning focus',
        practice: 'Hands-on practice',
        outcome: 'Completion standard',
        checksTitle: 'Readiness checks before the next pass',
        checksBody: 'After each stage, verify that formulas, visuals, code, and model behavior point to the same idea before moving on.',
      },
)

const beginnerRoadmapSource: BeginnerRoadmapStage[] = [
  {
    id: 'math-intuition',
    route: '/learn/ai-overview',
    duration: loc('第 0-1 周', 'Week 0-1'),
    title: loc('先建立 AI 全局地图，再进入数学和模型', 'Build the AI map before math and models'),
    summary: loc(
      '先用 AI 入门总览回答三个问题：什么是 ML，监督/无监督/深度学习/生成式 AI 分别是什么，一次训练流程从哪里开始、在哪里验证。',
      'Start with AI Overview and answer three questions: what ML is, how supervised/unsupervised/deep/generative AI differ, and where a training flow starts and gets validated.',
    ),
    focus: loc(
      '先把数据、模型、预测、loss/metric、train/validation/test 和迭代流程串起来。',
      'Connect data, model, prediction, loss/metric, train/validation/test, and iteration before drilling into formulas.',
    ),
    practice: loc(
      '在 AI Overview 中用任务卡判断回归、分类、聚类和 RAG 场景的输入、目标与反馈信号。',
      'In AI Overview, use task cards to classify regression, classification, clustering, and RAG scenarios by input, target, and feedback.',
    ),
    outcome: loc(
      '能用自己的话复述“input -> model -> prediction -> loss/metric -> iteration”，并区分监督、无监督、深度学习和生成式 AI。',
      'You can retell “input -> model -> prediction -> loss/metric -> iteration” and distinguish supervised, unsupervised, deep learning, and generative AI.',
    ),
    concepts: [
      loc('什么是 ML', 'What ML is'),
      loc('任务类型', 'Task types'),
      loc('训练流程', 'Training flow'),
      loc('生成式 AI 与 RAG', 'Generative AI and RAG'),
    ],
    action: loc('进入 AI 总览', 'Open AI Overview'),
  },
  {
    id: 'python-notebook',
    route: '/learn/python-notebook',
    duration: loc('第 1-2 周', 'Week 1-2'),
    title: loc('用 Python notebook 复现第一个小实验', 'Reproduce the first small experiment in a Python notebook'),
    summary: loc(
      '把站内实验搬进 notebook：NumPy 负责数组和 shape，pandas 负责 CSV 和表格，sklearn 负责 split、fit、predict 和 metric。',
      'Move site experiments into a notebook: NumPy handles arrays and shape, pandas handles CSV and tables, and sklearn handles split, fit, predict, and metric.',
    ),
    focus: loc(
      '每个 cell 都要能说明自己的目的，先跑通小模型，再进入完整项目。',
      'Each cell should explain its purpose. Run a small model before moving into the full project.',
    ),
    practice: loc(
      '用 np.array 手算 MSE，用 DataFrame 读表，再训练一个 LinearRegression baseline。',
      'Use np.array to compute MSE, read a table with DataFrame, then train a LinearRegression baseline.',
    ),
    outcome: loc(
      '能从头运行 notebook，并解释 shape、DataFrame、train_test_split、fit、predict 和 MAE。',
      'You can run the notebook top to bottom and explain shape, DataFrame, train_test_split, fit, predict, and MAE.',
    ),
    concepts: [
      loc('NumPy 数组', 'NumPy arrays'),
      loc('pandas 表格', 'pandas tables'),
      loc('sklearn 小模型', 'small sklearn model'),
      loc('可复现实验', 'reproducible experiment'),
    ],
    action: loc('进入 Python Notebook', 'Open Python Notebook'),
  },
  {
    id: 'housing-price-project',
    route: '/learn/housing-price-project',
    duration: loc('第 2-3 周', 'Week 2-3'),
    title: loc('完成第一个端到端房价预测项目', 'Complete the first end-to-end housing price project'),
    summary: loc(
      '按 CSV -> EDA -> 清洗 -> 线性回归 -> 评估 -> 复盘的顺序，把一个表格项目完整走完。',
      'Follow CSV -> EDA -> cleaning -> linear regression -> evaluation -> review and complete one tabular project.',
    ),
    focus: loc(
      '重点不是模型多复杂，而是数据划分、预处理、baseline、指标和复盘是否诚实。',
      'The focus is not model complexity, but honest splitting, preprocessing, baseline, metrics, and review.',
    ),
    practice: loc(
      '用 Pipeline 和 ColumnTransformer 组织清洗流程，用 LinearRegression 建 baseline，再看 MAE、R² 和错误样本。',
      'Use Pipeline and ColumnTransformer for cleaning, build a LinearRegression baseline, then read MAE, R², and error cases.',
    ),
    outcome: loc(
      '能解释为什么测试集不能参与 fit，并能根据评估结果提出下一轮实验。',
      'You can explain why test data must not participate in fit and propose the next experiment from evaluation results.',
    ),
    concepts: [
      loc('CSV 与 EDA', 'CSV and EDA'),
      loc('数据泄漏', 'data leakage'),
      loc('Pipeline', 'Pipeline'),
      loc('MAE / R² / 复盘', 'MAE / R² / review'),
    ],
    action: loc('进入房价预测项目', 'Open Housing Project'),
  },
  {
    id: 'classification-project',
    route: '/learn/classification-project',
    duration: loc('第 3 周', 'Week 3'),
    title: loc('完成第一个二分类项目：垃圾邮件筛查', 'Complete the first binary project: spam screening'),
    summary: loc(
      '把邮件文本转成 TF-IDF 稀疏向量，用 Pipeline 训练 baseline，再通过阈值、混淆矩阵和错误样本完成复盘。',
      'Turn email text into TF-IDF sparse vectors, train a baseline with Pipeline, then review thresholds, confusion matrix, and error cases.',
    ),
    focus: loc(
      '重点是正类定义、文本向量化是否泄漏、precision/recall 取舍和 false positive / false negative 的业务含义。',
      'Focus on positive-class definition, leakage-safe vectorization, precision/recall tradeoff, and the business meaning of false positives and false negatives.',
    ),
    practice: loc(
      '用 TfidfVectorizer + LogisticRegression 建 spam/ham baseline，比较不同阈值下 precision、recall、F1 和误拦样本。',
      'Build a spam/ham baseline with TfidfVectorizer + LogisticRegression, then compare precision, recall, F1, and blocked normal messages across thresholds.',
    ),
    outcome: loc(
      '能解释为什么 accuracy 不够，并能根据业务成本选择阈值和下一轮实验。',
      'You can explain why accuracy is insufficient and choose a threshold plus next experiment from business cost.',
    ),
    concepts: [
      loc('文本向量化', 'Text vectorization'),
      loc('二分类阈值', 'Binary threshold'),
      loc('混淆矩阵', 'Confusion matrix'),
      loc('precision / recall', 'precision / recall'),
    ],
    action: loc('进入分类项目', 'Open Classification Project'),
  },
  {
    id: 'model-selection',
    route: '/learn/model-selection',
    duration: loc('第 3-4 周', 'Week 3-4'),
    title: loc('用交叉验证做更可靠的模型选择', 'Use cross-validation for more reliable model selection'),
    summary: loc(
      '学完两个项目后，补上模型选择方法：一次 split 为什么不够，validation 和 test 怎么分工，Pipeline 和 GridSearchCV 如何避免泄漏。',
      'After two projects, add model-selection methods: why one split is not enough, how validation and test differ, and how Pipeline plus GridSearchCV avoids leakage.',
    ),
    focus: loc(
      '重点是把“训练参数、选择方案、最终估计”拆开，并用 CV mean/std 判断分数是否稳定。',
      'Focus on separating parameter fitting, workflow choice, and final estimation, then use CV mean/std to judge score stability.',
    ),
    practice: loc(
      '用 cross_val_score 比较不同 split 的波动，用 GridSearchCV 搜 Ridge alpha，并只在最终 test set 上评估一次。',
      'Use cross_val_score to inspect split variation, GridSearchCV to search Ridge alpha, and evaluate once on the final test set.',
    ),
    outcome: loc(
      '能判断某个调参流程是否污染 test set，并能读懂 param_grid、mean_test_score、best_params_ 和 test score。',
      'You can judge whether a tuning workflow contaminates the test set and explain param_grid, mean_test_score, best_params_, and test score.',
    ),
    concepts: [
      loc('train / validation / test', 'train / validation / test'),
      loc('K-fold CV', 'K-fold CV'),
      loc('Pipeline 防泄漏', 'Pipeline leakage prevention'),
      loc('GridSearchCV', 'GridSearchCV'),
    ],
    action: loc('进入模型选择', 'Open Model Selection'),
  },
  {
    id: 'tree-forest',
    route: '/learn/tree-forest',
    duration: loc('第 4 周', 'Week 4'),
    title: loc('用决策树和随机森林理解非梯度模型', 'Use trees and forests to understand non-gradient models'),
    summary: loc(
      '补一个和线性模型、梯度下降完全不同的模型族：树用 if-then split 切空间，随机森林用很多差异化树投票降低方差。',
      'Add a model family unlike linear models and gradient descent: trees cut space with if-then splits, and random forests reduce variance by voting across different trees.',
    ),
    focus: loc(
      '重点看二维矩形边界、Gini/entropy/MSE split 标准、max_depth 过拟合和 feature importance 的误读风险。',
      'Focus on 2D rectangular boundaries, Gini/entropy/MSE split criteria, max_depth overfitting, and feature-importance misreadings.',
    ),
    practice: loc(
      '比较 shallow tree、deep tree 和 random forest 的边界与验证表现，再写一条“重要性不等于因果”的复盘。',
      'Compare shallow tree, deep tree, and random forest boundaries plus validation behavior, then write one review note on why importance is not causality.',
    ),
    outcome: loc(
      '能解释树为什么不需要特征缩放，为什么深树容易过拟合，以及随机森林如何用 bagging 和随机特征降低方差。',
      'You can explain why trees do not need feature scaling, why deep trees overfit, and how random forests lower variance with bagging and random features.',
    ),
    concepts: [
      loc('if-then split', 'if-then split'),
      loc('Gini / entropy / MSE', 'Gini / entropy / MSE'),
      loc('max_depth 与剪枝', 'max_depth and pruning'),
      loc('bagging / feature importance', 'bagging / feature importance'),
    ],
    action: loc('进入树模型', 'Open Tree Models'),
  },
  {
    id: 'cnn-visualization',
    route: '/learn/cnn-visualization',
    duration: loc('第 5 周', 'Week 5'),
    title: loc('用 CNN 可视化理解图像模型怎样算', 'Use CNN visualization to see how vision models compute'),
    summary: loc(
      '把图片拆成 H×W×C 数值体，手算 kernel 卷积，再用 padding、stride、feature map、pooling 和分类头读懂一个小 CNN。',
      'Break images into H×W×C numeric volumes, hand-calculate a kernel convolution, then read a small CNN through padding, stride, feature maps, pooling, and the classifier head.',
    ),
    focus: loc(
      '重点是 shape、参数共享、输出尺寸和参数量，而不是把 CNN 当作图片魔法。',
      'Focus on shape, weight sharing, output size, and parameter count instead of treating CNNs as image magic.',
    ),
    practice: loc(
      '用 5×5 小图和 3×3 kernel 手算一个输出格，再比较 Conv2d 和全连接层的参数量。',
      'Use a 5×5 image and 3×3 kernel to hand-calculate one output cell, then compare Conv2d and dense parameter counts.',
    ),
    outcome: loc(
      '能解释 padding/stride 如何改变输出尺寸，filter 个数如何改变 channel，以及迁移学习为什么常先换分类头。',
      'You can explain how padding/stride change output size, how filter count changes channels, and why transfer learning often replaces the classifier head first.',
    ),
    concepts: [
      loc('H×W×C shape', 'H×W×C shape'),
      loc('kernel / feature map', 'kernel / feature map'),
      loc('padding / stride', 'padding / stride'),
      loc('迁移学习', 'transfer learning'),
    ],
    action: loc('进入 CNN 可视化', 'Open CNN Visualization'),
  },
  {
    id: 'attention-transformer',
    route: '/learn/attention-transformer',
    duration: loc('第 5-6 周', 'Week 5-6'),
    title: loc('把 Attention 与 Transformer block 算清楚', 'Make Attention and the Transformer block computable'),
    summary: loc(
      '从 token 和 embedding 开始，追踪 Q/K/V、score matrix、softmax、value weighted sum、multi-head shape 和 residual/norm/FFN。',
      'Start from tokens and embeddings, then track Q/K/V, score matrix, softmax, value weighted sum, multi-head shapes, and residual/norm/FFN.',
    ),
    focus: loc(
      '重点是每个 token 怎样分配注意力预算，以及 [B,T,H] 怎样被拆成多头再合并。',
      'Focus on how each token allocates attention and how [B,T,H] splits into heads and merges back.',
    ),
    practice: loc(
      '用 4 个 token 画 4×4 attention heatmap，并把 [B,T,128] 拆成 4 个 head 的 [B,4,T,32]。',
      'Draw a 4-token 4×4 attention heatmap and split [B,T,128] into [B,4,T,32] for four heads.',
    ),
    outcome: loc(
      '能指出 softmax 作用在哪个维度，并能说清 attention、residual、LayerNorm 和 FFN 在 block 中的分工。',
      'You can identify the softmax dimension and explain the roles of attention, residual, LayerNorm, and FFN in the block.',
    ),
    concepts: [
      loc('token / embedding', 'token / embedding'),
      loc('Q/K/V', 'Q/K/V'),
      loc('softmax attention', 'softmax attention'),
      loc('multi-head / residual', 'multi-head / residual'),
    ],
    action: loc('进入 Transformer 入门', 'Open Transformer Primer'),
  },
  {
    id: 'optimizer-comparison',
    route: '/learn/optimizer-comparison',
    duration: loc('第 6 周', 'Week 6'),
    title: loc('比较优化器，学会从曲线诊断训练', 'Compare optimizers and diagnose training from curves'),
    summary: loc(
      '在同一训练循环里比较 SGD、Momentum、RMSProp、AdamW、weight decay、learning rate schedule 和 batch size 对 loss 曲线的影响。',
      'Compare SGD, Momentum, RMSProp, AdamW, weight decay, learning-rate schedules, and batch size in one training-loop frame.',
    ),
    focus: loc(
      '重点是控制变量：一次只改 optimizer、lr、batch size 或 weight_decay，并记录曲线现象。',
      'Focus on controlled variables: change only optimizer, lr, batch size, or weight_decay at a time and record the curve pattern.',
    ),
    practice: loc(
      '根据 loss 下降慢、震荡、发散或平台期，写出可能原因和下一步调参计划。',
      'For slow descent, oscillation, divergence, or plateau, write the likely cause and next tuning step.',
    ),
    outcome: loc(
      '能解释 zero_grad、loss.backward()、optimizer.step() 的顺序，并能根据训练曲线选择学习率或优化器调整。',
      'You can explain the order of zero_grad, loss.backward(), and optimizer.step(), then choose learning-rate or optimizer adjustments from training curves.',
    ),
    concepts: [
      loc('SGD / Momentum', 'SGD / Momentum'),
      loc('RMSProp / AdamW', 'RMSProp / AdamW'),
      loc('weight decay', 'weight decay'),
      loc('learning rate schedule', 'learning-rate schedule'),
    ],
    action: loc('进入优化器对比', 'Open Optimizer Comparison'),
  },
  {
    id: 'llm-rag',
    route: '/learn/llm-rag',
    duration: loc('第 6 周及之后', 'Week 6 and beyond'),
    title: loc('理解 LLM 应用与 RAG 的真实流水线', 'Understand the real pipeline behind LLM apps and RAG'),
    summary: loc(
      '把 tokenization、context window、embedding、chunking、retrieval、prompt assembly、grounded answer 和评估拆成可复盘步骤。',
      'Break tokenization, context window, embeddings, chunking, retrieval, prompt assembly, grounded answers, and evaluation into reviewable steps.',
    ),
    focus: loc(
      '重点是 RAG 如何在回答时提供外部上下文，而不是把新知识写进模型参数。',
      'Focus on how RAG provides external context at answer time instead of writing new knowledge into model parameters.',
    ),
    practice: loc(
      '为一个问答任务设计 chunk size、overlap、top_k 和引用格式，并把失败样本分成 retrieval、prompt、generation 或 evaluation 问题。',
      'Design chunk size, overlap, top_k, and citation format for a QA task, then classify failures as retrieval, prompt, generation, or evaluation problems.',
    ),
    outcome: loc(
      '能解释 RAG pipeline 中 query -> embedding -> retrieval -> context -> answer 每一步的输入输出和常见失败。',
      'You can explain the input, output, and common failures of query -> embedding -> retrieval -> context -> answer in a RAG pipeline.',
    ),
    concepts: [
      loc('token / context window', 'token / context window'),
      loc('embedding 检索', 'embedding retrieval'),
      loc('chunking / reranking', 'chunking / reranking'),
      loc('grounded answer', 'grounded answer'),
    ],
    action: loc('进入 LLM/RAG 基础', 'Open LLM/RAG Basics'),
  },
  {
    id: 'data-inputs',
    route: '/data-lab',
    duration: loc('第 2 周', 'Week 2'),
    title: loc('把真实数据整理成模型能读懂的输入', 'Turn raw data into model-ready inputs'),
    summary: loc(
      '机器学习并不是直接吃原始表格。你需要知道数值特征、类别特征、缺失值、异常值、数据划分和泄漏会怎样改变模型看到的世界。',
      'Machine learning does not consume raw tables directly. You need to know how numeric features, categorical features, missing values, outliers, splits, and leakage change what the model sees.',
    ),
    focus: loc(
      '区分“数据是什么”和“模型实际收到什么”，并把清洗、编码、划分和验证集放进同一条流水线。',
      'Separate what the data is from what the model actually receives, then connect cleaning, encoding, splitting, and validation into one pipeline.',
    ),
    practice: loc(
      '在 Data Lab 中比较 one-hot、清洗策略和 EDA 视图，记录每一步如何影响特征列、样本数和训练风险。',
      'In Data Lab, compare one-hot encoding, cleaning policies, and EDA views, then record how each step changes feature columns, sample count, and training risk.',
    ),
    outcome: loc(
      '能解释为什么同一模型在不同清洗和划分策略下会得到不同指标，并能识别数据泄漏风险。',
      'You can explain why the same model gets different metrics under different cleaning and splitting choices, and you can spot leakage risk.',
    ),
    concepts: [
      loc('数值特征', 'Numeric features'),
      loc('类别编码', 'Categorical encoding'),
      loc('EDA 与清洗', 'EDA and cleaning'),
      loc('训练/验证划分', 'Train/validation split'),
    ],
    action: loc('进入 Data Lab', 'Open Data Lab'),
  },
  {
    id: 'model-foundations',
    route: '/learn/loss-functions',
    duration: loc('第 3-4 周', 'Week 3-4'),
    title: loc('用基础模型看懂训练为什么会变好或变坏', 'Use foundation models to see why training improves or fails'),
    summary: loc(
      '从 loss 开始，把“错了多少”变成可优化目标；再看 gradient descent 如何更新参数，线性回归如何拟合趋势，逻辑回归和分类指标如何把概率变成决策。',
      'Start from loss, turning error into an optimization target. Then watch gradient descent update parameters, linear regression fit trends, and logistic regression plus metrics turn probabilities into decisions.',
    ),
    focus: loc(
      '把 loss 曲线、参数变化、决策边界、阈值和 precision/recall 的变化放在一起观察。',
      'Observe loss curves, parameter updates, decision boundaries, thresholds, and precision/recall changes together.',
    ),
    practice: loc(
      '依次完成 Loss、Gradient Descent、Linear Regression、Logistic Regression 和 Classification 的实验，主动制造震荡、欠拟合、过拟合和阈值偏移。',
      'Work through Loss, Gradient Descent, Linear Regression, Logistic Regression, and Classification labs, deliberately creating oscillation, underfitting, overfitting, and threshold shifts.',
    ),
    outcome: loc(
      '能判断 loss 下降是否真的代表泛化更好，并能解释一个指标变化背后的样本、阈值或模型能力原因。',
      'You can judge whether lower loss really means better generalization, and explain whether a metric changed because of data, threshold, or model capacity.',
    ),
    concepts: [
      loc('损失函数', 'Loss functions'),
      loc('梯度下降', 'Gradient descent'),
      loc('回归与分类', 'Regression and classification'),
      loc('评估指标', 'Evaluation metrics'),
    ],
    action: loc('从 Loss 开始', 'Start with Loss'),
  },
  {
    id: 'neural-networks',
    route: '/learn/mlp',
    duration: loc('第 5 周', 'Week 5'),
    title: loc('用 MLP 理解神经网络不是魔法，而是表征重写', 'Use MLP to see neural networks as representation rewriting'),
    summary: loc(
      '浅层 MLP 是进入深度学习前最合适的桥。它让你看到隐藏层如何把原始输入重新编码，激活函数如何引入非线性，容量如何同时带来表达能力和过拟合风险。',
      'A shallow MLP is the best bridge into deep learning. It shows how hidden layers recode inputs, how activations add nonlinearity, and how capacity brings both expressive power and overfitting risk.',
    ),
    focus: loc(
      '跟踪输入空间、隐藏空间、输出边界和训练/验证曲线，理解模型能力来自哪里。',
      'Track input space, hidden space, output boundary, and train/validation curves to understand where model capacity comes from.',
    ),
    practice: loc(
      '切换 hidden units、activation、regularization 和数据噪声，观察隐藏层热力图与决策边界如何同步变化。',
      'Change hidden units, activation, regularization, and data noise, then observe how hidden heatmaps and decision boundaries move together.',
    ),
    outcome: loc(
      '能说明“更多参数为什么可能更强也更危险”，并能用验证集曲线识别过拟合。',
      'You can explain why more parameters can be stronger and riskier, and use validation curves to identify overfitting.',
    ),
    concepts: [
      loc('隐藏层表征', 'Hidden representations'),
      loc('激活函数', 'Activations'),
      loc('反向传播', 'Backpropagation'),
      loc('容量与正则化', 'Capacity and regularization'),
    ],
    action: loc('进入 MLP Studio', 'Open MLP Studio'),
  },
  {
    id: 'review-loop',
    route: '/math-lab/diagnostic',
    duration: loc('第 6 周及之后', 'Week 6 and beyond'),
    title: loc('回到诊断与复盘，把知识连成可复现路径', 'Return to diagnosis and turn knowledge into a reproducible path'),
    summary: loc(
      '学完第一轮后，不要只看完成进度。回到诊断页和 checkpoint，检查自己是否能从问题出发，选数据处理方式、选择模型、解释训练现象，并复现实验结论。',
      'After the first pass, do not only check completion. Return to diagnostics and checkpoints to verify that you can start from a problem, choose data processing, choose a model, explain training behavior, and reproduce the result.',
    ),
    focus: loc(
      '用同一套变量语言复述数学、数据、模型和指标，找出仍然薄弱的环节。',
      'Use one consistent variable language to explain math, data, models, and metrics, then locate the weak links.',
    ),
    practice: loc(
      '重做薄弱章节的 checkpoint，把一次实验写成“设置 -> 观察 -> 解释 -> 下一步”的四句记录。',
      'Redo checkpoints in weak chapters and write each experiment as four lines: setup, observation, explanation, and next step.',
    ),
    outcome: loc(
      '能独立复现一个小实验，并清楚说明它验证了哪个数学或数据概念。',
      'You can independently reproduce a small experiment and clearly state which math or data concept it verifies.',
    ),
    concepts: [
      loc('诊断反馈', 'Diagnostic feedback'),
      loc('checkpoint 复盘', 'Checkpoint review'),
      loc('实验记录', 'Experiment notes'),
      loc('下一步路径', 'Next-step path'),
    ],
    action: loc('做一次诊断', 'Run diagnostic'),
  },
]

const beginnerRoadmap = computed(() =>
  beginnerRoadmapSource.map((roadmapStage) => ({
    id: roadmapStage.id,
    route: roadmapStage.route,
    duration: localizedText(roadmapStage.duration),
    title: localizedText(roadmapStage.title),
    summary: localizedText(roadmapStage.summary),
    focus: localizedText(roadmapStage.focus),
    practice: localizedText(roadmapStage.practice),
    outcome: localizedText(roadmapStage.outcome),
    concepts: roadmapStage.concepts.map(localizedText),
    action: localizedText(roadmapStage.action),
  })),
)

const roadmapIntro = computed(() => ({
  eyebrow: localizedText(beginnerRoadmapIntro.eyebrow),
  title: localizedText(beginnerRoadmapIntro.title),
  body: localizedText(beginnerRoadmapIntro.body),
  note: localizedText(beginnerRoadmapIntro.note),
}))

const readinessCheckSource: ReadinessCheck[] = [
  {
    title: loc('符号一致', 'Symbol consistency'),
    description: loc(
      '看到 x、w、b、ŷ、loss 时，能说出它们在公式、代码、图像和实验控件中的对应位置。',
      'When you see x, w, b, ŷ, and loss, you can point to the matching formula, code, visual, and control.',
    ),
  },
  {
    title: loc('实验可复现', 'Reproducible lab work'),
    description: loc(
      '能从默认 preset 开始，改变一个变量，记录结果，并通过重置再次得到同类现象。',
      'You can start from a preset, change one variable, record the result, and reproduce the same kind of behavior after reset.',
    ),
  },
  {
    title: loc('指标能解释', 'Metric explanation'),
    description: loc(
      'accuracy、precision、recall、loss 或 validation gap 变化时，能说清楚是数据、阈值还是模型能力导致。',
      'When accuracy, precision, recall, loss, or validation gap changes, you can explain whether data, threshold, or capacity caused it.',
    ),
  },
  {
    title: loc('双语能对齐', 'Bilingual alignment'),
    description: loc(
      '切换中英文后，仍能把同一个概念、变量和误区反馈对应起来，而不是重新背一套术语。',
      'After switching languages, you can still connect the same concept, variable, and misconception feedback instead of memorizing a second vocabulary.',
    ),
  },
]

const readinessChecks = computed(() =>
  readinessCheckSource.map((check) => ({
    title: localizedText(check.title),
    description: localizedText(check.description),
  })),
)

const footerText = computed(() =>
  locale.value === 'zh-CN'
    ? '从 AI 总览开始，学生能先建立地图，再进入数学、数据和模型实验。'
    : 'Start with AI Overview so students build a map before moving into math, data, and model labs.',
)
</script>

<template>
  <div class="home-view">
    <section class="hero home-hero">
      <div class="hero__copy">
        <span class="eyebrow">{{ t('home.eyebrow') }}</span>
        <h1>{{ t('home.title') }}</h1>
        <p>{{ t('home.subtitle') }}</p>
        <div class="hero__actions">
          <router-link class="action-button action-button--primary" :to="primaryRoute">
            {{ t('home.ctaPrimary') }}
          </router-link>
          <a class="action-button" href="#beginner-roadmap" @click="scrollToRoadmap">
            {{ t('home.ctaSecondary') }}
          </a>
        </div>
      </div>

      <div class="hero__visual">
        <div class="hero__poster">
          <div class="hero__grid" />
          <div class="hero__poster-copy">
            <span>{{ t('home.posterTitle') }}</span>
            <p>{{ posterBody }}</p>
          </div>
        </div>

        <div class="hero__highlights">
          <article
            v-for="(highlight, index) in highlights"
            :key="`${highlight}-${index}`"
            class="hero-highlight"
          >
            <span>{{ `0${index + 1}` }}</span>
            <p>{{ highlight }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="modules" class="modules-section">
      <div class="modules-section__intro">
        <header class="section-header">
          <span class="eyebrow">{{ t('nav.modules') }}</span>
          <h2>{{ t('home.modulesTitle') }}</h2>
          <p>{{ modulesBody }}</p>
        </header>
        <p class="modules-section__note">{{ modulesNote }}</p>
      </div>

      <div class="module-gallery">
        <router-link
          v-for="(moduleDefinition, index) in moduleOrder"
          :key="moduleDefinition.slug"
          class="module-teaser"
          :style="{ '--teaser-accent': moduleDefinition.accent, '--teaser-bg': moduleDefinition.theme }"
          :to="moduleDefinition.route"
        >
          <div class="module-teaser__meta">
            <span>{{ t(moduleDefinition.kickerKey) }}</span>
            <em>{{ `0${index + 1}` }}</em>
          </div>
          <strong>{{ t(moduleDefinition.titleKey) }}</strong>
          <p>{{ t(moduleDefinition.summaryKey) }}</p>
          <small>{{ t('actions.openModule') }}</small>
        </router-link>
      </div>
    </section>

    <section class="home-learning-routes" aria-labelledby="home-learning-routes-title">
      <div class="section-header">
        <span class="eyebrow">{{ locale === 'zh-CN' ? '路线入口' : 'Route entry' }}</span>
        <h2 id="home-learning-routes-title">{{ locale === 'zh-CN' ? '按路线继续学习' : 'Continue by route' }}</h2>
      </div>
      <div class="home-learning-routes__grid">
        <LearningRouteSummary
          v-for="routeDefinition in highlightedLearningRoutes"
          :key="routeDefinition.id"
          :route="routeDefinition"
          :modules="mathLabModules"
          :completed-module-ids="mathLabProgress.completedModuleIds"
          :locale="currentMathLocale"
        />
      </div>
    </section>

    <section id="beginner-roadmap" class="beginner-roadmap" aria-labelledby="beginner-roadmap-title">
      <div class="beginner-roadmap__intro">
        <header class="section-header">
          <span class="eyebrow">{{ roadmapIntro.eyebrow }}</span>
          <h2 id="beginner-roadmap-title">{{ roadmapIntro.title }}</h2>
          <p>{{ roadmapIntro.body }}</p>
        </header>
        <p class="beginner-roadmap__note">{{ roadmapIntro.note }}</p>
      </div>

      <div class="roadmap-timeline">
        <article
          v-for="(roadmapStage, index) in beginnerRoadmap"
          :key="roadmapStage.id"
          class="roadmap-stage"
        >
          <div class="roadmap-stage__marker" aria-hidden="true">
            <span>{{ `0${index + 1}` }}</span>
          </div>

          <div class="roadmap-stage__body">
            <div class="roadmap-stage__heading">
              <span>{{ roadmapStage.duration }}</span>
              <h3>{{ roadmapStage.title }}</h3>
              <p>{{ roadmapStage.summary }}</p>
            </div>

            <ul class="roadmap-stage__concepts" :aria-label="roadmapLabels.concepts">
              <li v-for="concept in roadmapStage.concepts" :key="concept">
                {{ concept }}
              </li>
            </ul>

            <dl class="roadmap-stage__details">
              <div>
                <dt>{{ roadmapLabels.focus }}</dt>
                <dd>{{ roadmapStage.focus }}</dd>
              </div>
              <div>
                <dt>{{ roadmapLabels.practice }}</dt>
                <dd>{{ roadmapStage.practice }}</dd>
              </div>
              <div>
                <dt>{{ roadmapLabels.outcome }}</dt>
                <dd>{{ roadmapStage.outcome }}</dd>
              </div>
            </dl>

            <router-link class="roadmap-stage__link" :to="roadmapStage.route">
              {{ roadmapStage.action }}
            </router-link>
          </div>
        </article>
      </div>

      <aside class="roadmap-checklist" aria-labelledby="roadmap-checklist-title">
        <div>
          <span class="eyebrow">{{ roadmapLabels.outcome }}</span>
          <h3 id="roadmap-checklist-title">{{ roadmapLabels.checksTitle }}</h3>
          <p>{{ roadmapLabels.checksBody }}</p>
        </div>

        <div class="roadmap-checklist__list">
          <article v-for="check in readinessChecks" :key="check.title" class="roadmap-check">
            <strong>{{ check.title }}</strong>
            <p>{{ check.description }}</p>
          </article>
        </div>
      </aside>
    </section>

    <section class="path-section">
      <div class="path-layout">
        <header class="section-header">
          <span class="eyebrow">{{ t('common.overview') }}</span>
          <h2>{{ t('home.pathTitle') }}</h2>
          <p>{{ pathBody }}</p>
        </header>

        <div class="path-grid">
          <article v-for="(step, index) in learningPath" :key="index" class="path-step">
            <span>{{ `0${index + 1}` }}</span>
            <p>{{ step }}</p>
          </article>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <p>{{ footerText }}</p>
      <router-link class="action-button" :to="primaryRoute">
        {{ t('actions.launch') }}
      </router-link>
    </footer>
  </div>
</template>
