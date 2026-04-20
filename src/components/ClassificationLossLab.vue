<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ExperimentConfig, ExperimentConfigValue, TrainingSnapshot, WorkedExampleRow } from '../types/ml'
import { round, sigmoid } from '../utils/math'
import ClassificationViz from './ClassificationViz.vue'
import LossCurvePlot from './LossCurvePlot.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  accent: string
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'update-config': [key: string, value: ExperimentConfigValue]
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        probabilityPenalty: '概率惩罚',
        confidenceExamples: '三种典型预测',
        confidenceMap: '概率背景示意',
        multiclass: '多分类扩展',
        trueLabel: '真实标签',
        predictedProbability: '预测概率 p',
        boundaryShift: '决策平移',
        binary: '二分类交叉熵 (BCE)',
        softmax: 'Softmax 交叉熵',
        currentLoss: '当前损失',
        confidentCorrect: '正确且自信',
        hesitantCorrect: '正确但犹豫',
        confidentMistake: '错误且自信',
        confidentCorrectNote: '模型把高概率给到了真实类别。',
        hesitantCorrectNote: '模型方向对了，但还不够坚定。',
        confidentMistakeNote: '模型把高概率给到了错误类别，所以惩罚最大。',
        softmaxIntro:
          'Softmax 不是“和 BCE 完全无关的新公式”。它是把“给真类更高概率”这件事，从二分类推广到互斥多分类时得到的自然版本。',
        sectionConcept: 'Concept',
        sectionFormula: 'Formula',
        sectionRemember: 'Remember This',
        softmaxConceptTitle: '先从“概率预算”理解 Softmax',
        softmaxConceptBody:
          'BCE 只需要一个概率，是因为二分类里另一类自动就是 1 - p。可是一旦有 3 个或更多互斥类别，模型就必须把总共为 1 的概率预算分给所有候选类，所以不能再像 BCE 那样只输出一个独立概率。',
        softmaxTransitionTitle: 'BCE 是怎样“长成” Softmax 的？',
        softmaxTransitionBody:
          '当类别只剩两个时，softmax 的分母里只有两项，它会退化成 sigmoid。再把交叉熵写成“只看真类概率”的形式，就回到了 BCE。所以 softmax 不是另起炉灶，而是把 BCE 从二分类推广到多分类。',
        softmaxRememberTitle: '读完这一块要记住什么？',
        softmaxRememberBody:
          'BCE 问的是“正类有多大概率”；softmax cross-entropy 问的是“真类在所有竞争类里分到了多少概率”。问题没变，只是竞争者变多了。',
        softmaxMemoryLine:
          '先用分数比较所有类，再把它们归一化成概率；最后交叉熵只惩罚“真类概率还不够高”这件事。',
        bridgeTitle: '从 BCE 走到 Softmax',
        bridgeBinary: '二分类里只需要一个概率，因为另一个类自动是 1 - p。',
        bridgeMulticlass: '多分类里必须同时输出整组概率，而且它们要一起加总为 1。',
        bridgeNormalize: 'Softmax 先比较各类分数，再把它们归一化成合法概率分布。',
        binaryMargin: '二分类所需 logit 差',
        softmaxMargin: '三分类所需领先分数',
        denominator: 'Softmax 分母',
        workedExample: '当前三分类手算例子',
        sigmoidCounterexample: '为什么不能每类都用一个 sigmoid',
        logitColumn: 'logit z',
        expColumn: 'exp(z)',
        probabilityColumn: '归一化概率',
        sigmoidColumn: '独立 sigmoid 概率',
        trueClass: '真实类',
        competitor: '竞争类',
        sigmoidSum: '三项 sigmoid 相加',
        sigmoidNote:
          '如果把同一组 logits 分别喂给三个 sigmoid，你会得到三项“各自看起来合理”的概率，但它们通常不会加起来等于 1，所以不适合互斥多分类。',
        sigmoidUseCase:
          '独立 sigmoid 更适合多标签任务，因为一个样本确实可以同时属于多个类；而 softmax 面对的是互斥分类，只允许把概率预算分给其中一个主类。',
        multiclassNote:
          '关键变化只有一个：二分类时分母里只有 2 项，多分类时分母里要把所有竞争类别都加进来，所以同样想把真类概率推高，所需领先分数会更大。',
      }
    : {
        probabilityPenalty: 'Probability penalty',
        confidenceExamples: 'Three typical predictions',
        confidenceMap: 'Probability background',
        multiclass: 'Multiclass extension',
        trueLabel: 'True label',
        predictedProbability: 'Predicted probability p',
        boundaryShift: 'Decision shift',
        binary: 'Binary cross-entropy (BCE)',
        softmax: 'Softmax cross-entropy',
        currentLoss: 'Current loss',
        confidentCorrect: 'Correct and confident',
        hesitantCorrect: 'Correct but hesitant',
        confidentMistake: 'Wrong and confident',
        confidentCorrectNote: 'The model gives a high probability to the true class.',
        hesitantCorrectNote: 'The model leans the right way, but not confidently enough.',
        confidentMistakeNote: 'The model assigns high confidence to the wrong class, so the penalty is largest.',
        softmaxIntro:
          'Softmax is not a totally unrelated new formula. It is the natural extension of BCE once “give more probability to the true class” must work over multiple mutually exclusive classes.',
        sectionConcept: 'Concept',
        sectionFormula: 'Formula',
        sectionRemember: 'Remember This',
        softmaxConceptTitle: 'Start with the idea of a shared probability budget',
        softmaxConceptBody:
          'BCE needs only one free probability because in binary classification the other class is automatically 1 - p. Once we move to three or more mutually exclusive classes, the model must distribute a total budget of 1 across every candidate class, so a single standalone probability is no longer enough.',
        softmaxTransitionTitle: 'How does BCE turn into softmax?',
        softmaxTransitionBody:
          'When only two classes remain, the softmax denominator has just two terms, so it collapses into a sigmoid. If we then write cross-entropy as “look only at the true-class probability,” we are back at BCE. Softmax is not a separate story; it is BCE extended from binary classification to multiclass classification.',
        softmaxRememberTitle: 'What should you remember here?',
        softmaxRememberBody:
          'BCE asks, “how much probability did the positive class receive?” Softmax cross-entropy asks, “how much probability did the true class receive among all competitors?” The question stays the same; only the number of competitors changes.',
        softmaxMemoryLine:
          'First compare class scores, then normalize them into probabilities, and finally penalize the model when the true-class probability is still too low.',
        bridgeTitle: 'From BCE to softmax',
        bridgeBinary: 'In binary classification, one probability is enough because the other class is automatically 1 - p.',
        bridgeMulticlass: 'In multiclass classification, we need a full probability vector and all entries must add up to 1.',
        bridgeNormalize: 'Softmax compares class scores, exponentiates them, and normalizes them into a valid distribution.',
        binaryMargin: 'Binary logit gap',
        softmaxMargin: 'Three-class lead score',
        denominator: 'Softmax denominator',
        workedExample: 'Current three-class worked example',
        sigmoidCounterexample: 'Why not one sigmoid per class?',
        logitColumn: 'logit z',
        expColumn: 'exp(z)',
        probabilityColumn: 'normalized probability',
        sigmoidColumn: 'independent sigmoid probability',
        trueClass: 'true class',
        competitor: 'competing class',
        sigmoidSum: 'sum of three sigmoids',
        sigmoidNote:
          'If we feed the same logits into three separate sigmoids, each number may look reasonable on its own, but the outputs usually do not add up to 1, so they are not a valid distribution for mutually exclusive classes.',
        sigmoidUseCase:
          'Independent sigmoids are better for multi-label tasks, where one sample can truly belong to multiple classes at once. Softmax is for mutually exclusive classification, where the probability budget must be shared.',
        multiclassNote:
          'The only real change is the denominator: binary classification has two terms, while multiclass softmax must sum over every competing class. That is why the lead score must grow even when the desired true-class probability looks similar.',
      },
)

