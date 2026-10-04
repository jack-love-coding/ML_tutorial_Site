<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  evaluateTransformerBlockAssemblyChallenge,
  type LocalizedText,
  type TransformerBlockPrediction,
  type TransformerBlockScenarioId,
} from '../simulations/transformerBlockAssemblyChallenge'
import type { AppLocale } from '../types/ml'

interface ScenarioCopy {
  id: TransformerBlockScenarioId
  title: LocalizedText
  summary: LocalizedText
  defaultPrediction: TransformerBlockPrediction
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

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'Transformer block 场景',
        title: '观察 block 组件与结构结果',
        reset: '重置场景',
        scenario: 'block 场景',
        evidence: 'block trace 结果',
        trace: '结构 trace',
        present: '存在',
        missing: '缺失',
        shape: 'shape invariant',
      }
    : {
        eyebrow: 'Transformer block scenarios',
        title: 'Explore block components and their effects',
        reset: 'Reset scenario',
        scenario: 'Block scenario',
        evidence: 'Block trace evidence',
        trace: 'Structure trace',
        present: 'present',
        missing: 'missing',
        shape: 'shape invariant',
      },
)

const selectedScenarioId = ref<TransformerBlockScenarioId>('missing-residual')
const prediction = ref<TransformerBlockPrediction>({
  part: 'layernorm',
  consequence: 'normalization',
})

const activeScenarioCopy = computed(
  () => scenarioCopy.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarioCopy[0],
)

const snapshot = computed(() =>
  evaluateTransformerBlockAssemblyChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

function chooseScenario(scenario: ScenarioCopy) {
  selectedScenarioId.value = scenario.id
  prediction.value = { ...scenario.defaultPrediction }
}

function resetPrediction() {
  selectedScenarioId.value = 'missing-residual'
  prediction.value = { ...activeScenarioCopy.value.defaultPrediction }
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

    <section class="transformer-block-challenge__evidence" :aria-label="copy.evidence">
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

  </section>
</template>
