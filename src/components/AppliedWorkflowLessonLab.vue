<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, ModuleSlug, StorySection } from '../types/ml'

const props = defineProps<{
  moduleSlug: ModuleSlug
  section: StorySection
}>()

const { locale } = useI18n()
const selectedCell = ref('question')
const selectedStage = ref('csv')

function loc<T>(zhCN: T, en: T) {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

const activeWorkflow = computed(() =>
  props.moduleSlug === 'housing-price-project' ? 'housing' : 'python',
)

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

const activeNotebookCell = computed(
  () => notebookCells.value.find((cell) => cell.id === selectedCell.value) ?? notebookCells.value[0],
)

const activeHousingStage = computed(
  () => housingStages.value.find((stage) => stage.id === selectedStage.value) ?? housingStages.value[0],
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

    <section v-else class="workflow-lab__pipeline">
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
  </section>
</template>