const classificationLabel = computed(() => Number(props.config.classificationLabel ?? 1))
const probability = computed(() => Number(props.config.probability ?? 0.76))

const curveSpecs = computed(() => [
  {
    id: 'bce-positive',
    label: 'y = 1',
    color: '#ff7d4d',
    points: props.snapshot?.lossCurves?.bcePositive ?? [],
  },
  {
    id: 'bce-negative',
    label: 'y = 0',
    color: '#3f6dff',
    points: props.snapshot?.lossCurves?.bceNegative ?? [],
  },
])

const markerPoints = computed(() => [
  {
    id: 'bce-marker',
    x: probability.value,
    y: Number(props.snapshot?.selectedObservation?.bce ?? 0),
    color: classificationLabel.value === 1 ? '#ff7d4d' : '#3f6dff',
  },
])

const confidenceCases = computed(() => [
  {
    id: 'correct-confident',
    title: copy.value.confidentCorrect,
    probability: 0.99,
    loss: Number(props.snapshot?.selectedObservation?.confidentCorrectLoss ?? 0),
    tone: 'positive',
    note: copy.value.confidentCorrectNote,
  },
  {
    id: 'correct-hesitant',
    title: copy.value.hesitantCorrect,
    probability: 0.55,
    loss: Number(props.snapshot?.selectedObservation?.hesitantCorrectLoss ?? 0),
    tone: 'neutral',
    note: copy.value.hesitantCorrectNote,
  },
  {
    id: 'wrong-confident',
    title: copy.value.confidentMistake,
    probability: 0.01,
    loss: Number(props.snapshot?.selectedObservation?.confidentMistakeLoss ?? 0),
    tone: 'caution',
    note: copy.value.confidentMistakeNote,
  },
])

