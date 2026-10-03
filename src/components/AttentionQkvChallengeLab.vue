<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import {
  attentionQkvScenarios,
  evaluateAttentionQkvChallenge,
  type AttentionQkvPrediction,
  type AttentionQkvScenarioId,
} from '../simulations/attentionQkvChallenge'

interface ScenarioCopy {
  id: AttentionQkvScenarioId
  title: LocalizedCopy
  summary: LocalizedCopy
  setupNote: LocalizedCopy
  defaultPrediction: AttentionQkvPrediction
}

const { locale } = useI18n()

function loc<T>(zhCN: T, en: T): { 'zh-CN': T; en: T } {
  return { 'zh-CN': zhCN, en }
}

function localized<T>(copy: { 'zh-CN': T; en: T }) {
  return copy[locale.value as AppLocale]
}

function formatNumber(value: number | null) {
  if (value === null) return locale.value === 'zh-CN' ? 'mask' : 'masked'
  if (!Number.isFinite(value)) return locale.value === 'zh-CN' ? '非有限' : 'non-finite'
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function formatVector(values: number[]) {
  return `[${values.map((value) => formatNumber(value)).join(', ')}]`
}

const scenarioCopy: ScenarioCopy[] = [
  {
    id: 'matching-key',
    title: loc('Q/K 对齐', 'Q/K alignment'),
    summary: loc('query 和一个 key 明显同向，mask 不参与。', 'The query clearly aligns with one key and no mask is involved.'),
    setupNote: loc(
      '先只看 Q/K 点积：谁和当前 query 方向最接近，谁就拿到最大的 raw score。',
      'Read the Q/K dot products first: the closest key direction gets the largest raw score.',
    ),
    defaultPrediction: { topKeyId: 'beta', maskChangesTopKey: true },
  },
  {
    id: 'causal-mask',
    title: loc('causal mask', 'Causal mask'),
    summary: loc('future key raw score 最高，但不允许被当前 token 看见。', 'A future key has the top raw score, but the current token cannot see it.'),
    setupNote: loc(
      'causal mask 在 softmax 之前移除未来位置，概率只在允许的 key 上重新分配。',
      'A causal mask removes future positions before softmax, so probability is redistributed over allowed keys.',
    ),
    defaultPrediction: { topKeyId: 'future', maskChangesTopKey: false },
  },
  {
    id: 'padding-mask',
    title: loc('padding mask', 'Padding mask'),
    summary: loc('[PAD] key raw score 很诱人，但它不是有效 token。', 'The [PAD] key has a tempting raw score, but it is not a real token.'),
    setupNote: loc(
      'padding mask 阻止占位 token 获得注意力权重，避免把无效 value 混进输出。',
      'A padding mask prevents placeholder tokens from receiving attention weight or contributing value.',
    ),
    defaultPrediction: { topKeyId: 'pad', maskChangesTopKey: false },
  },
  {
    id: 'value-mixture',
    title: loc('V 加权混合', 'Weighted V mixture'),
    summary: loc('两个 key 都有较大权重，输出不是复制一个 token。', 'Two keys receive substantial weight, so the output is not a copy of one token.'),
    setupNote: loc(
      'Q/K 只决定权重；真正相加的是每个 key 对应的 V 行。',
      'Q/K only decide weights; the rows being added are the V vectors attached to each key.',
    ),
    defaultPrediction: { topKeyId: 'left-value', maskChangesTopKey: true },
  },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: 'Attention Q/K/V 场景',
        title: '选择 attention 场景，观察 softmax 结果',
        reset: '重置场景',
        scenario: 'Q/K/V 场景',
        query: '当前 query',
        table: 'token 行',
        token: 'token',
        q: 'Q',
        k: 'K',
        v: 'V',
        evidence: 'Q/K → mask → softmax 计算结果',
        rawScore: 'raw score',
        maskedScore: 'masked score',
        weight: 'softmax weight',
        weightedValue: 'weighted value',
        contribution: 'V contribution',
        why: 'Q/K 点积只产生权重；mask 先改写 score 行，softmax 再归一化，最后被加权相加的是 V。',
      }
    : {
        eyebrow: 'Attention Q/K/V scenarios',
        title: 'Predict one attention row before reading softmax evidence',
        reset: 'Reset scenario',
        scenario: 'Q/K/V scenario',
        query: 'Current query',
        table: 'Token rows',
        token: 'token',
        q: 'Q',
        k: 'K',
        v: 'V',
        evidence: 'Q/K -> mask -> softmax evidence',
        rawScore: 'raw score',
        maskedScore: 'masked score',
        weight: 'softmax weight',
        weightedValue: 'weighted value',
        contribution: 'V contribution',
        why: 'Q/K dot products only create weights; the mask edits the score row before softmax, and V is what gets weighted and summed.',
      },
)

