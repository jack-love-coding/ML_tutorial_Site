<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  evaluateTransformerBlockAssemblyChallenge,
  type LocalizedText,
  type TransformerBlockPart,
  type TransformerBlockPrediction,
  type TransformerBlockScenarioId,
  type TransformerConsequence,
} from '../simulations/transformerBlockAssemblyChallenge'
import type { AppLocale } from '../types/ml'

interface ScenarioCopy {
  id: TransformerBlockScenarioId
  title: LocalizedText
  summary: LocalizedText
  defaultPrediction: TransformerBlockPrediction
}

interface OptionCopy<T extends string> {
  id: T
  label: LocalizedText
  description: LocalizedText
}

const { locale } = useI18n()

function loc(zhCN: string, en: string): LocalizedText {
  return { 'zh-CN': zhCN, en }
}

function localized(copy: LocalizedText) {
  return copy[locale.value as AppLocale]
}

const scenarioCopy: ScenarioCopy[] = [
  {
    id: 'missing-residual',
    title: loc('缺 residual', 'Missing residual'),
    summary: loc('shape 没坏，但直通信号路径消失。', 'Shape still fits, but the direct signal path is gone.'),
    defaultPrediction: { part: 'layernorm', consequence: 'normalization' },
  },
  {
    id: 'missing-layernorm',
    title: loc('缺 LayerNorm', 'Missing LayerNorm'),
    summary: loc('每层输出尺度缺少稳定约束。', 'Layer output scale lacks a stabilizing constraint.'),
    defaultPrediction: { part: 'residual', consequence: 'signal-path' },
  },
  {
    id: 'missing-ffn',
    title: loc('缺 FFN', 'Missing FFN'),
    summary: loc('token 会交流，但内部非线性加工不足。', 'Tokens mix, but internal nonlinear processing is missing.'),
    defaultPrediction: { part: 'self-attention', consequence: 'token-mixing' },
  },
  {
    id: 'attention-only',
    title: loc('只有 attention', 'Attention only'),
    summary: loc('Q/K/V 存在，但还不是完整 block。', 'Q/K/V exists, but this is not a complete block.'),
    defaultPrediction: { part: 'self-attention', consequence: 'token-mixing' },
  },
]

const partOptions: OptionCopy<TransformerBlockPart>[] = [
  {
    id: 'self-attention',
    label: loc('self-attention', 'self-attention'),
    description: loc('让 token 彼此交换信息。', 'Lets tokens exchange information.'),
  },
  {
    id: 'residual',
    label: loc('residual', 'residual'),
    description: loc('保留直接路径，让 block 学增量。', 'Keeps a direct path so the block learns an update.'),
  },
  {
    id: 'layernorm',
    label: loc('LayerNorm', 'LayerNorm'),
    description: loc('控制表示尺度，稳定训练。', 'Controls representation scale and stabilizes training.'),
  },
  {
    id: 'ffn',
    label: loc('position-wise FFN', 'position-wise FFN'),
    description: loc('对每个 token 做同一套非线性加工。', 'Applies the same nonlinear processing to each token.'),
  },
  {
    id: 'complete-block',
    label: loc('完整 block', 'complete block'),
    description: loc('问题不是单个层，而是把 attention 误当成完整 block。', 'The issue is treating attention as the whole block.'),
  },
]

const consequenceOptions: OptionCopy<TransformerConsequence>[] = [
  {
    id: 'token-mixing',
    label: loc('token mixing', 'token mixing'),
    description: loc('token 之间的信息交流。', 'Information exchange between tokens.'),
  },
  {
    id: 'signal-path',
    label: loc('signal path', 'signal path'),
    description: loc('深层网络里的直接信号通道。', 'A direct signal path through deep layers.'),
  },
  {
    id: 'normalization',
    label: loc('normalization', 'normalization'),
    description: loc('每层表示尺度和稳定性。', 'Representation scale and stability per layer.'),
  },
  {
    id: 'per-token-processing',
    label: loc('per-token processing', 'per-token processing'),
    description: loc('每个 token 内部的共享非线性加工。', 'Shared nonlinear processing inside each token.'),
  },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'Transformer block 挑战',
        title: '先判断 block 少了什么，再看结构结果',
        reset: '重置预测',
        scenario: 'block 场景',
        prediction: '你的预测',
        part: '缺失或误判的部分',
        consequence: '主要影响',
        beforeEvidence: '先选择 block 问题和影响，再查看 trace、shape 和角色说明。',
        checkEvidence: '查看结构结果',
        evidence: 'block trace 结果',
        trace: '结构 trace',
        present: '存在',
        missing: '缺失',
        shape: 'shape invariant',
        feedback: '反馈',
        correct: '两个判断都正确',
        partial: '还有判断需要修正',
        partCheck: 'block 部分',
        consequenceCheck: '影响类别',
        yes: '正确',
        no: '待修正',
      }
    : {
        eyebrow: 'Transformer block challenge',
        title: 'Identify the missing block role before reading evidence',
        reset: 'Reset prediction',
        scenario: 'Block scenario',
        prediction: 'Your prediction',
        part: 'Missing or mistaken part',
        consequence: 'Main consequence',
        beforeEvidence: 'Choose the block issue and consequence before checking trace, shape, and role evidence.',
        checkEvidence: 'Check evidence',
        evidence: 'Block trace evidence',
        trace: 'Structure trace',
        present: 'present',
        missing: 'missing',
        shape: 'shape invariant',
        feedback: 'Feedback',
        correct: 'Both judgments are correct',
        partial: 'Some checks still need revision',
        partCheck: 'block part',
        consequenceCheck: 'consequence',
        yes: 'Correct',
        no: 'Revise',
      },
)

