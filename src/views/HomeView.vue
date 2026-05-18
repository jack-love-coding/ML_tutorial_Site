<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'
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

const primaryRoute = computed(() => '/math-lab')

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
        'ML Models：loss、gradient descent、linear/logistic regression、classification 和 MLP',
        'Deep Learning：以 MLP 为入口，后续扩展 CNN、Attention、Transformer 和优化器对比',
      ]
    : [
        'Math Lab: vectors, matrices, Taylor series, probability, optimization, SVD/PCA, autodiff, and architecture math',
        'Data Lab: numeric features, categorical features, cleaning, EDA, splits, complexity, and regularization',
        'ML Models: loss, gradient descent, linear/logistic regression, classification, and MLP',
        'Deep Learning: start with MLP, then extend toward CNN, Attention, Transformers, and optimizer comparisons',
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
    route: '/math-lab',
    duration: loc('第 0-1 周', 'Week 0-1'),
    title: loc('先建立数学直觉，不急着推公式', 'Build math intuition before deriving formulas'),
    summary: loc(
      '把向量看成特征列表，把矩阵看成空间变换，把函数图像看成模型行为的可视化入口。学习目标不是证明所有定理，而是知道每个符号在实验里对应什么。',
      'Treat vectors as feature lists, matrices as transformations, and function plots as the visual entry point to model behavior. The goal is not to prove every theorem; it is to know what each symbol means in the lab.',
    ),
    focus: loc(
      '理解 x、w、b、ŷ、loss、gradient 这些变量如何在图像、公式和代码中保持同一含义。',
      'Understand how x, w, b, ŷ, loss, and gradient keep the same meaning across visuals, formulas, and code.',
    ),
    practice: loc(
      '在 Math Lab 中拖动向量、观察矩阵变换、改变 Taylor 近似阶数，并用一句话解释图像为什么变化。',
      'In Math Lab, drag vectors, inspect matrix transforms, change Taylor approximation order, and explain in one sentence why the visual changed.',
    ),
    outcome: loc(
      '能说明“特征如何进入模型”“梯度为什么指向下降方向”“概率为什么能描述不确定性”。',
      'You can explain how features enter a model, why gradients point downhill, and why probability represents uncertainty.',
    ),
    concepts: [
      loc('向量与特征', 'Vectors and features'),
      loc('矩阵变换', 'Matrix transforms'),
      loc('Taylor 与局部近似', 'Taylor and local approximation'),
      loc('梯度与概率', 'Gradient and probability'),
    ],
    action: loc('进入 Math Lab', 'Open Math Lab'),
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
    ? '从 Math Lab 开始，学生能先补齐直觉，再进入数据和模型实验。'
    : 'Start in Math Lab so students build intuition before moving into data and model labs.',
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
