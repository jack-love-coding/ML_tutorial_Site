<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  architectureToolsScenarios,
  evaluateArchitectureToolsHandoffChallenge,
  type ArchitectureToolScenarioId,
  type ArchitectureToolsPrediction,
} from '../simulations/architectureToolsHandoffChallenge'
import type { AppLocale, LocalizedCopy } from '../types/ml'

const { locale } = useI18n()

function localized(copy: LocalizedCopy) {
  return copy[locale.value as AppLocale]
}

const defaultPredictions: Record<ArchitectureToolScenarioId, ArchitectureToolsPrediction> = {
  'tokenizer-boundary': { toolPart: 'attention-mask', concept: 'visibility' },
  'mask-visibility': { toolPart: 'tokenizer', concept: 'token-ids' },
  'block-hidden-state': { toolPart: 'output-head-logits', concept: 'next-token-scores' },
  'logits-ranking': { toolPart: 'transformer-blocks', concept: 'hidden-state-update' },
}

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'Architecture tools 场景',
        title: '把工具 trace 接回架构概念',
        reset: '重置场景',
        scenario: '工具 trace 场景',
        trace: '请求 trace',
        evidence: '架构对应结果',
        shapeOrValue: 'shape / value 结果',
        misconception: '常见误区',
      }
    : {
        eyebrow: 'Architecture tools scenarios',
        title: 'Map the tool trace back to the architecture concept',
        reset: 'Reset scenario',
        scenario: 'Tool-trace scenario',
        trace: 'Request trace',
        evidence: 'Architecture evidence',
        shapeOrValue: 'shape / value evidence',
        misconception: 'Common misconception',
      },
)

const selectedScenarioId = ref<ArchitectureToolScenarioId>('tokenizer-boundary')
const prediction = ref<ArchitectureToolsPrediction>({ ...defaultPredictions['tokenizer-boundary'] })

const activeScenario = computed(
  () => architectureToolsScenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? architectureToolsScenarios[0]!,
)

const snapshot = computed(() =>
  evaluateArchitectureToolsHandoffChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

function chooseScenario(id: ArchitectureToolScenarioId) {
  selectedScenarioId.value = id
  prediction.value = { ...defaultPredictions[id] }
}

function resetPrediction() {
  selectedScenarioId.value = 'tokenizer-boundary'
  prediction.value = { ...defaultPredictions[selectedScenarioId.value] }
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

    </section>

    <section class="architecture-tools-challenge__evidence" :aria-label="copy.evidence">
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

  </section>
</template>