const selectedScenarioId = ref<TransformerBlockScenarioId>('missing-residual')
const prediction = ref<TransformerBlockPrediction>({
  part: 'layernorm',
  consequence: 'normalization',
})
const hasChecked = ref(false)

const activeScenarioCopy = computed(
  () => scenarioCopy.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarioCopy[0],
)

const snapshot = computed(() =>
  evaluateTransformerBlockAssemblyChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

const resultRows = computed(() => [
  { id: 'part', label: copy.value.partCheck, correct: snapshot.value.result.partCorrect },
  { id: 'consequence', label: copy.value.consequenceCheck, correct: snapshot.value.result.consequenceCorrect },
])

function chooseScenario(scenario: ScenarioCopy) {
  selectedScenarioId.value = scenario.id
  prediction.value = { ...scenario.defaultPrediction }
  hasChecked.value = false
}

function resetPrediction() {
  prediction.value = { ...activeScenarioCopy.value.defaultPrediction }
  hasChecked.value = false
}

function revealEvidence() {
  hasChecked.value = true
}
</script>

<template>
  <section class="transformer-block-challenge">
    <header class="transformer-block-challenge__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h4>{{ copy.title }}</h4>
      </div>
      <button type="button" class="transformer-block-challenge__reset" @click="resetPrediction">
        {{ copy.reset }}
      </button>
    </header>

    <section class="transformer-block-challenge__scenarios" :aria-label="copy.scenario">
      <button
        v-for="scenario in scenarioCopy"
        :key="scenario.id"
        type="button"
        :class="{ 'is-active': selectedScenarioId === scenario.id }"
        @click="chooseScenario(scenario)"
      >
        <strong>{{ localized(scenario.title) }}</strong>
        <span>{{ localized(scenario.summary) }}</span>
      </button>
    </section>

    <section class="transformer-block-challenge__prediction">
      <span>{{ copy.prediction }}</span>
      <fieldset>
        <legend>{{ copy.part }}</legend>
        <label v-for="option in partOptions" :key="option.id">
          <input v-model="prediction.part" type="radio" name="transformer-block-part" :value="option.id" />
          <span>
            <strong>{{ localized(option.label) }}</strong>
            <small>{{ localized(option.description) }}</small>
          </span>
        </label>
      </fieldset>

      <fieldset>
        <legend>{{ copy.consequence }}</legend>
        <label v-for="option in consequenceOptions" :key="option.id">
          <input
            v-model="prediction.consequence"
            type="radio"
            name="transformer-block-consequence"
            :value="option.id"
          />
          <span>
            <strong>{{ localized(option.label) }}</strong>
            <small>{{ localized(option.description) }}</small>
          </span>
        </label>
      </fieldset>
    </section>

    <section v-if="!hasChecked" class="transformer-block-challenge__gate">
      <span>{{ copy.beforeEvidence }}</span>
      <button type="button" class="transformer-block-challenge__reset" @click="revealEvidence">
        {{ copy.checkEvidence }}
      </button>
    </section>

    <section v-if="hasChecked" class="transformer-block-challenge__evidence" :aria-label="copy.evidence">
      <article>
        <span>{{ copy.trace }}</span>
        <ol>
          <li v-for="step in snapshot.evidence.blockTrace" :key="step.part" :class="{ 'is-missing': !step.present }">
            <strong>{{ localized(step.label) }}</strong>
            <em>{{ step.present ? copy.present : copy.missing }}</em>
            <p>{{ localized(step.role) }}</p>
          </li>
        </ol>
      </article>

      <article>
        <span>{{ copy.shape }}</span>
        <strong>{{ snapshot.evidence.shapeInvariant }}</strong>
        <p>{{ localized(snapshot.evidence.failureConsequence) }}</p>
      </article>
    </section>

    <section
      v-if="hasChecked"
      class="transformer-block-challenge__feedback"
      :class="{ 'is-correct': snapshot.result.allCorrect }"
      :aria-label="copy.feedback"
    >
      <div>
        <span>{{ copy.feedback }}</span>
        <strong>{{ snapshot.result.allCorrect ? copy.correct : copy.partial }}</strong>
      </div>
      <dl>
        <div v-for="row in resultRows" :key="row.id">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.correct ? copy.yes : copy.no }}</dd>
        </div>
      </dl>
    </section>
  </section>
</template>
