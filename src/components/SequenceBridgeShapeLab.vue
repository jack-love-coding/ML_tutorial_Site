<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildSequenceBridgeSnapshot,
  type SequenceMaskMode,
} from '../simulations/sequenceBridgeLab'
import type { AppLocale, LocalizedCopy } from '../types/ml'

const { locale } = useI18n()

const batchSize = ref(2)
const tokenLength = ref(5)
const hiddenSize = ref(8)
const paddingTokens = ref(1)
const maskMode = ref<SequenceMaskMode>('padding')
const queryIndex = ref(2)

const hiddenSizeOptions = [4, 8, 16, 32]
const maskModes: SequenceMaskMode[] = ['none', 'padding', 'causal']

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function localized(value: LocalizedCopy) {
  return value[locale.value as AppLocale]
}

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        badge: 'Shape 任务实验',
        title: '从 token ids 追踪到 attention 输入',
        intro: '先预测形状，再改变序列长度、padding、mask 和 query 位置，观察 [B,T] 怎样变成 [B,T,H] 并交给 Q/K/V。',
        predict: '先预测',
        predictBody: '如果 T 增大但 H 不变，embedding table、hidden states 和 attention score 哪一个维度会改变？',
        controls: '可操作变量',
        reset: '重置',
        tokenIds: 'token_ids [B,T]',
        embedding: 'embedding table [V,H]',
        hidden: 'hidden states [B,T,H]',
        qkv: 'Q/K/V',
        attention: 'attention scores [B,T,T]',
        visible: '可见 token',
        blocked: '被 mask token',
        effective: '非 padding token',
        mask: 'mask 可见性',
        handoff: '交接解释',
        handoffBody: '[B,T,H] hidden states 加上 position 和 mask 后，线性投影成 Q/K/V；attention score 再沿 T×T 比较 token 关系。',
        reflection: '解释任务',
        reflectionBody: '用一句话说明：为什么 token id 不是连续特征，而 position 和 mask 必须在进入 attention 前补上？',
      }
    : {
        badge: 'Shape task lab',
        title: 'Trace token ids into attention input',
        intro: 'Predict first, then change sequence length, padding, mask, and query position to watch [B,T] become [B,T,H] before Q/K/V.',
        predict: 'Predict first',
        predictBody: 'If T grows while H stays fixed, which dimension changes in the embedding table, hidden states, and attention scores?',
        controls: 'Manipulable variables',
        reset: 'Reset',
        tokenIds: 'token_ids [B,T]',
        embedding: 'embedding table [V,H]',
        hidden: 'hidden states [B,T,H]',
        qkv: 'Q/K/V',
        attention: 'attention scores [B,T,T]',
        visible: 'Visible tokens',
        blocked: 'Masked tokens',
        effective: 'Non-padding tokens',
        mask: 'Mask visibility',
        handoff: 'Handoff explanation',
        handoffBody: '[B,T,H] hidden states plus position and mask project into Q/K/V; attention scores then compare token relations across T×T.',
        reflection: 'Explain the result',
        reflectionBody: 'In one sentence, explain why token ids are not continuous features, and why position plus mask must be added before attention.',
      },
)

const maskLabels: Record<SequenceMaskMode, LocalizedCopy> = {
  none: loc('无 mask', 'No mask'),
  padding: loc('padding mask', 'Padding mask'),
  causal: loc('causal mask', 'Causal mask'),
}

const snapshot = computed(() =>
  buildSequenceBridgeSnapshot({
    batchSize: batchSize.value,
    tokenLength: tokenLength.value,
    hiddenSize: hiddenSize.value,
    paddingTokens: paddingTokens.value,
    maskMode: maskMode.value,
    queryIndex: queryIndex.value,
  }),
)