const softmaxRows = computed(() => props.snapshot?.workedExampleRows ?? [])

const independentSigmoidRows = computed(() =>
  softmaxRows.value.map((row) => ({
    ...row,
    sigmoidProbability: sigmoid(row.input),
  })),
)

const independentSigmoidSum = computed(() =>
  independentSigmoidRows.value.reduce((sum, row) => sum + row.sigmoidProbability, 0),
)

const softmaxLessonCards = computed(() => [
  {
    id: 'concept',
    eyebrow: copy.value.sectionConcept,
    title: copy.value.softmaxConceptTitle,
    body: copy.value.softmaxConceptBody,
  },
  {
    id: 'transition',
    eyebrow: copy.value.bridgeTitle,
    title: copy.value.softmaxTransitionTitle,
    body: copy.value.softmaxTransitionBody,
  },
  {
    id: 'remember',
    eyebrow: copy.value.sectionRemember,
    title: copy.value.softmaxRememberTitle,
    body: copy.value.softmaxRememberBody,
  },
])

const softmaxStats = computed(() => [
  {
    id: 'softmax-loss',
    label: copy.value.currentLoss,
    value: round(Number(props.snapshot?.selectedObservation?.multiclassCrossEntropy ?? 0)),
  },
  {
    id: 'binary-margin',
    label: copy.value.binaryMargin,
    value: round(Number(props.snapshot?.selectedObservation?.binaryMargin ?? 0), 2),
  },
  {
    id: 'softmax-margin',
    label: copy.value.softmaxMargin,
    value: round(Number(props.snapshot?.selectedObservation?.softmaxMargin ?? 0), 2),
  },
  {
    id: 'softmax-denominator',
    label: copy.value.denominator,
    value: round(Number(props.snapshot?.selectedObservation?.softmaxDenominator ?? 0), 2),
  },
])