const selectedScenarioId = ref<AttentionQkvScenarioId>('matching-key')
const prediction = ref<AttentionQkvPrediction>({
  topKeyId: 'beta',
  maskChangesTopKey: true,
})

const activeScenario = computed(
  () => attentionQkvScenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? attentionQkvScenarios[0],
)

const activeScenarioCopy = computed(
  () => scenarioCopy.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarioCopy[0],
)

const snapshot = computed(() =>
  evaluateAttentionQkvChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)

const queryToken = computed(
  () => activeScenario.value.tokens.find((token) => token.id === activeScenario.value.queryTokenId) ?? activeScenario.value.tokens[0],
)

const scoreRows = computed(() =>
  snapshot.value.evidence.rawScores.map((rawScore) => {
    const maskedScore = snapshot.value.evidence.maskedScores.find((item) => item.keyId === rawScore.keyId)
    const weight = snapshot.value.evidence.weights.find((item) => item.keyId === rawScore.keyId)
    const contribution = snapshot.value.evidence.valueContributions.find((item) => item.keyId === rawScore.keyId)
    const token = activeScenario.value.tokens.find((item) => item.id === rawScore.keyId)

    return {
      keyId: rawScore.keyId,
      label: token?.label ?? rawScore.keyId,
      rawScore: rawScore.score,
      maskedScore: maskedScore?.score ?? null,
      masked: maskedScore?.masked ?? false,
      weight: weight?.weight ?? 0,
      contribution: contribution?.contribution ?? [],
    }
  }),
)

function chooseScenario(scenario: ScenarioCopy) {
  selectedScenarioId.value = scenario.id
  prediction.value = { ...scenario.defaultPrediction }
}

function resetPrediction() {
  selectedScenarioId.value = 'matching-key'
  prediction.value = { ...activeScenarioCopy.value.defaultPrediction }
}

</script>

<template>
  <section class="attention-qkv-challenge">
    <header class="attention-qkv-challenge__header">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <h4>{{ copy.title }}</h4>
      </div>
      <button type="button" class="attention-qkv-challenge__reset" @click="resetPrediction">
        {{ copy.reset }}
      </button>
    </header>

    <section class="attention-qkv-challenge__scenarios" :aria-label="copy.scenario">
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

    <section class="attention-qkv-challenge__workspace">
      <article class="attention-qkv-challenge__matrix" :aria-label="copy.table">
        <div>
          <span>{{ copy.query }}</span>
          <strong>{{ queryToken?.label }}</strong>
          <p>{{ localized(activeScenarioCopy.setupNote) }}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>{{ copy.token }}</th>
              <th>{{ copy.q }}</th>
              <th>{{ copy.k }}</th>
              <th>{{ copy.v }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in activeScenario.tokens" :key="token.id">
              <th scope="row">{{ token.label }}</th>
              <td>{{ formatVector(token.query) }}</td>
              <td>{{ formatVector(token.key) }}</td>
              <td>{{ formatVector(token.value) }}</td>
            </tr>
          </tbody>
        </table>
      </article>

    </section>

    <section class="attention-qkv-challenge__evidence" :aria-label="copy.evidence">
      <article class="attention-qkv-challenge__scores">
        <span>{{ copy.evidence }}</span>
        <table>
          <thead>
            <tr>
              <th>{{ copy.token }}</th>
              <th>{{ copy.rawScore }}</th>
              <th>{{ copy.maskedScore }}</th>
              <th>{{ copy.weight }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in scoreRows" :key="row.keyId" :class="{ 'is-masked': row.masked }">
              <th scope="row">{{ row.label }}</th>
              <td>{{ formatNumber(row.rawScore) }}</td>
              <td>{{ formatNumber(row.maskedScore) }}</td>
              <td>{{ formatNumber(row.weight) }}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="attention-qkv-challenge__value">
        <span>{{ copy.weightedValue }}</span>
        <strong>{{ formatVector(snapshot.evidence.weightedValue) }}</strong>
        <dl>
          <div v-for="row in scoreRows" :key="row.keyId">
            <dt>{{ row.label }} {{ copy.contribution }}</dt>
            <dd>{{ formatVector(row.contribution) }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <p>{{ copy.why }}</p>
  </section>
</template>
