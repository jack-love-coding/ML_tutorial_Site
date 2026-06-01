<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, StorySection } from '../types/ml'

const props = defineProps<{
  section: StorySection
}>()

const { locale } = useI18n()
const selectedScenario = ref('house-price')

function loc<T>(zhCN: T, en: T) {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

const scenarios = [
  {
    id: 'house-price',
    taskType: loc('监督学习 / 回归', 'Supervised learning / regression'),
    title: loc('根据房屋特征预测价格', 'Predict price from house features'),
    input: loc('面积、房龄、位置、房间数', 'Area, age, location, room count'),
    target: loc('成交价格', 'Sale price'),
    feedback: loc('MSE / MAE / 验证误差', 'MSE / MAE / validation error'),
  },
  {
    id: 'spam',
    taskType: loc('监督学习 / 分类', 'Supervised learning / classification'),
    title: loc('判断邮件是否是垃圾邮件', 'Detect whether an email is spam'),
    input: loc('邮件文本、发件人、链接特征', 'Email text, sender, link features'),
    target: loc('垃圾邮件 / 正常邮件', 'Spam / not spam'),
    feedback: loc('Precision、Recall、F1', 'Precision, recall, F1'),
  },
  {
    id: 'customer-cluster',
    taskType: loc('无监督学习 / 聚类', 'Unsupervised learning / clustering'),
    title: loc('把相似用户分成不同群组', 'Group similar users'),
    input: loc('访问频率、购买金额、偏好向量', 'Visit frequency, spend, preference vector'),
    target: loc('没有人工标签', 'No human label'),
    feedback: loc('组内相似度、可解释性、业务复盘', 'Cluster cohesion, interpretability, business review'),
  },
  {
    id: 'rag-answer',
    taskType: loc('生成式 AI / RAG', 'Generative AI / RAG'),
    title: loc('基于资料回答课程问题', 'Answer course questions from references'),
    input: loc('问题、检索片段、上下文窗口', 'Question, retrieved chunks, context window'),
    target: loc('有根据的回答', 'Grounded answer'),
    feedback: loc('事实一致性、引用覆盖、人工检查', 'Factuality, citation coverage, human review'),
  },
]

const activeScenario = computed(
  () => scenarios.find((scenario) => scenario.id === selectedScenario.value) ?? scenarios[0],
)

const taskCards = computed(() =>
  scenarios.map((scenario) => ({
    id: scenario.id,
    label: localized(scenario.taskType),
    title: localized(scenario.title),
  })),
)

const pipelineSteps = computed(() =>
  localized(
    loc(
      [
        { label: '问题', body: '先问：要帮谁做什么判断？哪些信息不能偷看？' },
        { label: '数据', body: '再问：样本干净吗？是否已划分 train/validation/test？' },
        { label: '模型', body: '从 baseline 开始，不急着上复杂模型' },
        { label: '预测', body: '看清输出：数值、概率、分组，还是生成内容' },
        { label: '反馈', body: '用 loss、metric 和错误样本指出哪里没学好' },
        { label: '迭代', body: '调参、改数据、换模型之前，先解释为什么' },
      ],
      [
        { label: 'Problem', body: 'Define inputs, target, success metric, and forbidden information' },
        { label: 'Data', body: 'Clean, encode, inspect, and split train/validation/test' },
        { label: 'Model', body: 'Start with a baseline, then increase model capacity' },
        { label: 'Prediction', body: 'Output a number, probability, group, or generated content' },
        { label: 'Feedback', body: 'Use loss/metric/error cases to explain behavior' },
        { label: 'Iteration', body: 'Tune, improve data, change model, then review' },
      ],
    ),
  ),
)

const layerCards = computed(() =>
  localized(
    loc(
      [
        { label: '监督学习', body: '有标准答案，学习 x -> y。先判断答案是数值还是类别。' },
        { label: '无监督学习', body: '没有答案本，先让模型找分组、低维结构或异常点。' },
        { label: '深度学习', body: '多层参数学习中间表示，它是方法，不是任务标签。' },
        { label: '生成式 AI', body: '学习数据分布并生成新内容，仍要追问事实和评价。' },
      ],
      [
        { label: 'Supervised', body: 'Uses labels and learns x -> y. Regression predicts numbers; classification predicts classes.' },
        { label: 'Unsupervised', body: 'Has no answer key and finds groups, low-dimensional structure, or anomalies.' },
        { label: 'Deep learning', body: 'Learns intermediate representations through layers; it is not a task type.' },
        { label: 'Generative AI', body: 'Learns data distributions and creates new content, still requiring training and evaluation.' },
      ],
    ),
  ),
)

const ragSteps = computed(() =>
  localized(
    loc(
      ['Query', 'Tokenize', 'Embed', 'Retrieve', 'Assemble context', 'Answer + evaluate'],
      ['Query', 'Tokenize', 'Embed', 'Retrieve', 'Assemble context', 'Answer + evaluate'],
    ),
  ),
)

const sectionMode = computed(() => props.section.id)
</script>

<template>
  <section class="overview-lab">
    <header class="overview-lab__header">
      <span>{{ locale === 'zh-CN' ? '概览实验台' : 'Overview lab' }}</span>
      <strong>{{ locale === 'zh-CN' ? '老师会先问的三件事' : 'The first questions a teacher asks' }}</strong>
    </header>

    <div class="overview-lab__task-grid">
      <button
        v-for="scenario in taskCards"
        :key="scenario.id"
        type="button"
        class="overview-lab__scenario"
        :class="{ 'is-active': selectedScenario === scenario.id }"
        @click="selectedScenario = scenario.id"
      >
        <span>{{ scenario.label }}</span>
        <strong>{{ scenario.title }}</strong>
      </button>
    </div>

    <article class="overview-lab__scenario-detail">
      <div>
        <span>{{ locale === 'zh-CN' ? '当前场景：先拆任务' : 'Current scenario: decompose the task' }}</span>
        <strong>{{ localized(activeScenario.title) }}</strong>
      </div>
      <dl>
        <div>
          <dt>{{ locale === 'zh-CN' ? '输入' : 'Input' }}</dt>
          <dd>{{ localized(activeScenario.input) }}</dd>
        </div>
        <div>
          <dt>{{ locale === 'zh-CN' ? '目标' : 'Target' }}</dt>
          <dd>{{ localized(activeScenario.target) }}</dd>
        </div>
        <div>
          <dt>{{ locale === 'zh-CN' ? '反馈' : 'Feedback' }}</dt>
          <dd>{{ localized(activeScenario.feedback) }}</dd>
        </div>
      </dl>
    </article>

    <section v-if="sectionMode === 'learning-types' || sectionMode === 'deep-learning'" class="overview-lab__layers">
      <article v-for="card in layerCards" :key="card.label" class="overview-lab__layer-card">
        <strong>{{ card.label }}</strong>
        <p>{{ card.body }}</p>
      </article>
    </section>

    <section v-else-if="sectionMode === 'generative-ai'" class="overview-lab__rag">
      <span
        v-for="step in ragSteps"
        :key="step"
        class="overview-lab__rag-step"
      >
        {{ step }}
      </span>
    </section>

    <section v-else class="overview-lab__pipeline">
      <article v-for="(step, index) in pipelineSteps" :key="step.label" class="overview-lab__flow-step">
        <span>{{ `0${index + 1}` }}</span>
        <strong>{{ step.label }}</strong>
        <p>{{ step.body }}</p>
      </article>
    </section>
  </section>
</template>
