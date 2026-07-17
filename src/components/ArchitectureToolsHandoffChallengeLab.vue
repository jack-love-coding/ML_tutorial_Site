<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  architectureToolsScenarios,
  evaluateArchitectureToolsHandoffChallenge,
  type ArchitectureConcept,
  type ArchitectureToolPart,
  type ArchitectureToolScenarioId,
  type ArchitectureToolsPrediction,
} from '../simulations/architectureToolsHandoffChallenge'
import type { AppLocale, LocalizedCopy } from '../types/ml'

interface OptionCopy<T extends string> {
  id: T
  label: LocalizedCopy
  description: LocalizedCopy
}

const { locale } = useI18n()

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function localized(copy: LocalizedCopy) {
  return copy[locale.value as AppLocale]
}

const defaultPredictions: Record<ArchitectureToolScenarioId, ArchitectureToolsPrediction> = {
  'tokenizer-boundary': { toolPart: 'attention-mask', concept: 'visibility' },
  'mask-visibility': { toolPart: 'tokenizer', concept: 'token-ids' },
  'block-hidden-state': { toolPart: 'output-head-logits', concept: 'next-token-scores' },
  'logits-ranking': { toolPart: 'transformer-blocks', concept: 'hidden-state-update' },
}

const toolOptions: OptionCopy<ArchitectureToolPart>[] = [
  {
    id: 'tokenizer',
    label: loc('tokenizer', 'tokenizer'),
    description: loc('文本和 token id 之间的转换。', 'Converts between text and token ids.'),
  },
  {
    id: 'attention-mask',
    label: loc('attention mask', 'attention mask'),
    description: loc('声明哪些位置可见，哪些被屏蔽。', 'Declares which positions are visible or blocked.'),
  },
  {
    id: 'transformer-blocks',
    label: loc('Transformer blocks/model', 'Transformer blocks/model'),
    description: loc('反复更新 token hidden states。', 'Repeatedly updates token hidden states.'),
  },
  {
    id: 'output-head-logits',
    label: loc('logits/output head', 'logits/output head'),
    description: loc('把 hidden state 映射成词表分数。', 'Maps a hidden state to vocabulary scores.'),
  },
]

const conceptOptions: OptionCopy<ArchitectureConcept>[] = [
  {
    id: 'token-ids',
    label: loc('token ids', 'token ids'),
    description: loc('词表索引进入 embedding lookup。', 'Vocabulary indexes enter embedding lookup.'),
  },
  {
    id: 'visibility',
    label: loc('visibility constraint', 'visibility constraint'),
    description: loc('控制 query 能看哪些 key。', 'Controls which keys a query can see.'),
  },
  {
    id: 'hidden-state-update',
    label: loc('hidden-state update', 'hidden-state update'),
    description: loc('[B,T,H] shape 不变，表示被更新。', '[B,T,H] shape stays fixed while representations update.'),
  },
  {
    id: 'next-token-scores',
    label: loc('next-token scores', 'next-token scores'),
    description: loc('词表 raw scores 决定候选优先级。', 'Vocabulary raw scores decide candidate priority.'),
  },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'Architecture tools 挑战',
        title: '先判断工具对象，再把 trace 接回架构概念',
        reset: '重置预测',
        scenario: '工具 trace 场景',
        prediction: '你的预测',
        toolPart: '负责的 LLM 工具对象',
        concept: '对应的架构概念',
        trace: '请求 trace',
        evidence: '架构对应结果',
        beforeEvidence: '先选工具对象和架构概念，再查看 trace、shape/value 和误区反馈。',
        checkEvidence: '查看对应结果',
        shapeOrValue: 'shape / value 结果',
        architectureLink: '接回架构',
        misconception: '常见误区',
        feedback: '反馈',
        correct: '两个判断都正确',
        partial: '还有判断需要修正',
        toolCheck: '工具对象',
        conceptCheck: '架构概念',
        yes: '正确',
        no: '待修正',
      }
    : {
        eyebrow: 'Architecture tools challenge',
        title: 'Map the tool trace back to the architecture concept',
        reset: 'Reset prediction',
        scenario: 'Tool-trace scenario',
        prediction: 'Your prediction',
        toolPart: 'Responsible LLM tool object',
        concept: 'Matching architecture concept',
        trace: 'Request trace',
        evidence: 'Architecture evidence',
        beforeEvidence: 'Choose the tool object and architecture concept before checking trace, shape/value, and misconception feedback.',
        checkEvidence: 'Check evidence',
        shapeOrValue: 'shape / value evidence',
        architectureLink: 'Architecture link',
        misconception: 'Common misconception',
        feedback: 'Feedback',
        correct: 'Both judgments are correct',
        partial: 'Some checks still need revision',
        toolCheck: 'tool object',
        conceptCheck: 'architecture concept',
        yes: 'Correct',
        no: 'Revise',
      },
)