const sigmoidCounterexampleSource = computed(() => {
  const softmaxMargin = round(Number(props.snapshot?.selectedObservation?.softmaxMargin ?? 0), 2)
  const sigmoidA = round(independentSigmoidRows.value[0]?.sigmoidProbability ?? 0, 3)
  const sigmoidB = round(independentSigmoidRows.value[1]?.sigmoidProbability ?? 0, 3)
  const sigmoidC = round(independentSigmoidRows.value[2]?.sigmoidProbability ?? 0, 3)
  const sigmoidSum = round(independentSigmoidSum.value, 3)

  return locale.value === 'zh-CN'
    ? `**为什么不能把多分类写成“每类一个 sigmoid”？**

继续使用同一组分数：

$$z=[${softmaxMargin}, 0, 0]$$

如果我们错误地让每个类别各自过一个 sigmoid，就会得到：

$$q_A = \\sigma(${softmaxMargin}) \\approx ${sigmoidA}$$
$$q_B = \\sigma(0) = ${sigmoidB}$$
$$q_C = \\sigma(0) = ${sigmoidC}$$

看起来每个值都像概率，但把它们加起来：

$$q_A + q_B + q_C \\approx ${sigmoidSum}$$

这已经明显大于 1。  
所以这些输出不能被解释成“互斥类别之间的概率分配”。

这并不是 sigmoid 不好，而是它回答的问题不同。  
独立 sigmoid 更适合 **多标签任务**，例如一张图片可以同时包含“海滩、夕阳、人物”；  
而 softmax 适合 **互斥多分类**，例如一张手写数字图片只能主要属于 0 到 9 中的一个类。`
    : `**Why not write multiclass classification as “one sigmoid per class”?**

Keep the same score vector:

$$z=[${softmaxMargin}, 0, 0]$$

If we incorrectly pass each class through its own sigmoid, we get:

$$q_A = \\sigma(${softmaxMargin}) \\approx ${sigmoidA}$$
$$q_B = \\sigma(0) = ${sigmoidB}$$
$$q_C = \\sigma(0) = ${sigmoidC}$$

Each value looks probability-like on its own, but when we add them:

$$q_A + q_B + q_C \\approx ${sigmoidSum}$$

the total is already greater than 1.  
So these outputs cannot be interpreted as a probability distribution over mutually exclusive classes.

This does not mean sigmoid is bad. It means it answers a different question.  
Independent sigmoids are ideal for **multi-label tasks**, such as an image that can contain “beach, sunset, and people” at the same time.  
Softmax is for **mutually exclusive multiclass classification**, where the sample should mainly belong to one class among many.`
})

const softmaxFormulaSource = computed(() => {
  const binaryMargin = round(Number(props.snapshot?.selectedObservation?.binaryMargin ?? 0), 2)
  const softmaxMargin = round(Number(props.snapshot?.selectedObservation?.softmaxMargin ?? 0), 2)
  const trueProbability = round(Number(props.snapshot?.selectedObservation?.softmaxTrueProbability ?? 0), 3)

  return locale.value === 'zh-CN'
    ? `**为什么 BCE 会自然走到 Softmax？**

在二分类里，如果我们已经知道正类概率是 $p$，那么负类概率就自动是 $1-p$。  
所以 BCE 只需要盯住一个概率。

但一旦类别超过 2 个，只给一个 $p$ 就不够了。  
我们需要一整组概率，而且它们必须满足：

$$p_A + p_B + p_C = 1$$

这时更自然的做法是先让模型输出每个类别的原始分数 $z_i$，再统一归一化：

$$\\text{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

在当前例子里，我们把真实类固定为 $A$，并令分数向量写成：

$$z=[${softmaxMargin}, 0, 0]$$

于是：

$$p_A=\\frac{e^{${softmaxMargin}}}{e^{${softmaxMargin}}+e^0+e^0}\\approx ${trueProbability}$$

多分类交叉熵仍然只是在问：**真实类最后拿到了多高的概率？**

$$\\text{CE}(\\mathbf{y},\\mathbf{p})=-\\sum_i y_i\\log p_i = -\\log p_{\\text{true}}$$

如果只剩两个类别，Softmax 会立刻退化成 Sigmoid：

$$\\frac{e^{z_1}}{e^{z_0}+e^{z_1}} = \\frac{1}{1+e^{-(z_1-z_0)}} = \\sigma(z_1-z_0)$$

这就是从 BCE 走到 Softmax 的关键桥梁。  
二类 Softmax 本质上就是 Sigmoid，所以 **BCE 可以看成 Softmax cross-entropy 在二分类下的特例**。  
当前如果只看二分类，同样的目标概率对应的 logit 差大约是 $${binaryMargin}$$。`
    : `**Why does BCE naturally grow into softmax?**

In binary classification, once we know the positive-class probability $p$, the other class is automatically $1-p$.  
That is why BCE only needs to track one free probability.

But once we have more than two classes, a single $p$ is no longer enough.  
We need a full probability vector, and it must satisfy:

$$p_A + p_B + p_C = 1$$

The natural move is to let the model output one raw score $z_i$ per class and then normalize them together:

$$\\text{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

In the current example, we keep the true class fixed as $A$ and write the score vector as:

$$z=[${softmaxMargin}, 0, 0]$$

So:

$$p_A=\\frac{e^{${softmaxMargin}}}{e^{${softmaxMargin}}+e^0+e^0}\\approx ${trueProbability}$$

Multiclass cross-entropy is still asking the same question: **how much probability did the true class receive?**

$$\\text{CE}(\\mathbf{y},\\mathbf{p})=-\\sum_i y_i\\log p_i = -\\log p_{\\text{true}}$$

If only two classes remain, softmax immediately collapses into sigmoid:

$$\\frac{e^{z_1}}{e^{z_0}+e^{z_1}} = \\frac{1}{1+e^{-(z_1-z_0)}} = \\sigma(z_1-z_0)$$

That is the key bridge from BCE to softmax.  
Two-class softmax is really sigmoid in disguise, so **BCE is the binary special case of softmax cross-entropy**.  
For the same target probability in the binary case, the needed logit gap is about $${binaryMargin}$$.`
})