const pipelineCards = computed(() => [
  {
    id: 'token-ids',
    label: copy.value.tokenIds,
    value: snapshot.value.tokenIdsShape,
    note: loc('整数索引，还不是可比较向量。', 'Integer indices, not comparable vectors yet.'),
  },
  {
    id: 'embedding',
    label: copy.value.embedding,
    value: snapshot.value.embeddingTableShape,
    note: loc('用每个 token id 查一行 H 维参数。', 'Each token id looks up one H-dimensional parameter row.'),
  },
  {
    id: 'hidden',
    label: copy.value.hidden,
    value: snapshot.value.hiddenStatesShape,
    note: loc('序列位置轴 T 和表示维度 H 同时存在。', 'The token axis T and representation width H now coexist.'),
  },
  {
    id: 'qkv',
    label: copy.value.qkv,
    value: snapshot.value.qkvShape,
    note: loc('Q、K、V 继承同一批 hidden states 的 B 和 T。', 'Q, K, and V inherit B and T from the same hidden states.'),
  },
  {
    id: 'scores',
    label: copy.value.attention,
    value: snapshot.value.attentionScoreShape,
    note: loc('每个 query 位置和所有 key 位置比较。', 'Each query position compares against all key positions.'),
  },
])

function resetLab() {
  batchSize.value = 2
  tokenLength.value = 5
  hiddenSize.value = 8
  paddingTokens.value = 1
  maskMode.value = 'padding'
  queryIndex.value = 2
}
</script>

<template>
  <section class="sequence-shape-lab" :aria-label="copy.title">
    <header class="sequence-shape-lab__header">
      <div>
        <span>{{ copy.badge }}</span>
        <h4>{{ copy.title }}</h4>
        <p>{{ copy.intro }}</p>
      </div>
      <button type="button" class="sequence-shape-lab__reset" @click="resetLab">
        {{ copy.reset }}
      </button>
    </header>

    <section class="sequence-shape-lab__task">
      <span>{{ copy.predict }}</span>
      <strong>{{ copy.predictBody }}</strong>
    </section>

    <section class="sequence-shape-lab__controls" :aria-label="copy.controls">
      <label>
        <span>B</span>
        <input v-model.number="batchSize" type="range" min="1" max="4" step="1" />
        <strong>{{ snapshot.config.batchSize }}</strong>
      </label>

      <label>
        <span>T</span>
        <input v-model.number="tokenLength" type="range" min="2" max="8" step="1" />
        <strong>{{ snapshot.config.tokenLength }}</strong>
      </label>

      <label>
        <span>H</span>
        <select v-model.number="hiddenSize">
          <option v-for="option in hiddenSizeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <strong>{{ snapshot.config.hiddenSize }}</strong>
      </label>

      <label>
        <span>padding</span>
        <input
          v-model.number="paddingTokens"
          type="range"
          min="0"
          :max="Math.max(0, snapshot.config.tokenLength - 1)"
          step="1"
        />
        <strong>{{ snapshot.config.paddingTokens }}</strong>
      </label>

      <label>
        <span>query</span>
        <input
          v-model.number="queryIndex"
          type="range"
          min="0"
          :max="Math.max(0, snapshot.config.tokenLength - 1)"
          step="1"
        />
        <strong>t{{ snapshot.config.queryIndex }}</strong>
      </label>

      <fieldset>
        <legend>mask</legend>
        <label v-for="mode in maskModes" :key="mode">
          <input v-model="maskMode" type="radio" name="sequence-mask-mode" :value="mode" />
          <span>{{ localized(maskLabels[mode]) }}</span>
        </label>
      </fieldset>
    </section>

    <section class="sequence-shape-lab__pipeline" aria-label="shape pipeline">
      <article v-for="card in pipelineCards" :key="card.id">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <p>{{ localized(card.note) }}</p>
      </article>
    </section>

    <section class="sequence-shape-lab__mask">
      <div>
        <span>{{ copy.mask }}</span>
        <strong>
          {{ copy.visible }} {{ snapshot.visibleTokenCount }} ·
          {{ copy.blocked }} {{ snapshot.blockedTokenCount }}
        </strong>
        <small>{{ copy.effective }} {{ snapshot.effectiveTokenCount }}</small>
      </div>

      <ol>
        <li
          v-for="cell in snapshot.maskCells"
          :key="cell.index"
          :class="`is-${cell.state}`"
        >
          {{ cell.label }}
        </li>
      </ol>
    </section>

    <section class="sequence-shape-lab__handoff">
      <span>{{ copy.handoff }}</span>
      <strong>{{ snapshot.hiddenStatesShape }} -> {{ snapshot.qkvShape }} -> {{ snapshot.attentionScoreShape }}</strong>
      <p>{{ copy.handoffBody }}</p>
    </section>

    <footer class="sequence-shape-lab__reflection">
      <span>{{ copy.reflection }}</span>
      <strong>{{ copy.reflectionBody }}</strong>
    </footer>
  </section>
</template>
