<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildCausalMask,
  buildNextTokenPairs,
  generationTokenLogits,
  topKTokenDistribution,
} from '../simulations/llmGeneration'
import type { AppLocale } from '../types/ml'

const props = defineProps<{
  mode: 'causal-language-modeling' | 'decoding-generation'
}>()

const { locale } = useI18n()
const temperature = ref(1)
const topK = ref(3)
const trainingTokens = ['机器', '学习', '改变', '世界']
const trainingPairs = buildNextTokenPairs(trainingTokens)
const causalMask = buildCausalMask(trainingTokens.length)

function localized<T>(zhCN: T, en: T) {
  return locale.value === 'zh-CN' ? zhCN : en
}

const decodingDistribution = computed(() =>
  topKTokenDistribution(generationTokenLogits, temperature.value, topK.value),
)

const selectedToken = computed(() => decodingDistribution.value[0])
const isCausalMode = computed(() => props.mode === 'causal-language-modeling')
const language = computed(() => locale.value as AppLocale)
</script>

<template>
  <section class="llm-generation-lab" :lang="language">
    <header>
      <span>{{ localized('逐步观察', 'Guided observation') }}</span>
      <h4>
        {{ isCausalMode
          ? localized('一个序列怎样变成多组“预测下一个 token”任务', 'How one sequence becomes many next-token predictions')
          : localized('logits 怎样变成下一个 token', 'How logits become the next token') }}
      </h4>
      <p>
        {{ isCausalMode
          ? localized('训练时，每个位置只读取当前位置及之前的 token，并把右移一位的 token 当作目标。', 'During training, each position reads only the current and earlier tokens, while the one-step-shifted token is the target.')
          : localized('解码时，模型只产生下一步 logits；温度和 top-k 决定如何把这些分数转成候选分布。', 'During decoding, the model produces next-step logits; temperature and top-k turn those scores into a candidate distribution.') }}
      </p>
    </header>

    <template v-if="isCausalMode">
      <div class="llm-generation-lab__pairs" aria-label="Next-token training pairs">
        <article v-for="pair in trainingPairs" :key="pair.position">
          <span>{{ localized(`位置 ${pair.position + 1}`, `Position ${pair.position + 1}`) }}</span>
          <strong>{{ pair.inputToken }} → {{ pair.targetToken }}</strong>
        </article>
      </div>

      <div class="llm-generation-lab__mask-wrap">
        <strong>{{ localized('因果 mask：✓ 表示 query 可以读取该 key', 'Causal mask: ✓ means the query may read that key') }}</strong>
        <table class="llm-generation-lab__mask">
          <thead>
            <tr>
              <th scope="col">Q \ K</th>
              <th v-for="token in trainingTokens" :key="`head-${token}`" scope="col">{{ token }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in causalMask" :key="trainingTokens[rowIndex]">
              <th scope="row">{{ trainingTokens[rowIndex] }}</th>
              <td v-for="(visible, columnIndex) in row" :key="columnIndex" :class="{ 'is-visible': visible }">
                {{ visible ? '✓' : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else>
      <div class="llm-generation-lab__controls">
        <label>
          <span>{{ localized('温度', 'Temperature') }}: {{ temperature.toFixed(1) }}</span>
          <input v-model.number="temperature" type="range" min="0.2" max="2" step="0.1">
        </label>
        <label>
          <span>top-k: {{ topK }}</span>
          <input v-model.number="topK" type="range" min="1" :max="generationTokenLogits.length" step="1">
        </label>
      </div>

      <div class="llm-generation-lab__distribution">
        <article v-for="candidate in decodingDistribution" :key="candidate.token">
          <div>
            <strong>{{ candidate.token }}</strong>
            <span>{{ (candidate.probability * 100).toFixed(1) }}%</span>
          </div>
          <progress :value="candidate.probability" max="1">
            {{ (candidate.probability * 100).toFixed(1) }}%
          </progress>
        </article>
      </div>

      <p class="llm-generation-lab__result">
        {{ localized('当前最高概率候选', 'Current highest-probability candidate') }}：
        <strong>{{ selectedToken?.token }}</strong>
      </p>
    </template>
  </section>
</template>

<style scoped>
.llm-generation-lab {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: 8px;
  background: #f8fffe;
}

header span,
article span,
label span {
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
}

h4,
header p {
  margin: 0.35rem 0 0;
}

header p {
  color: #475569;
  line-height: 1.6;
}

.llm-generation-lab__pairs,
.llm-generation-lab__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.65rem;
}

.llm-generation-lab__pairs article,
.llm-generation-lab__distribution article {
  padding: 0.75rem;
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 8px;
  background: #fff;
}

.llm-generation-lab__pairs strong {
  display: block;
  margin-top: 0.35rem;
}

.llm-generation-lab__mask-wrap {
  overflow-x: auto;
}

.llm-generation-lab__mask {
  width: 100%;
  margin-top: 0.6rem;
  border-collapse: collapse;
  text-align: center;
}

.llm-generation-lab__mask th,
.llm-generation-lab__mask td {
  min-width: 4rem;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
}

.llm-generation-lab__mask td.is-visible {
  background: #ccfbf1;
  color: #0f766e;
  font-weight: 800;
}

.llm-generation-lab__controls label {
  display: grid;
  gap: 0.5rem;
}

.llm-generation-lab__distribution {
  display: grid;
  gap: 0.55rem;
}

.llm-generation-lab__distribution article div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.llm-generation-lab__distribution progress {
  width: 100%;
  margin-top: 0.45rem;
  accent-color: #0f766e;
}

.llm-generation-lab__result {
  margin: 0;
  color: #134e4a;
}

</style>