const selectedScenarioId = ref<ArchitectureToolScenarioId>('tokenizer-boundary')
const prediction = ref<ArchitectureToolsPrediction>({ ...defaultPredictions['tokenizer-boundary'] })
const hasChecked = ref(false)

const activeScenario = computed(
  () => architectureToolsScenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? architectureToolsScenarios[0]!,
)

const snapshot = computed(() =>
  evaluateArchitectureToolsHandoffChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

const resultRows = computed(() => [
  { id: 'tool-part', label: copy.value.toolCheck, correct: snapshot.value.result.toolPartCorrect },
  { id: 'concept', label: copy.value.conceptCheck, correct: snapshot.value.result.conceptCorrect },
])

function chooseScenario(id: ArchitectureToolScenarioId) {
  selectedScenarioId.value = id
  prediction.value = { ...defaultPredictions[id] }
  hasChecked.value = false
}

function resetPrediction() {
  prediction.value = { ...defaultPredictions[selectedScenarioId.value] }
  hasChecked.value = false
}

function revealEvidence() {
  hasChecked.value = true
}
</script>

<template>
  <section class="architecture-tools-challenge">
    <header class="architecture-tools-challenge__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h4>{{ copy.title }}</h4>
      </div>
      <button type="button" class="architecture-tools-challenge__reset" @click="resetPrediction">
        {{ copy.reset }}
      </button>
    </header>

    <section class="architecture-tools-challenge__scenarios" :aria-label="copy.scenario">
      <button
        v-for="scenario in architectureToolsScenarios"
        :key="scenario.id"
        type="button"
        :class="{ 'is-active': selectedScenarioId === scenario.id }"
        @click="chooseScenario(scenario.id)"
      >
        <strong>{{ localized(scenario.title) }}</strong>
        <span>{{ localized(scenario.prompt) }}</span>
      </button>
    </section>

    <section class="architecture-tools-challenge__workspace">
      <article class="architecture-tools-challenge__trace" :aria-label="copy.trace">
        <span>{{ copy.trace }}</span>
        <dl>
          <div v-for="row in activeScenario.trace" :key="row.value">
            <dt>{{ localized(row.label) }}</dt>
            <dd>
              <strong>{{ row.value }}</strong>
              <small>{{ localized(row.role) }}</small>
            </dd>
          </div>
        </dl>
      </article>

      <article class="architecture-tools-challenge__prediction">
        <span>{{ copy.prediction }}</span>
        <fieldset>
          <legend>{{ copy.toolPart }}</legend>
          <label v-for="option in toolOptions" :key="option.id">
            <input v-model="prediction.toolPart" type="radio" name="architecture-tool-part" :value="option.id" />
            <span>
              <strong>{{ localized(option.label) }}</strong>
              <small>{{ localized(option.description) }}</small>
            </span>
          </label>
        </fieldset>

        <fieldset>
          <legend>{{ copy.concept }}</legend>
          <label v-for="option in conceptOptions" :key="option.id">
            <input v-model="prediction.concept" type="radio" name="architecture-tool-concept" :value="option.id" />
            <span>
              <strong>{{ localized(option.label) }}</strong>
              <small>{{ localized(option.description) }}</small>
            </span>
          </label>
        </fieldset>
      </article>
    </section>

    <section v-if="!hasChecked" class="architecture-tools-challenge__gate">
      <span>{{ copy.beforeEvidence }}</span>
      <button type="button" class="architecture-tools-challenge__reset" @click="revealEvidence">
        {{ copy.checkEvidence }}
      </button>
    </section>

    <section v-if="hasChecked" class="architecture-tools-challenge__evidence" :aria-label="copy.evidence">
      <article>
        <span>{{ copy.shapeOrValue }}</span>
        <strong>{{ snapshot.evidence.shapeOrValueEvidence }}</strong>
        <p>{{ localized(snapshot.evidence.architectureLink) }}</p>
      </article>
      <article>
        <span>{{ copy.misconception }}</span>
        <p>{{ localized(snapshot.evidence.misconception) }}</p>
      </article>
    </section>

    <section
      v-if="hasChecked"
      class="architecture-tools-challenge__feedback"
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