function setLabel(nextLabel: 0 | 1) {
  emit('patch-config', {
    lossFamily: 'classification',
    classificationLabel: nextLabel,
  })
}

function onNumericInput(key: 'probability' | 'decisionBias', event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', {
    lossFamily: 'classification',
    [key]: Number(target.value),
  })
}

function barLabel(index: number) {
  if (locale.value === 'zh-CN') return `类别 ${String.fromCharCode(65 + index)}`
  return `Class ${String.fromCharCode(65 + index)}`
}

function rowTitle(row: WorkedExampleRow) {
  if (locale.value === 'zh-CN') return `类别 ${row.label}`
  return `Class ${row.label}`
}

function rowNote(row: WorkedExampleRow) {
  const isTrueClass = row.id === 'class-0'
  return isTrueClass ? copy.value.trueClass : copy.value.competitor
}
</script>

<template>
  <section class="lesson-lab lesson-lab--classification">
    <div class="lesson-lab__controls">
      <div class="lesson-lab__heading">
        <span>{{ copy.probabilityPenalty }}</span>
        <strong>{{ copy.binary }}</strong>
      </div>

      <div class="control-group__grid">
        <label class="control">
          <span class="control__row">
            <span>{{ copy.trueLabel }}</span>
          </span>
          <div class="toggle-strip">
            <button
              type="button"
              class="toggle-strip__button"
              :class="{ 'is-active': classificationLabel === 0 }"
              @click="setLabel(0)"
            >
              y = 0
            </button>
            <button
              type="button"
              class="toggle-strip__button"
              :class="{ 'is-active': classificationLabel === 1 }"
              @click="setLabel(1)"
            >
              y = 1
            </button>
          </div>
        </label>

        <label class="control">
          <span class="control__row">
            <span>{{ copy.predictedProbability }}</span>
            <strong>{{ round(probability) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            :value="probability"
            @input="onNumericInput('probability', $event)"
          />
        </label>
      </div>
    </div>

    <div class="lesson-lab__visual">
      <div class="lesson-lab__heading">
        <span>{{ copy.probabilityPenalty }}</span>
        <strong>{{ copy.binary }}</strong>
      </div>
      <LossCurvePlot :curves="curveSpecs" :marker-x="probability" :marker-points="markerPoints" />
      <div class="confidence-case-list">
        <article
          v-for="item in confidenceCases"
          :key="item.id"
          class="confidence-case"
          :class="`confidence-case--${item.tone}`"
        >
          <span>{{ item.title }}</span>
          <strong>p = {{ round(item.probability, 2) }}</strong>
          <small>{{ round(item.loss) }}</small>
          <p>{{ item.note }}</p>
        </article>
      </div>
    </div>

    <div class="lesson-lab__summary lesson-lab__summary--classification">
      <section class="lesson-lab__panel lesson-lab__panel--classification-map">
        <div class="lesson-lab__heading">
          <span>{{ copy.confidenceMap }}</span>
          <strong>{{ copy.boundaryShift }}</strong>
        </div>
        <ClassificationViz
          class="lesson-classification-viz"
          slug="logistic-regression"
          :snapshot="props.snapshot"
          :accent="props.accent"
          :size="400"
          focus-target="background"
        />
        <label class="control">
          <span class="control__row">
            <span>{{ copy.boundaryShift }}</span>
            <strong>{{ round(Number(props.config.decisionBias ?? 0.05)) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="-1.2"
            max="1.2"
            step="0.02"
            :value="Number(props.config.decisionBias ?? 0.05)"
            @input="onNumericInput('decisionBias', $event)"
          />
        </label>
      </section>

      <section class="lesson-lab__panel lesson-lab__panel--softmax-explainer">
        <div class="lesson-lab__heading">
          <span>{{ copy.multiclass }}</span>
          <strong>{{ copy.softmax }}</strong>
        </div>

        <p class="lesson-lab__note lesson-lab__note--compact">{{ copy.softmaxIntro }}</p>

        <div class="softmax-lesson-grid">
          <article
            v-for="item in softmaxLessonCards"
            :key="item.id"
            class="softmax-lesson-card"
          >
            <span>{{ item.eyebrow }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.body }}</p>
          </article>
        </div>

        <div class="softmax-formula-stack">
          <div class="lesson-lab__heading lesson-lab__heading--subtle">
            <span>{{ copy.sectionFormula }}</span>
            <strong>{{ copy.bridgeTitle }}</strong>
          </div>

          <MarkdownMathContent :source="softmaxFormulaSource" />
        </div>

        <article class="softmax-memory-banner">
          <span>{{ copy.sectionRemember }}</span>
          <strong>{{ copy.softmaxRememberTitle }}</strong>
          <p>{{ copy.softmaxMemoryLine }}</p>
        </article>
      </section>

      <div class="softmax-compare-grid">
        <section class="lesson-lab__panel lesson-lab__panel--softmax-worked">
          <div class="lesson-lab__heading">
            <span>{{ copy.workedExample }}</span>
            <strong>{{ copy.softmax }}</strong>
          </div>

          <div class="observation-grid">
            <article
              v-for="item in softmaxStats"
              :key="item.id"
              class="observation-card"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>

          <div class="sample-loss-grid">
            <article
              v-for="row in softmaxRows"
              :key="row.id"
              class="sample-loss-card softmax-worked-card"
            >
              <span>{{ rowTitle(row) }}</span>
              <strong>{{ copy.logitColumn }} = {{ round(row.input, 2) }}</strong>
              <p>{{ copy.expColumn }} = {{ round(row.output, 2) }}</p>
              <p>{{ copy.probabilityColumn }} = {{ round(row.contribution, 3) }}</p>
              <small>{{ rowNote(row) }}</small>
            </article>
          </div>

          <div class="probability-bars">
            <article
              v-for="(value, index) in props.snapshot?.probabilityBars ?? []"
              :key="`${index}-${value}`"
              class="probability-bars__item"
            >
              <span>{{ barLabel(index) }}</span>
              <div class="probability-bars__track">
                <div class="probability-bars__fill" :style="{ width: `${Math.max(4, value * 100)}%` }" />
              </div>
              <strong>{{ round(value) }}</strong>
            </article>
          </div>

          <p class="lesson-lab__note">{{ copy.multiclassNote }}</p>
        </section>

        <section class="lesson-lab__panel lesson-lab__panel--sigmoid-contrast">
          <div class="lesson-lab__heading">
            <span>{{ copy.sigmoidCounterexample }}</span>
            <strong>{{ copy.sigmoidSum }} = {{ round(independentSigmoidSum, 3) }}</strong>
          </div>

          <MarkdownMathContent :source="sigmoidCounterexampleSource" />

          <div class="sample-loss-grid">
            <article
              v-for="row in independentSigmoidRows"
              :key="`${row.id}-sigmoid`"
              class="sample-loss-card sigmoid-counterexample-card"
            >
              <span>{{ rowTitle(row) }}</span>
              <strong>{{ copy.logitColumn }} = {{ round(row.input, 2) }}</strong>
              <p>{{ copy.sigmoidColumn }} = {{ round(row.sigmoidProbability, 3) }}</p>
              <small>{{ rowNote(row) }}</small>
            </article>
          </div>

          <p class="lesson-lab__note">{{ copy.sigmoidNote }}</p>
          <p class="lesson-lab__note">{{ copy.sigmoidUseCase }}</p>
        </section>
      </div>
    </div>
  </section>
</template>
